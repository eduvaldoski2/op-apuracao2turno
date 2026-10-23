#!/usr/bin/env python3
"""Malhas de bairros do IBGE (Censo 2022) -> data/bairros_geo/{cd5}.json, ligando cada local de votação ao polígono que o contém.
Uso: build_geo_bairros.py <pasta com {UF}_bairros_CD2022.zip> <data/bairros> <data/base_1t.json> <saida>"""
import sys, os, json, zipfile, glob, tempfile, math
import shapefile
from shapely.geometry import shape, Point
from shapely.strtree import STRtree
from shapely import make_valid

zdir, estd, basef, out = sys.argv[1:5]
os.makedirs(out, exist_ok=True)
base = json.load(open(basef))
cd_por_ibge = {str(r[3]): (r[0], r[1]) for r in base['rows']}
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
tot = dict(mun=0, feitos=0, baixa_cob=0, sem_locais=0, bytes=0)
for zp in sorted(glob.glob(os.path.join(zdir, '*_bairros_CD2022.zip'))):
    uf = os.path.basename(zp)[:2].lower()
    tmp = tempfile.mkdtemp(); zipfile.ZipFile(zp).extractall(tmp)
    shp = glob.glob(os.path.join(tmp, '**', '*.shp'), recursive=True)[0]
    rd = shapefile.Reader(shp, encoding='utf-8')
    campos = [f[0] for f in rd.fields[1:]]
    if uf in ('ac', 'sp'): print(uf, 'campos', campos, 'n', len(rd), flush=True)
    ic = lambda *nomes: next(i for i, c in enumerate(campos) if c.upper() in nomes)
    i_mun = ic('CD_MUN'); i_nm = ic('NM_BAIRRO', 'NM_BAIRR'); i_cb = ic('CD_BAIRRO', 'CD_BAIRR')
    por_mun = {}
    for sr in rd.iterShapeRecords():
        por_mun.setdefault(str(sr.record[i_mun]), []).append((sr.record[i_nm], str(sr.record[i_cb]), sr.shape))
    for ibge, feats in por_mun.items():
        tot['mun'] += 1
        if ibge not in cd_por_ibge: continue
        u, cd5 = cd_por_ibge[ibge]
        f = os.path.join(estd, u, cd5 + '.json')
        if not os.path.exists(f): continue
        est = json.load(open(f)); locais = est['l']
        geoms = []
        for nm, cb, sh in feats:
            try:
                g = shape(sh.__geo_interface__)
                if not g.is_valid: g = make_valid(g)
            except Exception: continue
            geoms.append((nm, cb, g))
        if not geoms or not locais: tot['sem_locais'] += 1; continue
        tree = STRtree([g for _, _, g in geoms]); loc = {}; n_ok = 0; n_t = 0
        for l in locais:
            if not l[6] or not l[7]: continue
            n_t += 1; pt = Point(l[7], l[6])
            idx = tree.query(pt, predicate='within')
            if len(idx): i = int(idx[0])
            else:
                i = int(tree.nearest(pt)); 
                if geoms[i][2].distance(pt) > 0.003: continue
            loc[f'{l[0]}-{l[1]}'] = i; n_ok += 1
        cob = n_ok / n_t if n_t else 0
        if cob < 0.45:
            tot['baixa_cob'] += 1
            if len(locais) >= 60: print('BAIXA COBERTURA', u, cd5, est['n'], 'locais', len(locais), 'poligonos', len(geoms), 'cob', round(cob, 2), flush=True)
            continue
        # só mantém polígonos úteis (com local ou área razoável) — mantém todos para o mapa ficar completo
        feitos = [{'n': nm, 'c': cb, 'p': aneis(g, 0.00012)} for nm, cb, g in geoms]
        txt = json.dumps({'m': cd5, 'uf': u, 'ibge': ibge, 'cob': round(cob, 3), 'f': feitos, 'loc': loc}, separators=(',', ':'), ensure_ascii=False)
        open(os.path.join(out, cd5 + '.json'), 'w').write(txt); tot['feitos'] += 1; tot['bytes'] += len(txt)
    print(uf, 'ok', flush=True)
print(json.dumps(tot))
