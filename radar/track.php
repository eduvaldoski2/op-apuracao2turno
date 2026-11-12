<?php
// Registra um clique de compartilhamento (WhatsApp, e-mail, copiar...) de quem está logado. Resposta sempre 204.
header('Cache-Control: no-store'); http_response_code(204);
try {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') exit;
  $m = (string)($_POST['m'] ?? ''); $c = (string)($_POST['c'] ?? ''); $t = (string)($_POST['t'] ?? '');
  if (!preg_match('/^[a-z0-9_]{1,64}$/i', $m)) exit;
  if ($t === 'leitura') { $ed = (string)($_POST['e'] ?? ''); $rg = (string)($_POST['g'] ?? ''); if (!preg_match('/^(politica|economia|regioes|mundo)$/', $ed) || !preg_match('/^(|rj|sp|mg|ne|sul|norte|co)$/', $rg) || ($_POST['p'] ?? '') !== '1') exit; }
  elseif (!preg_match('/^(whatsapp|x|facebook|telegram|linkedin|instagram|copiar|card|email)$/', $c)) exit;
  $cfg = __DIR__ . '/../api/config.php'; if (!is_file($cfg)) exit;
  require $cfg; require __DIR__ . '/../api/_conta.php';
  if (!cfg('CONTA_ATIVA', false)) exit;
  $u = usuario_atual(); if (!$u) exit;
  require __DIR__ . '/_track.php';
  if ($t === 'leitura') radar_leitura((int)$u['id'], $m, $ed, $rg); else radar_compartilhou((int)$u['id'], $m, $c);
} catch (Throwable $e) {}
