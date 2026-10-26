<?php
// Exportação protegida por token (api/config.php). Exemplos:
//   exportar.php?token=SEU_TOKEN&formato=csv        -> todos os contatos ativos (CSV)
//   exportar.php?token=SEU_TOKEN&formato=audiencia  -> e-mail/telefone com hash SHA-256, só de quem autorizou anúncios (Meta/Google)
//   exportar.php?token=SEU_TOKEN&formato=contas     -> contas confirmadas da "Pergunte à IA" (CSV, com a prova do aceite de mensagens)
//   exportar.php?token=SEU_TOKEN&formato=uso_ia     -> gasto do mês com a IA, perguntas e usuários (JSON)
//   exportar.php?token=SEU_TOKEN&excluir=email@x.com -> marca o contato como excluído e apaga os dados pessoais (pedido do titular, LGPD art. 18)
require __DIR__ . '/config.php';
// o token pode vir no cabeçalho X-Token (usado pela página admin.html, não aparece nos registros de acesso), em POST ou na URL (?token=)
$tok = (string)($_SERVER['HTTP_X_TOKEN'] ?? $_POST['token'] ?? $_GET['token'] ?? '');
if ($TOKEN_ADMIN === '' || strlen($TOKEN_ADMIN) < 20 || !hash_equals($TOKEN_ADMIN, $tok)) { http_response_code(403); exit('acesso negado'); }
header('Cache-Control: no-store');
$db = new PDO('sqlite:' . __DIR__ . '/dados/leads.sqlite'); $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
$excl = (string)($_POST['excluir'] ?? $_GET['excluir'] ?? '');
if ($excl !== '') {
  $s = $db->prepare("UPDATE leads SET nome='', telefone='', cidade='', perfil='', pagina='', origem='', agente='', excluido=1, email='excluido-' || id || '@excluido.invalid' WHERE email = ?"); $s->execute([strtolower(trim($excl))]);
  exit('excluídos: ' . $s->rowCount());
}
$fmt = (string)($_POST['formato'] ?? $_GET['formato'] ?? 'csv');
if ($fmt === 'contas' || $fmt === 'uso_ia') {   // contas da "Pergunte à IA" (api/conta.php) e gasto do mês (custo real somado das chamadas)
  require __DIR__ . '/_conta.php'; $cd = conta_db();
  if ($fmt === 'uso_ia') {
    header('Content-Type: application/json; charset=utf-8'); $c = ia_cota_cfg();
    $n = fn($q) => (int)$cd->query($q)->fetchColumn(); $ini = mes_ini();
    echo json_encode(['mes_desde' => date('c', $ini), 'gasto_usd' => round(gasto_mes_usd(), 4), 'orcamento_usd' => (float)$c['orcamento_mes_usd'],
      'perguntas_mes' => $n("SELECT COUNT(*) FROM ia_uso WHERE nova=1 AND ts >= $ini"), 'chamadas_mes' => $n("SELECT COUNT(*) FROM ia_uso WHERE ts >= $ini"),
      'usuarios_ativos' => $n("SELECT COUNT(*) FROM usuarios WHERE status='ativo'"), 'usuarios_pendentes' => $n("SELECT COUNT(*) FROM usuarios WHERE status='pendente'"),
      'usuarios_que_perguntaram_no_mes' => $n("SELECT COUNT(DISTINCT uid) FROM ia_uso WHERE nova=1 AND uid>0 AND ts >= $ini"), 'cota_usuario_mes' => (int)$c['usuario_mes']]); exit;
  }
  header('Content-Type: text/csv; charset=utf-8'); header('Content-Disposition: attachment; filename="contas_' . date('Ymd') . '.csv"');
  $o = fopen('php://output', 'w'); fwrite($o, "\xEF\xBB\xBF"); fputcsv($o, ['criado', 'nome', 'canal', 'contato', 'confirmado_em', 'aceitou_mensagens', 'aceite_em', 'texto_versao']);
  foreach ($cd->query("SELECT criado,nome,canal,contato,confirmado,c_msgs,c_ts,c_versao FROM usuarios WHERE status='ativo' ORDER BY id") as $r) fputcsv($o, array_values($r));
  exit;
}
if ($fmt === 'eventos') {   // contagem de uso (api/evento.php): linhas por dia/evento/detalhe dos últimos 90 dias
  header('Content-Type: application/json; charset=utf-8');
  try {
    $ed = new PDO('sqlite:' . __DIR__ . '/dados/eventos.sqlite'); $ed->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); $ed->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
    $s = $ed->prepare('SELECT dia, evento, chave, n FROM cont WHERE dia >= ? ORDER BY dia DESC, n DESC'); $s->execute([date('Y-m-d', time() - 90 * 86400)]);
    echo json_encode(['linhas' => $s->fetchAll()], JSON_UNESCAPED_UNICODE);
  } catch (Throwable $e) { echo '{"linhas":[]}'; }
  exit;
}
if ($fmt === 'json') {   // usado pela página admin.html
  header('Content-Type: application/json; charset=utf-8');
  try {
    echo json_encode(['leads' => $db->query('SELECT id,criado,nome,email,telefone,c_contato,c_anuncios,texto_versao,pagina,origem FROM leads WHERE excluido=0 ORDER BY id DESC')->fetchAll()], JSON_UNESCAPED_UNICODE);
  } catch (Throwable $e) { echo '{"leads":[]}'; }   // ainda não há cadastros (a tabela é criada no primeiro)
  exit;
}
header('Content-Type: text/csv; charset=utf-8'); header('Content-Disposition: attachment; filename="leads_' . $fmt . '_' . date('Ymd') . '.csv"');
$o = fopen('php://output', 'w'); fwrite($o, "\xEF\xBB\xBF");
if ($fmt === 'audiencia') {
  // Meta (Públicos personalizados) e Google (Customer Match) aceitam SHA-256 de e-mail/telefone normalizados. Confira os nomes das colunas no assistente de cada plataforma.
  fputcsv($o, ['email', 'phone', 'fn']);
  foreach ($db->query('SELECT nome,email,telefone FROM leads WHERE excluido=0 AND c_anuncios=1') as $r) {
    $fn = strtolower(trim(explode(' ', $r['nome'])[0]));
    fputcsv($o, [hash('sha256', $r['email']), $r['telefone'] ? hash('sha256', $r['telefone']) : '', $fn ? hash('sha256', $fn) : '']);
  }
} else {
  fputcsv($o, ['criado', 'nome', 'email', 'telefone', 'cidade', 'perfil', 'autoriza_contato', 'autoriza_anuncios', 'texto_versao', 'pagina', 'origem']);
  foreach ($db->query('SELECT criado,nome,email,telefone,cidade,perfil,c_contato,c_anuncios,texto_versao,pagina,origem FROM leads WHERE excluido=0 ORDER BY id') as $r) fputcsv($o, array_values($r));
}
