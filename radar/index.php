<?php
// Radar Oficina Política: página protegida por conta gratuita (a mesma conta do painel). O conteúdo da edição (_edicao.js)
// só é entregue a quem tem sessão válida. Qualquer falha (sem config, contas desligadas, erro no banco) cai na tela de entrada: nunca abre o conteúdo.
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

if ($logado) {
  $shell = @file_get_contents(__DIR__ . '/_shell.html');
  define('RADAR_OK', 1);
  ob_start(); $okd = @include __DIR__ . '/_edicao.php'; $dados = ob_get_clean();
  if ($shell === false || !$okd || trim((string)$dados) === '') { http_response_code(503); echo 'Radar temporariamente indisponível.'; exit; }
  echo str_replace('/*__EDICAO__*/', $dados, $shell);
  exit;
}

$login = @file_get_contents(__DIR__ . '/_login.html');
if ($login === false) { http_response_code(503); echo 'Radar temporariamente indisponível.'; exit; }
echo str_replace('__CONTAS__', $contasAtivas ? '1' : '0', $login);
