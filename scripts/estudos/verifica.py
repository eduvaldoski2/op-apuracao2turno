"""Verificação 1: reimplementação independente (aritmética exata, Fraction), a partir do JSON bruto data/vot/2026."""
import json, sys
from fractions import Fraction as Fr
from collections import defaultdict
import os
R=os.path.join(os.path.dirname(os.path.abspath(__file__)),'..','..','data','vot','2026')+'/'
EST=json.load(open(sys.argv[1]))
UFS="AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO".split()
# grupos por SIGLA de partido (não por rótulo de federação)
G={'F1':{'PT','PCDOB','PV'},'F2':{'PSOL','REDE'},'PSB':{'PSB'},'PDT':{'PDT'}}
SC={'A':['F1','PSB'],'B':['PSB','PDT'],'C':['F1','PSB','PDT'],'D':['F1','PSB','PDT','F2'],'E':['F1','F2']}
def rq(x):  # x Fraction
    f=x.numerator//x.denominator; r=x-f
    return f if r<=Fr(1,2) else f+1
def aloca(L, vagas):
    # L: {chave: (legenda_total_inclui_nominais_conv, [(votos,sq)...])}
    tot={k:v[0]+sum(c[0] for c in v[1]) for k,v in L.items()}
    QE=rq(Fr(sum(tot.values()),vagas))
    cand={k:sorted(v[1],key=lambda c:(-c[0],c[1])) for k,v in L.items()}
    nel={k:0 for k in L}; out=[]
    if all(t<QE for t in tot.values()):
        allc=sorted(((c[0],c[1],k) for k in L for c in cand[k]),key=lambda t:(-t[0],t[1]))[:vagas]
        return [(sq,'MV',k) for v,sq,k in allc],QE
    for k in L:
        q=tot[k]//QE
        for _ in range(int(q)):
            if nel[k]<len(cand[k]) and Fr(cand[k][nel[k]][0])>=Fr(QE,10):
                out.append((cand[k][nel[k]][1],'QP',k)); nel[k]+=1
            else: break
    def pick(filtro):
        best=None
        for k in L:
            if nel[k]>=len(cand[k]): continue
            c=cand[k][nel[k]]
            if not filtro(k,c): continue
            m=Fr(tot[k],nel[k]+1)
            if best is None or (m,tot[k])>(best[0],best[1]): best=(m,tot[k],k)
        return best
    while len(out)<vagas:
        b=pick(lambda k,c: tot[k]>=Fr(QE*8,10) and c[0]>=Fr(QE,5))
        if not b: break
        k=b[2]; out.append((cand[k][nel[k]][1],'ME',k)); nel[k]+=1
    while len(out)<vagas:
        b=pick(lambda k,c: True)
        if not b: break
        k=b[2]; out.append((cand[k][nel[k]][1],'ME',k)); nel[k]+=1
    return out,QE
bad=0; n=0
# esperado
exp_real=defaultdict(set); exp_sc={s:defaultdict(set) for s in SC}
for e in EST['eleitos_real']: exp_real[(e['cargo'],e['uf'])].add(e['sq'])
for s in SC:
    for e in EST['cenarios']['S'+s]['eleitos']: exp_sc[s][(e['cargo'],e['uf'])].add(e['sq'])
qe_exp={(b['cargo'],b['uf']):b['QE'] for b in EST['base_info']}
fase_exp_real={(e['cargo'],e['uf'],e['sq']):e['fase'] for e in EST['eleitos_real']}
fase_exp={s:{(e['cargo'],e['uf'],e['sq']):e['fase'] for e in EST['cenarios']['S'+s]['eleitos']} for s in SC}
FM={'QP':'QP','MÉDIA':'ME','MÉDIA (sem barreira)':'ME','MAIS VOTADOS':'MV'}
sit_ok=0
for uf in UFS:
    j=json.load(open(R+uf+'.json'))
    cc=j['cand_cols']; pc=j['part_cols']
    for cargo in (6,7,8):
        cands=[dict(zip(cc,r)) for r in j['cand'] if r[0]==cargo]
        parts=[dict(zip(pc,r)) for r in j['part'] if r[0]==cargo]
        if not cands: continue
        vagas=sum(1 for c in cands if c['sit'] in ('ELEITO POR QP','ELEITO POR MÉDIA','ELEITO'))
        sitset={c['sq'] for c in cands if c['sit'] in ('ELEITO POR QP','ELEITO POR MÉDIA','ELEITO')}
        if not vagas: continue
        # lista base: federação (nr_fed) ou partido
        def base_key(sigla,nr_fed): return ('F',nr_fed) if nr_fed not in (-1,None) else ('P',sigla)
        sig2key={}; leg=defaultdict(int); sigs=defaultdict(set)
        for p in parts:
            k=base_key(p['sigla'],p['nr_fed']); sig2key[p['sigla']]=k; leg[k]+=p['totleg']; sigs[k].add(p['sigla'])
        cl=defaultdict(list)
        for c in cands:
            k=sig2key.get(c['sigla'], base_key(c['sigla'],None))
            if c['validos']>0: cl[k].append((c['validos'],c['sq']))
        keys=set(leg)|set(cl)
        L0={k:(leg[k],cl[k]) for k in keys}
        res,QE=aloca(L0,vagas)
        got={sq for sq,_,_ in res}
        n+=1
        if got!=sitset: bad+=1; print('BASE != sit oficial',uf,cargo,len(got^sitset))
        else: sit_ok+=1
        if got!=exp_real[(cargo,uf)]: bad+=1; print('BASE != est2026',uf,cargo)
        if QE!=qe_exp[(cargo,uf)]: bad+=1; print('QE diff',uf,cargo,QE,qe_exp[(cargo,uf)])
        for sq,f,k in res:
            if FM[fase_exp_real[(cargo,uf,sq)]]!=f: bad+=1; print('fase real diff',uf,cargo,sq)
        # cenários: funde as listas cujos conjuntos de siglas pertencem ao grupo
        for s,gs in SC.items():
            alvo=set().union(*[G[g] for g in gs])
            L={}; M=(0,[]); achou=False
            for k,(lg,cs) in L0.items():
                if sigs[k]&alvo:
                    assert sigs[k]<=alvo, (uf,cargo,k,sigs[k])   # nenhuma federação é dividida
                    M=(M[0]+lg,M[1]+cs); achou=True
                else: L[k]=(lg,cs)
            L[('M',s)]=M
            res2,QE2=aloca(L,vagas)
            g2={sq for sq,_,_ in res2}
            if QE2!=QE: bad+=1; print('QE cen diff')
            if g2!=exp_sc[s][(cargo,uf)]: bad+=1; print('CEN diff',s,uf,cargo,sorted(g2^exp_sc[s][(cargo,uf)]))
            for sq,f,k in res2:
                if FM[fase_exp[s][(cargo,uf,sq)]]!=f: bad+=1; print('fase cen diff',s,uf,cargo,sq)
print('UF/cargo checados:',n,'| iguais ao resultado oficial (sit):',sit_ok,'| divergências:',bad)
