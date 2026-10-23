// Consentimento de cookies (LGPD) e anúncios: Meta Pixel e Google Ads só são carregados depois do "aceitar" do visitante.
// Sem pixel/ID configurado em CONFIG.anuncios e sem formulário de leads, este módulo não faz nada (nenhum banner aparece).
// A medição de uso do painel (js/metricas.js) é anônima e sem cookies, e não depende deste consentimento.
import { CONFIG } from './config.js?v=640a7cc0';

const KEY = 'op_consent', VERSAO = 1;
const A = CONFIG.anuncios || {}, meta = A.meta?.pixel || '', goog = A.google?.id || '';
const q = new URLSearchParams(location.search);
const gpc = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
const semAnuncios = () => q.has('demo') || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !q.has('testeanuncios'));   // nunca dispara pixel em demo ou ambiente local
export const anunciosConfigurados = () => !!(meta || goog);
export const moduloAtivo = () => anunciosConfigurados() || !!CONFIG.leads?.endpoint;

export function lerConsent() { try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && c.v === VERSAO ? c : null; } catch { return null; } }
const gravar = c => { try { localStorage.setItem(KEY, JSON.stringify({ v: VERSAO, ts: new Date().toISOString(), marketing: !!c.marketing })); } catch { /* sem armazenamento */ } };
export const marketingOk = () => !gpc() && !!lerConsent()?.marketing && anunciosConfigurados() && !semAnuncios();

// ---- carregamento dos pixels (somente com consentimento) ----
let carregado = false;
function gtag() { (window.dataLayer = window.dataLayer || []).push(arguments); }
function carregaMarketing() {
  if (carregado) { try { window.fbq?.('consent', 'grant'); gtag('consent', 'update', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted' }); } catch { /* ok */ } return; }
  carregado = true;
  if (meta) {
    /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', meta); window.fbq('track', 'PageView');
  }
  if (goog) {
    window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', { ad_storage: 'granted', ad_user_data: 'granted', ad_personalization: 'granted', analytics_storage: 'denied' });
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(goog)}`; document.head.appendChild(s);
    gtag('js', new Date()); gtag('config', goog, { send_page_view: true, allow_ad_personalization_signals: true });
    const g2 = A.google?.conversaoLead?.split('/')[0]; if (g2 && g2 !== goog) gtag('config', g2);
  }
}
function revoga() {
  try { window.fbq?.('consent', 'revoke'); gtag('consent', 'update', { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied' }); } catch { /* ok */ }
}
const aplicar = () => { if (marketingOk()) carregaMarketing(); else if (carregado) revoga(); };

// ---- eventos para os anúncios (sem dados pessoais) ----
export function rastrearTela(url, titulo) {
  if (!marketingOk() || !carregado) return;
  try { window.fbq?.('track', 'PageView'); gtag('event', 'page_view', { page_path: url, page_title: titulo }); } catch { /* ok */ }
}
export function conversaoLead() {   // chamada quando o formulário de leads é enviado com sucesso
  if (!marketingOk() || !carregado) return;
  try {
    window.fbq?.('track', 'Lead'); gtag('event', 'generate_lead', { event_category: 'leads' });
    const l = A.google?.conversaoLead; if (l) gtag('event', 'conversion', { send_to: l });
  } catch { /* ok */ }
}

// ---- interface: faixa de consentimento e painel de preferências ----
function ui(aberto) {
  document.querySelector('.ck-ov')?.remove();
  const atual = lerConsent(), ov = document.createElement('div'); ov.className = 'ck-ov';
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Preferências de cookies');
  ov.innerHTML = `<div class="ck-box">
    <p class="ck-t"><b>Privacidade e cookies.</b> O painel mede o uso de forma anônima, sem cookies. Com a sua permissão, também usamos cookies de <b>publicidade</b> (Meta e Google) para medir e melhorar nossos anúncios. <a href="privacidade.html">Política de privacidade</a></p>
    <div class="ck-det" ${aberto ? '' : 'hidden'}>
      <label class="ck-l"><input type="checkbox" checked disabled> <span><b>Necessários</b> — funcionamento do painel e guarda desta escolha. Sempre ativos.</span></label>
      <label class="ck-l"><input type="checkbox" data-ck="marketing" ${atual?.marketing ? 'checked' : ''}> <span><b>Publicidade e remarketing</b> — Meta Pixel e Google Ads: medem conversões e permitem mostrar anúncios a quem já visitou o painel. Desativados até você aceitar.</span></label>
    </div>
    <div class="ck-bt"><button class="ck-b" data-ck-a="rejeitar">Rejeitar</button><button class="ck-b" data-ck-a="${aberto ? 'salvar' : 'personalizar'}">${aberto ? 'Salvar preferências' : 'Personalizar'}</button><button class="ck-b ck-p" data-ck-a="aceitar">Aceitar tudo</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => {
    const a = e.target.closest('[data-ck-a]')?.dataset.ckA; if (!a) return;
    if (a === 'personalizar') return ui(true);
    const m = a === 'aceitar' ? true : a === 'salvar' ? !!ov.querySelector('[data-ck=marketing]').checked : false;
    gravar({ marketing: m }); ov.remove(); aplicar();
  });
}
export const abrirPreferencias = () => ui(true);

export function iniciarConsentimento() {
  if (!moduloAtivo() || semAnuncios()) return;
  // link permanente no rodapé
  const alvo = document.querySelector('.rodape-in'); if (alvo && !alvo.querySelector('.ck-link') && anunciosConfigurados()) { const b = document.createElement('button'); b.className = 'ck-link'; b.type = 'button'; b.textContent = 'Preferências de cookies'; b.addEventListener('click', abrirPreferencias); alvo.appendChild(b); }
  if (!anunciosConfigurados()) return;
  if (gpc()) return;                          // sinal de privacidade do navegador: nada de publicidade, sem insistir
  if (lerConsent()) aplicar(); else ui(false);
}
