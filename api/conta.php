<?php
// Contas de usuário do painel (necessárias para a "Pergunte à IA"): cadastro com confirmação por e-mail ou WhatsApp, entrada, saída,
// redefinição de senha e exclusão da conta. GET devolve o estado atual (logado ou não, cota de perguntas). Veja _conta.php e config.sample.php.
require __DIR__ . '/config.php';
require __DIR__ . '/_conta.php';
$origem = cabecalhos_api();
if (!cfg('CONTA_ATIVA', false)) erro(404, 'desligado', 'Este recurso ainda não está disponível.');   // contas e IA só funcionam na versão de testes, enquanto CONTA_ATIVA = true no config.php
$metodo = $_SERVER['REQUEST_METHOD'] ?? '';
$ia_ativa = trim((string)cfg('IA_CHAVE', '')) !== '';
function estado() {
  global $ia_ativa; $u = usuario_atual();
  $e = ['ok' => true, 'ia_ativa' => $ia_ativa, 'canais' => canais_ativos(), 'texto_versao' => OP_TEXTO_VERSAO, 'logado' => (bool)$u, 'google_id' => trim((string)cfg('GOOGLE_CLIENT_ID', '')) ?: null];
  if ($u) { $e['usuario'] = usuario_publico($u); $e['cota'] = cota_info($u['id']); }
  return $e;
}
if ($metodo === 'GET') sai(estado());
if ($metodo !== 'POST') erro(405, 'metodo', 'Método inválido.');
if ($origem && !in_array($origem, cfg('ORIGENS_PERMITIDAS', []), true)) erro(403, 'origem', 'Origem não permitida.');
$bruto = file_get_contents('php://input'); if ($bruto === false || strlen($bruto) > 6000) erro(413, 'tamanho', 'Pedido grande demais.');
$j = json_decode($bruto, true); if (!is_array($j)) erro(400, 'formato', 'Pedido inválido.');
$acao = (string)($j['acao'] ?? '');
$agora = date('c'); $iph = ip_hash(); $db = conta_db();

function acha_usuario($valor) {
  $p = contato_parse($valor); if (!$p) return null;
  $s = conta_db()->prepare('SELECT * FROM usuarios WHERE canal = ? AND contato = ?'); $s->execute($p); return $s->fetch() ?: null;
}
function senha_valida($s) {
  if (!is_string($s) || strlen($s) < 8) erro(422, 'senha', 'A senha precisa ter pelo menos 8 caracteres.');
  if (strlen($s) > 72) erro(422, 'senha', 'A senha pode ter no máximo 72 caracteres.');
  if (!preg_match('/\pL/u', $s) || !preg_match('/\d/', $s)) erro(422, 'senha', 'Use letras e números na senha.');
}
function resposta_envio($r, $u) {
  if ($r === 'ok') return;
  if ($r === 'espera') erro(429, 'espera', 'Um código acabou de ser enviado. Aguarde cerca de 45 segundos para pedir outro.');
  if ($r === 'limite') erro(429, 'limite', 'Muitos códigos pedidos para este contato. Tente de novo em uma hora.');
  erro(502, 'envio', $u['canal'] === 'whatsapp' ? 'Não foi possível enviar o código pelo WhatsApp agora. Tente novamente ou cadastre-se com o e-mail.' : 'Não foi possível enviar o e-mail agora. Tente novamente em instantes.');
}
function msg_codigo($r) {
  if ($r === 'expirado') erro(422, 'codigo_expirado', 'O código expirou ou não existe. Peça um novo código.');
  if ($r === 'tentativas') erro(429, 'codigo_tentativas', 'Muitas tentativas com este código. Peça um novo código.');
  if ($r === 'errado') erro(422, 'codigo_errado', 'Código incorreto. Confira e tente de novo.');
}

if ($acao === 'cadastrar') {
  if (!taxa_ok('cad:' . $iph, 10, 3600)) erro(429, 'limite', 'Muitos cadastros deste dispositivo. Tente mais tarde.');
  $nome = trim(preg_replace('/\s+/u', ' ', (string)($j['nome'] ?? '')));
  if (mb_strlen($nome) < 2 || mb_strlen($nome) > 80) erro(422, 'nome', 'Informe seu nome.');
  $p = contato_parse($j['contato'] ?? '');
  $canal = (string)($j['canal'] ?? '');
  if (!in_array($canal, canais_ativos(), true)) erro(422, 'canal', $canal === 'whatsapp' ? 'A confirmação por WhatsApp ainda não está disponível. Use o e-mail.' : 'Escolha e-mail ou WhatsApp.');
  if (!$p || $p[0] !== $canal) erro(422, 'contato', $canal === 'email' ? 'Informe um e-mail válido.' : 'Informe um WhatsApp válido, com DDD.');
  senha_valida($j['senha'] ?? null);
  if (empty($j['aceite_mensagens'])) erro(422, 'aceite', 'Para concluir o cadastro é necessário aceitar receber mensagens da Oficina Política.');
  $ex = acha_usuario($j['contato']);
  if ($ex && $ex['status'] === 'ativo') erro(409, 'existe', 'Já existe uma conta com este contato. Entre com sua senha ou use “Esqueci a senha”.');
  $hash = password_hash((string)$j['senha'], PASSWORD_DEFAULT);
  if ($ex) {   // cadastro iniciado e não confirmado: refaz com os dados novos
    $db->prepare('UPDATE usuarios SET nome=?, senha_hash=?, c_msgs=1, c_ts=?, c_versao=?, c_iph=? WHERE id=?')->execute([$nome, $hash, $agora, OP_TEXTO_VERSAO, $iph, $ex['id']]); $uid = $ex['id'];
  } else {
    $db->prepare('INSERT INTO usuarios (criado, nome, canal, contato, senha_hash, status, c_msgs, c_ts, c_versao, c_iph) VALUES (?,?,?,?,?,?,?,?,?,?)')->execute([$agora, $nome, $p[0], $p[1], $hash, 'pendente', 1, $agora, OP_TEXTO_VERSAO, $iph]); $uid = (int)$db->lastInsertId();
  }
  $u = ['id' => $uid, 'canal' => $p[0], 'contato' => $p[1]];
  resposta_envio(emite_codigo($u, 'confirmar'), $u);
  sai(['ok' => true, 'etapa' => 'confirmar', 'canal' => $p[0], 'destino' => mascara($p[0], $p[1])]);
}

if ($acao === 'reenviar') {
  $u = acha_usuario($j['contato'] ?? '');
  if (!$u || $u['status'] !== 'pendente') sai(['ok' => true, 'etapa' => 'confirmar']);   // não revela se o contato existe
  resposta_envio(emite_codigo($u, 'confirmar'), $u);
  sai(['ok' => true, 'etapa' => 'confirmar', 'destino' => mascara($u['canal'], $u['contato'])]);
}

if ($acao === 'confirmar') {
  if (!taxa_ok('ver:' . $iph, 20, 900)) erro(429, 'limite', 'Muitas tentativas. Aguarde alguns minutos.');
  $u = acha_usuario($j['contato'] ?? '');
  if (!$u || $u['status'] !== 'pendente') erro(422, 'codigo_expirado', 'Não há cadastro aguardando confirmação para este contato.');
  msg_codigo(confere_codigo($u, 'confirmar', $j['codigo'] ?? ''));
  $db->prepare("UPDATE usuarios SET status='ativo', confirmado=?, ultimo_login=? WHERE id=?")->execute([$agora, $agora, $u['id']]);
  sessao_criar($u['id']);
  $u2 = $db->prepare('SELECT * FROM usuarios WHERE id = ?'); $u2->execute([$u['id']]); $u2 = $u2->fetch();
  sai(['ok' => true, 'logado' => true, 'usuario' => usuario_publico($u2), 'cota' => cota_info($u['id'])]);
}

if ($acao === 'entrar') {
  $ch = hcurto(strtolower(trim((string)($j['contato'] ?? ''))));
  if (!taxa_ok('ent:' . $iph, 15, 900) || !taxa_ok('entc:' . $ch, 8, 900)) erro(429, 'limite', 'Muitas tentativas de entrada. Aguarde alguns minutos.');
  $u = acha_usuario($j['contato'] ?? ''); $senha = (string)($j['senha'] ?? '');
  $ok = password_verify($senha, $u['senha_hash'] ?? '$2y$10$WuHZHiT53we9X5vl8a1jKepOvKhYwMHGCoLkNgLyWrjfaaGPY4d1a');   // sempre verifica, para não revelar se a conta existe pelo tempo de resposta
  if (!$u || !$ok) erro(401, 'credenciais', 'Contato ou senha incorretos.');
  if ($u['status'] !== 'ativo') {   // cadastro sem confirmação: manda um novo código
    $r = emite_codigo($u, 'confirmar'); if (in_array($r, ['falha'], true)) resposta_envio($r, $u);
    sai(['ok' => false, 'erro' => 'pendente', 'etapa' => 'confirmar', 'canal' => $u['canal'], 'destino' => mascara($u['canal'], $u['contato']), 'mensagem' => 'Falta confirmar seu contato. Enviamos um código para ' . mascara($u['canal'], $u['contato']) . '.'], 403);
  }
  if (password_needs_rehash($u['senha_hash'], PASSWORD_DEFAULT)) $db->prepare('UPDATE usuarios SET senha_hash=? WHERE id=?')->execute([password_hash($senha, PASSWORD_DEFAULT), $u['id']]);
  $db->prepare('UPDATE usuarios SET ultimo_login=? WHERE id=?')->execute([$agora, $u['id']]);
  sessao_criar($u['id']);
  sai(['ok' => true, 'logado' => true, 'usuario' => usuario_publico($u), 'cota' => cota_info($u['id'])]);
}

if ($acao === 'google') {
  if (!taxa_ok('goo:' . $iph, 20, 900)) erro(429, 'limite', 'Muitas tentativas. Aguarde alguns minutos.');
  $g = google_confere($j['credencial'] ?? null);
  if (!$g) erro(401, 'google', 'Não foi possível confirmar sua conta Google. Tente de novo ou use o cadastro por e-mail.');
  $u = acha_usuario($g['email']);
  if (!$u) {   // conta nova: precisa do aceite de mensagens, como no cadastro comum
    if (empty($j['aceite_mensagens'])) erro(422, 'aceite', 'Esta conta Google ainda não tem cadastro. Marque a caixa de aceite em “Criar conta” e clique de novo em “Continuar com Google”.');
    $db->prepare('INSERT INTO usuarios (criado, nome, canal, contato, senha_hash, status, confirmado, c_msgs, c_ts, c_versao, c_iph, ultimo_login, google_sub) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)')
       ->execute([$agora, mb_substr($g['nome'], 0, 80), 'email', $g['email'], '', 'ativo', $agora, 1, $agora, OP_TEXTO_VERSAO, $iph, $agora, $g['sub']]);
    $s2 = $db->prepare('SELECT * FROM usuarios WHERE id = ?'); $s2->execute([(int)$db->lastInsertId()]); $u = $s2->fetch();
  } else {   // o Google já confirmou o e-mail: ativa conta pendente e vincula o Google
    $db->prepare("UPDATE usuarios SET status='ativo', confirmado=COALESCE(confirmado, ?), ultimo_login=?, google_sub=COALESCE(google_sub, ?) WHERE id=?")->execute([$agora, $agora, $g['sub'], $u['id']]);
    $u['status'] = 'ativo';
  }
  sessao_criar($u['id']);
  sai(['ok' => true, 'logado' => true, 'usuario' => usuario_publico($u), 'cota' => cota_info($u['id'])]);
}

if ($acao === 'sair') { sessao_encerrar(); sai(['ok' => true, 'logado' => false]); }

if ($acao === 'esqueci') {
  $u = acha_usuario($j['contato'] ?? '');
  if (!contato_parse($j['contato'] ?? '')) erro(422, 'contato', 'Informe o e-mail ou WhatsApp do cadastro.');
  if ($u) { $r = emite_codigo($u, 'redefinir'); if ($r === 'espera' || $r === 'limite') resposta_envio($r, $u); }
  sai(['ok' => true, 'etapa' => 'redefinir', 'mensagem' => 'Se houver uma conta com este contato, enviamos um código.']);   // mesma resposta exista ou não a conta
}

if ($acao === 'redefinir') {
  if (!taxa_ok('ver:' . $iph, 20, 900)) erro(429, 'limite', 'Muitas tentativas. Aguarde alguns minutos.');
  $u = acha_usuario($j['contato'] ?? ''); if (!$u) erro(422, 'codigo_expirado', 'O código expirou ou não existe. Peça um novo código.');
  senha_valida($j['senha'] ?? null);
  msg_codigo(confere_codigo($u, 'redefinir', $j['codigo'] ?? ''));
  $db->prepare("UPDATE usuarios SET senha_hash=?, status='ativo', confirmado=COALESCE(confirmado, ?), ultimo_login=? WHERE id=?")->execute([password_hash((string)$j['senha'], PASSWORD_DEFAULT), $agora, $agora, $u['id']]);
  $db->prepare('DELETE FROM sessoes WHERE uid = ?')->execute([$u['id']]);   // encerra as sessões antigas
  sessao_criar($u['id']);
  sai(['ok' => true, 'logado' => true, 'usuario' => usuario_publico($u), 'cota' => cota_info($u['id'])]);
}

if ($acao === 'excluir') {   // direito de exclusão (LGPD): apaga a conta e os dados pessoais; o uso da IA fica só como contagem anônima de custo
  $u = usuario_atual(); if (!$u) erro(401, 'login', 'Entre na sua conta para excluí-la.');
  if (!taxa_ok('exc:' . $u['id'], 5, 900)) erro(429, 'limite', 'Muitas tentativas. Aguarde alguns minutos.');
  if (($u['senha_hash'] ?? '') === '') { if (strtoupper(trim((string)($j['confirmacao'] ?? ''))) !== 'EXCLUIR') erro(422, 'confirmacao', 'Digite EXCLUIR para confirmar.'); }   // conta criada só com o Google não tem senha
  elseif (!password_verify((string)($j['senha'] ?? ''), $u['senha_hash'])) erro(401, 'credenciais', 'Senha incorreta.');
  $db->prepare('UPDATE ia_uso SET uid = 0, iph = \'\' WHERE uid = ?')->execute([$u['id']]);
  foreach (['sessoes', 'codigos'] as $t) $db->prepare("DELETE FROM $t WHERE uid = ?")->execute([$u['id']]);
  $db->prepare('DELETE FROM usuarios WHERE id = ?')->execute([$u['id']]);
  sessao_encerrar(); sai(['ok' => true, 'logado' => false]);
}

erro(400, 'acao', 'Ação desconhecida.');
