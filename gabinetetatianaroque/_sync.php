<?php
// Traz do GitHub (branch de dados) as edições geradas pelo coletor (GitHub Actions). Só leitura, sem token: o repositório é público.
// Chamada pelo cron das 7h e, com intervalo mínimo, pela própria página (para o boletim nunca ficar velho). Falha de rede nunca derruba nada.
if (!defined('GAB_OK')) { http_response_code(404); exit; }

function gab_raw($caminho, $timeout = 8) {
  $repo = (string)cfg('GABINETE_REPO', 'eduvaldoski2/op-apuracao2turno'); $br = (string)cfg('GABINETE_BRANCH', 'gabinete-dados');
  $url = 'https://raw.githubusercontent.com/' . $repo . '/' . $br . '/' . $caminho . '?t=' . time();
  if (function_exists('curl_init')) {
    $c = curl_init($url); curl_setopt_array($c, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => $timeout, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_FOLLOWLOCATION => true, CURLOPT_USERAGENT => 'RadarOficinaPolitica/1.0']);
    $r = curl_exec($c); $cod = curl_getinfo($c, CURLINFO_HTTP_CODE); curl_close($c); return ($cod === 200 && is_string($r)) ? $r : null;
  }
  $r = @file_get_contents($url, false, stream_context_create(['http' => ['timeout' => $timeout, 'header' => "User-Agent: RadarOficinaPolitica/1.0\r\n"]])); return is_string($r) ? $r : null;
}

// devolve ['baixadas' => [...], 'erro' => '']
function gab_sync($intervaloMin = 0) {
  $dir = __DIR__ . '/dados'; $ed = $dir . '/edicoes'; if (!is_dir($ed)) @mkdir($ed, 0755, true);
  $selo = $dir . '/sync.stamp';
  if ($intervaloMin > 0 && is_file($selo) && time() - (int)@filemtime($selo) < $intervaloMin * 60) return ['baixadas' => [], 'erro' => 'recente'];
  @touch($selo);
  $out = ['baixadas' => [], 'erro' => ''];
  $idx = gab_raw('indice.json'); if ($idx === null) { $out['erro'] = 'sem índice'; return $out; }
  $j = json_decode($idx, true); if (!is_array($j) || empty($j['datas'])) { $out['erro'] = 'índice inválido'; return $out; }
  $ver = $j['versoes'] ?? [];
  foreach (array_slice($j['datas'], -14) as $d) {
    if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', $d)) continue;
    $f = $ed . '/' . $d . '.json'; $local = is_file($f) ? (json_decode((string)@file_get_contents($f), true)['gerado_em'] ?? '') : '';
    if ($local !== '' && $local === ($ver[$d] ?? '')) continue;
    $b = gab_raw('edicoes/' . $d . '.json', 20); $o = $b ? json_decode($b, true) : null;
    if (!is_array($o) || ($o['data'] ?? '') !== $d) continue;
    if (@file_put_contents($f . '.tmp', $b, LOCK_EX) !== false && @rename($f . '.tmp', $f)) $out['baixadas'][] = $d;
  }
  return $out;
}
