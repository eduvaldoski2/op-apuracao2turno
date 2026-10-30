// Mais votados de cada local de votação, 1º turno 2026 (votacao_secao_2026_<UF>.zip do TSE).
//   node scripts/deptop.mjs <zip> <saida> <uf>  -> <saida>/{federal|estadual}/<uf>/<cd5>.json
// Arquivo por município: { l: { "zona-local": [totalNominal, cand1, votos1, cand2, votos2, ...] } } com os 25 mais votados do local.
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import fs from 'node:fs';
const [zip, saida, uf] = process.argv.slice(2), TOP = 25;
const CARGO = { 6: 'federal', 7: 'estadual', 8: 'estadual' };
const dados = { federal: new Map(), estadual: new Map() };   // cd5 -> Map("zona-local" -> Map(cand -> votos))
const arq = await new Promise(ok => { const p = spawn('unzip', ['-Z1', zip]); let o = ''; p.stdout.on('data', d => o += d); p.on('close', () => ok(o.split('\n').find(f => /\.csv$/i.test(f)))); });
let linhas = 0, usadas = 0;
await new Promise((ok, err) => {
  const p = spawn('unzip', ['-p', zip, arq], { stdio: ['ignore', 'pipe', 'inherit'] });
  const rl = createInterface({ input: p.stdout.setEncoding('latin1') });
  rl.on('line', ln => {
    if (++linhas === 1) return;
    const f = ln.split(';'); if (f.length < 24 || f[5] !== '1') return;
    const tipo = CARGO[Number(f[17])]; if (!tipo) return;
    const cand = f[19].replace(/"/g, ''), v = Number(f[21]); if (!(v > 0) || cand.length < 3) return;
    const cd = String(f[13]).replace(/"/g, '').padStart(5, '0'), k = `${Number(f[15].replace(/"/g, ''))}-${Number(f[22].replace(/"/g, ''))}`;
    let m = dados[tipo].get(cd); if (!m) dados[tipo].set(cd, m = new Map());
    let l = m.get(k); if (!l) m.set(k, l = new Map()); l.set(cand, (l.get(cand) || 0) + v); usadas++;
  });
  rl.on('close', ok); p.on('error', err);
});
console.log('linhas', linhas, 'usadas', usadas);
let bytes = 0, arquivos = 0;
for (const [tipo, mapa] of Object.entries(dados)) {
  const dir = `${saida}/${tipo}/${uf}`; fs.mkdirSync(dir, { recursive: true });
  for (const [cd, m] of mapa) {
    const l = {};
    for (const [k, c] of m) { let t = 0; for (const v of c.values()) t += v; const top = [...c.entries()].sort((a, b) => b[1] - a[1]).slice(0, TOP); l[k] = [t, ...top.flat()]; }
    const s = JSON.stringify({ l }); bytes += s.length; arquivos++; fs.writeFileSync(`${dir}/${cd}.json`, s);
  }
}
console.log('arquivos', arquivos, 'bytes', bytes);
