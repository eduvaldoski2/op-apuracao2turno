# Oficina Política · Painel de apuração do 2º turno 2026

Painel (site estático) que acompanha a apuração do 2º turno da eleição presidencial de 25/10/2026, com comparação ao 1º turno,
mapa por estado, listas por candidato → estado → município, exportação (PDF/PNG/CSV) e aba de **Projeção** do resultado final.

## Como funciona
- `data/base_1t.json` — resultado final do 1º turno por município (gerado pelo workflow **Montar base do 1º turno**).
- **Coletor** (`scripts/coletor.mjs`, workflow *Coletor da apuração*): lê os arquivos do TSE, calcula a projeção e publica `snap.json`, `hist.json`, `meta.json` na branch `dados`.
- **Painel** (`index.html` + `js/`): lê a branch `dados` (se falhar, lê direto do TSE no nível de estado) e atualiza a cada 30 s.
- `?demo=1` abre uma **demonstração com dados simulados** (reprodução acelerada de uma apuração fictícia).

## Camada de bairros (estado → município → bairro → local de votação)
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
