#!/usr/bin/env python3
"""Gera data/mapa_br_mun.json: todos os municípios no sistema de coordenadas do mapa do Brasil (data/mapa_uf.json).
Cada UF de data/mapa_mun/{uf}.json é encaixada (escala + deslocamento) no contorno nacional da própria UF.
Uso: python3 scripts/build_mapa_br_mun.py"""
import json, re, glob, math, os
root = os.path.join(os.path.dirname(__file__), '..')
nat = json.load(open(os.path.join(root, 'data/mapa_uf.json')))

def nat_pts(dd):
    toks = re.findall(r'[mzMZ]|-?\d*\.?\d+(?:e-?\d+)?', dd)
    pts = []; i = 0; cx = cy = sx = sy = 0; first = False
    while i < len(toks):
        t = toks[i]
        if t in 'mM': i += 1; first = True; continue
        if t in 'zZ': cx, cy = sx, sy; i += 1; continue
        cx += float(toks[i]); cy += float(toks[i+1]); i += 2
        if first: sx, sy = cx, cy; first = False
        pts.append((cx, cy))
    return pts

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
    return r if len(r) >= 3 else pts[:3]

EPS = 0.17
out = {}; total_pts = 0
for f in sorted(glob.glob(os.path.join(root, 'data/mapa_mun/*.json'))):
    u = json.load(open(f)); uf = u['uf']
    rings = {}
    xs = []; ys = []
    for cd, m in u['muns'].items():
        rs = []
        for seg in m['d'].split('Z'):
            nums = re.findall(r'-?\d+\.?\d*', seg)
            if len(nums) < 6: continue
            pts = [(float(nums[i]), float(nums[i+1])) for i in range(0, len(nums)-1, 2)]
            rs.append(pts); xs += [p[0] for p in pts]; ys += [p[1] for p in pts]
        rings[cd] = rs
    lb = (min(xs), min(ys), max(xs), max(ys))
    P = nat_pts(nat['ufs'][uf]['d']); nb = (min(p[0] for p in P), min(p[1] for p in P), max(p[0] for p in P), max(p[1] for p in P))
    if uf == 'pe':   # Fernando de Noronha entra na caixa local mas não no contorno nacional: encaixa pela borda oeste/sul com a escala das demais UFs
        sx = sy = 0.2005; tx = nb[0] - lb[0]*sx; ty = nb[3] - lb[3]*sy
    else:
        sx = (nb[2]-nb[0])/(lb[2]-lb[0]); sy = (nb[3]-nb[1])/(lb[3]-lb[1]); tx = nb[0] - lb[0]*sx; ty = nb[1] - lb[1]*sy
    for cd, m in u['muns'].items():
        d = []; best = None; ba = 0
        for pts in rings[cd]:
            q = [(x*sx+tx, y*sy+ty) for x, y in pts]
            if uf == 'pe' and min(p[0] for p in q) > 616: continue   # ilha fora do contorno nacional
            q = dp(q, EPS)
            if len(q) < 3: continue
            a = abs(sum(q[i][0]*q[(i+1) % len(q)][1]-q[(i+1) % len(q)][0]*q[i][1] for i in range(len(q)))/2)
            if a > ba: ba, best = a, q
            total_pts += len(q)
            d.append('M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in q) + 'Z')
        if not d: continue
        lx = m['lx']*sx+tx; ly = m['ly']*sy+ty; r = m['r']*min(sx, sy)
        out[cd] = {'n': m['n'], 'u': uf, 'd': ''.join(d), 'lx': round(lx, 1), 'ly': round(ly, 1), 'r': round(r, 2)}
    print(uf, len(u['muns']), 'sx', round(sx, 4), 'sy', round(sy, 4))
def aneis(dd):   # subcaminhos do contorno nacional em coordenadas absolutas
    toks = re.findall(r'[mzMZ]|-?\d*\.?\d+(?:e-?\d+)?', dd); out = []; cur = []; i = 0; cx = cy = sx = sy = 0; first = False
    while i < len(toks):
        t = toks[i]
        if t in 'mM': i += 1; first = True; continue
        if t in 'zZ':
            if cur: out.append(cur); cur = []
            cx, cy = sx, sy; i += 1; continue
        cx += float(toks[i]); cy += float(toks[i+1]); i += 2
        if first: sx, sy = cx, cy; first = False
        cur.append((cx, cy))
    if cur: out.append(cur)
    return out
def contorno(dd):
    return ''.join('M' + ' '.join(f'{x:.1f} {y:.1f}' for x, y in r) + 'Z' for r in aneis(dd) if not (min(p[0] for p in r) > 590 and min(p[1] for p in r) > 440))
borda = ''.join(contorno(v['d']) for v in nat['ufs'].values())
json.dump({'viewBox': [613, 639], 'sw': 0.12, 'rmin': 12, 'borda': borda, 'muns': out}, open(os.path.join(root, 'data/mapa_br_mun.json'), 'w'), ensure_ascii=False, separators=(',', ':'))
print('municípios', len(out), 'pontos', total_pts, 'KB', os.path.getsize(os.path.join(root, 'data/mapa_br_mun.json'))//1024)
