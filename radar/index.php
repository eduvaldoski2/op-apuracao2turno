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
  // arquivo de edições: radar/arquivo/AAAA-MM-DD-HHh.php (a mais recente é a edição atual)
  $lista = [];
  foreach (glob(__DIR__ . '/arquivo/*.php') ?: [] as $f) { $n = basename($f, '.php'); if (preg_match('/^\d{4}-\d{2}-\d{2}-\d{2}h$/', $n)) $lista[] = $n; }
  rsort($lista);
  $arq = ''; $arquivoEd = __DIR__ . '/_edicao.php';
  $pedido = isset($_GET['ed']) ? (string)$_GET['ed'] : '';
  if ($pedido !== '' && in_array($pedido, $lista, true)) { $arq = $pedido; $arquivoEd = __DIR__ . '/arquivo/' . $pedido . '.php'; }
  ob_start(); $okd = @include $arquivoEd; $dados = ob_get_clean();
  if ($shell === false || !$okd || trim((string)$dados) === '') { http_response_code(503); echo 'Radar temporariamente indisponível.'; exit; }
  $extra = 'var ARQUIVO=' . json_encode($lista) . ';var ARQ_ATUAL=' . json_encode($arq) . ";\n";
  echo str_replace('/*__EDICAO__*/', $extra . $dados, $shell);
  exit;
}

$login = @file_get_contents(__DIR__ . '/_login.html');
if ($login === false) { http_response_code(503); echo 'Radar temporariamente indisponível.'; exit; }
echo str_replace('__CONTAS__', $contasAtivas ? '1' : '0', $login);
