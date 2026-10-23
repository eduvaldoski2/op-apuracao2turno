#!/usr/bin/env python3
"""Áreas APROXIMADAS de bairros para municípios sem malha de bairros: divide o município (limite do IBGE) em células de Voronoi, uma por local
de votação, e funde as células dos locais que o TSE informa no mesmo bairro. Saída no mesmo formato de data/bairros_geo/{cd5}.json (com aprox:1).
Uso: build_geo_voronoi.py <pasta geojs-XX-mun.json> <data/bairros> <saida> <cd5,cd5,...> """
import sys, os, json, glob, unicodedata, collections
from shapely.geometry import shape, Point, MultiPoint
from shapely.ops import unary_union, voronoi_diagram
from shapely.strtree import STRtree
from shapely import make_valid
geodir, estd, out, alvos = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4].split(',')
base = json.load(open(os.path.join(os.path.dirname(estd.rstrip('/')), 'base_1t.json')))
ibge = {r[1]: r[3] for r in base['rows']}
def r5(x): return round(x, 5)
def aneis(g, tol):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']
    res = []
    for p in polys:
        if p.is_empty or p.area < 1e-9: continue
        rs = [list(p.exterior.coords)] + [list(i.coords) for i in p.interiors]
        res.append([[v for c in r for v in (r5(c[0]), r5(c[1]))] for r in rs])
    return res
def norm(s): return ''.join(c for c in unicodedata.normalize('NFD', s.upper()) if unicodedata.category(c) != 'Mn').strip()
def bonito(s): return ' '.join(w.capitalize() if w.lower() not in ('da', 'de', 'do', 'das', 'dos', 'e') else w.lower() for w in s.lower().split())
feats = {}
for f in glob.glob(os.path.join(geodir, 'geojs-*-mun.json')):
    for ft in json.load(open(f))['features']: feats[ft['properties']['id']] = ft
for cd5 in alvos:
    ef = glob.glob(os.path.join(estd, '*', cd5 + '.json'))
    if not ef or cd5 not in ibge or ibge[cd5] not in feats: print('sem dados', cd5); continue
    est = json.load(open(ef[0])); lim = shape(feats[ibge[cd5]]['geometry']); lim = lim if lim.is_valid else make_valid(lim)
    locs = [l for l in est['l'] if l[6] and l[7]]
    pts = {}
    for l in locs: pts.setdefault((round(l[7], 6), round(l[6], 6)), []).append(l)
    if len(pts) < 3: print('poucos locais', cd5); continue
    vd = voronoi_diagram(MultiPoint([Point(p) for p in pts]), envelope=lim.buffer(0.02))
    cells = [c.intersection(lim) for c in vd.geoms]; tree = STRtree(cells)
    grupos = collections.OrderedDict(); chave_de = {}
    for (x, y), ls in pts.items():
        i = int(tree.query(Point(x, y), predicate='within')[0]) if len(tree.query(Point(x, y), predicate='within')) else int(tree.nearest(Point(x, y)))
        cel = cells[i]
        if cel.is_empty: continue
        for l in ls:
            nome = (l[4] or '').strip() or l[2]; k = norm(nome)
            g = grupos.setdefault(k, {'n': bonito(nome), 'g': []}); 
            if not any(cel.equals(o) for o in g['g']): g['g'].append(cel)
            chave_de[f'{l[0]}-{l[1]}'] = k
    ordem = list(grupos); idx = {k: i for i, k in enumerate(ordem)}
    feitos = []
    for k in ordem:
        g = unary_union(grupos[k]['g']); feitos.append({'n': grupos[k]['n'], 'c': str(idx[k]), 'p': aneis(g, 0.0001)})
    loc = {kk: idx[v] for kk, v in chave_de.items()}
    txt = json.dumps({'m': cd5, 'uf': est['uf'], 'ibge': ibge[cd5], 'fonte': 'Áreas aproximadas: limite municipal do IBGE dividido pelos locais de votação e agrupado pelo bairro informado ao TSE (não são limites oficiais de bairro)', 'rotulo': 'bairro', 'aprox': 1, 'cob': 1.0, 'f': feitos, 'loc': loc}, separators=(',', ':'), ensure_ascii=False)
    open(os.path.join(out, cd5 + '.json'), 'w').write(txt); print(f"feito {est['uf']} {cd5} {est['n']} locais={len(locs)} bairros={len(feitos)} {len(txt)//1024} KB")
