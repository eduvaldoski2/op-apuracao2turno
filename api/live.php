<?php
// Intermediário do placar ao vivo: busca os arquivos do coletor no GitHub (branches dados / dados-bN) e guarda uma cópia
// no servidor por alguns segundos. Com o Cloudflare na frente, o GitHub é consultado só algumas vezes por minuto,
// não importa quantas pessoas estejam com o painel aberto. Chamado por /live/<arquivo> e /liveb/<grupo>/<arquivo> (ver .htaccess).
$REPO = 'eduvaldoski2/op-apuracao2turno';
$p = (string)($_GET['p'] ?? ''); $b = (int)($_GET['b'] ?? 0);
$ok = $b === 0 ? preg_match('#^(meta|snap|hist)\.json$#', $p) : ($b >= 1 && $b <= 5 && preg_match('#^bairros/[a-z]{2}/[0-9]{1,6}\.json$#', $p));
if (!$ok) { http_response_code(400); exit; }
$ramo = $b === 0 ? (getenv('OP_RAMO_LIVE') ?: 'dados') : 'dados-b' . $b;

// O raw.githubusercontent guarda cópias velhas por ramo (às vezes minutos). Endereço por código (sha) da versão é sempre novo e fresco:
// o código vem do próprio git do GitHub (info/refs), guardado só por 3 s.
function sha_do_ramo($ramo, $repo) {
  $f = __DIR__ . '/dados/cache/refs.json'; $agora = time();
  $m = is_file($f) ? json_decode(@file_get_contents($f), true) : null;
  if (!is_array($m) || ($agora - ($m['t'] ?? 0)) > 3) {
    $ch = curl_init("https://github.com/$repo.git/info/refs?service=git-upload-pack&t=" . $agora . mt_rand(10, 99));
    curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 5, CURLOPT_CONNECTTIMEOUT => 3, CURLOPT_USERAGENT => 'git/2.43.0']);
    $r = curl_exec($ch); $cod = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
    $n = ['t' => $agora, 'r' => []];
    if ($r !== false && $cod === 200 && preg_match_all('#([0-9a-f]{40}) refs/heads/(dados[a-z0-9-]*)\n#', str_replace("\0", ' ', $r), $mm, PREG_SET_ORDER)) {
      foreach ($mm as $x) $n['r'][$x[2]] = $x[1];
      file_put_contents($f . '.tmp', json_encode($n)); @rename($f . '.tmp', $f); $m = $n;
    } elseif (is_array($m)) { $m['t'] = $agora - 2; file_put_contents($f . '.tmp', json_encode($m)); @rename($f . '.tmp', $f); }
  }
  return is_array($m) ? ($m['r'][$ramo] ?? null) : null;
}
$sha = null; $dirc = __DIR__ . '/dados/cache'; if (!is_dir($dirc)) @mkdir($dirc, 0775, true);
$sha = sha_do_ramo($ramo, $REPO);
$url = $sha ? "https://raw.githubusercontent.com/$REPO/$sha/live/$p" : "https://raw.githubusercontent.com/$REPO/$ramo/live/$p";   // (+ ?t=... na hora de buscar: o raw.githubusercontent guarda cópias por até 5 min; com parâmetro novo vem sempre a versão atual)
$ttl = 3;                          // segundos que uma cópia vale
$dir = __DIR__ . '/dados/cache'; if (!is_dir($dir)) @mkdir($dir, 0775, true);
$arq = $dir . '/' . md5($ramo . '/' . $p) . '.json';
$agora = time(); $idade = is_file($arq) ? $agora - filemtime($arq) : PHP_INT_MAX;
$status = 200; $corpo = null;
if ($idade > $ttl) {
  $trava = @fopen($arq . '.lock', 'c');
  $pega = $trava && flock($trava, LOCK_EX | LOCK_NB);       // só um pedido por vez atualiza; os outros usam a cópia existente
  if ($pega || $idade === PHP_INT_MAX) {
    if (!$pega && $trava) flock($trava, LOCK_EX);
    clearstatcache(true, $arq); $idade = is_file($arq) ? $agora - filemtime($arq) : PHP_INT_MAX;
    if ($idade > $ttl) {
      $ch = curl_init($url . ($sha ? '' : '?t=' . time() . mt_rand(10, 99)));
      curl_setopt_array($ch, [CURLOPT_RETURNTRANSFER => true, CURLOPT_TIMEOUT => 8, CURLOPT_CONNECTTIMEOUT => 4, CURLOPT_ENCODING => '', CURLOPT_USERAGENT => 'op-apuracao-proxy']);
      $r = curl_exec($ch); $cod = (int)curl_getinfo($ch, CURLINFO_HTTP_CODE); curl_close($ch);
      if ($r !== false && $cod === 200 && $r !== '') { file_put_contents($arq . '.tmp', $r); rename($arq . '.tmp', $arq); }
      elseif ($cod === 404 && !is_file($arq)) { $status = 404; }
      elseif (is_file($arq)) { touch($arq, $agora - $ttl + 5); }   // GitHub falhou: serve a cópia que já existe e tenta de novo em 5 s
    }
  }
  if ($trava) { flock($trava, LOCK_UN); fclose($trava); }
}
if ($status === 200) { $corpo = is_file($arq) ? @file_get_contents($arq) : false; if ($corpo === false || $corpo === '') $status = 503; }
if ($status !== 200) { http_response_code($status); header('Cache-Control: public, max-age=5, s-maxage=10'); header('Content-Type: application/json'); echo '{}'; exit; }
$etag = '"' . md5($corpo) . '"';
header('Content-Type: application/json; charset=utf-8');
header('Cache-Control: public, max-age=2, s-maxage=' . $ttl . ', stale-while-revalidate=4, stale-if-error=600');
header('ETag: ' . $etag); header('Access-Control-Allow-Origin: *');
if (($_SERVER['HTTP_IF_NONE_MATCH'] ?? '') === $etag) { http_response_code(304); exit; }
if (strpos($_SERVER['HTTP_ACCEPT_ENCODING'] ?? '', 'gzip') !== false && function_exists('gzencode')) { header('Content-Encoding: gzip'); header('Vary: Accept-Encoding'); $corpo = gzencode($corpo, 5); }
header('Content-Length: ' . strlen($corpo)); echo $corpo;
