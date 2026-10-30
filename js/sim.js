// Gerador de dados SIMULADOS — usado no modo demonstração, no servidor mock e nos testes.
// Com `real` (linhas de data/base_1t.json) usa os municípios, eleitorados e o 1º turno REAIS e simula apenas o 2º turno;
// sem `real`, gera um país sintético com nomes fictícios. Nenhum resultado de 2º turno aqui é real. Os "candidatos" simulados usam os mesmos números 13/22 apenas para exercitar o painel.
import { logit, expit, UF_IDS } from './util.js?v=5520a3ee';
import { rng } from './proj.js?v=5520a3ee';

// uf, nº de municípios, eleitorado (milhões), % de Lula entre os válidos (simulado), % de Flávio
const TAB = {
  ac: [22, .62, 36, 55], al: [102, 2.3, 56, 36], ap: [16, .56, 45, 46], am: [62, 2.7, 46, 44], ba: [417, 11.4, 61, 32], ce: [184, 7.0, 62, 31],
  df: [1, 2.2, 37, 55], es: [78, 3.0, 38, 54], go: [246, 5.2, 34, 58], ma: [217, 5.0, 60, 33], mt: [142, 2.7, 30, 62], ms: [79, 2.1, 36, 57],
  mg: [853, 16.4, 46, 47], pa: [144, 6.0, 48, 43], pb: [223, 3.1, 56, 36], pr: [399, 8.6, 33, 60], pe: [185, 7.1, 58, 35], pi: [224, 2.5, 66, 28],
  rj: [92, 12.6, 39, 53], rn: [167, 2.6, 52, 40], rs: [497, 8.5, 38, 55], ro: [52, 1.2, 29, 64], rr: [15, .4, 31, 62], sc: [295, 5.5, 27, 66],
  sp: [645, 34.6, 39, 53], se: [75, 1.7, 59, 34], to: [139, 1.1, 40, 52], zz: [186, .75, 32, 59],
};
const OFFSET = { S: 0.0, SE: 0.0, CO: 0.03, NE: 0.1, N: 0.14, EX: 0.3 };
const REG = { ac: 'N', al: 'NE', ap: 'N', am: 'N', ba: 'NE', ce: 'NE', df: 'CO', es: 'SE', go: 'CO', ma: 'NE', mt: 'CO', ms: 'CO', mg: 'SE', pa: 'N', pb: 'NE', pr: 'S', pe: 'NE', pi: 'NE', rj: 'SE', rn: 'NE', rs: 'S', ro: 'N', rr: 'N', sc: 'S', sp: 'SE', se: 'NE', to: 'N', zz: 'EX' };

function gauss(r) { let u = 0; while (!u) u = r(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * r()); }

export function simular({ seed = 7, swingBR = 0.03, escala = 1, real = null } = {}) {
  const r = rng(seed);
  const muns = [];
  const dReg = {}; for (const k of ['N', 'NE', 'CO', 'SE', 'S', 'EX']) dReg[k] = gauss(r) * 0.05;
  const dUf = {}; for (const uf of UF_IDS) dUf[uf] = swingBR + dReg[REG[uf]] + gauss(r) * 0.04;
  const turnBR = -0.012, dTurU = {}; for (const uf of UF_IDS) dTurU[uf] = turnBR + gauss(r) * 0.01;
  if (real) for (const x of real) muns.push({ uf: x[0], cd: x[1], nome: x[2], cdi: x[3], ts: x[4], te: x[5], c: x[6], a: x[7], vb: x[8], tvn: x[9], L: x[10], F: x[11], vv: x[12] });
  else for (const uf of UF_IDS) {
    const [n0, mil, pl, pf] = TAB[uf]; const n = Math.max(1, Math.round(n0 * escala));
    const pesos = Array.from({ length: n }, () => Math.exp(gauss(r) * 1.15)); const sp = pesos.reduce((a, b) => a + b, 0);
    const pi0 = pl / (pl + pf);
    for (let i = 0; i < n; i++) {
      const te = Math.max(300, Math.round(mil * 1e6 * escala * pesos[i] / sp));
      const t1 = clampN(0.80 + gauss(r) * 0.04 - (uf === 'zz' ? 0.65 : 0), 0.05, 0.93);
      const c = Math.round(te * t1), outros = clampN(0.078 + gauss(r) * 0.015, 0.02, 0.2);
      const bl = clampN(0.018 + gauss(r) * 0.006, 0.002, 0.06), nu = clampN(0.029 + gauss(r) * 0.008, 0.003, 0.08);
      const vb = Math.round(c * bl), tvn = Math.round(c * nu), vv = c - vb - tvn;
      const pi1 = expit(logit(pi0) + gauss(r) * 0.55);
      const L = Math.round(vv * (1 - outros) * pi1), F = Math.round(vv * (1 - outros) * (1 - pi1));
      const cd = String(10000 + muns.filter(m => m.uf === uf).length * 7 + 1).slice(-5);
      muns.push({ uf, cd: String(i + 1).padStart(5, '0'), nome: uf === 'zz' ? `Cidade ${i + 1} (exterior simulado)` : `Município ${i + 1} ${uf.toUpperCase()}`, cdi: 9000000 + muns.length, te, c, a: te - c, vb, tvn, L, F, vv, ts: Math.max(1, Math.round(te / 270)) });
    }
  }
  // verdade do 2º turno
  for (const m of muns) {
    const pi1 = (m.L + .5) / (m.L + m.F + 1);
    const pi2 = expit(logit(pi1) + dUf[m.uf] + gauss(r) * 0.08);
    const t1 = m.c / Math.max(1, m.te), t2 = clampN(t1 + dTurU[m.uf] + gauss(r) * 0.012, 0.05, 0.95);
    const c2 = Math.round(m.te * t2);
    const bl = clampN(m.vb / Math.max(1, m.c) + 0.004 + gauss(r) * 0.003, 0.002, 0.08), nu = clampN(m.tvn / Math.max(1, m.c) + 0.012 + gauss(r) * 0.004, 0.003, 0.12);
    const vb2 = Math.round(c2 * bl), tvn2 = Math.round(c2 * nu), vv2 = c2 - vb2 - tvn2;
    m.t = { c: c2, vb: vb2, tvn: tvn2, L: Math.round(vv2 * pi2), F: vv2 - Math.round(vv2 * pi2) };
    m.start = OFFSET[REG[m.uf]] + r() * 0.06; m.dur = 0.18 + 0.5 * Math.pow(m.te / 40000, 0.25) * (0.7 + 0.6 * r()); m.dur = Math.min(m.dur, 0.97 - m.start);
  }
  const base = {
    turno: 1, eleicao: 6257, simulado: true, gerado: real ? '1T real + 2T simulado' : 'SIMULADO', ufs: UF_IDS.map(cd => ({ cd, ds: cd })),
    rows: muns.map(m => [m.uf, m.cd, m.nome, m.cdi, m.ts, m.te, m.c, m.a, m.vb, m.tvn, m.L, m.F, m.vv, 0]),
  };
  const frac = (m, t) => Math.max(0, Math.min(1, (t - m.start) / m.dur));

  function snapshot(t) {
    const snap = { v: 1, turno: 2, simulado: true, dg: '25/10/2026', hg: hora(t), br: null, uf: {}, mun: {}, diag: [] };
    const brAcc = acc();
    for (const uf of UF_IDS) {
      const ua = acc(); snap.mun[uf] = [];
      for (const m of muns) {
        if (m.uf !== uf) continue; const f = frac(m, t); if (f <= 0) { ua.ts += m.ts; ua.te += m.te; continue; }
        const st = Math.max(1, Math.round(m.ts * f)), g = st / m.ts, est = Math.round(m.te * g);
        const c = Math.round(m.t.c * g), L = Math.round(m.t.L * g), F = Math.round(m.t.F * g), vb = Math.round(m.t.vb * g), tvn = Math.round(m.t.tvn * g);
        snap.mun[uf].push([m.cd, m.ts, st, m.te, est, c, est - c, vb, tvn, L, F, L + F]);
        ua.ts += m.ts; ua.st += st; ua.te += m.te; ua.est += est; ua.c += c; ua.a += est - c; ua.vb += vb; ua.tvn += tvn; ua.L += L; ua.F += F; ua.vv += L + F;
      }
      snap.uf[uf] = { ...ua, eL: 0, eF: 0 };
      for (const k in ua) brAcc[k] += ua[k];
    }
    snap.br = { ...brAcc, eL: 0, eF: 0 };
    if (brAcc.st >= brAcc.ts) { snap.br.eL = brAcc.L > brAcc.F ? 1 : 0; snap.br.eF = brAcc.F > brAcc.L ? 1 : 0; }
    return snap;
  }
  // resultado final "verdadeiro" (para backtest)
  const verdade = { L: 0, F: 0, c: 0, vb: 0, tvn: 0, te: 0, uf: {} };
  for (const m of muns) {
    const u = (verdade.uf[m.uf] ??= { L: 0, F: 0, c: 0, vb: 0, tvn: 0, te: 0 });
    for (const o of [u, verdade]) { o.L += m.t.L; o.F += m.t.F; o.c += m.t.c; o.vb += m.t.vb; o.tvn += m.t.tvn; o.te += m.te; }
  }
  return { base, snapshot, verdade, muns, passos: n => Array.from({ length: n }, (_, i) => 0.02 + (1.05 - 0.02) * i / (n - 1)) };
}
const clampN = (x, a, b) => Math.min(b, Math.max(a, x));
const acc = () => ({ ts: 0, st: 0, te: 0, est: 0, c: 0, a: 0, vb: 0, tvn: 0, vv: 0, L: 0, F: 0 });
export function hora(t) { const min = 17 * 60 + Math.round(t * 330); return String(Math.floor(min / 60) % 24).padStart(2, '0') + ':' + String(min % 60).padStart(2, '0') + ':00'; }
