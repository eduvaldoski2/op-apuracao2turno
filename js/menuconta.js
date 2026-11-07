// Menu da conta no topo: ícone de pessoa que abre "Minha conta", "Preferências" e "Sair".
// Um só código para o Painel, a capa e o Radar. Quem chama decide quando mostrar (logado) ou o botão "Entrar" (deslogado).
//   const m = montarMenuConta(el, { tema: 'escuro' | 'claro', contaUrl: '/conta.html', aoSair: async () => {} });
//   m.atualizar({ nome, contato })   // mostra o menu;  m.atualizar(null) esvazia
const CSS = `
.opmc{position:relative;display:inline-block;font:500 14px/1.3 'Space Grotesk',system-ui,-apple-system,'Segoe UI',Roboto,sans-serif;text-align:left}
.opmc-b{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:4px 10px 4px 5px;border:1.5px solid var(--opmc-bd);border-radius:999px;background:var(--opmc-bg);color:var(--opmc-fg);font:inherit;font-weight:700;cursor:pointer;-webkit-tap-highlight-color:transparent}
.opmc-b:hover{background:var(--opmc-hv);color:var(--opmc-hvf)}
.opmc-b:focus-visible,.opmc-m a:focus-visible,.opmc-m button:focus-visible{outline:3px solid #F08A24;outline-offset:2px}
.opmc-av{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:var(--opmc-av);color:var(--opmc-avf);flex:none}
.opmc-av svg{width:18px;height:18px}
.opmc-n{max-width:11ch;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.opmc-ch{width:14px;height:14px;transition:transform .15s;flex:none}
.opmc-b[aria-expanded=true] .opmc-ch{transform:rotate(180deg)}
.opmc-m{position:absolute;right:0;top:calc(100% + 8px);z-index:1000;width:max-content;min-width:250px;max-width:calc(100vw - 24px);background:#fff;color:#1b1530;border:1px solid #ddd8ea;border-radius:12px;box-shadow:0 14px 36px rgba(42,34,96,.22);padding:6px;font-weight:500}
.opmc-m[hidden]{display:none}
.opmc-h{padding:10px 12px 12px;border-bottom:1px solid #ece8f5;margin-bottom:6px;min-width:0}
.opmc-h b{display:block;font-size:15px;color:#2A2260;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.opmc-h span{display:block;font-size:12.5px;color:#5d5675;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.opmc-m a,.opmc-m button{display:flex;align-items:center;gap:12px;width:100%;min-height:46px;padding:8px 12px;border:0;border-radius:8px;background:transparent;color:#1b1530;font:inherit;text-decoration:none;text-align:left;cursor:pointer}
.opmc-m a:hover,.opmc-m button:hover{background:#EFEBF8}
.opmc-m svg{width:20px;height:20px;flex:none;color:#3E347E}
.opmc-m small{display:block;font-size:12px;color:#5d5675;margin-top:1px}
.opmc-m hr{border:0;border-top:1px solid #ece8f5;margin:6px 4px}
.opmc-m [data-sair]{font-weight:700}
.opmc[data-tema=escuro]{--opmc-fg:#fff;--opmc-bd:rgba(255,255,255,.6);--opmc-bg:transparent;--opmc-hv:rgba(255,255,255,.14);--opmc-hvf:#fff;--opmc-av:#fff;--opmc-avf:#3E347E}
.opmc[data-tema=claro]{--opmc-fg:#3E347E;--opmc-bd:#3E347E;--opmc-bg:#fff;--opmc-hv:#EFEBF8;--opmc-hvf:#2A2260;--opmc-av:#3E347E;--opmc-avf:#fff}
@media (max-width:640px){.opmc-n{display:none}.opmc-b{padding-right:8px;gap:4px}}
@media (prefers-reduced-motion:reduce){.opmc-ch{transition:none}}
`;
const I = {
  pessoa: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4.2 3.6-7 8-7s8 2.8 8 7"/></svg>',
  cad: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><circle cx="9" cy="11" r="2.2"/><path d="M5.5 17c.6-2 2-3 3.5-3s2.9 1 3.5 3M15 9.5h3.5M15 13h3.5"/></svg>',
  pref: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/></svg>',
  sair: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M9 4H5a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h4M16 8l4 4-4 4M20 12H9"/></svg>',
  seta: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m6 9 6 6 6-6"/></svg>',
};
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
let estilo = false;

export function montarMenuConta(el, o = {}) {
  if (!estilo) { const s = document.createElement('style'); s.textContent = CSS; document.head.appendChild(s); estilo = true; }
  const contaUrl = o.contaUrl || '/conta.html', tema = o.tema === 'claro' ? 'claro' : 'escuro';
  let alvo = null;   // aberto?
  const fecha = (volta) => { const m = el.querySelector('.opmc-m'), b = el.querySelector('.opmc-b'); if (!m || m.hidden) return; m.hidden = true; b.setAttribute('aria-expanded', 'false'); if (volta) b.focus(); };
  const abre = () => { const m = el.querySelector('.opmc-m'), b = el.querySelector('.opmc-b'); m.hidden = false; b.setAttribute('aria-expanded', 'true'); m.querySelector('[role=menuitem]')?.focus(); };
  const itens = () => [...el.querySelectorAll('.opmc-m [role=menuitem]')];
  function atualizar(u) {
    if (!u) { el.innerHTML = ''; return; }
    const primeiro = String(u.nome || '').trim().split(/\s+/)[0] || 'Minha conta';
    el.innerHTML = `<div class="opmc" data-tema="${tema}">
      <button type="button" class="opmc-b" aria-haspopup="menu" aria-expanded="false" aria-label="Minha conta de ${esc(primeiro)}"><span class="opmc-av">${I.pessoa}</span><span class="opmc-n">Olá, ${esc(primeiro)}</span><span class="opmc-ch">${I.seta}</span></button>
      <div class="opmc-m" role="menu" hidden>
        <div class="opmc-h"><b>${esc(u.nome || '')}</b><span>${esc(u.contato || '')}</span></div>
        <a role="menuitem" href="${esc(contaUrl)}#cadastro">${I.cad}<span>Minha conta<small>Cadastro e senha</small></span></a>
        <a role="menuitem" href="${esc(contaUrl)}#preferencias">${I.pref}<span>Preferências<small>Boletim e novidades</small></span></a>
        <hr>
        <button type="button" role="menuitem" data-sair>${I.sair}<span>Sair</span></button>
      </div></div>`;
  }
  el.addEventListener('click', async ev => {
    const b = ev.target.closest('.opmc-b'); if (b) { el.querySelector('.opmc-m').hidden ? abre() : fecha(true); return; }
    if (ev.target.closest('[data-sair]')) { fecha(false); try { await o.aoSair?.(); } catch { /* quem chama trata */ } }
  });
  el.addEventListener('keydown', ev => {
    const m = el.querySelector('.opmc-m'); if (!m) return;
    if (ev.key === 'Escape') { fecha(true); return; }
    if (m.hidden) { if (ev.key === 'ArrowDown' && ev.target.closest('.opmc-b')) { ev.preventDefault(); abre(); } return; }
    const l = itens(), i = l.indexOf(document.activeElement);
    if (ev.key === 'ArrowDown') { ev.preventDefault(); l[(i + 1) % l.length].focus(); }
    else if (ev.key === 'ArrowUp') { ev.preventDefault(); l[(i - 1 + l.length) % l.length].focus(); }
    else if (ev.key === 'Home') { ev.preventDefault(); l[0].focus(); }
    else if (ev.key === 'End') { ev.preventDefault(); l[l.length - 1].focus(); }
    else if (ev.key === 'Tab') fecha(false);
  });
  document.addEventListener('click', ev => { if (!el.contains(ev.target)) fecha(false); });
  return { atualizar };
}
