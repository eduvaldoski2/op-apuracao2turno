<?php
// Rastreio de compartilhamentos do Radar. Banco próprio (radar/dados/radar.sqlite), separado das contas.
// Quem compartilha recebe um código estável (8 hex, HMAC do id da conta): o link leva ?r=CODIGO&m=MATERIA&utm_medium=CANAL.
// Se qualquer coisa falhar (pasta sem escrita, sem sqlite), o rastreio simplesmente desliga: o Radar segue funcionando.
function radar_db() {
  static $db = false; if ($db !== false) return $db;
  $db = null;
  try {
    $dir = __DIR__ . '/dados'; if (!is_dir($dir)) @mkdir($dir, 0755, true);
    if (!is_dir($dir) || !is_writable($dir) || !extension_loaded('pdo_sqlite')) return $db;
    $db = new PDO('sqlite:' . $dir . '/radar.sqlite'); $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    $db->exec("CREATE TABLE IF NOT EXISTS codigos (code TEXT PRIMARY KEY, uid INTEGER NOT NULL);
      CREATE TABLE IF NOT EXISTS compartilhamentos (id INTEGER PRIMARY KEY, ts INTEGER, uid INTEGER, code TEXT, materia TEXT, canal TEXT);
      CREATE TABLE IF NOT EXISTS visitas (id INTEGER PRIMARY KEY, ts INTEGER, code TEXT, materia TEXT, canal TEXT, visitante TEXT, logado INTEGER);
      CREATE TABLE IF NOT EXISTS conversoes (uid INTEGER PRIMARY KEY, ts INTEGER, code TEXT);
      CREATE INDEX IF NOT EXISTS i_vis_code ON visitas(code); CREATE INDEX IF NOT EXISTS i_cmp_code ON compartilhamentos(code);");
  } catch (Throwable $e) { $db = null; }
  return $db;
}
function radar_segredo() {
  $f = __DIR__ . '/dados/segredo.key';
  $s = @file_get_contents($f); if (is_string($s) && strlen($s) >= 32) return trim($s);
  if (!is_dir(__DIR__ . '/dados') || !is_writable(__DIR__ . '/dados')) return '';
  $s = bin2hex(random_bytes(24)); @file_put_contents($f, $s, LOCK_EX); @chmod($f, 0600); return $s;
}
function radar_codigo($uid) {
  $uid = (int)$uid; $db = radar_db(); $seg = radar_segredo(); if (!$db || $seg === '' || $uid <= 0) return '';
  $c = substr(hash_hmac('sha256', (string)$uid, $seg), 0, 8);
  try { $db->prepare('INSERT OR IGNORE INTO codigos (code, uid) VALUES (?, ?)')->execute([$c, $uid]); } catch (Throwable $e) { return ''; }
  return $c;
}
function radar_codigo_existe($code) {
  $db = radar_db(); if (!$db || !preg_match('/^[a-f0-9]{8}$/', (string)$code)) return false;
  try { $s = $db->prepare('SELECT 1 FROM codigos WHERE code = ?'); $s->execute([$code]); return (bool)$s->fetchColumn(); } catch (Throwable $e) { return false; }
}
function radar_compartilhou($uid, $materia, $canal) {
  $db = radar_db(); $c = radar_codigo($uid); if (!$db || $c === '') return false;
  try {
    $n = $db->prepare('SELECT COUNT(*) FROM compartilhamentos WHERE uid = ? AND ts > ?'); $n->execute([(int)$uid, time() - 86400]);
    if ((int)$n->fetchColumn() >= 300) return false;     // trava contra abuso
    $db->prepare('INSERT INTO compartilhamentos (ts, uid, code, materia, canal) VALUES (?,?,?,?,?)')->execute([time(), (int)$uid, $c, $materia, $canal]); return true;
  } catch (Throwable $e) { return false; }
}
function radar_visita($code, $materia, $canal, $logado) {
  $db = radar_db(); $seg = radar_segredo(); if (!$db || $seg === '') return;
  $ip = (string)($_SERVER['REMOTE_ADDR'] ?? ''); $ua = (string)($_SERVER['HTTP_USER_AGENT'] ?? '');
  $v = substr(hash('sha256', $ip . '|' . $ua . '|' . date('Y-m-d') . '|' . $seg), 0, 16);   // visitante do dia, sem guardar IP
  try {
    $r = $db->prepare('SELECT 1 FROM visitas WHERE code = ? AND visitante = ? AND materia = ? AND ts > ? LIMIT 1'); $r->execute([$code, $v, $materia, time() - 3600]);
    if ($r->fetchColumn()) return;
    $db->prepare('INSERT INTO visitas (ts, code, materia, canal, visitante, logado) VALUES (?,?,?,?,?,?)')->execute([time(), $code, $materia, $canal, $v, $logado ? 1 : 0]);
  } catch (Throwable $e) {}
}
function radar_conversao($uid, $code) {
  $db = radar_db(); if (!$db) return;
  try {
    $c = $db->prepare('SELECT uid FROM codigos WHERE code = ?'); $c->execute([$code]); $dono = (int)$c->fetchColumn();
    if ($dono <= 0 || $dono === (int)$uid) return;
    $db->prepare('INSERT OR IGNORE INTO conversoes (uid, ts, code) VALUES (?,?,?)')->execute([(int)$uid, time(), $code]);
  } catch (Throwable $e) {}
}
