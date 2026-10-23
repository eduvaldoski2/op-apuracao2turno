#!/bin/bash
mkdir -p out; cd out
UA="oficina-politica-apuracao/1.0"
echo "=== ipedf camadas"
curl -sS -m 90 -A "$UA" "https://catalogo.ipe.df.gov.br/geoserver/ows?service=WFS&version=1.0.0&request=GetCapabilities" | grep -o '<Name>geonode:[^<]*</Name>' | sed 's/<[^>]*>//g' | grep -i 'bairro\|regioes\|setor\|localidade\|urbano\|RA_\|_RA' | head -40
echo "=== ipedf RAs (GeoJSON 4326)"
curl -sS -m 120 -A "$UA" -o df_ra.json -w "%{http_code} %{size_download}\n" "https://catalogo.ipe.df.gov.br/geoserver/ows?service=WFS&version=1.0.0&request=GetFeature&typename=geonode:regioes_administrativas&outputFormat=json&srsName=EPSG:4326"
python3 - <<'P'
import json
try:
    j=json.load(open('df_ra.json')); fs=j['features']; print(len(fs), list(fs[0]['properties'].items())[:10], fs[0]['geometry']['type'])
    print(sorted(str(f['properties'].get('ra_nome') or f['properties'].get('nome') or list(f['properties'].values())[:2]) for f in fs)[:40])
except Exception as e: print('erro',e, open('df_ra.json').read()[:300])
P
echo "=== goiania"
curl -sS -m 60 -L -A "$UA" "https://dadosabertos.goiania.go.gov.br/dataset?q=bairro" | grep -o 'href="/dataset/[^"]*"' | sort -u | head -20
