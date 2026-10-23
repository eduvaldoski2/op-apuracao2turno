#!/usr/bin/env python3
"""GeoJSON do OpenStreetMap (limites de bairros) -> data/bairros_geo/{cd5}.json (mesmo formato da malha do IBGE).
Para cada município escolhe o nível de limite (admin_level 9..12 ou place) que melhor cobre os locais de votação.
Uso: build_geo_osm.py <pasta geojson> <data/bairros> <saida> [cobertura mínima]"""
import sys, os, json, glob, collections
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from shapely import make_valid
zdir, estd, out = sys.argv[1:4]; limite = float(sys.argv[4]) if len(sys.argv) > 4 else 0.6
def r5(x): return round(x, 5)
def aneis(g, tol):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']
    res = []
    for p in polys:
        if p.is_empty: continue
        rs = [list(p.exterior.coords)] + [list(i.coords) for i in p.interiors]
        res.append([[v for c in r for v in (r5(c[0]), r5(c[1]))] for r in rs])
    return res
def cobre(geoms, locais):
    tree = STRtree([g for _, g in geoms]); loc = {}; n = 0; ok = 0
    for l in locais:
        if not l[6] or not l[7]: continue
        n += 1; pt = Point(l[7], l[6]); idx = tree.query(pt, predicate='within')
        if len(idx): i = int(idx[0])
        else:
            i = int(tree.nearest(pt))
            if geoms[i][1].distance(pt) > 0.0015: continue
        loc[f'{l[0]}-{l[1]}'] = i; ok += 1
    return (ok / n if n else 0), loc
tot = collections.Counter(); linhas = []
for f in sorted(glob.glob(os.path.join(zdir, '*.geojson'))):
    cd5 = os.path.basename(f)[:-8]
    ef = glob.glob(os.path.join(estd, '*', cd5 + '.json'))
    if not ef: continue
    est = json.load(open(ef[0])); locais = est['l']
    if not locais: continue
    gj = json.load(open(f)); grupos = collections.defaultdict(list)
    for ft in gj['features']:
        t = ft.get('properties', {}); nome = t.get('name') or t.get('tags', {}).get('name')
        tags = t.get('tags', t); nome = tags.get('name')
        if not nome or ft['geometry']['type'] not in ('Polygon', 'MultiPolygon'): continue
        try:
            g = shape(ft['geometry']); g = g if g.is_valid else make_valid(g)
        except Exception: continue
        if g.is_empty: continue
        nivel = tags.get('admin_level') if tags.get('boundary') == 'administrative' else 'place'
        grupos[nivel].append((nome, g))
    melhor = None
    for nivel, geoms in grupos.items():
        if len(geoms) < 4: continue
        cob, loc = cobre(geoms, locais)
        score = cob * min(1, len(geoms) / 12)
        if melhor is None or score > melhor[0]: melhor = (score, nivel, geoms, cob, loc)
    if not melhor or melhor[3] < limite: tot['sem_cobertura'] += 1; linhas.append(f"descartado {cd5} {est['n']} niveis={ {k: len(v) for k, v in grupos.items()} } cob={melhor[3] if melhor else 0:.2f}"); continue
    _, nivel, geoms, cob, loc = melhor
    feitos = [{'n': nm, 'c': str(i), 'p': aneis(g, 0.00012)} for i, (nm, g) in enumerate(geoms)]
    txt = json.dumps({'m': cd5, 'uf': est['uf'], 'ibge': '', 'fonte': 'OpenStreetMap (colaboradores, ODbL) — bairros', 'rotulo': 'bairro', 'cob': round(cob, 3), 'f': feitos, 'loc': loc}, separators=(',', ':'), ensure_ascii=False)
    dest = os.path.join(out, cd5 + '.json')
    if os.path.exists(dest) and not json.load(open(dest)).get('aprox'): tot['ja_existia'] += 1; continue
    open(dest, 'w').write(txt); tot['feitos'] += 1; tot['bytes'] += len(txt)
    linhas.append(f"feito {est['uf']} {cd5} {est['n']} nivel={nivel} poligonos={len(geoms)} cob={cob:.2f}")
print('\n'.join(linhas)); print(json.dumps(tot))
