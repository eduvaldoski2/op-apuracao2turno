"""Planejamento, relatório e publicação do teste municipal de 2024."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import subprocess

from inspect_2024 import ROOT, UFS, timestamp


def selected(value):
    states = UFS if value.strip().upper() == "TODAS" else [u.strip().upper() for u in value.split(",")]
    if not states or len(states) != len(set(states)) or any(u not in UFS for u in states):
        raise ValueError("Informe TODAS ou UFs municipais distintas separadas por vírgula")
    return states


def summarize(states):
    root = ROOT / "data/lake/municipal/2024"
    result = {"ano": 2024, "escopo": "eleição ordinária; teste", "ufs_solicitadas": states,
              "gerado_em": timestamp(), "run_id": os.environ.get("GITHUB_RUN_ID"),
              "commit": os.environ.get("GITHUB_SHA"), "ufs": [], "problemas": [], "status": "validado"}
    files, versions = [], {}
    for uf in states:
        path = root / uf / f"manifesto_{uf}.json"
        if not path.exists():
            result["problemas"].append(f"{uf}: manifesto não produzido")
            continue
        manifest = json.loads(path.read_text())
        result["ufs"].append(manifest)
        files.append(path)
        for source in manifest["fontes"]:
            if source.get("zip_sha256"):
                versions.setdefault(source["url"], set()).add(source["zip_sha256"])
        for entry in manifest["arquivos"]:
            file = path.parent / entry["caminho"]
            if (file.name != entry["arquivo"] or not file.exists()
                    or not file.resolve().is_relative_to(path.parent.resolve())):
                result["problemas"].append(f"{uf}: arquivo ausente ou caminho inválido")
                continue
            digest = hashlib.sha256()
            with file.open("rb") as content:
                while block := content.read(1024 * 1024):
                    digest.update(block)
            if digest.hexdigest() != entry["sha256"]:
                result["problemas"].append(f"{uf}: SHA-256 divergente em {file.name}")
            files.append(file)
        for check in manifest["conferencias"]:
            file = path.parent / check["arquivo"]
            if file.name != check["arquivo"] or not file.exists():
                result["problemas"].append(f"{uf}: lista de divergências ausente")
            else:
                files.append(file)
        if manifest["status"] != "validado":
            result["problemas"].append(f"{uf}: {manifest['status']}")
    if any(len(hashes) > 1 for hashes in versions.values()):
        result["problemas"].append("Uma fonte mudou de conteúdo entre lotes; não combinar snapshots silenciosamente")
    if result["problemas"]:
        result["status"] = "nao_validado"
    result["assets"] = [str(p.relative_to(ROOT)) for p in files]
    root.mkdir(parents=True, exist_ok=True)
    (root / "manifesto.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n")
    lines = ["# Conferência municipal 2024 — teste", "", f"Gerado em {result['gerado_em']}.",
             f"Estado: **{result['status']}**. UFs solicitadas: {', '.join(states)}.",
             "Eleição ordinária, prefeito (11) e vereador (13), turnos existentes. Suplementares excluídas por tipo de eleição; o cadastro de locais é limitado às datas de 06/10 e 27/10/2024.",
             "", "As contagens de seções confrontam votos com o detalhe por seção do TSE. Seções sem votos ou não instaladas podem produzir diferenças: elas são listadas, sem remoção silenciosa.",
             "", "| UF | Conferência | Estado | Divergências | Lista completa |", "| --- | --- | --- | ---: | --- |"]
    for manifest in result["ufs"]:
        uf = manifest["uf"]
        if not manifest["conferencias"]:
            lines.append(f"| {uf} | Execução | falhou antes das conferências | — | manifesto_{uf}.json |")
        for check in manifest["conferencias"]:
            lines.append(f"| {uf} | {check['nome']} | {check['status']} | {check['divergencias']} | {check['arquivo']} |")
    lines += ["", "## Fontes e geração", "", "| UF | Fonte oficial | ZIP (bytes) | Geração interna observada |", "| --- | --- | ---: | --- |"]
    for manifest in result["ufs"]:
        for source in manifest["fontes"]:
            generations = "; ".join(f"{g['data']} {g['hora']}" for g in source.get("geracoes", [])) or "não capturada"
            lines.append(f"| {manifest['uf']} | {source['url']} | {source.get('zip_bytes','não baixado')} | {generations} |")
    lines += ["", "## Municípios sem bairro", ""]
    for manifest in result["ufs"]:
        ids = manifest.get("municipios_sem_bairro")
        lines.append(f"- {manifest['uf']}: " + (", ".join(map(str,ids)) if ids else ("nenhum" if ids is not None else "não verificado")))
    lines += ["", "## Problemas", ""] + ([f"- {p}" for p in result["problemas"]] or ["Nenhum nas conferências executadas."])
    lines += ["", "As listas CSV acompanham os artifacts da execução e, quando validado, a release. Não são publicados CPF, e-mail, título, nome social ou nascimento completo. Bairro ausente permanece vazio. Turno é preservado no nome/manifesto de zona e local de votação, cujos esquemas não incluem essa coluna.",
              "", "As fontes podem ter gerações distintas; o manifesto preserva URL, SHA-256, geração e bytes de cada download. Sucesso de conferências não transforma fontes atualizadas em retrato imutável da noite da eleição."]
    report = ROOT / "docs/conferencia-2024.md"
    report.write_text("\n".join(lines) + "\n")
    return result


def publish():
    if os.environ.get("GITHUB_ACTIONS") != "true":
        raise ValueError("Publicação permitida somente no Actions")
    root = ROOT / "data/lake/municipal/2024"
    result = json.loads((root / "manifesto.json").read_text())
    if result["status"] != "validado":
        raise ValueError("Conferências não aprovadas; publicação bloqueada")
    run = os.environ["GITHUB_RUN_ID"]
    if not run.isdigit():
        raise ValueError("Run ID inválido")
    tag = f"lake-municipal-2024-teste-{run}"
    report = ROOT / "docs/conferencia-2024.md"
    assets = [root / "manifesto.json", report, *(ROOT / p for p in result["assets"])]
    if len(assets) > 1000 or len({p.name for p in assets}) != len(assets):
        raise ValueError("Assets excedem limite ou nomes colidem")
    subprocess.run(["gh", "release", "create", tag, "--draft", "--prerelease", "--target", os.environ["GITHUB_SHA"],
                    "--title", "Lake municipal 2024 — teste — " + ",".join(result["ufs_solicitadas"]),
                    "--notes-file", str(report)], check=True)
    for file in assets:
        subprocess.run(["gh", "release", "upload", tag, str(file)], check=True)
    subprocess.run(["gh", "release", "edit", tag, "--draft=false", "--prerelease"], check=True)
    # Sem clobber: uma revisão posterior recebe um novo run/tag.
    print(f"https://github.com/{os.environ['GITHUB_REPOSITORY']}/releases/tag/{tag}")


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("mode", choices=["plan", "summarize", "publish"])
    parser.add_argument("--ufs", default="AC")
    args = parser.parse_args()
    if args.mode == "plan":
        states = selected(args.ufs)
        matrix = json.dumps({"uf": states})
        with open(os.environ["GITHUB_OUTPUT"], "a") as file:
            file.write(f"matrix={matrix}\n")
    elif args.mode == "summarize":
        result = summarize(selected(args.ufs))
        with open(os.environ["GITHUB_OUTPUT"], "a") as file:
            file.write(f"validado={'true' if result['status']=='validado' else 'false'}\n")
    else:
        publish()
