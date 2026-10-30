// Deputado federal e estadual, 1º turno de 2026 (data/dep_1t/*.json, scripts/dep1t.mjs): por estado, em lista, com filtro por partido.
import { UF_NOME, fInt, fNum } from './util.js?v=2e93d5d9';
import { esc, tabela, sem } from './ui.js?v=2e93d5d9';
import { getJSON } from './tse.js?v=2e93d5d9';
import { nomeP } from './governador.js?v=2e93d5d9';

const ARQ = { depf: ['federal', 'Deputado Federal', 'Deputados federais'], depe: ['estadual', 'Deputado Estadual', 'Deputados estaduais'] };
const cache = {};
export const carregarDep = tipo => (cache[tipo] ??= getJSON(`data/dep_1t/${ARQ[tipo][0]}.json`, { retries: 2 }));
const todos = g => g.grupos.flatMap(x => x.cand.map(c => ({ ...c, sg: x.sg })));
const eleitosN = g => g.grupos.reduce((a, x) => a + x.cand.filter(c => c.e).length, 0);
const qs = () => new URLSearchParams(location.hash.split('?')[1] || '');

export function viewDepBrasil(ctx, tipo) {
  const [, cargo, plural] = ARQ[tipo];
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${esc(cargo)} · TSE</div><section class="painel"><h2>${plural} · 1º turno</h2><p class="sub">Escolha um estado para ver todos os candidatos e filtrar por partido.</p><div id="tab-dep"><p class="carregando">Carregando…</p></div></section>`;
  return { html, titulo: `Brasil — ${cargo}`, montar(root) {
    carregarDep(tipo).then(D => {
      const rows = Object.entries(D.uf).map(([u, g]) => { const t = todos(g).sort((a, b) => b.v - a.v)[0]; return { id: u, nome: UF_NOME[u], n: eleitosN(g), nc: todos(g).length, t, vv: g.vv }; });
      const cols = [
        { k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' },
        { k: 'n', t: 'Eleitos', h: x => fInt(x.n), v: x => x.n, cls: 'n' },
        { k: 't', t: 'Mais votado', h: x => x.t ? `<b>${esc(nomeP(x.t.nm))}</b> <small>${esc(x.t.sg)}</small><small class="vt">${fInt(x.t.v)} votos</small>` : '', v: x => x.t?.v ?? 0, x: x => x.t?.nm || '' },
        { k: 'nc', t: 'Candidatos', h: x => fInt(x.nc), v: x => x.nc, cls: 'n sec' },
      ];
      tabela(root.querySelector('#tab-dep'), { cols, rows, onRow: x => ctx.ir(`#/t1/uf/${x.id}?cargo=${tipo}`), sort: 'nome', dir: 'asc' });
    }).catch(() => { root.querySelector('#tab-dep').innerHTML = '<p class="aviso">Dados ainda indisponíveis. Tente de novo em instantes.</p>'; });
  } };
}

export function viewDepUf(ctx, uf, tipo) {
  const [, cargo, plural] = ARQ[tipo], nomeUf = UF_NOME[uf] || uf.toUpperCase(), P = qs().get('p') || '';
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${esc(cargo)} · ${esc(nomeUf)} · TSE</div><div id="dep-corpo"><p class="carregando">Carregando…</p></div>`;
  return { html, titulo: `${nomeUf} — ${cargo}`, trilha: [['Brasil', `#/t1?cargo=${tipo}`], [nomeUf]], montar(root) {
    carregarDep(tipo).then(D => {
      const g = D.uf[uf], el = root.querySelector('#dep-corpo');
      if (!g) { el.innerHTML = `<div class="aviso">Sem dados de ${esc(cargo.toLowerCase())} para este estado.</div>`; return; }
      const lista = todos(g).sort((a, b) => b.v - a.v), vv = g.vv || lista.reduce((a, c) => a + c.v, 0);
      const pos = new Map(lista.map((c, i) => [c.sq ?? c.n + c.sg, i + 1]));
      const partidos = g.grupos.map(x => ({ sg: x.sg, n: x.cand.filter(c => c.e).length, v: x.cand.reduce((a, c) => a + c.v, 0) + x.leg })).sort((a, b) => b.n - a.n || b.v - a.v);
      const chips = [`<a class="chip-p${P ? '' : ' on'}" href="#/t1/uf/${uf}?cargo=${tipo}">Todos</a>`, ...partidos.map(p => `<a class="chip-p${p.sg === P ? ' on' : ''}" href="#/t1/uf/${uf}?cargo=${tipo}&p=${encodeURIComponent(p.sg)}">${esc(p.sg)} <small>${p.n}</small></a>`)].join('');
      const rows = lista.filter(c => !P || c.sg === P).map(c => ({ ...c, pos: pos.get(c.sq ?? c.n + c.sg), pc: vv ? 100 * c.v / vv : 0 }));
      const nEle = eleitosN(g), pSel = partidos.find(p => p.sg === P);
      el.innerHTML = `<section class="painel resumo"><div class="centro-t">${esc(nomeUf)} · ${esc(cargo)} · 1º turno</div><div class="resumo-t"><span><b>${fInt(nEle)}</b> eleitos · <b>${fInt(lista.length)}</b> candidatos</span><span>${fInt(vv)} votos válidos</span></div></section>
      <section class="painel"><h2>Filtrar por partido</h2><p class="sub">O número ao lado da sigla é a quantidade de eleitos do partido.</p><div class="chips-p sem-export">${chips}</div></section>
      <section class="painel"><h2>${P ? `${esc(P)}: ${rows.length} candidatos${pSel ? ` · ${pSel.n} eleitos` : ''}` : 'Todos os candidatos'}</h2><p class="sub">Ordenados por votos. Clique nos títulos para reordenar.</p><div id="tab-dc"></div></section>`;
      const cols = [
        { k: 'pos', t: '#', h: x => `${x.pos}º`, v: x => x.pos, cls: 'n' },
        { k: 'nm', t: 'Candidato', h: x => `<b>${esc(nomeP(x.nm))}</b> <small>${esc(x.sg)} · ${esc(x.n)}</small>${x.e ? ' <span class="gv-sel">Eleito(a)</span>' : ''}`, v: x => x.nm, x: x => x.nm },
        { k: 'v', t: 'Votos', h: x => fInt(x.v), v: x => x.v, cls: 'n' },
        { k: 'pc', t: '%', h: x => fNum(x.pc, 2) + '%', v: x => x.pc, x: x => x.pc, cls: 'n sec' },
      ];
      tabela(el.querySelector('#tab-dc'), { cols, rows, sort: 'pos', dir: 'asc', filtro: (x, q) => sem(x.nm).includes(q), limite: 300 });
      ctx.csv = () => ({ nome: `${uf}_${tipo}_1turno`, cab: ['Posição', 'Candidato', 'Partido', 'Número', 'Votos', '% votos válidos', 'Situação'], linhas: rows.map(x => [x.pos, x.nm, x.sg, x.n, x.v, x.pc.toFixed(2), x.st]) });
    }).catch(() => { root.querySelector('#dep-corpo').innerHTML = '<p class="aviso">Dados ainda indisponíveis. Tente de novo em instantes.</p>'; });
  } };
}
