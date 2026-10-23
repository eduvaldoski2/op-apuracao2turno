// Modo TV: tela cheia, fonte grande, sem controles, com rolagem automática entre os painéis.
// Transmissão: Presentation API (Chrome → Chromecast / TVs com Google Cast); alternativas: espelhar a aba ou abrir o link do modo TV na TV.
import { evento } from './metricas.js?v=a5e0d9ed';
import { esc } from './ui.js?v=a5e0d9ed';
import { iniciarReceptor, parear, desparear, pareado } from './pareamento.js?v=a5e0d9ed';

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

export function iniciarTV() { if (new URLSearchParams(location.search).has('tv')) { modoTV(true, { tela: false }); iniciarReceptor(); } }

// diálogo "Transmitir para a TV"
export function abrirTV() {
  if (document.querySelector('.share-ov')) return;
  const link = urlTV(), pode = typeof PresentationRequest !== 'undefined', base = location.href.split(/[?#]/)[0].replace(/[^/]*$/, ''), curto = base.replace(/^https?:\/\//, '') + 'tv.html';
  const ov = document.createElement('div'); ov.className = 'share-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Transmitir para a TV');
  ov.innerHTML = `<div class="share-box"><div class="share-topo"><h2>Transmitir para a TV</h2><button class="share-x" data-t="fechar" aria-label="Fechar">✕</button></div>
  <p class="share-t">O modo TV mostra o painel em tela cheia, com letras grandes, sem botões, e passa sozinho pelos blocos (placar, mapa, viradas…), atualizando a cada divulgação do TSE.</p>
  <div class="tv-par-box"><h3>Qualquer Smart TV (recomendado)</h3>
    <ol><li>No navegador da TV, abra <b class="tv-curto">${esc(curto)}</b></li><li>A TV mostra um <b>código de 4 dígitos</b>. Digite-o aqui:</li></ol>
    <form class="tv-form" data-form><input inputmode="numeric" pattern="[0-9]{4}" maxlength="4" placeholder="0000" aria-label="Código da TV" data-cod autocomplete="off"><button class="sb sb-nat" type="submit">Conectar</button></form>
    <p class="share-msg" data-msg aria-live="polite"></p>
    <p class="tv-peq">Depois de conectada, a TV acompanha a tela que você abrir no painel (UF, município, bairros…).</p></div>
  <div class="share-acoes tv-acoes">
    <button class="sb" data-t="cast"><i style="background:#4285F4"></i>Chromecast pelo Chrome${pode ? '' : ' (indisponível neste navegador)'}</button>
    <button class="sb" data-t="tela">⛶ Modo TV nesta tela</button>
    <button class="sb" data-t="link"><i style="background:#6f6888"></i>Copiar link do modo TV</button>
  </div>
  <div class="share-nota"><b>Outras formas:</b><ul class="tv-alt"><li><b>Chromecast pelo celular Android:</b> ative o <i>Modo TV nesta tela</i> e use, nas configurações rápidas, <i>Transmitir tela / Smart View</i>.</li><li><b>Chrome no computador:</b> menu ⋮ → Salvar, compartilhar e transmitir → <i>Transmitir…</i> → escolha a TV e, em “Fontes”, a aba.</li><li><b>Smart TV sem pareamento:</b> digite na TV o link do modo TV (botão acima) — ele abre direto.</li><li><b>Apple TV / AirPlay:</b> no Safari, ícone de AirPlay.</li></ul></div></div>`;
  document.body.appendChild(ov); document.body.classList.add('share-aberto');
  const msg = t => { ov.querySelector('[data-msg]').textContent = t; };
  const fechar = () => { ov.remove(); document.body.classList.remove('share-aberto'); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if (e.key === 'Escape') fechar(); };
  document.addEventListener('keydown', tecla);
  const p0 = pareado(); if (p0) msg(p0.estado === 'conectado' ? `TV ${p0.codigo} conectada. Ela acompanha esta tela.` : 'Conectando à TV…');
  ov.querySelector('[data-form]').addEventListener('submit', e => {
    e.preventDefault(); const cod = ov.querySelector('[data-cod]').value.trim();
    if (!/^\d{4}$/.test(cod)) return msg('Digite os 4 números que aparecem na TV.');
    evento('tv', { acao: 'parear' }); msg('Conectando…');
    parear(cod, (est, extra) => { if (!ov.isConnected) return; msg(est === 'conectado' ? `Conectado! A TV ${cod} acompanha esta tela. Pode fechar esta janela.` : est === 'erro' ? extra : est === 'reconectando' ? (extra || 'Reconectando…') : 'Conectando…'); });
  });
  ov.addEventListener('click', async e => {
    if (e.target === ov) return fechar();
    const b = e.target.closest('[data-t]'); if (!b) return; const a = b.dataset.t;
    if (a !== 'fechar') evento('tv', { acao: a });
    if (a === 'fechar') fechar();
    else if (a === 'tela') { fechar(); modoTV(true); }
    else if (a === 'link') { try { await navigator.clipboard.writeText(link); msg('Link do modo TV copiado.'); } catch { msg('Copie o link do modo TV manualmente.'); } }
    else if (a === 'cast') {
      if (!pode) return msg('Este navegador não oferece transmissão direta; use o pareamento por código.');
      try { await new PresentationRequest([link]).start(); msg('Transmitindo. Para encerrar, use o ícone de transmissão do Chrome.'); }
      catch (err) { msg(err?.name === 'NotFoundError' ? 'O Chrome não encontrou Chromecast nesta rede. Use o pareamento por código acima.' : err?.name === 'AbortError' ? 'Transmissão cancelada.' : 'Não foi possível iniciar: ' + (err?.message || err?.name) + '. Use o pareamento por código acima.'); }
    }
  });
  ov.querySelector('[data-cod]').focus();
}
