// Aba "Resultados 1º Turno": resultado oficial do TSE por candidato (Brasil › estado › município; bairro e local em bairros.js).
// Dados: data/res_1t.json (scripts/res1t.mjs). Linha de unidade: [ts, st, te, c, a, vb, tvn, ...votos por candidato]; município tem o código na frente.
import { CAND, PAL, UF_NOME, UFS, fInt, fNum, setEscala, corDoPct, corTexto, ESC } from './util.js?v=1df2c59c';
import { esc, tabela, sem, entenda } from './ui.js?v=1df2c59c';
import { getFoco } from './foco.js?v=1df2c59c';
import { kpi } from './views.js?v=1df2c59c';
import { criarMapa } from './map.js?v=1df2c59c';
import { criarMapaMun } from './mapamun.js?v=1df2c59c';
import { getJSON } from './tse.js?v=1df2c59c';
import { govTopo, govPainel, govTabelaHtml, govTabelaMontar, senPainel, senTabelaHtml, senTabelaMontar } from './governador.js?v=1df2c59c';
import { leitura, balao } from './insights.js?v=1df2c59c';
import { dispersao } from './dispersao.js?v=1df2c59c';

let cache = null, formaMapa = 'areas', eixoDisp = 'abst';
export const carregarT1 = () => (cache ??= getJSON('data/res_1t.json', { retries: 2 }));
const CORES = ['#e8890c', '#2f9e6b', '#7a4fc4', '#17a2b8', '#c9a400', '#d6336c', '#6c757d', '#8d6e63', '#0b7285', '#a61e4d'];
export const ESCALA_T1 = [25, 65];
export const bonitoNome = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E) /g, x => x.toLowerCase());

export function prepT1(T) {
  if (T.chave) return T;
  T.chave = T.cands.map(c => c.n === '13' ? 'L' : c.n === '22' ? 'F' : 'c' + c.n);
  let j = 0; T.chave.forEach(k => { if (k !== 'L' && k !== 'F') PAL[k] = CORES[j++ % CORES.length]; });
  T.cor = i => T.chave[i] === 'L' ? CAND.L.cor : T.chave[i] === 'F' ? CAND.F.cor : PAL[T.chave[i]];
  T.nome = i => { const c = T.cands[i]; if (T.chave[i] === 'L' || T.chave[i] === 'F') return CAND[T.chave[i]].nome; return bonitoNome(c.nmu || c.nm || ('Candidato ' + c.n)); };
  const CURTO = { 70: 'Cury', 55: 'Caiado', 14: 'Renan', 16: 'Hertz', 27: 'Clariana', 21: 'Edmilson', 35: 'Grassi', 29: 'Rui Pimenta', 13: 'Lula', 22: 'Flávio' };
  T.curto = i => CURTO[+T.cands[i].n] || T.nome(i).split(' ')[0];
  T.part = i => { const c = T.cands[i]; return c.sg || (c.n === '13' ? 'PT' : c.n === '22' ? 'PL' : ''); };
  const iL = T.cands.findIndex(c => c.n === '13'), iF = T.cands.findIndex(c => c.n === '22'); T.iL = iL; T.iF = iF;
  return T;
}
// linha -> unidade com % calculados (o = posição do "ts": 0 para BR/UF, 1 para município)
export function dec(T, r, o = 0) {
  const v = r.slice(o + 7), vv = v.reduce((a, b) => a + b, 0), te = r[o + 2], c = r[o + 3], ab = Math.max(0, te - c), vb = r[o + 5], tvn = r[o + 6];
  const p = v.map(x => vv ? 100 * x / vv : NaN); let lid = -1; v.forEach((x, i) => { if (lid < 0 || x > v[lid]) lid = i; });
  return { ts: r[o], st: r[o + 1], te, c, ab, vb, tvn, v, vv, p, lid, pAb: te ? 100 * ab / te : NaN, pBr: c ? 100 * vb / c : NaN, pNu: c ? 100 * tvn / c : NaN, pL: p[T.iL], pF: p[T.iF], L: v[T.iL], F: v[T.iF] };
}
const chip = (T, i) => `<span class="chip-l" style="background:${T.cor(i)};color:${corTexto(T.cor(i))}">${esc(T.curto(i))}</span>`;

export const idxFoco = T => { const f = getFoco(); return f ? T.chave.indexOf(f) : -1; };
const ranks = v => v.map((x, i) => 1 + v.filter(y => y > x).length);
const baseHash = () => (location.hash.split('?')[0] || '#/t1');
// ficha de candidato (clicável: seleciona o candidato para acompanhar no mapa e nas tabelas)
function ficha(T, i, u, { selo, ativa, rk }) {
  const c = T.cands[i], href = ativa ? baseHash() : `${baseHash()}?c=${encodeURIComponent(T.chave[i])}`;
  return `<a class="ficha${ativa ? ' ativa' : ''}" href="${href}" style="--c:${T.cor(i)}" aria-pressed="${ativa}" title="${ativa ? 'Clique para limpar a seleção' : 'Clique para ver ' + esc(T.nome(i)) + ' no mapa e nas tabelas'}">
    <span class="pos-rank">${rk}º</span>
    <div class="ficha-topo"><span class="ficha-num">${esc(c.n)}</span><div class="ficha-id"><div class="ficha-nome">${esc(T.nome(i))}</div><div class="ficha-part">${esc(T.part(i))}</div></div></div>
    <div class="ficha-pct">${fNum(u.p[i], 2)}%</div><div class="ficha-votos"><b>${fInt(u.v[i])}</b> votos</div>
    <div class="ficha-rodape">${selo ? `<span class="selo-2t">${selo}</span>` : '<span></span>'}<span class="ficha-dica sem-export">${ativa ? '✓ ativo · limpar' : 'acompanhar ›'}</span></div></a>`;
}
// topo padrão das telas do 1º turno: resumo (barra com todos os candidatos) + uma ficha por candidato
export function topoT1(T, u, rotulo, { brasil } = {}) {
  const fi = idxFoco(T), ord = u.v.map((x, i) => i).sort((a, b) => u.v[b] - u.v[a]), rk = ranks(u.v);
  const resumo = `<section class="painel resumo"><div class="centro-t">${esc(rotulo)} · 1º turno</div><div class="barra2" role="img" aria-label="Votos válidos por candidato">${ord.map(i => `<i style="width:${isFinite(u.p[i]) ? u.p[i] : 0}%;background:${T.cor(i)}" title="${esc(T.nome(i))} ${fNum(u.p[i], 2)}%"></i>`).join('')}</div><div class="resumo-t"><span><b>${fInt(u.vv)}</b> votos válidos</span><span class="sem-export">Clique numa ficha para acompanhar o candidato no mapa e nas tabelas</span></div></section>`;
  const aviso = fi >= 0 ? `<div class="foco-aviso sem-export"><span>O mapa e as tabelas mostram o desempenho de <b style="color:${T.cor(fi)}">${esc(T.nome(fi))}</b>.</span><a href="${baseHash()}">Limpar seleção ✕</a></div>` : '';
  return resumo + aviso + `<section class="fichas" aria-label="Candidatos">${ord.map(i => ficha(T, i, u, { selo: brasil && /2º turno/i.test(T.cands[i].st) ? 'Foi ao 2º turno' : '', ativa: i === fi, rk: rk[i] })).join('')}</section>`;
}
export const unidadeV = (T, V) => { const vv = V.reduce((a, b) => a + b, 0), p = V.map(x => vv ? 100 * x / vv : NaN); let lid = -1; V.forEach((x, i) => { if (lid < 0 || x > V[lid]) lid = i; }); return { v: V, vv, p, lid, pL: p[T.iL], pF: p[T.iF] }; };
export const kpisT1 = u => `<section class="kpis k4">${kpi('Comparecimento', fNum(100 - u.pAb, 2) + '%', null, `${fInt(u.c)} de ${fInt(u.te)} eleitores`)}${kpi('Abstenção', fNum(u.pAb, 2) + '%', null, `${fInt(u.ab)} eleitores`)}${kpi('Votos em branco', fNum(u.pBr, 2) + '%', null, `${fInt(u.vb)} votos`)}${kpi('Votos nulos', fNum(u.pNu, 2) + '%', null, `${fInt(u.tvn)} votos`)}</section>`;
// escala do mapa: com candidato em foco, vai do P5 ao P95 dos valores desse candidato; sem foco, escala fixa do 1º turno
export function aplicaEscala(T, valores) {
  const fi = idxFoco(T); if (fi < 0) { setEscala(...ESCALA_T1); return; }
  const v = valores.filter(x => isFinite(x)).sort((a, b) => a - b); if (!v.length) { setEscala(0, 50); return; }
  let lo = Math.floor(v[Math.floor(.05 * (v.length - 1))] / 5) * 5, hi = Math.ceil(v[Math.ceil(.95 * (v.length - 1))] / 5) * 5; if (hi - lo < 10) hi = lo + 10;
  setEscala(lo, hi);
}
export const dadoMapaT1 = (T, u) => { const fi = idxFoco(T); return u.vv > 0 ? (fi >= 0 ? { k: T.chave[fi], pw: u.p[fi], solo: true } : { k: T.chave[u.lid], pw: u.p[u.lid], pL: u.pL, pF: u.pF }) : { k: null }; };
export function legendaT1(T, u) {
  const fi = idxFoco(T), grad = k => `linear-gradient(90deg,${corDoPct(k, ESC.min)},${corDoPct(k, (ESC.min + ESC.max) / 2)},${corDoPct(k, ESC.max)})`;
  if (fi >= 0) return `<div class="leg-mapa"><span><i style="background:${grad(T.chave[fi])}"></i>${esc(T.nome(fi))}: ${ESC.min}% → ${ESC.max}%+</span><span><i style="background:#e4e1ea"></i>sem votos</span>${entenda(`Cada área é pintada com a cor de <b>${esc(T.nome(fi))}</b>: quanto mais escuro, maior o percentual dos votos válidos dele ali (de ${ESC.min}% a ${ESC.max}% ou mais). Os números no mapa são esse percentual.`)}</div>`;
  const ord = u.v.map((x, i) => i).sort((a, b) => u.v[b] - u.v[a]).slice(0, 6);
  return `<div class="leg-mapa">${ord.map(i => `<span><i style="background:${grad(T.chave[i])}"></i>${esc(T.nome(i))}</span>`).join('')}<span><i style="background:#e4e1ea"></i>sem votos</span>${entenda(`Cor = candidato mais votado; tom mais escuro = maior percentual dos votos válidos (${ESC.min}% → ${ESC.max}%+). Clique numa ficha de candidato para pintar o mapa só com o desempenho dele.`)}</div>`;
}
export const tipUnidade = (T, nome, u) => {
  if (!u.vv) return `<b>${esc(nome)}</b><br><span class="t-s">sem votos</span>`;
  const fi = idxFoco(T), ids = [...u.v.keys()].sort((a, b) => u.v[b] - u.v[a]).slice(0, 3); if (fi >= 0 && !ids.includes(fi)) ids.push(fi);
  const rk = 1 + u.v.filter(y => fi >= 0 && y > u.v[fi]).length;
  return `<b>${esc(nome)}</b>` + ids.map(i => `<br><span style="color:${T.cor(i)}">■</span> ${i === fi ? '<b>' : ''}${esc(T.nome(i))}: ${i === fi ? '' : '<b>'}${fNum(u.p[i], 2)}%${i === fi ? '' : '</b>'} · ${fInt(u.v[i])}${i === fi ? `</b> (${rk}º)` : ''}`).join('') + `<br><span class="t-s">abstenção ${fNum(u.pAb, 1)}%</span>`;
};
export const rankDe = (u, i) => 1 + u.v.filter(y => y > u.v[i]).length;
export const lidChip = (T, x) => x.vv ? chip(T, x.lid) : '';
// colunas das tabelas de UF/município: sem foco mostra os 4 mais votados; com foco, o candidato escolhido
function colsTop(T, ref, nomeCol) {
  const fi = idxFoco(T), cn = i => `<span class="cab-c" style="--c:${T.cor(i)}">${esc(T.curto(i))}</span>`;
  const cauda = [{ k: 'ab', t: 'Abstenção', h: x => fNum(x.u.pAb, 1) + '%', v: x => x.u.pAb, cls: 'n sec' }, { k: 'te', t: 'Eleitores', h: x => fInt(x.u.te), v: x => x.u.te, cls: 'n sec' }];
  const lid = { k: 'lid', t: 'Mais votado', h: x => lidChip(T, x.u), v: x => x.u.vv ? T.curto(x.u.lid) : '', cls: 'c' };
  if (fi >= 0) return [nomeCol,
    { k: 'pos', t: 'Posição', h: x => x.u.vv ? `${1 + x.u.v.filter(y => y > x.u.v[fi]).length}º` : '', v: x => x.u.vv ? 1 + x.u.v.filter(y => y > x.u.v[fi]).length : NaN, cls: 'c' },
    { k: 'vf', t: `${cn(fi)} votos`, h: x => fInt(x.u.v[fi]), v: x => x.u.v[fi], cls: 'n' },
    { k: 'pf', t: `${cn(fi)} %`, h: x => x.u.vv ? `<b>${fNum(x.u.p[fi], 2)}%</b>` : '', v: x => x.u.p[fi], x: x => x.u.p[fi], cls: 'n' },
    lid, ...cauda];
  const top = ref.v.map((x, i) => i).sort((a, b) => ref.v[b] - ref.v[a]).slice(0, 4);
  return [nomeCol, lid,
    ...top.map(i => ({ k: 'p' + i, t: `${cn(i)} %`, h: x => x.u.vv ? `<b>${fNum(x.u.p[i], 2)}%</b><small class="vt">${fInt(x.u.v[i])} votos</small>` : '', v: x => x.u.p[i], x: x => x.u.p[i], cls: 'n' })), ...cauda];
}

export function viewT1Geral(ctx) {
  const cg = new URLSearchParams(location.hash.split('?')[1] || '').get('cargo');
  if (cg === 'gov' || cg === 'sen') { const sen = cg === 'sen';
    return { html: `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${sen ? 'Senador' : 'Governador'} · TSE</div>${sen ? senTabelaHtml(ctx.S1) : govTabelaHtml(ctx.G1, ctx.snap)}`, titulo: `Brasil — ${sen ? 'Senador' : 'Governador'}`,
      montar(root) { if (sen) senTabelaMontar(root.querySelector('#tab-sen'), ctx.S1, tabela, ctx.ir); else govTabelaMontar(root.querySelector('#tab-gov'), ctx.G1, ctx.snap, tabela, ctx.ir); } }; }
  const T = ctx.T1, br = dec(T, T.br), fi = idxFoco(T);
  const ufs = UFS.filter(u => T.uf[u[0]]).map(u => ({ id: u[0], nome: UF_NOME[u[0]] || u[0].toUpperCase(), u: dec(T, T.uf[u[0]]) }));
  const cB = fi >= 0 ? fi : T.iL, nomeCB = fi >= 0 ? T.nome(fi) : 'Lula';
  const frasesBr = leitura(ufs.filter(x => x.u.vv > 0).map(x => { const o = [...x.u.p].sort((a, b) => b - a); return { nome: x.nome, te: x.u.te, vv: x.u.vv, pAb: x.u.pAb, p: x.u.p[cB], p2: [o[0], o[1]] }; }), { cand: nomeCB, plural: 'estados', artigo: 'do país', minGrande: 1e6 });
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 (presidente) · TSE${T.hg ? ` · atualizado em ${esc(T.dg || '')} ${esc(T.hg)}` : ''}</div>
  ${topoT1(T, br, 'Brasil', { brasil: true })}
  ${kpisT1(br)}
  <section class="painel mapa-sec"><h2>${fi >= 0 ? `${esc(T.nome(fi))} por estado` : 'Resultado por estado'}</h2><p class="sub">Clique em um estado para ver os municípios.</p><div class="mapa-grid"><div id="mapa"></div><div class="mapa-lado">${legendaT1(T, br)}</div></div></section>
  <section class="painel"><h2>Todos os estados</h2><p class="sub">Clique nos títulos para ordenar. Clique em um estado para abrir os municípios.</p><div id="tab-uf"></div></section>
  ${govTabelaHtml(ctx.G1, ctx.snap)}
  ${senTabelaHtml(ctx.S1)}
  ${balao(frasesBr)}`;
  return { html, titulo: 'Brasil — 1º turno', montar(root) {
    aplicaEscala(T, ufs.map(x => fi >= 0 ? x.u.p[fi] : NaN));
    const por = Object.fromEntries(ufs.map(x => [x.id, x]));
    const mp = criarMapa(root.querySelector('#mapa'), ctx.geo, { onClick: id => ctx.ir(`#/t1/uf/${id}`), tooltip: id => por[id] ? tipUnidade(T, por[id].nome, por[id].u) : '' });
    mp.atualizar(Object.fromEntries(ufs.map(x => [x.id, dadoMapaT1(T, x.u)])));
    root.querySelector('.mapa-lado').innerHTML = legendaT1(T, br);
    const cols = colsTop(T, br, { k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' });
    tabela(root.querySelector('#tab-uf'), { cols, rows: ufs, onRow: x => ctx.ir(`#/t1/uf/${x.id}`), sort: 'nome', dir: 'asc' });
    govTabelaMontar(root.querySelector('#tab-gov'), ctx.G1, ctx.snap, tabela, ctx.ir);
    senTabelaMontar(root.querySelector('#tab-sen'), ctx.S1, tabela, ctx.ir);
    ctx.csv = () => ({ nome: 'brasil_1turno_estados', cab: cols.map(c => c.t.replace(/<[^>]+>/g, '')), linhas: ufs.map(x => cols.map(c => (c.x || c.v)(x))) });
  } };
}

export function viewT1Uf(ctx, uf) {
  const T = ctx.T1, B = ctx.B, nomeUf = UF_NOME[uf] || uf.toUpperCase(), fi = idxFoco(T);
  if (!T.uf[uf]) return { html: `<div class="aviso">Estado não encontrado.</div>`, titulo: 'Estado', montar() {} };
  const cg = new URLSearchParams(location.hash.split('?')[1] || '').get('cargo');
  if (cg === 'gov' || cg === 'sen') { const sen = cg === 'sen'; return { html: govTopo((sen ? ctx.S1 : ctx.G1)?.uf?.[uf], uf, 1, sen), titulo: `${nomeUf} — ${sen ? 'Senador' : 'Governador'}`, trilha: [['Brasil', `#/t1?cargo=${cg}`], [nomeUf]], montar() {} }; }
  const u = dec(T, T.uf[uf]);
  const nomes = new Map((B.byUf[uf] || []).map(b => [b.cd, b])), cdi = new Map((B.byUf[uf] || []).map(b => [b.cd, String(b.cdi)]));
  const muns = (T.mun[uf] || []).map(r => ({ id: r[0], nome: bonitoNome(nomes.get(r[0])?.nome || r[0]), u: dec(T, r, 1) }));
  const mapa = uf !== 'zz' && uf !== 'df';
  const cI = fi >= 0 ? fi : T.iL, nomeC = fi >= 0 ? T.nome(fi) : 'Lula';
  const unid = muns.filter(m => m.u.vv > 0 && isFinite(m.u.p[cI])).map(m => { const o = [...m.u.p].sort((a, b) => b - a); return { id: m.id, nome: m.nome, te: m.u.te, vv: m.u.vv, pAb: m.u.pAb, p: m.u.p[cI], p2: [o[0], o[1]], lid: m.u.lid, mu: m }; });
  const frasesUf = unid.length >= 8 ? leitura(unid, { cand: nomeC, plural: 'municípios', artigo: 'do estado' }) : [];
  const html = `${topoT1(T, u, nomeUf)}
  ${kpisT1(u)}
  ${govPainel(ctx.G1?.uf?.[uf], uf, 1)}
  ${senPainel(ctx.S1?.uf?.[uf], uf)}
  ${mapa ? `<section class="painel mapa-sec"><h2>${fi >= 0 ? `${esc(T.nome(fi))} em ` : 'Mapa de '}${esc(nomeUf)} por município</h2><p class="sub">Clique em um município para ver os bairros.</p><div class="mapa-modo sem-export" role="group" aria-label="Forma do mapa"><button data-forma="areas" class="${formaMapa === 'areas' ? 'on' : ''}">Áreas</button><button data-forma="bolhas" class="${formaMapa === 'bolhas' ? 'on' : ''}">Bolhas (peso do eleitorado)</button></div><div class="mapa-grid"><div id="mapa-mun"><p class="carregando">Carregando mapa…</p></div><div class="mapa-lado">${legendaT1(T, u)}</div></div></section>` : ''}
  ${unid.length >= 8 ? `<section class="painel disp-sec"><h2>Relações entre os dados</h2><p class="sub">Cada bolha é um município; o tamanho é o eleitorado e a cor é o candidato mais votado. Clique numa bolha para abri-lo.</p><div class="mapa-modo sem-export" role="group" aria-label="Eixo horizontal"><button data-eixo="abst" class="${eixoDisp === 'abst' ? 'on' : ''}">Abstenção</button><button data-eixo="tam" class="${eixoDisp === 'tam' ? 'on' : ''}">Tamanho do eleitorado</button></div><div id="disp"></div>${balao(frasesUf)}</section>` : ''}
  <section class="painel"><h2>Municípios de ${esc(nomeUf)}</h2><p class="sub">Clique em um município para ver os bairros e os locais de votação.</p><div id="tab-m"></div></section>`;
  return { html, titulo: `${nomeUf} — 1º turno`, trilha: [['Brasil', '#/t1'], [nomeUf]], montar(root) {
    aplicaEscala(T, muns.map(m => fi >= 0 ? m.u.p[fi] : NaN));
    root.querySelector('.mapa-lado') && (root.querySelector('.mapa-lado').innerHTML = legendaT1(T, u));
    const alvo = root.querySelector('#mapa-mun');
    if (alvo) getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
      const idCd = new Map([...cdi].map(([cd, i]) => [i, cd])), porCd = new Map(muns.map(m => [m.id, m]));
      for (const [id, g] of Object.entries(geo.muns)) { const m = porCd.get(idCd.get(id)); if (m) g.n = m.nome; }
      const mp = criarMapaMun(alvo, geo, { onClick: id => { const cd = idCd.get(id); if (cd) ctx.ir(`#/t1/mun/${uf}/${cd}`); }, tooltip: id => { const m = porCd.get(idCd.get(id)); return m ? tipUnidade(T, m.nome, m.u) : ''; } });
      mp.atualizar(Object.fromEntries(muns.filter(m => cdi.get(m.id)).map(m => [cdi.get(m.id), { ...dadoMapaT1(T, m.u), peso: m.u.te }])));
      mp.bolhas(formaMapa === 'bolhas');
      root.querySelectorAll('[data-forma]').forEach(b => b.addEventListener('click', () => { formaMapa = b.dataset.forma; mp.bolhas(formaMapa === 'bolhas'); root.querySelectorAll('[data-forma]').forEach(x => x.classList.toggle('on', x === b)); }));
    }).catch(() => { alvo.innerHTML = '<p class="aviso">Mapa municipal indisponível no momento.</p>'; });
    const elD = root.querySelector('#disp');
    if (elD) {
      const mediaC = u.vv ? 100 * u.v[cI] / u.vv : NaN;
      const desenhaD = () => dispersao(elD, { pts: unid.map(x => ({ id: x.id, nome: x.nome, x: eixoDisp === 'abst' ? x.pAb : x.te, y: x.p, r: x.te, cor: T.cor(x.lid), tip: `<b>${esc(x.nome)}</b><br>${esc(nomeC)}: <b>${fNum(x.p, 1)}%</b><br><span class="t-s">abstenção ${fNum(x.pAb, 1)}% · ${fInt(x.te)} eleitores</span>` })), xLog: eixoDisp === 'tam', xRot: eixoDisp === 'abst' ? 'Abstenção (%)' : 'Eleitorado do município (escala logarítmica)', yRot: `% de ${nomeC} nos votos válidos`, xFmt: eixoDisp === 'abst' ? v => fNum(v, 0) + '%' : v => v >= 1e6 ? v / 1e6 + ' mi' : v >= 1e3 ? v / 1e3 + ' mil' : v, refY: mediaC, onClick: id => ctx.ir(`#/t1/mun/${uf}/${id}`) });
      desenhaD();
      root.querySelectorAll('[data-eixo]').forEach(b => b.addEventListener('click', () => { eixoDisp = b.dataset.eixo; root.querySelectorAll('[data-eixo]').forEach(x => x.classList.toggle('on', x === b)); desenhaD(); }));
    }
    const cols = colsTop(T, u, { k: 'nome', t: 'Município', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' });
    tabela(root.querySelector('#tab-m'), { cols, rows: muns, onRow: x => ctx.ir(`#/t1/mun/${uf}/${x.id}`), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
    ctx.csv = () => ({ nome: `${uf}_1turno_municipios`, cab: cols.map(c => c.t.replace(/<[^>]+>/g, '')), linhas: muns.map(x => cols.map(c => (c.x || c.v)(x))) });
  } };
}
