#!/usr/bin/env python3
"""Converte @svg-maps/brazil (CC BY 4.0) em data/mapa_uf.json com pontos de rótulo (pólo de inacessibilidade)."""
import re, json, sys, heapq, math
src = sys.argv[1]; out = sys.argv[2]
s = open(src).read(); j = json.loads(s[s.index('{'):s.rindex('}')+1])

def rings(path):
    res=[]; cur=None; x=y=0.0
    for tok in re.findall(r'[mMzZ]|-?\d*\.?\d+(?:e-?\d+)?', path):
        pass
    toks = re.findall(r'[mMzZ]|-?\d*\.?\d+(?:e-?\d+)?', path)
    i=0; first=True
    while i<len(toks):
        t=toks[i]
        if t in 'mM':
            if cur and len(cur)>2: res.append(cur)
            cur=[]; i+=1; rel=(t=='m'); firstpt=True
            while i<len(toks) and toks[i] not in 'mMzZ':
                dx=float(toks[i]); dy=float(toks[i+1]); i+=2
                if firstpt and not (rel and res==[] and False):
                    # primeiro par de m é absoluto quando é o 1º subpath; relativo ao ponto anterior depois
                    if rel and (res or x or y): x+=dx; y+=dy
                    else: x,y=dx,dy
                    firstpt=False
                else:
                    if rel: x+=dx; y+=dy
                    else: x,y=dx,dy
                cur.append((x,y))
        elif t in 'zZ':
            if cur and len(cur)>2: res.append(cur)
            if cur: x,y=cur[0]
            cur=None; i+=1
        else: i+=1
    if cur and len(cur)>2: res.append(cur)
    return res

def area(r):
    return sum(r[i][0]*r[(i+1)%len(r)][1]-r[(i+1)%len(r)][0]*r[i][1] for i in range(len(r)))/2

def pip_dist(px,py,r):
    inside=False; md=1e18
    n=len(r)
    for i in range(n):
        ax,ay=r[i]; bx,by=r[(i+1)%n]
        if (ay>py)!=(by>py) and px < (bx-ax)*(py-ay)/(by-ay)+ax: inside=not inside
        dx,dy=bx-ax,by-ay; l=dx*dx+dy*dy
        t=0 if l==0 else max(0,min(1,((px-ax)*dx+(py-ay)*dy)/l))
        qx,qy=ax+t*dx,ay+t*dy
        md=min(md,(px-qx)**2+(py-qy)**2)
    d=math.sqrt(md)
    return d if inside else -d

def polylabel(r,prec=0.2):
    xs=[p[0] for p in r]; ys=[p[1] for p in r]
    minx,maxx,miny,maxy=min(xs),max(xs),min(ys),max(ys)
    w,h=maxx-minx,maxy-miny; cs=min(w,h)
    if cs==0: return minx,miny,0
    hh=cs/2
    class C:
        def __init__(s,x,y,h):
            s.x,s.y,s.h=x,y,h; s.d=pip_dist(x,y,r); s.m=s.d+h*math.sqrt(2)
        def __lt__(s,o): return s.m>o.m
    q=[]
    x=minx
    while x<maxx:
        y=miny
        while y<maxy:
            heapq.heappush(q,C(x+hh,y+hh,hh)); y+=cs
        x+=cs
    cx=sum(xs)/len(xs); cy=sum(ys)/len(ys)
    best=C(cx,cy,0)
    while q:
        c=heapq.heappop(q)
        if c.d>best.d: best=c
        if c.m-best.d<=prec: continue
        h2=c.h/2
        for dx,dy in((-1,-1),(1,-1),(-1,1),(1,1)):
            heapq.heappush(q,C(c.x+dx*h2,c.y+dy*h2,h2))
    return best.x,best.y,best.d

NOMES={'ac':'Acre','al':'Alagoas','ap':'Amapá','am':'Amazonas','ba':'Bahia','ce':'Ceará','df':'Distrito Federal','es':'Espírito Santo','go':'Goiás','ma':'Maranhão','mt':'Mato Grosso','ms':'Mato Grosso do Sul','mg':'Minas Gerais','pa':'Pará','pb':'Paraíba','pr':'Paraná','pe':'Pernambuco','pi':'Piauí','rj':'Rio de Janeiro','rn':'Rio Grande do Norte','rs':'Rio Grande do Sul','ro':'Rondônia','rr':'Roraima','sc':'Santa Catarina','sp':'São Paulo','se':'Sergipe','to':'Tocantins'}
res={}
for l in j['locations']:
    rs=rings(l['path']); big=max(rs,key=lambda r:abs(area(r)))
    lx,ly,ld=polylabel(big)
    xs=[p[0] for r in rs for p in r]; ys=[p[1] for r in rs for p in r]
    res[l['id']]={'n':NOMES[l['id']],'d':l['path'],'lx':round(lx,1),'ly':round(ly,1),'r':round(ld,1),
                  'bb':[round(min(xs),1),round(min(ys),1),round(max(xs),1),round(max(ys),1)],'cx':round(sum(xs)/len(xs),1),'cy':round(sum(ys)/len(ys),1)}
json.dump({'viewBox':j['viewBox'],'ufs':res},open(out,'w'),ensure_ascii=False,separators=(',',':'))
for k,v in sorted(res.items(),key=lambda kv:-kv[1]['r']): print(k,v['lx'],v['ly'],v['r'])
