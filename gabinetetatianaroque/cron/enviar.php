<?php
// E-mail das 7h do Radar do Gabinete Tatiana Roque. Rodar SÓ pelo cron da Hostinger (CLI), a cada 5 minutos das 7h às 10h em dias úteis:
//   */5 7-9 * * 1-5  php /caminho/do/site/gabinetetatianaroque/cron/enviar.php
//   php .../enviar.php --seco                    (confere e mostra quem receberia; não envia)
//   php .../enviar.php --teste=voce@email.com    (envia uma amostra a um endereço; não registra envio)
//   php .../enviar.php --data=2026-11-19 --forca (reenvia/envia uma data específica)
// Regras: traz as edições do GitHub; só envia se já existir o Radar do dia (com os dois diários, ou a partir das 9h30 com o que houver);
// cada pessoa recebe no máximo um e-mail por dia; só quem tem acesso autorizado e o e-mail ligado; remetente = caixa da Oficina Política (CONTA['email_de']).
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
error_reporting(E_ALL); date_default_timezone_set('America/Sao_Paulo');
define('GAB_OK', 1);
$raiz = dirname(__DIR__, 2); $dirDados = dirname(__DIR__) . '/dados'; if (!is_dir($dirDados)) @mkdir($dirDados, 0755, true);
$LOG = $dirDados . '/enviar.log';
function glog($m) { global $LOG; @file_put_contents($LOG, date('Y-m-d H:i:s') . ' ' . $m . "\n", FILE_APPEND | LOCK_EX); if (is_file($LOG) && filesize($LOG) > 150000) { $l = @file($LOG); if ($l) @file_put_contents($LOG, implode('', array_slice($l, -300)), LOCK_EX); } echo $m . "\n"; }
$tr = @fopen($dirDados . '/enviar.lock', 'c'); if ($tr && !@flock($tr, LOCK_EX | LOCK_NB)) { echo "outra execução em andamento\n"; exit(0); }
ini_set('log_errors', '1'); ini_set('error_log', $LOG);

$opt = []; foreach (array_slice($argv, 1) as $a) { if (preg_match('/^--([a-z]+)(?:=(.*))?$/', $a, $m)) $opt[$m[1]] = $m[2] ?? true; }
$cfg = $raiz . '/api/config.php'; if (!is_file($cfg)) { glog('sem api/config.php'); exit(1); }
require $cfg; require $raiz . '/api/_conta.php'; require dirname(__DIR__) . '/_lib.php'; require dirname(__DIR__) . '/_modelo.php'; require dirname(__DIR__) . '/_sync.php'; require dirname(__DIR__) . '/_emailgab.php';
require_once $raiz . '/radar/_email.php';   // radar_mail (SMTP da caixa da Oficina Política) e radar_tok

try {
  $agora = gab_agora(); $hoje = $agora->format('Y-m-d'); $data = (string)($opt['data'] ?? $hoje);
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $data)) { glog('data inválida'); exit(1); }
  $s = gab_sync(0); glog('sync: ' . (count($s['baixadas']) ? 'baixou ' . implode(',', $s['baixadas']) : 'nada novo') . ($s['erro'] ? ' (' . $s['erro'] . ')' : ''));
  $ed = gab_ed($data);
  if (!$ed) { glog("sem Radar para $data ainda"); exit(0); }
  if (empty($ed['tem_edicao'])) { glog("$data sem edições dos diários (fim de semana/feriado): nada a enviar"); exit(0); }
  $hm = (int)$agora->format('Hi'); $forca = isset($opt['forca']) || isset($opt['teste']);
  if (!$forca && $data === $hoje) {
    if ($hm < 700) { glog('ainda antes das 7h'); exit(0); }
    $prontos = !empty($ed['fontes']['dcm']['ok']) && !empty($ed['fontes']['do']['ok']);
    if (!$prontos && $hm < 930) { glog('aguardando os dois diários (envia às 9h30 com o que houver)'); exit(0); }
    if ($hm > 1300) { glog('passou da janela de envio (13h)'); exit(0); }
  }
  $modelo = gab_modelo($ed, gab_config(), gab_orientacoes());
  $n = count(array_filter($modelo['mandato'], fn($i) => ($i['prio'] ?? '') === 'acao' && ($i['tipo'] ?? '') !== 'citacao'));
  $assunto = 'Radar do Gabinete Tatiana Roque — ' . implode('/', array_slice(array_reverse(explode('-', $data)), 0, 2)) . ($n ? ' · ' . $n . ' item(ns) pedem ação' : '');

  if (isset($opt['teste']) && $opt['teste'] !== true) {
    $para = (string)$opt['teste']; [$html, $txt] = gab_email_html($modelo, GAB_SITE . '/' . GAB_SLUG . '/');
    $ok = radar_mail($para, '[TESTE] ' . $assunto, $txt, $html, GAB_SITE . '/' . GAB_SLUG . '/'); glog('teste para ' . $para . ': ' . ($ok ? 'ok' : 'FALHOU')); exit($ok ? 0 : 1);
  }

  $db = gab_db(); $cdb = conta_db();
  $rs = $db->query('SELECT uid FROM gab_acesso WHERE autorizado = 1 AND email = 1')->fetchAll(PDO::FETCH_COLUMN);
  $enviou = [];
  $st = $db->prepare('SELECT uid FROM gab_envios WHERE data = ? AND ok = 1'); $st->execute([$data]); foreach ($st->fetchAll(PDO::FETCH_COLUMN) as $u) $enviou[(int)$u] = 1;
  $fila = []; foreach ($rs as $uid) { if (isset($enviou[(int)$uid])) continue; $q = $cdb->prepare("SELECT * FROM usuarios WHERE id = ? AND status = 'ativo'"); $q->execute([(int)$uid]); $u = $q->fetch(); if ($u && ($em = gab_email_de($u))) $fila[] = [$u, $em]; }
  glog("$data: " . count($rs) . ' autorizados com e-mail ligado; ' . count($enviou) . ' já receberam; ' . count($fila) . ' a enviar');
  if (isset($opt['seco'])) { foreach ($fila as [$u, $em]) glog('  receberia: ' . $u['nome'] . ' <' . $em . '>'); exit(0); }
  foreach ($fila as [$u, $em]) {
    $sair = GAB_SITE . '/' . GAB_SLUG . '/sair.php?t=' . radar_tok(['t' => 'gab', 'u' => (int)$u['id']]);
    [$html, $txt] = gab_email_html($modelo, $sair);
    $ok = false; try { $ok = (bool)radar_mail($em, $assunto, $txt, $html, $sair); } catch (Throwable $e) { glog('erro ao enviar a ' . $u['id'] . ': ' . $e->getMessage()); }
    $db->prepare('INSERT INTO gab_envios (data, uid, ts, ok) VALUES (?, ?, ?, ?) ON CONFLICT(data, uid) DO UPDATE SET ts = excluded.ts, ok = excluded.ok')->execute([$data, (int)$u['id'], time(), $ok ? 1 : 0]);
    glog('  ' . $u['nome'] . ': ' . ($ok ? 'enviado' : 'FALHOU (tenta de novo na próxima rodada)'));
    usleep(400000);
  }
  @file_put_contents($dirDados . '/enviar_status.json', json_encode(['data' => $data, 'ts' => time(), 'enviados' => count($fila)]));
} catch (Throwable $e) { glog('ERRO: ' . $e->getMessage()); exit(1); }
