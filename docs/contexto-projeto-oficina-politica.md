# Oficina Política · Contexto do projeto, história técnica e inventário da plataforma

Versão estendida, de 05/11/2026 (quinta-feira). Origem: chat "apuração/painel" do projeto Oficina Política, de 23/10 a 05/11/2026.

**Para quem é:** qualquer chat novo do projeto. Depois de ler isto, o chat deve conseguir (1) saber o que existe e onde está, (2) saber por que as coisas são como são, (3) repetir os caminhos que funcionaram e evitar os que falharam, (4) criar uma ação nova coerente com o que já foi feito.

**Regras de leitura**
- Tudo foi verificado no repositório ou no site publicado durante o trabalho, salvo onde aparece **"não verificado"**.
- **Nenhum segredo está aqui** (senhas, `TOKEN_ADMIN`, chaves) e nenhum deve ser colado em arquivo, commit ou chat.
- Quando houver conflito entre este documento e o código, vale o código. Corrija este documento (veja a seção 13).

**Índice**
1. O projeto · 2. Quem decide e como o Edu quer trabalhar · 3. Infraestrutura e operação · 4. Como publicar, testar e evitar cache (receitas) · 5. História técnica por fases (o que deu certo, o que deu errado) · 6. Inventário: páginas e rotas · 7. Inventário: front-end · 8. Inventário: dados · 9. Inventário: API, contas, cadastro, Radar · 10. PWA, analytics, LGPD, IA, anúncios · 11. Workflows e scripts · 12. Relatório da federação, cards, estudos e lake · 13. Como manter este documento · 14. Análises produzidas · 15. Pendências e lacunas · 16. Armadilhas · 17. Coordenação entre chats · 18. Glossário

---

## 1. O projeto

- **O que é:** a Oficina Política (OP; antes "POLITICApro") é uma plataforma comercial para profissionais da política. Slogan aprovado: **"Para quem faz política sem improviso"**. Dono e decisor: Edu (consultor de campanhas e estrategista digital, Rio de Janeiro).
- **Público:** assessores, dirigentes partidários, políticos, candidatos, parlamentares, equipes de comunicação, cientistas políticos, acadêmicos, estudantes.
- **Três grupos de produto planejados:**
  1. Inteligência de dados eleitorais: todo o histórico do TSE, todos os cargos e níveis, dados demográficos, IBGE, saúde, educação, muita exportação de imagens, "tudo em um lugar".
  2. Educação e treinamento: e-books e aulas online.
  3. Consultoria política e eleitoral.
- **Modelo:** freemium. O painel de resultados é a "boca do funil": público e gratuito. **Presidente, governador e senador abertos; deputados (federal e estadual) e anos anteriores exigem cadastro/login gratuito**; o detalhamento pago das proporcionais vem depois.
- **Nome:** o site e o app instalado se chamam **só "Oficina Política"**, sem "apuração" no nome (decisão de 05/11/2026). O logo do topo do painel leva à capa `https://oficinapolitica.com.br/`.
- **Divisão de trabalho em dados (decisão de 29/10):** o ChatGPT **adquire** (busca, baixa, converte, confere, publica em Releases); o Claude **estrutura** (esquema único, painel, front-end, API, login). **Existe uma única estrutura de dados**, definida em `docs/lake/ESTRUTURA.md`. Mudança de esquema passa por issue/PR e aprovação do Claude.
- **Módulos hoje:** Resultados eleitorais (painel, este chat), **Radar Oficina Política** (curadoria de notícias, outro chat), relatório "Federação e partidos de esquerda 2026", cards compartilháveis (`/cartoes/`), cadastro/login, administração.
- **Marco histórico do painel:** nasceu para o **2º turno presidencial de 25/10/2026** (apuração ao vivo, coletor a cada ~3 s de pausa, projeção). Depois da eleição virou o painel de **resultados oficiais** (1º e 2º turno, governador, senador, deputados).

## 2. Quem decide e como o Edu quer trabalhar

- **Idioma/tom:** português do Brasil, objetivo. Quer o resultado e o que falta, não o passo a passo. Gosta de ver prova visual (imagens, PDF) quando algo é de interface.
- **Cards para redes sociais:** sempre o conjunto completo **1:1** (WhatsApp), **4:5** e **9:16** (Instagram/Stories). Nunca só um formato. **Nada em formato largo (paisagem/slide).** Decisão firmada em 26/10 e reafirmada.
- **Autonomia dada:** autorizou usar o Chrome dele (extensão Claude in Chrome) e o Mac quando necessário para publicar, conferir e fazer ações no Hostinger/GitHub. Pediu que se faça direto, sem pedir confirmação a cada passo, **mas** segredos e senhas continuam proibidos.
- **Segurança (em vigor):**
  - nunca digitar, guardar ou revelar senha, `TOKEN_ADMIN`, chave de API;
  - não contornar bloqueios de rede por proxy/espelho;
  - `rm` só com cuidado (houve apagamento acidental de imagens geradas), e **nunca `pkill -f` com padrão que case com o próprio shell**;
  - credenciais **expostas em chat anterior**: a senha do e-mail de contato e o `TOKEN_ADMIN` apareceram. Foi recomendado trocar. **Não confirmado** se foi feito.
- **Chrome do Edu:** usar só abas próprias e fechá-las. Uma vez (por engano) a aba do Gerenciador de Arquivos do Hostinger foi navegada para um teste; foi restaurada com "voltar". Se o Edu interromper uma ferramenta do navegador ("Request interrupted"), parar e responder à nova mensagem dele.
- **Frustração registrada (05/11):** os chats do projeto não se enxergam e o Edu acha isso ruim ("é muito ruim"). Este documento existe para reduzir esse custo. Quem encontrar problema que pertence a outro chat deve **redigir uma instrução pronta para o Edu colar lá**, em vez de só dizer "não é comigo".

## 3. Infraestrutura e operação

| Item | Estado |
|---|---|
| Domínio / site | `oficinapolitica.com.br`, hospedagem **Hostinger** (LiteSpeed/Apache). A raiz do site é a raiz do repositório. |
| CDN | **Cloudflare** na frente (DNS e cache de borda). Já devolveu cópia com erro 404 de JS (ver 5, fase 3). |
| Repositório | GitHub `eduvaldoski2/op-apuracao2turno`, branch `main` (~480 commits, a maioria de coletores automáticos). Branches de dados: `dados` (live), `dados-b1…b5` (resultado por seção), `depmun-log`, `depsec-log`. |
| Publicação | **`git push` na `main` publica sozinho** (integração Git da Hostinger), em cerca de **2 a 6 minutos**: HTML, JS, CSS, manifesto e PHP de `api/`. **Não é preciso enviar arquivos pelo Gerenciador de Arquivos.** |
| Coleta de dados | **GitHub Actions** (25 workflows). O ambiente do Claude **não alcança TSE nem IBGE** (rede com lista de permissão). Só se testa sobre o que já está no repositório. |
| API PHP | `api/*.php` na Hostinger, com SQLite em `api/dados/*.sqlite` (pasta com `.htaccess` negando acesso externo). |
| `api/config.php` | **só existe no servidor** (ignorado pelo git). Contém `TOKEN_ADMIN`, `CONTA_ATIVA` (**true** em produção), SMTP de `contato@oficinapolitica.com.br`, `ORIGENS_PERMITIDAS`, `SAL`, `GOOGLE_CLIENT_ID` (login Google ativo), `IA_CHAVE` (**vazia: IA desligada**). Há `api/config.exemplo.php` como referência. |
| E-mail | Envio de códigos por **SMTP autenticado da Hostinger** (`contato@oficinapolitica.com.br`). Antes era `mail()` e não chegava. Canal WhatsApp para códigos **não ativo** (`canais_ativos()` devolve só e-mail). |
| Login Google | Projeto "Oficina Politica" no Google Cloud (Google Auth Platform). Servidor verifica o token. Funciona para criar e entrar; teste de ponta a ponta com cadastro real pode ser refeito. |
| Tamanho | `data/` ≈ 710 MB (maiores: `dep_sec` 280 MB, `hist` 192 MB, `dep_top` 73 MB, `bairros_geo` 42 MB, `bairros` 39 MB) e `.git` ≈ 637 MB. Decisão pendente sobre enxugar. |
| Ambiente de trabalho do Claude | Contêiner efêmero. `python3 -m http.server 8012` (morre entre chamadas; relançar com `setsid nohup`), Playwright/Chromium para capturas, `php -S` para testar `api/` (PHP 8.3 + pdo_sqlite), Node para scripts. Arquivos em `/tmp` **não persistem** entre sessões. |

## 4. Receitas (como fazer)

**4.1 Publicar uma mudança**
1. `git pull --rebase origin main` (o repositório recebe commits automáticos o tempo todo).
2. Editar. Se mexeu em JS/CSS/HTML que importa módulos: `node scripts/versao.mjs` (carimba `?v=<hash>`; ver 16).
3. `git add -A; git commit` (mensagem em português, com as linhas de atribuição do ambiente); `git pull --rebase`; `git push origin HEAD:main`.
4. Esperar 2–6 min. Conferir no site com URL nova (`?x=<tempo>`) para furar cache. Para PHP, conferir por requisição GET sem login (resposta JSON de estado).

**4.2 Testar localmente**
- Estático: `python3 -m http.server 8012` na raiz, abrir `http://127.0.0.1:8012/painel.html` com Playwright. Dados grandes já estão no repositório.
- API: `php -S 127.0.0.1:PORTA` na raiz com um `api/config.php` de teste e bancos SQLite de exemplo (nunca o do servidor). Dá para reproduzir cadastro, login, migração e exportação.
- Reproduzir bug de cache/rota: Playwright com `page.on('response')` para listar 404.

**4.3 Inspecionar o site em produção pelo Chrome do Edu**
- Abrir **aba própria** e fechar no fim. A ferramenta bloqueia saídas que lembram cookies/URLs com query ("[BLOCKED: Cookie/query string data]"): devolver só booleanos e contagens. Atenção: o Chrome do Edu está **logado**, então não mostra o que um visitante deslogado vê.

**4.4 Rodar coleta de dados**
- Só por GitHub Actions (aba Actions → workflow → "Run workflow", ou `gh workflow run`). Os scripts `scripts/*.mjs` rodam lá. Cada coletor publica no próprio branch ou em `data/`.

**4.5 Adicionar um cargo/eleição ao painel (padrão usado em senador e deputados)**
1. Coletor `scripts/<cargo>1t.mjs` + workflow `.github/workflows/<cargo>1t.yml` → `data/<cargo>_1t.json`.
2. Módulo `js/<cargo>.js` com a tela; registrar no roteador `#/t1…?cargo=` (em `js/eleicao.js`, função de hash, e em `js/app.js`).
3. Chip do seletor de eleição (`CARGOS` em `js/eleicao.js`); marcar `cadastro: true` se exigir login.
4. Exportação: marcar áreas com `data-export` / `[data-export-lista]` para entrar no menu "⬇ Baixar".
5. `versao.mjs`, commit, push.

**4.6 Gerar card de divulgação**
- Cards do relatório: `scripts/estudos/card_relatorio.py` (gera os PNG; não verificado se por Pillow ou HTML). Gerar **os três formatos**. Cards do painel: diálogo Compartilhar (`js/card.js`) com html2canvas.

**4.7 Mexer em cadastro/login**
- Só no chat dono (apuração/contas). Testar em `php -S` com SQLite de exemplo, incluindo migração (`unifica_leads`) a partir de um `leads.sqlite` e `contas.sqlite` de teste.

## 5. História técnica por fases

### Fase 0 · Fundação do painel de 2º turno (23/10, madrugada)
- Primeiro commit: modelo estatístico de projeção, coletor, interface. Pasta do painel `/apuracao-2t-2026/`.
- **Ensaio do coletor com o 1º turno** em branch `ensaio` para testar sem a eleição acontecer.
- **Certo:** testar o pipeline com dados reais já publicados antes do dia da eleição. **Errado:** nenhum erro grave; houve ajustes de mobile e do GitHub Pages (que depois foi abandonado em favor da Hostinger).
- Descoberta: no 1º turno o TSE usa `e=s` para "segue para o 2º turno", **não** "eleito". Regra: selo "Eleito" só quando o texto da situação diz "Eleito" (corrigido em 23/10 e de novo em 26/10 para governador).

### Fase 1 · Camada de bairros e locais de votação (23/10)
- Objetivo: Brasil › Estado › Município › Bairro › Local › Seção, com resultados e mapas.
- Caminho: sondar fontes (várias "Sondagem 1–6"), decodificar **boletim de urna** (formato BER/ASN.1: `scripts/ber.mjs`, `bu.mjs`; bug de "octetos aninhados" corrigido), coletar por seção em **5 grupos de estados** (workflows `secoes.yml`, branches `dados-b1…b5`) com etags persistentes.
- Malhas de bairro: IBGE 2022 (cobertura mínima 45%); OpenStreetMap para os maiores municípios sem malha (6 fatias em paralelo, tempos longos); GeoSampa para os distritos de SP; IPEDF para as RAs do DF; Goiânia por setores; **Voronoi dos locais de votação** como aproximação para ~3.944 municípios sem malha (com aviso na tela) e para 15 capitais/cidades >200 mil eleitores.
- **Certo:** Voronoi como plano B honesto (rotulado); OSM substitui o aproximado quando existe limite real.
- **Errado e corrigido:** eleitorado contado em dobro (seção agregada somada duas vezes) → "contar cada seção uma só vez"; busca de tabela sem ignorar acentos; nomes de Goiânia incompletos.

### Fase 2 · Produto de apuração ao vivo (23/10)
- Marcha da apuração com horário das parciais; mapa de variação vs. 1º turno; bolhas; dispersão abstenção × votação; balão de leitura automática; painel "Quanto falta apurar"; viradas e marcos com avisos do navegador.
- **Modo Telão/TV**: tela cheia; slides 16:9 a cada 14 s; transmissão por **PeerJS** (pareamento por código de 4 dígitos) e Chromecast. Depois simplificado (sem Avisos/Transmitir, barra fixa com os dois primeiros). **O botão "Telão" foi removido em 30/10**; `js/tv.js` e `?tv=1` continuam. Não há tela de "totens".
- Design: revisão de marca (logo, favicon, Open Graph), rodapé com fontes recolhíveis, tabelas alfabéticas, "[+] Entenda".
- LGPD/Analytics: consentimento de cookies, Meta Pixel e Google Ads sob consentimento (IDs vazios), **GA4 `G-DE3VNZ3VWH` só com consentimento**, política de privacidade e termos de uso, captação de leads por API PHP.

### Fase 3 · A noite da apuração (25/10) — lições mais caras
Problema central: **latência e cópia velha**. Percurso:
1. O raw.githubusercontent entrega cópia de **até 5 min** e a CDN do GitHub às vezes devolve arquivo velho. Tentativas, nesta ordem: parâmetro único na URL (ajudou pouco) → `api/live.php` com cópia curta (20 s → 6 s) → **`live.php` busca pelo código (sha) da versão mais nova** via API do git (resolveu a cópia velha) → painel lê primeiro o intermediário e cai para o GitHub como reserva; intervalo 8 s.
2. Coletor: o arquivo "Brasil" do TSE ficava parado → detectar mudança por UF e município; completar municípios atrasados com **boletins de urna**; nunca deixar totais abaixo da soma dos municípios; timeout cobrindo a leitura do corpo (travava); 40 → 80 leituras em paralelo; pausa de 3 s.
3. **Cache de JS**: duas vezes o servidor/Cloudflare guardou `app.js` incompleto ou uma **resposta 404** para a URL do módulo. Solução permanente: `scripts/versao.mjs` troca o carimbo `?v=` por commit (nunca reutilizar um `?v=` que já falhou).
- **Certo:** observabilidade (`X-OP-Dbg`, `meta.json` com tempo de leitura, log por ciclo). **Errado:** várias rodadas de "novo carimbo de versão" feitas à mão — é exatamente o que o `versao.mjs` automatiza.

### Fase 4 · Cards, exportação e conta (26/10)
- `/cartoes/` com cadastro **opcional** e catálogo (`cartoes/data/catalogo.json`: coleções resultado, tema-01…11, rio, cidades, séries "Pesquisas × urnas", "A virada"). Página não depende de consentimento/métricas para abrir (um bug a travava).
- Exportação por seção (PNG, PDF, CSV, Excel). Decisão: **somente formatos de celular** (1:1, 4:5, 9:16); o 3:5 antigo foi trocado; tabela longa vira **várias imagens** (ZIP acima de 5).
- Comparador (estados, regiões, municípios, bairros). **Pergunte à IA** (gráficos 1:1/4:5/9:16).
- **Conta**: cadastro com código por e-mail/WhatsApp, aceite de mensagens, **cota por usuário e teto mensal de gasto**. Decisão importante: **endereço público sem conta/IA**; versão completa em `/resultados/teste/` (noindex). Endpoints só respondem com `CONTA_ATIVA`.
- Governador: resultado do 2º turno nas páginas dos estados e resumo no Brasil.
- Contador próprio de uso (`api/evento.php`): anônimo, sem cookies; aba "Uso do painel" no admin.

### Fase 5 · Estudos da federação e lake (27–29/10)
- Migração do histórico do RJ (2018–2026) do repositório anterior `apuracao-4013` **sem alterar arquivos**, com manifesto SHA-256 e verificador.
- **Cadastro de candidaturas 2026** (`consulta_cand` + complementar + bens + cassação); votação proporcional 2026 e 2022 por UF.
- Relatório "Federação e partidos de esquerda 2026" (simulador de cadeiras QE/QP/sobras, cenários A–F, planilha, verificação independente), PDF, página web e cards (ver 12).
- **Lake de dados**: sondas e `build_lake.py` (TSE por seção → Parquet → Release `lake-2026`, 35 arquivos, ≈283 MB), inventário municipal 2024 (por UF) e conferências 2018/2022/2026. Prompt único para o ChatGPT (aquisição), bloco de continuidade e pesquisa de divisões administrativas.
- **Errado e corrigido:** `encoding` do DuckDB falhou com CSVs do TSE (→ `iconv`); upload de release sem `-R`; tabelas auxiliares ausentes em 2022 (→ tolerância a colunas diferentes); locais 2022 vêm em CSV único sem `_BRASIL`.

### Fase 6 · Eleição proporcional e senador (29–31/10) — o maior volume do projeto
- Seletor de eleição (ano, turno, cargo) nas telas; **deputados pedem cadastro**.
- Senador (cargo 5), governador (fichas dos candidatos), deputados federal/estadual (cargos 6 e 7; no DF "distrital").
- Federações: coleta por agrupamento e partido (legenda e nominal), logos dos partidos (Wikimedia Commons, fallback pt.wikipedia, aliases Mobiliza/UP), lista nacional por partido/federação.
- Votos por município (`dep_mun`), **por seção** (`dep_sec`, um arquivo por candidato + seções por município; 27 estados em workflows paralelos) e **mais votados por local** (`dep_top`).
- Página do candidato por níveis (município › bairro › local › seção), regiões intermediárias do IBGE, "mais votados por território" respeitando partido/federação.
- Login: SMTP autenticado; botão **Entrar com o Google** (verificação no servidor; exclusão de conta sem senha).
- Exportação: listas paginadas (eleitos, mais votados, distritos), governador/senador em 2 colunas, tabelas com colunas secundárias, PDF de telas altas sem páginas em branco; CSV/Excel desativados em deputados.
- **Errado e corrigido:** commit dos dados saía no caminho errado (`data/dep_1t`); tela do Brasil de deputados lenta/falhando (→ vira escolha de estado, recarrega, botão "tentar de novo", erro no console); tabela no celular com coluna # larga; coluna do 2º turno cortada em exportações.

### Fase 7 · 02 a 05/11
- Card de **deputados estaduais/distritais** do relatório (1:1, 4:5, 9:16), igual ao federal.
- **Distritão** (simulação de cadeiras) e lista de eleitos por estado; análise do vídeo de **voto distrital** (seção 14).
- **Radar** entra no site (`/radar/`, protegido por conta); capa reorganizada com três boxes simétricos.
- **Marca/App:** logo do painel leva à capa; nome só "Oficina Política"; `start_url` na raiz; manifesto versionado.
- **Cadastro único** (leads + logins) — ver 9.3.
- **Login do Radar** corrigido (dois defeitos encadeados) — ver 9.5.

### Quadro-resumo: o que funcionou / o que não funcionou
| Funcionou | Não funcionou (e o que veio no lugar) |
|---|---|
| Coletar só por GitHub Actions e publicar em branch de dados | Baixar do ambiente do Claude (rede bloqueada) |
| `live.php` com busca por sha | `raw.githubusercontent` direto (cópia de 5 min) |
| `versao.mjs` carimbando `?v=` | Hashes `?v=` escritos à mão (viram cache velho) |
| Voronoi rotulado como "aproximado" | Deixar município sem mapa |
| Rodar teste do coletor com o 1º turno antes da eleição | Testar só no dia |
| Cadastro único em uma tabela | Duas bases (leads × contas) sem ligação |
| Endpoint absoluto `/api/conta.php` | Endpoint relativo (quebra em `/radar/`) |
| Exportar em vários PNG/ZIP | Uma imagem gigante e ilegível |
| Reinstalar o app após mudar manifesto | Esperar o Chrome do celular trocar o nome sozinho |
| Mandar instrução pronta para o outro chat | Editar arquivo que é de outro chat |

## 6. Inventário: páginas e rotas públicas

- **`/` (`index.html`)** capa: "Resultados eleitorais · Do Brasil até a seção", Radar, relatório da federação, formulário de captação (contato + consentimentos LGPD).
- **`/painel.html`**: SPA do painel, roteador por hash. Servida em **`/resultados/`** (reescrita no `.htaccess`). `/apuracao-2t-2026[/]` redireciona **301** para `/resultados` (a pasta existe vazia no repositório). `/resultados/teste/` = versão de testes (noindex; `TESTE` em `js/config.js` liga conta/IA).
- **Rotas do painel:** `#/` (2º turno, presidente), `#/uf/{uf}`, `#/mun/{uf}/{cd}` e abaixo `/d/{i}` (distrito/região), `/b/n:NOME` (bairro), `/l/{zona-local}` (local, seções), `#/cand/L`, `#/comparar`, `#/p` (projeção; é botão na tela do presidente), `#/metodo`. 1º turno: `#/t1[/uf/{uf}…]?c=<candidato>&cargo=gov|sen|depf|depe`.
- **`/cartoes/`** hub de cards compartilháveis, com cadastro opcional.
- **`/federacao-esquerda-2026/`** relatório web + PDF + cards + `og-relatorio.jpg`.
- **`/radar/`** módulo de notícias, protegido por login.
- **`/admin.html`** administração (pede o token na tela; ele fica só na cabeça do Edu): cards "Cadastros e logins" (total, com login ativo, só cadastro, hoje, 7 dias), tabela com coluna "Situação", exportação CSV/audiência/e-mails, aba "Uso do painel", atalhos, pendências, instruções de anúncios.
- **`/privacidade.html`**, **`/termos.html`**.
- **Telão:** `?tv=1` (sem botão visível). Não verificado se `tv.html` ainda existe na raiz (não está).

## 7. Inventário: front-end (`js/`, `css/`)

Módulos principais (todos ES modules):
- **Núcleo:** `app.js` (roteador/estado/telas), `config.js` (RAIZ, TESTE, CONFIG: fontes, intervalo 8000 ms, métricas, GA4, anúncios, privacidade, `inicioApuracao`), `data.js`, `tse.js`, `util.js`, `ui.js`, `views.js`, `avisos.js`.
- **2º turno/projeção:** `model.js` + `proj.js` (modelo estatístico, backtest em `tests/`), `charts.js`, `dispersao.js`, `foco.js`, `insights.js`, `eleito.js` (tela cheia do eleito), `sim.js`.
- **1º turno e cargos:** `t1.js` (inclui ficha de candidato `heroCand`), `governador.js`, `deputados.js`, `depcand.js` (página do candidato), `depterr.js` (mais votados por território), `partidos.js` (partidos e federações), `eleicao.js` (seletor ano/turno/cargo e portão de cadastro dos deputados), `comparar.js`.
- **Mapas:** `mapa*.js`, `map.js`, `mapabairros.js`, `mapapontos.js`, `regioes_uf.js`, `unidades.js`.
- **Saída/compartilhamento:** `export.js`, `expsec.js` (menu "⬇ Baixar" por seção), `card.js`, `compartilhar.js`.
- **Conta e medição:** `conta.js` (login/cadastro; `CONTA`, `carregarConta`, `montarConta`, `sairConta`), `leads.js`, `consentimento.js`, `metricas.js`, `ia.js`/`iatools.js` (IA, desligada), `tv.js`.
- **Exportação de imagens:** `html2canvas`; `FORMATOS_SEC` (1x1, 4x5, 9x16); listas longas paginadas (`[data-export-lista]`, modo 2 colunas `xl-2`); tabelas largas cortam para 7 colunas; >5 imagens → ZIP (JSZip, em `vendor/`). QR dos cards vem de lib em `vendor/` (o SVG precisa de `viewBox` e tamanho 100%, senão sai minúsculo).
- **Portão de cadastro dos deputados:** em `js/eleicao.js`, `CARGOS` com `cadastro: true` para `dep-federal`/`dep-estadual`; chips ganham 🔒 se `!CONTA.logado`; abre modal com `montarConta`. Em produção o painel carrega `conta.js?v=<hash>`.
- **Cache:** ver 16.

## 8. Inventário: dados (`data/`)

| Pasta/arquivo | Conteúdo | Origem/coletor |
|---|---|---|
| `base_1t.json` | 1º turno presidente por município (base do modelo) | `base.yml` |
| `res_1t.json`, `gov_1t.json`, `sen_1t.json` | resultado oficial do 1º turno (presidente, governador, senador) | `res1t/gov1t/sen1t` |
| `dep_1t/{federal,estadual}.json` | grupos (federação/partido) → par → candidato `{n,nm,v,st,e}`; vagas, QE por UF | `dep1t` |
| `dep_mun/` | votos de deputados por município | `depmun` |
| `dep_sec/` | votos por seção (um arquivo por candidato + seções por município), 27 UFs | `depsec` |
| `dep_top/` | mais votados por local | `deptop` |
| `cand/` | cadastro de candidaturas 2026 | `cand.yml` |
| `b1t/`, `bairros/`, `bairros_geo/` | 1º turno por seção, locais de votação, malhas de bairro | `secoes`, `bairros`, `geo*` |
| `mapa_uf.json`, `mapa_br_mun.json`, `mapa_mun/` | geometrias | `build_map*.py` |
| `regioes/`, `regioes_uf/` | regiões (Rio: 8/10; demais UFs: regiões intermediárias IBGE) | `regioes_ibge.yml` |
| `hist/` | histórico 2018–2026 **só RJ** + "Brasil 2026 por local de votação"; manifesto SHA-256 | migrado de `apuracao-4013` |
| `vot/` | votação proporcional 2026/2022 por UF (munzona agregado) | `votos.yml` |
| `live/` | placar ao vivo (ignorado pelo git; vive no branch `dados`) | `coletor.yml` |
| Lake (fora do repo) | Releases `lake-2018/2022/2026` (Parquet) | `lakeg-build.yml` |

Convenções: código de município é o **do TSE** (não IBGE); chave de seção `uf+cd_municipio_tse+zona+secao`; candidato `sq_candidato`. **LGPD:** nunca persistir CPF, e-mail, título, nome social, data de nascimento completa, telefone, bens (só `ano_nascimento`).

## 9. Inventário: API, contas, cadastro e Radar

### 9.1 Arquivos de `api/`
| Arquivo | Função |
|---|---|
| `_conta.php` | Biblioteca: banco de contas, **cadastro único**, sessão por cookie, códigos, SMTP, Google, cota de IA, migração `unifica_leads`, `lead_gravar` |
| `conta.php` | GET estado; POST `cadastrar`, `reenviar`, `confirmar`, `entrar`, `google`, `sair`, `esqueci`, `redefinir`, `excluir` |
| `lead.php` | Recebe o formulário da capa e grava no cadastro único (`taxa_ok('lead:'.ip_hash(),8,3600)`) |
| `exportar.php` | (token) `json`, `csv`, `audiencia` (SHA-256 para Meta/Google), `contas`, `uso_ia`, `eventos`, `excluir=` (LGPD, anonimiza) |
| `evento.php` | Contador próprio, anônimo |
| `ia.php` | Intermediário com a API da Anthropic, cotas por usuário e teto mensal (**desligado**: chave vazia) |
| `live.php` | Proxy/cache do placar ao vivo e do resultado por seção (`/live/…`, `/liveb/N/…`) |
| `config.exemplo.php` | Modelo do `config.php` |

Bancos (`api/dados/`, negados externamente): `contas.sqlite` (tabela `usuarios`, `sessoes`, `codigos`, `meta`), `eventos.sqlite`, `leads.sqlite` (**legado, mantido**; não é mais escrito).

### 9.2 Eventos medidos (`evento.php`)
`candidato_foco`, `exportar`, `compartilhar_abrir`, `compartilhar`, `compartilhar_formato`, `tv`, `mapa_modo`, `dispersao_eixo`, `eleicao_cadastro`, entre outros; vistos na aba "Uso do painel". Sem cookies (tratamento do IP: não verificado).

### 9.3 Cadastro único (implementado e publicado em 05/11)
- Tabela `usuarios` guarda a mesma pessoa como lead e/ou login. **Status:** `cadastro` (deixou dados no formulário, sem login) → `pendente` (criou conta, não confirmou) → `ativo` (**tem login**) → `excluido`.
- Colunas do formulário na mesma tabela: telefone, e-mail, cidade, perfil, `c_contato`, `c_anuncios`, versão do texto (10 chars), página, origem (json, 600 chars), user-agent, data do lead.
- `lead_gravar($db,$d)`: casa por e-mail, coluna `email` ou WhatsApp; **atualiza sem tocar em senha/status**; senão insere `status='cadastro'`, `canal='email'`.
- `unifica_leads($db)`: migração **única e automática** na primeira consulta ao banco; `BEGIN IMMEDIATE`; cria `backup-unificacao-AAAAMMDD-HHMMSS/` (com `.htaccess` negando) com cópias de `leads.sqlite` e `contas.sqlite`; ignora excluídos/inválidos/`.invalid`; **nunca apaga `leads.sqlite`**; resumo em `api/dados/unificacao.log`; erros vão para o mesmo log sem derrubar a API.
- `conta.php`: `acha_usuario` ignora `excluido` e cai no campo `email`; `cadastrar` sobre um lead existente muda para `pendente`; mensagem de login errado orienta "Esqueci a senha" para quem só se cadastrou no site.
- `exportar.php`: `situacao` no json/csv; `uso_ia` traz `cadastros_sem_login`; excluir anonimiza usuário e apaga sessões/códigos.
- **Para o Edu saber quantos têm login:** `admin.html` (token) → cards "com login ativo" e "só cadastro". **Não verificado em produção** (migração e totais).
- **Por que existe:** o Edu pediu "unificar tudo em um banco" porque quem se cadastrou no site já deveria poder ter login. Quem só preencheu o formulário ativa pelo "Esqueci a senha" ou "Continuar com Google".

### 9.4 Tela de cadastro/login (`js/conta.js`)
- `montarConta(elemento, callback)`; endpoint: `/api/conta.php` absoluto quando a página é `/radar/…`, senão `RAIZ + 'api/conta.php'`.
- Texto padrão cita IA e "Presidente, governador e senador continuam abertos" — o Radar remove isso por script. **Pedido em aberto:** tornar os textos configuráveis por destino.

### 9.5 Radar (`/radar/`, dono: outro chat)
- `radar/index.php` exige `config.php` + `_conta.php` e só entrega conteúdo se `usuario_atual()` for `ativo`; senão mostra `_login.html` (que importa `/js/config.js` e `/js/conta.js` com `?v=`).
- Conteúdo: `_edicao.php` (bloco de dados entre marcadores), `_shell.html`, `arquivo/AAAA-MM-DD-HHh.php` (arquivo de edições), `track.php`/`_track.php`/`relatorio.php` (rastreio de compartilhamento: código do remetente, cookie 30 dias, relatório), `tools/publicar.cjs` (valida ids/ORDER/GIRO, calcula etiquetas NOVO/ATUALIZADA, mínimo 5 NOVO e 10 NOVO+ATUALIZADA) e `tools/INSTRUCOES.md`.
- **Edições:** 7h, 11h, 15h, 19h (America/Sao_Paulo). Editorias: Política, Economia, Regiões (RJ, SP, MG, NE, Sul, Norte, CO), Giro OP, tendências.
- **Defeitos corrigidos em 05/11 ("O cadastro não está disponível", espaço de login em branco):**
  1. `conta.js` resolvia a API para `/radar/api/conta.php` → 404. Reproduzido com Playwright; corrigido com endpoint absoluto.
  2. `radar/_login.html` tinha `?v=472774c2` escrito à mão; o navegador reusava o `conta.js` antigo. Agora `versao.mjs` carimba esse arquivo.
- **Contrato entre chats:** o Radar edita só `radar/*`. Este chat (contas) edita `api/_conta.php`, `conta.php`, `lead.php`, `exportar.php`, esquema de `usuarios`. **Avisar antes de enviar `api/*`**: o Radar depende de `config.php` e `_conta.php`. Não verificado: confirmação visual do login do Radar no celular do Edu após o último ajuste.

## 10. PWA, analytics, LGPD, IA, anúncios

- **PWA:** `manifest.webmanifest` — nome e nome curto "Oficina Política", `start_url` `/?origem=app`, `id` `/`, descrição "Dados e ferramentas eleitorais para quem faz política sem improviso."; `index.html` e `painel.html` ligam `/manifest.webmanifest?v=3`; `apple-mobile-web-app-title` igual. **Quem já instalou mantém o nome antigo e a cópia antiga do app**: limpar dados do site e reinstalar. (O erro de "Carregando…" e a aba IA vistos no celular vinham dessa cópia antiga.)
- **Analytics:** GA4 `G-DE3VNZ3VWH` carrega só com consentimento; recusar limpa cookies do GA. Contador próprio sem cookies. Medição agregada da Cloudflare citada na política. Meta Pixel e Google Ads: IDs vazios (desligados); `admin.html` traz as instruções para ligar.
- **LGPD:** banner de consentimento por categoria (só registra categorias perguntadas); caixa de autorização de contato desmarcada e obrigatória no formulário; `privacidade.html` e `termos.html`; exclusão de conta (`excluir`), com anonimização.
- **IA ("Pergunte à IA"):** `ia.php`/`iatools.js`, cota por usuário e teto mensal; **desligada** (sem `IA_CHAVE`); a interface só aparece em `/resultados/teste/`. Decisão do Edu: o endereço público não mostra IA nem conta de IA.
- **Dados do controlador:** `CONFIG.privacidade` (CNPJ e endereço em branco — preencher antes de ligar anúncios).

## 11. Workflows (GitHub Actions) e scripts

**Workflows (25):** `coletor` (cron */10, ~355 min, publica `data/live` no branch `dados`), `base`, `secoes` (resultado por seção, 5 grupos → `dados-b1…b5`), `bairros`, `geobairros`, `geoabertos`, `geoosm`, `regioes_ibge`, `cand`, `votos`, `logos`, `res1t`, `gov1t`, `sen1t`, `dep1t`, `depmun`, `depsec` (+ `depsec-sonda`), `deptop`, `sonda`, `teste-secoes`, `lake-2024`, `lake-inventario-2024`, `lakeg-build`, `lakeg-sonda`.

**Scripts de `scripts/`:** coleta (`coletor.mjs`, `secoes.mjs`, `bu.mjs`, `ber.mjs`, `res1t/gov1t/sen1t/dep1t/depmun/depsec/deptop.mjs`, `osm_baixar.mjs`, `regioes_ibge.mjs`, `logos_partidos.mjs`), construção (`build_bairros.mjs`, `build_cand.py`, `build_geo_*.py`, `build_map*.py`, `build_regioes_rio.py`, `build_votos.py`), publicação (`versao.mjs`), apoio (`mock_tse.mjs`, `sonda*.{sh,mjs}`, `valida_secoes.mjs`, `verifica_hist.py`), `lake/` e `lake_gerais/` (`build_lake.py`), `estudos/` (relatório da federação), `apuracao-4013/` (herança do Rio). Testes: `npm test` (modelo + backtest) em `tests/`.

## 12. Relatório, cards, estudos e lake

**Relatório "Federação e os partidos de esquerda 2026"** (`/federacao-esquerda-2026/`, HTML ~800 KB, PDF, `og-relatorio.jpg`): análise geral, um capítulo por cenário, metodologia no fim, **declaração de uso de IA** na metodologia e na ficha técnica, contracapa com o slogan aprovado, formulário de cadastro e botão-âncora. Cenários: FBE (= PT, PCdoB, PV), PSB, PDT, PSOL/Rede, Cidadania. Scripts: `cadeiras.py` (simulador QE/QP/sobras), `estudos.py`, `planilha.py` (uma única simulação, regra do TSE; limite de candidatos vira aviso), `verifica.py` (verificação independente), `doc_json/doc_pdf/doc_web.py`, `card_relatorio.py`, `og_relatorio.py`.

**Cards do relatório** (`federacao-esquerda-2026/cards/`): federais e estaduais/distritais, cada um em 1:1, 4:5, 9:16. Texto aponta para a capa do site; **QR leva à página do relatório**; endereço do site em destaque; diferenças entre parênteses. O card estadual foi refeito a partir da imagem federal (gerador original adaptável em `scripts/estudos/card_relatorio.py`).

**Hub `/cartoes/`:** catálogo `cartoes/data/catalogo.json` (chaves `v`, `gerado`, `colecoes`, `ufs`, `cidades`); coleções "resultado", "tema-01…11", "rio", "cidades", séries "Pesquisas × urnas" e "A virada". Rodapé dos cards: QR da página, "Quer ver mais dados?" e site em destaque.

**Lake e aquisição:** `docs/lake/ESTRUTURA.md` (contrato), `LEIA-ME-2026.md`, `PROMPT_CHATGPT_AQUISICAO.md`, `conferencia-2018/2022/2026.md`; `docs/inventario-municipal*.{md,json}`, `docs/inventario-2024/`, `docs/divisoes/` (UFs, cidades >200 mil eleitores, Rio 4013 com Zona Sudoeste), `docs/conferencia-2024.md`. Estado: `lake-2026` publicada (35 arquivos); 2018/2022 conferidos; **municipal 2024 em montagem**. Leitura direta com DuckDB das Releases.

## 13. Como manter este documento
- Arquivos: `docs/contexto-projeto-oficina-politica.md` (repositório) e o doc do Projeto `claude/oficina-politica-contexto-e-inventario.md` (o Edu o usa como contexto de todos os chats).
- Ao fim de uma sessão com mudanças relevantes: atualizar as seções 5 (fase), 6–12 (inventário), 15 (pendências) e a data do topo; reescrever o doc inteiro no Projeto (`project_write` não faz patch); copiar para `docs/` e commitar.
- Marcar o que **não foi verificado**. Nunca incluir segredo.

## 14. Análises produzidas (reaproveitar)

**Federação (esquerda, deputados):** federais 124 em 2026; até **143** (27,9% da Câmara) com FBE+PSB+PDT+PSOL/Rede; 137 FBE+PSB+PDT; 132 FBE+PSB; 131 PSB+PDT; 129 FBE+PSOL/Rede; 126 PSB+Cidadania. Estaduais/distritais: 264 em 2026 (24,9% de 1.059), 275 (+11) no melhor cenário, 263 (−1) em PSB+Cidadania.

**Distritão (cada estado é um distrito; elegem-se os mais votados)**, com votos nominais de 2026 e as mesmas vagas por estado: PL 121→102 (−19), PT 70→77, UNIÃO 46→50, PSD 43→49, PP 41→44, MDB 36→41, REPUBLICANOS 41→40, PODE 27→25, PSB 15→18, PSOL 14→15, PCdoB 11→9, PDT 6→9, NOVO 10→9, PSDB 11→6, PV 7→6, AVANTE 5, PRD 5→4, REDE 1, CIDADANIA 0→1, SOLIDARIEDADE 2→1, MISSÃO 1. Esquerda 124→135. 450 dos 513 atuais seguiriam eleitos; 63 mudariam. É conta estática (não prevê mudança de candidaturas nem de voto). Entregue ao Edu: PDF e planilha com os 513 por estado (fora do repositório; sai de novo a partir de `data/dep_1t/federal.json`).

**Voto distrital (vídeo analisado):** 513 distritos de eleitorado igual (~222 mil votos), vence o partido/federação mais votado em cada distrito: PL com 22,7% dos votos ficaria com 235 cadeiras (45,8%). O vídeo **não mostra o desenho dos distritos** nem como cidades grandes seriam divididas e trata a esquerda como listas separadas. **O número depende inteiramente do desenho**; os 235 não são auditáveis. Uma simulação própria deveria testar vários desenhos e uma versão com a esquerda unida.

## 15. Pendências e lacunas

**Verificações que dependem do Edu**
- Totais da migração em `admin.html` (cadastros, com login, só cadastro) — **não verificado em produção**.
- Login do Radar funcionando no celular dele; reinstalar o app (nome e abertura na capa).
- Trocar `TOKEN_ADMIN` e a senha do e-mail de contato, se ainda não trocou.

**Técnicas**
- Exportação das páginas **nacionais** de deputados (Brasil, partidos/federações) trava sem erro; PDF de páginas muito altas de deputados não verificado.
- Cards de deputados com **mapa do estado e logo do partido**; capturas de modais e do telão faltam no documento de UX.
- Teste de ponta a ponta do login Google com cadastro real.
- `conta.js`: textos configuráveis por destino (pedido do Radar).
- Histórico 2018–2024 **sem interface** (só RJ nos dados); regiões IBGE só fora do RJ via intermediárias; filtro de partido em vereadores; lake municipal 2024.
- Tamanho do repositório (~1,3 GB somando `data/` e `.git`): decidir estratégia (Releases/LFS/branch de dados).
- Textos que ainda citam "apuração" ou "2º turno": título de `resultados/index.html`, título de `cartoes/index.html`, `alt` da imagem de compartilhamento do painel.
- WhatsApp como canal de código; IA (chave, custo e política) — decisão de produto pendente.

**Detalhes que este documento ainda não cobre bem** (candidatos a próxima rodada): lista arquivo a arquivo de `css/`; esquema campo a campo dos JSON de `data/`; lista completa de cards do catálogo; layouts do documento de UX (T-01…T-24, A-01…A-15, que existe só em PDF fora do repositório); parâmetros do modelo de projeção; regras de cota da IA.

## 16. Armadilhas (leia antes de mexer)

- `git push` publica o site: HTML, JS e PHP chegam em minutos. Conferir no site publicado com URL nova.
- Navegador, Cloudflare e **app instalado** guardam JS e manifesto **por URL**. Qualquer `?v=` fixo à mão fica velho. Usar `node scripts/versao.mjs` antes do commit e confirmar que o arquivo novo está na lista dele (`arqs`).
- Módulos ES com `?v=` diferente são **cópias diferentes**: ajustar `CONFIG` em uma não vale para a outra.
- O `?v=` muda a **cada** execução do `versao.mjs`; só rodar quando for commitar.
- `.htaccess`: JS/CSS têm `max-age=3600`; HTML `no-cache`; imagens `86400`.
- O repositório recebe commits dos coletores o tempo todo: **sempre `pull --rebase`**.
- Código de município é do TSE, não do IBGE; seção agregada não se soma duas vezes.
- `e=s` no 1º turno = "segue", não "eleito".
- Strings PHP em aspas simples: ao gerar código por script, escapar aspas internas (já houve `status='pendente'` quebrando o arquivo).
- Chrome do Edu: saídas com cookies/URLs com query são bloqueadas; devolver booleanos/contagens.
- Nunca editar arquivo de outro chat sem combinar; nunca colar token, senha ou chave em arquivo, commit ou chat.
- Commits terminam com as linhas de atribuição do ambiente (`Co-Authored-By: …` e `Claude-Session: …`).
- Não usar `rm -rf` com variáveis vazias; não usar `pkill -f` que case com o próprio shell; `grep -r` sobre `/tmp` inteiro trava — usar caminho restrito ou rodar em segundo plano.

## 17. Coordenação entre chats

| Chat | Dono de | Não mexe em |
|---|---|---|
| Apuração/painel/contas (este) | `js/`, `css/`, `painel.html`, `index.html`, `admin.html`, `api/*` (contas, lead, exportar, live, evento, ia), `data/`, workflows, `manifest`, `docs/` | `radar/*` |
| Radar | `radar/*` (edições, tools, arquivo, rastreio) | `api/_conta.php`, `conta.php`, `lead.php`, `exportar.php`, esquema `usuarios` |
| ChatGPT (aquisição de dados) | download/conversão/Release dos lakes e relatórios de conferência em `docs/lake/` | `js/`, painel, esquema |

Regras: perguntar ao Edu antes de cruzar fronteira; escrever a instrução pronta para ele colar; `radar/index.php` depende de `api/config.php` e `api/_conta.php`, então qualquer envio de `api/` deve ser avisado.

## 18. Glossário
- **OP:** Oficina Política. **Boca do funil:** o painel público e gratuito. **Telão:** modo TV do painel. **BU/BER:** boletim de urna e seu formato de codificação. **QE/QP:** quociente eleitoral/partidário. **FBE:** federação PT+PCdoB+PV. **Distritão:** eleitos = mais votados do estado. **Voto distrital:** um deputado por distrito. **Lake:** conjunto de Parquet por ano (Releases do GitHub). **Cadastro único:** tabela `usuarios` com leads e logins. **Edição (Radar):** publicação das 7h/11h/15h/19h.
