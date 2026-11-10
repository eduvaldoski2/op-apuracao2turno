<?php
// Radar da Oficina Política: página protegida por conta gratuita (a mesma conta do painel). O conteúdo da edição (_edicao.js)
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
    $convNova = radar_conversao((int)$uAtual['id'], (string)$_COOKIE['op_ref']);
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
  $extra = 'var CONV_NOVA=' . (!empty($convNova) ? 'true' : 'false') . ';var SHARE_REF=' . json_encode($meuCodigo) . ';var ARQUIVO=' . json_encode($lista) . ';var ARQ_ATUAL=' . json_encode($arq) . ";\n";
  echo str_replace('/*__EDICAO__*/', $extra . $dados, $shell);
  exit;
}

// matéria compartilhada: quem chega por um link com código de quem enviou lê a matéria sem conta, com convite para criar a conta
$prevHtml = ''; $og = '';
try {
  if (!empty($ref) && !empty($mat) && radar_codigo_existe($ref)) {
    define('RADAR_OK', 1); ob_start(); $okp = @include __DIR__ . '/_publico.php'; $pj = ob_get_clean();
    $pub = $okp ? json_decode((string)$pj, true) : null;
    if (is_array($pub) && isset($pub[$mat]) && is_array($pub[$mat])) {
      $s = $pub[$mat]; $e = fn($x) => htmlspecialchars((string)$x, ENT_QUOTES, 'UTF-8');
      $corpo = '';
      foreach ((array)($s['fundo'] ?? []) as $b) {
        if (!is_array($b) || !isset($b[0])) continue;
        if ($b[0] === 'video' && is_array($b[1] ?? null) && preg_match('/^[\w-]{11}$/', (string)($b[1]['id'] ?? ''))) $corpo .= '<p><a href="https://youtu.be/' . $e($b[1]['id']) . '" target="_blank" rel="noopener">▶ Assistir ao vídeo: ' . $e($b[1]['t'] ?? 'vídeo') . '</a></p>';
        elseif ($b[0] === 'p') $corpo .= '<p>' . $e($b[1] ?? '') . '</p>';
        elseif ($b[0] === 'h') $corpo .= '<h3>' . $e($b[1] ?? '') . '</h3>';
        elseif ($b[0] === 'ul') { $corpo .= '<ul>'; foreach ((array)($b[1] ?? []) as $li) $corpo .= '<li>' . $e($li) . '</li>'; $corpo .= '</ul>'; }
        elseif ($b[0] === 'tl') { $corpo .= '<ul>'; foreach ((array)($b[1] ?? []) as $li) if (is_array($li)) $corpo .= '<li><b>' . $e($li[0] ?? '') . '</b> ' . $e($li[1] ?? '') . '</li>'; $corpo .= '</ul>'; }
      }
      $fontes = ''; foreach ((array)($s['fontes'] ?? []) as $f) if (is_array($f) && !empty($f[1]) && preg_match('#^https?://#', $f[1])) $fontes .= '<a href="' . $e($f[1]) . '" target="_blank" rel="noopener nofollow">' . $e($f[0] ?? 'Fonte') . '</a> ';
      $prevHtml = '<article class="prev"><span class="kk">' . $e($s['k'] ?? 'Radar') . '</span><h2>' . $e($s['t'] ?? '') . '</h2><p class="sub">' . $e($s['sub'] ?? '') . '</p>' . $corpo
        . ($fontes ? '<p class="fts"><b>Fontes:</b> ' . $fontes . '</p>' : '')
        . '<div class="cta"><b>Gostou? Crie sua conta gratuita e leia o Radar completo.</b><br>Política, economia, regiões e mundo, em quatro edições por dia, com as fontes à vista.</div></article>';
      $og = '<meta property="og:type" content="article"><meta property="og:site_name" content="Radar da Oficina Política"><meta property="og:title" content="' . $e($s['t'] ?? '') . '"><meta property="og:description" content="' . $e($s['sub'] ?? '') . '"><meta property="og:image" content="https://oficinapolitica.com.br/img/og-radar.jpg?v=2"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">';
    }
  }
  if ($og === '') $og = '<meta property="og:type" content="website"><meta property="og:site_name" content="Radar da Oficina Política"><meta property="og:title" content="Radar da Oficina Política"><meta property="og:description" content="Notícias de política, economia, regiões e mundo, em quatro edições por dia, com as fontes à vista."><meta property="og:image" content="https://oficinapolitica.com.br/img/og-radar.jpg?v=2"><meta property="og:image:type" content="image/jpeg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="630"><meta name="twitter:card" content="summary_large_image">';
} catch (Throwable $e2) { $prevHtml = ''; $og = ''; }
$login = @file_get_contents(__DIR__ . '/_login.html');
if ($login === false) { http_response_code(503); echo 'Radar temporariamente indisponível.'; exit; }
$login = str_replace(['<!--__MATERIA__-->', '<!--__OG__-->', '__PREVIEW__', '__INTRO__'], [$prevHtml, $og, $prevHtml !== '' ? '1' : '0', $prevHtml !== '' ? 'display:none' : 'display:contents'], $login);
echo str_replace('__CONTAS__', $contasAtivas ? '1' : '0', $login);
