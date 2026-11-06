#!/usr/bin/env python3
"""Sonda CKAN do TSE: lista recursos de cada conjunto 'resultados-<ano>' e os que citam suplementar/extraordinária."""
import json, re, sys, urllib.request

def get(u):
    with urllib.request.urlopen(u, timeout=60) as r:
        return json.load(r)

for slug in sys.argv[1:]:
    print('--', slug)
    try:
        d = get(f'https://dadosabertos.tse.jus.br/api/3/action/package_show?id={slug}')
    except Exception as e:
        print('  erro', e); continue
    if not d.get('success'):
        print('  nao encontrado'); continue
    r = d['result']
    print(' ', r.get('title'), '| recursos:', len(r['resources']))
    for x in r['resources']:
        n = (x.get('name') or '') + ' ' + (x.get('url') or '')
        if re.search('suplement|extraordin', n, re.I):
            print('  SUPL:', n[:220])
print('== busca por suplementares')
try:
    d = get('https://dadosabertos.tse.jus.br/api/3/action/package_search?q=suplementar&rows=40')
    for p in d.get('result', {}).get('results', []):
        print(p['name'], '|', p['title'])
except Exception as e:
    print('erro', e)
