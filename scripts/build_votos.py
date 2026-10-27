#!/usr/bin/env python3
"""Agrega a votação proporcional (dep. federal, estadual e distrital) do TSE por UF.
Entrada: votacao_candidato_munzona_<ano>.zip e votacao_partido_munzona_<ano>.zip. Saída: <saida>/<ano>/<UF>.json
Uso: build_votos.py <ano> <dir_zips> <saida>"""
import sys, os, io, csv, json, zipfile, collections, datetime
ano, zdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
CARGOS = {'6', '7', '8'}
NUL = {'', '#NULO', '#NE', '#NULO#', '-1', '-3', '-4'}
def v(x):
    x = (x or '').strip()
    return None if x in NUL else x
def n(x):
    try: return int(x)
    except ValueError: return 0
def csvs(zpath):
    zf = zipfile.ZipFile(zpath)
    for i in zf.infolist():
        nm = i.filename
        if not nm.lower().endswith('.csv'): continue
        suf = nm.upper().rsplit('_', 1)[-1][:-4]
        if suf in ('BRASIL', 'BR'): continue          # consolidados: evita contar duas vezes
        yield suf, zf, nm
cand = collections.defaultdict(dict); part = collections.defaultdict(dict)
for uf, zf, nm in csvs(os.path.join(zdir, f'votacao_candidato_munzona_{ano}.zip')):
    with zf.open(nm) as f:
        r = csv.reader(io.TextIOWrapper(f, encoding='latin-1', newline=''), delimiter=';')
        h = next(r); I = {c: i for i, c in enumerate(h)}
        ic, isq = I['CD_CARGO'], I['SQ_CANDIDATO']
        for row in r:
            if row[ic] not in CARGOS: continue
            if row[I['NR_TURNO']] != '1': continue
            k = (int(row[ic]), int(row[isq])); d = cand[uf].get(k)
            if d is None:
                d = cand[uf][k] = {'nr': int(row[I['NR_CANDIDATO']]), 'urna': v(row[I['NM_URNA_CANDIDATO']]), 'nome': v(row[I['NM_CANDIDATO']]),
                    'sigla': v(row[I['SG_PARTIDO']]), 'nr_partido': n(row[I['NR_PARTIDO']]), 'fed': v(row[I['SG_FEDERACAO']]),
                    'tp': v(row[I['TP_AGREMIACAO']]), 'sit': v(row[I['DS_SIT_TOT_TURNO']]), 'julg': v(row[I['DS_SITUACAO_JULGAMENTO']]),
                    'validos': 0, 'total': 0, 'dest': set(), 'ue': row[I['SG_UE']]}
            d['validos'] += n(row[I['QT_VOTOS_NOMINAIS_VALIDOS']]); d['total'] += n(row[I['QT_VOTOS_NOMINAIS']])
            d['dest'].add(row[I['NM_TIPO_DESTINACAO_VOTOS']])
    print('cand', uf, len(cand[uf]), flush=True)
for uf, zf, nm in csvs(os.path.join(zdir, f'votacao_partido_munzona_{ano}.zip')):
    with zf.open(nm) as f:
        r = csv.reader(io.TextIOWrapper(f, encoding='latin-1', newline=''), delimiter=';')
        h = next(r); I = {c: i for i, c in enumerate(h)}
        for row in r:
            if row[I['CD_CARGO']] not in CARGOS or row[I['NR_TURNO']] != '1': continue
            k = (int(row[I['CD_CARGO']]), int(row[I['NR_PARTIDO']])); d = part[uf].get(k)
            if d is None:
                d = part[uf][k] = {'sigla': v(row[I['SG_PARTIDO']]), 'nr_fed': n(row[I['NR_FEDERACAO']]), 'fed': v(row[I['SG_FEDERACAO']]),
                    'tp': v(row[I['TP_AGREMIACAO']]), 'leg': 0, 'conv': 0, 'totleg': 0, 'nom': 0, 'leg_sj': 0, 'nom_sj': 0, 'leg_an': 0, 'nom_an': 0}
            d['leg'] += n(row[I['QT_VOTOS_LEGENDA_VALIDOS']]); d['conv'] += n(row[I['QT_VOTOS_NOM_CONVR_LEG_VALIDOS']])
            d['totleg'] += n(row[I['QT_TOTAL_VOTOS_LEG_VALIDOS']]); d['nom'] += n(row[I['QT_VOTOS_NOMINAIS_VALIDOS']])
            d['leg_sj'] += n(row[I['QT_VOTOS_LEGENDA_ANUL_SUBJUD']]); d['nom_sj'] += n(row[I['QT_VOTOS_NOMINAIS_ANUL_SUBJUD']])
            d['leg_an'] += n(row[I['QT_VOTOS_LEGENDA_ANULADOS']]); d['nom_an'] += n(row[I['QT_VOTOS_NOMINAIS_ANULADOS']])
    print('part', uf, len(part[uf]), flush=True)
d = os.path.join(out, ano); os.makedirs(d, exist_ok=True)
CC = ['cargo','sq','nr','urna','nome','sigla','nr_partido','fed','tp','sit','julg','validos','total','dest','ue']
PC = ['cargo','nr_partido','sigla','nr_fed','fed','tp','leg','conv','totleg','nom','leg_sj','nom_sj','leg_an','nom_an']
resumo = []
for uf in sorted(cand):
    cr = [[k[0], k[1]] + [x[c] if c != 'dest' else '|'.join(sorted(x['dest'])) for c in CC[2:]] for k, x in sorted(cand[uf].items())]
    pr = [[k[0], k[1]] + [x[c] for c in PC[2:]] for k, x in sorted(part[uf].items())]
    json.dump({'ano': int(ano), 'uf': uf, 'cand_cols': CC, 'cand': cr, 'part_cols': PC, 'part': pr}, open(os.path.join(d, uf + '.json'), 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
    resumo.append({'uf': uf, 'cand': len(cr), 'part': len(pr)})
json.dump({'ano': int(ano), 'gerado_em': datetime.datetime.now(datetime.timezone.utc).strftime('%Y-%m-%dT%H:%MZ'), 'ufs': resumo,
           'fonte': 'TSE dados abertos: votacao_candidato_munzona + votacao_partido_munzona (1º turno; cargos 6, 7, 8)'}, open(os.path.join(d, 'idx.json'), 'w'), ensure_ascii=False)
print('ok', ano, sum(x['cand'] for x in resumo), 'candidatos;', sum(x['part'] for x in resumo), 'linhas de partido')
