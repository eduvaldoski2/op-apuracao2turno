<?php
// Recebe os contatos do formulário do painel e grava no cadastro único (api/dados/contas.sqlite, tabela usuarios, status "cadastro"; bloqueado para acesso externo).
// Quem já tem conta mantém senha e status: só os dados do formulário são atualizados. Requer PHP 7.4+ com pdo_sqlite (padrão na Hostinger).
require __DIR__ . '/config.php';
require __DIR__ . '/_conta.php';
$origem = cabecalhos_api('POST, OPTIONS');
function lead_sai($ok, $cod = 200, $erro = '') { http_response_code($cod); echo json_encode($ok ? ['ok' => true] : ['ok' => false, 'erro' => $erro]); exit; }
if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') lead_sai(false, 405, 'método inválido');
if ($origem && !in_array($origem, cfg('ORIGENS_PERMITIDAS', []), true)) lead_sai(false, 403, 'origem não permitida');
$j = json_decode(file_get_contents('php://input'), true);
if (!is_array($j)) lead_sai(false, 400, 'dados inválidos');
$nome = trim((string)($j['nome'] ?? '')); $email = strtolower(trim((string)($j['email'] ?? '')));
if ($nome === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) lead_sai(false, 422, 'nome ou e-mail inválido');
if (empty($j['consentimento_contato'])) lead_sai(false, 422, 'consentimento necessário');
$tel = preg_replace('/\D+/', '', (string)($j['telefone'] ?? ''));
// formulários da página inicial e da página de cards: WhatsApp com DDD é obrigatório (10 ou 11 dígitos)
if (in_array(($j['formulario'] ?? ''), ['home', 'cards'], true) && (strlen($tel) < 10 || strlen($tel) > 13)) lead_sai(false, 422, 'WhatsApp inválido');
if ($tel !== '' && strlen($tel) <= 11) $tel = '55' . $tel;
// limite simples: 8 envios por hora por IP
if (!taxa_ok('lead:' . ip_hash(), 8, 3600)) lead_sai(false, 429, 'muitas tentativas');
$db = conta_db();
lead_gravar($db, ['email' => $email, 'nome' => mb_substr($nome, 0, 120), 'telefone' => mb_substr($tel, 0, 20), 'cidade' => mb_substr((string)($j['cidade'] ?? ''), 0, 80), 'perfil' => mb_substr((string)($j['perfil'] ?? ''), 0, 60),
  'c_contato' => 1, 'c_anuncios' => empty($j['consentimento_anuncios']) ? 0 : 1, 'texto_versao' => mb_substr((string)($j['texto_versao'] ?? ''), 0, 10), 'pagina' => mb_substr((string)($j['pagina'] ?? ''), 0, 200),
  'origem' => mb_substr(json_encode($j['origem'] ?? new stdClass(), JSON_UNESCAPED_UNICODE), 0, 600), 'agente' => mb_substr((string)($_SERVER['HTTP_USER_AGENT'] ?? ''), 0, 200), 'criado' => gmdate('c')]);
lead_sai(true);
