"""Etapa 0: consulta catálogo CKAN e HEAD; nunca baixa o corpo de um ZIP.

Uso: python scripts/lake/inventory_catalog.py
Não converte, publica ou confere votos. Usa somente a biblioteca padrão.
"""

import concurrent.futures
import datetime as dt
import json
from pathlib import Path
import time
import urllib.error
import urllib.parse
import urllib.request

YEARS = (2024,)  # Escopo do teste autorizado; outros anos adiados.
PORTAL = "https://dadosabertos.tse.jus.br"
ROOT = Path(__file__).resolve().parents[2]
FAMILIES = (
    "votacao_secao", "votacao_candidato_munzona", "votacao_partido_munzona",
    "detalhe_votacao_munzona", "detalhe_votacao_secao", "consulta_cand",
    "consulta_cand_complementar", "eleitorado_locais_votacao",
    "relatorio_resultado_totalizacao", "relat_ata_totalizacao",
)


def now():
    return dt.datetime.now(dt.timezone.utc).isoformat()


def api(action, **params):
    url = f"{PORTAL}/api/3/action/{action}?{urllib.parse.urlencode(params)}"
    for attempt in range(3):
        try:
            with urllib.request.urlopen(url, timeout=45) as response:
                payload = json.load(response)
            if not payload.get("success"):
                raise ValueError(f"CKAN sem sucesso: {action}")
            return payload["result"]
        except urllib.error.HTTPError as exc:
            if exc.code == 404:
                raise
            if attempt == 2:
                raise
        except (OSError, ValueError):
            if attempt == 2:
                raise
        time.sleep(attempt + 1)


def get_package(item):
    year, group = item
    slug = f"{group}-{year}"
    # O catálogo de 2020 não usa o mesmo slug dos demais anos.
    if group == "candidatos" and year == 2020:
        slug = "candidatos-2020-subtemas"
    result = {"ano": year, "grupo": group, "slug": slug,
              "url": f"{PORTAL}/dataset/{slug}", "consultado_em": now()}
    try:
        package = api("package_show", id=slug)
        result.update({"status": "catalogado", "observacoes_tse": package.get("notes"),
                       "metadados_modificados_em": package.get("metadata_modified"),
                       "recursos": []})
        for resource in package["resources"]:
            url = resource.get("url", "")
            parts = urllib.parse.urlparse(url)
            family = next((f for f in FAMILIES if f"/{f}/" in parts.path), None)
            if parts.hostname != "cdn.tse.jus.br" or family is None:
                continue
            if parts.path.rsplit("/", 1)[-1].startswith("rede_social_"):
                continue  # Não é necessário para cadastro, votos ou locais.
            result["recursos"].append({
                "id": resource["id"], "nome": resource.get("name"), "url": url,
                "familia": family, "formato_catalogo": resource.get("format"),
                "tamanho_catalogo": resource.get("size"),
                "modificado_catalogo": resource.get("last_modified"),
                "data_geracao": None, "colunas": None, "linhas": None,
                "pendencia": "Inspeção do conteúdo exclusivamente no GitHub Actions",
            })
    except Exception as exc:
        result.update(status="falha_consulta", erro=f"{type(exc).__name__}: {exc}", recursos=[])
    return result


def head(resource):
    resource = dict(resource)
    resource["head_consultado_em"] = now()
    request = urllib.request.Request(resource["url"], method="HEAD")
    try:
        with urllib.request.urlopen(request, timeout=35) as response:
            resource["http_status"] = response.status
            resource["url_final"] = response.url
            length = response.headers.get("Content-Length")
            resource["zip_bytes"] = int(length) if length else None
            resource["http_last_modified"] = response.headers.get("Last-Modified")
            resource["http_etag"] = response.headers.get("ETag")
            resource["content_type"] = response.headers.get("Content-Type")
    except Exception as exc:
        resource["head_erro"] = f"{type(exc).__name__}: {exc}"
    return resource


def main():
    items = [(y, g) for y in YEARS for g in ("resultados", "candidatos", "eleitorado")]
    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as executor:
        packages = list(executor.map(get_package, items))
    for package in packages:
        print(package["slug"], package["status"], len(package["recursos"]), flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=12) as executor:
        futures = [(p, list(executor.map(head, p["recursos"]))) for p in packages]
    for package, resources in futures:
        package["recursos"] = resources
    output = ROOT / "docs/inventario-municipal-fontes.json"
    output.write_text(json.dumps({"consultado_em": now(), "metodo": "CKAN GET + CDN HEAD, sem ZIPs",
                                 "conjuntos": packages},
                                ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    resources = [r for p in packages for r in p["recursos"]]
    print("Recursos:", len(resources), "HEAD OK:", sum(r.get("http_status") == 200 for r in resources))
    print(output)


if __name__ == "__main__":
    main()
