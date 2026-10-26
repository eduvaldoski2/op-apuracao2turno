// Camada município → bairro → local de votação.
// Dados: data/bairros/{uf}/{cd5}.json (TSE: locais de votação, bairro, coordenadas, 1º turno por seção) +
// resultado por seção do 2º turno publicado pelo coletor (branches dados-b1…5) → agregação por local e por bairro.
import { CAND, UF_NOME, fInt, fNum, fDelta, corDoPct, clamp } from './util.js?v=2b279aa5';
import { CONFIG, RAIZ } from './config.js?v=2b279aa5';
import { getJSON } from './tse.js?v=2b279aa5';
import { esc, dlt, pcel, entenda, tabela, sem } from './ui.js?v=2b279aa5';
import { comFoco } from './foco.js?v=2b279aa5';
import { cartaoCand, barraDupla, kpi, cabCand, linhaAp } from './views.js?v=2b279aa5';
import { listaMunicipios } from './model.js?v=2b279aa5';
import { dec, topoT1, kpisT1, unidadeV, idxFoco, aplicaEscala, legendaT1, dadoMapaT1, tipUnidade as tipT1, lidChip, rankDe } from './t1.js?v=2b279aa5';
import { projetarMunicipios } from './proj.js?v=2b279aa5';
import { criarMapaPontos } from './mapapontos.js?v=2b279aa5';
import { criarMapaBairros } from './mapabairros.js?v=2b279aa5';
import { legendaMapa } from './map.js?v=2b279aa5';

const q = new URLSearchParams(location.search);
const bust = () => '?t=' + Math.floor(Date.now() / 10000);
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
  const fontes = q.get('fontebairros') ? [q.get('fontebairros')] : [`${RAIZ}liveb/${g}/`, `https://raw.githubusercontent.com/${CONFIG.repo}/${CONFIG.prefixoBairros}${g}/live/`, 'data/live/'];
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
  // cada seção tem comparecimento, brancos e nulos próprios (perfil do 1º turno na mesma seção + ruído); a soma bate com o município
  const v1 = o => o.x[2] + o.x[3] + o.x[4] + o.x[5] + o.x[6];
  const raw = esc_.map(o => o.x[1] * clamp(clamp(v1(o) / Math.max(1, o.x[1]), .35, .97) * (1 + (hash(o.x[0], o.z + 11) - .5) * .12), .2, .99));
  const sr = raw.reduce((t, v) => t + v, 0) || 1;
  const rb = vb / (c || 1), rn = tvn / (c || 1);
  const bi = o => (o.x[5] + 1) / (v1(o) + 2), ni = o => (o.x[6] + 1) / (v1(o) + 2);
  const mb = esc_.reduce((t, o, i) => t + raw[i] * bi(o), 0) / sr, mn = esc_.reduce((t, o, i) => t + raw[i] * ni(o), 0) / sr;
  let somaL = 0; const tmp = esc_.map((o, i) => { const comp = Math.min(o.x[1] * .99, raw[i] * c / sr);
    const b = comp * clamp(rb * bi(o) / mb * (1 + (hash(o.x[0], o.z + 3) - .5) * .5), 0, .3), nu = comp * clamp(rn * ni(o) / mn * (1 + (hash(o.x[0], o.z + 5) - .5) * .5), 0, .4);
    const pj = expit(logit(clamp(pm, .02, .98)) + 0.8 * (logit(p1(o)) - Math.log(media1)) + (hash(o.x[0], o.z + 7) - .5) * .25); const vv = Math.max(0, comp - b - nu); somaL += vv * pj; return { o, comp, pj, vv, b, nu }; });
  const k = L / (somaL || 1);
  for (const t of tmp) { const l = Math.round(t.vv * clamp(t.pj * k, 0, 1)), f = Math.max(0, Math.round(t.vv) - l); s[t.o.z + '-' + t.o.x[0]] = [l, f, 0, Math.round(t.b), Math.round(t.nu)]; }
  return { s, t: 'demo' };
}

// ---------- agregação ----------
const novo = () => ({ ts: 0, st: 0, ap: 0, apT: 0, L: 0, F: 0, O: 0, B: 0, N: 0, L1: 0, F1: 0, O1: 0, B1: 0, N1: 0, L1T: 0, F1T: 0, O1T: 0, B1T: 0, N1T: 0 });

const soma = (a, b) => { for (const k of Object.keys(novo())) a[k] += b[k]; if (b.V) { a.V ??= new Array(b.V.length).fill(0); for (let i = 0; i < b.V.length; i++) a.V[i] += b.V[i]; } };
let semDelta = false;
export const setSemDelta = v => { semDelta = !!v; };
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
  if (semDelta) u.dL = u.dF = u.dAb = NaN;
  return u;
}
// voto de cada candidato do 1º turno por local (ext = { x: data/b1t, T: res_1t preparado }): vetor alinhado a T.cands
function vetorLocal(est, ext, i) {
  const { x, T } = ext, V = new Array(T.cands.length).fill(0), idx = x.c.map(n => T.cands.findIndex(c => +c.n === n));
  est.l[i][14].forEach((s, j) => { V[T.iL] += s[2]; V[T.iF] += s[3]; const row = x.l[i]?.[j]; if (row) row.forEach((q, k) => { if (idx[k] >= 0) V[idx[k]] += q; }); });
  return V;
}
export function agregar(est, live, ext) {
  const locais = [], porBairro = new Map(), tot = novo();
  for (const [li, l] of est.l.entries()) {
    const u = novo(); u.ts = l[14].length;
    for (const s of l[14]) {
      u.apT += s[1]; u.L1T += s[2]; u.F1T += s[3]; u.O1T += s[4]; u.B1T += s[5]; u.N1T += s[6];
      const x = live.s[l[0] + '-' + s[0]]; if (!x) continue;
      u.st++; u.ap += s[1]; u.L += x[0]; u.F += x[1]; u.O += x[2]; u.B += x[3]; u.N += x[4];
      u.L1 += s[2]; u.F1 += s[3]; u.O1 += s[4]; u.B1 += s[5]; u.N1 += s[6];
    }
    const bairro = l[4] || SEM_BAIRRO;
    if (ext) u.V = vetorLocal(est, ext, li);
    derivar(u); Object.assign(u, { id: l[0] + '-' + l[1], z: l[0], nome: l[2], end: l[3], bairro, cep: l[5], lat: l[6], lon: l[7] });
    locais.push(u);
    if (!porBairro.has(bairro)) porBairro.set(bairro, Object.assign(novo(), { locais: 0 }));
    const b = porBairro.get(bairro); soma(b, u); b.locais++;
    soma(tot, u);
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
const ACENTOS_SP = 'Água Rasa|Alto de Pinheiros|Belém|Brás|Brasilândia|Butantã|Cangaíba|Capão Redondo|Carrão|Cidade Líder|Consolação|Freguesia do Ó|Grajaú|Jaçanã|Jaguaré|Jaraguá|Jardim Ângela|Jardim São Luís|José Bonifácio|Limão|Parque do Carmo|República|Sacomã|Santa Cecília|São Domingos|São Lucas|São Mateus|São Miguel|São Rafael|Saúde|Sé|Tatuapé|Tremembé|Vila Curuçá|Vila Jacuí|Vila Sônia'.split('|');
const semAcento = t => t.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
const MAPA_AC = new Map(ACENTOS_SP.map(n => [semAcento(n), n]));
export const nivelG = geo => geo?.rotuloNome ? { cap: geo.rotuloNome, min: geo.rotuloNome.toLowerCase(), plural: 'Regiões administrativas', um: 'uma', na: 'nesta' } : { cap: 'Distrito', min: 'distrito', plural: 'Distritos', um: 'um', na: 'neste' };
const corrige = g => { if (g && g.rotulo === 'distrito') for (const f of g.f) f.n = MAPA_AC.get(semAcento(f.n)) || f.n; return g; };
async function geoBairros(cd) { if (!geoCache.has(cd)) geoCache.set(cd, getJSON(`data/bairros_geo/${cd}.json`, { retries: 0 }).then(corrige).catch(() => null)); return geoCache.get(cd); }

// ---------- utilidades compartilhadas pelas telas ----------
const nota = ctx => ctx.modo === 't1' ? 'Resultado oficial do 1º turno (porcentagens sobre os votos válidos de todos os candidatos).' : 'Percentuais e variações consideram só as seções já apuradas, comparadas com o 1º turno nessas mesmas seções.';
const pref = m => m === 't1' ? '#/t1/' : m === 'pr' ? '#/p/' : '#/';
const rotaMun = (m, uf, cd) => `${pref(m)}mun/${uf}/${cd}`;
const chaveB = n => 'n:' + encodeURIComponent(n);
export const somar = locais => { const u = Object.assign(novo(), { locais: locais.length }); for (const l of locais) soma(u, l); return derivar(u); };
const unidadeR = u => ({ pst: u.pst, st: u.st, ts: u.ts, L: u.L, F: u.F, pL: u.pL, pF: u.pF, dL: u.dL, dF: u.dF, lider: u.lider });
const placar = (u, titulo, modo, ap, vazio) => { const r = unidadeR(u); return `<section class="placar uf ${ap ? '' : 'proj'}">${cartaoCand('L', r, { modo, conf: false, semLink: true })}<div class="centro"><div class="centro-t">${esc(titulo)}</div>${ap && u.ts ? `<div class="cobertura"><b>${fNum(u.pst, 2)}%</b> das seções</div><div class="cob-bar"><i style="width:${Math.max(0, Math.min(100, u.pst))}%"></i></div><div class="cob-s">${fInt(u.st)} de ${fInt(u.ts)} seções apuradas</div>` : ''}${barraDupla(r.pL, r.pF)}<div class="margem">${r.lider ? `<b style="color:${CAND[r.lider].cor}">${CAND[r.lider].nome}</b> à frente por <b>${fInt(Math.abs(r.L - r.F))}</b> votos` : vazio}</div></div>${cartaoCand('F', r, { modo, conf: false, semLink: true })}</section>`; };
const dec1 = u => ({ pAb: u.pAb, c: u.c, te: u.ap, ab: u.ap - u.c, pBr: u.pBr, vb: u.B, pNu: u.pNu, tvn: u.N });
// topo das telas de distrito/bairro/local: no 1º turno, fichas de todos os candidatos; nos demais, placar Lula × Flávio
const topo = (ctx, u, titulo, ap, vazio) => ctx.modo === 't1' && u.V ? topoT1(ctx.T1, unidadeV(ctx.T1, u.V), titulo) + kpisT1(dec1(u)) : placar(u, titulo, ctx.modo, ap, vazio) + kpisUnidade(u);
const tipX = (ctx, nome, u, sub) => ctx.modo === 't1' && u.V ? tipT1(ctx.T1, nome + (sub ? ' · ' + sub : ''), unidadeV(ctx.T1, u.V)) : tipUnidade(esc(nome), u, sub ? esc(sub) : undefined);
const corDeX = (ctx, u) => { if (ctx.modo !== 't1' || !u.V) return corDe(u); const d = dadoMapaT1(ctx.T1, unidadeV(ctx.T1, u.V)); return d.k ? corDoPct(d.k, d.pw) : '#c9c4d8'; };
// CSV do 1º turno: todos os candidatos
const cabCsvT1 = (T, rot) => [rot, 'Seções', 'Eleitores', 'Abstenção %', 'Brancos', 'Nulos', ...T.cands.flatMap((c, i) => [`${T.nome(i)} votos`, `${T.nome(i)} %`])];
const linhasCsvT1 = (T, arr, nomeCol) => arr.slice().sort((a, b) => String(nomeCol(a)).localeCompare(String(nomeCol(b)), 'pt-BR')).map(x => { const u = unidadeV(T, x.V); return [nomeCol(x), x.ts, x.apT, x.pAb, x.B, x.N, ...T.cands.flatMap((c, i) => [u.v[i], u.p[i]])]; });
const kpisUnidade = u => `<section class="kpis k4">${kpi('Seções apuradas', `${fInt(u.st)}/${fInt(u.ts)}`, null, u.ts ? fNum(u.pst, 2) + '% das seções' : '')}${kpi('Abstenção', u.st ? fNum(u.pAb, 2) + '%' : '–', u.st ? dlt(u.dAb, 2) : null, `${fInt(u.apT)} eleitores no total`)}${kpi('Brancos + nulos', u.st ? fNum(u.pBr + u.pNu, 2) + '%' : '–', null, `${fInt(u.B + u.N)} votos`)}${kpi('Comparecimento', u.st ? fNum(100 - u.pAb, 2) + '%' : '–', null, `${fInt(u.c)} votos apurados`)}</section>`;

const tipUnidade = (titulo, u, rotuloSub) => `<b>${titulo}</b><br><span class="t-s">${rotuloSub ? rotuloSub + ' · ' : ''}${fInt(u.st)}/${fInt(u.ts)} seções apuradas</span>` + (u.st ? `<br><span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(u.pL, 2)}%</b> ${fDelta(u.dL, 1)} · ${fInt(u.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(u.pF, 2)}%</b> ${fDelta(u.dF, 1)} · ${fInt(u.F)}` : `<br><span class="t-s">1º turno: ${CAND.L.nome.split(' ')[0]} ${fNum(u.p1LT, 1)}% · ${CAND.F.nome.split(' ')[0]} ${fNum(u.p1FT, 1)}%</span>`);
const corDe = u => u.lider ? corDoPct(u.lider, u.pw) : '#c9c4d8';

// votos de um candidato com, em parênteses embaixo, quantos a mais (+) ou a menos (−) ele teve em relação à própria votação no 1º turno, nas mesmas seções
const vdif = (v, v1) => { const d = v - v1; return `<span class="vc"><b>${fInt(v)}</b>${isNaN(d) ? '' : `<span class="dlt ${d > 0 ? 'pos' : d < 0 ? 'neg' : 'zero'}" title="Diferença para a votação do próprio candidato no 1º turno, nas mesmas seções">(${d > 0 ? '+' : d < 0 ? '−' : ''}${fInt(Math.abs(d))})</span>`}</span>`; };
function colunas(tipo, ap, uf, cd, rot = 'Bairro', T1 = null) {
  const nomeCol = tipo === 'b' ? { k: 'nome', t: rot, h: x => `<b>${esc(bonito(x.nome))}</b>${x.st ? '' : ' <small class="agu">aguardando</small>'}`, v: x => x.nome, ini: 'asc' }
    : { k: 'nome', t: 'Local de votação', h: x => `<b>${esc(bonito(x.nome))}</b><br><small>${esc(bonito(x.bairro))} · ${esc(bonito(x.end))}</small>`, v: x => x.nome, ini: 'asc' };
  const locaisCol = tipo === 'b' ? [{ k: 'locais', t: 'Locais', h: x => fInt(x.locais), v: x => x.locais, cls: 'n sec' }] : [];
  if (T1) {
    const U = x => (x._u ??= unidadeV(T1, x.V)), fi = idxFoco(T1), cn = i => `<span class="cab-c" style="--c:${T1.cor(i)}">${esc(T1.curto(i))}</span>`;
    const lid = { k: 'lid', t: 'Mais votado', h: x => lidChip(T1, U(x)), v: x => U(x).vv ? T1.curto(U(x).lid) : '', cls: 'c' };
    const fx = fi >= 0 ? [
      { k: 'pos', t: 'Posição', h: x => U(x).vv ? `${rankDe(U(x), fi)}º` : '', v: x => U(x).vv ? rankDe(U(x), fi) : NaN, cls: 'c' },
      { k: 'vf', t: `${cn(fi)} votos`, h: x => fInt(U(x).v[fi]), v: x => U(x).v[fi], cls: 'n' },
      { k: 'pf', t: `${cn(fi)} %`, h: x => U(x).vv ? `<b>${fNum(U(x).p[fi], 2)}%</b>` : '', v: x => U(x).p[fi], cls: 'n' }]
      : [...[T1.iL, T1.iF].flatMap(i => [
        { k: 'v' + i, t: `${cn(i)} votos`, h: x => fInt(U(x).v[i]), v: x => U(x).v[i], cls: 'n' },
        { k: 'p' + i, t: `${cn(i)} %`, h: x => U(x).vv ? `<b>${fNum(U(x).p[i], 2)}%</b>` : '', v: x => U(x).p[i], cls: 'n' }]),
        { k: 'pO', t: 'Outros %', h: x => U(x).vv ? `${fNum(100 - U(x).p[T1.iL] - U(x).p[T1.iF], 2)}%` : '', v: x => 100 - U(x).p[T1.iL] - U(x).p[T1.iF], cls: 'n sec' }];
    return [nomeCol, ...locaisCol, { k: 'ts', t: 'Seções', h: x => fInt(x.ts), v: x => x.ts, cls: 'n sec' }, lid, ...fx,
      { k: 'ab', t: 'Abstenção', h: x => x.st ? `${fNum(x.pAb, 1)}%` : '', v: x => x.pAb, cls: 'n sec' },
      { k: 'apt', t: 'Eleitores', h: x => fInt(x.apT), v: x => x.apT, cls: 'n sec' }];
  }
  return [nomeCol, ...locaisCol,
    { k: 'pst', t: 'Seções apuradas', h: x => `${fInt(x.st)}/${fInt(x.ts)}`, v: x => x.pst, cls: 'n' },
    ...['L', 'F'].flatMap(k => [
      { k: 'v' + k, t: `${cabCand(k)} votos`, h: x => x.st ? vdif(x[k], x[k + '1']) : '', v: x => x.st ? x[k] : NaN, cls: 'n' },
      { k: 'p' + k, t: `${cabCand(k)} %`, h: x => x.st ? pcel(x['p' + k], x['d' + k]) : `<span class="t-s">1º t.: ${fNum(x['p1' + k + 'T'], 1)}%</span>`, v: x => x.st ? x['p' + k] : NaN, x: x => x['p' + k], cls: 'n' }]),
    { k: 'lid', t: 'Vence', h: x => x.lider ? `<span class="chip-l" style="background:${CAND[x.lider].cor}">${CAND[x.lider].nome.split(' ')[0]}</span>` : '', v: x => x.lider ? (x.lider === 'L' ? 1 : 0) : NaN, cls: 'c' },
    { k: 'ab', t: 'Abstenção', h: x => x.st ? pcel(x.pAb, x.dAb, 1, true) : '', v: x => x.pAb, cls: 'n sec' },
    { k: 'apt', t: 'Eleitores', h: x => fInt(x.apT), v: x => x.apT, cls: 'n sec' }];
}
const linhasCsv = (arr, nomeCol) => arr.slice().sort((a, b) => (isNaN(b.pL) - isNaN(a.pL)) || b.pL - a.pL).map(x => [nomeCol(x), x.ts, x.st, x.L, x.pL, x.dL, x.F, x.pF, x.dF, x.pAb, x.apT]);
const cabCsv = ['Nome', 'Seções totais', 'Seções apuradas', 'Lula votos', 'Lula %', 'Lula var. p.p.', 'Flávio votos', 'Flávio %', 'Flávio var. p.p.', 'Abstenção %', 'Eleitores'];

// carrega (com cache) os dados do município e devolve { est, geo, ag, live }
const cacheMun = new Map();
const sint1T = est => { const s = {}; for (const l of est.l) for (const x of l[14]) s[l[0] + '-' + x[0]] = [x[2], x[3], x[4], x[5], x[6]]; return { s, t: '1t' }; };
const chaveC = (ctx, uf, cd) => (ctx.modo === 't1' ? 't:' : ctx.demo ? 'd:' : '') + uf + cd;
async function carregarMun(ctx, uf, cd) {
  setSemDelta(ctx.modo === 't1');
  const est = await estatico(uf, cd), geo = await geoBairros(cd);
  const live = ctx.modo === 't1' ? sint1T(est) : ctx.demo ? demoSecoes(est, ctx.snap.mun?.[uf]?.find(x => x[0] === cd)) : await aoVivo(uf, cd);
  let x1 = null; if (ctx.modo === 't1') x1 = await getJSON(`data/b1t/${uf}/${cd}.json`, { retries: 1 }).catch(() => null);
  const ag = agregar(est, live, x1 ? { x: x1, T: ctx.T1 } : null); const r = { est, geo, live, ag, x1 }; cacheMun.set(chaveC(ctx, uf, cd), r); return r;
}
function iniciar(ctx, uf, cd, root, alvoErro, aoPronto) {
  setSemDelta(ctx.modo === 't1');
  const c = cacheMun.get(chaveC(ctx, uf, cd)); if (c) aoPronto(c);
  carregarMun(ctx, uf, cd).then(r => { if (alvoErro.isConnected) aoPronto(r); }).catch(e => { if (alvoErro.isConnected && !c) alvoErro.innerHTML = `<p class="aviso">Os dados deste município não estão disponíveis (${esc(e.message || e)}).</p>`; });
}
const infoMun = (ctx, uf, cd) => { const b = (ctx.B.byUf[uf] || []).find(x => x.cd === cd); return b ? { nome: bonito(b.nome), uf, ufn: UF_NOME[uf] || uf.toUpperCase() } : null; };
const trilhaBase = (m, mun, uf, cd) => [['Brasil', pref(m)], [mun.ufn, `${pref(m)}uf/${uf}`], [mun.nome, rotaMun(m, uf, cd)]];

// ---------- Município ----------
export function viewMun(ctx, uf, cd) {
  const { modo, B, V, P, snap } = ctx, ap = modo !== 'pr', t1 = modo === 't1';
  const mun = infoMun(ctx, uf, cd);
  if (!mun) return { html: `<div class="aviso">Município não encontrado.</div>`, titulo: 'Município', montar() {} };
  const nomeMun = mun.nome;
  const m = t1 ? null : (ap ? listaMunicipios(B, V, uf) : projetarMunicipios(B, snap, P, uf)).find(x => x.cd === cd);
  const linhaT1 = t1 ? ctx.T1.mun[uf]?.find(x => x[0] === cd) : null, uT1 = linhaT1 ? dec(ctx.T1, linhaT1, 1) : null;
  let r;
  if (t1) r = uT1 && uT1.vv ? { pst: 0, st: uT1.ts, ts: uT1.ts, L: uT1.L, F: uT1.F, pL: uT1.pL, pF: uT1.pF, dL: NaN, dF: NaN, lider: uT1.L >= uT1.F ? 'L' : 'F' } : { pst: 0, L: NaN, F: NaN, pL: NaN, pF: NaN, lider: null };
  else if (ap && m?.apurado) r = linhaAp(cd, m);
  else if (m && (m.L + m.F > 0)) r = { pst: m.pst, st: 0, ts: 0, L: m.L, F: m.F, pL: m.pL, pF: m.pF, dL: m.pL - m.p1L, dF: m.pF - m.p1F, lider: m.L > m.F ? 'L' : 'F', pAb: m.pAb, dAb: m.dAb, pBr: m.pBr, pNu: m.pNu, ali: m.ali, dAli: m.dAli };
  else r = { pst: 0, L: NaN, F: NaN, pL: NaN, pF: NaN, lider: null };
  const cartoes = `<section class="placar uf ${ap ? '' : 'proj'}">${cartaoCand('L', r, { modo: t1 ? 'ap' : modo, conf: false, semLink: t1 })}<div class="centro"><div class="centro-t">${esc(nomeMun)} · ${uf.toUpperCase()}</div>${ap && !t1 && r.ts ? `<div class="cobertura"><b>${fNum(r.pst, 2)}%</b> das seções</div><div class="cob-bar"><i style="width:${Math.max(0, Math.min(100, r.pst))}%"></i></div><div class="cob-s">${fInt(r.st)} de ${fInt(r.ts)} seções apuradas</div>` : ''}${barraDupla(r.pL, r.pF)}<div class="margem">${r.lider ? `<b style="color:${CAND[r.lider].cor}">${CAND[r.lider].nome}</b> à frente por <b>${fInt(Math.abs(r.L - r.F))}</b> votos` : (ap ? 'Aguardando a apuração das seções' : '')}</div></div>${cartaoCand('F', r, { modo: t1 ? 'ap' : modo, conf: false, semLink: t1 })}</section>`;
  const kp = ap && m?.apurado ? `<section class="kpis k4">${kpi('Apurado', fNum(r.pst, 2) + '%', null, `${fInt(r.st)} de ${fInt(r.ts)} seções`)}${kpi('Abstenção', fNum(r.pAb, 2) + '%', dlt(r.dAb, 2), fInt(r.a) + ' eleitores')}${kpi('Brancos + nulos', fNum(r.pBr + r.pNu, 2) + '%', dlt(r.dBr + r.dNu, 2), `${fInt(r.vb + r.tvn)} votos`)}${kpi('Alienação', fNum(r.ali, 2) + '%', dlt(r.dAli, 2), 'abst. + brancos + nulos', { cls: 'destaque' })}</section>` : '';
  const html = `${t1 && uT1 ? topoT1(ctx.T1, uT1, nomeMun) + kpisT1(uT1) : cartoes + kp}
  ${ap ? '' : `<div class="aviso proj">Projeção estatística por município. O detalhamento por bairro abaixo mostra apenas o que já foi apurado nas seções (não é projeção).</div>`}
  <section class="painel mapa-sec" id="sec-geo" hidden><h2 id="geo-titulo">Mapa por bairro</h2><p class="sub"><b id="geo-clique">Clique numa área</b> para ver os locais de votação dela. <span id="geo-prog"></span> <span id="geo-aprox" class="geo-aprox"></span></p>
    ${entenda(`Cada área soma os locais de votação que ficam dentro dela. <span id="geo-fonte"></span> Os nomes e limites podem diferir do bairro cadastrado pelo TSE na tabela abaixo. Cor = ${t1 ? 'candidato mais votado (ou o candidato escolhido nas fichas)' : 'quem lidera'}; tom mais escuro = maior percentual. Use + / − ou a roda do mouse para aproximar. ${t1 ? '' : 'Áreas em cinza ainda não têm seções apuradas.'}`)}
    <div class="mapa-grid"><div id="mapa-geo"></div><div class="mapa-lado">${legendaMapa()}</div></div></section>
  <section class="painel mapa-sec" id="sec-pts"><h2>Mapa por bairro</h2><p class="sub"><b>Clique num ponto</b> para abrir o local de votação. <span id="mb-estado"></span></p>
    ${entenda(`Não há limites oficiais de bairros para este município; cada ponto é um local de votação (o tamanho é proporcional ao eleitorado) e a cor é a do resultado do <b>bairro</b> a que ele pertence. ${t1 ? '' : 'Pontos em cinza: bairro ainda sem seções apuradas.'}`)}
    <div class="mapa-grid"><div id="mapa-pts"><p class="carregando">Carregando…</p></div><div class="mapa-lado">${legendaMapa()}</div></div></section>
  <section class="painel"><h2 id="tab-titulo">Bairros de ${esc(nomeMun)}</h2><p class="sub" id="tab-sub"><b>Clique num bairro</b> para ver os locais de votação.</p>${entenda(`Bairro conforme o cadastro do TSE para cada local de votação. ${nota(ctx)}`)}<div id="tab-b"></div></section>`;
  return { html, titulo: `${nomeMun} (${uf.toUpperCase()})`, trilha: [['Brasil', pref(ctx.modo)], [mun.ufn, `${pref(ctx.modo)}uf/${uf}`], [nomeMun]], montar(root) {
    const alvo = root.querySelector('#mapa-pts'); let mapa = null, mapaGeo = null;
    function desenhar({ geo, ag }) {
      const { locais, bairros, tot } = ag, T1 = t1 ? ctx.T1 : null, fi = T1 ? idxFoco(T1) : -1, bmap = new Map(bairros.map(x => [x.nome, x])), porId = new Map(locais.map(l => [l.id, l]));
      const dist = geo?.rotulo === 'distrito', por = geo ? agregarPoligonos(locais, geo) : null;
      if (T1) { aplicaEscala(T1, (geo ? Object.values(por) : bairros).map(u => fi >= 0 ? unidadeV(T1, u.V).p[fi] : NaN)); root.querySelectorAll('.mapa-lado').forEach(e => { e.innerHTML = legendaT1(T1, unidadeV(T1, tot.V)); }); }
      if (!geo) {
        const dados = {}; for (const l of locais) dados[l.id] = { fill: corDeX(ctx, bmap.get(l.bairro) || l) };
        if (!mapa) mapa = criarMapaPontos(alvo, locais, { tooltip: id => { const l = porId.get(id), u = bmap.get(l.bairro); return tipX(ctx, bonito(l.nome), u, `Bairro ${bonito(u.nome)}`); }, onClick: id => ctx.ir(`${rotaMun(ctx.modo, uf, cd)}/l/${id}`) });
        mapa.atualizar(dados);
      }
      root.querySelector('#sec-pts').hidden = !!geo;
      let linhasTab = bairros, rotTab = 'Bairro';
      if (geo) {
        root.querySelector('#sec-geo').hidden = false; root.querySelector('#geo-fonte').textContent = 'Limites: ' + (geo.fonte || 'IBGE (Censo 2022)') + '.'; if (geo.aprox) root.querySelector('#geo-aprox').textContent = 'Áreas aproximadas, desenhadas a partir dos locais de votação (não são os limites oficiais dos bairros).';
        const ir = i => por[i] && ctx.ir(dist ? `${rotaMun(ctx.modo, uf, cd)}/d/${i}` : `${rotaMun(ctx.modo, uf, cd)}/b/g:${i}`);
        if (dist) {
          root.querySelector('#geo-titulo').textContent = `Mapa por ${nivelG(geo).min}`;
          root.querySelector('#geo-clique').textContent = `Clique ${nivelG(geo).um === 'uma' ? 'numa' : 'num'} ${nivelG(geo).min}`; linhasTab = Object.entries(por).map(([i, u]) => Object.assign(u, { id: 'd' + i, di: i })); rotTab = nivelG(geo).cap;
          root.querySelector('#tab-titulo').textContent = `${nivelG(geo).plural} de ${nomeMun}`;
          root.querySelector('#tab-sub').innerHTML = `<b>Clique ${nivelG(geo).um === 'uma' ? 'numa' : 'num'} ${nivelG(geo).min}</b> para ver os bairros e, depois, os locais de votação.`;
        }
        if (!mapaGeo) mapaGeo = criarMapaBairros(root.querySelector('#mapa-geo'), geo, { nome: bonito, onClick: ir, tooltip: i => { const u = por[i], f = geo.f[i]; return u ? tipX(ctx, bonito(f.n), u, `${fInt(u.locais)} locais`) : `<b>${esc(bonito(f.n))}</b><br><span class="t-s">sem local de votação dentro do limite</span>`; } });
        const dg = {}; for (const [i, u] of Object.entries(por)) dg[i] = t1 && u.V ? dadoMapaT1(T1, unidadeV(T1, u.V)) : u.st ? { k: u.lider, pw: u.pw, pL: u.pL, pF: u.pF, dL: u.dL, dF: u.dF } : {}; mapaGeo.atualizar(dg);
      }
      const prog = t1 ? '' : tot.st ? `${fNum(tot.pst, 1)}% das seções do município já chegaram (${fInt(tot.st)} de ${fInt(tot.ts)}).` : 'Os resultados aparecem aqui conforme as seções forem totalizadas.';
      root.querySelector('#mb-estado').textContent = prog; const pg = root.querySelector('#geo-prog'); if (pg) pg.textContent = prog;
      tabela(root.querySelector('#tab-b'), { cols: colunas('b', ap, uf, cd, rotTab, t1 ? ctx.T1 : null), rows: linhasTab, onRow: x => ctx.ir(dist ? `${rotaMun(ctx.modo, uf, cd)}/d/${x.di}` : `${rotaMun(ctx.modo, uf, cd)}/b/${chaveB(x.nome)}`), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.nome).includes(q), limite: 500 });
      ctx.csv = () => ({ nome: `${uf}_${cd}_${rotTab.toLowerCase()}s_${t1 ? '1turno' : ap ? 'apuracao' : 'projecao'}`, cab: t1 ? cabCsvT1(ctx.T1, rotTab) : [rotTab, ...cabCsv.slice(1)], linhas: t1 ? linhasCsvT1(ctx.T1, linhasTab, x => bonito(x.nome)) : linhasCsv(linhasTab, x => bonito(x.nome)) });
    }
    iniciar(ctx, uf, cd, root, alvo, desenhar);
  } };
}

// ---------- Distrito (só onde a malha é de distritos, ex.: São Paulo) → bairros ----------
export function viewDistrito(ctx, uf, cd, di) {
  const ap = ctx.modo !== 'pr', mun = infoMun(ctx, uf, cd);
  if (!mun) return { html: `<div class="aviso">Município não encontrado.</div>`, titulo: 'Distrito', montar() {} };
  return { html: `<div id="d-corpo"><p class="carregando">Carregando…</p></div>`, titulo: 'Distrito', trilha: trilhaBase(ctx.modo, mun, uf, cd), montar(root) {
    const corpo = root.querySelector('#d-corpo');
    iniciar(ctx, uf, cd, root, corpo, ({ geo, ag }) => {
      const nv = nivelG(geo), locais = ag.locais.filter(l => geo?.loc[l.id] === di), nome = bonito(geo?.f[di]?.n || nv.cap), u = somar(locais);
      document.querySelector('.tela-topo h1').textContent = `${nome} — ${mun.nome} (${uf.toUpperCase()})`;
      const nav = document.querySelector('.trilha'); if (nav) nav.innerHTML = trilhaHtml([...trilhaBase(ctx.modo, mun, uf, cd), [`${nv.cap}: ${nome}`]]);
      if (!locais.length) { corpo.innerHTML = `<div class="aviso">Nenhum local de votação encontrado ${nv.na} ${nv.min}.</div>`; return; }
      const porB = new Map(); for (const l of locais) { if (!porB.has(l.bairro)) porB.set(l.bairro, []); porB.get(l.bairro).push(l); }
      const bairros = [...porB].map(([n, ls]) => Object.assign(somar(ls), { nome: n, id: n }));
      corpo.innerHTML = `${topo(ctx, u, `${nome} · ${mun.nome}`, ap, 'Aguardando a apuração das seções')}
        <section class="painel"><h2>Bairros de ${esc(nome)} (${fInt(bairros.length)})</h2><p class="sub"><b>Clique num bairro</b> para ver os locais de votação.</p>${entenda('Bairro conforme o cadastro do TSE para cada local de votação.')}<div id="tab-b"></div></section>`;
      tabela(corpo.querySelector('#tab-b'), { cols: colunas('b', ap, uf, cd, 'Bairro', ctx.modo === 't1' ? ctx.T1 : null), rows: bairros, onRow: x => ctx.ir(`${rotaMun(ctx.modo, uf, cd)}/d/${di}/b/${chaveB(x.nome)}`), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.nome).includes(q), limite: 500 });
      ctx.csv = () => ({ nome: `${uf}_${cd}_${nome}_bairros_${ctx.modo === 't1' ? '1turno' : ap ? 'apuracao' : 'projecao'}`.toLowerCase().replace(/[^a-z0-9_]+/g, '-'), cab: ctx.modo === 't1' ? cabCsvT1(ctx.T1, 'Bairro') : ['Bairro', ...cabCsv.slice(1)], linhas: ctx.modo === 't1' ? linhasCsvT1(ctx.T1, bairros, x => bonito(x.nome)) : linhasCsv(bairros, x => bonito(x.nome)) });
    });
  } };
}


// Blocos HTML (um por local de votação) com a tabela de seções, para o PDF da tela de locais de votação.
function blocosSecoesPDF(est, live, locais, t1) {
  const TH = 'padding:6px 8px;text-align:right;font:700 11px system-ui,sans-serif;color:#3E347E;border-bottom:2px solid #D9D4F0;white-space:nowrap', TD = 'padding:5px 8px;text-align:right;font:12.5px system-ui,sans-serif;border-bottom:1px solid #eee9f6;color:#1b1530';
  const nL = CAND.L.nome.split(' ')[0], nF = CAND.F.nome.split(' ')[0], n = v => (v == null || Number.isNaN(v)) ? '' : fInt(v), p = v => Number.isFinite(v) ? fNum(v, 1) + '%' : '';
  const cab = t1 ? ['Seção', 'Eleitores', nL + ' votos', nL + ' %', nF + ' votos', nF + ' %', 'Outros votos', 'Brancos', 'Nulos', 'Abstenção']
                 : ['Seção', 'Eleitores', nL + ' votos', nL + ' %', nF + ' votos', nF + ' %', 'Vence', 'Brancos', 'Nulos', 'Abstenção'];
  return locais.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(l => {
    const bruto = est.l.find(x => x[0] + '-' + x[1] === l.id); if (!bruto) return '';
    const linhas = bruto[14].map(s => {
      let L, F, O, B, N, ok = true;
      if (t1) { L = s[2]; F = s[3]; O = s[4]; B = s[5]; N = s[6]; }
      else { const x = live.s[l.z + '-' + s[0]]; if (!x) ok = false; else { L = x[0]; F = x[1]; O = x[2]; B = x[3]; N = x[4]; } }
      if (!ok) return `<tr><td style="${TD};font-weight:700;text-align:left">${fInt(s[0])}</td><td style="${TD}">${fInt(s[1])}</td><td style="${TD};color:#8a84a3;text-align:left" colspan="${cab.length - 2}">aguardando apuração</td></tr>`;
      const vv = L + F + O, c = vv + B + N;
      const lider = t1 ? fInt(O) : (L >= F ? nL : nF);
      return `<tr><td style="${TD};font-weight:700;text-align:left">${fInt(s[0])}</td><td style="${TD}">${fInt(s[1])}</td><td style="${TD}">${n(L)}</td><td style="${TD}"><b>${p(pc(L, vv))}</b></td><td style="${TD}">${n(F)}</td><td style="${TD}"><b>${p(pc(F, vv))}</b></td><td style="${TD}">${t1 ? n(O) : lider}</td><td style="${TD}">${n(B)}</td><td style="${TD}">${n(N)}</td><td style="${TD}">${p(pc(s[1] - c, s[1]))}</td></tr>`;
    }).join('');
    return `<div style="margin:0 0 18px;font-family:system-ui,sans-serif"><div style="font:700 14px system-ui,sans-serif;color:#2A2260">${esc(bonito(l.nome))}</div><div style="font:12px system-ui,sans-serif;color:#5d5675;margin:1px 0 6px">${esc(bonito(l.end))} · zona ${fInt(l.z)} · ${fInt(l.apT)} eleitores · ${fInt(bruto[14].length)} seções</div>
      <table style="border-collapse:collapse;width:100%"><thead><tr>${cab.map((h, i) => `<th style="${TH};${i === 0 ? 'text-align:left' : ''}">${esc(h)}</th>`).join('')}</tr></thead><tbody>${linhas}</tbody></table></div>`;
  }).filter(Boolean);
}

// ---------- Bairro (ou área da malha) → locais de votação (só lista) ----------
export function viewBairro(ctx, uf, cd, chave, di) {
  const ap = ctx.modo !== 'pr', mun = infoMun(ctx, uf, cd);
  if (!mun) return { html: `<div class="aviso">Município não encontrado.</div>`, titulo: 'Bairro', montar() {} };
  const geoSel = chave.startsWith('g:'), valor = geoSel ? +chave.slice(2) : decodeURIComponent(chave.slice(2));
  return { html: `<div id="b-corpo"><p class="carregando">Carregando…</p></div>`, titulo: 'Bairro', trilha: trilhaBase(ctx.modo, mun, uf, cd), montar(root) {
    const corpo = root.querySelector('#b-corpo');
    iniciar(ctx, uf, cd, root, corpo, ({ est, geo, ag, live }) => {
      const locais = ag.locais.filter(l => (geoSel ? geo?.loc[l.id] === valor : l.bairro === valor) && (di == null || geo?.loc[l.id] === di));
      const nome = geoSel ? bonito(geo?.f[valor]?.n || 'Área') : bonito(valor), u = somar(locais);
      document.querySelector('.tela-topo h1').textContent = `${nome} — ${mun.nome} (${uf.toUpperCase()})`;
      const nv = nivelG(geo), nomeDist = di != null ? bonito(geo?.f[di]?.n || nv.cap) : null;
      const rot = geoSel && geo?.rotulo === 'distrito' ? nv.cap : 'Bairro';
      const nav = document.querySelector('.trilha'); if (nav) nav.innerHTML = trilhaHtml([...trilhaBase(ctx.modo, mun, uf, cd), ...(di != null ? [[`${nv.cap}: ${nomeDist}`, `${rotaMun(ctx.modo, uf, cd)}/d/${di}`]] : []), [`${rot}: ${nome}`]]);
      if (!locais.length) { corpo.innerHTML = `<div class="aviso">Nenhum local de votação encontrado nesta área.</div>`; return; }
      corpo.innerHTML = `${topo(ctx, u, `${nome} · ${mun.nome}`, ap, 'Aguardando a apuração das seções')}
        <section class="painel"><h2>Locais de votação (${fInt(locais.length)})</h2><p class="sub"><b>Clique num local de votação</b> para ver o resultado de cada seção.</p><div id="tab-l"></div></section>`;
      ctx.pdfExtra = () => ({ titulo: 'Seções de cada local de votação', blocos: blocosSecoesPDF(est, live, locais, ctx.modo === 't1') });
      tabela(corpo.querySelector('#tab-l'), { cols: colunas('l', ap, uf, cd, undefined, ctx.modo === 't1' ? ctx.T1 : null), rows: locais, onRow: x => ctx.ir(`${rotaMun(ctx.modo, uf, cd)}/l/${x.id}`), sort: 'nome', dir: 'asc', filtro: (x, q) => sem(x.nome + ' ' + x.end).includes(q), limite: 300 });
      ctx.csv = () => ({ nome: `${uf}_${cd}_${nome}_locais_${ctx.modo === 't1' ? '1turno' : ap ? 'apuracao' : 'projecao'}`.toLowerCase().replace(/[^a-z0-9_]+/g, '-'), cab: ctx.modo === 't1' ? cabCsvT1(ctx.T1, 'Local de votação') : ['Local de votação', ...cabCsv.slice(1)], linhas: ctx.modo === 't1' ? linhasCsvT1(ctx.T1, locais, x => bonito(x.nome)) : linhasCsv(locais, x => bonito(x.nome)) });
    });
  } };
}

// ---------- Local de votação → seções ----------
export function viewLocal(ctx, uf, cd, id) {
  const ap = ctx.modo !== 'pr', mun = infoMun(ctx, uf, cd);
  if (!mun) return { html: `<div class="aviso">Município não encontrado.</div>`, titulo: 'Local de votação', montar() {} };
  return { html: `<div id="l-corpo"><p class="carregando">Carregando…</p></div>`, titulo: 'Local de votação', trilha: trilhaBase(ctx.modo, mun, uf, cd), montar(root) {
    const corpo = root.querySelector('#l-corpo');
    iniciar(ctx, uf, cd, root, corpo, ({ est, geo, ag, live, x1 }) => {
      const li = est.l.findIndex(x => x[0] + '-' + x[1] === id), l = ag.locais.find(x => x.id === id), bruto = est.l[li], T1 = ctx.modo === 't1' ? ctx.T1 : null, fi = T1 ? idxFoco(T1) : -1;
      if (!l || !bruto) { corpo.innerHTML = `<div class="aviso">Local de votação não encontrado.</div>`; return; }
      const nome = bonito(l.nome);
      document.querySelector('.tela-topo h1').textContent = nome;
      const bairroKey = chaveB(l.bairro), nav = document.querySelector('.trilha');
      const di = geo?.rotulo === 'distrito' ? geo.loc[l.id] : null, dRot = di != null ? `${rotaMun(ctx.modo, uf, cd)}/d/${di}` : null, bRota = `${rotaMun(ctx.modo, uf, cd)}${di != null ? '/d/' + di : ''}/b/${bairroKey}`;
      if (nav) nav.innerHTML = trilhaHtml([...trilhaBase(ctx.modo, mun, uf, cd), ...(di != null ? [[`${nivelG(geo).cap}: ${bonito(geo.f[di].n)}`, dRot]] : []), [`Bairro: ${bonito(l.bairro)}`, bRota], [`Local: ${nome}`]]);
      const idxC = T1 && x1 ? x1.c.map(n => T1.cands.findIndex(c => +c.n === n)) : [];
      const secs = bruto[14].map((s, j) => { const x = live.s[l.z + '-' + s[0]], o = s[4], vv1 = s[2] + s[3] + o, c1 = vv1 + s[5] + s[6];
        const r = { n: s[0], ap: s[1], ok: !!x, L1: s[2], F1: s[3], p1L: pc(s[2], vv1), p1F: pc(s[3], vv1), L: x ? x[0] : NaN, F: x ? x[1] : NaN, B: x ? x[3] : NaN, N: x ? x[4] : NaN };
        if (x) { const vv = x[0] + x[1] + x[2], c = vv + x[3] + x[4]; r.pL = pc(x[0], vv); r.pF = pc(x[1], vv); r.dL = r.pL - r.p1L; r.dF = r.pF - r.p1F; r.pAb = pc(s[1] - c, s[1]); r.lider = x[0] >= x[1] ? 'L' : 'F'; } else { r.pL = r.pF = r.dL = r.dF = r.pAb = NaN; r.lider = null; }
        if (T1) { r.dL = r.dF = NaN; r.pO = x ? pc(x[2], x[0] + x[1] + x[2]) : NaN;
          const V = new Array(T1.cands.length).fill(0); V[T1.iL] += s[2]; V[T1.iF] += s[3]; x1?.l[li]?.[j]?.forEach((q, k) => { if (idxC[k] >= 0) V[idxC[k]] += q; });
          r.V = V; r.u = unidadeV(T1, V); }
        return r; });
      corpo.innerHTML = `${topo(ctx, l, nome, ap, 'Aguardando a apuração das seções')}
        <section class="painel"><h2>Sobre o local</h2><p class="info-local"><b>${esc(bonito(l.end))}</b><br>Bairro: <a href="${bRota}">${esc(bonito(l.bairro))}</a> · CEP ${esc(l.cep || '–')} · zona eleitoral ${fInt(l.z)} · ${fInt(l.apT)} eleitores · ${fInt(l.ts)} seções${l.lat ? ` · <a href="https://www.google.com/maps?q=${l.lat},${l.lon}" target="_blank" rel="noopener">ver no mapa ↗</a>` : ''}</p></section>
        <section class="painel"><h2>Seções (${fInt(secs.length)})</h2><p class="sub">Resultado de cada urna deste local.</p>${entenda(`As seções agregadas votam na urna da seção principal.${T1 ? '' : ' A variação compara com o 1º turno na mesma seção.'}`)}<div id="tab-s"></div></section>`;
      const cn = i => `<span class="cab-c" style="--c:${T1.cor(i)}">${esc(T1.curto(i))}</span>`;
      const colsT1 = !T1 ? null : [
        { k: 'n', t: 'Seção', h: s => `<b>${fInt(s.n)}</b>`, v: s => s.n, ini: 'asc' },
        { k: 'ap', t: 'Eleitores', h: s => fInt(s.ap), v: s => s.ap, cls: 'n sec' },
        { k: 'lid', t: 'Mais votado', h: s => s.ok ? lidChip(T1, s.u) : '', v: s => s.ok ? T1.curto(s.u.lid) : '', cls: 'c' },
        ...(fi >= 0 ? [
          { k: 'pos', t: 'Posição', h: s => s.ok ? `${rankDe(s.u, fi)}º` : '', v: s => s.ok ? rankDe(s.u, fi) : NaN, cls: 'c' },
          { k: 'vf', t: `${cn(fi)} votos`, h: s => s.ok ? fInt(s.u.v[fi]) : '', v: s => s.ok ? s.u.v[fi] : NaN, cls: 'n' },
          { k: 'pf', t: `${cn(fi)} %`, h: s => s.ok ? `<b>${fNum(s.u.p[fi], 2)}%</b>` : '', v: s => s.ok ? s.u.p[fi] : NaN, cls: 'n' }]
          : [...[T1.iL, T1.iF].flatMap(i => [
            { k: 'v' + i, t: `${cn(i)} votos`, h: s => s.ok ? fInt(s.u.v[i]) : '', v: s => s.ok ? s.u.v[i] : NaN, cls: 'n' },
            { k: 'p' + i, t: `${cn(i)} %`, h: s => s.ok ? `<b>${fNum(s.u.p[i], 2)}%</b>` : '', v: s => s.ok ? s.u.p[i] : NaN, cls: 'n' }]),
            { k: 'pO', t: 'Outros %', h: s => s.ok ? `${fNum(100 - s.u.p[T1.iL] - s.u.p[T1.iF], 2)}%` : '', v: s => s.ok ? 100 - s.u.p[T1.iL] - s.u.p[T1.iF] : NaN, cls: 'n sec' }]),
        { k: 'B', t: 'Brancos', h: s => s.ok ? fInt(s.B) : '', v: s => s.B, cls: 'n sec' }, { k: 'N', t: 'Nulos', h: s => s.ok ? fInt(s.N) : '', v: s => s.N, cls: 'n sec' },
        { k: 'ab', t: 'Abstenção', h: s => s.ok ? fNum(s.pAb, 1) + '%' : '', v: s => s.pAb, cls: 'n sec' }];
      tabela(corpo.querySelector('#tab-s'), { cols: colsT1 || [
        { k: 'n', t: 'Seção', h: s => `<b>${fInt(s.n)}</b>${s.ok ? '' : ' <small class="agu">aguardando</small>'}`, v: s => s.n, ini: 'asc' },
        { k: 'ap', t: 'Eleitores', h: s => fInt(s.ap), v: s => s.ap, cls: 'n sec' },
        ...['L', 'F'].flatMap(k => [
          { k: 'v' + k, t: `${cabCand(k)} votos`, h: s => s.ok ? vdif(s[k], s[k + '1']) : '', v: s => s[k], cls: 'n' },
          { k: 'p' + k, t: `${cabCand(k)} %`, h: s => s.ok ? pcel(s['p' + k], s['d' + k]) : `<span class="t-s">1º t.: ${fNum(s['p1' + k], 1)}%</span>`, v: s => s['p' + k], x: s => s['p' + k], cls: 'n' }]),
        { k: 'lid', t: 'Vence', h: s => s.lider ? `<span class="chip-l" style="background:${CAND[s.lider].cor}">${CAND[s.lider].nome.split(' ')[0]}</span>` : '', v: s => s.lider ? (s.lider === 'L' ? 1 : 0) : NaN, cls: 'c' },
        { k: 'B', t: 'Brancos', h: s => s.ok ? fInt(s.B) : '', v: s => s.B, cls: 'n sec' }, { k: 'N', t: 'Nulos', h: s => s.ok ? fInt(s.N) : '', v: s => s.N, cls: 'n sec' },
        { k: 'ab', t: 'Abstenção', h: s => s.ok ? fNum(s.pAb, 1) + '%' : '', v: s => s.pAb, cls: 'n sec' }], rows: secs, sort: 'n', dir: 'asc' });
      ctx.csv = () => T1 ? ({ nome: `${uf}_${cd}_local_${id}_secoes_1turno`, cab: ['Seção', 'Eleitores', 'Abstenção %', 'Brancos', 'Nulos', ...T1.cands.flatMap((c, i) => [`${T1.nome(i)} votos`, `${T1.nome(i)} %`])], linhas: secs.map(s => [s.n, s.ap, s.pAb, s.B, s.N, ...T1.cands.flatMap((c, i) => [s.u.v[i], s.u.p[i]])]) }) : ({ nome: `${uf}_${cd}_local_${id}_secoes`, cab: ['Seção', 'Eleitores', 'Lula votos', 'Lula %', 'Flávio votos', 'Flávio %', 'Brancos', 'Nulos', 'Abstenção %'], linhas: secs.map(s => [s.n, s.ap, s.L, s.pL, s.F, s.pF, s.B, s.N, s.pAb]) });
    });
  } };
}
export const trilhaHtml = t => t.map(([rot, href], i) => href && i < t.length - 1 ? `<a href="${comFoco(href)}">${esc(rot)}</a>` : `<span aria-current="page">${esc(rot)}</span>`).join('<i>›</i>');
