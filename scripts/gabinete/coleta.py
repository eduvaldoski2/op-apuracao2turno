#!/usr/bin/env python3
"""Coletor do Radar Oficina Política para o Gabinete Tatiana Roque.

Uso:
  coleta.py [--data AAAA-MM-DD] [--poll] [--ate HH:MM] [--saida DIR]
  coleta.py --data 2026-11-19 --pdf-dcm a.pdf [--pdf-dcm b.pdf] --pdf-do c.pdf   # modo local (teste)

Fluxo: confere se DCM e D.O. RIO do dia já saíram; com --poll repete a cada 5 min até
sair (ou até --ate, horário de Brasília); depois baixa, extrai e grava
<saida>/edicoes/AAAA-MM-DD.json (+ indice.json e status.json).
"""
import argparse, json, os, sys, tempfile, time, datetime as dt
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from comum import norm
from parse_dcm import parse_dcm_pdf
from parse_do import parse_do_pdf
import web

BRT = dt.timezone(dt.timedelta(hours=-3))

def agora(): return dt.datetime.now(BRT)

def pascoa(ano):
    a = ano % 19; b = ano // 100; c = ano % 100; d = b // 4; e = b % 4
    f = (b + 8) // 25; g = (b - f + 1) // 3; h = (19 * a + b - d - g + 15) % 30
    i = c // 4; k = c % 4; l = (32 + 2 * e + 2 * i - h - k) % 7; m = (a + 11 * h + 22 * l) // 451
    mes = (h + l - 7 * m + 114) // 31; dia = ((h + l - 7 * m + 114) % 31) + 1
    return dt.date(ano, mes, dia)

def feriados(ano):
    p = pascoa(ano); d = dt.timedelta
    fixos = {(1, 1): "Confraternização Universal", (1, 20): "São Sebastião", (4, 21): "Tiradentes", (4, 23): "São Jorge",
             (5, 1): "Dia do Trabalho", (9, 7): "Independência", (10, 12): "N. Sra. Aparecida", (11, 2): "Finados",
             (11, 15): "Proclamação da República", (11, 20): "Consciência Negra", (12, 25): "Natal"}
    out = {dt.date(ano, m, d_): n for (m, d_), n in fixos.items()}
    out[p - d(days=48)] = "Carnaval (segunda)"; out[p - d(days=47)] = "Carnaval (terça)"
    out[p - d(days=2)] = "Sexta-feira Santa"; out[p + d(days=60)] = "Corpus Christi"
    return out

def dia_sem_expediente(data):
    d = dt.date.fromisoformat(data)
    if d.weekday() >= 5: return "fim de semana"
    return feriados(d.year).get(d)

def verifica(s, data):
    dcm = web.dcm_cadernos(s, data)
    do = [e for e in web.do_edicoes(s, data)]
    return dcm, do

def carrega_anterior(saida, data):
    p = os.path.join(saida, "edicoes", data + ".json")
    if os.path.exists(p):
        try: return json.load(open(p, encoding="utf-8"))
        except Exception: return None
    return None

def monta(data, dcm_pdfs, do_pdfs, ordem, agenda, notas, cad_meta, do_meta):
    dcm_itens, dcm_pag = [], 0
    for caderno, caminho in dcm_pdfs:
        r = parse_dcm_pdf(caminho, caderno)
        dcm_itens += r["itens"]; dcm_pag += r["paginas"]
    do_itens, do_pag, do_stats = [], 0, {"atos_pessoal": 0, "relevantes": 0}
    vistos = set()
    for caminho in do_pdfs:
        r = parse_do_pdf(caminho)
        do_pag += r["paginas"]
        for k in do_stats: do_stats[k] += r["stats"][k]
        for it in r["itens"]:
            if it["id"] in vistos: continue
            vistos.add(it["id"]); do_itens.append(it)
    return {
        "versao": 1, "data": data, "gerado_em": agora().isoformat(timespec="seconds"),
        "fontes": {"dcm": {"cadernos": cad_meta, "paginas": dcm_pag, "ok": bool(dcm_pdfs)},
                   "do": {"edicoes": do_meta, "paginas": do_pag, "ok": bool(do_pdfs)},
                   "ordem": {"ok": bool(ordem)}, "agenda": {"ok": bool(agenda)}},
        "tem_edicao": bool(dcm_pdfs or do_pdfs),
        "notas": notas, "dcm": dcm_itens, "do": do_itens, "do_stats": do_stats,
        "ordem": ordem, "agenda": agenda,
    }

def grava(saida, ed):
    os.makedirs(os.path.join(saida, "edicoes"), exist_ok=True)
    p = os.path.join(saida, "edicoes", ed["data"] + ".json")
    with open(p + ".tmp", "w", encoding="utf-8") as f:
        json.dump(ed, f, ensure_ascii=False, separators=(",", ":"))
    os.replace(p + ".tmp", p)
    datas = sorted(x[:-5] for x in os.listdir(os.path.join(saida, "edicoes")) if x.endswith(".json"))
    versoes = {}
    for d in datas[-40:]:
        try: versoes[d] = json.load(open(os.path.join(saida, "edicoes", d + ".json"), encoding="utf-8")).get("gerado_em", "")
        except Exception: versoes[d] = ""
    json.dump({"datas": datas, "ultima": datas[-1] if datas else None, "versoes": versoes, "atualizado_em": agora().isoformat(timespec="seconds")},
              open(os.path.join(saida, "indice.json"), "w"), ensure_ascii=False)
    return p

def ordem_do_dia(s, data):
    try:
        lista = [x for x in web.ordem_lista(s) if x["data"] >= data][:6]
        # sessões do dia e as seguintes já publicadas (pauta antecipada); mais recentes por último
        return [web.ordem_sessao(s, x) for x in sorted(lista, key=lambda x: (x["data"], x["hora"]))]
    except Exception as e:
        return []

def principal():
    ap = argparse.ArgumentParser()
    ap.add_argument("--data"); ap.add_argument("--poll", action="store_true")
    ap.add_argument("--ate", default="10:00"); ap.add_argument("--intervalo", type=int, default=300)
    ap.add_argument("--saida", default=os.path.join(os.path.dirname(__file__), "..", "..", "gabinetetatianaroque", "dados"))
    ap.add_argument("--pdf-dcm", action="append", default=[]); ap.add_argument("--pdf-do", action="append", default=[])
    ap.add_argument("--agenda-txt"); ap.add_argument("--ordem-txt")
    a = ap.parse_args()
    data = a.data or agora().date().isoformat()
    saida = os.path.abspath(a.saida)
    notas = []

    # ---------- modo local (arquivos) ----------
    if a.pdf_dcm or a.pdf_do:
        dcm = [(str(i + 1), p) for i, p in enumerate(a.pdf_dcm)]
        ag = web.agenda_parse(open(a.agenda_txt, encoding="utf-8").read()) if a.agenda_txt else []
        ordem = []
        if a.ordem_txt:
            info = {"data": data, "hora": "11:00", "tipo": "Sessão Ordinária", "url": ""}
            ordem = [{"data": data, "hora": "11:00", "tipo": "Sessão Ordinária", "periodo": "", "url": "",
                      "itens": web.ordem_itens_de_texto(open(a.ordem_txt, encoding="utf-8").read().split("\n"), info)}]
        ed = monta(data, dcm, a.pdf_do, ordem, ag, ["Gerado a partir de arquivos locais (teste)."],
                   [{"tipo": "caderno", "volume": c, "arquivo": os.path.basename(p)} for c, p in dcm], [])
        print(grava(saida, ed)); return 0

    # ---------- modo web ----------
    s = web.sessao()
    motivo = dia_sem_expediente(data)
    limite = None
    if a.poll and not motivo:
        h, m = map(int, a.ate.split(":"))
        limite = dt.datetime.combine(dt.date.fromisoformat(data), dt.time(h, m), tzinfo=BRT)
    while True:
        try:
            dcm, do = verifica(s, data)
            erro = None
        except Exception as e:
            dcm, do, erro = [], [], str(e)
            print("erro na verificação:", e, file=sys.stderr)
        pronto = bool(dcm) and bool(do)
        print(f"[{agora():%H:%M}] DCM: {len(dcm)} caderno(s); D.O. RIO: {len(do)} edição(ões)")
        if pronto or not limite or agora() >= limite:
            break
        time.sleep(a.intervalo)
    if motivo and not (dcm or do):
        notas.append(f"Sem edições dos diários em {data} ({motivo}).")
    else:
        if not dcm: notas.append("DCM do dia ainda não publicado no momento da coleta.")
        if not do: notas.append("D.O. RIO do dia ainda não publicado no momento da coleta.")
    if erro: notas.append("Falha ao consultar as fontes: " + erro)

    with tempfile.TemporaryDirectory() as tmp:
        dcm_pdfs, do_pdfs = [], []
        for c in dcm:
            try:
                dcm_pdfs.append((c["volume"] if c["tipo"] == "caderno" else "S" + c["volume"], web.baixa(s, c["url"], os.path.join(tmp, c["arquivo"]))))
            except Exception as e:
                notas.append(f"Não consegui baixar o DCM {c['arquivo']}: {e}")
        for e_ in do:
            try:
                do_pdfs.append(web.baixa(s, e_["url"], os.path.join(tmp, f"do{e_['id']}.pdf")))
            except Exception as e:
                notas.append(f"Não consegui baixar o D.O. RIO {e_['id']}: {e}")
        try: ag = web.agenda(s)
        except Exception as e: ag = []; notas.append("Agenda da Câmara indisponível: " + str(e))
        ordem = ordem_do_dia(s, data)
        if not ordem: notas.append("Ordem do Dia não obtida (sem sessão listada ou fonte indisponível).")
        ed = monta(data, dcm_pdfs, do_pdfs, ordem, ag, notas, dcm, do)
    ant = carrega_anterior(saida, data)
    if ant:
        antigos = {c["arquivo"] for c in ant["fontes"]["dcm"]["cadernos"]}
        novos = [c["arquivo"] for c in dcm if c["arquivo"] not in antigos]
        if novos: ed["notas"].append("Atualizada: novo(s) caderno(s)/suplemento(s) do DCM — " + ", ".join(novos))
        ed["primeira_geracao"] = ant.get("primeira_geracao", ant["gerado_em"])
    else:
        ed["primeira_geracao"] = ed["gerado_em"]
    print(grava(saida, ed))
    json.dump({"ultima_execucao": agora().isoformat(timespec="seconds"), "data": data, "tem_edicao": ed["tem_edicao"], "notas": ed["notas"]},
              open(os.path.join(saida, "status.json"), "w"), ensure_ascii=False)
    return 0

if __name__ == "__main__":
    sys.exit(principal())
