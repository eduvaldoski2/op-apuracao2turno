<?php
// Exportação protegida por token (api/config.php). Exemplos:
//   exportar.php?token=SEU_TOKEN&formato=csv        -> todos os contatos ativos (CSV)
//   exportar.php?token=SEU_TOKEN&formato=audiencia  -> e-mail/telefone com hash SHA-256, só de quem autorizou anúncios (Meta/Google)
//   exportar.php?token=SEU_TOKEN&excluir=email@x.com -> marca o contato como excluído e apaga os dados pessoais (pedido do titular, LGPD art. 18)
require __DIR__ . '/config.php';
if (!isset($_GET['token']) || $TOKEN_ADMIN === '' || strlen($TOKEN_ADMIN) < 20 || !hash_equals($TOKEN_ADMIN, (string)$_GET['token'])) { http_response_code(403); exit('acesso negado'); }
$db = new PDO('sqlite:' . __DIR__ . '/dados/leads.sqlite'); $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
if (!empty($_GET['excluir'])) {
  $s = $db->prepare("UPDATE leads SET nome='', telefone='', cidade='', perfil='', pagina='', origem='', agente='', excluido=1, email='excluido-' || id || '@excluido.invalid' WHERE email = ?"); $s->execute([strtolower(trim($_GET['excluir']))]);
  exit('excluídos: ' . $s->rowCount());
}
$fmt = $_GET['formato'] ?? 'csv';
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
