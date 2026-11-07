#!/usr/bin/env python3
"""Camada do painel para eleições anteriores (e cargos de 2026 além do presidente), até a seção.

Lê o lake do ano (Release lake-<ano>, Parquet, gerado por scripts/lake_gerais/build_lake.py) e grava JSON
estático em <saida>/ (publicado no branch hist-<ano>). Formato (uf minúscula, cd = código TSE do município, 5 dígitos):

  idx.json                         {ano, el:[{id, c, t, nome, ab ('BR'|'UF'|'MUN'), prop}], gerado}
  <id>/br.json                     presidente: {cands, tot, uf:{uf: linha}}
  <id>/<uf>.json                   majoritário BR/UF: {cands, tot, mun:{cd: linha}}
                                   prefeito: {mun:{cd:{cands, tot}}}
                                   deputados: {cands, par, tot, mun:{cd: [aptos, comp, br, nu, [votos por partido], [[i, v] top 10]]}}
                                   vereador: {mun:{cd:{tot:[aptos,comp,br,nu], top:[[nome, sigla, v, sit] x3], ele, nc}}}
  <id>/<uf>/<cd>.json              seções do município:
                                   majoritário: {cands?(prefeito), s:{'zona-secao': linha}}
                                   proporcional: {cands?, par?(vereador), cv:[[i, v]...] (todos os candidatos no município), s:{'zona-secao': [aptos, comp, br, nu, [por partido], [[i, v] top 10]]}}
  locais/<uf>/<cd>.json            {l:[[zona, nr_local, nome, endereço, bairro, lat, lon, [seções], g, b]]}  g/b = índice do polígono em
                                   data/bairros_geo/<cd>.json e data/regioes/<cd>_bairros.json (ponto no polígono), -1 se fora
  linha (majoritário) = [aptos, comparecimento, brancos, nulos, votos de cada candidato na ordem de cands]
  cands = [{n, nm, sg, st}]  (st = situação final no TSE)   par = [{n, sg, fed}]

Uso: build_hist.py <ano> <dir_lake> <saida> [--ufs=AC,RJ] [--el=c1t1,c3t1]
"""
import duckdb, json, os, sys, glob, datetime, collections

ano = int(sys.argv[1]); LAKE = sys.argv[2]; OUT = sys.argv[3]
arg = lambda k: next((a.split('=', 1)[1] for a in sys.argv if a.startswith(f'--{k}=')), '')
UFS_ARG = [u.upper() for u in arg('ufs').split(',') if u]
EL_ARG = [e for e in arg('el').split(',') if e]
REPO = os.environ.get('REPO_DIR', '.')
con = duckdb.connect(); con.execute("SET memory_limit='5GB'; SET threads=4; SET preserve_insertion_order=false")
P = lambda n: os.path.join(LAKE, n)
NOME = {1: 'Presidente', 3: 'Governador', 5: 'Senador', 6: 'Deputado federal', 7: 'Deputado estadual', 8: 'Deputado distrital', 11: 'Prefeito', 13: 'Vereador'}
PROP = {6, 7, 8, 13}
AB = {1: 'BR', 3: 'UF', 5: 'UF', 6: 'UF', 7: 'UF', 8: 'UF', 11: 'MUN', 13: 'MUN'}
TOP = 10

def grava(rel, obj):
    p = os.path.join(OUT, rel); os.makedirs(os.path.dirname(p), exist_ok=True)
    with open(p, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))

def log(*a): print(*a, flush=True)

# ---------- eleição ordinária: o código de eleição com mais candidaturas em cada turno (exclui suplementares) ----------
cand_pq = P(f'candidato_{ano}.parquet')
# eleição ordinária por (turno, cargo): o código com mais seções no detalhe da apuração (suplementares são poucas seções).
# Nas gerais, presidente e cargos estaduais têm códigos diferentes.
ordin = {(t, cg): e for t, cg, e in con.execute(f"""SELECT turno, cargo, arg_max(cd_eleicao, n) FROM (SELECT turno, cargo, cd_eleicao, count(*) n
  FROM '{P(f'detalhe_secao_{ano}.parquet')}' GROUP BY ALL) GROUP BY ALL""").fetchall()}
municipal = ano % 4 == 0
log('ordinária', ordin, 'municipal' if municipal else 'geral')

# ---------- candidatos (situação final: a do último turno em que aparecem) ----------
cands_rows = con.execute(f"""SELECT cargo, uf, ue, sq_candidato, nr, nome_urna, sigla, coalesce(federacao, ''), situacao_final, turno, nr_partido, coalesce(coligacao, ''), coalesce(composicao_federacao, '')
  FROM '{cand_pq}' WHERE cd_eleicao IN ({','.join(str(v) for v in set(ordin.values()))}) ORDER BY turno""").fetchall()
CAND = {}; SIT = {}   # SIT[(chave, turno)] = situação naquele turno
# Chave do candidato: o SQ_CANDIDATO só é confiável a partir de 2016 (nos arquivos por seção de 2014 e anteriores ele falta ou se repete entre
# municípios/estados, o que trocava ou apagava nomes). Antes disso a chave é (cargo, circunscrição, número): o número é único no cargo e na circunscrição.
USA_SQ = ano >= 2016
def kc(cg, circ, nr, sq):
    return sq if USA_SQ else (cg, str(circ).lstrip('0').upper(), nr)
import re
limpa_fed = lambda x: re.sub(r'\b\d+-', '', str(x or '')).strip()
for cg, uf, ue, sq, nr, nm, sg, fed, st, t, npart, col, comp in cands_rows:
    st = '' if st in (None, '#NULO', '#NE') else st
    vazio = lambda x: not x or str(x).startswith('#') or str(x).strip().upper() in ('PARTIDO ISOLADO', 'FEDERAÇÃO', 'FEDERACAO')
    fed = '' if vazio(fed) and vazio(comp) else limpa_fed(comp if not vazio(comp) else fed)
    col = '' if vazio(col) else col.strip()
    k = kc(cg, 'BR' if cg == 1 else (ue if cg in (11, 13) else uf), nr, sq)
    CAND[k] = {'n': nr, 'nm': nm, 'sg': sg, 'fed': fed, 'col': col, 'st': st, 'np': npart, 'cg': cg, 'ue': ue}
    SIT[(k, t)] = st
TURNO = 1
def sit(sq):   # situação no turno que está sendo gerado (no 1º turno, quem foi ao 2º aparece como "2º TURNO")
    return SIT.get((sq, TURNO), (CAND.get(sq) or {}).get('st', ''))
FED_POR_SG = {}
for c in CAND.values():
    if c['fed'] and c['fed'] != 'PARTIDO ISOLADO': FED_POR_SG[c['sg']] = c['fed']

# ---------- lista de eleições do ano ----------
TEM_LOCAL = os.path.exists(P(f'local_secao_{ano}.parquet'))   # antes de 2010 o TSE não tem o cadastro de locais (sem coordenadas/bairro): o resultado por seção sai igual, sem a camada locais/
UFS = sorted({r[0] for r in con.execute(f"SELECT DISTINCT uf FROM '{P(f'local_secao_{ano}.parquet')}'").fetchall()}) if TEM_LOCAL else sorted({os.path.basename(f)[len(f'secao_{ano}_'):-8] for f in glob.glob(P(f'secao_{ano}_*.parquet'))} - {'BR', 'ZZ'})
if UFS_ARG: UFS = [u for u in UFS if u in UFS_ARG]
arqs_sec = {os.path.basename(f)[len(f'secao_{ano}_'):-8]: f for f in glob.glob(P(f'secao_{ano}_*.parquet'))}
els = []
for (cg, t) in con.execute(f"""SELECT DISTINCT cargo, turno FROM '{P(f'detalhe_secao_{ano}.parquet')}' ORDER BY 1, 2""").fetchall():
    if cg not in NOME: continue
    eid = f'c{cg}t{t}'
    if EL_ARG and eid not in EL_ARG: continue
    els.append({'id': eid, 'c': cg, 't': t, 'nome': NOME[cg], 'ab': AB[cg], 'prop': cg in PROP})
log('eleições', [e['id'] for e in els])

def fonte_secao(uf, cg):
    if cg == 1 and 'BR' in arqs_sec: return arqs_sec['BR']
    return arqs_sec.get(uf)

# ---------- detalhe por seção (aptos, comparecimento) ----------
def detalhe(uf, cg, t):
    rows = con.execute(f"""SELECT cd_municipio_tse, zona, secao, max(aptos), max(comparecimento) FROM '{P(f'detalhe_secao_{ano}.parquet')}'
      WHERE uf = ? AND cargo = ? AND turno = ? AND cd_eleicao = ? GROUP BY ALL""", [uf, cg, t, cod(t, cg)]).fetchall()
    return {(m, z, s): (a or 0, c or 0) for m, z, s, a, c in rows}

def votos(uf, cg, t):
    f = fonte_secao(uf, cg)
    if not f: return []
    return con.execute(f"""SELECT cd_municipio_tse, zona, secao, nr_votavel, sq_candidato, sum(qt_votos) FROM '{f}'
      WHERE uf = ? AND cargo = ? AND turno = ? AND cd_eleicao = ? GROUP BY ALL ORDER BY 1, 2, 3""", [uf, cg, t, cod(t, cg)]).fetchall()

# código da eleição ordinária do turno/cargo; deputados distritais (8) e estaduais seguem o código do governador
def cod(t, cg): return ordin[(t, cg)]
cd5 = lambda m: f'{m:05d}'
def soma(a, b):
    for i in range(len(b)): a[i] += b[i]

# ---------- majoritário ----------
def majoritario(e, br_acc):
    cg, t, eid = e['c'], e['t'], e['id']
    for uf in UFS:
        rows = votos(uf, cg, t)
        if not rows: continue
        det = detalhe(uf, cg, t)
        por_mun = collections.defaultdict(lambda: collections.defaultdict(dict))   # mun -> (z, s) -> nr -> v
        nrs_mun = collections.defaultdict(collections.Counter)
        sq_de = {}
        for m, z, s, nr, sq, v in rows:
            por_mun[m][(z, s)][nr] = por_mun[m][(z, s)].get(nr, 0) + v
            if nr not in (95, 96, 97, 98): nrs_mun[m][nr] += v; sq_de[(m if cg == 11 else 0, nr)] = kc(cg, m if cg == 11 else ('BR' if cg == 1 else uf), nr, sq)
        def lista_cands(cont, chave_m):
            ordem = [nr for nr, _ in cont.most_common()]
            return ordem, [dict(n=nr, **{k: (CAND.get(sq_de.get((chave_m, nr)), {}) or {}).get(k, '') for k in ('nm', 'sg')}, st=sit(sq_de.get((chave_m, nr)))) for nr in ordem]
        if cg != 11:
            tot_nr = collections.Counter()
            for c in nrs_mun.values(): tot_nr.update(c)
            ordem, cands = lista_cands(tot_nr, 0)
            for c in cands:
                if not c['nm']: c['nm'] = next((x['nm'] for x in CAND.values() if x['n'] == c['n'] and x['cg'] == cg and (cg == 1 or x['ue'] == uf)), f"Candidato {c['n']}")
        out_uf = {'mun': {}}; tot_uf = None
        for m, secs in por_mun.items():
            if cg == 11:
                ordem, cands = lista_cands(nrs_mun[m], m)
            S = {}; tm = [0] * (4 + len(ordem))
            for (z, s), vv in secs.items():
                a, c = det.get((m, z, s), (0, 0))
                lin = [a, c, vv.get(95, 0), vv.get(96, 0) + vv.get(97, 0) + vv.get(98, 0)] + [vv.get(nr, 0) for nr in ordem]
                S[f'{z}-{s}'] = lin; soma(tm, lin)
            grava(f'{eid}/{uf.lower()}/{cd5(m)}.json', {'cands': cands, 's': S} if cg == 11 else {'s': S})
            if cg == 11: out_uf['mun'][cd5(m)] = {'cands': cands, 'tot': tm}
            else:
                out_uf['mun'][cd5(m)] = tm
                if tot_uf is None: tot_uf = [0] * len(tm)
                soma(tot_uf, tm)
        if cg != 11:
            out_uf.update(cands=cands, tot=tot_uf)
            if cg == 1:   # presidente: os candidatos são os mesmos em todo o país; o br.json alinha tudo pela ordem nacional
                br_acc[uf.lower()] = (ordem, cands, tot_uf, out_uf)
        grava(f'{eid}/{uf.lower()}.json', out_uf)
        log(eid, uf, len(por_mun), 'municípios')

def fecha_presidente(eid, br_acc):
    tot_nr = collections.Counter(); nome = {}
    for uf, (ordem, cands, tot, _) in br_acc.items():
        for i, nr in enumerate(ordem): tot_nr[nr] += tot[4 + i]; nome[nr] = cands[i]
    ordem_br = [nr for nr, _ in tot_nr.most_common()]; cands_br = [nome[nr] for nr in ordem_br]
    tot_br = [0] * (4 + len(ordem_br)); ufs = {}
    def realinha(lin, ordem):
        pos = {nr: i for i, nr in enumerate(ordem)}
        return lin[:4] + [lin[4 + pos[nr]] if nr in pos else 0 for nr in ordem_br]
    for uf, (ordem, cands, tot, out_uf) in br_acc.items():
        if ordem != ordem_br:   # regrava o estado e os municípios na ordem nacional
            out_uf['mun'] = {cd: realinha(l, ordem) for cd, l in out_uf['mun'].items()}
            out_uf['tot'] = realinha(tot, ordem); out_uf['cands'] = cands_br
            grava(f'{eid}/{uf}.json', out_uf)
            for f in glob.glob(os.path.join(OUT, eid, uf, '*.json')):
                d = json.load(open(f)); d['s'] = {k: realinha(l, ordem) for k, l in d['s'].items()}; grava(os.path.relpath(f, OUT), d)
        ufs[uf] = out_uf['tot']; soma(tot_br, out_uf['tot'])
    grava(f'{eid}/br.json', {'cands': cands_br, 'tot': tot_br, 'uf': ufs})

# ---------- proporcional ----------
def proporcional(e):
    cg, t, eid = e['c'], e['t'], e['id']
    for uf in UFS:
        rows = votos(uf, cg, t)
        if not rows: continue
        det = detalhe(uf, cg, t)
        # candidatos e partidos da circunscrição (UF para deputados; município para vereador)
        def monta(rows_m, chave):
            cv = collections.Counter(); pv = collections.Counter(); leg = collections.Counter()
            for m, z, s, nr, sq, v in rows_m:
                if nr in (95, 96, 97, 98): continue
                if nr < 100: leg[nr] += v; pv[nr] += v
                else: cv[nr] += v; pv[nr // (1000 if nr >= 10000 else 100) if cg != 13 else nr // 1000] += v
            cands_n = [nr for nr, _ in cv.most_common()]
            sq_por_nr = {}
            for m, z, s, nr, sq, v in rows_m:
                if nr >= 100 and (sq or not USA_SQ): sq_por_nr[nr] = kc(cg, chave, nr, sq)
            cands = []
            for nr in cands_n:
                c = CAND.get(sq_por_nr.get(nr), {})
                cands.append({'n': nr, 'nm': c.get('nm') or f'Candidato {nr}', 'sg': c.get('sg', ''), 'st': sit(sq_por_nr.get(nr)), 'v': cv[nr]})
            sg_por_np, grupo = {}, {}
            for c in CAND.values():
                if c['cg'] == cg and str(c['ue']).lstrip('0') == str(chave).lstrip('0'):
                    sg_por_np[c['np']] = c['sg']
                    # federação (2022 em diante) ou coligação proporcional (até 2018): é ela que disputa as cadeiras
                    if c['fed']: grupo[c['np']] = ('F', c['fed'])
                    elif c['col'] and ano <= 2018: grupo.setdefault(c['np'], ('C', c['col']))
            par_n = [p for p, _ in pv.most_common()]
            par = [{'n': p, 'sg': sg_por_np.get(p, str(p)), 'tg': grupo.get(p, ('', ''))[0], 'fed': grupo.get(p, ('', ''))[1], 'v': pv[p], 'leg': leg[p], 'ele': sum(1 for c in cands if c['sg'] == sg_por_np.get(p) and c['st'].startswith('ELEITO'))} for p in par_n]
            return cands, par
        partido_de = lambda nr: nr if nr < 100 else nr // 1000 if cg == 13 else nr // (1000 if nr >= 10000 else 100)
        por_mun = collections.defaultdict(list)
        for r in rows: por_mun[r[0]].append(r)
        if cg != 13:
            cands, par = monta(rows, uf)
            ci = {c['n']: i for i, c in enumerate(cands)}; pi = {p['n']: i for i, p in enumerate(par)}
        out_uf = {'mun': {}}; tot_uf = [0, 0, 0, 0, 0]
        porcand = collections.defaultdict(lambda: {'m': {}, 's': {}})   # deputados: votos de cada candidato por município e seção
        for m, rm in por_mun.items():
            csec = collections.defaultdict(list)                          # vereador: candidato -> [zona, seção, votos, ...]
            if cg == 13:
                cands, par = monta(rm, str(m))
                ci = {c['n']: i for i, c in enumerate(cands)}; pi = {p['n']: i for i, p in enumerate(par)}
            secs = collections.defaultdict(dict)
            for _, z, s, nr, sq, v in rm: secs[(z, s)][nr] = secs[(z, s)].get(nr, 0) + v
            S = {}; tm = [0, 0, 0, 0]; pm = [0] * len(par); cm = collections.Counter()
            for (z, s), vv in secs.items():
                a, c = det.get((m, z, s), (0, 0))
                pvv = [0] * len(par); cl = []
                for nr, v in vv.items():
                    if nr in (95, 96, 97, 98): continue
                    p = pi.get(partido_de(nr))
                    if p is not None: pvv[p] += v
                    if nr >= 100 and nr in ci:
                        k = ci[nr]; cl.append((k, v)); cm[k] += v
                        if cg == 13: csec[k] += [z, s, v]
                        else: pc_ = porcand[k]; pc_['s'].setdefault(cd5(m), []).extend((z, s, v))
                cl.sort(key=lambda x: -x[1])
                lin = [a, c, vv.get(95, 0), vv.get(96, 0) + vv.get(97, 0) + vv.get(98, 0)]
                S[f'{z}-{s}'] = lin + [pvv, [list(x) for x in cl[:TOP]]]
                soma(tm, lin); soma(pm, pvv)
            cvl = [[i, v] for i, v in cm.most_common()]
            arq = {'cv': cvl, 's': S}
            if cg == 13: arq.update(cands=cands, par=par); grava(f'{eid}/{uf.lower()}/{cd5(m)}/cs.json', {str(k): v for k, v in csec.items()})
            else:
                for k, v in cm.items(): porcand[k]['m'][cd5(m)] = v
            grava(f'{eid}/{uf.lower()}/{cd5(m)}.json', arq)
            if cg == 13:
                top = [[cands[i]['nm'], cands[i]['sg'], v, cands[i]['st']] for i, v in cm.most_common(3)]
                out_uf['mun'][cd5(m)] = {'tot': tm, 'top': top, 'ele': sum(1 for c in cands if c['st'].startswith('ELEITO')), 'nc': len(cands)}
            else:
                out_uf['mun'][cd5(m)] = tm + [pm, [[i, v] for i, v in cm.most_common(TOP)]]
            soma(tot_uf, tm + [0])
        if cg != 13:
            out_uf.update(cands=cands, par=par)
            for k, d in porcand.items(): grava(f'{eid}/{uf.lower()}/c/{cands[k]["n"]}.json', d)
        out_uf['tot'] = tot_uf[:4]
        grava(f'{eid}/{uf.lower()}.json', out_uf)
        log(eid, uf, len(por_mun), 'municípios')

# ---------- locais de votação (com polígonos de bairro/distrito do repositório) ----------
def locais():
    try:
        from shapely.geometry import Point, Polygon, MultiPolygon
        from shapely.strtree import STRtree
    except Exception: Point = None
    def carrega_geo(path):
        if not Point or not os.path.exists(path): return None
        d = json.load(open(path)); polys = []; idx = []
        for i, f in enumerate(d.get('f', [])):
            for anel in f.get('p', []):
                try:
                    pts = [(anel[0][k], anel[0][k + 1]) for k in range(0, len(anel[0]) - 1, 2)] if isinstance(anel[0], list) else [(anel[k], anel[k + 1]) for k in range(0, len(anel) - 1, 2)]
                    if len(pts) >= 3: polys.append(Polygon(pts).buffer(0)); idx.append(i)
                except Exception: pass
        return (STRtree(polys), polys, idx) if polys else None
    def acha(g, lon, lat):
        if not g or lat is None or lon is None: return -1
        t, polys, idx = g; pt = Point(lon, lat)
        for j in t.query(pt):
            if polys[j].contains(pt): return idx[j]
        return -1
    rows = con.execute(f"""SELECT uf, cd_municipio_tse, zona, nr_local, any_value(nome_local), any_value(endereco), any_value(bairro),
        any_value(latitude), any_value(longitude), list(DISTINCT secao ORDER BY secao)
      FROM '{P(f'local_secao_{ano}.parquet')}' WHERE turno = 1 GROUP BY ALL ORDER BY 1, 2, 3, 4""").fetchall()
    por = collections.defaultdict(list)
    for r in rows:
        if UFS_ARG and r[0] not in UFS_ARG: continue
        por[(r[0], r[1])].append(r)
    for (uf, m), ls in por.items():
        cd = cd5(m); g = carrega_geo(os.path.join(REPO, 'data/bairros_geo', cd + '.json')); b = carrega_geo(os.path.join(REPO, 'data/regioes', cd + '_bairros.json'))
        L = []
        for _, _, z, nr, nome, end, bai, lat, lon, secs in ls:
            lat = lat if lat not in (None, -1) and abs(lat) > 0.01 else None; lon = lon if lon not in (None, -1) and abs(lon) > 0.01 else None
            L.append([z, nr, nome or '', end or '', bai or '', round(lat, 6) if lat else None, round(lon, 6) if lon else None, secs, acha(g, lon, lat), acha(b, lon, lat)])
        grava(f'locais/{uf.lower()}/{cd}.json', {'l': L})
    log('locais', len(por), 'municípios')

if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    for e in els:
        log('==', e['id'], datetime.datetime.now().isoformat(timespec='seconds')); TURNO = e['t']
        if e['prop']: proporcional(e)
        else:
            acc = {}; majoritario(e, acc)
            if e['c'] == 1 and acc: fecha_presidente(e['id'], acc)
    if not arg('sem-locais') and TEM_LOCAL: locais()
    elif not TEM_LOCAL: log('locais: cadastro de locais ausente neste ano (sem coordenadas), camada não gerada')
    feitos = [e for e in els if os.path.isdir(os.path.join(OUT, e['id']))]
    antigo = json.load(open(os.path.join(OUT, 'idx.json'))) if os.path.exists(os.path.join(OUT, 'idx.json')) else {'el': []}
    ids = {e['id'] for e in feitos}
    todos = [e for e in antigo.get('el', []) if e['id'] not in ids] + feitos
    todos.sort(key=lambda e: (e['c'], e['t']))
    grava('idx.json', {'ano': ano, 'el': todos, 'ufs': [u.lower() for u in UFS], 'gerado': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds')})
    log('fim')
