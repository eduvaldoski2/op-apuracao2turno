"""Relatório em PDF (identidade da Oficina Política) a partir dos mesmos blocos do documento.
Uso: doc_pdf.py <est.json> <saida.pdf>
Depende de doc_json.py (monta os blocos B e os números) e de Playwright/Chromium."""
import sys, os, re, html, runpy, subprocess, tempfile
HERE = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
est_json, out_pdf = sys.argv[1], sys.argv[2]
_argv = sys.argv; sys.argv = [os.path.join(HERE, 'doc_json.py'), est_json, os.path.join(tempfile.gettempdir(), '_doc_blocos.json')]
G = runpy.run_path(sys.argv[0]); sys.argv = _argv
B = G['B']; CEN = G['CEN']; LAB = G['LAB']; tf = G['tf']; te = G['te']; fed = G['fed']; dem = G['dem']; mud = G['mud']; mudou = G['mudou']
GAIN, LOSS, MIX = G['GAIN'], G['LOSS'], G['MIX']
TITULO = 'Federação e os partidos de esquerda nas eleições 2026'
SUB = 'Composição da Câmara dos Deputados e Assembleias Legislativas em cenários de unidade do campo de esquerda'

ROXO, ROXO2, LARANJA, LILAS, CREME = '#3E347E', '#2A2260', '#F08A24', '#D9D4F0', '#FBF9F5'
SCOR = {'A': '#2B6CB0', 'B': '#F08A24', 'C': '#8E5CC8', 'D': '#D9A400', 'E': '#8B5E3C', 'F': '#2f2f3a'}
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
    if len(body) <= 14: cls += ' sm'
    return f'<table class="{cls}"><thead><tr>{head}</tr></thead><tbody>{"".join(trs)}</tbody></table>'
def list_html(l):
    tag = 'ol' if l['kind'] == 'ordered' else 'ul'
    return f'<{tag}>' + ''.join('<li>' + runs_html(i['content'][0]['content']) + '</li>' for i in l['content']) + f'</{tag}>'

# ------------------------------------------------------------------ elementos de destaque (só no PDF)
def kpis():
    perd = {p: min(fed[k][p] - fed['real'][p] for k in CEN) for p in ('UNIÃO', 'PSD', 'REPUBLICANOS')}
    gan = [tf[k] - tf['real'] for k in CEN]
    assert min(gan) == 2 and max(gan) == 19 and perd == {'UNIÃO': -4, 'PSD': -3, 'REPUBLICANOS': -3}
    cards = [
        (f'{tf["real"]} → {tf["D"]}', 'deputados federais da esquerda', f'de 2026 ao cenário D, o de maior alcance ({G["pct"](tf["real"], 513)} a {G["pct"](tf["D"], 513)} da Câmara)'),
        (f'+{min(gan)} a +{max(gan)}', 'federais a mais para a esquerda', 'em todos os seis cenários, do F (menor) ao D (maior)'),
        ('257', 'cadeiras para a maioria', f'nenhum cenário passa de {tf["D"]} para a esquerda'),
        (f'−{-perd["UNIÃO"]}', 'UNIÃO, o partido que mais perde', f'no cenário D; PSD e REPUBLICANOS perdem {-perd["PSD"]} cada')]
    h = ''.join(f'<div class="kpi"><div class="kn">{n}</div><div class="kt">{esc(t)}</div><div class="kd">{esc(s)}</div></div>' for n, t, s in cards)
    return f'<div class="kpis">{h}</div>'
def chart():
    rows = [('2026', 'real')] + [(f'{k} · {LAB[k]}', k) for k in CEN]
    W, rh, lm, rm = 680, 30, 205, 50; H = 40 + rh * len(rows) + 24
    xmax = 270; sx = lambda v: lm + (W - lm - rm) * v / xmax
    o = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Space Grotesk, sans-serif">']
    for v in (0, 50, 100, 150, 200, 250):
        o.append(f'<line x1="{sx(v):.1f}" x2="{sx(v):.1f}" y1="30" y2="{30 + rh * len(rows)}" stroke="#e4dfee" stroke-width="1"/><text x="{sx(v):.1f}" y="{H - 8}" font-size="10" fill="#5d5675" text-anchor="middle">{v}</text>')
    for i, (lab, k) in enumerate(rows):
        y = 34 + i * rh; tot = tf[k]
        col = '#9c96bd' if k == 'real' else SCOR[k]
        if k != 'real': o.append(f'<rect x="8" y="{y + 5}" width="16" height="16" rx="4" fill="{col}"/><text x="16" y="{y + 17}" font-size="10" font-weight="700" fill="#fff" text-anchor="middle">{k}</text>')
        o.append(f'<text x="{32 if k != "real" else 8}" y="{y + 17}" font-size="11" fill="#1b1530" font-weight="{600 if k == "real" else 400}">{esc(lab if k == "real" else LAB[k])}</text>')
        o.append(f'<rect x="{lm}" y="{y + 3}" width="{sx(tot) - lm:.1f}" height="20" rx="2" fill="{ROXO if k != "real" else "#9c96bd"}"/>')
        d = tot - tf['real']; lbl = f'{tot}' + ('' if k == 'real' else f' ({"+" if d > 0 else "−"}{abs(d)})')
        o.append(f'<text x="{sx(tot) + 6:.1f}" y="{y + 18}" font-size="12" font-weight="700" fill="{ROXO2}">{lbl}</text>')
    xm = sx(257)
    o.append(f'<line x1="{xm:.1f}" x2="{xm:.1f}" y1="22" y2="{30 + rh * len(rows)}" stroke="#a3261a" stroke-width="1.6" stroke-dasharray="5 3"/><text x="{xm:.1f}" y="16" font-size="10.5" font-weight="700" fill="#a3261a" text-anchor="middle">maioria: 257</text>')
    o.append('</svg>')
    return f'<figure class="chart"><figcaption>Deputados federais da esquerda por cenário</figcaption>{"".join(o)}</figure>'
def strip(k):
    e6, _ = mud(k, 6); e7, _ = mud(k, 7)
    nuf = len({u for (c, u), ks in mudou.items() if k in ks})
    d6, d7 = tf[k] - tf['real'], te[k] - te['real']
    cards = [(f'{tf["real"]} → {tf[k]}', f'deputados federais da esquerda', G['dl'](d6), d6),
             (f'{te["real"]} → {te[k]}', 'estaduais e distritais da esquerda', G['dl'](d7), d7),
             (f'{len(e6)} + {len(e7)}', 'entram (federais + estaduais), e saem outros tantos', '', 0),
             (f'{nuf}', 'estados em que muda a composição', '', 0)]
    h = ''
    for n, t, dd, v in cards:
        cls = 'pos' if v > 0 else ('neg' if v < 0 else '')
        badge = f'<span class="bd {cls}">{dd}</span>' if dd else ''
        h += f'<div class="st"><div class="sn">{n}{badge}</div><div class="stt">{esc(t)}</div></div>'
    return f'<div class="strip s{k}">{h}</div>'

# ------------------------------------------------------------------ corpo
body = B[3:]                                   # título, subtítulo e linha de data vão para a capa
heads = []                                      # (nível, texto, id, chave de busca)
out = []; first_after_h2 = False; sec = None; intro_open = False; ficha_rows = None
def close_sec():
    global intro_open
    if intro_open: out.append('</div>'); intro_open = False
    out.append('</section>')
skip_next_table = False
i_b = 0
while i_b < len(body):
    b = body[i_b]; i_b += 1
    t = b['type']
    if t == 'paragraph' and b.get('heading') == 2:
        if sec: close_sec()
        txt = plain(b['content']); sec = txt
        k, _, ti = txt.partition(' · ')
        kick, title = (k, ti) if ti else ('Oficina Política', txt)
        i = len(heads); heads.append((2, txt, f'h{i}', title))
        out.append(f'<section class="cap"><header class="opener" id="h{i}"><div class="k">{esc(kick)}</div><h2>{esc(title)}</h2></header>')
        first_after_h2 = True
        if txt == 'Introdução': out.append('<div class="intro-page">'); intro_open = True
        continue
    if t == 'paragraph' and b.get('heading') == 3:
        txt = plain(b['content'])
        first_after_h2 = False
        if txt == 'Ficha técnica':
            tb = body[i_b]; assert tb['type'] == 'table'; i_b += 1
            ficha_rows = [[plain(c['content'][0]['content']) for c in r['content']] for r in tb['content'][1:]]
            heads.append((3, txt, 'hficha', txt)); continue
        m = re.match(r'^(🟦|🟧|🟪|🟨|🟫|⬛) Cenário (\w) · (.+)$', txt)
        i = len(heads)
        if m:
            L = m.group(2)
            heads.append((3, txt, f'h{i}', f'CENÁRIO {L}'))
            out.append(f'</section><section class="cen s{L}"><header class="scenhead" id="h{i}"><div class="big">{L}</div><div><div class="k">Cenário {L}</div><h3>{esc(m.group(3))}</h3></div></header>')
            first_after_h2 = True
            continue
        if txt.startswith('1.1 '): out.append(f'<h3 id="h{i}">{esc(txt)}</h3>' + kpis() + chart()); heads.append((3, txt, f'h{i}', txt)); continue
        heads.append((3, txt, f'h{i}', txt))
        out.append(f'<h3 id="h{i}">{esc(txt)}</h3>')
        continue
    if t == 'paragraph' and b.get('heading') == 4:
        out.append(f'<h4>{runs_html(b["content"])}</h4>'); continue
    if t == 'paragraph':
        txt = plain(b['content'])
        if txt.startswith('¹ '): out.append(f'<p class="footnote">{runs_html(b["content"])}</p>'); continue
        if txt.startswith('Em síntese:'):                      # os números do cenário viram o painel de destaques
            continue
        cls = ''
        if txt.startswith('Autor:'): cls = 'autor'
        elif first_after_h2: cls = 'lead'; first_after_h2 = False
        elif all_bold(b['content']) and len(txt) < 80: cls = 'kick'
        out.append(f'<p class="{cls}">{runs_html(b["content"])}</p>')
        # painel de destaques logo após a abertura de cada cenário
        if out and 'class="scenhead"' in ''.join(out[-3:-1]) and False: pass
        continue
    if t == 'list': out.append(list_html(b)); continue
    if t == 'blockquote': out.append('<div class="nota">' + runs_html(b['content'][0]['content']) + '</div>'); continue
    if t == 'table': out.append(table_html(b)); continue
    raise SystemExit('bloco não tratado ' + t)
close_sec()
BODY = '\n'.join(out)
# painel de destaques: entra logo depois do parágrafo de abertura de cada cenário
for k in CEN:
    mk = re.search(rf'<section class="cen s{k}">.*?</header>\s*<p class="lead">.*?</p>', BODY, re.S)
    assert mk, k
    BODY = BODY[:mk.end()] + strip(k) + BODY[mk.end():]

CSS = f'''
@font-face {{ font-family:"Space Grotesk"; src:url("file://{FONTS}/space-grotesk-latin-wght-normal.woff2") format("woff2"); font-weight:300 700; unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215; }}
@font-face {{ font-family:"Space Grotesk"; src:url("file://{FONTS}/space-grotesk-latin-ext-wght-normal.woff2") format("woff2"); font-weight:300 700; unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
@font-face {{ font-family:"DM Serif Display"; src:url("file://{FONTS}/dm-serif-display-latin-400-normal.woff2") format("woff2"); font-weight:400; unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215; }}
@font-face {{ font-family:"DM Serif Display"; src:url("file://{FONTS}/dm-serif-display-latin-ext-400-normal.woff2") format("woff2"); font-weight:400; unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
@page {{ size:A4; margin:25mm 17mm 21mm 17mm;
  @top-left {{ content:"OFICINA POLÍTICA"; font:700 7pt "Space Grotesk"; letter-spacing:.16em; color:{ROXO}; border-bottom:.5pt solid {LILAS}; vertical-align:middle; width:70mm; }}
  @top-right {{ content:"FEDERAÇÃO E OS PARTIDOS DE ESQUERDA NAS ELEIÇÕES 2026"; font:500 6.4pt "Space Grotesk"; letter-spacing:.1em; color:#7d7699; border-bottom:.5pt solid {LILAS}; vertical-align:middle; }}
  @bottom-left {{ content:"Relatório · oficinapolitica.com.br"; font:400 7pt "Space Grotesk"; color:#7d7699; vertical-align:top; padding-top:4mm; }}
  @bottom-right {{ content:counter(page); font:700 9pt "Space Grotesk"; color:{ROXO}; vertical-align:top; padding-top:3.4mm; }} }}
@page capa {{ margin:0; @top-left{{content:none;border:0}} @top-right{{content:none;border:0}} @bottom-left{{content:none}} @bottom-right{{content:none}} }}
html {{ font-family:"Space Grotesk",sans-serif; color:#1b1530; font-size:9.4pt; line-height:1.45; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
body {{ margin:0; }}
/* capa */
.capa {{ page:capa; width:210mm; height:296.6mm; background:linear-gradient(160deg,{ROXO2} 0%,{ROXO} 62%,#5a4ea6 100%); color:#fff; position:relative; overflow:hidden; break-after:page; }}
.capa .logo {{ position:absolute; left:20mm; top:20mm; width:74mm; }}
.capa .tag {{ position:absolute; left:20mm; top:84mm; font-weight:600; font-size:8.6pt; letter-spacing:.22em; color:{LARANJA}; }}
.capa h1 {{ position:absolute; left:20mm; top:93mm; width:165mm; margin:0; font:400 41pt/1.07 "DM Serif Display"; }}
.capa .bar {{ position:absolute; left:20mm; top:182mm; width:24mm; height:1.6mm; background:{LARANJA}; }}
.capa .sub {{ position:absolute; left:20mm; top:189mm; width:150mm; font-size:13.5pt; font-weight:300; line-height:1.4; color:{LILAS}; }}
.capa .chips {{ position:absolute; left:20mm; top:226mm; display:flex; gap:3mm; align-items:center; }}
.capa .chips span {{ width:9mm; height:9mm; border-radius:2.2mm; display:flex; align-items:center; justify-content:center; font-weight:700; font-size:9.5pt; color:#fff; }}
.capa .chips em {{ font-style:normal; font-size:8pt; color:{LILAS}; margin-left:2mm; letter-spacing:.06em; }}
.capa .rod {{ position:absolute; left:20mm; right:20mm; bottom:18mm; display:flex; justify-content:space-between; align-items:flex-end; font-size:9pt; color:{LILAS}; border-top:.4pt solid rgba(255,255,255,.3); padding-top:5mm; }}
.capa .rod b {{ color:#fff; font-size:11pt; display:block; }}
/* sumário */
.toc {{ break-after:page; }}
.toc h2 {{ font:400 26pt "DM Serif Display"; color:{ROXO}; margin:0 0 7mm; }}
.toc .l2 {{ margin-top:5.5mm; font-weight:700; color:{ROXO2}; font-size:10.4pt; }} .toc .l2:first-of-type {{ margin-top:0; }}
.toc .l3 {{ padding-left:6mm; font-size:9pt; color:#3a3355; margin-top:1.2mm; }}
.toc .row {{ display:flex; align-items:baseline; }} .toc .row i.dots {{ flex:1; border-bottom:.5pt dotted #b6afd2; margin:0 2mm; transform:translateY(-1.2mm); }} .toc .row b {{ font-weight:700; color:{ROXO}; }}
.toc .row .chip {{ margin-right:2mm; }}
/* aberturas */
section.cap {{ break-before:page; }}
section.cen {{ break-before:page; }}
.opener {{ background:linear-gradient(120deg,{ROXO2},{ROXO}); color:#fff; border-radius:2.5mm; padding:7mm 8mm 6.5mm; margin-bottom:7mm; border-bottom:1.4mm solid {LARANJA}; break-inside:avoid; }}
.opener .k {{ font-size:7.4pt; letter-spacing:.2em; text-transform:uppercase; color:{LARANJA}; font-weight:700; }}
.opener h2 {{ margin:1.5mm 0 0; font:400 26pt/1.08 "DM Serif Display"; }}
.scenhead {{ display:flex; gap:6mm; align-items:center; color:#fff; border-radius:2.5mm; padding:6mm 8mm; margin-bottom:6mm; background:#444; break-inside:avoid; }}
.scenhead .big {{ font:400 46pt/1 "DM Serif Display"; width:17mm; text-align:center; opacity:.95; }}
.scenhead .k {{ font-size:7.4pt; letter-spacing:.2em; text-transform:uppercase; font-weight:700; opacity:.9; }}
.scenhead h3 {{ margin:1mm 0 0; font:400 21pt/1.1 "DM Serif Display"; color:#fff; padding:0; background:none; }}
.scenhead h3::before {{ display:none; }}
/* títulos */
h3 {{ font:400 15.5pt/1.15 "DM Serif Display"; color:{ROXO}; margin:8mm 0 2.6mm; padding-top:3.2mm; background:linear-gradient({LARANJA},{LARANJA}) top left/9mm .9mm no-repeat; break-after:avoid; break-inside:avoid; }}
h4 {{ font:700 10.2pt "Space Grotesk"; color:{ROXO}; margin:6.5mm 0 2mm; padding-bottom:1.2mm; border-bottom:.6pt solid {LILAS}; break-after:avoid; }}
p {{ margin:0 0 2.6mm; }} p.lead {{ font-size:11.2pt; line-height:1.4; color:{ROXO2}; margin-bottom:4.5mm; font-weight:500; }}
p.autor {{ font-size:9.4pt; color:{ROXO}; margin-bottom:3mm; padding-bottom:3mm; border-bottom:.5pt solid {LILAS}; }}
p.kick {{ font:700 8pt "Space Grotesk"; letter-spacing:.09em; text-transform:uppercase; color:{ROXO}; margin:5mm 0 1.8mm; break-after:avoid; }} p.kick b {{ font-weight:700; }}
p.footnote {{ font-size:7.8pt; color:#5d5675; border-top:.5pt solid {LILAS}; padding-top:2mm; margin:0; }}
.intro-page {{ position:relative; height:205mm; font-size:8.7pt; line-height:1.38; }} .intro-page p.lead {{ font-size:10.4pt; }} .intro-page .nota {{ font-size:8.1pt; }} .intro-page p.footnote {{ position:absolute; left:0; right:0; bottom:0; }}
ul,ol {{ margin:0 0 3mm; padding:0; list-style:none; counter-reset:n; }}
li {{ position:relative; padding-left:5mm; margin-bottom:1.8mm; break-inside:avoid; }}
ul li::before {{ content:""; position:absolute; left:.4mm; top:1.55mm; width:1.7mm; height:1.7mm; background:{LARANJA}; border-radius:.4mm; }}
ol li {{ counter-increment:n; padding-left:6.5mm; }} ol li::before {{ content:counter(n); position:absolute; left:0; top:0; font-weight:700; color:{ROXO}; }}
.nota {{ background:{CREME}; border-left:1.2mm solid {LARANJA}; padding:3mm 4mm; margin:0 0 3mm; font-size:8.6pt; break-inside:avoid; }}
b {{ font-weight:700; }}
/* tabelas */
table {{ border-collapse:collapse; width:100%; margin:1.5mm 0 5mm; font-size:8.4pt; }} table.mid {{ font-size:8pt; }} table.wide {{ font-size:7.6pt; }}
table.sm {{ break-inside:avoid; }} thead {{ display:table-header-group; }} tr {{ break-inside:avoid; }}
th {{ background:{LILAS}; color:{ROXO2}; font-weight:700; text-align:left; padding:1.6mm 1.7mm; vertical-align:bottom; border-bottom:.8pt solid {ROXO}; }}
th.ce, td.ce {{ text-align:center; }} th.scn {{ padding:0; vertical-align:top; }}
td {{ padding:1.3mm 1.7mm; border-bottom:.4pt solid #e4dfee; vertical-align:top; }}
tr.key td {{ font-weight:700; background:#f3f1fa; border-bottom:.6pt solid #c9c3e3; }}
td.g {{ background:#e1f2e6; color:#12602f; font-weight:600; }} td.l {{ background:#fbe3df; color:#a3261a; font-weight:600; }} td.m {{ background:#fff0d4; color:#7a4e00; font-weight:600; }}
.dl {{ font-weight:700; }}
.sh {{ display:flex; flex-direction:column; gap:.8mm; padding:1.4mm 1.4mm 1.5mm; border-top:1.1mm solid #888; align-items:center; text-align:center; }}
.sl {{ font-weight:600; line-height:1.15; }}
.chip {{ display:inline-flex; align-items:center; justify-content:center; min-width:4.1mm; height:4.1mm; border-radius:1.1mm; color:#fff; font-weight:700; font-size:7pt; vertical-align:middle; }}
.sq {{ display:inline-block; width:2.6mm; height:2.6mm; border-radius:.6mm; vertical-align:middle; margin:0 .4mm; }}
''' + ''.join(f'.c{L}{{background:{c}}} .sh.c{L}{{background:transparent;border-top-color:{c}}} section.cen.s{L} .scenhead{{background:linear-gradient(120deg,{c},{c}dd)}} section.cen.s{L} h4{{border-bottom-color:{c}55}} section.cen.s{L} h3{{background-image:linear-gradient({c},{c})}} .strip.s{L} .st{{border-top-color:{c}}} ' for L, c in SCOR.items()) + f'''
.scenhead.sD, section.cen.sD .scenhead {{ color:#2a1f00; }} section.cen.sD .scenhead h3, section.cen.sD .scenhead .k {{ color:#2a1f00; }}
.kpis {{ display:grid; grid-template-columns:repeat(4,1fr); gap:3mm; margin:1mm 0 5mm; }}
.kpi {{ background:{ROXO}; color:#fff; border-radius:2.2mm; padding:4mm 3.4mm 3.6mm; break-inside:avoid; }}
.kpi:nth-child(2) {{ background:{ROXO2}; }} .kpi:nth-child(3) {{ background:{CREME}; color:{ROXO2}; border:.6pt solid {LILAS}; }} .kpi:nth-child(4) {{ background:{LARANJA}; color:#2a1700; }}
.kn {{ font:400 23pt/1 "DM Serif Display"; }} .kt {{ font-weight:700; font-size:8pt; margin-top:2mm; line-height:1.2; }} .kd {{ font-size:7pt; margin-top:1.2mm; opacity:.9; line-height:1.28; }}
figure.chart {{ margin:0 0 5mm; padding:3.5mm 4mm 2mm; border:.6pt solid {LILAS}; border-radius:2.2mm; break-inside:avoid; }}
figure.chart figcaption {{ font:400 12pt "DM Serif Display"; color:{ROXO}; margin-bottom:1mm; }} figure.chart svg {{ width:100%; height:auto; display:block; }}
.strip {{ display:grid; grid-template-columns:repeat(4,1fr); gap:3mm; margin:0 0 4mm; }}
.st {{ border:.6pt solid {LILAS}; border-top:1.2mm solid #888; border-radius:1.8mm; padding:2.6mm 3mm; background:{CREME}; break-inside:avoid; }}
.sn {{ font:400 15pt/1.15 "DM Serif Display"; color:{ROXO2}; white-space:nowrap; }} .stt {{ font-size:7.2pt; color:#5d5675; margin-top:1mm; line-height:1.25; }}
.bd {{ display:inline-block; font:700 8pt "Space Grotesk"; margin-left:1.4mm; padding:.3mm 1.2mm; border-radius:1mm; vertical-align:middle; }} .bd.pos {{ background:#e1f2e6; color:#12602f; }} .bd.neg {{ background:#fbe3df; color:#a3261a; }}
/* ficha técnica e contracapa */
.ficha {{ break-before:page; }}
.ficha img {{ width:50mm; margin:6mm 0 8mm; }}
.ficha dl {{ margin:0; display:grid; grid-template-columns:34mm 1fr; gap:2.4mm 4mm; border-top:.6pt solid {LILAS}; padding-top:5mm; font-size:8.8pt; color:#3a3355; }}
.ficha dt {{ font-weight:700; color:{ROXO}; text-transform:uppercase; font-size:6.8pt; letter-spacing:.1em; padding-top:.7mm; }} .ficha dd {{ margin:0; }}
.contra {{ page:capa; width:210mm; height:296.6mm; background:linear-gradient(200deg,{ROXO2},{ROXO}); color:#fff; position:relative; break-before:page; }}
.contra .c {{ position:absolute; left:0; right:0; top:104mm; text-align:center; }} .contra img {{ width:116mm; }}
.contra .t {{ margin-top:10mm; letter-spacing:.22em; font-size:8.6pt; color:{LARANJA}; font-weight:600; }} .contra .s {{ margin-top:5mm; font-size:11pt; color:#fff; }} .contra .d {{ margin:6mm auto 0; width:120mm; font-size:8.4pt; color:{LILAS}; line-height:1.5; }}
'''

def ficha_html():
    dl = ''.join(f'<dt>{esc(a)}</dt><dd>{esc(b)}</dd>' for a, b in ficha_rows)
    return f'<section class="ficha"><h3 id="hficha">Ficha técnica</h3><img src="file://{IMG}/logo-cor.svg"><dl>{dl}</dl></section>'
def build(pages):
    toc = ['<section class="toc"><h2>Sumário</h2>']
    for lv, txt, i, key in heads:
        pg = pages.get(i, '')
        m = re.match(r'^(🟦|🟧|🟪|🟨|🟫|⬛) (Cenário \w · .+)$', txt)
        label = f'<span class="chip c{EMO[m.group(1)]}">{EMO[m.group(1)]}</span>{esc(m.group(2))}' if m else esc(txt)
        toc.append(f'<div class="row l{lv}"><span>{label}</span><i class="dots"></i><b>{pg}</b></div>')
    toc.append('</section>')
    chips = ''.join(f'<span style="background:{SCOR[k]}">{k}</span>' for k in CEN) + '<em>SEIS CENÁRIOS</em>'
    capa = f'''<div class="capa"><img class="logo" src="file://{IMG}/logo-negativo.svg"><div class="tag">RELATÓRIO · ELEIÇÕES 2026</div>
<h1>{esc(TITULO)}</h1><div class="bar"></div><div class="sub">{esc(SUB)}</div>
<div class="chips">{chips}</div>
<div class="rod"><div><b>Eduardo Valdoski</b>Oficina Política</div><div style="text-align:right">27 de outubro de 2026<br>oficinapolitica.com.br</div></div></div>'''
    contra = f'''<div class="contra"><div class="c"><img src="file://{IMG}/logo-negativo.svg"><div class="t">PARA QUEM FAZ POLÍTICA BEM INFORMADO</div><div class="s">oficinapolitica.com.br</div><div class="d">A Oficina Política reúne dados eleitorais, análises e ferramentas para profissionais da política.</div></div></div>'''
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{esc(TITULO)}</title><style>{CSS}</style></head><body>{capa}{"".join(toc)}{BODY}{ficha_html()}{contra}</body></html>'

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
    cursor = start + 1
    while cursor < len(txt) and 'Introdução' in txt[cursor] and 'Sumário' in txt[cursor]: cursor += 1
    res = {}
    for lv, h, i, key in heads:
        key = re.sub(r'\s+', ' ', key)
        for pgi in range(cursor, len(txt)):
            tt = re.sub(r'\s+', ' ', txt[pgi])
            if key in tt: res[i] = pgi + 1; cursor = pgi; break
    return res
tmp1 = os.path.join(work, 'p1.pdf'); render({}, tmp1)
pages = paginas(tmp1); print('páginas do sumário:', len(pages), 'de', len(heads))
render(pages, out_pdf)
print('PDF', out_pdf, subprocess.run(['pdfinfo', out_pdf], capture_output=True, text=True).stdout.split('Pages:')[1].split()[0], 'páginas')
