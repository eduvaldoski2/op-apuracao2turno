// Página "Minha conta" (conta.html): cadastro (nome, contato, senha, excluir) e preferências (boletim do Radar, novidades).
// Mesma conta e mesmo cookie do Painel e do Radar. O menu do topo (ícone de pessoa) leva para cá.
import { CONTA, carregarConta, montarConta, chamarConta, sairConta } from './conta.js?v=7d90a61c';
import { montarMenuConta } from './menuconta.js?v=7d90a61c';

const app = document.getElementById('app');
const REG = [['rj', 'Rio de Janeiro'], ['sp', 'São Paulo'], ['mg', 'Minas Gerais'], ['ne', 'Nordeste'], ['sul', 'Sul'], ['norte', 'Norte'], ['co', 'Centro-Oeste']];
const EDS = [['politica', 'Política'], ['economia', 'Economia'], ['mundo', 'Mundo']];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dataBr = iso => { const [a, m, d] = String(iso || '').split('-'); return d ? `${d}/${m}/${a}` : ''; };
const ABAS = { cadastro: 'Cadastro', preferencias: 'Preferências' };
let aba = location.hash === '#preferencias' ? 'preferencias' : 'cadastro';
let boletim = null;   // { ativo, ed, reg } | false (indisponível) | null (carregando)
let temEmail = true;
let analise = null;   // módulo de consentimento (eventos do GA4), carregado só se disponível

const menu = montarMenuConta(document.getElementById('menu-conta'), { tema: 'escuro', contaUrl: 'conta.html', aoSair: async () => { await sairConta(); location.href = './'; } });
const msg = (el, txt, tipo = '') => { if (el) { el.textContent = txt || ''; el.className = 'st ' + tipo; } };
const trava = (btn, on) => { if (btn) btn.disabled = on; };
document.title = 'Minha conta · Oficina Política';

async function iniciar() {
  await carregarConta();
  if (!CONTA.logado) { telaEntrar(); return; }
  menu.atualizar(CONTA.usuario);
  desenha();
  carregaBoletim();
}

function telaEntrar() {
  menu.atualizar(null);
  app.innerHTML = `<h1>Minha conta</h1><p class="sub">Entre para ver o seu cadastro e as suas preferências.</p><div id="entrar"></div>`;
  montarConta(app.querySelector('#entrar'), c => { if (c.logado) { menu.atualizar(CONTA.usuario); desenha(); carregaBoletim(); } }, { alvo: 'o seu cadastro e as suas preferências' });
}

function desenha() {
  const u = CONTA.usuario || {};
  const abas = `<div class="abas" role="tablist" aria-label="Minha conta">${Object.entries(ABAS).map(([k, n]) => `<button type="button" role="tab" id="aba-${k}" aria-controls="p-${k}" aria-selected="${aba === k}" tabindex="${aba === k ? 0 : -1}" data-aba="${k}">${n}</button>`).join('')}</div>`;
  app.innerHTML = `<h1>Minha conta</h1><p class="sub">Olá, ${esc(String(u.nome || '').split(' ')[0])}. Aqui ficam o seu cadastro e as suas preferências de e-mail.</p>${abas}
    <section role="tabpanel" id="p-cadastro" aria-labelledby="aba-cadastro" ${aba === 'cadastro' ? '' : 'hidden'}>${cadastroHtml(u)}</section>
    <section role="tabpanel" id="p-preferencias" aria-labelledby="aba-preferencias" ${aba === 'preferencias' ? '' : 'hidden'}>${prefsHtml(u)}</section>`;
  pintaBoletim();
}

// ---------- Cadastro ----------
function cadastroHtml(u) {
  const canal = u.canal === 'whatsapp' ? 'WhatsApp' : 'E-mail';
  const senha = u.sem_senha
    ? `<p class="d">Você entra com o Google e ainda não tem senha. Se quiser, crie uma para também poder entrar com e-mail e senha: enviamos um código de confirmação para ${esc(u.contato)}.</p>
       <div id="senha-cod"><button type="button" class="btn sec" data-a="senha-codigo">Criar senha</button></div><div class="st" id="senha-st" role="status"></div>`
    : `<form data-f="senha"><div class="campo"><label for="sa">Senha atual</label><input id="sa" type="password" name="senha_atual" autocomplete="current-password" required></div>
       <div class="campo"><label for="sn">Nova senha</label><input id="sn" type="password" name="senha" autocomplete="new-password" minlength="8" maxlength="72" required><span class="h">Mínimo de 8 caracteres, com letras e números.</span></div>
       <div class="campo"><label for="sc">Repita a nova senha</label><input id="sc" type="password" name="confirma" autocomplete="new-password" minlength="8" maxlength="72" required></div>
       <button class="btn" type="submit">Alterar senha</button><div class="st" role="status"></div></form>
       <p class="d" style="margin:12px 0 0">Esqueceu a senha atual? <button type="button" class="lk" data-a="senha-codigo">Receber um código para criar outra</button></p><div id="senha-cod"></div>`;
  return `<div class="card"><h2>Seus dados</h2><p class="d">É com o contato abaixo que você entra e recebe os códigos de confirmação.</p>
      <form data-f="nome"><div class="campo"><label for="nm">Nome</label><input id="nm" type="text" name="nome" value="${esc(u.nome || '')}" autocomplete="name" required maxlength="80"></div>
      <div class="campo"><span class="l">${canal} da conta</span><div class="v">${esc(u.contato || '')}</div><span class="h">Para trocar o ${canal === 'WhatsApp' ? 'número' : 'e-mail'} da conta, escreva para <a href="mailto:contato@oficinapolitica.com.br">contato@oficinapolitica.com.br</a>.</span></div>
      ${u.google ? '<div class="campo"><span class="l">Google</span><div class="v">Conta Google conectada</div></div>' : ''}
      <div class="acoes"><button class="btn" type="submit">Salvar nome</button>${u.desde ? `<span class="h" style="font-size:13px;color:var(--mudo)">Conta criada em ${dataBr(u.desde)}</span>` : ''}</div><div class="st" role="status"></div></form></div>
    <div class="card"><h2>Senha</h2>${senha}</div>
    <div class="card"><div class="acoes" style="justify-content:space-between"><div><h2 style="margin:0">Sair deste aparelho</h2><p class="d" style="margin:4px 0 0">Você continua com a conta; só precisa entrar de novo.</p></div><button type="button" class="btn sec" data-a="sair">Sair da conta</button></div></div>
    <details class="card perigo" id="excl"><summary>Excluir minha conta</summary>
      <form data-f="excluir" style="margin-top:14px"><p class="d">Isto apaga a sua conta e os seus dados de cadastro, inclusive o boletim, e não dá para desfazer. ${u.sem_senha ? 'Para confirmar, digite EXCLUIR.' : 'Para confirmar, digite a sua senha.'}</p>
      <div class="campo">${u.sem_senha ? '<label for="ex">Confirmação</label><input id="ex" type="text" name="confirmacao" autocomplete="off" placeholder="EXCLUIR" required>' : '<label for="ex">Senha</label><input id="ex" type="password" name="senha" autocomplete="current-password" required>'}</div>
      <button class="btn perigo" type="submit">Excluir definitivamente</button><div class="st" role="status"></div></form></details>`;
}

// ---------- Preferências ----------
function prefsHtml(u) {
  return `<div class="card" id="bol"><h2>Boletim do Radar <small id="bol-pill">…</small></h2>
      <p class="d">Receba por e-mail, uma vez por dia no fim da tarde, o resumo das principais notícias do Radar, com os links. Escolha o que quer ler.</p>
      <div id="bol-corpo"><p class="carrega" style="padding:6px 0">Carregando…</p></div></div>
    <div class="card"><div class="sw-l"><div><h2 style="margin:0 0 4px">Novidades da Oficina Política</h2><p class="d" style="margin:0">Avisos sobre a plataforma e conteúdos sobre as eleições, no e-mail ou WhatsApp da conta. Você pode desligar quando quiser.</p></div>
      <button type="button" class="sw" role="switch" aria-checked="${u.novidades ? 'true' : 'false'}" aria-label="Receber novidades da Oficina Política" data-a="novidades"></button></div>
      <div class="st" id="nov-st" role="status"></div>
      <p class="nota">Os códigos de confirmação e os avisos de segurança da conta sempre são enviados, mesmo com as novidades desligadas. Detalhes na <a href="privacidade.html">Política de Privacidade</a>.</p></div>`;
}
async function carregaBoletim() {
  try {
    const r = await fetch('/radar/boletim.php', { credentials: 'same-origin', cache: 'no-store' }); const j = r.ok ? await r.json() : null;
    if (j?.ok) { boletim = j.prefs || { ativo: false, ed: [], reg: [] }; temEmail = !!j.email; } else boletim = false;
  } catch { boletim = false; }
  pintaBoletim();
}
function pintaBoletim() {
  const corpo = document.getElementById('bol-corpo'); if (!corpo || boletim === null) return;
  const pill = document.getElementById('bol-pill');
  if (boletim === false) { corpo.innerHTML = '<p class="d">O boletim não está disponível agora. Tente de novo mais tarde.</p>'; pill.remove(); return; }
  pill.textContent = boletim.ativo ? 'Ativo' : 'Desligado'; pill.className = boletim.ativo ? 'on' : '';
  const ck = (n, v, t, on) => `<label class="ck"><input type="checkbox" name="${n}" value="${v}" ${on ? 'checked' : ''}>${t}</label>`;
  corpo.innerHTML = `<form data-f="boletim">
    <h3>Editorias</h3><div class="grade tres">${EDS.map(([v, t]) => ck('ed', v, t, boletim.ed.includes(v))).join('')}</div>
    <h3>Regiões</h3><p class="d" style="margin:0 0 8px">Marque só as que importam para você.</p><div class="grade">${REG.map(([v, t]) => ck('reg', v, t, boletim.reg.includes(v))).join('')}</div>
    <p class="nota">Inclui sempre a seção <b>Para ficar de olho</b>. Todo boletim traz um link para cancelar com um clique.</p>
    ${temEmail ? '' : '<p class="nota" style="background:#fdecea">A sua conta não tem e-mail cadastrado, então não dá para receber o boletim.</p>'}
    <label class="aceite"><input type="checkbox" name="aceite" ${boletim.ativo ? 'checked' : ''} ${temEmail ? '' : 'disabled'}><span>Quero receber o boletim do Radar por e-mail, uma vez por dia, com as editorias e regiões que escolhi. Sei que posso cancelar quando quiser.</span></label>
    <div class="acoes"><button class="btn" type="submit" ${temEmail ? '' : 'disabled'}>Salvar minhas escolhas</button>${boletim.ativo ? '<button type="button" class="btn sec" data-a="boletim-cancelar">Cancelar o boletim</button>' : ''}</div><div class="st" role="status"></div></form>`;
}
async function salvaBoletim(ativo, form) {
  const st = form.querySelector('.st'), fd = new FormData();
  fd.append('ativo', ativo ? '1' : '0'); fd.append('aceite', form.elements.aceite.checked ? '1' : '0');
  form.querySelectorAll('[name=ed]:checked').forEach(c => fd.append('ed[]', c.value));
  form.querySelectorAll('[name=reg]:checked').forEach(c => fd.append('reg[]', c.value));
  msg(st, 'Salvando…');
  try {
    const r = await fetch('/radar/boletim.php', { method: 'POST', body: fd, credentials: 'same-origin' }); const j = await r.json().catch(() => null);
    if (!j?.ok) { msg(st, j?.mensagem || 'Não foi possível salvar agora.', 'erro'); return; }
    boletim = { ativo, ed: fd.getAll('ed[]'), reg: fd.getAll('reg[]') }; pintaBoletim(); msg(document.querySelector('#bol-corpo .st'), j.mensagem, 'ok');
    if (ativo) try { analise?.evento('boletim_assinou', { editorias: boletim.ed.join(','), regioes: boletim.reg.join(',') }, { meta: 'Subscribe', ads: 'cadastro' }); } catch { /* sem GA */ }
  } catch { msg(st, 'Não foi possível salvar agora.', 'erro'); }
}

// ---------- ações ----------
function atualizaUsuario(j) { if (j?.usuario) { CONTA.usuario = j.usuario; menu.atualizar(CONTA.usuario); } }
app.addEventListener('click', async ev => {
  const t = ev.target.closest('[data-aba],[data-a]'); if (!t) return;
  if (t.dataset.aba) { troca(t.dataset.aba); return; }
  const a = t.dataset.a;
  if (a === 'sair') { await sairConta(); location.href = './'; }
  else if (a === 'boletim-cancelar') { const f = document.querySelector('form[data-f=boletim]'); f.elements.aceite.checked = false; await salvaBoletim(false, f); }
  else if (a === 'novidades') {
    const st = document.getElementById('nov-st'), on = t.getAttribute('aria-checked') !== 'true'; t.disabled = true; msg(st, 'Salvando…');
    const j = await chamarConta('novidades', { ativo: on }); t.disabled = false;
    if (j.ok) { t.setAttribute('aria-checked', String(on)); atualizaUsuario(j); msg(st, j.mensagem, 'ok'); } else msg(st, j.mensagem || 'Não foi possível salvar agora.', 'erro');
  }
  else if (a === 'senha-codigo') {
    const st = document.getElementById('senha-st') || (document.getElementById('senha-cod').insertAdjacentHTML('beforebegin', '<div class="st" id="senha-st" role="status"></div>'), document.getElementById('senha-st'));
    t.disabled = true; msg(st, 'Enviando o código…'); const j = await chamarConta('senha_pedir_codigo'); t.disabled = false;
    if (!j.ok) { msg(st, j.mensagem || 'Não foi possível enviar o código.', 'erro'); return; }
    msg(st, j.mensagem, 'ok');
    document.getElementById('senha-cod').innerHTML = `<form data-f="senha-definir" style="margin-top:12px"><div class="campo"><label for="cd">Código de 6 dígitos</label><input id="cd" type="text" name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="\\d{6}" required></div>
      <div class="campo"><label for="sn2">Nova senha</label><input id="sn2" type="password" name="senha" autocomplete="new-password" minlength="8" maxlength="72" required><span class="h">Mínimo de 8 caracteres, com letras e números.</span></div>
      <button class="btn" type="submit">Salvar senha</button><div class="st" role="status"></div></form>`;
    document.getElementById('cd').focus();
  }
});
app.addEventListener('keydown', ev => {   // setas nas abas
  const b = ev.target.closest('[role=tab]'); if (!b || !['ArrowLeft', 'ArrowRight'].includes(ev.key)) return;
  const ks = Object.keys(ABAS), i = ks.indexOf(b.dataset.aba), n = ks[(i + (ev.key === 'ArrowRight' ? 1 : ks.length - 1)) % ks.length];
  ev.preventDefault(); troca(n); document.getElementById('aba-' + n).focus();
});
app.addEventListener('submit', async ev => {
  ev.preventDefault(); const f = ev.target.closest('form'); if (!f) return; const t = f.dataset.f, d = Object.fromEntries(new FormData(f)), st = f.querySelector('.st'), btn = f.querySelector('button[type=submit]');
  if (t === 'boletim') { trava(btn, true); await salvaBoletim(true, f); trava(document.querySelector('form[data-f=boletim] button[type=submit]'), false); return; }
  trava(btn, true); msg(st, 'Salvando…');
  try {
    if (t === 'nome') { const j = await chamarConta('perfil_nome', { nome: d.nome }); if (j.ok) { atualizaUsuario(j); msg(st, j.mensagem, 'ok'); document.querySelector('.sub').textContent = `Olá, ${String(j.usuario.nome).split(' ')[0]}. Aqui ficam o seu cadastro e as suas preferências de e-mail.`; } else msg(st, j.mensagem || 'Não foi possível salvar.', 'erro'); }
    else if (t === 'senha') {
      if (d.senha !== d.confirma) { msg(st, 'As duas senhas novas não são iguais.', 'erro'); return; }
      const j = await chamarConta('senha_trocar', { senha_atual: d.senha_atual, senha: d.senha }); if (j.ok) { f.reset(); msg(st, j.mensagem, 'ok'); } else msg(st, j.mensagem || 'Não foi possível alterar a senha.', 'erro');
    }
    else if (t === 'senha-definir') { const j = await chamarConta('senha_definir', { codigo: d.codigo, senha: d.senha }); if (j.ok) { atualizaUsuario(j); desenha(); carregaBoletim(); msg(document.querySelector('form[data-f=senha] .st'), j.mensagem, 'ok'); } else msg(st, j.mensagem || 'Não foi possível definir a senha.', 'erro'); }
    else if (t === 'excluir') { const j = await chamarConta('excluir', { senha: d.senha, confirmacao: d.confirmacao }); if (j.ok) { app.innerHTML = '<h1>Conta excluída</h1><p class="sub">Sua conta e os seus dados de cadastro foram apagados.</p><p><a href="./">Voltar para a página inicial</a></p>'; menu.atualizar(null); return; } msg(st, j.mensagem || 'Não foi possível excluir.', 'erro'); }
  } finally { trava(btn, false); }
});

function troca(k) {
  if (!ABAS[k]) return; aba = k;
  for (const x of Object.keys(ABAS)) { document.getElementById('p-' + x).hidden = x !== k; const b = document.getElementById('aba-' + x); b.setAttribute('aria-selected', String(x === k)); b.tabIndex = x === k ? 0 : -1; }
  try { history.replaceState(null, '', '#' + k); } catch { /* ok */ }
}
window.addEventListener('hashchange', () => { if (CONTA.logado && (location.hash === '#cadastro' || location.hash === '#preferencias')) troca(location.hash.slice(1)); });

(async () => { try { analise = await import('./consentimento.js?v=7d90a61c'); analise.iniciarConsentimento(); } catch { analise = null; } })();
iniciar();
