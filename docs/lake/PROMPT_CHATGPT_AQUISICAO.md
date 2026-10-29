# Prompt para o ChatGPT — aquisição de dados (estrutura única)

Você é o responsável pela **aquisição** dos dados eleitorais da Oficina Política: buscar no TSE, baixar (somente no GitHub Actions), converter, conferir e publicar. A **estrutura** (esquema, camadas derivadas, painel) é do Claude. Existe uma única estrutura, definida em `docs/lake/ESTRUTURA.md` (branch `main` do repositório `eduvaldoski2/op-apuracao2turno`). Leia esse arquivo inteiro e `scripts/lake_gerais/build_lake.py` antes de qualquer ação.

## Autorizações (do usuário, Edu)
1. Mesclar o PR #1 (`lake-municipal`) no `main` e disparar manualmente o piloto de 2024 (`ufs=AC`) pelo navegador. Isto está autorizado.
2. Se o piloto passar nas conferências (pela política de divergência de ESTRUTURA.md), rodar 2024 `TODAS` e publicar a Release `lake-2024`.
3. Em seguida, **puxar as eleições anteriores**, uma por vez, na ordem: municipais 2020, 2016, 2012, 2008; depois gerais 2014, 2010, 2006, 2002 (as gerais de 2018, 2022 e 2026 já existem; não refazer). Só passe ao ano seguinte quando o anterior estiver `validado` ou `divergente` com relatório entregue. Autorizados: downloads no Actions, workflows manuais, Releases `lake-<ano>`, commits e PRs em `scripts/lake*`, `docs/lake*`, `.github/workflows/lake*`.
4. Em cada ano, antes de baixar, inventarie o que o TSE oferece (níveis: seção, zona ou município; cargos; turnos) e registre em `docs/lake/layouts/<ano>.md`. Se um ano só existir em nível de zona ou município (sem seção), publique o que existir, diga isso claramente e não invente seção.

## O que NÃO fazer
- Não crie esquema, nomes de colunas, nomes de arquivos ou conversores paralelos. Adapte `scripts/lake_gerais/build_lake.py` (parametrizado por ano e escopo: `gerais` ou `municipal`) e aposente o conversor `scripts/lake/build_2024.py` depois de portar para ele o que tem de bom (filtro de eleição ordinária, descarte de campos privados antes do banco, seleção unívoca de fonte, hash e manifesto, bloqueio de fonte que muda entre lotes). Um único workflow de aquisição, com entradas `ano`, `escopo` e `ufs`.
- Não altere `js/`, `css/`, `data/`, `index.html`, `painel.html`, nem as Releases `lake-2026/2022/2018`.
- Não baixe fora do Actions; não suba ZIPs brutos; não persista CPF, e-mail, título, nome social, nascimento completo.
- Não ajuste votos em silêncio; não mescle PR além do #1 sem pedir.

## Correções obrigatórias ao seu trabalho atual (revisão do Claude)
1. **Política de divergência**: aplique a de ESTRUTURA.md (classificar em explicadas/não explicadas). A de tolerância zero bloquearia quase todas as UFs, pois votos de candidatos indeferidos ou anulados sub judice aparecem na seção e não no munzona, e há seções agregadas ou não instaladas.
2. **Colunas faltantes**: inclua `situacao_candidatura`, `situacao_final`, `qt_votos_nominais_validos`, `secao_instalada`, `secao_anulada`, `cd_tipo_secao_agregada` e `federacao` conforme o esquema canônico (hoje o seu conversor guarda menos colunas que o canônico).
3. **Downloads**: baixe cada ZIP nacional uma vez por execução (job de preparo + artifact) e reaproveite nos lotes por UF.
4. **Saídas**: nomes planos canônicos (`secao_<ano>_<UF>.parquet`, `local_secao_<ano>.parquet` etc.), todos os cargos e turnos no mesmo arquivo da UF, dividindo só se passar de 2 GiB.
5. **Repositório**: não versione o log integral de 20 mil linhas nem o inventário nacional de 13,8 mil linhas em `docs/`; anexe-os à Release (ou deixe só o resumo e os hashes). O site publica o conteúdo do repositório.
6. **Disparo**: o job final não deve dar push direto em `main`; relatório e manifesto vão para a Release (e, se necessário, para um branch `lake-relatorios`).

## Entregas por ano
- Release `lake-<ano>` com os arquivos canônicos, `manifesto_<ano>.json` e `conferencia_<ano>.md`.
- `docs/lake/conferencia-<ano>.md` (resumo curto) e `docs/lake/layouts/<ano>.md`.
- Mensagem final com: estado (`validado`/`divergente`), nº de arquivos e linhas, lista das divergências explicadas e não explicadas, limitações do ano (cargos ou níveis ausentes), link da Release e do run.
- Se algo bloquear (fonte ausente, mudança de layout que exija nova coluna, falha repetida), pare nesse ano, relate com evidência e pergunte; não improvise.

## Observações
- Todos os valores devem ser conferidos contra o TSE; relate o que foi e o que não foi verificado, como já fez no log.
- Registre o que fizer em um log curto por execução (decisões, falhas, correções), sem repetir o formato gigante do log anterior.
