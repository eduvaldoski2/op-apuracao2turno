// Resultado OFICIAL do 1º turno para senador (eleição estadual 6259, cargo 5), por estado  ->  data/sen_1t.json
//   node scripts/sen1t.mjs data/sen_1t.json [--amostra]   (--amostra: imprime a estrutura do arquivo de um estado)
// Em 2026 são 2 vagas por estado: cada eleitor vota em até 2 candidatos; os 2 mais votados são eleitos (não há 2º turno).
import fs from 'node:fs';
import { TSE, urls, getJSON, parseGov, pool } from '../js/tse.js';
import { UF_IDS } from '../js/util.js';
const destino = process.argv[2] || 'data/sen_1t.json';
const cfg = { ...TSE, turno: 1 }, U = urls(cfg, 1);
const ufs = UF_IDS.filter(u => u !== 'zz');
if (process.argv.includes('--amostra')) { const j = await getJSON(U.senUf('ac'), { retries: 4 }); console.log(JSON.stringify(j).slice(0, 3000)); }
const brutos = await pool(ufs, 6, async u => getJSON(U.senUf(u), { retries: 4 }).catch(e => ({ erro: e })));
const uf = {}; let erros = 0;
ufs.forEach((u, i) => { const j = brutos[i]; if (j?.erro || j?.erro === undefined && !j) { erros++; console.log('erro', u, j?.erro?.message); return; } const r = parseGov(j); if (r.cand.length) uf[u] = r; });
console.log('estados lidos:', Object.keys(uf).length, 'erros:', erros);
for (const [u, g] of Object.entries(uf)) console.log(u, g.hg, `${g.st}/${g.ts}`, 'vagas?', g.cand.filter(c => c.e).length, g.cand.slice(0, 3).map(c => `${c.nm} ${c.sg} ${c.p.toFixed(2)}%${c.e ? ' (eleito)' : ''} [${c.st}]`).join(' | '));
if (Object.keys(uf).length < 20) { console.log('poucos estados: não grava'); process.exit(1); }
fs.writeFileSync(destino, JSON.stringify({ turno: 1, eleicao: cfg.eleGov[1], cargo: 5, gerado: new Date().toISOString(), uf }));
console.log('gravado', destino, (fs.statSync(destino).size / 1e3).toFixed(0), 'KB');
