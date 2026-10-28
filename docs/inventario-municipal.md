# Inventário municipal do TSE — etapa 0

Escopo ativo: **somente 2024, como teste**, conforme instrução do usuário. Os demais anos permanecem adiados. Consulta em 28/10/2026. **Inventário preliminar: a inspeção do conteúdo dos ZIPs está pendente.**

Este documento separa recursos publicados no catálogo, disponibilidade HTTP e conteúdo efetivamente inspecionado. A presença de uma URL não comprova integridade, abrangência territorial, cargos, turnos nem conciliação dos votos. Nenhum ZIP eleitoral foi baixado nesta sessão. Não houve conversão para Parquet, execução de GitHub Actions, publicação de dados ou conferência de votos.

O registro por recurso, incluindo URL oficial, identificador CKAN, tamanho obtido por HEAD, horário da consulta e eventuais erros, está em [inventario-municipal-fontes.json](inventario-municipal-fontes.json). Ele pode ser atualizado com `python scripts/lake/inventory_catalog.py`, usando apenas a biblioteca padrão do Python. Esse script consulta JSON do catálogo e cabeçalhos HTTP; nunca lê o corpo dos ZIPs.

## Como interpretar as medidas

- **Tamanho ZIP**: `Content-Length` da resposta HEAD do CDN, em bytes; não é estimativa de Parquet nem tamanho descompactado. Falhas são registradas, sem substituição por zero.
- **Data de geração**: ainda não lida. A futura inspeção deve capturar `DT_GERACAO` e `HH_GERACAO`, quando presentes, por CSV interno, inclusive se houver mais de uma data. `Last-Modified` do HTTP e atualização dos metadados CKAN são datas diferentes e não as substituem.
- **Colunas e linhas**: não medidas. Os metadados consultados não fornecem os cabeçalhos e contagens. Não se estima quantidade de linhas a partir do ZIP comprimido. A medição deve ocorrer exclusivamente no GitHub Actions e indicar se a contagem é exata ou amostral.
- **Cargos**: prefeito (`11`) e vereador (`13`) são o recorte solicitado, ainda não verificado dentro dos arquivos. Vice-prefeito e quaisquer outros cargos devem ser excluídos do lake de votos. Os turnos existentes também precisam ser identificados no conteúdo.
- **Ausência**: “não listado” significa ausência nos conjuntos consultados; não significa prova de inexistência em todo o acervo do TSE. Erro de consulta nunca significa arquivo inexistente.

## Disponibilidade por ano

| Ano | Recursos selecionados | Menor nível de votos catalogado | Cargos/turnos a verificar | ZIPs: soma dos bytes por HEAD | Colunas | Linhas aproximadas | Geração interna | Não listado/limite |
| --- | ---: | --- | --- | ---: | --- | --- | --- | --- |
| 2024 | 59 | Seção | 11 e 13; turnos no conteúdo | 6,296,749,057 | Pendente | Não estimadas | Não lida | Cobertura de campos de local/bairro/coordenadas ainda não verificada |

## Arquivos publicados e tamanhos

As tabelas abaixo reproduzem URLs retornadas pelo catálogo oficial; não são URLs construídas por suposição. As fontes eleitorais são exclusivamente do domínio do TSE. A disponibilidade por HEAD é uma fotografia da consulta e não substitui um download com verificação de integridade.

Para todas as linhas, **colunas, número de linhas e data de geração interna permanecem pendentes de inspeção no Actions**. Os tamanhos e erros individuais também constam no JSON vinculado acima.

### 2024

Catálogos: [resultados](https://dadosabertos.tse.jus.br/dataset/resultados-2024); [candidatos](https://dadosabertos.tse.jus.br/dataset/candidatos-2024); [eleitorado](https://dadosabertos.tse.jus.br/dataset/eleitorado-2024).

Recursos selecionados: **59**; soma dos ZIPs: **6,296,749,057 bytes** (6.297 GB decimais). Não é o volume final do lake. Downloads de ZIPs e conferências: **nenhum**. Colunas, linhas e datas de geração: **pendentes**.

| Arquivo oficial | Nível catalogado | ZIP (bytes) | HTTP Last-Modified (GMT) |
| --- | --- | ---: | --- |
| [votacao_candidato_munzona_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2024.zip) | Município/zona | 48,229,790 | Wed, 28 Oct 2026 05:25:23 GMT |
| [votacao_partido_munzona_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_partido_munzona/votacao_partido_munzona_2024.zip) | Município/zona | 6,146,861 | Wed, 28 Oct 2026 05:25:04 GMT |
| [detalhe_votacao_munzona_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_munzona/detalhe_votacao_munzona_2024.zip) | Município/zona | 1,507,501 | Wed, 28 Oct 2026 05:24:59 GMT |
| [detalhe_votacao_secao_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2024.zip) | Seção | 87,270,063 | Mon, 22 Jun 2026 14:48:38 GMT |
| [Relatorio_Resultado_Totalizacao_2024_AC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AC.zip) | Totalização (a inspecionar) | 18,864,465 | Wed, 28 Oct 2026 05:19:44 GMT |
| [Relatorio_Resultado_Totalizacao_2024_AL.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AL.zip) | Totalização (a inspecionar) | 65,418,565 | Wed, 28 Oct 2026 05:19:45 GMT |
| [Relatorio_Resultado_Totalizacao_2024_AM.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AM.zip) | Totalização (a inspecionar) | 57,379,913 | Wed, 28 Oct 2026 05:19:45 GMT |
| [Relatorio_Resultado_Totalizacao_2024_AP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AP.zip) | Totalização (a inspecionar) | 13,810,211 | Wed, 28 Oct 2026 05:19:45 GMT |
| [Relatorio_Resultado_Totalizacao_2024_BA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_BA.zip) | Totalização (a inspecionar) | 314,106,620 | Wed, 28 Oct 2026 05:19:48 GMT |
| [Relatorio_Resultado_Totalizacao_2024_CE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_CE.zip) | Totalização (a inspecionar) | 133,681,706 | Wed, 28 Oct 2026 05:19:49 GMT |
| [Relatorio_Resultado_Totalizacao_2024_ES.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_ES.zip) | Totalização (a inspecionar) | 73,787,351 | Wed, 28 Oct 2026 05:19:49 GMT |
| [Relatorio_Resultado_Totalizacao_2024_GO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_GO.zip) | Totalização (a inspecionar) | 186,379,876 | Wed, 28 Oct 2026 05:19:51 GMT |
| [Relatorio_Resultado_Totalizacao_2024_MA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MA.zip) | Totalização (a inspecionar) | 160,648,235 | Wed, 28 Oct 2026 05:19:52 GMT |
| [Relatorio_Resultado_Totalizacao_2024_MG.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MG.zip) | Totalização (a inspecionar) | 656,519,054 | Wed, 28 Oct 2026 05:19:57 GMT |
| [Relatorio_Resultado_Totalizacao_2024_MS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MS.zip) | Totalização (a inspecionar) | 64,309,268 | Wed, 28 Oct 2026 05:19:58 GMT |
| [Relatorio_Resultado_Totalizacao_2024_MT.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MT.zip) | Totalização (a inspecionar) | 106,532,981 | Wed, 28 Oct 2026 05:19:58 GMT |
| [Relatorio_Resultado_Totalizacao_2024_PA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PA.zip) | Totalização (a inspecionar) | 133,179,503 | Wed, 28 Oct 2026 05:19:59 GMT |
| [Relatorio_Resultado_Totalizacao_2024_PB.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PB.zip) | Totalização (a inspecionar) | 134,442,544 | Wed, 28 Oct 2026 05:20:00 GMT |
| [Relatorio_Resultado_Totalizacao_2024_PE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PE.zip) | Totalização (a inspecionar) | 141,424,880 | Wed, 28 Oct 2026 05:20:02 GMT |
| [Relatorio_Resultado_Totalizacao_2024_PI.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PI.zip) | Totalização (a inspecionar) | 132,048,248 | Wed, 28 Oct 2026 05:20:03 GMT |
| [Relatorio_Resultado_Totalizacao_2024_PR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PR.zip) | Totalização (a inspecionar) | 308,486,528 | Wed, 28 Oct 2026 05:20:05 GMT |
| [Relatorio_Resultado_Totalizacao_2024_RJ.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RJ.zip) | Totalização (a inspecionar) | 104,554,774 | Wed, 28 Oct 2026 05:20:06 GMT |
| [Relatorio_Resultado_Totalizacao_2024_RN.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RN.zip) | Totalização (a inspecionar) | 101,075,290 | Wed, 28 Oct 2026 05:20:07 GMT |
| [Relatorio_Resultado_Totalizacao_2024_RO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RO.zip) | Totalização (a inspecionar) | 41,863,514 | Wed, 28 Oct 2026 05:20:07 GMT |
| [Relatorio_Resultado_Totalizacao_2024_RR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RR.zip) | Totalização (a inspecionar) | 10,549,010 | Wed, 28 Oct 2026 05:20:07 GMT |
| [Relatorio_Resultado_Totalizacao_2024_RS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RS.zip) | Totalização (a inspecionar) | 333,932,835 | Wed, 28 Oct 2026 05:20:10 GMT |
| [Relatorio_Resultado_Totalizacao_2024_SC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_SC.zip) | Totalização (a inspecionar) | 208,674,883 | Wed, 28 Oct 2026 05:20:12 GMT |
| [Relatorio_Resultado_Totalizacao_2024_SE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_SE.zip) | Totalização (a inspecionar) | 54,571,371 | Wed, 28 Oct 2026 05:20:12 GMT |
| [Relatorio_Resultado_Totalizacao_2024_SP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_SP.zip) | Totalização (a inspecionar) | 583,589,630 | Wed, 28 Oct 2026 05:20:16 GMT |
| [Relatorio_Resultado_Totalizacao_2024_TO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_TO.zip) | Totalização (a inspecionar) | 85,671,399 | Wed, 28 Oct 2026 05:20:17 GMT |
| [votacao_secao_2024_AC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AC.zip) | Seção | 5,568,218 | Mon, 22 Jun 2026 14:47:27 GMT |
| [votacao_secao_2024_AL.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AL.zip) | Seção | 17,376,004 | Mon, 22 Jun 2026 14:47:22 GMT |
| [votacao_secao_2024_AM.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AM.zip) | Seção | 34,122,098 | Mon, 22 Jun 2026 14:47:50 GMT |
| [votacao_secao_2024_AP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AP.zip) | Seção | 5,138,859 | Mon, 22 Jun 2026 14:46:54 GMT |
| [votacao_secao_2024_BA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_BA.zip) | Seção | 113,963,142 | Mon, 22 Jun 2026 14:47:00 GMT |
| [votacao_secao_2024_CE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_CE.zip) | Seção | 69,533,579 | Mon, 22 Jun 2026 14:46:44 GMT |
| [votacao_secao_2024_ES.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_ES.zip) | Seção | 31,862,561 | Mon, 22 Jun 2026 14:46:57 GMT |
| [votacao_secao_2024_GO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_GO.zip) | Seção | 64,435,871 | Mon, 22 Jun 2026 14:47:04 GMT |
| [votacao_secao_2024_MA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MA.zip) | Seção | 48,918,240 | Mon, 22 Jun 2026 14:47:30 GMT |
| [votacao_secao_2024_MG.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MG.zip) | Seção | 201,366,815 | Mon, 22 Jun 2026 14:46:54 GMT |
| [votacao_secao_2024_MS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MS.zip) | Seção | 23,262,652 | Mon, 22 Jun 2026 14:46:47 GMT |
| [votacao_secao_2024_MT.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MT.zip) | Seção | 26,078,892 | Mon, 22 Jun 2026 14:46:57 GMT |
| [votacao_secao_2024_PA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PA.zip) | Seção | 71,540,522 | Mon, 22 Jun 2026 14:47:07 GMT |
| [votacao_secao_2024_PB.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PB.zip) | Seção | 28,109,471 | Mon, 22 Jun 2026 14:47:19 GMT |
| [votacao_secao_2024_PE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PE.zip) | Seção | 66,653,339 | Mon, 22 Jun 2026 14:47:10 GMT |
| [votacao_secao_2024_PI.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PI.zip) | Seção | 23,263,290 | Mon, 22 Jun 2026 14:47:47 GMT |
| [votacao_secao_2024_PR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PR.zip) | Seção | 110,124,174 | Mon, 22 Jun 2026 14:47:13 GMT |
| [votacao_secao_2024_RJ.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RJ.zip) | Seção | 156,836,604 | Mon, 22 Jun 2026 14:47:24 GMT |
| [votacao_secao_2024_RN.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RN.zip) | Seção | 21,597,475 | Mon, 22 Jun 2026 14:47:15 GMT |
| [votacao_secao_2024_RO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RO.zip) | Seção | 12,739,577 | Mon, 22 Jun 2026 14:47:12 GMT |
| [votacao_secao_2024_RR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RR.zip) | Seção | 4,071,506 | Mon, 22 Jun 2026 14:47:45 GMT |
| [votacao_secao_2024_RS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RS.zip) | Seção | 96,132,770 | Mon, 22 Jun 2026 14:47:41 GMT |
| [votacao_secao_2024_SC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_SC.zip) | Seção | 53,794,714 | Mon, 22 Jun 2026 14:47:30 GMT |
| [votacao_secao_2024_SE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_SE.zip) | Seção | 15,603,197 | Mon, 22 Jun 2026 14:47:43 GMT |
| [votacao_secao_2024_SP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_SP.zip) | Seção | 475,770,264 | Mon, 22 Jun 2026 14:46:41 GMT |
| [votacao_secao_2024_TO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_TO.zip) | Seção | 10,184,639 | Mon, 22 Jun 2026 14:47:00 GMT |
| [consulta_cand_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2024.zip) | Candidatura/UE | 63,927,439 | Wed, 28 Oct 2026 05:25:20 GMT |
| [consulta_cand_complementar_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand_complementar/consulta_cand_complementar_2024.zip) | Candidatura/UE | 30,839,473 | Wed, 28 Oct 2026 05:25:09 GMT |
| [eleitorado_local_votacao_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_2024.zip) | Local (campos a inspecionar) | 45,276,803 | Tue, 29 Oct 2024 18:02:29 GMT |

## Limites e o que não está disponível ou comprovado

1. **1996:** o [aviso oficial](https://dadosabertos.tse.jus.br/dataset/resultados-1996) informa resultados incompletos e substituição por uma versão com granularidade de município e zona, sem seção. Não fabricar seções, locais ou bairros a partir desses totais. A aquisição desse ano deve parar no nível disponível e explicitar a cobertura incompleta.
2. **2000 a 2024:** há recursos de seção no catálogo, mas a existência desses recursos não comprova que todas as seções e todos os municípios estejam representados. Isso exige as conferências do processamento.
3. **Locais e bairros:** recurso histórico de eleitorado por local foi localizado nos conjuntos de 2012, 2016, 2020 e 2024. Não foi listado nos conjuntos de eleitorado de 1996, 2000, 2004 e 2008 consultados. Endereço, bairro, coordenadas e ligação seção–local ainda não foram verificados nos cabeçalhos de nenhum ano. Não usar um cadastro atual para preencher locais históricos sem evidência do TSE.
4. **Bairro não é uma votação publicada separadamente neste inventário:** depende da associação comprovada entre a seção e o local do respectivo pleito e da agregação pelo bairro desse cadastro. Bairro ausente deve permanecer vazio, e o município deve aparecer no relatório. Coordenadas ausentes devem permanecer nulas.
5. **1992 e anteriores:** os resultados das buscas no catálogo estão no JSON, em `limite_historico`. Não foi estabelecida nesta etapa uma série nacional municipal anterior a 1996 com seção. O limite confirmado por ausência expressa de seção é 1996; não prometer cobertura anterior nem usar material de terceiros.
6. **Escopo territorial:** os recursos de seção catalogados de 2000 a 2024 abrangem as 26 UFs com eleições municipais. Não criar resultados municipais para DF ou exterior por extrapolação. A lista efetiva de municípios deve vir dos arquivos oficiais de cada pleito, e não de um total fixo de municípios atuais.
7. **Candidaturas:** manter o cadastro independentemente de haver votos, incluindo candidatos sem votação, conforme os registros oficiais. O cadastro de 2020 usa o slug `candidatos-2020-subtemas`; um 404 em `candidatos-2020` não significa ausência do cadastro.

## Contrato de saída a preservar após aprovação

Estes são os nomes exigidos pelo projeto, **não cabeçalhos já observados nos ZIPs**:

| Tabela | Colunas de saída |
| --- | --- |
| `secao` | `ano, turno, cargo, uf, cd_municipio_tse, zona, secao, nr_local_votacao, nr_votavel, nm_votavel, sigla_partido, qt_votos, sq_candidato` |
| `local_votacao` | `ano, uf, cd_municipio_tse, zona, nr_local, nome, endereco, bairro, latitude, longitude, secoes, eleitores` |
| `candidato` | `ano, turno, cargo, uf, ue, sq_candidato, nr, nome, nome_urna, sigla, situacao_final, ano_nascimento` |
| `zona` | `ano, uf, cd_municipio_tse, zona, cargo, nr_votavel, qt_votos` |

`secoes` deve ser uma lista de números. Identificadores devem preservar sua identidade e não passar por conversão para ponto flutuante. Documentar o tratamento dos marcadores de informação ausente do TSE. Não inventar `sq_candidato` para votos brancos, nulos ou de legenda. Preservar `nr_votavel=95` para brancos, `96` para nulos e o número da legenda nas linhas próprias, verificando os códigos efetivamente encontrados antes de transformar outros tipos de voto.

**Turno em `zona`:** o esquema solicitado não tem a coluna `turno`. A sugestão é manter arquivos de zona separados por turno, identificado no nome e no manifesto, dentro das partições obrigatórias `ano/uf/cargo`. Não somar os dois turnos silenciosamente. O manifesto deve impedir a leitura conjunta como se fosse um único turno. O mesmo cuidado vale para eventual mudança do cadastro de locais entre turnos: registrar versões e diferenças, sem sobrescrever informações.

## Conferências previstas, ainda não executadas

Os relatórios `docs/conferencia-<ano>.md` só deverão declarar resultados após execução. Cada relatório deverá identificar pleito, turno, UF, fontes, geração dos CSVs, somas e diferenças; listar municípios sem bairro; informar o que não foi possível conferir.

1. Agregar seções por candidato, município, zona, cargo e turno e comparar com a votação nominal por município e zona. Consolidar também por candidato e município. Não misturar totais nominais, votos de legenda e votos inválidos; confrontar cada classe com sua fonte e documentar diferenças de situação/destinação dos votos.
2. Comparar seções distintas por município e turno com o detalhe oficial, identificando seções agregadas, não instaladas e demais situações. Não contar cada linha de candidato como uma seção, nem duplicar seções porque há dois cargos. Em 1996 a conferência por seção é indisponível e deve constar como tal.
3. Conferir o total por cargo e turno, distinguindo nominais, legenda, brancos, nulos e demais categorias oficiais, contra os totais de apuração/divulgação apropriados. Não comparar votos totais com votos válidos como se fossem a mesma medida.
4. Publicar a lista completa de divergências e o estado de cada conferência. Ausência de uma fonte independente é “não conferido”, nunca “aprovado”. Bloquear a promoção a dados validados quando houver falha; não ajustar totais em silêncio.

## Privacidade

Publicar apenas as colunas autorizadas. Não persistir CPF, e-mail, título, nome social nem nascimento completo nos dados de saída, relatórios, logs, caches ou artifacts. Extrair somente o ano de nascimento para `ano_nascimento`. Os arquivos brutos oficiais que contiverem esses campos devem existir apenas temporariamente no runner, com limpeza garantida e sem upload; não registrar linhas brutas como amostra ou mensagem de erro. A inspeção de colunas pode registrar seus nomes, sem os valores pessoais.

## Armazenamento aprovado para o teste de 2024

**GitHub Releases, aprovado pelo usuário em 28/10/2026 para o teste de 2024; uma release por revisão da extração.** Os Parquets zstd ficarão como assets; o git conterá scripts, manifests pequenos e relatórios. Nenhum arquivo acima de 90 MB entrará no git. Os ZIPs brutos não serão publicados.

Cada asset terá identificação de tabela, ano, UF, cargo quando aplicável, turno quando necessário e parte. O manifesto mapeará o nome plano da release para a partição lógica `ano/uf/cargo`, com URL, bytes, SHA-256, fonte TSE, data de geração interna e estado das conferências. Dividir arquivos grandes em partes menores que 2 GiB e limitar cada release a até 1.000 assets, conforme a [documentação do GitHub](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases). Não presumir o tamanho final de Parquet antes de medir.

Releases permitem começar sem contratar nem configurar outro serviço. Um bucket será preferível se o uso exigir leitura direta de partições por caminho, consultas remotas frequentes ou atualização contínua de muitos objetos. Nenhum bucket existente foi presumido e nenhum custo foi estimado.

**Sequência do teste:** inspecionar os ZIPs de 2024 no Actions, atualizar este inventário com as medidas observadas, implementar o processamento conforme esses cabeçalhos e conferir os resultados antes de publicá-los como validados. Os demais anos não serão baixados neste teste.

## Execução do inventário de conteúdo

O workflow `.github/workflows/lake-inventario-2024.yml` divide os downloads de 2024 em 26 lotes por UF e um lote nacional, com no máximo três runners simultâneos. É executável manualmente por `workflow_dispatch` e também pelo PR deste branch para permitir a primeira inspeção antes de merge. Usa somente a biblioteca padrão do Python e preserva apenas metadados como artifacts por sete dias. Os ZIPs são temporários, lidos sem extrair CSVs, removidos após cada recurso e nunca enviados como artifacts.

Para cada CSV, registra colunas, contagem exata de registros, datas/horas de geração encontradas, cargos, turnos, códigos de eleição e anos observados. A leitura completa confere o CRC do membro. CSVs BRASIL e por UF são contados separadamente, sem somar cópias. Outros formatos ficam classificados pela extensão, sem inventar linhas ou cabeçalhos. Erros provocam falha visível do lote e não expõem os valores de registros.

Esta inspeção é a etapa 0. Não constitui conferência dos votos nem conversão para Parquet.

## Estado da execução

O registro por HEAD agora contém apenas os **59 recursos de 2024**, somando **6.296.749.057 bytes** na consulta inicial. Os anos anteriores ficaram fora do manifesto ativo. Conteúdo e conferências permanecerão pendentes até a conclusão dos respectivos jobs; resultados reais serão incorporados a este documento. O acesso ao GitHub foi restabelecido e o branch remoto `lake-municipal` foi criado a partir de `main` em 28/10/2026.
