#!/bin/bash
cd /tmp
U="http://wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs?service=WFS&version=1.0.0&request=GetFeature&typeName=geoportal:distrito_municipal&outputFormat=application/json&srsName=EPSG:4326"
curl -sS -m 120 -L -o sp.json -w "%{http_code} %{size_download}\n" "$U"
python3 - <<'P'
import json
j=json.load(open('/tmp/sp.json')); fs=j['features']; print(len(fs), j.get('crs'))
print(list(fs[0]['properties'].items())[:12])
g=fs[0]['geometry']; print(g['type'], str(g['coordinates'])[:120])
print([f['properties'].get('ds_nome') or f['properties'] for f in fs[:5]])
P
cp /tmp/sp.json /home/runner/work/sp_distritos.json 2>/dev/null; mkdir -p /home/runner/work/op-apuracao2turno/op-apuracao2turno/out; cp /tmp/sp.json "$GITHUB_WORKSPACE/sp_distritos.json" 2>/dev/null
