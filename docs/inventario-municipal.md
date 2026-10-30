# Inventário municipal — teste de 2024

**Escopo ativo: somente 2024. Os demais anos estão adiados.** GitHub Releases foi aprovado pelo usuário para este teste em 28/10/2026.

Inventário de conteúdo: **concluído para os CSVs; PDFs classificados sem leitura interna**. 59 de 59 ZIPs têm resultados importados da [execução no GitHub Actions](https://github.com/eduvaldoski2/op-apuracao2turno/actions/runs/40721672249). Nenhum ZIP do TSE foi baixado na máquina local; aqui foram importados apenas os metadados gerados pelos runners.

## Disponibilidade por ano

| Ano | Arquivos catalogados | Níveis | Cargos observados | Turnos | Tamanho inicial dos ZIPs por HEAD |
| --- | ---: | --- | --- | --- | ---: |
| 2024 | 59 | seção; município/zona; candidatura; cadastro seção/local | 11 e 13 nos votos; 12 também no cadastro (será excluído) | 1 e 2 | 6,296,749,057 bytes |

Fontes: [Resultados 2024](https://dadosabertos.tse.jus.br/dataset/resultados-2024), [Candidatos 2024](https://dadosabertos.tse.jus.br/dataset/candidatos-2024) e [Eleitorado 2024](https://dadosabertos.tse.jus.br/dataset/eleitorado-2024). As URLs e datas de consulta do catálogo/HEAD estão em [inventario-municipal-fontes.json](inventario-municipal-fontes.json). Os metadados completos dos CSVs internos estão em [inventario-2024/](inventario-2024/).

## Arquivos, tamanhos, geração e linhas

Bytes abaixo são os tamanhos efetivamente baixados no Actions quando disponíveis; o catálogo inicial é preservado separadamente. Linhas são contagens exatas de registros, sem cabeçalho nem linhas vazias, do CSV indicado. Nas bases com BRASIL e cópias por UF, a tabela usa somente BRASIL; não soma réplicas. As linhas são do arquivo original: ainda incluem suplementares e, no cadastro, vice-prefeitos. Não representam o tamanho do lake filtrado. Geração vem de DT_GERACAO/HH_GERACAO, nunca de Last-Modified.

| Arquivo oficial | ZIP (bytes) | Conteúdo de referência / linhas | Geração interna observada | Estrutura |
| --- | ---: | --- | --- | --- |
| [votacao_candidato_munzona_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_candidato_munzona/votacao_candidato_munzona_2024.zip) | 48,229,790 | votacao_candidato_munzona_2024_BRASIL.csv: **717,288** | 28/10/2026 02:17:30 | votacao_candidato_munzona |
| [votacao_partido_munzona_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_partido_munzona/votacao_partido_munzona_2024.zip) | 6,146,861 | votacao_partido_munzona_2024_BRASIL.csv: **80,934** | 28/10/2026 02:17:30 | votacao_partido_munzona |
| [detalhe_votacao_munzona_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_munzona/detalhe_votacao_munzona_2024.zip) | 1,507,501 | detalhe_votacao_munzona_2024_BRASIL.csv: **12,493** | 28/10/2026 02:17:14 | detalhe_votacao_munzona |
| [detalhe_votacao_secao_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/detalhe_votacao_secao/detalhe_votacao_secao_2024.zip) | 87,270,063 | detalhe_votacao_secao_2024_BRASIL.csv: **1,055,460** | 02/03/2026 10:00:26; 04/08/2025 10:00:28; 05/05/2025 10:00:31; 06/10/2025 10:00:30; 07/04/2025 10:00:33; 07/07/2025 10:00:31; 08/12/2025 10:00:23; 09/06/2025 10:00:37; 13/04/2026 10:38:54; 15/06/2026 10:00:40; 15/09/2025 10:00:26; 22/06/2026 10:01:52; 27/10/2025 10:00:31; 28/10/2024 10:46:35 | detalhe_votacao_secao |
| [Relatorio_Resultado_Totalizacao_2024_AC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AC.zip) | 18,864,465 | 23 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_AL.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AL.zip) | 65,418,565 | 103 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_AM.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AM.zip) | 57,379,913 | 64 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_AP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_AP.zip) | 13,810,211 | 18 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_BA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_BA.zip) | 314,106,620 | 420 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_CE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_CE.zip) | 133,681,706 | 191 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_ES.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_ES.zip) | 73,787,351 | 80 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_GO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_GO.zip) | 186,379,876 | 251 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_MA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MA.zip) | 160,648,235 | 219 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_MG.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MG.zip) | 656,519,054 | 861 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_MS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MS.zip) | 64,309,268 | 83 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_MT.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_MT.zip) | 106,532,981 | 144 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_PA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PA.zip) | 133,179,503 | 148 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_PB.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PB.zip) | 134,442,544 | 227 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_PE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PE.zip) | 141,424,880 | 188 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_PI.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PI.zip) | 132,048,248 | 225 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_PR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_PR.zip) | 308,486,528 | 407 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_RJ.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RJ.zip) | 104,554,774 | 97 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_RN.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RN.zip) | 101,075,290 | 171 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_RO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RO.zip) | 41,863,514 | 54 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_RR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RR.zip) | 10,549,010 | 16 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_RS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_RS.zip) | 333,932,835 | 506 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_SC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_SC.zip) | 208,674,883 | 296 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_SE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_SE.zip) | 54,571,371 | 77 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_SP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_SP.zip) | 583,589,630 | 678 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [Relatorio_Resultado_Totalizacao_2024_TO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/relatorio_resultado_totalizacao/Relatorio_Resultado_Totalizacao_2024_TO.zip) | 85,671,399 | 142 .pdf; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |
| [votacao_secao_2024_AC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AC.zip) | 5,568,218 | votacao_secao_2024_AC.csv: **156,259** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_AL.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AL.zip) | 17,376,004 | votacao_secao_2024_AL.csv: **431,472** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_AM.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AM.zip) | 34,122,098 | votacao_secao_2024_AM.csv: **845,374** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_AP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_AP.zip) | 5,138,859 | votacao_secao_2024_AP.csv: **155,653** | 13/04/2026 10:38:59; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_BA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_BA.zip) | 113,963,142 | votacao_secao_2024_BA.csv: **2,436,445** | 07/04/2025 10:00:41; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_CE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_CE.zip) | 69,533,579 | votacao_secao_2024_CE.csv: **1,572,026** | 02/03/2026 10:00:20; 27/10/2025 10:00:32; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_ES.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_ES.zip) | 31,862,561 | votacao_secao_2024_ES.csv: **720,193** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_GO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_GO.zip) | 64,435,871 | votacao_secao_2024_GO.csv: **1,320,397** | 22/06/2026 10:01:46; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_MA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MA.zip) | 48,918,240 | votacao_secao_2024_MA.csv: **1,107,687** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_MG.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MG.zip) | 201,366,815 | votacao_secao_2024_MG.csv: **3,916,106** | 04/08/2025 10:00:32; 07/07/2025 10:00:28; 08/12/2025 10:00:29; 22/06/2026 10:01:46; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_MS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MS.zip) | 23,262,652 | votacao_secao_2024_MS.csv: **593,718** | 07/04/2025 10:00:41; 07/07/2025 10:00:28; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_MT.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_MT.zip) | 26,078,892 | votacao_secao_2024_MT.csv: **622,036** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_PA.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PA.zip) | 71,540,522 | votacao_secao_2024_PA.csv: **1,555,659** | 15/06/2026 10:00:31; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_PB.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PB.zip) | 28,109,471 | votacao_secao_2024_PB.csv: **647,087** | 13/04/2026 10:38:59; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_PE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PE.zip) | 66,653,339 | votacao_secao_2024_PE.csv: **1,509,480** | 05/05/2025 10:00:31; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_PI.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PI.zip) | 23,263,290 | votacao_secao_2024_PI.csv: **504,685** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_PR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_PR.zip) | 110,124,174 | votacao_secao_2024_PR.csv: **2,215,453** | 06/10/2025 10:00:29; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_RJ.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RJ.zip) | 156,836,604 | votacao_secao_2024_RJ.csv: **3,384,471** | 06/10/2025 10:00:29; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_RN.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RN.zip) | 21,597,475 | votacao_secao_2024_RN.csv: **483,540** | 15/06/2026 10:00:31; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_RO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RO.zip) | 12,739,577 | votacao_secao_2024_RO.csv: **349,871** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_RR.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RR.zip) | 4,071,506 | votacao_secao_2024_RR.csv: **107,333** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_RS.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_RS.zip) | 96,132,770 | votacao_secao_2024_RS.csv: **1,974,754** | 08/12/2025 10:00:29; 13/04/2026 10:38:59; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_SC.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_SC.zip) | 53,794,714 | votacao_secao_2024_SC.csv: **1,195,303** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_SE.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_SE.zip) | 15,603,197 | votacao_secao_2024_SE.csv: **405,174** | 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_SP.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_SP.zip) | 475,770,264 | votacao_secao_2024_SP.csv: **9,611,258** | 04/08/2025 10:00:32; 07/04/2025 10:00:41; 08/12/2025 10:00:29; 09/06/2025 10:00:38; 15/06/2026 10:00:31; 15/09/2025 10:00:30; 22/06/2026 10:01:46; 28/10/2024 11:46:22 | votacao_secao |
| [votacao_secao_2024_TO.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2024_TO.zip) | 10,184,639 | votacao_secao_2024_TO.csv: **272,718** | 28/10/2024 11:46:22 | votacao_secao |
| [consulta_cand_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2024.zip) | 63,927,439 | consulta_cand_2024_BRASIL.csv: **463,881** | 28/10/2026 02:16:07 | consulta_cand |
| [consulta_cand_complementar_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand_complementar/consulta_cand_complementar_2024.zip) | 30,839,473 | consulta_cand_complementar_2024_BRASIL.csv: **463,881** | 28/10/2026 02:16:07 | consulta_cand_complementar |
| [eleitorado_local_votacao_2024.zip](https://cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_2024.zip) | 45,276,803 | eleitorado_local_votacao_2024.csv: **599,204** | 29/10/2024 02:00:30 | eleitorado_locais_votacao |

## Colunas observadas

Nomes de campos pessoais abaixo são apenas o cabeçalho oficial. Seus valores não foram incluídos no inventário e não serão persistidos nas saídas. O processamento seleciona explicitamente os campos autorizados e deriva apenas o ano de nascimento em memória.

### votacao_candidato_munzona

Estrutura 1, 50 colunas:

`DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_TIPO_ELEICAO, NM_TIPO_ELEICAO, NR_TURNO, CD_ELEICAO, DS_ELEICAO, DT_ELEICAO, TP_ABRANGENCIA, SG_UF, SG_UE, NM_UE, CD_MUNICIPIO, NM_MUNICIPIO, NR_ZONA, CD_CARGO, DS_CARGO, SQ_CANDIDATO, NR_CANDIDATO, NM_CANDIDATO, NM_URNA_CANDIDATO, NM_SOCIAL_CANDIDATO, CD_SITUACAO_CANDIDATURA, DS_SITUACAO_CANDIDATURA, CD_DETALHE_SITUACAO_CAND, DS_DETALHE_SITUACAO_CAND, CD_SITUACAO_JULGAMENTO, DS_SITUACAO_JULGAMENTO, CD_SITUACAO_CASSACAO, DS_SITUACAO_CASSACAO, CD_SITUACAO_DCONST_DIPLOMA, DS_SITUACAO_DCONST_DIPLOMA, TP_AGREMIACAO, NR_PARTIDO, SG_PARTIDO, NM_PARTIDO, NR_FEDERACAO, NM_FEDERACAO, SG_FEDERACAO, DS_COMPOSICAO_FEDERACAO, SQ_COLIGACAO, NM_COLIGACAO, DS_COMPOSICAO_COLIGACAO, ST_VOTO_EM_TRANSITO, QT_VOTOS_NOMINAIS, NM_TIPO_DESTINACAO_VOTOS, QT_VOTOS_NOMINAIS_VALIDOS, CD_SIT_TOT_TURNO, DS_SIT_TOT_TURNO`


### votacao_partido_munzona

Estrutura 1, 38 colunas:

`DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_TIPO_ELEICAO, NM_TIPO_ELEICAO, NR_TURNO, CD_ELEICAO, DS_ELEICAO, DT_ELEICAO, TP_ABRANGENCIA, SG_UF, SG_UE, NM_UE, CD_MUNICIPIO, NM_MUNICIPIO, NR_ZONA, CD_CARGO, DS_CARGO, TP_AGREMIACAO, NR_PARTIDO, SG_PARTIDO, NM_PARTIDO, NR_FEDERACAO, NM_FEDERACAO, SG_FEDERACAO, DS_COMPOSICAO_FEDERACAO, SQ_COLIGACAO, NM_COLIGACAO, DS_COMPOSICAO_COLIGACAO, ST_VOTO_EM_TRANSITO, QT_VOTOS_LEGENDA_VALIDOS, QT_VOTOS_NOM_CONVR_LEG_VALIDOS, QT_TOTAL_VOTOS_LEG_VALIDOS, QT_VOTOS_NOMINAIS_VALIDOS, QT_VOTOS_LEGENDA_ANUL_SUBJUD, QT_VOTOS_NOMINAIS_ANUL_SUBJUD, QT_VOTOS_LEGENDA_ANULADOS, QT_VOTOS_NOMINAIS_ANULADOS`


### detalhe_votacao_munzona

Estrutura 1, 47 colunas:

`DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_TIPO_ELEICAO, NM_TIPO_ELEICAO, NR_TURNO, CD_ELEICAO, DS_ELEICAO, DT_ELEICAO, TP_ABRANGENCIA, SG_UF, SG_UE, NM_UE, CD_MUNICIPIO, NM_MUNICIPIO, NR_ZONA, CD_CARGO, DS_CARGO, QT_APTOS, QT_SECOES_PRINCIPAIS, QT_SECOES_AGREGADAS, QT_SECOES_NAO_INSTALADAS, QT_TOTAL_SECOES, QT_COMPARECIMENTO, QT_ELEITORES_SECOES_NAO_INSTALADAS, QT_ABSTENCOES, ST_VOTO_EM_TRANSITO, QT_VOTOS, QT_VOTOS_CONCORRENTES, QT_TOTAL_VOTOS_VALIDOS, QT_VOTOS_NOMINAIS_VALIDOS, QT_TOTAL_VOTOS_LEG_VALIDOS, QT_VOTOS_LEG_VALIDOS, QT_VOTOS_NOM_CONVR_LEG_VALIDOS, QT_TOTAL_VOTOS_ANULADOS, QT_VOTOS_NOMINAIS_ANULADOS, QT_VOTOS_LEGENDA_ANULADOS, QT_TOTAL_VOTOS_ANUL_SUBJUD, QT_VOTOS_NOMINAIS_ANUL_SUBJUD, QT_VOTOS_LEGENDA_ANUL_SUBJUD, QT_VOTOS_BRANCOS, QT_TOTAL_VOTOS_NULOS, QT_VOTOS_NULOS, QT_VOTOS_NULOS_TECNICOS, QT_VOTOS_ANULADOS_APU_SEP, HH_ULTIMA_TOTALIZACAO, DT_ULTIMA_TOTALIZACAO`


### detalhe_votacao_secao

Estrutura 1, 37 colunas:

`DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_TIPO_ELEICAO, NM_TIPO_ELEICAO, NR_TURNO, CD_ELEICAO, DS_ELEICAO, DT_ELEICAO, TP_ABRANGENCIA, SG_UF, SG_UE, NM_UE, CD_MUNICIPIO, NM_MUNICIPIO, NR_ZONA, NR_SECAO, CD_CARGO, DS_CARGO, QT_APTOS, QT_COMPARECIMENTO, QT_ABSTENCOES, QT_VOTOS_NOMINAIS, QT_VOTOS_BRANCOS, QT_VOTOS_NULOS, QT_VOTOS_LEGENDA, QT_VOTOS_ANULADOS_APU_SEP, NR_LOCAL_VOTACAO, NM_LOCAL_VOTACAO, DS_LOCAL_VOTACAO_ENDERECO, DT_RECEBIMENTO_BU_HOR_TSE, DT_PRIM_TOT_PARCIAL_HOR_TSE, DS_ORIGEM_VOTO, ST_SECAO_INSTALADA, ST_SECAO_ANULADA, CD_MODELO_URNA, DS_MODELO_URNA`


### votacao_secao

Estrutura 1, 26 colunas:

`DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_TIPO_ELEICAO, NM_TIPO_ELEICAO, NR_TURNO, CD_ELEICAO, DS_ELEICAO, DT_ELEICAO, TP_ABRANGENCIA, SG_UF, SG_UE, NM_UE, CD_MUNICIPIO, NM_MUNICIPIO, NR_ZONA, NR_SECAO, CD_CARGO, DS_CARGO, NR_VOTAVEL, NM_VOTAVEL, QT_VOTOS, NR_LOCAL_VOTACAO, SQ_CANDIDATO, NM_LOCAL_VOTACAO, DS_LOCAL_VOTACAO_ENDERECO`


### consulta_cand

Estrutura 1, 50 colunas:

`DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_TIPO_ELEICAO, NM_TIPO_ELEICAO, NR_TURNO, CD_ELEICAO, DS_ELEICAO, DT_ELEICAO, TP_ABRANGENCIA, SG_UF, SG_UE, NM_UE, CD_CARGO, DS_CARGO, SQ_CANDIDATO, NR_CANDIDATO, NM_CANDIDATO, NM_URNA_CANDIDATO, NM_SOCIAL_CANDIDATO, NR_CPF_CANDIDATO, DS_EMAIL, CD_SITUACAO_CANDIDATURA, DS_SITUACAO_CANDIDATURA, TP_AGREMIACAO, NR_PARTIDO, SG_PARTIDO, NM_PARTIDO, NR_FEDERACAO, NM_FEDERACAO, SG_FEDERACAO, DS_COMPOSICAO_FEDERACAO, SQ_COLIGACAO, NM_COLIGACAO, DS_COMPOSICAO_COLIGACAO, SG_UF_NASCIMENTO, DT_NASCIMENTO, NR_TITULO_ELEITORAL_CANDIDATO, CD_GENERO, DS_GENERO, CD_GRAU_INSTRUCAO, DS_GRAU_INSTRUCAO, CD_ESTADO_CIVIL, DS_ESTADO_CIVIL, CD_COR_RACA, DS_COR_RACA, CD_OCUPACAO, DS_OCUPACAO, CD_SIT_TOT_TURNO, DS_SIT_TOT_TURNO`


### consulta_cand_complementar

Estrutura 1, 49 colunas:

`DT_GERACAO, HH_GERACAO, ANO_ELEICAO, CD_ELEICAO, SQ_CANDIDATO, CD_DETALHE_SITUACAO_CAND, DS_DETALHE_SITUACAO_CAND, CD_NACIONALIDADE, DS_NACIONALIDADE, CD_MUNICIPIO_NASCIMENTO, NM_MUNICIPIO_NASCIMENTO, NR_IDADE_DATA_POSSE, ST_QUILOMBOLA, CD_ETNIA_INDIGENA, DS_ETNIA_INDIGENA, VR_DESPESA_MAX_CAMPANHA, ST_REELEICAO, ST_DECLARAR_BENS, NR_PROTOCOLO_CANDIDATURA, NR_PROCESSO, CD_SITUACAO_CANDIDATO_PLEITO, DS_SITUACAO_CANDIDATO_PLEITO, CD_SITUACAO_CANDIDATO_URNA, DS_SITUACAO_CANDIDATO_URNA, ST_CANDIDATO_INSERIDO_URNA, NM_TIPO_DESTINACAO_VOTOS, CD_SITUACAO_CANDIDATO_TOT, DS_SITUACAO_CANDIDATO_TOT, ST_PREST_CONTAS, ST_SUBSTITUIDO, SQ_SUBSTITUIDO, SQ_ORDEM_SUPLENCIA, DT_ACEITE_CANDIDATURA, CD_SITUACAO_JULGAMENTO, DS_SITUACAO_JULGAMENTO, CD_SITUACAO_JULGAMENTO_PLEITO, DS_SITUACAO_JULGAMENTO_PLEITO, CD_SITUACAO_JULGAMENTO_URNA, DS_SITUACAO_JULGAMENTO_URNA, CD_SITUACAO_CASSACAO, DS_SITUACAO_CASSACAO, CD_SITUACAO_CASSACAO_MIDIA, DS_SITUACAO_CASSACAO_MIDIA, CD_SITUACAO_DIPLOMA, DS_SITUACAO_DIPLOMA, CD_GENERO_FEFC, DS_GENERO_FEFC, CD_COR_RACA_FEFC, DS_COR_RACA_FEFC`


### eleitorado_locais_votacao

Estrutura 1, 41 colunas:

`DT_GERACAO, HH_GERACAO, AA_ELEICAO, DT_ELEICAO, DS_ELEICAO, NR_TURNO, SG_UF, CD_MUNICIPIO, NM_MUNICIPIO, NR_ZONA, NR_SECAO, CD_TIPO_SECAO_AGREGADA, DS_TIPO_SECAO_AGREGADA, NR_SECAO_PRINCIPAL, NR_LOCAL_VOTACAO, NM_LOCAL_VOTACAO, CD_TIPO_LOCAL, DS_TIPO_LOCAL, DS_ENDERECO, NM_BAIRRO, NR_CEP, NR_TELEFONE_LOCAL, NR_LATITUDE, NR_LONGITUDE, CD_SITU_LOCAL_VOTACAO, DS_SITU_LOCAL_VOTACAO, CD_SITU_ZONA, DS_SITU_ZONA, CD_SITU_SECAO, DS_SITU_SECAO, CD_SITU_LOCALIDADE, DS_SITU_LOCALIDADE, CD_SITU_SECAO_ACESSIBILIDADE, DS_SITU_SECAO_ACESSIBILIDADE, QT_ELEITOR_SECAO, QT_ELEITOR_ELEICAO_FEDERAL, QT_ELEITOR_ELEICAO_ESTADUAL, QT_ELEITOR_ELEICAO_MUNICIPAL, NR_LOCAL_VOTACAO_ORIGINAL, NM_LOCAL_VOTACAO_ORIGINAL, DS_ENDERECO_LOCVT_ORIGINAL`


## O que existe, o que não foi encontrado e limitações

- Os 26 ZIPs de votação por seção estão catalogados, um por UF com eleição municipal. Não criar dados municipais para DF ou exterior. A cobertura de todos os municípios/seções precisa ser conferida no processamento.
- O cadastro de locais contém NR_SECAO, NR_LOCAL_VOTACAO, endereço, NM_BAIRRO e coordenadas. A presença das colunas não significa preenchimento completo. Municípios sem bairro ainda precisam ser listados após processar os valores; não se inventará bairro nem se fará geocodificação.
- Não foi localizado, nesses recursos, um arquivo independente de votos por bairro ou por local. Esses níveis dependem de agregar as seções com correspondência no cadastro histórico do TSE.
- Os ZIPs de relatórios de totalização inspecionados contêm PDFs, embora o catálogo os rotule como CSV. Contagem de registros e cabeçalho CSV não se aplicam. Datas internas e conteúdo dos PDFs ainda não foram lidos; o manifesto não apresenta Last-Modified como geração desses relatórios.
- As bases nacionais de ano 2024 incluem numerosos códigos de eleições suplementares posteriores. O teste se limita à eleição ordinária: não se deve filtrar apenas ANO_ELEICAO. Os códigos e turnos encontrados constam nos metadados completos.
- As fontes têm gerações diferentes. Por exemplo, o CSV de seção do Acre foi gerado em 28/10/2024, enquanto a votação nominal nacional por município/zona foi gerada em 28/10/2026. Mudanças judiciais e de totalização podem aparecer como divergências; não serão ajustadas em silêncio.
- Ainda não foi executada conferência de votos reais nem publicada release de Parquet deste trabalho. A inspeção de arquivos não é validação eleitoral. Os resultados futuros ficarão em [conferencia-2024.md](conferencia-2024.md).

## Contrato e processamento preparado

Os nomes e a ordem das colunas dos quatro esquemas solicitados estão em SCHEMAS, em `scripts/lake/build_2024.py`, e são verificados depois de escrever cada Parquet. Brancos 95, nulos 96 e legendas são linhas próprias; candidatos sem votos vêm do cadastro. Como zona e local_votacao não têm turno no esquema, o turno fica no caminho, nome e manifesto. O cadastro de locais é comum aos cargos, sem uma partição de cargo artificial.

O workflow `lake-2024.yml` é exclusivamente manual, com piloto padrão AC e opção TODAS ou lista de UFs. Há até três runners em paralelo. Downloads rodam no Actions, um ZIP de cada vez; intermediários já minimizados; Parquet zstd particionado por ano/UF/cargo e turno. As conferências com junção externa comparam candidato/município, candidato/zona, seções por município e totais por cargo/turno. Ambiguidades, votos sem cadastro, seções sem local, votos negativos e códigos desconhecidos também bloqueiam publicação. Todas as diferenças são listadas em CSV.

## Armazenamento aprovado

GitHub Releases, em pré-releases de teste identificadas pelo run_id e pelas UFs. Assets recebem nomes únicos, SHA-256, linhas, bytes e mapeamento para a partição original. Não há ZIP bruto nem arquivos de dados acima de 90 MB no git. Relatório e manifesto pequeno vão para o branch da execução. Uma release só sai de rascunho após todas as UFs solicitadas passarem e todos os assets serem enviados. O código limita cada asset a menos de 2 GiB e a release a 1.000 assets, conforme [limites oficiais](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).

## Próximo passo

O [PR #1](https://github.com/eduvaldoski2/op-apuracao2turno/pull/1) contém o teste. O workflow manual novo precisa estar no branch padrão para seu primeiro despacho, conforme [documentação do GitHub](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow). O PR não foi mesclado automaticamente. A primeira execução de conversão deverá usar AC; só após avaliar o piloto deve-se solicitar TODAS.

Os testes locais usam dados declaradamente sintéticos: não são conferências eleitorais nem resultados de votos do TSE. Instruções e limitações completas em `scripts/lake/README.md`.
