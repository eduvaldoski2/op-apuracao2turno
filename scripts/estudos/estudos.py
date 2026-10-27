"""Estudo 1 (eleitos por grupo) e Estudo 2 (cenários de federação). Uso: estudos.py <ano> <saida.json>"""
import sys, json, copy, collections
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from base import *; from cadeiras import *
ano = int(sys.argv[1]); saida = sys.argv[2]
F1, F2, PSB, PDT = 'PT/PC do B/PV', 'PSOL/REDE', 'PSB', 'PDT'
NOME = {'PCDOB': 'PCdoB', 'PC do B': 'PCdoB'}
def sg(x): return NOME.get(x, x)
GRUPOS = {F1: 'PT/PCdoB/PV', F2: 'PSOL/Rede', PSB: 'PSB', PDT: 'PDT'}
CEN = {  # nome -> (listas a fundir, rótulo da lista resultante)
    'A': ([F1, PSB], 'PT/PCdoB/PV/PSB'),
    'B': ([PSB, PDT], 'PSB/PDT'),
    'C': ([F1, PSB, PDT], 'PT/PCdoB/PV/PSB/PDT'),
    'D': ([F1, PSB, PDT, F2], 'PT/PCdoB/PV/PSB/PDT/PSOL/Rede'),
    'E': ([F1, F2], 'PT/PCdoB/PV/PSOL/Rede'),   # PSOL é federado com a Rede; a federação não se divide
    'F': ([PSB, 'CIDADANIA'], 'PSB/Cidadania'),  # desfaz a federação PSDB/Cidadania; o PSDB segue sozinho
}
FED_PSDB = 'PSDB/CIDADANIA'
def desfaz_psdb_cidadania(listas, cand):
    """Separa a federação PSDB/Cidadania em duas listas. Cada partido leva seus candidatos e os votos de legenda que o TSE
    registra para o seu número (leg_partes). Retorna novas listas (a original não é alterada)."""
    if FED_PSDB not in listas: return listas
    out = {l: d for l, d in listas.items() if l != FED_PSDB}
    d = listas[FED_PSDB]
    for sig in ('PSDB', 'CIDADANIA'):
        cs = [c for c in d['cands'] if cand[c[1]]['sigla'] == sig]
        out[sig] = {'cands': cs, 'leg': d['leg_partes'].get(sig, 0), 'partes': {sig: sum(c[0] for c in cs)}, 'leg_partes': {sig: d['leg_partes'].get(sig, 0)}}
    return out
def funde(listas, ids, novo, teto=None):
    out = {l: d for l, d in listas.items() if l not in ids}
    M = {'cands': [], 'leg': 0, 'partes': {}, 'leg_partes': {}}
    for l in ids:
        d = listas.get(l)
        if not d: continue
        M['cands'] += d['cands']; M['leg'] += d['leg']
        for k, x in d['partes'].items(): M['partes'][k] = M['partes'].get(k, 0) + x
        for k, x in d['leg_partes'].items(): M['leg_partes'][k] = M['leg_partes'].get(k, 0) + x
    if teto is not None and len(M['cands']) > teto:        # Lei 9.504 art. 10: até 100% das vagas + 1 por partido/federação
        M['cands'] = sorted(M['cands'], key=lambda c: (-c[0], str(c[1])))[:teto]
        manter = {sq for _, sq in M['cands']}; M['partes'] = {}
        M['_manter'] = manter
    out[novo] = M
    return out
res = {'ano': ano, 'eleitos_real': [], 'listas_real': [], 'cenarios': {h + k: {'rotulo': v[1], 'hip': h, 'cen': k, 'eleitos': [], 'info': []} for h in ('S', 'T') for k, v in CEN.items()}, 'base_info': []}
for cargo in (6, 7, 8):
    for uf in UFS:
        listas, cand, vagas = monta(ano, uf, cargo)
        if not vagas: continue
        el, info = distribui(listas, vagas)
        pos = {}   # posição do eleito na lista, por votos
        def pos_na_lista(lid, sq, L): 
            ordem = sorted(L[lid]['cands'], key=lambda c: (-c[0], str(c[1])))
            return 1 + [c[1] for c in ordem].index(sq)
        res['base_info'].append({'cargo': cargo, 'uf': uf, 'vagas': vagas, 'QE': info['QE'], 'validos': info['validos']})
        for lid in listas:
            L = listas[lid]
            res['listas_real'].append({'cargo': cargo, 'uf': uf, 'lista': lid, 'voto_nominal': sum(c[0] for c in L['cands']), 'voto_legenda': L['leg'],
                'total': info['tot'][lid], 'qp': info['qp'][lid], 'eleitos': sum(1 for e in el if e[0] == lid), 'leg_partes': L['leg_partes'], 'nom_partes': L['partes']})
        for l, sq, v, fase in el:
            c = cand[sq]
            res['eleitos_real'].append({'cargo': cargo, 'uf': uf, 'sq': sq, 'nome': c['urna'], 'nome_civil': c['nome'], 'partido': sg(c['sigla']), 'lista': l, 'votos': v, 'fase': fase, 'fase_oficial': c['sit'], 'pos_lista': pos_na_lista(l, sq, listas)})
        for h in ('S', 'T'):
            for k, (ids, novo) in CEN.items():
                base_l = desfaz_psdb_cidadania(listas, cand) if k == 'F' else listas
                L2 = funde(base_l, ids, novo, teto=(vagas + 1) if h == 'T' else None)
                e2, i2 = distribui(L2, vagas)
                n_cand = sum(len(base_l[l]['cands']) for l in ids if l in base_l)
                res['cenarios'][h + k]['info'].append({'cargo': cargo, 'uf': uf, 'QE': i2['QE'], 'validos': i2['validos'], 'qp_fundida': i2['qp'].get(novo, 0), 'total_fundida': i2['tot'].get(novo, 0), 'cands_soma': n_cand, 'teto': vagas + 1})
                for l, sq, v, fase in e2:
                    c = cand[sq]
                    res['cenarios'][h + k]['eleitos'].append({'cargo': cargo, 'uf': uf, 'sq': sq, 'nome': c['urna'], 'partido': sg(c['sigla']), 'lista': l, 'votos': v, 'fase': fase, 'pos_lista': pos_na_lista(l, sq, L2)})
json.dump(res, open(saida, 'w', encoding='utf-8'), ensure_ascii=False)
# resumo no console
def conta(es, cargo): return collections.Counter(e['partido'] for e in es if e['cargo'] == cargo)
for cargo in (6, 7, 8):
    base = conta(res['eleitos_real'], cargo); print(f'\n=== {CARGOS[cargo]} {ano}: total', sum(base.values()))
    alvo = ['PT','PCdoB','PV','PSB','PDT','PSOL','REDE']
    print('base   ', {p: base.get(p, 0) for p in alvo}, 'soma grupo', sum(base.get(p, 0) for p in alvo))
    for h in ('S', 'T'):
        for k in CEN:
            c = conta(res['cenarios'][h + k]['eleitos'], cargo); print(h + k, '     ', {p: c.get(p, 0) for p in alvo}, 'soma grupo', sum(c.get(p, 0) for p in alvo))
