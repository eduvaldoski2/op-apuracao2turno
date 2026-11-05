# Oficina Política · Contexto do projeto e inventário técnico

Atualizado em 05/11/2026 (quinta-feira), ao fim da sessão de trabalho do chat "apuração/painel".
Finalidade: dar a qualquer chat novo do projeto o contexto do que existe, do que foi decidido e do que foi feito, para ninguém recomeçar do zero nem desfazer trabalho dos outros.

> Regra de leitura: tudo o que está aqui foi verificado no repositório ou no site publicado durante o trabalho, salvo onde aparece "não verificado". Segredos (senhas, token, chaves) **não** estão neste documento e não devem ser colados em lugar nenhum.

---

## 1. O projeto em uma página

- **O que é:** a Oficina Política (OP, antes "POLITICApro") é uma plataforma comercial para profissionais da política. Dono e decisor: Edu (consultor de campanhas e estrategista digital, Rio de Janeiro).
- **Público:** assessores, dirigentes partidários, políticos, candidatos, parlamentares, comunicação, cientistas políticos, acadêmicos, estudantes.
- **Três grupos de produto planejados:** (1) inteligência de dados eleitorais (todo o histórico do TSE, todos os cargos e níveis, dados demográficos, IBGE, saúde, educação, muita exportação de imagens, "tudo em um lugar"); (2) educação e treinamento (e-books e aulas online); (3) consultoria política e eleitoral.
- **Modelo:** freemium. O painel de apuração é a "boca do funil", público e gratuito. Presidente, governador e senador abertos; **deputados (federal e estadual) e anos anteriores exigem cadastro/login gratuito**; o detalhamento pago das proporcionais vem depois.
- **Nome:** o site e o app instalado se chamam **apenas "Oficina Política"**, sem a palavra "apuração" no nome (decisão de 05/11/2026). O logo do topo do painel leva à página inicial `https://oficinapolitica.com.br/`.
- **Divisão de trabalho de dados:** o ChatGPT busca, baixa e converte os dados do TSE (aquisição, em `docs/lake/` e `docs/divisoes/`); o Claude cuida da estrutura (esquema único, painel, front-end, API). Deve existir uma única estrutura de dados.
- **Módulos em andamento:** painel de apuração (este chat), **Radar Oficina Política** (curadoria de notícias, outro chat, `/radar`), relatório "Federação e partidos de esquerda 2026", página de cards compartilháveis (`/cartoes/`).

## 2. Preferências do Edu e regras de trabalho

- **Cards para redes sociais** sempre no conjunto completo de formatos: **1:1** (WhatsApp), **4:5** e **9:16** (Instagram/Stories). Nunca só um formato.
- Cards são só para celular/redes: **sem formatos largos (paisagem/slide)**.
- Idioma: português do Brasil, resposta objetiva, sem enrolação. Quer ver o resultado e o que falta, não o passo a passo.
- **Segurança:** nunca digitar nem guardar senhas ou o token de administração; não contornar bloqueios de rede por proxy; comandos `rm` só com cuidado (já houve apagamento acidental de imagens geradas); nunca `pkill -f` com padrão que case com o próprio shell.
- **Credenciais expostas em conversa anterior:** a senha do e-mail de contato e o `TOKEN_ADMIN` apareceram em chat. Foi recomendado trocar. Confirmar se já foi feito.
- Autorização operacional: o Edu autorizou usar o Chrome dele (Claude in Chrome) e o Mac quando necessário. Só ler, não alterar abas que ele usa (uma vez, por engano, a aba do Gerenciador de Arquivos foi usada para um teste e restaurada). Abrir aba própria e fechar ao terminar.
- Os chats do projeto **não enxergam uns aos outros**. A coordenação é por mensagens coladas pelo Edu e por este documento. Se um chat precisa de algo de arquivos que são de outro, descrever o pedido no chat do dono em vez de editar.

## 3. Infraestrutura e operação

| Item | Estado |
|---|---|
| Domínio / site | `oficinapolitica.com.br`, hospedagem **Hostinger** (raiz do site = raiz do repositório) |
| Cloudflare | na frente do site (DNS, cache de borda). Cache "DYNAMIC" para o manifesto; ocasionalmente é preciso limpar cache |
| Repositório | GitHub `eduvaldoski2/op-apuracao2turno`, branch `main` (~480 commits). Branches de dados: `dados`, `dados-b1…b5`, `depmun-log`, `depsec-log` (alimentadas por GitHub Actions) |
| Publicação | **`git push` na `main` publica o site sozinho**, com atraso de cerca de 2 a 6 minutos (já observado para HTML, JS, manifesto e PHP de `api/`). Não é preciso enviar arquivos pelo Gerenciador de Arquivos |
| Dados do TSE | coletados por **GitHub Actions** (25 workflows). O ambiente de trabalho do Claude não alcança TSE/IBGE; ver arquivos e rodar scripts só funciona sobre o que já está no repositório |
| API PHP | em `api/`, rodando na Hostinger com SQLite (`api/dados/*.sqlite`, bloqueado ao acesso externo) |
| `api/config.php` | só existe no servidor (ignorado pelo git). Contém: `TOKEN_ADMIN`, `CONTA_ATIVA` (hoje **true**), SMTP do `contato@oficinapolitica.com.br`, `ORIGENS_PERMITIDAS`, `SAL`, `GOOGLE_CLIENT_ID` (login Google ativo), `IA_CHAVE` (**vazia: a IA está desligada**) |
| E-mail | envio de códigos por SMTP autenticado da Hostinger (`contato@oficinapolitica.com.br`). WhatsApp para códigos: ainda não ativo (`canais_ativos()` devolve só e-mail) |
| Login Google | projeto "Oficina Politica" no Google Cloud (Google Auth Platform). Funciona para criar e entrar; o teste de ponta a ponta com um cadastro real pode ser refeito |
| Tamanho | `data/` ~710 MB e `.git` ~637 MB. Decisão pendente sobre enxugar o repositório |

**Servidor local de teste (para o Claude):** `python3 -m http.server 8012` (morre entre chamadas; relançar com `setsid nohup`), Playwright (Chromium já instalado) para capturas e downloads, `php -S` para testar `api/` com bancos de exemplo (PHP 8.3 + pdo_sqlite disponíveis).

## 4. Inventário do estado atual da plataforma

### 4.1 Páginas e rotas públicas
- **`/` (`index.html`)** capa do site: chamadas para Resultados eleitorais ("Do Brasil até a seção"), Radar, relatório da federação, cards; formulário de captação de contato.
- **`/painel.html`** o painel (SPA com roteador por hash). `/resultados/` só redireciona para ele. `/apuracao-2t-2026/` é a pasta da versão de testes (hoje vazia no repositório; `TESTE` em `js/config.js` ativa recursos em acerto nessas URLs).
- Rotas do painel: `#/` (2º turno presidente), `#/uf/{uf}`, `#/mun/{uf}/{cd}` e abaixo `/d/{i}` (distrito), `/b/n:NOME` (bairro), `/l/{zona-local}` (local, seções), `#/cand/L`, `#/comparar`, `#/p` (projeção), `#/metodo`. 1º turno: `#/t1[...]?c=<candidato>&cargo=gov|sen|depf|depe`.
- **`/cartoes/`** cards compartilháveis do 2º turno, com cadastro.
- **`/federacao-esquerda-2026/`** relatório web + PDF + cards.
- **`/radar/`** módulo de notícias, protegido por login (ver 4.6).
- **`/admin.html`** administração (token): cadastros e logins, métricas de uso, atalhos, pendências, instruções de anúncios.
- **`/privacidade.html`**, **`/termos.html`**.
- **Modo Telão/TV**: `?tv=1` ou botão "TV" (cast via PeerJS, tela cheia ou link); slides 16:9 trocando a cada 14 s, refeitos a cada divulgação do TSE. Não existe tela de "totens"; o telão é o que existe.

### 4.2 Eleições disponíveis no painel (2026)
- Presidente: 1º e 2º turno (apuração ao vivo do 2º turno em 25/10/2026; resultado oficial).
- Governador, senador: 1º turno (resultado oficial, por estado).
- Deputado federal e estadual/distrital: 1º turno (resultado oficial por estado; candidatos com cadastro; páginas de partido e federação, "Federações e partidos").
- **Histórico 2018 a 2024:** só RJ em `data/hist` e **ainda sem interface**. Lake de dados 2024 em montagem (ver `docs/`).
- Em aberto: exportação das páginas nacionais de deputados (Brasil, partidos/federações) trava sem erro; regiões IBGE fora do RJ indisponíveis; cards de deputados com mapa do estado e logo do partido.

### 4.3 Front-end (`js/`)
Principais módulos: `app.js` (roteador/estado), `t1.js` (1º turno, inclui página de candidato `heroCand`), `governador.js`, `deputados.js`, `depcand.js`, `depterr.js`, `partidos.js`, `comparar.js`, `proj.js` + `model.js` (projeção), `mapa*.js`/`map.js`/`mapabairros.js`/`mapapontos.js` (mapas), `charts.js`, `dispersao.js`, `foco.js`, `eleito.js`, `insights.js`, `sim.js`, `tv.js` (telão), `ia.js`/`iatools.js` (pergunte à IA; **desligada em produção**), `conta.js` (login/cadastro), `leads.js` (formulário), `consentimento.js`/`metricas.js` (LGPD e contador próprio sem cookies), `compartilhar.js`/`card.js` (cards), `export.js`/`expsec.js` (exportação), `regioes_uf.js`, `unidades.js`, `data.js`/`tse.js`/`util.js`/`config.js`/`ui.js`/`views.js`/`avisos.js`.
- **Exportação de imagens:** html2canvas (`js/export.js`) com formatos 1:1, 4:5, 9:16 (`FORMATOS_SEC`); listas longas são **paginadas** em várias imagens (`[data-export-lista]`, modo de 2 colunas `xl-2`, paginação de tabelas com corte para 7 colunas); mais de 5 imagens saem em ZIP (JSZip). Menu "⬇ Baixar" por seção (`expsec.js`). PDF/CSV/Excel também. Cards completos pelo diálogo Compartilhar (`card.js`).
- **Cache:** `node scripts/versao.mjs` carimba imports com `?v=<hash>`. Hoje também carimba `radar/_login.html`. **O hash muda a cada commit**: nunca fixar `?v=` à mão em lugar nenhum.

### 4.4 Dados (`data/`)
`base_1t.json` (1º turno por município), `res_1t.json`, `gov_1t.json`, `sen_1t.json`, `dep_1t/{federal,estadual}.json` (grupos, candidatos, votos nominais/legenda, vagas, QE por estado), `dep_mun/`, `dep_sec/`, `dep_top/`, `cand/` (cadastro de candidatos), `b1t/` e `bairros/` (locais e seções), `bairros_geo/`, `mapa_mun/`, `mapa_uf.json`, `mapa_br_mun.json`, `regioes/` e `regioes_uf/`, `hist/` (2018 a 2026, RJ), `vot/`, `live/` (apuração em tempo real, ignorado pelo git). `docs/lake/`, `docs/inventario-2024/` e `docs/divisoes/` documentam a aquisição de dados municipais 2024 e as divisões (regiões do Rio, macrorregiões).

### 4.5 API PHP (`api/`)
| Arquivo | Função |
|---|---|
| `_conta.php` | biblioteca: banco de contas, cadastro único, sessão por cookie, códigos, e-mail SMTP, Google, cota de IA, migração |
| `conta.php` | GET estado; POST `cadastrar`, `reenviar`, `confirmar`, `entrar`, `google`, `sair`, `esqueci`, `redefinir`, `excluir` |
| `lead.php` | recebe o formulário do site e grava no cadastro único |
| `exportar.php` | exportações e consultas do admin (token): `json`, `csv`, `audiencia` (hash SHA-256 para Meta/Google), `contas`, `uso_ia`, `eventos`, `excluir=` (LGPD) |
| `evento.php` | contador próprio de uso, anônimo |
| `ia.php` | pergunta à IA (desligada) |
| `live.php` | proxy/cache dos dados ao vivo do GitHub |

### 4.6 Contas, cadastro e Radar (estado de 05/11/2026)
- **Cadastro único** em `api/dados/contas.sqlite`, tabela `usuarios`: a mesma pessoa pode ser lead (formulário) e/ou ter login. Status: **`cadastro`** (deixou dados no formulário, ainda sem login), **`pendente`** (criou e não confirmou), **`ativo`** (tem login, só esse acessa o Radar), **`excluido`**. Colunas do formulário: telefone, e-mail, cidade, perfil, consentimentos (`c_contato`, `c_anuncios`), versão do texto, página, origem, user-agent, data do lead.
- **Migração automática e única** (`unifica_leads`, na primeira consulta ao banco): copia `leads.sqlite` para `usuarios`, une quem já tinha conta (pelo e-mail ou WhatsApp), faz **backup** em `api/dados/backup-unificacao-AAAAMMDD-HHMMSS/`, **não apaga** `leads.sqlite`, e grava o resumo em `api/dados/unificacao.log`. **Não verificado em produção** (o log e os totais exigem acesso ao servidor/token): conferir os totais em `admin.html`.
- Quem só preencheu o formulário ativa o login por **"Esqueci a senha"** (código por e-mail) ou por **"Continuar com Google"**. Mensagem de login errado orienta isso.
- `admin.html` mostra: cadastros (total), com login ativo, só cadastro, hoje, 7 dias, coluna "Situação", exportação CSV/audiência/e-mails, uso do painel e instruções de anúncios.
- **Radar** (`/radar/`, outro chat é o dono de `radar/*`): `radar/index.php` só entrega o conteúdo a quem passa em `usuario_atual()` (status `ativo`); qualquer falha cai na tela de login (`_login.html`), que monta o formulário de `js/conta.js`. Conteúdo em `_edicao.php`/`_shell.html`; quatro edições por dia (7h, 11h, 15h, 19h), editorias, "Giro OP" (notas curtas), fontes à vista. O Radar não guarda nada por usuário.
- **Regra para todos os chats:** quem mexe em `api/_conta.php`, `conta.php`, `lead.php`, `exportar.php` e no esquema de `usuarios` é este chat (apuração/contas). O Radar mexe só em `radar/*`.

### 4.7 App instalável (PWA)
`manifest.webmanifest`: nome e nome curto **"Oficina Política"**, `start_url` `/?origem=app` (abre a capa do site, não os resultados), `id` `/`, descrição "Dados e ferramentas eleitorais para quem faz política sem improviso.". Os HTML referenciam `/manifest.webmanifest?v=3`. Quem já instalou precisa limpar dados do site e reinstalar para ver o nome novo.

### 4.8 Workflows (GitHub Actions) e scripts
Workflows: coletor da apuração, base do 1º turno, bairros, geobairros, geoabertos, geoosm, regiões IBGE, cand, votos, logos, res1t, gov1t, sen1t, dep1t, depmun, depsec (e sonda), deptop, secoes (e sonda/teste), lake 2024 (inventário, build, sonda). Scripts relevantes: `coletor.mjs`, `res1t.mjs`, `gov1t.mjs`, `sen1t.mjs`, `dep1t.mjs`, `depmun.mjs`, `depsec.mjs`, `deptop.mjs`, `secoes.mjs`/`bu.mjs`/`ber.mjs` (boletim de urna), `build_*.{mjs,py}`, `versao.mjs`, `estudos/` (relatório da federação: `doc_json/doc_pdf/doc_web.py`, `card_relatorio.py`, `cadeiras.py`, `planilha.py`, `verifica.py`). Testes: `npm test` (modelo + backtest).

### 4.9 Relatório "Federação e os partidos de esquerda 2026"
`/federacao-esquerda-2026/` (HTML ~800 KB, PDF, `og-relatorio.jpg`) e cards em `cards/`: federais (3 formatos, `card_relatorio.py`) e **estaduais/distritais** (3 formatos, refeitos à mão a partir da imagem federal; o gerador oficial é `scripts/estudos/card_relatorio.py`, que pode ser adaptado para ficar idêntico). Seis cenários (FBE = PT, PCdoB, PV; PSB, PDT, PSOL/Rede, Cidadania).

## 5. O que foi feito nesta frente de trabalho (resumo cronológico)

1. **Exportação de imagens revisada:** listas de governador/senador viram imagens legíveis (`gv-lista`, 2 colunas compactas), tabelas largas reduzem colunas e ajustam fonte, paginação em séries, ZIP acima de 5 imagens.
2. **PDF de exemplos de todos os cards** exportáveis (vários estados e candidatos), com lacunas listadas.
3. **Página do candidato no 1º turno:** ao selecionar um candidato, o topo vira ficha dele (`heroCand`).
4. **Mapa mental e documento de telas (PDF):** estrutura do front-end, telas em notebook e celular, o que acontece em cada clique, levantamento das eleições disponíveis, tudo numerado (T-01..T-24, T-NN.N pontos de clique, A-01..A-15) para o UX designer.
5. **Card de deputados estaduais/distritais** igual ao federal (1:1, 4:5, 9:16), commitado em `federacao-esquerda-2026/cards/`.
6. **Simulação do distritão** (ver seção 6) e lista dos 513 eleitos por estado (PDF e planilha, fora do repositório).
7. **Análise do vídeo de voto distrital** do @danielhanuman (ver seção 6).
8. **Marca e app:** logo do topo do painel leva à capa; nome só "Oficina Política" no app e no site; `start_url` na raiz; manifesto versionado (`?v=`) porque o Chrome do celular guardava o manifesto antigo.
9. **Cadastro único (leads + logins)** com migração, backup, exportações e admin atualizados (seção 4.6).
10. **Login do Radar corrigido:** dois defeitos encadeados. (a) `js/conta.js` procurava a API em `/radar/api/conta.php` (404); agora usa `/api/conta.php` em `/radar/`. (b) `radar/_login.html` importava `conta.js?v=` com hash fixo antigo, o que mantinha a cópia velha em cache; agora o `versao.mjs` carimba esse arquivo.

## 6. Análises produzidas (para reaproveitar)

**Relatório da federação (esquerda, deputados):** federais 124 em 2026; até 143 (27,9% da Câmara) na FBE+PSB+PDT+PSOL/Rede; 137 na FBE+PSB+PDT; 132 na FBE+PSB; 131 na PSB+PDT; 129 na FBE+PSOL/Rede; 126 na PSB+Cidadania. Estaduais/distritais: 264 em 2026 (24,9% de 1.059), 275 (+11) no melhor cenário, 263 (−1) na PSB+Cidadania.

**Distritão (cada estado um distrito; elegem-se os mais votados), com votos nominais de 2026 e as mesmas vagas por estado:** PL 121→102 (−19), PT 70→77 (+7), UNIÃO 46→50, PSD 43→49 (+6), PP 41→44, MDB 36→41 (+5), REPUBLICANOS 41→40, PODE 27→25, PSB 15→18, PSOL 14→15, PCdoB 11→9, PDT 6→9, NOVO 10→9, PSDB 11→6 (−5), PV 7→6, AVANTE 5, PRD 5→4, REDE 1, CIDADANIA 0→1, SOLIDARIEDADE 2→1, MISSÃO 1. Esquerda 124→135. 450 dos 513 atuais seguiriam eleitos; 63 mudariam. Conta estática: não prevê mudança de candidaturas ou de voto. O resultado "real" da simulação bate com o oficial (513 cadeiras).

**Voto distrital (vídeo analisado):** 513 distritos de eleitorado igual (~222 mil votos), vence o partido/federação mais votado em cada distrito: PL com 22,7% dos votos ficaria com 235 cadeiras (45,8%). O vídeo não mostra o desenho dos distritos nem como cidades grandes foram divididas, e trata os partidos de esquerda como listas separadas. **O número depende inteiramente do desenho dos distritos**; uma simulação própria deveria testar vários desenhos e uma versão com a esquerda unida.

## 7. Pendências e riscos conhecidos

- Confirmar em `admin.html` os totais após a migração (cadastros, com login, só cadastro) e se o login do Radar voltou a funcionar no celular do Edu depois do último ajuste.
- Trocar `TOKEN_ADMIN` e a senha do e-mail de contato se ainda não foram trocados.
- Tela "Carregando…" e aba "IA" vistas no celular vinham de cópia antiga guardada no app instalado; reinstalar o app resolve. Confirmar.
- Textos do cadastro em `conta.js` citam "pergunta livre à IA" e "Presidente, governador e senador continuam abertos"; o Radar remove isso por script. Pedido: tornar os textos configuráveis por destino (`montarConta`).
- Exportação das páginas nacionais de deputados trava; PDF de páginas muito altas de deputados não verificado.
- Cards de deputados com mapa do estado e logo do partido; capturas de modais e do telão faltam no documento de UX; Google login de ponta a ponta.
- Histórico 2018 a 2024 sem interface; regiões IBGE só RJ; filtro de partido em vereadores.
- Tamanho do repositório (~1,3 GB somando `data/` e `.git`).
- Textos restantes que ainda citam "apuração" ou "2º turno": `resultados/index.html` (título), `cartoes/index.html` (título), `alt` da imagem de compartilhamento do painel.
- Ações do Edu dependem de ver no celular: o Claude não consegue abrir o site deslogado em produção, porque o Chrome dele está logado.

## 8. Armadilhas aprendidas (leia antes de mexer)

- `git push` publica o site; HTML, JS e PHP chegam em minutos. Verificar o resultado no site publicado, com URL nova (`?x=<tempo>`) para furar cache.
- Navegador, Cloudflare e o app instalado guardam **JS e manifesto por URL**. Qualquer arquivo com `?v=` fixo à mão fica velho. Use sempre `node scripts/versao.mjs` antes do commit (e confirme que o arquivo novo está na lista dele).
- Módulos ES com `?v=` diferente são **cópias diferentes** do módulo: ajustar `CONFIG` em uma cópia não vale para a outra.
- Commits terminam com as linhas `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>` e `Claude-Session: …`. Fluxo: `node scripts/versao.mjs; git add -A; git commit; git pull --rebase; git push`. O repositório recebe commits automáticos dos coletores o tempo todo: sempre `pull --rebase`.
- Chrome do Edu: a ferramenta bloqueia saídas que parecem conter cookies ou strings de URL; devolver só booleanos e contagens ao inspecionar `fetch`.
- Nunca editar arquivos de outro chat sem combinar; nunca colar token, senha ou chave em arquivo, commit ou chat.

## 9. Onde ficam os materiais fora do repositório

Gerados no ambiente de trabalho do Claude (não persistem entre sessões; peça de novo se precisar): PDF de exemplos de cards, PDF de estrutura e telas (mapa mental numerado), PDF e planilha do distritão por estado, imagens dos cards estaduais (estas últimas estão no repositório). Scripts auxiliares de teste ficam em `/tmp` e não são versionados.
