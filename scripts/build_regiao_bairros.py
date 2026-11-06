#!/usr/bin/env python3
"""Hierarquia município > região (divisão da prefeitura) > bairro (nome informado ao TSE) > local de votação > seção.
Para municípios cuja malha em data/bairros_geo/<cd5>.json é a divisão oficial (ex.: Guarulhos: 46 bairros administrativos + aeroporto, IBGE Censo 2022) e cujos
bairros do TSE (cadastro de locais) são mais numerosos: cada bairro do TSE é distribuído DENTRO da região onde ficam os seus locais de votação.
  1) a região de cada local = polígono que contém o ponto (ou o mais próximo, se o ponto cair fora);
  2) em cada região, as áreas dos bairros do TSE são APROXIMADAS: a região é dividida em células de Voronoi (uma por local) e fundidas pelo bairro do TSE;
  3) saídas: data/regioes/<cd5>_bairros.json (bairros do TSE com área aproximada, aprox:1, e loc local->bairro), data/bairros_geo/<cd5>.json passa a rotulo 'distrito'
     (rotuloNome 'Região'), e um CSV de conferência bairro do TSE x região.
Nada é inventado: bairro do TSE sem coordenadas nos locais fica sem área, e o local sem coordenada fica sem região.
Uso: build_regiao_bairros.py <cd5> [rotuloNome rotuloPlural]"""
import sys, os, json, collections, unicodedata, csv
from shapely.geometry import Polygon, Point, MultiPoint
from shapely.ops import unary_union, voronoi_diagram
from shapely.strtree import STRtree
from shapely import make_valid
cd5 = sys.argv[1]; rotN = sys.argv[2] if len(sys.argv) > 2 else 'Região'; rotP = sys.argv[3] if len(sys.argv) > 3 else 'Regiões'
R = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
geo_p = os.path.join(R, 'data/bairros_geo', cd5 + '.json'); geo = json.load(open(geo_p))
import glob
est = json.load(open(glob.glob(os.path.join(R, 'data/bairros', '*', cd5 + '.json'))[0]))
def r5(x): return round(x, 5)
def norm(s): return ' '.join(''.join(c for c in unicodedata.normalize('NFD', (s or '').upper()) if unicodedata.category(c) != 'Mn').split())
MIN = ('da', 'de', 'do', 'das', 'dos', 'e')
def bonito(s): return ' '.join(w.capitalize() if w.lower() not in MIN else w.lower() for w in (s or '').lower().split())
def aneis(g, tol):
    g = g.simplify(tol, preserve_topology=True)
    polys = [g] if g.geom_type == 'Polygon' else [p for p in getattr(g, 'geoms', []) if p.geom_type == 'Polygon']
    res = []
    for p in polys:
        if p.is_empty or p.area < 1e-10: continue
        rs = [list(p.exterior.coords)] + [list(i.coords) for i in p.interiors]
        res.append([[v for c in r for v in (r5(c[0]), r5(c[1]))] for r in rs])
    return res
# regiões (polígonos) -----------------------------------------------------
regs = []
for f in geo['f']:
    ps = []
    for poly in f['p']:
        rs = [[(r[k], r[k + 1]) for k in range(0, len(r) - 1, 2)] for r in poly]
        p = Polygon(rs[0], rs[1:]); ps.append(p if p.is_valid else make_valid(p))
    g = unary_union(ps); regs.append(g if g.is_valid else make_valid(g))
rt = STRtree(regs)
def regiao_de(x, y):
    pt = Point(x, y); h = rt.query(pt, predicate='within')
    if len(h): return int(h[0]), False
    return int(rt.nearest(pt)), True
# locais ------------------------------------------------------------------
locs = []
for l in est['l']:
    z, nr, nome, bai, lat, lon = l[0], l[1], l[2], l[4], l[6], l[7]
    locs.append({'k': f'{z}-{nr}', 'nome': nome, 'bai': (bai or '').strip(), 'lat': lat, 'lon': lon, 'secs': len(l[-1]) if isinstance(l[-1], list) else 0})
com = [x for x in locs if x['lat'] and x['lon'] and abs(x['lat']) > .01]
print('locais', len(locs), 'com coordenada', len(com), 'bairros TSE', len({norm(x['bai']) for x in locs if x['bai']}))
for x in com: x['r'], x['fora'] = regiao_de(x['lon'], x['lat'])
# Voronoi por região -------------------------------------------------------
cel_de = {}   # (r, (x,y)) -> célula
for ri in sorted({x['r'] for x in com}):
    pts = {}
    for x in com:
        if x['r'] == ri: pts.setdefault((round(x['lon'], 6), round(x['lat'], 6)), []).append(x)
    reg = regs[ri]
    if len(pts) == 1: cel_de[(ri, next(iter(pts)))] = reg; continue
    vd = voronoi_diagram(MultiPoint([Point(p) for p in pts]), envelope=reg.buffer(0.02))
    cells = [c.intersection(reg) for c in vd.geoms]; tree = STRtree(cells)
    for p in pts:
        h = tree.query(Point(p), predicate='within'); i = int(h[0]) if len(h) else int(tree.nearest(Point(p)))
        cel_de[(ri, p)] = cells[i]
grupos = collections.OrderedDict(); nomes = collections.defaultdict(collections.Counter); chave_de = {}
for x in com:
    nome = x['bai'] or '(sem bairro informado)'; k = norm(nome)
    nomes[k][nome] += 1
    cel = cel_de[(x['r'], (round(x['lon'], 6), round(x['lat'], 6)))]
    g = grupos.setdefault(k, {'cel': {}, 'locs': []}); g['cel'].setdefault((x['r'], (round(x['lon'], 6), round(x['lat'], 6))), cel); g['locs'].append(x)
    chave_de[x['k']] = k
ordem = sorted(grupos, key=lambda k: bonito(nomes[k].most_common(1)[0][0])); idx = {k: i for i, k in enumerate(ordem)}
feats = []; cruz = []
for k in ordem:
    g = grupos[k]; u = unary_union(list(g['cel'].values()))
    por_reg = collections.Counter(x['r'] for x in g['locs']); secs_reg = collections.Counter()
    for x in g['locs']: secs_reg[x['r']] += x['secs']
    feats.append({'n': bonito(nomes[k].most_common(1)[0][0]), 'c': str(idx[k]), 'p': aneis(u, 0.00008)})
    for r, n in por_reg.most_common():
        cruz.append([bonito(nomes[k].most_common(1)[0][0]), geo['f'][r]['n'], n, secs_reg[r], len(por_reg), sum(1 for x in g['locs'] if x['r'] == r and x['fora'])])
loc = {kk: idx[v] for kk, v in chave_de.items()}
fonte = f"Bairros informados ao TSE (cadastro de locais de votação), com áreas APROXIMADAS: cada {rotN.lower()} da prefeitura é dividida pela proximidade dos locais de votação e agrupada pelo bairro do TSE (não são limites oficiais de bairro)"
open(os.path.join(R, 'data/regioes', cd5 + '_bairros.json'), 'w').write(json.dumps({'m': cd5, 'uf': est['uf'], 'ibge': geo.get('ibge', ''), 'fonte': fonte, 'rotulo': 'bairro', 'aprox': 1, 'cob': 1.0, 'f': feats, 'loc': loc}, ensure_ascii=False, separators=(',', ':')))
# região: troca o rótulo da malha oficial ---------------------------------
geo['rotulo'] = 'distrito'; geo['rotuloNome'] = rotN; geo['rotuloPlural'] = rotP
geo['fonte'] = (geo.get('fonte', '') + ' · divisão da prefeitura (bairros administrativos) tratada como ' + rotN.lower()).replace('  ', ' ')
for f in geo['f']:
    if f['n'].isupper(): f['n'] = bonito(f['n'])
# região de cada local (inclusive os que caíram fora de qualquer polígono)
geo['loc'] = {x['k']: x['r'] for x in com}
open(geo_p, 'w').write(json.dumps(geo, ensure_ascii=False, separators=(',', ':')))
os.makedirs(os.path.join(R, 'docs/divisoes'), exist_ok=True)
with open(os.path.join(R, f'docs/divisoes/{cd5}_bairros_tse_por_regiao.csv'), 'w', newline='') as fh:
    w = csv.writer(fh); w.writerow(['bairro_tse', 'regiao', 'locais_na_regiao', 'secoes_na_regiao', 'regioes_do_bairro', 'locais_fora_do_poligono']); w.writerows(sorted(cruz))
multi = sum(1 for k in ordem if len({x['r'] for x in grupos[k]['locs']}) > 1)
fora = sum(1 for x in com if x['fora'])
regs_sem = [geo['f'][i]['n'] for i in range(len(regs)) if i not in {x['r'] for x in com}]
print(f"regiões {len(regs)}; bairros TSE {len(ordem)} (em mais de uma região: {multi}); locais fora de qualquer polígono: {fora}; regiões sem local: {regs_sem}")
