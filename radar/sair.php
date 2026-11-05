<?php
// Descadastro de um clique: boletim (token 'bol') ou bloqueio do endereço que recebeu uma matéria (token 'opt'). Também atende o POST do List-Unsubscribe.
header('Cache-Control: no-store'); header('X-Robots-Tag: noindex, nofollow');
$cfg = __DIR__ . '/../api/config.php'; if (is_file($cfg)) require $cfg; if (is_file(__DIR__ . '/../api/_conta.php')) require_once __DIR__ . '/../api/_conta.php';
require_once __DIR__ . '/_email.php';
$t = radar_untok((string)($_GET['t'] ?? '')); $ok = false; $quem = '';
if ($t && ($t['t'] ?? '') === 'bol' && isset($t['u'])) { $ok = radar_boletim_cancelar((int)$t['u']); $quem = 'bol'; }
elseif ($t && ($t['t'] ?? '') === 'opt' && isset($t['h'])) { $ok = radar_optout_hash((string)$t['h']); $quem = 'opt'; }
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') { http_response_code($ok ? 200 : 400); exit; }
$msg = !$ok ? 'Este link não é válido ou expirou. Para parar de receber e-mails, escreva para contato@oficinapolitica.com.br e atendemos seu pedido.'
  : ($quem === 'bol' ? 'Pronto: você não receberá mais o boletim do Radar. Se foi sem querer, entre no Radar e ative de novo em “Boletim”.' : 'Pronto: este endereço não receberá mais e-mails do Radar enviados por indicação.');
echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex"><title>Cancelamento · Radar da Oficina Política</title>'
  . '<body style="margin:0;background:#FBF9F5;font-family:system-ui,sans-serif;color:#1b1530"><div style="max-width:520px;margin:12vh auto;padding:0 20px"><div style="font:400 30px Georgia,serif;color:#3E347E">' . ($ok ? 'Cancelamento feito' : 'Link inválido') . '</div>'
  . '<p style="font-size:17px;line-height:1.5">' . htmlspecialchars($msg) . '</p><p><a href="/radar/" style="color:#3E347E;font-weight:700">Ir para o Radar</a></p></div></body></html>';
