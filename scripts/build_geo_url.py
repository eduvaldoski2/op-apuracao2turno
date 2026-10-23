#!/usr/bin/env python3
"""Malhas de bairros de fontes abertas oficiais (shapefile/GeoJSON/KML, zip ou não) -> data/bairros_geo/{cd5}.json.
Uso: build_geo_url.py <fontes.json> <pasta com os arquivos baixados {cd5}.{ext}> <data/bairros> <saida> [cobertura mínima]
Imprime colunas, CRS e amostra de cada arquivo (para ajustar o campo de nome em fontes.json)."""
import sys, os, json, glob, re, collections
import geopandas as gpd
from shapely.geometry import Point
from shapely.strtree import STRtree
from shapely import make_valid
fontes, dl, estd, out = sys.argv[1:5]; limite = float(sys.argv[5]) if len(sys.argv) > 5 else 0.6
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
def acha_campo(df, pedido):
    cols = list(df.columns)
    if pedido and pedido in cols: return pedido
    for pad in (r'^nome$', r'^nm_?bairro', r'^nom_?bairro', r'bairro', r'^nm_', r'setor', r'nome', r'name', r'^nm'):
        for c in cols:
            if c != 'geometry' and re.search(pad, str(c), re.I) and df[c].dtype == object: return c
    return None
def le(path):
    if path.endswith('.zip'): return gpd.read_file('zip://' + path)
    if path.endswith('.kmz'):
        import zipfile, tempfile
        z = zipfile.ZipFile(path); d = tempfile.mkdtemp(); z.extractall(d); k = glob.glob(d + '/*.kml')[0]; return gpd.read_file(k, driver='KML')
    return gpd.read_file(path)
for fo in json.load(open(fontes)):
    cd5 = fo['cd5']; arqs = glob.glob(os.path.join(dl, cd5 + '.*'))
    if not arqs: print(f"sem arquivo {cd5} {fo['municipio']}"); continue
    ef = glob.glob(os.path.join(estd, '*', cd5 + '.json'))
    if not ef: print('sem locais', cd5); continue
    est = json.load(open(ef[0])); locais = est['l']
    try: df = le(arqs[0])
    except Exception as e: print(f"ERRO leitura {cd5} {fo['municipio']}: {e}"); continue
    print(f"== {fo['municipio']} ({cd5}) arquivo={os.path.basename(arqs[0])} feições={len(df)} crs={df.crs} colunas={[c for c in df.columns if c!='geometry']}")
    print(df.drop(columns='geometry').head(4).to_string()[:600])
    if fo.get('debug'):
        d0 = df.drop(columns='geometry')
        for c in fo['debug']: print('  valores', c, d0[c].value_counts(dropna=False).head(15).to_dict())
        print(d0[d0.astype(str).apply(lambda r: r.str.contains('Marista|Aeroporto|Bueno', case=False).any(), axis=1)].head(12).to_string()[:1800])
    if df.crs is None: print('  CRS ausente; assumindo SIRGAS 2000 (EPSG:4674)'); df = df.set_crs(4674)
    df = df.to_crs(4326); campo = acha_campo(df, fo.get('campo')); print('  campo de nome:', campo)
    if fo.get('nome'):   # nome composto por várias colunas (ex.: tipo + nome)
        df['_nome'] = df[fo['nome']].fillna('').astype(str).agg(' '.join, axis=1).str.replace(r'\s+', ' ', regex=True).str.strip(); campo = '_nome'
    if fo.get('tipo'):   # {coluna: tipo, nome: coluna do nome, alt: coluna alternativa, mapa: {abreviação: por extenso}}
        t = fo['tipo']; mp = t['mapa']
        def comp(r):
            nm = r[t['nome']] if isinstance(r[t['nome']], str) and r[t['nome']].strip() else None
            if nm is None: a = r.get(t.get('alt')); return a if isinstance(a, str) else None
            ab = mp.get(r[t['coluna']]); return f'{ab} {nm}' if ab else nm
        df = df.copy(); df['_nome'] = df.apply(comp, axis=1); campo = '_nome'
    if fo.get('excluir'):  # {coluna: [valores]} a descartar
        for c, vs in fo['excluir'].items(): df = df[~df[c].isin(vs)]
    if not campo: continue
    geoms = []
    for nome, g in zip(df[campo], df.geometry):
        if g is None or g.is_empty or not nome or not str(nome).strip(): continue
        g = g if g.is_valid else make_valid(g)
        if g.geom_type not in ('Polygon', 'MultiPolygon'): g = g.buffer(0)
        if g.geom_type not in ('Polygon', 'MultiPolygon'): continue
        geoms.append((str(nome).strip().title() if str(nome).isupper() else str(nome).strip(), g))
    # funde partes com o mesmo nome
    agr = collections.OrderedDict()
    for nm, g in geoms: agr.setdefault(nm, []).append(g)
    from shapely.ops import unary_union
    geoms = [(nm, unary_union(gs) if len(gs) > 1 else gs[0]) for nm, gs in agr.items()]
    cob, loc = cobre(geoms, locais)
    print(f"  polígonos={len(geoms)} cobertura dos locais={cob:.2f}")
    if cob < limite: print('  descartado (cobertura abaixo do mínimo)'); continue
    feitos = [{'n': nm, 'c': str(i), 'p': aneis(g, 0.00008)} for i, (nm, g) in enumerate(geoms)]
    txt = json.dumps({'m': cd5, 'uf': fo['uf'], 'ibge': '', 'fonte': fo['fonte'], 'rotulo': fo.get('rotulo', 'bairro'), 'cob': round(cob, 3), 'f': feitos, 'loc': loc}, separators=(',', ':'), ensure_ascii=False)
    open(os.path.join(out, cd5 + '.json'), 'w').write(txt); print(f"  FEITO {len(txt)//1024} KB")
