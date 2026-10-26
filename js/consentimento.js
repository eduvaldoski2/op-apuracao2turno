// Consentimento de cookies (LGPD): Google Analytics 4, Meta Pixel e Google Ads só são carregados depois do "aceitar" do visitante.
// Sem GA4/pixel/ID configurado em CONFIG (analytics.ga4, anuncios) e sem formulário de leads, este módulo não faz nada (nenhum banner aparece).
// A medição de uso do painel (js/metricas.js) é anônima e sem cookies, e não depende deste consentimento.
import { CONFIG } from './config.js?v=2b279aa5';

const KEY = 'op_consent', VERSAO = 1;
const RAIZ_PAG = /\/apuracao-2t-2026\//.test(location.pathname) ? '/' : '';   // a política fica na raiz do site
const A = CONFIG.anuncios || {}, meta = A.meta?.pixel || '', goog = A.google?.id || '', GA = CONFIG.analytics?.ga4 || '';
const q = new URLSearchParams(location.search);
const gpc = () => navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
const semAnuncios = () => q.has('demo') || (/^(localhost|127\.0\.0\.1)$/.test(location.hostname) && !q.has('testeanuncios'));   // nunca dispara pixel em demo ou ambiente local
export const analiseConfigurada = () => !!GA;
export const anunciosConfigurados = () => !!(meta || goog);
export const cookiesConfigurados = () => anunciosConfigurados() || analiseConfigurada();
export const moduloAtivo = () => cookiesConfigurados() || !!CONFIG.leads?.endpoint;

export function lerConsent() { try { const c = JSON.parse(localStorage.getItem(KEY) || 'null'); return c && c.v === VERSAO ? c : null; } catch { return null; } }
const gravar = c => { try { localStorage.setItem(KEY, JSON.stringify({ v: VERSAO, ts: new Date().toISOString(), marketing: !!c.marketing && anunciosConfigurados(), analise: !!c.analise && analiseConfigurada() })); } catch { /* sem armazenamento */ } };
export const marketingOk = () => !gpc() && !!lerConsent()?.marketing && anunciosConfigurados() && !semAnuncios();
export const analiseOk = () => !gpc() && !!lerConsent()?.analise && analiseConfigurada() && !semAnuncios();

// ---- carregamento dos pixels (somente com consentimento) ----
let carregado = false, gtagCarregado = false, urlAtual = location.pathname + location.search + location.hash, tituloAtual = document.title;
function gtag() { (window.dataLayer = window.dataLayer || []).push(arguments); }
const NEG = { ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied', analytics_storage: 'denied' };

// Meta Pixel: só com consentimento de publicidade
function carregaMeta() {
  if (!meta) return;
  if (carregado) { try { window.fbq?.('consent', 'grant'); } catch { /* ok */ } return; }
  carregado = true;
  /* eslint-disable */
    !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s); }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
  /* eslint-enable */
  window.fbq('init', meta); window.fbq('track', 'PageView');
}

// Google (GA4 e/ou Google Ads): um único gtag, iniciado SEMPRE com tudo negado; cada categoria é liberada conforme o consentimento
function pageview() { try { gtag('event', 'page_view', { page_path: urlAtual, page_title: tituloAtual }); } catch { /* ok */ } }
function aplicarGoogle() {
  if (!GA && !goog) return;
  const an = analiseOk(), mk = marketingOk() && !!goog;
  if (!an && !mk) { if (gtagCarregado) gtag('consent', 'update', NEG); return; }
  const primeiro = !gtagCarregado;
  if (primeiro) {
    gtagCarregado = true; window.dataLayer = window.dataLayer || [];
    gtag('consent', 'default', NEG);
    const s = document.createElement('script'); s.async = true; s.src = `https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA || goog)}`; document.head.appendChild(s);
    gtag('js', new Date());
    if (GA) gtag('config', GA, { send_page_view: false });
    if (goog) gtag('config', goog, { send_page_view: false, allow_ad_personalization_signals: true });
    const g2 = A.google?.conversaoLead?.split('/')[0]; if (g2 && g2 !== goog) gtag('config', g2, { send_page_view: false });
  }
  const g = v => v ? 'granted' : 'denied';
  gtag('consent', 'update', { analytics_storage: g(an), ad_storage: g(mk), ad_user_data: g(mk), ad_personalization: g(mk) });
  if (primeiro) pageview();
}
function revogaMeta() { try { window.fbq?.('consent', 'revoke'); } catch { /* ok */ } }
// apaga cookies do Google/Meta já gravados quando a pessoa não (ou deixou de) autorizar
function limpaCookies(prefixos) {
  const dom = location.hostname.split('.'), doms = ['', location.hostname, '.' + location.hostname, dom.length > 2 ? '.' + dom.slice(-3).join('.') : '', dom.length > 1 ? '.' + dom.slice(-2).join('.') : ''];
  document.cookie.split(';').map(c => c.split('=')[0].trim()).filter(n => prefixos.some(p => n === p || n.startsWith(p + '_') || n.startsWith(p))).forEach(n => doms.forEach(d => { document.cookie = `${n}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/` + (d ? `; domain=${d}` : ''); }));
}
const aplicar = () => {
  if (marketingOk()) carregaMeta(); else if (carregado) revogaMeta();
  aplicarGoogle();
  if (!analiseOk()) limpaCookies(['_ga']);
  if (!marketingOk()) limpaCookies(['_fbp', '_fbc', '_gcl']);
};

// ---- visualizações e eventos (sem dados pessoais) ----
export function rastrearTela(url, titulo) {
  urlAtual = url; tituloAtual = titulo || document.title;
  if (marketingOk() && carregado) { try { window.fbq?.('track', 'PageView'); } catch { /* ok */ } }
  if (gtagCarregado && (analiseOk() || (marketingOk() && goog))) pageview();
}
export function conversaoLead() {   // chamada quando o formulário de leads é enviado com sucesso
  try {
    if (marketingOk() && carregado) window.fbq?.('track', 'Lead');
    if (gtagCarregado && (analiseOk() || (marketingOk() && goog))) {
      gtag('event', 'generate_lead', { event_category: 'leads' });
      const l = marketingOk() ? A.google?.conversaoLead : ''; if (l) gtag('event', 'conversion', { send_to: l });
    }
  } catch { /* ok */ }
}

// ---- interface: faixa de consentimento e painel de preferências ----
function ui(aberto) {
  document.querySelector('.ck-ov')?.remove();
  const atual = lerConsent(), ov = document.createElement('div'); ov.className = 'ck-ov';
  ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-label', 'Preferências de cookies');
  ov.innerHTML = `<div class="ck-box">
    <p class="ck-t"><b>Privacidade e cookies.</b> ${GA ? 'Com a sua permissão, usamos cookies de <b>estatística</b> (Google Analytics) para saber quantas pessoas acessam e quais telas usam' : 'Usamos cookies só com a sua permissão'}${anunciosConfigurados() ? (GA ? ' e de <b>publicidade</b> (Meta e Google) para medir e melhorar nossos anúncios' : ': cookies de <b>publicidade</b> (Meta e Google) para medir e melhorar nossos anúncios') : ''}. Os cookies necessários são sempre ativos. <a href="${RAIZ_PAG}privacidade.html">Política de privacidade</a></p>
    <div class="ck-det" ${aberto ? '' : 'hidden'}>
      <label class="ck-l"><input type="checkbox" checked disabled> <span><b>Necessários</b> — funcionamento do painel e guarda desta escolha. Sempre ativos.</span></label>
      ${GA ? `<label class="ck-l"><input type="checkbox" data-ck="analise" ${atual?.analise ? 'checked' : ''}> <span><b>Estatística de uso</b> — Google Analytics: conta visitas, telas visitadas e origem do acesso, para melhorarmos o site. Desativado até você aceitar.</span></label>` : ''}
      ${anunciosConfigurados() ? `<label class="ck-l"><input type="checkbox" data-ck="marketing" ${atual?.marketing ? 'checked' : ''}> <span><b>Publicidade e remarketing</b> — Meta Pixel e Google Ads: medem conversões e permitem mostrar anúncios a quem já visitou o site. Desativados até você aceitar.</span></label>` : ''}
    </div>
    <div class="ck-bt"><button class="ck-b" data-ck-a="rejeitar">Rejeitar</button><button class="ck-b" data-ck-a="${aberto ? 'salvar' : 'personalizar'}">${aberto ? 'Salvar preferências' : 'Personalizar'}</button><button class="ck-b ck-p" data-ck-a="aceitar">Aceitar tudo</button></div></div>`;
  document.body.appendChild(ov);
  ov.addEventListener('click', e => {
    const a = e.target.closest('[data-ck-a]')?.dataset.ckA; if (!a) return;
    if (a === 'personalizar') return ui(true);
    const v = k => a === 'aceitar' ? true : a === 'salvar' ? !!ov.querySelector(`[data-ck=${k}]`)?.checked : false;
    gravar({ marketing: v('marketing'), analise: v('analise') }); ov.remove(); aplicar();
  });
}
export const abrirPreferencias = () => ui(true);

export function iniciarConsentimento() {
  if (!moduloAtivo() || semAnuncios()) return;
  // link permanente no rodapé
  const alvo = document.querySelector('.rodape-in, .rodape'); if (alvo && !alvo.querySelector('.ck-link') && cookiesConfigurados()) { const b = document.createElement('button'); b.className = 'ck-link'; b.type = 'button'; b.textContent = 'Preferências de cookies'; b.addEventListener('click', abrirPreferencias); alvo.appendChild(b); }
  if (!cookiesConfigurados()) return;
  if (gpc()) return;                          // sinal de privacidade do navegador: nada de publicidade, sem insistir
  if (lerConsent()) aplicar(); else ui(false);
}
