// Conta do usuário (necessária para a "Pergunte à IA"): criar conta com confirmação por código (e-mail ou WhatsApp), entrar, sair, redefinir a senha e excluir a conta.
// Quem fala com o servidor é api/conta.php; a sessão fica num cookie HttpOnly (o navegador nunca vê o token).
import { CONFIG, RAIZ } from './config.js?v=6aea79b8';
import { esc } from './ui.js?v=6aea79b8';

const ENDPOINT = () => (CONFIG.conta?.endpoint ?? (RAIZ + 'api/conta.php'));
export const CONTA = { carregado: false, logado: false, usuario: null, cota: null, canais: ['email'], ia_ativa: false, erro: false };

async function chamar(acao, dados = {}) {
  let r, j = null;
  try { r = await fetch(ENDPOINT(), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ acao, ...dados }) }); j = await r.json().catch(() => null); }
  catch { return { ok: false, erro: 'rede', mensagem: 'Sem conexão com o servidor. Tente de novo.' }; }
  if (!j) return { ok: false, erro: 'http_' + r.status, mensagem: r.status === 404 ? 'O cadastro ainda não está disponível neste site.' : 'Não foi possível falar com o servidor agora.' };
  return j;
}
export async function carregarConta() {
  try {
    const r = await fetch(ENDPOINT(), { credentials: 'same-origin', headers: { Accept: 'application/json' }, cache: 'no-store' }), j = r.ok ? await r.json() : null;
    if (!j?.ok) throw new Error('indisponivel');
    Object.assign(CONTA, { carregado: true, erro: false, logado: !!j.logado, usuario: j.usuario || null, cota: j.cota || null, canais: j.canais || ['email'], ia_ativa: !!j.ia_ativa });
  } catch { Object.assign(CONTA, { carregado: true, erro: true, logado: false, usuario: null, cota: null, ia_ativa: false }); }
  return CONTA;
}
export function atualizarCota(c) { if (c) CONTA.cota = c; }
export function sessaoExpirou() { CONTA.logado = false; CONTA.usuario = null; CONTA.cota = null; }

const TEXTO_ACEITE = 'Aceito receber mensagens da Oficina Política neste e-mail ou WhatsApp: o código de confirmação, avisos sobre a plataforma e conteúdos sobre as eleições. Posso cancelar quando quiser.';
const dataBr = iso => { const [a, m, d] = String(iso || '').split('-'); return d ? `${d}/${m}` : ''; };

export function montarConta(el, aoMudar = () => {}) {
  let aba = 'criar', etapa = 'form', contatoAtual = '', destino = '', msg = '', msgOk = '', ocupado = false, espera = 0, timer = null, canalSel = 'email';
  const mudou = () => { try { aoMudar(CONTA); } catch { /* ok */ } };
  const avisoIn = () => (msg ? `<p class="ct-msg ct-erro" role="alert">${esc(msg)}</p>` : '') + (msgOk ? `<p class="ct-msg ct-ok" role="status">${esc(msgOk)}</p>` : '');
  const aviso = () => `<div class="ct-av" aria-live="polite">${avisoIn()}</div>`;
  const cotaHtml = c => c ? `<span class="ct-cota"><b>${c.restantes}</b> de ${c.limite} perguntas restantes este mês${c.reinicia ? ` · renovam em ${dataBr(c.reinicia)}` : ''}</span>` : '';

  function pinta() {
    if (!CONTA.carregado) { el.innerHTML = '<p class="ct-carrega">Carregando…</p>'; return; }
    if (CONTA.erro) { el.innerHTML = '<div class="ct-box"><p class="ct-msg ct-erro">O cadastro e a pergunta livre à IA não estão disponíveis neste site no momento. As consultas rápidas continuam funcionando.</p></div>'; return; }
    if (CONTA.logado) {
      el.innerHTML = `<div class="ct-bar"><div><b>Olá, ${esc((CONTA.usuario?.nome || '').split(' ')[0])}!</b> <span class="ct-dest">${esc(CONTA.usuario?.contato || '')}</span><br>${cotaHtml(CONTA.cota)}</div>
        <div class="ct-bar-a"><button type="button" class="ct-link" data-a="sair">Sair</button><button type="button" class="ct-link" data-a="excluir-abrir">Excluir minha conta</button></div></div>
        ${etapa === 'excluir' ? `<form class="ct-form ct-excl" data-f="excluir"><p>Isto apaga sua conta e seus dados de cadastro. Confirme com sua senha.</p><label>Senha<input type="password" name="senha" autocomplete="current-password" required></label>${aviso()}<div class="ct-bt"><button class="btn" type="submit" ${ocupado ? 'disabled' : ''}>Excluir definitivamente</button><button type="button" class="ct-link" data-a="cancelar">Cancelar</button></div></form>` : ''}`;
      return;
    }
    const chamada = `<p class="ct-chamada"><b>Para liberar a pergunta livre à IA é preciso criar uma conta gratuita</b> (leva um minuto) e confirmar seu e-mail${CONTA.canais.includes('whatsapp') ? ' ou WhatsApp' : ''}. Para concluir o cadastro, é necessário aceitar receber mensagens da Oficina Política. As consultas rápidas não exigem cadastro.</p>`;
    let corpo = '';
    if (etapa === 'confirmar' || etapa === 'redefinir') {
      const red = etapa === 'redefinir';
      corpo = `<form class="ct-form" data-f="${etapa}"><p>${red && !destino ? 'Se houver uma conta com este contato, enviamos um código de 6 dígitos.' : `Enviamos um código de 6 dígitos para <b>${esc(destino || contatoAtual)}</b>. Ele vale por 15 minutos.`}</p>
        <label>Código<input name="codigo" inputmode="numeric" autocomplete="one-time-code" maxlength="6" pattern="\\d{6}" required autofocus placeholder="000000"></label>
        ${red ? '<label>Nova senha<input type="password" name="senha" autocomplete="new-password" minlength="8" maxlength="72" required placeholder="mín. 8 caracteres, com letras e números"></label>' : ''}
        ${aviso()}<div class="ct-bt"><button class="btn" type="submit" ${ocupado ? 'disabled' : ''}>${red ? 'Salvar nova senha e entrar' : 'Confirmar e liberar a IA'}</button>
        ${red ? '' : `<button type="button" class="ct-link" data-a="reenviar" ${espera > 0 ? 'disabled' : ''}>${espera > 0 ? `Reenviar código (${espera}s)` : 'Reenviar código'}</button>`}<button type="button" class="ct-link" data-a="voltar">Voltar</button></div></form>`;
    } else if (etapa === 'esqueci') {
      corpo = `<form class="ct-form" data-f="esqueci"><p>Informe o e-mail ou WhatsApp do cadastro. Vamos enviar um código para criar uma nova senha.</p><label>E-mail ou WhatsApp<input name="contato" autocomplete="username" required value="${esc(contatoAtual)}"></label>${aviso()}
        <div class="ct-bt"><button class="btn" type="submit" ${ocupado ? 'disabled' : ''}>Enviar código</button><button type="button" class="ct-link" data-a="voltar">Voltar</button></div></form>`;
    } else if (aba === 'entrar') {
      corpo = `<form class="ct-form" data-f="entrar"><label>E-mail ou WhatsApp<input name="contato" autocomplete="username" required value="${esc(contatoAtual)}"></label>
        <label>Senha<input type="password" name="senha" autocomplete="current-password" required></label>${aviso()}
        <div class="ct-bt"><button class="btn" type="submit" ${ocupado ? 'disabled' : ''}>Entrar</button><button type="button" class="ct-link" data-a="esqueci">Esqueci a senha</button></div></form>`;
    } else {
      const wa = CONTA.canais.includes('whatsapp');
      corpo = `<form class="ct-form" data-f="cadastrar"><label>Seu nome<input name="nome" autocomplete="name" required maxlength="80"></label>
        ${wa ? `<fieldset class="ct-canal"><legend>Confirmar meu cadastro por</legend><label><input type="radio" name="canal" value="email" ${canalSel === 'email' ? 'checked' : ''}> E-mail</label><label><input type="radio" name="canal" value="whatsapp" ${canalSel === 'whatsapp' ? 'checked' : ''}> WhatsApp</label></fieldset>` : '<input type="hidden" name="canal" value="email">'}
        <label>${wa ? 'E-mail ou WhatsApp (com DDD)' : 'Seu e-mail'}<input name="contato" ${wa ? '' : 'type="email"'} autocomplete="${wa ? 'username' : 'email'}" required value="${esc(contatoAtual)}" placeholder="${wa ? (canalSel === 'whatsapp' ? '(21) 99999-0000' : 'voce@email.com') : 'voce@email.com'}"></label>
        <label>Crie uma senha<input type="password" name="senha" autocomplete="new-password" minlength="8" maxlength="72" required placeholder="mín. 8 caracteres, com letras e números"></label>
        <label class="ct-aceite"><input type="checkbox" name="aceite" required><span>${esc(TEXTO_ACEITE)} <a href="privacidade.html" target="_blank" rel="noopener">Política de privacidade</a></span></label>
        ${aviso()}<div class="ct-bt"><button class="btn" type="submit" ${ocupado ? 'disabled' : ''}>Criar conta e receber o código</button></div></form>`;
    }
    const abas = etapa === 'form' ? `<div class="ct-abas" role="tablist"><button type="button" role="tab" aria-selected="${aba === 'criar'}" data-a="aba-criar" class="${aba === 'criar' ? 'on' : ''}">Criar conta</button><button type="button" role="tab" aria-selected="${aba === 'entrar'}" data-a="aba-entrar" class="${aba === 'entrar' ? 'on' : ''}">Já tenho conta</button></div>` : '';
    el.innerHTML = `<div class="ct-box">${chamada}${abas}${corpo}</div>`;
  }
  const limpa = () => { msg = ''; msgOk = ''; };
  function iniciaEspera(s = 45) { espera = s; clearInterval(timer); timer = setInterval(() => { espera--; if (espera <= 0) { clearInterval(timer); espera = 0; } if (etapa === 'confirmar') { const b = el.querySelector('[data-a="reenviar"]'); if (b) { b.disabled = espera > 0; b.textContent = espera > 0 ? `Reenviar código (${espera}s)` : 'Reenviar código'; } } }, 1000); }
  const sucessoLogin = j => { Object.assign(CONTA, { logado: true, usuario: j.usuario, cota: j.cota || null }); etapa = 'form'; limpa(); pinta(); mudou(); };

  el.addEventListener('change', e => { if (e.target.name === 'canal') { canalSel = e.target.value; const c = el.querySelector('[name="contato"]'); if (c) c.placeholder = canalSel === 'whatsapp' ? '(21) 99999-0000' : 'voce@email.com'; } });
  el.addEventListener('click', async e => {
    const b = e.target.closest('[data-a]'); if (!b) return; const a = b.dataset.a;
    if (a === 'aba-criar' || a === 'aba-entrar') { aba = a === 'aba-criar' ? 'criar' : 'entrar'; limpa(); pinta(); }
    else if (a === 'esqueci') { limpa(); etapa = 'esqueci'; pinta(); }
    else if (a === 'voltar' || a === 'cancelar') { limpa(); etapa = 'form'; pinta(); }
    else if (a === 'sair') { await chamar('sair'); sessaoExpirou(); etapa = 'form'; aba = 'entrar'; limpa(); pinta(); mudou(); }
    else if (a === 'excluir-abrir') { limpa(); etapa = 'excluir'; pinta(); }
    else if (a === 'reenviar' && espera <= 0) {
      const j = await chamar('reenviar', { contato: contatoAtual }); msg = j.ok ? '' : (j.mensagem || ''); msgOk = j.ok ? 'Código reenviado.' : ''; if (j.ok) iniciaEspera(); else if (j.erro === 'espera') iniciaEspera(45); pinta();
    }
  });
  el.addEventListener('submit', async e => {
    e.preventDefault(); const f = e.target.closest('form'); if (!f || ocupado) return; const t = f.dataset.f, d = Object.fromEntries(new FormData(f));
    limpa(); const antes = etapa + '|' + aba + '|' + CONTA.logado; ocupado = true; const btn = f.querySelector('button[type=submit]'); if (btn) btn.disabled = true;
    try {
      if (t === 'cadastrar') {
        contatoAtual = (d.contato || '').trim(); canalSel = d.canal || 'email';
        const j = await chamar('cadastrar', { nome: d.nome, canal: d.canal, contato: contatoAtual, senha: d.senha, aceite_mensagens: !!d.aceite });
        if (j.ok) { etapa = 'confirmar'; destino = j.destino || ''; msgOk = ''; iniciaEspera(); } else { msg = j.mensagem || 'Não foi possível criar a conta.'; if (j.erro === 'existe') aba = 'entrar'; }
      } else if (t === 'confirmar') {
        const j = await chamar('confirmar', { contato: contatoAtual, codigo: d.codigo });
        if (j.ok) { sucessoLogin(j); return; } msg = j.mensagem || 'Não foi possível confirmar.';
      } else if (t === 'entrar') {
        contatoAtual = (d.contato || '').trim();
        const j = await chamar('entrar', { contato: contatoAtual, senha: d.senha });
        if (j.ok) { sucessoLogin(j); return; }
        if (j.erro === 'pendente') { etapa = 'confirmar'; destino = j.destino || ''; msgOk = j.mensagem || ''; iniciaEspera(); } else msg = j.mensagem || 'Não foi possível entrar.';
      } else if (t === 'esqueci') {
        contatoAtual = (d.contato || '').trim(); const j = await chamar('esqueci', { contato: contatoAtual });
        if (j.ok) { etapa = 'redefinir'; destino = ''; } else msg = j.mensagem || 'Não foi possível enviar o código.';
      } else if (t === 'redefinir') {
        const j = await chamar('redefinir', { contato: contatoAtual, codigo: d.codigo, senha: d.senha });
        if (j.ok) { sucessoLogin(j); return; } msg = j.mensagem || 'Não foi possível redefinir a senha.';
      } else if (t === 'excluir') {
        const j = await chamar('excluir', { senha: d.senha });
        if (j.ok) { sessaoExpirou(); etapa = 'form'; aba = 'criar'; msgOk = 'Sua conta foi excluída.'; pinta(); mudou(); ocupado = false; return; } msg = j.mensagem || 'Não foi possível excluir.';
      }
    } finally { ocupado = false; }
    if (antes !== etapa + '|' + aba + '|' + CONTA.logado) pinta();   // mudou de etapa: redesenha; erro: só troca o aviso (não apaga o que a pessoa digitou)
    else { const av = f.querySelector('.ct-av'); if (av) av.innerHTML = avisoIn(); if (btn) btn.disabled = false; }
  });
  pinta();
  carregarConta().then(() => { pinta(); mudou(); });
  return { atualizar: () => { pinta(); mudou(); }, mostrarLogin: m => { etapa = 'form'; aba = 'entrar'; msg = m || ''; pinta(); } };
}
