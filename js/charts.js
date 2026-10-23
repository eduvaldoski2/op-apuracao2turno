// Gráficos de linha em SVG puro (sem dependências): avanço da apuração, placar e projeção ao longo da apuração.
import { CAND, fNum, fPct, fInt } from './util.js?v=7d0b3ec3';

const M0 = { l: 46, r: 18, t: 20, b: 36 };
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function eixo(dom, n) { const [a, b] = dom; const passo = (b - a) / n; return Array.from({ length: n + 1 }, (_, i) => a + i * passo); }
function bonito(a, b, n = 5) { // passo "redondo"
  const bruto = (b - a) / n, mag = 10 ** Math.floor(Math.log10(bruto)), r = bruto / mag, passo = (r < 1.5 ? 1 : r < 3 ? 2 : r < 7 ? 5 : 10) * mag;
  const ini = Math.ceil(a / passo) * passo, t = []; for (let v = ini; v <= b + 1e-9; v += passo) t.push(+v.toFixed(6)); return t;
}

// cfg: { x:[min,max], y:[min,max], xt:[ticks], yt:[ticks], xf, yf, series:[{nome,cor,pts:[{x,y,tip}],dash,marker,w,faixa:[{x,lo,hi}],rotulos:fn}], refY:[{y,txt}], extra: svg string, tipTitulo }
export function linhas(el, cfg) {
  const W = (el.clientWidth || 900) < 600 ? 440 : 820, H = cfg.h || 300, M = { ...M0, b: cfg.mb || M0.b };
  const iw = W - M.l - M.r, ih = H - M.t - M.b;
  const X = v => M.l + (v - cfg.x[0]) / (cfg.x[1] - cfg.x[0]) * iw, Y = v => M.t + ih - (v - cfg.y[0]) / (cfg.y[1] - cfg.y[0]) * ih;
  let g = '';
  const yt = cfg.yt || bonito(cfg.y[0], cfg.y[1], 5), xt = cfg.xt || bonito(cfg.x[0], cfg.x[1], W < 600 ? 4 : 6);
  for (const v of yt) g += `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v)}" y2="${Y(v)}" class="grade"/><text x="${M.l - 7}" y="${Y(v) + 3.5}" text-anchor="end" class="eixo">${cfg.yf ? cfg.yf(v) : v}</text>`;
  for (const v of xt) g += `<line x1="${X(v)}" x2="${X(v)}" y1="${M.t}" y2="${H - M.b}" class="grade v"/><text x="${X(v)}" y="${H - M.b + 16}" text-anchor="middle" class="eixo">${cfg.xf ? cfg.xf(v) : v}</text>`;
  for (const r of cfg.refY || []) g += `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(r.y)}" y2="${Y(r.y)}" class="ref"/><text x="${W - M.r - 3}" y="${Y(r.y) - 4}" text-anchor="end" class="eixo ref-t">${esc(r.txt)}</text>`;
  if (cfg.horas) { // horário de cada parcial, sob o eixo (rotacionado, com espaçamento mínimo)
    let ult = -1e9; const gap = W < 600 ? 15 : 13;
    for (const h of cfg.horas) { const x = X(h.x); if (x - ult < gap) continue; ult = x; g += `<line x1="${x}" x2="${x}" y1="${H - M.b}" y2="${H - M.b + 4}" class="tick-h"/><text transform="translate(${x + 3.5},${H - M.b + 30}) rotate(-62)" text-anchor="end" class="hora">${esc(h.t)}</text>`; }
    g += `<text x="${M.l - 7}" y="${H - M.b + 30}" text-anchor="end" class="eixo hora-tit">hora ›</text>`;
  }
  if (cfg.xTitulo) g += `<text x="${M.l + iw / 2}" y="${H - 3}" text-anchor="middle" class="eixo tit">${esc(cfg.xTitulo)}</text>`;
  for (const s of cfg.series) {
    if (s.faixa?.length > 1) {
      const up = s.faixa.map(p => `${X(p.x)},${Y(p.hi)}`), dn = s.faixa.slice().reverse().map(p => `${X(p.x)},${Y(p.lo)}`);
      g += `<polygon points="${up.concat(dn).join(' ')}" fill="${s.cor}" opacity=".16"/>`;
    }
    if (s.pts.length) {
      const d = s.pts.map((p, i) => `${i ? 'L' : 'M'}${X(p.x).toFixed(1)},${Y(p.y).toFixed(1)}`).join('');
      g += `<path d="${d}" fill="none" stroke="${s.cor}" stroke-width="${s.w || 2.4}" ${s.dash ? `stroke-dasharray="${s.dash}"` : ''} stroke-linejoin="round" stroke-linecap="round"/>`;
      if (s.marker) for (const p of s.pts) g += `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${s.marker}" fill="#fff" stroke="${s.cor}" stroke-width="2"/>`;
      if (s.rotulos) { let ult = -1e9; s.pts.forEach((p, i) => { const t = s.rotulos(p, i); if (t && (X(p.x) - ult >= (W < 600 ? 120 : 78) || i === s.pts.length - 1)) { const xx = X(p.x); const anc = xx > W - 70 ? 'end' : 'middle'; g += `<text x="${xx.toFixed(1)}" y="${(Y(p.y) - 9).toFixed(1)}" text-anchor="${anc}" class="rot-pt" fill="${s.cor}">${esc(t)}</text>`; ult = xx; } }); }
    }
  }
  if (cfg.extra) g += cfg.extra(X, Y);
  el.innerHTML = `<svg viewBox="0 0 ${W} ${H}" class="grafico" role="img" aria-label="${esc(cfg.aria || 'gráfico')}">${g}<line class="cursor" y1="${M.t}" y2="${H - M.b}" hidden/></svg><div class="g-tip" hidden></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.g-tip'), cur = svg.querySelector('.cursor');
  const todos = cfg.series.filter(s => s.pts.length).flatMap(s => s.pts.map(p => ({ ...p, s })));
  svg.addEventListener('pointermove', ev => {
    if (!todos.length) return;
    const r = svg.getBoundingClientRect(), vx = (ev.clientX - r.left) / r.width * W;
    let best = null, bd = 1e9; for (const p of todos) { const d = Math.abs(X(p.x) - vx); if (d < bd) { bd = d; best = p; } }
    if (!best || bd > 60) { tip.hidden = true; cur.setAttribute('hidden', ''); return; }
    cur.removeAttribute('hidden'); cur.setAttribute('x1', X(best.x)); cur.setAttribute('x2', X(best.x));
    tip.innerHTML = best.tip || ''; tip.hidden = false;
    const px = X(best.x) / W * r.width; tip.style.left = Math.max(4, Math.min(px + 10, r.width - tip.offsetWidth - 4)) + 'px'; tip.style.top = '8px';
  });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; cur.setAttribute('hidden', ''); });
  return { X, Y };
}

const minutos = h => { const [a, b] = String(h).split(':'); return (+a) * 60 + (+b || 0); };
const hhmm = m => String(Math.floor(m / 60) % 24).padStart(2, '0') + ':' + String(Math.round(m % 60)).padStart(2, '0');

// Marcha da apuração: % dos válidos × % apurado, com o horário de cada parcial; no modo projeção soma a linha projetada com faixa
export function graficoPlacar(el, hist, { projecao = false } = {}) {
  if (!hist.length) { el.innerHTML = '<p class="vazio">Aguardando a primeira divulgação do TSE…</p>'; return; }
  const L = hist.map(h => ({ x: h.pst, y: 100 * h.L / h.vv, h })), F = hist.map(h => ({ x: h.pst, y: 100 * h.F / h.vv, h }));
  const tipo = (p, extra = '') => `<b>${fNum(p.h.pst, 1)}%</b> apurado (${p.h.ht})<br><span style="color:${CAND.L.cor}">${CAND.L.nome} ${fNum(100 * p.h.L / p.h.vv, 2)}%</span> · <span style="color:${CAND.F.cor}">${CAND.F.nome} ${fNum(100 * p.h.F / p.h.vv, 2)}%</span>${extra}`;
  L.forEach(p => p.tip = tipo(p, projecao ? `<br>Projeção final ${CAND.L.nome}: <b>${fNum(p.h.pL, 2)}%</b> (${fNum(p.h.lo, 2)}–${fNum(p.h.hi, 2)})` : ''));
  F.forEach(p => p.tip = L[F.indexOf(p)].tip);
  const series = [{ cor: CAND.L.cor, pts: L, w: 2.4, marker: hist.length < 40 ? 2.8 : 0 }, { cor: CAND.F.cor, pts: F, w: 2.4, marker: hist.length < 40 ? 2.8 : 0 }];
  let vals = L.map(p => p.y).concat(F.map(p => p.y));
  if (projecao) {
    const pr = hist.filter(h => h.pL != null);
    series.push({ cor: CAND.L.cor, dash: '5 4', w: 1.8, pts: pr.map(h => ({ x: h.pst, y: h.pL, tip: L[hist.indexOf(h)].tip })), faixa: pr.map(h => ({ x: h.pst, lo: h.lo, hi: h.hi })) });
    series.push({ cor: CAND.F.cor, dash: '5 4', w: 1.8, pts: pr.map(h => ({ x: h.pst, y: 100 - h.pL, tip: L[hist.indexOf(h)].tip })), faixa: pr.map(h => ({ x: h.pst, lo: 100 - h.hi, hi: 100 - h.lo })) });
    vals = vals.concat(pr.flatMap(h => [h.pL, 100 - h.pL, h.lo, h.hi, 100 - h.lo, 100 - h.hi]));
  }
  let lo = Math.min(...vals, 47), hi = Math.max(...vals, 53); lo = Math.floor((lo - 1) / 2) * 2; hi = Math.ceil((hi + 1) / 2) * 2;
  linhas(el, { x: [0, 100], y: [Math.max(0, lo), Math.min(100, hi)], xt: [0, 20, 40, 60, 80, 100], xf: v => v + '%', yf: v => v + '%', xTitulo: '% das seções apuradas (sob cada ponto, o horário da parcial do TSE)', refY: [{ y: 50, txt: '50%' }], series, h: 350, mb: 78, horas: hist.map(h => ({ x: h.pst, t: h.ht })),
    aria: 'Marcha da apuração: percentual de votos válidos de cada candidato conforme avança a apuração, com o horário de cada parcial' });
}
