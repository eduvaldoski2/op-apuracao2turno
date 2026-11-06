#!/usr/bin/env python3
"""Lake de dados eleitorais por seção (TSE dados abertos) -> Parquet (zstd) + manifesto + conferência.
Uso: build_lake.py <ano> <saida> [--ufs AC,AL,...] [--pular-download]
Saídas em <saida>/:
  secao_<ano>_<UF>.parquet   votos por seção (todos os cargos estaduais, 1º e 2º turno) ; secao_<ano>_BR.parquet = presidente
  local_secao_<ano>.parquet  seção -> local de votação, bairro, CEP, coordenadas, eleitores
  detalhe_secao_<ano>.parquet aptos, comparecimento, abstenções, brancos, nulos, legenda por seção e cargo
  candidato_<ano>.parquet    candidaturas (SEM CPF, e-mail, título, nome social, nascimento completo)
  zona_<ano>.parquet         votos nominais por candidato, município e zona (TSE votacao_candidato_munzona)
  manifesto.json, conferencia.md
Esquema comum: ver docs do plano (nomes de coluna em minúsculas)."""
import sys, os, subprocess, json, hashlib, datetime, re
import duckdb

ano = sys.argv[1]; out = sys.argv[2]
ufs_arg = next((a.split('=', 1)[1] for a in sys.argv if a.startswith('--ufs=')), '')
UFS = [u for u in (ufs_arg.split(',') if ufs_arg else
       'AC AL AM AP BA CE DF ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO ZZ'.split()) if u]
B = 'https://cdn.tse.jus.br/estatistica/sead/odsele'
W = os.path.join(out, '_work'); os.makedirs(W, exist_ok=True)
manifest = {'ano': ano, 'gerado_em': datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z', 'fonte': B, 'arquivos': []}
con = duckdb.connect(); con.execute("SET memory_limit='5GB'; SET threads=4; SET preserve_insertion_order=false")

def baixar(rel):
    if isinstance(rel, (list, tuple)):
        for r in rel:
            z, lm = baixar(r)
            if z: return z, lm
        return None, None
    z = os.path.join(W, os.path.basename(rel)); h = z + '.hdr'
    r = subprocess.run(['curl', '-sS', '-f', '-L', '--http1.1', '--retry', '5', '--retry-all-errors', '-D', h, '-o', z, f'{B}/{rel}'])
    if r.returncode: return None, None
    lm = ''
    for l in open(h, errors='ignore'):
        if l.lower().startswith('last-modified'): lm = l.split(':', 1)[1].strip()
    return z, lm

def extrair(z, sufixo):
    nomes = subprocess.run(['unzip', '-Z1', z], capture_output=True, text=True).stdout.split()
    m = [n for n in nomes if n.upper().endswith(sufixo.upper())]
    if not m and sufixo.upper() == '_BRASIL.CSV':
        m = [n for n in nomes if n.lower().endswith('.csv') and not re.search(r'_[A-Z]{2}\.csv$', n, re.I)]
    if not m:
        print('SEM MEMBRO', sufixo, 'em', os.path.basename(z), '->', nomes[:6], flush=True)
        m = [n for n in nomes if re.search(r'\.(csv|txt)$', n, re.I) and sufixo.upper().replace('.CSV', '') in n.upper()]
    if not m: return None
    subprocess.run(['unzip', '-o', '-j', '-q', z, m[0], '-d', W], check=True)
    f = os.path.join(W, os.path.basename(m[0])); u = f + '.utf8'
    subprocess.run(f"iconv -f latin1 -t utf8 '{f}' > '{u}'", shell=True, check=True); os.remove(f); return u

import re as _re
_CONHECIDAS = sorted(set(_re.findall(r'\b(?:ANO|NR|CD|SG|NM|DS|QT|ST|DT|AA|SQ)_[A-Z0-9_]+\b', open(__file__, encoding='utf-8').read())))
AUSENTES = {}   # arquivo -> colunas esperadas que o TSE não trazia naquele ano (viram NULL; nunca inventadas)

def csv(p):
    """Lê o CSV do TSE; coluna esperada que não existe naquele ano entra como NULL e é registrada no manifesto."""
    base = f"read_csv('{p}', delim=';', quote='\"', header=true, all_varchar=true, ignore_errors=false)"
    cols = {r[0] for r in con.execute(f"DESCRIBE SELECT * FROM {base}").fetchall()}
    falt = [c for c in _CONHECIDAS if c not in cols]
    AUSENTES[os.path.basename(p)] = falt
    if not falt: return base
    return f"(SELECT *, {', '.join(f'NULL::VARCHAR AS {c}' for c in falt)} FROM {base})"

def gravar(sql, nome, fonte, lm):
    dest = os.path.join(out, nome)
    con.execute(f"COPY ({sql}) TO '{dest}' (FORMAT PARQUET, COMPRESSION ZSTD, ROW_GROUP_SIZE 500000)")
    n = con.execute(f"SELECT count(*) FROM read_parquet('{dest}')").fetchone()[0]
    sha = hashlib.sha256(open(dest, 'rb').read()).hexdigest() if os.path.getsize(dest) < 2e9 else ''
    manifest['arquivos'].append({'colunas_origem_ausentes': (list(AUSENTES.values())[-1] if AUSENTES else []), 'arquivo': nome, 'linhas': n, 'bytes': os.path.getsize(dest), 'sha256': sha, 'fonte': fonte, 'last_modified_fonte': lm})
    print('OK', nome, n, os.path.getsize(dest), flush=True)

I = lambda c: f"TRY_CAST({c} AS INTEGER)"
# ---------------- votação por seção
SEC = lambda p: f"""SELECT TRY_CAST(ANO_ELEICAO AS SMALLINT) ano, TRY_CAST(NR_TURNO AS TINYINT) turno, TRY_CAST(CD_ELEICAO AS INTEGER) cd_eleicao,
  TRY_CAST(CD_CARGO AS TINYINT) cargo, SG_UF uf, {I('CD_MUNICIPIO')} cd_municipio_tse, {I('NR_ZONA')} zona, {I('NR_SECAO')} secao,
  {I('NR_LOCAL_VOTACAO')} nr_local_votacao, {I('NR_VOTAVEL')} nr_votavel, NM_VOTAVEL nm_votavel, {I('QT_VOTOS')} qt_votos,
  TRY_CAST(SQ_CANDIDATO AS BIGINT) sq_candidato FROM {csv(p)}
  ORDER BY turno, cargo, cd_municipio_tse, zona, secao, nr_votavel"""
for uf in ['BR'] + UFS:
    z, lm = baixar(f'votacao_secao/votacao_secao_{ano}_{uf}.zip')
    if not z: print('SEM ARQUIVO', uf, flush=True); manifest.setdefault('ausentes', []).append(f'votacao_secao_{ano}_{uf}'); continue
    p = extrair(z, f'_{uf}.csv'); os.remove(z)
    if not p: print('SEM CSV NO ZIP', uf, flush=True); manifest.setdefault('ausentes', []).append(f'votacao_secao_{ano}_{uf}(zip sem csv)'); continue
    gravar(SEC(p), f'secao_{ano}_{uf}.parquet', f'votacao_secao/votacao_secao_{ano}_{uf}.zip', lm); os.remove(p)

# ---------------- tabelas auxiliares (tolerantes a ausência de arquivo ou mudança de colunas)
dec = lambda c: f"TRY_CAST(replace({c}, ',', '.') AS DOUBLE)"
nul = lambda c: f"nullif(nullif(nullif({c}, '#NULO'), '#NE'), 'NÃO DIVULGÁVEL')"
def bloco(nome, rels, sqlf, fonte):
    try:
        z, lm = baixar(rels)
        if not z: raise RuntimeError('arquivo inexistente no TSE')
        p = extrair(z, '_BRASIL.csv'); os.remove(z)
        if not p: raise RuntimeError('membro _BRASIL.csv ausente')
        gravar(sqlf(p), nome, fonte, lm); os.remove(p)
    except Exception as e:
        print('FALHA', nome, str(e)[:300], flush=True); manifest.setdefault('falhas', []).append({'arquivo': nome, 'erro': str(e)[:300]})
bloco(f'local_secao_{ano}.parquet', [f'eleitorado_locais_votacao/eleitorado_local_votacao_{ano}.zip', f'eleitorado_local_votacao/eleitorado_local_votacao_{ano}.zip'],
  lambda p: f"""SELECT TRY_CAST(AA_ELEICAO AS SMALLINT) ano, TRY_CAST(NR_TURNO AS TINYINT) turno, SG_UF uf, {I('CD_MUNICIPIO')} cd_municipio_tse, NM_MUNICIPIO municipio,
  {I('NR_ZONA')} zona, {I('NR_SECAO')} secao, {I('CD_TIPO_SECAO_AGREGADA')} cd_tipo_secao_agregada, {I('NR_SECAO_PRINCIPAL')} secao_principal,
  {I('NR_LOCAL_VOTACAO')} nr_local, NM_LOCAL_VOTACAO nome_local, DS_TIPO_LOCAL tipo_local, DS_ENDERECO endereco, NM_BAIRRO bairro, NR_CEP cep,
  {dec('NR_LATITUDE')} latitude, {dec('NR_LONGITUDE')} longitude, DS_SITU_SECAO situacao_secao, DS_SITU_SECAO_ACESSIBILIDADE acessibilidade,
  {I('QT_ELEITOR_SECAO')} eleitores, {I('QT_ELEITOR_ELEICAO_FEDERAL')} eleitores_federal, {I('QT_ELEITOR_ELEICAO_ESTADUAL')} eleitores_estadual
  FROM {csv(p)} ORDER BY turno, uf, cd_municipio_tse, zona, secao""", 'eleitorado_local_votacao')
bloco(f'detalhe_secao_{ano}.parquet', f'detalhe_votacao_secao/detalhe_votacao_secao_{ano}.zip',
  lambda p: f"""SELECT TRY_CAST(ANO_ELEICAO AS SMALLINT) ano, TRY_CAST(NR_TURNO AS TINYINT) turno, TRY_CAST(CD_ELEICAO AS INTEGER) cd_eleicao, TRY_CAST(CD_CARGO AS TINYINT) cargo,
  SG_UF uf, {I('CD_MUNICIPIO')} cd_municipio_tse, {I('NR_ZONA')} zona, {I('NR_SECAO')} secao, {I('NR_LOCAL_VOTACAO')} nr_local_votacao,
  {I('QT_APTOS')} aptos, {I('QT_COMPARECIMENTO')} comparecimento, {I('QT_ABSTENCOES')} abstencoes, {I('QT_VOTOS_NOMINAIS')} votos_nominais,
  {I('QT_VOTOS_BRANCOS')} brancos, {I('QT_VOTOS_NULOS')} nulos, {I('QT_VOTOS_LEGENDA')} legenda, {I('QT_VOTOS_ANULADOS_APU_SEP')} anulados_apu_sep,
  DS_ORIGEM_VOTO origem_voto, ST_SECAO_INSTALADA secao_instalada, ST_SECAO_ANULADA secao_anulada
  FROM {csv(p)} ORDER BY turno, cargo, uf, cd_municipio_tse, zona, secao""", 'detalhe_votacao_secao')
bloco(f'candidato_{ano}.parquet', f'consulta_cand/consulta_cand_{ano}.zip',
  lambda p: f"""SELECT TRY_CAST(ANO_ELEICAO AS SMALLINT) ano, TRY_CAST(NR_TURNO AS TINYINT) turno, TRY_CAST(CD_ELEICAO AS INTEGER) cd_eleicao, SG_UF uf, SG_UE ue, NM_UE nm_ue,
  TRY_CAST(CD_CARGO AS TINYINT) cargo, DS_CARGO ds_cargo, TRY_CAST(SQ_CANDIDATO AS BIGINT) sq_candidato, {I('NR_CANDIDATO')} nr, NM_CANDIDATO nome, NM_URNA_CANDIDATO nome_urna,
  DS_SITUACAO_CANDIDATURA situacao_candidatura, {I('NR_PARTIDO')} nr_partido, SG_PARTIDO sigla, {nul('SG_FEDERACAO')} federacao, {nul('DS_COMPOSICAO_FEDERACAO')} composicao_federacao,
  NM_COLIGACAO coligacao, SG_UF_NASCIMENTO uf_nascimento, TRY_CAST(right(DT_NASCIMENTO, 4) AS SMALLINT) ano_nascimento, DS_GENERO genero, DS_GRAU_INSTRUCAO instrucao,
  DS_ESTADO_CIVIL estado_civil, DS_COR_RACA cor_raca, DS_OCUPACAO ocupacao, DS_SIT_TOT_TURNO situacao_final
  FROM {csv(p)} ORDER BY turno, cargo, uf, ue, nr""", 'consulta_cand')
bloco(f'zona_{ano}.parquet', f'votacao_candidato_munzona/votacao_candidato_munzona_{ano}.zip',
  lambda p: f"""SELECT TRY_CAST(ANO_ELEICAO AS SMALLINT) ano, TRY_CAST(NR_TURNO AS TINYINT) turno, TRY_CAST(CD_ELEICAO AS INTEGER) cd_eleicao, SG_UF uf, {I('CD_MUNICIPIO')} cd_municipio_tse,
  NM_MUNICIPIO municipio, {I('NR_ZONA')} zona, TRY_CAST(CD_CARGO AS TINYINT) cargo, TRY_CAST(SQ_CANDIDATO AS BIGINT) sq_candidato, {I('NR_CANDIDATO')} nr_votavel,
  NM_URNA_CANDIDATO nome_urna, SG_PARTIDO sigla, {I('QT_VOTOS_NOMINAIS')} qt_votos_nominais, {I('QT_VOTOS_NOMINAIS_VALIDOS')} qt_votos_nominais_validos,
  NM_TIPO_DESTINACAO_VOTOS destinacao, DS_SIT_TOT_TURNO situacao_final
  FROM {csv(p)} ORDER BY turno, cargo, uf, cd_municipio_tse, zona, nr_votavel""", 'votacao_candidato_munzona')

# ---------------- conferência
def R(sql):
    try: return con.execute(sql).fetchall()
    except Exception as e: md.append('(conferência indisponível: ' + str(e)[:160].replace(chr(10), ' ') + ')'); return []
sec = f"read_parquet('{out}/secao_{ano}_*.parquet')"; det = f"read_parquet('{out}/detalhe_secao_{ano}.parquet')"; zon = f"read_parquet('{out}/zona_{ano}.parquet')"
md = [f'# Conferência do lake {ano}', f'Gerado em {manifest["gerado_em"]}', '']
md += ['## Arquivos', '| arquivo | linhas | MB | fonte | Last-Modified |', '|---|---:|---:|---|---|']
for a in manifest['arquivos']: md.append(f"| {a['arquivo']} | {a['linhas']:,} | {a['bytes']/1e6:.1f} | {a['fonte']} | {a['last_modified_fonte']} |")
if manifest.get('falhas'): md += ['', 'Falhas: ' + '; '.join(f['arquivo'] + ' (' + f['erro'] + ')' for f in manifest['falhas'])]
if manifest.get('ausentes'): md += ['', 'Ausentes no TSE: ' + ', '.join(manifest['ausentes'])]
md += ['', '## 1) Votos por seção x detalhe da apuração (por turno e cargo)', 'Soma de qt_votos (seção) vs nominais+brancos+nulos+legenda (detalhe). Diferença = seção − detalhe.',
       '| turno | cargo | votos seção | votos detalhe | diferença | seções seção | seções detalhe |', '|---:|---:|---:|---:|---:|---:|---:|']
q = R(f"""WITH a AS (SELECT turno, cargo, sum(qt_votos) v, count(DISTINCT (uf, cd_municipio_tse, zona, secao)) s FROM {sec} GROUP BY 1,2),
 b AS (SELECT turno, cargo, sum(votos_nominais+brancos+nulos+legenda) v, count(DISTINCT (uf, cd_municipio_tse, zona, secao)) s FROM {det} WHERE comparecimento > 0 GROUP BY 1,2)
 SELECT a.turno, a.cargo, a.v, b.v, a.v-b.v, a.s, b.s FROM a LEFT JOIN b USING (turno, cargo) ORDER BY 1,2""")
for r in q: md.append('| ' + ' | '.join('' if x is None else f'{x:,}' for x in r) + ' |')
md += ['', '## 2) Votos nominais por seção x votação por município e zona (TSE)', 'Por turno e cargo: soma dos votos de candidatos (sq_candidato>0) nas seções vs QT_VOTOS_NOMINAIS do arquivo munzona; e nº de células (município, zona, candidato) com diferença.',
       '| turno | cargo | votos seção | votos munzona | diferença | células com diferença |', '|---:|---:|---:|---:|---:|---:|']
# anos antigos (ex.: 2014) não trazem sq_candidato nas seções: a conferência cruza por número do votável (candidato = nr compatível com o cargo)
_tem_sq = (R(f"SELECT count(sq_candidato) FROM {sec}") or [[0]])[0][0] > 0
if _tem_sq:
    _ka = _kb = 'sq_candidato'; _fa = _fb = 'sq_candidato > 0'; _fromA = sec
else:
    # anos sem sq_candidato nas seções: candidato = votável cujo número consta (mesmo turno, cargo e UF) na votação nominal por zona
    _ka = _kb = 'nr_votavel'; _fb = 'sq_candidato > 0'; _fa = 'TRUE'
    _fromA = f"(SELECT s.* FROM {sec} s WHERE EXISTS (SELECT 1 FROM {zon} z0 WHERE z0.turno = s.turno AND z0.cargo = s.cargo AND z0.uf = s.uf AND z0.nr_votavel = s.nr_votavel))"
    md.append('(seções deste ano não trazem sq_candidato: conferência cruzada por nr_votavel, só para números que são candidatos na votação por zona)')
q = R(f"""WITH a AS (SELECT turno, cargo, cd_municipio_tse m, zona z, {_ka} c, sum(qt_votos) v FROM {_fromA} WHERE {_fa} GROUP BY ALL),
 b AS (SELECT turno, cargo, cd_municipio_tse m, zona z, {_kb} c, sum(qt_votos_nominais) v FROM {zon} WHERE {_fb} GROUP BY ALL),
 j AS (SELECT coalesce(a.turno,b.turno) turno, coalesce(a.cargo,b.cargo) cargo, coalesce(a.v,0) va, coalesce(b.v,0) vb FROM a FULL JOIN b USING (turno, cargo, m, z, c))
 SELECT turno, cargo, sum(va), sum(vb), sum(va)-sum(vb), count(*) FILTER (WHERE va<>vb) FROM j GROUP BY 1,2 ORDER BY 1,2""")
for r in q: md.append('| ' + ' | '.join('' if x is None else f'{x:,}' for x in r) + ' |')
md += ['', '## 3) Seções sem local de votação', '']
q = R(f"""SELECT s.turno, count(*) FROM (SELECT DISTINCT turno, uf, cd_municipio_tse, zona, secao FROM {sec}) s
 LEFT JOIN read_parquet('{out}/local_secao_{ano}.parquet') l ON l.turno=s.turno AND l.uf=s.uf AND l.cd_municipio_tse=s.cd_municipio_tse AND l.zona=s.zona AND l.secao=s.secao WHERE l.secao IS NULL GROUP BY 1""")
md.append('seções (turno, qtd) sem correspondência no cadastro de locais: ' + (str(q) if q else 'nenhuma'))
q = R(f"SELECT count(*), count(*) FILTER (WHERE bairro IS NULL OR trim(bairro)=''), count(*) FILTER (WHERE latitude IS NULL OR latitude=0) FROM read_parquet('{out}/local_secao_{ano}.parquet')")
md.append(f'locais-seção: {q[0][0]:,}; sem bairro: {q[0][1]:,}; sem coordenada: {q[0][2]:,}' if q else 'locais-seção: indisponível')
open(os.path.join(out, 'conferencia.md'), 'w').write('\n'.join(md) + '\n')
json.dump(manifest, open(os.path.join(out, 'manifesto.json'), 'w'), indent=1, ensure_ascii=False)
print('\n'.join(md))
