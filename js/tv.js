// Modo telão: apresentação em slides (placar, marcha, mapa, indicadores…) em tela cheia, 16:9, com troca lateral animada.
// Os slides são cópias das seções mais relevantes da tela aberta e se refazem sozinhos a cada nova divulgação do TSE.
import { evento } from './metricas.js?v=640a7cc0';

const PALCO = { w: 1280, h: 720 }, INTERVALO = 14000, PAUSA = 45000;
let T = null;   // estado do telão quando aberto
export const emTV = () => !!T;
export function urlTV() { const u = new URL(location.href); u.searchParams.set('tv', '1'); return u.href; }

// ---- escolhe e copia as seções da tela atual ----
const util = e => e.offsetHeight > 30 || e.matches('details');
function coletar() {
  const raiz = document.getElementById('vista'); if (!raiz) return [];
  const slides = []; let grupo = null;
  const add = (cls, ...els) => slides.push({ cls, els });
  for (const e of raiz.children) {
    if (!util(e)) continue;
    if (e.matches('.resumo, .fichas')) { if (!grupo) { grupo = { cls: 'fichas', els: [] }; slides.push(grupo); } grupo.els.push(e); continue; }
    if (e.matches('.placar')) add('placar', e);
    else if (e.querySelector(':scope > #g-placar, :scope > .grafico-wrap #g-placar, #g-placar')) add('marcha', e);
    else if (e.matches('.mapa-sec')) add('mapa', e);
    else if (e.matches('.disp-sec')) add('disp', e);
    else if (e.matches('.kpis')) add('kpis', e);
    else if (e.matches('details.falta, details.viradas')) add('texto', e);
    else if (e.matches('.painel') && e.querySelector('.pend')) add('texto', e);
    else if (e.matches('aside.balao')) add('balao', e);
  }
  return slides;
}
function copia(e) {
  const c = e.cloneNode(true);
  c.querySelectorAll('.sem-export, .entenda, .comp-toggle, .mapa-modo, .zoom, .nota-base, .tab-scroll, table, .cand-dica, script').forEach(x => x.remove());
  c.querySelectorAll('a').forEach(a => a.removeAttribute('href'));
  c.querySelectorAll('[id]').forEach(x => x.removeAttribute('id'));
  if (c.matches('details')) c.open = true; c.querySelectorAll('details').forEach(d => { d.open = true; });
  return c;
}

// ---- montagem do palco ----
function montar() {
  const raiz = document.createElement('div'); raiz.id = 'telao'; raiz.setAttribute('role', 'dialog'); raiz.setAttribute('aria-label', 'Modo telão');
  raiz.innerHTML = `<div class="tl-palco"><div class="tl-topo"><img src="img/logo-negativo.svg" alt="Oficina Política" height="34"><span class="tl-prod"></span><span class="tl-status"></span></div><div class="tl-slides"></div><div class="tl-pontos"></div><div class="tl-barra"><i></i></div></div><button class="tl-x" aria-label="Sair do modo telão" title="Sair (Esc)">✕</button><button class="tl-nav tl-ant" aria-label="Slide anterior">‹</button><button class="tl-nav tl-prox" aria-label="Próximo slide">›</button>`;
  document.body.appendChild(raiz); return raiz;
}
function escala() { const k = Math.min(innerWidth / PALCO.w, innerHeight / PALCO.h), p = T.raiz.querySelector('.tl-palco'); p.style.transform = `translate(-50%,-50%) scale(${k})`; }
function posicoes() {
  const n = T.els.length;
  T.els.forEach((el, i) => { const d = (i - T.i + n) % n; el.className = 'tl-slide ' + T.cls[i] + (n === 1 || d === 0 ? ' atual' : d === 1 ? ' depois' : d === n - 1 ? ' antes' : ' longe'); });
  T.pontos.querySelectorAll('i').forEach((p, i) => p.classList.toggle('on', i === T.i));
  const b = T.raiz.querySelector('.tl-barra i'); b.style.transition = 'none'; b.style.width = '0'; void b.offsetWidth;
  if (!T.pausaAte || Date.now() > T.pausaAte) { b.style.transition = `width ${INTERVALO}ms linear`; b.style.width = '100%'; }
}
function ajusta(el) {   // escolhe a maior escala (0,45–1,5) em que o conteúdo cabe na altura do slide; reflui a largura para compensar
  const c = el.querySelector('.tl-c'); if (!c) return; const max = el.classList.contains('mapa') ? 1.15 : 1.5, disp = el.clientHeight - 24;
  let k = max, ok = false; c.style.transform = '';
  if (/\b(mapa|disp)\b/.test(el.className)) { c.style.width = '100%'; k = Math.max(.3, Math.min(max, disp / c.scrollHeight)); c.style.transform = `scale(${k})`; return; }   // a altura desses blocos cresce com a largura: só reduz
  for (; k >= 0.45; k = Math.round((k - .05) * 100) / 100) { c.style.width = `${100 / k}%`; if (c.scrollHeight * k <= disp) { ok = true; break; } }
  if (!ok) k = .45; c.style.width = `${100 / k}%`; c.style.transform = `scale(${k})`;
}
function construir(manterIndice) {
  const defs = coletar(), tela = document.querySelector('.tela-topo h1')?.textContent || '';
  T.raiz.querySelector('.tl-prod').textContent = tela ? tela : 'Apuração · 2º turno 2026';
  const cont = T.raiz.querySelector('.tl-slides'); cont.innerHTML = '';
  if (!defs.length) { cont.innerHTML = '<div class="tl-slide atual vazio"><div class="tl-c"><p>Aguardando dados…</p></div></div>'; T.els = [cont.firstChild]; T.cls = ['vazio']; T.i = 0; T.pontos.innerHTML = ''; return; }
  T.cls = defs.map(d => d.cls); T.els = defs.map(d => { const s = document.createElement('div'), c = document.createElement('div'); c.className = 'tl-c'; d.els.forEach(e => c.appendChild(copia(e))); s.appendChild(c); cont.appendChild(s); return s; });
  T.pontos.innerHTML = defs.map(() => '<i></i>').join('');
  T.i = manterIndice ? Math.min(T.i, defs.length - 1) : 0;
  T.els.forEach(s => s.classList.add('sem-anim')); posicoes(); T.els.forEach(ajusta); requestAnimationFrame(() => T.els.forEach(s => s.classList.remove('sem-anim')));
}
function status() { const s = document.getElementById('status'); T.raiz.querySelector('.tl-status').textContent = s ? s.textContent.replace(/\s+/g, ' ').trim() : ''; }
function ir(delta, manual) {
  const n = T.els.length; if (n < 2) return;
  T.i = (T.i + delta + n) % n; if (manual) T.pausaAte = Date.now() + PAUSA; posicoes();
}
function ciclo() { if (!T) return; if (!T.pausaAte || Date.now() > T.pausaAte) { ir(1); } else { T.pausaAte = Date.now() < T.pausaAte ? T.pausaAte : 0; } T.timer = setTimeout(ciclo, INTERVALO); }

export function abrirTelao({ tela = true } = {}) {
  if (T) return;
  const raiz = montar(); T = { raiz, els: [], cls: [], i: 0, pausaAte: 0, pontos: raiz.querySelector('.tl-pontos'), obs: null, rebuild: 0, ocultaX: 0 };
  construir(false); status(); escala(); evento('tv', { acao: 'telao' });
  T.timer = setTimeout(ciclo, INTERVALO);
  T.onResize = () => { escala(); T.els.forEach(ajusta); }; addEventListener('resize', T.onResize);
  T.onKey = e => { if (e.key === 'Escape') fecharTelao(); else if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'PageDown') { e.preventDefault(); ir(1, true); } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') { e.preventDefault(); ir(-1, true); } };
  addEventListener('keydown', T.onKey);
  raiz.querySelector('.tl-x').addEventListener('click', fecharTelao);
  raiz.querySelector('.tl-ant').addEventListener('click', () => ir(-1, true)); raiz.querySelector('.tl-prox').addEventListener('click', () => ir(1, true));
  let x0 = null; raiz.addEventListener('touchstart', e => { x0 = e.touches[0].clientX; }, { passive: true });
  raiz.addEventListener('touchend', e => { if (x0 == null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 50) ir(dx < 0 ? 1 : -1, true); }, { passive: true });
  const mostra = () => { raiz.classList.add('ativo'); clearTimeout(T.ocultaX); T.ocultaX = setTimeout(() => raiz.classList.remove('ativo'), 3000); };
  raiz.addEventListener('mousemove', mostra); raiz.addEventListener('touchstart', mostra, { passive: true }); mostra();
  // refaz os slides quando o painel atualiza (nova parcial) ou muda de tela
  const cont = document.getElementById('conteudo'), rota = location.hash;
  T.rota = rota; T.obs = new MutationObserver(() => { clearTimeout(T.rebuild); T.rebuild = setTimeout(() => { if (!T) return; const mesma = location.hash === T.rota; T.rota = location.hash; construir(mesma); status(); }, 500); });
  if (cont) T.obs.observe(cont, { childList: true });
  T.st = setInterval(status, 5000);
  if (tela && document.fullscreenEnabled && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
  T.onFs = () => { if (!document.fullscreenElement && T && T.fsTinha) fecharTelao(); T && (T.fsTinha = !!document.fullscreenElement); };
  document.addEventListener('fullscreenchange', T.onFs);
  try { navigator.wakeLock?.request('screen').then(l => { if (T) T.wl = l; else l.release(); }).catch(() => {}); } catch { /* sem wake lock */ }
  document.body.classList.add('tl-aberto');
}
export function fecharTelao() {
  if (!T) return; const t = T; T = null;
  clearTimeout(t.timer); clearTimeout(t.rebuild); clearTimeout(t.ocultaX); clearInterval(t.st); t.obs?.disconnect();
  removeEventListener('resize', t.onResize); removeEventListener('keydown', t.onKey); document.removeEventListener('fullscreenchange', t.onFs);
  try { t.wl?.release(); } catch { /* ok */ }
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  t.raiz.remove(); document.body.classList.remove('tl-aberto');
  const u = new URL(location.href); if (u.searchParams.has('tv')) { u.searchParams.delete('tv'); history.replaceState(null, '', u.href); }
}
// abre sozinho com ?tv=1 (por exemplo, o link aberto no navegador de uma Smart TV)
export function iniciarTV() {
  if (!new URLSearchParams(location.search).has('tv')) return;
  let n = 0; const tenta = () => { if (document.querySelector('#vista section, #vista details')) abrirTelao({ tela: false }); else if (n++ < 60) setTimeout(tenta, 500); }; tenta();
}
