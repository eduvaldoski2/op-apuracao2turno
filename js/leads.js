// Captação de contatos (leads) com consentimento específico. Os dados vão para o endpoint configurado (api/lead.php na hospedagem).
import { CONFIG } from './config.js?v=5cb12aaf';
import { esc } from './ui.js?v=5cb12aaf';
import { evento } from './metricas.js?v=5cb12aaf';
import { conversaoLead, marketingOk } from './consentimento.js?v=5cb12aaf';

const L = CONFIG.leads || {};
export const leadsAtivos = () => !!L.endpoint;
// guarda a origem (UTM, referência) da primeira visita da sessão, para saber de onde veio cada contato
const SS = 'op_origem';
export function guardaOrigem() {
  try {
    if (sessionStorage.getItem(SS)) return; const q = new URLSearchParams(location.search), o = {};
    ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => q.get(k) && (o[k] = q.get(k).slice(0, 80)));
    if (document.referrer && !document.referrer.startsWith(location.origin)) o.ref = new URL(document.referrer).hostname;
    if (marketingOk()) { ['fbclid', 'gclid'].forEach(k => q.get(k) && (o[k] = q.get(k).slice(0, 200))); }
    sessionStorage.setItem(SS, JSON.stringify(o));
  } catch { /* ok */ }
}
const origem = () => { try { return JSON.parse(sessionStorage.getItem(SS) || '{}'); } catch { return {}; } };
const TEXTO_VERSAO = 'v1';

export function abrirLeads() {
  if (!leadsAtivos() || document.querySelector('.share-ov')) return;
  evento('lead_abrir');
  const ov = document.createElement('div'); ov.className = 'share-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', L.titulo || 'Receber novidades');
  ov.innerHTML = `<div class="share-box"><div class="share-topo"><h2>${esc(L.titulo || 'Receber novidades')}</h2><button class="share-x" data-l="fechar" aria-label="Fechar">✕</button></div>
  <p class="share-t">${esc(L.texto || '')}</p>
  <form class="lead-form" novalidate>
    <label>Nome<input name="nome" autocomplete="name" required maxlength="120"></label>
    <label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="160"></label>
    <label>WhatsApp <small>(opcional, com DDD)</small><input name="telefone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20"></label>
    <div class="lead-2"><label>Cidade/UF <small>(opcional)</small><input name="cidade" autocomplete="address-level2" maxlength="80"></label>
    <label>Você é<select name="perfil"><option value="">Selecione</option><option>Campanha / candidato(a)</option><option>Partido / federação</option><option>Imprensa</option><option>Pesquisa / academia</option><option>Cidadão(ã)</option><option>Outro</option></select></label></div>
    <input name="site" tabindex="-1" autocomplete="off" class="lead-hp" aria-hidden="true">
    <label class="lead-ck"><input type="checkbox" name="c_contato" required> <span>Autorizo a Oficina Política a me enviar a análise, novidades e ofertas de suas ferramentas por e-mail e WhatsApp. Posso cancelar quando quiser.</span></label>
    ${(CONFIG.anuncios?.meta?.pixel || CONFIG.anuncios?.google?.id) ? `<label class="lead-ck"><input type="checkbox" name="c_anuncios"> <span>Autorizo o uso do meu e-mail/telefone (em formato criptografado) para me mostrar anúncios da Oficina Política no Facebook, Instagram e Google. <i>(opcional)</i></span></label>` : ''}
    <p class="lead-nota">Seus dados ficam com a Oficina Política e não são vendidos. Veja a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>, inclusive como pedir a exclusão.</p>
    <p class="share-msg" data-msg aria-live="polite"></p>
    <button class="sb sb-nat lead-env" type="submit">Quero receber</button></form></div>`;
  document.body.appendChild(ov); document.body.classList.add('share-aberto');
  const fechar = () => { ov.remove(); document.body.classList.remove('share-aberto'); document.removeEventListener('keydown', tecla); };
  const tecla = e => { if (e.key === 'Escape') fechar(); }; document.addEventListener('keydown', tecla);
  const msg = t => { ov.querySelector('[data-msg]').textContent = t; };
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-l=fechar]')) fechar(); });
  ov.querySelector('form').addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target, d = Object.fromEntries(new FormData(f));
    if (d.site) return;                                   // isca anti-robô
    if (!d.nome?.trim() || !/^\S+@\S+\.\S+$/.test(d.email || '')) return msg('Informe seu nome e um e-mail válido.');
    if (!f.c_contato.checked) return msg('Para receber, marque a autorização de contato.');
    const bt = f.querySelector('.lead-env'); bt.disabled = true; msg('Enviando…');
    const corpo = { nome: d.nome.trim(), email: d.email.trim().toLowerCase(), telefone: (d.telefone || '').trim(), cidade: (d.cidade || '').trim(), perfil: d.perfil || '', consentimento_contato: true, consentimento_anuncios: !!f.c_anuncios?.checked, texto_versao: TEXTO_VERSAO, pagina: location.hash || '#/', origem: origem() };
    try {
      const r = await fetch(L.endpoint, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(corpo) });
      const j = await r.json().catch(() => ({})); if (!r.ok || !j.ok) throw new Error(j.erro || 'falha');
      evento('lead_enviado', { anuncios: corpo.consentimento_anuncios ? 'sim' : 'nao' }); conversaoLead();
      ov.querySelector('.share-box').innerHTML = `<div class="share-topo"><h2>Recebido!</h2><button class="share-x" data-l="fechar" aria-label="Fechar">✕</button></div><p class="share-t">Obrigado, ${esc(corpo.nome.split(' ')[0])}. Entraremos em contato em breve.</p>`;
    } catch (err) { bt.disabled = false; msg('Não foi possível enviar agora. Tente de novo em instantes.'); }
  });
  ov.querySelector('[name=nome]').focus();
}
