"""Inspeção de conteúdo (etapa 0), exclusivamente no GitHub Actions.

Baixa um ZIP de cada vez, lê CSVs sem extraí-los e publica somente metadados.
Não converte nem valida votos. Não imprime valores de linhas, nem em erros.
"""

import argparse
import csv
import datetime as dt
import hashlib
import io
import json
import os
from pathlib import Path
import re
import tempfile
import time
import urllib.request
import zipfile

ROOT = Path(__file__).resolve().parents[2]
UFS = "AC AL AM AP BA CE ES GO MA MG MS MT PA PB PE PI PR RJ RN RO RR RS SC SE SP TO".split()
GENERATION_COLUMNS = ("DT_GERACAO", "HH_GERACAO", "HORA_GERACAO")


def timestamp():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def resources_for_batch(batch):
    if batch not in ["NACIONAL", *UFS]:
        raise ValueError("Lote inválido")
    data = json.loads((ROOT / "docs/inventario-municipal-fontes.json").read_text())
    selected = []
    for package in data["conjuntos"]:
        if package["ano"] != 2024:
            continue
        for resource in package["recursos"]:
            family = resource["familia"]
            state_resource = family in ("votacao_secao", "relatorio_resultado_totalizacao")
            if state_resource:
                if resource["url"].endswith(f"_2024_{batch}.zip"):
                    selected.append(resource)
            elif batch == "NACIONAL":
                selected.append(resource)
    if not selected:
        raise ValueError("Nenhum recurso catalogado para o lote")
    return selected


class OfficialRedirects(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        check_url(newurl)
        return super().redirect_request(request, fp, code, msg, headers, newurl)


def check_url(url):
    from urllib.parse import urlparse
    parts = urlparse(url)
    if (parts.scheme != "https" or parts.hostname != "cdn.tse.jus.br"
            or not parts.path.startswith("/estatistica/sead/odsele/")):
        raise ValueError("Fonte fora do CDN oficial autorizado")


def download(url, path):
    check_url(url)
    opener = urllib.request.build_opener(OfficialRedirects())
    for attempt in range(3):
        try:
            with opener.open(url, timeout=90) as response, path.open("wb") as output:
                check_url(response.url)
                digest = hashlib.sha256()
                size = 0
                while block := response.read(1024 * 1024):
                    output.write(block)
                    digest.update(block)
                    size += len(block)
                expected = response.headers.get("Content-Length")
                if expected is not None and size != int(expected):
                    raise ValueError("Download incompleto")
                return {"zip_bytes": size, "zip_sha256": digest.hexdigest(),
                        "http_last_modified": response.headers.get("Last-Modified"),
                        "http_etag": response.headers.get("ETag"), "url_final": response.url}
        except (OSError, ValueError):
            path.unlink(missing_ok=True)
            if attempt == 2:
                raise
            time.sleep(attempt + 1)


def inspect_csv(archive, member):
    # Arquivos de 2024 usam CSV separado por ponto e vírgula. Falhar se o
    # cabeçalho não for identificável; nunca gravar a primeira linha como amostra.
    result = {"arquivo": member.filename, "bytes_descompactados": member.file_size,
              "crc32_declarado_zip": f"{member.CRC:08x}"}
    with archive.open(member) as binary:
        prefix = binary.read(3)
    encoding = "utf-8-sig" if prefix == b"\xef\xbb\xbf" else "iso-8859-1"
    with archive.open(member) as binary, io.TextIOWrapper(binary, encoding=encoding, newline="") as text:
        reader = csv.reader(text, delimiter=";", strict=True)
        columns = next(reader, [])
        if (len(columns) < 2 or len(set(columns)) != len(columns)
                or not all(re.fullmatch(r"[A-Z][A-Z0-9_]*", column) for column in columns)):
            raise ValueError("Cabeçalho não reconhecido")
        indexes = {column: columns.index(column) for column in
                   (*GENERATION_COLUMNS, "CD_CARGO", "NR_TURNO", "CD_ELEICAO", "ANO_ELEICAO", "AA_ELEICAO")
                   if column in columns}
        generations = set()
        dimensions = {column: set() for column in indexes if column not in GENERATION_COLUMNS}
        count = 0
        for row in reader:
            if not row:
                continue
            if len(row) != len(columns):
                raise ValueError("Registro com quantidade de campos divergente")
            count += 1
            generation = tuple(row[indexes[column]] if column in indexes else None
                               for column in GENERATION_COLUMNS)
            for value in generation:
                if value is not None and not re.fullmatch(r"[0-9/:. T-]{0,32}", value):
                    raise ValueError("Formato de geração inesperado")
            generations.add(generation)
            for column, values in dimensions.items():
                value = row[indexes[column]]
                if not re.fullmatch(r"[0-9]{1,10}", value):
                    raise ValueError("Dimensão numérica inesperada")
                values.add(value)
            if len(generations) > 1000 or any(len(values) > 1000 for values in dimensions.values()):
                raise ValueError("Cardinalidade inesperada nos metadados")
    result.update(status="inspecionado", encoding=encoding, colunas=columns,
                  linhas=count, contagem="exata; registros CSV sem cabeçalho e linhas vazias",
                  geracoes=[dict(zip(GENERATION_COLUMNS, values))
                            for values in sorted(generations, key=str)],
                  dimensoes={column: sorted(values, key=int) for column, values in dimensions.items()},
                  crc_verificado=True)
    return result


def inspect_resource(resource, work):
    result = {"id": resource["id"], "url": resource["url"], "familia": resource["familia"],
              "iniciado_em": timestamp(), "arquivos": [], "status": "falha"}
    path = work / "fonte.zip"
    try:
        result.update(download(resource["url"], path))
        csv.field_size_limit(16 * 1024 * 1024)
        with zipfile.ZipFile(path) as archive:
            for member in archive.infolist():
                if member.is_dir():
                    continue
                if member.filename.lower().endswith(".csv"):
                    result["arquivos"].append(inspect_csv(archive, member))
                else:
                    # Somente a classificação da extensão; não publica conteúdo
                    # nem nomes arbitrários de documentos internos.
                    result.setdefault("outros_membros_por_extensao", {})
                    extension = Path(member.filename).suffix.lower()
                    if not re.fullmatch(r"\.[a-z0-9]{1,10}", extension):
                        extension = "sem_extensao_reconhecida"
                    counts = result["outros_membros_por_extensao"]
                    counts[extension] = counts.get(extension, 0) + 1
        result["status"] = "inspecionado" if result["arquivos"] else "sem_csv"
        # Não somar CSV BRASIL e CSVs por UF como se fossem dados distintos.
        result["observacao_contagem"] = "Contagens por membro; possíveis réplicas BRASIL/UF não somadas"
    except Exception as exc:
        # Mensagens de parser/Unicode podem incluir conteúdo pessoal. Não gravar str(exc).
        result["erro_classe"] = type(exc).__name__
        result["erro"] = "Falha no download ou inspeção; valores de registros foram omitidos"
    finally:
        path.unlink(missing_ok=True)
        result["concluido_em"] = timestamp()
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--batch", required=True, choices=["NACIONAL", *UFS])
    args = parser.parse_args()
    if os.environ.get("GITHUB_ACTIONS") != "true":
        parser.error("Downloads de ZIPs permitidos apenas no GitHub Actions")
    output = ROOT / "docs/inventario-2024"
    output.mkdir(parents=True, exist_ok=True)
    results = {"ano": 2024, "lote": args.batch, "iniciado_em": timestamp(),
               "run_id": os.environ.get("GITHUB_RUN_ID"), "commit": os.environ.get("GITHUB_SHA"),
               "recursos": [], "conferencias_votos_executadas": False}
    with tempfile.TemporaryDirectory(prefix="tse-inventario-2024-") as temporary:
        for resource in resources_for_batch(args.batch):
            result = inspect_resource(resource, Path(temporary))
            results["recursos"].append(result)
            (output / f"{args.batch}.json").write_text(
                json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            print(resource["id"], result["status"], flush=True)
    results["concluido_em"] = timestamp()
    (output / f"{args.batch}.json").write_text(
        json.dumps(results, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    # sem_csv é uma observação de formato, não falha nem contagem igual a zero.
    if any(resource["status"] == "falha" for resource in results["recursos"]):
        raise SystemExit(1)


if __name__ == "__main__":
    main()
