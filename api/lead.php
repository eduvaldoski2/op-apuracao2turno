<?php
// Recebe os contatos do formulário do painel e grava em SQLite (api/dados/leads.sqlite, bloqueado para acesso externo).
// Instalação: copie config.sample.php para config.php e preencha. Requer PHP 7.4+ com pdo_sqlite (padrão na Hostinger).
require __DIR__ . '/config.php';
header('Content-Type: application/json; charset=utf-8');
$origem = $_SERVER['HTTP_ORIGIN'] ?? '';
if ($origem && in_array($origem, $ORIGENS_PERMITIDAS, true)) { header('Access-Control-Allow-Origin: ' . $origem); header('Vary: Origin'); }
header('Access-Control-Allow-Methods: POST, OPTIONS'); header('Access-Control-Allow-Headers: Content-Type');
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') { http_response_code(204); exit; }
function sai($ok, $cod = 200, $erro = '') { http_response_code($cod); echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'erro' => $erro]); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') sai(false, 405, 'método inválido');
if ($origem && !in_array($origem, $ORIGENS_PERMITIDAS, true)) sai(false, 403, 'origem não permitida');
$j = json_decode(file_get_contents('php://input'), true);
if (!is_array($j)) sai(false, 400, 'dados inválidos');
$nome = trim((string)($j['nome'] ?? '')); $email = strtolower(trim((string)($j['email'] ?? '')));
if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) sai(false, 422, 'nome ou e-mail inválido');
if (empty($j['consentimento_contato'])) sai(false, 422, 'consentimento necessário');
$tel = preg_replace('/\D+/', '', (string)($j['telefone'] ?? ''));
// formulários da página inicial e da página de cards: WhatsApp com DDD é obrigatório (10 ou 11 dígitos)
if (in_array(($j['formulario'] ?? ''), ['home', 'cards'], true) && (strlen($tel) < 10 || strlen($tel) > 13)) sai(false, 422, 'WhatsApp inválido');
if ($tel !== '' && strlen($tel) <= 11) $tel = '55' . $tel;
$ip = $_SERVER['REMOTE_ADDR'] ?? ''; $iph = hash('sha256', $SAL . $ip);
$db = new PDO('sqlite:' . __DIR__ . '/dados/leads.sqlite'); $db->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$db->exec('CREATE TABLE IF NOT EXISTS leads (id INTEGER PRIMARY KEY AUTOINCREMENT, criado TEXT, nome TEXT, email TEXT UNIQUE, telefone TEXT, cidade TEXT, perfil TEXT, c_contato INTEGER, c_anuncios INTEGER, texto_versao TEXT, pagina TEXT, origem TEXT, ip_hash TEXT, agente TEXT, excluido INTEGER DEFAULT 0)');
// limite simples: 8 envios por hora por IP
$n = $db->prepare('SELECT COUNT(*) FROM leads WHERE ip_hash = ? AND criado > ?'); $n->execute([$iph, gmdate('c', time() - 3600)]);
if ((int)$n->fetchColumn() >= 8) sai(false, 429, 'muitas tentativas');
$st = $db->prepare('INSERT INTO leads (criado,nome,email,telefone,cidade,perfil,c_contato,c_anuncios,texto_versao,pagina,origem,ip_hash,agente) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)
  ON CONFLICT(email) DO UPDATE SET nome=excluded.nome, telefone=excluded.telefone, cidade=excluded.cidade, perfil=excluded.perfil, c_contato=1, c_anuncios=excluded.c_anuncios, texto_versao=excluded.texto_versao, excluido=0');
$st->execute([gmdate('c'), mb_substr($nome, 0, 120), mb_substr($email, 0, 160), mb_substr($tel, 0, 20), mb_substr((string)($j['cidade'] ?? ''), 0, 80), mb_substr((string)($j['perfil'] ?? ''), 0, 60), 1, empty($j['consentimento_anuncios']) ? 0 : 1, mb_substr((string)($j['texto_versao'] ?? ''), 0, 10), mb_substr((string)($j['pagina'] ?? ''), 0, 200), mb_substr(json_encode($j['origem'] ?? new stdClass(), JSON_UNESCAPED_UNICODE), 0, 600), $iph, mb_substr($_SERVER['HTTP_USER_AGENT'] ?? '', 0, 200)]);
sai(true);
