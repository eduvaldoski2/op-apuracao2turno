#!/bin/bash
G=https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais/censo_2022/bairros
for d in gpkg/UF gpkg/BR shp/UF shp/BR; do echo "-- $d"; curl -sS -m 60 "$G/$d/" | sed 's/<[^>]*>/ /g' | grep -iE "\.(zip|gpkg|shp)|[0-9]{4}-[0-9]{2}" | head -40; done
