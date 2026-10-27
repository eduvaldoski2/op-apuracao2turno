# data/hist — bases históricas migradas do apuracao-4013

Copiadas em 27/10/2026 de `eduvaldoski2/apuracao-4013` (pastas `hist/` e `scripts/`) **sem alterar nomes nem conteúdo** (conferido por SHA-256, arquivo a arquivo). Os arquivos se referenciam por nome e por posição: não renomear nem reordenar.

- `data/hist/` → `hist/` original (RJ 2018–2026 por bairro/zona; Brasil 2026 por local de votação em `uf/<UF>/`).
- `scripts/apuracao-4013/` → `build_uf.py`, `build_resumo.py`, `bu_bairros.py`, `rj_secoes_bairros.json`.
- `data/hist/SHA256SUMS.json` → SHA-256 de cada arquivo copiado (referência para conferir cópias e o deploy).
- `scripts/verifica_hist.py` → confere JSON válidos, arquivos citados e totais do guia (`python3 scripts/verifica_hist.py`).

**Atenção (correção ao guia abaixo):** em `idx.json`, os nomes em `cargos[].arq` vêm **sem extensão** (ex.: `c3t1`); o arquivo é `c3t1.json`.

---

# Bases de dados do painel de apuração: guia de migração para a Oficina Política

Atualizado em 27/10/2026

## Resumo

As bases estão em três repositórios públicos do GitHub da conta eduvaldoski2, somam cerca de 320 MB e são só arquivos JSON estáticos, sem banco de dados. A cobertura nacional existe apenas para 2026; o histórico de 2018 a 2024 cobre só o Rio de Janeiro; o 2º turno presidencial de 2026 tem base própria, por município, bairro e seção.

- **Todo o Brasil, 2026, 1º turno:** 27 UFs mais Exterior, até local de votação (com endereço e coordenadas). Cargos: presidente, governador, senador, deputado federal e estadual (distrital no DF).
- **Rio de Janeiro, 2018 a 2026:** presidente, governador, senador, deputados (2018, 2022, 2026) e prefeito e vereador (2020, 2024), por bairro e zona nos 92 municípios.
- **Presidente 2026, 1º e 2º turno:** todos os candidatos por município; locais de votação e seções em todo o país.
- **Recomendação:** copiar as pastas de dados para o novo projeto sem alterar o formato, escolher uma camada de leitura (arquivos estáticos ou SQLite) e só depois padronizar. O caminho passo a passo está na seção de migração.

## Onde estão as bases

Todas as bases vivem em repositórios públicos do GitHub, em `https://github.com/eduvaldoski2/<repositório>`. Qualquer arquivo pode ser lido sem login por `https://raw.githubusercontent.com/eduvaldoski2/<repositório>/<branch>/<caminho>`, que aceita leitura de outro domínio (CORS).

| **Repositório**                                                        | **Acesso** | **Último push** | **O que guarda**                                                                                                   | **Dados**                       |
|------------------------------------------------------------------------|------------|-----------------|--------------------------------------------------------------------------------------------------------------------|---------------------------------|
| [apuracao-4013](https://github.com/eduvaldoski2/apuracao-4013)         | público    | 18/10/2026      | Histórico do RJ de 2018 a 2026 e 2026 nacional por local de votação (pasta `hist/`); painel da campanha            | 192 MB                          |
| [op-apuracao2turno](https://github.com/eduvaldoski2/op-apuracao2turno) | público    | 27/10/2026      | Presidente 2026, 1º e 2º turno: município, bairro, local e seção; malhas e mapas; coletor da apuração              | 124 MB mais as branches `dados` |
| [politicapro](https://github.com/eduvaldoski2/politicapro)             | público    | 06/10/2026      | Cópia enxuta do RJ (resumo por ano, busca de candidatos, nomes de municípios); lê o restante do painel de apuração | 4,7 MB                          |

### apuracao-4013: mapa das pastas

| **Caminho**                                                     | **Conteúdo**                                                                                                     | **Tamanho**                   |
|-----------------------------------------------------------------|------------------------------------------------------------------------------------------------------------------|-------------------------------|
| `hist/2018`, `hist/2020`, `hist/2022`, `hist/2024`, `hist/2026` | Votos do RJ por bairro e por zona, uma pasta por ano                                                             | 11 / 6,8 / 9,0 / 5,0 / 7,3 MB |
| `hist/uf/<UF>/`                                                 | 2026 por local de votação, uma pasta por UF (27 UFs e `ZZ` = Exterior)                                           | 153 MB, 292 arquivos          |
| `hist/uf/index.json`, `brasil.json`, `_resumo_todos.json`       | Índice das UFs, total de presidente por UF e resumo                                                              | 2 a 7 KB                      |
| `hist/geo.json`                                                 | Lista de 2.069 bairros do RJ (município, nome); a posição na lista é o id                                        | 50 KB                         |
| `hist/cap_busca.json`                                           | Candidatos do RJ ligados entre eleições (8.453 pessoas) e votos válidos por bairro e município                   | 842 KB                        |
| `hist/eleitos_2018.json`, `eleitos_2022.json`                   | Eleitos das 27 UFs: governador, senador e deputados federal, estadual e distrital (1.652 em 2018, 1.626 em 2022) | 125 / 101 KB                  |
| `scripts/`                                                      | `build_uf.py`, `build_resumo.py`, `bu_bairros.py`, `rj_secoes_bairros.json`                                      | pequeno                       |
| `teste-2022/`                                                   | Cópia de testes do painel de 2022; não precisa migrar                                                            | 7,5 MB                        |

Dois blocos de dados não estão em arquivo à parte: a divisão do Rio em regiões e bairros (`REG_DADOS`) e o eleitorado do RJ por local de votação (`RJB`) estão embutidos no `index.html` do painel.

### op-apuracao2turno: mapa das pastas

| **Caminho**                                          | **Conteúdo**                                                                                 | **Tamanho**           |
|------------------------------------------------------|----------------------------------------------------------------------------------------------|-----------------------|
| `data/base_1t.json`                                  | 1º turno de presidente por município (5.757 linhas)                                          | 474 KB                |
| `data/res_1t.json`                                   | 1º turno oficial, todos os candidatos: Brasil, UF e município                                | 428 KB                |
| `data/gov_1t.json`                                   | 1º turno de governador por UF                                                                | 22 KB                 |
| `data/bairros/<uf>/<código>.json`                    | Locais de votação por município: bairro, endereço, CEP, coordenadas e 1º turno por seção     | 39 MB, 5.757 arquivos |
| `data/b1t/<uf>/<código>.json`                        | Votos dos demais candidatos, por seção                                                       | 29 MB, 5.757 arquivos |
| `data/bairros_geo/`                                  | Polígonos de bairros (IBGE Censo 2022, OpenStreetMap, GeoSampa, IPEDF)                       | 42 MB, 4.687 arquivos |
| `data/mapa_mun/`, `mapa_br_mun.json`, `mapa_uf.json` | Mapas SVG de municípios e estados                                                            | 6 MB                  |
| `cartoes/data/catalogo.json`                         | Catálogo dos cartões de redes sociais (formatos 1x1, 4x5, 9x16)                              | 625 KB                |
| branch `dados`                                       | `live/snap.json`, `hist.json`, `meta.json`: apuração do 2º turno de 25/10/2026, até as 23h27 | 0,6 MB                |
| branches `dados-b1` a `dados-b5`                     | Bairros e locais do 2º turno, por seção, em cinco grupos de estados                          | não medido            |
| branches `ensaio*`                                   | Ensaios; não migrar                                                                          | não medido            |

## Cobertura: eleições, cargos e estados

Só 2026 cobre o Brasil inteiro; antes disso há apenas o Rio de Janeiro. Nenhuma base tem outros estados em 2018, 2020, 2022 ou 2024, nem prefeito e vereador fora do RJ.

### Rio de Janeiro, 2018 a 2026 (`apuracao-4013/hist/<ano>`)

No nível de bairro e de zona eleitoral. Os anos municipais cobrem os 92 municípios do estado.

| **Ano** | **Cargos e turnos**                                                                      | **Candidaturas** |
|---------|------------------------------------------------------------------------------------------|------------------|
| 2018    | Presidente (1º e 2º), governador (1º e 2º), senador, deputado federal, deputado estadual | 3.587            |
| 2020    | Prefeito (1º e 2º), vereador                                                             | 26.205           |
| 2022    | Presidente (1º e 2º), governador, senador, deputado federal, deputado estadual           | 2.759            |
| 2024    | Prefeito (1º e 2º), vereador                                                             | 18.034           |
| 2026    | Governador, senador, deputado federal, deputado estadual (1º turno)                      | 1.996            |

Presidente em 2018 e 2022 traz os votos obtidos dentro do RJ. Presidente de 2026 não está nesta pasta: está em `hist/uf` e no `op-apuracao2turno`.

### Brasil, 2026, 1º turno (`apuracao-4013/hist/uf/<UF>`)

No nível de local de votação, agregado por município e bairro. São 5.716 municípios (incluindo 145 cidades do Exterior) e 94.709 locais de votação. Códigos de cargo: 1 presidente, 3 governador, 5 senador, 6 deputado federal, 7 deputado estadual, 8 deputado distrital.

| **UF**                 | **Municípios** | **Locais de votação** | **Cargos**    | **Tamanho (KB)** |
|------------------------|----------------|-----------------------|---------------|------------------|
| AC Acre                | 22             | 668                   | 1, 3, 5, 6, 7 | 725              |
| AL Alagoas             | 102            | 1.080                 | 1, 3, 5, 6, 7 | 1.155            |
| AM Amazonas            | 62             | 1.631                 | 1, 3, 5, 6, 7 | 2.029            |
| AP Amapá               | 16             | 376                   | 1, 3, 5, 6, 7 | 472              |
| BA Bahia               | 417            | 9.246                 | 1, 3, 5, 6, 7 | 11.936           |
| CE Ceará               | 184            | 6.724                 | 1, 3, 5, 6, 7 | 7.765            |
| DF Distrito Federal    | 1              | 622                   | 1, 3, 5, 6, 8 | 1.536            |
| ES Espírito Santo      | 78             | 1.767                 | 1, 3, 5, 6, 7 | 2.467            |
| GO Goiás               | 246            | 2.497                 | 1, 3, 5, 6, 7 | 4.464            |
| MA Maranhão            | 217            | 5.834                 | 1, 3, 5, 6, 7 | 6.117            |
| MG Minas Gerais        | 853            | 10.091                | 1, 3, 5, 6, 7 | 16.037           |
| MS Mato Grosso do Sul  | 79             | 1.033                 | 1, 3, 5, 6, 7 | 1.263            |
| MT Mato Grosso         | 142            | 1.515                 | 1, 3, 5, 6, 7 | 1.819            |
| PA Pará                | 144            | 5.844                 | 1, 3, 5, 6, 7 | 6.456            |
| PB Paraíba             | 223            | 1.844                 | 1, 3, 5, 6, 7 | 2.222            |
| PE Pernambuco          | 185            | 3.386                 | 1, 3, 5, 6, 7 | 5.876            |
| PI Piauí               | 224            | 3.422                 | 1, 3, 5, 6, 7 | 2.944            |
| PR Paraná              | 399            | 4.815                 | 1, 3, 5, 6, 7 | 8.239            |
| RJ Rio de Janeiro      | 92             | 5.034                 | 1, 3, 5, 6, 7 | 14.896           |
| RN Rio Grande do Norte | 167            | 1.572                 | 1, 3, 5, 6, 7 | 1.619            |
| RO Rondônia            | 52             | 677                   | 1, 3, 5, 6, 7 | 845              |
| RR Roraima             | 15             | 367                   | 1, 3, 5, 6, 7 | 440              |
| RS Rio Grande do Sul   | 497            | 7.796                 | 1, 3, 5, 6, 7 | 10.840           |
| SC Santa Catarina      | 295            | 3.478                 | 1, 3, 5, 6, 7 | 4.834            |
| SE Sergipe             | 75             | 1.214                 | 1, 3, 5, 6, 7 | 1.419            |
| SP São Paulo           | 645            | 11.079                | 1, 3, 5, 6, 7 | 35.537           |
| TO Tocantins           | 139            | 927                   | 1, 3, 5, 6, 7 | 932              |
| ZZ Exterior            | 145            | 170                   | 1             | 37               |

### Presidente 2026, 1º e 2º turno (`op-apuracao2turno`)

| **Dado**                      | **Cobertura**                                                                                 | **Onde**                                |
|-------------------------------|-----------------------------------------------------------------------------------------------|-----------------------------------------|
| 1º turno, todos os candidatos | Brasil, UF e 5.757 municípios (incluindo cidades do Exterior)                                 | `data/res_1t.json`, `data/base_1t.json` |
| 1º turno por local e seção    | Todos os municípios: locais com endereço e coordenadas; votos dos demais candidatos por seção | `data/bairros`, `data/b1t`              |
| 2º turno, 25/10/2026          | Brasil, UF e município, com 499.248 seções totalizadas no último registro (23h27)             | branch `dados`, pasta `live`            |
| 2º turno por bairro e seção   | Lula e Flávio Bolsonaro, em cinco grupos de estados                                           | branches `dados-b1` a `dados-b5`        |
| Governador, 1º turno 2026     | Todas as UFs                                                                                  | `data/gov_1t.json`                      |

### O que não existe nas bases

- Perfil demográfico de eleitores ou candidatos (gênero, raça, idade): não está em nenhum arquivo.
- Governador no 2º turno de 2026 e outros cargos fora do RJ antes de 2026.
- Votos por seção em `hist/uf`: os dados foram somados por local de votação. Só o `op-apuracao2turno` guarda a seção.

## Formatos e esquemas

Tudo é JSON estático, sem banco de dados. Os arquivos usam arrays posicionais (sem nomes de campo) para ficarem pequenos, então o esquema abaixo é a única chave de leitura.

### Pasta de um ano (`hist/<ano>`)

`idx.json` é o índice e `c<cargo>t<turno>[b<k>|r<k>].json` traz os votos.

| **Chave de** `idx.json` | **Conteúdo**                                                                                                                                                                                              |
|-------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `ano`                   | Ano da eleição                                                                                                                                                                                            |
| `cargos`                | Lista de `{c, t, nome, arq[], tot{comp, val, br, nu, valZ}}`. `arq` são os arquivos de votos do cargo; `tot` traz comparecimento, válidos, brancos e nulos como `[[bairroIdx, valor]]`, e `valZ` por zona |
| `cands`                 | Uma linha por candidatura: `[cargo, turno, ue, nr, nome, sigla, situação, pid, coligação, votos]`. `ue` é `'RJ'`, `'BR'` (presidente) ou o código TSE do município                                        |
| `z`                     | Zonas, como `"cdMun:zona"`; a posição é o id da zona                                                                                                                                                      |
| `aptB`, `aptZ`          | Eleitores aptos por bairro e por zona: `[[idx, aptos]]` (ausentes em 2026)                                                                                                                                |
| `reg`                   | As 10 regiões do RJ                                                                                                                                                                                       |
| `ab`, `az`              | Por turno: `[[idx, aptos, comparecimento]]` para bairro e zona                                                                                                                                            |

Arquivos de votos: `{nr: {b: [bairroIdx, votos, ...], z: [zonaIdx, votos, ...]}}`, com pares achatados. Em eleição municipal a chave é `nr@cdMun`.

Regras de divisão: deputado federal e estadual vêm em 8 peças `b0` a `b7`, com `k = nr % 8`. Vereador vem em 10 peças `r0` a `r9`, fixas por município (a capital está em `r2`). Para ler um cargo, abra todos os arquivos listados em `cargos[].arq`, sem deduzir o nome.

`hist/geo.json` guarda `{b: [[cdMun, nome]], gerado}`. Os 2.069 bairros são identificados pela posição na lista, e os mesmos ids valem em todos os anos.

### Arquivos transversais

| **Arquivo**                                   | **Esquema**                                                                                                                                                                           |
|-----------------------------------------------|---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `hist/cap_busca.json`                         | `p`: 8.453 pessoas, `[pid, nome, [[ano, cargo, nr, sigla, ue, votosCapital, situação, votosTotal]]]`. Também `val`, `vb` e `vm` (válidos por ano e cargo, por bairro e por município) |
| `hist/eleitos_2018.json`, `eleitos_2022.json` | Eleitos nas 27 UFs: `[UF, cargo, turno, nr, nome, sigla, coligação, situação]`                                                                                                        |

`pid` é um id de pessoa de 9 caracteres hexadecimais que liga a mesma pessoa entre eleições. Só existe para o RJ.

### Brasil 2026 (`hist/uf/<UF>`)

| **Arquivo**                            | **Esquema**                                                                                                                                                                                                      |
|----------------------------------------|------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| `geo.json`                             | `{uf, m: [[cd, nome]], b: [[mi, nome]], l: [[mi, zona, nrLocal, bi, nome, endereço, lat, lon, eleitores, seções]]}`. `mi` e `bi` apontam para posições em `m` e `b`. O id do local de votação é a posição em `l` |
| `idx.json`                             | `{uf, nome, turno, gerado, cargos: [{c, nome, k, tot: [[lid, validos, brancos, nulos]]}], cands: [[c, nr, urna, nome, sigla, sit, ali, votos, valido]]}`                                                         |
| `c<cargo>.json` ou `c<cargo>b<k>.json` | `{nr: {l: [lid, votos, ...]}}`                                                                                                                                                                                   |

Na pasta `hist/uf` também há `index.json` (municípios, locais, cargos e tamanho por UF), `brasil.json` (presidente por UF e os 13 candidatos) e `_resumo_todos.json`.

### op-apuracao2turno

| **Arquivo**                                                | **Esquema**                                                                                                                |
|------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| `data/base_1t.json`                                        | 5.757 linhas `[uf, cd, nome, cdIBGE, ts, te, c, a, vb, tvn, L, F, vv, st]`, uma por município, com o resultado do 1º turno |
| `data/res_1t.json`, `gov_1t.json`                          | Todos os candidatos por Brasil, UF e município (presidente e governador)                                                   |
| `data/bairros/<uf>/<cd5>.json`                             | Locais de votação do município, com endereço, CEP, coordenadas e seções                                                    |
| `data/b1t/`                                                | Votos dos demais candidatos por seção                                                                                      |
| `data/bairros_geo/`                                        | Polígonos e dados do Censo 2022 (IBGE), OSM, GeoSampa e IPEDF                                                              |
| branch `dados`: `live/snap.json`, `hist.json`, `meta.json` | Fotografia atual da apuração e histórico de totalizações                                                                   |

`cd5` é o código TSE do município com 5 dígitos. Ele não é o código do IBGE, que está em `cdIBGE`.

### Exemplos de leitura

Total de votos de um candidato a governador no RJ em 2022, por bairro:

    const B = 'https://eduvaldoski2.github.io/apuracao-4013/hist/';
    const idx = await (await fetch(B + '2022/idx.json')).json();
    const geo  = await (await fetch(B + 'geo.json')).json();
    const cargo = idx.cargos.find(x => x.c === 3 && x.t === 1);
    const votos = {};
    for (const arq of cargo.arq) Object.assign(votos, await (await fetch(B + '2022/' + arq)).json());
    const v = votos[44].b;                       // candidato nº 44
    for (let i = 0; i < v.length; i += 2) console.log(geo.b[v[i]][1], v[i + 1]);

Votos por local de votação de um candidato a presidente em um estado em 2026:

    import json, urllib.request as u
    B = 'https://eduvaldoski2.github.io/apuracao-4013/hist/uf/SP/'
    get = lambda f: json.load(u.urlopen(B + f))
    geo, v = get('geo.json'), get('c1.json')
    l = v['13']['l']                              # candidato nº 13
    for i in range(0, len(l), 2):
        print(geo['l'][l[i]][4], l[i + 1])        # nome do local, votos

Se um cargo de 2026 não tiver `c<cargo>.json` único, procure também `c<cargo>b0.json` a `b7.json` e junte os resultados. Rode essa verificação na primeira leitura de cada cargo.

## Como migrar para o Oficina Política

A recomendação é migrar em duas fases: primeiro ler os dados onde estão, depois copiar o que o projeto realmente usa. Os arquivos não precisam ser convertidos para funcionar.

### Fase 1: consumir sem copiar

Os três repositórios são públicos. `apuracao-4013` e `politicapro` já servem os JSON pelo GitHub Pages, e o `op-apuracao2turno` pode ser lido pela URL raw do GitHub.

    https://eduvaldoski2.github.io/apuracao-4013/hist/2022/idx.json
    https://raw.githubusercontent.com/eduvaldoski2/op-apuracao2turno/main/data/res_1t.json
    https://raw.githubusercontent.com/eduvaldoski2/op-apuracao2turno/dados/live/snap.json

Isso serve para prototipar. Para produção, a dependência de outro domínio é um risco: o formato pode mudar sem aviso e o `politicapro` já depende do Pages do `apuracao-4013` pelo mesmo motivo.

### Fase 2: copiar para o projeto

1.  Escolha o que o Oficina Política precisa. Sem o bairro do RJ, basta `hist/uf` (153 MB); com o histórico do RJ, some `hist/2018` a `hist/2026`, `geo.json`, `cap_busca.json` e os dois `eleitos` (cerca de 40 MB).
2.  Copie as pastas sem alterar nomes nem conteúdo. Os arquivos se referenciam por nome (`cargos[].arq`) e por posição, então renomear ou reordenar quebra a leitura.
3.  Se o projeto for novo, clone os repositórios inteiros em vez de baixar arquivos soltos, para manter o histórico do Git:

<!-- -->

    git clone --depth 1 https://github.com/eduvaldoski2/apuracao-4013.git
    git clone --depth 1 https://github.com/eduvaldoski2/op-apuracao2turno.git
    git clone --depth 1 https://github.com/eduvaldoski2/politicapro.git

4.  Escreva uma camada de leitura única no projeto novo (uma função por esquema da seção anterior) e use só ela para acessar os dados. Assim a escolha entre arquivos estáticos e outro formato fica isolada em um lugar.
5.  Se precisar consultar de várias formas (por candidato, município, bairro), considere carregar os JSON em SQLite ou Parquet. As bases cabem em memória no navegador por UF, mas não todas de uma vez: `hist/uf` inteiro tem 153 MB.

### Chaves e convenções de identificação

| **Identificador**                      | **Observação**                                                                                                                                                                       |
|----------------------------------------|--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Código de município do TSE (5 dígitos) | Usado em todas as bases. A capital do RJ é `60011`; municípios do RJ começam em `58`. Não confundir com o código do IBGE (7 dígitos), que só aparece em `base_1t.json` como `cdIBGE` |
| Cargo                                  | 1 presidente, 3 governador, 5 senador, 6 deputado federal, 7 deputado estadual, 8 deputado distrital, 11 prefeito, 13 vereador                                                       |
| Bairro                                 | Posição em `hist/geo.json`, válida só para o RJ. Em `hist/uf`, o bairro vem de `geo.json` de cada UF                                                                                 |
| Local de votação                       | Posição em `l` dentro do `geo.json` da UF                                                                                                                                            |
| `pid`                                  | Pessoa, só no RJ. Para outros estados, use cargo, número e sigla como chave provisória                                                                                               |
| `ue`                                   | `'RJ'`, `'BR'` ou código TSE do município, conforme o cargo                                                                                                                          |

### O que reaproveitar do código

- `scripts/build_uf.py`, para refazer `hist/uf` a partir dos agregados do TSE (argumentos: pasta dos agregados, pasta de saída, UFs).
- `scripts/build_resumo.py` e `scripts/bu_bairros.py`, para os resumos e para os votos por bairro a partir dos boletins de urna.
- No `op-apuracao2turno`: `coletor.mjs`, `secoes.mjs`, `bu.mjs`, `build_bairros.mjs`, `res1t.mjs`, `gov1t.mjs` e os `build_geo_*.py`, com os workflows em `.github/workflows` que mantêm a apuração ao vivo. O README do repositório descreve as rotas e as fontes.
- No `index.html` do `apuracao-4013`: o motor de imagem e PDF (módulos `RND`, `PNGX` e `PDFX`), a ordenação de candidatos e a lógica de Cruzamento por região. O arquivo é único e em JavaScript puro, então dá para copiar o módulo desejado.
- `REG_DADOS` (regiões e bairros do RJ) e `RJB` (eleitorado por local no RJ) estão embutidos no `index.html`, não em arquivos à parte.

### Cuidados

- **Tamanho.** Os dados somam cerca de 320 MB (153 MB de `hist/uf`, 40 MB de `hist` do RJ e 124 MB de `op-apuracao2turno/data`). Repositórios no GitHub pedem atenção acima de 1 GB, e o Pages tem limite de 1 GB por site. Se o Oficina Política for hospedado no Pages, prefira buscar `hist/uf` sob demanda por UF a copiar tudo para o site.
- **Cache.** O `apuracao-4013` usa service worker com a versão em `sw.js` (hoje `apuracao-v75`). Ao copiar o código do painel, troque o nome do cache ou os arquivos antigos serão servidos.
- **Regerar a partir do TSE.** Os agregados intermediários (`agg/*.json.gz`, 166 MB) não foram salvos em nenhum repositório. Os scripts de `hist/<ano>`, `cap_busca` e `eleitos` também não estão nos repositórios. Trate os JSON publicados como a fonte, não como algo fácil de refazer.
- **Uso sem internet.** Se o projeto novo precisar funcionar offline, copie os JSON para dentro dele e sirva-os com um service worker próprio. A leitura direta pela URL do Pages exige conexão.

## Limitações, fonte e data de referência

Esta documentação descreve o estado das bases em 27/10/2026. O último registro do 2º turno no `op-apuracao2turno` é de 25/10/2026, às 23h27.

### Limitações conhecidas

- **Abrangência.** Antes de 2026 só há o Rio de Janeiro. Não existe base nacional para 2018, 2020, 2022 ou 2024, nem prefeito e vereador fora do RJ.
- **2º turno.** O governador no 2º turno não foi coletado. A presidencial de 2026 no 2º turno está apenas no `op-apuracao2turno`, em branches `dados`, e não na pasta `hist`.
- **Granularidade.** `hist/uf` agrega por local de votação, não por seção. Só o `op-apuracao2turno` guarda seção: o 1º turno de presidente em votos de todos os candidatos, e o 2º turno em Lula e Flávio Bolsonaro.
- **Perfil.** Não há gênero, raça, idade ou escolaridade de eleitores ou candidatos.
- `pid`**.** O id que liga a mesma pessoa entre eleições só existe para o RJ, e o script que o gera não está em nenhum repositório. Não dá para estendê-lo a outros estados com o que está publicado.
- **Reprodução.** Os agregados intermediários e os scripts de `hist/<ano>`, `cap_busca` e `eleitos` não foram guardados. Os JSON publicados são a única cópia utilizável.
- `politicapro`**.** O repositório é uma cópia de 6/10/2026, com resumos por ano e a busca de pessoas. Não tem os dados dos 27 estados.

### Fonte dos dados

Todos os números vêm dos dados abertos do TSE (portal dadosabertos.tse.jus.br): votação por seção e eleitorado por local de votação. A apuração ao vivo de 2026 vem da API de resultados do TSE (`resultados.tse.jus.br`). Mapas e malhas usam IBGE (Censo 2022), OpenStreetMap, GeoSampa e IPEDF. Este trabalho é uma iniciativa independente, sem vínculo com o TSE, e os dados devem ser citados com a fonte original.

Os números do 2º turno de 2026 são parciais até a totalização final. Se o Oficina Política for publicar totais oficiais, confira antes no site do TSE.
