<?php
// Registra um clique de compartilhamento (WhatsApp, e-mail, copiar...) de quem está logado. Resposta sempre 204.
header('Cache-Control: no-store'); http_response_code(204);
try {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') exit;
  $m = (string)($_POST['m'] ?? ''); $c = (string)($_POST['c'] ?? '');
  if (!preg_match('/^[a-z0-9_]{1,40}$/i', $m) || !preg_match('/^(whatsapp|x|facebook|telegram|linkedin|copiar|card)$/', $c)) exit;
  $cfg = __DIR__ . '/../api/config.php'; if (!is_file($cfg)) exit;
  require $cfg; require __DIR__ . '/../api/_conta.php';
  if (!cfg('CONTA_ATIVA', false)) exit;
  $u = usuario_atual(); if (!$u) exit;
  require __DIR__ . '/_track.php'; radar_compartilhou((int)$u['id'], $m, $c);
} catch (Throwable $e) {}
