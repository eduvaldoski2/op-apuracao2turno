// Resultado OFICIAL do 1º turno para governador (eleição estadual 6259), por estado  ->  data/gov_1t.json
//   node scripts/gov1t.mjs data/gov_1t.json
// O 2º turno (6260) é lido a cada ciclo pelo coletor (js/tse.js › montarGov) e vai em snap.gov.
import fs from 'node:fs';
import { TSE, urls, getJSON, parseGov, pool } from '../js/tse.js';
import { UF_IDS } from '../js/util.js';
const destino = process.argv[2] || 'data/gov_1t.json';
const cfg = { ...TSE, turno: 1 }, U = urls(cfg, 1);
const ufs = UF_IDS.filter(u => u !== 'zz');
const rs = await pool(ufs, 6, async u => parseGov(await getJSON(U.govUf(u), { retries: 4 })));
const uf = {}; let erros = 0;
ufs.forEach((u, i) => { const r = rs[i]; if (r.erro) { erros++; console.log('erro', u, r.erro.message); return; } if (r.cand.length) uf[u] = r; });
console.log('estados lidos:', Object.keys(uf).length, 'erros:', erros);
for (const [u, g] of Object.entries(uf)) console.log(u, g.hg, `${g.st}/${g.ts}`, g.cand.slice(0, 2).map(c => `${c.nm} ${c.sg} ${c.p.toFixed(2)}%${c.e ? ' (eleito)' : ''}`).join(' × '));
if (Object.keys(uf).length < 20) { console.log('poucos estados: não grava'); process.exit(1); }
fs.writeFileSync(destino, JSON.stringify({ turno: 1, eleicao: cfg.eleGov[1], gerado: new Date().toISOString(), uf }));
console.log('gravado', destino, (fs.statSync(destino).size / 1e3).toFixed(0), 'KB');
