<?php
// Biblioteca das contas de usuário: cadastro com confirmação por e-mail ou WhatsApp, sessão por cookie e cota de uso da IA.
// Usada por conta.php e ia.php (incluir DEPOIS de config.php). Dados em api/dados/contas.sqlite (acesso externo bloqueado).
if (basename($_SERVER['SCRIPT_NAME'] ?? '') === '_conta.php') { http_response_code(404); exit; }

const OP_TEXTO_VERSAO = 'v1';   // versão do texto de aceite exibido no cadastro (guardada junto com a data do aceite)

function cfg($k, $pad = null) { return $GLOBALS[$k] ?? $pad; }
function sai($dados, $cod = 200) { http_response_code($cod); echo json_encode($dados, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }
function erro($cod, $codigoErro, $msg, $extra = []) { sai(array_merge(['ok' => false, 'erro' => $codigoErro, 'mensagem' => $msg], $extra), $cod); }
function https_ativo() { return (($_SERVER['HTTPS'] ?? '') === 'on') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') || str_contains((string)($_SERVER['HTTP_CF_VISITOR'] ?? ''), 'https'); }
function ip_hash() { $ip = $_SERVER['HTTP_CF_CONNECTING_IP'] ?? ($_SERVER['REMOTE_ADDR'] ?? ''); return hash('sha256', cfg('SAL', '') . $ip); }
function hcurto($v) { return substr(hash('sha256', cfg('SAL', '') . $v), 0, 20); }

function cabecalhos_api($metodos = 'GET, POST, OPTIONS') {
  header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
  $origem = $_SERVER['HTTP_ORIGIN'] ?? ''; $perm = cfg('ORIGENS_PERMITIDAS', []);
  if ($origem && in_array($origem, $perm, true)) { header('Access-Control-Allow-Origin: ' . $origem); header('Access-Control-Allow-Credentials: true'); header('Vary: Origin'); }
  header('Access-Control-Allow-Methods: ' . $metodos); header('Access-Control-Allow-Headers: Content-Type');
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
  return $origem;
}

function conta_db() {
  static $db = null; if ($db) return $db;
  $db = new PDO('sqlite:' . __DIR__ . '/dados/contas.sqlite');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  $db->exec('PRAGMA busy_timeout = 5000');
  $db->exec("CREATE TABLE IF NOT EXISTS usuarios (id INTEGER PRIMARY KEY AUTOINCREMENT, criado TEXT, nome TEXT, canal TEXT, contato TEXT, senha_hash TEXT, status TEXT DEFAULT 'pendente', confirmado TEXT,
    c_msgs INTEGER DEFAULT 0, c_ts TEXT, c_versao TEXT, c_iph TEXT, ultimo_login TEXT, UNIQUE (canal, contato))");
  try { $db->exec('ALTER TABLE usuarios ADD COLUMN google_sub TEXT'); } catch (Throwable $e) { /* coluna já existe */ }
  $db->exec('CREATE TABLE IF NOT EXISTS codigos (id INTEGER PRIMARY KEY AUTOINCREMENT, uid INTEGER, finalidade TEXT, hash TEXT, expira INTEGER, tentativas INTEGER DEFAULT 0, criado INTEGER)');
  $db->exec('CREATE INDEX IF NOT EXISTS codigos_u ON codigos (uid, finalidade)');
  $db->exec('CREATE TABLE IF NOT EXISTS sessoes (hash TEXT PRIMARY KEY, uid INTEGER, criado INTEGER, expira INTEGER)');
  $db->exec('CREATE INDEX IF NOT EXISTS sessoes_u ON sessoes (uid)');
  $db->exec('CREATE TABLE IF NOT EXISTS taxa (ts INTEGER, chave TEXT)'); $db->exec('CREATE INDEX IF NOT EXISTS taxa_c ON taxa (chave, ts)');
  $db->exec('CREATE TABLE IF NOT EXISTS ia_uso (ts INTEGER, uid INTEGER, iph TEXT, nova INTEGER, tin INTEGER, tout INTEGER, passo INTEGER, custo REAL)');
  $db->exec('CREATE INDEX IF NOT EXISTS ia_uso_u ON ia_uso (uid, ts)');
  return $db;
}

// limite de frequência: devolve false quando a chave já fez $max ações nos últimos $janela segundos (e registra a ação quando permitido)
function taxa_ok($chave, $max, $janela) {
  $db = conta_db(); $agora = time();
  $s = $db->prepare('SELECT COUNT(*) FROM taxa WHERE chave = ? AND ts > ?'); $s->execute([$chave, $agora - $janela]);
  if ((int)$s->fetchColumn() >= $max) return false;
  $db->prepare('INSERT INTO taxa (ts, chave) VALUES (?, ?)')->execute([$agora, $chave]);
  if (mt_rand(1, 60) === 1) $db->exec('DELETE FROM taxa WHERE ts < ' . ($agora - 86400));
  return true;
}

// ---------- contatos ----------
// aceita e-mail ou número de WhatsApp (DDD + número; o 55 é acrescentado); devolve [canal, valor normalizado] ou null
function contato_parse($v) {
  $v = trim((string)$v); if ($v === '' || mb_strlen($v) > 160) return null;
  if (str_contains($v, '@')) { $e = strtolower($v); return filter_var($e, FILTER_VALIDATE_EMAIL) ? ['email', $e] : null; }
  $d = preg_replace('/\D+/', '', $v);
  if (strlen($d) === 10 || strlen($d) === 11) $d = '55' . $d;
  if (!preg_match('/^55[1-9][1-9]9?\d{8}$/', $d) || strlen($d) < 12 || strlen($d) > 13) return null;
  return ['whatsapp', $d];
}
function mascara($canal, $c) {
  if ($canal === 'email') { [$u, $d] = explode('@', $c, 2) + ['', '']; return mb_substr($u, 0, 1) . str_repeat('•', max(2, min(6, mb_strlen($u) - 1))) . '@' . $d; }
  return '+55 (' . substr($c, 2, 2) . ') •••••-' . substr($c, -4);
}
function canais_ativos() { $w = cfg('CONTA', [])['whatsapp'] ?? []; $c = ['email']; if (!empty($w['token']) && !empty($w['phone_id']) && !empty($w['template'])) $c[] = 'whatsapp'; return $c; }

// ---------- envio de códigos ----------
function envia_email($para, $codigo, $finalidade) {
  $c = cfg('CONTA', []); $de = $c['email_de'] ?? 'nao-responda@oficinapolitica.com.br';
  if (!filter_var($de, FILTER_VALIDATE_EMAIL)) return false;
  $assunto = ($finalidade === 'redefinir' ? 'Redefinir sua senha' : 'Confirme seu cadastro') . ' · Oficina Política: código ' . $codigo;
  $acao = $finalidade === 'redefinir' ? 'redefinir a senha' : 'confirmar o cadastro';
  $texto = "Seu código para $acao na Oficina Política: $codigo\n\nEle vale por 15 minutos. Se não foi você que pediu, ignore esta mensagem; nada será alterado.\n\nOficina Política · oficinapolitica.com.br\n";
  $h = 'From: ' . mb_encode_mimeheader('Oficina Política', 'UTF-8', 'B') . " <$de>\r\nMIME-Version: 1.0\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: 8bit\r\nX-Auto-Response-Suppress: All\r\n";
  $sm = $c['smtp'] ?? [];
  if (!empty($sm['host']) && !empty($sm['user']) && !empty($sm['pass'])) return smtp_envia($sm, $de, $para, mb_encode_mimeheader($assunto, 'UTF-8', 'B', "\r\n"), $h, $texto);
  return @mail($para, mb_encode_mimeheader($assunto, 'UTF-8', 'B', "\r\n"), $texto, $h, '-f' . $de);
}
// envio autenticado (SMTP com SSL, porta 465 por padrão): bem mais confiável que mail() em hospedagem compartilhada
function smtp_envia($sm, $de, $para, $assunto, $cabecalhos, $texto) {
  $porta = (int)($sm['porta'] ?? 465); $host = ($porta === 465 ? 'ssl://' : '') . $sm['host'];
  $f = @stream_socket_client($host . ':' . $porta, $en, $es, 15); if (!$f) { error_log("conta.php: SMTP sem conexão $en $es"); return false; }
  stream_set_timeout($f, 15);
  $le = function () use ($f) { $r = ''; while (($l = fgets($f, 515)) !== false) { $r .= $l; if (strlen($l) < 4 || $l[3] === ' ') break; } return $r; };
  $cmd = function ($c, $ok) use ($f, $le) { if ($c !== null) fwrite($f, $c . "\r\n"); $r = $le(); if (!str_starts_with($r, (string)$ok)) { error_log('conta.php: SMTP ' . trim(substr($r, 0, 200))); return false; } return true; };
  $dom = parse_url('http://' . ($_SERVER['HTTP_HOST'] ?? 'oficinapolitica.com.br'), PHP_URL_HOST) ?: 'oficinapolitica.com.br';
  $ok = $cmd(null, 220) && $cmd('EHLO ' . $dom, 250);
  if ($ok && $porta !== 465) { $ok = $cmd('STARTTLS', 220) && stream_socket_enable_crypto($f, true, STREAM_CRYPTO_METHOD_TLS_CLIENT) && $cmd('EHLO ' . $dom, 250); }
  $ok = $ok && $cmd('AUTH LOGIN', 334) && $cmd(base64_encode($sm['user']), 334) && $cmd(base64_encode($sm['pass']), 235)
    && $cmd('MAIL FROM:<' . $de . '>', 250) && $cmd('RCPT TO:<' . $para . '>', 250) && $cmd('DATA', 354);
  if ($ok) { $msg = 'To: <' . $para . ">\r\nSubject: " . $assunto . "\r\nDate: " . date('r') . "\r\n" . $cabecalhos . "\r\n" . preg_replace('/^\./m', '..', str_replace("\n", "\r\n", str_replace("\r\n", "\n", $texto))) . "\r\n."; $ok = $cmd($msg, 250); }
  @fwrite($f, "QUIT\r\n"); @fclose($f); return $ok;
}
// WhatsApp Business Cloud API (Meta): mensagem de modelo de autenticação aprovado, com o código no corpo e no botão "copiar código"
function envia_whatsapp($para, $codigo) {
  $w = cfg('CONTA', [])['whatsapp'] ?? []; if (empty($w['token']) || empty($w['phone_id']) || empty($w['template'])) return false;
  $base = rtrim($w['base'] ?? 'https://graph.facebook.com/v21.0', '/');
  $comp = [['type' => 'body', 'parameters' => [['type' => 'text', 'text' => $codigo]]]];
  if (($w['botao'] ?? true) !== false) $comp[] = ['type' => 'button', 'sub_type' => 'url', 'index' => '0', 'parameters' => [['type' => 'text', 'text' => $codigo]]];
  $corpo = json_encode(['messaging_product' => 'whatsapp', 'to' => $para, 'type' => 'template', 'template' => ['name' => $w['template'], 'language' => ['code' => $w['idioma'] ?? 'pt_BR'], 'components' => $comp]]);
  $ch = curl_init($base . '/' . rawurlencode($w['phone_id']) . '/messages');
  curl_setopt_array($ch, [CURLOPT_POST => true, CURLOPT_POSTFIELDS => $corpo, CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 20, CURLOPT_CONNECTTIMEOUT => 8, CURLOPT_HTTPHEADER => ['Content-Type: application/json', 'Authorization: Bearer ' . $w['token']]]);
  $r = curl_exec($ch); $cod = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
  if ($cod < 200 || $cod >= 300) { error_log('conta.php: WhatsApp respondeu ' . $cod . ' ' . substr((string)$r, 0, 300)); return false; }
  return true;
}
function envia_codigo($canal, $destino, $codigo, $finalidade) {
  if (!empty(cfg('CONTA', [])['teste'])) {   // só para testar: não envia nada, grava o código num arquivo local
    @file_put_contents(__DIR__ . '/dados/codigos_teste.log', date('c') . " $canal $destino $codigo $finalidade\n", FILE_APPEND); return true;
  }
  return $canal === 'whatsapp' ? envia_whatsapp($destino, $codigo) : envia_email($destino, $codigo, $finalidade);
}

// gera e envia um código de 6 dígitos (vale 15 min, 5 tentativas). Devolve 'ok', 'espera' (pediu há menos de 45 s), 'limite' ou 'falha'
function emite_codigo($u, $finalidade) {
  $db = conta_db(); $agora = time();
  $s = $db->prepare('SELECT criado FROM codigos WHERE uid = ? AND finalidade = ? ORDER BY id DESC LIMIT 1'); $s->execute([$u['id'], $finalidade]);
  $ult = $s->fetchColumn(); if ($ult && $agora - (int)$ult < 45) return 'espera';
  if (!taxa_ok('cod:' . hcurto($u['canal'] . $u['contato']), 5, 3600)) return 'limite';
  $codigo = (string)random_int(100000, 999999);
  $db->prepare('DELETE FROM codigos WHERE uid = ? AND finalidade = ?')->execute([$u['id'], $finalidade]);
  $db->prepare('INSERT INTO codigos (uid, finalidade, hash, expira, criado) VALUES (?,?,?,?,?)')->execute([$u['id'], $finalidade, hash('sha256', cfg('SAL', '') . $u['id'] . $codigo), $agora + 900, $agora]);
  if (!envia_codigo($u['canal'], $u['contato'], $codigo, $finalidade)) { $db->prepare('DELETE FROM codigos WHERE uid = ? AND finalidade = ?')->execute([$u['id'], $finalidade]); return 'falha'; }
  return 'ok';
}
// confere o código digitado (máx. 5 tentativas por código); apaga o código quando correto
function confere_codigo($u, $finalidade, $digitado) {
  $db = conta_db(); $agora = time(); $digitado = preg_replace('/\D+/', '', (string)$digitado);
  $s = $db->prepare('SELECT * FROM codigos WHERE uid = ? AND finalidade = ? ORDER BY id DESC LIMIT 1'); $s->execute([$u['id'], $finalidade]); $c = $s->fetch();
  if (!$c || (int)$c['expira'] < $agora) return 'expirado';
  if ((int)$c['tentativas'] >= 5) return 'tentativas';
  if (strlen($digitado) !== 6 || !hash_equals($c['hash'], hash('sha256', cfg('SAL', '') . $u['id'] . $digitado))) { $db->prepare('UPDATE codigos SET tentativas = tentativas + 1 WHERE id = ?')->execute([$c['id']]); return 'errado'; }
  $db->prepare('DELETE FROM codigos WHERE uid = ? AND finalidade = ?')->execute([$u['id'], $finalidade]);
  return 'ok';
}

// ---------- sessão (cookie HttpOnly; no banco só o hash do token) ----------
function sessao_criar($uid) {
  $db = conta_db(); $dias = (int)((cfg('CONTA', [])['sessao_dias'] ?? 30)); $agora = time(); $exp = $agora + 86400 * $dias;
  $token = bin2hex(random_bytes(32));
  $db->prepare('INSERT INTO sessoes (hash, uid, criado, expira) VALUES (?,?,?,?)')->execute([hash('sha256', $token), $uid, $agora, $exp]);
  $db->prepare('DELETE FROM sessoes WHERE expira < ?')->execute([$agora]);
  setcookie('op_sessao', $token, ['expires' => $exp, 'path' => '/', 'secure' => https_ativo(), 'httponly' => true, 'samesite' => 'Lax']);
}
function sessao_encerrar() {
  $t = (string)($_COOKIE['op_sessao'] ?? '');
  if (preg_match('/^[a-f0-9]{64}$/', $t)) conta_db()->prepare('DELETE FROM sessoes WHERE hash = ?')->execute([hash('sha256', $t)]);
  setcookie('op_sessao', '', ['expires' => 1, 'path' => '/', 'secure' => https_ativo(), 'httponly' => true, 'samesite' => 'Lax']);
}
function usuario_atual() {
  static $u = false; if ($u !== false) return $u;
  $u = null; $t = (string)($_COOKIE['op_sessao'] ?? ''); if (!preg_match('/^[a-f0-9]{64}$/', $t)) return $u;
  $s = conta_db()->prepare("SELECT u.* FROM sessoes s JOIN usuarios u ON u.id = s.uid WHERE s.hash = ? AND s.expira > ? AND u.status = 'ativo'"); $s->execute([hash('sha256', $t), time()]);
  $r = $s->fetch(); if ($r) $u = $r; return $u;
}
function usuario_publico($u) { return ['nome' => $u['nome'], 'canal' => $u['canal'], 'contato' => mascara($u['canal'], $u['contato']), 'sem_senha' => ($u['senha_hash'] ?? '') === '']; }

// ---------- entrada com o Google (Google Identity Services): o navegador manda o ID token e o servidor o confere com o Google ----------
function google_confere($credencial) {
  $id = trim((string)cfg('GOOGLE_CLIENT_ID', '')); if ($id === '') return null;
  if (!is_string($credencial) || !preg_match('/^[\w-]+\.[\w-]+\.[\w-]+$/', $credencial) || strlen($credencial) > 3500) return null;
  $url = cfg('GOOGLE_TOKENINFO_URL', 'https://oauth2.googleapis.com/tokeninfo') . '?id_token=' . rawurlencode($credencial); $txt = false;
  if (function_exists('curl_init')) { $c = curl_init($url); curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 5]); $txt = curl_exec($c); $cod = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c); if ($cod !== 200) $txt = false; }
  else $txt = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => 8]]));
  $t = $txt ? json_decode($txt, true) : null; if (!is_array($t)) return null;
  if (($t['aud'] ?? '') !== $id) return null;
  if (!in_array($t['iss'] ?? '', ['accounts.google.com', 'https://accounts.google.com'], true)) return null;
  if ((int)($t['exp'] ?? 0) < time()) return null;
  if (!in_array($t['email_verified'] ?? false, [true, 'true'], true)) return null;
  $e = strtolower(trim((string)($t['email'] ?? ''))); if (!filter_var($e, FILTER_VALIDATE_EMAIL) || empty($t['sub'])) return null;
  return ['email' => $e, 'sub' => (string)$t['sub'], 'nome' => trim((string)($t['name'] ?? '')) ?: explode('@', $e)[0]];
}

// ---------- cota de uso da IA ----------
// Orçamento: US$ 20/mês de tokens para toda a plataforma. Custo real de cada chamada (tokens × preço) é gravado; ao chegar no teto, a IA pausa até o mês seguinte.
function ia_cota_cfg() { return array_merge(['usuario_mes' => 15, 'usuario_dia' => 5, 'orcamento_mes_usd' => 20.0, 'preco_in_usd_mtok' => 0.10, 'preco_out_usd_mtok' => 0.50, 'chamadas_por_pergunta' => 11], cfg('IA_COTA', []) ?: []); }
function sp_data($txt) { return (new DateTime($txt, new DateTimeZone('America/Sao_Paulo'))); }
function mes_ini() { return sp_data('first day of this month 00:00:00')->getTimestamp(); }
function dia_ini() { return sp_data('today 00:00:00')->getTimestamp(); }
function cota_info($uid) {
  $c = ia_cota_cfg(); $db = conta_db();
  $q = function ($desde) use ($db, $uid) { $s = $db->prepare('SELECT COUNT(*) FROM ia_uso WHERE uid = ? AND nova = 1 AND ts >= ?'); $s->execute([$uid, $desde]); return (int)$s->fetchColumn(); };
  $mes = $q(mes_ini()); $dia = $q(dia_ini()); $lim = (int)$c['usuario_mes'];
  return ['usadas' => $mes, 'limite' => $lim, 'restantes' => max(0, $lim - $mes), 'dia_usadas' => $dia, 'dia_limite' => (int)$c['usuario_dia'], 'reinicia' => sp_data('first day of next month 00:00:00')->format('Y-m-d')];
}
function gasto_mes_usd() { $s = conta_db()->prepare('SELECT COALESCE(SUM(custo), 0) FROM ia_uso WHERE ts >= ?'); $s->execute([mes_ini()]); return (float)$s->fetchColumn(); }
