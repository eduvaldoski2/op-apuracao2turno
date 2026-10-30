// Seletor "Eleição" (ano · turno · cargo) das telas de resultado.
// Mostra o que o painel já tem em tela: 2026, presidente (1º e 2º turno) e governador (1º turno, por estado).
// O resto aparece esmaecido ("em breve"). Deputados federal e estadual exigem cadastro (conta gratuita).
import { CONTA, carregarConta, montarConta } from './conta.js?v=e7b28838';
import { esc } from './ui.js?v=e7b28838';

const ANOS = [2026, 2024, 2022, 2020, 2018];
const DISPONIVEL = { 2026: true };
const CARGOS = [
  { k: 'presidente', nome: 'Presidente' },
  { k: 'governador', nome: 'Governador' },
  { k: 'senador', nome: 'Senador' },
  { k: 'dep-federal', nome: 'Dep. Federal', cadastro: true },
  { k: 'dep-estadual', nome: 'Dep. Estadual', cadastro: true },
];
export const telasComSeletor = r => ['ap', 't1'].includes(r.modo) && !['comparar', 'perguntar', 'criterios'].includes(r.tela);

const qs = () => new URLSearchParams(location.hash.split('?')[1] || '');
export function estadoEleicao(r) {
  const turno = r.modo === 't1' ? 1 : 2, c = qs().get('cargo'), cargo = c === 'gov' ? 'governador' : c === 'sen' ? 'senador' : 'presidente';
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
  if (cargo === 'governador' || cargo === 'senador') return '#/t1' + (r.uf ? `/uf/${r.uf}` : '') + (cargo === 'senador' ? '?cargo=sen' : '?cargo=gov');
  return turno === 1 ? '#/t1' + (c ? '/' + c : '') : '#/' + c;
}

const chip = (attrs, txt, { on, off, lock, tit } = {}) =>
  `<button type="button" class="${on ? 'on' : ''}${off ? ' off' : ''}" ${attrs}${off ? ' aria-disabled="true"' : ''}${tit ? ` title="${esc(tit)}"` : ''}>${lock ? '🔒 ' : ''}${txt}</button>`;

export function barraEleicao(r) {
  if (!telasComSeletor(r)) return '';
  const e = estadoEleicao(r), cargoNome = CARGOS.find(c => c.k === e.cargo).nome;
  const anos = ANOS.map(a => chip(`data-ano="${a}"`, a, { on: a === e.ano, off: !DISPONIVEL[a], tit: DISPONIVEL[a] ? '' : 'Em breve: já temos os dados, falta levá-los ao painel' })).join('');
  const turnos = [1, 2].map(t => chip(`data-turno="${t}"`, `${t}º`, { on: t === e.turno, off: e.cargo !== 'presidente' && t === 2, tit: e.cargo === 'governador' && t === 2 ? 'Governador: por enquanto só o 1º turno' : e.cargo === 'senador' && t === 2 ? 'Senador: eleito no 1º turno (não há 2º turno)' : '' })).join('');
  const cargos = CARGOS.map(c => chip(`data-cargo="${c.k}"`, c.nome, { on: c.k === e.cargo, off: !!c.breve, lock: c.cadastro && !CONTA.logado, tit: c.breve ? 'Em breve' : c.cadastro && !CONTA.logado ? 'Disponível com cadastro gratuito' : '' })).join('');
  return `<details class="eleicao sem-export"><summary><span class="p">${e.ano}</span><span class="p">${e.turno}º turno</span><span class="p">${cargoNome}</span><i>Alterar ▾</i></summary>
    <div class="fx"><div class="l"><small>Ano</small><div class="ch">${anos}</div></div>
    <div class="l"><small>Turno</small><div class="sg">${turnos}</div></div>
    <div class="l"><small>Cargo</small><div class="ch">${cargos}</div></div>
    <p class="el-nota">Em breve: anos anteriores, deputados e eleições municipais.</p></div></details>`;
}

// ---------- cadastro para os cargos de deputado ----------
function abrirCadastro(cargoNome, { toast }) {
  const ov = document.createElement('div'); ov.className = 'el-ov'; ov.setAttribute('role', 'dialog'); ov.setAttribute('aria-modal', 'true'); ov.setAttribute('aria-label', 'Cadastro para ver deputados');
  ov.innerHTML = `<div class="el-box"><button class="el-x" type="button" aria-label="Fechar">✕</button>
    <h2>Dados de ${esc(cargoNome)}: acesso com cadastro</h2>
    <p>Os resultados de deputados são liberados para quem tem conta gratuita na Oficina Política. Crie a sua (ou entre) para continuar.</p><div id="el-conta"></div></div>`;
  document.body.appendChild(ov);
  const fechar = () => { ov.remove(); document.removeEventListener('keydown', esc_); };
  const esc_ = ev => { if (ev.key === 'Escape') fechar(); };
  document.addEventListener('keydown', esc_);
  ov.addEventListener('click', ev => { if (ev.target === ov || ev.target.closest('.el-x')) fechar(); });
  carregarConta().then(() => {
    if (!ov.isConnected) return;
    if (CONTA.logado) { fechar(); avisoLogado(cargoNome, toast); return; }
    montarConta(ov.querySelector('#el-conta'), c => { if (c.logado) { fechar(); document.querySelectorAll('.eleicao [data-cargo^="dep-"]').forEach(b => { b.textContent = b.textContent.replace('🔒 ', ''); }); avisoLogado(cargoNome, toast); } }, { alvo: `os resultados de ${cargoNome}` });
  });
}
const avisoLogado = (nome, toast) => toast(`Cadastro confirmado. Os dados de ${nome} por município, bairro e local de votação estão em preparação e serão liberados aqui.`, true);

export function ligarEleicao(root, r, { ir, toast, evento }) {
  const el = root.querySelector('.eleicao'); if (!el) return;
  const e = estadoEleicao(r);
  carregarConta().then(() => { if (!CONTA.logado) return; el.querySelectorAll('[data-cargo^="dep-"]').forEach(b => { b.textContent = b.textContent.replace('🔒 ', ''); b.title = ''; }); });
  el.addEventListener('click', ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.ano) { if (b.classList.contains('off')) toast('Esse ano ainda não está no painel: já temos os dados e vamos liberá-los em breve.', true); return; }
    if (b.dataset.turno) { const t = +b.dataset.turno; if (b.classList.contains('off') || t === e.turno) return; evento?.('eleicao', { turno: t }); ir(hashEleicao(r, t, 'presidente')); return; }
    const k = b.dataset.cargo; if (!k) return;
    if (k === e.cargo) return;
    const c = CARGOS.find(x => x.k === k);
    if (c.breve) { toast(`${c.nome}: em breve no painel.`, true); return; }
    if (c.cadastro) { evento?.('eleicao_cadastro', { cargo: k }); if (CONTA.logado) { avisoLogado(c.nome, toast); return; } abrirCadastro(c.nome, { toast }); return; }
    evento?.('eleicao', { cargo: k }); ir(hashEleicao(r, e.turno, k));
    if (k === 'governador' || k === 'senador') setTimeout(() => document.querySelector(k === 'senador' ? '.sen' + ', .sen-t1' : '.gov:not(.sen), .gov-t1:not(.sen-t1)')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 700);
  });
}
