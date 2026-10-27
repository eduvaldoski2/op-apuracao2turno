#!/usr/bin/env python3
"""Confere a integridade de data/hist (migrado do apuracao-4013): JSON válidos, arquivos citados existentes e totais do guia."""
import json, os, sys, glob
R = os.path.join(os.path.dirname(__file__), '..', 'data', 'hist')
erros = []
def j(p):
    try:
        with open(os.path.join(R, p), encoding='utf-8') as f: return json.load(f)
    except Exception as e:
        erros.append(f'{p}: {e}'); return None
n = 0
for p in glob.glob(os.path.join(R, '**', '*.json'), recursive=True):
    n += 1
    try: json.load(open(p, encoding='utf-8'))
    except Exception as e: erros.append(f'{os.path.relpath(p, R)}: {e}')
print('JSON lidos:', n)
for ano in (2018, 2020, 2022, 2024, 2026):
    idx = j(f'{ano}/idx.json')
    if not idx: continue
    falt = [a for c in idx['cargos'] for a in c['arq'] if not os.path.exists(os.path.join(R, str(ano), a if a.endswith('.json') else a + '.json'))]
    print(ano, 'cargos:', [(c['c'], c['t']) for c in idx['cargos']], 'candidaturas:', len(idx['cands']), 'arquivos faltando:', falt)
    erros += [f'{ano}: falta {a}' for a in falt]
geo = j('geo.json'); print('bairros RJ:', len(geo['b']) if geo else None)
cb = j('cap_busca.json'); print('pessoas (pid):', len(cb['p']) if cb else None)
for a in (2018, 2022):
    e = j(f'eleitos_{a}.json'); print('eleitos', a, len(e) if e else None)
ind = j('uf/index.json'); print('uf/index.json:', type(ind).__name__, len(ind) if ind else None)
ufs = sorted(d for d in os.listdir(os.path.join(R, 'uf')) if os.path.isdir(os.path.join(R, 'uf', d)))
mun = loc = 0
for uf in ufs:
    g = j(f'uf/{uf}/geo.json'); x = j(f'uf/{uf}/idx.json')
    if g: mun += len(g['m']); loc += len(g['l'])
    if x:
        for c in x['cargos']:
            ok = os.path.exists(os.path.join(R, 'uf', uf, f"c{c['c']}.json")) or glob.glob(os.path.join(R, 'uf', uf, f"c{c['c']}b*.json"))
            if not ok: erros.append(f"uf/{uf}: cargo {c['c']} sem arquivo de votos")
print('UFs:', len(ufs), '| municípios:', mun, '| locais de votação:', loc)
print('ERROS:', len(erros)); [print(' -', e) for e in erros[:20]]
sys.exit(1 if erros else 0)
