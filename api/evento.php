<?php
// Contador próprio de uso do painel: soma quantas vezes cada ação aconteceu por dia (compartilhar, baixar, exportar, telas…).
// Anônimo: NÃO grava IP, navegador, cookie nem qualquer dado pessoal; só contagens por dia/evento/detalhe (ex.: compartilhar · canal=whatsapp|formato=1x1|tela=/ap/uf/rj).
// O IP vira um hash só para limitar abusos (60 envios/min) e é apagado em até 1 hora. Dados em api/dados/eventos.sqlite (bloqueado para acesso externo).
require __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store');
function sai($cod = 204) { http_response_code($cod); if ($cod !== 204) echo json_encode(['ok' => $cod < 300]); exit; }
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origem && !in_array($origem, $ORIGENS_PERMITIDAS, true)) sai(403);
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') sai(405);
$raw = file_get_contents('php://input'); if (strlen($raw) > 2000) sai(413);
$j = json_decode($raw, true); if (!is_array($j)) sai(400);
$PERMITIDOS = ['compartilhar', 'compartilhar_abrir', 'compartilhar_formato', 'exportar', 'tv', 'lead_abrir', 'lead_enviado', 'candidato_foco', 'mapa_modo', 'dispersao_eixo', 'entenda_aberto', 'ordenar_tabela',
  'card_baixar', 'card_compartilhar', 'card_legenda', 'zip_baixar', 'busca_ir', 'tela', 'link_externo'];
$ev = (string)($j['e'] ?? ''); if (!in_array($ev, $PERMITIDOS, true)) sai(422);
$CHAVES = ['canal', 'formato', 'tipo', 'aba', 'tela', 'secao', 'colecao', 'modo', 'acao', 'cand', 'eixo', 'origem', 'destino', 'rota', 'item', 'anuncios', 'dominio'];
$p = []; foreach ((is_array($j['p'] ?? null) ? $j['p'] : []) as $k => $v) {
  if (!in_array($k, $CHAVES, true) || !is_scalar($v)) continue;
  $v = trim(preg_replace('/[^\p{L}\p{N} _\-\/:.]/u', '', (string)$v)); if ($v !== '') $p[$k] = mb_substr($v, 0, 70);
}
ksort($p); $chave = ''; foreach ($p as $k => $v) $chave .= ($chave === '' ? '' : '|') . "$k=$v";
try {
  $db = new PDO('sqlite:' . __DIR__ . '/dados/eventos.sqlite'); $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); $db->exec('PRAGMA busy_timeout=3000');
  $db->exec('CREATE TABLE IF NOT EXISTS cont (dia TEXT, evento TEXT, chave TEXT, n INTEGER, PRIMARY KEY (dia, evento, chave))');
  $db->exec('CREATE TABLE IF NOT EXISTS lim (h TEXT, minuto INTEGER, n INTEGER, PRIMARY KEY (h, minuto))');
  $h = hash('sha256', $SAL . ($_SERVER['REMOTE_ADDR'] ?? '')); $m = intdiv(time(), 60);
  if (random_int(1, 50) === 1) $db->prepare('DELETE FROM lim WHERE minuto < ?')->execute([$m - 60]);
  $db->prepare('INSERT INTO lim (h, minuto, n) VALUES (?, ?, 1) ON CONFLICT(h, minuto) DO UPDATE SET n = n + 1')->execute([$h, $m]);
  $s = $db->prepare('SELECT n FROM lim WHERE h = ? AND minuto = ?'); $s->execute([$h, $m]); if ((int)$s->fetchColumn() > 60) sai(429);
  $dia = (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d');
  // teto de linhas por dia: passou disso, os detalhes novos entram agrupados em "(outros)"
  $e = $db->prepare('SELECT 1 FROM cont WHERE dia = ? AND evento = ? AND chave = ?'); $e->execute([$dia, $ev, $chave]);
  if (!$e->fetchColumn()) { $t = $db->prepare('SELECT COUNT(*) FROM cont WHERE dia = ?'); $t->execute([$dia]); if ((int)$t->fetchColumn() >= 20000) $chave = '(outros)'; }
  $db->prepare('INSERT INTO cont (dia, evento, chave, n) VALUES (?, ?, ?, 1) ON CONFLICT(dia, evento, chave) DO UPDATE SET n = n + 1')->execute([$dia, $ev, $chave]);
} catch (Throwable $x) { sai(500); }
sai(204);
