#!/bin/bash
cd "$(dirname "$0")/.."; mkdir -p /tmp/s; cd /tmp/s
for u in votacao_secao/votacao_secao_2026_AC.zip votacao_secao/votacao_secao_2026_BR.zip votacao_secao/votacao_secao_2026_RJ.zip votacao_candidato_munzona/votacao_candidato_munzona_2026.zip; do
  echo "== $u"; curl -sS -m 40 -I -L "https://cdn.tse.jus.br/estatistica/sead/odsele/$u" 2>&1 | grep -iE "^HTTP|content-length|curl:|last-mod" | head -4
done
echo "=== AC"
curl -sS -m 120 -L -o vs.zip "https://cdn.tse.jus.br/estatistica/sead/odsele/votacao_secao/votacao_secao_2026_AC.zip" && ls -la vs.zip && unzip -o -q vs.zip -d vs && ls -la vs
f=$(ls vs/*AC*.csv | head -1); head -c 1800 "$f" | iconv -f latin1 -t utf8; echo; wc -l "$f"
