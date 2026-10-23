// Aba "Resultados 1º Turno": resultado oficial do TSE por candidato (Brasil › estado › município; bairro e local em bairros.js).
// Dados: data/res_1t.json (scripts/res1t.mjs). Linha de unidade: [ts, st, te, c, a, vb, tvn, ...votos por candidato]; município tem o código na frente.
import { CAND, PAL, UF_NOME, UFS, fInt, fNum, setEscala, corDoPct, corTexto } from './util.js?v=ebeb69e4';
import { esc, tabela, sem } from './ui.js?v=ebeb69e4';
import { kpi } from './views.js?v=ebeb69e4';
import { criarMapa } from './map.js?v=ebeb69e4';
import { criarMapaMun } from './mapamun.js?v=ebeb69e4';
import { getJSON } from './tse.js?v=ebeb69e4';

let cache = null;
export const carregarT1 = () => (cache ??= getJSON('data/res_1t.json', { retries: 2 }));
const CORES = ['#e8890c', '#2f9e6b', '#7a4fc4', '#17a2b8', '#c9a400', '#d6336c', '#6c757d', '#8d6e63', '#0b7285', '#a61e4d'];
export const ESCALA_T1 = [25, 65];
export const bonitoNome = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E) /g, x => x.toLowerCase());

export function prepT1(T) {
  if (T.chave) return T;
  T.chave = T.cands.map(c => c.n === '13' ? 'L' : c.n === '22' ? 'F' : 'c' + c.n);
  let j = 0; T.chave.forEach(k => { if (k !== 'L' && k !== 'F') PAL[k] = CORES[j++ % CORES.length]; });
  T.cor = i => T.chave[i] === 'L' ? CAND.L.cor : T.chave[i] === 'F' ? CAND.F.cor : PAL[T.chave[i]];
  T.nome = i => { const c = T.cands[i]; return bonitoNome(c.nmu || c.nm || ('Candidato ' + c.n)); };
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
const dadoMapa = (T, u) => u.vv > 0 ? { k: T.chave[u.lid], pw: u.p[u.lid], pL: u.pL, pF: u.pF } : { k: null };
const chip = (T, i) => `<span class="chip-l" style="background:${T.cor(i)};color:${corTexto(T.cor(i))}">${esc(T.nome(i).split(' ')[0])}</span>`;

function cartao(T, i, u, selo) {
  const c = T.cands[i];
  return `<div class="cand" style="--c:${T.cor(i)}"><div class="cand-topo"><span class="cand-num">${esc(c.n)}</span><div><div class="cand-nome">${esc(T.nome(i))}</div><div class="cand-part">${esc(T.part(i))}</div></div>${selo ? `<span class="selo ok">${selo}</span>` : ''}</div>
    <div class="cand-pct">${fNum(u.p[i], 2)}%</div><div class="cand-votos"><b>${fInt(u.v[i])}</b> votos</div></div>`;
}
// lista de todos os candidatos (barras), ordenada por votos
export function blocoCands(T, u, titulo = 'Todos os candidatos') {
  const ord = u.v.map((x, i) => i).sort((a, b) => u.v[b] - u.v[a]), max = Math.max(...u.p.filter(x => isFinite(x)), 1);
  return `<section class="painel"><h2>${esc(titulo)}</h2><p class="sub">Porcentagem sobre os votos válidos (exclui brancos e nulos).</p><div class="cand-lista">${ord.map(i => `<div class="cl-linha"><span class="cl-nome"><i style="background:${T.cor(i)}"></i><b>${esc(T.nome(i))}</b> <small>${esc([T.part(i), T.cands[i].n].filter(Boolean).join(' · '))}</small></span><span class="cl-barra"><b style="width:${isFinite(u.p[i]) ? 100 * u.p[i] / max : 0}%;background:${T.cor(i)}"></b></span><span class="cl-pct">${fNum(u.p[i], 2)}%</span><span class="cl-votos">${fInt(u.v[i])}</span></div>`).join('')}</div></section>`;
}
export const kpisT1 = u => `<section class="kpis k4">${kpi('Comparecimento', fNum(100 - u.pAb, 2) + '%', null, `${fInt(u.c)} de ${fInt(u.te)} eleitores`)}${kpi('Abstenção', fNum(u.pAb, 2) + '%', null, `${fInt(u.ab)} eleitores`)}${kpi('Votos em branco', fNum(u.pBr, 2) + '%', null, `${fInt(u.vb)} votos`)}${kpi('Votos nulos', fNum(u.pNu, 2) + '%', null, `${fInt(u.tvn)} votos`)}</section>`;
export function legendaT1(T, u) {
  const ord = u.v.map((x, i) => i).sort((a, b) => u.v[b] - u.v[a]).slice(0, 6);
  return `<div class="leg-mapa">${ord.map(i => `<span><i style="background:linear-gradient(90deg,${corDoPct(T.chave[i], ESCALA_T1[0])},${corDoPct(T.chave[i], (ESCALA_T1[0] + ESCALA_T1[1]) / 2)},${corDoPct(T.chave[i], ESCALA_T1[1])})"></i>${esc(T.nome(i))}</span>`).join('')}<span><i style="background:#e4e1ea"></i>sem votos</span><small>Cor = candidato mais votado; tom mais escuro = maior percentual dos votos válidos (${ESCALA_T1[0]}% → ${ESCALA_T1[1]}%+).</small></div>`;
}
const tipUnidade = (T, nome, u) => `<b>${esc(nome)}</b>` + (u.vv ? [...u.v.keys()].sort((a, b) => u.v[b] - u.v[a]).slice(0, 3).map(i => `<br><span style="color:${T.cor(i)}">■</span> ${esc(T.nome(i))}: <b>${fNum(u.p[i], 2)}%</b> · ${fInt(u.v[i])}`).join('') + `<br><span class="t-s">abstenção ${fNum(u.pAb, 1)}%</span>` : '<br><span class="t-s">sem votos</span>');

function colsTop(T, ref, nomeCol) {
  const top = ref.v.map((x, i) => i).sort((a, b) => ref.v[b] - ref.v[a]).slice(0, 4);
  return [nomeCol,
    { k: 'lid', t: 'Mais votado', h: x => x.u.vv ? chip(T, x.u.lid) : '', v: x => x.u.vv ? -x.u.lid : NaN },
    ...top.map(i => ({ k: 'p' + i, t: `${esc(T.nome(i).split(' ')[0])} %`, h: x => x.u.vv ? `<b>${fNum(x.u.p[i], 2)}%</b>` : '', v: x => x.u.p[i], x: x => x.u.p[i], cls: 'n' })),
    { k: 'ab', t: 'Abstenção', h: x => fNum(x.u.pAb, 1) + '%', v: x => x.u.pAb, cls: 'n sec' },
    { k: 'te', t: 'Eleitores', h: x => fInt(x.u.te), v: x => x.u.te, cls: 'n sec' }];
}

export function viewT1Geral(ctx) {
  const T = ctx.T1, br = dec(T, T.br), ord = br.v.map((x, i) => i).sort((a, b) => br.v[b] - br.v[a]);
  const ufs = UFS.filter(u => T.uf[u[0]]).map(u => ({ id: u[0], nome: UF_NOME[u[0]] || u[0].toUpperCase(), u: dec(T, T.uf[u[0]]) }));
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 (presidente), conforme os arquivos de divulgação do TSE${T.hg ? ` — última atualização ${esc(T.dg || '')} ${esc(T.hg)}` : ''}.</div>
  <section class="placar t1p">${cartao(T, ord[0], br, /2º turno/i.test(T.cands[ord[0]].st) ? 'Foi ao 2º turno' : '')}<div class="centro"><div class="centro-t">Brasil · 1º turno</div><div class="barra2">${ord.slice(0, 4).map(i => `<i style="width:${br.p[i]}%;background:${T.cor(i)}" title="${esc(T.nome(i))}"></i>`).join('')}</div><div class="margem"><b>${fInt(br.vv)}</b> votos válidos</div></div>${cartao(T, ord[1], br, /2º turno/i.test(T.cands[ord[1]].st) ? 'Foi ao 2º turno' : '')}</section>
  ${kpisT1(br)}${blocoCands(T, br)}
  <section class="painel mapa-sec"><h2>Resultado por estado</h2><p class="sub">Cor = candidato mais votado no estado. Clique em um estado para ver os municípios.</p><div class="mapa-grid"><div id="mapa"></div><div class="mapa-lado">${legendaT1(T, br)}</div></div></section>
  <section class="painel"><h2>Todos os estados</h2><p class="sub">Clique nos títulos para ordenar. Clique em um estado para abrir os municípios.</p><div id="tab-uf"></div></section>`;
  return { html, titulo: 'Brasil — 1º turno', montar(root) {
    setEscala(...ESCALA_T1);
    const por = Object.fromEntries(ufs.map(x => [x.id, x]));
    const mp = criarMapa(root.querySelector('#mapa'), ctx.geo, { onClick: id => ctx.ir(`#/t1/uf/${id}`), tooltip: id => por[id] ? tipUnidade(T, por[id].nome, por[id].u) : '' });
    mp.atualizar(Object.fromEntries(ufs.map(x => [x.id, dadoMapa(T, x.u)])));
    const cols = colsTop(T, br, { k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' });
    tabela(root.querySelector('#tab-uf'), { cols, rows: ufs, onRow: x => ctx.ir(`#/t1/uf/${x.id}`), sort: 'p' + ord[0], dir: 'desc' });
    ctx.csv = () => ({ nome: 'brasil_1turno_estados', cab: cols.map(c => c.t), linhas: ufs.map(x => cols.map(c => (c.x || c.v)(x))) });
  } };
}

export function viewT1Uf(ctx, uf) {
  const T = ctx.T1, B = ctx.B, nomeUf = UF_NOME[uf] || uf.toUpperCase();
  if (!T.uf[uf]) return { html: `<div class="aviso">Estado não encontrado.</div>`, titulo: 'Estado', montar() {} };
  const u = dec(T, T.uf[uf]), ord = u.v.map((x, i) => i).sort((a, b) => u.v[b] - u.v[a]);
  const nomes = new Map((B.byUf[uf] || []).map(b => [b.cd, b])), cdi = new Map((B.byUf[uf] || []).map(b => [b.cd, String(b.cdi)]));
  const muns = (T.mun[uf] || []).map(r => ({ id: r[0], nome: bonitoNome(nomes.get(r[0])?.nome || r[0]), u: dec(T, r, 1) }));
  const mapa = uf !== 'zz' && uf !== 'df';
  const html = `<section class="placar t1p">${cartao(T, ord[0], u)}<div class="centro"><div class="centro-t">${esc(nomeUf)} · 1º turno</div><div class="barra2">${ord.slice(0, 4).map(i => `<i style="width:${u.p[i]}%;background:${T.cor(i)}" title="${esc(T.nome(i))}"></i>`).join('')}</div><div class="margem"><b>${fInt(u.vv)}</b> votos válidos</div></div>${cartao(T, ord[1], u)}</section>
  ${kpisT1(u)}${blocoCands(T, u)}
  ${mapa ? `<section class="painel mapa-sec"><h2>Mapa de ${esc(nomeUf)} por município</h2><p class="sub">Cor = candidato mais votado no município. Clique para ver os bairros.</p><div class="mapa-grid"><div id="mapa-mun"><p class="carregando">Carregando mapa…</p></div><div class="mapa-lado">${legendaT1(T, u)}</div></div></section>` : ''}
  <section class="painel"><h2>Municípios de ${esc(nomeUf)}</h2><p class="sub">Clique em um município para ver os bairros e os locais de votação.</p><div id="tab-m"></div></section>`;
  return { html, titulo: `${nomeUf} — 1º turno`, trilha: [['Brasil', '#/t1'], [nomeUf]], montar(root) {
    setEscala(...ESCALA_T1);
    const alvo = root.querySelector('#mapa-mun');
    if (alvo) getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
      const idCd = new Map([...cdi].map(([cd, i]) => [i, cd])), porCd = new Map(muns.map(m => [m.id, m]));
      for (const [id, g] of Object.entries(geo.muns)) { const m = porCd.get(idCd.get(id)); if (m) g.n = m.nome; }
      const mp = criarMapaMun(alvo, geo, { onClick: id => { const cd = idCd.get(id); if (cd) ctx.ir(`#/t1/mun/${uf}/${cd}`); }, tooltip: id => { const m = porCd.get(idCd.get(id)); return m ? tipUnidade(T, m.nome, m.u) : ''; } });
      mp.atualizar(Object.fromEntries(muns.filter(m => cdi.get(m.id)).map(m => [cdi.get(m.id), dadoMapa(T, m.u)])));
    }).catch(() => { alvo.innerHTML = '<p class="aviso">Mapa municipal indisponível no momento.</p>'; });
    const cols = colsTop(T, u, { k: 'nome', t: 'Município', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' });
    tabela(root.querySelector('#tab-m'), { cols, rows: muns, onRow: x => ctx.ir(`#/t1/mun/${uf}/${x.id}`), sort: 'p' + ord[0], dir: 'desc', filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
    ctx.csv = () => ({ nome: `${uf}_1turno_municipios`, cab: cols.map(c => c.t), linhas: muns.map(x => cols.map(c => (c.x || c.v)(x))) });
  } };
}
