// Dispersão (SVG): cada bolha = uma unidade (município); tamanho = eleitorado.
import { fNum } from './util.js?v=5f078210';
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const nice = (lo, hi, n = 5) => { const span = hi - lo || 1, raw = span / n, p = Math.pow(10, Math.floor(Math.log10(raw))), f = raw / p, st = (f < 1.5 ? 1 : f < 3 ? 2 : f < 7 ? 5 : 10) * p, out = []; for (let v = Math.ceil(lo / st) * st; v <= hi + 1e-9; v += st) out.push(+v.toFixed(10)); return out; };

// pts: [{ id, nome, x, y, r (peso), cor, tip }]; xLog: eixo X em escala logarítmica
export function dispersao(el, { pts, xFmt = v => fNum(v, 0) + '%', yFmt = v => fNum(v, 0) + '%', xRot = '', yRot = '', xLog = false, refY = null, onClick, tipo } = {}) {
  const W = 720, H = 400, M = { l: 58, r: 18, t: 14, b: 50 };
  const P = pts.filter(p => isFinite(p.x) && isFinite(p.y) && (!xLog || p.x > 0));
  if (!P.length) { el.innerHTML = '<p class="vazio">Sem dados para o gráfico.</p>'; return; }
  const tx = v => xLog ? Math.log10(v) : v;
  let x0 = Math.min(...P.map(p => tx(p.x))), x1 = Math.max(...P.map(p => tx(p.x))), y0 = Math.min(...P.map(p => p.y)), y1 = Math.max(...P.map(p => p.y));
  const px = (x1 - x0) * .05 || 1, py = (y1 - y0) * .08 || 1; x0 -= px; x1 += px; y0 = Math.max(0, y0 - py); y1 += py;
  const X = v => M.l + (tx(v) - x0) / (x1 - x0) * (W - M.l - M.r), Y = v => H - M.b - (v - y0) / (y1 - y0) * (H - M.t - M.b);
  const rmax = Math.max(...P.map(p => p.r || 1)), R = p => 3 + 16 * Math.sqrt((p.r || 1) / rmax);
  const xt = xLog ? [] : nice(x0, x1, 6); if (xLog) for (let e = Math.ceil(x0); e <= Math.floor(x1); e++) xt.push(Math.pow(10, e));
  const yt = nice(y0, y1, 6);
  let g = '';
  for (const v of yt) g += `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(v)}" y2="${Y(v)}" stroke="#ece9f3"/><text x="${M.l - 8}" y="${Y(v) + 4}" text-anchor="end" font-size="11" fill="#6f6888">${yFmt(v)}</text>`;
  for (const v of xt) g += `<line y1="${M.t}" y2="${H - M.b}" x1="${X(v)}" x2="${X(v)}" stroke="#f3f1f8"/><text x="${X(v)}" y="${H - M.b + 17}" text-anchor="middle" font-size="11" fill="#6f6888">${xFmt(v)}</text>`;
  if (refY != null && refY >= y0 && refY <= y1) g += `<line x1="${M.l}" x2="${W - M.r}" y1="${Y(refY)}" y2="${Y(refY)}" stroke="#2b2540" stroke-dasharray="5 4" opacity=".55"/><text x="${W - M.r}" y="${Y(refY) - 5}" text-anchor="end" font-size="10.5" fill="#2b2540" opacity=".8">média ${yFmt(refY)}</text>`;
  const ord = P.slice().sort((a, b) => (b.r || 0) - (a.r || 0));
  const bol = ord.map(p => `<circle data-i="${esc(p.id)}" cx="${X(p.x).toFixed(1)}" cy="${Y(p.y).toFixed(1)}" r="${R(p).toFixed(1)}" fill="${p.cor}" fill-opacity=".72" stroke="#fff" stroke-width="1"/>`).join('');
  const nomes = ord.slice(0, 6).map(p => `<text x="${X(p.x).toFixed(1)}" y="${(Y(p.y) - R(p) - 3).toFixed(1)}" text-anchor="middle" font-size="10.5" font-weight="700" fill="#2b2540" pointer-events="none" paint-order="stroke" stroke="#fff" stroke-width="3">${esc(p.nome)}</text>`).join('');
  el.classList.add('disp-wrap');
  el.innerHTML = `<svg class="disp" viewBox="0 0 ${W} ${H}" role="img" aria-label="${esc(yRot)} por ${esc(xRot)}"><g>${g}</g><text x="${(W + M.l) / 2}" y="${H - 6}" text-anchor="middle" font-size="12" font-weight="700" fill="#5d5675">${esc(xRot)}</text><text transform="translate(14 ${(H - M.b + M.t) / 2}) rotate(-90)" text-anchor="middle" font-size="12" font-weight="700" fill="#5d5675">${esc(yRot)}</text><g>${bol}</g><g>${nomes}</g></svg><div class="mapa-tip" hidden></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.mapa-tip'), por = new Map(P.map(p => [String(p.id), p]));
  const alvo = ev => ev.target.closest('circle[data-i]')?.dataset.i;
  svg.addEventListener('pointermove', ev => { const i = alvo(ev); if (!i) { tip.hidden = true; return; } tip.innerHTML = por.get(i).tip; tip.hidden = false; const r = el.getBoundingClientRect(); tip.style.left = Math.max(0, Math.min(ev.clientX - r.left + 14, r.width - tip.offsetWidth - 4)) + 'px'; tip.style.top = Math.max(0, Math.min(ev.clientY - r.top + 14, r.height - tip.offsetHeight - 4)) + 'px'; });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; });
  svg.addEventListener('click', ev => { const i = alvo(ev); if (i && onClick) onClick(i); });
}
