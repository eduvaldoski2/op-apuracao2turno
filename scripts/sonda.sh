#!/bin/bash
cd "$(dirname "$0")/.."; mkdir -p /tmp/s; cd /tmp/s
B=https://resultados.tse.jus.br/oficial/ele2026/arquivo-urna/3220/dados/ac/01066/0004/0077
H=4a6b704a7350756e6a5a496433337049453538516932486a676159553779785542752d6d765749354f41343d
for f in o03220ac0106600040077-vota.vsc o03220ac0106600040077-bu.dat o03220ac0106600040077-rdv.dat o03220ac0106600040077.imgbu o03220ac0106600040077-bu.imgbu p003220-ac-m01066-z0004-s0077.imgbu; do
  for p in "$B/$H/$f" "$B/$f"; do
    echo "=== $p"; curl -sS -m 30 -o t.bin -w "%{http_code} %{size_download}\n" "$p"; file t.bin; head -c 600 t.bin | xxd | head -14; echo "--- strings"; strings -n 4 t.bin | head -40
  done
done
echo "=== IBGE bairros"
G=https://geoftp.ibge.gov.br/organizacao_do_territorio/malhas_territoriais/malhas_de_setores_censitarios__divisoes_intramunicipais/censo_2022/bairros
for d in gpkg shp; do echo "-- $d"; curl -sS -m 40 "$G/$d/" | grep -oiE 'href="[^"?]+"' | grep -v http | head -40; curl -sS -m 40 "$G/$d/" | grep -oE '[0-9.]+[MGK]' | head -5; done
