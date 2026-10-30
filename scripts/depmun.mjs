// Votos de cada deputado (federal e estadual) por município, 1º turno 2026 (eleição estadual 6259).
//   node scripts/depmun.mjs data/dep_mun [--amostra] [--uf=ac]   -> data/dep_mun/{federal|estadual}/<uf>.json
// Formato: { m: { cd: nome }, c: { numeroCandidato: { cd: votos } } }
import fs from 'node:fs';
import { TSE, getJSON, pool, urls } from '../js/tse.js';
import { UF_IDS } from '../js/util.js';
const destino = process.argv[2] || 'data/dep_mun', amostra = process.argv.includes('--amostra');
const soUf = (process.argv.find(a => a.startsWith('--uf=')) || '').slice(5);
const cnt = x => { const n = Number(String(x ?? '').replace(/\./g, '').replace(',', '.')); return Number.isFinite(n) ? n : 0; };
const ele = TSE.eleGov[1], e6 = String(ele).padStart(6, '0');
const cfg1 = { ...TSE, turno: 1 };
const U = urls(cfg1, 1);
const conf = await getJSON(U.cm());
const lista = [];
(function walk(n) {
  if (Array.isArray(n)) return n.forEach(walk);
  if (!n || typeof n !== 'object') return;
  if (n.cd && Array.isArray(n.mu)) { const uf = String(n.cd).toLowerCase(); for (const m of n.mu) lista.push({ uf, cd: String(m.cd).padStart(5, '0'), nome: m.nm }); return; }
  for (const k in n) walk(n[k]);
})(conf);
console.log('municípios:', lista.length);
const url = (uf, cd, cargo) => `${TSE.base}/${TSE.ciclo}/${ele}/dados/${uf}/${uf}${cd}-c${uf === 'df' && cargo === '0007' ? '0008' : cargo}-e${e6}-u.json`;
function votos(j) { // carg[0].agr[].par[].cand[] -> { numero: votos nominais no município }
  const out = {};
  for (const a of ((j.carg || [])[0] || {}).agr || []) for (const p of a.par || []) for (const c of p.cand || []) if (c && c.vap != null) out[String(c.n)] = cnt(c.vap);
  return out;
}
fs.mkdirSync(destino, { recursive: true });
for (const [nome, cargo] of [['federal', '0006'], ['estadual', '0007']]) {
  fs.mkdirSync(`${destino}/${nome}`, { recursive: true });
  const ufs = UF_IDS.filter(u => u !== 'zz' && (!soUf || u === soUf));
  let totalOk = 0, totalErro = 0;
  for (const uf of ufs) {
    const muns = lista.filter(m => m.uf === uf);
    if (amostra && muns[0]) { try { const j = await getJSON(url(uf, muns[0].cd, cargo), { retries: 2 }); console.log(nome, uf, 'AMOSTRA', JSON.stringify(j).slice(0, 1200)); } catch (e) { console.log(nome, uf, 'AMOSTRA ERRO', e.message, url(uf, muns[0].cd, cargo)); } }
    const res = await pool(muns, 10, async m => votos(await getJSON(url(uf, m.cd, cargo), { retries: 3 })));
    const M = {}, C = {}; let erro = 0;
    res.forEach((r, i) => { const m = muns[i]; if (!r || r.erro) { erro++; return; } M[m.cd] = m.nome; for (const [n, v] of Object.entries(r)) if (v > 0) (C[n] ??= {})[m.cd] = v; });
    totalOk += muns.length - erro; totalErro += erro;
    console.log(nome, uf, 'municípios', muns.length, 'erros', erro, 'candidatos com votos', Object.keys(C).length);
    if (muns.length && erro / muns.length < .1) fs.writeFileSync(`${destino}/${nome}/${uf}.json`, JSON.stringify({ gerado: new Date().toISOString(), m: M, c: C }));
  }
  console.log(nome, 'ok', totalOk, 'erros', totalErro);
}
