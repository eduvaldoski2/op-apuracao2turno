// Resultado OFICIAL do 1º turno (eleição 6257) por candidato: Brasil, UF e município  ->  data/res_1t.json
//   node scripts/res1t.mjs data/res_1t.json data/base_1t.json
import fs from 'node:fs';
import { TSE, pool, urls, candidatos } from '../js/tse.js';
import { cnt } from '../js/util.js';
const [destino, basef, partidosf] = process.argv.slice(2);
// leitura com limite de taxa (~35 req/s) e pausa global quando o TSE responde 429/5xx
let proximo = 0, pausaAte = 0;
async function getJSON(url, { retries = 8 } = {}) {
  let err;
  for (let i = 0; i <= retries; i++) {
    const agora = Date.now(), t = Math.max(agora, proximo, pausaAte); proximo = t + 28; if (t > agora) await new Promise(r => setTimeout(r, t - agora));
    try {
      const r = await fetch(url, { signal: AbortSignal.timeout(25000) });
      if (r.status === 429 || r.status >= 500) { pausaAte = Date.now() + 1500 * (i + 1); err = new Error(r.status + ' ' + url); continue; }
      if (!r.ok) throw new Error(r.status + ' ' + url);
      return await r.json();
    } catch (e) { err = e; if (/^404/.test(e.message)) throw e; await new Promise(r => setTimeout(r, 500 * (i + 1))); }
  }
  throw err;
}
const partidos = (() => { try { return JSON.parse(fs.readFileSync(partidosf, 'utf8')); } catch { return {}; } })();
const U = urls(TSE, 1), base = JSON.parse(fs.readFileSync(basef, 'utf8'));
const num = x => { const v = Number(String(x ?? 0).replace(/\./g, '').replace(',', '.')); return isFinite(v) ? v : 0; };
const acha = (n, pred, d = 0) => { if (!n || typeof n !== 'object' || d > 8) return null; if (!Array.isArray(n) && pred(n)) return n; for (const k in n) { const r = acha(n[k], pred, d + 1); if (r) return r; } return null; };
function unidade(j) {
  const alvo = acha(j, o => o.s && typeof o.s === 'object' && o.e && typeof o.e === 'object') || j;
  const S = alvo.s || {}, E = alvo.e || {}, V = alvo.v || {};
  const cs = candidatos(j).map(c => ({ n: String(c.n), votos: num(c.vap), pct: num(c.pvap), st: c.st || '', raw: c }));
  return { dg: j.dg || '', hg: j.hg || '', ts: cnt(S.ts), st: cnt(S.st), te: cnt(E.te), est: cnt(E.est) || cnt(E.te), c: cnt(E.c), a: cnt(E.a), vb: cnt(V.vb), tvn: V.tvn != null ? cnt(V.tvn) : cnt(V.vn) + cnt(V.vnt), vv: cnt(V.vv), cs, brutoV: V, brutoE: E };
}
const br = unidade(await getJSON(U.br()));
console.log('BR', br.dg, br.hg, 'seções', br.st, '/', br.ts, 'candidatos', br.cs.length, 'V', JSON.stringify(br.brutoV), 'E', JSON.stringify(br.brutoE));
console.log('candidato bruto[0]:', JSON.stringify(br.cs[0]?.raw));
const ordem = br.cs.slice().sort((a, b) => b.votos - a.votos);
const idx = new Map(ordem.map((c, i) => [c.n, i]));
const cands = ordem.map(c => { const r = c.raw; const m = { n: c.n, sg: partidos[c.n] || '' }; for (const k of Object.keys(r)) if (!['vap', 'pvap', 'n', 'seq'].includes(k) && typeof r[k] !== 'object') m[k] = r[k]; m.eleito = /^eleit/i.test(r.st || ''); return m; });
const linha = u => { const v = new Array(cands.length).fill(0); for (const c of u.cs) { const i = idx.get(c.n); if (i != null) v[i] = c.votos; } return [u.ts, u.st, u.te, u.c, u.a, u.vb, u.tvn, ...v]; };
const out = { turno: 1, eleicao: 6257, gerado: new Date().toISOString(), dg: br.dg, hg: br.hg, cands, cab: ['ts', 'st', 'te', 'c', 'a', 'vb', 'tvn', 'votos por candidato (ordem de cands)'], br: linha(br), uf: {}, mun: {} };
const ufs = [...new Set(base.rows.map(r => r[0]))];
const ru = await pool(ufs, 8, async uf => linha(unidade(await getJSON(U.uf(uf)))));
ufs.forEach((uf, i) => { if (ru[i].erro) console.log('erro uf', uf, ru[i].erro.message); else out.uf[uf] = ru[i]; });
let feitos = 0, erros = 0;
const rm = await pool(base.rows, 24, async r => { const j = await getJSON(U.mun(r[0], r[1]), { retries: 4 }); return [r[0], r[1], linha(unidade(j))]; });
for (const r of rm) { if (r.erro) { erros++; if (erros < 6) console.log('erro mun', r.erro.message); continue; } (out.mun[r[0]] ??= []).push([r[1], ...r[2]]); feitos++; }
console.log('municípios', feitos, 'erros', erros);
// conferência com a base (Lula/Flávio)
const L = cands.findIndex(c => c.n === '13'), F = cands.findIndex(c => c.n === '22'); let dif = 0;
for (const r of base.rows) { const m = out.mun[r[0]]?.find(x => x[0] === r[1]); if (m && (m[8 + L] !== r[10] || m[8 + F] !== r[11])) dif++; }
console.log('divergências vs base_1t (Lula/Flávio):', dif, ' soma BR votos:', out.br.slice(7).reduce((a, b) => a + b, 0), 'vv', br.vv);
fs.writeFileSync(destino, JSON.stringify(out));
console.log('gravado', destino, (fs.statSync(destino).size / 1e6).toFixed(2), 'MB');
