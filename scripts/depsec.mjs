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
let bytes = 0, arquivos = 0;
// seções de cada município (comuns aos dois cargos), ordenadas por zona e seção
const secs = new Map();
for (const mapa of Object.values(dados)) for (const [cd, m] of mapa) { const t = secs.get(cd) ?? new Map(); for (const [k, i] of m.sec) t.set(k, m.z[i]); secs.set(cd, t); }
const ordem = new Map(), dirZ = `${saida}/z/${uf}`; fs.mkdirSync(dirZ, { recursive: true });
for (const [cd, t] of secs) { const lst = [...t.entries()].sort((a, b) => a[0] - b[0]); ordem.set(cd, new Map(lst.map(([k], i) => [k, i]))); const s2 = JSON.stringify(lst.map(([, z]) => z)); bytes += s2.length; fs.writeFileSync(`${dirZ}/${cd}.json`, s2); arquivos++; }
// um arquivo por candidato: { cd5: [delta do índice da seção, votos, ...] }
for (const [tipo, mapa] of Object.entries(dados)) {
  const dir = `${saida}/${tipo}/${uf}`; fs.mkdirSync(dir, { recursive: true });
  const porCand = new Map();
  for (const [cd, m] of mapa) {
    const novo = ordem.get(cd), inv = m.z.map(z => novo.get(z[0] * 100000 + z[1]));
    for (const [n, a] of m.c) {
      const pares = []; for (let i = 0; i < a.length; i += 2) pares.push([inv[a[i]], a[i + 1]]); pares.sort((x, y) => x[0] - y[0]);
      const flat = []; let ant = 0; for (const [i, v] of pares) { flat.push(i - ant, v); ant = i; }
      (porCand.get(n) ?? porCand.set(n, {}).get(n))[cd] = flat;
    }
  }
  for (const [n, o] of porCand) { const s2 = JSON.stringify(o); bytes += s2.length; arquivos++; fs.writeFileSync(`${dir}/${n}.json`, s2); }
  console.log(tipo, uf, 'municípios', mapa.size, 'candidatos', porCand.size);
}
console.log('arquivos', arquivos, 'bytes', bytes);
