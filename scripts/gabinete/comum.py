"""Utilitários comuns do Radar do Gabinete (coleta neutra dos diários oficiais)."""
import re, subprocess, hashlib

def pdf_paginas(caminho):
    """Texto de cada página (ordem de leitura 'raw' do pdftotext)."""
    r = subprocess.run(["pdftotext", "-raw", "-enc", "UTF-8", caminho, "-"],
                       capture_output=True, check=True)
    txt = r.stdout.decode("utf-8", "replace")
    pags = txt.split("\f")
    if pags and not pags[-1].strip():
        pags.pop()
    return pags

def norm(s):
    return re.sub(r"\s+", " ", s or "").strip()

RX_CAB = re.compile(r"(?:\d{1,3}\s+)?Ano\s+XLIX\s+Rio\s+de\s+Janeiro\s+\w+-feira\s+\d{1,2}\s+de\s+\w+\s+de\s+20\d\d\s+N[ºo°]\s*\d+\s*", re.I)

def limpa_cab(s):
    return RX_CAB.sub("", s)

def corta(s, n):
    s = norm(s)
    if len(s) <= n:
        return s
    c = s[:n].rsplit(" ", 1)[0]
    return c + "…"

def idhash(*partes):
    return hashlib.sha1("|".join(str(p) for p in partes).encode("utf-8")).hexdigest()[:10]

# ---------- referências a proposições ----------
_NUM = r"(\d[\d\.]*(?:-[A-Z])?)\s*/\s*(\d{4})"
_REFS = [
    ("PLC", re.compile(r"Projeto\s+de\s+Lei\s+Complementar\s+(?:n[ºo°\.]*\s*)?" + _NUM, re.I)),
    ("PL", re.compile(r"Projeto\s+de\s+Lei\s+(?!Complementar)(?:n[ºo°\.]*\s*)?" + _NUM, re.I)),
    ("PR", re.compile(r"Projeto\s+de\s+Resolu[çc][ãa]o\s+(?:n[ºo°\.]*\s*)?" + _NUM, re.I)),
    ("PDL", re.compile(r"Projeto\s+de\s+Decreto\s+Legislativo\s+(?:n[ºo°\.]*\s*)?" + _NUM, re.I)),
    ("PELO", re.compile(r"Proposta\s+de\s+Emenda\s+[àa]\s+Lei\s+Org[âa]nica\s+(?:n[ºo°\.]*\s*)?" + _NUM, re.I)),
    ("MSG", re.compile(r"Mensagem\s+(?:n[ºo°\.]*\s*)?" + _NUM, re.I)),
]

def refs(texto):
    out = []
    t = norm(texto)
    for sigla, rx in _REFS:
        for m in rx.finditer(t):
            k = f"{sigla} {m.group(1).replace('.', '')}/{m.group(2)}"
            if k not in out:
                out.append(k)
    return out

# ---------- marcadores do mandato (fixos, pedidos pelo gabinete) ----------
RX_TATIANA = re.compile(r"tatiana\s+roque", re.I)
RX_CCTCI = re.compile(r"ci[êe]ncia,?\s+tecnologia,?\s+comunica[çc][ãa]o\s+e\s+inform[áa]tica|\bCCTCI\b", re.I)
RX_SMCTI = re.compile(r"secret[áa]ri[oa]\s+(?:municipal\s+)?de\s+ci[êe]ncia,?\s+tecnologia|secretaria\s+municipal\s+de\s+ci[êe]ncia,?\s+tecnologia\s+e\s+inova[çc][ãa]o|secretaria\s+de\s+ci[êe]ncia,?\s+tecnologia\s+e\s+inova[çc][ãa]o|\bSMCT\b|\bSMCTI\b|gabriel\s+medina", re.I)

def tags_base(texto):
    t = []
    if RX_TATIANA.search(texto): t.append("tatiana")
    if RX_CCTCI.search(texto): t.append("cctci")
    if RX_SMCTI.search(texto): t.append("smcti")
    return t

RX_CCTCI_STATUS = re.compile(r"Comiss[ãa]o\s+de\s+Ci[êe]ncia,?\s+Tecnologia,?\s+Comunica[çc][ãa]o\s+e\s+Inform[áa]tica\s*(PENDENTE|PELA\s+[A-ZÇÃÕÉÊÍÓÚ ]{6,40}|FAVOR[ÁA]VEL|CONTR[ÁA]RIO)?", re.I)

def cctci_status(texto):
    """'pendente' | parecer emitido (texto curto) | '' — para a Comissão de Ciência e Tecnologia."""
    m = RX_CCTCI_STATUS.search(texto)
    if not m or not m.group(1):
        return ""
    g = norm(m.group(1)).lower()
    return "pendente" if g == "pendente" else g
