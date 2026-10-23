#!/bin/bash
mkdir -p out; cd out
t() { echo "=== $1"; }
t locais-tse
curl -sS -f -L --http1.1 --retry 4 --retry-all-errors -m 600 -o locais.zip https://cdn.tse.jus.br/estatistica/sead/odsele/eleitorado_locais_votacao/eleitorado_local_votacao_2026.zip; ls -la locais.zip; unzip -Z1 locais.zip
F=$(unzip -Z1 locais.zip | grep -i 'BRASIL.csv' | head -1); unzip -p locais.zip "$F" | head -4 | iconv -f latin1 -t utf8
echo "-- linhas SP zona 1 secao 1 / total linhas"
unzip -p locais.zip "$F" | iconv -f latin1 -t utf8 | awk -F';' 'NR==1{for(i=1;i<=NF;i++)h[$i]=i} NR>1 && $(h["\"SG_UF\""])=="\"SP\"" && $(h["\"CD_MUNICIPIO\""])=="\"71072\"" && $(h["\"NR_ZONA\""])=="\"1\"" && $(h["\"NR_SECAO\""])=="\"1\"" {print}' | head -5
unzip -p locais.zip "$F" | wc -l
t overpass
UA="oficina-politica-apuracao/1.0 (eduvaldoski@gmail.com)"
Q='[out:json][timeout:90];rel["IBGE:GEOCODIGO"="3509502"]["boundary"="administrative"];map_to_area->.a;(rel(area.a)["boundary"="administrative"]["admin_level"~"^(9|10|11)$"];);out tags;'
curl -sS -m 100 -A "$UA" -H "Accept: */*" -w "\n%{http_code} %{size_download}\n" --data-urlencode "data=$Q" https://overpass-api.de/api/interpreter -o op.json | tail -1
python3 - <<'P'
import json
try:
    j=json.load(open('op.json')); e=j['elements']; print('rels',len(e)); print([(x['tags'].get('name'),x['tags'].get('admin_level')) for x in e[:12]])
except Exception as ex: print('erro',ex, open('op.json').read()[:300])
P
t goiania
curl -sS -m 40 -L -A "$UA" "https://dadosabertos.goiania.go.gov.br/api/3/action/package_search?q=bairros&rows=15" | head -c 1500; echo
t ipedf-layers
curl -sS -m 60 "https://catalogo.ipe.df.gov.br/geoserver/ows?service=WFS&version=1.0.0&request=GetCapabilities" | grep -o '<Name>geonode:[^<]*</Name>' | sed 's/<[^>]*>//g' | grep -i 'bairro\|regi\|RA\|setor\|localidade\|distrito' | head -30
