<?php
// Envio do boletim diário. Rodar SÓ pelo cron da Hostinger, depois da edição das 19h (sugestão: 19h30):
//   php /caminho/do/site/radar/cron/boletim.php            (envia)
//   php .../boletim.php --seco                              (só conta, não envia)
//   php .../boletim.php --teste=seu@email.com               (envia uma amostra a um endereço, sem tocar na lista)
// Não roda pela web. Envia no máximo uma vez por dia e só se a última edição for a das 19h de hoje.
if (PHP_SAPI !== 'cli') { http_response_code(404); exit; }
$raiz = dirname(__DIR__, 2); $cfg = $raiz . '/api/config.php'; if (!is_file($cfg)) { fwrite(STDERR, "sem api/config.php\n"); exit(1); }
require $cfg; require $raiz . '/api/_conta.php'; require dirname(__DIR__) . '/_email.php';
date_default_timezone_set('America/Sao_Paulo');
$args = array_slice($argv, 1); $seco = in_array('--seco', $args, true); $teste = ''; $nomeTeste = 'Amostra'; foreach ($args as $a) { if (str_starts_with($a, '--teste=')) $teste = substr($a, 8); if (str_starts_with($a, '--nome=')) $nomeTeste = substr($a, 7); }
$d = rc_dados(); if (!$d) { fwrite(STDERR, "sem dados da edição\n"); exit(1); }
if (!$teste && (($d['hora'] ?? '') !== '19h' || ($d['dia'] ?? '') !== date('Y-m-d'))) { fwrite(STDERR, "a última edição não é a das 19h de hoje (" . ($d['dia'] ?? '?') . ' ' . ($d['hora'] ?? '?') . "); nada enviado\n"); exit(0); }
$marca = dirname(__DIR__) . '/dados/boletim_enviado.txt';
if (!$teste && !$seco && is_file($marca) && trim((string)file_get_contents($marca)) === date('Y-m-d')) { fwrite(STDERR, "boletim de hoje já enviado\n"); exit(0); }
$rdb = radar_db(); if (!$rdb) { fwrite(STDERR, "banco do Radar indisponível\n"); exit(1); }
$alvos = [];
if ($teste) { $alvos[] = ['uid' => 0, 'nome' => $nomeTeste, 'email' => $teste, 'prefs' => ['ed' => ['politica', 'economia', 'mundo'], 'reg' => ['rj', 'sp', 'mg', 'ne']]]; }
else {
  $cdb = conta_db();
  foreach ($rdb->query('SELECT uid, ed, reg FROM boletim WHERE ativo = 1')->fetchAll(PDO::FETCH_ASSOC) as $b) {
    $s = $cdb->prepare("SELECT id, nome, canal, contato, email FROM usuarios WHERE id = ? AND status = 'ativo'"); $s->execute([(int)$b['uid']]); $u = $s->fetch(PDO::FETCH_ASSOC); if (!$u) continue;
    $em = $u['canal'] === 'email' ? $u['contato'] : ($u['email'] ?? ''); if (!filter_var($em, FILTER_VALIDATE_EMAIL) || radar_email_bloqueado($em)) continue;
    $alvos[] = ['uid' => (int)$u['id'], 'nome' => mb_convert_case(trim(explode(' ', trim((string)$u['nome']))[0]), MB_CASE_TITLE, 'UTF-8') ?: 'leitor', 'email' => $em, 'prefs' => ['ed' => array_filter(explode(',', (string)$b['ed'])), 'reg' => array_filter(explode(',', (string)$b['reg']))]];
  }
}
echo count($alvos) . " destinatário(s)\n"; if ($seco) exit(0);
$ok = 0; $falha = 0;
foreach ($alvos as $a) {
  $sel = radar_boletim_montar($d, $a['prefs']); if (!$sel['destaque']) continue;
  $sair = radar_url_sair(['t' => 'bol', 'u' => $a['uid']]);
  $assunto = 'Resumo do dia · ' . $d['data'] . ' · Radar da Oficina Política';
  if (radar_mail($a['email'], $assunto, radar_texto_boletim($d, $sel, $a['nome'], $sair), radar_html_boletim($d, $sel, $a['nome'], $a['prefs'], $sair), $sair)) $ok++; else { $falha++; fwrite(STDERR, "falha no envio (uid {$a['uid']})\n"); }
  usleep(400000);
}
if (!$teste && $ok > 0) @file_put_contents($marca, date('Y-m-d'));
echo "enviados: $ok, falhas: $falha\n";
