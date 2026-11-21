"""Extrai itens do Diário Oficial do Município do Rio (D.O. RIO) a partir do PDF.

Foco pedido pelo gabinete:
 - nomeações/exonerações/designações de secretário, subsecretário, chefe de gabinete,
   presidentes e diretores de autarquias/estatais;
 - tudo da Secretaria Municipal de Ciência, Tecnologia e Inovação (SMCTI);
 - decretos, leis, vetos e atos que tocam a Câmara.
"""
import re
from comum import pdf_paginas, norm, corta, tags_base, idhash, refs

RX_CAB_DO = re.compile(r"Di[áa]rio\s+Oficial\s+do\s+Munic[íi]pio\s+do\s+Rio\s+de\s+Janeiro\s+D\.?O\.?\s*RIO\s+Ano\s+XL\s+•\s+N[ºo°]\s*\d+\s+•\s+Rio\s+de\s+Janeiro\s+\w+-feira,\s*\d{1,2}\s+de\s+\w+\s+de\s+20\d\d\s*\|?[^\n]{0,60}?(?=[A-ZÁ-Ú])", re.I)
RX_SMCTI_ORG = re.compile(r"CI[ÊE]NCIA,?\s+TECNOLOGIA\s+E\s+INOVA", re.I)

VERBO = re.compile(r"^(?:N[º°o]\s*\d+\s*[-–]\s*)?(Nomear|Exonerar|Designar|Dispensar|Nomeia|Exonera|Designa|Dispensa|Renomear|Readmitir)\b[,\s]")
NORMA = re.compile(r"^(DECRETO(?:\s+RIO)?(?:\s+[“\"]P[”\"])?\s+N[º°o]\s*[\d\.]+|LEI\s+COMPLEMENTAR\s+N[º°o]\s*[\d\.]+|LEI\s+N[º°o]\s*[\d\.]+|RESOLU[ÇC][ÃA]O(?:\s+[“\"]P[”\"])?\s+N[º°o]?\s*[\d\.]+|PORTARIA(?:\s+[“\"]P[”\"])?\s+(?:[A-Z]+\s+)?N[º°o]\s*[\d\./]+|MENSAGEM\s+N[º°o]?\s*[\d\.]+)", re.I)
ORGAO = re.compile(r"^(SECRETARIA|SUBSECRETARIA|GABINETE|PROCURADORIA|CONTROLADORIA|CASA\s+CIVIL|EMPRESA|FUNDA[ÇC][ÃA]O|INSTITUTO|COMPANHIA|CIA\b|AUTARQUIA|DISTRIBUIDORA|RIO[A-ZÁÂÃÉÊÍÓÔÕÚ\-]+|GUARDA|DEFESA|TRIBUNAL|CONSELHO|ESCRIT[ÓO]RIO|COORDENADORIA|ASSESSORIA|ARQUIVO|CENTRO|SERVI[ÇC]O|AG[ÊE]NCIA)\b")
FIM_ATO = re.compile(r"^(?:Processo|Decreto|DECRETO|PORTARIA|RESOLU|D\.O\. RIO|Assinado|SECRETARIA|SUBSECRETARIA|EXPEDIENTE|DESPACHO|Rio de Janeiro,|Considerando|CONSIDERANDO)")
RX_ESTATAL = re.compile(r"\b(Empresa|Funda[çc][ãa]o|Instituto|Companhia|Cia\.?|Autarquia|S\.\s?/?A\.?|S/A|Riourbe|Rioluz|Riofilme|RioÁguas|Rio-?[ÁA]guas|Comlurb|Rioeventos|Riotur|IPP|Rioprevid[êe]ncia|CET-?RIO|Imprensa|Geo-?Rio|Fundação)\b", re.I)

RX_PESSOA = re.compile(r"^(?:N[º°o]\s*\d+\s*[-–]\s*)?(?:Nomear|Exonerar|Designar|Dispensar|Nomeia|Exonera|Designa|Dispensa|Renomear|Readmitir)(?:,\s*[a-zçãõáéíóúê ]+,)?\s*(?:com\s+validade[^,]*,\s*)?(?:a\s+pedido,\s*)?([A-ZÀ-Ú][A-ZÀ-Ú\'´ ]{5,70}?)(?:,|\s+matr|\s+CPF|\s+registro|\s+[-–])")
RX_CARGO = re.compile(r"(?:Cargo|Emprego|Fun[çc][ãa]o)(?:\s+de\s+Confian[çc]a|\s+em\s+Comiss[ãa]o|\s+Gratificada|\s+P[úu]blico)*\s+de\s+([^,;]{3,70}?)\s*(?:,|;|\s+s[íi]mbolo|\s+categoria|\s+c[óo]digo)", re.I)
RX_ACAO = {"nome": "nomeação", "exon": "exoneração", "desi": "designação", "disp": "dispensa", "reno": "renomeação", "read": "readmissão"}

def acao_de(v):
    return RX_ACAO.get(v.lower()[:4], v.lower())

def nivel_de(cargo, texto, orgao):
    c = (cargo or "") + " " + texto[:160]
    cl = cargo or ""
    if re.search(r"Subsecret", cl, re.I): return "subsecretário(a)", True
    if re.search(r"Secret[aá]ri[oa]\s+(?:Municipal|de|da|do)", cl, re.I): return "secretário(a)", True
    if re.search(r"Chefe\s+de\s+Gabinete", cl, re.I): return "chefe de gabinete", True
    estatal = bool(RX_ESTATAL.search(texto + " " + orgao))
    if re.search(r"Presidente", cl, re.I): return "presidente", True
    if re.search(r"Diretor", cl, re.I) and not re.search(r"Adjunto|Escola", cl, re.I):
        return "diretor", estatal
    return "", False

def parse_do_pdf(caminho):
    return parse_do_paginas(pdf_paginas(caminho))

def parse_do_paginas(pags):
    itens, orgao, norma_atual = [], "", ""
    stats = {"atos_pessoal": 0, "relevantes": 0}
    for pn, p in enumerate(pags, 1):
        linhas = [l.strip() for l in p.split("\n")]
        i = 0
        while i < len(linhas):
            l = linhas[i]
            if not l:
                i += 1; continue
            # cabeçalho de órgão
            if l.isupper() and len(l) >= 10 and not re.search(r"\d", l) and ORGAO.match(l):
                orgao = l; i += 1; continue
            # norma (decreto, lei...)
            mn = NORMA.match(l)
            if mn:
                norma_atual = norm(l)
                corpo = [l]; j = i + 1
                while j < len(linhas) and len(corpo) < 9 and not VERBO.match(linhas[j]) and not NORMA.match(linhas[j]):
                    if linhas[j]: corpo.append(linhas[j])
                    j += 1
                txt = norm(" ".join(corpo))
                tg = tags_base(txt)
                if re.search(r"cr[ée]dito\s+(?:suplementar|especial|extraordin)", txt, re.I): tg.append("credito")
                if re.search(r"C[âa]mara\s+Municipal|Vereador|projeto\s+de\s+lei|\bveto\b", txt, re.I): tg.append("camara")
                kind = norm(mn.group(1)).split(" N")[0].lower()
                interessa = ("portaria" not in kind and "resolu" not in kind) or tg
                if interessa:
                    itens.append({"id": idhash("do", pn, txt[:80]), "fonte": "do", "pagina": pn,
                                  "tipo": "norma", "rotulo": norm(mn.group(1)).title().replace(" N", " Nº").split(" Nº")[0],
                                  "titulo": corta(txt, 160), "texto": corta(txt, 700), "orgao": orgao,
                                  "refs": refs(txt), "tags": tg})
                i = j if j > i else i + 1
                continue
            # ato de pessoal
            mv = VERBO.match(l)
            if mv:
                corpo = [l]; j = i + 1
                while j < len(linhas) and len(corpo) < 8 and not VERBO.match(linhas[j]) and not FIM_ATO.match(linhas[j]) and linhas[j]:
                    corpo.append(linhas[j]); j += 1
                txt = norm(" ".join(corpo))
                stats["atos_pessoal"] += 1
                mc = RX_CARGO.search(txt)
                cargo = norm(mc.group(1)) if mc else ""
                if not cargo:
                    ms = re.search(r"(?:exercer|ocupar)\s+o\s+(?:cargo|emprego)\s+(?:de|como)\s+([^,;\.]{3,70})|\bcomo\s+(Secret[aá]ri[oa]\s+Municipal[^,;\.]{0,60}|Subsecret[aá]ri[oa][^,;\.]{0,60}|Chefe\s+de\s+Gabinete[^,;\.]{0,40})", txt, re.I)
                    cargo = norm(ms.group(1) or ms.group(2)) if ms else ""
                if re.search(r"\bsubstituir\b", txt, re.I) and not re.search(r"Cargo\s+em\s+Comiss[ãa]o\s+de\s+(?:Subsecret|Secret|Chefe|Presidente|Diretor)", txt, re.I):
                    cargo = ""
                nivel, relevante = nivel_de(cargo, txt, orgao)
                tg = tags_base(txt + " " + orgao)
                mp = RX_PESSOA.match(l)
                pessoa = norm(mp.group(1)).title() if mp else ""
                if relevante:
                    stats["relevantes"] += 1
                    itens.append({"id": idhash("do", pn, txt[:80]), "fonte": "do", "pagina": pn,
                                  "tipo": "nomeacao", "rotulo": "Pessoal — " + acao_de(mv.group(1)),
                                  "acao": acao_de(mv.group(1)), "pessoa": pessoa, "cargo": cargo, "nivel": nivel,
                                  "titulo": corta(f"{acao_de(mv.group(1)).capitalize()}: {pessoa or '—'} — {cargo or nivel}", 160),
                                  "texto": corta(txt, 600), "orgao": orgao, "norma": norma_atual,
                                  "refs": [], "tags": tg + ["alto-escalao"]})
                elif tg:
                    itens.append({"id": idhash("do", pn, txt[:80]), "fonte": "do", "pagina": pn,
                                  "tipo": "pessoal_tag", "rotulo": "Pessoal — " + acao_de(mv.group(1)),
                                  "titulo": corta(txt, 160), "texto": corta(txt, 500), "orgao": orgao,
                                  "refs": [], "tags": tg})
                i = j if j > i else i + 1
                continue
            i += 1
    # seção da SMCTI inteira (do cabeçalho do órgão até o próximo órgão)
    buf, ini, dentro = [], 0, False
    def flush():
        if buf:
            t = norm(" ".join(buf))
            if len(t) > 120:
                itens.append({"id": idhash("do", ini, "secao-smcti"), "fonte": "do", "pagina": ini, "tipo": "smcti_secao",
                              "rotulo": "SMCTI — seção do dia", "titulo": "Publicações da Secretaria Municipal de Ciência, Tecnologia e Inovação",
                              "texto": corta(t, 1800), "orgao": "Secretaria Municipal de Ciência, Tecnologia e Inovação", "refs": [], "tags": ["smcti"]})
    for pn, p in enumerate(pags, 1):
        for l in (x.strip() for x in p.split("\n")):
            if not l: continue
            if l.isupper() and len(l) >= 10 and not re.search(r"\d", l) and ORGAO.match(l):
                novo = bool(RX_SMCTI_ORG.search(l))
                if dentro and not novo:
                    flush(); buf = []; dentro = False
                if novo and not dentro:
                    dentro = True; ini = pn; buf = []
                continue
            if dentro and not re.match(r"^(Diário Oficial|D\.O\. ?RIO|Assinado Digitalmente|Código de Autenticação)", l):
                buf.append(l)
    if dentro: flush()
    # parágrafos que citam a SMCTI (despachos, extratos, contratos…) e a Câmara
    for pn, p in enumerate(pags, 1):
        if pn <= 3: continue   # sumário
        for par in re.split(r"\n\s*\n", p):
            c = RX_CAB_DO.sub("", norm(par))
            if len(c) < 80 or "......" in c: continue
            tg = tags_base(c)
            if "smcti" in tg and not any(it["pagina"] == pn and c[:50] in it["texto"] for it in itens):
                itens.append({"id": idhash("do", pn, c[:80]), "fonte": "do", "pagina": pn, "tipo": "smcti",
                              "rotulo": "SMCTI", "titulo": corta(c, 160), "texto": corta(c, 900),
                              "orgao": "Secretaria Municipal de Ciência, Tecnologia e Inovação", "refs": [], "tags": ["smcti"]})
    return {"paginas": len(pags), "itens": itens, "stats": stats}

if __name__ == "__main__":
    import sys
    from collections import Counter
    r = parse_do_pdf(sys.argv[1])
    print(r["paginas"], "páginas;", len(r["itens"]), "itens;", r["stats"], Counter(i["tipo"] for i in r["itens"]))
    for it in r["itens"]:
        if it["tipo"] in ("nomeacao", "smcti"):
            print(" p%d %s | %s | %s" % (it["pagina"], it["tipo"], it["titulo"][:100], it["orgao"][:50]))
