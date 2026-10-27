# Cadastro de candidaturas — Eleições Gerais 2026

Fonte: TSE, dados abertos (`cdn.tse.jus.br/estatistica/sead/odsele/`): `consulta_cand`, `consulta_cand_complementar`, `bem_candidato`, `motivo_cassacao`.
Posição dos arquivos do TSE: gerados em 25/10/2026 12:30. Para atualizar, rodar o workflow **cand.yml** (Actions → "Cadastro de candidaturas") — ele baixa de novo, remonta, confere e faz commit.
Montagem: `scripts/build_cand.py`.

## Arquivos (`data/cand/2026/`)
| Arquivo | Conteúdo |
|---|---|
| `idx.json` | colunas, cargos, total e contagem por UF |
| `<UF>.json` | `{cols, rows}` — uma linha por candidatura (inclui vices e suplentes de senador). `BR.json` = Presidente e Vice |
| `bens/<UF>.json` | bens declarados: `sq, ordem, cd_tipo, tipo, descricao, valor` (77.446 itens) |
| `cassacao.json` | motivos de indeferimento/cassação por candidatura (1.314 linhas) |

Total: **21.017 linhas** (20.989 do 1º turno + 28 do 2º). Por cargo no 1º turno: dep. estadual 11.295, dep. federal 7.803, dep. distrital 433, senador 319, 1º/2º suplente 349/350, governador 201 (+12 no 2º turno), vice-governador 211, presidente 14, vice-presidente 14.

## Colunas de `<UF>.json`
`sq` (chave da candidatura no TSE), `turno`, `eleicao`, `uf`, `ue`, `nm_ue`, `cargo` (1 pres, 2 vice-pres, 3 gov, 4 vice-gov, 5 sen, 6 dep.fed, 7 dep.est, 8 dep.distrital, 9/10 suplentes), `ds_cargo`, `nr`, `nome`, `urna`, `sigla`, `nr_partido`, `federacao`, `tp_agremiacao`, `coligacao`, `composicao`, `genero`, `instrucao`, `estado_civil`, `cor`, `ocupacao`, `nasc_ano`, `nasc_uf`, `idade_posse`, `nacionalidade`, `quilombola`, `etnia`, `resultado` (situação de totalização: ELEITO, ELEITO POR QP/MÉDIA, NÃO ELEITO, SUPLENTE, 2º TURNO), `sit_registro` (DEFERIDO, INDEFERIDO…, RENÚNCIA, FALECIMENTO…), `julgamento`, `na_urna` (SIM/NÃO), `destino_votos` (Válido, Anulado sub judice, Anulado, Nulo técnico), `reeleicao`, `declara_bens`, `despesa_max`, `prest_contas`, `substituido`, `sq_substituido`, `ordem_suplencia`, `bens_n`, `bens_total`.
Valores "#NULO", "#NE", "NÃO DIVULGÁVEL" e códigos negativos viram `null`.

## O que **não** foi gravado (minimização / LGPD)
CPF, e-mail, número do título de eleitor, nome social e data de nascimento completa (fica ano de nascimento e idade na posse). Os arquivos do TSE trazem esses campos; aqui não são necessários.

## Conferência feita (contra `data/hist/uf/<UF>/idx.json`)
- Todos os **19.072** candidatos (titulares de gov/sen/dep) com voto no `hist/` existem no cadastro (chave UF + cargo + número). Nenhum ficou sem correspondência.
- O `hist/` tinha **618** candidatos com nome "?" (sem nome); o cadastro resolve todos.
- Cadastro sem correspondência no `hist/`: 860 candidaturas, quase todas com `na_urna = NÃO` (849) — registradas, mas que não chegaram à urna; e 11 que chegaram com votos anulados.
- O `hist/` tem ainda linhas "LEGENDA" (voto de legenda), que não são candidatos.
- Presidente: o cadastro tem 14 candidaturas no 1º turno; o `hist/` e `res_1t.json` têm 13 com voto.

## Cuidados de uso
- **Chave de junção com votos:** (`uf`, `cargo`, `nr`) restrita a `na_urna = "SIM"` e `turno = 1`. Substituto e substituído usam o mesmo número; por isso filtrar `na_urna`. Ainda assim há 4 casos de número repetido entre quem estava na urna — nesses usar `sq`.
- `sit_registro` e `resultado` são "nulos" em 1.069 candidaturas que não chegaram à urna (`na_urna = NÃO`).
- A situação do registro refletia o julgamento na data do arquivo (há 427 "indeferido em prazo recursal ou com recurso" e 8 pendentes); pode mudar com novas posições do TSE.
- O arquivo é um retrato do TSE em 25/10/2026; não é histórico de mudanças.
