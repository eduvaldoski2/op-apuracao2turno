#!/usr/bin/env python3
"""Agrupa os bairros do Rio (data/regioes/60011_bairros.json) nas regiões do apuração 4013 -> data/bairros_geo/60011.json (rotulo 'distrito', como SP).
Uso: build_regioes_rio.py <index.html do apuracao-4013>"""
import sys, json, re, unicodedata
from shapely.geometry import Polygon
from shapely.ops import unary_union
sa = lambda s: ''.join(c for c in unicodedata.normalize('NFD', s.upper()) if unicodedata.category(c) != 'Mn').strip()
t = open(sys.argv[1]).read()
d = json.loads(re.search(r'const REG_DADOS = (\{.*?\});\n', t, re.S).group(1))
regs = ['Zona Sul', 'Zona Sudoeste', 'Grande Tijuca', 'Zona Norte', 'Zona Oeste', 'Grande Meier', 'Centro', 'Ilha do Governador']
assert d['capRegs'][1] == 'Barra e Jacarepaguá'
mapa = {sa(k): v[0] for k, v in d['cap'].items()}
# nomes do IBGE que diferem dos do TSE/4013
mapa.update({sa(k): v for k, v in {'Freguesia (Jacarepaguá)': 1, 'Recreio dos Bandeirantes': 1, 'Joá': 1, 'Grumari': 1, 'Praia da Bandeira': 7, 'Cidade Universitária': 7, 'Maré': 3, 'Complexo do Alemão': 3, 'Jacarezinho': 5, 'Gericinó': 4}.items()})
g = json.load(open('data/regioes/60011_bairros.json'))
polis = {i: [] for i in range(len(regs))}; sem = []
for bi, f in enumerate(g['f']):
    r = mapa.get(sa(f['n']))
    if r is None: sem.append(f['n']); continue
    for poly in f['p']:
        rs = [[(r_[k], r_[k+1]) for k in range(0, len(r_), 2)] for r_ in poly]
        p = Polygon(rs[0], rs[1:])
        if not p.is_valid: p = p.buffer(0)
        polis[r].append(p)
print('bairros sem região:', sem)
def r5(x): return round(x, 5)
feats = []; bi2r = {}
for i, nm in enumerate(regs):
    u = unary_union([p.buffer(0.00004) for p in polis[i]]).buffer(-0.00004).simplify(0.0001, preserve_topology=True)
    ps = [u] if u.geom_type == 'Polygon' else [p for p in u.geoms if p.geom_type == 'Polygon']
    aneis = []
    for p in ps:
        if p.is_empty or p.area < 1e-8: continue
        rs = [list(p.exterior.coords)] + [list(x.coords) for x in p.interiors]
        aneis.append([[v for c in r for v in (r5(c[0]), r5(c[1]))] for r in rs])
    feats.append({'n': nm, 'c': str(i + 1), 'p': aneis})
for bi, f in enumerate(g['f']):
    r = mapa.get(sa(f['n']))
    if r is not None: bi2r[bi] = r
loc = {k: bi2r[v] for k, v in g['loc'].items() if v in bi2r}
out = {'m': g['m'], 'uf': g['uf'], 'ibge': g['ibge'], 'fonte': 'Regiões do município do Rio (apuração 4013 / OP), agrupando bairros do IBGE (Censo 2022)',
       'rotulo': 'distrito', 'rotuloNome': 'Região', 'rotuloPlural': 'Regiões', 'cob': g['cob'], 'f': feats, 'loc': loc}
open('data/bairros_geo/60011.json', 'w').write(json.dumps(out, separators=(',', ':'), ensure_ascii=False))
print('regiões', len(feats), 'locais', len(loc), 'de', len(g['loc']), 'bytes', len(json.dumps(out)))
