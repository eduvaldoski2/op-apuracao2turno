#!/usr/bin/env python3
"""Lake das ELEIÇÕES SUPLEMENTARES (TSE: Boletim de Urna na Web) -> Parquet + manifesto + conferência.
Uso: build_supl.py <ano-do-conjunto: 2024|2022|2020> <saida>
Conjuntos do CKAN: resultados-eleicoes-suplementares-2024 | -2022 | resultados-2020-suplementares.
Cada conjunto reúne várias eleições suplementares (datas e municípios diferentes); NÃO mistura com as ordinárias.
Saídas:
  secao_sup_<ano>.parquet          votos por seção e votável (nominal, branco, nulo, legenda) + aptos/comparecimento/abstenção
  detalhe_secao_sup_<ano>.parquet  uma linha por seção e cargo (aptos, comparecimento, abstenções, tipo de urna)
  lista_sup_<ano>.parquet          listagem oficial das suplementares do conjunto
  manifesto.json, conferencia.md
Nada é inventado: colunas ausentes viram NULL e entram no manifesto. Sem dados pessoais."""
import sys, os, subprocess, json, hashlib, datetime, glob
import duckdb

ano = sys.argv[1]; out = sys.argv[2]
B = f'https://cdn.tse.jus.br/estatistica/sead/eleicoes/eleicoes{ano}'
W = os.path.join(out, '_work'); os.makedirs(W, exist_ok=True)
manifest = {'ano_conjunto': ano, 'gerado_em': datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z', 'fonte': B, 'arquivos': [], 'avisos': []}
con = duckdb.connect(); con.execute("SET memory_limit='5GB'; SET threads=4")

def baixar(rel):
    z = os.path.join(W, os.path.basename(rel)); h = z + '.hdr'
    r = subprocess.run(['curl', '-sS', '-f', '-L', '--http1.1', '--retry', '5', '--retry-all-errors', '-D', h, '-o', z, f'{B}/{rel}'])
    if r.returncode: return None, ''
    lm = ''
    for l in open(h, errors='ignore'):
        if l.lower().startswith('last-modified'): lm = l.split(':', 1)[1].strip()
    return z, lm

def utf8(p):
    """Devolve o caminho de uma cópia em UTF-8 (detecta a codificação; nunca assume)."""
    raw = open(p, 'rb').read()
    try: raw.decode('utf-8'); enc = 'utf-8'
    except UnicodeDecodeError: enc = 'latin-1'
    q = p + '.utf8'; open(q, 'w', encoding='utf-8', newline='').write(raw.decode(enc)); return q, enc

def rcsv(p):
    return f"read_csv('{p}', delim=';', quote='\"', header=true, all_varchar=true, null_padding=true, ignore_errors=false)"

def cols(p): return {r[0] for r in con.execute(f"DESCRIBE SELECT * FROM {rcsv(p)}").fetchall()}

# ---- listagem
z, lm_l = baixar(f'listaelesuplem/lista_eleicoes_suplementares_{ano}.zip')
subprocess.run(['unzip', '-o', '-j', '-q', z, '*.csv', '-d', os.path.join(W, 'lista')], check=True)
lp, _ = utf8(glob.glob(os.path.join(W, 'lista', '*.csv'))[0])
DT = lambda c: f"COALESCE(TRY_CAST(TRY_STRPTIME({c}, '%Y-%m-%d %H:%M:%S') AS DATE), TRY_CAST(TRY_STRPTIME({c}, '%d/%m/%Y %H:%M:%S') AS DATE), TRY_CAST(TRY_STRPTIME({c}, '%d/%m/%Y') AS DATE))"
con.execute(f"""CREATE TABLE lista AS SELECT TRY_CAST(CD_ELEICAO AS INTEGER) cd_eleicao, DS_ELEICAO ds_eleicao, TRY_CAST(CD_PLEITO AS INTEGER) cd_pleito,
  {DT('DT_ELEICAO')} dt_eleicao, TRY_CAST(CD_CARGO AS TINYINT) cargo, DS_CARGO ds_cargo, SG_UF uf, TRY_CAST(nullif(CD_MUNICIPIO,'') AS INTEGER) cd_municipio_tse, nullif(NM_MUNICIPIO,'') municipio
  FROM {rcsv(lp)}""")

# ---- BU na Web
z, lm_b = baixar(f'buweb/buweb_ele_suplementares_{ano}.zip')
subprocess.run(['unzip', '-o', '-q', z, '-d', os.path.join(W, 'bu')], check=True)
inner = sorted(glob.glob(os.path.join(W, 'bu', '**', '*.zip'), recursive=True))
print('zips internos:', len(inner), flush=True)
con.execute("""CREATE TABLE sec (ano SMALLINT, turno TINYINT, cd_eleicao INTEGER, ds_eleicao VARCHAR, cd_pleito INTEGER, dt_pleito DATE, uf VARCHAR, cd_municipio_tse INTEGER, municipio VARCHAR,
  zona INTEGER, secao INTEGER, nr_local_votacao INTEGER, cargo TINYINT, ds_cargo VARCHAR, tipo_votavel TINYINT, ds_tipo_votavel VARCHAR, nr_partido INTEGER, sg_partido VARCHAR,
  nr_votavel INTEGER, nm_votavel VARCHAR, qt_votos INTEGER, qt_aptos INTEGER, qt_comparecimento INTEGER, qt_abstencoes INTEGER, cd_tipo_urna TINYINT, ds_tipo_urna VARCHAR, arquivo VARCHAR)""")
for zi in inner:
    d = os.path.join(W, 'c', os.path.basename(zi)[:-4]); os.makedirs(d, exist_ok=True)
    subprocess.run(['unzip', '-o', '-j', '-q', zi, '*.csv', '-d', d], check=True)
    for cp in sorted(glob.glob(os.path.join(d, '*.csv'))):
        p, enc = utf8(cp); c = cols(p)
        g = lambda n: f'"{n}"' if n in c else 'NULL'
        if not all(n in c for n in ['CD_ELEICAO', 'NR_SECAO', 'QT_VOTOS', 'NR_VOTAVEL']):
            manifest['avisos'].append(f'{os.path.basename(cp)}: colunas essenciais ausentes ({sorted(c)[:8]}...)'); continue
        ano_c = 'ANO_ELEICAO' if 'ANO_ELEICAO' in c else 'AA_ELEICAO'
        con.execute(f"""INSERT INTO sec SELECT TRY_CAST({g(ano_c)} AS SMALLINT), TRY_CAST({g('NR_TURNO')} AS TINYINT), TRY_CAST({g('CD_ELEICAO')} AS INTEGER), {g('DS_ELEICAO')}, TRY_CAST({g('CD_PLEITO')} AS INTEGER),
          {DT(g('DT_PLEITO'))}, {g('SG_UF')}, TRY_CAST({g('CD_MUNICIPIO')} AS INTEGER), {g('NM_MUNICIPIO')}, TRY_CAST({g('NR_ZONA')} AS INTEGER), TRY_CAST({g('NR_SECAO')} AS INTEGER),
          TRY_CAST({g('NR_LOCAL_VOTACAO')} AS INTEGER), TRY_CAST({g('CD_CARGO_PERGUNTA')} AS TINYINT), {g('DS_CARGO_PERGUNTA')}, TRY_CAST({g('CD_TIPO_VOTAVEL')} AS TINYINT), {g('DS_TIPO_VOTAVEL')},
          nullif(TRY_CAST({g('NR_PARTIDO')} AS INTEGER), -1), nullif({g('SG_PARTIDO')}, '#NULO#'), TRY_CAST({g('NR_VOTAVEL')} AS INTEGER), {g('NM_VOTAVEL')}, TRY_CAST({g('QT_VOTOS')} AS INTEGER),
          TRY_CAST({g('QT_APTOS')} AS INTEGER), TRY_CAST({g('QT_COMPARECIMENTO')} AS INTEGER), TRY_CAST({g('QT_ABSTENCOES')} AS INTEGER), TRY_CAST({g('CD_TIPO_URNA')} AS TINYINT), {g('DS_TIPO_URNA')}, '{os.path.basename(cp)}'
          FROM {rcsv(p)}""")
        print('OK', os.path.basename(cp), enc, con.execute('SELECT count(*) FROM sec').fetchone()[0], flush=True)
        os.remove(p)

def gravar(sql, nome, fonte, lm):
    dest = os.path.join(out, nome)
    con.execute(f"COPY ({sql}) TO '{dest}' (FORMAT PARQUET, COMPRESSION ZSTD)")
    n = con.execute(f"SELECT count(*) FROM read_parquet('{dest}')").fetchone()[0]
    manifest['arquivos'].append({'arquivo': nome, 'linhas': n, 'bytes': os.path.getsize(dest), 'sha256': hashlib.sha256(open(dest, 'rb').read()).hexdigest(), 'fonte': fonte, 'last_modified_fonte': lm})
    print('OK', nome, n, flush=True)
gravar("SELECT * FROM sec ORDER BY dt_pleito, cd_eleicao, turno, cargo, zona, secao, tipo_votavel, nr_votavel", f'secao_sup_{ano}.parquet', f'buweb/buweb_ele_suplementares_{ano}.zip', lm_b)
gravar("SELECT DISTINCT cd_eleicao, turno, cargo, uf, cd_municipio_tse, zona, secao, nr_local_votacao, qt_aptos, qt_comparecimento, qt_abstencoes, cd_tipo_urna, ds_tipo_urna FROM sec ORDER BY 1,2,3,6,7", f'detalhe_secao_sup_{ano}.parquet', f'buweb/buweb_ele_suplementares_{ano}.zip', lm_b)
gravar("SELECT * FROM lista ORDER BY dt_eleicao, cd_eleicao", f'lista_sup_{ano}.parquet', f'listaelesuplem/lista_eleicoes_suplementares_{ano}.zip', lm_l)

# ---- conferência
L = [f'# Conferência das eleições suplementares (conjunto {ano})', f'Gerado em {manifest["gerado_em"]}', '', '## Arquivos', '| arquivo | linhas | MB | Last-Modified |', '|---|---:|---:|---|']
for a in manifest['arquivos']: L.append(f"| {a['arquivo']} | {a['linhas']:,} | {a['bytes']/1e6:.1f} | {a['last_modified_fonte']} |")
q = lambda s: con.execute(s).fetchall()
n_lista = q('SELECT count(DISTINCT cd_eleicao) FROM lista')[0][0]; n_bu = q('SELECT count(DISTINCT cd_eleicao) FROM sec')[0][0]
L += ['', '## 1) Cobertura', f'Eleições na listagem oficial: {n_lista}; com votos por seção no BU: {n_bu}.']
faltam = q('SELECT cd_eleicao, ds_eleicao, dt_eleicao, uf, municipio, cargo FROM lista WHERE cd_eleicao NOT IN (SELECT DISTINCT cd_eleicao FROM sec) ORDER BY dt_eleicao')
sobram = q('SELECT DISTINCT cd_eleicao, ds_eleicao FROM sec WHERE cd_eleicao NOT IN (SELECT cd_eleicao FROM lista)')
L.append(f'Na listagem e SEM votos por seção ({len(faltam)}): ' + '; '.join(f'{r[0]} {r[1]} ({r[2]})' for r in faltam[:60]))
L.append(f'No BU e fora da listagem ({len(sobram)}): ' + '; '.join(f'{r[0]} {r[1]}' for r in sobram[:60]))
L += ['', '## 2) Soma dos votos por seção x comparecimento (por eleição, turno e cargo)',
      'Diferença = votos − comparecimento. Em eleição majoritária de um cargo, deve ser 0; diferenças ficam registradas, nunca corrigidas.',
      '| cd_eleicao | município/UF | data | turno | cargo | seções | votos | comparecimento | diferença |', '|---:|---|---|---:|---:|---:|---:|---:|---:|']
rows = q("""WITH s AS (SELECT cd_eleicao, turno, cargo, zona, secao, any_value(uf) uf, any_value(municipio) mun, any_value(dt_pleito) dt, sum(qt_votos) v, max(qt_comparecimento) c FROM sec GROUP BY ALL)
  SELECT cd_eleicao, any_value(mun)||'/'||any_value(uf), any_value(dt), turno, cargo, count(*), sum(v), sum(c), sum(v)-sum(c) FROM s GROUP BY cd_eleicao, turno, cargo ORDER BY any_value(dt) DESC, cd_eleicao, turno""")
for r in rows: L.append('| ' + ' | '.join(str(x) for x in r) + ' |')
nd = sum(1 for r in rows if r[8] != 0)
L += ['', f'Combinações com diferença ≠ 0: {nd} de {len(rows)}.']
dup = q("SELECT count(*) FROM (SELECT cd_eleicao, turno, cargo, zona, secao, tipo_votavel, nr_votavel, count(*) n FROM sec GROUP BY ALL HAVING n > 1)")[0][0]
L += ['', '## 3) Chaves duplicadas (eleição, turno, cargo, zona, seção, votável)', f'{dup} chaves com mais de uma linha (se > 0, houve mais de um BU para a mesma seção; não foi feita deduplicação).']
L += ['', '## 4) Tipos de urna', '| tipo | linhas de seção |', '|---|---:|'] + [f'| {r[0]} | {r[1]:,} |' for r in q("SELECT coalesce(ds_tipo_urna,'?'), count(*) FROM (SELECT DISTINCT cd_eleicao,turno,cargo,zona,secao,ds_tipo_urna FROM sec) GROUP BY 1 ORDER BY 2 DESC")]
L += ['', '## 5) Campos ausentes', f"nr_local_votacao nulo: {q('SELECT count(*) FROM sec WHERE nr_local_votacao IS NULL')[0][0]:,} linhas; dt_pleito nulo: {q('SELECT count(*) FROM sec WHERE dt_pleito IS NULL')[0][0]:,}.", '']
if manifest['avisos']: L += ['## Avisos'] + [f'- {a}' for a in manifest['avisos']]
open(os.path.join(out, 'conferencia.md'), 'w', encoding='utf-8').write('\n'.join(L))
json.dump(manifest, open(os.path.join(out, 'manifesto.json'), 'w'), ensure_ascii=False, indent=1)
print('FIM', flush=True)
