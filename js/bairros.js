// Camada município → bairro → local de votação.
// Dados: data/bairros/{uf}/{cd5}.json (TSE: locais de votação, bairro, coordenadas, 1º turno por seção) +
// resultado por seção do 2º turno publicado pelo coletor (branches dados-b1…5) → agregação por local e por bairro.
import { CAND, UF_NOME, fInt, fNum, fDelta, corDoPct, clamp } from './util.js';
import { CONFIG } from './config.js';
import { getJSON } from './tse.js';
import { esc, dlt, tabela } from './ui.js';
import { cartaoCand, barraDupla, kpi, cabCand, linhaAp } from './views.js';
import { listaMunicipios } from './model.js';
import { projetarMunicipios } from './proj.js';
import { criarMapaPontos } from './mapapontos.js';
import { criarMapaBairros } from './mapabairros.js';
import { legendaMapa } from './map.js';

const q = new URLSearchParams(location.search);
const bust = () => '?t=' + Math.floor(Date.now() / 20000);
const pc = (a, b) => (b > 0 ? 100 * a / b : NaN);
const SEM_BAIRRO = '(SEM BAIRRO INFORMADO)';
export const bonito = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());

// ---------- carregamento ----------
const cacheEst = new Map();
export async function estatico(uf, cd) {
  const k = uf + cd; if (!cacheEst.has(k)) cacheEst.set(k, getJSON(`data/bairros/${uf}/${cd}.json`, { retries: 1 }));
  try { return await cacheEst.get(k); } catch (e) { cacheEst.delete(k); throw e; }
}
export async function aoVivo(uf, cd) {
  const g = CONFIG.gruposBairros[uf] || 1;
  const fontes = q.get('fontebairros') ? [q.get('fontebairros')] : [`https://raw.githubusercontent.com/${CONFIG.repo}/${CONFIG.prefixoBairros}${g}/live/`, 'data/live/'];
  for (const f of fontes) { try { const j = await getJSON(`${f}bairros/${uf}/${cd}.json${bust()}`, { retries: 0 }); if (j && j.s) return j; } catch { /* tenta a próxima fonte */ } }
  return { s: {}, t: '' };
}

// ---------- demonstração: gera resultado por seção coerente com o resultado simulado do município ----------
function hash(a, b) { let h = (a * 73856093) ^ (b * 19349663); h = Math.imul(h ^ (h >>> 13), 0x5bd1e995); return ((h ^ (h >>> 15)) >>> 0) / 4294967296; }
const logit = p => Math.log(p / (1 - p)), expit = x => 1 / (1 + Math.exp(-x));
export function demoSecoes(est, linhaMun) {
  const s = {}; if (!linhaMun) return { s, t: '' };
  const [, ts, st, , , c, , vb, tvn, L, F] = linhaMun;
  const todas = []; for (const l of est.l) for (const x of l[14]) todas.push({ z: l[0], x });
  const n = Math.round(todas.length * Math.min(1, st / (ts || 1)));
  const esc_ = todas.map(o => ({ ...o, r: hash(o.z, o.x[0]) })).sort((a, b) => a.r - b.r).slice(0, n);
  if (!esc_.length || !(L + F > 0)) return { s, t: '' };
  const aptos = esc_.reduce((t, o) => t + o.x[1], 0) || 1, pm = L / (L + F);
  const p1 = o => (o.x[2] + 0.5) / (o.x[2] + o.x[3] + 1), media1 = Math.exp(esc_.reduce((t, o) => t + o.x[1] * Math.log(p1(o) / (1 - p1(o))), 0) / aptos);
  let somaL = 0; const tmp = esc_.map(o => { const comp = c * o.x[1] / aptos; const pj = expit(logit(clamp(pm, .02, .98)) + 0.8 * (logit(p1(o)) - Math.log(media1)) + (hash(o.x[0], o.z + 7) - .5) * .25); const vv = comp * (1 - (vb + tvn) / (c || 1)); somaL += vv * pj; return { o, comp, pj, vv }; });
  const k = L / (somaL || 1);
  for (const t of tmp) { const l = Math.round(t.vv * clamp(t.pj * k, 0, 1)), f = Math.round(t.vv) - l, b = Math.round(t.comp * vb / (c || 1)), nu = Math.round(t.comp * tvn / (c || 1)); s[t.o.z + '-' + t.o.x[0]] = [l, Math.max(0, f), 0, b, nu]; }
  return { s, t: 'demo' };
}

// ---------- agregação ----------
const novo = () => ({ ts: 0, st: 0, ap: 0, apT: 0, L: 0, F: 0, O: 0, B: 0, N: 0, L1: 0, F1: 0, O1: 0, B1: 0, N1: 0, L1T: 0, F1T: 0, O1T: 0, B1T: 0, N1T: 0 });

const soma = (a, b) => { for (const k of Object.keys(novo())) a[k] += b[k]; };
function derivar(u) {
  u.vv = u.L + u.F + u.O; u.c = u.vv + u.B + u.N; u.pL = pc(u.L, u.vv); u.pF = pc(u.F, u.vv);
  u.vv1 = u.L1 + u.F1 + u.O1; u.c1 = u.vv1 + u.B1 + u.N1;
  u.p1L = pc(u.L1, u.vv1); u.p1F = pc(u.F1, u.vv1);                // 1º turno, mesmas seções já apuradas
  u.vv1T = u.L1T + u.F1T + u.O1T; u.p1LT = pc(u.L1T, u.vv1T); u.p1FT = pc(u.F1T, u.vv1T);   // 1º turno completo
  u.dL = u.pL - u.p1L; u.dF = u.pF - u.p1F;
  u.pAb = pc(u.ap - u.c, u.ap); u.pAb1 = pc(u.ap - u.c1, u.ap); u.dAb = u.pAb - u.pAb1;
  u.pBr = pc(u.B, u.c); u.pNu = pc(u.N, u.c); u.gL = u.L1 ? 100 * (u.L / u.L1 - 1) : NaN; u.gF = u.F1 ? 100 * (u.F / u.F1 - 1) : NaN;
  u.pst = pc(u.st, u.ts); u.lider = u.st && u.L + u.F > 0 ? (u.L >= u.F ? 'L' : 'F') : null;
  u.pw = u.lider ? (u.lider === 'L' ? u.pL : u.pF) : NaN;
  return u;
}
export function agregar(est, live) {
  const locais = [], porBairro = new Map(), tot = novo();
  for (const l of est.l) {
    const u = novo(); u.ts = l[14].length;
    for (const s of l[14]) {
      u.apT += s[1]; u.L1T += s[2]; u.F1T += s[3]; u.O1T += s[4]; u.B1T += s[5]; u.N1T += s[6];
      const x = live.s[l[0] + '-' + s[0]]; if (!x) continue;
      u.st++; u.ap += s[1]; u.L += x[0]; u.F += x[1]; u.O += x[2]; u.B += x[3]; u.N += x[4];
      u.L1 += s[2]; u.F1 += s[3]; u.O1 += s[4]; u.B1 += s[5]; u.N1 += s[6];
    }
    const bairro = l[4] || SEM_BAIRRO;
    derivar(u); Object.assign(u, { id: l[0] + '-' + l[1], z: l[0], nome: l[2], end: l[3], bairro, cep: l[5], lat: l[6], lon: l[7] });
    locais.push(u);
    if (!porBairro.has(bairro)) porBairro.set(bairro, Object.assign(novo(), { locais: 0 }));
    const b = porBairro.get(bairro); soma(b, Object.fromEntries(Object.keys(novo()).map(k => [k, u[k]]))); b.locais++;
    soma(tot, Object.fromEntries(Object.keys(novo()).map(k => [k, u[k]])));
  }
  const bairros = [...porBairro].map(([nome, b]) => Object.assign(derivar(b), { nome, id: nome }));
  derivar(tot);
  return { locais, bairros, tot };
}

export function agregarPoligonos(locais, geo) {
  const por = new Map();
  for (const l of locais) { const i = geo.loc[l.id]; if (i == null) continue; if (!por.has(i)) por.set(i, Object.assign(novo(), { locais: 0 })); const b = por.get(i); soma(b, l); b.locais++; }
  const out = {}; for (const [i, b] of por) { derivar(b); b.nome = geo.f[i].n; out[i] = b; }
  return out;
}
let geoCache = new Map();
async function geoBairros(cd) { if (!geoCache.has(cd)) geoCache.set(cd, getJSON(`data/bairros_geo/${cd}.json`, { retries: 0 }).catch(() => null)); return geoCache.get(cd); }

// ---------- tela ----------
const lastAgg = new Map();
export function viewMun(ctx, uf, cd) {
  const { modo, B, V, P, snap } = ctx, ap = modo === 'ap';
  const b = (B.byUf[uf] || []).find(x => x.cd === cd);
  if (!b) return { html: `<div class="aviso">Município não encontrado.</div>`, titulo: 'Município', montar() {} };
  const nomeMun = bonito(b.nome), ufn = UF_NOME[uf] || uf.toUpperCase();
  const m = (ap ? listaMunicipios(B, V, uf) : projetarMunicipios(B, snap, P, uf)).find(x => x.cd === cd);
  let r;
  if (ap && m?.apurado) r = linhaAp(cd, m);
  else if (m && (m.L + m.F > 0)) r = { pst: m.pst, st: 0, ts: 0, L: m.L, F: m.F, pL: m.pL, pF: m.pF, dL: m.pL - m.p1L, dF: m.pF - m.p1F, lider: m.L > m.F ? 'L' : 'F', pAb: m.pAb, dAb: m.dAb, pBr: m.pBr, pNu: m.pNu, ali: m.ali, dAli: m.dAli };
  else r = { pst: 0, L: NaN, F: NaN, pL: NaN, pF: NaN, lider: null };
  const cartoes = `<section class="placar uf ${ap ? '' : 'proj'}">${cartaoCand('L', r, { modo, conf: false })}<div class="centro"><div class="centro-t">${esc(nomeMun)} · ${uf.toUpperCase()}</div>${barraDupla(r.pL, r.pF)}<div class="margem">${r.lider ? `<b style="color:${CAND[r.lider].cor}">${CAND[r.lider].nome}</b> à frente por <b>${fInt(Math.abs(r.L - r.F))}</b> votos` : (ap ? 'Aguardando a apuração das seções' : '')}</div></div>${cartaoCand('F', r, { modo, conf: false })}</section>`;
  const kp = ap && m?.apurado ? `<section class="kpis k4">${kpi('Apurado', fNum(r.pst, 1) + '%', null, `${fInt(r.st)} de ${fInt(r.ts)} seções`)}${kpi('Abstenção', fNum(r.pAb, 2) + '%', dlt(r.dAb, 2), fInt(r.a) + ' eleitores')}${kpi('Brancos + nulos', fNum(r.pBr + r.pNu, 2) + '%', dlt(r.dBr + r.dNu, 2), `${fInt(r.vb + r.tvn)} votos`)}${kpi('Alienação', fNum(r.ali, 2) + '%', dlt(r.dAli, 2), 'abst. + brancos + nulos', { cls: 'destaque' })}</section>` : '';
  const html = `${cartoes}${kp}
  ${ap ? '' : `<div class="aviso proj">Projeção estatística por município. O detalhamento por bairro abaixo mostra apenas o que já foi apurado nas seções (não é projeção).</div>`}
  <section class="painel mapa-sec" id="sec-geo" hidden><h2>Mapa por bairro</h2><p class="sub">Limites de bairros do IBGE (Censo 2022); cada bairro soma os locais de votação que ficam dentro dele. Os nomes e limites do IBGE podem diferir do bairro cadastrado pelo TSE na tabela abaixo. Cor = quem lidera; tom mais escuro = maior percentual. Use + / − ou a roda do mouse para aproximar.</p><div class="mapa-grid"><div id="mapa-geo"></div><div class="mapa-lado">${legendaMapa()}<p class="nota">Bairros em cinza ainda não têm seções apuradas.</p></div></div></section>
  <section class="painel mapa-sec"><h2>Mapa dos locais de votação</h2><p class="sub">Cada ponto é um local de votação; o tamanho é proporcional ao eleitorado. Cor = quem lidera; tom mais escuro = maior percentual. <span id="mb-estado"></span></p>
    <div class="alterna sem-export" id="mb-modo"><button data-m="local" class="on">Cor por local de votação</button><button data-m="bairro">Cor por bairro</button></div>
    <div class="mapa-grid"><div id="mapa-pts"><p class="carregando">Carregando…</p></div><div class="mapa-lado">${legendaMapa()}<p class="nota">Locais em cinza ainda não tiveram todas as seções apuradas.</p></div></div></section>
  <section class="painel"><h2>Bairros de ${esc(nomeMun)}</h2><p class="sub">Bairro conforme o cadastro do TSE para cada local de votação. Percentuais e variações consideram só as seções já apuradas, comparadas com o 1º turno nessas mesmas seções.</p><div id="tab-b"></div></section>
  <section class="painel"><h2>Locais de votação</h2><p class="sub">Escolas e demais locais onde as urnas ficam. Use a busca para achar um bairro ou local.</p><div id="tab-l"></div></section>`;
  return { html, titulo: `${nomeMun} (${uf.toUpperCase()})`, montar(root) {
    const alvo = root.querySelector('#mapa-pts'); let ag = lastAgg.get(uf + cd), modoMapa = 'local', mapa = null, mapaGeo = null, geo = null, tb = null, tl = null;
    const colsB = (tipo) => {
      const nomeCol = tipo === 'b' ? { k: 'nome', t: 'Bairro', h: x => `<b>${esc(bonito(x.nome))}</b>${x.st ? '' : ' <small class="agu">aguardando</small>'}`, v: x => x.nome, ini: 'asc' } : { k: 'nome', t: 'Local de votação', h: x => `<b>${esc(bonito(x.nome))}</b><br><small>${esc(bonito(x.bairro))} · ${esc(bonito(x.end))}</small>`, v: x => x.nome, ini: 'asc' };
      return [nomeCol,
        ...(tipo === 'b' ? [{ k: 'locais', t: 'Locais', h: x => fInt(x.locais), v: x => x.locais, cls: 'n sec' }] : []),
        { k: 'pst', t: 'Seções apuradas', h: x => `${fInt(x.st)}/${fInt(x.ts)}`, v: x => x.pst, cls: 'n' },
        ...['L', 'F'].flatMap(k => [
          { k: 'v' + k, t: `${cabCand(k)} votos`, h: x => x.st ? `<span class="num">${fInt(x[k])}</span>` : '', v: x => x.st ? x[k] : NaN, cls: 'n' },
          { k: 'p' + k, t: `${cabCand(k)} %`, h: x => x.st ? `<b>${fNum(x['p' + k], 2)}%</b> ${dlt(x['d' + k])}` : `<span class="t-s">1º t.: ${fNum(x['p1' + k + 'T'], 1)}%</span>`, v: x => x.st ? x['p' + k] : NaN, x: x => x['p' + k], cls: 'n' }]),
        { k: 'lid', t: 'Vence', h: x => x.lider ? `<span class="chip-l" style="background:${CAND[x.lider].cor}">${CAND[x.lider].nome.split(' ')[0]}</span>` : '', v: x => x.lider ? (x.lider === 'L' ? 1 : 0) : NaN },
        { k: 'ab', t: 'Abstenção', h: x => x.st ? `${fNum(x.pAb, 1)}% ${dlt(x.dAb)}` : '', v: x => x.pAb, cls: 'n sec' },
        { k: 'apt', t: 'Eleitores', h: x => fInt(x.apT), v: x => x.apT, cls: 'n sec' }];
    };
    function desenhar() {
      if (!ag) return;
      const { locais, bairros, tot } = ag;
      const corDe = u => u.lider ? corDoPct(u.lider, u.pw) : '#c9c4d8';
      const bmap = new Map(bairros.map(x => [x.nome, x]));
      const dados = {}; for (const l of locais) dados[l.id] = { fill: corDe(modoMapa === 'bairro' ? (bmap.get(l.bairro) || l) : l) };
      const porId = new Map(locais.map(l => [l.id, l]));
      const tip = id => { const l = porId.get(id), u = modoMapa === 'bairro' ? bmap.get(l.bairro) : l; const tt = modoMapa === 'bairro' ? `Bairro ${esc(bonito(u.nome))}` : esc(bonito(l.nome));
        return `<b>${tt}</b><br><span class="t-s">${modoMapa === 'bairro' ? '' : esc(bonito(l.bairro)) + ' · '}${fInt(u.st)}/${fInt(u.ts)} seções apuradas</span>` + (u.st ? `<br><span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(u.pL, 2)}%</b> ${fDelta(u.dL, 1)} · ${fInt(u.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(u.pF, 2)}%</b> ${fDelta(u.dF, 1)} · ${fInt(u.F)}` : `<br><span class="t-s">1º turno: ${CAND.L.nome.split(' ')[0]} ${fNum(u.p1LT, 1)}% · ${CAND.F.nome.split(' ')[0]} ${fNum(u.p1FT, 1)}%</span>`); };
      if (!mapa) { mapa = criarMapaPontos(alvo, locais, { tooltip: tip }); }
      mapa.atualizar(dados);
      if (geo) { const por = agregarPoligonos(locais, geo); root.querySelector('#sec-geo').hidden = false; if (!mapaGeo) mapaGeo = criarMapaBairros(root.querySelector('#mapa-geo'), geo, { nome: bonito, tooltip: i => { const u = por[i]; const f = geo.f[i]; if (!u) return `<b>${esc(bonito(f.n))}</b><br><span class="t-s">sem local de votação dentro do limite</span>`; return `<b>${esc(bonito(f.n))}</b><br><span class="t-s">${fInt(u.st)}/${fInt(u.ts)} seções apuradas · ${fInt(u.locais)} locais</span>` + (u.st ? `<br><span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(u.pL, 2)}%</b> ${fDelta(u.dL, 1)} · ${fInt(u.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(u.pF, 2)}%</b> ${fDelta(u.dF, 1)} · ${fInt(u.F)}` : `<br><span class="t-s">1º turno: ${CAND.L.nome.split(' ')[0]} ${fNum(u.p1LT, 1)}% · ${CAND.F.nome.split(' ')[0]} ${fNum(u.p1FT, 1)}%</span>`); } }); const dg = {}; for (const [i, u] of Object.entries(por)) dg[i] = u.st ? { k: u.lider, pw: u.pw, pL: u.pL, pF: u.pF, dL: u.dL, dF: u.dF } : {}; mapaGeo.atualizar(dg); }
      root.querySelector('#mb-estado').textContent = tot.st ? `${fNum(tot.pst, 1)}% das seções do município já chegaram (${fInt(tot.st)} de ${fInt(tot.ts)}).` : 'Os resultados aparecem aqui conforme as seções forem totalizadas.';
      tb = tabela(root.querySelector('#tab-b'), { cols: colsB('b'), rows: bairros, sort: tot.st ? 'pL' : 'locais', dir: 'desc', filtro: (x, s) => x.nome.toLowerCase().includes(s), limite: 500 });
      tl = tabela(root.querySelector('#tab-l'), { cols: colsB('l'), rows: locais, sort: 'apt', dir: 'desc', filtro: (x, s) => (x.nome + ' ' + x.bairro + ' ' + x.end).toLowerCase().includes(s), limite: 200 });
      ctx.csv = () => ({ nome: `${uf}_${cd}_bairros_${ap ? 'apuracao' : 'projecao'}`, cab: ['Bairro', 'Locais', 'Seções totais', 'Seções apuradas', 'Lula votos', 'Lula %', 'Lula var. p.p.', 'Flávio votos', 'Flávio %', 'Flávio var. p.p.', 'Abstenção %', 'Eleitores'], linhas: bairros.slice().sort((a, b) => (isNaN(b.pL) - isNaN(a.pL)) || b.pL - a.pL).map(x => [bonito(x.nome), x.locais, x.ts, x.st, x.L, x.pL, x.dL, x.F, x.pF, x.dF, x.pAb, x.apT]) });
    }
    root.querySelector('#mb-modo').addEventListener('click', e => { const bt = e.target.closest('button'); if (!bt) return; modoMapa = bt.dataset.m; root.querySelectorAll('#mb-modo button').forEach(x => x.classList.toggle('on', x === bt)); desenhar(); });
    if (ag) desenhar();
    (async () => {
      try {
        const est = await estatico(uf, cd); geo = await geoBairros(cd);
        const live = ctx.demo ? demoSecoes(est, snap.mun?.[uf]?.find(x => x[0] === cd)) : await aoVivo(uf, cd);
        ag = agregar(est, live); lastAgg.set(uf + cd, ag);
        if (alvo.isConnected) { mapa = null; desenhar(); }
      } catch (e) { if (alvo.isConnected) alvo.innerHTML = `<p class="aviso">Os dados de bairros deste município não estão disponíveis (${esc(e.message || e)}).</p>`; }
    })();
  } };
}
