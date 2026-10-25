// Mapa por bairro (malha do IBGE, Censo 2022) de um município: cada polígono recebe a soma dos locais de votação que caem nele.
import { corDoPct, corTexto, fNum, fDelta, CAND } from './util.js?v=94f14732';

const W = 720, num = v => (v == null || isNaN(v)) ? '–' : fNum(v, 1), dl = v => (v == null || isNaN(v)) ? '' : fDelta(v, 1, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function criarMapaBairros(el, geo, { tooltip, onClick, nome = s => s } = {}) {
  let la0 = 90, la1 = -90, lo0 = 180, lo1 = -180;
  for (const f of geo.f) for (const p of f.p) { const r = p[0]; for (let i = 0; i < r.length; i += 2) { if (r[i] < lo0) lo0 = r[i]; if (r[i] > lo1) lo1 = r[i]; if (r[i + 1] < la0) la0 = r[i + 1]; if (r[i + 1] > la1) la1 = r[i + 1]; } }
  const cl = Math.cos((la0 + la1) / 2 * Math.PI / 180), gw = (lo1 - lo0) * cl, gh = la1 - la0, k = Math.min(W / gw, 620 / gh), vw = Math.round(gw * k) + 10, vh = Math.round(gh * k) + 10;
  const X = lon => ((lon - lo0) * cl * k + 5), Y = lat => ((la1 - lat) * k + 5);
  const itens = geo.f.map((f, i) => {
    let d = '', bx0 = 1e9, bx1 = -1e9, by0 = 1e9, by1 = -1e9;
    for (const p of f.p) for (const r of p) { d += 'M'; for (let j = 0; j < r.length; j += 2) { const x = X(r[j]), y = Y(r[j + 1]); d += (j ? 'L' : '') + x.toFixed(1) + ' ' + y.toFixed(1); if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; } d += 'Z'; }
    // ponto do rótulo: centro do retângulo envolvente do maior anel
    let big = null, ba = 0; for (const p of f.p) { const r = p[0]; let a0 = 1e9, a1 = -1e9, c0 = 1e9, c1 = -1e9; for (let j = 0; j < r.length; j += 2) { const x = X(r[j]), y = Y(r[j + 1]); a0 = Math.min(a0, x); a1 = Math.max(a1, x); c0 = Math.min(c0, y); c1 = Math.max(c1, y); } const a = (a1 - a0) * (c1 - c0); if (a > ba) { ba = a; big = [(a0 + a1) / 2, (c0 + c1) / 2, Math.min(a1 - a0, c1 - c0) / 2]; } }
    return { i, n: f.n, d, lx: big ? big[0] : (bx0 + bx1) / 2, ly: big ? big[1] : (by0 + by1) / 2, r: big ? big[2] : 0 };
  });
  el.classList.add('mapa-wrap', 'mapa-mun');
  el.innerHTML = `<svg class="mapa" viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Mapa por bairro"></svg>
    <div class="zoom sem-export"><button type="button" data-z="in" aria-label="Aproximar">+</button><button type="button" data-z="out" aria-label="Afastar">−</button><button type="button" data-z="0" aria-label="Ver tudo">⤢</button></div><div class="mapa-tip" hidden></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.mapa-tip');
  let z = 1, cx = vw / 2, cy = vh / 2, kpx = 1, dados = {};
  const view = () => { const w = vw / z, h = vh / z; cx = Math.max(w / 2, Math.min(vw - w / 2, cx)); cy = Math.max(h / 2, Math.min(vh - h / 2, cy)); svg.setAttribute('viewBox', `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`); };
  function desenhar() {
    kpx = (svg.clientWidth || vw) / vw; const sw = (0.6 / z).toFixed(2); let p = '', t = '';
    for (const it of itens) {
      const d = dados[it.i], fill = d && d.k ? corDoPct(d.k, d.pw) : (d ? '#d9d6e3' : '#ece9f4'), txt = corTexto(fill);
      p += `<path class="mun" data-p="${it.i}" d="${it.d}" fill="${fill}" fill-rule="evenodd" stroke="#fff" stroke-width="${sw}" stroke-linejoin="round"/>`;
      const px = it.r * z * kpx, fs = 8 / (z * kpx);
      if (d && d.k && px >= 11) {
        const nm = esc(nome(it.n)), nc = nm.length * fs * 0.5 > it.r * 2 ? nm.slice(0, Math.max(3, Math.floor(it.r * 2 / (fs * 0.5)) - 1)) + '.' : nm;
        if (d.solo) t += px >= 22 ? `<g pointer-events="none"><text x="${it.lx}" y="${it.ly - 2 * fs / 8}" text-anchor="middle" font-size="${6.2 * fs / 8}" font-weight="800" fill="${txt}">${nc}</text><text x="${it.lx}" y="${it.ly + 6 * fs / 8}" text-anchor="middle" font-size="${8 * fs / 8}" font-weight="700" fill="${txt}">${num(d.pw)}</text></g>` : `<text pointer-events="none" x="${it.lx}" y="${it.ly + 2.4 * fs / 8}" text-anchor="middle" font-size="${6.6 * fs / 8}" font-weight="800" fill="${txt}">${num(d.pw)}</text>`;
        else t += px >= 22 ? `<g pointer-events="none"><text x="${it.lx}" y="${it.ly - 7 * fs / 8}" text-anchor="middle" font-size="${6.2 * fs / 8}" font-weight="800" fill="${txt}">${nc}</text><text x="${it.lx}" y="${it.ly + 1 * fs / 8}" text-anchor="middle" font-size="${7.2 * fs / 8}" fill="${txt}"><tspan font-weight="700">${num(d.pL)}</tspan><tspan dx="1.5" font-size="${5.2 * fs / 8}" opacity=".9">${dl(d.dL)}</tspan></text><text x="${it.lx}" y="${it.ly + 8.4 * fs / 8}" text-anchor="middle" font-size="${7.2 * fs / 8}" fill="${txt}"><tspan font-weight="700">${num(d.pF)}</tspan><tspan dx="1.5" font-size="${5.2 * fs / 8}" opacity=".9">${dl(d.dF)}</tspan></text></g>`
          : `<text pointer-events="none" x="${it.lx}" y="${it.ly + 2.4 * fs / 8}" text-anchor="middle" font-size="${6.6 * fs / 8}" font-weight="800" fill="${txt}">${num(d.pw)}</text>`;
      }
    }
    svg.innerHTML = `<rect x="-5" y="-5" width="${vw + 10}" height="${vh + 10}" fill="#f6f4fa"/><g>${p}</g><g>${t}</g>`; view();
  }
  const alvo = ev => ev.target.closest('[data-p]')?.dataset.p;
  let arrasto = null, moveu = false;
  svg.addEventListener('pointerdown', ev => { arrasto = { x: ev.clientX, y: ev.clientY, cx, cy }; moveu = false; });
  svg.addEventListener('pointermove', ev => {
    if (arrasto && ev.buttons) { const r = svg.getBoundingClientRect(), e2 = (vw / z) / r.width, dx = ev.clientX - arrasto.x, dy = ev.clientY - arrasto.y; if (Math.abs(dx) + Math.abs(dy) > 4) moveu = true; if (moveu && z > 1) { cx = arrasto.cx - dx * e2; cy = arrasto.cy - dy * e2; view(); } tip.hidden = true; return; }
    const m = alvo(ev); if (m == null || !tooltip) { tip.hidden = true; return; }
    tip.innerHTML = tooltip(+m); tip.hidden = false; const r = el.getBoundingClientRect(); const x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
    tip.style.left = Math.max(0, Math.min(x, r.width - tip.offsetWidth - 4)) + 'px'; tip.style.top = Math.max(0, Math.min(y, r.height - tip.offsetHeight - 4)) + 'px';
  });
  svg.addEventListener('pointerup', ev => { if (!moveu) { const m = alvo(ev); if (m != null && onClick) onClick(+m); } arrasto = null; });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; arrasto = null; });
  const zoom = (f, px, py) => {
    const nz = Math.max(1, Math.min(24, z * f)); if (nz === z) return;
    if (px != null) { const r = svg.getBoundingClientRect(), w = vw / z, h = vh / z, ax = cx - w / 2 + (px - r.left) / r.width * w, ay = cy - h / 2 + (py - r.top) / r.height * h, w2 = vw / nz, h2 = vh / nz; cx = ax - (px - r.left) / r.width * w2 + w2 / 2; cy = ay - (py - r.top) / r.height * h2 + h2 / 2; }
    z = nz; if (z === 1) { cx = vw / 2; cy = vh / 2; } desenhar();
  };
  svg.addEventListener('wheel', ev => { ev.preventDefault(); zoom(ev.deltaY < 0 ? 1.3 : 1 / 1.3, ev.clientX, ev.clientY); }, { passive: false });
  el.querySelector('.zoom').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; const t = b.dataset.z; if (t === 'in') zoom(1.6); else if (t === 'out') zoom(1 / 1.6); else { z = 1; cx = vw / 2; cy = vh / 2; desenhar(); } });
  desenhar();
  return { atualizar(d) { dados = d; desenhar(); } };
}
