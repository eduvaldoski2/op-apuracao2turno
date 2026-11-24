<?php
// Simulação "Quantos deputados federais Lula teria…": relatório protegido por conta gratuita (a mesma conta do painel e do Radar).
// O conteúdo (_conteudo.html) só é entregue a quem tem sessão válida. Qualquer falha (sem config, contas desligadas, erro no banco)
// cai na tela de entrada: nunca abre o conteúdo.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: private, no-store, max-age=0');
header('Pragma: no-cache');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: strict-origin-when-cross-origin');

$logado = false; $contasAtivas = false;
try {
  $cfg = __DIR__ . '/../api/config.php';
  if (is_file($cfg)) {
    require $cfg;
    require __DIR__ . '/../api/_conta.php';
    $contasAtivas = (bool)cfg('CONTA_ATIVA', false);
    if ($contasAtivas) $logado = (bool)usuario_atual();
  }
} catch (Throwable $e) { $logado = false; }

if ($logado && isset($_GET['pdf'])) {
  $f = __DIR__ . '/_relatorio.pdf';
  if (!is_file($f)) { http_response_code(404); echo 'PDF indisponível.'; exit; }
  header_remove('Content-Type'); header('Content-Type: application/pdf');
  header('Content-Disposition: attachment; filename="Relatorio_Deputados_de_Lula_simulacao_2026.pdf"');
  header('Content-Length: ' . filesize($f)); readfile($f); exit;
}
if ($logado) {
  $c = @file_get_contents(__DIR__ . '/_conteudo.html');
  if ($c === false || trim($c) === '') { http_response_code(503); echo 'Relatório temporariamente indisponível.'; exit; }
  echo $c; exit;
}
$login = @file_get_contents(__DIR__ . '/_login.html');
if ($login === false) { http_response_code(503); echo 'Relatório temporariamente indisponível.'; exit; }
echo str_replace('__CONTAS__', $contasAtivas ? '1' : '0', $login);
