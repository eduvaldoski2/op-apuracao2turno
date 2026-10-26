// Gráficos de linha em SVG puro (sem dependências): avanço da apuração, placar e projeção ao longo da apuração.
import { CAND, fNum, fPct, fInt } from './util.js?v=bf33160a';

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
  const cid = 'cp' + Math.random().toString(36).slice(2, 8);
  g += `<clipPath id="${cid}"><rect x="${M.l}" y="${M.t - 2}" width="${iw}" height="${ih + 4}"/></clipPath><g clip-path="url(#${cid})">`;
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
  g += '</g>';
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



// escala vertical adaptativa: acompanha as curvas (corrida apertada = zoom), com graduação "redonda"
// descarta as primeiras parciais (poucas seções, muito ruidosas) quando já existem outras suficientes
const semRuido = (arr, pst) => { const r = arr.filter(p => pst(p) >= 2); return r.length >= 6 ? r : arr; };
function escalaY(vals, minimo = 4) {
  const v = vals.filter(Number.isFinite); if (!v.length) return { y: [40, 60], yt: [40, 50, 60] };
  let lo = Math.min(...v), hi = Math.max(...v); if (hi - lo < minimo) { const m = (hi + lo) / 2; lo = m - minimo / 2; hi = m + minimo / 2; }
  const pad = (hi - lo) * 0.12; lo -= pad; hi += pad;
  const passo = [0.5, 1, 2, 2.5, 5, 10, 20, 25].find(p => (hi - lo) / p <= 6) || 25;
  lo = Math.max(0, Math.floor(lo / passo) * passo); hi = Math.min(100, Math.ceil(hi / passo) * passo);
  const yt = []; for (let t = lo; t <= hi + 1e-9; t += passo) yt.push(+t.toFixed(2));
  return { y: [lo, hi], yt };
}
const fPctY = v => (Number.isInteger(v) ? v : String(v).replace('.', ',')) + '%';

// Evolução da apuração no tempo: % dos votos válidos de cada candidato × horário da parcial do TSE
const segs = h => { const [a, b, c] = String(h).split(':'); return (+a) * 3600 + (+b || 0) * 60 + (+c || 0); };
const hhmmSeg = t => { const m = Math.round(t / 60) % 1440; return String(Math.floor(m / 60)).padStart(2, '0') + 'h' + String(m % 60).padStart(2, '0'); };
function graficoTempo(el, hist) {
  // ordena por horário do TSE, uma parcial por horário (a última), e trata a virada da meia-noite
  const por = new Map(); let ant = -1, dia = 0;
  for (const h of hist.filter(h => h.hg && h.vv > 0)) { let t = segs(h.hg); if (ant >= 0 && t + dia * 86400 < ant - 3600) dia++; ant = t + dia * 86400; por.set(h.hg + '|' + dia, { h, t: t + dia * 86400 }); }
  const pts = semRuido([...por.values()].sort((a, b) => a.t - b.t), p => p.h.pst);
  if (!pts.length) { el.innerHTML = '<p class="vazio">Aguardando a primeira divulgação do TSE…</p>'; return; }
  const tip = h => `<b>${h.ht || String(h.hg).slice(0, 5)}</b> · ${fNum(h.pst, 2)}% apurado<br><span style="color:${CAND.L.cor}">${CAND.L.nome} ${fNum(100 * h.L / h.vv, 2)}%</span> · <span style="color:${CAND.F.cor}">${CAND.F.nome} ${fNum(100 * h.F / h.vv, 2)}%</span><br><span class="t-s">${fInt(h.L)} × ${fInt(h.F)} votos</span>`;
  const L = pts.map(p => ({ x: p.t, y: 100 * p.h.L / p.h.vv, tip: tip(p.h) })), F = pts.map(p => ({ x: p.t, y: 100 * p.h.F / p.h.vv, tip: tip(p.h) }));
  let t0 = pts[0].t, t1 = pts[pts.length - 1].t; if (t1 - t0 < 120) { t0 -= 60; t1 += 60; }
  const n = (el.clientWidth || 900) < 600 ? 4 : 6, xt = Array.from({ length: n }, (_, i) => Math.round((t0 + (t1 - t0) * i / (n - 1)) / 60) * 60);
  const esc2 = escalaY([...L.map(p => p.y), ...F.map(p => p.y), 50]);
  const series = [{ cor: CAND.L.cor, pts: L, w: 3.4 }, { cor: CAND.F.cor, pts: F, w: 3.4 }];
  const ponta = (X, Y) => [[L, CAND.L.cor], [F, CAND.F.cor]].map(([a, c]) => { const p = a[a.length - 1]; return `<circle cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="7.5" fill="${c}"/>`; }).join('');
  linhas(el, { x: [t0, t1], y: esc2.y, yt: esc2.yt, refY: [{ y: 50, txt: '50%' }], xt, xf: hhmmSeg, yf: fPctY, series, extra: ponta, h: 300,
    aria: 'Evolução da apuração: percentual de votos válidos de cada candidato ao longo do horário das parciais do TSE' });
  el.insertAdjacentHTML('beforeend', `<div class="g-leg"><span><b style="background:${CAND.L.cor}">${CAND.L.partido}</b>${esc(CAND.L.nome)}</span><span><b style="background:${CAND.F.cor}">${CAND.F.partido}</b>${esc(CAND.F.nome)}</span></div>`);
}

// Marcha da apuração: % dos válidos × % apurado, com o horário de cada parcial; no modo projeção soma a linha projetada com faixa
export function graficoPlacar(el, hist, { projecao = false } = {}) {
  if (!hist.length) { el.innerHTML = '<p class="vazio">Aguardando a primeira divulgação do TSE…</p>'; return; }
  if (!projecao) return graficoTempo(el, hist);
  hist = semRuido(hist.filter(h => h.vv > 0 && Number.isFinite(h.pst)), h => h.pst);
  if (!hist.length) { el.innerHTML = '<p class="vazio">Aguardando a primeira divulgação do TSE…</p>'; return; }
  const L = hist.map(h => ({ x: h.pst, y: 100 * h.L / h.vv, h })), F = hist.map(h => ({ x: h.pst, y: 100 * h.F / h.vv, h }));
  const tipo = (p, extra = '') => `<b>${fNum(p.h.pst, 2)}%</b> apurado (${p.h.ht})<br><span style="color:${CAND.L.cor}">${CAND.L.nome} ${fNum(100 * p.h.L / p.h.vv, 2)}%</span> · <span style="color:${CAND.F.cor}">${CAND.F.nome} ${fNum(100 * p.h.F / p.h.vv, 2)}%</span>${extra}`;
  L.forEach(p => p.tip = tipo(p, projecao ? `<br>Projeção final ${CAND.L.nome}: <b>${fNum(p.h.pL, 2)}%</b> (${fNum(p.h.lo, 2)}–${fNum(p.h.hi, 2)})` : ''));
  F.forEach(p => p.tip = L[F.indexOf(p)].tip);
  const series = [{ cor: CAND.L.cor, pts: L, w: 2.4, marker: hist.length < 40 ? 2.8 : 0 }, { cor: CAND.F.cor, pts: F, w: 2.4, marker: hist.length < 40 ? 2.8 : 0 }];
  let vals = L.map(p => p.y).concat(F.map(p => p.y));
  if (projecao) {
    const pr = hist.filter(h => Number.isFinite(h.pL) && Number.isFinite(h.lo) && Number.isFinite(h.hi));
    series.push({ cor: CAND.L.cor, dash: '5 4', w: 1.8, pts: pr.map(h => ({ x: h.pst, y: h.pL, tip: L[hist.indexOf(h)].tip })), faixa: pr.map(h => ({ x: h.pst, lo: h.lo, hi: h.hi })) });
    series.push({ cor: CAND.F.cor, dash: '5 4', w: 1.8, pts: pr.map(h => ({ x: h.pst, y: 100 - h.pL, tip: L[hist.indexOf(h)].tip })), faixa: pr.map(h => ({ x: h.pst, lo: 100 - h.hi, hi: 100 - h.lo })) });
    vals = vals.concat(pr.flatMap(h => [h.pL, 100 - h.pL, h.lo, h.hi, 100 - h.lo, 100 - h.hi]));
  }
  // a escala acompanha as linhas (placar e projeção); as faixas de confiança apenas se ajustam a ela
  const lin = L.map(p => p.y).concat(F.map(p => p.y)); if (projecao) hist.forEach(h => { if (Number.isFinite(h.pL)) lin.push(h.pL, 100 - h.pL); });
  const ey = escalaY(lin.concat(50), 5);
  const px = hist.map(h => h.pst), x0 = Math.max(0, Math.floor(Math.min(...px) / 5) * 5), x1 = Math.min(100, Math.max(x0 + 10, Math.ceil(Math.max(...px) / 5) * 5 + 5));
  const passoX = [1, 2, 5, 10, 20, 25].find(p => (x1 - x0) / p <= 6) || 25, xtk = []; for (let t = Math.ceil(x0 / passoX) * passoX; t <= x1 + 1e-9; t += passoX) xtk.push(t);
  linhas(el, { x: [x0, x1], y: ey.y, yt: ey.yt, xt: xtk, xf: v => v + '%', yf: fPctY, xTitulo: '% das seções apuradas (sob cada ponto, o horário da parcial do TSE)', refY: [{ y: 50, txt: '50%' }], series, h: 350, mb: 78, horas: hist.map(h => ({ x: h.pst, t: h.ht })),
    aria: 'Marcha da apuração: percentual de votos válidos de cada candidato conforme avança a apuração, com o horário de cada parcial' });
}
