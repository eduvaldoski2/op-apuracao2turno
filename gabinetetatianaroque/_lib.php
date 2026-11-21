<?php
// Radar Oficina Política para o Gabinete Tatiana Roque — biblioteca comum (banco, acesso, configuração).
// Quem inclui este arquivo já fez, no topo do script, require de api/config.php e api/_conta.php (as variáveis de config são globais).
if (!defined('GAB_OK')) { http_response_code(404); exit; }

const GAB_SLUG = 'gabinetetatianaroque';
const GAB_VOTOS = ['sim' => 'Sim', 'nao' => 'Não', 'abstencao' => 'Abstenção', 'verificar' => 'Verificar orientação de bancada'];

function gab_e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function gab_hoje() { return (new DateTime('now', new DateTimeZone('America/Sao_Paulo')))->format('Y-m-d'); }
function gab_agora() { return (new DateTime('now', new DateTimeZone('America/Sao_Paulo'))); }
function gab_json($d, $cod = 200) { http_response_code($cod); header('Content-Type: application/json; charset=utf-8'); header('Cache-Control: no-store'); echo json_encode($d, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES); exit; }

function gab_db() {
  static $db = null; if ($db) return $db;
  $dir = __DIR__ . '/dados'; if (!is_dir($dir)) @mkdir($dir, 0755, true);
  $db = new PDO('sqlite:' . $dir . '/gabinete.sqlite');
  $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION); $db->setAttribute(PDO::ATTR_DEFAULT_FETCH_MODE, PDO::FETCH_ASSOC);
  $db->exec('PRAGMA busy_timeout = 5000');
  // quem pode ver o boletim (autorizado), orientar votos (orienta) e administrar (admin); email = quer receber às 7h
  $db->exec('CREATE TABLE IF NOT EXISTS gab_acesso (uid INTEGER PRIMARY KEY, autorizado INTEGER DEFAULT 0, orienta INTEGER DEFAULT 0, admin INTEGER DEFAULT 0, email INTEGER DEFAULT 1, por TEXT, ts INTEGER)');
  $db->exec('CREATE TABLE IF NOT EXISTS gab_areas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT UNIQUE, ordem INTEGER DEFAULT 0)');
  $db->exec('CREATE TABLE IF NOT EXISTS gab_temas (id INTEGER PRIMARY KEY AUTOINCREMENT, nome TEXT, termos TEXT, area TEXT, ativo INTEGER DEFAULT 1)');
  $db->exec('CREATE TABLE IF NOT EXISTS gab_pls (id INTEGER PRIMARY KEY AUTOINCREMENT, ref TEXT UNIQUE, apelido TEXT, nota TEXT, area TEXT, ativo INTEGER DEFAULT 1, criado INTEGER)');
  $db->exec('CREATE TABLE IF NOT EXISTS gab_orient (chave TEXT PRIMARY KEY, voto TEXT, comentario TEXT, uid INTEGER, nome TEXT, ts INTEGER, rotulo TEXT)');
  $db->exec('CREATE TABLE IF NOT EXISTS gab_envios (data TEXT, uid INTEGER, ts INTEGER, ok INTEGER, PRIMARY KEY (data, uid))');
  $db->exec('CREATE TABLE IF NOT EXISTS gab_cfg (k TEXT PRIMARY KEY, v TEXT)');
  if ((int)$db->query('SELECT COUNT(*) FROM gab_areas')->fetchColumn() === 0) {
    foreach (['Ciência, Tecnologia e Inovação', 'Cultura e patrimônio', 'Educação', 'Saúde', 'Meio ambiente e clima', 'Mobilidade e urbanismo', 'Moradia e habitação', 'Trabalho e renda', 'Direitos e cidadania'] as $i => $n)
      $db->prepare('INSERT OR IGNORE INTO gab_areas (nome, ordem) VALUES (?, ?)')->execute([$n, $i]);
  }
  if ((int)$db->query('SELECT COUNT(*) FROM gab_temas')->fetchColumn() === 0) {
    // sugestões iniciais, para lapidar com o gabinete
    $t = [
      ['Ciência, tecnologia e inovação', "ciência\ntecnologia\ninovação\ninteligência artificial\ntransformação digital\ndados abertos\nstartup\npesquisa científica\nuniversidade\ngoverno digital\nproteção de dados", 'Ciência, Tecnologia e Inovação'],
      ['Cultura e patrimônio', "patrimônio cultural\ntombamento\ncultura\ncarnaval\nbibliotecas", 'Cultura e patrimônio'],
      ['Educação', "educação\nescola\nensino\ncreche\nprofessor", 'Educação'],
      ['Saúde', "saúde\nhospital\nSUS\nvacina\nsaúde mental", 'Saúde'],
      ['Meio ambiente e clima', "mudanças climáticas\nmeio ambiente\nsustentabilidade\ndrenagem\nenchente\nresíduos", 'Meio ambiente e clima'],
      ['Mobilidade e urbanismo', "mobilidade urbana\ntransporte\nbicicleta\nplano diretor\nparâmetros urbanísticos", 'Mobilidade e urbanismo'],
    ];
    foreach ($t as $x) $db->prepare('INSERT INTO gab_temas (nome, termos, area) VALUES (?, ?, ?)')->execute($x);
  }
  return $db;
}

// ---------- acesso ----------
function gab_key() { return hash('sha256', 'gab|' . (string)cfg('TOKEN_ADMIN', '') . '|' . (string)cfg('SAL', '')); }
function gab_acesso($u) {
  if (!$u) return ['autorizado' => 0, 'orienta' => 0, 'admin' => 0, 'email' => 0];
  $s = gab_db()->prepare('SELECT * FROM gab_acesso WHERE uid = ?'); $s->execute([(int)$u['id']]); $r = $s->fetch();
  if (!$r) return ['autorizado' => 0, 'orienta' => 0, 'admin' => 0, 'email' => 0];
  if ((int)$r['admin']) { $r['autorizado'] = 1; $r['orienta'] = 1; }
  return $r;
}
// administrador "de emergência": quem sabe o token de administração (o mesmo de /radar/relatorio.php) abre a página de administração por 8 h
function gab_token_cookie_ok() {
  $c = (string)($_COOKIE['gab_adm'] ?? ''); $x = explode('.', $c, 2); if (count($x) !== 2 || !ctype_digit($x[0]) || (int)$x[0] < time()) return false;
  return hash_equals(hash_hmac('sha256', 'adm' . $x[0], gab_key()), $x[1]);
}
function gab_token_cookie_emite() {
  $exp = time() + 8 * 3600; $v = $exp . '.' . hash_hmac('sha256', 'adm' . $exp, gab_key());
  setcookie('gab_adm', $v, ['expires' => $exp, 'path' => '/' . GAB_SLUG, 'secure' => https_ativo(), 'httponly' => true, 'samesite' => 'Strict']);
}
function gab_csrf() { $id = (string)($_COOKIE['op_sessao'] ?? '') . '|' . (string)($_COOKIE['gab_adm'] ?? ''); return hash_hmac('sha256', 'csrf|' . $id, gab_key()); }
function gab_csrf_ok() { $h = (string)($_SERVER['HTTP_X_GAB_CSRF'] ?? ''); return $h !== '' && hash_equals(gab_csrf(), $h); }

// ---------- edições ----------
function gab_datas() {
  $o = []; foreach (glob(__DIR__ . '/dados/edicoes/*.json') ?: [] as $f) { $n = basename($f, '.json'); if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $n)) $o[] = $n; }
  rsort($o); return $o;
}
function gab_ed($data) {
  if (!preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$data)) return null;
  $f = __DIR__ . '/dados/edicoes/' . $data . '.json'; if (!is_file($f)) return null;
  $j = json_decode((string)@file_get_contents($f), true); return is_array($j) ? $j : null;
}
function gab_data_extensa($d) {
  $t = DateTime::createFromFormat('Y-m-d', $d, new DateTimeZone('America/Sao_Paulo')); if (!$t) return $d;
  $dias = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  $m = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];
  return ucfirst($dias[(int)$t->format('w')]) . ', ' . (int)$t->format('j') . ' de ' . $m[(int)$t->format('n') - 1] . ' de ' . $t->format('Y');
}

// ---------- configuração do mandato ----------
function gab_config() {
  $db = gab_db();
  return [
    'pls' => $db->query('SELECT * FROM gab_pls WHERE ativo = 1 ORDER BY id')->fetchAll(),
    'temas' => $db->query('SELECT * FROM gab_temas WHERE ativo = 1 ORDER BY id')->fetchAll(),
    'areas' => array_column($db->query('SELECT nome FROM gab_areas ORDER BY ordem, id')->fetchAll(), 'nome'),
  ];
}
function gab_orientacoes() {
  $o = []; foreach (gab_db()->query('SELECT * FROM gab_orient')->fetchAll() as $r) $o[$r['chave']] = ['voto' => $r['voto'], 'comentario' => $r['comentario'], 'por' => $r['nome'], 'ts' => (int)$r['ts']];
  return $o;
}
// e-mail de um usuário (canal e-mail usa o contato; senão o campo email do cadastro)
function gab_email_de($u) {
  foreach ([(($u['canal'] ?? '') === 'email') ? ($u['contato'] ?? '') : '', $u['email'] ?? ''] as $e) if ($e && filter_var($e, FILTER_VALIDATE_EMAIL)) return $e;
  return '';
}

// contexto de administração: admin do gabinete, quem pode orientar votos, ou quem abriu a sessão com o token de administração
function gab_ctx() {
  $u = function_exists('usuario_atual') ? usuario_atual() : null;
  if ($u) { $a = gab_acesso($u); if ((int)$a['admin'] || (int)$a['orienta']) return ['uid' => (int)$u['id'], 'nome' => (string)$u['nome'], 'admin' => (int)$a['admin'], 'orienta' => 1, 'via' => 'conta']; }
  if (gab_token_cookie_ok()) return ['uid' => 0, 'nome' => 'Administração (token)', 'admin' => 1, 'orienta' => 1, 'via' => 'token'];
  return null;
}
