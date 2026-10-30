// Votos de cada deputado por seção eleitoral, 1º turno 2026 (dados abertos do TSE: votacao_secao_2026_<UF>.zip).
//   node scripts/depsec.mjs <votacao_secao_UF.zip> <saida> <uf>   -> <saida>/{federal|estadual}/<uf>/<cd5>.json
// Arquivo por município: { z: [[zona, secao, local], ...], c: { numeroCandidato: [idxSecao, votos, idxSecao, votos, ...] } }
// (idxSecao = posição em z). Só votos nominais; brancos, nulos e legenda ficam de fora.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import fs from 'node:fs';
const [zip, saida, uf] = process.argv.slice(2);
const CARGO = { 6: 'federal', 7: 'estadual', 8: 'estadual' };
const dados = { federal: new Map(), estadual: new Map() };   // cd5 -> { sec: Map("zona-secao" -> idx), z: [], c: Map(cand -> []) }
const nome = process.argv[5];
const arq = await new Promise((ok, err) => { const p = spawn('unzip', ['-Z1', zip]); let o = ''; p.stdout.on('data', d => o += d); p.on('close', () => ok(o.split('\n').find(f => /\.csv$/i.test(f)))); p.on('error', err); });
console.log('arquivo', arq);
let linhas = 0, usadas = 0, ruins = 0;
await new Promise((ok, err) => {
  const p = spawn('unzip', ['-p', zip, arq], { stdio: ['ignore', 'pipe', 'inherit'] });
  const rl = createInterface({ input: p.stdout.setEncoding('latin1') });
  rl.on('line', ln => {
    linhas++; if (linhas === 1) return;
    const f = ln.split(';'); if (f.length < 24) { ruins++; return; }
    if (f[5] !== '1') return;
    const tipo = CARGO[Number(f[17])]; if (!tipo) return;
    const votavel = f[19].replace(/"/g, ''), v = Number(f[21]); if (!(v > 0) || votavel.length < 3) return;
    const cd = String(f[13]).replace(/"/g, '').padStart(5, '0'), zona = Number(f[15].replace(/"/g, '')), sec = Number(f[16].replace(/"/g, '')), loc = Number(f[22].replace(/"/g, ''));
    let m = dados[tipo].get(cd); if (!m) dados[tipo].set(cd, m = { sec: new Map(), z: [], c: new Map() });
    const k = zona * 100000 + sec; let i = m.sec.get(k); if (i === undefined) { i = m.z.length; m.sec.set(k, i); m.z.push([zona, sec, loc]); }
    let a = m.c.get(votavel); if (!a) m.c.set(votavel, a = []); a.push(i, v); usadas++;
  });
  rl.on('close', ok); p.on('error', err);
});
console.log('linhas', linhas, 'usadas', usadas, 'ruins', ruins);
let bytes = 0;
for (const [tipo, mapa] of Object.entries(dados)) {
  const dir = `${saida}/${tipo}/${uf}`; fs.mkdirSync(dir, { recursive: true });
  for (const [cd, m] of mapa) { const s = JSON.stringify({ z: m.z, c: Object.fromEntries(m.c) }); bytes += s.length; fs.writeFileSync(`${dir}/${cd}.json`, s); }
  console.log(tipo, uf, 'municípios', mapa.size);
}
console.log('bytes', bytes);
