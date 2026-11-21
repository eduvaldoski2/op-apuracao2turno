// Pegar e arrastar para trocar a posição das candidaturas (cartões, etiquetas e cabeçalhos da tabela).
// Qualquer elemento com data-drag="<posição atual>" vira "pegável" e "soltável". No toque, segure ~0,35 s para pegar.
export function ligarArrasto(root, mover) {
  if (root._arrasto) return; root._arrasto = true;
  let est = null;
  const alvoEm = (x, y) => document.elementsFromPoint(x, y).map(e => e.closest?.('[data-drag]')).find(e => e && root.contains(e));
  const limpa = () => { root.querySelectorAll('.cc-alvo,.cc-pego').forEach(e => e.classList.remove('cc-alvo', 'cc-pego')); };
  const fim = ev => {
    if (!est) return; const e = est; est = null; clearTimeout(e.timer);
    document.removeEventListener('pointermove', mexe, true); document.removeEventListener('pointerup', fim, true); document.removeEventListener('pointercancel', cancela, true); document.removeEventListener('touchmove', trava, true);
    if (e.ativo) {
      e.fantasma?.remove(); document.body.classList.remove('cc-arrastando'); limpa();
      const t = alvoEm(ev.clientX, ev.clientY);
      document.addEventListener('click', c => { c.stopPropagation(); c.preventDefault(); }, { capture: true, once: true });   // o arrasto não conta como clique (ordenar coluna etc.)
      if (t && +t.dataset.drag !== e.de) mover(e.de, +t.dataset.drag);
    }
  };
  const cancela = () => { if (!est) return; est.fantasma?.remove(); document.body.classList.remove('cc-arrastando'); limpa(); clearTimeout(est.timer); est = null; };
  const trava = ev => { if (est?.ativo) ev.preventDefault(); };
  const comeca = () => {
    if (!est || est.ativo) return; est.ativo = true;
    const o = est.el, f = document.createElement('div');
    f.className = 'cc-fantasma'; f.textContent = (o.querySelector('b,h3')?.textContent || o.textContent || '').trim().replace(/\s+/g, ' ').slice(0, 48);
    document.body.appendChild(f); est.fantasma = f; document.body.classList.add('cc-arrastando');
    root.querySelectorAll(`[data-drag="${est.de}"]`).forEach(e => e.classList.add('cc-pego'));
  };
  function mexe(ev) {
    if (!est) return;
    if (!est.ativo) {
      if (Math.hypot(ev.clientX - est.x, ev.clientY - est.y) > 7) { if (est.toque) { cancela(); return; } comeca(); } else return;
    }
    est.fantasma.style.left = ev.clientX + 12 + 'px'; est.fantasma.style.top = ev.clientY + 12 + 'px';
    root.querySelectorAll('.cc-alvo').forEach(e => e.classList.remove('cc-alvo'));
    const t = alvoEm(ev.clientX, ev.clientY); if (t && +t.dataset.drag !== est.de) root.querySelectorAll(`[data-drag="${t.dataset.drag}"]`).forEach(e => e.classList.add('cc-alvo'));
    ev.preventDefault();
  }
  root.addEventListener('pointerdown', ev => {
    if (ev.button > 0 || est) return;
    const el = ev.target.closest('[data-drag]'); if (!el || !root.contains(el)) return;
    if (ev.target.closest('a,input,select,textarea,.cmp-x,[data-mv]')) return;
    est = { el, de: +el.dataset.drag, x: ev.clientX, y: ev.clientY, toque: ev.pointerType === 'touch', ativo: false };
    if (est.toque) est.timer = setTimeout(() => { if (est) { comeca(); est.fantasma.style.left = est.x + 12 + 'px'; est.fantasma.style.top = est.y + 12 + 'px'; navigator.vibrate?.(15); } }, 350);
    document.addEventListener('pointermove', mexe, true); document.addEventListener('pointerup', fim, true); document.addEventListener('pointercancel', cancela, true); document.addEventListener('touchmove', trava, { capture: true, passive: false });
  });
  root.addEventListener('dragstart', ev => { if (ev.target.closest?.('[data-drag]')) ev.preventDefault(); });
}
