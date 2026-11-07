#!/usr/bin/env python3
"""Votos por candidato e município (TSE votacao_candidato_munzona, 2006-2026) + perfis de pessoas e índice de busca, para o Comparar candidatos do Painel.

Uso: build_cand_votos.py <pasta com candidaturas.parquet e zona_<ano>.parquet> <pasta de saída> [anos...]

Saída (tudo JSON estático, servido por raw.githubusercontent.com a partir de branches):
  cv/<ano>/<cargo>/<uf>.json   votos de cada candidatura por município (cargos 1,3,5,6,7,8 por UF; 11 = prefeito por UF do município; presidente em BR)
      {"ano","cargo","uf","t1":{cd:válidos},"t2":{cd:válidos},"c1":{sq:[cd,votos,cd,votos,...]},"c2":{...}}
      t1/t2 = votos válidos nominais de todos os candidatos no município (denominador do %), c1/c2 = votos por candidatura no 1º/2º turno.
  pessoas/p/<ddd>.json         perfil da pessoa (trajetória 1994-2026, com votos totais e % quando há votação) em 4096 blocos pelos 3 primeiros caracteres do pessoa_id
  pessoas/s/<xxx>.json         índice de busca: blocos pelas 3 primeiras letras de cada palavra do nome de urna e do nome civil
  pessoas/meta.json            versão, contagens e conferência
  conferencia.md               votos nos arquivos x votos na tabela do TSE (por ano e cargo) e candidaturas sem votos casados
Vereador entra só no perfil (total de votos e %), não nos arquivos por município. Pessoas só de vereador (ou só de vice/suplente) ficam fora desta versão.
Sem CPF, título, e-mail ou nascimento completo (só ano de nascimento)."""
import sys, os, json, time, datetime, collections
import duckdb

src, out = sys.argv[1], sys.argv[2]
ANOS = [int(a) for a in sys.argv[3:]] or [2006, 2008, 2010, 2012, 2014, 2016, 2018, 2020, 2022, 2024, 2026]
PRINC = (1, 3, 5, 6, 7, 8, 11)          # cargos com votos por município
os.makedirs(out, exist_ok=True)
con = duckdb.connect()
con.execute("SET memory_limit='4GB'; SET threads=2; SET preserve_insertion_order=false")
os.makedirs('/tmp/duck_tmp', exist_ok=True); con.execute("SET temp_directory='/tmp/duck_tmp'")
R = lambda s: con.execute(s).fetchall()
t0 = time.time()
log = lambda *a: print(f'[{time.time() - t0:6.0f}s]', *a, flush=True)

con.execute(f"CREATE TABLE cand AS SELECT * FROM read_parquet('{src}/candidaturas.parquet')")
# uma linha por candidatura (ano, cargo, uf, ue, sq); situação do último turno em que consta
con.execute("""CREATE TABLE k AS SELECT ano, cargo, uf, ue, sq_candidato sq, any_value(pessoa_id) pid, any_value(nr) nr, arg_max(nome_urna, turno) urna, arg_max(sigla, turno) sigla,
  arg_max(situacao_final, turno) sit, any_value(nm_ue) nm_ue, any_value(nome) nome, max(turno) tmax
  FROM cand GROUP BY ano, cargo, uf, ue, sq_candidato""")
log('candidaturas', R('SELECT count(*) FROM k')[0][0])

# votos por candidatura e município, de todos os anos pedidos (turno, cargo, uf do município, município, sq)
con.execute("CREATE TABLE v (ano SMALLINT, turno TINYINT, cargo TINYINT, ufm VARCHAR, cd INTEGER, sq BIGINT, v INTEGER)")
bruto = {}
for a in ANOS:
    f = f'{src}/zona_{a}.parquet'
    if not os.path.exists(f): log('sem', f); continue
    con.execute(f"""INSERT INTO v SELECT {a}, turno, cargo, uf, cd_municipio_tse, sq_candidato, sum(qt_votos_nominais_validos)::INTEGER
      FROM read_parquet('{f}') WHERE sq_candidato > 0 AND qt_votos_nominais_validos > 0 GROUP BY ALL""")
    for cg, tt, n in R(f"SELECT cargo, turno, sum(qt_votos_nominais_validos) FROM read_parquet('{f}') WHERE sq_candidato > 0 GROUP BY 1, 2"): bruto[(a, cg, tt)] = int(n or 0)
    log('zona', a)

# casa votos com a candidatura: presidente -> uf BR; gerais -> uf do município = uf da candidatura; municipais -> município = ue
con.execute("""CREATE TABLE vk AS SELECT v.ano, v.turno, v.cargo, v.cd, v.sq, v.v, k.uf ufc, k.ue, k.pid FROM v JOIN k ON k.ano = v.ano AND k.cargo = v.cargo AND k.sq = v.sq
  AND CASE WHEN v.cargo = 1 THEN k.uf = 'BR' WHEN v.cargo IN (11, 13) THEN k.ue = lpad(CAST(v.cd AS VARCHAR), 5, '0') ELSE k.uf = v.ufm END""")
casado = {(a, cg, tt): int(n or 0) for a, cg, tt, n in R("SELECT ano, cargo, turno, sum(v) FROM vk GROUP BY ALL")}
# a junção não pode duplicar votos: cada (ano, turno, cargo, cd, sq) deve ter no máximo uma candidatura
dup = R("SELECT count(*) FROM (SELECT ano, turno, cargo, cd, sq FROM vk GROUP BY ALL HAVING count(*) > 1)")[0][0]
log('votos casados; duplicados', dup)
assert dup == 0, 'junção duplicou votos'

# ---------- arquivos de votos por município (sem vereador)
md = ['# Votos por candidato e município (Comparar candidatos)', '', f'Gerado em {datetime.datetime.now(datetime.timezone.utc).isoformat(timespec="seconds")}.', '',
      '| Ano | Cargo | Turno | Votos válidos nominais (TSE) | Votos casados a candidaturas | Diferença |', '|---|---:|---:|---:|---:|---:|']
tamanhos = {}
for a in ANOS:
    for cg in PRINC:
        rows = con.execute("""SELECT ufc, turno, sq, cd, v FROM vk WHERE ano = ? AND cargo = ? ORDER BY ufc, turno, sq, cd""", [a, cg]).fetchall()
        if not rows: continue
        tot = {(u, tt, cd): vv for u, tt, cd, vv in con.execute("SELECT ufc, turno, cd, sum(v) FROM vk WHERE ano = ? AND cargo = ? GROUP BY ALL", [a, cg]).fetchall()}
        porUf = collections.defaultdict(lambda: {'t1': {}, 't2': {}, 'c1': {}, 'c2': {}})
        for (u, tt, cd), vv in tot.items(): porUf[u]['t%d' % tt][str(cd)] = int(vv)
        for u, tt, sq, cd, vv in rows:
            if cg == 11: pass
            porUf[u]['c%d' % tt].setdefault(str(sq), []).extend((cd, vv))
        d = f'{out}/cv/{a}/{cg}'; os.makedirs(d, exist_ok=True)
        for u, o in porUf.items():
            o = {'ano': a, 'cargo': cg, 'uf': u, **{k: v for k, v in o.items() if v}}
            s = json.dumps(o, separators=(',', ':'), ensure_ascii=False)
            open(f'{d}/{u}.json', 'w').write(s); tamanhos[(a, cg)] = tamanhos.get((a, cg), 0) + len(s)
    for cg in PRINC:
        for tt in (1, 2):
            b, c = bruto.get((a, cg, tt)), casado.get((a, cg, tt), 0)
            if b: md.append(f'| {a} | {cg} | {tt} | {b:,} | {c:,} | {b - c:,} |'.replace(',', '.'))
    log('arquivos', a, {cg: round(tamanhos.get((a, cg), 0) / 1e6, 1) for cg in PRINC})

# ---------- perfis de pessoas
con.execute("""CREATE TABLE tot AS SELECT ano, cargo, ufc, ue, sq, turno, sum(v) v FROM vk GROUP BY ALL""")
con.execute("""CREATE TABLE den AS SELECT ano, cargo, turno, CASE WHEN cargo IN (11, 13) THEN ue ELSE ufc END esc, sum(v) d FROM vk GROUP BY ALL""")
con.execute("""CREATE TABLE kv AS SELECT k.*, coalesce(t1.v, 0) v1, coalesce(t2.v, 0) v2,
  CASE WHEN d1.d > 0 THEN round(100.0 * t1.v / d1.d, 2) END p1, CASE WHEN d2.d > 0 THEN round(100.0 * t2.v / d2.d, 2) END p2
  FROM k LEFT JOIN tot t1 ON t1.ano = k.ano AND t1.cargo = k.cargo AND t1.ufc = k.uf AND t1.ue = k.ue AND t1.sq = k.sq AND t1.turno = 1
  LEFT JOIN tot t2 ON t2.ano = k.ano AND t2.cargo = k.cargo AND t2.ufc = k.uf AND t2.ue = k.ue AND t2.sq = k.sq AND t2.turno = 2
  LEFT JOIN den d1 ON d1.ano = k.ano AND d1.cargo = k.cargo AND d1.turno = 1 AND d1.esc = CASE WHEN k.cargo IN (11, 13) THEN k.ue ELSE k.uf END
  LEFT JOIN den d2 ON d2.ano = k.ano AND d2.cargo = k.cargo AND d2.turno = 2 AND d2.esc = CASE WHEN k.cargo IN (11, 13) THEN k.ue ELSE k.uf END""")
con.execute(f"""CREATE TABLE pes AS SELECT pessoa_id pid, arg_max(nome, ano) nome, arg_max(nome_urna, ano) urna, any_value(ano_nascimento) nasc, arg_max(genero, ano) gen,
  any_value(uf_nascimento) ufn, any_value(pessoa_via) via FROM cand WHERE pessoa_id IN (SELECT pid FROM k WHERE cargo IN {PRINC}) GROUP BY pessoa_id""")
npes = R('SELECT count(*) FROM pes')[0][0]
log('pessoas no recorte', npes)
sem = R(f"SELECT ano, cargo, count(*) FROM kv WHERE cargo IN {PRINC} AND ano IN ({','.join(map(str, ANOS))}) AND v1 = 0 AND v2 = 0 GROUP BY ALL ORDER BY 1, 2")
md += ['', '## Candidaturas (cargos principais) sem votos casados na tabela por município e zona', '', '(inclui candidaturas indeferidas ou renunciadas, que o TSE não lista com votos)', '', '| Ano | Cargo | Candidaturas |', '|---|---:|---:|']
for a, cg, n in sem: md.append(f'| {a} | {cg} | {n:,} |'.replace(',', '.'))

SHARD = lambda pid: pid[:3]
blocos = collections.defaultdict(dict)
cur = con.execute("""SELECT p.pid, p.nome, p.urna, p.nasc, p.gen, p.ufn, p.via, kv.ano, kv.cargo, kv.uf, kv.nm_ue, kv.sigla, kv.nr, kv.sq, kv.sit, kv.v1, kv.p1, kv.v2, kv.p2
  FROM pes p JOIN kv ON kv.pid = p.pid ORDER BY p.pid, kv.ano, kv.cargo, kv.uf, kv.nm_ue, kv.sq""")
atual, reg = None, None
def fecha():
    if reg is not None: blocos[SHARD(atual)][atual] = reg
while True:
    rs = cur.fetchmany(200000)
    if not rs: break
    for pid, nome, urna, nasc, gen, ufn, via, ano, cg, uf, nm_ue, sg, nr, sq, sit, v1, p1, v2, p2 in rs:
        if pid != atual:
            fecha(); atual = pid
            reg = {'n': nome, 'u': urna, 'a': nasc, 'g': (gen or '')[:1], 'o': ufn, 'v': via, 'c': []}
        # [ano, cargo, uf, município (só cargos municipais), partido, número, situação, sq, votos1, %1, votos2, %2]
        reg['c'].append([ano, cg, uf, (nm_ue or '') if cg in (11, 12, 13) else '', sg, nr, sit, sq, v1 or None, p1, v2 or None, p2])
fecha()
os.makedirs(f'{out}/pessoas/p', exist_ok=True)
for b, d in blocos.items():
    open(f'{out}/pessoas/p/{b}.json', 'w').write(json.dumps(d, separators=(',', ':'), ensure_ascii=False))
log('perfis', len(blocos), 'blocos')

# ---------- índice de busca: palavras (≥3 letras, sem artigos) do nome de urna e do nome civil -> blocos pelas 3 primeiras letras
con.execute(r"""CREATE TABLE ult AS SELECT pid, arg_max(ano, CAST(ano AS INTEGER) * 100 + cargo) ano, arg_max(cargo, CAST(ano AS INTEGER) * 100 + cargo) cargo, arg_max(uf, CAST(ano AS INTEGER) * 100 + cargo) uf, arg_max(sigla, CAST(ano AS INTEGER) * 100 + cargo) sigla,
  count(DISTINCT ano) nanos, max(v1) vmax FROM kv GROUP BY pid""")
con.execute(r"""CREATE TABLE tok AS SELECT DISTINCT pid, t FROM (
  SELECT pid, unnest(string_split(trim(regexp_replace(upper(strip_accents(coalesce(nm, ''))), '[^A-Z0-9]+', ' ', 'g')), ' ')) t
  FROM (SELECT pid, urna nm FROM pes UNION ALL SELECT pid, nome FROM pes)) WHERE length(t) >= 3 AND t NOT IN ('DAS', 'DOS', 'DEL', 'DEZ')""")
cur = con.execute("""SELECT lower(left(tok.t, 3)) b, p.pid, p.urna, p.nome, u.ano, u.cargo, u.uf, u.sigla, u.nanos, coalesce(u.vmax, 0)
  FROM tok JOIN pes p ON p.pid = tok.pid JOIN ult u ON u.pid = p.pid ORDER BY b, coalesce(u.vmax, 0) DESC, p.pid""")
os.makedirs(f'{out}/pessoas/s', exist_ok=True)
atual, buf, nsh, nent = None, [], 0, 0
def grava():
    global nsh
    if atual is not None:
        open(f'{out}/pessoas/s/{atual}.json', 'w').write(json.dumps(buf, separators=(',', ':'), ensure_ascii=False)); nsh += 1
while True:
    rs = cur.fetchmany(200000)
    if not rs: break
    for b, pid, urna, nome, ano, cg, uf, sg, na, vm in rs:
        if b != atual: grava(); atual, buf = b, []
        buf.append([pid, urna, nome, ano, cg, uf, sg, na]); nent += 1
grava()
log('busca', nsh, 'blocos', nent, 'entradas')
meta = {'gerado_em': datetime.datetime.now(datetime.timezone.utc).isoformat(timespec='seconds'), 'anos': ANOS, 'pessoas': npes, 'blocos_perfil': len(blocos), 'blocos_busca': nsh, 'entradas_busca': nent}
json.dump(meta, open(f'{out}/pessoas/meta.json', 'w'), indent=1)
open(f'{out}/conferencia.md', 'w').write('\n'.join(md) + '\n')
log('fim', meta)
