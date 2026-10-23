#!/usr/bin/env python3
"""Gera data/mapa_mun/{uf}.json (SVG por município) a partir de GeoJSON do IBGE (tbrugz/geodata-br, geojs-{cod}-mun.json).
Uso: build_mapa_mun.py <pasta com geojs-XX.json> <saida> """
import json, sys, math, glob, os, importlib.util
sys.path.insert(0, os.path.dirname(__file__))
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
COD = {'11':'ro','12':'ac','13':'am','14':'rr','15':'pa','16':'ap','17':'to','21':'ma','22':'pi','23':'ce','24':'rn','25':'pb','26':'pe','27':'al','28':'se','29':'ba','31':'mg','32':'es','33':'rj','35':'sp','41':'pr','42':'sc','43':'rs','50':'ms','51':'mt','52':'go','53':'df'}
# reaproveita pip_dist/polylabel do build_map.py sem executar o resto
code = open(os.path.join(os.path.dirname(__file__), 'build_map.py')).read()
ini = code.index('def area'); fim = code.index('NOMES=')
ns = {'math': math, 'heapq': __import__('heapq')}
exec(code[ini:fim], ns)
area, polylabel = ns['area'], ns['polylabel']

def dp(pts, eps):
    if len(pts) < 4: return pts
    keep = [False]*len(pts); keep[0] = keep[-1] = True; st = [(0, len(pts)-1)]
    while st:
        a, b = st.pop(); ax, ay = pts[a]; bx, by = pts[b]; dx, dy = bx-ax, by-ay; l = math.hypot(dx, dy); md = 0; mi = -1
        for i in range(a+1, b):
            px, py = pts[i]
            d = math.hypot(px-ax, py-ay) if l == 0 else abs(dy*(px-ax)-dx*(py-ay))/l
            if d > md: md, mi = d, i
        if md > eps: keep[mi] = True; st += [(a, mi), (mi, b)]
    r = [p for p, k in zip(pts, keep) if k]
    return r if len(r) >= 4 else pts[:3] if len(pts) >= 3 else pts

total = 0
for f in sorted(glob.glob(os.path.join(src, 'geojs-*.json'))):
    cod = os.path.basename(f)[6:8]; uf = COD[cod]
    g = json.load(open(f))
    lons = []; lats = []
    for ft in g['features']:
        polys = ft['geometry']['coordinates'] if ft['geometry']['type'] == 'MultiPolygon' else [ft['geometry']['coordinates']]
        for p in polys:
            for ring in p:
                for x, y in ring: lons.append(x); lats.append(y)
    lon0, lon1, lat0, lat1 = min(lons), max(lons), min(lats), max(lats)
    cl = math.cos(math.radians((lat0+lat1)/2))
    W = (lon1-lon0)*cl; H = lat1-lat0
    k = min(700/W, 600/H)  # unidades por grau
    vw, vh = round(W*k+20, 1), round(H*k+20, 1)
    prj = lambda x, y: (round((x-lon0)*cl*k+10, 1), round((lat1-y)*k+10, 1))
    muns = {}
    for ft in g['features']:
        polys = ft['geometry']['coordinates'] if ft['geometry']['type'] == 'MultiPolygon' else [ft['geometry']['coordinates']]
        d = []; big = None; bigA = 0
        for p in polys:
            for ri, ring in enumerate(p):
                pts = [prj(x, y) for x, y in ring]
                pts = dp(pts, 0.35)
                if len(pts) < 3: continue
                d.append('M' + 'L'.join(f'{x:g} {y:g}' for x, y in pts[:-1] if True) + 'Z')
                if ri == 0:
                    a = abs(area(pts))
                    if a > bigA: bigA, big = a, pts
        if not big: continue
        lx, ly, r = polylabel(big, 0.5)
        muns[ft['properties']['id']] = {'n': ft['properties']['name'], 'd': ''.join(d), 'lx': round(lx, 1), 'ly': round(ly, 1), 'r': round(r, 1)}
    json.dump({'uf': uf, 'viewBox': [vw, vh], 'k': round(k, 2), 'muns': muns}, open(os.path.join(out, uf + '.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
    sz = os.path.getsize(os.path.join(out, uf + '.json')); total += sz
    print(uf, len(muns), sz//1024, 'KB')
print('total', total//1024, 'KB')
