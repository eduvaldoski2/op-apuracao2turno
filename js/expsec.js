// Botão "Baixar" em cada seção (painel) da tela: PNG, PDF, CSV e Excel só daquela seção.
import { baixarPNGSecaoSocial, baixarPDFSecao, baixarCSV, baixarXLSX, tabelaDaSecao, slug } from './export.js?v=625ef1e1';

const MENU = (tab) => `<div class="exp-sec sem-export"><button type="button" class="exp-sec-b" aria-haspopup="true" aria-expanded="false" title="Baixar esta seção">⬇ Baixar</button><div class="exp-sec-m" role="menu" hidden><button type="button" role="menuitem" data-es="png-1x1">Imagem 1:1 · WhatsApp</button><button type="button" role="menuitem" data-es="png-4x5">Imagem 4:5 · Feed</button><button type="button" role="menuitem" data-es="png-9x16">Imagem 9:16 · Stories</button><button type="button" role="menuitem" data-es="pdf">PDF</button>${tab ? '<button type="button" role="menuitem" data-es="csv">Planilha (CSV)</button><button type="button" role="menuitem" data-es="xlsx">Excel (XLSX)</button>' : ''}</div></div>`;

let obs = null, tempo = 0, ctxFn = null, avisar = () => {}, medir = () => {};

function garantir(vista) {
  vista.querySelectorAll('.painel').forEach(p => {
    if (p.dataset.expSec || !p.querySelector(':scope > h2')) return;
    if (p.closest('.sem-export') || p.closest('details')) return;
    p.dataset.expSec = '1'; p.classList.add('tem-exp');
    p.insertAdjacentHTML('afterbegin', MENU(true));
  });
  // o botão de CSV/Excel só aparece quando a seção tem tabela
  vista.querySelectorAll('.painel.tem-exp').forEach(p => {
    const tem = !!p.querySelector('table');
    const m = p.querySelector(':scope > .exp-sec .exp-sec-m'); if (!m) return;
    const tinha = !!m.querySelector('[data-es="csv"]');
    if (tem && !tinha) m.insertAdjacentHTML('beforeend', '<button type="button" role="menuitem" data-es="csv">Planilha (CSV)</button><button type="button" role="menuitem" data-es="xlsx">Excel (XLSX)</button>');
    if (!tem && tinha) m.querySelectorAll('[data-es="csv"],[data-es="xlsx"]').forEach(b => b.remove());
  });
}

export function iniciarExportSecoes(vista, contexto, { toast, evento } = {}) {
  ctxFn = contexto; avisar = toast || avisar; medir = evento || medir;
  if (obs) obs.disconnect();
  if (!vista) return;
  garantir(vista);
  obs = new MutationObserver(() => { clearTimeout(tempo); tempo = setTimeout(() => garantir(vista), 200); });
  obs.observe(vista, { childList: true, subtree: true });
}

function fechar() { document.querySelectorAll('.exp-sec-m:not([hidden])').forEach(m => { m.hidden = true; m.parentElement.querySelector('.exp-sec-b')?.setAttribute('aria-expanded', 'false'); }); }

document.addEventListener('click', async e => {
  const b = e.target.closest('.exp-sec-b');
  if (b) { const m = b.parentElement.querySelector('.exp-sec-m'), abrir = m.hidden; fechar(); m.hidden = !abrir; b.setAttribute('aria-expanded', String(abrir)); return; }
  const a = e.target.closest('[data-es]');
  if (!a) { if (!e.target.closest('.exp-sec')) fechar(); return; }
  fechar();
  const sec = a.closest('.painel'); if (!sec || !ctxFn) return;
  const tipo = a.dataset.es, c = ctxFn();
  const h2 = (sec.dataset.exportTitulo || sec.querySelector(':scope > h2')?.innerText || 'secao').replace(/\s+/g, ' ').trim();
  const nome = `${c.nome}_${slug(h2)}`.slice(0, 120);
  medir?.('exportar', { tipo: 'sec-' + tipo, aba: c.r?.modo || 'ap', secao: slug(h2).slice(0, 40) });
  const alvo = sec.querySelector(':scope > .exp-sec .exp-sec-b');
  const txt = alvo?.textContent; if (alvo) { alvo.disabled = true; alvo.textContent = '…'; }
  try {
    if (/^png-(1x1|4x5|9x16)$/.test(tipo)) {
      const n = await baixarPNGSecaoSocial(sec, nome, tipo.slice(4), { titulo: h2, topo: c.principal, sub: c.sub });
      if (n > 1) avisar?.(n > 5 ? `A tabela é grande: gerei ${n} imagens e juntei tudo em um arquivo ZIP.` : `A tabela é grande: gerei ${n} imagens, na ordem.`);
    }
    else if (tipo === 'pdf') await baixarPDFSecao(sec, nome, c.sub, c.principal);
    else {
      const t = tabelaDaSecao(sec); if (!t) { avisar?.('Esta seção não tem tabela para baixar.', true); return; }
      const rod = [`${h2} — ${c.principal}. Fonte: TSE. Oficina Política (oficinapolitica.com.br).`];
      (tipo === 'csv' ? baixarCSV : baixarXLSX)(nome, t.cab, t.linhas, rod);
    }
  } catch (err) { avisar?.('Não foi possível gerar o arquivo: ' + err.message, true); }
  finally { if (alvo) { alvo.disabled = false; alvo.textContent = txt; } }
});
document.addEventListener('keydown', e => { if (e.key === 'Escape') fechar(); });
