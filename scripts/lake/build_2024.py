"""Lake municipal 2024, eleição ordinária, um lote por UF.

Downloads exclusivamente no Actions. ZIPs temporários; CSVs persistidos contêm
somente campos permitidos. Divergências bloqueiam a publicação como validado.
"""

import argparse
import csv
import hashlib
import io
import json
import os
from pathlib import Path
import re
import tempfile
import unicodedata
import zipfile

import duckdb

from inspect_2024 import ROOT, UFS, download, timestamp

KEYS = "NR_TURNO SG_UF CD_MUNICIPIO NR_ZONA CD_CARGO".split()
FIELDS = {
    "secao": KEYS + "NR_SECAO NR_LOCAL_VOTACAO NR_VOTAVEL NM_VOTAVEL QT_VOTOS SQ_CANDIDATO".split(),
    "candidato": "NR_TURNO SG_UF SG_UE CD_CARGO SQ_CANDIDATO NR_CANDIDATO NM_CANDIDATO NM_URNA_CANDIDATO SG_PARTIDO DS_SIT_TOT_TURNO ANO_NASCIMENTO".split(),
    "nominal": KEYS + "SQ_CANDIDATO NR_CANDIDATO QT_VOTOS_NOMINAIS".split(),
    "partido": KEYS + "NR_PARTIDO SG_PARTIDO QT_VOTOS_LEGENDA_VALIDOS QT_VOTOS_LEGENDA_ANULADOS QT_VOTOS_LEGENDA_ANUL_SUBJUD".split(),
    "detalhe_zona": KEYS + "QT_VOTOS QT_SECOES_PRINCIPAIS QT_SECOES_AGREGADAS QT_SECOES_NAO_INSTALADAS QT_TOTAL_SECOES".split(),
    "detalhe_secao": KEYS + "NR_SECAO ST_SECAO_INSTALADA ST_SECAO_ANULADA".split(),
    "local": "NR_TURNO SG_UF CD_MUNICIPIO NR_ZONA NR_SECAO NR_LOCAL_VOTACAO NM_LOCAL_VOTACAO DS_ENDERECO NM_BAIRRO NR_LATITUDE NR_LONGITUDE QT_ELEITOR_SECAO".split(),
}
FAMILIES = {"secao": "votacao_secao", "candidato": "consulta_cand",
            "nominal": "votacao_candidato_munzona", "partido": "votacao_partido_munzona",
            "detalhe_zona": "detalhe_votacao_munzona", "detalhe_secao": "detalhe_votacao_secao",
            "local": "eleitorado_locais_votacao"}
SCHEMAS = {
    "secao": "ano turno cargo uf cd_municipio_tse zona secao nr_local_votacao nr_votavel nm_votavel sigla_partido qt_votos sq_candidato".split(),
    "candidato": "ano turno cargo uf ue sq_candidato nr nome nome_urna sigla situacao_final ano_nascimento".split(),
    "zona": "ano uf cd_municipio_tse zona cargo nr_votavel qt_votos".split(),
    "local_votacao": "ano uf cd_municipio_tse zona nr_local nome endereco bairro latitude longitude secoes eleitores".split(),
}


def regular(row, kind):
    if kind == "local":
        return row.get("DT_ELEICAO") in ("06/10/2024", "27/10/2024")
    label = unicodedata.normalize("NFKD", row.get("NM_TIPO_ELEICAO", "")).encode("ascii", "ignore").decode().lower()
    return re.search(r"\bordinaria\b", label) is not None and row.get("ANO_ELEICAO") == "2024"


def sanitize(row, kind):
    result = {key: row[key] for key in FIELDS[kind] if key != "ANO_NASCIMENTO"}
    if kind == "candidato":
        birth = row["DT_NASCIMENTO"]
        year = birth[-4:] if birth else ""
        result["ANO_NASCIMENTO"] = year if year.isdigit() and 1800 <= int(year) <= 2024 else ""
    return result


def ingest(connection, kind, uf, work, manifest):
    catalog = json.loads((ROOT / "docs/inventario-municipal-fontes.json").read_text())
    sources = [r for p in catalog["conjuntos"] if p["ano"] == 2024 for r in p["recursos"]
               if r["familia"] == FAMILIES[kind]
               and (kind != "secao" or r["url"].endswith(f"_2024_{uf}.zip"))]
    if len(sources) != 1:
        raise ValueError("Fonte não é unívoca")
    source = sources[0]
    archive_path = work / "fonte.zip"
    clean = work / f"{kind}.csv"
    provenance = {"tabela_fonte": kind, "url": source["url"], "consultado_em": timestamp()}
    manifest["fontes"].append(provenance)
    try:
        provenance.update(download(source["url"], archive_path))
        with zipfile.ZipFile(archive_path) as archive:
            members = [m for m in archive.infolist() if m.filename.lower().endswith(".csv")]
            selected = [m for m in members if m.filename.upper().endswith(f"_{uf}.CSV")]
            if not selected:
                selected = [m for m in members if m.filename.upper().endswith("_BRASIL.CSV")]
            if not selected and len(members) == 1:
                selected = members
            if len(selected) != 1:
                raise ValueError("Membro CSV não é unívoco")
            member = selected[0]
            provenance["csv"] = member.filename
            generations, elections = set(), set()
            count, excluded = 0, 0
            csv.field_size_limit(16 * 1024 * 1024)
            with archive.open(member) as raw, io.TextIOWrapper(raw, encoding="iso-8859-1", newline="") as text, clean.open("w", encoding="utf-8", newline="") as out:
                reader = csv.DictReader(text, delimiter=";", strict=True)
                expected = set(FIELDS[kind]) - {"ANO_NASCIMENTO"}
                if kind == "candidato":
                    expected.add("DT_NASCIMENTO")
                if not expected.issubset(reader.fieldnames or []):
                    raise ValueError("Coluna obrigatória ausente")
                writer = csv.DictWriter(out, fieldnames=FIELDS[kind], delimiter=";")
                writer.writeheader()
                for row in reader:
                    if None in row or any(v is None for v in row.values()):
                        raise ValueError("CSV malformado")
                    if row["SG_UF"] != uf:
                        continue
                    if not regular(row, kind):
                        excluded += 1
                        continue
                    if kind != "local" and row["CD_CARGO"] not in ("11", "13"):
                        continue
                    if row["NR_TURNO"] not in ("1", "2"):
                        raise ValueError("Turno desconhecido")
                    generations.add((row.get("DT_GERACAO"), row.get("HH_GERACAO")))
                    if kind != "local":
                        elections.add((row["CD_ELEICAO"], row["NR_TURNO"], row.get("NM_TIPO_ELEICAO")))
                    writer.writerow(sanitize(row, kind))
                    count += 1
            provenance.update(linhas_selecionadas=count, linhas_outras_eleicoes_na_uf=excluded,
                              geracoes=[{"data": d, "hora": h} for d, h in sorted(generations)],
                              eleicoes=[{"codigo": c, "turno": t, "tipo": k} for c, t, k in sorted(elections)],
                              crc_verificado=True)
        if not count:
            raise ValueError("Fonte sem registros da UF e do pleito ordinário")
        # Dados pessoais já foram eliminados antes de chegar ao DuckDB.
        connection.execute(f"CREATE TABLE raw_{kind} AS SELECT * FROM read_csv(?, delim=';', header=true, all_varchar=true, strict_mode=true)", [str(clean)])
    finally:
        archive_path.unlink(missing_ok=True)
        clean.unlink(missing_ok=True)


def nullable(column):
    return f"CASE WHEN {column} IS NULL OR trim({column}) IN ('', '#NULO', '#NE', 'NÃO DIVULGÁVEL') THEN NULL ELSE {column} END"


def number(column, sql_type="BIGINT"):
    return f"CAST(({nullable(column)}) AS {sql_type})"


def base_keys():
    return f"{number('NR_TURNO', 'INTEGER')} turno, SG_UF uf, {number('CD_MUNICIPIO')} cd_municipio_tse, {number('NR_ZONA', 'INTEGER')} zona, {number('CD_CARGO', 'INTEGER')} cargo"


def create_tables(c):
    c.execute(f"""CREATE TABLE candidato AS SELECT 2024::INTEGER ano,
      {number('NR_TURNO', 'INTEGER')} turno, {number('CD_CARGO', 'INTEGER')} cargo,
      SG_UF uf, SG_UE ue, {number('SQ_CANDIDATO')} sq_candidato,
      {number('NR_CANDIDATO', 'INTEGER')} nr, NM_CANDIDATO nome, NM_URNA_CANDIDATO nome_urna,
      SG_PARTIDO sigla, {nullable('DS_SIT_TOT_TURNO')} situacao_final,
      {number('ANO_NASCIMENTO', 'INTEGER')} ano_nascimento FROM raw_candidato""")
    c.execute(f"CREATE TABLE nominal AS SELECT {base_keys()}, {number('SQ_CANDIDATO')} sq_candidato, {number('NR_CANDIDATO', 'INTEGER')} nr_votavel, {number('QT_VOTOS_NOMINAIS')} qt_votos FROM raw_nominal")
    c.execute(f"""CREATE TABLE partido AS SELECT {base_keys()}, {number('NR_PARTIDO', 'INTEGER')} nr_votavel,
      SG_PARTIDO sigla, {number('QT_VOTOS_LEGENDA_VALIDOS')} +
      {number('QT_VOTOS_LEGENDA_ANULADOS')} + {number('QT_VOTOS_LEGENDA_ANUL_SUBJUD')} qt_votos FROM raw_partido""")
    c.execute(f"""CREATE TABLE votos AS SELECT 2024::INTEGER ano, {base_keys()},
      {number('NR_SECAO', 'INTEGER')} secao, {number('NR_LOCAL_VOTACAO', 'INTEGER')} nr_local_votacao,
      {number('NR_VOTAVEL', 'INTEGER')} nr_votavel, NM_VOTAVEL nm_votavel,
      {number('QT_VOTOS')} qt_votos,
      CASE WHEN {number('SQ_CANDIDATO')} > 0 THEN {number('SQ_CANDIDATO')} END sq_candidato FROM raw_secao""")
    c.execute("DROP TABLE raw_secao")  # Reutilizar blocos antes de materializar a saída maior.
    # Agrupar siglas antes do join evita multiplicar votos. Ambiguidade é
    # relatada e bloqueia a validação, em vez de escolher uma sigla em silêncio.
    c.execute("""CREATE TABLE cad_join AS SELECT turno, cargo, uf, sq_candidato,
      min(sigla) sigla, count(DISTINCT sigla) variantes FROM candidato GROUP BY ALL""")
    c.execute("""CREATE TABLE party_join AS SELECT turno, cargo, uf, cd_municipio_tse, zona, nr_votavel,
      min(sigla) sigla, count(DISTINCT sigla) variantes FROM partido GROUP BY ALL""")
    c.execute("""CREATE TABLE secao AS SELECT v.ano, v.turno, v.cargo, v.uf, v.cd_municipio_tse,
      v.zona, v.secao, v.nr_local_votacao, v.nr_votavel, v.nm_votavel,
      CASE WHEN v.sq_candidato IS NOT NULL THEN cj.sigla
           WHEN v.nr_votavel NOT IN (95,96) THEN pj.sigla END sigla_partido,
      v.qt_votos, v.sq_candidato FROM votos v
      LEFT JOIN cad_join cj USING(turno,cargo,uf,sq_candidato)
      LEFT JOIN party_join pj USING(turno,cargo,uf,cd_municipio_tse,zona,nr_votavel)""")
    c.execute("DROP TABLE votos")
    c.execute("CREATE TABLE zona_turno AS SELECT ano, turno, uf, cd_municipio_tse, zona, cargo, nr_votavel, sum(qt_votos)::BIGINT qt_votos FROM secao GROUP BY ALL")
    c.execute(f"""CREATE TABLE local_secao AS SELECT 2024::INTEGER ano,
      {number('NR_TURNO', 'INTEGER')} turno, SG_UF uf, {number('CD_MUNICIPIO')} cd_municipio_tse,
      {number('NR_ZONA', 'INTEGER')} zona, {number('NR_SECAO', 'INTEGER')} secao,
      {number('NR_LOCAL_VOTACAO', 'INTEGER')} nr_local, {nullable('NM_LOCAL_VOTACAO')} nome,
      {nullable('DS_ENDERECO')} endereco, coalesce({nullable('NM_BAIRRO')}, '') bairro,
      CAST(replace(({nullable('NR_LATITUDE')}), ',', '.') AS DOUBLE) latitude,
      CAST(replace(({nullable('NR_LONGITUDE')}), ',', '.') AS DOUBLE) longitude,
      {number('QT_ELEITOR_SECAO')} eleitores FROM raw_local""")
    c.execute("""CREATE TABLE local_votacao_turno AS SELECT ano, turno, uf, cd_municipio_tse, zona,
      nr_local, min(nome) nome, min(endereco) endereco, min(bairro) bairro,
      min(latitude) latitude, min(longitude) longitude,
      list_sort(list_distinct(list(secao))) secoes, sum(eleitores)::BIGINT eleitores,
      count(DISTINCT (nome,endereco,bairro,latitude,longitude)) variantes
      FROM local_secao GROUP BY ano,turno,uf,cd_municipio_tse,zona,nr_local""")


def check(c, manifest, name, query, out):
    cursor = c.execute(query)
    columns = [d[0] for d in cursor.description]
    count = 0
    path = out / f"divergencias_{manifest['uf']}_{name}.csv"
    with path.open("w", encoding="utf-8", newline="") as output:
        writer = csv.writer(output)
        writer.writerow(columns)
        while rows := cursor.fetchmany(10000):
            writer.writerows(rows)
            count += len(rows)
    manifest["conferencias"].append({"nome": name, "divergencias": count,
                                     "status": "aprovada" if count == 0 else "divergente",
                                     "arquivo": path.name})


def reconciliation(c, m, out):
    for name, keys in (("candidato_zona", "turno,cargo,uf,cd_municipio_tse,zona,sq_candidato,nr_votavel"),
                       ("candidato_municipio", "turno,cargo,uf,cd_municipio_tse,sq_candidato,nr_votavel")):
        check(c, m, name, f"""WITH a AS (SELECT {keys},sum(qt_votos) votos_secao FROM secao
          WHERE sq_candidato IS NOT NULL GROUP BY ALL),
          b AS (SELECT {keys},sum(qt_votos) votos_tse FROM nominal GROUP BY ALL)
          SELECT {keys},coalesce(votos_secao,0) votos_secao,coalesce(votos_tse,0) votos_tse,
            coalesce(votos_secao,0)-coalesce(votos_tse,0) diferenca FROM a FULL JOIN b USING({keys})
          WHERE coalesce(votos_secao,0)<>coalesce(votos_tse,0)""", out)
    check(c, m, "legenda_zona", """WITH a AS (SELECT turno,cargo,uf,cd_municipio_tse,zona,nr_votavel,
      sum(qt_votos) votos_secao FROM secao WHERE sq_candidato IS NULL AND nr_votavel NOT IN (95,96) GROUP BY ALL),
      b AS (SELECT turno,cargo,uf,cd_municipio_tse,zona,nr_votavel,sum(qt_votos) votos_tse FROM partido GROUP BY ALL)
      SELECT turno,cargo,uf,cd_municipio_tse,zona,nr_votavel,coalesce(votos_secao,0) votos_secao,
      coalesce(votos_tse,0) votos_tse FROM a FULL JOIN b USING(turno,cargo,uf,cd_municipio_tse,zona,nr_votavel)
      WHERE coalesce(votos_secao,0)<>coalesce(votos_tse,0)""", out)
    check(c, m, "secoes_municipio", f"""WITH a AS (SELECT turno,cargo,uf,cd_municipio_tse,
      count(DISTINCT (zona,secao)) secoes_votos FROM secao GROUP BY ALL),
      b AS (SELECT {number('NR_TURNO', 'INTEGER')} turno,{number('CD_CARGO', 'INTEGER')} cargo,
      SG_UF uf,{number('CD_MUNICIPIO')} cd_municipio_tse,
      count(DISTINCT (NR_ZONA,NR_SECAO)) secoes_tse FROM raw_detalhe_secao GROUP BY ALL)
      SELECT turno,cargo,uf,cd_municipio_tse,coalesce(secoes_votos,0) secoes_votos,
      coalesce(secoes_tse,0) secoes_tse FROM a FULL JOIN b USING(turno,cargo,uf,cd_municipio_tse)
      WHERE coalesce(secoes_votos,0)<>coalesce(secoes_tse,0)""", out)
    check(c, m, "total_cargo", f"""WITH a AS (SELECT turno,cargo,sum(qt_votos) votos_secao FROM secao GROUP BY ALL),
      b AS (SELECT {number('NR_TURNO', 'INTEGER')} turno,{number('CD_CARGO', 'INTEGER')} cargo,
      sum({number('QT_VOTOS')}) votos_tse FROM raw_detalhe_zona GROUP BY ALL)
      SELECT turno,cargo,coalesce(votos_secao,0) votos_secao,coalesce(votos_tse,0) votos_tse,
      coalesce(votos_secao,0)-coalesce(votos_tse,0) diferenca FROM a FULL JOIN b USING(turno,cargo)
      WHERE coalesce(votos_secao,0)<>coalesce(votos_tse,0)""", out)
    check(c, m, "chave_candidato", "SELECT turno,cargo,uf,sq_candidato,count(*) registros FROM candidato GROUP BY ALL HAVING count(*)>1", out)
    check(c, m, "sigla_candidato", "SELECT turno,cargo,uf,sq_candidato,variantes FROM cad_join WHERE variantes<>1", out)
    check(c, m, "sigla_partido", "SELECT * FROM party_join WHERE variantes<>1", out)
    check(c, m, "candidato_sem_cadastro", "SELECT DISTINCT turno,cargo,uf,cd_municipio_tse,nr_votavel,sq_candidato FROM secao WHERE sq_candidato IS NOT NULL AND sigla_partido IS NULL", out)
    check(c, m, "votavel_desconhecido", "SELECT turno,cargo,uf,cd_municipio_tse,zona,secao,nr_votavel,qt_votos FROM secao WHERE sq_candidato IS NULL AND nr_votavel NOT IN (95,96) AND sigla_partido IS NULL", out)
    check(c, m, "local_ambiguo", "SELECT turno,uf,cd_municipio_tse,zona,nr_local,variantes FROM local_votacao_turno WHERE variantes>1", out)
    check(c, m, "secao_local_duplicada", "SELECT turno,uf,cd_municipio_tse,zona,secao,count(*) registros FROM local_secao GROUP BY ALL HAVING count(*)>1", out)
    check(c, m, "secao_sem_local", """SELECT DISTINCT s.turno,s.uf,s.cd_municipio_tse,s.zona,s.secao
      FROM secao s LEFT JOIN local_secao l ON s.turno=l.turno AND s.uf=l.uf AND
      s.cd_municipio_tse=l.cd_municipio_tse AND s.zona=l.zona AND s.secao=l.secao
      AND s.nr_local_votacao=l.nr_local WHERE l.secao IS NULL""", out)
    check(c, m, "votos_negativos", "SELECT turno,cargo,uf,cd_municipio_tse,zona,secao,nr_votavel,qt_votos FROM secao WHERE qt_votos<0 OR qt_votos IS NULL", out)
    check(c, m, "chaves_secao_ausentes", "SELECT turno,cargo,uf,cd_municipio_tse,zona,secao,nr_votavel FROM secao WHERE turno IS NULL OR cargo IS NULL OR uf IS NULL OR cd_municipio_tse IS NULL OR zona IS NULL OR secao IS NULL OR nr_votavel IS NULL OR nr_local_votacao IS NULL", out)
    check(c, m, "votos_nominais_invalidos", "SELECT turno,cargo,uf,cd_municipio_tse,zona,sq_candidato,nr_votavel,qt_votos FROM nominal WHERE qt_votos IS NULL OR qt_votos<0 OR sq_candidato IS NULL OR nr_votavel IS NULL", out)
    check(c, m, "votos_partido_invalidos", "SELECT turno,cargo,uf,cd_municipio_tse,zona,nr_votavel,qt_votos FROM partido WHERE qt_votos IS NULL OR qt_votos<0", out)
    check(c, m, "eleitores_invalidos", "SELECT turno,uf,cd_municipio_tse,zona,secao,eleitores FROM local_secao WHERE eleitores IS NULL OR eleitores<0", out)
    m["municipios_sem_bairro"] = [row[0] for row in c.execute("SELECT DISTINCT cd_municipio_tse FROM local_secao WHERE bairro='' ORDER BY 1").fetchall()]
    m["pleitos_observados"] = [dict(zip(("turno", "cargo", "votos"), row)) for row in c.execute("SELECT turno,cargo,sum(qt_votos) FROM secao GROUP BY ALL ORDER BY 1,2").fetchall()]


def export(c, manifest, uf, out):
    for table, schema in SCHEMAS.items():
        source = table + "_turno" if table in ("zona", "local_votacao") else table
        groups = "turno" if table == "local_votacao" else "turno,cargo"
        for group in c.execute(f"SELECT DISTINCT {groups} FROM {source} ORDER BY {groups}").fetchall():
            turn, cargo = group[0], group[1] if len(group) > 1 else None
            condition = f"turno={turn}" + (f" AND cargo={cargo}" if cargo is not None else "")
            count = c.execute(f"SELECT count(*) FROM {source} WHERE {condition}").fetchone()[0]
            for part, offset in enumerate(range(0, count, 2_000_000)):
                name = f"{table}_2024_{uf}" + (f"_cargo{cargo}" if cargo is not None else "") + f"_turno{turn}_parte{part:04d}.parquet"
                partition = f"{table}/ano=2024/uf={uf}/" + (f"cargo={cargo}/" if cargo is not None else "") + f"turno={turn}/"
                path = out / partition / name
                path.parent.mkdir(parents=True, exist_ok=True)
                cols = ",".join(schema)
                c.execute(f"COPY (SELECT {cols} FROM {source} WHERE {condition} ORDER BY ALL LIMIT 2000000 OFFSET {offset}) TO ? (FORMAT PARQUET, COMPRESSION ZSTD)", [str(path)])
                if path.stat().st_size >= 2 * 1024**3:
                    raise ValueError("Asset excede limite; reduzir lote de linhas")
                actual = [row[0] for row in c.execute("DESCRIBE SELECT * FROM read_parquet(?, hive_partitioning=false)", [str(path)]).fetchall()]
                if actual != schema:
                    raise ValueError("Esquema de saída divergente")
                digest = hashlib.sha256()
                with path.open("rb") as file:
                    while chunk := file.read(1024 * 1024):
                        digest.update(chunk)
                manifest["arquivos"].append({"arquivo": name, "tabela": table, "ano": 2024, "uf": uf,
                    "cargo": cargo, "turno": turn, "parte": part, "bytes": path.stat().st_size,
                    "linhas": c.execute("SELECT count(*) FROM read_parquet(?, hive_partitioning=false)", [str(path)]).fetchone()[0],
                    "sha256": digest.hexdigest(), "particao": partition,
                    "caminho": str(path.relative_to(out))})


def build(uf):
    if os.environ.get("GITHUB_ACTIONS") != "true":
        raise ValueError("Downloads permitidos somente no Actions")
    out = ROOT / "data/lake/municipal/2024" / uf
    out.mkdir(parents=True, exist_ok=True)
    manifest = {"ano": 2024, "uf": uf, "escopo": "eleição ordinária", "iniciado_em": timestamp(),
                "commit": os.environ.get("GITHUB_SHA"), "run_id": os.environ.get("GITHUB_RUN_ID"),
                "fontes": [], "arquivos": [], "conferencias": [], "status": "falha"}
    try:
        with tempfile.TemporaryDirectory(prefix="tse-municipal-2024-") as temporary:
            work = Path(temporary)
            c = duckdb.connect(str(work / "work.duckdb"))
            c.execute("SET memory_limit='4GB'; SET threads=2")
            c.execute("SET temp_directory=?", [str(work / "spill")])
            for kind in FIELDS:
                manifest["etapa"] = f"download_e_ingestao_{kind}"
                ingest(c, kind, uf, work, manifest)
            manifest["etapa"] = "verificar_pleitos"
            by_turn = {}
            for source in manifest["fontes"]:
                for election in source.get("eleicoes", []):
                    by_turn.setdefault(election["turno"], set()).add(election["codigo"])
            if any(len(codes) != 1 for codes in by_turn.values()):
                raise ValueError("Mais de um pleito ordinário no mesmo turno; não misturar")
            manifest["etapa"] = "montar_tabelas"
            create_tables(c)
            manifest["etapa"] = "conferencias"
            reconciliation(c, manifest, out)
            if all(item["status"] == "aprovada" for item in manifest["conferencias"]):
                manifest["etapa"] = "exportar_parquet"
                export(c, manifest, uf, out)
                manifest["status"] = "validado"
            else:
                manifest["status"] = "divergente"
            c.close()
    except Exception as exc:
        manifest["erro_classe"] = type(exc).__name__
        manifest["erro"] = "Falha em " + manifest.get("etapa", "inicializacao") + "; valores de registros omitidos por privacidade"
    finally:
        manifest["concluido_em"] = timestamp()
        (out / f"manifesto_{uf}.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n")
    if manifest["status"] != "validado":
        raise SystemExit(1)


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--uf", required=True, choices=UFS)
    build(parser.parse_args().uf)
