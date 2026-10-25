// Mapa de um estado por município (SVG), no mesmo padrão do mapa do Brasil: cor = quem lidera, tom = % do líder,
// rótulos dentro dos municípios grandes (sigla do nome + % de cada candidato e variação). Sem caixas laterais.
// Suporta zoom (roda do mouse / botões / pinça) e arraste; os rótulos reaparecem conforme o zoom.
import { corDoPct, corTexto, fNum, fDelta, CAND } from './util.js?v=b141ab46';

const num = v => (v == null || isNaN(v)) ? '–' : fNum(v, 1);
const dl = v => (v == null || isNaN(v)) ? '' : fDelta(v, 1, '');
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function criarMapaMun(el, geo, { onClick, tooltip } = {}) {
  const [vw, vh] = geo.viewBox;
  el.classList.add('mapa-wrap', 'mapa-mun');
  el.innerHTML = `<svg class="mapa" viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Mapa dos municípios"></svg>
    <div class="zoom sem-export"><button type="button" data-z="in" aria-label="Aproximar">+</button><button type="button" data-z="out" aria-label="Afastar">−</button><button type="button" data-z="0" aria-label="Ver tudo">⤢</button></div>
    <div class="mapa-tip" hidden></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.mapa-tip');
  let bolhas = false, dados = {}, z = 1, cx = vw / 2, cy = vh / 2, kpx = 1;

  const cor = d => (!d || d.k == null) ? { fill: '#e4e1ea', txt: '#1b1530' } : d.fill ? { fill: d.fill, txt: corTexto(d.fill) } : (f => ({ fill: f, txt: corTexto(f) }))(corDoPct(d.k, d.pw));
  const view = () => { const w = vw / z, h = vh / z; cx = Math.max(w / 2, Math.min(vw - w / 2, cx)); cy = Math.max(h / 2, Math.min(vh - h / 2, cy)); svg.setAttribute('viewBox', `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`); };

  function rotulo(id, g, d, c) {
    // r = raio do maior círculo inscrito (unid. do viewBox); na tela vale r*z*escalaPx
    const px = g.r * z * kpx, fs = 8 / (z * kpx);
    if (px < (geo.rmin ?? 7)) return '';
    const nome = esc(g.n);
    const nomeCurto = nome.length * fs * 0.5 > g.r * 2 ? nome.slice(0, Math.max(3, Math.floor(g.r * 2 / (fs * 0.5)) - 1)) + '.' : nome;
    if (d && d.solo) return px >= 16 ? `<g pointer-events="none"><text x="${g.lx}" y="${g.ly - 3 * fs / 8}" text-anchor="middle" font-size="${6.4 * fs / 8}" font-weight="800" fill="${c.txt}">${nomeCurto}</text><text x="${g.lx}" y="${g.ly + 6 * fs / 8}" text-anchor="middle" font-size="${8.4 * fs / 8}" font-weight="700" fill="${c.txt}">${d.lab ?? num(d.pw)}</text></g>` : `<g pointer-events="none"><text x="${g.lx}" y="${g.ly + 2.6 * fs / 8}" text-anchor="middle" font-size="${7.2 * fs / 8}" font-weight="800" fill="${c.txt}">${d.lab ?? num(d.pw)}</text></g>`;
    if (!d || d.pL == null || isNaN(d.pL)) return px >= 14 ? `<text x="${g.lx}" y="${g.ly}" text-anchor="middle" font-size="${fs * .9}" fill="${c.txt}">${nomeCurto}</text>` : '';
    const row = (k, p, dv, yy) => `<rect x="${g.lx - 17 * fs / 8}" y="${yy - 5.6 * fs / 8}" width="${5 * fs / 8}" height="${5 * fs / 8}" rx="1" fill="${CAND[k].cor}" stroke="#fff" stroke-width=".5"/>` +
      `<text x="${g.lx - 10.5 * fs / 8}" y="${yy - fs / 8}" font-size="${7.6 * fs / 8}" fill="${c.txt}"><tspan font-weight="700">${num(p)}</tspan><tspan dx="2" font-size="${5.6 * fs / 8}" opacity=".9">${dl(dv)}</tspan></text>`;
    if (px >= 16) return `<g pointer-events="none"><text x="${g.lx}" y="${g.ly - 9 * fs / 8}" text-anchor="middle" font-size="${6.4 * fs / 8}" font-weight="800" fill="${c.txt}">${nomeCurto}</text>${row('L', d.pL, d.dL, g.ly + 1 * fs / 8)}${row('F', d.pF, d.dF, g.ly + 9.6 * fs / 8)}</g>`;
    return `<g pointer-events="none"><text x="${g.lx}" y="${g.ly + 2.6 * fs / 8}" text-anchor="middle" font-size="${7.2 * fs / 8}" font-weight="800" fill="${c.txt}">${d.lab ?? num(d.pw)}</text></g>`;
  }
  function desenhar() {
    kpx = (svg.clientWidth || vw) / vw;
    let p = '', t = '';
    const sw = ((geo.sw ?? 0.7) / z).toFixed(2);
    const bol = [];
    const pmax = bolhas ? Math.max(1, ...Object.values(dados).map(d => d?.peso || 0)) : 1, R = Math.min(vw, vh) * 0.06 / Math.pow(z, .55);
    for (const [id, g] of Object.entries(geo.muns)) {
      const d = dados[id], c = cor(d);
      if (bolhas) {
        p += `<path class="mun" data-m="${id}" d="${g.d}" fill="#ece8f2" stroke="#fff" stroke-width="${sw}" stroke-linejoin="round"/>`;
        if (d && d.k != null && d.peso > 0) bol.push({ id, g, c, r: Math.max(R * 0.12, R * Math.sqrt(d.peso / pmax)) });
        continue;
      }
      p += `<path class="mun" data-m="${id}" d="${g.d}" fill="${c.fill}" stroke="#fff" stroke-width="${sw}" stroke-linejoin="round"/>`;
      t += rotulo(id, g, d, c);
    }
    if (bolhas) { bol.sort((a, b) => b.r - a.r); t = bol.map(b => `<circle class="bol" data-m="${b.id}" cx="${b.g.lx}" cy="${b.g.ly}" r="${b.r.toFixed(2)}" fill="${b.c.fill}" fill-opacity=".9" stroke="#fff" stroke-width="${sw}"/>`).join(''); }
    // mapa do Brasil inteiro: contornos dos estados por baixo (cobrem frestas) e por cima (divisas)
    const sob = geo.borda ? `<path d="${geo.borda}" fill="#d6d1e4" stroke="#d6d1e4" stroke-width="${(0.9 / z).toFixed(2)}" pointer-events="none"/>` : '';
    const sobre = geo.borda ? `<path d="${geo.borda}" fill="none" stroke="#1b1530" stroke-opacity=".5" stroke-width="${(0.3 / z).toFixed(2)}" stroke-linejoin="round" pointer-events="none"/>` : '';
    svg.innerHTML = `${sob}<g>${p}</g>${sobre}<g>${t}</g>`;
    view();
  }
  const alvo = ev => ev.target.closest('[data-m]')?.dataset.m;
  // arraste / clique
  let arrasto = null, moveu = false;
  svg.addEventListener('pointerdown', ev => { arrasto = { x: ev.clientX, y: ev.clientY, cx, cy }; moveu = false; });
  svg.addEventListener('pointermove', ev => {
    if (arrasto && ev.buttons) {
      const r = svg.getBoundingClientRect(), esc2 = (vw / z) / r.width, dx = ev.clientX - arrasto.x, dy = ev.clientY - arrasto.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) moveu = true;
      if (moveu && z > 1) { cx = arrasto.cx - dx * esc2; cy = arrasto.cy - dy * esc2; view(); }
      tip.hidden = true; return;
    }
    const m = alvo(ev); if (!m || !tooltip) { tip.hidden = true; return; }
    tip.innerHTML = tooltip(m); tip.hidden = false;
    const r = el.getBoundingClientRect(); const x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
    tip.style.left = Math.max(0, Math.min(x, r.width - tip.offsetWidth - 4)) + 'px'; tip.style.top = Math.max(0, Math.min(y, r.height - tip.offsetHeight - 4)) + 'px';
  });
  svg.addEventListener('pointerup', ev => { if (!moveu) { const m = alvo(ev); if (m && onClick) onClick(m); } arrasto = null; });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; arrasto = null; });
  const zoom = (f, px, py) => {
    const nz = Math.max(1, Math.min(14, z * f)); if (nz === z) return;
    if (px != null) { const r = svg.getBoundingClientRect(), w = vw / z, h = vh / z, ax = cx - w / 2 + (px - r.left) / r.width * w, ay = cy - h / 2 + (py - r.top) / r.height * h; const w2 = vw / nz, h2 = vh / nz; cx = ax - (px - r.left) / r.width * w2 + w2 / 2; cy = ay - (py - r.top) / r.height * h2 + h2 / 2; }
    z = nz; if (z === 1) { cx = vw / 2; cy = vh / 2; } desenhar();
  };
  svg.addEventListener('wheel', ev => { ev.preventDefault(); zoom(ev.deltaY < 0 ? 1.25 : 0.8, ev.clientX, ev.clientY); }, { passive: false });
  el.querySelector('.zoom').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; const k = b.dataset.z; if (k === 'in') zoom(1.5); else if (k === 'out') zoom(1 / 1.5); else { z = 1; cx = vw / 2; cy = vh / 2; desenhar(); } });
  desenhar();
  return { atualizar(d) { dados = d; desenhar(); }, bolhas(on) { bolhas = !!on; desenhar(); }, svg };
}
