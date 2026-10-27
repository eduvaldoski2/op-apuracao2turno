// Painel "Compartilhar": prévia do card, escolha de formato e atalhos (WhatsApp, Instagram, Facebook, X, Telegram, link, imagem).
import { FORMATOS } from './card.js?v=0512f95d';
import { blobCard, baixar } from './export.js?v=0512f95d';
import { evento } from './metricas.js?v=0512f95d';
import { esc } from './ui.js?v=0512f95d';

const enc = encodeURIComponent;
const ordemFormatos = ['1x1', '4x5', '9x16'];
let aberto = null;

// obter() devolve { dados, nome, principal, sub } da tela atual (dados = null quando a tela não tem card)
export function abrirCompartilhar(obter) {
  if (aberto) return;
  const info = obter(), urlBase = location.href.split('?v=')[0];
  // links compartilhados levam UTM para o provedor de métricas mostrar de onde vieram os acessos
  const url = canal => { const u = new URL(urlBase); u.searchParams.set('utm_source', canal); u.searchParams.set('utm_medium', 'compartilhar'); u.searchParams.set('utm_campaign', 'apuracao_2t_2026'); return u.href; };
  const { dados, nome, principal } = info;
  const a = dados?.cands?.[0], b = dados?.cands?.[1];
  const texto = `${principal}${a && b ? `: ${a.nome} ${a.pct} × ${b.nome} ${b.pct}` : ''} · Oficina Política`;
  evento('compartilhar_abrir');
  let fmt = '4x5', blob = null, urlPrev = null, tok = 0;
  const ov = document.createElement('div');
  ov.className = 'share-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Compartilhar esta tela');
  ov.innerHTML = `<div class="share-box">
    <div class="share-topo"><h2>Compartilhar</h2><button class="share-x" data-s="fechar" aria-label="Fechar">✕</button></div>
    <p class="share-t">${esc(texto)}</p>
    ${dados ? `<div class="share-fmt" role="group" aria-label="Formato da imagem">${ordemFormatos.map(id => `<button data-fmt="${id}" class="${id === fmt ? 'on' : ''}"><b>${FORMATOS[id].rot}</b><span>${FORMATOS[id].desc}</span></button>`).join('')}</div>
    <div class="share-prev" data-prev><span class="share-carga">Gerando a imagem…</span></div>` : ''}
    <div class="share-acoes">
      <button class="sb sb-nat" data-s="nativo" hidden>Compartilhar imagem…</button>
      <button class="sb" data-s="wa"><i style="background:#25D366"></i>WhatsApp</button>
      <button class="sb" data-s="ig"><i style="background:linear-gradient(45deg,#f9a03f,#dd2a7b,#8134af)"></i>Instagram</button>
      <button class="sb" data-s="fb"><i style="background:#1877F2"></i>Facebook</button>
      <button class="sb" data-s="x"><i style="background:#111"></i>X (Twitter)</button>
      <button class="sb" data-s="tg"><i style="background:#26A5E4"></i>Telegram</button>
      <button class="sb" data-s="link"><i style="background:#6f6888"></i>Copiar link</button>
      ${dados ? `<button class="sb" data-s="copiar"><i style="background:#3E347E"></i>Copiar imagem</button><button class="sb" data-s="baixar"><i style="background:#E8890C"></i>Baixar imagem</button>` : ''}
    </div>
    <p class="share-msg" data-msg aria-live="polite"></p>
    <p class="share-nota">WhatsApp, Facebook, X e Telegram compartilham o <b>link</b> do painel. Para postar a <b>imagem</b>, use “Compartilhar imagem…” (celular), “Copiar imagem” ou “Baixar imagem”. O Instagram não recebe posts direto de sites: no celular escolha-o na janela do aparelho; no computador, baixe a imagem e publique pelo app.</p>
  </div>`;
  document.body.appendChild(ov); document.body.classList.add('share-aberto');
  const q = s => ov.querySelector(s), msg = t => { q('[data-msg]').textContent = t; };
  const arquivo = () => blob ? new File([blob], `${nome}_${FORMATOS[fmt].rot.replace(':', 'x')}.png`, { type: 'image/png' }) : null;
  const podeNativo = () => { try { const f = arquivo(); return !!(f && navigator.canShare?.({ files: [f] }) && navigator.share); } catch { return false; } };
  const atualizaNativo = () => { const nb = q('[data-s=nativo]'); nb.hidden = !podeNativo(); };
  async function gerar() {
    const meu = ++tok; blob = null; atualizaNativo();
    const pv = q('[data-prev]'); if (!pv) return;
    pv.className = `share-prev f${fmt}`; pv.innerHTML = '<span class="share-carga">Gerando a imagem…</span>';
    try {
      const bl = await blobCard(dados, FORMATOS[fmt], 1); if (meu !== tok) return;
      blob = bl; if (urlPrev) URL.revokeObjectURL(urlPrev); urlPrev = URL.createObjectURL(bl);
      pv.innerHTML = `<img src="${urlPrev}" alt="Prévia do card ${FORMATOS[fmt].rot}">`; atualizaNativo();
    } catch (e) { if (meu === tok) pv.innerHTML = `<span class="share-carga">Não foi possível gerar a imagem (${esc(e.message)}).</span>`; }
  }
  const fechar = () => { tok++; if (urlPrev) URL.revokeObjectURL(urlPrev); ov.remove(); document.body.classList.remove('share-aberto'); document.removeEventListener('keydown', tecla); aberto = null; };
  const tecla = e => { if (e.key === 'Escape') fechar(); };
  document.addEventListener('keydown', tecla); aberto = { fechar };
  const abrirUrl = u => { window.open(u, '_blank', 'noopener,noreferrer'); };
  const nativo = async () => {
    if (!blob) { msg('A imagem ainda está sendo gerada — tente de novo em instantes.'); return false; }
    if (!podeNativo()) return false;
    try { await navigator.share({ files: [arquivo()], text: `${texto}\n${url('nativo')}`, title: principal }); return true; } catch (e) { if (e.name !== 'AbortError') msg('Não foi possível abrir o compartilhamento do aparelho.'); return true; }
  };
  ov.addEventListener('click', async e => {
    if (e.target === ov) return fechar();
    const f = e.target.closest('[data-fmt]'); if (f) { fmt = f.dataset.fmt; evento('compartilhar_formato', { formato: fmt }); ov.querySelectorAll('[data-fmt]').forEach(x => x.classList.toggle('on', x === f)); msg(''); return gerar(); }
    const bt = e.target.closest('[data-s]'); if (!bt) return;
    const a = bt.dataset.s;
    if (a !== 'fechar') evento('compartilhar', { canal: { wa: 'whatsapp', ig: 'instagram', fb: 'facebook', x: 'x', tg: 'telegram', link: 'copiar_link', copiar: 'copiar_imagem', baixar: 'baixar_imagem', nativo: 'nativo' }[a] || a, formato: fmt });
    if (a === 'fechar') fechar();
    else if (a === 'nativo') await nativo();
    else if (a === 'wa') abrirUrl(`https://wa.me/?text=${enc(texto + '\n' + url('whatsapp'))}`);
    else if (a === 'fb') abrirUrl(`https://www.facebook.com/sharer/sharer.php?u=${enc(url('facebook'))}&quote=${enc(texto)}`);
    else if (a === 'x') abrirUrl(`https://twitter.com/intent/tweet?text=${enc(texto)}&url=${enc(url('x'))}`);
    else if (a === 'tg') abrirUrl(`https://t.me/share/url?url=${enc(url('telegram'))}&text=${enc(texto)}`);
    else if (a === 'link') { try { await navigator.clipboard.writeText(url('link')); msg('Link copiado.'); } catch { msg('Copie o endereço na barra do navegador.'); } }
    else if (a === 'baixar') { if (!blob) return msg('A imagem ainda está sendo gerada.'); baixar(blob, arquivo().name); msg('Imagem baixada.'); }
    else if (a === 'copiar') {
      if (!blob) return msg('A imagem ainda está sendo gerada.');
      try { await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]); msg('Imagem copiada — cole na conversa ou no post.'); } catch { baixar(blob, arquivo().name); msg('Seu navegador não permite copiar imagens; a imagem foi baixada.'); }
    } else if (a === 'ig') {
      if (!dados) return msg('O Instagram precisa de uma imagem; esta tela não tem card.');
      if (!(await nativo())) { if (!blob) return; baixar(blob, arquivo().name); msg('Imagem baixada. Abra o Instagram no celular e publique-a no feed (4:5) ou nos Stories (9:16).'); }
    }
  });
  q('.share-x').focus();
  if (dados) gerar();
}
