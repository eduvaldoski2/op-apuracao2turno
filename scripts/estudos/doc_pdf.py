"""Relatório em PDF (identidade da Oficina Política) a partir dos mesmos blocos do documento.
Uso: doc_pdf.py <est.json> <saida.pdf>
Depende de doc_json.py (monta os blocos B e os números) e de Playwright/Chromium."""
import sys, os, re, html, math, runpy, subprocess, tempfile, collections
HERE = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
est_json, out_pdf = sys.argv[1], sys.argv[2]
_argv = sys.argv; sys.argv = [os.path.join(HERE, 'doc_json.py'), est_json, os.path.join(tempfile.gettempdir(), '_doc_blocos.json')]
G = runpy.run_path(sys.argv[0]); sys.argv = _argv
B = G['B']; CEN = G['CEN']; LAB = G['LAB']; tf = G['tf']; te = G['te']; fed = G['fed']; est = G['est']; mud = G['mud']; mudou = G['mudou']; rotulo = G['rotulo']
GAIN, LOSS, MIX = G['GAIN'], G['LOSS'], G['MIX']
TITULO = 'Federação e os partidos de esquerda nas eleições 2026'
SUB = 'Composição da Câmara dos Deputados e Assembleias Legislativas em cenários de unidade do campo de esquerda'
SLOGAN = 'Para quem faz política sem improviso'      # o mesmo do site (index.html)

ROXO, ROXO2, ROXO3, LARANJA, LILAS, CREME = '#3E347E', '#2A2260', '#5a4ea6', '#F08A24', '#D9D4F0', '#FBF9F5'
FONTS = os.path.join(RAIZ, 'fonts'); IMG = os.path.join(RAIZ, 'img')
def esc(t): return html.escape(t, quote=False)

# ------------------------------------------------------------------ cores dos partidos
PCOL = {'PT': '#c8161d', 'PCDOB': '#9f1118', 'PV': '#3c9a3c', 'PSB': '#f58220', 'PDT': '#d4202a', 'PSOL': '#ffcc00', 'REDE': '#33a37a',
        'PL': '#1f4e9c', 'UNIÃO': '#0a9bdb', 'PP': '#3b6fb6', 'PSD': '#f2a900', 'REPUBLICANOS': '#2c2a8a', 'MDB': '#0b9444', 'PODE': '#00a99d',
        'PSDB': '#0070b9', 'CIDADANIA': '#d6407f', 'NOVO': '#f99d3e', 'AVANTE': '#2ab4c0', 'MISSÃO': '#1a1a1a', 'PRD': '#243b8a', 'SOLIDARIEDADE': '#4a6fd0'}
CLARAS = {'PSOL', 'PSD'}
LCOL = {'PL': '#1f4e9c', 'FBE': '#c8161d', 'UNIÃO/PP': '#0a9bdb', 'PSD': '#f2a900', 'REPUBLICANOS': '#2c2a8a', 'MDB': '#0b9444', 'PODE': '#00a99d',
        'PSB': '#f58220', 'PSOL/REDE': '#ffcc00', 'PSDB/CIDADANIA': '#0070b9', 'PSDB': '#0070b9', 'NOVO': '#f99d3e', 'PRD/SOLIDARIEDADE': '#243b8a',
        'PDT': '#e8272a', 'AVANTE': '#2ab4c0', 'MISSÃO': '#1a1a1a'}
def cor_lista(lab):
    u = lab.upper()
    if u in LCOL: return LCOL[u]
    if u.startswith('FBE'): return LCOL['FBE']
    if 'PSB' in u: return LCOL['PSB']
    return '#9a96b5'
def sigla(txt):
    m = re.match(r'^\**([A-Za-zÃÕÇãõç]+)', txt.strip())
    if not m: return None
    u = m.group(1).upper()
    return u if u in PCOL else None
def pill(u, txt):
    c = PCOL[u]; fg = '#1b1530' if u in CLARAS else '#fff'
    return f'<span class="pl" style="background:{c};color:{fg}">{esc(txt)}</span>'
def dot(u, txt):
    return f'<span class="nw"><i class="dt" style="background:{PCOL[u]}"></i>{txt}</span>'

# ------------------------------------------------------------------ inline
SW = {'verde': 'g', 'verde:': 'g', 'amarelo': 'm', 'amarelo:': 'm', 'vermelho': 'l', 'vermelho:': 'l'}
def runs_html(content):
    out = []
    for r in content:
        t = esc(r['text'])
        t = re.sub(r'\(([+−]\d+)\)', r'<span class="dl">(\1)</span>', t)
        if any(m['type'] == 'bold' for m in r.get('marks', [])):
            k = SW.get(r['text'].strip().lower())
            t = f'<b class="sw {k}">{t}</b>' if k else f'<b>{t}</b>'
        out.append(t)
    return ''.join(out)
def plain(content): return ''.join(r['text'] for r in content)
def all_bold(content): return bool(content) and all(any(m['type'] == 'bold' for m in r.get('marks', [])) for r in content)
UF_RE = re.compile(r'^([A-Z]{2})( · .+)?$')
def cell_html(c, header, col_center, mode):
    content = c['content'][0]['content'] if c['content'] else []
    txt = plain(content); bg = c.get('background')
    cls = []
    if bg == GAIN: cls.append('g')
    elif bg == LOSS: cls.append('l')
    elif bg == MIX: cls.append('m')
    if col_center: cls.append('ce')
    inner = runs_html(content)
    if not header:
        u = sigla(txt)
        if mode == 'pill' and u and txt.strip().upper().rstrip() in PCOL: inner = pill(u, txt.strip())
        elif mode == 'dot' and u: inner = dot(u, inner)
    tag = 'th' if header else 'td'
    return f'<{tag} class="{" ".join(cls)}">{inner}</{tag}>'
def table_html(t):
    rows = t['content']; ncol = len(rows[0]['content'])
    body = rows[1:]
    def cellplain(c): return plain(c['content'][0]['content']) if c['content'] else ''
    heads_ = [cellplain(c) for c in rows[0]['content']]
    center = []
    for j in range(ncol):
        L = [len(cellplain(r['content'][j])) for r in body] or [0]
        center.append(max(L) <= 22)
    center[0] = False
    modes = ['dot' if (j == 0 and heads_[0] == 'Partido') else ('pill' if heads_[j] == 'Partido' else '') for j in range(ncol)]
    ufcol = 0 if body and sum(bool(UF_RE.match(cellplain(r['content'][0]))) for r in body) >= 0.8 * len(body) and heads_[0] in ('UF', 'Estado') else None
    head = ''.join(cell_html(c, True, center[j], '') for j, c in enumerate(rows[0]['content']))
    trs = []; prev = None
    for r in body:
        first = r['content'][0]['content'][0]['content'] if r['content'][0]['content'] else []
        cl = []
        if all_bold(first): cl.append('key')
        if ufcol is not None:
            u = UF_RE.match(cellplain(r['content'][0]))
            cur = u.group(1) if u else None
            if prev is not None and cur != prev: cl.append('grp')
            prev = cur
        trs.append(f'<tr class="{" ".join(cl)}">' + ''.join(cell_html(c, False, center[j], modes[j]) for j, c in enumerate(r['content'])) + '</tr>')
    cls = 'wide' if ncol >= 8 else ('mid' if ncol >= 6 else '')
    if len(body) > 30: cls += ' long'
    return f'<table class="{cls}"><thead><tr>{head}</tr></thead><tbody>{"".join(trs)}</tbody></table>'
def list_html(l):
    tag = 'ol' if l['kind'] == 'ordered' else 'ul'
    return f'<{tag}>' + ''.join('<li>' + runs_html(i['content'][0]['content']) + '</li>' for i in l['content']) + f'</{tag}>'

# ------------------------------------------------------------------ plenários (hemiciclos)
def lugares(N, rows):
    r0 = 0.38; radii = [r0 + (1 - r0) * i / (rows - 1) for i in range(rows)]
    tot = sum(radii); ns = [round(N * r / tot) for r in radii]
    k = 0
    while sum(ns) != N: ns[len(ns) - 1 - (k % rows)] += 1 if sum(ns) < N else -1; k += 1
    seats = []
    for r, n in zip(radii, ns):
        for j in range(n): seats.append((math.pi * (1 - j / (n - 1)) if n > 1 else math.pi / 2, r))
    seats.sort(key=lambda s: (-round(s[0], 6), s[1]))
    d_row = (1 - r0) / (rows - 1); d_arc = math.pi * r0 / max(1, ns[0])
    return seats, 0.46 * min(d_row, d_arc)
def hemiciclo(grupos, N, rows, W):
    """grupos: [(rótulo, n, cor)] na ordem; devolve svg com N pontos."""
    seats, rad = lugares(N, rows)
    R = W / 2 - W * 0.03; cx, cy = W / 2, W / 2 * 0.97 + 2; H = cy + W * 0.02
    cores = []
    for lab, n, c in grupos: cores += [c] * n
    assert len(cores) == N, (len(cores), N)
    pts = ''.join(f'<circle cx="{cx + R * r * math.cos(th):.1f}" cy="{cy - R * r * math.sin(th):.1f}" r="{rad * R:.2f}" fill="{cores[i]}"/>' for i, (th, r) in enumerate(seats))
    return f'<svg viewBox="0 0 {W:.0f} {H:.0f}" xmlns="http://www.w3.org/2000/svg">{pts}</svg>'
def listas(dic, k, minimo=0):
    d = collections.Counter()
    for p, v in dic[k].items(): d[rotulo(p, k)] += v
    its = sorted(d.items(), key=lambda kv: (-kv[1], kv[0]))
    gr = [(a, v, cor_lista(a)) for a, v in its if v >= minimo]
    outros = sum(v for a, v in its if v < minimo)
    if outros: gr.append(('Outros', outros, '#9a96b5'))
    return gr
def nome_lista(a): return 'PT/PV/PCdoB (FBE)' if a == 'FBE' else a
def legenda(gr, big):
    cl = 'lg big' if big else 'lg'
    return f'<div class="{cl}">' + ''.join(f'<span><i style="background:{c}"></i>{esc(nome_lista(a))} <b>{n}</b></span>' for a, n, c in gr) + '</div>'
def plenario(dic, N, rows_big, rows_sm, titulo, nota):
    out = [f'<section class="plen"><h4 class="ph">{esc(titulo)}</h4><p class="pn">{esc(nota)}</p>']
    gr = listas(dic, 'real', 12 if N > 600 else 0)
    out.append(f'<figure class="big"><figcaption>2026 · resultado real <span>{N} de {N} cadeiras</span></figcaption>{hemiciclo(gr, N, rows_big, 300)}{legenda(gr, True)}</figure><div class="grid">')
    for k in CEN:
        gr = listas(dic, k, 12 if N > 600 else 0)
        out.append(f'<figure><figcaption>{esc(LAB[k])}</figcaption>{hemiciclo(gr, N, rows_sm, 220)}{legenda(gr, False)}</figure>')
    out.append('</div></section>')
    return ''.join(out)

# ------------------------------------------------------------------ destaques (só no PDF)
def kpis():
    gan = [tf[k] - tf['real'] for k in CEN]
    assert min(gan) == 2 and max(gan) == 19
    cards = [(f'{tf["real"]} → {tf["D"]}', 'deputados federais da esquerda', f'de 2026 ao cenário de maior alcance ({G["pct"](tf["real"], 513)} a {G["pct"](tf["D"], 513)} da Câmara)'),
             (f'{min(gan)} a {max(gan)}', 'deputados federais a mais para a esquerda', 'em todos os seis cenários, do de menor ao de maior alcance')]
    h = ''.join(f'<div class="kpi"><div class="kn">{n}</div><div class="kt">{esc(t)}</div><div class="kd">{esc(s)}</div></div>' for n, t, s in cards)
    return f'<div class="kpis">{h}</div>'
def chart():
    rows = [('2026', 'real')] + [(LAB[k], k) for k in CEN]
    W, rh, lm, rm = 680, 30, 190, 50; H = 40 + rh * len(rows) + 24
    xmax = 270; sx = lambda v: lm + (W - lm - rm) * v / xmax
    o = [f'<svg viewBox="0 0 {W} {H}" xmlns="http://www.w3.org/2000/svg" font-family="Space Grotesk, sans-serif">']
    for v in (0, 50, 100, 150, 200, 250):
        o.append(f'<line x1="{sx(v):.1f}" x2="{sx(v):.1f}" y1="30" y2="{30 + rh * len(rows)}" stroke="#e4dfee" stroke-width="1"/><text x="{sx(v):.1f}" y="{H - 8}" font-size="10" fill="#5d5675" text-anchor="middle">{v}</text>')
    for i, (lab, k) in enumerate(rows):
        y = 34 + i * rh; tot = tf[k]
        o.append(f'<text x="8" y="{y + 17}" font-size="11" fill="#1b1530" font-weight="{600 if k == "real" else 400}">{esc(lab)}</text>')
        o.append(f'<rect x="{lm}" y="{y + 3}" width="{sx(tot) - lm:.1f}" height="20" rx="2" fill="{"#9c96bd" if k == "real" else ROXO}"/>')
        d = tot - tf['real']; lbl = f'{tot}' + ('' if k == 'real' else f' ({"+" if d > 0 else "−"}{abs(d)})')
        o.append(f'<text x="{sx(tot) + 6:.1f}" y="{y + 18}" font-size="12" font-weight="700" fill="{ROXO2}">{lbl}</text>')
    xm = sx(257)
    o.append(f'<line x1="{xm:.1f}" x2="{xm:.1f}" y1="22" y2="{30 + rh * len(rows)}" stroke="{LARANJA}" stroke-width="1.6" stroke-dasharray="5 3"/><text x="{xm:.1f}" y="16" font-size="10.5" font-weight="700" fill="#b45f06" text-anchor="middle">maioria: 257</text>')
    o.append('</svg>')
    return f'<figure class="chart"><figcaption>Deputados federais da esquerda por cenário</figcaption>{"".join(o)}</figure>'
def strip(k):
    nuf = len({u for (c, u), ks in mudou.items() if k in ks})
    d6, d7 = tf[k] - tf['real'], te[k] - te['real']
    cards = [(f'{tf["real"]} → {tf[k]}', 'deputados federais da esquerda', G['dl'](d6), d6),
             (f'{te["real"]} → {te[k]}', 'estaduais e distritais da esquerda', G['dl'](d7), d7),
             (f'{nuf}', 'estados em que muda a composição', '', 0)]
    h = ''
    for n, t, dd, v in cards:
        cls = 'pos' if v > 0 else ('neg' if v < 0 else '')
        badge = f'<span class="bd {cls}">{dd}</span>' if dd else ''
        h += f'<div class="st"><div class="sn">{n}{badge}</div><div class="stt">{esc(t)}</div></div>'
    return f'<div class="strip">{h}</div>'

# ------------------------------------------------------------------ corpo
body = B[3:]                                   # título, subtítulo e linha de data vão para a capa
heads = []                                      # (nível, texto, id, chave)
out = []; first_after_h2 = False; sec = None; intro_open = False; ficha_rows = None
def close_sec():
    global intro_open, sec
    if intro_open: out.append('</div>'); intro_open = False
    if sec: out.append('</section>'); sec = None
def h3s_ate_proximo_h2(i):
    r = []
    while i < len(body) and not (body[i]['type'] == 'paragraph' and body[i].get('heading') == 2):
        if body[i]['type'] == 'paragraph' and body[i].get('heading') == 3 and plain(body[i]['content']) != 'Ficha técnica': r.append(plain(body[i]['content']))
        i += 1
    return r
i_b = 0
while i_b < len(body):
    b = body[i_b]; i_b += 1
    t = b['type']
    if t == 'paragraph' and b.get('heading') == 2:
        close_sec()
        txt = plain(b['content'])
        k, _, ti = txt.partition(' · ')
        i = len(heads)
        if txt.startswith('Capítulo'):
            num = re.search(r'\d+', k).group()
            lead = plain(body[i_b]['content']); i_b += 1
            itens = h3s_ate_proximo_h2(i_b)
            heads.append((2, txt, f'h{i}', ti))
            lis = ''.join(f'<li>{esc(x)}</li>' for x in itens)
            out.append(f'<section class="divider"><img class="dlogo" src="file://{IMG}/logo-negativo.svg"><div class="num">{num}</div><div class="kk">Capítulo {num}</div><h2 id="h{i}">{esc(ti)}</h2><div class="bar"></div><p class="dlead">{esc(lead)}</p><div class="dk">Neste capítulo</div><ul class="dtoc">{lis}</ul></section>')
            sec = 'cap'; out.append('<section class="chbody">')
            first_after_h2 = False
            continue
        heads.append((2, txt, f'h{i}', txt))
        sec = 'cap'
        out.append(f'<section class="cap"><header class="opener" id="h{i}"><div class="k">Oficina Política</div><h2>{esc(txt)}</h2></header>')
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
        i = len(heads)
        if txt in {LAB[k] for k in CEN}:
            heads.append((3, txt, f'h{i}', re.compile(r'CENÁRIO ' + re.escape(txt) + r'(?!\s*\+)')))
            out.append(f'</section><section class="cen"><header class="scenhead" id="h{i}"><div class="k">Cenário</div><h3>{esc(txt)}</h3></header>')
            first_after_h2 = True
            continue
        cls = ' class="pb"' if txt.startswith('1.5 ') else ''
        heads.append((3, txt, f'h{i}', txt))
        if txt.startswith('1.1 '): out.append(f'<h3 id="h{i}">{esc(txt)}</h3>' + kpis() + chart()); continue
        out.append(f'<h3 id="h{i}"{cls}>{esc(txt)}</h3>')
        continue
    if t == 'paragraph' and b.get('heading') == 4:
        out.append(f'<h4>{runs_html(b["content"])}</h4>'); continue
    if t == 'paragraph':
        txt = plain(b['content'])
        if txt.startswith('¹ '): out.append(f'<p class="footnote">{runs_html(b["content"])}</p>'); continue
        if txt.startswith('Em síntese:'): continue                    # os números do cenário viram o painel de destaques
        cls = []
        if txt.startswith('Autor:'): cls.append('autor')
        elif first_after_h2: cls.append('lead'); first_after_h2 = False
        elif all_bold(b['content']) and len(txt) < 80: cls.append('kick')
        if i_b < len(body) and body[i_b]['type'] == 'table': cls.append('pre')
        out.append(f'<p class="{" ".join(cls)}">{runs_html(b["content"])}</p>')
        continue
    if t == 'list': out.append(list_html(b)); continue
    if t == 'blockquote': out.append('<div class="nota">' + runs_html(b['content'][0]['content']) + '</div>'); continue
    if t == 'table': out.append(table_html(b)); continue
    raise SystemExit('bloco não tratado ' + t)
close_sec()
BODY = '\n'.join(out)
BODY = BODY.replace('<section class="chbody">\n</section>', '')
for k in CEN:                                   # painel de destaques logo depois da abertura de cada cenário
    mk = re.search(r'<header class="scenhead" id="h\d+"><div class="k">Cenário</div><h3>' + re.escape(esc(LAB[k])) + r'</h3></header>\s*<p class="lead">.*?</p>', BODY, re.S)
    assert mk, k
    BODY = BODY[:mk.end()] + strip(k) + BODY[mk.end():]
# plenários: assembleias antes da 1.5; Câmara antes da 1.6
nota_c = 'Cada ponto é um deputado; as cores seguem os partidos e as federações de cada cenário.'
fig_est = plenario(est, 1059, 14, 12, 'Assembleias Legislativas e Câmara Legislativa do DF em cada cenário (1.059 cadeiras)', 'Cada ponto é um deputado estadual ou distrital; listas com menos de 12 cadeiras aparecem em "Outros".')
fig_fed = plenario(fed, 513, 10, 8, 'Câmara dos Deputados em cada cenário (513 cadeiras)', nota_c)
m5 = re.search(r'<h3 id="h\d+" class="pb">1\.5 ', BODY); m6 = re.search(r'<h3 id="h\d+">1\.6 ', BODY)
assert m5 and m6
BODY = BODY[:m6.start()] + fig_fed + fig_est + BODY[m6.start():]

CSS = f'''
@font-face {{ font-family:"Space Grotesk"; src:url("file://{FONTS}/space-grotesk-latin-wght-normal.woff2") format("woff2"); font-weight:300 700; unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215; }}
@font-face {{ font-family:"Space Grotesk"; src:url("file://{FONTS}/space-grotesk-latin-ext-wght-normal.woff2") format("woff2"); font-weight:300 700; unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
@font-face {{ font-family:"DM Serif Display"; src:url("file://{FONTS}/dm-serif-display-latin-400-normal.woff2") format("woff2"); font-weight:400; unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215; }}
@font-face {{ font-family:"DM Serif Display"; src:url("file://{FONTS}/dm-serif-display-latin-ext-400-normal.woff2") format("woff2"); font-weight:400; unicode-range:U+0100-02AF,U+1E00-1EFF,U+2020,U+20A0-20AB,U+20AD-20CF,U+2113,U+2C60-2C7F,U+A720-A7FF; }}
@page {{ size:A4; margin:25mm 17mm 21mm 17mm; }}
/* páginas pares (esquerda): cabeçalho "OFICINA POLÍTICA" e número à esquerda, com "Relatório" ao lado */
@page :left {{
  @top-left {{ content:"OFICINA POLÍTICA"; font:700 7pt "Space Grotesk"; letter-spacing:.16em; color:{ROXO}; border-bottom:.5pt solid {LILAS}; vertical-align:middle; width:100%; }}
  @bottom-left {{ content:counter(page) "   Relatório"; font:700 8.4pt "Space Grotesk"; color:{ROXO}; vertical-align:top; padding-top:3.4mm; width:100%; text-align:left; }} }}
/* páginas ímpares (direita): título à direita e número à direita, com o site ao lado */
@page :right {{
  @top-right {{ content:"FEDERAÇÃO E OS PARTIDOS DE ESQUERDA NAS ELEIÇÕES 2026"; font:700 7pt "Space Grotesk"; letter-spacing:.12em; color:{ROXO}; border-bottom:.5pt solid {LILAS}; vertical-align:middle; width:100%; text-align:right; }}
  @bottom-right {{ content:"oficinapolitica.com.br   " counter(page); font:700 8.4pt "Space Grotesk"; color:{ROXO}; vertical-align:top; padding-top:3.4mm; width:100%; text-align:right; }} }}
@page capa {{ margin:0; @top-left{{content:none;border:0}} @top-right{{content:none;border:0}} @bottom-left{{content:none}} @bottom-right{{content:none}} }}
html {{ font-family:"Space Grotesk",sans-serif; color:#1b1530; font-size:9.4pt; line-height:1.45; -webkit-print-color-adjust:exact; print-color-adjust:exact; }}
body {{ margin:0; }}
/* capa e contracapa */
.capa {{ page:capa; width:210mm; height:296.6mm; background:linear-gradient(160deg,{ROXO2} 0%,{ROXO} 62%,{ROXO3} 100%); color:#fff; position:relative; overflow:hidden; break-after:page; }}
.capa .logo {{ position:absolute; left:20mm; top:20mm; width:74mm; }}
.capa .tag {{ position:absolute; left:20mm; top:92mm; font-weight:600; font-size:8.6pt; letter-spacing:.22em; color:{LARANJA}; }}
.capa h1 {{ position:absolute; left:20mm; top:101mm; width:165mm; margin:0; font:400 41pt/1.07 "DM Serif Display"; }}
.capa .bar {{ position:absolute; left:20mm; top:190mm; width:24mm; height:1.6mm; background:{LARANJA}; }}
.capa .sub {{ position:absolute; left:20mm; top:197mm; width:150mm; font-size:13.5pt; font-weight:300; line-height:1.4; color:{LILAS}; }}
.capa .rod {{ position:absolute; left:20mm; right:20mm; bottom:18mm; display:flex; justify-content:space-between; align-items:flex-end; font-size:9pt; color:{LILAS}; border-top:.4pt solid rgba(255,255,255,.3); padding-top:5mm; }}
.capa .rod b {{ color:#fff; font-size:11pt; display:block; }}
.contra {{ page:capa; width:210mm; height:296.6mm; background:linear-gradient(200deg,{ROXO2},{ROXO}); color:#fff; position:relative; break-before:page; }}
.contra .c {{ position:absolute; left:0; right:0; top:112mm; display:flex; flex-direction:column; align-items:center; }}
.contra .c img {{ width:116mm; display:block; }}
.contra .t {{ margin-top:3.3mm; font:600 3.1mm/1.35 "Space Grotesk"; letter-spacing:.26em; text-transform:uppercase; color:{LILAS}; padding-left:.26em; white-space:nowrap; }}
.contra .s {{ margin-top:16mm; font-size:11pt; color:#fff; }}
/* sumário */
.toc {{ break-after:page; }}
.toc h2 {{ font:400 26pt "DM Serif Display"; color:{ROXO}; margin:0 0 7mm; }}
.toc .l2 {{ margin-top:5.5mm; font-weight:700; color:{ROXO2}; font-size:10.4pt; }} .toc .l2:first-of-type {{ margin-top:0; }}
.toc .l3 {{ padding-left:6mm; font-size:9pt; color:#3a3355; margin-top:1.2mm; }}
.toc .row {{ display:flex; align-items:baseline; }} .toc .row i.dots {{ flex:1; border-bottom:.5pt dotted #b6afd2; margin:0 2mm; transform:translateY(-1.2mm); }} .toc .row b {{ font-weight:700; color:{ROXO}; }}
/* abertura de capítulo (página própria) */
.divider {{ page:capa; width:210mm; height:296.6mm; background:linear-gradient(160deg,{ROXO2} 0%,{ROXO} 70%,{ROXO3} 100%); color:#fff; position:relative; break-before:page; break-after:page; overflow:hidden; }}
.divider .dlogo {{ position:absolute; left:20mm; top:20mm; width:52mm; }}
.divider .num {{ position:absolute; left:20mm; top:70mm; font:400 150pt/1 "DM Serif Display"; color:{LARANJA}; }}
.divider .kk {{ position:absolute; left:20mm; top:140mm; font:600 9pt "Space Grotesk"; letter-spacing:.22em; text-transform:uppercase; color:{LILAS}; }}
.divider h2 {{ position:absolute; left:20mm; top:149mm; width:165mm; margin:0; font:400 38pt/1.08 "DM Serif Display"; }}
.divider .bar {{ position:absolute; left:20mm; top:190mm; width:24mm; height:1.6mm; background:{LARANJA}; }}
.divider .dlead {{ position:absolute; left:20mm; top:198mm; width:150mm; margin:0; font-size:11.2pt; font-weight:300; line-height:1.5; color:{LILAS}; }}
.divider .dk {{ position:absolute; left:20mm; bottom:57mm; font:700 7.4pt "Space Grotesk"; letter-spacing:.2em; text-transform:uppercase; color:{LARANJA}; }}
.divider .dtoc {{ position:absolute; left:20mm; right:20mm; bottom:20mm; margin:0; padding:0; list-style:none; columns:2; column-gap:8mm; font-size:8.6pt; color:#fff; }}
.divider .dtoc li {{ padding-left:0; margin-bottom:1.6mm; }} .divider .dtoc li::before {{ display:none; }}
/* aberturas */
section.cap {{ break-before:page; }}
section.cen {{ break-before:page; }}
.opener {{ background:linear-gradient(120deg,{ROXO2},{ROXO}); color:#fff; border-radius:2.5mm; padding:7mm 8mm 6.5mm; margin-bottom:7mm; border-bottom:1.4mm solid {LARANJA}; break-inside:avoid; }}
.opener .k {{ font-size:7.4pt; letter-spacing:.2em; text-transform:uppercase; color:{LARANJA}; font-weight:700; }}
.opener h2 {{ margin:1.5mm 0 0; font:400 26pt/1.08 "DM Serif Display"; }}
.scenhead {{ background:linear-gradient(120deg,{ROXO2},{ROXO}); color:#fff; border-radius:2.5mm; padding:6mm 8mm 6.5mm; margin-bottom:6mm; border-bottom:1.4mm solid {LARANJA}; break-inside:avoid; }}
.scenhead .k {{ font-size:7.4pt; letter-spacing:.2em; text-transform:uppercase; color:{LARANJA}; font-weight:700; }}
.scenhead h3 {{ margin:1.5mm 0 0; font:400 23pt/1.1 "DM Serif Display"; color:#fff; padding:0; background:none; }}
/* títulos */
h3 {{ font:400 15.5pt/1.15 "DM Serif Display"; color:{ROXO}; margin:8mm 0 2.6mm; padding-top:3.2mm; background:linear-gradient({LARANJA},{LARANJA}) top left/9mm .9mm no-repeat; break-after:avoid; break-inside:avoid; }}
h3.pb {{ break-before:page; margin-top:0; }}
.chbody > h3:first-child {{ margin-top:0; }}
h4 {{ font:700 10.2pt "Space Grotesk"; color:{ROXO}; margin:6.5mm 0 2mm; padding-bottom:1.2mm; border-bottom:.6pt solid {LILAS}; break-after:avoid; }}
p {{ margin:0 0 2.6mm; }} p.lead {{ font-size:11.2pt; line-height:1.4; color:{ROXO2}; margin-bottom:4.5mm; font-weight:500; }} p.pre {{ break-after:avoid; }}
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
b.sw {{ padding:.2mm 1.4mm; border-radius:1mm; }} b.sw.g {{ background:#e1f2e6; color:#12602f; }} b.sw.m {{ background:#fff0d4; color:#7a4e00; }} b.sw.l {{ background:#fbe3df; color:#a3261a; }}
/* tabelas: nunca quebram entre páginas */
table {{ border-collapse:collapse; width:100%; margin:1.5mm 0 5mm; font-size:8.4pt; break-inside:avoid; }} table.mid {{ font-size:8pt; }} table.wide {{ font-size:7.6pt; }} table.long {{ font-size:7.8pt; }}
thead {{ display:table-header-group; }} tr {{ break-inside:avoid; }}
th {{ background:{LILAS}; color:{ROXO2}; font-weight:700; text-align:left; padding:1.6mm 1.7mm; vertical-align:bottom; border-bottom:.8pt solid {ROXO}; }}
th.ce, td.ce {{ text-align:center; }}
td {{ padding:1.3mm 1.7mm; border-bottom:.4pt solid #e4dfee; vertical-align:top; }}
tr.grp td {{ border-top:1.3pt solid {ROXO}; }}
tr.key td {{ font-weight:700; background:#f3f1fa; border-bottom:.6pt solid #c9c3e3; }}
td.g {{ background:#e1f2e6; color:#12602f; font-weight:600; }} td.l {{ background:#fbe3df; color:#a3261a; font-weight:600; }} td.m {{ background:#fff0d4; color:#7a4e00; font-weight:600; }}
.dl {{ font-weight:700; }}
.pl {{ display:inline-block; padding:.2mm 1.8mm; border-radius:1.2mm; font-weight:700; font-size:.92em; letter-spacing:.02em; }}
.nw {{ white-space:nowrap; }}
.dt {{ display:inline-block; width:2.4mm; height:2.4mm; border-radius:50%; margin-right:1.6mm; vertical-align:-.2mm; }}
.kpis {{ display:grid; grid-template-columns:repeat(2,1fr); gap:3mm; margin:1mm 0 5mm; }}
.kpi {{ background:{ROXO}; color:#fff; border-radius:2.2mm; padding:4.4mm 4.4mm 4mm; break-inside:avoid; }} .kpi:nth-child(2) {{ background:{ROXO2}; }}
.kn {{ font:400 28pt/1 "DM Serif Display"; }} .kt {{ font-weight:700; font-size:8.8pt; margin-top:2.2mm; line-height:1.2; }} .kd {{ font-size:7.6pt; margin-top:1.3mm; opacity:.9; line-height:1.28; }}
figure.chart {{ margin:0 0 5mm; padding:3.5mm 4mm 2mm; border:.6pt solid {LILAS}; border-radius:2.2mm; break-inside:avoid; }}
figure.chart figcaption {{ font:400 12pt "DM Serif Display"; color:{ROXO}; margin-bottom:1mm; }} figure.chart svg {{ width:100%; height:auto; display:block; }}
.strip {{ display:grid; grid-template-columns:repeat(3,1fr); gap:3mm; margin:0 0 4mm; }}
.st {{ border:.6pt solid {LILAS}; border-top:1.2mm solid {ROXO}; border-radius:1.8mm; padding:2.6mm 3mm; background:{CREME}; break-inside:avoid; }}
.sn {{ font:400 15pt/1.15 "DM Serif Display"; color:{ROXO2}; white-space:nowrap; }} .stt {{ font-size:7.2pt; color:#5d5675; margin-top:1mm; line-height:1.25; }}
.bd {{ display:inline-block; font:700 8pt "Space Grotesk"; margin-left:1.4mm; padding:.3mm 1.2mm; border-radius:1mm; vertical-align:middle; }} .bd.pos {{ background:#e1f2e6; color:#12602f; }} .bd.neg {{ background:#fbe3df; color:#a3261a; }}
/* plenários */
.plen {{ break-before:page; break-inside:avoid; }}
.plen .ph {{ margin-top:0; }} .plen .pn {{ font-size:8.2pt; color:#5d5675; margin-bottom:3mm; }}
.plen figure {{ margin:0; break-inside:avoid; }}
.plen figcaption {{ font:400 10.5pt/1.15 "DM Serif Display"; color:{ROXO}; margin-bottom:.8mm; }} .plen figcaption span {{ font:500 7.4pt "Space Grotesk"; color:#5d5675; margin-left:2mm; }}
.plen svg {{ width:100%; height:auto; display:block; }}
.plen figure.big {{ border:.6pt solid {LILAS}; border-radius:2.4mm; padding:4mm 5mm 4mm; margin-bottom:4mm; }} .plen figure.big svg {{ width:76%; margin:0 auto; }}
.plen .grid {{ display:grid; grid-template-columns:repeat(3,1fr); gap:4mm 4mm; }}
.plen .grid figure {{ border:.5pt solid #e4dfee; border-radius:2mm; padding:2.4mm 2.4mm 2mm; }}
.lg {{ display:flex; flex-wrap:wrap; gap:.8mm 2mm; margin-top:1mm; font-size:5.8pt; color:#3a3355; }} .lg span {{ white-space:nowrap; }} .lg i {{ display:inline-block; width:1.9mm; height:1.9mm; border-radius:50%; margin-right:.8mm; vertical-align:-.1mm; }} .lg b {{ font-weight:700; color:#1b1530; }}
.lg.big {{ gap:1.6mm 2mm; font-size:7.6pt; margin-top:2.2mm; justify-content:center; }} .lg.big span {{ border:.5pt solid #e4dfee; border-radius:2mm; padding:.8mm 2mm; }} .lg.big i {{ width:2.4mm; height:2.4mm; }}
/* ficha técnica */
.ficha {{ break-before:page; }}
.ficha img {{ width:50mm; margin:6mm 0 8mm; }}
.ficha dl {{ margin:0; display:grid; grid-template-columns:34mm 1fr; gap:2.4mm 4mm; border-top:.6pt solid {LILAS}; padding-top:5mm; font-size:8.8pt; color:#3a3355; }}
.ficha dt {{ font-weight:700; color:{ROXO}; text-transform:uppercase; font-size:6.8pt; letter-spacing:.1em; padding-top:.7mm; }} .ficha dd {{ margin:0; }}
'''

def ficha_html():
    dl = ''.join(f'<dt>{esc(a)}</dt><dd>{esc(b)}</dd>' for a, b in ficha_rows)
    return f'<section class="ficha"><h3 id="hficha">Ficha técnica</h3><img src="file://{IMG}/logo-cor.svg"><dl>{dl}</dl></section>'
def build(pages):
    toc = ['<section class="toc"><h2>Sumário</h2>']
    for lv, txt, i, key in heads:
        toc.append(f'<div class="row l{lv}"><span>{esc(txt if lv == 3 or not txt.startswith("Capítulo") else txt)}</span><i class="dots"></i><b>{pages.get(i, "")}</b></div>')
    toc.append('</section>')
    capa = f'''<div class="capa"><img class="logo" src="file://{IMG}/logo-negativo.svg"><div class="tag">RELATÓRIO · ELEIÇÕES 2026</div>
<h1>{esc(TITULO)}</h1><div class="bar"></div><div class="sub">{esc(SUB)}</div>
<div class="rod"><div><b>Eduardo Valdoski</b>Oficina Política</div><div style="text-align:right">27 de outubro de 2026<br>oficinapolitica.com.br</div></div></div>'''
    contra = f'''<div class="contra"><div class="c"><img src="file://{IMG}/logo-negativo.svg"><div class="t">{esc(SLOGAN)}</div><div class="s">oficinapolitica.com.br</div></div></div>'''
    return f'<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><title>{esc(TITULO)}</title><style>{CSS}</style></head><body>{capa}{"".join(toc)}{BODY}{ficha_html()}{contra}</body></html>'

if __name__ != 'op_lib':
    from playwright.sync_api import sync_playwright
    work = tempfile.mkdtemp()
    def render(pages, path):
        hp = os.path.join(work, 'pub.html'); open(hp, 'w', encoding='utf-8').write(build(pages))
        with sync_playwright() as p:
            b = p.chromium.launch(); pg = b.new_page(); pg.goto('file://' + hp); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(800)
            pg.pdf(path=path, prefer_css_page_size=True, print_background=True, outline=True, tagged=True); b.close()
        open(os.path.join(os.path.dirname(os.path.abspath(path)), 'pub.html'), 'w', encoding='utf-8').write(open(hp, encoding='utf-8').read())
    def paginas(path):
        txt = subprocess.run(['pdftotext', '-layout', path, '-'], capture_output=True, text=True).stdout.split('\f')
        start = next(i for i, t in enumerate(txt) if 'Sumário' in t and i > 0)
        cursor = start + 1; res = {}
        for lv, h, i, key in heads:
            for pgi in range(cursor, len(txt)):
                tt = re.sub(r'\s+', ' ', txt[pgi])
                ok = key.search(tt) if hasattr(key, 'search') else (re.sub(r'\s+', ' ', key) in tt)
                if ok: res[i] = pgi + 1; cursor = pgi + (1 if lv == 2 and h.startswith('Capítulo') else 0); break
        return res
    tmp1 = os.path.join(work, 'p1.pdf'); render({}, tmp1)
    pages = paginas(tmp1); print('páginas do sumário:', len(pages), 'de', len(heads))
    render(pages, out_pdf)
    print('PDF', out_pdf, subprocess.run(['pdfinfo', out_pdf], capture_output=True, text=True).stdout.split('Pages:')[1].split()[0], 'páginas')
