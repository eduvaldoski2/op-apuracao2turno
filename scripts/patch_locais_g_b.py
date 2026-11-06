# Recalcula g (região) e b (bairro) dos locais de votação de um município numa pasta hist-<ano>, a partir de lat/lon e das malhas atuais.
# uso: patch_locais_g_b.py <pasta_hist> <uf> <cd5>
import json, os, sys
from shapely.geometry import Point, Polygon
from shapely.strtree import STRtree
pasta, uf, cd = sys.argv[1:4]
REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
def malha(path):
    d = json.load(open(path)); polys = []; idx = []
    for i, f in enumerate(d['f']):
        for poli in f['p']:
            for anel in poli:
                pts = [(anel[k], anel[k + 1]) for k in range(0, len(anel) - 1, 2)]
                if len(pts) >= 3: polys.append(Polygon(pts).buffer(0)); idx.append(i)
    return STRtree(polys), polys, idx
def acha(m, lon, lat):
    t, polys, idx = m; pt = Point(lon, lat)
    for j in t.query(pt):
        if polys[j].contains(pt): return idx[j]
    j = int(t.nearest(pt)); return idx[j] if polys[j].distance(pt) < 0.01 else -1   # fora dos polígonos: o mais próximo (até ~1 km)
g = malha(f'{REPO}/data/bairros_geo/{cd}.json'); b = malha(f'{REPO}/data/regioes/{cd}_bairros.json')
gl = json.load(open(f'{REPO}/data/bairros_geo/{cd}.json')).get('loc', {}); bl = json.load(open(f'{REPO}/data/regioes/{cd}_bairros.json')).get('loc', {})
arq = f'{pasta}/locais/{uf}/{cd}.json'; d = json.load(open(arq)); n = 0; sem = 0
for l in d['l']:
    if l[5] is None or l[6] is None:   # sem coordenada: usa o mesmo local (zona-número) já posicionado na malha atual, se existir
        k = f'{l[0]}-{l[1]}'; l[8] = gl.get(k, -1); l[9] = bl.get(k, -1); sem += 1; continue
    l[8] = acha(g, l[6], l[5]); l[9] = acha(b, l[6], l[5]); n += 1
json.dump(d, open(arq, 'w'), ensure_ascii=False, separators=(',', ':'))
print(arq, 'locais', len(d['l']), 'com coordenada', n, 'sem', sem)
