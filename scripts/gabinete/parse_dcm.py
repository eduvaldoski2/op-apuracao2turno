"""Extrai itens do Diário Oficial da Câmara Municipal (DCM) a partir do PDF.

Saída neutra: cada item = {id, fonte, caderno, pagina, tipo, titulo, texto, refs, autor, tags}.
Filtros específicos do mandato ficam no servidor (admin); aqui só marcamos
Tatiana Roque / CCTCI / SMCTI, que são fixos.
"""
import re
from comum import pdf_paginas, norm, corta, refs, tags_base, idhash, limpa_cab, cctci_status

# início de um item (linha em maiúsculas / padrões do DCM)
START = re.compile(
    r"^(?:"
    r"VETO\s+(?:TOTAL|PARCIAL)\b"
    r"|PROJETO\s+DE\s+(?:LEI\s+COMPLEMENTAR|LEI|RESOLU[ÇC][ÃA]O|DECRETO\s+LEGISLATIVO|EMENDA\s+[ÀA]\s+LEI\s+ORG[ÂA]NICA)\b"
    r"|PROPOSTA\s+DE\s+EMENDA\b"
    r"|REQUERIMENTO(?:\s+DE\s+[A-ZÇÃÕÉÊÍÓÚ ]+?)?\s+N[ºo°]"
    r"|(?:INDICA[ÇC][ÃA]O|MO[ÇC][ÃA]O)\s+N[ºo°]"
    r"|N[ºo°]\s*\d+,\s*de\s+\d\d/\d\d/\d{4}\s*[–-]\s*(?:INDICO|REQUEIRO|MOÇÃO)"
    r"|(?:DA\s+)?COMISS[ÃA]O\s+(?:PERMANENTE\s+)?D[EAO]S?\s+[A-ZÀ-Ú]{3,}"
    r"|PARECER\b"
    r"|(?:RESOLU[ÇC][ÃA]O|DECRETO\s+LEGISLATIVO|LEI\s+COMPLEMENTAR|LEI|ATO|PORTARIA|EDITAL|MENSAGEM|CONVOCA[ÇC][ÃA]O|ERRATA|RETIFICA[ÇC][ÃA]O)(?:\s+[A-Z“”\"]+)?\s+N[ºo°]"
    r")")

def tipo_de(cab):
    c = cab.upper()
    if c.startswith("VETO"): return "veto"
    if "COMPLEMENTAR" in c[:35] and c.startswith("PROJETO"): return "plc"
    if c.startswith("PROJETO DE LEI"): return "pl"
    if c.startswith("PROJETO DE RESOLU"): return "pr"
    if c.startswith("PROJETO DE DECRETO"): return "pdl"
    if c.startswith("PROPOSTA DE EMENDA"): return "pelo"
    if c.startswith("REQUERIMENTO DE INFORMA"): return "req_info"
    if c.startswith("REQUERIMENTO") or "REQUEIRO" in c[:60]: return "requerimento"
    if c.startswith("INDICA") or "INDICO" in c[:60]: return "indicacao"
    if c.startswith("MO"): return "mocao"
    if c.startswith("PARECER") or "COMISS" in c[:20]: return "parecer"
    if c.startswith("RESOLU"): return "resolucao"
    if c.startswith(("EDITAL", "CONVOCA")): return "edital"
    if c.startswith(("ERRATA", "RETIFICA")): return "errata"
    return "ato"

ROTULO = {
    "veto": "Veto", "pl": "Projeto de Lei", "plc": "Projeto de Lei Complementar",
    "pr": "Projeto de Resolução", "pdl": "Projeto de Decreto Legislativo",
    "pelo": "Emenda à Lei Orgânica", "req_info": "Requerimento de Informações",
    "requerimento": "Requerimento", "indicacao": "Indicação", "mocao": "Moção",
    "parecer": "Parecer de comissão", "resolucao": "Resolução", "edital": "Edital/Convocação",
    "errata": "Errata", "ato": "Ato",
}

RX_AUTOR = [
    re.compile(r"autori?a(?:\s+do\s+projeto)?\s*:\s*(?:vereador[a]?\s+)?([A-ZÀ-Ú][A-ZÀ-Ú\.\' ]{3,40})", re.I),
    re.compile(r"de\s+autoria\s+d[oa]s?\s+(?:Senhor[a]?\s+)?Vereador(?:a|es)?\s+([^,\.;“\"]{3,60})", re.I),
]

def autor_de(texto):
    for rx in RX_AUTOR:
        m = rx.search(texto)
        if m:
            return norm(m.group(1)).title()
    return ""

HEAD_RUIDO = re.compile(r"^(?:Ano\s+XLIX|Rio\s+de\s+Janeiro|Quinta-feira|Segunda-feira|Ter[çc]a-feira|Quarta-feira|Sexta-feira|S[áa]bado|Domingo|\d{1,2}\s+de\s+\w+\s+de\s+20\d\d|\d{1,3})$", re.I)

def desquebra(t):
    return re.sub(r"([A-Za-zÀ-ú])-\s+([A-Za-zÀ-ú])", r"\1\2", t)

def itens_pagina(texto, pag, caderno):
    texto = desquebra(texto)
    linhas = [l.rstrip() for l in texto.split("\n")]
    blocos, atual = [], None
    for l in linhas:
        s = l.strip()
        if not s or HEAD_RUIDO.match(s):
            continue
        if START.match(s) and not s.startswith("Nº"):
            atual = [s]; blocos.append(atual)
        elif START.match(s):
            atual = [s]; blocos.append(atual)
        elif atual is not None:
            atual.append(s)
    out = []
    for b in blocos:
        corpo = limpa_cab(norm(" ".join(b)))
        if len(corpo) < 40:
            continue
        cab = b[0]
        tp = tipo_de(cab)
        rf = refs(corpo)
        tg = tags_base(corpo)
        if re.search(r"\bveto\b", corpo, re.I): tg = tg + ["veto"]
        titulo = corta(corpo, 200)
        limite = 900 if (tg or tp in ("veto", "pl", "plc", "pr", "pdl", "pelo", "parecer")) else 380
        out.append({
            "id": idhash("dcm", caderno, pag, corpo[:80]),
            "fonte": "dcm", "caderno": caderno, "pagina": pag,
            "tipo": tp, "rotulo": ROTULO[tp],
            "titulo": titulo, "texto": corta(corpo, limite),
            "refs": rf, "autor": autor_de(corpo), "tags": tg,
            "cctci_status": cctci_status(corpo),
        })
    return out

def pagina_global_tags(paginas):
    """Páginas onde a Tatiana/CCTCI aparecem, mesmo fora de itens segmentados."""
    ach = []
    for i, p in enumerate(paginas, 1):
        t = tags_base(norm(p))
        if t:
            ach.append((i, t))
    return ach

def parse_dcm_pdf(caminho, caderno="1"):
    pags = pdf_paginas(caminho)
    itens, vistos = [], set()
    for i, p in enumerate(pags, 1):
        for it in itens_pagina(p, i, caderno):
            mnum = re.search(r"N[ºo°]\s*([\d\.]+)\s*(?:/\s*(\d{4})|,\s*de)", it["titulo"])
            k = (it["tipo"], mnum.group(0) if mnum else "", tuple(it["refs"]), it["titulo"][:60] if not mnum else "")
            if k in vistos:
                continue
            vistos.add(k)
            itens.append(it)
    # blocos soltos com Tatiana/CCTCI que o segmentador perdeu
    pgs_com_item = {(it["pagina"]) for it in itens if it["tags"]}
    soltos = []
    for i, p in enumerate(pags, 1):
        if i in pgs_com_item:
            continue
        for par in re.split(r"\n\s*\n", p):
            c = limpa_cab(norm(par))
            tg = tags_base(c)
            if tg and len(c) > 60:
                soltos.append({
                    "id": idhash("dcm", caderno, i, c[:80]), "fonte": "dcm", "caderno": caderno,
                    "pagina": i, "tipo": "citacao", "rotulo": "Citação no diário",
                    "titulo": corta(c, 200), "texto": corta(c, 700), "refs": refs(c),
                    "autor": "", "tags": tg})
    return {"paginas": len(pags), "itens": itens + soltos}

if __name__ == "__main__":
    import sys, json
    r = parse_dcm_pdf(sys.argv[1])
    from collections import Counter
    print(r["paginas"], "páginas;", len(r["itens"]), "itens;", Counter(i["tipo"] for i in r["itens"]))
    print("com tags:", Counter(t for i in r["itens"] for t in i["tags"]))
