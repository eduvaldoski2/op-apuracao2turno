"""Publicação em PDF (identidade da Oficina Política) a partir dos mesmos blocos do documento.
Uso: doc_pdf.py <est.json> <saida.pdf>
Depende de doc_json.py (monta os blocos B e os números) e de Playwright/Chromium."""
import sys, os, re, html, json, runpy, subprocess, tempfile, shutil
HERE = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
est_json, out_pdf = sys.argv[1], sys.argv[2]
G = runpy.run_path(os.path.join(HERE, 'doc_json.py'), run_name='doc_json', init_globals=None) if False else None
# executa doc_json.py com argv próprio para obter os blocos e os números
_argv = sys.argv; sys.argv = [os.path.join(HERE, 'doc_json.py'), est_json, os.path.join(tempfile.gettempdir(), '_doc_blocos.json')]
G = runpy.run_path(sys.argv[0]); sys.argv = _argv
B = G['B']; CEN = G['CEN']; LAB = G['LAB']; tf = G['tf']; psbf = G['psbf']; te = G['te']; fed = G['fed']; dem = G['dem']; top = G['top']
GAIN, LOSS, MIX = G['GAIN'], G['LOSS'], G['MIX']

ROXO, ROXO2, LARANJA, LILAS, CREME = '#3E347E', '#2A2260', '#F08A24', '#D9D4F0', '#FBF9F5'
SCOR = {'A': '#2B6CB0', 'B': '#F08A24', 'C': '#8E5CC8', 'D': '#E0B000', 'E': '#8B5E3C', 'F': '#2f2f3a'}
EMO = {'🟦': 'A', '🟧': 'B', '🟪': 'C', '🟨': 'D', '🟫': 'E', '⬛': 'F'}
FONTS = os.path.join(RAIZ, 'fonts'); IMG = os.path.join(RAIZ, 'img')
def esc(t): return html.escape(t, quote=False)

# ------------------------------------------------------------------ inline
def runs_html(content):
    out = []
    for r in content:
        t = esc(r['text'])
        for e, L in EMO.items(): t = t.replace(e, f'<i class="sq c{L}"></i>')
        t = re.sub(r'\(([+−]\d+)\)', r'<span class="dl">(\1)</span>', t)
        if any(m['type'] == 'bold' for m in r.get('marks', [])): t = f'<b>{t}</b>'
        out.append(t)
    return ''.join(out)
def plain(content): return ''.join(r['text'] for r in content)
def all_bold(content): return bool(content) and all(any(m['type'] == 'bold' for m in r.get('marks', [])) for r in content)
SC_RE = re.compile(r'^(🟦|🟧|🟪|🟨|🟫|⬛) (\w) · (.+)$')
def cell_html(c, header, col_center):
    content = c['content'][0]['content'] if c['content'] else []
    txt = plain(content); bg = c.get('background')
    cls = []
    if bg == GAIN: cls.append('g')
    elif bg == LOSS: cls.append('l')
    elif bg == MIX: cls.append('m')
    if col_center: cls.append('ce')
    m = SC_RE.match(txt)
    if m and header:
        L = m.group(2)
        inner = f'<div class="sh c{L}"><span class="chip c{L}">{L}</span><span class="sl">{esc(m.group(3))}</span></div>'
        return f'<th class="scn {" ".join(cls)}">{inner}</th>'
    if m:
        L = m.group(2); inner = f'<span class="chip c{L}">{L}</span> {esc(m.group(3))}'
    else: inner = runs_html(content)
    tag = 'th' if header else 'td'
    return f'<{tag} class="{" ".join(cls)}">{inner}</{tag}>'
def table_html(t):
    rows = t['content']; ncol = len(rows[0]['content'])
    body = rows[1:]
    def cellplain(c): return plain(c['content'][0]['content']) if c['content'] else ''
    center = []
    for j in range(ncol):
        L = [len(cellplain(r['content'][j])) for r in body] or [0]
        center.append(max(L) <= 22)
    center[0] = False
    head = ''.join(cell_html(c, True, center[j]) for j, c in enumerate(rows[0]['content']))
    trs = []
    for r in body:
        first = r['content'][0]['content'][0]['content'] if r['content'][0]['content'] else []
        key = ' class="key"' if all_bold(first) else ''
        trs.append(f'<tr{key}>' + ''.join(cell_html(c, False, center[j]) for j, c in enumerate(r['content'])) + '</tr>')
    cls = 'wide' if ncol >= 8 else ('mid' if ncol >= 6 else '')
    return f'<table class="{cls}"><thead><tr>{head}</tr></thead><tbody>{"".join(trs)}</tbody></table>'
def list_html(l):
    tag = 'ol' if l['kind'] == 'ordered' else 'ul'
    return f'<{tag}>' + ''.join('<li>' + runs_html(i['content'][0]['content']) + '</li>' for i in l['content']) + f'</{tag}>'

# ------------------------------------------------------------------ elementos de destaque (só no PDF)
def kpis():
    d = {k: tf[k] for k in tf}
    perd = {p: min(fed[k][p] - fed['real'][p] for k in CEN) for p in ('UNIÃO', 'PSD', 'REPUBLICANOS', 'PL')}
    cards = [
        (f'{tf["real"]} → {tf["D"]}', 'deputados federais da esquerda', f'de 2026 ao cenário D: de {G["pct"](tf["real"], 513)} a {G["pct"](tf["D"], 513)} da Câmara'),
        (f'{psbf["real"]} → {psbf["B"]}', 'deputados federais do PSB', f'no melhor caso (cenários B e D); fica em {psbf["E"]} se não entra em federação'),
        ('257', 'cadeiras para a maioria', f'nenhum cenário passa de {tf["D"]} para a esquerda'),
        (f'−{-perd["UNIÃO"]}', 'UNIÃO, o partido que mais perde', f'no cenário D; PSD e REPUBLICANOS perdem {-perd["PSD"]} cada')]
    assert psbf['B'] == psbf['D'] == 20 and perd['UNIÃO'] == -4 and perd['PSD'] == -3 and perd['REPUBLICANOS'] == -3
    h = ''.join(f'<div class="kpi"><div class="kn">{n}</div><div class="kt">{esc(t)}</div><div class="kd">{esc(s)}</div></div>' for n, t, s in cards)
    return f'<div class="kpis">{h}</div>'
def chart():
    rows = [('2026', 'real')] + [(f'{k} · {LAB[k]}', k) for k in CEN]
    W, rh, lm, rm = 680, 30, 190, 40; H = 40 + rh * len(rows) + 30
    xmax = 270; sx = lambda v: lm + (W - lm - rm) * v / xmax
    o = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Space Grotesk, sans-serif">']
    for v in (0, 50, 100, 150, 200, 250):
        o.append(f'<line x1="{sx(v):.1f}" x2="{sx(v):.1f}" y1="30" y2="{30 + rh * len(rows)}" stroke="#e4dfee" stroke-width="1"/><text x="{sx(v):.1f}" y="{H - 10}" font-size="10" fill="#5d5675" text-anchor="middle">{v}</text>')
    for i, (lab, k) in enumerate(rows):
        y = 34 + i * rh; tot = tf[k]; psb = psbf[k]
        col = '#8a84ad' if k == 'real' else SCOR[k]
        if k != 'real': o.append(f'<rect x="8" y="{y + 5}" width="16" height="16" rx="4" fill="{col}"/><text x="16" y="{y + 17}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">{k}</text>')
        o.append(f'<text x="{32 if k != "real" else 8}" y="{y + 17}" font-size="11" fill="#1b1530" font-weight="{600 if k == "real" else 400}">{esc(lab if k == "real" else LAB[k])}</text>')
        o.append(f'<rect x="{lm}" y="{y + 3}" width="{sx(psb) - lm:.1f}" height="20" fill="{LARANJA}"/><rect x="{sx(psb):.1f}" y="{y + 3}" width="{sx(tot) - sx(psb):.1f}" height="20" fill="{ROXO}"/>')
        d = tot - tf['real']; lbl = f'{tot}' + ('' if k == 'real' else f' ({"+" if d > 0 else "−"}{abs(d)})')
        o.append(f'<text x="{sx(tot) + 6:.1f}" y="{y + 18}" font-size="12" font-weight="700" fill="{ROXO2}">{lbl}</text>')
    xm = sx(257)
    o.append(f'<line x1="{xm:.1f}" x2="{xm:.1f}" y1="22" y2="{30 + rh * len(rows)}" stroke="#a3261a" stroke-width="1.6" stroke-dasharray="5 3"/><text x="{xm:.1f}" y="16" font-size="10.5" font-weight="700" fill="#a3261a" text-anchor="middle">maioria: 257</text>')
    o.append('</svg>')
    leg = f'<div class="leg"><span><i style="background:{LARANJA}"></i>PSB</span><span><i style="background:{ROXO}"></i>demais partidos de esquerda</span></div>'
    return f'<figure class="chart"><figcaption>Deputados federais da esquerda por cenário</figcaption>{leg}{"".join(o)}</figure>'

# ------------------------------------------------------------------ corpo
body = B[3:]                                   # título, subtítulo e linha de data vão para a capa
heads = []                                      # (nível, texto, id)
def hid(txt):
    return 'h' + str(len(heads))
skip_tbl = False; out = []; first_after_h2 = False; sec = None; intro_open = False
def close_sec():
    global intro_open
    if intro_open: out.append('</div>'); intro_open = False
    out.append('</section>')
for b in body:
    t = b['type']
    if t == 'paragraph' and b.get('heading') == 2:
        if sec: close_sec()
        txt = plain(b['content']); sec = txt
        k, _, ti = txt.partition(' · ')
        kick, title = (k, ti) if ti else ('', txt)
        i = len(heads); heads.append((2, txt, f'h{i}'))
        out.append(f'<section class="cap"><header class="opener" id="h{i}">' + (f'<div class="k">{esc(kick)}</div>' if kick else '<div class="k">Oficina Política</div>') + f'<h2>{esc(title)}</h2></header>')
        first_after_h2 = True
        if txt == 'Introdução': out.append('<div class="intro-page">'); intro_open = True
        continue
    if skip_tbl:
        if t == 'table': skip_tbl = False
        continue
    if t == 'paragraph' and b.get('heading') == 3:
        txt = plain(b['content'])
        if txt == 'O que cada parte traz': skip_tbl = True; continue
        if txt == 'Principais achados': out.append(kpis() + chart())
        i = len(heads); heads.append((3, txt, f'h{i}'))
        m = re.match(r'^([A-Z]{2}) · (.+)$', txt)
        if m: out.append(f'<h3 class="uf" id="h{i}"><b>{m.group(1)}</b><span>{esc(m.group(2))}</span></h3>')
        else: out.append(f'<h3 id="h{i}">{esc(txt)}</h3>')
        first_after_h2 = False
        continue
    if t == 'paragraph' and b.get('heading') == 4:
        out.append(f'<h4>{runs_html(b["content"])}</h4>'); continue
    if t == 'paragraph':
        txt = plain(b['content'])
        if txt.startswith('¹ '): out.append(f'<p class="footnote">{runs_html(b["content"])}</p>'); continue
        cls = ''
        if txt.startswith('Autor:'): cls = 'autor'
        elif first_after_h2: cls = 'lead'; first_after_h2 = False
        elif all_bold(b['content']) and len(txt) < 70: cls = 'kick'
        out.append(f'<p class="{cls}">{runs_html(b["content"])}</p>'); continue
    if t == 'list': out.append(list_html(b)); continue
    if t == 'blockquote': out.append('<div class="nota">' + runs_html(b['content'][0]['content']) + '</div>'); continue
    if t == 'table': out.append(table_html(b)); continue
    raise SystemExit('bloco não tratado ' + t)
close_sec()
BODY = '\n'.join(out)

CSS = f'''
@font-face {{ font-family:"Space Grotesk"; src:url("file://{FONTS}/space-grotesk-latin-wght-normal.woff2") format("woff2"); font-weight:300 700; unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215; }}
@font-face {{ font-family:"Space Grotesk"; src:url("file://{FONTS}/space-grotesk-latin-ext-wght-normal.woff2") format("woff2"); font-weight:300 700; unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
@font-face {{ font-family:"DM Serif Display"; src:url("file://{FONTS}/dm-serif-display-latin-400-normal.woff2") format("woff2"); font-weight:400; unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215; }}
@font-face {{ font-family:"DM Serif Display"; src:url("file://{FONTS}/dm-serif-display-latin-ext-400-normal.woff2") format("woff2"); font-weight:400; unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
@page {{ size:A4; margin:26mm 16mm 20mm 16mm;
  @top-left {{ content:"Oficina política"; font:600 8pt "Space Grotesk"; color:{ROXO}; padding-left:7mm; background:url("file://{IMG}/icone.svg") no-repeat left center/5.2mm; vertical-align:middle; border-bottom:.4pt solid {LILAS}; width:60mm; margin-bottom:0; }}
  @top-right {{ content:"FEDERAÇÃO É UM CAMINHO PARA A ESQUERDA?"; font:500 6.6pt "Space Grotesk"; letter-spacing:.12em; color:#7d7699; border-bottom:.4pt solid {LILAS}; vertical-align:middle; }}
  @bottom-left {{ content:"Cenários nas Eleições de 2026 · oficinapolitica.com.br"; font:400 7pt "Space Grotesk"; color:#7d7699; vertical-align:top; padding-top:4mm; }}
  @bottom-right {{ content:counter(page); font:700 9pt "Space Grotesk"; color:{ROXO}; vertical-align:top; padding-top:3.4mm; }} }}
@page capa {{ margin:0; @top-left{{content:none;border:0;background:none}} @top-right{{content:none;border:0}} @bottom-left{{content:none}} @bottom-right{{content:none}} }}
@page ficha {{ @top-left{{content:none;border:0;background:none}} @top-right{{content:none;border:0}} @bottom-left{{content:none}} @bottom-right{{content:none}} }}
html {{ font-family:"Space Grotesk",sans-serif; color:#1b1530; font-size:9.3pt; line-height:1.42; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
body {{ margin:0; }}
.capa {{ page:capa; width:210mm; height:296.6mm; background:linear-gradient(160deg,{ROXO2} 0%,{ROXO} 62%,#5a4ea6 100%); color:#fff; position:relative; overflow:hidden; break-after:page; }}
.capa .logo {{ position:absolute; left:20mm; top:20mm; width:78mm; }}
.capa .tag {{ position:absolute; left:20mm; top:92mm; font-weight:600; font-size:8.6pt; letter-spacing:.22em; color:{LARANJA}; }}
.capa h1 {{ position:absolute; left:20mm; top:102mm; width:158mm; margin:0; font:400 50pt/1.04 "DM Serif Display"; }}
.capa .sub {{ position:absolute; left:20mm; top:182mm; width:150mm; font-size:15pt; font-weight:300; color:{LILAS}; }}
.capa .bar {{ position:absolute; left:20mm; top:176mm; width:24mm; height:1.6mm; background:{LARANJA}; }}
.capa .chips {{ position:absolute; left:20mm; top:214mm; display:flex; gap:3mm; }}
.capa .chips span {{ width:10mm; height:10mm; border-radius:2.4mm; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:10pt; color:#fff; }}
.capa .rod {{ position:absolute; left:20mm; right:20mm; bottom:18mm; display:flex; justify-content:space-between; align-items:flex-end; font-size:9pt; color:{LILAS}; border-top:.4pt solid rgba(255,255,255,.3); padding-top:5mm; }}
.capa .rod b {{ color:#fff; font-size:11pt; display:block; }}
.ficha {{ page:ficha; break-after:page; padding-top:120mm; font-size:8.4pt; color:#3a3355; }}
.ficha img {{ width:52mm; margin-bottom:8mm; }}
.ficha dl {{ margin:0; display:grid; grid-template-columns:34mm 1fr; gap:2.2mm 4mm; border-top:.6pt solid {LILAS}; padding-top:5mm; }}
.ficha dt {{ font-weight:700; color:{ROXO}; text-transform:uppercase; font-size:6.8pt; letter-spacing:.1em; padding-top:.6mm; }} .ficha dd {{ margin:0; }}
.ficha .aviso {{ margin-top:7mm; padding:4mm 5mm; background:{CREME}; border-left:1.2mm solid {LARANJA}; font-size:8pt; }}
.toc {{ break-after:page; }}
.toc h2 {{ font:400 26pt "DM Serif Display"; color:{ROXO}; margin:0 0 6mm; }}
.toc .l2 {{ margin-top:4.2mm; font-weight:700; color:{ROXO2}; font-size:10pt; }}
.toc .l3 {{ padding-left:5mm; font-size:8.8pt; color:#3a3355; }}
.toc .row {{ display:flex; align-items:baseline; }} .toc .row i {{ flex:1; border-bottom:.5pt dotted #b6afd2; margin:0 2mm; transform:translateY(-1.2mm); }} .toc .row b {{ font-weight:700; color:{ROXO}; }}
section.cap {{ break-before:page; }}
.opener {{ background:{ROXO}; background:linear-gradient(120deg,{ROXO2},{ROXO}); color:#fff; border-radius:2.5mm; padding:7mm 8mm 6.5mm; margin-bottom:6mm; border-bottom:1.4mm solid {LARANJA}; break-inside:avoid; }}
.opener .k {{ font-size:7.4pt; letter-spacing:.2em; text-transform:uppercase; color:{LARANJA}; font-weight:700; }}
.opener h2 {{ margin:1.5mm 0 0; font:400 25pt/1.08 "DM Serif Display"; }}
h3 {{ font:400 15pt/1.15 "DM Serif Display"; color:{ROXO}; margin:7mm 0 2.6mm; padding-top:3.2mm; background:linear-gradient({LARANJA},{LARANJA}) top left/9mm .9mm no-repeat; break-after:avoid; break-inside:avoid; }}
h3.uf {{ display:flex; align-items:center; gap:3.5mm; font-size:17pt; margin-top:9mm; padding-top:1mm; border-top:.6pt solid {LILAS}; }} h3.uf {{ background:none; }}
h3.uf b {{ background:{ROXO}; color:#fff; font:700 11pt "Space Grotesk"; padding:1.4mm 3mm; border-radius:1.6mm; letter-spacing:.05em; }}
h4 {{ font:700 10pt "Space Grotesk"; color:{ROXO}; margin:5.5mm 0 2mm; break-after:avoid; display:flex; align-items:center; gap:1.5mm; }}
p {{ margin:0 0 2.6mm; }} p.lead {{ font-size:11.4pt; line-height:1.4; color:{ROXO2}; margin-bottom:4mm; font-weight:500; }}
p.autor {{ font-size:9.4pt; color:{ROXO}; margin-bottom:3mm; padding-bottom:3mm; border-bottom:.5pt solid {LILAS}; }}
p.kick {{ font:700 8.2pt "Space Grotesk"; letter-spacing:.09em; text-transform:uppercase; color:{ROXO}; margin:4.5mm 0 1.6mm; break-after:avoid; }} p.kick b {{ font-weight:700; }}
p.footnote {{ font-size:7.8pt; color:#5d5675; border-top:.5pt solid {LILAS}; padding-top:2mm; margin:0; }} .intro-page p.footnote {{ position:absolute; left:0; right:0; bottom:0; }}
.intro-page {{ position:relative; height:205mm; font-size:8.6pt; line-height:1.34; }} .intro-page p.lead {{ font-size:10.4pt; }} .intro-page .nota {{ font-size:8.1pt; }}
ul,ol {{ margin:0 0 3mm; padding:0; list-style:none; counter-reset:n; }}
li {{ position:relative; padding-left:5mm; margin-bottom:1.8mm; break-inside:avoid; }}
ul li::before {{ content:""; position:absolute; left:.4mm; top:1.55mm; width:1.7mm; height:1.7mm; background:{LARANJA}; border-radius:.4mm; }}
ol li {{ counter-increment:n; padding-left:6.5mm; }} ol li::before {{ content:counter(n); position:absolute; left:0; top:0; font-weight:700; color:{ROXO}; }}
.nota {{ background:{CREME}; border-left:1.2mm solid {LARANJA}; padding:3mm 4mm; margin:0 0 3mm; font-size:8.6pt; break-inside:avoid; }}
b {{ font-weight:700; }}
table {{ border-collapse:collapse; width:100%; margin:1.5mm 0 4mm; font-size:8.3pt; }} table.mid {{ font-size:7.9pt; }} table.wide {{ font-size:7.5pt; }}
thead {{ display:table-header-group; }} tr {{ break-inside:avoid; }}
th {{ background:{LILAS}; color:{ROXO2}; font-weight:700; text-align:left; padding:1.5mm 1.6mm; vertical-align:bottom; border-bottom:.8pt solid {ROXO}; }}
th.ce, td.ce {{ text-align:center; }} th.scn {{ padding:0; vertical-align:top; }}
td {{ padding:1.25mm 1.6mm; border-bottom:.4pt solid #e4dfee; vertical-align:top; }}
tr.key td {{ font-weight:700; background:#f3f1fa; border-bottom:.6pt solid #c9c3e3; }}
td.g {{ background:#e1f2e6; color:#12602f; font-weight:600; }} td.l {{ background:#fbe3df; color:#a3261a; font-weight:600; }} td.m {{ background:#fff0d4; color:#7a4e00; font-weight:600; }}
.dl {{ font-weight:700; }}
.sh {{ display:flex; flex-direction:column; gap:.8mm; padding:1.4mm 1.4mm 1.5mm; border-top:1.1mm solid #888; align-items:center; text-align:center; }}
.sl {{ font-weight:600; line-height:1.15; }}
.chip {{ display:inline-flex; align-items:center; justify-content:center; min-width:4.1mm; height:4.1mm; border-radius:1.1mm; color:#fff; font-weight:700; font-size:7pt; vertical-align:middle; }}
.sq {{ display:inline-block; width:2.6mm; height:2.6mm; border-radius:.6mm; vertical-align:middle; margin:0 .4mm; }}
''' + ''.join(f'.c{L}{{background:{c}}} .sh.c{L}{{background:transparent;border-top-color:{c}}} ' for L, c in SCOR.items()) + f'''
.kpis {{ display:grid; grid-template-columns:repeat(4,1fr); gap:3mm; margin:1mm 0 5mm; }}
.kpi {{ background:{ROXO}; color:#fff; border-radius:2.2mm; padding:4mm 3.4mm 3.6mm; break-inside:avoid; }}
.kpi:nth-child(2) {{ background:{LARANJA}; color:#2a1700; }} .kpi:nth-child(3) {{ background:{CREME}; color:{ROXO2}; border:.6pt solid {LILAS}; }} .kpi:nth-child(4) {{ background:{ROXO2}; }}
.kn {{ font:400 24pt/1 "DM Serif Display"; }} .kt {{ font-weight:700; font-size:8pt; margin-top:2mm; line-height:1.2; }} .kd {{ font-size:7pt; margin-top:1.2mm; opacity:.88; line-height:1.25; }}
figure.chart {{ margin:0 0 5mm; padding:3.5mm 4mm 2mm; border:.6pt solid {LILAS}; border-radius:2.2mm; break-inside:avoid; }}
figure.chart figcaption {{ font:400 12pt "DM Serif Display"; color:{ROXO}; }} figure.chart svg {{ width:100%; height:auto; display:block; }}
.leg {{ font-size:7.4pt; color:#5d5675; margin:1mm 0 .5mm; display:flex; gap:5mm; }} .leg i {{ display:inline-block; width:3mm; height:3mm; margin-right:1.4mm; vertical-align:middle; border-radius:.5mm; }}
.contra {{ page:capa; width:210mm; height:296.6mm; background:linear-gradient(200deg,{ROXO2},{ROXO}); color:#fff; position:relative; break-before:page; }}
.contra .c {{ position:absolute; left:0; right:0; top:104mm; text-align:center; }} .contra img {{ width:116mm; }}
.contra .t {{ margin-top:10mm; letter-spacing:.22em; font-size:8.6pt; color:{LARANJA}; font-weight:600; }} .contra .s {{ margin-top:5mm; font-size:11pt; color:#fff; }} .contra .d {{ margin:6mm auto 0; width:120mm; font-size:8.4pt; color:{LILAS}; line-height:1.5; }}
'''

def build(pages):
    toc = ['<section class="toc"><h2>Sumário</h2>']
    for lv, txt, i in heads:
        pg = pages.get(i, '')
        m = re.match(r'^([A-Z]{2}) · (.+)$', txt)
        label = esc(txt)
        toc.append(f'<div class="row l{lv}"><span>{label}</span><i></i><b>{pg}</b></div>')
    toc.append('</section>')
    chips = ''.join(f'<span style="background:{SCOR[k]}">{k}</span>' for k in CEN)
    capa = f'''<div class="capa"><img class="logo" src="file://{IMG}/logo-negativo.svg"><div class="tag">ANÁLISE DE CENÁRIOS · ELEIÇÕES 2026</div>
<h1>Federação é um caminho para a esquerda?</h1><div class="bar"></div><div class="sub">Cenários nas Eleições de 2026: o que mudaria na Câmara, nas assembleias e para o PSB se partidos de esquerda se federassem</div>
<div class="chips">{chips}</div>
<div class="rod"><div><b>Eduardo Valdoski</b>Oficina Política</div><div style="text-align:right">27 de outubro de 2026<br>oficinapolitica.com.br</div></div></div>'''
    ficha = f'''<div class="ficha"><img src="file://{IMG}/logo-cor.svg"><dl>
<dt>Publicação</dt><dd>Federação é um caminho para a esquerda? Cenários nas Eleições de 2026</dd>
<dt>Autor</dt><dd>Eduardo Valdoski, jornalista e especialista em gestão de partidos políticos</dd>
<dt>Realização</dt><dd>Oficina Política</dd>
<dt>Data</dt><dd>27 de outubro de 2026</dd>
<dt>Dados</dt><dd>TSE, dados abertos: votação por candidato e por partido, 1º turno de 2026 (gerados em 25/10/2026), e cadastro de candidaturas.</dd>
<dt>Método</dt><dd>Divisão de cadeiras pelas regras do Código Eleitoral e da Lei 14.211/2021 e pela decisão do STF nas ADIs 7228, 7263 e 7325, aplicada estado por estado, com os votos de 2026 mantidos.</dd>
<dt>Como citar</dt><dd>VALDOSKI, Eduardo. Federação é um caminho para a esquerda? Cenários nas Eleições de 2026. Oficina Política, 2026.</dd></dl>
<div class="aviso"><b>Aviso.</b> Simulação, não previsão: mantém os votos de 2026 e ignora o limite de candidatos por lista. Confira as regras de divisão de cadeiras com a legislação e as resoluções do TSE em vigor antes de usar os números.</div></div>'''
    contra = f'''<div class="contra"><div class="c"><img src="file://{IMG}/logo-negativo.svg"><div class="t">PARA QUEM FAZ POLÍTICA BEM INFORMADO</div><div class="s">oficinapolitica.com.br</div><div class="d">A Oficina Política reúne dados eleitorais, análises e ferramentas para profissionais da política.</div></div></div>'''
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>Federação é um caminho para a esquerda? Cenários nas Eleições de 2026</title><style>{CSS}</style></head><body>{capa}{ficha}{"".join(toc)}{BODY}{contra}</body></html>'

from playwright.sync_api import sync_playwright
work = tempfile.mkdtemp()
def render(pages, path):
    hp = os.path.join(work, 'pub.html'); open(hp, 'w', encoding='utf-8').write(build(pages))
    with sync_playwright() as p:
        b = p.chromium.launch(); pg = b.new_page(); pg.goto('file://' + hp); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(600)
        pg.pdf(path=path, prefer_css_page_size=True, print_background=True, outline=True, tagged=True); b.close()
    open(os.path.join(os.path.dirname(os.path.abspath(path)), 'pub.html'), 'w', encoding='utf-8').write(open(hp, encoding='utf-8').read())
def paginas(path):
    txt = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout.split('\f')
    start = next(i for i, t in enumerate(txt) if 'Sumário' in t and i > 0)
    res = {}; cursor = start + 1
    # o sumário pode ocupar mais de uma página: avança até a primeira página com o título do 1º capítulo
    first = heads[0][1]
    while cursor < len(txt) and first not in txt[cursor].replace('\n', ' '): cursor += 1
    for lv, h, i in heads:
        key = re.sub(r'\s+', ' ', h)
        for pgi in range(cursor, len(txt)):
            tt = re.sub(r'\s+', ' ', txt[pgi])
            mu = re.match(r'^([A-Z]{2}) · (.+)$', key)
            ok = (lv == 3 and (re.search(r'\b' + mu.group(1) + r' ' + re.escape(mu.group(2)), tt) is not None)) if mu else ((lv == 2 and key.split(' · ')[-1] in tt) or (lv == 3 and key in tt))
            if ok:
                res[i] = pgi + 1; cursor = pgi; break
    return res
tmp1 = os.path.join(work, 'p1.pdf'); render({}, tmp1)
pages = paginas(tmp1); print('páginas do sumário:', len(pages), 'de', len(heads))
render(pages, out_pdf)
print('PDF', out_pdf, subprocess.run(['pdfinfo', out_pdf], capture_output=True, text=True).stdout.split('Pages:')[1].split()[0], 'páginas')
