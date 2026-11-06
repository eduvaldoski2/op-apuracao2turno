// Gera o card "Use a Oficina Política como app" em 1:1, 4:5 e 9:16.
// uso: node scripts/card_instalar_app.mjs [saida]   (padrão cartoes/img/instale-o-app)
import { createRequire } from 'module';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_PATH || 'playwright');
import { readFileSync, mkdirSync } from 'fs';
import path from 'path';
const raiz = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const saida = process.argv[2] || path.join(raiz, 'cartoes/img/instale-o-app');
mkdirSync(saida, { recursive: true });
const f = n => 'data:font/woff2;base64,' + readFileSync(path.join(raiz, 'fonts', n)).toString('base64');
const icone = 'data:image/png;base64,' + readFileSync(path.join(raiz, 'img/icon-512.png')).toString('base64');
const logo = readFileSync(path.join(raiz, 'img/logo-negativo.svg'), 'utf8');
const FORM = { '1x1': [1080, 1080], '4x5': [1080, 1350], '9x16': [1080, 1920] };
const android = ['Abra <b>oficinapolitica.com.br</b> no <b>Chrome</b>', 'Toque nos <b>três pontinhos</b> (⋮) no canto', 'Escolha <b>Instalar app</b> (ou <i>Adicionar à tela inicial</i>)', 'Confirme em <b>Instalar</b>'];
const ios = ['Abra <b>oficinapolitica.com.br</b> no <b>Safari</b>', 'Toque em <b>Compartilhar</b> (quadrado com seta ↑)', 'Escolha <b>Adicionar à Tela de Início</b>', 'Confirme o nome e toque em <b>Adicionar</b>'];
const html = (k, w, h) => {
  const alto = h > 1300, hi = h > 1500, quad = h === 1080;
  const col = (t, l, passos) => `<section class="col"><h2><span class="t">${t}</span><span class="l">${l}</span></h2><ol>${passos.map(p => `<li><span>${p}</span></li>`).join('')}</ol></section>`;
  return `<!doctype html><meta charset="utf-8"><style>
@font-face{font-family:DM;src:url(${f('dm-serif-display-latin-400-normal.woff2')})}
@font-face{font-family:DM;src:url(${f('dm-serif-display-latin-ext-400-normal.woff2')});unicode-range:U+0100-02AF,U+1E00-1EFF}
@font-face{font-family:SG;font-weight:300 700;src:url(${f('space-grotesk-latin-wght-normal.woff2')})}
@font-face{font-family:SG;font-weight:300 700;src:url(${f('space-grotesk-latin-ext-wght-normal.woff2')});unicode-range:U+0100-02AF,U+1E00-1EFF}
*{box-sizing:border-box;margin:0}
body{width:${w}px;height:${h}px;background:#3E347E;color:#FBF9F5;font-family:SG,sans-serif;display:flex;flex-direction:column;padding:${hi ? 110 : quad ? 56 : 64}px 64px ${hi ? 100 : quad ? 44 : 56}px;gap:${hi ? 52 : alto ? 34 : quad ? 20 : 34}px;overflow:hidden}
.logo svg{height:${quad ? 30 : 38}px;width:auto;display:block}
.cab{display:flex;align-items:center;gap:${quad ? 28 : 36}px}
.cab img{width:${quad ? 128 : alto ? 190 : 150}px;height:auto;border-radius:22%;box-shadow:0 14px 40px rgba(0,0,0,.35)}
h1{font:400 ${quad ? 56 : alto ? 84 : 66}px/1.04 DM,serif;text-wrap:balance}
h1 em{font-style:normal;color:#F08A24}
.sub{font-size:${quad ? 22 : 27}px;opacity:.85;margin-top:10px}
.cols{display:grid;grid-template-columns:${hi ? '1fr' : 'minmax(0,1fr) minmax(0,1fr)'};gap:${hi ? 34 : 28}px;flex:1;min-height:0}
.col{background:#FBF9F5;color:#2a2457;border-radius:28px;padding:${quad ? 26 : alto ? 40 : 34}px ${quad ? 28 : 36}px;display:flex;flex-direction:column;gap:${quad ? 14 : 22}px}
h2{display:flex;align-items:baseline;justify-content:space-between;border-bottom:3px solid #F08A24;padding-bottom:12px}
h2 .t{font:400 ${quad ? 40 : hi ? 52 : 46}px DM,serif;color:#3E347E}
h2 .l{font-size:${quad ? 17 : 20}px;font-weight:600;letter-spacing:.06em;text-transform:uppercase;color:#8a7fb8}
ol{flex:1;justify-content:space-evenly;list-style:none;counter-reset:s;display:flex;flex-direction:column;gap:${quad ? 24 : hi ? 28 : 34}px}
li span{min-width:0}li{counter-increment:s;display:flex;gap:18px;align-items:flex-start;font-size:${quad ? 27 : hi ? 34 : 26}px;line-height:1.28}
li::before{content:counter(s);flex:none;width:${quad ? 44 : hi ? 56 : 50}px;height:${quad ? 44 : hi ? 56 : 50}px;border-radius:50%;background:#F08A24;color:#fff;font-weight:700;display:grid;place-items:center;font-size:${quad ? 24 : hi ? 30 : 27}px}
li b{color:#3E347E}
.rod{display:flex;justify-content:space-between;align-items:center;font-size:${quad ? 20 : 25}px;opacity:.9}
.rod strong{color:#F08A24}
</style><body>
<div class="logo">${logo}</div>
<div class="cab"><img src="${icone}" alt=""><div><h1>Use a <em>Oficina Política</em> como app no seu celular</h1><p class="sub">Sem loja de apps: um toque na tela inicial e pronto.</p></div></div>
<div class="cols">${col('Android', 'Chrome', android)}${col('iPhone', 'Safari · iOS', ios)}</div>
<div class="rod"><span>Procure o ícone <strong>Op</strong> laranja na tela inicial</span><span>oficinapolitica.com.br</span></div>
</body>`;
};
const b = await chromium.launch(); const p = await b.newPage();
for (const [k, [w, h]] of Object.entries(FORM)) { await p.setViewportSize({ width: w, height: h }); await p.setContent(html(k, w, h)); await p.evaluate(() => document.fonts.ready); await p.screenshot({ path: path.join(saida, `instale-o-app-${k}.png`) }); }
await b.close();
