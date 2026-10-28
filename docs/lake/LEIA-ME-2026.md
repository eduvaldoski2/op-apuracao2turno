# Lake eleitoral 2026 (TSE, por seção)

Release: https://github.com/eduvaldoski2/op-apuracao2turno/releases/tag/lake-2026 (35 arquivos, ~283 MB, Parquet zstd).
Gerado por `scripts/lake_gerais/build_lake.py` (workflow `lakeg-build.yml`, manual). Conferência completa: `conferencia-2026.md`.

| Arquivo | Conteúdo |
|---|---|
| `secao_2026_BR.parquet` | Presidente, 1º e 2º turno, todas as seções do país |
| `secao_2026_<UF>.parquet` | Governador (1º/2º turno), senador, deputado federal, estadual/distrital por seção. `ZZ` (exterior) vem vazio: não há cargos estaduais no exterior |
| `local_secao_2026.parquet` | Seção → local de votação, endereço, bairro, CEP, latitude/longitude, eleitores |
| `detalhe_secao_2026.parquet` | Aptos, comparecimento, abstenções, nominais, brancos, nulos, legenda por seção e cargo |
| `candidato_2026.parquet` | Candidaturas (sem CPF, e-mail, título, nome social e data de nascimento completa) |
| `zona_2026.parquet` | Votos nominais por candidato, município e zona |

Chave de seção: `uf + cd_municipio_tse + zona + secao` (junta votos, local e detalhe). Junção candidato: `sq_candidato`.
Leitura direta (DuckDB): `SELECT * FROM read_parquet('https://github.com/eduvaldoski2/op-apuracao2turno/releases/download/lake-2026/secao_2026_RJ.parquet')`.

Conferência: soma de votos por seção = detalhe da apuração em todos os cargos e turnos (diferença 0). Contra `votacao_candidato_munzona` há diferenças pequenas e já divulgadas (ex.: presidente 1º turno 5.246 votos, 0,004%), provavelmente por arquivos gerados em datas diferentes; 2º turno bate exatamente.
