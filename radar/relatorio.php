<?php
// Relatório de compartilhamentos do Radar (só administrador: usa o mesmo token do api/exportar.php).
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: no-store'); header('X-Robots-Tag: noindex, nofollow');
$cfg = __DIR__ . '/../api/config.php'; if (is_file($cfg)) require $cfg;
$tok = (string)($_SERVER['HTTP_X_TOKEN'] ?? $_POST['token'] ?? '');
$ok = isset($TOKEN_ADMIN) && strlen((string)$TOKEN_ADMIN) >= 20 && $tok !== '' && hash_equals((string)$TOKEN_ADMIN, $tok);
$h = fn($s) => htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8');
echo '<!doctype html><html lang="pt-BR"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Radar: compartilhamentos</title>
<style>body{font:15px/1.5 system-ui,sans-serif;margin:0;padding:24px;max-width:980px;margin-inline:auto;color:#1b1530;background:#fbf9f5}h1{font-size:24px;color:#3E347E}h2{font-size:14px;letter-spacing:.12em;text-transform:uppercase;color:#3E347E;margin-top:30px}
table{border-collapse:collapse;width:100%}th,td{padding:7px 10px;border-bottom:1px solid #ddd;text-align:left}th{font-size:12px;text-transform:uppercase;color:#5d5675}td.n,th.n{text-align:right}input{padding:9px;font:inherit;width:320px;max-width:100%}button{padding:9px 16px;font:inherit;background:#F08A24;border:0;cursor:pointer}.t{display:flex;gap:30px;flex-wrap:wrap}.t b{display:block;font-size:30px;color:#3E347E}</style><h1>Radar: compartilhamentos</h1>';
if (!$ok) { echo '<form method="post"><p>Informe o token de administrador.</p><input type="password" name="token" autocomplete="off"> <button>Entrar</button></form>'; exit; }
require_once __DIR__ . '/_track.php'; $db = radar_db();
if (!$db) { echo '<p>O banco do rastreio não está disponível (pasta radar/dados sem permissão de escrita?).</p>'; exit; }
$q = fn($sql, $a = []) => (function () use ($db, $sql, $a) { $s = $db->prepare($sql); $s->execute($a); return $s->fetchAll(PDO::FETCH_ASSOC); })();
$tot = $q("SELECT (SELECT COUNT(*) FROM compartilhamentos) c, (SELECT COUNT(*) FROM visitas) v, (SELECT COUNT(DISTINCT visitante) FROM visitas) u, (SELECT COUNT(*) FROM conversoes) e")[0];
echo '<div class="t"><div><b>' . (int)$tot['c'] . '</b>compartilhamentos</div><div><b>' . (int)$tot['v'] . '</b>visitas por links</div><div><b>' . (int)$tot['u'] . '</b>visitantes distintos (por dia)</div><div><b>' . (int)$tot['e'] . '</b>entraram depois de clicar</div></div>';
// nomes: só do banco de contas, e só o primeiro nome
$nomes = [];
try { require_once __DIR__ . '/../api/_conta.php'; $cd = conta_db(); foreach ($q('SELECT uid, code FROM codigos') as $r) { $s = $cd->prepare('SELECT nome FROM usuarios WHERE id = ?'); $s->execute([$r['uid']]); $n = trim((string)$s->fetchColumn()); $nomes[$r['code']] = ($n !== '' ? explode(' ', $n)[0] : 'conta') . ' #' . $r['uid']; } } catch (Throwable $e) {}
$por = $q("SELECT c.code, (SELECT COUNT(*) FROM compartilhamentos x WHERE x.code = c.code) comp, (SELECT COUNT(*) FROM visitas v WHERE v.code = c.code) vis, (SELECT COUNT(DISTINCT visitante) FROM visitas v WHERE v.code = c.code) uni, (SELECT COUNT(*) FROM conversoes z WHERE z.code = c.code) ent FROM codigos c ORDER BY vis DESC, comp DESC LIMIT 50");
echo '<h2>Quem compartilha</h2><table><tr><th>Pessoa</th><th class="n">Compartilhou</th><th class="n">Visitas</th><th class="n">Distintos</th><th class="n">Entraram</th></tr>';
foreach ($por as $r) echo '<tr><td>' . $h($nomes[$r['code']] ?? $r['code']) . '</td><td class="n">' . (int)$r['comp'] . '</td><td class="n">' . (int)$r['vis'] . '</td><td class="n">' . (int)$r['uni'] . '</td><td class="n">' . (int)$r['ent'] . '</td></tr>';
echo '</table><h2>Matérias mais compartilhadas</h2><table><tr><th>Matéria</th><th class="n">Compartilhamentos</th><th class="n">Visitas</th></tr>';
foreach ($q("SELECT m, SUM(c) c, SUM(v) v FROM (SELECT materia m, COUNT(*) c, 0 v FROM compartilhamentos GROUP BY materia UNION ALL SELECT materia, 0, COUNT(*) FROM visitas GROUP BY materia) WHERE m <> '' GROUP BY m ORDER BY v DESC, c DESC LIMIT 30") as $r) echo '<tr><td>' . $h($r['m']) . '</td><td class="n">' . (int)$r['c'] . '</td><td class="n">' . (int)$r['v'] . '</td></tr>';
echo '</table><h2>Por canal</h2><table><tr><th>Canal</th><th class="n">Compartilhamentos</th><th class="n">Visitas</th></tr>';
foreach ($q("SELECT k, SUM(c) c, SUM(v) v FROM (SELECT canal k, COUNT(*) c, 0 v FROM compartilhamentos GROUP BY canal UNION ALL SELECT canal, 0, COUNT(*) FROM visitas GROUP BY canal) GROUP BY k ORDER BY v DESC, c DESC") as $r) echo '<tr><td>' . $h($r['k'] ?: '—') . '</td><td class="n">' . (int)$r['c'] . '</td><td class="n">' . (int)$r['v'] . '</td></tr>';
echo '</table><h2>Interesses de leitura (só de quem aceitou)</h2><table><tr><th>Editoria / região</th><th class="n">Leituras</th><th class="n">Leitores distintos</th></tr>';
foreach ($q("SELECT editoria || CASE WHEN regiao <> '' THEN ' · ' || regiao ELSE '' END k, COUNT(*) n, COUNT(DISTINCT uid) u FROM leituras GROUP BY k ORDER BY n DESC LIMIT 20") as $r) echo '<tr><td>' . $h($r['k']) . '</td><td class="n">' . (int)$r['n'] . '</td><td class="n">' . (int)$r['u'] . '</td></tr>';
echo '</table><h2>Últimos 14 dias</h2><table><tr><th>Dia</th><th class="n">Compartilhamentos</th><th class="n">Visitas</th></tr>';
foreach ($q("SELECT d, SUM(c) c, SUM(v) v FROM (SELECT date(ts,'unixepoch','-3 hours') d, COUNT(*) c, 0 v FROM compartilhamentos GROUP BY d UNION ALL SELECT date(ts,'unixepoch','-3 hours'), 0, COUNT(*) FROM visitas GROUP BY 1) GROUP BY d ORDER BY d DESC LIMIT 14") as $r) echo '<tr><td>' . $h($r['d']) . '</td><td class="n">' . (int)$r['c'] . '</td><td class="n">' . (int)$r['v'] . '</td></tr>';
echo '</table><p style="color:#5d5675;font-size:13px;margin-top:30px">Visitas contam uma por visitante/dia/matéria por hora, sem guardar IP. “Entraram” são pessoas que clicaram deslogadas e depois entraram no Radar.</p>';
