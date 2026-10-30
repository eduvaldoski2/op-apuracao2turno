// Mapa do Brasil por UF (SVG). Estados pequenos ganham quadro lateral ("seta") com o resultado.
import { corDoPct, corTexto, fNum, fDelta, CAND, sigla, ESC } from './util.js?v=1c927173';
import { entenda } from './ui.js?v=1c927173';

const CALLOUT = { // x,y do quadro (unidades do viewBox)
  rn: [632, 146], pb: [632, 188], pe: [632, 230], al: [632, 272], se: [632, 314], df: [632, 356], es: [632, 398], rj: [632, 440], sc: [632, 482], ac: [6, 292],
};
const BW = 108, BH = 38;
const num = v => (v == null || isNaN(v)) ? '–' : fNum(v, 1);
const dl = v => (v == null || isNaN(v)) ? '' : fDelta(v, 1, '');

export function criarMapa(el, geo, { onClick, tooltip } = {}) {
  el.classList.add('mapa-wrap');
  el.innerHTML = `<svg class="mapa" viewBox="0 0 745 640" role="img" aria-label="Mapa do Brasil por estado"></svg><div class="mapa-tip" hidden></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.mapa-tip');
  let dados = {};

  function cores(d) {
    if (!d || d.k == null) return { fill: '#e4e1ea', txt: '#1b1530', stroke: '#ffffff' };
    if (d.fill) return { fill: d.fill, txt: corTexto(d.fill), stroke: '#ffffff' };
    const fill = corDoPct(d.k, d.pw); return { fill, txt: corTexto(fill), stroke: '#ffffff' };
  }
  function linhas(d, x, y, esc, txt, anchor = 'middle') {
    if (d && d.solo) return `<text x="${x}" y="${y + 3 * esc}" text-anchor="${anchor}" font-size="${8.4 * esc}" font-weight="700" fill="${txt}">${d.lab ?? num(d.pw)}</text>`;
    if (!d || d.pL == null || isNaN(d.pL)) return `<text x="${x}" y="${y + 3 * esc}" text-anchor="${anchor}" font-size="${7.5 * esc}" fill="${txt}">–</text>`;
    const row = (k, p, dv, yy) => `<rect x="${x - 17 * esc}" y="${yy - 5.6 * esc}" width="${5 * esc}" height="${5 * esc}" rx="1" fill="${CAND[k].cor}" stroke="#fff" stroke-width=".6"/>` +
      `<text x="${x - 10.5 * esc}" y="${yy - 1 * esc}" font-size="${7.6 * esc}" fill="${txt}"><tspan font-weight="700">${num(p)}</tspan><tspan dx="2" font-size="${5.6 * esc}" opacity=".9">${dl(dv)}</tspan></text>`;
    return row('L', d.pL, d.dL, y) + row('F', d.pF, d.dF, y + 8.6 * esc);
  }
  function desenhar() {
    let p = '', t = '', c = '';
    for (const [id, g] of Object.entries(geo.ufs)) {
      const d = dados[id], cor = cores(d), out = id in CALLOUT;
      p += `<path class="uf" data-uf="${id}" d="${g.d}" fill="${cor.fill}" stroke="${cor.stroke}" stroke-width="1" tabindex="0" role="button" aria-label="${g.n}"/>`;
      if (!out) {
        const esc = Math.max(0.78, Math.min(1.35, g.r / 30));
        t += `<g class="rot" pointer-events="none"><text x="${g.lx}" y="${g.ly - 9 * esc}" text-anchor="middle" font-size="${8.6 * esc}" font-weight="800" fill="${cor.txt}">${sigla(id)}</text>${linhas(d, g.lx + 2.5, g.ly + 1 * esc, esc, cor.txt)}</g>`;
      } else {
        const [bx, by] = CALLOUT[id], cx = id === 'ac' ? bx + BW / 2 : bx, cy = id === 'ac' ? by : by + BH / 2;
        c += `<g class="callout" data-uf="${id}"><polyline points="${g.lx},${g.ly} ${cx},${cy}" fill="none" stroke="#6b6480" stroke-width=".9"/><circle cx="${g.lx}" cy="${g.ly}" r="1.8" fill="#6b6480"/>` +
          `<rect x="${bx}" y="${by}" width="${BW}" height="${BH}" rx="4" fill="#fff" stroke="${cor.fill}" stroke-width="2.2"/><rect x="${bx}" y="${by}" width="6" height="${BH}" rx="3" fill="${cor.fill}"/>` +
          `<text x="${bx + 12}" y="${by + 11}" font-size="8.8" font-weight="800" fill="#1b1530">${sigla(id)}</text>` +
          linhas(d, bx + 50, by + 22, 1, '#1b1530') + `</g>`;
      }
    }
    svg.innerHTML = `<g>${p}</g><g>${c}</g><g>${t}</g>`;
  }
  const alvo = ev => ev.target.closest('[data-uf]')?.dataset.uf;
  svg.addEventListener('click', ev => { const u = alvo(ev); if (u && onClick) onClick(u); });
  svg.addEventListener('keydown', ev => { if (ev.key === 'Enter') { const u = alvo(ev); if (u && onClick) onClick(u); } });
  svg.addEventListener('pointermove', ev => {
    const u = alvo(ev); if (!u || !tooltip) { tip.hidden = true; return; }
    tip.innerHTML = tooltip(u); tip.hidden = false;
    const r = el.getBoundingClientRect(); let x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
    tip.style.left = Math.min(x, r.width - tip.offsetWidth - 4) + 'px'; tip.style.top = Math.min(y, r.height - tip.offsetHeight - 4) + 'px';
  });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; });
  desenhar();
  return { atualizar(d) { dados = d; desenhar(); }, svg };
}

export function legendaMapa() {
  const grad = k => `linear-gradient(90deg, ${corDoPct(k, ESC.min)}, ${corDoPct(k, (ESC.min + ESC.max) / 2)}, ${corDoPct(k, ESC.max)})`;
  return `<div class="leg-mapa"><span><i style="background:${grad('L')}"></i>${CAND.L.nome}: ${ESC.min}% → ${ESC.max}%+</span><span><i style="background:${grad('F')}"></i>${CAND.F.nome}: ${ESC.min}% → ${ESC.max}%+</span><span><i style="background:#e4e1ea"></i>sem apuração</span>${entenda('Cor = quem lidera no estado; tom mais escuro = maior percentual dos votos válidos. Números: % dos válidos e variação (p.p.) em relação ao 1º turno.')}</div>`;
}
