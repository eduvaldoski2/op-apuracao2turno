<?php
// Preferências do boletim por e-mail (só logado). GET lê; POST grava. Ativar exige o aceite (consentimento b1).
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
function bsai($d, $cod = 200) { http_response_code($cod); echo json_encode($d, JSON_UNESCAPED_UNICODE); exit; }
try {
  $cfg = __DIR__ . '/../api/config.php'; if (!is_file($cfg)) bsai(['ok' => false, 'mensagem' => 'Indisponível.'], 503);
  require $cfg; require __DIR__ . '/../api/_conta.php'; require __DIR__ . '/_track.php';
  if (!cfg('CONTA_ATIVA', false)) bsai(['ok' => false, 'mensagem' => 'Indisponível.'], 503);
  $u = usuario_atual(); if (!$u) bsai(['ok' => false, 'mensagem' => 'Entre no Radar.'], 401);
  $temEmail = ($u['canal'] === 'email') || !empty($u['email']);
  if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST') {
    $ativo = ($_POST['ativo'] ?? '') === '1'; $ed = (array)($_POST['ed'] ?? []); $reg = (array)($_POST['reg'] ?? []);
    if ($ativo && !$temEmail) bsai(['ok' => false, 'mensagem' => 'Sua conta não tem e-mail cadastrado.'], 400);
    if ($ativo && ($_POST['aceite'] ?? '') !== '1') bsai(['ok' => false, 'mensagem' => 'Marque a caixa de autorização para receber o boletim.'], 400);
    if (!radar_boletim_set((int)$u['id'], $ativo, $ed, $reg)) bsai(['ok' => false, 'mensagem' => $ativo ? 'Escolha ao menos uma editoria ou região.' : 'Não foi possível salvar.'], 400);
    bsai(['ok' => true, 'mensagem' => $ativo ? 'Salvo. Você receberá o boletim todo fim de tarde.' : 'Boletim cancelado.']);
  }
  $p = radar_boletim_get((int)$u['id']); bsai(['ok' => true, 'prefs' => $p, 'email' => $temEmail]);
} catch (Throwable $e) { bsai(['ok' => false, 'mensagem' => 'Erro ao processar.'], 500); }
