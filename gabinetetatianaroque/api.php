<?php
// API da administração do Radar do Gabinete (JSON). Exige sessão de administrador/orientador e o cabeçalho X-Gab-CSRF.
header('X-Robots-Tag: noindex, nofollow');
define('GAB_OK', 1);
try {
  $cfg = __DIR__ . '/../api/config.php'; if (!is_file($cfg)) { http_response_code(503); exit; }
  require $cfg; require __DIR__ . '/../api/_conta.php'; require __DIR__ . '/_lib.php'; require __DIR__ . '/_modelo.php';
  if (!cfg('CONTA_ATIVA', false)) { gab_json(['ok' => false, 'erro' => 'indisponivel'], 503); }
  $ctx = gab_ctx();
  if (!$ctx) gab_json(['ok' => false, 'erro' => 'sem_acesso'], 403);
  if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') gab_json(['ok' => false, 'erro' => 'metodo'], 405);
  if (!gab_csrf_ok()) gab_json(['ok' => false, 'erro' => 'csrf'], 403);
  $in = json_decode((string)file_get_contents('php://input'), true); if (!is_array($in)) gab_json(['ok' => false, 'erro' => 'json'], 400);
  $a = (string)($in['a'] ?? ''); $db = gab_db();
  $txt = fn($k, $n) => mb_substr(trim((string)($in[$k] ?? '')), 0, $n);
  $bool = fn($k) => !empty($in[$k]) ? 1 : 0;

  // orientação de voto: administrador ou assessor com a permissão "orienta"
  if ($a === 'orient_salvar') {
    $chave = $txt('chave', 160); $voto = $txt('voto', 20); $com = $txt('comentario', 2000);
    if ($chave === '' || !preg_match('/^[A-Za-z0-9 \.\-\/\|ªºãáâéêíóôõúçÃÁÂÉÊÍÓÔÕÚÇ_]+$/u', $chave)) gab_json(['ok' => false, 'erro' => 'chave'], 400);
    if ($voto === '') { $db->prepare('DELETE FROM gab_orient WHERE chave = ?')->execute([$chave]); gab_json(['ok' => true, 'removida' => true]); }
    if (!isset(GAB_VOTOS[$voto])) gab_json(['ok' => false, 'erro' => 'voto'], 400);
    $db->prepare('INSERT INTO gab_orient (chave, voto, comentario, uid, nome, ts, rotulo) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(chave) DO UPDATE SET voto = excluded.voto, comentario = excluded.comentario, uid = excluded.uid, nome = excluded.nome, ts = excluded.ts, rotulo = excluded.rotulo')
       ->execute([$chave, $voto, $com, $ctx['uid'], $ctx['nome'], time(), $txt('rotulo', 300)]);
    gab_json(['ok' => true]);
  }

  if (!$ctx['admin']) gab_json(['ok' => false, 'erro' => 'so_admin'], 403);
  switch ($a) {
    case 'usuario_salvar': {
      $uid = (int)($in['uid'] ?? 0); if ($uid <= 0) gab_json(['ok' => false, 'erro' => 'uid'], 400);
      $ex = conta_db()->prepare("SELECT id FROM usuarios WHERE id = ? AND status = 'ativo'"); $ex->execute([$uid]); if (!$ex->fetch()) gab_json(['ok' => false, 'erro' => 'usuario'], 404);
      $adm = $bool('admin'); $aut = $adm ? 1 : $bool('autorizado'); $ori = $adm ? 1 : $bool('orienta');
      if ($ctx['uid'] === $uid && !$adm && $ctx['via'] === 'conta') {   // não deixa o último administrador se rebaixar sem querer
        $n = (int)$db->query('SELECT COUNT(*) FROM gab_acesso WHERE admin = 1 AND uid <> ' . $uid)->fetchColumn(); if ($n === 0) gab_json(['ok' => false, 'erro' => 'ultimo_admin', 'mensagem' => 'Você é o único administrador; marque outro antes de remover o seu.'], 409);
      }
      $db->prepare('INSERT INTO gab_acesso (uid, autorizado, orienta, admin, email, por, ts) VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(uid) DO UPDATE SET autorizado = excluded.autorizado, orienta = excluded.orienta, admin = excluded.admin, email = excluded.email, por = excluded.por, ts = excluded.ts')
         ->execute([$uid, $aut, $ori, $adm, $bool('email'), $ctx['nome'], time()]);
      gab_json(['ok' => true, 'autorizado' => $aut, 'orienta' => $ori, 'admin' => $adm]);
    }
    case 'pl_salvar': {
      $ref = gab_ref_norm($txt('ref', 40)); if (!$ref) gab_json(['ok' => false, 'erro' => 'ref', 'mensagem' => 'Use o formato PL 1234/2026 (também PLC, PR, PDL, PELO).'], 400);
      $id = (int)($in['id'] ?? 0);
      if ($id) $db->prepare('UPDATE gab_pls SET ref = ?, apelido = ?, nota = ?, area = ?, ativo = ? WHERE id = ?')->execute([$ref, $txt('apelido', 120), $txt('nota', 600), $txt('area', 120), $bool('ativo'), $id]);
      else $db->prepare('INSERT INTO gab_pls (ref, apelido, nota, area, ativo, criado) VALUES (?, ?, ?, ?, 1, ?) ON CONFLICT(ref) DO UPDATE SET apelido = excluded.apelido, nota = excluded.nota, area = excluded.area, ativo = 1')->execute([$ref, $txt('apelido', 120), $txt('nota', 600), $txt('area', 120), time()]);
      gab_json(['ok' => true]);
    }
    case 'pl_excluir': $db->prepare('DELETE FROM gab_pls WHERE id = ?')->execute([(int)($in['id'] ?? 0)]); gab_json(['ok' => true]);
    case 'tema_salvar': {
      $nome = $txt('nome', 120); $termos = mb_substr(trim((string)($in['termos'] ?? '')), 0, 2000); if ($nome === '' || $termos === '') gab_json(['ok' => false, 'erro' => 'tema', 'mensagem' => 'Informe o nome e ao menos um termo.'], 400);
      $id = (int)($in['id'] ?? 0);
      if ($id) $db->prepare('UPDATE gab_temas SET nome = ?, termos = ?, area = ?, ativo = ? WHERE id = ?')->execute([$nome, $termos, $txt('area', 120), $bool('ativo'), $id]);
      else $db->prepare('INSERT INTO gab_temas (nome, termos, area, ativo) VALUES (?, ?, ?, 1)')->execute([$nome, $termos, $txt('area', 120)]);
      gab_json(['ok' => true]);
    }
    case 'tema_excluir': $db->prepare('DELETE FROM gab_temas WHERE id = ?')->execute([(int)($in['id'] ?? 0)]); gab_json(['ok' => true]);
    case 'area_salvar': { $n = $txt('nome', 120); if ($n === '') gab_json(['ok' => false, 'erro' => 'nome'], 400); $db->prepare('INSERT OR IGNORE INTO gab_areas (nome, ordem) VALUES (?, (SELECT COALESCE(MAX(ordem), 0) + 1 FROM gab_areas))')->execute([$n]); gab_json(['ok' => true]); }
    case 'area_excluir': $db->prepare('DELETE FROM gab_areas WHERE nome = ?')->execute([$txt('nome', 120)]); gab_json(['ok' => true]);
    default: gab_json(['ok' => false, 'erro' => 'acao'], 400);
  }
} catch (Throwable $e) { error_log('gabinete api: ' . $e->getMessage()); gab_json(['ok' => false, 'erro' => 'interno'], 500); }
