// Resultado OFICIAL do 1º turno para deputado federal (cargo 6) e estadual (cargo 7), por estado (eleição estadual 6259)
//   node scripts/dep1t.mjs data/dep_1t [--amostra]   -> data/dep_1t/federal.json e estadual.json
// Cada estado traz os grupos (partido ou federação) com os candidatos de cada um e os votos de legenda; o painel filtra por partido.
import fs from 'node:fs';
import { TSE, getJSON, pool } from '../js/tse.js';
import { UF_IDS } from '../js/util.js';
const destino = process.argv[2] || 'data/dep_1t';
const cnt = x => { const n = Number(String(x ?? '').replace(/\./g, '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const ufs = UF_IDS.filter(u => u !== 'zz');
const pad6 = n => String(n).padStart(6, '0'), ele = TSE.eleGov[1];
const url = (uf, cargo) => `${TSE.base}/${TSE.ciclo}/${ele}/dados/${uf}/${uf}-c${uf === 'df' && cargo === '0007' ? '0008' : cargo}-e${pad6(ele)}-u.json`;   // no DF o cargo estadual é Deputado Distrital (0008)
function parse(j) {
  // carg[0].agr = federações (tp "f") e partidos isolados (tp "i"); cada agr tem os partidos (par) com os candidatos (cand).
  // tvtn = votos nominais, tvtl = votos de legenda, vag = cadeiras do agrupamento; qe = quociente eleitoral do estado.
  const c0 = (j.carg || [])[0] || {}, grupos = [];
  for (const a of c0.agr || []) {
    const par = (a.par || []).map(x => ({ sg: x.sg || x.nm || '', n: String(x.n ?? ''), nm: x.nm || '', tn: cnt(x.tvtn), tl: cnt(x.tvtl),
      cand: (x.cand || []).filter(c => c && c.vap != null).map(c => ({ n: String(c.n), nm: c.nmu || c.nm || '', v: cnt(c.vap), st: String(c.st || '').slice(0, 24), e: /^eleit/i.test(c.st || '') || c.e === 's' ? 1 : 0 })).sort((p, q) => q.v - p.v) }));
    if (!par.some(x => x.cand.length)) continue;
    grupos.push({ n: String(a.n ?? ''), nm: a.nm || '', tp: a.tp === 'f' ? 'f' : 'i', com: a.com || par.map(x => x.sg).join('/'), tn: cnt(a.tvtn) || par.reduce((t, x) => t + x.tn, 0), tl: cnt(a.tvtl) || par.reduce((t, x) => t + x.tl, 0), vag: cnt(a.vag), par });
  }
  const S = j.s || {}, E = j.e || {}, V = j.v || {};
  const tot = grupos.reduce((t, g) => t + g.tn + g.tl, 0);
  return { hg: j.hg || '', ht: j.ht || '', ts: cnt(S.ts), st: cnt(S.st), te: cnt(E.te), c: cnt(E.c), a: cnt(E.a), vv: V.vv != null ? cnt(V.vv) : tot, vb: cnt(V.vb), tvn: cnt(V.tvn), qe: cnt(c0.qe), vagas: cnt(c0.nv), grupos };
}
fs.mkdirSync(destino, { recursive: true });
for (const [nome, cargo] of [['federal', '0006'], ['estadual', '0007']]) {
  if (process.argv.includes('--amostra')) { const j = await getJSON(url('ac', cargo), { retries: 4 }); console.log(nome, 'AMOSTRA', JSON.stringify(j).slice(0, 2500)); }
  const bruto = await pool(ufs, 6, async u => getJSON(url(u, cargo), { retries: 4 }).catch(e => ({ erro: e })));
  const uf = {}; let erros = 0;
  ufs.forEach((u, i) => { const j = bruto[i]; if (!j || j.erro) { erros++; console.log('erro', nome, u, j?.erro?.message); return; } const r = parse(j); if (r.grupos.length) uf[u] = r; else console.log('sem grupos', nome, u); });
  console.log(nome, 'estados lidos:', Object.keys(uf).length, 'erros:', erros);
  for (const [u, g] of Object.entries(uf)) console.log(nome, u, g.hg, `${g.st}/${g.ts}`, 'grupos', g.grupos.length, 'cand', g.grupos.reduce((a, x) => a + x.par.reduce((t, p) => t + p.cand.length, 0), 0), 'eleitos', g.grupos.reduce((a, x) => a + x.par.reduce((t, p) => t + p.cand.filter(c => c.e).length, 0), 0), 'vag', g.vagas);
  if (Object.keys(uf).length < 20) { console.log('poucos estados: não grava', nome); process.exit(1); }
  fs.writeFileSync(`${destino}/${nome}.json`, JSON.stringify({ turno: 1, eleicao: ele, cargo: +cargo, gerado: new Date().toISOString(), uf }));
  console.log('gravado', nome, (fs.statSync(`${destino}/${nome}.json`).size / 1e3).toFixed(0), 'KB');
}
