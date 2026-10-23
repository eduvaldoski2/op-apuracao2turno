#!/bin/bash
cd "$(dirname "$0")/.."; mkdir -p /tmp/s; cd /tmp/s
B=https://resultados.tse.jus.br/oficial/ele2026/arquivo-urna/3220/dados/ac/01066/0004/0077
echo "=== BU aux"; curl -sS -m 30 "$B/p003220-ac-m01066-z0004-s0077-aux.json" | head -c 3500; echo
echo "=== listagem de arquivos da secao (nao ha indice; tentando .bu / .imgbu / .vscmr)"
curl -sS -m 30 -I "$B/p003220-ac-m01066-z0004-s0077-aux.json" | head -5
echo "=== IBGE geoftp"
G=https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais
curl -sS -m 40 "$G/" | grep -oiE 'href="[^"]+"' | head -30
for d in censo_2022 censo_2022/bairros censo_2022/bairros/shapefile censo_2022/bairros/geopackage; do echo "-- $d"; curl -sS -m 40 "$G/$d/" | grep -oiE 'href="[^"?]+"' | head -40; done
echo "=== vazao: 1500 secoes AC (cs) com 40 em paralelo"
python3 - <<'P'
import json,subprocess,time
j=json.load(open('/tmp/s/cs.json')) if False else None
P
curl -sS -m 60 -o cs.json "https://resultados.tse.jus.br/oficial/ele2026/arquivo-urna/3220/config/ac/ac-p003220-cs.json"
python3 - <<'P' > urls.txt
import json
j=json.load(open('/tmp/s/cs.json'))
n=0
for uf in j['abr']:
  for mu in uf['mu']:
    for z in mu['zon']:
      for s in z['sec']:
        u=f"https://resultados.tse.jus.br/oficial/ele2026/arquivo-urna/3220/dados/ac/{mu['cd']}/{z['cd']}/{s['ns']}/p003220-ac-m{mu['cd']}-z{z['cd']}-s{s['ns']}-aux.json"
        print(u); n+=1
        if n>=1500: raise SystemExit
P
wc -l urls.txt
start=$(date +%s.%N); cat urls.txt | xargs -P 40 -n 1 curl -sS -m 30 -o /dev/null -w "%{http_code} %{size_download}\n" > res.txt 2>&1; end=$(date +%s.%N)
echo "tempo: $(echo "$end - $start" | bc) s"; sort res.txt | awk '{c[$1]++; s+=$2} END{for(k in c) print k, c[k]; print "bytes medios", s/NR}'
