// Testes do modelo: consistência das comparações e da projeção (rodar: node tests/model.test.mjs)
import assert from 'node:assert/strict';
import { simular } from '../js/sim.js';
import { prepBase, calcular, listaMunicipios } from '../js/model.js';
import { projetar } from '../js/proj.js';
import { UF_IDS } from '../js/util.js';
const sim = simular({ seed: 3 }), B = prepBase(sim.base);
const snap = sim.snapshot(0.5), V = calcular(B, snap, 'lfl');
// 1) referência lfl do BR = soma das UFs
let a = 0, est = 0; for (const u of UF_IDS) { a += V.uf[u].refRaw.a; est += V.uf[u].refRaw.est; }
assert.ok(Math.abs(V.br.refRaw.a - a) < 1 && Math.abs(V.br.refRaw.est - est) < 1, 'ref BR = soma UFs');
// 2) a referência de abstenção no recorte deve ficar próxima da do 1T final (no sim, ~20%) e a variação pequena
assert.ok(Math.abs(V.br.d.Ab) < 3, 'var. abstenção plausível: ' + V.br.d.Ab);
assert.ok(Math.abs(V.br.ref.pAb - 100 * B.br.a / B.br.te) < 3, 'abstenção ref plausível');
// 3) soma das regiões = BR
let L = 0; for (const r in V.reg) L += V.reg[r].L; assert.equal(L, V.br.L);
// 4) municípios: apurados somam o UF
const ms = listaMunicipios(B, V, 'sp'); const somaL = ms.filter(m => m.apurado).reduce((s, m) => s + m.L, 0); assert.equal(somaL, V.uf.sp.L);
// 5) projeção a 100%: igual ao apurado; a 50%: dentro da faixa
const fim = sim.snapshot(1.06), Pf = projetar(B, fim, { draws: 50 });
assert.ok(Math.abs(Pf.br.pL - 100 * fim.br.L / fim.br.vv) < 0.001, 'proj 100%');
const P = projetar(B, snap, { draws: 150 }), vd = sim.verdade, pt = 100 * vd.L / (vd.L + vd.F);
assert.ok(pt >= P.br.band.pL[0] && pt <= P.br.band.pL[1], 'verdade dentro da faixa');
// 6) sem apuração: não quebra
const zero = sim.snapshot(0); const P0 = projetar(B, zero, { draws: 30 }); assert.ok(isFinite(P0.br.pL));
console.log('ok — modelo e projeção');

// 6) decodificador do boletim de urna: seção real do 1º turno (AC, Porto Walter, zona 4 seção 77) — conferida com a votação por seção do TSE
{
  const { decodificarBU } = await import('../scripts/bu.mjs'); const { readFileSync } = await import('node:fs');
  const d = decodificarBU(readFileSync(new URL('./bu_amostra.dat', import.meta.url)), 6257);
  assert.deepEqual([d.L, d.F, d.O, d.B, d.N], [99, 103, 15, 4, 13]);
  console.log('ok — decodificador de BU');
}
