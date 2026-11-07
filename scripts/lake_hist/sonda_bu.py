#!/usr/bin/env python3
"""Sonda do CKAN do TSE: lista pacotes (busca) ou recursos de um pacote. Uso: sonda_bu.py busca "<texto>" | pacote <id>"""
import sys, json, urllib.parse, urllib.request
B = 'https://dadosabertos.tse.jus.br/api/3/action/'
def get(a, **k):
    with urllib.request.urlopen(B + a + '?' + urllib.parse.urlencode(k), timeout=60) as r: return json.load(r)
try:
    if sys.argv[1] == 'busca':
        for p in get('package_search', q=sys.argv[2], rows=40).get('result', {}).get('results', []):
            print(' -', p['name'], '|', p.get('title'), '|', len(p.get('resources', [])), 'recursos')
    else:
        j = get('package_show', id=sys.argv[2])
        if not j.get('success'): print('  não existe')
        else:
            for r in j['result']['resources'][:60]: print('  ', r.get('name'), '|', r.get('url'))
except Exception as e:
    print('  erro', e)
