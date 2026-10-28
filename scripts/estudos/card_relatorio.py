"""Card de divulgação do relatório (tabela 1.3: os sete partidos da esquerda), nos formatos 1:1, 4:5 e 9:16.
Uso: card_relatorio.py <est.json> <pasta_saida>"""
import sys, os, re, html, io, runpy
HERE = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
est_json, outdir = sys.argv[1:3]; os.makedirs(outdir, exist_ok=True)
_a = sys.argv; sys.argv = [os.path.join(HERE, 'doc_json.py'), est_json, os.devnull]
G = runpy.run_path(sys.argv[0]); sys.argv = _a
B, tf, CEN, LAB, GAIN, LOSS = G['B'], G['tf'], G['CEN'], G['LAB'], G['GAIN'], G['LOSS']
esc = lambda t: html.escape(t, quote=False)
plain = lambda c: ''.join(r['text'] for r in c)

# --- tabela 1.3 "Os sete partidos de esquerda" (federais), lida direto dos blocos do relatório
idx = next(i for i, b in enumerate(B) if b['type'] == 'paragraph' and plain(b['content']).startswith('Os sete partidos'))
T = B[idx + 1]; assert T['type'] == 'table'
rows = [[(plain(c['content'][0]['content']) if c['content'] else '', c.get('background')) for c in r['content']] for r in T['content']]
head, body = rows[0], rows[1:]
assert [h for h, _ in head][0] == 'Partido' and len(head) == 8, head
assert body[-1][0][0] == 'Esquerda' and len(body) == 8
# conferência com os números do relatório
real, mx = tf['real'], max(tf[k] for k in CEN); mn = min(tf[k] for k in CEN)
assert body[-1][1][0] == str(real) and body[-1][2][0].startswith(str(tf['D'])), body[-1]
assert (real, mn, mx) == (124, 126, 143), (real, mn, mx)
tot = [int(re.match(r'\d+', c[0]).group()) for c in body[-1][1:]]
assert sorted(tot) == sorted([real] + [tf[k] for k in CEN]), tot

PCOL = {'PT': '#c8161d', 'PCdoB': '#9f1118', 'PV': '#3c9a3c', 'PSB': '#f58220', 'PDT': '#d4202a', 'PSOL': '#ffcc00', 'Rede': '#33a37a'}
URL = 'https://oficinapolitica.com.br/federacao-esquerda-2026/'
URL_TXT = 'oficinapolitica.com.br/federacao-esquerda-2026'
import segno
buf = io.BytesIO(); segno.make(URL + '?utm_source=card&utm_medium=social', error='m').save(buf, kind='svg', scale=1, border=2, dark='#2A2260', light='#ffffff', xmldecl=False, svgns=True, nl=False)
_svg = buf.getvalue().decode(); _w, _h = re.search(r'width="(\d+)" height="(\d+)"', _svg).groups()
QR = re.sub(r'\s(width|height)="[^"]*"', '', _svg, count=2).replace('<svg ', f'<svg viewBox="0 0 {_w} {_h}" width="100%" height="100%" shape-rendering="crispEdges" ', 1)
FONTS = os.path.join(RAIZ, 'fonts'); IMG = os.path.join(RAIZ, 'img')

def tabela():
    th = ''.join(f'<th class="{"p" if j == 0 else ""}">{esc(h).replace("/", "/<wbr>")}</th>' for j, (h, _) in enumerate(head))
    trs = []
    for r in body:
        tot = r[0][0] == 'Esquerda'
        tds = []
        for j, (t, bg) in enumerate(r):
            if j == 0:
                dot = f'<i style="background:{PCOL[t]}"></i>' if t in PCOL else ''
                tds.append(f'<td class="p">{dot}{esc(t)}</td>')
            else:
                m = re.match(r'^(\d+)(?: \(([+−]\d+)\))?$', t.strip()); n, d = (m.group(1), m.group(2)) if m else (t, None)
                cls = 'g' if bg == GAIN else ('l' if bg == LOSS else '')
                tds.append(f'<td class="{cls}"><b>{n}</b>' + (f'<span>{d}</span>' if d else '') + '</td>')
        trs.append(f'<tr class="{"tot" if tot else ""}">' + ''.join(tds) + '</tr>')
    return f'<table><thead><tr>{th}</tr></thead><tbody>{"".join(trs)}</tbody></table>'

TITULO = f'Unida em federações, a esquerda poderia ter até {mx} deputados federais'
SUBT = f'Hoje são {real}. Veja partido a partido nos seis cenários.'
LEG = ('Deputados federais dos sete partidos da esquerda em 2026 e em seis cenários de federação, '
       'calculados com os votos de 2026, estado por estado. Entre parênteses, a diferença para o resultado real. '
       '<b class="g">Verde</b>: ganha cadeiras. <b class="l">Vermelho</b>: cede cadeira a outro partido da esquerda; no conjunto, a esquerda só ganha.')

FORMATOS = {
    '1x1':  dict(w=1080, h=1080, pad=48, top=40, bot=40, tit=50, sub=25, th=19, td=26, sm=15, row=47, leg=17, rod=24, qr=148, logo=210, gap=16),
    '4x5':  dict(w=1080, h=1350, pad=52, top=50, bot=48, tit=54, sub=27, th=19, td=28, sm=17, row=59, leg=19, rod=27, qr=156, logo=240, gap=20),
    '9x16': dict(w=1080, h=1920, pad=56, top=250, bot=330, tit=62, sub=29, th=19, td=29, sm=17, row=67, leg=21, rod=28, qr=168, logo=250, gap=22),
}
def pagina(f):
    return f'''<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><style>
@font-face{{font-family:"DM Serif Display";src:url("file://{FONTS}/dm-serif-display-latin-400-normal.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215}}
@font-face{{font-family:"DM Serif Display";src:url("file://{FONTS}/dm-serif-display-latin-ext-400-normal.woff2") format("woff2");unicode-range:U+0100-02AF,U+1E00-1EFF}}
@font-face{{font-family:"Space Grotesk";src:url("file://{FONTS}/space-grotesk-latin-wght-normal.woff2") format("woff2");font-weight:300 700;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215}}
@font-face{{font-family:"Space Grotesk";src:url("file://{FONTS}/space-grotesk-latin-ext-wght-normal.woff2") format("woff2");font-weight:300 700;unicode-range:U+0100-02AF,U+1E00-1EFF}}
*{{box-sizing:border-box;margin:0}}
html,body{{width:{f['w']}px;height:{f['h']}px;overflow:hidden}}
body{{font-family:"Space Grotesk",sans-serif;color:#1b1530;background:linear-gradient(165deg,#2A2260 0%,#3E347E 62%,#5a4ea6 100%);position:relative}}
.c{{position:absolute;inset:0;padding:{f['top']}px {f['pad']}px {f['bot']}px;display:flex;flex-direction:column;gap:{f['gap']}px}}
.topo{{display:flex;align-items:center;justify-content:space-between}}
.topo img{{width:{f['logo']}px;display:block}}
.sel{{font:700 {f['sm']+3}px/1 "Space Grotesk";letter-spacing:.16em;text-transform:uppercase;color:#2a1700;background:#F08A24;padding:{f['sm']*.7:.0f}px {f['sm']*1.2:.0f}px;border-radius:999px}}
h1{{font:400 {f['tit']}px/1.07 "DM Serif Display";color:#fff;letter-spacing:-.005em}}
.sub{{font:400 {f['sub']}px/1.3 "Space Grotesk";color:#D9D4F0;margin-top:-{f['gap']*.35:.0f}px}}
.sub b{{color:#F08A24;font-weight:700}}
.painel{{background:#fff;border-radius:22px;padding:{f['gap']*.9:.0f}px {f['gap']*.9:.0f}px {f['gap']*.7:.0f}px;box-shadow:0 22px 40px -20px rgba(0,0,0,.45)}}
table{{width:100%;border-collapse:collapse;table-layout:fixed}}
th{{font:700 {f['th']}px/1.15 "Space Grotesk";color:#2A2260;background:#D9D4F0;text-align:center;padding:{f['th']*.5:.0f}px 4px;vertical-align:bottom}}
th:first-child{{border-radius:10px 0 0 10px}}th:last-child{{border-radius:0 10px 10px 0}}
th.p,td.p{{text-align:left;width:19%}}th.p{{padding-left:12px}}
td{{height:{f['row']}px;text-align:center;border-bottom:1.5px solid #e4dfee;font-size:{f['td']}px;line-height:1.05;white-space:nowrap}}
td b{{font-weight:700}}td span{{font-size:{f['td']*.62:.0f}px;font-weight:700;margin-left:5px}}
td.p{{font-weight:700;font-size:{f['td']*.95:.0f}px;padding-left:12px;color:#1b1530}}
td.p i{{display:inline-block;width:{f['td']*.5:.0f}px;height:{f['td']*.5:.0f}px;border-radius:50%;margin-right:{f['td']*.35:.0f}px;vertical-align:{f['td']*-.04:.0f}px}}
td.g{{background:#e1f2e6;color:#12602f}}td.l{{background:#fbe3df;color:#a3261a}}
tr.tot td{{border-top:3px solid #3E347E;border-bottom:0;background:#f3f1fa;font-weight:700}}tr.tot td.g{{background:#cfeadb}}
.leg{{font:400 {f['leg']}px/1.38 "Space Grotesk";color:#D9D4F0}}
.leg b{{font-weight:700;padding:1px 7px;border-radius:5px}}.leg b.g{{background:#e1f2e6;color:#12602f}}.leg b.l{{background:#fbe3df;color:#a3261a}}
.leg em{{display:block;margin-top:{f['gap']*.45:.0f}px;font-style:normal;color:#fff}}.leg em u{{text-decoration:none;color:#F08A24;font-weight:700}}
.rod{{margin-top:auto;display:flex;align-items:center;gap:{f['gap']*1.2:.0f}px;background:#fff;border-radius:22px;padding:{f['gap']*.8:.0f}px {f['gap']*1.1:.0f}px;border-bottom:6px solid #F08A24}}
.rod .qr{{flex:none;width:{f['qr']}px;height:{f['qr']}px}}
.rod .t{{flex:1}}.rod .k{{font:700 {f['sm']+1}px/1.2 "Space Grotesk";letter-spacing:.16em;text-transform:uppercase;color:#b45f06}}
.rod .h{{font:400 {f['rod']*1.28:.0f}px/1.12 "DM Serif Display";color:#3E347E;margin-top:6px}}
.rod .u{{margin-top:8px;font:700 {f['rod']*.78:.0f}px/1.2 "Space Grotesk";color:#2A2260;word-break:break-all}}
</style></head><body><div class="c">
<div class="topo"><img src="file://{IMG}/logo-negativo.svg"><span class="sel">Dado do relatório</span></div>
<h1>{esc(TITULO)}</h1><div class="sub">{esc(SUBT)}</div>
<div class="painel">{tabela()}</div>
<div class="leg">{LEG}<em>Fonte: relatório <u>Federação e os partidos de esquerda nas eleições 2026</u>, da Oficina Política.</em></div>
<div class="rod"><div class="qr">{QR}</div><div class="t"><div class="k">Leia o relatório completo</div><div class="h">Veja os seis cenários, estado por estado</div><div class="u">{URL_TXT}</div></div></div>
</div></body></html>'''

from playwright.sync_api import sync_playwright
with sync_playwright() as p:
    b = p.chromium.launch()
    for nome, f in FORMATOS.items():
        hp = os.path.join(outdir, f'_{nome}.html'); open(hp, 'w', encoding='utf-8').write(pagina(f)); pg = b.new_page(viewport={'width': f['w'], 'height': f['h']}); pg.goto('file://' + hp); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(500)
        ov = pg.evaluate('''()=>{const c=document.querySelector('.c');return [c.scrollHeight, c.clientHeight]}''')
        pg.screenshot(path=os.path.join(outdir, f'card-relatorio-federacao-{nome}.png')); pg.close()
        os.remove(hp); print(nome, 'conteúdo', ov)
    b.close()
