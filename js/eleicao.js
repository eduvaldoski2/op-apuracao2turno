// Seletor "Eleição" (ano · turno · cargo) das telas de resultado.
// Mostra o que o painel já tem em tela: 2026, presidente (1º e 2º turno) e governador (1º turno, por estado).
// O resto aparece esmaecido ("em breve"). Só o presidente de 2026 é aberto: os demais cargos e anos exigem cadastro (conta gratuita).
import { CONTA, carregarConta, montarConta, sairConta } from './conta.js?v=c995c959';
import { esc } from './ui.js?v=c995c959';

const ANOS = [2026, 2024, 2022, 2020, 2018];
const DISPONIVEL = { 2026: true, 2024: true, 2022: true, 2020: true, 2018: true };
const PADRAO_ANO = { 2024: 'c11t1', 2022: 'c1t1', 2020: 'c11t1', 2018: 'c1t1' };   // eleição aberta ao trocar de ano (dados no branch hist-<ano>)
const CARGOS = [
  { k: 'presidente', nome: 'Presidente' },
  { k: 'governador', nome: 'Governador', cadastro: true },
  { k: 'senador', nome: 'Senador', cadastro: true },
  { k: 'dep-federal', nome: 'Dep. Federal', cadastro: true },
  { k: 'dep-estadual', nome: 'Dep. Estadual', cadastro: true },
];
export const telasComSeletor = r => ['ap', 't1'].includes(r.modo) && !['comparar', 'perguntar', 'criterios'].includes(r.tela);

const qs = () => new URLSearchParams(location.hash.split('?')[1] || '');
export function estadoEleicao(r) {
  const turno = r.modo === 't1' ? 1 : 2, c = qs().get('cargo'), cargo = c === 'gov' ? 'governador' : c === 'sen' ? 'senador' : c === 'depf' ? 'dep-federal' : c === 'depe' ? 'dep-estadual' : 'presidente';
  return { ano: 2026, turno, cargo };
}
// caminho da tela atual, sem o prefixo do modo
function caminho(r) {
  switch (r.tela) {
    case 'uf': return `uf/${r.uf}`;
    case 'mun': return `mun/${r.uf}/${r.cd}`;
    case 'distrito': return `mun/${r.uf}/${r.cd}/d/${r.di}`;
    case 'bairro': return r.di !== undefined ? `mun/${r.uf}/${r.cd}/d/${r.di}/b/${r.chave}` : `mun/${r.uf}/${r.cd}/b/${r.chave}`;
    case 'local': return `mun/${r.uf}/${r.cd}/l/${encodeURIComponent(r.id)}`;
    default: return '';
  }
}
export function hashEleicao(r, turno, cargo = 'presidente') {
  const c = caminho(r);
  if (cargo === 'dep-federal' || cargo === 'dep-estadual') return '#/t1' + (r.uf ? `/uf/${r.uf}` : '') + (cargo === 'dep-federal' ? '?cargo=depf' : '?cargo=depe');
  if (cargo === 'governador' || cargo === 'senador') return '#/h/2026/' + (cargo === 'senador' ? 'c5t1' : 'c3t1') + (r.uf ? `/uf/${r.uf}` : '');
  return turno === 1 ? '#/t1' + (c ? '/' + c : '') : '#/' + c;
}

const chip = (attrs, txt, { on, off, lock, tit } = {}) =>
  `<button type="button" class="${on ? 'on' : ''}${off ? ' off' : ''}" ${attrs}${off ? ' aria-disabled="true"' : ''}${tit ? ` title="${esc(tit)}"` : ''}>${lock ? '🔒 ' : ''}${txt}</button>`;

export function barraEleicao(r) {
  if (!telasComSeletor(r)) return '';
  const e = estadoEleicao(r), cargoNome = CARGOS.find(c => c.k === e.cargo).nome;
  const anos = ANOS.map(a => chip(`data-ano="${a}"`, a, { on: a === e.ano, off: !DISPONIVEL[a], lock: a !== 2026 && !CONTA.logado, tit: a === 2026 ? '' : 'Disponível com cadastro gratuito' })).join('');
  const turnos = [1, 2].map(t => chip(`data-turno="${t}"`, `${t}º`, { on: t === e.turno, off: e.cargo !== 'presidente' && t === 2, tit: e.cargo === 'governador' && t === 2 ? 'Governador: por enquanto só o 1º turno' : e.cargo === 'senador' && t === 2 ? 'Senador: eleito no 1º turno (não há 2º turno)' : '' })).join('');
  const cargos = CARGOS.map(c => chip(`data-cargo="${c.k}"`, c.nome, { on: c.k === e.cargo, off: !!c.breve, lock: c.cadastro && !CONTA.logado, tit: c.breve ? 'Em breve' : c.cadastro && !CONTA.logado ? 'Disponível com cadastro gratuito' : '' })).join('');
  return `<details class="eleicao sem-export"><summary><span class="p">${e.ano}</span><span class="p">${e.turno}º turno</span><span class="p">${cargoNome}</span><i>Alterar ▾</i></summary>
    <div class="fx"><div class="l"><small>Ano</small><div class="ch">${anos}</div></div>
    <div class="l"><small>Turno</small><div class="sg">${turnos}</div></div>
    <div class="l"><small>Cargo</small><div class="ch">${cargos}</div></div>
    <p class="el-nota">Anos anteriores, governador e senador vão até a seção eleitoral (com cadastro gratuito).</p></div></details>`;
}

// ---------- cadastro para os cargos de deputado ----------
function abrirCadastro(cargoNome, { toast }) {
  const ov = document.createElement('div'); ov.className = 'el-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Cadastro para ver ' + cargoNome);
  ov.innerHTML = `<div class="el-box"><button class="el-x" type="button" aria-label="Fechar">✕</button>
    <h2>Dados de ${esc(cargoNome)}: acesso com cadastro</h2>
    <p>O resultado de presidente é aberto. Os demais cargos e anos são liberados para quem tem conta gratuita na Oficina Política. Crie a sua (ou entre) para continuar.</p><div id="el-conta"></div></div>`;
  document.body.appendChild(ov);
  const fechar = () => { ov.remove(); document.removeEventListener('keydown', esc_); };
  const esc_ = ev => { if (ev.key === 'Escape') fechar(); };
  document.addEventListener('keydown', esc_);
  ov.addEventListener('click', ev => { if (ev.target === ov || ev.target.closest('.el-x')) fechar(); });
  carregarConta().then(() => {
    if (!ov.isConnected) return;
    if (CONTA.logado) { fechar(); avisoLogado(cargoNome, toast); return; }
    montarConta(ov.querySelector('#el-conta'), c => { if (c.logado) { fechar(); avisarConta(); avisoLogado(cargoNome, toast); } }, { alvo: `os resultados de ${cargoNome}` });
  });
}
let irPara = null;
const avisoLogado = (nome, toast) => { if (irPara) irPara(); else toast(`Cadastro confirmado. Abrindo ${nome}.`, true); };

export function ligarEleicao(root, r, { ir, toast, evento }) {
  const el = root.querySelector('.eleicao'); if (!el) return;
  const e = estadoEleicao(r);
  carregarConta().then(() => { if (!CONTA.logado) return; el.querySelectorAll('[data-cargo], [data-ano]').forEach(b => { b.textContent = b.textContent.replace('🔒 ', ''); b.title = ''; }); });
  el.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.ano) { const a = +b.dataset.ano; if (a === 2026) return; evento?.('eleicao', { ano: a }); irPara = () => ir(`#/h/${a}/${PADRAO_ANO[a]}`); if (CONTA.logado) { irPara(); return; } abrirCadastro(`Eleições de ${a}`, { toast }); return; }
    if (b.dataset.turno) { const t = +b.dataset.turno; if (b.classList.contains('off') || t === e.turno) return; evento?.('eleicao', { turno: t }); ir(hashEleicao(r, t, 'presidente')); return; }
    const k = b.dataset.cargo; if (!k) return;
    if (k === e.cargo) return;
    const c = CARGOS.find(x => x.k === k);
    if (c.breve) { toast(`${c.nome}: em breve no painel.`, true); return; }
    if (c.cadastro) { evento?.('eleicao_cadastro', { cargo: k }); irPara = () => ir(hashEleicao(r, 1, k)); if (CONTA.logado) { avisoLogado(c.nome, toast); return; } abrirCadastro(c.nome, { toast }); return; }
    evento?.('eleicao', { cargo: k }); ir(hashEleicao(r, e.turno, k));
    if (k === 'governador' || k === 'senador') setTimeout(() => document.querySelector(k === 'senador' ? '.sen' + ', .sen-t1' : '.gov:not(.sen), .gov-t1:not(.sen-t1)')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 700);
  });
}

// ---------- Entrar / Sair no topo ----------
function abrirLogin(toast, depois) {
  const ov = document.createElement('div'); ov.className = 'el-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Entrar na Oficina Política');
  ov.innerHTML = `<div class="el-box"><button class="el-x" type="button" aria-label="Fechar">✕</button><h2>Entrar na Oficina Política</h2><p>Entre com o Google ou com o seu e-mail. Quem ainda não tem conta cria uma, grátis.</p><div id="el-conta"></div></div>`;
  document.body.appendChild(ov);
  const fechar = () => { ov.remove(); document.removeEventListener('keydown', esc_); };
  const esc_ = ev => { if (ev.key === 'Escape') fechar(); };
  document.addEventListener('keydown', esc_);
  ov.addEventListener('click', ev => { if (ev.target === ov || ev.target.closest('.el-x')) fechar(); });
  carregarConta().then(() => { if (!ov.isConnected) return; if (CONTA.logado) { fechar(); depois(); return; } montarConta(ov.querySelector('#el-conta'), c => { if (c.logado) { fechar(); depois(); } }, { alvo: 'a sua conta' }); });
}
export function ligarTopoConta({ toast }) {
  const topo = document.querySelector('.topo-in'); if (!topo) return;
  const box = document.createElement('div'); box.className = 'topo-conta sem-export'; topo.appendChild(box);
  const pinta = () => {
    if (!CONTA.carregado || CONTA.erro) { box.innerHTML = ''; return; }
    box.innerHTML = CONTA.logado ? `<button type="button" class="tc-b" data-tc="sair" title="${esc(CONTA.usuario?.email || '')}">Sair</button>` : `<button type="button" class="tc-b tc-on" data-tc="entrar">Entrar</button>`;
  };
  box.addEventListener('click', async ev => {
    const b = ev.target.closest('[data-tc]'); if (!b) return;
    if (b.dataset.tc === 'sair') { await sairConta(); pinta(); avisarConta(); toast('Você saiu da sua conta.', true); return; }
    abrirLogin(toast, () => { pinta(); avisarConta(); toast('Você está logado.', true); });
  });
  // botões "Entrar" dos blocos e telas que exigem cadastro
  document.addEventListener('click', ev => {
    const b = ev.target.closest('[data-so-conta]'); if (!b) return;
    ev.preventDefault(); abrirLogin(toast, () => { pinta(); avisarConta(); toast('Acesso liberado.', true); });
  });
  carregarConta().then(() => { pinta(); marcarLogado(); });
}

// ---------- conteúdo que exige cadastro (tudo menos o presidente de 2026) ----------
// A classe "logado" no <html> mostra o conteúdo; sem ela, o bloco vira um convite para entrar.
export function marcarLogado() { document.documentElement.classList.toggle('logado', !!CONTA.logado); }
export function avisarConta() { marcarLogado(); window.dispatchEvent(new Event('op-conta')); }
const convite = nome => `<div class="so-conta-av sem-export"><b>🔒 ${esc(nome)}</b><span>Disponível com cadastro gratuito. O resultado de presidente continua aberto.</span><button type="button" class="btn" data-so-conta>Entrar ou criar conta</button></div>`;
export const soConta = (html, nome) => html ? `<div class="so-conta"><div class="so-conta-in">${html}</div>${convite(nome)}</div>` : '';
// rota inteira que exige cadastro (cargo diferente de presidente ou ano anterior)
export function rotaExigeConta() { if (/^#\/h\//.test(location.hash)) return true; const q = qs(), c = q.get('cargo'), a = q.get('ano'); return ['gov', 'sen', 'depf', 'depe'].includes(c) || (a && a !== '2026'); }
export function nomeRotaConta() { const q = qs(), c = q.get('cargo'), a = q.get('ano'); const n = { gov: 'Governador', sen: 'Senador', depf: 'Deputado federal', depe: 'Deputado estadual' }[c] || 'Esta eleição'; return a && a !== '2026' ? `${n} ${a}` : n; }
export const telaConta = nome => `<section class="painel so-conta-tela">${convite(nome)}</section>`;
