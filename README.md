# Oficina Política · Painel de apuração do 2º turno 2026

Painel (site estático) que acompanha a apuração do 2º turno da eleição presidencial de 25/10/2026, com comparação ao 1º turno,
mapa por estado, listas por candidato → estado → município, exportação (PDF/PNG/CSV) e aba de **Projeção** do resultado final.

## Como funciona
- `data/base_1t.json` — resultado final do 1º turno por município (gerado pelo workflow **Montar base do 1º turno**).
- **Coletor** (`scripts/coletor.mjs`, workflow *Coletor da apuração*): lê os arquivos do TSE, calcula a projeção e publica `snap.json`, `hist.json`, `meta.json` na branch `dados`.
- **Painel** (`index.html` + `js/`): lê a branch `dados` (se falhar, lê direto do TSE no nível de estado) e atualiza a cada 30 s.
- `?demo=1` abre uma **demonstração com dados simulados** (reprodução acelerada de uma apuração fictícia).

## Comandos
```
npm test                                   # testes do modelo + backtest sintético
node scripts/mock_tse.mjs --auto 180       # TSE simulado em localhost:8787
node scripts/coletor.mjs --out data/live --loop 10 --tse http://localhost:8787/oficial --basefile data/demo/base_sim.json
python3 -m http.server 8000                # abre http://localhost:8000/?base=data/demo/base_sim.json&fonte=data/live/
```

## Créditos
Dados: TSE. Mapa: [@svg-maps/brazil](https://github.com/VictorCazanave/svg-maps) (CC BY 4.0). html2canvas e jsPDF (MIT) em `vendor/`.
Iniciativa independente, sem vínculo com o TSE.
