# Candidaturas do TSE (consulta_cand) e identificador de pessoa

Gerado em 2026-11-07T00:43:38.294288+00:00Z. Fonte: https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand

## 1) Candidaturas por ano e como cada uma foi ligada a uma pessoa

| Ano | Candidaturas | Via CPF | Nome ligado ao CPF | Nome (chave única) | Nome incerta | Sem CPF (%) |
|---|---|---|---|---|---|---|
| 1994 | 12.035 | 0 | 7.196 | 4.621 | 218 | 100.0% |
| 1996 | 321.790 | 0 | 96.760 | 100.894 | 124.136 | 100.0% |
| 1998 | 15.092 | 14.630 | 262 | 191 | 9 | 3.1% |
| 2000 | 399.455 | 396.490 | 1.081 | 1.796 | 88 | 0.7% |
| 2002 | 18.109 | 17.763 | 56 | 57 | 233 | 1.9% |
| 2004 | 402.157 | 401.335 | 264 | 348 | 210 | 0.2% |
| 2006 | 19.303 | 19.303 | 0 | 0 | 0 | 0.0% |
| 2008 | 382.079 | 382.079 | 0 | 0 | 0 | 0.0% |
| 2010 | 22.577 | 22.577 | 0 | 0 | 0 | 0.0% |
| 2012 | 483.741 | 344.170 | 67.205 | 68.375 | 3.991 | 28.9% |
| 2014 | 26.263 | 26.235 | 27 | 0 | 1 | 0.1% |
| 2016 | 498.391 | 498.282 | 0 | 0 | 109 | 0.0% |
| 2018 | 29.287 | 29.179 | 0 | 0 | 108 | 0.4% |
| 2020 | 558.804 | 558.520 | 0 | 0 | 284 | 0.1% |
| 2022 | 29.322 | 29.293 | 0 | 0 | 29 | 0.1% |
| 2024 | 463.926 | 0 | 220.212 | 236.032 | 7.682 | 100.0% |
| 2026 | 21.017 | 21.014 | 0 | 0 | 3 | 0.0% |

Total: 3.703.348 candidaturas. 2.310.227 pessoas distintas.

## 2) Quantas pessoas disputaram em mais de um ano

| Anos disputados | Pessoas |
|---|---|
| 1 | 1.596.930 |
| 2 | 384.530 |
| 3 | 159.432 |
| 4 | 81.033 |
| 5 | 43.408 |
| 6 | 23.855 |
| 7 | 12.818 |
| 8+ | 8.221 |

## 3) Alertas de qualidade

- Mesma pessoa com mais de uma candidatura na mesma eleição, turno, cargo e unidade (possível erro de ligação ou substituição de candidatura): 5.311
- Chaves nome+ano de nascimento que pertencem a mais de um CPF (homônimos; esses nunca são ligados por nome): 22.695
- Pessoas (por CPF) que aparecem com mais de um nome civil ao longo dos anos (mudança de nome ou grafia): 169.188

## 4) Como cruzar votos

A tabela de votos de cada ano (`zona_<ano>.parquet` dos releases `lake-<ano>`) traz `sq_candidato`. Junte por (`ano`, `sq_candidato`) com `candidaturas.parquet` e agrupe por `pessoa_id`.
`pessoa_id` = MD5 (14 caracteres) da chave pública (ano|cargo|uf|ue|sq) da primeira candidatura da pessoa: estável entre reconstruções (só muda se o TSE alterar a ligação entre candidaturas).
