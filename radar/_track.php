<?php
// Rastreio de compartilhamentos do Radar. Banco próprio (radar/dados/radar.sqlite), separado das contas.
// Quem compartilha recebe um código estável (8 hex, HMAC do id da conta): o link leva ?r=CODIGO&m=MATERIA&utm_medium=CANAL.
// Se qualquer coisa falhar (pasta sem escrita, sem sqlite), o rastreio simplesmente desliga: o Radar segue funcionando.
function radar_db() {
  static $db = false; if ($db !== false) return $db;
  $db = null;
  try {
    $dir = __DIR__ . '/dados'; if (!is_dir($dir)) @mkdir($dir, 0755, true);
    if (!is_dir($dir) || !is_writable($dir) || !extension_loaded('pdo_sqlite')) return $db;
    $db = new PDO('sqlite:' . $dir . '/radar.sqlite'); $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("CREATE TABLE IF NOT EXISTS codigos (code TEXT PRIMARY KEY, uid INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS compartilhamentos (id INTEGER PRIMARY KEY, ts INTEGER, uid INTEGER, code TEXT, materia TEXT, canal TEXT);
      CREATE TABLE IF NOT EXISTS visitas (id INTEGER PRIMARY KEY, ts INTEGER, code TEXT, materia TEXT, canal TEXT, visitante TEXT, logado INTEGER);
      CREATE TABLE IF NOT EXISTS conversoes (uid INTEGER PRIMARY KEY, ts INTEGER, code TEXT);
      CREATE TABLE IF NOT EXISTS leituras (id INTEGER PRIMARY KEY, ts INTEGER, uid INTEGER, materia TEXT, editoria TEXT, regiao TEXT);
      CREATE TABLE IF NOT EXISTS optout_email (hash TEXT PRIMARY KEY, ts INTEGER);
      CREATE TABLE IF NOT EXISTS boletim (uid INTEGER PRIMARY KEY, ativo INTEGER DEFAULT 0, ed TEXT, reg TEXT, c_ts INTEGER, c_versao TEXT, atualizado INTEGER);
      CREATE INDEX IF NOT EXISTS i_lei_uid ON leituras(uid); CREATE INDEX IF NOT EXISTS i_vis_code ON visitas(code); CREATE INDEX IF NOT EXISTS i_cmp_code ON compartilhamentos(code);");
    // prazos de guarda da política de privacidade: leituras, compartilhamentos e conversões 24 meses; visitas 12 meses (roda no máximo 1x por dia)
    $mk = $dir . '/limpeza.txt';
    if (!is_file($mk) || filemtime($mk) < time() - 86400) {
      @file_put_contents($mk, date('c'));
      $db->prepare('DELETE FROM leituras WHERE ts < ?')->execute([time() - 63072000]);
      $db->prepare('DELETE FROM compartilhamentos WHERE ts < ?')->execute([time() - 63072000]);
      $db->prepare('DELETE FROM conversoes WHERE ts < ?')->execute([time() - 63072000]);
      $db->prepare('DELETE FROM visitas WHERE ts < ?')->execute([time() - 31536000]);
    }
  } catch (Throwable $e) { $db = null; }
  return $db;
}
function radar_segredo() {
  $f = __DIR__ . '/dados/segredo.key';
  $s = @file_get_contents($f); if (is_string($s) && strlen($s) >= 32) return trim($s);
  if (!is_dir(__DIR__ . '/dados') || !is_writable(__DIR__ . '/dados')) return '';
  $s = bin2hex(random_bytes(24)); @file_put_contents($f, $s, LOCK_EX); @chmod($f, 0600); return $s;
}
function radar_codigo($uid) {
  $uid = (int)$uid; $db = radar_db(); $seg = radar_segredo(); if (!$db || $seg === '' || $uid <= 0) return '';
  $c = substr(hash_hmac('sha256', (string)$uid, $seg), 0, 8);
  try { $db->prepare('INSERT OR IGNORE INTO codigos (code, uid) VALUES (?, ?)')->execute([$c, $uid]); } catch (Throwable $e) { return ''; }
  return $c;
}
function radar_codigo_existe($code) {
  $db = radar_db(); if (!$db || !preg_match('/^[a-f0-9]{8}$/', (string)$code)) return false;
  try { $s = $db->prepare('SELECT 1 FROM codigos WHERE code = ?'); $s->execute([$code]); return (bool)$s->fetchColumn(); } catch (Throwable $e) { return false; }
}
function radar_compartilhou($uid, $materia, $canal) {
  $db = radar_db(); $c = radar_codigo($uid); if (!$db || $c === '') return false;
  try {
    $n = $db->prepare('SELECT COUNT(*) FROM compartilhamentos WHERE uid = ? AND ts > ?'); $n->execute([(int)$uid, time() - 86400]);
    if ((int)$n->fetchColumn() >= 300) return false;     // trava contra abuso
    $db->prepare('INSERT INTO compartilhamentos (ts, uid, code, materia, canal) VALUES (?,?,?,?,?)')->execute([time(), (int)$uid, $c, $materia, $canal]); return true;
  } catch (Throwable $e) { return false; }
}
function radar_visita($code, $materia, $canal, $logado) {
  $db = radar_db(); $seg = radar_segredo(); if (!$db || $seg === '') return;
  $ip = (string)($_SERVER['REMOTE_ADDR'] ?? ''); $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
  $v = substr(hash('sha256', $ip . '|' . $ua . '|' . date('Y-m-d') . '|' . $seg), 0, 16);   // visitante do dia, sem guardar IP
  try {
    $r = $db->prepare('SELECT 1 FROM visitas WHERE code = ? AND visitante = ? AND materia = ? AND ts > ? LIMIT 1'); $r->execute([$code, $v, $materia, time() - 3600]);
    if ($r->fetchColumn()) return;
    $db->prepare('INSERT INTO visitas (ts, code, materia, canal, visitante, logado) VALUES (?,?,?,?,?,?)')->execute([time(), $code, $materia, $canal, $v, $logado ? 1 : 0]);
  } catch (Throwable $e) {}
}
function radar_conversao($uid, $code) {
  $db = radar_db(); if (!$db) return false;
  try {
    $c = $db->prepare('SELECT uid FROM codigos WHERE code = ?'); $c->execute([$code]); $dono = (int)$c->fetchColumn();
    if ($dono <= 0 || $dono === (int)$uid) return false;
    $i = $db->prepare('INSERT OR IGNORE INTO conversoes (uid, ts, code) VALUES (?,?,?)'); $i->execute([(int)$uid, time(), $code]); return $i->rowCount() > 0;
  } catch (Throwable $e) { return false; }
}
// Histórico de leitura de quem está logado. SÓ é chamado quando a pessoa aceitou "Interesses de leitura" no aviso de cookies.
function radar_leitura($uid, $materia, $editoria, $regiao) {
  $db = radar_db(); if (!$db) return false;
  try {
    $n = $db->prepare('SELECT COUNT(*) FROM leituras WHERE uid = ? AND ts > ?'); $n->execute([(int)$uid, time() - 86400]); if ((int)$n->fetchColumn() >= 500) return false;
    $db->prepare('INSERT INTO leituras (ts, uid, materia, editoria, regiao) VALUES (?,?,?,?,?)')->execute([time(), (int)$uid, $materia, $editoria, $regiao]); return true;
  } catch (Throwable $e) { return false; }
}
// Direitos do titular: apaga tudo do Radar ligado a esta conta (leituras, códigos e compartilhamentos). Chamar na exclusão da conta.
function radar_apagar_usuario($uid) {
  $db = radar_db(); if (!$db) return false;
  try { foreach (['leituras', 'compartilhamentos', 'conversoes', 'codigos', 'boletim'] as $t) $db->prepare("DELETE FROM $t WHERE uid = ?")->execute([(int)$uid]); return true; } catch (Throwable $e) { return false; }
}
// Descadastro de e-mails do Radar (compartilhar por e-mail e boletim): guarda só o hash do endereço, para nunca mais enviar.
function radar_email_hash($email) { return hash('sha256', strtolower(trim($email)) . radar_segredo()); }
function radar_optout_hash($h) {
  $db = radar_db(); if (!$db || !preg_match('/^[a-f0-9]{64}$/', $h)) return false;
  try { $db->prepare('INSERT OR IGNORE INTO optout_email (hash, ts) VALUES (?,?)')->execute([$h, time()]); return true; } catch (Throwable $e) { return false; }
}
function radar_optout_email($email) { return radar_optout_hash(radar_email_hash($email)); }
function radar_email_bloqueado($email) {
  $db = radar_db(); if (!$db) return true;
  try { $s = $db->prepare('SELECT 1 FROM optout_email WHERE hash = ?'); $s->execute([radar_email_hash($email)]); return (bool)$s->fetchColumn(); } catch (Throwable $e) { return true; }
}
// Boletim: preferências de quem pediu (opt-in). ed = editorias (politica, economia, mundo); reg = regiões (rj, sp, mg, ne, sul, norte, co)
function radar_boletim_get($uid) {
  $db = radar_db(); if (!$db) return null;
  try { $s = $db->prepare('SELECT * FROM boletim WHERE uid = ?'); $s->execute([(int)$uid]); $r = $s->fetch(PDO::FETCH_ASSOC);
    if (!$r) return ['ativo' => false, 'ed' => ['politica', 'economia', 'mundo'], 'reg' => []];
    return ['ativo' => (bool)$r['ativo'], 'ed' => array_values(array_filter(explode(',', (string)$r['ed']))), 'reg' => array_values(array_filter(explode(',', (string)$r['reg'])))];
  } catch (Throwable $e) { return null; }
}
function radar_boletim_set($uid, $ativo, $ed, $reg) {
  $db = radar_db(); if (!$db) return false;
  $ed = array_values(array_intersect(['politica', 'economia', 'mundo'], (array)$ed)); $reg = array_values(array_intersect(['rj', 'sp', 'mg', 'ne', 'sul', 'norte', 'co'], (array)$reg));
  if ($ativo && !$ed && !$reg) return false;
  try {
    $db->prepare('INSERT INTO boletim (uid, ativo, ed, reg, c_ts, c_versao, atualizado) VALUES (?,?,?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET ativo=excluded.ativo, ed=excluded.ed, reg=excluded.reg, c_ts=CASE WHEN excluded.ativo=1 AND boletim.ativo=0 THEN excluded.c_ts ELSE boletim.c_ts END, c_versao=CASE WHEN excluded.ativo=1 AND boletim.ativo=0 THEN excluded.c_versao ELSE boletim.c_versao END, atualizado=excluded.atualizado')
       ->execute([(int)$uid, $ativo ? 1 : 0, implode(',', $ed), implode(',', $reg), time(), 'b1', time()]);
    return true;
  } catch (Throwable $e) { return false; }
}
function radar_boletim_cancelar($uid) { $db = radar_db(); if (!$db) return false; try { $db->prepare('UPDATE boletim SET ativo = 0, atualizado = ? WHERE uid = ?')->execute([time(), (int)$uid]); return true; } catch (Throwable $e) { return false; } }
