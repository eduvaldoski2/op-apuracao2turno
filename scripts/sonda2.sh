#!/bin/bash
# Sondagem de fontes de malha de bairros (roda no runner do GitHub, que tem internet livre).
mkdir -p out; cd out
t() { echo "=== $1"; }
t overpass-campinas
Q='[out:json][timeout:90];rel["IBGE:GEOCODIGO"="3509502"]["boundary"="administrative"];map_to_area->.a;(rel(area.a)["boundary"="administrative"]["admin_level"~"^(9|10|11)$"];);out tags;'
for H in https://overpass-api.de/api/interpreter https://overpass.kumi.systems/api/interpreter https://overpass.private.coffee/api/interpreter; do
  echo "-- $H"; curl -sS -m 100 -w "\n%{http_code} %{size_download}\n" --data-urlencode "data=$Q" "$H" -o op.json | tail -2; python3 - <<'P'
import json
try:
    j=json.load(open('op.json')); e=j['elements']; print('rels',len(e)); print([(x['tags'].get('name'),x['tags'].get('admin_level')) for x in e[:8]])
except Exception as ex: print('erro',ex, open('op.json').read()[:200])
P
done
t ipedf
curl -sS -m 60 -L "https://catalogo.ipe.df.gov.br/layers/geonode:regioes_administrativas" | grep -o 'https\?://[^"'"'"' ]*\(wfs\|ows\|geoserver\)[^"'"'"' ]*' | sort -u | head -10
for U in "https://geoserver.ipe.df.gov.br/geoserver/ows?service=WFS&version=1.0.0&request=GetCapabilities" "https://catalogo.ipe.df.gov.br/geoserver/ows?service=WFS&version=1.0.0&request=GetCapabilities"; do curl -sS -m 40 -L -o cap.xml -w "$U -> %{http_code} %{size_download}\n" "$U"; grep -o '<Name>[^<]*</Name>' cap.xml | head -40 | tr '\n' ' '; echo; done
t goiania-ckan
curl -sS -m 40 "https://dadosabertos.goiania.go.gov.br/api/3/action/package_search?q=bairro&rows=20" | python3 -c "
import json,sys
j=json.load(sys.stdin)
for p in j['result']['results']:
    print(p['name'],[ (r['format'],r['url']) for r in p['resources']][:4])" 2>&1 | head -30
