#!/bin/bash
cd /tmp
echo "=== GeoSampa WFS capabilities"
for u in "http://wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs?service=WFS&version=1.0.0&request=GetCapabilities" "https://wfs.geosampa.prefeitura.sp.gov.br/geoserver/geoportal/wfs?service=WFS&version=1.0.0&request=GetCapabilities"; do
  curl -sS -m 60 -L -o cap.xml -w "%{http_code} %{size_download} $u\n" "$u"; [ -s cap.xml ] && grep -oE "<Name>[^<]*(istrito|airro|ubprefeitura|imite)[^<]*</Name>" cap.xml | head -40 && break
done
echo "=== IBGE distritos SP"
G=https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais/censo_2022/distritos
curl -sS -m 30 "$G/shp/UF/" | sed 's/<[^>]*>/ /g' | grep -iE "SP_|zip" | head -5
echo "=== Overpass bairros SP (admin_level 10 e place=suburb) contagem"
Q='[out:json][timeout:90];area["name"="São Paulo"]["boundary"="administrative"]["admin_level"="8"]->.a;(relation(area.a)["boundary"="administrative"]["admin_level"="10"];relation(area.a)["place"~"suburb|neighbourhood"];way(area.a)["place"~"suburb|neighbourhood"];);out count;'
curl -sS -m 100 -G --data-urlencode "data=$Q" https://overpass-api.de/api/interpreter | head -c 600
