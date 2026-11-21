<?php
// Descadastro de um clique do e-mail das 7h do Radar do Gabinete (também atende o POST do List-Unsubscribe).
header('Cache-Control: no-store'); header('X-Robots-Tag: noindex, nofollow');
define('GAB_OK', 1);
$ok = false;
try {
  $raiz = dirname(__DIR__); $cfg = $raiz . '/api/config.php';
  if (is_file($cfg)) { require $cfg; require $raiz . '/api/_conta.php'; require __DIR__ . '/_lib.php'; require_once $raiz . '/radar/_email.php';
    $t = radar_untok((string)($_GET['t'] ?? ''));
    if ($t && ($t['t'] ?? '') === 'gab' && isset($t['u'])) { gab_db()->prepare('INSERT INTO gab_acesso (uid, autorizado, orienta, admin, email, por, ts) VALUES (?, 0, 0, 0, 0, ?, ?) ON CONFLICT(uid) DO UPDATE SET email = 0')->execute([(int)$t['u'], 'descadastro', time()]); $ok = true; }
  }
} catch (Throwable $e) { $ok = false; }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') { http_response_code($ok ? 200 : 400); exit; }
$msg = $ok ? 'Pronto: você não receberá mais o e-mail diário do Radar do Gabinete. Seu acesso ao site continua como estava.' : 'Este link não é válido ou expirou. Escreva para contato@oficinapolitica.com.br e atendemos seu pedido.';
echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Cancelamento · Radar do Gabinete</title><body style="margin:0;background:#FBF9F5;font-family:system-ui,sans-serif;color:#1b1530"><div style="max-width:520px;margin:12vh auto;padding:0 20px"><p style="font-size:17px;line-height:1.5">' . htmlspecialchars($msg) . '</p><p><a href="./" style="color:#3E347E;font-weight:700">Ir para o Radar</a></p></div></body></html>';
