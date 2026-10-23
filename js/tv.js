// Modo TV: tela cheia, fonte grande, sem controles, com rolagem automática entre os painéis.
// Transmissão: Presentation API (Chrome → Chromecast / TVs com Google Cast); alternativas: espelhar a aba ou abrir o link do modo TV na TV.
import { evento } from './metricas.js?v=07b82c22';
import { esc } from './ui.js?v=07b82c22';

let timer = null, pausaAte = 0, idx = 0, resizeFn = null;
export const emTV = () => document.body.classList.contains('tv');
export function urlTV() { const u = new URL(location.href); u.searchParams.set('tv', '1'); return u.href; }

function ajustaZoom() { const z = Math.max(1, Math.min(2.4, innerWidth / 1280)); document.documentElement.style.zoom = z > 1.05 ? String(z) : ''; }
function paineis() { return [...document.querySelectorAll('#vista > section, #vista > .aviso, #vista > .placar')].filter(e => e.offsetHeight > 40); }

export function modoTV(on, { tela = true } = {}) {
  if (on === emTV()) return;
  document.body.classList.toggle('tv', on);
  if (on) {
    ajustaZoom(); resizeFn = ajustaZoom; addEventListener('resize', resizeFn);
    if (tela && document.fullscreenEnabled && !document.fullscreenElement) document.documentElement.requestFullscreen?.().catch(() => {});
    const pausa = () => { pausaAte = Date.now() + 45000; };
    ['pointerdown', 'wheel', 'keydown', 'touchstart'].forEach(ev => addEventListener(ev, pausa, { passive: true }));
    dica('Modo TV — pressione Esc para sair');
    idx = 0; scrollTo(0, 0);
    timer = setInterval(() => {
      if (Date.now() < pausaAte) return;
      const ps = paineis(); if (!ps.length) return;
      idx = (idx + 1) % (ps.length + 1);
      if (idx === 0) scrollTo({ top: 0, behavior: 'smooth' });
      else ps[idx - 1].scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 16000);
  } else {
    document.documentElement.style.zoom = ''; clearInterval(timer); timer = null;
    if (resizeFn) removeEventListener('resize', resizeFn);
    if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  }
}
function dica(t) { const d = document.createElement('div'); d.className = 'tv-dica'; d.textContent = t; document.body.appendChild(d); setTimeout(() => d.classList.add('sai'), 4000); setTimeout(() => d.remove(), 5000); }
document.addEventListener('fullscreenchange', () => { if (!document.fullscreenElement && emTV() && !new URLSearchParams(location.search).has('tv')) modoTV(false); });
addEventListener('keydown', e => { if (e.key === 'Escape' && emTV() && !document.fullscreenElement && !new URLSearchParams(location.search).has('tv')) modoTV(false); });

export function iniciarTV() { if (new URLSearchParams(location.search).has('tv')) modoTV(true, { tela: false }); }

// diálogo "Transmitir para a TV"
export function abrirTV() {
  if (document.querySelector('.share-ov')) return;
  const link = urlTV(), pode = typeof PresentationRequest !== 'undefined';
  const ov = document.createElement('div'); ov.className = 'share-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Transmitir para a TV');
  ov.innerHTML = `<div class="share-box"><div class="share-topo"><h2>Transmitir para a TV</h2><button class="share-x" data-t="fechar" aria-label="Fechar">✕</button></div>
  <p class="share-t">O modo TV mostra o painel em tela cheia, com letras grandes, sem botões, e passa sozinho pelos blocos (placar, mapa, viradas…), atualizando a cada divulgação do TSE.</p>
  <div class="share-acoes tv-acoes">
    <button class="sb sb-nat" data-t="cast" ${pode ? '' : 'disabled'}>📺 Transmitir para Chromecast / TV com Google Cast</button>
    <button class="sb" data-t="tela">⛶ Modo TV nesta tela</button>
    <button class="sb" data-t="link"><i style="background:#6f6888"></i>Copiar link do modo TV</button>
  </div>
  <p class="share-msg" data-msg aria-live="polite">${pode ? '' : 'Este navegador não oferece transmissão direta. Use uma das alternativas abaixo.'}</p>
  <div class="share-nota"><b>Alternativas:</b><ul class="tv-alt"><li><b>Chrome no computador:</b> menu ⋮ → Salvar, compartilhar e transmitir → <i>Transmitir…</i> → escolha a TV e, em “Fontes”, a aba. Antes, ative o <i>Modo TV nesta tela</i>.</li><li><b>Smart TV ou TV box:</b> abra o navegador da TV e digite o link copiado (ele já abre no modo TV). Em celulares, a opção “Espelhar tela/Smart View” também funciona.</li><li><b>Apple TV / AirPlay:</b> no Safari, use o ícone de AirPlay (espelhamento da tela).</li></ul>
  <span class="tv-url">${esc(link)}</span></div></div>`;
  document.body.appendChild(ov); document.body.classList.add('share-aberto');
  const msg = t => { ov.querySelector('[data-msg]').textContent = t; };
  const fechar = () => { ov.remove(); document.body.classList.remove('share-aberto'); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if (e.key === 'Escape') fechar(); };
  document.addEventListener('keydown', tecla);
  ov.addEventListener('click', async e => {
    if (e.target === ov) return fechar();
    const b = e.target.closest('[data-t]'); if (!b) return; const a = b.dataset.t;
    if (a !== 'fechar') evento('tv', { acao: a });
    if (a === 'fechar') fechar();
    else if (a === 'tela') { fechar(); modoTV(true); }
    else if (a === 'link') { try { await navigator.clipboard.writeText(link); msg('Link do modo TV copiado.'); } catch { msg('Copie o link abaixo manualmente.'); } }
    else if (a === 'cast') {
      try { const req = new PresentationRequest([link]); await req.start(); msg('Transmitindo. Para encerrar, use o ícone de transmissão do Chrome.'); }
      catch (err) { msg(err?.name === 'NotFoundError' ? 'Nenhuma TV/Chromecast encontrado na sua rede Wi-Fi.' : err?.name === 'AbortError' ? 'Transmissão cancelada.' : 'Não foi possível iniciar a transmissão: ' + (err?.message || err?.name) + '. Use as alternativas abaixo.'); }
    }
  });
  ov.querySelector('.share-x').focus();
}
