#!/bin/bash
# Sondagem das fontes para a camada de bairros (roda no GitHub, que alcança os domínios do TSE/IBGE).
cd "$(dirname "$0")/.."; mkdir -p /tmp/s; cd /tmp/s
H() { echo "== $1"; curl -sS -m 40 -I -L "$1" 2>&1 | grep -iE "^HTTP|content-length|content-type|curl:" | head -4; }
for u in \
 https://cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_2026.zip \
 https://cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_2024.zip \
 https://cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_2022.zip \
 https://dadosabertos.tse.jus.br/dataset/eleitorado-2026 \
 https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais/censo_2022/ \
 https://servicodados.ibge.gov.br/api/v3/malhas/municipios/3304557?formato=application/vnd.geo+json&intrarregiao=bairro ; do H "$u"; done
echo "=== download locais de votacao"
for a in 2026 2024; do
  curl -sS -m 300 -L -o lv$a.zip "https://cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_$a.zip" && ls -la lv$a.zip && unzip -o -q lv$a.zip -d lv$a && ls -la lv$a && break
done
for d in lv2026 lv2024; do [ -d $d ] || continue
  for f in $d/*.csv; do echo "--- $f"; head -c 1500 "$f" | iconv -f latin1 -t utf8; echo; wc -l "$f"; done
done
echo "=== config de secoes (AC) 1T"
curl -sS -m 60 -o cs.json "https://resultados.tse.jus.br/oficial/ele2026/arquivo-urna/3220/config/ac/ac-p003220-cs.json"; ls -la cs.json; head -c 1200 cs.json; echo
echo "=== BU de uma secao 1T"
python3 - <<'P'
import json,urllib.request,ssl
try:
    j=json.load(open('cs.json'))
    print(list(j.keys())[:10])
    def walk(o,d=0):
        if isinstance(o,dict):
            for k,v in list(o.items())[:3]: print(' '*d,k,type(v).__name__); walk(v,d+1) if d<5 else None
        elif isinstance(o,list) and o: print(' '*d,'list',len(o)); walk(o[0],d+1) if d<5 else None
    walk(j)
except Exception as e: print('erro',e)
P
