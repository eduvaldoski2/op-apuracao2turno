"""Página web do relatório (federacao-esquerda-2026/index.html), gerada do mesmo conteúdo do PDF.
Uso: doc_web.py <est.json> <relatorio.pdf> <pasta_saida>   (copia o PDF para a pasta e escreve index.html)"""
import sys, os, re, html, shutil, runpy, subprocess, unicodedata
HERE = os.path.dirname(os.path.abspath(__file__))
est_json, pdf_src, outdir = sys.argv[1:4]
_argv = sys.argv; sys.argv = [os.path.join(HERE, 'doc_pdf.py'), est_json, '/dev/null']
L = runpy.run_path(os.path.join(HERE, 'doc_pdf.py'), run_name='op_lib'); sys.argv = _argv
B, LAB, CEN = L['B'], L['LAB'], L['CEN']
esc, plain, runs_html, all_bold, table_html, list_html = L['esc'], L['plain'], L['runs_html'], L['all_bold'], L['table_html'], L['list_html']
TITULO, SUB = L['TITULO'], L['SUB']
PDF_NOME = 'Relatorio_Federacao_e_partidos_de_esquerda_2026.pdf'
os.makedirs(outdir, exist_ok=True); shutil.copyfile(pdf_src, os.path.join(outdir, PDF_NOME))
info = subprocess.run(['pdfinfo', pdf_src], capture_output=True, text=True).stdout
NPAG = int(re.search(r'Pages:\s+(\d+)', info).group(1)); MB = os.path.getsize(pdf_src) / 1048576
PDF_TXT = f'PDF · {NPAG} páginas · {MB:.1f} MB'.replace('.', ',')
DATA = plain(B[2]['content']).split(' · ')[-1]

def slug(t):
    t = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode().lower()
    return re.sub(r'[^a-z0-9]+', '-', t).strip('-')[:60]

# ------------------------------------------------------------------ corpo
body = B[3:]
toc = []                      # (nível, texto, id)
out = []
det = False
def fecha_det():
    global det
    if det: out.append('</div></details>'); det = False
chap_open = False
def fecha_cap():
    global chap_open
    fecha_det()
    if chap_open: out.append('</section>'); chap_open = False
ficha = None; fig_feitas = False
fig_html = L['plenario'](L['fed'], 513, 10, 8, 'Câmara dos Deputados em cada cenário (513 cadeiras)', 'Cada ponto é um deputado; as cores seguem os partidos e as federações de cada cenário.') + \
           L['plenario'](L['est'], 1059, 14, 12, 'Assembleias Legislativas e Câmara Legislativa do DF em cada cenário (1.059 cadeiras)', 'Cada ponto é um deputado estadual ou distrital; listas com menos de 12 cadeiras aparecem em "Outros".')
i = 0; first = False; nomes = {LAB[k] for k in CEN}
while i < len(body):
    b = body[i]; i += 1; t = b['type']
    if t == 'paragraph' and b.get('heading') == 2:
        fecha_cap(); txt = plain(b['content']); k, _, ti = txt.partition(' · ')
        idd = slug(ti if txt.startswith('Capítulo') else txt); toc.append((2, txt, idd))
        if txt.startswith('Capítulo'):
            num = re.search(r'\d+', k).group()
            lead = plain(body[i]['content']); i += 1
            out.append(f'<section class="cap" id="{idd}"><header class="caph"><span class="cn">{num}</span><div><div class="ck">Capítulo {num}</div><h2>{esc(ti)}</h2></div></header><p class="lead">{esc(lead)}</p>')
            first = False
        else:
            out.append(f'<section class="cap" id="{idd}"><header class="caph intro"><div><div class="ck">Oficina Política</div><h2>{esc(txt)}</h2></div></header>')
            first = True
        chap_open = True; continue
    if t == 'paragraph' and b.get('heading') == 3:
        fecha_det(); txt = plain(b['content']); first = False
        if txt == 'Ficha técnica':
            tb = body[i]; i += 1
            ficha = [[plain(c['content'][0]['content']) for c in r['content']] for r in tb['content'][1:]]
            toc.append((3, txt, 'ficha-tecnica')); continue
        idd = slug(txt)
        if txt.startswith('1.6 ') and not fig_feitas:
            out.append(fig_html); fig_feitas = True
        toc.append((3, txt, idd))
        if txt in nomes:
            out.append(f'</section><section class="cen" id="{idd}"><header class="scenhead"><div class="ck">Cenário</div><h3>{esc(txt)}</h3></header>'); first = True
            # o <section class="cap"> do capítulo já foi fechado acima; reabre-se como "cen" até o próximo cenário
            chap_open = True
        else:
            out.append(f'<h3 id="{idd}">{esc(txt)}</h3>')
            if txt.startswith('1.1 '): out.append(L['kpis']() + L['chart']())
        continue
    if t == 'paragraph' and b.get('heading') == 4:
        fecha_det(); txt = plain(b['content'])
        if txt in ('Onde muda', 'Quem entra e quem sai'):
            out.append(f'<details class="det"><summary><span>{esc(txt)}</span><em></em></summary><div class="detc">'); det = True
        else:
            out.append(f'<h4>{runs_html(b["content"])}</h4>')
        continue
    if t == 'paragraph':
        txt = plain(b['content'])
        if txt.startswith('¹ '): out.append(f'<p class="footnote">{runs_html(b["content"])}</p>'); continue
        if txt.startswith('Em síntese:'): continue
        cls = []
        if txt.startswith('Autor:'): cls.append('autor')
        elif first: cls.append('lead'); first = False
        elif all_bold(b['content']) and len(txt) < 80: cls.append('kick')
        out.append(f'<p class="{" ".join(cls)}">{runs_html(b["content"])}</p>'); continue
    if t == 'list': out.append(list_html(b)); continue
    if t == 'blockquote': out.append('<div class="nota">' + runs_html(b['content'][0]['content']) + '</div>'); continue
    if t == 'table': out.append('<div class="tw" tabindex="0" role="region" aria-label="Tabela rolável">' + table_html(b) + '</div>'); continue
    raise SystemExit('bloco não tratado ' + t)
fecha_cap()
BODY = '\n'.join(out)
for k in CEN:                                   # painel de números logo depois da abertura de cada cenário
    mk = re.search(r'<header class="scenhead"><div class="ck">Cenário</div><h3>' + re.escape(esc(LAB[k])) + r'</h3></header>\s*<p class="lead">.*?</p>', BODY, re.S)
    assert mk, k
    BODY = BODY[:mk.end()] + L['strip'](k) + BODY[mk.end():]
# acessibilidade dos gráficos
def aria(m):
    return f'{m.group(1)}<figcaption>{m.group(2)}</figcaption><svg role="img" aria-label="{html.escape(re.sub("<[^>]+>", "", m.group(2)), quote=True)}" '
BODY = re.sub(r'(<figure[^>]*>)<figcaption>(.*?)</figcaption><svg ', aria, BODY)

def tocl(cls):
    r = []
    for lv, txt, idd in toc:
        r.append(f'<a class="l{lv}" href="#{idd}">{esc(txt)}</a>')
    return f'<nav class="{cls}" aria-label="Neste relatório">' + ''.join(r) + '</nav>'
FICHA = '<dl class="ficha">' + ''.join(f'<dt>{esc(a)}</dt><dd>{esc(b)}</dd>' for a, b in ficha) + '</dl>'
URL = 'https://oficinapolitica.com.br/federacao-esquerda-2026/'
DESC = 'Quantas cadeiras a esquerda teria na Câmara dos Deputados e nas Assembleias Legislativas em 2026 se os partidos se unissem em federações. Seis cenários, estado por estado, com relatório em PDF.'

CSS = '''
@font-face{font-family:'DM Serif Display';font-style:normal;font-weight:400;font-display:swap;src:url(../fonts/dm-serif-display-latin-400-normal.woff2) format('woff2');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'DM Serif Display';font-style:normal;font-weight:400;font-display:swap;src:url(../fonts/dm-serif-display-latin-ext-400-normal.woff2) format('woff2');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;src:url(../fonts/space-grotesk-latin-wght-normal.woff2) format('woff2-variations');unicode-range:U+0000-00FF,U+0131,U+0152-0153,U+02BB-02BC,U+02C6,U+02DA,U+02DC,U+0304,U+0308,U+0329,U+2000-206F,U+20AC,U+2122,U+2191,U+2193,U+2212,U+2215,U+FEFF,U+FFFD}
@font-face{font-family:'Space Grotesk';font-style:normal;font-weight:300 700;font-display:swap;src:url(../fonts/space-grotesk-latin-ext-wght-normal.woff2) format('woff2-variations');unicode-range:U+0100-02BA,U+02BD-02C5,U+02C7-02CC,U+02CE-02D7,U+02DD-02FF,U+0304,U+0308,U+0329,U+1D00-1DBF,U+1E00-1E9F,U+1EF2-1EFF,U+2020,U+20A0-20AB,U+20AD-20C0,U+2113,U+2C60-2C7F,U+A720-A7FF}
:root{--roxo:#3E347E;--roxo-2:#2A2260;--roxo-3:#5a4ea6;--laranja:#F08A24;--laranja-2:#b45f06;--lilas:#D9D4F0;--creme:#FBF9F5;--tx:#1b1530;--tx2:#5d5675;--linha:#e4dfee;--ok:#14683a;--erro:#a3261a}
*{box-sizing:border-box}
html{-webkit-text-size-adjust:100%;scroll-behavior:smooth;scroll-padding-top:76px}
body{margin:0;color:var(--tx);background:var(--creme);font:16px/1.6 'Space Grotesk',system-ui,-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif}
a{color:var(--roxo-3)}
a:focus-visible,button:focus-visible,summary:focus-visible,.tw:focus-visible{outline:3px solid var(--laranja);outline-offset:3px}
.pula{position:absolute;left:-999px;top:8px;background:var(--roxo);color:#fff;padding:8px 14px;border-radius:8px;z-index:30}.pula:focus{left:8px}
.topo{position:sticky;top:0;z-index:20;background:rgba(251,249,245,.94);backdrop-filter:blur(8px);border-bottom:1px solid var(--linha)}
.topo div{max-width:1180px;margin:0 auto;padding:10px 20px;display:flex;align-items:center;justify-content:space-between;gap:14px}
.topo img{display:block;height:30px;width:auto}
.btn{display:inline-flex;align-items:center;gap:10px;padding:11px 18px;border-radius:12px;background:var(--laranja);color:#2a1700;font-weight:700;font-size:15px;text-decoration:none;line-height:1.2;transition:filter .15s,transform .15s}
.btn:hover{filter:brightness(.96);transform:translateY(-1px)}.btn svg{flex:none;width:18px;height:18px}
.btn.peq{padding:8px 14px;font-size:14px}
.hero{background:linear-gradient(150deg,var(--roxo-2) 0%,var(--roxo) 65%,var(--roxo-3) 100%);color:#fff}
.hero div.in{max-width:1180px;margin:0 auto;padding:clamp(36px,7vw,76px) 20px clamp(34px,6vw,64px)}
.hk{margin:0 0 14px;font:700 12.5px/1.2 'Space Grotesk',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--laranja)}
.hero h1{margin:0;max-width:20ch;font:400 clamp(34px,6.4vw,62px)/1.06 'DM Serif Display',Georgia,serif;letter-spacing:-.005em}
.hero .sub{max-width:52ch;margin:18px 0 0;font-size:clamp(16px,2.2vw,19px);font-weight:300;line-height:1.45;color:var(--lilas)}
.hero .meta{margin:22px 0 0;font-size:14px;color:var(--lilas)}.hero .meta b{color:#fff}
.hero .acoes{display:flex;flex-wrap:wrap;align-items:center;gap:12px 18px;margin-top:28px}
.hero .acoes small{color:var(--lilas);font-size:13.5px}
.hero .acoes2{margin-top:14px}.btn.ghost{background:transparent;color:#fff;border:2px solid rgba(217,212,240,.6);padding:9px 16px}.btn.ghost:hover{background:rgba(255,255,255,.08);filter:none}
.hero .barra{width:72px;height:5px;border-radius:3px;background:var(--laranja);margin:24px 0 0}
.wrap{max-width:1180px;margin:0 auto;padding:0 20px;display:block}
.toc-m{margin:20px 0 0;background:#fff;border:1px solid var(--linha);border-radius:14px}
.toc-m summary{cursor:pointer;padding:13px 16px;font-weight:700;color:var(--roxo-2);list-style:none;display:flex;justify-content:space-between}
.toc-m summary::after{content:"+";color:var(--laranja-2);font-size:20px;line-height:1}.toc-m[open] summary::after{content:"–"}
.toc-m nav{padding:2px 16px 14px}
nav.toc a{display:block;color:var(--tx2);text-decoration:none;font-size:14px;line-height:1.35;padding:5px 0}
nav.toc a.l2{margin-top:10px;font-weight:700;color:var(--roxo-2)}nav.toc a.l3{padding-left:12px;border-left:2px solid var(--linha)}
nav.toc a:hover,nav.toc a.on{color:var(--roxo)}nav.toc a.l3.on{border-left-color:var(--laranja);font-weight:600}
aside.lat{display:none}
article{min-width:0;padding-bottom:30px}
@media(min-width:1080px){.wrap{display:grid;grid-template-columns:270px minmax(0,1fr);gap:44px;align-items:start}.toc-m{display:none}
 aside.lat{display:block;position:sticky;top:78px;max-height:calc(100vh - 96px);overflow:auto;padding:30px 4px 30px 0;margin-top:0}
 aside.lat .t{margin:0 0 6px;font:700 11.5px/1 'Space Grotesk',sans-serif;letter-spacing:.18em;text-transform:uppercase;color:var(--laranja-2)}}
/* capítulos */
section.cap,section.cen{padding-top:40px}
.caph{display:flex;align-items:flex-end;gap:20px;background:linear-gradient(120deg,var(--roxo-2),var(--roxo));color:#fff;border-radius:18px;padding:26px 28px;border-bottom:5px solid var(--laranja)}
.caph .cn{font:400 clamp(64px,10vw,104px)/.8 'DM Serif Display',serif;color:var(--laranja)}
.caph.intro{display:block}
.ck{font:700 11.5px/1 'Space Grotesk',sans-serif;letter-spacing:.2em;text-transform:uppercase;color:var(--laranja)}
.caph h2{margin:8px 0 0;font:400 clamp(28px,5vw,44px)/1.08 'DM Serif Display',Georgia,serif}
.scenhead{background:linear-gradient(120deg,var(--roxo-2),var(--roxo));color:#fff;border-radius:16px;padding:20px 26px 22px;border-bottom:5px solid var(--laranja)}
.scenhead h3{margin:8px 0 0;font:400 clamp(26px,4.6vw,38px)/1.1 'DM Serif Display',Georgia,serif;color:#fff;padding:0;background:none}
h3{margin:46px 0 12px;padding-top:12px;font:400 clamp(24px,3.4vw,30px)/1.15 'DM Serif Display',Georgia,serif;color:var(--roxo);background:linear-gradient(var(--laranja),var(--laranja)) top left/38px 4px no-repeat}
h3.x{margin-top:0}
h4{margin:30px 0 8px;padding-bottom:6px;font:700 17px/1.25 'Space Grotesk',sans-serif;color:var(--roxo);border-bottom:2px solid var(--lilas)}
p{margin:0 0 14px}p.lead{margin:18px 0 18px;font-size:clamp(17.5px,2.1vw,20px);line-height:1.5;color:var(--roxo-2);font-weight:500}
p.autor{margin:16px 0 18px;padding-bottom:14px;border-bottom:1px solid var(--lilas);color:var(--roxo)}
p.kick{margin:26px 0 8px;font:700 13px/1.3 'Space Grotesk',sans-serif;letter-spacing:.09em;text-transform:uppercase;color:var(--roxo)}
p.footnote{margin:6px 0 0;font-size:13px;color:var(--tx2);border-top:1px solid var(--lilas);padding-top:8px}
ul,ol{margin:0 0 16px;padding:0;list-style:none;counter-reset:n}
li{position:relative;padding-left:24px;margin-bottom:9px}
ul li::before{content:"";position:absolute;left:3px;top:.62em;width:8px;height:8px;background:var(--laranja);border-radius:2px}
ol li{counter-increment:n;padding-left:30px}ol li::before{content:counter(n);position:absolute;left:0;top:0;font-weight:700;color:var(--roxo)}
.nota{margin:0 0 18px;padding:14px 18px;background:#fff;border-left:5px solid var(--laranja);border-radius:0 12px 12px 0;font-size:15px}
b{font-weight:700}
b.sw{padding:1px 7px;border-radius:6px}b.sw.g{background:#e1f2e6;color:#12602f}b.sw.m{background:#fff0d4;color:#7a4e00}b.sw.l{background:#fbe3df;color:#a3261a}
/* tabelas */
.tw{margin:6px 0 24px;overflow-x:auto;background:#fff;border:1px solid var(--linha);border-radius:12px;-webkit-overflow-scrolling:touch}
table{border-collapse:collapse;width:100%;font-size:14px;min-width:560px}table.wide{font-size:13px;min-width:760px}
th{background:var(--lilas);color:var(--roxo-2);font-weight:700;text-align:left;padding:9px 10px;vertical-align:bottom;border-bottom:2px solid var(--roxo);position:sticky;top:0}
td{padding:7px 10px;border-bottom:1px solid #eeeaf5;vertical-align:top}
th.ce,td.ce{text-align:center}
tr.grp td{border-top:2.5px solid var(--roxo)}
tr.key td{font-weight:700;background:#f3f1fa;border-bottom:1px solid #c9c3e3}
td.g{background:#e1f2e6;color:#12602f;font-weight:600}td.l{background:#fbe3df;color:#a3261a;font-weight:600}td.m{background:#fff0d4;color:#7a4e00;font-weight:600}
.dl{font-weight:700}
.pl{display:inline-block;padding:1px 8px;border-radius:6px;font-weight:700;font-size:.92em}
.nw{white-space:nowrap}.dt{display:inline-block;width:10px;height:10px;border-radius:50%;margin-right:7px;vertical-align:-1px}
/* destaques */
.kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px;margin:6px 0 20px}
.kpi{background:var(--roxo);color:#fff;border-radius:16px;padding:20px 22px}.kpi:nth-child(2){background:var(--roxo-2)}
.kn{font:400 44px/1 'DM Serif Display',serif}.kt{margin-top:10px;font-weight:700;font-size:15px;line-height:1.25}.kd{margin-top:6px;font-size:13.5px;line-height:1.35;opacity:.9}
figure{margin:0}
figure.chart{margin:0 0 22px;padding:16px 18px 8px;background:#fff;border:1px solid var(--linha);border-radius:16px}
figure.chart figcaption{font:400 20px 'DM Serif Display',serif;color:var(--roxo);margin-bottom:4px}figure.chart svg{width:100%;height:auto;display:block}
.strip{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px;margin:0 0 6px}
.st{background:#fff;border:1px solid var(--linha);border-top:5px solid var(--roxo);border-radius:12px;padding:12px 16px}
.sn{font:400 28px/1.15 'DM Serif Display',serif;color:var(--roxo-2);white-space:nowrap}.stt{font-size:13px;color:var(--tx2);margin-top:3px;line-height:1.3}
.bd{display:inline-block;font:700 13px 'Space Grotesk',sans-serif;margin-left:8px;padding:1px 7px;border-radius:6px;vertical-align:middle}.bd.pos{background:#e1f2e6;color:#12602f}.bd.neg{background:#fbe3df;color:#a3261a}
/* plenários */
.plen{margin:34px 0 8px}.plen .ph{margin:0 0 4px;padding:0 0 6px;font:700 17px/1.25 'Space Grotesk',sans-serif;color:var(--roxo);border-bottom:2px solid var(--lilas);background:none}
.plen .pn{font-size:14px;color:var(--tx2);margin:8px 0 14px}
.plen figure{background:#fff;border:1px solid var(--linha);border-radius:16px;padding:14px 16px 14px}
.plen figcaption{font:400 19px/1.2 'DM Serif Display',serif;color:var(--roxo);margin-bottom:6px}.plen figcaption span{font:500 12.5px 'Space Grotesk',sans-serif;color:var(--tx2);margin-left:8px}
.plen svg{width:100%;height:auto;display:block}.plen figure.big svg{max-width:560px;margin:0 auto}
.plen .grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(250px,1fr));gap:14px;margin-top:14px}
.plen .grid figure{padding:10px 12px}.plen .grid figcaption{font-size:16px}
.lg{display:flex;flex-wrap:wrap;gap:3px 10px;margin-top:8px;font-size:11.5px;line-height:1.3;color:#3a3355}.lg span{white-space:nowrap}
.lg i{display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:4px}.lg b{color:var(--tx)}
.lg.big{justify-content:center;gap:7px 9px;font-size:13px;margin-top:12px}.lg.big span{border:1px solid var(--linha);border-radius:999px;padding:2px 10px}.lg.big i{width:11px;height:11px}
/* tabelas recolhíveis */
details.det{margin:18px 0 0;background:#fff;border:1px solid var(--linha);border-radius:14px}
details.det summary{cursor:pointer;list-style:none;display:flex;align-items:center;justify-content:space-between;gap:12px;padding:13px 18px;font:700 17px 'Space Grotesk',sans-serif;color:var(--roxo)}
details.det summary::-webkit-details-marker{display:none}
details.det summary em{font:600 13px 'Space Grotesk',sans-serif;font-style:normal;color:var(--laranja-2)}
details.det summary em::before{content:"Mostrar tabelas +"}details.det[open] summary em::before{content:"Ocultar –"}
details.det[open] summary{border-bottom:2px solid var(--lilas)}
details.det .detc{padding:12px 16px 4px}details.det .detc .tw{margin-bottom:16px}
details.det .detc p{font-size:15px}
dl.ficha{display:grid;grid-template-columns:minmax(120px,190px) 1fr;gap:12px 22px;margin:8px 0 0;border-top:1px solid var(--lilas);padding-top:18px;font-size:15px;color:#3a3355}
dl.ficha dt{font:700 12px/1.5 'Space Grotesk',sans-serif;letter-spacing:.1em;text-transform:uppercase;color:var(--roxo)}dl.ficha dd{margin:0}
@media(max-width:560px){dl.ficha{grid-template-columns:1fr;gap:2px}dl.ficha dd{margin-bottom:12px}.caph{padding:20px 18px;gap:14px}.topo .btn span.t{display:none}}
.cta{margin:40px 0 0;display:flex;flex-wrap:wrap;gap:14px 20px;align-items:center;justify-content:space-between;background:linear-gradient(120deg,var(--roxo-2),var(--roxo));color:#fff;border-radius:18px;padding:22px 26px;border-bottom:5px solid var(--laranja)}
.cta b{display:block;font:400 24px/1.2 'DM Serif Display',serif;font-weight:400}.cta small{color:var(--lilas);font-size:14px}

/* cadastro */
.cad{margin:46px 0 0;scroll-margin-top:80px}
.cad .chamada{margin:0 0 6px;font:400 clamp(26px,4vw,34px)/1.2 'DM Serif Display',Georgia,serif;color:var(--roxo)}.cad .chamada b{display:block;font-weight:400;color:var(--laranja-2)}
.cad p.sub{margin:6px 0 0;color:var(--tx2);max-width:56ch}
.cad form{margin:22px 0 0;max-width:520px;background:#fff;border:1px solid var(--linha);border-radius:20px;padding:24px 22px 22px;box-shadow:0 18px 40px -26px rgba(42,34,96,.45)}
.cad label.c{display:block;font-weight:600;font-size:14px;color:var(--roxo-2);margin:0 0 14px}.cad label.c small{font-weight:400;color:var(--tx2)}
.cad input[type=text],.cad input[type=email],.cad input[type=tel]{display:block;width:100%;margin-top:6px;padding:13px 14px;font:inherit;font-size:16px;color:var(--tx);background:#fdfcff;border:1.5px solid var(--linha);border-radius:12px;transition:border-color .15s,box-shadow .15s}
.cad input::placeholder{color:#a39dbb}.cad input:hover{border-color:#cfc8e6}
.cad input:focus{outline:none;border-color:var(--roxo-3);box-shadow:0 0 0 4px rgba(90,78,166,.16)}.cad input[aria-invalid=true]{border-color:var(--erro);background:#fff8f7}
.cad .ck2{display:flex;gap:11px;align-items:flex-start;margin:6px 0 4px;font-size:13.5px;line-height:1.45;color:var(--tx2);cursor:pointer}.cad .ck2 input{flex:none;width:20px;height:20px;margin:1px 0 0;accent-color:var(--roxo);cursor:pointer}
.cad .nt{margin:12px 0 0;font-size:12.5px;color:var(--tx2)}.cad .nt a{font-weight:600}
.cad .enviar{display:block;width:100%;margin-top:18px;min-height:54px;border:0;border-radius:14px;background:var(--laranja);color:#2a1700;font:700 16px 'Space Grotesk',system-ui,sans-serif;cursor:pointer;transition:filter .15s,transform .15s}
.cad .enviar:hover{filter:brightness(.96);transform:translateY(-1px)}.cad .enviar:disabled{opacity:.6;cursor:progress;transform:none}
.cad .msg{min-height:20px;margin:12px 0 0;font-size:14px;font-weight:600;color:var(--erro)}
.cad .ok-box{margin:22px 0 0;max-width:520px;background:#fff;border:1px solid #bfe3cd;border-radius:20px;padding:26px 22px}.cad .ok-box h4{margin:0 0 6px;padding:0;border:0;font:400 26px 'DM Serif Display',Georgia,serif;color:var(--ok)}.cad .ok-box p{margin:0;color:var(--tx2)}
.hp{position:absolute!important;left:-9999px;width:1px;height:1px;overflow:hidden}
footer.rodape{padding:26px 20px 34px;text-align:center;font-size:13px;color:var(--tx2);border-top:1px solid var(--linha);margin-top:36px}footer.rodape p{margin:4px 0}footer.rodape a{font-weight:600}
@media print{.topo,aside.lat,.toc-m{display:none}details.det>*{display:block}.hero{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
@media(prefers-reduced-motion:reduce){html{scroll-behavior:auto}*{transition:none!important}}
'''
SETA = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 4v11M7 11l5 5 5-5M5 20h14"/></svg>'
PAGE = f'''<!doctype html>
<html lang="pt-BR">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>{esc(TITULO)} · Oficina Política</title>
<meta name="description" content="{esc(DESC)}">
<link rel="canonical" href="{URL}">
<meta property="og:type" content="article">
<meta property="og:site_name" content="Oficina Política">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="{esc(TITULO)}">
<meta property="og:description" content="{esc(DESC)}">
<meta property="og:url" content="{URL}">
<meta property="og:image" content="{URL}og-relatorio.jpg">
<meta property="og:image:type" content="image/jpeg">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Relatório Federação e os partidos de esquerda nas eleições 2026: plenário da Câmara em pontos e a esquerda indo de 124 a 143 deputados federais">
<meta name="twitter:image" content="{URL}og-relatorio.jpg">
<meta name="twitter:card" content="summary_large_image">
<meta name="author" content="Eduardo Valdoski">
<meta name="theme-color" content="#3E347E">
<link rel="icon" type="image/svg+xml" href="../img/favicon.svg">
<link rel="alternate icon" type="image/png" href="../img/favicon.png">
<link rel="preload" href="../fonts/dm-serif-display-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<style>{CSS}</style>
</head>
<body>
<a class="pula" href="#relatorio">Pular para o relatório</a>
<header class="topo"><div><a href="../" aria-label="Oficina Política, página inicial"><img src="../img/logo-cor.svg" width="1497" height="248" alt="Oficina Política"></a>
<a class="btn peq" href="{PDF_NOME}" download>{SETA}<span class="t">Baixar PDF</span></a></div></header>
<section class="hero"><div class="in">
<p class="hk">Relatório · Eleições 2026</p>
<h1>{esc(TITULO)}</h1>
<p class="sub">{esc(SUB)}</p>
<p class="meta"><b>Eduardo Valdoski</b> · Oficina Política · {esc(DATA)}</p>
<div class="acoes"><a class="btn" href="{PDF_NOME}" download>{SETA}Baixar o relatório em PDF</a><small>{PDF_TXT}</small></div>
<div class="acoes2"><a class="btn ghost" href="#cadastro">Receber as próximas análises</a></div>
<div class="barra"></div></div></section>
<div class="wrap">
<details class="toc-m"><summary>Neste relatório</summary>{tocl("toc")}</details>
<aside class="lat"><p class="t">Neste relatório</p>{tocl("toc")}</aside>
<article id="relatorio">
{BODY}
<section class="cap" id="ficha-tecnica"><h3 class="x">Ficha técnica</h3>{FICHA}
<div class="cta"><div><b>Leia no seu ritmo, guarde para consultar</b><small>Relatório completo em PDF, com os mesmos números desta página.</small></div><a class="btn" href="{PDF_NOME}" download>{SETA}Baixar o PDF</a></div></section>
<section class="cad" id="cadastro" aria-labelledby="t-cad">
<h3 class="x" id="t-cad">Receba as próximas análises</h3>
<p class="chamada">Em breve, um conjunto de ferramentas para quem é profissional da política.<b>Seja o primeiro a conhecer.</b></p>
<form id="f" novalidate autocomplete="on" aria-label="Cadastro para conhecer as novas ferramentas">
<label class="c">Nome completo <small>(todos os campos são obrigatórios)</small>
<input type="text" name="nome" autocomplete="name" required maxlength="120" placeholder="Seu nome"></label>
<label class="c">E-mail
<input type="email" name="email" autocomplete="email" inputmode="email" required maxlength="160" placeholder="voce@exemplo.com.br"></label>
<label class="c">WhatsApp <small>(com DDD)</small>
<input type="tel" name="telefone" autocomplete="tel-national" inputmode="tel" required maxlength="20" placeholder="(21) 99999-9999"></label>
<div class="hp" aria-hidden="true"><label>Não preencha este campo<input type="text" name="site" tabindex="-1" autocomplete="off"></label></div>
<label class="ck2"><input type="checkbox" name="c_contato" required>
<span>Autorizo a Oficina Política a entrar em contato comigo por e-mail e WhatsApp para avisar sobre o lançamento e as novidades de suas ferramentas para profissionais da política. Posso revogar esta autorização a qualquer momento.</span></label>
<p class="nt">Seus dados não são vendidos nem usados para outra finalidade. Saiba mais na <a href="../privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>, que explica também como pedir a exclusão dos seus dados.</p>
<p class="msg" id="msg" role="alert" aria-live="polite"></p>
<button class="enviar" type="submit">Quero ser o primeiro a conhecer</button>
</form>
<div id="ok" class="ok-box" hidden tabindex="-1"><h4>Cadastro recebido!</h4><p id="ok-t">Obrigado. Avisaremos você assim que as ferramentas estiverem no ar.</p></div>
</section>
</article>
</div>
<footer class="rodape">
<p><a href="../">Oficina Política</a> · <a href="../privacidade.html">Política de Privacidade</a> · <a href="../termos.html">Termos de Uso</a></p>
<p>© 2026 Oficina Política. Iniciativa independente, sem vínculo com o TSE ou com candidaturas.</p>
</footer>
<script>
(function(){{
  var links=[].slice.call(document.querySelectorAll('aside.lat nav a')); if(!links.length||!('IntersectionObserver' in window)) return;
  var map={{}}; links.forEach(function(a){{map[a.getAttribute('href').slice(1)]=a;}});
  var io=new IntersectionObserver(function(es){{es.forEach(function(e){{ if(e.isIntersecting){{ links.forEach(function(a){{a.classList.remove('on');}}); var a=map[e.target.id]; if(a){{a.classList.add('on'); try{{a.scrollIntoView({{block:'nearest'}});}}catch(x){{}}}} }} }});}},{{rootMargin:'-20% 0px -70% 0px'}});
  Object.keys(map).forEach(function(id){{var el=document.getElementById(id); if(el) io.observe(el);}});
}})();
</script>

<script>
(function () {{
  'use strict';
  var TEXTO_VERSAO = 'h1', ENDPOINT = '../api/lead.php';
  var f = document.getElementById('f'), msg = document.getElementById('msg'); if (!f) return;
  var origem = {{}};
  try {{
    var q = new URLSearchParams(location.search);
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {{ if (q.get(k)) origem[k] = q.get(k).slice(0, 80); }});
    if (document.referrer && document.referrer.indexOf(location.origin) !== 0) origem.ref = new URL(document.referrer).hostname;
  }} catch (e) {{}}
  var tel = f.telefone;
  tel.addEventListener('input', function () {{
    var d = tel.value.replace(/\D+/g, '');
    if (d.indexOf('55') === 0 && d.length > 11) d = d.slice(2);
    d = d.slice(0, 11);
    tel.value = d.length > 10 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 7) + '-' + d.slice(7)
          : d.length > 6 ? '(' + d.slice(0, 2) + ') ' + d.slice(2, 6) + '-' + d.slice(6)
          : d.length > 2 ? '(' + d.slice(0, 2) + ') ' + d.slice(2)
          : d.length ? '(' + d : '';
  }});
  function erro(campo, texto) {{ msg.textContent = texto; if (campo) {{ campo.setAttribute('aria-invalid', 'true'); campo.focus(); }} }}
  Array.prototype.forEach.call(f.elements, function (el) {{ el.addEventListener('input', function () {{ el.removeAttribute('aria-invalid'); msg.textContent = ''; }}); }});
  f.addEventListener('submit', function (e) {{
    e.preventDefault();
    if (f.site.value) return;
    msg.textContent = '';
    var nome = f.nome.value.trim().replace(/\s+/g, ' '), email = f.email.value.trim().toLowerCase(), dig = f.telefone.value.replace(/\D+/g, '');
    if (nome.length < 3 || nome.indexOf(' ') < 0) return erro(f.nome, 'Informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{{2,}}$/.test(email)) return erro(f.email, 'Informe um e-mail válido.');
    if (dig.length < 10 || dig.length > 11 || /^(\d)\1+$/.test(dig)) return erro(f.telefone, 'Informe o WhatsApp com DDD, por exemplo (21) 99999-9999.');
    if (!f.c_contato.checked) return erro(f.c_contato, 'Para se cadastrar, marque a caixa de autorização para receber nossas mensagens.');
    var bt = f.querySelector('.enviar'); bt.disabled = true; bt.textContent = 'Enviando…';
    var corpo = {{ formulario: 'home', nome: nome, email: email, telefone: dig, consentimento_contato: true, texto_versao: TEXTO_VERSAO, pagina: 'relatorio-federacao', origem: origem }};
    fetch(ENDPOINT, {{ method: 'POST', headers: {{ 'Content-Type': 'application/json' }}, body: JSON.stringify(corpo) }})
      .then(function (r) {{ return r.json().catch(function () {{ return {{}}; }}).then(function (j) {{ if (!r.ok || !j.ok) throw new Error(j.erro || 'falha'); }}); }})
      .then(function () {{
        var ok = document.getElementById('ok');
        document.getElementById('ok-t').textContent = 'Obrigado, ' + nome.split(' ')[0] + '. Avisaremos você por e-mail e WhatsApp assim que as ferramentas estiverem no ar.';
        f.hidden = true; ok.hidden = false; ok.focus();
      }})
      .catch(function () {{ bt.disabled = false; bt.textContent = 'Quero ser o primeiro a conhecer'; msg.textContent = 'Não foi possível enviar agora. Tente de novo em instantes.'; }});
  }});
}})();
</script>
</body>
</html>
'''
open(os.path.join(outdir, 'index.html'), 'w', encoding='utf-8').write(PAGE)
print('web ok', len(PAGE), 'bytes;', PDF_TXT)
