<?php
// Radar Oficina Política para o Gabinete Tatiana Roque. Acesso: conta da Oficina Política + autorização do administrador.
// Fail-closed: qualquer falha (sem config, contas desligadas, erro no banco) cai na tela de entrada ou em erro; nunca abre o conteúdo.
header('Content-Type: text/html; charset=utf-8');
header('Cache-Control: private, no-store, max-age=0'); header('Pragma: no-cache');
header('X-Robots-Tag: noindex, nofollow'); header('Referrer-Policy: strict-origin-when-cross-origin');

define('GAB_OK', 1);
$contasAtivas = false; $uAtual = null; $acesso = null; $falha = false;
try {
  $cfg = __DIR__ . '/../api/config.php';
  if (is_file($cfg)) {
    require $cfg; require __DIR__ . '/../api/_conta.php'; require __DIR__ . '/_lib.php'; require __DIR__ . '/_modelo.php';
    $contasAtivas = (bool)cfg('CONTA_ATIVA', false);
    if ($contasAtivas) { $uAtual = usuario_atual(); if ($uAtual) $acesso = gab_acesso($uAtual); }
  }
} catch (Throwable $e) { $falha = true; $uAtual = null; $acesso = null; error_log('gabinete: ' . $e->getMessage()); }

function gab_pagina_simples($titulo, $html) {
  echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>' . htmlspecialchars($titulo) . '</title>'
    . '<body style="margin:0;background:#FBF9F5;font-family:system-ui,sans-serif;color:#1b1530"><div style="max-width:560px;margin:9vh auto;padding:0 20px;text-align:center">'
    . '<img src="/gabinetetatianaroque/img/tatiana-roque.png" alt="Vereadora Tatiana Roque" style="width:220px;max-width:70%"><br><img src="/gabinetetatianaroque/img/radar-cor.png" alt="Radar da Oficina Política" style="width:260px;max-width:80%;margin:14px 0 8px">'
    . $html . '</div></body></html>';
}

if ($falha) { http_response_code(503); gab_pagina_simples('Indisponível', '<p>Radar temporariamente indisponível. Tente novamente em instantes.</p>'); exit; }

if (!$uAtual || !$acesso) {
  $login = @file_get_contents(__DIR__ . '/_login.html');
  if ($login === false) { http_response_code(503); echo 'Radar temporariamente indisponível.'; exit; }
  echo str_replace('__CONTAS__', $contasAtivas ? '1' : '0', $login); exit;
}

if (!(int)$acesso['autorizado']) {
  try { gab_db()->prepare('INSERT OR IGNORE INTO gab_acesso (uid, autorizado, orienta, admin, email, por, ts) VALUES (?, 0, 0, 0, 1, ?, ?)')->execute([(int)$uAtual['id'], 'pedido', time()]); } catch (Throwable $e) {}
  gab_pagina_simples('Aguardando autorização', '<h1 style="font:400 28px Georgia,serif;color:#2A2260;margin:18px 0 8px">Acesso aguardando autorização</h1>'
    . '<p style="font-size:17px;line-height:1.5">Olá, ' . gab_e(explode(' ', trim((string)$uAtual['nome']))[0]) . '. Sua conta da Oficina Política está ativa, mas o Radar do Gabinete Tatiana Roque só abre para pessoas autorizadas pelo gabinete. '
    . 'Avise o administrador para liberar o seu acesso e volte a esta página.</p><p><a href="/" style="color:#3E347E;font-weight:700">Página inicial</a></p>'); exit;
}

// ---- edição pedida (traz do GitHub o que houver de novo, no máximo a cada 5 min) ----
try { require __DIR__ . '/_sync.php'; gab_sync(5); } catch (Throwable $e) {}
$datas = gab_datas(); $hoje = gab_hoje();
$pedida = isset($_GET['d']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$_GET['d']) ? (string)$_GET['d'] : '';
if ($pedida === '' || !in_array($pedida, $datas, true)) {
  $pedida = '';
  foreach ($datas as $d) { if ($d <= $hoje) { $pedida = $d; break; } }     // $datas está em ordem decrescente: a mais recente até hoje
  if ($pedida === '' && $datas) $pedida = $datas[0];
}
$ed = $pedida !== '' ? gab_ed($pedida) : null;
if (!$ed) {
  gab_pagina_simples('Sem edições', '<h1 style="font:400 28px Georgia,serif;color:#2A2260;margin:18px 0 8px">Ainda não há edições</h1><p style="font-size:17px;line-height:1.5">A primeira leitura dos diários acontece às 6h de um dia útil. Volte em breve.</p>'
    . ((int)$acesso['admin'] || (int)$acesso['orienta'] ? '<p><a href="admin.php" style="color:#3E347E;font-weight:700">Administração</a></p>' : '')); exit;
}
$modelo = gab_modelo($ed, gab_config(), gab_orientacoes());
$modelo['datas'] = array_slice($datas, 0, 60);
$modelo['usuario'] = ['nome' => (string)$uAtual['nome'], 'admin' => (int)$acesso['admin'], 'orienta' => (int)$acesso['orienta']];
$v = @filemtime(__DIR__ . '/app.js') . '-' . @filemtime(__DIR__ . '/app.css');
echo '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover"><meta name="robots" content="noindex,nofollow"><meta name="theme-color" content="#3E347E">'
  . '<title>Radar Oficina Política · Gabinete Tatiana Roque · ' . gab_e($modelo['extenso']) . '</title><link rel="icon" type="image/svg+xml" href="/img/favicon.svg">'
  . '<link rel="stylesheet" href="app.css?v=' . $v . '"></head><body><div id="app"><p class="carrega">Carregando…</p></div>'
  . '<script>window.RADAR=' . json_encode($modelo, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_HEX_TAG | JSON_HEX_AMP) . ';</script>'
  . '<script src="/vendor/jspdf.umd.min.js"></script><script src="pdf.js?v=' . $v . '"></script><script src="app.js?v=' . $v . '"></script></body></html>';
