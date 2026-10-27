"""Carrega votos por UF/cargo a partir de data/hist e monta as listas (partido isolado ou federação)."""
import json, os, collections
RAIZ = os.path.join(os.path.dirname(__file__), '..', '..')
CARGOS = {6: 'Deputado federal', 7: 'Deputado estadual', 8: 'Deputado distrital'}
UFS = ['AC','AL','AM','AP','BA','CE','DF','ES','GO','MA','MG','MS','MT','PA','PB','PE','PI','PR','RJ','RN','RO','RR','RS','RS','SC','SE','SP','TO']
UFS = sorted(set(UFS))

def carrega(uf):
    return json.load(open(os.path.join(RAIZ, 'data/hist/uf', uf, 'idx.json'), encoding='utf-8'))['cands']

def digitos_partido(cargo): return 100 if cargo == 6 else 1000

_CAD = {}
def cadastro(uf):
    """Cadastro TSE 2026 (data/cand): chave (cargo, nr) apenas de quem estava na urna no 1º turno."""
    if uf not in _CAD:
        j = json.load(open(os.path.join(RAIZ, 'data/cand/2026', uf + '.json'), encoding='utf-8'))
        I = {c: i for i, c in enumerate(j['cols'])}
        m = {}
        for r in j['rows']:
            if r[I['turno']] == 1 and r[I['cargo']] in (6, 7, 8) and r[I['na_urna']] == 'SIM':
                m.setdefault((r[I['cargo']], r[I['nr']]), []).append({k: r[I[k]] for k in ('sq','nome','urna','sigla','federacao','resultado','sit_registro','destino_votos','genero','cor')})
        _CAD[uf] = m
    return _CAD[uf]

ELEITO = ('ELEITO POR QP', 'ELEITO POR MÉDIA', 'ELEITO')

def monta(uf, cargo, invalidos='excluir'):
    """Retorna dict com listas {lid:{'cands':[(votos, nr)], 'leg':int, 'siglas':set}}, info dos candidatos e 'vagas' real."""
    cs = [a for a in carrega(uf) if a[0] == cargo]
    d = digitos_partido(cargo)
    ali = {}                                   # nº do partido -> (sigla, federação)
    for a in cs:
        if a[2] != 'LEGENDA': ali[a[1] // d] = (a[4], a[6])
    listas = {}; cand = {}
    for a in cs:
        if a[2] == 'LEGENDA':
            p = a[1]; sg, fed = ali.get(p, (str(p), ''))
            lid = fed or sg
            listas.setdefault(lid, {'cands': [], 'leg': 0, 'partes': set()})['leg'] += a[7]
            continue
        sg, fed = a[4], a[6]; lid = fed or sg
        L = listas.setdefault(lid, {'cands': [], 'leg': 0, 'partes': set()})
        r = (cadastro(uf).get((cargo, a[1])) or [None])[0]
        dest = r['destino_votos'] if r else None
        anulado = dest in ('Anulado sub judice', 'Anulado', 'Nulo técnico')
        L['partes'].add(sg)
        cand[a[1]] = {'nr': a[1], 'urna': a[2], 'nome': a[3], 'sigla': sg, 'lista': lid, 'sit': a[5], 'votos': a[7], 'destino': dest, 'anulado': anulado}
        if anulado and invalidos == 'excluir': continue            # votos não computados; candidato não pode ser eleito
        if anulado and invalidos == 'legenda': L['leg'] += a[7]; continue   # art. 175 §4: votos contam para a legenda
        L['cands'].append((a[7], a[1]))
    cad = cadastro(uf)
    for nr, c in cand.items():
        r = (cad.get((cargo, nr)) or [None])[0]
        c['real'] = r['resultado'] if r else None
        c['fase_real'] = r['resultado'] if r else None
        c['sq'] = r['sq'] if r else None
        c['genero'] = r['genero'] if r else None
        c['cor'] = r['cor'] if r else None
    vagas = sum(1 for c in cand.values() if c['real'] in ELEITO)
    return listas, cand, vagas
