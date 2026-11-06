// Box "O que você está sentindo falta?" + formulário de sugestões do Painel (envia para api/sugestao.php).
// Autônomo: injeta o próprio estilo e funciona na capa e no painel. Se o envio falhar, o painel segue normal.
const CSS = `
.sg-box{max-width:1100px;margin:28px auto;padding:22px 26px;border-radius:18px;background:#3E347E;color:#FBF9F5;display:flex;gap:18px 28px;align-items:center;justify-content:space-between;flex-wrap:wrap;font-family:'Space Grotesk',system-ui,sans-serif}
.sg-box h2{color:#FBF9F5!important;font:400 26px/1.1 'DM Serif Display',Georgia,serif;margin:0 0 6px;letter-spacing:.01em;text-transform:uppercase}
.sg-box p{margin:0;max-width:62ch;font-size:15px;line-height:1.45;opacity:.92}
.sg-box button,.sg-f button.sg-env{font:inherit;font-weight:700;border:0;border-radius:10px;padding:11px 20px;cursor:pointer;background:#F08A24;color:#fff}
.sg-box button:hover,.sg-f button.sg-env:hover{background:#d9771a}
.sg-box button:focus-visible,.sg-x:focus-visible{outline:3px solid #fff;outline-offset:2px}
.sg-ov{position:fixed;inset:0;z-index:1100;background:rgba(30,24,60,.55);display:flex;align-items:center;justify-content:center;padding:16px;font-family:'Space Grotesk',system-ui,sans-serif}
.sg-m{background:#fff;color:#1b1530;border-radius:18px;width:min(540px,100%);max-height:calc(100vh - 32px);overflow:auto;padding:20px 22px;box-shadow:0 20px 60px rgba(30,24,60,.35)}
.sg-t{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}
.sg-t h3{color:#3E347E;font:400 24px/1.1 'DM Serif Display',Georgia,serif;color:#3E347E;margin:0 0 6px}
.sg-x{border:0;background:none;font-size:20px;cursor:pointer;color:#5d5675;padding:4px 8px}
.sg-m>p{margin:0 0 12px;color:#5d5675;font-size:14px}
.sg-f{display:grid;gap:10px}.sg-f label{display:grid;gap:3px;font-size:13px;font-weight:700;color:#2A2260}
.sg-f label small{font-weight:400;color:#5d5675}
.sg-f input,.sg-f textarea{font:inherit;font-weight:400;padding:9px 10px;border:1.5px solid #cfc8e6;border-radius:9px;background:#fff;color:#1b1530;width:100%}
.sg-f textarea{min-height:120px;resize:vertical}
.sg-f input:focus,.sg-f textarea:focus{outline:2px solid #3E347E;border-color:#3E347E}
.sg-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}
.sg-nota{font-size:12.5px;color:#5d5675;margin:0}.sg-nota a{color:#3E347E}
.sg-msg{min-height:1.2em;margin:0;font-size:14px;font-weight:700;color:#a3261a}.sg-msg.ok{color:#1f7a4d}
.sg-f button.sg-env{justify-self:start}.sg-f button[disabled]{opacity:.6;cursor:wait}
@media (max-width:640px){.sg-box{margin:20px 12px;padding:18px}.sg-ov{align-items:flex-end;padding:0}.sg-m{border-radius:18px 18px 0 0;max-height:92vh;width:100%}}`;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const ENDPOINT = new URL('api/sugestao.php', document.baseURI).pathname;

function abrir(origem) {
  if (document.querySelector('.sg-ov')) return;
  const ov = document.createElement('div'); ov.className = 'sg-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-labelledby', 'sg-h');
  ov.innerHTML = `<div class="sg-m"><div class="sg-t"><h3 id="sg-h">O que você está sentindo falta?</h3><button type="button" class="sg-x" data-f aria-label="Fechar">✕</button></div>
  <p>Encontrou um erro ou quer uma funcionalidade nova? Conte para a gente.</p>
  <form class="sg-f" novalidate>
    <label>Nome<input name="nome" autocomplete="name" required maxlength="120"></label>
    <label>E-mail<input name="email" type="email" autocomplete="email" required maxlength="160"></label>
    <label>WhatsApp <small>(opcional, com DDD)</small><input name="telefone" type="tel" autocomplete="tel" inputmode="tel" maxlength="20"></label>
    <label>Sugestões<textarea name="mensagem" required maxlength="3000" placeholder="Descreva o erro ou a melhoria que você gostaria de ver"></textarea></label>
    <input name="site" class="sg-hp" tabindex="-1" autocomplete="off" aria-hidden="true">
    <p class="sg-nota">Usamos seus dados só para responder a esta sugestão. Veja a <a href="privacidade.html" target="_blank" rel="noopener">política de privacidade</a>.</p>
    <p class="sg-msg" data-msg role="status" aria-live="polite"></p>
    <button class="sg-env" type="submit">Enviar sugestão</button>
  </form></div>`;
  const fecha = () => { ov.remove(); document.removeEventListener('keydown', tecla); document.body.style.overflow = ''; origem?.focus?.(); };
  const tecla = e => { if (e.key === 'Escape') fecha(); };
  ov.addEventListener('click', e => { if (e.target === ov || e.target.closest('[data-f]')) fecha(); });
  document.addEventListener('keydown', tecla); document.body.style.overflow = 'hidden'; document.body.append(ov);
  const f = ov.querySelector('form'), msg = ov.querySelector('[data-msg]'), bt = ov.querySelector('.sg-env');
  f.nome.focus();
  f.addEventListener('submit', async e => {
    e.preventDefault(); msg.className = 'sg-msg';
    const d = Object.fromEntries(new FormData(f)); d.pagina = location.pathname + location.hash.slice(0, 60);
    const tel = String(d.telefone || '').replace(/\D/g, '');
    if (!d.nome.trim()) return void (msg.textContent = 'Informe seu nome.');
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(d.email.trim())) return void (msg.textContent = 'Informe um e-mail válido.');
    if (tel && (tel.length < 10 || tel.length > 13)) return void (msg.textContent = 'WhatsApp: use DDD + número.');
    if (d.mensagem.trim().length < 8) return void (msg.textContent = 'Escreva sua sugestão.');
    bt.disabled = true; msg.textContent = 'Enviando…';
    try {
      const r = await fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(d) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || !j.ok) throw new Error(j.erro || 'Não foi possível enviar agora. Tente de novo em instantes.');
      f.innerHTML = `<p class="sg-msg ok">Recebemos sua sugestão. Obrigado por ajudar a melhorar o Painel!</p><button type="button" class="sg-env" data-f>Fechar</button>`;
    } catch (err) { msg.textContent = err.message; bt.disabled = false; }
  });
}

function iniciar() {
  const alvo = document.getElementById('sugestao-box'); if (!alvo) return;
  if (!document.getElementById('sg-css')) { const s = document.createElement('style'); s.id = 'sg-css'; s.textContent = CSS; document.head.append(s); }
  alvo.innerHTML = `<div class="sg-box"><div><h2>O que você está sentindo falta?</h2><p>O Painel Eleições está em constante atualização. Encontrou algum erro ou tem alguma funcionalidade que você gostaria de melhorar? Envie suas sugestões <a href="#" data-sg style="color:#F08A24;font-weight:700">clique aqui</a>.</p></div><button type="button" data-sg>Enviar sugestão</button></div>`;
  alvo.addEventListener('click', e => { const b = e.target.closest('[data-sg]'); if (!b) return; e.preventDefault(); abrir(b); });
}
iniciar();
