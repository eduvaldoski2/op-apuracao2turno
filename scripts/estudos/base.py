"""Carrega a votação oficial (data/vot/<ano>/<UF>.json, do TSE) e monta as listas (partido isolado ou federação)."""
import json, os
RAIZ = os.path.join(os.path.dirname(__file__), '..', '..')
CARGOS = {6: 'Deputado federal', 7: 'Deputado estadual', 8: 'Deputado distrital'}
UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','SC','SE','SP','TO']
ELEITO = ('ELEITO POR QP', 'ELEITO POR MÉDIA', 'ELEITO')
_C = {}
def carrega(ano, uf):
    k = (ano, uf)
    if k not in _C: _C[k] = json.load(open(os.path.join(RAIZ, 'data/vot', str(ano), uf + '.json'), encoding='utf-8'))
    return _C[k]

def monta(ano, uf, cargo):
    """listas: {lid: {'cands': [(votos, sq)], 'leg': int, 'partes': {sigla: votos}}}, cand: {sq: dict}, vagas (eleitos reais).
    Votos de legenda da lista = legenda válida + nominais convertidos em legenda (QT_TOTAL_VOTOS_LEG_VALIDOS). Votos anulados
    (sub judice ou não) não entram: o candidato não concorre a cadeira e seus votos não compõem o QE."""
    j = carrega(ano, uf); pc = j['part_cols']; cc = j['cand_cols']
    listas = {}; cand = {}
    lid_de = {}
    for r in j['part']:
        p = dict(zip(pc, r))
        if p['cargo'] != cargo: continue
        lid = p['fed'] or p['sigla']; lid_de[p['nr_partido']] = lid
        L = listas.setdefault(lid, {'cands': [], 'leg': 0, 'partes': {}, 'leg_partes': {}})
        L['leg'] += p['totleg']; L['leg_partes'][p['sigla']] = L['leg_partes'].get(p['sigla'], 0) + p['totleg']
    for r in j['cand']:
        c = dict(zip(cc, r))
        if c['cargo'] != cargo: continue
        lid = c['fed'] or c['sigla']
        L = listas.setdefault(lid, {'cands': [], 'leg': 0, 'partes': {}, 'leg_partes': {}})
        c['lista'] = lid; cand[c['sq']] = c
        if c['validos'] > 0:
            L['cands'].append((c['validos'], c['sq']))
            L['partes'][c['sigla']] = L['partes'].get(c['sigla'], 0) + c['validos']
    vagas = sum(1 for c in cand.values() if c['sit'] in ELEITO)
    return listas, cand, vagas
