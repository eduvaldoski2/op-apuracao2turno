#!/usr/bin/env python3
"""Candidaturas do TSE (consulta_cand, 1994-2026) -> Parquet unificado + identificador de pessoa para cruzar eleições.
Uso: build_cand.py <saida> [anos...]   (padrão: 1994..2026, anos pares)
Saídas: candidaturas.parquet (uma linha por candidatura), pessoas.parquet (uma linha por pessoa), manifesto.json, conferencia.md.

Privacidade (LGPD): CPF, título, e-mail, nome social e data de nascimento completa NUNCA são gravados. O CPF só é usado dentro desta execução
para gerar `pessoa_id` = MD5 (14 caracteres) da chave pública da primeira candidatura da pessoa (estável entre reconstruções; a ligação entre candidaturas usa SHA-256(sal aleatório + CPF) só durante a execução, e o sal é descartado, então nada no resultado permite chegar ao CPF).
Quem não tem CPF válido (1994/1996 e falhas) é ligado por nome civil normalizado + ano de nascimento, só quando a
chave é inequívoca; os demais ficam marcados (pessoa_via = 'nome_incerta')."""
import sys, os, subprocess, json, re, hashlib, datetime
import duckdb

out = sys.argv[1]; anos = [a for a in sys.argv[2:]] or [str(a) for a in range(1994, 2027, 2)]
B = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand'
W = os.path.join(out, '_work'); os.makedirs(W, exist_ok=True)
SAL = os.urandom(16).hex()      # nunca gravado em disco nem publicado
con = duckdb.connect(); con.execute("SET memory_limit='4GB'; SET threads=2; SET preserve_insertion_order=false; SET temp_directory='/tmp/duck_tmp'")
man = {'gerado_em': datetime.datetime.now(datetime.timezone.utc).isoformat() + 'Z', 'fonte': B, 'anos': {}}

def baixar(ano):
    if os.environ.get('CAND_LOCAL'):   # teste: CSVs já em UTF-8 numa pasta
        f = os.path.join(os.environ['CAND_LOCAL'], f'consulta_cand_{ano}_BRASIL.csv'); return f if os.path.exists(f) else None
    z = os.path.join(W, f'consulta_cand_{ano}.zip')
    r = subprocess.run(['curl', '-sS', '-f', '-L', '--http1.1', '--retry', '5', '--retry-all-errors', '-o', z, f'{B}/consulta_cand_{ano}.zip'])
    if r.returncode: return None
    nomes = subprocess.run(['unzip', '-Z1', z], capture_output=True, text=True).stdout.split()
    m = [n for n in nomes if re.search(r'_BRASIL\.csv$', n, re.I)]
    if not m: print('SEM BRASIL', ano, nomes[:5], flush=True); return None
    subprocess.run(['unzip', '-o', '-j', '-q', z, m[0], '-d', W], check=True)
    f = os.path.join(W, os.path.basename(m[0])); u = f + '.utf8'
    subprocess.run(f"iconv -f latin1 -t utf8 '{f}' > '{u}'", shell=True, check=True); os.remove(f); os.remove(z); return u

def le(p):
    base = f"read_csv('{p}', delim=';', quote='\"', header=true, all_varchar=true, ignore_errors=false)"
    cols = {r[0] for r in con.execute(f"DESCRIBE SELECT * FROM {base}").fetchall()}
    def c(n): return n if n in cols else 'NULL'
    nul = lambda n: f"CASE WHEN trim({c(n)}) IN ('', '#NULO#', '#NE#', '#NULO', 'Não divulgável') THEN NULL ELSE trim({c(n)}) END" if n in cols else 'NULL'
    ii = lambda n: f"TRY_CAST({c(n)} AS INTEGER)" if n in cols else 'NULL'
    lim = f"regexp_replace({c('NR_CPF_CANDIDATO')}, '[^0-9]', '', 'g')"
    cpf = f"CASE WHEN regexp_matches({lim}, '^[0-9]{{11}}$') AND length(replace({lim}, left({lim}, 1), '')) > 0 THEN {lim} END" if 'NR_CPF_CANDIDATO' in cols else 'NULL'
    nasc = f"TRY_CAST(right(trim({c('DT_NASCIMENTO')}), 4) AS SMALLINT)" if 'DT_NASCIMENTO' in cols else 'NULL'
    return f"""SELECT TRY_CAST(ANO_ELEICAO AS SMALLINT) ano, {ii('NR_TURNO')}::TINYINT turno, {ii('CD_ELEICAO')} cd_eleicao, {nul('DS_ELEICAO')} ds_eleicao,
      {nul('TP_ABRANGENCIA')} abrangencia, SG_UF uf, {nul('SG_UE')} ue, {nul('NM_UE')} nm_ue, {ii('CD_CARGO')}::SMALLINT cargo, {nul('DS_CARGO')} ds_cargo,
      TRY_CAST(SQ_CANDIDATO AS BIGINT) sq_candidato, {ii('NR_CANDIDATO')} nr, {nul('NM_CANDIDATO')} nome, {nul('NM_URNA_CANDIDATO')} nome_urna,
      {nul('DS_SITUACAO_CANDIDATURA')} situacao_candidatura, {ii('NR_PARTIDO')} nr_partido, {nul('SG_PARTIDO')} sigla, {nul('SG_FEDERACAO')} federacao,
      {nul('NM_COLIGACAO')} coligacao, {nul('SG_UF_NASCIMENTO')} uf_nascimento,
      CASE WHEN {nasc} BETWEEN 1890 AND 2010 THEN {nasc} END ano_nascimento, {nul('DS_GENERO')} genero, {nul('DS_GRAU_INSTRUCAO')} instrucao,
      {nul('DS_ESTADO_CIVIL')} estado_civil, {nul('DS_COR_RACA')} cor_raca, {nul('DS_OCUPACAO')} ocupacao, {nul('DS_SIT_TOT_TURNO')} situacao_final,
      {cpf} _cpf FROM {base}"""

con.execute("CREATE TABLE raw AS SELECT * FROM (SELECT NULL::SMALLINT ano) WHERE false")
primeiro = True
for ano in anos:
    p = baixar(ano)
    if not p: man['anos'][ano] = {'erro': 'sem arquivo'}; continue
    q = le(p)
    if primeiro: con.execute(f"CREATE OR REPLACE TABLE raw AS {q}"); primeiro = False
    else: con.execute(f"INSERT INTO raw BY NAME {q}")
    n = con.execute(f"SELECT count(*), count(_cpf), count(ano_nascimento) FROM raw WHERE ano = {ano}").fetchone()
    man['anos'][ano] = {'candidaturas': n[0], 'com_cpf': n[1], 'com_ano_nascimento': n[2]}
    print(ano, man['anos'][ano], flush=True)
    if not os.environ.get('CAND_LOCAL'): os.remove(p)

# chave de nome: nome civil sem acento, só letras/dígitos separados por espaço único + ano de nascimento
con.execute("""CREATE OR REPLACE TABLE t AS SELECT *,
  trim(regexp_replace(regexp_replace(upper(strip_accents(coalesce(nome, ''))), '[^A-Z0-9 ]', ' ', 'g'), ' +', ' ', 'g')) AS nome_norm FROM raw""")
con.execute(f"""CREATE OR REPLACE TABLE t AS SELECT *,
  CASE WHEN _cpf IS NOT NULL THEN 'p' || left(sha256('{SAL}' || _cpf), 16) END AS id_cpf,
  CASE WHEN ano_nascimento IS NOT NULL AND nome_norm <> '' THEN nome_norm || '|' || ano_nascimento END AS chave_nome FROM t""")
# chave de nome -> quantos CPFs distintos? (1 = inequívoca)
con.execute("""CREATE OR REPLACE TABLE chaves AS SELECT chave_nome, count(DISTINCT id_cpf) n_cpf, any_value(id_cpf) id_unico
  FROM t WHERE id_cpf IS NOT NULL AND chave_nome IS NOT NULL GROUP BY 1""")
con.execute(f"""CREATE OR REPLACE TABLE c AS SELECT t.* EXCLUDE (_cpf, id_cpf, nome_norm),
  coalesce(t.id_cpf, CASE WHEN k.n_cpf = 1 THEN k.id_unico END, 'n' || left(sha256(coalesce(t.chave_nome, t.nome_norm || '|' || coalesce(t.uf_nascimento, '') || '|' || t.sq_candidato || '|' || t.ano)), 16)) AS pessoa_id,
  CASE WHEN t.id_cpf IS NOT NULL THEN 'cpf' WHEN k.n_cpf = 1 THEN 'nome_ligada_ao_cpf'
       WHEN t.chave_nome IS NULL THEN 'nome_incerta' WHEN k.n_cpf > 1 THEN 'nome_incerta' ELSE 'nome' END AS pessoa_via
  FROM t LEFT JOIN chaves k ON k.chave_nome = t.chave_nome""")
# candidaturas sem CPF e sem chave inequívoca recebem id único por candidatura (não se liga a ninguém): evita ligar homônimos por engano
con.execute("""CREATE OR REPLACE TABLE c AS SELECT * EXCLUDE (pessoa_id), CASE WHEN pessoa_via = 'nome_incerta' AND pessoa_id NOT LIKE 'p%' THEN 'n' || left(sha256(coalesce(chave_nome, '') || '|' || sq_candidato || '|' || ano), 16) ELSE pessoa_id END AS pessoa_id FROM c""")
# 'nome' (sem CPF, sem concorrente de CPF com a mesma chave): liga por chave entre anos (mesma chave -> mesmo id 'n' + hash da chave)
con.execute("""CREATE OR REPLACE TABLE c AS SELECT * EXCLUDE (pessoa_id), CASE WHEN pessoa_via = 'nome' THEN 'n' || left(sha256(chave_nome), 16) ELSE pessoa_id END AS pessoa_id FROM c""")
# identificador ESTÁVEL: 14 primeiros caracteres do MD5 da chave pública da PRIMEIRA candidatura da pessoa
# (ano|cargo|uf|ue|sq|nr|nome, ordenada por ano, turno, cargo, uf, ue, sq). Não depende de sal nem da reconstrução do conjunto
# (só muda se o TSE alterar a ligação entre candidaturas) e não carrega CPF. (ano, sq) sozinho NÃO é único: de 2000 a 2008 o sq repete entre UEs.
con.execute("""CREATE OR REPLACE TABLE c AS SELECT * EXCLUDE (pessoa_id, _k),
  left(md5(_k), 14) AS pessoa_id
  FROM (SELECT *, first_value(CAST(ano AS VARCHAR) || '|' || cargo || '|' || uf || '|' || ue || '|' || sq_candidato || '|' || nr || '|' || coalesce(nome, ''))
        OVER (PARTITION BY pessoa_id ORDER BY ano, turno, cargo, uf, ue, sq_candidato, nr, nome) AS _k FROM c)""")
con.execute("COPY (SELECT * FROM c ORDER BY ano, turno, cargo, uf, ue, nr, sq_candidato) TO '" + out + "/candidaturas.parquet' (FORMAT parquet, COMPRESSION zstd)")
con.execute("""COPY (SELECT pessoa_id, arg_max(nome, ano) nome, arg_max(nome_urna, ano) nome_urna_ultimo, any_value(pessoa_via) pessoa_via_principal,
  min(ano) primeiro_ano, max(ano) ultimo_ano, count(*) candidaturas, count(DISTINCT ano) anos_disputados,
  list_sort(list(DISTINCT ano)) anos, list_sort(list(DISTINCT ds_cargo)) cargos, list_sort(list(DISTINCT sigla)) partidos,
  any_value(ano_nascimento) ano_nascimento, any_value(uf_nascimento) uf_nascimento, arg_max(genero, ano) genero
  FROM c GROUP BY pessoa_id ORDER BY pessoa_id) TO '""" + out + "/pessoas.parquet' (FORMAT parquet, COMPRESSION zstd)")
# conferência
R = lambda s: con.execute(s).fetchall()
md = ['# Candidaturas do TSE (consulta_cand) e identificador de pessoa', '', f"Gerado em {man['gerado_em']}. Fonte: {B}", '',
      '## 1) Candidaturas por ano e como cada uma foi ligada a uma pessoa', '', '| Ano | Candidaturas | Via CPF | Nome ligado ao CPF | Nome (chave única) | Nome incerta | Sem CPF (%) |', '|---|---|---|---|---|---|---|']
for ano, n, a, b, c_, d in R("""SELECT ano, count(*), count_if(pessoa_via='cpf'), count_if(pessoa_via='nome_ligada_ao_cpf'), count_if(pessoa_via='nome'), count_if(pessoa_via='nome_incerta') FROM c GROUP BY ano ORDER BY ano"""):
    md.append(f'| {ano} | {n:,} | {a:,} | {b:,} | {c_:,} | {d:,} | {100*(n-a)/n:.1f}% |'.replace(',', '.'))
tot, pes = R('SELECT count(*), count(DISTINCT pessoa_id) FROM c')[0]
md += ['', f'Total: {tot:,} candidaturas, {pes:,} pessoas distintas.'.replace(',', '.'), '', '## 2) Quantas pessoas disputaram em mais de um ano', '', '| Anos disputados | Pessoas |', '|---|---|']
for k, v in R("SELECT least(anos_disputados, 8), count(*) FROM (SELECT pessoa_id, count(DISTINCT ano) anos_disputados FROM c GROUP BY 1) GROUP BY 1 ORDER BY 1"):
    md.append(f'| {k}{"+" if k == 8 else ""} | {v:,} |'.replace(',', '.'))
md += ['', '## 3) Alertas de qualidade', '']
dup = R("SELECT count(*) FROM (SELECT pessoa_id, ano, turno, cargo, uf, ue FROM c GROUP BY ALL HAVING count(DISTINCT sq_candidato) > 1)")[0][0]
md.append('- Mesma pessoa com mais de uma candidatura na mesma eleição, turno, cargo e unidade (possível erro de ligação ou substituição de candidatura): ' + f'{dup:,}'.replace(',', '.'))
hom = R("SELECT count(*) FROM chaves WHERE n_cpf > 1")[0][0]
md.append('- Chaves nome+ano de nascimento que pertencem a mais de um CPF (homônimos; esses nunca são ligados por nome): ' + f'{hom:,}'.replace(',', '.'))
mult = R("SELECT count(*) FROM (SELECT pessoa_id FROM c WHERE pessoa_via='cpf' GROUP BY 1 HAVING count(DISTINCT nome) > 1)")[0][0]
md.append('- Pessoas (por CPF) que aparecem com mais de um nome civil ao longo dos anos (mudança de nome ou grafia): ' + f'{mult:,}'.replace(',', '.'))
md += ['', '## 4) Como cruzar votos', '', 'A tabela de votos de cada ano (`zona_<ano>.parquet` dos releases `lake-<ano>`) traz `sq_candidato`. Junte por (`ano`, `sq_candidato`) com `candidaturas.parquet` e agrupe por `pessoa_id`.',
      '`pessoa_id` = MD5 (14 caracteres) da chave pública (ano|cargo|uf|ue|sq) da primeira candidatura da pessoa: estável entre reconstruções (só muda se o TSE alterar a ligação entre candidaturas).']
open(out + '/conferencia.md', 'w').write('\n'.join(md) + '\n')
man['totais'] = {'candidaturas': tot, 'pessoas': pes}; json.dump(man, open(out + '/manifesto.json', 'w'), indent=1)
print('\n'.join(md))
