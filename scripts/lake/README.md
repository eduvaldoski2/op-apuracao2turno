# Teste municipal de 2024

Escopo: eleição ordinária de 2024, prefeito (11) e vereador (13), 1º e 2º turno onde houver. Nenhum outro ano será baixado. As bases nacionais de ano 2024 também contêm suplementares de anos posteriores: o processamento filtra o tipo de eleição ordinária; o cadastro de locais é limitado às datas 06/10/2024 e 27/10/2024. Cargos de vice-prefeito são excluídos. O cadastro mantém candidatos sem votos.

## Inventário

`inventory_catalog.py` consulta apenas metadados e HEAD. O manifesto ativo é `docs/inventario-municipal-fontes.json`.

`lake-inventario-2024.yml` executa a etapa 0 no PR e permite execução manual: 26 lotes de UF e um nacional, no máximo três simultâneos. ZIPs e CSVs brutos nunca são publicados. `inspect_2024.py` registra cabeçalhos, número exato de registros por membro CSV, geração, dimensões e CRC. PDFs de totalização são identificados como PDFs; não recebem contagem fictícia de linhas CSV. Contagens BRASIL e UF nunca são somadas como dados distintos.

## Processamento manual

Após o workflow estar disponível no branch padrão, executar **Lake municipal - teste 2024 (manual)**, arquivo `.github/workflows/lake-2024.yml`. O GitHub exige presença no branch padrão para disponibilizar inicialmente o despacho manual: https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow . Este PR não faz merge automaticamente.

1. Usar `ufs=AC` para o primeiro piloto.
2. Examinar `docs/conferencia-2024.md`, manifestos e listas CSV. Falhas de fonte ou divergências deixam a execução vermelha e bloqueiam a release.
3. Após avaliar o piloto, usar `ufs=TODAS` para as 26 UFs ou uma lista, como `AC,RJ`. Não incluir DF ou exterior.

Cada runner baixa um ZIP de cada vez. Nas bases nacionais, lê somente o membro da UF quando presente; caso contrário, filtra o CSV nacional em streaming. Campos não autorizados são descartados antes de persistir um CSV intermediário. Nascimento completo é transformado em ano em memória. Não há CSV bruto extraído em disco. ZIPs temporários são removidos após cada recurso e no encerramento normal ou por exceção do lote; runners hospedados são descartados ao final do job.

A dependência é `duckdb==2.0.0`, confirmada no índice oficial PyPI e instalada no ambiente de validação. O código usa conversões numéricas estritas para evitar converter silenciosamente erros em nulos. Valores textuais ausentes reconhecidos (`#NULO`, `#NE`, `NÃO DIVULGÁVEL`, vazio) tornam-se nulos; bairro ausente torna-se string vazia. Coordenadas numéricas são preservadas sem geocodificação ou correção inventada.

## Saídas e conferências

Os quatro esquemas estão definidos em `SCHEMAS`, em `build_2024.py`, e são conferidos após a escrita. Parquets zstd têm partições por tabela/ano/UF/cargo e turno. `local_votacao` é comum aos cargos e não recebe uma partição de cargo artificial. `zona` e `local_votacao` preservam o turno no caminho, nome e manifesto, sem acrescentar coluna ao esquema solicitado. Não combinar turnos ao ler esses arquivos.

Os assets de Releases possuem nomes planos e únicos. O manifesto indica o caminho particionado original para reconstrução. Cada arquivo tem linhas, bytes e SHA-256; arquivos maiores são divididos por blocos de até dois milhões de linhas, com bloqueio se alguma parte atingir 2 GiB. CPF, e-mail, título, nome social e nascimento completo não são gravados nos Parquets, CSVs intermediários, divergências ou logs.

Conferências executadas por UF:

- Soma por candidato/município e também por candidato/município/zona contra `QT_VOTOS_NOMINAIS` oficial, via junção externa para detectar faltantes dos dois lados.
- Contagem de seções distintas por município/turno/cargo contra o detalhe por seção, sem contar linhas de candidatos como seções. Diferenças por seções sem votos ou não instaladas são listadas; não são removidas para forçar igualdade.
- Soma por cargo e turno contra `QT_VOTOS` do detalhe por município/zona do TSE.
- Legenda por município/zona, unicidade de candidato, siglas ambíguas, candidatos sem cadastro, códigos especiais desconhecidos, locais ambíguos, seções sem local/duplicadas e votos negativos ou nulos.

As diferenças são escritas integralmente em CSVs com identificadores e totais, sem valores pessoais. Municípios com bairro ausente aparecem no manifesto e relatório. As gerações das fontes podem diferir; todas são preservadas. O pipeline não promete reproduzir uma versão antiga da totalização com fontes judiciais atualizadas e não corrige somas em silêncio.

Uma UF divergente não gera Parquets finais e bloqueia a publicação do conjunto solicitado. Artifacts guardam os relatórios para diagnóstico. O agregador também bloqueia publicação se detectar mudança no SHA-256 de uma mesma fonte entre UFs ou assets corrompidos/ausentes.

## Publicação e relatório

O workflow registra somente `docs/conferencia-2024.md` e o manifesto agregado pequeno em `data/lake/municipal/2024/manifesto.json` no branch da execução. Parquets e listas completas de divergências não entram no git. Um conflito de push falha visivelmente; não há force-push.

Todos os lotes solicitados precisam passar para criar a release de teste `lake-municipal-2024-teste-<run_id>`. Ela começa como rascunho, recebe todos os assets e só então é publicada como pré-release. Não sobrescreve releases anteriores. Artifacts são retidos por sete dias; o relatório/manifeste no git e assets da release preservam o resultado durável. Uma execução parcial, como AC, identifica explicitamente a UF e não significa cobertura nacional.

## Verificação local

```bash
python -m pip install -r scripts/lake/requirements.txt
python -m unittest discover -s scripts/lake -p 'test_*.py' -v
```

Os testes são sintéticos e verificam minimização, exclusão de suplementares, manutenção de brancos/nulos/legenda, conciliação, lista de diferenças e os quatro esquemas Parquet. Não representam execução sobre os dados reais. Os scripts recusam baixar ZIPs fora do GitHub Actions.
