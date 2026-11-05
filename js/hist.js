// Eleições anteriores (2018–2024) e cargos de 2026 além do presidente, com a descida completa:
// Brasil > Estado > Região do estado > Município > Região/distrito do município > Bairro > Local de votação > Seção.
// Dados: branch hist-<ano> do repositório (scripts/hist/build_hist.py, a partir do lake do TSE por seção).
// Rotas: #/h/<ano>/<eleição>[/uf/<uf>[/r/<i> | /m/<cd>[/d/<i> | /b/<bairro> | /l/<zona-local> | /s/<zona-seção>]]]
import { CONFIG } from './config.js?v=f66fb7c7';
import { UF_NOME, UFS, fInt, fNum } from './util.js?v=f66fb7c7';
import { esc, tabela, sem } from './ui.js?v=f66fb7c7';
import { getJSON } from './tse.js?v=f66fb7c7';
import { corPartido, corTextoSobre } from './partidos.js?v=f66fb7c7';
import { criarMapa } from './map.js?v=f66fb7c7';
import { criarMapaMun } from './mapamun.js?v=f66fb7c7';
import { criarMapaPontos } from './mapapontos.js?v=f66fb7c7';

export const ANOS_HIST = [2026, 2024, 2022, 2020, 2018];
const BASE = ano => `https://raw.githubusercontent.com/${CONFIG.repo}/hist-${ano}/`;
const cache = new Map();
const pega = (url, op = {}) => { if (!cache.has(url)) cache.set(url, getJSON(url, { retries: 2, timeout: 60000, ...op }).catch(e => { cache.delete(url); throw e; })); return cache.get(url); };
export const idxAno = ano => pega(BASE(ano) + 'idx.json');
const arq = (ano, rel) => pega(BASE(ano) + rel);
const pc = (a, b) => (b > 0 ? 100 * a / b : NaN);
const bonito = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());
const nomeUf = uf => UF_NOME[uf] || uf.toUpperCase();
const sgTxt = s => String(s || '').replace('PC do B', 'PCdoB');
const situ = st => { const s = String(st || ''); if (/^ELEITO/.test(s)) return '<span class="h-sel">Eleito</span>'; if (/2º TURNO/.test(s)) return '<span class="h-sel h-2t">2º turno</span>'; if (/SUPLENTE/.test(s)) return '<small class="h-sit">suplente</small>'; return ''; };
const chipP = sg => { const c = corPartido(sg); return `<span class="h-p" style="background:${c};color:${corTextoSobre(c)}">${esc(sgTxt(sg))}</span>`; };

// ---------- rota ----------
export function rotaHist(p) {
  const r = { ano: +p[0], id: p[1] || '', nivel: 'br' };
  let i = 2;
  if (p[i] === 'uf' && p[i + 1]) { r.uf = p[i + 1]; r.nivel = 'uf'; i += 2; }
  if (r.uf && p[i] === 'r' && p[i + 1] != null) { r.reg = +p[i + 1]; r.nivel = 'reg'; }
  if (r.uf && p[i] === 'm' && p[i + 1]) {
    r.cd = p[i + 1]; r.nivel = 'mun'; i += 2;
    if (p[i] === 'd' && p[i + 1] != null) { r.di = +p[i + 1]; r.nivel = 'dist'; i += 2; }
    if (p[i] === 'b' && p[i + 1]) { r.bairro = decodeURIComponent(p[i + 1]); r.nivel = 'bairro'; i += 2; }
    if (p[i] === 'l' && p[i + 1]) { r.local = decodeURIComponent(p[i + 1]); r.nivel = 'local'; i += 2; }
    if (p[i] === 's' && p[i + 1]) { r.secao = decodeURIComponent(p[i + 1]); r.nivel = 'secao'; }
  }
  return r;
}
const H = (r, extra = '') => `#/h/${r.ano}/${r.id}${extra}`;
const hUf = (r, uf) => H(r, `/uf/${uf}`);
const hMun = (r, uf, cd) => H(r, `/uf/${uf}/m/${cd}`);

// ---------- unidades (linhas do arquivo) ----------
// majoritário: [aptos, comp, brancos, nulos, v0..vn]; proporcional: [aptos, comp, brancos, nulos, [por partido], [[cand, v] top]]
function novaU(n) { return { ap: 0, c: 0, br: 0, nu: 0, v: new Array(n).fill(0), cv: new Map(), ns: 0 }; }
function somaLinha(u, l, prop) {
  u.ap += l[0]; u.c += l[1]; u.br += l[2]; u.nu += l[3]; u.ns++;
  if (prop) { const pv = l[4] || []; for (let i = 0; i < pv.length; i++) u.v[i] += pv[i]; for (const [ci, v] of (l[5] || [])) u.cv.set(ci, (u.cv.get(ci) || 0) + v); }
  else for (let i = 4; i < l.length; i++) u.v[i - 4] += l[i];
  return u;
}
function fecha(u) {
  u.vv = u.v.reduce((a, b) => a + b, 0); u.p = u.v.map(x => pc(x, u.vv)); u.lid = -1;
  u.v.forEach((x, i) => { if (x > 0 && (u.lid < 0 || x > u.v[u.lid])) u.lid = i; });
  u.pAb = pc(u.ap - u.c, u.ap); u.pBr = pc(u.br, u.c); u.pNu = pc(u.nu, u.c);
  return u;
}
const unidade = (linhas, n, prop) => { const u = novaU(n); for (const l of linhas) somaLinha(u, l, prop); return fecha(u); };

// ---------- contexto de dados de uma eleição ----------
async function carregaEleicao(r) {
  const idx = await idxAno(r.ano), el = idx.el.find(e => e.id === r.id) || idx.el[0];
  if (!el) throw new Error('eleição não encontrada');
  r.id = el.id;
  return { idx, el, prop: el.prop, ab: el.ab, mun: el.ab === 'MUN' };
}
// itens votados de um arquivo (candidatos no majoritário, partidos no proporcional)
const itens = (E, d) => (E.prop ? d.par : d.cands) || [];
const corItem = (E, it) => corPartido(it?.sg);
const nomeItem = (E, it) => E.prop ? sgTxt(it.sg) : bonito(it.nm);

// ---------- regiões do estado ----------
async function regioesUf(ctx, uf) {
  const def = await getJSON(`data/regioes/uf-${uf}.json`, { retries: 1 }).catch(() => null);
  if (!def) return null;
  const bm = ctx.B?.byUf?.[uf] || [], porNome = new Map(bm.map(b => [sem(b.nome), b.cd]));
  const regs = Object.entries(def.regioes).map(([nome, muns]) => ({ nome, cds: muns.map(n => porNome.get(sem(n))).filter(Boolean) }));
  return { titulo: def.divisao || 'Regiões', fonte: def.fonte, url: def.url, regs };
}

// ---------- blocos de interface ----------
function kpis(u, rot = 'seções') {
  return `<div class="kpis k4"><div class="kpi"><div class="kpi-t">Eleitores aptos</div><div class="kpi-v">${fInt(u.ap)}</div><div class="kpi-s">${rot ? `${fInt(u.ns)} ${rot}` : '&nbsp;'}</div></div>
    <div class="kpi"><div class="kpi-t">Comparecimento</div><div class="kpi-v">${fNum(pc(u.c, u.ap), 1)}%</div><div class="kpi-s">${fInt(u.c)} eleitores</div></div>
    <div class="kpi"><div class="kpi-t">Abstenção</div><div class="kpi-v">${fNum(u.pAb, 1)}%</div><div class="kpi-s">${fInt(u.ap - u.c)}</div></div>
    <div class="kpi"><div class="kpi-t">Brancos e nulos</div><div class="kpi-v">${fNum(pc(u.br + u.nu, u.c), 1)}%</div><div class="kpi-s">${fInt(u.br)} brancos · ${fInt(u.nu)} nulos</div></div></div>`;
}
// barras de candidatos (majoritário) ou partidos (proporcional)
function barras(E, its, u, { max = 12, titulo } = {}) {
  const ord = u.v.map((x, i) => i).filter(i => u.v[i] > 0).sort((a, b) => u.v[b] - u.v[a]).slice(0, max);
  const lin = ord.map((i, k) => { const it = its[i] || {}, cor = corItem(E, it);
    return `<div class="h-bar"><div class="h-bar-t"><b>${k + 1}º</b> <span class="h-bar-n">${esc(nomeItem(E, it))}</span> ${E.prop ? (it.fed ? `<small class="h-sit">Federação ${esc(sgTxt(String(it.fed).replace(/\b\d+-/g, '')))}</small>` : '') : chipP(it.sg)} ${E.prop ? '' : situ(it.st)}<span class="h-bar-v"><b>${fNum(u.p[i], 2)}%</b> <small>${fInt(u.v[i])}</small></span></div><div class="h-bar-f"><i style="width:${Math.max(0.5, u.p[i])}%;background:${cor}"></i></div></div>`; }).join('');
  return `<section class="painel"><h2>${titulo || (E.prop ? 'Votos por partido' : 'Candidatos')}</h2><p class="sub">${E.prop ? 'Votos nominais dos candidatos do partido mais votos de legenda' : 'Percentual dos votos válidos'}.</p>${lin || '<p class="sub">Sem votos registrados.</p>'}</section>`;
}
// mais votados (proporcional): lista de candidatos com votos
function maisVotados(cands, cvMap, { titulo = 'Candidatos mais votados', n = 30, aprox = false } = {}) {
  const ord = [...cvMap].sort((a, b) => b[1] - a[1]).slice(0, n);
  if (!ord.length) return '';
  return `<section class="painel"><h2>${titulo}</h2>${aprox ? '<p class="sub">Soma dos 10 mais votados de cada seção (candidatos com poucos votos por seção podem não aparecer).</p>' : ''}<ol class="h-rank">${ord.map(([ci, v]) => { const c = cands[ci] || {}; return `<li><span class="h-rank-n">${esc(bonito(c.nm))}</span> ${chipP(c.sg)} ${situ(c.st)}<b>${fInt(v)}</b></li>`; }).join('')}</ol></section>`;
}
const lidCel = (E, its, u) => u.lid >= 0 ? `<span class="h-lid" style="--c:${corItem(E, its[u.lid])}"><i></i>${esc(nomeItem(E, its[u.lid]))}</span>` : '–';
// colunas de tabela com o líder e os principais
function colsUnid(E, its, uTot, nomeCol) {
  const top = uTot.v.map((x, i) => i).filter(i => uTot.v[i] > 0).sort((a, b) => uTot.v[b] - uTot.v[a]).slice(0, E.prop ? 4 : 3);
  return [nomeCol,
    { k: 'lid', t: E.prop ? 'Partido mais votado' : 'Mais votado', h: x => lidCel(E, its, x.u), v: x => x.u.lid >= 0 ? nomeItem(E, its[x.u.lid]) : '' },
    ...top.map(i => ({ k: 'p' + i, t: `${esc(nomeItem(E, its[i]).split(' ')[0])} %`, h: x => x.u.vv ? `<b>${fNum(x.u.p[i], 2)}%</b><small class="vt">${fInt(x.u.v[i])}</small>` : '', v: x => x.u.p[i], x: x => x.u.p[i], cls: 'n' })),
    { k: 'ap', t: 'Aptos', h: x => fInt(x.u.ap), v: x => x.u.ap, cls: 'n' },
    { k: 'ab', t: 'Abstenção', h: x => `${fNum(x.u.pAb, 1)}%`, v: x => x.u.pAb, cls: 'n' }];
}
const secMapa = (id, titulo, sub) => `<section class="painel mapa-sec"><h2>${titulo}</h2><p class="sub">${sub}</p><div id="${id}" class="h-mapa"></div><div class="h-leg"></div></section>`;
function legenda(el, E, its, us) {
  if (!el) return; const cont = new Map(); for (const u of us) if (u.lid >= 0) cont.set(u.lid, (cont.get(u.lid) || 0) + 1);
  el.innerHTML = [...cont].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([i, n]) => `<span><i style="background:${corItem(E, its[i])}"></i>${esc(nomeItem(E, its[i]))} (${n})</span>`).join('');
}
const fillU = (E, its, u) => u.lid >= 0 ? { fill: corItem(E, its[u.lid]), k: 'x', solo: true, lab: `${fNum(u.p[u.lid], 0)}%` } : { k: null };
const tipU = (E, its, nome, u) => `<b>${esc(nome)}</b>${u.lid >= 0 ? `<br>${esc(nomeItem(E, its[u.lid]))}: <b>${fNum(u.p[u.lid], 1)}%</b>` : ''}<br><span class="t-s">${fInt(u.ap)} eleitores</span>`;

// ---------- seletor de ano / cargo / turno ----------
async function seletor(r, E) {
  const anos = ANOS_HIST.map(a => `<button type="button" data-h-ano="${a}" class="${a === r.ano ? 'on' : ''}">${a}</button>`).join('');
  const cargos = [...new Map(E.idx.el.map(e => [e.c, e])).values()];
  const cg = cargos.map(e => `<button type="button" data-h-el="${e.c}" class="${e.c === E.el.c ? 'on' : ''}">${esc(e.nome)}</button>`).join('');
  const turnos = E.idx.el.filter(e => e.c === E.el.c).map(e => `<button type="button" data-h-t="${e.id}" class="${e.id === E.el.id ? 'on' : ''}">${e.t}º turno</button>`).join('');
  const pres = r.ano === 2026 && !E.idx.el.some(e => e.c === 1) ? `<button type="button" data-h-pres="1">Presidente</button>` : '';
  return `<details class="eleicao sem-export"><summary><span class="p">${r.ano}</span><span class="p">${E.el.t}º turno</span><span class="p">${esc(E.el.nome)}</span><i>Alterar ▾</i></summary>
    <div class="fx"><div class="l"><small>Ano</small><div class="ch">${anos}</div></div>
    <div class="l"><small>Cargo</small><div class="ch">${pres}${cg}</div></div>
    <div class="l"><small>Turno</small><div class="sg">${turnos}</div></div></div></details>`;
}
function ligaSeletor(root, r, E, ir) {
  const el = root.querySelector('.eleicao'); if (!el) return;
  const resto = () => { // mantém o lugar quando faz sentido
    if (!r.uf) return '';
    return location.hash.split('?')[0].replace(/^#\/h\/\d+\/[^/]+/, '');
  };
  el.addEventListener('click', async ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.hPres) { ir(r.uf ? `#/t1/uf/${r.uf}` : '#/t1'); return; }
    if (b.dataset.hAno) { const a = +b.dataset.hAno; let idx; try { idx = await idxAno(a); } catch { b.textContent = a + ' (em breve)'; return; }
      const mesmo = idx.el.find(e => e.c === E.el.c && e.t === E.el.t) || idx.el.find(e => e.c === E.el.c) || idx.el[0];
      const manter = mesmo.c === E.el.c ? resto() : (mesmo.ab === E.ab ? resto() : '');
      ir(`#/h/${a}/${mesmo.id}${a === r.ano ? resto() : manter.replace(/\/(m|r)\/.*$/, '')}`); return; }
    if (b.dataset.hEl) { const c = +b.dataset.hEl, e = E.idx.el.find(x => x.c === c && x.t === 1) || E.idx.el.find(x => x.c === c);
      const keep = r.uf ? (e.ab === 'BR' || e.ab === E.ab ? resto() : `/uf/${r.uf}`) : ''; ir(`#/h/${r.ano}/${e.id}${keep}`); return; }
    if (b.dataset.hT) ir(`#/h/${r.ano}/${b.dataset.hT}${resto()}`);
  });
}

// ---------- telas ----------
export async function viewHist(r, ctx) {
  const E = await carregaEleicao(r);
  const sel = await seletor(r, E);
  const nomeEl = `${E.el.nome} ${r.ano}${E.idx.el.some(e => e.c === E.el.c && e.t === 2) ? ` · ${E.el.t}º turno` : ''}`;
  let v;
  if (r.nivel === 'br') v = await telaBrasil(r, E, ctx, nomeEl);
  else if (r.nivel === 'uf' || r.nivel === 'reg') v = await telaUf(r, E, ctx, nomeEl);
  else v = await telaMun(r, E, ctx, nomeEl);
  const montar0 = v.montar;
  return { ...v, html: `<div class="aviso t1">Resultado <b>oficial</b> · ${esc(nomeEl)} · TSE (votação por seção)</div>${v.html}`, sel, montar(root) { ligaSeletor(root, r, E, ctx.ir); montar0?.(root); } };
}

async function telaBrasil(r, E, ctx, nomeEl) {
  const trilha = [['Brasil']];
  if (E.ab === 'BR') {
    const d = await arq(r.ano, `${r.id}/br.json`), its = d.cands, n = its.length, br = fecha(somaLinha(novaU(n), d.tot, false));
    const ufs = Object.entries(d.uf).map(([uf, l]) => ({ id: uf, nome: nomeUf(uf), u: fecha(somaLinha(novaU(n), l, false)) }));
    return { titulo: `Brasil — ${nomeEl}`, trilha, html: `${barras(E, its, br)}${kpis(br, '')}${secMapa('h-mapa-br', 'Mais votado por estado', 'Clique em um estado para ver os municípios.')}<section class="painel"><h2>Estados</h2><div id="h-tab"></div></section>`,
      montar(root) {
        const por = Object.fromEntries(ufs.map(x => [x.id, x]));
        const mp = criarMapa(root.querySelector('#h-mapa-br'), ctx.geo, { onClick: id => ctx.ir(hUf(r, id)), tooltip: id => por[id] ? tipU(E, its, por[id].nome, por[id].u) : '' });
        mp.atualizar(Object.fromEntries(ufs.map(x => [x.id, fillU(E, its, x.u)]))); legenda(root.querySelector('.h-leg'), E, its, ufs.map(x => x.u));
        tabela(root.querySelector('#h-tab'), { cols: colsUnid(E, its, br, { k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' }), rows: ufs, onRow: x => ctx.ir(hUf(r, x.id)), sort: 'nome', dir: 'asc' });
      } };
  }
  // cargos estaduais e municipais: um resumo por estado (lido dos arquivos de cada estado)
  const ufsIdx = E.idx.ufs.filter(u => u !== 'zz' && u !== 'br');
  const dados = (await Promise.all(ufsIdx.map(uf => arq(r.ano, `${r.id}/${uf}.json`).then(d => [uf, d]).catch(() => null)))).filter(Boolean);
  if (E.mun) {
    // prefeito: prefeitos (mais votados) por partido; vereador: eleitos por estado
    const rows = dados.map(([uf, d]) => { const ms = Object.values(d.mun); const t = { ap: 0, c: 0, n: ms.length, ele: 0, part: new Map() };
      for (const m of ms) { const l = m.tot; t.ap += l[0]; t.c += l[1]; if (E.prop) t.ele += m.ele || 0; else { let li = -1; for (let i = 4; i < l.length; i++) if (li < 0 || l[i] > l[li]) li = i; const c = m.cands[li - 4]; if (c && (r.id.endsWith('t1') || /ELEITO/.test(c.st))) { const sg = c.sg; t.part.set(sg, (t.part.get(sg) || 0) + 1); } } }
      return { id: uf, nome: nomeUf(uf), ...t }; });
    const part = new Map(); rows.forEach(x => x.part.forEach((n, sg) => part.set(sg, (part.get(sg) || 0) + n)));
    const resumo = E.prop ? '' : `<section class="painel"><h2>${r.id.endsWith('t1') ? 'Mais votados no 1º turno' : 'Eleitos no 2º turno'}, por partido</h2><p class="sub">Número de municípios em que o candidato do partido ficou em primeiro.</p><ol class="h-rank">${[...part].sort((a, b) => b[1] - a[1]).map(([sg, n]) => `<li>${chipP(sg)}<b>${fInt(n)}</b></li>`).join('')}</ol></section>`;
    return { titulo: `Brasil — ${nomeEl}`, trilha, html: `${resumo}<section class="painel"><h2>Estados</h2><p class="sub">Escolha um estado para ver os municípios.</p><div id="h-tab"></div></section>`,
      montar(root) { tabela(root.querySelector('#h-tab'), { cols: [{ k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome }, { k: 'n', t: 'Municípios', h: x => fInt(x.n), v: x => x.n, cls: 'n' }, ...(E.prop ? [{ k: 'ele', t: 'Vereadores eleitos', h: x => fInt(x.ele), v: x => x.ele, cls: 'n' }] : []), { k: 'ap', t: 'Aptos', h: x => fInt(x.ap), v: x => x.ap, cls: 'n' }], rows, onRow: x => ctx.ir(hUf(r, x.id)), sort: 'nome', dir: 'asc' }); } };
  }
  const rows = dados.map(([uf, d]) => { const its = itens(E, d); const u = fecha(somaLinha(novaU(its.length), E.prop ? [...d.tot, Object.values(d.mun).reduce((a, l) => { l[4].forEach((x, i) => { a[i] = (a[i] || 0) + x; }); return a; }, []), []] : d.tot, E.prop));
    const ele = E.prop ? d.cands.filter(c => /^ELEITO/.test(c.st)) : null; const venc = E.prop ? null : d.cands.find(c => /^ELEITO/.test(c.st)) || (u.lid >= 0 ? d.cands[u.lid] : null);
    return { id: uf, nome: nomeUf(uf), u, its, ele, venc }; });
  const cols = E.prop
    ? [{ k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome }, { k: 'lid', t: 'Partido mais votado', h: x => lidCel(E, x.its, x.u), v: x => x.u.lid >= 0 ? x.its[x.u.lid].sg : '' }, { k: 'ele', t: 'Eleitos', h: x => fInt(x.ele.length), v: x => x.ele.length, cls: 'n' }, { k: 'top', t: 'Mais votado', h: x => x.ele.length ? esc(bonito([...x.ele].sort((a, b) => b.v - a.v)[0].nm)) : '', v: x => '' }]
    : [{ k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome }, { k: 'venc', t: r.id.endsWith('t1') ? 'Eleito ou mais votado' : 'Eleito', h: x => x.venc ? `${esc(bonito(x.venc.nm))} ${chipP(x.venc.sg)} ${situ(x.venc.st)}` : '', v: x => x.venc?.nm || '' }, { k: 'pv', t: '% válidos', h: x => x.venc ? `<b>${fNum(x.u.p[x.its.indexOf(x.venc)], 2)}%</b>` : '', v: x => x.venc ? x.u.p[x.its.indexOf(x.venc)] : NaN, cls: 'n' }];
  return { titulo: `Brasil — ${nomeEl}`, trilha, html: `${secMapa('h-mapa-br', E.prop ? 'Partido mais votado por estado' : 'Mais votado por estado', 'Clique em um estado.')}<section class="painel"><h2>Estados</h2><div id="h-tab"></div></section>`,
    montar(root) {
      const por = Object.fromEntries(rows.map(x => [x.id, x]));
      const mp = criarMapa(root.querySelector('#h-mapa-br'), ctx.geo, { onClick: id => por[id] && ctx.ir(hUf(r, id)), tooltip: id => por[id] ? tipU(E, por[id].its, por[id].nome, por[id].u) : '' });
      mp.atualizar(Object.fromEntries(rows.map(x => [x.id, fillU(E, x.its, x.u)])));
      tabela(root.querySelector('#h-tab'), { cols, rows, onRow: x => ctx.ir(hUf(r, x.id)), sort: 'nome', dir: 'asc' });
    } };
}

// estado (ou região do estado)
async function telaUf(r, E, ctx, nomeEl) {
  const uf = r.uf, d = await arq(r.ano, `${r.id}/${uf}.json`), regs = await regioesUf(ctx, uf);
  const bm = ctx.B?.byUf?.[uf] || [], nomeMun = new Map(bm.map(b => [b.cd, bonito(b.nome)])), cdi = new Map(bm.map(b => [b.cd, String(b.cdi)]));
  let cds = Object.keys(d.mun), titReg = null;
  if (r.nivel === 'reg' && regs?.regs[r.reg]) { const rg = regs.regs[r.reg]; titReg = rg.nome; const s = new Set(rg.cds); cds = cds.filter(cd => s.has(cd)); }
  const trilha = [['Brasil', H(r)], [nomeUf(uf), titReg ? hUf(r, uf) : undefined], ...(titReg ? [[titReg]] : [])];
  const titulo = `${titReg || nomeUf(uf)} — ${nomeEl}`;
  const nomeDe = cd => nomeMun.get(cd) || cd;
  const linkMun = cd => ctx.ir(hMun(r, uf, cd));
  const regDe = new Map(); regs?.regs.forEach((rg, i) => rg.cds.forEach(cd => regDe.set(cd, i)));
  const colReg = regs ? [{ k: 'reg', t: 'Região', h: x => esc(regs.regs[regDe.get(x.id)]?.nome || ''), v: x => regs.regs[regDe.get(x.id)]?.nome || '' }] : [];
  const blocoRegs = (rowsReg, cols) => regs && r.nivel === 'uf' ? `<section class="painel"><h2>${esc(regs.titulo)}</h2><p class="sub">${regs.regs.length} regiões · ${esc(regs.fonte || '')}. Clique numa região para ver os municípios.</p><div id="h-tab-reg"></div></section>` : '';
  const mapaUf = uf !== 'df' && uf !== 'zz';

  if (E.mun) {
    // prefeito ou vereador: cada município tem seus candidatos
    const rows = cds.map(cd => { const m = d.mun[cd];
      if (E.prop) return { id: cd, nome: nomeDe(cd), ap: m.tot[0], c: m.tot[1], ele: m.ele, nc: m.nc, top: m.top || [] };
      const its = m.cands, u = fecha(somaLinha(novaU(its.length), m.tot, false)); const venc = its.find(c => /^ELEITO/.test(c.st)) || (u.lid >= 0 ? its[u.lid] : null);
      return { id: cd, nome: nomeDe(cd), u, its, venc, ap: u.ap }; });
    const cols = E.prop
      ? [{ k: 'nome', t: 'Município', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome }, ...colReg, { k: 'ele', t: 'Eleitos', h: x => fInt(x.ele), v: x => x.ele, cls: 'n' }, { k: 'nc', t: 'Candidatos', h: x => fInt(x.nc), v: x => x.nc, cls: 'n' }, { k: 'top', t: 'Mais votado', h: x => x.top[0] ? `${esc(bonito(x.top[0][0]))} ${chipP(x.top[0][1])} <small>${fInt(x.top[0][2])}</small>` : '', v: x => x.top[0]?.[2] || 0 }, { k: 'ap', t: 'Aptos', h: x => fInt(x.ap), v: x => x.ap, cls: 'n' }]
      : [{ k: 'nome', t: 'Município', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome }, ...colReg, { k: 'venc', t: r.id.endsWith('t1') ? 'Eleito ou mais votado' : 'Eleito', h: x => x.venc ? `${esc(bonito(x.venc.nm))} ${chipP(x.venc.sg)} ${situ(x.venc.st)}` : '', v: x => x.venc?.nm || '' }, { k: 'pv', t: '% válidos', h: x => x.venc ? `<b>${fNum(x.u.p[x.its.indexOf(x.venc)], 2)}%</b>` : '', v: x => x.venc ? x.u.p[x.its.indexOf(x.venc)] : NaN, cls: 'n' }, { k: 'ap', t: 'Aptos', h: x => fInt(x.ap), v: x => x.ap, cls: 'n' }];
    const part = new Map(); if (!E.prop) rows.forEach(x => { if (x.venc) part.set(x.venc.sg, (part.get(x.venc.sg) || 0) + 1); });
    const resumo = E.prop ? '' : `<section class="painel"><h2>Municípios por partido do ${r.id.endsWith('t1') ? 'mais votado' : 'eleito'}</h2><ol class="h-rank">${[...part].sort((a, b) => b[1] - a[1]).map(([sg, n]) => `<li>${chipP(sg)}<b>${fInt(n)}</b></li>`).join('')}</ol></section>`;
    const rowsReg = regs ? regs.regs.map((rg, i) => ({ i, nome: rg.nome, n: rg.cds.length })) : [];
    return { titulo, trilha, html: `${resumo}${mapaUf && !E.prop ? secMapa('h-mapa-mun', 'Partido do mais votado por município', 'Clique em um município.') : ''}${blocoRegs()}<section class="painel"><h2>Municípios</h2><div id="h-tab"></div></section>`,
      montar(root) {
        if (regs && r.nivel === 'uf') tabela(root.querySelector('#h-tab-reg'), { cols: [{ k: 'nome', t: 'Região', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome }, { k: 'n', t: 'Municípios', h: x => fInt(x.n), v: x => x.n, cls: 'n' }], rows: rowsReg, onRow: x => ctx.ir(H(r, `/uf/${uf}/r/${x.i}`)), sort: 'nome', dir: 'asc' });
        tabela(root.querySelector('#h-tab'), { cols, rows, onRow: x => linkMun(x.id), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
        const alvo = root.querySelector('#h-mapa-mun');
        if (alvo) getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
          const idCd = new Map([...cdi].map(([cd, i]) => [i, cd])), por = new Map(rows.map(x => [x.id, x]));
          for (const [id, g] of Object.entries(geo.muns)) { const m = por.get(idCd.get(id)); if (m) g.n = m.nome; }
          const mp = criarMapaMun(alvo, geo, { onClick: id => { const cd = idCd.get(id); if (cd) linkMun(cd); }, tooltip: id => { const x = por.get(idCd.get(id)); return x && x.venc ? `<b>${esc(x.nome)}</b><br>${esc(bonito(x.venc.nm))} (${esc(x.venc.sg)})` : ''; } });
          mp.atualizar(Object.fromEntries(rows.filter(x => cdi.get(x.id) && x.venc).map(x => [cdi.get(x.id), { fill: corPartido(x.venc.sg), k: 'x', solo: true, lab: esc(sgTxt(x.venc.sg)) }])));
          const cont = new Map(); rows.forEach(x => x.venc && cont.set(x.venc.sg, (cont.get(x.venc.sg) || 0) + 1));
          root.querySelector('.h-leg').innerHTML = [...cont].sort((a, b) => b[1] - a[1]).slice(0, 10).map(([sg, n]) => `<span><i style="background:${corPartido(sg)}"></i>${esc(sgTxt(sg))} (${n})</span>`).join('');
        }).catch(() => { alvo.innerHTML = '<p class="aviso">Mapa indisponível.</p>'; });
      } };
  }

  const its = itens(E, d), n = its.length;
  const munU = new Map(cds.map(cd => { const l = d.mun[cd]; return [cd, fecha(somaLinha(novaU(n), l, E.prop))]; }));
  const tot = fecha(novaU(n)); { const t = novaU(n); for (const u of munU.values()) { t.ap += u.ap; t.c += u.c; t.br += u.br; t.nu += u.nu; t.ns += u.ns; u.v.forEach((x, i) => { t.v[i] += x; }); u.cv.forEach((v, ci) => t.cv.set(ci, (t.cv.get(ci) || 0) + v)); } Object.assign(tot, fecha(t)); }
  const rows = cds.map(cd => ({ id: cd, nome: nomeDe(cd), u: munU.get(cd) }));
  const rowsReg = regs ? regs.regs.map((rg, i) => { const t = novaU(n); for (const cd of rg.cds) { const u = munU.get(cd); if (!u) continue; t.ap += u.ap; t.c += u.c; t.br += u.br; t.nu += u.nu; t.ns += u.ns; u.v.forEach((x, k) => { t.v[k] += x; }); } return { i, id: i, nome: rg.nome, n: rg.cds.length, u: fecha(t) }; }) : [];
  // proporcional: candidatos da UF (lista completa só na página do estado; na região, soma dos 10 mais votados de cada município)
  let blocoCand = '';
  if (E.prop) {
    if (r.nivel === 'uf') blocoCand = `<section class="painel"><h2>Candidatos</h2><p class="sub">${fInt(d.cands.filter(c => /^ELEITO/.test(c.st)).length)} eleitos. Clique nos títulos para ordenar; use a busca para achar um nome.</p><div id="h-tab-c"></div></section>`;
    else blocoCand = maisVotados(d.cands, tot.cv, { titulo: 'Mais votados na região', aprox: true });
  }
  const sub = E.prop ? 'Clique em um município para ver bairros, locais de votação e seções.' : 'Clique em um município para ver bairros, locais de votação e seções.';
  return { titulo, trilha, html: `${barras(E, its, tot)}${kpis(tot, 'municípios')}${blocoCand}${mapaUf ? secMapa('h-mapa-mun', E.prop ? 'Partido mais votado por município' : 'Mais votado por município', 'Clique em um município.') : ''}${blocoRegs()}<section class="painel"><h2>Municípios${titReg ? ' da região' : ''}</h2><p class="sub">${sub}</p><div id="h-tab"></div></section>`,
    montar(root) {
      if (E.prop && r.nivel === 'uf') tabela(root.querySelector('#h-tab-c'), { cols: [{ k: 'nm', t: 'Candidato', h: c => `<b>${esc(bonito(c.nm))}</b> ${situ(c.st)}`, v: c => c.nm }, { k: 'sg', t: 'Partido', h: c => chipP(c.sg), v: c => c.sg }, { k: 'v', t: 'Votos', h: c => fInt(c.v), v: c => c.v, cls: 'n' }, { k: 'pv', t: '% válidos', h: c => `${fNum(pc(c.v, tot.vv), 2)}%`, v: c => c.v, cls: 'n' }], rows: d.cands, sort: 'v', dir: 'desc', filtro: (c, q) => sem(c.nm).includes(q) || sem(c.sg).includes(q), limite: 200 });
      if (regs && r.nivel === 'uf') tabela(root.querySelector('#h-tab-reg'), { cols: colsUnid(E, its, tot, { k: 'nome', t: 'Região', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' }), rows: rowsReg, onRow: x => ctx.ir(H(r, `/uf/${uf}/r/${x.i}`)), sort: 'nome', dir: 'asc' });
      tabela(root.querySelector('#h-tab'), { cols: colsUnid(E, its, tot, { k: 'nome', t: 'Município', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' }).concat(colReg), rows, onRow: x => linkMun(x.id), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
      const alvo = root.querySelector('#h-mapa-mun');
      if (alvo) getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
        const idCd = new Map([...cdi].map(([cd, i]) => [i, cd])), por = new Map(rows.map(x => [x.id, x])), noMapa = new Set(cds.map(cd => cdi.get(cd)));
        if (titReg) for (const id of Object.keys(geo.muns)) if (!noMapa.has(id)) delete geo.muns[id];
        for (const [id, g] of Object.entries(geo.muns)) { const m = por.get(idCd.get(id)); if (m) g.n = m.nome; }
        const mp = criarMapaMun(alvo, geo, { onClick: id => { const cd = idCd.get(id); if (cd) linkMun(cd); }, tooltip: id => { const x = por.get(idCd.get(id)); return x ? tipU(E, its, x.nome, x.u) : ''; } });
        mp.atualizar(Object.fromEntries(rows.filter(x => cdi.get(x.id)).map(x => [cdi.get(x.id), { ...fillU(E, its, x.u), peso: x.u.ap }])));
        legenda(root.querySelector('.h-leg'), E, its, rows.map(x => x.u));
      }).catch(() => { alvo.innerHTML = '<p class="aviso">Mapa indisponível.</p>'; });
      ctx.csv = () => ({ nome: `${r.ano}_${r.id}_${uf}_municipios`, cab: ['Município', 'Aptos', 'Comparecimento', 'Brancos', 'Nulos', ...its.map(it => nomeItem(E, it))], linhas: rows.map(x => [x.nome, x.u.ap, x.u.c, x.u.br, x.u.nu, ...x.u.v]) });
    } };
}

// município e abaixo (distrito/região do município, bairro, local, seção)
async function telaMun(r, E, ctx, nomeEl) {
  const uf = r.uf, cd = r.cd;
  const [ufd, sec, loc, geo, geoB] = await Promise.all([
    arq(r.ano, `${r.id}/${uf}.json`), arq(r.ano, `${r.id}/${uf}/${cd}.json`), arq(r.ano, `locais/${uf}/${cd}.json`).catch(() => ({ l: [] })),
    getJSON(`data/bairros_geo/${cd}.json`, { retries: 0 }).catch(() => null), getJSON(`data/regioes/${cd}_bairros.json`, { retries: 0 }).catch(() => null)]);
  const bm = ctx.B?.byUf?.[uf] || [], nomeM = bonito(bm.find(b => b.cd === cd)?.nome || cd);
  const its = E.mun ? (E.prop ? sec.par : sec.cands) : itens(E, ufd), n = its.length, cands = E.prop ? (E.mun ? sec.cands : ufd.cands) : null;
  // distritos/regiões do município (malha com rótulo "distrito") e bairros (malha de bairros, ou o bairro informado pelo TSE)
  const temDist = geo?.rotulo === 'distrito', geoBairro = temDist ? geoB : (geo?.rotulo === 'bairro' ? geo : null);
  const nomeDist = i => geo?.f?.[i]?.n || '';
  const rotD = geo?.rotuloNome || 'Distrito', rotDp = geo?.rotuloPlural || 'Distritos';
  const L = loc.l.map(l => { const [z, nr, nome, end, baiTse, lat, lon, secs, g, b] = l; const gb = temDist ? b : g;
    const bairro = geoBairro && gb >= 0 ? geoBairro.f[gb]?.n : (baiTse || '(sem bairro informado)');
    const u = novaU(n), ss = [];
    for (const s of secs) { const k = `${z}-${s}`, lin = sec.s[k]; if (!lin) continue; somaLinha(u, lin, E.prop); ss.push([s, lin]); }
    return { id: `${z}-${nr}`, z, nr, nome: bonito(nome), end: bonito(end), bairro: bonito(bairro), di: temDist && g >= 0 ? g : -1, lat, lon, u: fecha(u), ss }; }).filter(x => x.ss.length);
  const uMun = unidade(Object.values(sec.s), n, E.prop); if (E.prop) uMun.cv = new Map((sec.cv || []).map(([ci, v]) => [ci, v]));
  const base = hMun(r, uf, cd);
  const agrupa = (ls, chave) => { const m = new Map(); for (const l of ls) { const k = chave(l); if (!m.has(k)) m.set(k, { id: k, ls: [], u: novaU(n) }); const g = m.get(k); g.ls.push(l); g.u.ap += l.u.ap; g.u.c += l.u.c; g.u.br += l.u.br; g.u.nu += l.u.nu; g.u.ns += l.u.ns; l.u.v.forEach((x, i) => { g.u.v[i] += x; }); l.u.cv.forEach((v, ci) => g.u.cv.set(ci, (g.u.cv.get(ci) || 0) + v)); } for (const g of m.values()) fecha(g.u); return [...m.values()]; };
  const trilha0 = [['Brasil', H(r)], [nomeUf(uf), hUf(r, uf)]];
  const tabLocais = (id) => `<section class="painel"><h2>Locais de votação</h2><p class="sub">Clique em um local para ver as seções.</p><div id="${id}"></div></section>`;
  const colsLocal = [{ k: 'nome', t: 'Local', h: x => `<b>${esc(x.nome)}</b><small class="vt">${esc(x.end)}${x.bairro ? ' · ' + esc(x.bairro) : ''}</small>`, v: x => x.nome, ini: 'asc' }];
  const montaLocais = (root, ls) => { tabela(root.querySelector('#h-tab-l'), { cols: colsUnid(E, its, uMun, colsLocal[0]), rows: ls, onRow: x => ctx.ir(`${base}/l/${encodeURIComponent(x.id)}`), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.nome + ' ' + x.bairro + ' ' + x.end).includes(q), limite: 300 }); };
  const mapaPontos = (root, ls) => { const el = root.querySelector('#h-mapa-pt'); if (!el) return; const pts = ls.filter(x => x.lat && x.lon).map(x => ({ id: x.id, lat: x.lat, lon: x.lon, ap: x.u.ap }));
    if (pts.length < 2) { el.closest('section').remove(); return; }
    const por = new Map(ls.map(x => [x.id, x])); const mp = criarMapaPontos(el, pts, { tooltip: id => { const x = por.get(id); return x ? tipU(E, its, x.nome, x.u) : ''; }, onClick: id => ctx.ir(`${base}/l/${encodeURIComponent(id)}`) });
    mp.atualizar?.(Object.fromEntries(ls.map(x => [x.id, { fill: x.u.lid >= 0 ? corItem(E, its[x.u.lid]) : '#c9c4d8' }]))); legenda(root.querySelector('.h-leg'), E, its, ls.map(x => x.u)); };
  const blocoCandsU = (u, titulo, aprox) => E.prop ? maisVotados(cands, u.cv, { titulo, aprox }) : '';

  // ----- seção -----
  if (r.nivel === 'secao') {
    const l = L.find(x => x.ss.some(([s]) => `${x.z}-${s}` === r.secao)), lin = sec.s[r.secao];
    if (!lin) return { titulo: 'Seção não encontrada', trilha: trilha0, html: '<div class="aviso">Seção não encontrada.</div>', montar() {} };
    const u = unidade([lin], n, E.prop); const [z, s] = r.secao.split('-');
    const cvS = E.prop ? new Map(lin[5] || []) : null;
    return { titulo: `Seção ${s} (zona ${z}) — ${nomeEl}`, trilha: [...trilha0, [nomeM, base], ...(l ? [[l.nome, `${base}/l/${encodeURIComponent(l.id)}`]] : []), [`Seção ${s}`]],
      html: `${l ? `<p class="sub">${esc(l.nome)} · ${esc(l.end)} · ${esc(l.bairro)} · ${esc(nomeM)}</p>` : ''}${barras(E, its, u, { max: 40 })}${kpis(u)}${E.prop ? maisVotados(cands, cvS, { titulo: 'Candidatos mais votados na seção', n: 10 }) : ''}`, montar() {} };
  }
  // ----- local: seções -----
  if (r.nivel === 'local') {
    const l = L.find(x => x.id === r.local);
    if (!l) return { titulo: 'Local não encontrado', trilha: trilha0, html: '<div class="aviso">Local de votação não encontrado.</div>', montar() {} };
    const rows = l.ss.map(([s, lin]) => ({ id: `${l.z}-${s}`, nome: `Seção ${s}`, s, u: unidade([lin], n, E.prop) }));
    return { titulo: `${l.nome} — ${nomeEl}`, trilha: [...trilha0, [nomeM, base], ...(l.di >= 0 ? [[nomeDist(l.di), `${base}/d/${l.di}`]] : []), [l.bairro, `${base}/b/${encodeURIComponent(l.bairro)}`], [l.nome]],
      html: `<p class="sub">${esc(l.end)} · ${esc(l.bairro)} · zona ${l.z}</p>${barras(E, its, l.u)}${kpis(l.u)}${blocoCandsU(l.u, 'Mais votados no local', true)}<section class="painel"><h2>Seções</h2><p class="sub">Clique numa seção para ver o boletim completo.</p><div id="h-tab-s"></div></section>`,
      montar(root) { tabela(root.querySelector('#h-tab-s'), { cols: colsUnid(E, its, l.u, { k: 's', t: 'Seção', h: x => `<b>${x.s}</b>`, v: x => x.s, ini: 'asc' }), rows, onRow: x => ctx.ir(`${base}/s/${encodeURIComponent(x.id)}`), sort: 's', dir: 'asc' });
        ctx.csv = () => ({ nome: `${r.ano}_${r.id}_${cd}_${l.id}_secoes`, cab: ['Seção', 'Aptos', 'Comparecimento', 'Brancos', 'Nulos', ...its.map(it => nomeItem(E, it))], linhas: rows.map(x => [x.s, x.u.ap, x.u.c, x.u.br, x.u.nu, ...x.u.v]) }); } };
  }
  const bairros = agrupa(L, x => x.bairro);
  const colB = { k: 'nome', t: 'Bairro', h: x => `<b>${esc(x.id)}</b><small class="vt">${x.ls.length} locais</small>`, v: x => x.id, ini: 'asc' };
  // ----- bairro -----
  if (r.nivel === 'bairro') {
    const b = bairros.find(x => x.id === r.bairro) || { id: r.bairro, ls: [], u: fecha(novaU(n)) };
    const di = b.ls[0]?.di ?? -1;
    return { titulo: `${r.bairro} — ${nomeEl}`, trilha: [...trilha0, [nomeM, base], ...(di >= 0 ? [[nomeDist(di), `${base}/d/${di}`]] : []), [r.bairro]],
      html: `${barras(E, its, b.u)}${kpis(b.u)}${blocoCandsU(b.u, 'Mais votados no bairro', true)}${secMapa('h-mapa-pt', 'Mapa dos locais de votação', 'Cor = mais votado no local; tamanho = eleitorado.')}${tabLocais('h-tab-l')}`,
      montar(root) { mapaPontos(root, b.ls); montaLocais(root, b.ls); } };
  }
  // ----- distrito / região do município -----
  if (r.nivel === 'dist') {
    const ls = L.filter(x => x.di === r.di), u = fecha(agrupa(ls, () => 0)[0]?.u || novaU(n)), bs = agrupa(ls, x => x.bairro);
    return { titulo: `${nomeDist(r.di)} — ${nomeEl}`, trilha: [...trilha0, [nomeM, base], [nomeDist(r.di)]],
      html: `${barras(E, its, u)}${kpis(u)}${blocoCandsU(u, `Mais votados ${rotD === 'Região' ? 'na região' : 'no distrito'}`, true)}<section class="painel"><h2>Bairros</h2><div id="h-tab-b"></div></section>${secMapa('h-mapa-pt', 'Mapa dos locais de votação', 'Cor = mais votado no local; tamanho = eleitorado.')}${tabLocais('h-tab-l')}`,
      montar(root) { tabela(root.querySelector('#h-tab-b'), { cols: colsUnid(E, its, u, colB), rows: bs, onRow: x => ctx.ir(`${base}/b/${encodeURIComponent(x.id)}`), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.id).includes(q) }); mapaPontos(root, ls); montaLocais(root, ls); } };
  }
  // ----- município -----
  const dists = temDist ? agrupa(L.filter(x => x.di >= 0), x => x.di).map(g => ({ ...g, nome: nomeDist(g.id) })) : [];
  return { titulo: `${nomeM} — ${nomeEl}`, trilha: [...trilha0, [nomeM]],
    html: `${barras(E, its, uMun)}${kpis(uMun)}${E.prop ? maisVotados(cands, uMun.cv, { titulo: 'Candidatos mais votados no município', n: 40 }) : ''}
      ${dists.length ? `<section class="painel"><h2>${esc(rotDp)}</h2><p class="sub">${esc(geo.fonte || '')}</p><div id="h-tab-d"></div></section>` : ''}
      <section class="painel"><h2>Bairros</h2><p class="sub">${geoBairro ? 'Bairro pela localização do local de votação (malha oficial).' : 'Bairro informado pelo TSE para o local de votação.'}</p><div id="h-tab-b"></div></section>
      ${secMapa('h-mapa-pt', 'Mapa dos locais de votação', 'Cor = mais votado no local; tamanho = eleitorado.')}${tabLocais('h-tab-l')}`,
    montar(root) {
      if (dists.length) tabela(root.querySelector('#h-tab-d'), { cols: colsUnid(E, its, uMun, { k: 'nome', t: rotD, h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' }), rows: dists, onRow: x => ctx.ir(`${base}/d/${x.id}`), sort: 'nome', dir: 'asc' });
      tabela(root.querySelector('#h-tab-b'), { cols: colsUnid(E, its, uMun, colB), rows: bairros, onRow: x => ctx.ir(`${base}/b/${encodeURIComponent(x.id)}`), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.id).includes(q), limite: 1000 });
      mapaPontos(root, L); montaLocais(root, L);
      ctx.csv = () => ({ nome: `${r.ano}_${r.id}_${cd}_locais`, cab: ['Local', 'Bairro', 'Aptos', 'Comparecimento', 'Brancos', 'Nulos', ...its.map(it => nomeItem(E, it))], linhas: L.map(x => [x.nome, x.bairro, x.u.ap, x.u.c, x.u.br, x.u.nu, ...x.u.v]) });
    } };
}
