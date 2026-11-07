// Composição das cadeiras: hemiciclo em SVG (um ponto por cadeira, agrupado por partido) + legenda + imagem para redes (1:1, 4:5, 9:16).
// Não classifica partidos em campos políticos: os grupos seguem do maior para o menor número de cadeiras.
import { corPartido } from './partidos.js?v=1a0ad75b';

const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const sgTxt = s => String(s || '').replace(/PC do B/g, 'PCdoB');
let _id = 0;

// itens: [{sg, n}] → ordenados por n (maior primeiro), n > 0
export const agrupa = lista => { const m = new Map(); for (const x of lista) { if (!x.sg || !(x.n > 0)) continue; m.set(x.sg, (m.get(x.sg) || 0) + x.n); } return [...m].map(([sg, n]) => ({ sg, n })).sort((a, b) => b.n - a.n || String(a.sg).localeCompare(String(b.sg))); };

// posições das N cadeiras num semicírculo de raio 1: fileiras concêntricas, mais cadeiras nas externas; ordenadas da esquerda para a direita
export function posicoes(N) {
  if (N <= 0) return { pts: [], raio: 0 };
  const linhas = Math.max(2, Math.round(Math.sqrt(N / 2.4))), r0 = 0.45;
  const R = Array.from({ length: linhas }, (_, i) => r0 + (1 - r0) * (linhas === 1 ? 1 : i / (linhas - 1)));
  const soma = R.reduce((a, b) => a + b, 0), ideal = R.map(r => N * r / soma), n = ideal.map(Math.floor);
  let falta = N - n.reduce((a, b) => a + b, 0);
  ideal.map((v, i) => [v - Math.floor(v), i]).sort((a, b) => b[0] - a[0]).forEach(([, i]) => { if (falta > 0) { n[i]++; falta--; } });
  const pts = []; let dmin = Infinity;
  R.forEach((r, i) => {
    const k = n[i]; if (k <= 0) return;
    if (k > 1) dmin = Math.min(dmin, Math.PI * r / (k - 1));
    for (let j = 0; j < k; j++) { const th = k === 1 ? Math.PI / 2 : Math.PI * j / (k - 1); pts.push({ x: -r * Math.cos(th), y: -r * Math.sin(th), th, r }); }
  });
  const passo = linhas > 1 ? (1 - r0) / (linhas - 1) : 1;
  pts.sort((a, b) => a.th - b.th || a.r - b.r);
  return { pts, raio: Math.min(passo, dmin) * 0.44 };
}
const cores = it => it.map(x => corPartido(x.sg));
function pontos(it, N) { const { pts, raio } = posicoes(N), c = cores(it), out = []; let k = 0;
  it.forEach((g, gi) => { for (let j = 0; j < g.n && k < pts.length; j++, k++) out.push({ ...pts[k], cor: c[gi], sg: g.sg }); });
  while (k < pts.length) { out.push({ ...pts[k], cor: '#d9d4f0', sg: '' }); k++; }
  return { out, raio }; }

function svgBloco(it, total, tit) {
  const ocup = it.reduce((a, x) => a + x.n, 0), { out, raio } = pontos(it, total), W = 220, cx = 110, cy = 108, S = 100;
  const circ = out.map(p => `<circle cx="${(cx + p.x * S).toFixed(1)}" cy="${(cy + p.y * S).toFixed(1)}" r="${(raio * S).toFixed(2)}" fill="${p.cor}"><title>${esc(sgTxt(p.sg) || 'sem partido definido')}</title></circle>`).join('');
  return `<svg class="cad-svg" viewBox="0 0 ${W} 116" role="img" aria-label="${esc(tit)}: ${ocup} de ${total} cadeiras">${circ}<text x="${cx}" y="${cy - 5}" text-anchor="middle" class="cad-num">${ocup}/${total}</text></svg>`;
}
const legenda = it => `<ul class="cad-leg">${it.map(x => `<li><i style="background:${corPartido(x.sg)}"></i><b>${esc(sgTxt(x.sg))}</b> ${x.n}</li>`).join('')}</ul>`;

// blocos: [{rot, itens:[{sg,n}], total}]; o primeiro é o grande. Devolve o HTML da seção (ligarCadeiras ativa os botões de imagem).
export function cadeirasHTML({ titulo, sub, blocos, fonte = 'TSE' }) {
  const bs = blocos.filter(b => b.itens.length), id = 'cad' + (++_id);
  if (!bs.length) return '';
  const dados = esc(JSON.stringify({ titulo, sub, fonte, blocos: bs.map(b => ({ rot: b.rot, total: b.total, itens: b.itens })) }));
  const corpo = bs.map((b, i) => `<div class="cad-b${i ? ' peq' : ''}"><h3>${esc(b.rot)}</h3>${svgBloco(b.itens, b.total, b.rot)}${legenda(b.itens)}</div>`).join('');
  const ocup = bs[0].itens.reduce((a, x) => a + x.n, 0);
  return `<section class="painel cad sem-export" id="${id}" data-cad="${dados}"><div class="cad-top"><h2>${esc(titulo)}</h2><details class="cad-png"><summary>↓ PNG</summary><div role="group" aria-label="Formato da imagem"><button type="button" data-f="1:1">1:1 · WhatsApp</button><button type="button" data-f="4:5">4:5 · Instagram</button><button type="button" data-f="9:16">9:16 · Stories</button></div></details></div>
    <p class="sub">${esc(sub || '')}${ocup < bs[0].total ? ' Cadeiras em cinza: ainda sem eleito na base do TSE (apuração em andamento ou candidatura cassada).' : ''}</p><div class="cad-corpo">${corpo}</div></section>`;
}

// ---------- imagem para redes ----------
const FORMATOS = { '1:1': [1080, 1080], '4:5': [1080, 1350], '9:16': [1080, 1920] };
const carregaImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = no; i.src = src; });
function quebra(ctx, txt, larg) { const out = []; let l = ''; for (const w of String(txt).split(' ')) { const t = l ? l + ' ' + w : w; if (ctx.measureText(t).width > larg && l) { out.push(l); l = w; } else l = t; } if (l) out.push(l); return out; }
async function desenha(d, fmt) {
  const [W, H] = FORMATOS[fmt]; const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  try { await Promise.all([document.fonts.load('56px "DM Serif Display"'), document.fonts.load('700 30px "Space Grotesk"'), document.fonts.load('400 30px "Space Grotesk"')]); } catch { /* fontes do sistema */ }
  const SERIF = '"DM Serif Display", Georgia, serif', SANS = '"Space Grotesk", system-ui, sans-serif', P = 64;
  g.fillStyle = '#FBF9F5'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#3E347E'; g.fillRect(0, 0, W, 150); g.fillStyle = '#F08A24'; g.fillRect(0, 150, W, 8);
  try { const lg = await carregaImg(new URL('../img/logo-negativo.svg', import.meta.url).href); const h = 62, w = h * lg.width / lg.height; g.drawImage(lg, P, 44, w, h); } catch { g.fillStyle = '#fff'; g.font = `700 40px ${SANS}`; g.fillText('Oficina Política', P, 100); }
  let y = 158 + (H > 1200 ? 70 : 54); g.fillStyle = '#2A2260'; g.textBaseline = 'alphabetic'; g.font = `400 58px ${SERIF}`;
  for (const l of quebra(g, d.titulo, W - 2 * P)) { g.fillText(l, P, y); y += 66; }
  g.fillStyle = '#5d5675'; g.font = `400 28px ${SANS}`; for (const l of quebra(g, d.sub || '', W - 2 * P).slice(0, 2)) { g.fillText(l, P, y); y += 38; }
  y += 14;
  const rodape = 96, livre = H - rodape - y, nb = d.blocos.length, lado = nb === 2 && H <= 1350, GAP = 40;
  // legenda: a fonte encolhe até o maior item caber na coluna
  const legMed = (it, larg, cols) => { let fs = 26; const cl = larg / cols; for (; fs > 15; fs--) { g.font = `700 ${fs}px ${SANS}`; const m = Math.max(...it.map(x => g.measureText(sgTxt(x.sg)).width)); g.font = `400 ${fs}px ${SANS}`; if (m + g.measureText('000').width + fs * 1.9 <= cl) break; } const lh = Math.round(fs * 1.5); return { fs, lh, cols, h: Math.ceil(it.length / cols) * lh + 8 }; };
  const legDesenha = (it, x0, larg, yy, m) => { const cl = larg / m.cols; it.forEach((x, k) => { const lx = x0 + (k % m.cols) * cl, ly = yy + Math.floor(k / m.cols) * m.lh + m.fs; g.fillStyle = corPartido(x.sg); g.beginPath(); g.arc(lx + m.fs * 0.45, ly - m.fs * 0.35, m.fs * 0.42, 0, 2 * Math.PI); g.fill(); g.fillStyle = '#1b1530'; g.font = `700 ${m.fs}px ${SANS}`; const t = sgTxt(x.sg); g.fillText(t, lx + m.fs * 1.15, ly); const tw = g.measureText(t).width; g.font = `400 ${m.fs}px ${SANS}`; g.fillText(String(x.n), lx + m.fs * 1.15 + tw + m.fs * 0.35, ly); }); };
  const desenhaHemi = (b, cx, cy, R) => {
    g.fillStyle = '#3E347E'; g.font = `700 26px ${SANS}`; g.textAlign = 'center'; g.fillText(b.rot.toUpperCase(), cx, cy - R - 26); g.textAlign = 'left';
    const { out, raio } = pontos(b.itens, b.total);
    for (const p of out) { g.beginPath(); g.fillStyle = p.cor; g.arc(cx + p.x * R, cy + p.y * R, raio * R, 0, 2 * Math.PI); g.fill(); }
    const oc = b.itens.reduce((a, x) => a + x.n, 0), txt = `${oc}/${b.total}`; g.font = `400 100px ${SERIF}`; const w100 = g.measureText(txt).width;
    const furo = (0.45 - raio) * R, fs = Math.min(R * 0.3, 1.3 * furo / w100 * 100); g.fillStyle = '#1b1530'; g.font = `400 ${Math.round(fs)}px ${SERIF}`; g.textAlign = 'center'; g.fillText(txt, cx, cy - R * 0.03); g.textAlign = 'left';
  };
  if (lado) {
    const colW = (W - 2 * P - GAP) / 2, ms = d.blocos.map(b => legMed(b.itens, colW, 2)), legH = Math.max(...ms.map(m => m.h));
    const R = Math.max(120, Math.min(colW / 2 - 4, livre - 56 - 28 - legH - 20)), cy = y + 56 + R;
    d.blocos.forEach((b, i) => { const x0 = P + i * (colW + GAP); desenhaHemi(b, x0 + colW / 2, cy, R); legDesenha(b.itens, x0, colW, cy + 28, ms[i]); });
  } else {
    const cols = H <= 1350 ? 4 : 3, ms = d.blocos.map(b => legMed(b.itens, W - 2 * P, cols)), pesos = d.blocos.map((_, i) => i === 0 ? 1 : 0.55);
    const fixo = ms.reduce((a, m) => a + 56 + 28 + m.h + 26, 0), soma = pesos.reduce((a, b) => a + b, 0);
    d.blocos.forEach((b, i) => {
      const maxR = i === 0 ? (W - 2 * P) / 2 : 290, R = Math.max(110, Math.min(maxR, (livre - fixo) * pesos[i] / soma)), cy = y + 56 + R;
      desenhaHemi(b, W / 2, cy, R); legDesenha(b.itens, P, W - 2 * P, cy + 28, ms[i]); y = cy + 28 + ms[i].h + 26;
    });
  }
  g.fillStyle = '#5d5675'; g.font = `400 24px ${SANS}`; g.fillText(`Fonte: ${d.fonte}. oficinapolitica.com.br`, P, H - 44);
  return new Promise(ok => cv.toBlob(ok, 'image/png'));
}
export function ligarCadeiras(root) {
  root.querySelectorAll('.cad[data-cad]').forEach(sec => {
    if (sec.dataset.lig) return; sec.dataset.lig = '1';
    sec.querySelector('.cad-png')?.addEventListener('click', async e => {
      const b = e.target.closest('button[data-f]'); if (!b) return;
      const fmt = b.dataset.f; b.disabled = true; const t0 = b.textContent; b.textContent = 'Gerando…';
      try { const blob = await desenha(JSON.parse(sec.dataset.cad), fmt); const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `cadeiras_${fmt.replace(':', 'x')}.png`; document.body.append(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000); }
      catch { b.textContent = 'Não foi possível gerar'; setTimeout(() => { b.textContent = t0; b.disabled = false; }, 2500); return; }
      b.textContent = t0; b.disabled = false; sec.querySelector('.cad-png').open = false;
    });
  });
}
