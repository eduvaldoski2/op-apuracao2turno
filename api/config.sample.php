<?php
// Copie para config.php e preencha. NUNCA publique o config.php em repositório público (está no .gitignore).
$ORIGENS_PERMITIDAS = ['https://seudominio.com.br', 'https://www.seudominio.com.br'];   // sites autorizados a enviar contatos
$TOKEN_ADMIN = '';   // sequência aleatória longa (mín. 20 caracteres) para usar em exportar.php
$SAL = 'troque-por-uma-frase-aleatoria';   // usado só para gerar o hash do IP (limite de envios)
// "Pergunte à IA" (api/ia.php). Sem a chave, a aba mostra "IA não ativada" e as consultas rápidas continuam funcionando.
$IA_CHAVE = '';   // chave da API da Anthropic (console.anthropic.com). Fica só aqui, nunca no navegador.
$IA_MODELO = 'claude-haiku-5-5';   // mais barato e rápido; use 'claude-sonnet-5-5' para respostas mais elaboradas
$IA_LIMITES = ['hora' => 12, 'dia' => 40, 'global_dia' => 2000, 'continuacao_hora' => 90];   // perguntas por visitante/hora, por visitante/dia e total/dia
