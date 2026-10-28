# Oficina Política · Painel de apuração do 2º turno 2026

Painel (site estático) que acompanha a apuração do 2º turno da eleição presidencial de 25/10/2026, com comparação ao 1º turno,
mapa por estado, listas por candidato → estado → município, exportação (PDF/PNG/CSV) e aba de **Projeção** do resultado final.

## Como funciona
- `data/base_1t.json` — resultado final do 1º turno por município (gerado pelo workflow **Montar base do 1º turno**).
- **Coletor** (`scripts/coletor.mjs`, workflow *Coletor da apuração*): lê os arquivos do TSE, calcula a projeção e publica `snap.json`, `hist.json`, `meta.json` na branch `dados`.
- **Versão de testes** em `/apuracao-2t-2026/teste/` (mesmos arquivos; `TESTE` em `js/config.js`): inclui conta, cadastro e pergunta à IA. O endereço público não mostra esses recursos, e `api/conta.php` e `api/ia.php` só respondem com `$CONTA_ATIVA = true` no `api/config.php`.
- **Painel** (`painel.html` + `js/`, servido em `/apuracao-2t-2026/`; a página inicial é `index.html`): lê a branch `dados` (se falhar, lê direto do TSE no nível de estado) e atualiza a cada 30 s.
- `?demo=1` abre uma **demonstração com dados simulados** (reprodução acelerada de uma apuração fictícia).

## Camada de bairros (Brasil › estado › município › bairro › local de votação › seções)
- Navegação: `#/mun/{uf}/{cd}` (mapa e tabela de bairros) → `#/mun/{uf}/{cd}/b/{n:NOME|g:índice}` (locais do bairro/distrito) → `#/mun/{uf}/{cd}/l/{zona-local}` (seções do local). Cada tela tem trilha de navegação, cartões, KPIs e CSV; em `#/p/…` é a mesma navegação no modo projeção.
- `data/bairros/{uf}/{cd5}.json` — locais de votação (TSE, dados abertos 2026): bairro, endereço, CEP, coordenadas, seções e 1º turno por seção. Gerado por `scripts/build_bairros.mjs` (workflow *Montar base de bairros*); confere exatamente com a base por município.
- `data/bairros_geo/{cd5}.json` — malha de bairros do IBGE (Censo 2022) e o polígono de cada local; só onde a malha existe (workflow *Malhas de bairros*, `scripts/build_geo_bairros.py`).
- `data/mapa_mun/{uf}.json` — SVG dos municípios de cada estado (`scripts/build_mapa_mun.py`, dados IBGE via tbrugz/geodata-br).
- **Coleta por seção** (`scripts/secoes.mjs` + `scripts/bu.mjs`, workflow *Coletor por seção*): decodifica o boletim de urna (BER/ASN.1) das seções totalizadas e publica `live/bairros/{uf}/{cd5}.json` nas branches `dados-b1…b5` (grupos de estados, `CONFIG.gruposBairros`). Ensaio: rodar o workflow com `pleito=3220 ele=6257 prefixo=ensaio-b forcar=sim`.

## Comandos
```
npm test                                   # testes do modelo + backtest sintético
node scripts/mock_tse.mjs --auto 180       # TSE simulado em localhost:8787
node scripts/coletor.mjs --out data/live --loop 10 --tse http://localhost:8787/oficial --basefile data/base_1t.json
python3 -m http.server 8000                # abre http://localhost:8000/?fonte=data/live/
```

## Créditos
Dados: TSE. Mapa: [@svg-maps/brazil](https://github.com/VictorCazanave/svg-maps) (CC BY 4.0). html2canvas e jsPDF (MIT) em `vendor/`.
Iniciativa independente, sem vínculo com o TSE.

## Cache do navegador
`node scripts/versao.mjs` carimba os imports com `?v=<hash>` (roda sozinho no pré-commit), para que quem já abriu o painel receba sempre a versão nova.

## Aba Resultados 1º Turno
- `scripts/res1t.mjs` (workflow *Resultado oficial do 1º turno por candidato*) → `data/res_1t.json`: Brasil, UF e município com todos os candidatos (+ partidos do `consulta_cand`).
- `data/b1t/{uf}/{cd5}.json` (gerado por `scripts/build_bairros.mjs`): voto dos candidatos além de Lula/Flávio por seção; só é carregado na aba do 1º turno para listar todos os candidatos em distrito, bairro e local.
- Rotas: `#/t1`, `#/t1/uf/{uf}`, `#/t1/mun/{uf}/{cd}` e, abaixo, `/d/…`, `/b/…`, `/l/…` como na apuração.

## Fontes de limites (mapas por bairro)
IBGE (Censo 2022) → `scripts/build_geo_bairros.py`; São Paulo (GeoSampa, distritos) e Distrito Federal (IPEDF, regiões administrativas) via `data/fontes/`; demais grandes municípios sem malha do IBGE → OpenStreetMap (`scripts/osm_baixar.mjs` + `scripts/build_geo_osm.py`, workflow *Malhas de bairros do OpenStreetMap*; só entra a camada que cobre ≥ 60% dos locais de votação). Onde o limite é distrito/região, a navegação tem um nível a mais: Distrito › Bairro (TSE) › Local.

## Relatório: Federação e os partidos de esquerda nas eleições 2026
- Página em `/federacao-esquerda-2026/` (HTML estático, com o PDF para download na mesma pasta) e chamada na página inicial.
- Gerada do mesmo conteúdo do PDF: `python3 scripts/estudos/doc_web.py <est2026.json> <relatorio.pdf> federacao-esquerda-2026` (usa `doc_json.py` e `doc_pdf.py`; o PDF sai de `doc_pdf.py <est2026.json> <saida.pdf>`).
