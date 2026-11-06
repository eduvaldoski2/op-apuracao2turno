#!/usr/bin/env python3
"""Classifica as divergências da conferência 2 (votos nominais por seção x votação por município/zona).
Uso: analisa_conf2.py <ano> <pasta com secao_<ano>_*.parquet e zona_<ano>.parquet>"""
import sys, duckdb
ano, d = sys.argv[1], sys.argv[2]
c = duckdb.connect(); c.execute("SET memory_limit='5GB'")
sec = f"read_parquet('{d}/secao_{ano}_*.parquet')"; zon = f"read_parquet('{d}/zona_{ano}.parquet')"
c.execute(f"""CREATE TABLE a AS SELECT turno, cargo, uf, cd_municipio_tse m, zona z, sq_candidato sq, any_value(nr_votavel) nr, sum(qt_votos) va FROM {sec} WHERE sq_candidato > 0 GROUP BY turno, cargo, uf, m, z, sq""")
c.execute(f"""CREATE TABLE b AS SELECT turno, cargo, uf, cd_municipio_tse m, zona z, sq_candidato sq, any_value(destinacao) dest, any_value(situacao_final) sit, sum(qt_votos_nominais) vn, sum(qt_votos_nominais_validos) vv FROM {zon} WHERE sq_candidato > 0 GROUP BY turno, cargo, uf, m, z, sq""")
c.execute("CREATE TABLE j AS SELECT coalesce(a.turno,b.turno) turno, coalesce(a.cargo,b.cargo) cargo, coalesce(a.uf,b.uf) uf, coalesce(a.m,b.m) m, coalesce(a.z,b.z) z, coalesce(a.sq,b.sq) sq, coalesce(a.va,0) va, coalesce(b.vn,0) vn, coalesce(b.vv,0) vv, b.dest, b.sit, (a.sq IS NULL) so_zona, (b.sq IS NULL) so_secao FROM a FULL JOIN b ON a.turno=b.turno AND a.cargo=b.cargo AND a.uf=b.uf AND a.m=b.m AND a.z=b.z AND a.sq=b.sq")
P = lambda t, s: print('\n##', t) or [print(' | '.join('' if x is None else (f'{x:,}' if isinstance(x, int) else str(x)) for x in r)) for r in c.execute(s).fetchall()]
P('Totais (turno, cargo, votos seção, votos munzona nominais, votos munzona válidos, diferença seção-nominais, células divergentes)', "SELECT turno, cargo, sum(va), sum(vn), sum(vv), sum(va)-sum(vn), count(*) FILTER (WHERE va<>vn) FROM j GROUP BY 1,2 ORDER BY 1,2")
P('Divergência por tipo ', "SELECT CASE WHEN so_secao THEN 'candidato so nas secoes (ausente na munzona)' WHEN so_zona THEN 'candidato so na munzona' ELSE 'ambos' END tipo, turno, cargo, count(*) FILTER (WHERE va<>vn) celulas, sum(va-vn) FILTER (WHERE va<>vn) dif FROM j GROUP BY 1,2,3 HAVING count(*) FILTER (WHERE va<>vn) > 0 ORDER BY 2,3,1")
P('Divergência por destinação dos votos na munzona', "SELECT coalesce(dest,'(candidato fora da munzona)') dest, turno, cargo, count(*) FILTER (WHERE va<>vn) celulas, sum(va-vn) FILTER (WHERE va<>vn) dif, sum(vv) FILTER (WHERE va<>vn) validos_munzona FROM j GROUP BY 1,2,3 HAVING count(*) FILTER (WHERE va<>vn) > 0 ORDER BY 2,3,5 DESC")
P('Divergência por situação final do candidato', "SELECT coalesce(sit,'(sem)') sit, count(*) FILTER (WHERE va<>vn) celulas, sum(va-vn) FILTER (WHERE va<>vn) dif FROM j GROUP BY 1 HAVING count(*) FILTER (WHERE va<>vn) > 0 ORDER BY 3 DESC LIMIT 15")
P('Diferença residual (votos seção - votos munzona) APÓS excluir destinação anulada (anulado/ sub judice)', "SELECT turno, cargo, sum(va)-sum(vn) FROM j WHERE coalesce(lower(dest),'') NOT LIKE '%anulad%' AND coalesce(lower(dest),'') NOT LIKE '%sub judice%' GROUP BY 1,2 ORDER BY 1,2")
P('Maiores divergências (amostra)', "SELECT turno, cargo, uf, m, z, sq, va, vn, dest, sit FROM j WHERE va<>vn ORDER BY abs(va-vn) DESC LIMIT 15")

c.execute(f"CREATE TABLE cand AS SELECT sq_candidato sq, any_value(situacao_candidatura) sc, any_value(situacao_final) sf, any_value(sigla) sigla FROM read_parquet('{d}/candidato_{ano}.parquet') WHERE sq_candidato > 0 GROUP BY 1")
P('Candidatos que só aparecem nas seções: situação da candidatura (consulta_cand) - células e votos', "SELECT coalesce(c.sc,'(sq fora do consulta_cand)') situacao_candidatura, j.turno, j.cargo, count(*) celulas, sum(j.va) votos FROM j LEFT JOIN cand c ON c.sq=j.sq WHERE j.so_secao GROUP BY 1,2,3 ORDER BY 5 DESC LIMIT 25")
P('Idem: situação final do candidato (consulta_cand)', "SELECT coalesce(c.sf,'(sem)') sit_final, count(*) celulas, sum(j.va) votos FROM j LEFT JOIN cand c ON c.sq=j.sq WHERE j.so_secao GROUP BY 1 ORDER BY 3 DESC LIMIT 15")
P('Divergências restantes quando se desconta quem só aparece nas seções (deve ser 0 se tudo estiver explicado)', "SELECT turno, cargo, sum(va-vn) FROM j WHERE NOT so_secao GROUP BY 1,2 ORDER BY 1,2")
