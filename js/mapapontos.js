// Mapa de pontos dos locais de votação de um município (SVG, com zoom e arraste).
// Cada ponto = um local de votação; cor = quem lidera (tom = % do líder); tamanho = eleitorado.
import { corDoPct } from './util.js?v=788aabb6';

const W = 720;
export function criarMapaPontos(el, pontos, { tooltip, onClick } = {}) {
  // limites robustos (ignora coordenadas fora do lugar): percentis 2 e 98 + margem
  const ok = pontos.filter(p => p.lat != null && p.lon != null && p.lat !== 0 && p.lon !== 0);
  const q = (arr, f) => { const a = arr.slice().sort((x, y) => x - y); return a[Math.min(a.length - 1, Math.max(0, Math.round(f * (a.length - 1))))]; };
  const la = ok.map(p => p.lat), lo = ok.map(p => p.lon);
  let la0 = q(la, 0.02), la1 = q(la, 0.98), lo0 = q(lo, 0.02), lo1 = q(lo, 0.98);
  if (ok.length < 8) { la0 = Math.min(...la); la1 = Math.max(...la); lo0 = Math.min(...lo); lo1 = Math.max(...lo); }
  const mLa = Math.max((la1 - la0) * 0.08, 0.004), mLo = Math.max((lo1 - lo0) * 0.08, 0.004);
  la0 -= mLa; la1 += mLa; lo0 -= mLo; lo1 += mLo;
  const cl = Math.cos((la0 + la1) / 2 * Math.PI / 180), gw = (lo1 - lo0) * cl, gh = la1 - la0;
  const k = Math.min(W / gw, 560 / gh), vw = Math.round(gw * k), vh = Math.round(gh * k);
  const pos = p => [(p.lon - lo0) * cl * k, (la1 - p.lat) * k];
  const vis = ok.filter(p => p.lat >= la0 && p.lat <= la1 && p.lon >= lo0 && p.lon <= lo1).map(p => ({ ...p, xy: pos(p) }));
  el.classList.add('mapa-wrap', 'mapa-mun');
  el.innerHTML = `<svg class="mapa" viewBox="0 0 ${vw} ${vh}" role="img" aria-label="Mapa dos locais de votação"></svg>
    <div class="zoom sem-export"><button type="button" data-z="in" aria-label="Aproximar">+</button><button type="button" data-z="out" aria-label="Afastar">−</button><button type="button" data-z="0" aria-label="Ver tudo">⤢</button></div><div class="mapa-tip" hidden></div>`;
  const svg = el.querySelector('svg'), tip = el.querySelector('.mapa-tip');
  let z = 1, cx = vw / 2, cy = vh / 2, kpx = 1, dados = {}; // dados: id -> {fill}
  const view = () => { const w = vw / z, h = vh / z; cx = Math.max(w / 2, Math.min(vw - w / 2, cx)); cy = Math.max(h / 2, Math.min(vh - h / 2, cy)); svg.setAttribute('viewBox', `${(cx - w / 2).toFixed(1)} ${(cy - h / 2).toFixed(1)} ${w.toFixed(1)} ${h.toFixed(1)}`); };
  function desenhar() {
    kpx = (svg.clientWidth || vw) / vw;
    const ordem = vis.slice().sort((a, b) => b.ap - a.ap); // grandes por baixo, pequenos por cima
    svg.innerHTML = `<rect x="0" y="0" width="${vw}" height="${vh}" fill="#f3f1f8"/>` + ordem.map(p => {
      const r = (2.6 + Math.sqrt(p.ap / 400) * 1.7) / (kpx * Math.sqrt(z));
      return `<circle class="pt" data-p="${p.id}" cx="${p.xy[0].toFixed(1)}" cy="${p.xy[1].toFixed(1)}" r="${r.toFixed(2)}" fill="${dados[p.id]?.fill || '#c9c4d8'}" fill-opacity=".9" stroke="#fff" stroke-width="${(0.6 / (kpx * Math.sqrt(z))).toFixed(2)}"/>`;
    }).join('');
    view();
  }
  const alvo = ev => ev.target.closest('[data-p]')?.dataset.p;
  let arrasto = null, moveu = false;
  svg.addEventListener('pointerdown', ev => { arrasto = { x: ev.clientX, y: ev.clientY, cx, cy }; moveu = false; });
  svg.addEventListener('pointermove', ev => {
    if (arrasto && ev.buttons) { const r = svg.getBoundingClientRect(), e2 = (vw / z) / r.width, dx = ev.clientX - arrasto.x, dy = ev.clientY - arrasto.y; if (Math.abs(dx) + Math.abs(dy) > 4) moveu = true; if (moveu && z > 1) { cx = arrasto.cx - dx * e2; cy = arrasto.cy - dy * e2; view(); } tip.hidden = true; return; }
    const m = alvo(ev); if (!m || !tooltip) { tip.hidden = true; return; }
    tip.innerHTML = tooltip(m); tip.hidden = false; const r = el.getBoundingClientRect(); const x = ev.clientX - r.left + 14, y = ev.clientY - r.top + 14;
    tip.style.left = Math.max(0, Math.min(x, r.width - tip.offsetWidth - 4)) + 'px'; tip.style.top = Math.max(0, Math.min(y, r.height - tip.offsetHeight - 4)) + 'px';
  });
  svg.addEventListener('pointerup', ev => { if (!moveu) { const m = alvo(ev); if (m && onClick) onClick(m); } arrasto = null; });
  svg.addEventListener('pointerleave', () => { tip.hidden = true; arrasto = null; });
  const zoom = (f, px, py) => {
    const nz = Math.max(1, Math.min(30, z * f)); if (nz === z) return;
    if (px != null) { const r = svg.getBoundingClientRect(), w = vw / z, h = vh / z, ax = cx - w / 2 + (px - r.left) / r.width * w, ay = cy - h / 2 + (py - r.top) / r.height * h, w2 = vw / nz, h2 = vh / nz; cx = ax - (px - r.left) / r.width * w2 + w2 / 2; cy = ay - (py - r.top) / r.height * h2 + h2 / 2; }
    z = nz; if (z === 1) { cx = vw / 2; cy = vh / 2; } desenhar();
  };
  svg.addEventListener('wheel', ev => { ev.preventDefault(); zoom(ev.deltaY < 0 ? 1.3 : 1 / 1.3, ev.clientX, ev.clientY); }, { passive: false });
  el.querySelector('.zoom').addEventListener('click', ev => { const b = ev.target.closest('button'); if (!b) return; const t = b.dataset.z; if (t === 'in') zoom(1.6); else if (t === 'out') zoom(1 / 1.6); else { z = 1; cx = vw / 2; cy = vh / 2; desenhar(); } });
  desenhar();
  return { atualizar(d) { dados = d; desenhar(); }, fora: ok.length - vis.length, sem: pontos.length - ok.length };
}
export const corPonto = (k, p) => corDoPct(k, p);
