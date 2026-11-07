// Eleições anteriores (2006–2024) e cargos de 2026, com a descida completa:
// Brasil > Estado > Região do estado > Município > Região/distrito do município > Bairro > Local de votação > Seção.
// Tudo é clicável: candidato (?c=<número>) e partido/federação/coligação (?p=<chave>) abrem a votação deles em qualquer nível.
// Dados: branch hist-<ano> (scripts/hist/build_hist.py, a partir do lake do TSE por seção).
// Rotas: #/h/<ano>/<eleição>[/uf/<uf>[/r/<i> | /m/<cd>[/d/<i> | /b/<bairro> | /l/<zona-local> | /s/<zona-seção>]]][?c=<n> | ?p=<chave>]
import { CONFIG } from './config.js?v=faa97392';
import { UF_NOME, fInt, fNum, mix } from './util.js?v=faa97392';
import { esc, tabela, sem } from './ui.js?v=faa97392';
import { getJSON } from './tse.js?v=faa97392';
import { corPartido, corTextoSobre } from './partidos.js?v=faa97392';
import { criarMapa } from './map.js?v=faa97392';
import { criarMapaMun } from './mapamun.js?v=faa97392';
import { criarMapaPontos } from './mapapontos.js?v=faa97392';

import { cadeirasHTML, ligarCadeiras, agrupa } from './cadeiras.js?v=faa97392';
export const ANOS_HIST = [2026, 2024, 2022, 2020, 2018, 2016, 2014, 2012, 2010, 2008, 2006];
const BASE = ano => `https://raw.githubusercontent.com/${CONFIG.repo}/hist-${ano}/`;
const cache = new Map();
const pega = (url, op = {}) => { if (!cache.has(url)) cache.set(url, getJSON(url, { retries: 2, timeout: 60000, ...op }).catch(e => { cache.delete(url); throw e; })); return cache.get(url); };
export const idxAno = ano => pega(BASE(ano) + 'idx.json');
const arq = (ano, rel) => pega(BASE(ano) + rel);
const pc = (a, b) => (b > 0 ? 100 * a / b : NaN);
const bonito = s => /^Candidato \d+$/.test(s) ? `Nº ${String(s).slice(10)} (sem cadastro no TSE)` : String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());
const nomeUf = uf => UF_NOME[uf] || uf.toUpperCase();
const sgTxt = s => String(s || '').replace(/PC do B/g, 'PCdoB');
const situ = st => { const s = String(st || ''); if (/^(ELEITO|MÉDIA$)/.test(s)) return '<span class="h-sel">Eleito</span>'; if (/2º TURNO/.test(s)) return '<span class="h-sel h-2t">2º turno</span>'; if (/SUPLENTE/.test(s)) return '<small class="h-sit">suplente</small>'; return ''; };
const chipP = (sg, href) => { const c = corPartido(sg), t = `<span class="h-p" style="background:${c};color:${corTextoSobre(c)}">${esc(sgTxt(sg))}</span>`; return href ? `<a class="h-lk" href="${href}">${t}</a>` : t; };

// ---------- rota e foco ----------
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
  const q = new URLSearchParams(location.hash.split('?')[1] || '');
  r.foco = q.get('c') ? { t: 'c', n: +q.get('c') } : q.get('p') ? { t: 'p', k: q.get('p') } : null;
  return r;
}
const qsF = f => f ? (f.t === 'c' ? `?c=${f.n}` : `?p=${encodeURIComponent(f.k)}`) : '';
const H = (r, extra = '', foco = r.foco) => `#/h/${r.ano}/${r.id}${extra}${qsF(foco)}`;
const pUf = uf => `/uf/${uf}`, pReg = (uf, i) => `/uf/${uf}/r/${i}`, pMun = (uf, cd) => `/uf/${uf}/m/${cd}`;
const cLink = (r, n, extra) => H(r, extra, { t: 'c', n });
const pLink = (r, k, extra) => H(r, extra, { t: 'p', k });

// ---------- unidades ----------
// majoritário: [aptos, comp, brancos, nulos, v0..vn]; proporcional: [aptos, comp, brancos, nulos, [por partido], [[cand, v] top]]
function novaU(n) { return { ap: 0, c: 0, br: 0, nu: 0, v: new Array(n).fill(0), cv: new Map(), ns: 0, fv: 0 }; }
function somaLinha(u, l, prop) {
  u.ap += l[0]; u.c += l[1]; u.br += l[2]; u.nu += l[3]; u.ns++;
  if (prop) { const pv = l[4] || []; for (let i = 0; i < pv.length; i++) u.v[i] += pv[i]; for (const [ci, v] of (l[5] || [])) u.cv.set(ci, (u.cv.get(ci) || 0) + v); }
  else for (let i = 4; i < l.length; i++) u.v[i - 4] += l[i];
  return u;
}
function somaU(t, u) { t.ap += u.ap; t.c += u.c; t.br += u.br; t.nu += u.nu; t.ns += u.ns; t.fv += u.fv || 0; u.v.forEach((x, i) => { t.v[i] += x; }); u.cv.forEach((v, ci) => t.cv.set(ci, (t.cv.get(ci) || 0) + v)); return t; }
function fecha(u) {
  u.vv = u.v.reduce((a, b) => a + b, 0); u.p = u.v.map(x => pc(x, u.vv)); u.lid = -1;
  u.v.forEach((x, i) => { if (x > 0 && (u.lid < 0 || x > u.v[u.lid])) u.lid = i; });
  u.pAb = pc(u.ap - u.c, u.ap);
  return u;
}
const unidade = (linhas, n, prop) => { const u = novaU(n); for (const l of linhas) somaLinha(u, l, prop); return fecha(u); };

// ---------- partidos, federações e coligações ----------
// No proporcional quem disputa as cadeiras é a federação (desde 2022) ou a coligação (até 2018); o partido isolado é o próprio grupo.
function grupos(par) {
  const m = new Map();
  (par || []).forEach((p, i) => {
    const k = p.fed ? `${p.tg || 'F'}:${p.fed}` : `P:${p.sg}`;
    if (!m.has(k)) m.set(k, { k, tipo: p.fed ? (p.tg || 'F') : 'P', nome: p.fed ? (p.tg === 'C' ? (/^colig/i.test(p.fed) ? bonito(p.fed) : `Coligação ${bonito(p.fed)}`) : `Federação ${sgTxt(p.fed)}`) : sgTxt(p.sg), sg: p.sg, membros: [], ele: 0 });
    const g = m.get(k); g.membros.push(i); g.ele += p.ele || 0;
  });
  return [...m.values()];
}
const vetG = (u, G) => G.map(g => g.membros.reduce((a, i) => a + (u.v[i] || 0), 0));
// índices de partido que o foco (?p=) seleciona
function membrosFoco(k, par) {
  if (!k) return [];
  if (k.startsWith('P:')) { const i = (par || []).findIndex(p => p.sg === k.slice(2)); return i >= 0 ? [i] : []; }
  return grupos(par).find(g => g.k === k)?.membros || [];
}
function nomeFoco(k, par) {
  if (k.startsWith('P:')) { const p = (par || []).find(x => x.sg === k.slice(2)); return { nome: sgTxt(k.slice(2)), sg: k.slice(2), grupo: p?.fed ? { k: `${p.tg || 'F'}:${p.fed}`, nome: p.tg === 'C' ? (/^colig/i.test(p.fed) ? bonito(p.fed) : `Coligação ${bonito(p.fed)}`) : `Federação ${sgTxt(p.fed)}` } : null }; }
  const g = grupos(par).find(x => x.k === k); return { nome: g?.nome || k.slice(2), sg: g ? par[g.membros[0]].sg : '', membros: g ? g.membros.map(i => par[i].sg) : [] };
}

// ---------- contexto ----------
async function carregaEleicao(r) {
  const idx = await idxAno(r.ano), el = idx.el.find(e => e.id === r.id) || idx.el[0];
  if (!el) throw new Error('eleição não encontrada');
  r.id = el.id;
  return { idx, el, prop: el.prop, ab: el.ab, mun: el.ab === 'MUN' };
}
async function regioesUf(ctx, uf) {
  const def = await getJSON(`data/regioes/uf-${uf}.json`, { retries: 1 }).catch(() => null);
  if (!def) return null;
  const bm = ctx.B?.byUf?.[uf] || [], porNome = new Map(bm.map(b => [sem(b.nome), b.cd]));
  const regs = Object.entries(def.regioes).map(([nome, muns]) => ({ nome, cds: muns.map(n => porNome.get(sem(n))).filter(Boolean) }));
  return { titulo: def.divisao || 'Regiões', fonte: def.fonte, regs };
}

// ---------- blocos ----------
function kpis(u, rot = 'seções') {
  return `<div class="kpis k4"><div class="kpi"><div class="kpi-t">Eleitores aptos</div><div class="kpi-v">${fInt(u.ap)}</div><div class="kpi-s">${rot ? `${fInt(u.ns)} ${rot}` : '&nbsp;'}</div></div>
    <div class="kpi"><div class="kpi-t">Comparecimento</div><div class="kpi-v">${fNum(pc(u.c, u.ap), 1)}%</div><div class="kpi-s">${fInt(u.c)} eleitores</div></div>
    <div class="kpi"><div class="kpi-t">Abstenção</div><div class="kpi-v">${fNum(u.pAb, 1)}%</div><div class="kpi-s">${fInt(u.ap - u.c)}</div></div>
    <div class="kpi"><div class="kpi-t">Brancos e nulos</div><div class="kpi-v">${fNum(pc(u.br + u.nu, u.c), 1)}%</div><div class="kpi-s">${fInt(u.br)} brancos · ${fInt(u.nu)} nulos</div></div></div>`;
}
const barra = (rank, nomeHtml, extra, p, v, cor) => `<div class="h-bar"><div class="h-bar-t"><b>${rank}º</b> ${nomeHtml} ${extra}<span class="h-bar-v"><b>${fNum(p, 2)}%</b> <small>${fInt(v)}</small></span></div><div class="h-bar-f"><i style="width:${Math.max(0.5, p || 0)}%;background:${cor}"></i></div></div>`;
// candidatos (majoritário) — cada nome abre a página do candidato
function barrasCand(r, E, cands, u, extra, max = 12) {
  const ord = u.v.map((x, i) => i).filter(i => u.v[i] > 0).sort((a, b) => u.v[b] - u.v[a]).slice(0, max);
  return `<section class="painel"><h2>Candidatos</h2><p class="sub">Percentual dos votos válidos. Clique num nome para ver a votação do candidato.</p>${ord.map((i, k) => { const c = cands[i];
    return barra(k + 1, `<a class="h-bar-n" href="${cLink(r, c.n, extra)}">${esc(bonito(c.nm))}</a>`, `${chipP(c.sg)} ${situ(c.st)}`, u.p[i], u.v[i], corPartido(c.sg)); }).join('') || '<p class="sub">Sem votos.</p>'}</section>`;
}
// partidos agrupados por federação/coligação (proporcional) — grupo e partidos clicáveis
function barrasGrupos(r, par, u, extra, { ele = false } = {}) {
  const G = grupos(par), gv = vetG(u, G), ord = G.map((g, i) => i).filter(i => gv[i] > 0).sort((a, b) => gv[b] - gv[a]);
  const temEle = ele && G.some(g => g.ele > 0), semEle = temEle ? ord.filter(gi => !G[gi].ele).length : 0;
  const lin = ord.map((gi, k) => { const g = G[gi], p = pc(gv[gi], u.vv);
    const membros = g.membros.length > 1 || g.tipo !== 'P' ? `<span class="h-memb">${g.membros.filter(i => u.v[i] > 0 || g.membros.length < 4).map(i => `${chipP(par[i].sg, pLink(r, 'P:' + par[i].sg, extra))}<small>${fInt(u.v[i])}</small>`).join(' ')}</span>` : '';
    const b = barra(k + 1, `<a class="h-bar-n" href="${pLink(r, g.k, extra)}">${esc(g.nome)}</a>`, `${ele && g.ele ? `<small class="h-sit h-ele">${g.ele} eleito${g.ele > 1 ? 's' : ''}</small>` : ''}${membros}`, p, gv[gi], corPartido(g.sg));
    return temEle && !g.ele ? b.replace('class="h-bar"', 'class="h-bar sem-export"') : b; }).join('');
  // na imagem para redes: só quem elegeu (quando há eleitos), em duas colunas e paginado
  return `<section class="painel"><h2>Votos por partido, federação e coligação</h2><p class="sub">Votos nominais dos candidatos mais votos de legenda. Partidos da mesma federação (ou coligação) disputam as cadeiras juntos. Clique para ver a votação e os candidatos.</p>${temEle ? '<p class="so-export h-nota">Partidos e federações que elegeram</p>' : ''}<div class="h-bars" data-export-lista>${lin || '<p class="sub">Sem votos.</p>'}</div>${semEle ? `<p class="so-export h-nota">Outros ${semEle} partidos ou federações não elegeram · lista completa no painel</p>` : ''}</section>`;
}
function listaCands(r, cands, cvMap, extra, { titulo = 'Candidatos mais votados', n = 40, aprox = false, filtro } = {}) {
  let ord = [...cvMap].filter(([ci]) => !filtro || filtro(cands[ci])).sort((a, b) => b[1] - a[1]); const tot = ord.length; ord = ord.slice(0, n);
  if (!ord.length) return '';
  return `<section class="painel"><h2>${titulo}</h2>${aprox ? '<p class="sub">Soma dos 10 mais votados de cada seção (quem tem poucos votos por seção pode ficar de fora).</p>' : tot > n ? `<p class="sub">${n} de ${tot} candidatos.</p>` : ''}<ol class="h-rank">${ord.map(([ci, v]) => { const c = cands[ci] || {}; return `<li><a class="h-rank-n" href="${cLink(r, c.n, extra)}">${esc(bonito(c.nm))}</a> ${chipP(c.sg)} ${situ(c.st)}<b>${fInt(v)}</b></li>`; }).join('')}</ol></section>`;
}
const secMapa = (id, titulo, sub) => `<section class="painel mapa-sec"><h2>${titulo}</h2><p class="sub">${sub}</p><div id="${id}" class="h-mapa"></div><div class="h-leg"></div></section>`;
// cor do foco: tom proporcional ao % dos válidos (0 → branco; máximo → cor do partido)
const escalaFoco = (cor, max) => p => (p > 0 ? mix('#f3f1f8', cor, Math.min(1, 0.15 + 0.85 * p / (max || 1))) : '#eeebf5');
const legFoco = (cor, max) => `<span><i style="background:linear-gradient(90deg,#f3f1f8,${cor})"></i>0% → ${fNum(max, 1)}% dos votos válidos</span>`;

// colunas das tabelas
const colNome = (t, extra) => ({ k: 'nome', t, h: x => `<b>${esc(x.nome)}</b>${extra ? extra(x) : ''}`, v: x => x.nome, ini: 'asc' });
function colsFoco(nomeCol, totFoco) {
  return [nomeCol,
    { k: 'fv', t: 'Votos', h: x => `<b>${fInt(x.u.fv)}</b>`, v: x => x.u.fv, cls: 'n' },
    { k: 'fp', t: '% dos válidos', h: x => x.u.vv ? `${fNum(pc(x.u.fv, x.u.vv), 2)}%` : '–', v: x => pc(x.u.fv, x.u.vv), cls: 'n' },
    { k: 'fs', t: 'Parcela da votação', h: x => `${fNum(pc(x.u.fv, totFoco), 2)}%`, v: x => x.u.fv, cls: 'n' },
    { k: 'ap', t: 'Aptos', h: x => fInt(x.u.ap), v: x => x.u.ap, cls: 'n' }];
}
function colsGeral(E, its, uTot, nomeCol, par) {
  if (E.prop) {   // proporcional: os maiores grupos (federação/coligação/partido) em %, sem a coluna "mais votado"
    const G = grupos(par), gt = vetG(uTot, G), top = G.map((g, i) => i).filter(i => gt[i] > 0).sort((a, b) => gt[b] - gt[a]).slice(0, 4);
    return [nomeCol, ...top.map(i => ({ k: 'g' + i, t: `${esc(G[i].tipo === 'P' ? G[i].nome : G[i].nome.replace(/^(Federação|Coligação) /, ''))} %`, h: x => { const v = vetG(x.u, [G[i]])[0]; return x.u.vv ? `<b>${fNum(pc(v, x.u.vv), 2)}%</b><small class="vt">${fInt(v)}</small>` : ''; }, v: x => pc(vetG(x.u, [G[i]])[0], x.u.vv), cls: 'n' })),
      { k: 'ap', t: 'Aptos', h: x => fInt(x.u.ap), v: x => x.u.ap, cls: 'n' }, { k: 'ab', t: 'Abstenção', h: x => `${fNum(x.u.pAb, 1)}%`, v: x => x.u.pAb, cls: 'n' }];
  }
  const top = uTot.v.map((x, i) => i).filter(i => uTot.v[i] > 0).sort((a, b) => uTot.v[b] - uTot.v[a]).slice(0, 3);
  return [nomeCol,
    { k: 'lid', t: 'Mais votado', h: x => x.u.lid >= 0 ? `<span class="h-lid" style="--c:${corPartido(its[x.u.lid].sg)}"><i></i>${esc(bonito(its[x.u.lid].nm))}</span>` : '–', v: x => x.u.lid >= 0 ? its[x.u.lid].nm : '' },
    ...top.map(i => ({ k: 'p' + i, t: `${esc(bonito(its[i].nm).split(' ')[0])} %`, h: x => x.u.vv ? `<b>${fNum(x.u.p[i], 2)}%</b><small class="vt">${fInt(x.u.v[i])}</small>` : '', v: x => x.u.p[i], cls: 'n' })),
    { k: 'ap', t: 'Aptos', h: x => fInt(x.u.ap), v: x => x.u.ap, cls: 'n' }, { k: 'ab', t: 'Abstenção', h: x => `${fNum(x.u.pAb, 1)}%`, v: x => x.u.pAb, cls: 'n' }];
}
// cor de cada unidade no mapa: com foco, tom do foco; sem foco, quem lidera (majoritário) ou o maior grupo (proporcional)
function pintor(E, its, par, foco, rows, cor) {
  if (foco) { const max = Math.max(1, ...rows.map(x => pc(x.u.fv, x.u.vv)).filter(isFinite)), f = escalaFoco(cor, max);
    return { fill: x => ({ fill: f(pc(x.u.fv, x.u.vv)), k: 'x', solo: true, lab: x.u.vv ? `${fNum(pc(x.u.fv, x.u.vv), 0)}%` : '' }), leg: legFoco(cor, max) }; }
  if (E.prop) { const G = grupos(par); return { fill: x => { const gv = vetG(x.u, G); let gi = -1; gv.forEach((v, i) => { if (v > 0 && (gi < 0 || v > gv[gi])) gi = i; }); return gi >= 0 ? { fill: corPartido(G[gi].sg), k: 'x', solo: true, lab: `${fNum(pc(gv[gi], x.u.vv), 0)}%`, _g: gi } : { k: null }; },
    leg: (() => { const cont = new Map(); rows.forEach(x => { const gv = vetG(x.u, G); let gi = -1; gv.forEach((v, i) => { if (v > 0 && (gi < 0 || v > gv[gi])) gi = i; }); if (gi >= 0) cont.set(gi, (cont.get(gi) || 0) + 1); }); return [...cont].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([i, n]) => `<span><i style="background:${corPartido(G[i].sg)}"></i>${esc(G[i].nome)} (${n})</span>`).join(''); })() }; }
  const cont = new Map(); rows.forEach(x => { if (x.u.lid >= 0) cont.set(x.u.lid, (cont.get(x.u.lid) || 0) + 1); });
  return { fill: x => x.u.lid >= 0 ? { fill: corPartido(its[x.u.lid].sg), k: 'x', solo: true, lab: `${fNum(x.u.p[x.u.lid], 0)}%` } : { k: null },
    leg: [...cont].sort((a, b) => b[1] - a[1]).slice(0, 8).map(([i, n]) => `<span><i style="background:${corPartido(its[i].sg)}"></i>${esc(bonito(its[i].nm))} (${n})</span>`).join('') };
}
const tip = (x, foco, nomeFoco) => `<b>${esc(x.nome)}</b>${foco ? `<br>${esc(nomeFoco)}: <b>${fInt(x.u.fv)}</b> votos (${fNum(pc(x.u.fv, x.u.vv), 1)}%)` : ''}<br><span class="t-s">${fInt(x.u.ap)} eleitores</span>`;
// cabeçalho do foco (candidato ou partido)
function cabFoco(r, F, uNivel, extra, onde) {
  const cor = F.cor, p = pc(uNivel.fv, uNivel.vv);
  const tags = F.t === 'c' ? `${chipP(F.sg, pLink(r, 'P:' + F.sg, extra))} ${F.grupo ? `<a class="h-lk h-sit" href="${pLink(r, F.grupo.k, extra)}">${esc(F.grupo.nome)}</a>` : ''} ${situ(F.st)}`
    : (F.membros?.length ? F.membros.map(sg => chipP(sg, pLink(r, 'P:' + sg, extra))).join(' ') : '') + (F.grupo ? ` <a class="h-lk h-sit" href="${pLink(r, F.grupo.k, extra)}">${esc(F.grupo.nome)}</a>` : '');
  return `<section class="painel h-foco" style="--fc:${cor}"><div class="h-foco-t"><span class="h-foco-k">${F.t === 'c' ? 'Candidato' : F.membros?.length > 1 ? 'Federação / coligação' : 'Partido'}</span><h2>${esc(F.nome)}</h2><div class="h-foco-tags">${tags}</div></div>
    <div class="kpis k3"><div class="kpi"><div class="kpi-t">Votos ${esc(onde)}</div><div class="kpi-v">${fInt(uNivel.fv)}</div></div><div class="kpi"><div class="kpi-t">% dos votos válidos</div><div class="kpi-v">${fNum(p, 2)}%</div></div>${F.extraKpi || ''}</div>
    <p class="sub"><a href="${H(r, extra, null)}">← Ver o resultado geral ${esc(onde)}</a></p></section>`;
}

// ---------- seletor de ano / cargo / turno ----------
function seletor(r, E) {
  const anos = ANOS_HIST.map(a => `<button type="button" data-h-ano="${a}" class="${a === r.ano ? 'on' : ''}">${a}</button>`).join('');
  const cargos = [...new Map(E.idx.el.map(e => [e.c, e])).values()];
  const cg = cargos.map(e => `<button type="button" data-h-el="${e.c}" class="${e.c === E.el.c ? 'on' : ''}">${esc(e.nome)}</button>`).join('');
  const turnos = E.idx.el.filter(e => e.c === E.el.c).map(e => `<button type="button" data-h-t="${e.id}" class="${e.id === E.el.id ? 'on' : ''}">${e.t}º turno</button>`).join('');
  return `<details class="eleicao sem-export"><summary><span class="p">${r.ano}</span><span class="p">${E.el.t}º turno</span><span class="p">${esc(E.el.nome)}</span><i>Alterar ▾</i></summary>
    <div class="fx"><div class="l"><small>Ano</small><div class="ch">${anos}</div></div>
    <div class="l"><small>Cargo</small><div class="ch">${cg}</div></div>
    <div class="l"><small>Turno</small><div class="sg">${turnos}</div></div></div></details>`;
}
function ligaSeletor(root, r, E, ir) {
  const el = root.querySelector('.eleicao'); if (!el) return;
  const resto = () => r.uf ? location.hash.split('?')[0].replace(/^#\/h\/\d+\/[^/]+/, '') : '';
  el.addEventListener('click', async ev => {
    const b = ev.target.closest('button'); if (!b) return;
    if (b.dataset.hAno) { const a = +b.dataset.hAno; let idx; try { idx = await idxAno(a); } catch { b.textContent = a + ' (em breve)'; return; }
      const e = idx.el.find(x => x.c === E.el.c && x.t === E.el.t) || idx.el.find(x => x.c === E.el.c) || idx.el[0];
      ir(`#/h/${a}/${e.id}${e.c === E.el.c ? resto() : (e.ab === E.ab && r.uf ? `/uf/${r.uf}` : '')}`); return; }
    if (b.dataset.hEl) { const c = +b.dataset.hEl, e = E.idx.el.find(x => x.c === c && x.t === 1) || E.idx.el.find(x => x.c === c);
      ir(`#/h/${r.ano}/${e.id}${r.uf ? (e.ab === E.ab ? resto() : `/uf/${r.uf}`) : ''}`); return; }
    if (b.dataset.hT) ir(`#/h/${r.ano}/${b.dataset.hT}${resto()}`);
  });
}

// ---------- telas ----------
export async function viewHist(r, ctx) {
  const E = await carregaEleicao(r);
  const nomeEl = `${E.el.nome} ${r.ano}${E.idx.el.some(e => e.c === E.el.c && e.t === 2) ? ` · ${E.el.t}º turno` : ''}`;
  let v;
  if (r.nivel === 'br') v = await telaBrasil(r, E, ctx, nomeEl);
  else if (r.nivel === 'uf' || r.nivel === 'reg') v = await telaUf(r, E, ctx, nomeEl);
  else v = await telaMun(r, E, ctx, nomeEl);
  const montar0 = v.montar;
  return { ...v, html: `<div class="aviso t1">Resultado <b>oficial</b> · ${esc(nomeEl)} · TSE (votação por seção)</div>${v.html}`, sel: seletor(r, E), montar(root) { ligaSeletor(root, r, E, ctx.ir); montar0?.(root); } };
}
const tituloF = (F, onde, nomeEl) => F ? `${F.nome} — ${onde} · ${nomeEl}` : `${onde} — ${nomeEl}`;

async function telaBrasil(r, E, ctx, nomeEl) {
  const trilha = [['Brasil']];
  if (E.ab === 'BR') {   // presidente
    const d = await arq(r.ano, `${r.id}/br.json`), its = d.cands, n = its.length, br = fecha(somaLinha(novaU(n), d.tot, false));
    const fi = r.foco?.t === 'c' ? its.findIndex(c => c.n === r.foco.n) : -1, F = fi >= 0 ? { t: 'c', nome: bonito(its[fi].nm), sg: its[fi].sg, st: its[fi].st, cor: corPartido(its[fi].sg) } : null;
    const ufs = Object.entries(d.uf).map(([uf, l]) => { const u = fecha(somaLinha(novaU(n), l, false)); if (F) u.fv = u.v[fi]; return { id: uf, nome: nomeUf(uf), u }; });
    if (F) br.fv = br.v[fi];
    const pin = pintor(E, its, null, F, ufs, F?.cor);
    return { titulo: tituloF(F, 'Brasil', nomeEl), trilha, html: `${F ? cabFoco(r, F, br, '', 'no Brasil') : barrasCand(r, E, its, br, '')}${kpis(br, '')}${secMapa('h-mapa-br', F ? `${esc(F.nome)} por estado` : 'Mais votado por estado', 'Clique em um estado para ver os municípios.')}<section class="painel"><h2>Estados</h2><div id="h-tab"></div></section>`,
      montar(root) {
        const por = Object.fromEntries(ufs.map(x => [x.id, x]));
        const mp = criarMapa(root.querySelector('#h-mapa-br'), ctx.geo, { onClick: id => ctx.ir(H(r, pUf(id))), tooltip: id => por[id] ? tip(por[id], F, F?.nome) : '' });
        mp.atualizar(Object.fromEntries(ufs.map(x => [x.id, pin.fill(x)]))); root.querySelector('.h-leg').innerHTML = pin.leg;
        tabela(root.querySelector('#h-tab'), { cols: F ? colsFoco(colNome('Estado'), br.fv) : colsGeral(E, its, br, colNome('Estado')), rows: ufs, onRow: x => ctx.ir(H(r, pUf(x.id))), sort: F ? 'fv' : 'nome', dir: F ? 'desc' : 'asc' });
      } };
  }
  const ufsIdx = E.idx.ufs.filter(u => u !== 'zz' && u !== 'br');
  const dados = (await Promise.all(ufsIdx.map(uf => arq(r.ano, `${r.id}/${uf}.json`).then(d => [uf, d]).catch(() => null)))).filter(Boolean);
  if (E.mun) {   // prefeito / vereador: escolha do estado (e, no prefeito, quantos municípios cada partido levou)
    const rows = dados.map(([uf, d]) => { const ms = Object.values(d.mun); const t = { ap: 0, n: ms.length, ele: 0, part: new Map() };
      for (const m of ms) { t.ap += m.tot[0]; if (E.prop) t.ele += m.ele || 0; else { const its = m.cands, u = fecha(somaLinha(novaU(its.length), m.tot, false)); const c = its.find(x => /^(ELEITO|MÉDIA$)/.test(x.st)) || (u.lid >= 0 ? its[u.lid] : null); if (c) t.part.set(c.sg, (t.part.get(c.sg) || 0) + 1); } }
      return { id: uf, nome: nomeUf(uf), ...t }; });
    const part = new Map(); rows.forEach(x => x.part.forEach((n, sg) => part.set(sg, (part.get(sg) || 0) + n)));
    const resumo = E.prop ? '' : `<section class="painel"><h2>${r.id.endsWith('t1') ? 'Prefeitos eleitos ou mais votados' : 'Prefeitos eleitos no 2º turno'}, por partido</h2><ol class="h-rank">${[...part].sort((a, b) => b[1] - a[1]).map(([sg, n]) => `<li>${chipP(sg)}<b>${fInt(n)}</b></li>`).join('')}</ol></section>`;
    return { titulo: `Brasil — ${nomeEl}`, trilha, html: `${resumo}<section class="painel"><h2>Estados</h2><p class="sub">Escolha um estado para ver os municípios.</p><div id="h-tab"></div></section>`,
      montar(root) { tabela(root.querySelector('#h-tab'), { cols: [colNome('Estado'), { k: 'n', t: 'Municípios', h: x => fInt(x.n), v: x => x.n, cls: 'n' }, ...(E.prop ? [{ k: 'ele', t: 'Vereadores eleitos', h: x => fInt(x.ele), v: x => x.ele, cls: 'n' }] : []), { k: 'ap', t: 'Aptos', h: x => fInt(x.ap), v: x => x.ap, cls: 'n' }], rows, onRow: x => ctx.ir(H(r, pUf(x.id), null)), sort: 'nome', dir: 'asc' }); } };
  }
  // governador, senador, deputados: um resumo por estado
  const F0 = r.foco?.t === 'p' ? r.foco.k : null;
  const rows = dados.map(([uf, d]) => {
    const its = E.prop ? d.par : d.cands, mvec = E.prop ? Object.values(d.mun).reduce((a, l) => { l[4].forEach((x, i) => { a[i] = (a[i] || 0) + x; }); return a; }, []) : null;
    const u = fecha(somaLinha(novaU(its.length), E.prop ? [...d.tot, mvec, []] : d.tot, E.prop));
    let ele = 0; if (F0 && E.prop) { const mem = membrosFoco(F0, d.par); u.fv = mem.reduce((a, i) => a + (u.v[i] || 0), 0); ele = mem.reduce((a, i) => a + (d.par[i].ele || 0), 0); }
    const venc = E.prop ? null : d.cands.find(c => /^(ELEITO|MÉDIA$)/.test(c.st)) || (u.lid >= 0 ? d.cands[u.lid] : null);
    return { id: uf, nome: nomeUf(uf), u, d, its, venc, ele, eleT: E.prop ? d.cands.filter(c => /^(ELEITO|MÉDIA$)/.test(c.st)).length : 0 }; });
  if (F0 && E.prop) {   // partido/federação no Brasil inteiro: votos e eleitos por estado
    const t = novaU(1); rows.forEach(x => somaU(t, x.u)); fecha(t); t.vv = rows.reduce((a, x) => a + x.u.vv, 0);
    const ref = rows.find(x => membrosFoco(F0, x.d.par).length); const nf = ref ? nomeFoco(F0, ref.d.par) : { nome: F0.slice(2), sg: F0.slice(2) };
    const eleT = rows.reduce((a, x) => a + x.ele, 0), F = { t: 'p', ...nf, cor: corPartido(nf.sg), extraKpi: `<div class="kpi"><div class="kpi-t">Eleitos</div><div class="kpi-v">${fInt(eleT)}</div></div>` };
    const pin = pintor(E, null, null, F, rows, F.cor);
    return { titulo: tituloF(F, 'Brasil', nomeEl), trilha, html: `${cabFoco(r, F, t, '', 'no Brasil')}${secMapa('h-mapa-br', `${esc(F.nome)} por estado`, 'Clique em um estado.')}<section class="painel"><h2>Estados</h2><div id="h-tab"></div></section>`,
      montar(root) { const por = Object.fromEntries(rows.map(x => [x.id, x]));
        const mp = criarMapa(root.querySelector('#h-mapa-br'), ctx.geo, { onClick: id => por[id] && ctx.ir(H(r, pUf(id))), tooltip: id => por[id] ? tip(por[id], F, F.nome) : '' });
        mp.atualizar(Object.fromEntries(rows.map(x => [x.id, pin.fill(x)]))); root.querySelector('.h-leg').innerHTML = pin.leg;
        tabela(root.querySelector('#h-tab'), { cols: [...colsFoco(colNome('Estado'), t.fv).slice(0, 3), { k: 'ele', t: 'Eleitos', h: x => fInt(x.ele), v: x => x.ele, cls: 'n' }], rows, onRow: x => ctx.ir(H(r, pUf(x.id))), sort: 'fv', dir: 'desc' }); } };
  }
  const cols = E.prop
    ? [colNome('Estado'), { k: 'ele', t: 'Eleitos', h: x => fInt(x.eleT), v: x => x.eleT, cls: 'n' }, { k: 'top', t: 'Mais votado', h: x => { const c = [...x.d.cands].sort((a, b) => b.v - a.v)[0]; return c ? `${esc(bonito(c.nm))} ${chipP(c.sg)}` : ''; }, v: () => '' }, { k: 'ap', t: 'Aptos', h: x => fInt(x.u.ap), v: x => x.u.ap, cls: 'n' }]
    : [colNome('Estado'), { k: 'venc', t: r.id.endsWith('t1') ? 'Eleito ou mais votado' : 'Eleito', h: x => x.venc ? `${esc(bonito(x.venc.nm))} ${chipP(x.venc.sg)} ${situ(x.venc.st)}` : '', v: x => x.venc?.nm || '' }, { k: 'pv', t: '% válidos', h: x => x.venc ? `<b>${fNum(x.u.p[x.its.indexOf(x.venc)], 2)}%</b>` : '', v: x => x.venc ? x.u.p[x.its.indexOf(x.venc)] : NaN, cls: 'n' }];
  let cad = '';   // composição das cadeiras: Câmara dos Deputados (soma dos estados) e renovação do Senado
  if (E.prop && E.el.c === 6) { const it = agrupa(rows.flatMap(x => x.d.par.map(p => ({ sg: p.sg, n: p.ele || 0 })))); cad = cadeirasHTML({ titulo: `Câmara dos Deputados · eleitos em ${r.ano}`, sub: 'Cada ponto é um deputado federal eleito, agrupado por partido, somando os 27 estados.', blocos: [{ rot: 'Brasil', itens: it, total: 513 }] }); }
  else if (!E.prop && E.el.c === 5) { const it = agrupa(rows.flatMap(x => x.d.cands.filter(c => /^(ELEITO|MÉDIA$)/.test(c.st)).map(c => ({ sg: c.sg, n: 1 })))), tt = r.ano % 8 === 2 ? 54 : 27; cad = cadeirasHTML({ titulo: `Senado · eleitos em ${r.ano}`, sub: `Renovação de ${tt === 54 ? 'dois terços' : 'um terço'} do Senado (${tt} das 81 cadeiras). As demais seguem com quem foi eleito na eleição anterior.`, blocos: [{ rot: 'Senadores eleitos', itens: it, total: tt }] }); }
  return { titulo: `Brasil — ${nomeEl}`, trilha, html: `${cad}${E.prop ? '' : secMapa('h-mapa-br', 'Mais votado por estado', 'Clique em um estado.')}<section class="painel"><h2>Estados</h2><p class="sub">Clique em um estado para ver ${E.prop ? 'partidos, federações, candidatos e municípios' : 'os candidatos e os municípios'}.</p><div id="h-tab"></div></section>`,
    montar(root) {
      ligarCadeiras(root);
      const por = Object.fromEntries(rows.map(x => [x.id, x])), alvo = root.querySelector('#h-mapa-br');
      if (alvo) { const mp = criarMapa(alvo, ctx.geo, { onClick: id => por[id] && ctx.ir(H(r, pUf(id))), tooltip: id => por[id]?.venc ? `<b>${esc(por[id].nome)}</b><br>${esc(bonito(por[id].venc.nm))} (${esc(por[id].venc.sg)})` : '' });
        mp.atualizar(Object.fromEntries(rows.map(x => [x.id, x.venc ? { fill: corPartido(x.venc.sg), k: 'x', solo: true, lab: esc(sgTxt(x.venc.sg)) } : { k: null }]))); }
      tabela(root.querySelector('#h-tab'), { cols, rows, onRow: x => ctx.ir(H(r, pUf(x.id))), sort: 'nome', dir: 'asc' });
    } };
}

// estado ou região do estado
async function telaUf(r, E, ctx, nomeEl) {
  const uf = r.uf, d = await arq(r.ano, `${r.id}/${uf}.json`), regs = await regioesUf(ctx, uf);
  const bm = ctx.B?.byUf?.[uf] || [], nomeMun = new Map(bm.map(b => [b.cd, bonito(b.nome)])), cdi = new Map(bm.map(b => [b.cd, String(b.cdi)]));
  let cds = Object.keys(d.mun), rg = null;
  if (r.nivel === 'reg' && regs?.regs[r.reg]) { rg = regs.regs[r.reg]; const s = new Set(rg.cds); cds = cds.filter(cd => s.has(cd)); }
  const extra = rg ? pReg(uf, r.reg) : pUf(uf), onde = rg ? rg.nome : nomeUf(uf);
  const trilha = [['Brasil', H(r, '', r.foco?.t === 'p' ? r.foco : null)], [nomeUf(uf), rg ? H(r, pUf(uf)) : undefined], ...(rg ? [[rg.nome]] : [])];
  const nomeDe = cd => nomeMun.get(cd) || cd;
  const regDe = new Map(); regs?.regs.forEach((x, i) => x.cds.forEach(cd => regDe.set(cd, i)));
  const colReg = regs && !rg ? [{ k: 'reg', t: 'Região', h: x => esc(regs.regs[regDe.get(x.id)]?.nome || ''), v: x => regs.regs[regDe.get(x.id)]?.nome || '' }] : [];
  const blocoRegs = regs && !rg ? `<section class="painel"><h2>Regiões</h2><p class="sub">${regs.regs.length} regiões · ${esc(regs.titulo)} · fonte: ${esc(regs.fonte || '')}. Clique numa região para ver os municípios.</p><div id="h-tab-reg"></div></section>` : '';
  const mapaUf = uf !== 'df' && uf !== 'zz';
  const linkMun = cd => ctx.ir(H(r, pMun(uf, cd)));

  if (E.mun) {   // prefeito ou vereador: cada município tem seus candidatos (a página do candidato começa no município)
    const rows = cds.map(cd => { const m = d.mun[cd];
      if (E.prop) return { id: cd, nome: nomeDe(cd), ap: m.tot[0], ele: m.ele, nc: m.nc, top: m.top || [] };
      const its = m.cands, u = fecha(somaLinha(novaU(its.length), m.tot, false)); const venc = its.find(c => /^(ELEITO|MÉDIA$)/.test(c.st)) || (u.lid >= 0 ? its[u.lid] : null);
      return { id: cd, nome: nomeDe(cd), u, its, venc, ap: u.ap }; });
    const cols = E.prop
      ? [colNome('Município'), ...colReg, { k: 'ele', t: 'Eleitos', h: x => fInt(x.ele), v: x => x.ele, cls: 'n' }, { k: 'nc', t: 'Candidatos', h: x => fInt(x.nc), v: x => x.nc, cls: 'n' }, { k: 'top', t: 'Mais votado', h: x => x.top[0] ? `${esc(bonito(x.top[0][0]))} ${chipP(x.top[0][1])} <small>${fInt(x.top[0][2])}</small>` : '', v: x => x.top[0]?.[2] || 0 }, { k: 'ap', t: 'Aptos', h: x => fInt(x.ap), v: x => x.ap, cls: 'n' }]
      : [colNome('Município'), ...colReg, { k: 'venc', t: r.id.endsWith('t1') ? 'Eleito ou mais votado' : 'Eleito', h: x => x.venc ? `${esc(bonito(x.venc.nm))} ${chipP(x.venc.sg)} ${situ(x.venc.st)}` : '', v: x => x.venc?.nm || '' }, { k: 'pv', t: '% válidos', h: x => x.venc ? `<b>${fNum(x.u.p[x.its.indexOf(x.venc)], 2)}%</b>` : '', v: x => x.venc ? x.u.p[x.its.indexOf(x.venc)] : NaN, cls: 'n' }, { k: 'ap', t: 'Aptos', h: x => fInt(x.ap), v: x => x.ap, cls: 'n' }];
    const part = new Map(); if (!E.prop) rows.forEach(x => { if (x.venc) part.set(x.venc.sg, (part.get(x.venc.sg) || 0) + 1); });
    const resumo = E.prop ? '' : `<section class="painel"><h2>Municípios por partido do ${r.id.endsWith('t1') ? 'eleito ou mais votado' : 'eleito'}</h2><ol class="h-rank">${[...part].sort((a, b) => b[1] - a[1]).map(([sg, n]) => `<li>${chipP(sg)}<b>${fInt(n)}</b></li>`).join('')}</ol></section>`;
    const rowsReg = regs ? regs.regs.map((x, i) => ({ i, nome: x.nome, n: x.cds.length })) : [];
    return { titulo: `${onde} — ${nomeEl}`, trilha, html: `${resumo}${mapaUf && !E.prop ? secMapa('h-mapa-mun', 'Partido do eleito por município', 'Clique em um município.') : ''}${blocoRegs}<section class="painel"><h2>Municípios</h2><p class="sub">Clique em um município para ver ${E.prop ? 'partidos, candidatos' : 'candidatos'}, bairros, locais e seções.</p><div id="h-tab"></div></section>`,
      montar(root) {
        if (blocoRegs) tabela(root.querySelector('#h-tab-reg'), { cols: [colNome('Região'), { k: 'n', t: 'Municípios', h: x => fInt(x.n), v: x => x.n, cls: 'n' }], rows: rowsReg, onRow: x => ctx.ir(H(r, pReg(uf, x.i))), sort: 'nome', dir: 'asc' });
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

  // governador, senador, presidente (no estado), deputados
  const its = E.prop ? d.par : d.cands, n = its.length;
  const munU = new Map(cds.map(cd => [cd, fecha(somaLinha(novaU(n), d.mun[cd], E.prop))]));
  // foco: candidato (majoritário: vetor; deputado: arquivo do candidato) ou partido/federação
  let F = null;
  if (r.foco?.t === 'c') {
    const ci = d.cands.findIndex(c => c.n === r.foco.n);
    if (ci >= 0) { const c = d.cands[ci], par = E.prop ? d.par.find(p => p.sg === c.sg) : null;
      F = { t: 'c', nome: bonito(c.nm), sg: c.sg, st: c.st, cor: corPartido(c.sg), grupo: par?.fed ? { k: `${par.tg || 'F'}:${par.fed}`, nome: par.tg === 'C' ? `Coligação ${bonito(par.fed)}` : `Federação ${sgTxt(par.fed)}` } : null };
      if (E.prop) { const C = await arq(r.ano, `${r.id}/${uf}/c/${c.n}.json`).catch(() => ({ m: {} })); for (const [cd, u] of munU) u.fv = C.m[cd] || 0; }
      else for (const u of munU.values()) u.fv = u.v[ci]; }
  } else if (r.foco?.t === 'p' && E.prop) {
    const mem = membrosFoco(r.foco.k, d.par);
    if (mem.length) { const nf = nomeFoco(r.foco.k, d.par), ele = mem.reduce((a, i) => a + (d.par[i].ele || 0), 0);
      F = { t: 'p', ...nf, cor: corPartido(nf.sg), mem, extraKpi: r.nivel === 'uf' ? `<div class="kpi"><div class="kpi-t">Eleitos</div><div class="kpi-v">${fInt(ele)}</div></div>` : '' };
      for (const u of munU.values()) u.fv = mem.reduce((a, i) => a + (u.v[i] || 0), 0); }
  }
  const tot = fecha(novaU(n)); { const t = novaU(n); for (const u of munU.values()) somaU(t, u); Object.assign(tot, fecha(t)); }
  const rows = cds.map(cd => ({ id: cd, nome: nomeDe(cd), u: munU.get(cd) }));
  const rowsReg = regs && !rg ? regs.regs.map((x, i) => { const t = novaU(n); for (const cd of x.cds) { const u = munU.get(cd); if (u) somaU(t, u); } return { i, id: i, nome: x.nome, n: x.cds.length, u: fecha(t) }; }) : [];
  // listas de candidatos
  let blocoCand = '';
  if (E.prop) {
    const memSg = F?.t === 'p' ? new Set(F.mem.map(i => d.par[i].sg)) : null;
    if (r.nivel === 'uf' && (!F || F.t === 'p')) blocoCand = `<section class="painel"><h2>${F ? `Candidatos — ${esc(F.nome)}` : 'Candidatos'}</h2><p class="sub">${fInt(d.cands.filter(c => /^(ELEITO|MÉDIA$)/.test(c.st) && (!memSg || memSg.has(c.sg))).length)} eleitos. Clique num nome para ver a votação do candidato.</p><div id="h-tab-c"></div></section>`;
    else if (!F || F.t === 'p') blocoCand = listaCands(r, d.cands, tot.cv, extra, { titulo: F ? `Candidatos mais votados na região — ${esc(F.nome)}` : 'Candidatos mais votados na região', aprox: true, filtro: memSg ? c => memSg.has(c.sg) : null });
  }
  const topo = F ? cabFoco(r, F, tot, extra, rg ? 'na região' : 'no estado') : (E.prop ? barrasGrupos(r, d.par, tot, extra, { ele: r.nivel === 'uf' }) : barrasCand(r, E, its, tot, extra));
  const pin = pintor(E, its, d.par, F, rows, F?.cor);
  const rotMapa = F ? `${esc(F.nome)} por município` : E.prop ? 'Maior partido ou federação por município' : 'Mais votado por município';
  let cadUf = '';   // composição das cadeiras do estado (deputados)
  if (E.prop && r.nivel === 'uf' && !F && d.par) { const it = agrupa(d.par.map(p => ({ sg: p.sg, n: p.ele || 0 }))), n = it.reduce((a, x) => a + x.n, 0), c = E.el.c;
    cadUf = cadeirasHTML({ titulo: `${c === 6 ? 'Deputados federais' : c === 8 ? 'Câmara Legislativa' : 'Assembleia Legislativa'} · ${onde} · eleitos em ${r.ano}`, sub: 'Cada ponto é um deputado eleito, agrupado por partido.', blocos: [{ rot: onde, itens: it, total: n }] }); }
  return { titulo: tituloF(F, onde, nomeEl), trilha, html: `${topo}${cadUf}${F ? '' : kpis(tot, 'municípios')}${blocoCand}${mapaUf ? secMapa('h-mapa-mun', rotMapa, 'Clique em um município.') : ''}${blocoRegs}<section class="painel"><h2>Municípios${rg ? ' da região' : ''}</h2><p class="sub">Clique em um município para descer a bairros, locais de votação e seções.</p><div id="h-tab"></div></section>`,
    montar(root) { ligarCadeiras(root);
      if (E.prop && root.querySelector('#h-tab-c')) { const memSg = F?.t === 'p' ? new Set(F.mem.map(i => d.par[i].sg)) : null, lista = memSg ? d.cands.filter(c => memSg.has(c.sg)) : d.cands;
        tabela(root.querySelector('#h-tab-c'), { cols: [{ k: 'nm', t: 'Candidato', h: c => `<b>${esc(bonito(c.nm))}</b> ${situ(c.st)}`, v: c => c.nm }, { k: 'sg', t: 'Partido', h: c => chipP(c.sg), v: c => c.sg }, { k: 'v', t: 'Votos', h: c => fInt(c.v), v: c => c.v, cls: 'n' }, { k: 'pv', t: '% válidos', h: c => `${fNum(pc(c.v, tot.vv), 2)}%`, v: c => c.v, cls: 'n' }], rows: lista, onRow: c => ctx.ir(cLink(r, c.n, extra)), sort: 'v', dir: 'desc', filtro: (c, q) => sem(c.nm).includes(q) || sem(c.sg).includes(q), limite: 200 }); }
      if (blocoRegs) tabela(root.querySelector('#h-tab-reg'), { cols: F ? colsFoco(colNome('Região'), tot.fv) : colsGeral(E, its, tot, colNome('Região'), d.par), rows: rowsReg, onRow: x => ctx.ir(H(r, pReg(uf, x.i))), sort: F ? 'fv' : 'nome', dir: F ? 'desc' : 'asc' });
      tabela(root.querySelector('#h-tab'), { cols: (F ? colsFoco(colNome('Município'), tot.fv) : colsGeral(E, its, tot, colNome('Município'), d.par)).concat(colReg), rows, onRow: x => linkMun(x.id), sort: F ? 'fv' : 'nome', dir: F ? 'desc' : 'asc', filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
      const alvo = root.querySelector('#h-mapa-mun');
      if (alvo) getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
        const idCd = new Map([...cdi].map(([cd, i]) => [i, cd])), por = new Map(rows.map(x => [x.id, x])), noMapa = new Set(cds.map(cd => cdi.get(cd)));
        if (rg) for (const id of Object.keys(geo.muns)) if (!noMapa.has(id)) delete geo.muns[id];
        for (const [id, g] of Object.entries(geo.muns)) { const m = por.get(idCd.get(id)); if (m) g.n = m.nome; }
        const mp = criarMapaMun(alvo, geo, { onClick: id => { const cd = idCd.get(id); if (cd) linkMun(cd); }, tooltip: id => { const x = por.get(idCd.get(id)); return x ? tip(x, F, F?.nome) : ''; } });
        mp.atualizar(Object.fromEntries(rows.filter(x => cdi.get(x.id)).map(x => [cdi.get(x.id), { ...pin.fill(x), peso: x.u.ap }])));
        root.querySelector('.h-leg').innerHTML = pin.leg;
      }).catch(() => { alvo.innerHTML = '<p class="aviso">Mapa indisponível.</p>'; });
      ctx.csv = () => ({ nome: `${r.ano}_${r.id}_${uf}_municipios`, cab: ['Município', 'Aptos', 'Comparecimento', 'Brancos', 'Nulos', ...(F ? [F.nome] : its.map(it => E.prop ? it.sg : it.nm))], linhas: rows.map(x => [x.nome, x.u.ap, x.u.c, x.u.br, x.u.nu, ...(F ? [x.u.fv] : x.u.v)]) });
    } };
}

// município e abaixo (distrito/região do município, bairro, local, seção)
async function telaMun(r, E, ctx, nomeEl) {
  const uf = r.uf, cd = r.cd;
  const [ufd, sec, loc, geo, geoB] = await Promise.all([
    arq(r.ano, `${r.id}/${uf}.json`), arq(r.ano, `${r.id}/${uf}/${cd}.json`), arq(r.ano, `locais/${uf}/${cd}.json`).catch(() => ({ l: [] })),
    getJSON(`data/bairros_geo/${cd}.json`, { retries: 0 }).catch(() => null), getJSON(`data/regioes/${cd}_bairros.json`, { retries: 0 }).catch(() => null)]);
  const bm = ctx.B?.byUf?.[uf] || [], nomeM = bonito(bm.find(b => b.cd === cd)?.nome || cd);
  const par = E.prop ? (E.mun ? sec.par : ufd.par) : null, cands = E.mun ? sec.cands : ufd.cands;
  const its = E.prop ? par : cands, n = its.length;
  // foco por seção
  let F = null, fSec = null;
  if (r.foco?.t === 'c') {
    const ci = cands.findIndex(c => c.n === r.foco.n);
    if (ci >= 0) { const c = cands[ci], p = E.prop ? par.find(x => x.sg === c.sg) : null;
      F = { t: 'c', nome: bonito(c.nm), sg: c.sg, st: c.st, cor: corPartido(c.sg), grupo: p?.fed ? { k: `${p.tg || 'F'}:${p.fed}`, nome: p.tg === 'C' ? (/^colig/i.test(p.fed) ? bonito(p.fed) : `Coligação ${bonito(p.fed)}`) : `Federação ${sgTxt(p.fed)}` } : null };
      if (!E.prop) fSec = k => sec.s[k]?.[4 + ci] || 0;
      else { const lst = E.mun ? ((await arq(r.ano, `${r.id}/${uf}/${cd}/cs.json`).catch(() => ({})))[ci] || []) : ((await arq(r.ano, `${r.id}/${uf}/c/${c.n}.json`).catch(() => ({ s: {} }))).s[cd] || []);
        const mp = new Map(); for (let i = 0; i < lst.length; i += 3) mp.set(`${lst[i]}-${lst[i + 1]}`, (mp.get(`${lst[i]}-${lst[i + 1]}`) || 0) + lst[i + 2]); fSec = k => mp.get(k) || 0; } }
  } else if (r.foco?.t === 'p' && E.prop) {
    const mem = membrosFoco(r.foco.k, par);
    if (mem.length) { const nf = nomeFoco(r.foco.k, par); F = { t: 'p', ...nf, cor: corPartido(nf.sg), mem }; fSec = k => { const pv = sec.s[k]?.[4] || []; return mem.reduce((a, i) => a + (pv[i] || 0), 0); }; }
  }
  const temDist = geo?.rotulo === 'distrito', geoBairro = temDist ? geoB : (geo?.rotulo === 'bairro' ? geo : null);
  const nomeDist = i => geo?.f?.[i]?.n || '';
  const rotD = geo?.rotuloNome || 'Distrito', rotDp = geo?.rotuloPlural || 'Distritos';
  const L = loc.l.map(l => { const [z, nr, nome, end, baiTse, lat, lon, secs, g, b] = l; const gb = temDist ? b : g;
    const bairro = geoBairro && gb >= 0 ? geoBairro.f[gb]?.n : (baiTse || '(sem bairro informado)');
    const u = novaU(n), ss = [];
    for (const s of secs) { const k = `${z}-${s}`, lin = sec.s[k]; if (!lin) continue; somaLinha(u, lin, E.prop); if (fSec) u.fv += fSec(k); ss.push([s, lin]); }
    return { id: `${z}-${nr}`, z, nr, nome: bonito(nome), end: bonito(end), bairro: bonito(bairro), di: temDist && g >= 0 ? g : -1, lat, lon, u: fecha(u), ss }; }).filter(x => x.ss.length);
  const uMun = unidade(Object.values(sec.s), n, E.prop); if (E.prop) uMun.cv = new Map((sec.cv || []).map(([ci, v]) => [ci, v]));
  if (fSec) uMun.fv = Object.keys(sec.s).reduce((a, k) => a + fSec(k), 0);
  const base = pMun(uf, cd);
  const agrupa = (ls, chave) => { const m = new Map(); for (const l of ls) { const k = chave(l); if (!m.has(k)) m.set(k, { id: k, ls: [], u: novaU(n) }); const g = m.get(k); g.ls.push(l); somaU(g.u, l.u); } for (const g of m.values()) fecha(g.u); return [...m.values()]; };
  const trilha0 = [['Brasil', H(r, '', null)], [nomeUf(uf), H(r, pUf(uf), E.mun && r.foco?.t === 'c' ? null : r.foco)]];
  const colsT = (nomeCol, uRef) => F ? colsFoco(nomeCol, uRef.fv) : colsGeral(E, its, uRef, nomeCol, par);
  const ordT = F ? ['fv', 'desc'] : ['nome', 'asc'];
  const tabLocais = `<section class="painel"><h2>Locais de votação</h2><p class="sub">Clique em um local para ver as seções.</p><div id="h-tab-l"></div></section>`;
  const montaLocais = (root, ls, uRef) => tabela(root.querySelector('#h-tab-l'), { cols: colsT({ k: 'nome', t: 'Local', h: x => `<b>${esc(x.nome)}</b><small class="vt">${esc(x.end)}${x.bairro ? ' · ' + esc(x.bairro) : ''}</small>`, v: x => x.nome, ini: 'asc' }, uRef), rows: ls, onRow: x => ctx.ir(H(r, `${base}/l/${encodeURIComponent(x.id)}`)), sort: ordT[0], dir: ordT[1], filtro: (x, q) => sem(x.nome + ' ' + x.bairro + ' ' + x.end).includes(q), limite: 300 });
  const mapaPontos = (root, ls) => { const el = root.querySelector('#h-mapa-pt'); if (!el) return; const pts = ls.filter(x => x.lat && x.lon).map(x => ({ id: x.id, lat: x.lat, lon: x.lon, ap: x.u.ap }));
    if (pts.length < 2) { el.closest('section').remove(); return; }
    const por = new Map(ls.map(x => [x.id, x])), pin = pintor(E, its, par, F, ls, F?.cor);
    const mp = criarMapaPontos(el, pts, { tooltip: id => { const x = por.get(id); return x ? tip(x, F, F?.nome) : ''; }, onClick: id => ctx.ir(H(r, `${base}/l/${encodeURIComponent(id)}`)) });
    mp.atualizar(Object.fromEntries(ls.map(x => [x.id, { fill: pin.fill(x).fill || '#c9c4d8' }]))); el.closest('section').querySelector('.h-leg').innerHTML = pin.leg; };
  const secPts = secMapa('h-mapa-pt', 'Mapa dos locais de votação', F ? `Tom = % dos votos válidos de ${esc(F.nome)} no local; tamanho = eleitorado.` : 'Cor = mais votado no local; tamanho = eleitorado.');
  // topo de cada nível: foco ou resultado geral
  const topo = (u, onde, extra, { aprox = true, titCands } = {}) => {
    if (F) { let h = cabFoco(r, F, u, extra, onde);
      if (F.t === 'p' && E.prop) { const memSg = new Set(F.mem.map(i => par[i].sg)); h += listaCands(r, cands, u.cv, extra, { titulo: `Candidatos — ${esc(F.nome)} ${onde}`, aprox, filtro: c => memSg.has(c.sg) }); }
      return h; }
    return (E.prop ? barrasGrupos(r, par, u, extra, { ele: E.mun && r.nivel === 'mun' }) + listaCands(r, cands, u.cv, extra, { titulo: titCands || `Candidatos mais votados ${onde}`, aprox }) : barrasCand(r, E, cands, u, extra)) + kpis(u);
  };

  // ----- seção -----
  if (r.nivel === 'secao') {
    const l = L.find(x => x.ss.some(([s]) => `${x.z}-${s}` === r.secao)), lin = sec.s[r.secao];
    if (!lin) return { titulo: 'Seção não encontrada', trilha: trilha0, html: '<div class="aviso">Seção não encontrada.</div>', montar() {} };
    const u = unidade([lin], n, E.prop); if (fSec) u.fv = fSec(r.secao); const [z, s] = r.secao.split('-');
    const extra = `${base}/s/${encodeURIComponent(r.secao)}`;
    return { titulo: tituloF(F, `Seção ${s} (zona ${z})`, nomeEl), trilha: [...trilha0, [nomeM, H(r, base)], ...(l ? [[l.nome, H(r, `${base}/l/${encodeURIComponent(l.id)}`)]] : []), [`Seção ${s}`]],
      html: `${l ? `<p class="sub">${esc(l.nome)} · ${esc(l.end)} · ${esc(l.bairro)} · ${esc(nomeM)}</p>` : ''}${F ? cabFoco(r, F, u, extra, 'na seção') : ''}${E.prop ? barrasGrupos(r, par, u, extra) + listaCands(r, cands, new Map(lin[5] || []), extra, { titulo: 'Candidatos mais votados na seção', n: 10 }) : barrasCand(r, E, cands, u, extra, 40)}${kpis(u)}`, montar() {} };
  }
  // ----- local: seções -----
  if (r.nivel === 'local') {
    const l = L.find(x => x.id === r.local);
    if (!l) return { titulo: 'Local não encontrado', trilha: trilha0, html: '<div class="aviso">Local de votação não encontrado.</div>', montar() {} };
    const rows = l.ss.map(([s, lin]) => { const u = unidade([lin], n, E.prop); if (fSec) u.fv = fSec(`${l.z}-${s}`); return { id: `${l.z}-${s}`, nome: `Seção ${s}`, s, u }; });
    const extra = `${base}/l/${encodeURIComponent(l.id)}`;
    return { titulo: tituloF(F, l.nome, nomeEl), trilha: [...trilha0, [nomeM, H(r, base)], ...(l.di >= 0 ? [[nomeDist(l.di), H(r, `${base}/d/${l.di}`)]] : []), [l.bairro, H(r, `${base}/b/${encodeURIComponent(l.bairro)}`)], [l.nome]],
      html: `<p class="sub">${esc(l.end)} · ${esc(l.bairro)} · zona ${l.z}</p>${topo(l.u, 'no local', extra)}<section class="painel"><h2>Seções</h2><p class="sub">Clique numa seção para ver o boletim completo.</p><div id="h-tab-s"></div></section>`,
      montar(root) { tabela(root.querySelector('#h-tab-s'), { cols: colsT({ k: 's', t: 'Seção', h: x => `<b>${x.s}</b>`, v: x => x.s, ini: 'asc' }, l.u), rows, onRow: x => ctx.ir(H(r, `${base}/s/${encodeURIComponent(x.id)}`)), sort: F ? 'fv' : 's', dir: F ? 'desc' : 'asc' });
        ctx.csv = () => ({ nome: `${r.ano}_${r.id}_${cd}_${l.id}_secoes`, cab: ['Seção', 'Aptos', 'Comparecimento', 'Brancos', 'Nulos', ...(F ? [F.nome] : its.map(it => E.prop ? it.sg : it.nm))], linhas: rows.map(x => [x.s, x.u.ap, x.u.c, x.u.br, x.u.nu, ...(F ? [x.u.fv] : x.u.v)]) }); } };
  }
  const bairros = agrupa(L, x => x.bairro).map(b => ({ ...b, nome: b.id }));
  const colB = { k: 'nome', t: 'Bairro', h: x => `<b>${esc(x.nome)}</b><small class="vt">${x.ls.length} locais</small>`, v: x => x.nome, ini: 'asc' };
  // ----- bairro -----
  if (r.nivel === 'bairro') {
    const b = bairros.find(x => x.id === r.bairro) || { id: r.bairro, ls: [], u: fecha(novaU(n)) };
    const di = b.ls[0]?.di ?? -1, extra = `${base}/b/${encodeURIComponent(r.bairro)}`;
    return { titulo: tituloF(F, r.bairro, nomeEl), trilha: [...trilha0, [nomeM, H(r, base)], ...(di >= 0 ? [[nomeDist(di), H(r, `${base}/d/${di}`)]] : []), [r.bairro]],
      html: `${topo(b.u, 'no bairro', extra)}${secPts}${tabLocais}`, montar(root) { mapaPontos(root, b.ls); montaLocais(root, b.ls, b.u); } };
  }
  // ----- distrito / região do município -----
  if (r.nivel === 'dist') {
    const ls = L.filter(x => x.di === r.di), u = agrupa(ls, () => 0)[0]?.u || fecha(novaU(n)), bs = agrupa(ls, x => x.bairro).map(b => ({ ...b, nome: b.id })), extra = `${base}/d/${r.di}`;
    return { titulo: tituloF(F, nomeDist(r.di), nomeEl), trilha: [...trilha0, [nomeM, H(r, base)], [nomeDist(r.di)]],
      html: `${topo(u, rotD === 'Região' ? 'na região' : 'no distrito', extra)}<section class="painel"><h2>Bairros</h2><div id="h-tab-b"></div></section>${secPts}${tabLocais}`,
      montar(root) { tabela(root.querySelector('#h-tab-b'), { cols: colsT(colB, u), rows: bs, onRow: x => ctx.ir(H(r, `${base}/b/${encodeURIComponent(x.id)}`)), sort: ordT[0], dir: ordT[1], filtro: (x, q) => sem(x.nome).includes(q) }); mapaPontos(root, ls); montaLocais(root, ls, u); } };
  }
  // ----- município -----
  const dists = temDist ? agrupa(L.filter(x => x.di >= 0), x => x.di).map(g => ({ ...g, nome: nomeDist(g.id) })) : [];
  return { titulo: tituloF(F, nomeM, nomeEl), trilha: [...trilha0, [nomeM]],
    html: `${topo(uMun, 'no município', base, { aprox: false })}
      ${dists.length ? `<section class="painel"><h2>${esc(rotDp)}</h2><p class="sub">${esc(geo.fonte || '')}</p><div id="h-tab-d"></div></section>` : ''}
      <section class="painel"><h2>Bairros</h2><p class="sub">${geoBairro ? 'Bairro pela localização do local de votação (malha oficial).' : 'Bairro informado pelo TSE para o local de votação.'}</p><div id="h-tab-b"></div></section>
      ${secPts}${tabLocais}`,
    montar(root) {
      if (dists.length) tabela(root.querySelector('#h-tab-d'), { cols: colsT({ k: 'nome', t: rotD, h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' }, uMun), rows: dists, onRow: x => ctx.ir(H(r, `${base}/d/${x.id}`)), sort: ordT[0], dir: ordT[1] });
      tabela(root.querySelector('#h-tab-b'), { cols: colsT(colB, uMun), rows: bairros, onRow: x => ctx.ir(H(r, `${base}/b/${encodeURIComponent(x.id)}`)), sort: ordT[0], dir: ordT[1], filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
      mapaPontos(root, L); montaLocais(root, L, uMun);
      ctx.csv = () => ({ nome: `${r.ano}_${r.id}_${cd}_locais`, cab: ['Local', 'Bairro', 'Aptos', 'Comparecimento', 'Brancos', 'Nulos', ...(F ? [F.nome] : its.map(it => E.prop ? it.sg : it.nm))], linhas: L.map(x => [x.nome, x.bairro, x.u.ap, x.u.c, x.u.br, x.u.nu, ...(F ? [x.u.fv] : x.u.v)]) });
    } };
}
