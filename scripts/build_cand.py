#!/usr/bin/env python3
"""Monta data/cand/<ano>/ a partir dos pacotes do TSE (consulta_cand, _complementar, bem_candidato, motivo_cassacao).
Uso: build_cand.py <ano> <dir_zips> <saida> [raiz_repo_para_conferir]
Minimização (LGPD): NÃO grava CPF, e-mail, título de eleitor, nome social nem data de nascimento completa (só ano + idade na posse)."""
import sys, os, io, csv, json, zipfile, collections, datetime, hashlib

ano, zdir, out = sys.argv[1], sys.argv[2], sys.argv[3]
raiz = sys.argv[4] if len(sys.argv) > 4 else None
NUL = {'', '#NULO', '#NULO#', '#NE', 'NÃO DIVULGÁVEL', 'Não divulgável', 'NAO DIVULGAVEL', '-1', '-3', '-4'}

def ler(zip_, sufixo='_BRASIL.CSV'):
    zf = zipfile.ZipFile(zip_)
    nome = next(i.filename for i in zf.infolist() if i.filename.upper().endswith(sufixo))
    with zf.open(nome) as f:
        r = csv.DictReader(io.TextIOWrapper(f, encoding='latin-1', newline=''), delimiter=';')
        for row in r: yield row

def v(x):
    x = (x or '').strip()
    return None if x in NUL else x
def num(x):
    x = v(x)
    if x is None: return None
    try: return float(x.replace('.', '').replace(',', '.')) if ',' in x else float(x)
    except ValueError: return None
def inteiro(x):
    x = v(x)
    try: return int(x) if x is not None else None
    except ValueError: return None

def achar(prefixo):
    for f in os.listdir(zdir):
        if f.startswith(prefixo) and f.endswith('.zip'): return os.path.join(zdir, f)
    raise SystemExit('falta zip ' + prefixo)

# --- complementar: chave (sq, cd_eleicao)
comp = {}
dup_comp = 0
for r in ler(achar(f'consulta_cand_complementar_{ano}')):
    k = (r['SQ_CANDIDATO'], r['CD_ELEICAO'])
    if k in comp: dup_comp += 1
    comp[k] = r

# --- bens: por sq
bens = collections.defaultdict(list)
for r in ler(achar(f'bem_candidato_{ano}')):
    bens[r['SQ_CANDIDATO']].append([inteiro(r['NR_ORDEM_BEM_CANDIDATO']), inteiro(r['CD_TIPO_BEM_CANDIDATO']),
        v(r['DS_TIPO_BEM_CANDIDATO']), v(r['DS_BEM_CANDIDATO']), num(r['VR_BEM_CANDIDATO']), r['SG_UF']])

# --- cassação
cass = [[r['SQ_CANDIDATO'], r['SG_UF'], r['NR_PROCESSO'], v(r['DS_TP_MOTIVO']), v(r['DS_MOTIVO'])]
        for r in ler(achar(f'motivo_cassacao_{ano}'))]

COLS = ['sq','turno','eleicao','uf','ue','nm_ue','cargo','ds_cargo','nr','nome','urna','sigla','nr_partido','federacao','tp_agremiacao',
        'coligacao','composicao','genero','instrucao','estado_civil','cor','ocupacao','nasc_ano','nasc_uf','idade_posse','nacionalidade',
        'quilombola','etnia','resultado','sit_registro','julgamento','na_urna','destino_votos','reeleicao','declara_bens','despesa_max',
        'prest_contas','substituido','sq_substituido','ordem_suplencia','bens_n','bens_total']
por_uf = collections.defaultdict(list)
sem_comp = 0; chaves = collections.Counter()
for r in ler(achar(f'consulta_cand_{ano}')):
    sq = r['SQ_CANDIDATO']; c = comp.get((sq, r['CD_ELEICAO']))
    if c is None: sem_comp += 1; c = {}
    chaves[(sq, r['NR_TURNO'])] += 1
    nasc = v(r['DT_NASCIMENTO']); nasc_ano = int(nasc[-4:]) if nasc else None
    b = bens.get(sq, [])
    por_uf[r['SG_UF']].append([
        int(sq), int(r['NR_TURNO']), int(r['CD_ELEICAO']), r['SG_UF'], r['SG_UE'], v(r['NM_UE']), int(r['CD_CARGO']), v(r['DS_CARGO']),
        int(r['NR_CANDIDATO']), v(r['NM_CANDIDATO']), v(r['NM_URNA_CANDIDATO']), v(r['SG_PARTIDO']), inteiro(r['NR_PARTIDO']),
        v(r['SG_FEDERACAO']) , v(r['TP_AGREMIACAO']), v(r['NM_COLIGACAO']), v(r['DS_COMPOSICAO_COLIGACAO']),
        v(r['DS_GENERO']), v(r['DS_GRAU_INSTRUCAO']), v(r['DS_ESTADO_CIVIL']), v(r['DS_COR_RACA']), v(r['DS_OCUPACAO']),
        nasc_ano, v(r['SG_UF_NASCIMENTO']), inteiro(c.get('NR_IDADE_DATA_POSSE')), v(c.get('DS_NACIONALIDADE')),
        c.get('ST_QUILOMBOLA') or None, v(c.get('DS_ETNIA_INDIGENA')), v(r['DS_SIT_TOT_TURNO']),
        v(c.get('DS_SITUACAO_CANDIDATO_TOT')), v(c.get('DS_SITUACAO_JULGAMENTO')), c.get('ST_CANDIDATO_INSERIDO_URNA') or None,
        v(c.get('NM_TIPO_DESTINACAO_VOTOS')), v(c.get('ST_REELEICAO')), c.get('ST_DECLARAR_BENS') or None, num(c.get('VR_DESPESA_MAX_CAMPANHA')),
        c.get('ST_PREST_CONTAS') or None, c.get('ST_SUBSTITUIDO') or None, inteiro(c.get('SQ_SUBSTITUIDO')), inteiro(c.get('SQ_ORDEM_SUPLENCIA')),
        len(b), round(sum(x[4] or 0 for x in b), 2) if b else None])
dups = sum(1 for k, q in chaves.items() if q > 1)

d = os.path.join(out, ano); os.makedirs(os.path.join(d, 'bens'), exist_ok=True)
def grava(path, obj):
    with open(path, 'w', encoding='utf-8') as f: json.dump(obj, f, ensure_ascii=False, separators=(',', ':'))
resumo = []
for uf, rows in sorted(por_uf.items()):
    rows.sort(key=lambda x: (x[6], x[8], x[1], x[0]))
    grava(os.path.join(d, f'{uf}.json'), {'cols': COLS, 'rows': rows})
    bl = [[int(sq)] + b[:5] for sq, lst in bens.items() for b in lst if b[5] == uf]
    grava(os.path.join(d, 'bens', f'{uf}.json'), {'cols': ['sq','ordem','cd_tipo','tipo','descricao','valor'], 'rows': bl})
    resumo.append({'uf': uf, 'n': len(rows), 'bens': len(bl)})
grava(os.path.join(d, 'cassacao.json'), {'cols': ['sq','uf','processo','tipo_motivo','motivo'], 'rows': [[int(a), b, c, e, f] for a, b, c, e, f in cass]})
tot = sum(x['n'] for x in resumo)
idx = {'ano': int(ano), 'fonte': 'TSE dados abertos: consulta_cand, consulta_cand_complementar, bem_candidato, motivo_cassacao',
       'gerado_em': datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%MZ'), 'cols': COLS, 'ufs': resumo, 'total': tot,
       'cargos': {'1':'Presidente','2':'Vice-presidente','3':'Governador','4':'Vice-governador','5':'Senador','6':'Deputado federal','7':'Deputado estadual','8':'Deputado distrital','9':'1º suplente','10':'2º suplente'}}
grava(os.path.join(d, 'idx.json'), idx)

print(f'candidaturas gravadas: {tot} | sem linha no complementar: {sem_comp} | chaves (sq,turno) duplicadas: {dups} | duplicatas no complementar: {dup_comp}')
print(f'bens: {sum(len(x) for x in bens.values())} itens, {len(bens)} candidatos | cassação: {len(cass)} linhas')
C = collections.Counter
rows = [r for rs in por_uf.values() for r in rs]
i = {c: n for n, c in enumerate(COLS)}
t1 = [r for r in rows if r[i['turno']] == 1]
print('\nTURNO 1 por cargo:', dict(sorted(C(r[i['ds_cargo']] for r in t1).items())))
print('Situação do registro (turno 1):', dict(C(r[i['sit_registro']] for r in t1).most_common()))
print('Na urna:', dict(C(r[i['na_urna']] for r in t1)))
print('Destino dos votos:', dict(C(r[i['destino_votos']] for r in t1).most_common()))
print('Resultado:', dict(C(r[i['resultado']] for r in t1).most_common()))
princ = [r for r in t1 if r[i['cargo']] in (1,3,5,6,7,8)]
print('\nCandidaturas a cargo titular (pres/gov/sen/dep):', len(princ), '| inseridas na urna:', sum(1 for r in princ if r[i['na_urna']]=='SIM'))
print('Titulares por situação do registro:', dict(C(r[i['sit_registro']] for r in princ).most_common()))
print('Titulares com sit_registro INDEFERIDO*/RENÚNCIA/etc e na urna=NÃO:', sum(1 for r in princ if r[i['na_urna']]=='NÃO'))
for nome, ix in (('Gênero','genero'),('Cor/raça','cor')):
    print(nome, '(titulares):', dict(C(r[i[ix]] for r in princ).most_common()))

# --- conferência com hist/uf/<UF>/idx.json
if raiz:
    ok = so_cand = so_hist = 0; ex_cand = collections.Counter(); ex_hist = []
    divn = 0
    for uf in sorted(por_uf):
        p = os.path.join(raiz, 'data/hist/uf', uf, 'idx.json')
        if uf == 'BR' or not os.path.exists(p): continue
        h = json.load(open(p, encoding='utf-8'))['cands']
        H = {(a[0], a[1]): a for a in h}   # (cargo, nr)
        Ck = {}
        for r in por_uf[uf]:
            if r[i['turno']] != 1 or r[i['cargo']] not in (1,3,5,6,7,8): continue
            Ck[(r[i['cargo']], r[i['nr']])] = r
        for k, r in Ck.items():
            if k in H:
                ok += 1
                if (H[k][3] or '').strip().upper() != (r[i['nome']] or '').strip().upper(): divn += 1
            else: so_cand += 1; ex_cand[(r[i['sit_registro']], r[i['na_urna']], r[i['destino_votos']])] += 1
        for k, a in H.items():
            if k not in Ck: so_hist += 1; ex_hist.append((uf, a[0], a[1], a[2], a[5], a[7]))
    print(f'\nCONFERÊNCIA com data/hist (chave UF+cargo+número, exceto presidente por UF):')
    print(f'  nos dois: {ok} (nome completo divergente em {divn}) | só no cadastro: {so_cand} | só no hist (com votos): {so_hist}')
    print('  só no cadastro, por (situação, na urna, destino dos votos):', dict(ex_cand.most_common(12)))
    print('  só no hist, amostra:', ex_hist[:12])
