#!/usr/bin/env python3
"""Lista TODOS os recursos dos conjuntos de eleições suplementares do TSE e procura outros conjuntos."""
import json, sys, urllib.request
def get(u):
    with urllib.request.urlopen(u, timeout=60) as r: return json.load(r)
slugs = ['resultados-eleicoes-suplementares-2024', 'resultados-eleicoes-suplementares-2022', 'resultados-2020-suplementares']
for q in ['suplementar', 'suplementares', 'eleicoes suplementares', 'eleição suplementar', 'extraordinária']:
    try:
        for p in get('https://dadosabertos.tse.jus.br/api/3/action/package_search?q=' + urllib.request.quote(q) + '&rows=100')['result']['results']:
            if p['name'] not in slugs and ('suplement' in (p['name'] + p['title']).lower() or 'extraordin' in (p['name'] + p['title']).lower()): slugs.append(p['name'])
    except Exception as e: print('busca', q, 'erro', e)
for s in slugs:
    try: r = get('https://dadosabertos.tse.jus.br/api/3/action/package_show?id=' + s)['result']
    except Exception as e: print('==', s, 'erro', e); continue
    print('==', s, '|', r.get('title'), '| recursos:', len(r['resources']), '| modificado:', r.get('metadata_modified'))
    for x in r['resources']: print('  ', x.get('format'), '|', (x.get('name') or '')[:70], '|', x.get('size'), '|', x.get('url'))
