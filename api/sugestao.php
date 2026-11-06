<?php
// Recebe as sugestões do formulário "O que você está sentindo falta?" do Painel Eleições.
// Grava em api/dados/contas.sqlite (tabela sugestoes; aparece em admin.html) e avisa contato@oficinapolitica.com.br por e-mail.
// Não cria cadastro de marketing: nome, e-mail e WhatsApp servem só para responder à sugestão.
require __DIR__ . '/config.php';
require __DIR__ . '/_conta.php';
$origem = cabecalhos_api('POST, OPTIONS');
function sug_sai($ok, $cod = 200, $erro = '') { http_response_code($cod); echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'erro' => $erro]); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') sug_sai(false, 405, 'método inválido');
if ($origem && !in_array($origem, cfg('ORIGENS_PERMITIDAS', []), true)) sug_sai(false, 403, 'origem não permitida');
$j = json_decode(file_get_contents('php://input'), true);
if (!is_array($j)) sug_sai(false, 400, 'dados inválidos');
if (!empty($j['site'])) sug_sai(true);   // campo-isca preenchido por robô: finge sucesso e descarta
$un = fn($v) => trim(preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F]/u', '', (string)$v));
$nome = mb_substr(preg_replace('/\s+/u', ' ', $un($j['nome'] ?? '')), 0, 120);
$email = strtolower(trim((string)($j['email'] ?? '')));
$tel = preg_replace('/\D+/', '', (string)($j['telefone'] ?? ''));
$msg = mb_substr($un($j['mensagem'] ?? ''), 0, 3000);
if ($nome === '') sug_sai(false, 422, 'Informe seu nome.');
if (!filter_var($email, FILTER_VALIDATE_EMAIL) || strlen($email) > 160) sug_sai(false, 422, 'Informe um e-mail válido.');
if ($tel !== '' && (strlen($tel) < 10 || strlen($tel) > 13)) sug_sai(false, 422, 'WhatsApp inválido: use DDD + número.');
if ($tel !== '' && strlen($tel) <= 11) $tel = '55' . $tel;
if (mb_strlen($msg) < 8) sug_sai(false, 422, 'Escreva sua sugestão.');
if (!taxa_ok('sug:' . ip_hash(), 5, 3600)) sug_sai(false, 429, 'Muitas tentativas. Tente de novo mais tarde.');
$db = conta_db(); sugestoes_tabela($db);
$pagina = mb_substr((string)($j['pagina'] ?? ''), 0, 200); $ag = mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200);
$db->prepare('INSERT INTO sugestoes (criado, nome, email, telefone, mensagem, pagina, agente) VALUES (?,?,?,?,?,?,?)')->execute([gmdate('c'), $nome, $email, $tel, $msg, $pagina, $ag]);
$id = (int)$db->lastInsertId();
$assunto = 'Sugestão do Painel Eleições · ' . mb_substr(str_replace(["\r", "\n"], ' ', $nome), 0, 60);
$texto = "Nova sugestão no Painel Eleições (#$id)\n\nNome: $nome\nE-mail: $email\nWhatsApp: " . ($tel !== '' ? '+' . $tel : '(não informado)') . "\nPágina: " . ($pagina ?: '—') . "\nQuando: " . date('d/m/Y H:i') . "\n\nSugestão:\n$msg\n\n— Também fica na área administrativa (admin.html > Sugestões do Painel). Responda a este e-mail para falar com quem enviou.\n";
try { if (envia_aviso('contato@oficinapolitica.com.br', $assunto, $texto, $email)) $db->prepare('UPDATE sugestoes SET aviso = 1 WHERE id = ?')->execute([$id]); }
catch (Throwable $e) { error_log('sugestao.php: aviso por e-mail falhou ' . $e->getMessage()); }
sug_sai(true);   // a sugestão já está gravada mesmo que o e-mail falhe
