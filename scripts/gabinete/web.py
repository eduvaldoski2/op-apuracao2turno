"""Fontes na web: DCM (PDFs), D.O. RIO (PDFs), Ordem do Dia (HTML Lotus Domino) e agenda da Câmara."""
import re, time, requests
from bs4 import BeautifulSoup
from comum import norm, corta, refs, tags_base, idhash

UA = {"User-Agent": "Mozilla/5.0 (compatible; RadarOficinaPolitica/1.0; +https://oficinapolitica.com.br)"}
DCM = "https://dcmdigital.camara.rj.gov.br"
DOW = "https://doweb.rio.rj.gov.br"
CAMARA = "https://www.camara.rio"
ORDEM = "https://aplicnt.camara.rj.gov.br/APL/Legislativos/ordemdia.nsf"

def sessao():
    s = requests.Session(); s.headers.update(UA); return s

def get(s, url, tentativas=3, **kw):
    ultimo = None
    for i in range(tentativas):
        try:
            r = s.get(url, timeout=40, **kw)
            if r.status_code == 200:
                return r
            ultimo = f"HTTP {r.status_code}"
        except Exception as e:
            ultimo = str(e)
        time.sleep(2 * (i + 1))
    raise RuntimeError(f"falha em {url}: {ultimo}")

# ---------------- DCM ----------------
def dcm_cadernos(s, data):
    """Cadernos/suplementos publicados do DCM para a data (AAAA-MM-DD)."""
    r = get(s, DCM + "/")
    m = re.search(r'name="csrf-token"\s+content="([^"]+)"', r.text) or re.search(r'id="token"[^>]*value="([^"]+)"', r.text)
    tok = m.group(1) if m else ""
    p = s.post(DCM + "/consultar", data={"type": "amd", "arg": data},
               headers={"X-CSRF-TOKEN": tok, "X-Requested-With": "XMLHttpRequest"}, timeout=40)
    if p.status_code != 200 or not p.text.strip():
        return []
    lista = p.json()
    if not isinstance(lista, list):
        return []
    out = []
    for x in lista:
        if x.get("status") != "publicado":
            continue
        out.append({"tipo": x["tipo"], "volume": x["num_volume"], "edicao": x["num_edicao"],
                    "arquivo": x["nome_arquivo"], "publicado_em": x["created_at"][:16],
                    "url": f"{DCM}/storage/files/{x['ano']}/{x['mes']}/{x['nome_arquivo']}"})
    return out

# ---------------- D.O. RIO ----------------
def do_edicoes(s, data):
    r = get(s, f"{DOW}/apifront/portal/edicoes/edicoes_from_data/{data}.json")
    j = r.json()
    itens = j.get("itens") or []
    out = []
    for x in itens:
        out.append({"id": x["id"], "numero": x.get("numero"), "nome": x.get("tipo_edicao_nome", ""),
                    "url": f"{DOW}/portal/edicoes/download/{x['id']}"})
    return out

def baixa(s, url, destino):
    r = get(s, url, stream=True)
    with open(destino, "wb") as f:
        for ch in r.iter_content(65536):
            f.write(ch)
    return destino

# ---------------- Ordem do Dia ----------------
def ordem_lista(s):
    """Lista de sessões com Ordem do Dia: [{data, hora, tipo, url}]"""
    r = get(s, ORDEM + "/Formularios/OrdemInt?OpenDocument&Start=1&Count=60&ExpandView")
    soup = BeautifulSoup(r.text, "lxml")
    out = []
    for a in soup.find_all("a", href=True):
        t = norm(a.get_text())
        m = re.fullmatch(r"(\d\d)/(\d\d)/(\d{4})", t)
        if not m:
            continue
        linha = norm(a.parent.get_text(" "))
        h = re.search(r"(\d\d:\d\d)(?::\d\d)?", linha)
        tipo = "Sessão Extraordinária" if "xtraordin" in linha else "Sessão Ordinária"
        href = a["href"]
        url = href if href.startswith("http") else ORDEM + "/" + href.lstrip("/").split("ordemdia.nsf/")[-1]
        out.append({"data": f"{m.group(3)}-{m.group(2)}-{m.group(1)}", "hora": h.group(1) if h else "",
                    "tipo": tipo, "url": url})
    return out

RX_INI = re.compile(r"^(\d+)\s+EM\s+TRAMITA[ÇC][ÃA]O\s+(ESPECIAL|ORDIN[ÁA]RIA)\b(.*)$", re.I)

def ordem_itens_de_texto(linhas, sessao_info):
    itens, atual = [], None
    for l in linhas:
        l = norm(l)
        if not l:
            continue
        m = RX_INI.match(l)
        if m:
            atual = {"ordem": int(m.group(1)), "tramitacao": m.group(2).title(), "cab": [m.group(3).strip()] if m.group(3).strip() else [], "corpo": []}
            itens.append(atual); continue
        if atual is None:
            continue
        if re.match(r"^(EM\s+REGIME|EM\s+DISCUSS|EM\s+\d|QU[ÓO]RUM|DISCUSS[ÃA]O|REGIME)", l, re.I) and not atual["corpo"]:
            atual["cab"].append(l)
        else:
            atual["corpo"].append(l)
    out = []
    for it in itens:
        cab = " · ".join(c for c in it["cab"] if c)
        corpo = norm(" ".join(it["corpo"]))
        prazo = re.search(r"Prazo\s+em\s+(\d\d)/(\d\d)/(\d{4})", corpo, re.I)
        rf = refs(corpo)
        disc = ""
        md = re.search(r"EM\s+(\d[ªº]?\s*DISCUSS[ÃA]O|DISCUSS[ÃA]O\s+[ÚU]NICA|\d[ªº]?\s*E\s*[ÚU]LTIMA\s+DISCUSS[ÃA]O)", cab, re.I)
        if md: disc = norm(md.group(1)).title()
        tipo = "veto" if re.match(r"VETO", corpo, re.I) else ("projeto" if rf else "outro")
        pareceres = ""
        mp = re.search(r"PARECERES?\s+DA\s*:?(.*?)(?:\*?Prazo|$)", corpo, re.I)
        if mp: pareceres = corta(mp.group(1), 500)
        chave = (rf[0] if rf else "OD-" + idhash(corpo[:80])) + "|" + (disc or "-")
        out.append({
            "id": idhash("od", sessao_info["data"], sessao_info["hora"], it["ordem"], corpo[:60]),
            "fonte": "ordem", "sessao": sessao_info["tipo"], "hora": sessao_info["hora"],
            "ordem": it["ordem"], "tramitacao": it["tramitacao"], "regime": norm(cab),
            "discussao": disc, "tipo": tipo, "chave": chave,
            "titulo": corta(corpo, 220), "texto": corta(corpo, 1000), "refs": rf, "pareceres": pareceres,
            "prazo": f"{prazo.group(3)}-{prazo.group(2)}-{prazo.group(1)}" if prazo else "",
            "tags": tags_base(corpo) + (["veto"] if tipo == "veto" else []),
        })
    return out

def ordem_sessao(s, info):
    r = get(s, info["url"])
    soup = BeautifulSoup(r.text, "lxml")
    for t in soup(["script", "style"]): t.decompose()
    txt = soup.get_text("\n")
    linhas = txt.split("\n")
    itens = ordem_itens_de_texto(linhas, info)
    titulo = ""
    m = re.search(r"SESS[ÃA]O\s+\w+\s*\n?\s*(\d\d/\d\d/\d{4}\s+A\s+\d\d/\d\d/\d{4})", txt, re.I)
    if m: titulo = m.group(1)
    return {"data": info["data"], "hora": info["hora"], "tipo": info["tipo"], "periodo": titulo,
            "url": info["url"], "itens": itens}

# ---------------- Agenda da Câmara ----------------
def agenda_parse(texto):
    dias, atual, ev = [], None, None
    for l in texto.split("\n"):
        l = norm(l)
        m = re.match(r"^Data:\s*(\d\d)/(\d\d)/(\d{4})\s*\((\w+)\)", l)
        if m:
            atual = {"data": f"{m.group(3)}-{m.group(2)}-{m.group(1)}", "dia": m.group(4), "eventos": []}
            dias.append(atual); ev = None; continue
        if atual is None: continue
        mm = re.match(r"^(Evento|Hor[áa]rio|Local|Iniciativa):\s*(.*)$", l)
        if mm:
            k = mm.group(1).lower().replace("á", "a")
            if k == "evento":
                ev = {"evento": mm.group(2), "horario": "", "local": "", "iniciativa": ""}
                atual["eventos"].append(ev)
            elif ev is not None:
                ev[k] = mm.group(2)
    for d in dias:
        for e in d["eventos"]:
            e["tags"] = tags_base(e["evento"] + " " + e["iniciativa"])
            if re.search(r"Ci[êe]ncia|Tecnologia|Inform[áa]tica", e["evento"] + e["iniciativa"], re.I) and "cctci" not in e["tags"]:
                e["tags"].append("cctci")
    return dias

def agenda(s):
    r = get(s, CAMARA + "/comunicacao/agenda")
    soup = BeautifulSoup(r.text, "lxml")
    for t in soup(["script", "style"]): t.decompose()
    return agenda_parse(soup.get_text("\n"))
