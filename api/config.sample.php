<?php
// Copie para config.php e preencha. NUNCA publique o config.php em repositório público (está no .gitignore).
$ORIGENS_PERMITIDAS = ['https://seudominio.com.br', 'https://www.seudominio.com.br'];   // sites autorizados a enviar contatos
$TOKEN_ADMIN = '';   // sequência aleatória longa (mín. 20 caracteres) para usar em exportar.php
$SAL = 'troque-por-uma-frase-aleatoria';   // usado só para gerar o hash do IP (limite de envios)
// "Pergunte à IA" (api/ia.php). Sem a chave, a aba mostra "IA não ativada" e as consultas rápidas continuam funcionando.
$IA_CHAVE = '';   // chave da API da Anthropic (console.anthropic.com). Fica só aqui, nunca no navegador.
$IA_MODELO = 'claude-haiku-5-5';   // mais barato e rápido; use 'claude-sonnet-5-5' para respostas mais elaboradas
// Cota da IA. Orçamento: o custo real de cada chamada (tokens × preço) é somado; ao chegar a 98% do teto mensal a IA pausa até o mês seguinte.
// Preços em US$ por milhão de tokens (Claude Haiku 5.5: US$ 0,10 entrada / US$ 0,50 saída). Se trocar o modelo, atualize os preços.
// Uma pergunta típica custa cerca de US$ 0,002 e uma pesada, cerca de US$ 0,01. Com 15 perguntas/mês por usuário, 270 usuários usando a cota inteira ainda cabem em US$ 20.
// Entrar com o Google (opcional): ID do cliente OAuth criado em console.cloud.google.com (APIs e serviços > Credenciais > ID do cliente OAuth > Aplicativo da Web),
// com as origens JavaScript autorizadas https://oficinapolitica.com.br e https://www.oficinapolitica.com.br. Em branco = o botão não aparece.
$GOOGLE_CLIENT_ID = '';
// Contas e pergunta à IA (versão de testes em /apuracao-2t-2026/teste/). Deixe false para manter os dois endpoints desligados.
$CONTA_ATIVA = false;
$IA_COTA = ['usuario_mes' => 15, 'usuario_dia' => 5, 'orcamento_mes_usd' => 20.0, 'preco_in_usd_mtok' => 0.10, 'preco_out_usd_mtok' => 0.50];
// Contas (api/conta.php). O cadastro exige confirmar o contato por código de 6 dígitos.
$CONTA = [
  'email_de' => 'nao-responda@oficinapolitica.com.br',   // remetente dos códigos por e-mail (use um endereço do próprio domínio; configure SPF/DKIM na Hostinger para não cair no spam)
  // Envio autenticado (recomendado): crie a caixa nao-responda@oficinapolitica.com.br na Hostinger e preencha. Sem isso usa mail(), que na hospedagem compartilhada costuma não entregar.
  'smtp' => ['host' => 'smtp.hostinger.com', 'porta' => 465, 'user' => 'nao-responda@oficinapolitica.com.br', 'pass' => ''],
  'sessao_dias' => 30,
  'teste' => false,   // true = NÃO envia nada e grava os códigos em api/dados/codigos_teste.log (só para testar; nunca deixe true no ar)
  // Confirmação por WhatsApp (opcional): WhatsApp Business Cloud API da Meta, com um modelo de mensagem de AUTENTICAÇÃO aprovado. Em branco = só e-mail.
  'whatsapp' => ['token' => '', 'phone_id' => '', 'template' => '', 'idioma' => 'pt_BR'],
];
