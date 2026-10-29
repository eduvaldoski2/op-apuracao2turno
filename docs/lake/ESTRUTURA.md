# Lake eleitoral da Oficina Política — estrutura única (contrato)

Este documento é o contrato entre quem **adquire** os dados (ChatGPT: buscar no TSE, baixar, converter, conferir, publicar) e quem **estrutura** (Claude: esquema, camadas derivadas, painel). Existe **uma** estrutura: a que está aqui e em `scripts/lake_gerais/build_lake.py`. Não criar esquemas, nomes ou conversores paralelos.

## Divisão de trabalho
| Quem | Faz | Não faz |
|---|---|---|
| ChatGPT (aquisição) | inventário no catálogo do TSE; download **somente no GitHub Actions**; conversão ao esquema abaixo; conferências; publicação em Releases; relatório por ano em `docs/lake/` | alterar `js/`, `css/`, `data/`, `index.html`, `painel.html` (painel e dados do painel são do Claude); mudar nomes/colunas do esquema sem pedir |
| Claude (estrutura) | esquema canônico, camadas derivadas (JSON do painel, marca de voto válido, regiões), painel, login | baixar do TSE (a sandbox é bloqueada) |

Mudança de esquema: abrir issue/PR descrevendo a coluna e o motivo; o Claude aprova e atualiza este arquivo.

## Arquivos canônicos por ano (Release `lake-<ano>`, Parquet zstd, nomes planos)
| Arquivo | Conteúdo | Fonte TSE |
|---|---|---|
| `secao_<ano>_<UF>.parquet` (+ `secao_<ano>_BR.parquet` quando o presidente vem à parte) | votos por seção, todos os cargos e turnos da UF | `votacao_secao_<ano>_<UF>.zip` |
| `local_secao_<ano>.parquet` | seção → local de votação, endereço, bairro, CEP, coordenadas, eleitores | `eleitorado_local(s)_votacao` |
| `detalhe_secao_<ano>.parquet` | aptos, comparecimento, abstenções, nominais, brancos, nulos, legenda por seção e cargo | `detalhe_votacao_secao` |
| `candidato_<ano>.parquet` | candidaturas | `consulta_cand` |
| `zona_<ano>.parquet` | votos nominais por candidato, município e zona | `votacao_candidato_munzona` |
| `partido_<ano>.parquet` | votos de legenda por partido, município e zona (criar se ainda não existir; colunas: `ano turno cd_eleicao uf cd_municipio_tse zona cargo nr_partido sigla federacao qt_votos_legenda_validos qt_votos_legenda_anulados qt_votos_legenda_anul_subjud`) | `votacao_partido_munzona` |
| `detalhe_zona_<ano>.parquet` | totais oficiais por município e zona (comparação de totais) | `detalhe_votacao_munzona` |
| `manifesto_<ano>.json` e `conferencia_<ano>.md` | proveniência, hashes, contagens, conferências | gerados |

Colunas (nomes exatos, minúsculas; ver `build_lake.py` para os tipos): 
- `secao`: `ano turno cd_eleicao cargo uf cd_municipio_tse zona secao nr_local_votacao nr_votavel nm_votavel qt_votos sq_candidato`
- `local_secao`: `ano turno uf cd_municipio_tse municipio zona secao cd_tipo_secao_agregada secao_principal nr_local nome_local tipo_local endereco bairro cep latitude longitude situacao_secao acessibilidade eleitores eleitores_federal eleitores_estadual`
- `detalhe_secao`: `ano turno cd_eleicao cargo uf cd_municipio_tse zona secao nr_local_votacao aptos comparecimento abstencoes votos_nominais brancos nulos legenda anulados_apu_sep origem_voto secao_instalada secao_anulada`
- `candidato`: `ano turno cd_eleicao uf ue nm_ue cargo ds_cargo sq_candidato nr nome nome_urna situacao_candidatura nr_partido sigla federacao composicao_federacao coligacao uf_nascimento ano_nascimento genero instrucao estado_civil cor_raca ocupacao situacao_final`
- `zona`: `ano turno cd_eleicao uf cd_municipio_tse municipio zona cargo sq_candidato nr_votavel nome_urna sigla qt_votos_nominais qt_votos_nominais_validos destinacao situacao_final`

Regras:
1. **Chave de seção**: `uf + cd_municipio_tse + zona + secao`. Candidato: `sq_candidato`. Código do município é o do **TSE** (não o IBGE).
2. **Anos antigos**: o TSE muda nomes de colunas e formatos entre anos. Mapear sempre para os nomes canônicos acima; coluna que não existiu naquele ano fica `NULL` (nunca inventar). Registrar o mapa em `docs/lake/layouts/<ano>.md` (cabeçalho original → coluna canônica, diferenças de codificação, cargos existentes, níveis disponíveis: seção, zona ou município).
3. **Eleições municipais**: manter só a eleição **ordinária** (excluir suplementares pelo tipo de eleição); cargos `11` (prefeito) e `13` (vereador) nos votos; `12` (vice) só em `candidato`. Locais: usar só as datas do pleito ordinário. Gerais: todos os cargos (1 presidente, 3 governador, 5 senador, 6 dep. federal, 7 dep. estadual, 8 dep. distrital).
4. **Privacidade (LGPD)**: nunca persistir CPF, e-mail, título de eleitor, nome social, data de nascimento completa (só `ano_nascimento`), telefone, nem dados de bens. Descartar antes de gravar qualquer intermediário.
5. **Downloads somente no GitHub Actions**; ZIP bruto é temporário (não vai para o repositório nem para a Release). Cada fonte nacional (candidato, munzona, detalhes, locais) deve ser baixada **uma vez por execução** e reaproveitada pelos lotes por UF (artifact), não 27 vezes.
6. **Publicação**: Release `lake-<ano>` (rascunho até todos os arquivos subirem e a conferência passar; depois publicada). Arquivo abaixo de 2 GiB; se passar, dividir por cargo mantendo o mesmo nome com sufixo `_parteNN`. Reprocessamento substitui o arquivo na mesma tag e atualiza o manifesto (guardar o hash anterior).
7. **Manifesto**: para cada arquivo, URL de origem, `Last-Modified`/ETag, `DT_GERACAO/HH_GERACAO` internos quando existirem, bytes, SHA-256, linhas e commit/run do Actions.

## Conferências (obrigatórias, com listas completas das diferenças)
1. Votos por seção × detalhe da seção (por turno e cargo): total de votos e nº de seções.
2. Votos nominais por seção × `zona` (por turno, cargo, município, zona, candidato).
3. Seções com voto sem local no cadastro; locais sem bairro; locais sem coordenada.
4. Totais por cargo/turno × `detalhe_zona`.

**Política de divergência** (substitui "qualquer diferença bloqueia"): classificar cada diferença antes de decidir.
- *Explicadas* (não bloqueiam; listar): candidato indeferido/cancelado/anulado sub judice (usar `situacao_candidatura`, `situacao_final`, e `qt_votos_nominais_validos` × `qt_votos_nominais`); seções agregadas, não instaladas ou anuladas (`secao_instalada`, `secao_anulada`, `cd_tipo_secao_agregada`); seção sem local por cadastro posterior.
- *Não explicadas* (bloqueiam a publicação como validada): total de votos diferente do detalhe sem causa acima; chaves nulas; votos negativos; siglas ambíguas; fonte mudou de conteúdo entre lotes.
Estado do ano: `validado` (zero não explicadas, listando as explicadas) ou `divergente`. Nunca ajustar valores em silêncio.

## Já publicado (não refazer sem pedido)
`lake-2026`, `lake-2022`, `lake-2018` (eleições gerais). Conferências em `docs/lake/conferencia-<ano>.md`.
