<?php
// Compartilhar uma matéria por e-mail (só logado). O endereço do destinatário é usado só para este envio e NÃO é guardado.
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
function rsai($ok, $msg, $cod = 200) { http_response_code($cod); echo json_encode(['ok' => $ok, 'mensagem' => $msg], JSON_UNESCAPED_UNICODE); exit; }
try {
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') rsai(false, 'Método inválido.', 405);
  $cfg = __DIR__ . '/../api/config.php'; if (!is_file($cfg)) rsai(false, 'Indisponível.', 503);
  require $cfg; require __DIR__ . '/../api/_conta.php'; require __DIR__ . '/_email.php';
  if (!cfg('CONTA_ATIVA', false)) rsai(false, 'Indisponível.', 503);
  $u = usuario_atual(); if (!$u) rsai(false, 'Entre no Radar para enviar.', 401);
  $m = (string)($_POST['m'] ?? ''); $para = trim((string)($_POST['para'] ?? '')); $msg = trim(strip_tags((string)($_POST['msg'] ?? '')));
  $msg = mb_substr(preg_replace('/\s+/u', ' ', $msg), 0, 200);
  if (!preg_match('/^[a-z0-9_]{1,40}$/i', $m)) rsai(false, 'Matéria inválida.', 400);
  if (!filter_var($para, FILTER_VALIDATE_EMAIL) || strlen($para) > 120) rsai(false, 'Digite um e-mail válido.', 400);
  $raw = @file_get_contents(__DIR__ . '/_publico.php'); $pub = json_decode(substr((string)$raw, (int)strpos((string)$raw, "\n") + 1), true);
  if (!is_array($pub) || !isset($pub[$m])) rsai(false, 'Matéria não encontrada.', 404);
  if (radar_email_bloqueado($para)) rsai(false, 'Esse endereço pediu para não receber e-mails do Radar.', 409);
  if (!taxa_ok('rmail:' . (int)$u['id'], 10, 86400) || !taxa_ok('rmailip:' . ip_hash(), 30, 86400)) rsai(false, 'Limite diário de envios atingido. Tente amanhã.', 429);
  $nome = trim(explode(' ', trim((string)$u['nome']))[0]) ?: 'Alguém';
  $cod = radar_codigo((int)$u['id']);
  $link = RADAR_SITE . '/radar/?' . ($cod !== '' ? 'r=' . $cod . '&' : '') . 'm=' . rawurlencode($m) . '&utm_source=radar&utm_medium=email&utm_campaign=compartilhar#materia-' . rawurlencode($m);
  $urlSair = radar_url_sair(['t' => 'opt', 'h' => radar_email_hash($para)]);
  $ok = radar_mail($para, $nome . ' compartilhou com você: ' . $pub[$m]['t'], radar_texto_compartilhar($pub[$m], $nome, $msg, $link, $urlSair), radar_html_compartilhar($pub[$m], $nome, $msg, $link, $urlSair), $urlSair);
  if (!$ok) rsai(false, 'Não foi possível enviar agora. Tente novamente em instantes.', 502);
  radar_compartilhou((int)$u['id'], $m, 'email');
  rsai(true, 'Enviado.');
} catch (Throwable $e) { rsai(false, 'Não foi possível enviar agora.', 500); }
