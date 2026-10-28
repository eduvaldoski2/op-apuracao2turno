"""Imagem de pré-visualização (Open Graph / WhatsApp, 1200x630) da página do relatório.
Uso: og_relatorio.py <est.json> <saida.jpg>"""
import sys, os, runpy
HERE = os.path.dirname(os.path.abspath(__file__)); RAIZ = os.path.abspath(os.path.join(HERE, '..', '..'))
est_json, out = sys.argv[1:3]
_a = sys.argv; sys.argv = [os.path.join(HERE, 'doc_pdf.py'), est_json, os.devnull]
L = runpy.run_path(sys.argv[0], run_name='op_lib'); sys.argv = _a
tf, fed = L['tf'], L['fed']
real, mx = tf['real'], tf['D']; assert (real, mx) == (124, 143)
gr = L['listas'](fed, 'D')
svg = L['hemiciclo'](gr, 513, 10, 560)
FONTS, IMG = os.path.join(RAIZ, 'fonts'), os.path.join(RAIZ, 'img')
html = f'''<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{{font-family:"DM Serif Display";src:url("file://{FONTS}/dm-serif-display-latin-400-normal.woff2") format("woff2");unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215}}
@font-face{{font-family:"DM Serif Display";src:url("file://{FONTS}/dm-serif-display-latin-ext-400-normal.woff2") format("woff2");unicode-range:U+0100-02AF,U+1E00-1EFF}}
@font-face{{font-family:"Space Grotesk";src:url("file://{FONTS}/space-grotesk-latin-wght-normal.woff2") format("woff2");font-weight:300 700;unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215}}
@font-face{{font-family:"Space Grotesk";src:url("file://{FONTS}/space-grotesk-latin-ext-wght-normal.woff2") format("woff2");font-weight:300 700;unicode-range:U+0100-02AF,U+1E00-1EFF}}
*{{box-sizing:border-box;margin:0}}
html,body{{width:1200px;height:630px;overflow:hidden}}
body{{font-family:"Space Grotesk",sans-serif;color:#fff;background:linear-gradient(150deg,#2A2260 0%,#3E347E 62%,#5a4ea6 100%);position:relative;border-bottom:10px solid #F08A24}}
.l{{position:absolute;left:64px;top:52px;width:600px}}
.l img{{width:230px;display:block}}
.k{{margin-top:46px;font:700 22px/1 "Space Grotesk";letter-spacing:.2em;text-transform:uppercase;color:#F08A24}}
h1{{margin-top:18px;font:400 64px/1.06 "DM Serif Display"}}
.s{{margin-top:22px;font:300 27px/1.3 "Space Grotesk";color:#D9D4F0;max-width:600px}}
.r{{position:absolute;right:34px;top:70px;width:450px}}
.r svg{{width:100%;height:auto;display:block}}
.n{{position:absolute;left:0;right:0;top:262px;text-align:center}}
.n b{{display:block;font:400 62px/1 "DM Serif Display"}}
.n b em{{font-style:normal;color:#F08A24}}
.n span{{display:block;margin-top:8px;font:600 17px/1.25 "Space Grotesk";color:#D9D4F0;padding:0 70px}}
.u{{position:absolute;right:34px;bottom:46px;width:450px;text-align:center;font:700 26px "Space Grotesk";letter-spacing:.01em;color:#fff}}
</style></head><body>
<div class="l"><img src="file://{IMG}/logo-negativo.svg"><div class="k">Relatório · Eleições 2026</div>
<h1>Federação e os partidos de esquerda</h1>
<div class="s">Quantas cadeiras a esquerda teria na Câmara e nas Assembleias, em seis cenários de federação</div></div>
<div class="r">{svg}<div class="n"><b>{real} <em>→</em> {mx}</b><span>deputados federais da esquerda: de 2026 ao cenário de maior alcance</span></div></div>
<div class="u">oficinapolitica.com.br</div>
</body></html>'''
from playwright.sync_api import sync_playwright
hp = out + '.html'; open(hp, 'w', encoding='utf-8').write(html)
with sync_playwright() as p:
    b = p.chromium.launch(); pg = b.new_page(viewport={'width': 1200, 'height': 630}); pg.goto('file://' + hp); pg.evaluate('document.fonts.ready'); pg.wait_for_timeout(500)
    pg.screenshot(path=out, type='jpeg', quality=88); b.close()
os.remove(hp); print(out, os.path.getsize(out))
