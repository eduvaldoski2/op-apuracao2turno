<?php
// Envio do boletim diário. Rodar SÓ pelo cron da Hostinger (a cada 15 min; ele mesmo decide se é hora de enviar):
//   php /caminho/do/site/radar/cron/boletim.php            (envia, se for a hora)
//   php .../boletim.php --seco                              (só conta e confere, não envia)
//   php .../boletim.php --teste=seu@email.com               (envia uma amostra a um endereço, sem tocar na lista)
// Não roda pela web. Regras:
//  - o boletim é o RESUMO DO DIA (junta todas as edições do dia, ver radar/tools/resumo_dia.cjs). Sai quando a edição das 19h é publicada,
//    no próprio dia; se a das 19h não sair, sai às 21h com o que o dia tiver (ou, se o cron tiver falhado, até as 12h do dia seguinte);
//  - cada pessoa recebe no máximo uma vez por edição; quem falhou é tentado de novo na próxima rodada (até 8 rodadas);
//  - TUDO fica registrado em radar/dados/boletim.log (erros do SMTP, destinatários, resultado) e o último estado em
//    radar/dados/boletim_status.json. A pasta dados/ não é acessível pela web.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
error_reporting(E_ALL);
date_default_timezone_set('America/Sao_Paulo');
$raiz = dirname(__DIR__, 2); $cfg = $raiz . '/api/config.php';
$dirDados = dirname(__DIR__) . '/dados'; if (!is_dir($dirDados)) @mkdir($dirDados, 0755, true);
$LOG = $dirDados . '/boletim.log'; $STATUS = $dirDados . '/boletim_status.json';
$MARCA = $dirDados . '/boletim_enviado.txt';        // dia (aaaa-mm-dd) da última edição enviada a todos
$PARCIAL = $dirDados . '/boletim_parcial.json';     // quem já recebeu a edição em andamento
ini_set('log_errors', '1'); ini_set('error_log', $LOG);   // error_log() do SMTP (ex.: "SMTP 535 ...") cai no mesmo log

function blog($m) {
  global $LOG; @file_put_contents($LOG, date('Y-m-d H:i:s') . ' ' . $m . "\n", FILE_APPEND | LOCK_EX);
  if (is_file($LOG) && filesize($LOG) > 200000) { $l = @file($LOG); if ($l) @file_put_contents($LOG, implode('', array_slice($l, -400)), LOCK_EX); }
}
register_shutdown_function(function () {
  $e = error_get_last();
  if ($e && in_array($e['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR, E_USER_ERROR], true)) blog('ERRO FATAL: ' . $e['message'] . ' em ' . basename($e['file']) . ':' . $e['line']);
});
set_exception_handler(function ($ex) { blog('EXCEÇÃO: ' . get_class($ex) . ': ' . $ex->getMessage() . ' em ' . basename($ex->getFile()) . ':' . $ex->getLine()); fwrite(STDERR, "exceção: " . $ex->getMessage() . "\n"); exit(1); });

$st = ['rodou' => date('c'), 'php' => PHP_VERSION];
function salva_status($st) { global $STATUS; @file_put_contents($STATUS, json_encode($st, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), LOCK_EX); }
function termina($st, $msg, $cod = 0, $log = false) {
  global $STATUS; $ant = is_file($STATUS) ? (json_decode((string)@file_get_contents($STATUS), true) ?: []) : [];
  $st['resultado'] = $msg; salva_status($st);
  if ($log || ($ant['resultado'] ?? '') !== $msg) blog($msg);   // mensagens repetidas (rodadas ociosas) não enchem o log
  fwrite($cod ? STDERR : STDOUT, $msg . "\n"); exit($cod);
}

if (!is_file($cfg)) termina($st, 'sem api/config.php', 1, true);
require $cfg; require $raiz . '/api/_conta.php'; require dirname(__DIR__) . '/_email.php';
$args = array_slice($argv, 1); $seco = in_array('--seco', $args, true); $teste = ''; $nomeTeste = 'Amostra';
foreach ($args as $a) { if (str_starts_with($a, '--teste=')) $teste = substr($a, 8); if (str_starts_with($a, '--nome=')) $nomeTeste = substr($a, 7); }
$sm = cfg('CONTA', [])['smtp'] ?? []; $st['smtp_configurado'] = (!empty($sm['host']) && !empty($sm['user']) && !empty($sm['pass'])); $st['envio_por'] = $st['smtp_configurado'] ? 'smtp' : 'mail()';

$d = rc_dados(); if (!$d) termina($st, 'sem dados da edição (radar/_dados_email.php)', 1, true);
$dia = (string)($d['dia'] ?? ''); $hora = (string)($d['hora'] ?? ''); $st['edicao'] = "$dia $hora";
$hoje = date('Y-m-d'); $ontem = date('Y-m-d', strtotime('-1 day'));
$naJanela = ($dia === $hoje && ($hora === '19h' || (int)date('G') >= 21)) || ($dia === $ontem && (int)date('G') < 12);
$st['edicoes_do_dia'] = $d['edicoes'] ?? [];
$marcado = is_file($MARCA) ? trim((string)file_get_contents($MARCA)) : '';
$jaEnviado = ($marcado === $dia); $st['ultimo_envio_completo'] = $marcado ?: null;

$rdb = radar_db(); if (!$rdb) termina($st, 'banco do Radar indisponível (sem escrita em radar/dados ou sem pdo_sqlite)', 1, true);

// destinatários (sempre calcula, para o status mostrar se há para quem enviar)
$alvos = []; $cont = ['inscritos_ativos' => 0, 'sem_conta_ativa' => 0, 'sem_email_valido' => 0, 'bloqueados' => 0];
if ($teste) { $alvos[] = ['uid' => 0, 'nome' => $nomeTeste, 'email' => $teste, 'prefs' => ['ed' => ['politica', 'economia', 'mundo'], 'reg' => ['rj', 'sp', 'mg', 'ne']]]; }
else {
  $cdb = conta_db();
  foreach ($rdb->query('SELECT uid, ed, reg FROM boletim WHERE ativo = 1')->fetchAll(PDO::FETCH_ASSOC) as $b) {
    $cont['inscritos_ativos']++;
    $s = $cdb->prepare("SELECT id, nome, canal, contato, email FROM usuarios WHERE id = ? AND status = 'ativo'"); $s->execute([(int)$b['uid']]); $u = $s->fetch(PDO::FETCH_ASSOC);
    if (!$u) { $cont['sem_conta_ativa']++; continue; }
    $em = $u['canal'] === 'email' ? $u['contato'] : ($u['email'] ?? '');
    if (!filter_var($em, FILTER_VALIDATE_EMAIL)) { $cont['sem_email_valido']++; continue; }
    if (radar_email_bloqueado($em)) { $cont['bloqueados']++; continue; }
    $alvos[] = ['uid' => (int)$u['id'], 'nome' => mb_convert_case(trim(explode(' ', trim((string)$u['nome']))[0]), MB_CASE_TITLE, 'UTF-8') ?: 'leitor', 'email' => $em, 'prefs' => ['ed' => array_filter(explode(',', (string)$b['ed'])), 'reg' => array_filter(explode(',', (string)$b['reg']))]];
  }
}
$st['destinatarios'] = count($alvos) + 0; $st['contagem'] = $cont;
// confere que o boletim consegue ser montado (pega erro de montagem antes da hora do envio)
$sel0 = $alvos ? radar_boletim_montar($d, $alvos[0]['prefs']) : null; $st['montagem_ok'] = $sel0 ? (bool)$sel0['destaque'] : null;

if ($seco) termina($st, count($alvos) . ' destinatário(s); inscritos ativos ' . $cont['inscritos_ativos'] . '; edição ' . $st['edicao'] . '; envio por ' . $st['envio_por'] . '; modo seco, nada enviado');
if (!$teste) {
  if (!$naJanela) termina($st, "aguardando: a última edição é {$st['edicao']} (o resumo do dia sai com a edição das 19h, ou às 21h se ela não sair); nada enviado");
  if ($jaEnviado) termina($st, "boletim de $dia já enviado a todos");
}

// ---- envio ----
$par = ['dia' => $dia, 'enviados' => [], 'rodadas' => 0];
if (!$teste && is_file($PARCIAL)) { $p = json_decode((string)@file_get_contents($PARCIAL), true); if (is_array($p) && ($p['dia'] ?? '') === $dia) $par = $p + $par; }
if (!$teste && $par['rodadas'] >= 8) termina($st, "desisti do boletim de $dia depois de 8 rodadas com falha (veja o log); nada enviado");
if (!$teste && !$alvos) termina($st, "nenhum destinatário para o boletim de $dia (inscritos ativos: {$cont['inscritos_ativos']}; sem conta ativa: {$cont['sem_conta_ativa']}; sem e-mail válido: {$cont['sem_email_valido']}; bloqueados: {$cont['bloqueados']})");
if (!$teste) { $par['rodadas']++; @file_put_contents($PARCIAL, json_encode($par), LOCK_EX); }
blog("enviando o boletim de $dia (" . ($teste ? 'teste' : "rodada {$par['rodadas']}") . ') para ' . count($alvos) . ' destinatário(s) por ' . $st['envio_por']);
$ok = 0; $falha = 0; $pend = 0;
foreach ($alvos as $a) {
  if (!$teste && in_array($a['uid'], $par['enviados'], true)) continue;   // já recebeu nesta edição
  $sel = radar_boletim_montar($d, $a['prefs']); if (!$sel['destaque']) { if (!$teste) $par['enviados'][] = $a['uid']; continue; }
  $sair = radar_url_sair(['t' => 'bol', 'u' => $a['uid']]);
  $assunto = 'Resumo do dia · ' . $d['data'] . ' · Radar da Oficina Política';
  if (radar_mail($a['email'], $assunto, radar_texto_boletim($d, $sel, $a['nome'], $sair), radar_html_boletim($d, $sel, $a['nome'], $a['prefs'], $sair), $sair)) { $ok++; if (!$teste) { $par['enviados'][] = $a['uid']; @file_put_contents($PARCIAL, json_encode($par), LOCK_EX); } }
  else { $falha++; blog("falha no envio (uid {$a['uid']})"); }
  usleep(400000);
}
if (!$teste) foreach ($alvos as $a) if (!in_array($a['uid'], $par['enviados'], true)) $pend++;
if (!$teste && $pend === 0) { @file_put_contents($MARCA, $dia); $st['ultimo_envio_completo'] = $dia; }
$st['enviados_agora'] = $ok; $st['falhas_agora'] = $falha; $st['pendentes'] = $pend;
termina($st, "boletim de $dia: enviados $ok, falhas $falha" . ($pend ? ", pendentes $pend (nova tentativa na próxima rodada)" : ($teste ? ' (teste)' : ', concluído')), 0, true);
