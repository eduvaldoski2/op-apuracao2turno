<?php
// Radar Oficina Política: página protegida por conta gratuita (a mesma conta do painel). O conteúdo da edição (_edicao.js)
// só é entregue a quem tem sessão válida. Qualquer falha (sem config, contas desligadas, erro no banco) cai na tela de entrada: nunca abre o conteúdo.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: private, no-store, max-age=0');
header('Pragma: no-cache');
header('X-Robots-Tag: noindex, nofollow');
header('Referrer-Policy: strict-origin-when-cross-origin');

$logado = false; $contasAtivas = false; $uAtual = null;
try {
  $cfg = __DIR__ . '/../api/config.php';
  if (is_file($cfg)) {
    require $cfg;
    require __DIR__ . '/../api/_conta.php';
    $contasAtivas = (bool)cfg('CONTA_ATIVA', false);
    if ($contasAtivas) { $uAtual = usuario_atual(); $logado = (bool)$uAtual; }
  }
} catch (Throwable $e) { $logado = false; }

// rastreio de compartilhamento: link com ?r=CODIGO (quem enviou), m=matéria e utm_medium=canal. Nunca derruba a página.
$meuCodigo = '';
try {
  require_once __DIR__ . '/_track.php';
  $ref = (isset($_GET['r']) && preg_match('/^[a-f0-9]{8}$/', (string)$_GET['r'])) ? (string)$_GET['r'] : '';
  $mat = (isset($_GET['m']) && preg_match('/^[a-z0-9_]{1,40}$/i', (string)$_GET['m'])) ? (string)$_GET['m'] : '';
  $can = (isset($_GET['utm_medium']) && preg_match('/^[a-z0-9_]{1,20}$/', (string)$_GET['utm_medium'])) ? (string)$_GET['utm_medium'] : '';
  $ck = ['expires' => time() + 30 * 86400, 'path' => '/radar', 'secure' => !empty($_SERVER['HTTPS']), 'httponly' => true, 'samesite' => 'Lax'];
  if ($uAtual) $meuCodigo = radar_codigo((int)$uAtual['id']);
  if ($ref !== '' && $ref !== $meuCodigo) {
    radar_visita($ref, $mat, $can, $uAtual ? 1 : 0);
    if (!$uAtual) setcookie('op_ref', $ref, $ck);               // guarda por 30 dias só para creditar quem enviou
  }
  if ($uAtual && isset($_COOKIE['op_ref']) && preg_match('/^[a-f0-9]{8}$/', (string)$_COOKIE['op_ref'])) {
    radar_conversao((int)$uAtual['id'], (string)$_COOKIE['op_ref']);
    setcookie('op_ref', '', ['expires' => 1] + $ck);
  }
} catch (Throwable $e) {}

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
  $extra = 'var SHARE_REF=' . json_encode($meuCodigo) . ';var ARQUIVO=' . json_encode($lista) . ';var ARQ_ATUAL=' . json_encode($arq) . ";\n";
  echo str_replace('/*__EDICAO__*/', $extra . $dados, $shell);
  exit;
}

$login = @file_get_contents(__DIR__ . '/_login.html');
if ($login === false) { http_response_code(503); echo 'Radar temporariamente indisponível.'; exit; }
echo str_replace('__CONTAS__', $contasAtivas ? '1' : '0', $login);
