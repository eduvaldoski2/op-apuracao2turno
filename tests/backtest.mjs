import { simular } from '../js/sim.js';
import { prepBase } from '../js/model.js';
import { projetar } from '../js/proj.js';
const nSeeds = +process.argv[2] || 6;
const passos = [0.04, 0.08, 0.12, 0.18, 0.25, 0.32, 0.4, 0.5, 0.6, 0.75];
const rows = {};
let cobre = {}, tot = {};
for (let s = 1; s <= nSeeds; s++) {
  const real = process.env.REAL ? JSON.parse((await import('node:fs')).readFileSync('data/base_1t.json','utf8')).rows : null;
  const sim = simular({ real, seed: s, swingBR: (s % 3 - 1) * 0.04 + 0.01 });
  const B = prepBase(sim.base);
  const vd = sim.verdade, pLtrue = 100 * vd.L / (vd.L + vd.F);
  for (const t of passos) {
    const snap = sim.snapshot(t); const pst = 100 * snap.br.st / snap.br.ts;
    const t0 = Date.now(); const P = projetar(B, snap); const ms = Date.now() - t0;
    const err = P.br.pL - pLtrue; const [lo, hi] = P.br.band.pL;
    const k = t; (rows[k] ??= []).push({ pst, err, inb: pLtrue >= lo && pLtrue <= hi, w: hi - lo, ms, pw: P.br.pWinL, okwin: (vd.L > vd.F) === (P.br.pWinL > .5) });
  }
}
console.log('t     pst%   |err|pp(med)  max|err|  largura90  cobertura  ms  acertoVenc');
for (const t of passos) {
  const a = rows[t]; const med = a.map(x => Math.abs(x.err)).sort((x, y) => x - y)[Math.floor(a.length / 2)];
  console.log(t.toFixed(2).padEnd(5), (a.reduce((s, x) => s + x.pst, 0) / a.length).toFixed(1).padStart(5), med.toFixed(3).padStart(10), Math.max(...a.map(x => Math.abs(x.err))).toFixed(3).padStart(9), (a.reduce((s, x) => s + x.w, 0) / a.length).toFixed(3).padStart(9), (a.filter(x => x.inb).length / a.length).toFixed(2).padStart(9), String(Math.round(a.reduce((s, x) => s + x.ms, 0) / a.length)).padStart(5), (a.filter(x => x.okwin).length / a.length).toFixed(2));
}
