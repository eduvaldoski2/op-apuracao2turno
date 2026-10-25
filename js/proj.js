// Projeção do resultado final a partir da apuração parcial (modelo de "swing" hierárquico).
//
//  Para cada município (ou UF, quando só há dado agregado) compara-se o 2º turno apurado com o 1º turno:
//    swing   d = logit(Lula/(Lula+Flávio) no 2T) − logit(idem no 1T)
//    dif. de comparecimento, de brancos e de nulos (diferenças aditivas, em pontos de proporção)
//  Os swings medidos nos municípios já apurados são combinados numa hierarquia  município → UF → macrorregião → Brasil
//  (encolhimento bayesiano gaussiano). UFs/regiões ainda sem apuração "herdam" a tendência medida nas demais, e o
//  peso do chute inicial (swing zero) só some conforme a apuração avança. O que falta apurar de cada município é
//  projetado com a distribuição do 1º turno do próprio município + o swing da sua UF. A faixa de incerteza vem de
//  simulação (Monte Carlo) que propaga: incerteza do swing nacional, regional e estadual + ruído municipal.
import { UF_IDS, UF_REGIAO, logit, expit, clamp } from './util.js?v=d08a3f4d';
import { linhaParaObj } from './model.js?v=d08a3f4d';

export const PARAMS = {
  // desvios-padrão (escala logit para o swing; proporções para as demais)
  swing: { s0: 0.14, sr: 0.07, su: 0.05, sm: 0.10 },
  turn:  { s0: 0.03, sr: 0.015, su: 0.012, sm: 0.025 },
  blank: { s0: 0.006, sr: 0.003, su: 0.003, sm: 0.004 },
  nulo:  { s0: 0.012, sr: 0.005, su: 0.004, sm: 0.006 },
  draws: 300,
  minPstProb: 30,          // % apurado mínimo para exibir probabilidade de vitória
  inflaciona: 1.0,         // multiplicador global da faixa (calibrado no backtest sintético)
};

const regioes = () => { const r = {}; for (const u of UF_IDS) (r[UF_REGIAO[u]] ??= []).push(u); return r; };

// ---------- hierarquia gaussiana (3 níveis) ----------
// obs[uf] = { y, v } (v = variância da estimativa; ausente se sem dado)
export function hierarquia(obs, S) {
  const R = regioes(), reg = {}, uf = {};
  let precBR = 1 / (S.s0 * S.s0), somaBR = 0;
  for (const r in R) {
    let I = 0, J = 0;
    for (const u of R[r]) { const o = obs[u]; if (o) { const w = 1 / (o.v + S.su * S.su); I += w; J += o.y * w; } }
    const iR = I > 0 ? 1 / (1 / I + S.sr * S.sr) : 0, mR = I > 0 ? J / I : 0;
    reg[r] = { I, J, iR, mR }; precBR += iR; somaBR += iR * mR;
  }
  const meanBR = somaBR / precBR;
  for (const r in R) {
    const g = reg[r];
    const precEx = precBR - g.iR, meanEx = (somaBR - g.iR * g.mR) / precEx;
    const priorPrec = 1 / (1 / precEx + S.sr * S.sr);
    g.prec = g.I + priorPrec; g.mean = (g.J + priorPrec * meanEx) / g.prec;
    for (const u of R[r]) {
      const o = obs[u], info = o ? 1 / (o.v + S.su * S.su) : 0;
      const pe = g.prec - info, me = (g.prec * g.mean - (o ? info * o.y : 0)) / pe;
      const pp = 1 / (1 / pe + S.su * S.su);
      if (o) { const p = 1 / o.v + pp; uf[u] = { mean: (o.y / o.v + pp * me) / p, prec: p, has: true }; }
      else uf[u] = { mean: me, prec: pp, has: false };
    }
  }
  return { BR: { mean: meanBR, prec: precBR }, reg, uf, obs, S, R };
}
// amostra top-down: devolve {uf: valor}
export function amostrar(H, rnd) {
  const { S, R, reg, obs } = H, out = {};
  const dBR = H.BR.mean + gauss(rnd) / Math.sqrt(H.BR.prec);
  for (const r in R) {
    const g = reg[r], pr = g.I + 1 / (S.sr * S.sr);
    const dR = (g.J + dBR / (S.sr * S.sr)) / pr + gauss(rnd) / Math.sqrt(pr);
    for (const u of R[r]) {
      const o = obs[u], pu = (o ? 1 / o.v : 0) + 1 / (S.su * S.su);
      out[u] = ((o ? o.y / o.v : 0) + dR / (S.su * S.su)) / pu + gauss(rnd) / Math.sqrt(pu);
    }
  }
  return out;
}

export function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function gauss(rnd) { let u = 0, v = 0; while (!u) u = rnd(); v = rnd(); return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v); }
const quant = (arr, q) => { const a = Float64Array.from(arr).sort(); const i = (a.length - 1) * q, lo = Math.floor(i), hi = Math.ceil(i); return a[lo] + (a[hi] - a[lo]) * (i - lo); };

// ---------- unidades de projeção ----------
export function unidades(B, snap) {
  const un = [];
  for (const uf of UF_IDS) {
    const cur = snap.uf?.[uf], rows = snap.mun?.[uf], bt = B.ufTot[uf];
    let usaMun = false;
    if (rows && B.byUf[uf]) {
      let est = 0; for (const r of rows) est += r[4];
      usaMun = !cur || est >= (cur.est || 0) * 0.9;
    }
    if (usaMun) {
      const m = new Map(rows.map(r => [r[0], linhaParaObj(r)]));
      for (const b of B.byUf[uf]) un.push({ uf, cd: b.cd, nome: b.nome, b, o: (m.get(b.cd)?.est ? m.get(b.cd) : null) });
    } else if (bt) un.push({ uf, cd: '', nome: uf.toUpperCase(), b: { ...bt }, o: cur?.est ? { ...cur } : null, agregado: true });
  }
  return un;
}

const sh = (x, p) => (x + 0.5) / (x + p + 1);

export function projetar(B, snap, opts = {}) {
  const P = { ...PARAMS, ...opts };
  const un = unidades(B, snap);
  // ---- observações por UF ----
  const accSw = {}, accTu = {}, accBl = {}, accNu = {};
  const add = (acc, uf, y, v) => { const a = (acc[uf] ??= { sw: 0, p: 0 }); const w = 1 / v; a.sw += y * w; a.p += w; };
  for (const u of un) {
    if (!u.o || u.o.est <= 0) continue;
    const { b, o } = u;
    const n2 = o.L + o.F, n1 = b.L + b.F;
    if (n2 >= 5 && n1 >= 5) {
      const p2 = sh(o.L, o.F), p1 = sh(b.L, b.F);
      add(accSw, u.uf, logit(p2) - logit(p1), 1 / (n2 * p2 * (1 - p2)) + P.swing.sm ** 2);
    }
    if (b.te > 0 && b.c > 0) {
      const t2 = o.c / o.est, t1 = b.c / b.te;
      add(accTu, u.uf, t2 - t1, t2 * (1 - t2) / o.est + P.turn.sm ** 2);
      if (o.c > 20) {
        const b2 = o.vb / o.c, b1 = b.vb / b.c; add(accBl, u.uf, b2 - b1, b2 * (1 - b2) / o.c + P.blank.sm ** 2);
        const n2n = o.tvn / o.c, n1n = b.tvn / b.c; add(accNu, u.uf, n2n - n1n, n2n * (1 - n2n) / o.c + P.nulo.sm ** 2);
      }
    }
  }
  const toObs = acc => { const o = {}; for (const uf in acc) o[uf] = { y: acc[uf].sw / acc[uf].p, v: 1 / acc[uf].p }; return o; };
  const Hs = hierarquia(toObs(accSw), P.swing), Ht = hierarquia(toObs(accTu), P.turn), Hb = hierarquia(toObs(accBl), P.blank), Hn = hierarquia(toObs(accNu), P.nulo);
  const dS = {}, dT = {}, dB = {}, dN = {};
  for (const uf of UF_IDS) { dS[uf] = Hs.uf[uf].mean; dT[uf] = Ht.uf[uf].mean; dB[uf] = Hb.uf[uf].mean; dN[uf] = Hn.uf[uf].mean; }

  // ---- estrutura do restante a apurar ----
  const rest = []; // por unidade com restante
  const sumR = {}, ufRem = {};
  for (const u of un) {
    const te = u.o ? (u.o.te || u.b.te) : u.b.te, est = u.o ? u.o.est : 0;
    const R = Math.max(0, te - est);
    u.te = te; u.est = est; u.R = R;
    sumR[u.uf] = (sumR[u.uf] || 0) + R;
  }
  for (const uf of UF_IDS) {
    const cur = snap.uf?.[uf], bt = B.ufTot[uf];
    const teUf = cur?.te || bt?.te || 0, estUf = cur?.est || 0;
    ufRem[uf] = Math.max(0, teUf - estUf);
  }
  const escala = {};
  for (const uf of UF_IDS) escala[uf] = sumR[uf] > 0 ? clamp(ufRem[uf] / sumR[uf], 0, 1.5) : 0;
  for (const u of un) {
    if (u.R <= 0) continue; const b = u.b;
    const t1 = b.te ? b.c / b.te : 0.8, bl1 = b.c ? b.vb / b.c : 0.02, nu1 = b.c ? b.tvn / b.c : 0.03;
    const p1 = sh(b.L, b.F);
    rest.push({ u, R: u.R * escala[u.uf], t1, bl1, nu1, l1: logit(p1) });
  }

  const calc = (dS_, dT_, dB_, dN_, noise) => {
    const T = {}; // por UF
    for (const uf of UF_IDS) T[uf] = { L: 0, F: 0, vb: 0, tvn: 0, c: 0, R: 0, nv: 0 };
    for (const r of rest) {
      const uf = r.u.uf, t = T[uf];
      const tau = clamp(r.t1 + dT_[uf], 0.25, 0.99), bl = clamp(r.bl1 + dB_[uf], 0, 0.15), nu = clamp(r.nu1 + dN_[uf], 0, 0.2);
      const cast = r.R * tau, val = cast * (1 - bl - nu), p = expit(r.l1 + dS_[uf]);
      t.L += val * p; t.F += val * (1 - p); t.vb += cast * bl; t.tvn += cast * nu; t.c += cast; t.R += r.R;
      if (noise) t.nv += (val * p * (1 - p)) ** 2;
    }
    return T;
  };
  const T0 = calc(dS, dT, dB, dN, true);

  // ---- totais projetados ----
  const obsUf = uf => snap.uf?.[uf] || { est: 0, c: 0, a: 0, vb: 0, tvn: 0, vv: 0, L: 0, F: 0, te: 0, ts: 0, st: 0 };
  const fim = (o, t, te) => { // soma observado + restante
    const L = o.L + t.L, F = o.F + t.F, vb = o.vb + t.vb, tvn = o.tvn + t.tvn, c = o.c + t.c;
    const tt = te || (o.te ?? 0);
    return { L, F, vv: L + F, vb, tvn, c, te: tt, a: Math.max(0, tt - c), pL: 100 * L / (L + F), pF: 100 * F / (L + F), pAb: 100 * Math.max(0, tt - c) / tt, pBr: 100 * vb / c, pNu: 100 * tvn / c,
      pCo: 100 * c / tt, ali: 100 * (Math.max(0, tt - c) + vb + tvn) / tt };
  };
  const out = { uf: {}, params: P, swing: { BR: Hs.BR.mean, uf: dS }, un };
  const brObs = { L: 0, F: 0, vb: 0, tvn: 0, c: 0, te: 0 }, brT = { L: 0, F: 0, vb: 0, tvn: 0, c: 0 };
  for (const uf of UF_IDS) {
    const o = obsUf(uf), te = o.te || B.ufTot[uf]?.te || 0, t = T0[uf];
    const f = fim(o, t, te);
    f.pst = 100 * (o.st / (o.ts || 1)); f.pend = t.c; f.pendEleit = t.R; f.pendValidos = t.L + t.F; f.swing = dS[uf];
    f.fim1 = B.ufTot[uf];
    out.uf[uf] = f;
    for (const k of ['L', 'F', 'vb', 'tvn', 'c']) { brObs[k] += o[k] || 0; brT[k] += t[k] || 0; }
    brObs.te += te;
  }
  out.br = fim(brObs, brT, brObs.te);
  out.br.pst = 100 * (snap.br.st / (snap.br.ts || 1));
  out.br.swing = Hs.BR.mean; out.br.fim1 = B.br;
  out.br.pendEleit = Object.values(T0).reduce((s, t) => s + t.R, 0);
  out.br.pendValidos = brT.L + brT.F;
  out.br.vencedor = out.br.L > out.br.F ? 'L' : 'F';

  // ---- Monte Carlo (faixa de incerteza) ----
  const rnd = rng((snap.br.st || 1) * 2654435761 + 12345);
  const ND = P.draws, brpL = [], brAb = [], brBr = [], brNu = [], brMargem = [], ufpL = {}, ufwin = {};
  for (const uf of UF_IDS) { ufpL[uf] = []; ufwin[uf] = 0; }
  let winL = 0;
  const sdM = {}; for (const uf of UF_IDS) sdM[uf] = Math.sqrt(T0[uf].nv) * P.swing.sm;
  for (let k = 0; k < ND; k++) {
    const T = calc(amostrar(Hs, rnd), amostrar(Ht, rnd), amostrar(Hb, rnd), amostrar(Hn, rnd), false);
    let L = 0, F = 0, vb = 0, tvn = 0, c = 0;
    for (const uf of UF_IDS) {
      const o = obsUf(uf), t = T[uf], e = gauss(rnd) * sdM[uf] * P.inflaciona;
      const l = o.L + t.L + e, f = o.F + t.F - e;
      ufpL[uf].push(100 * l / (l + f)); if (l > f) ufwin[uf]++;
      L += l; F += f; vb += o.vb + t.vb; tvn += o.tvn + t.tvn; c += o.c + t.c;
    }
    brpL.push(100 * L / (L + F)); brMargem.push(L - F); if (L > F) winL++;
    brAb.push(100 * (brObs.te - c) / brObs.te); brBr.push(100 * vb / c); brNu.push(100 * tvn / c);
  }
  const faixa = (arr, c0) => { const lo = quant(arr, 0.05), hi = quant(arr, 0.95); return [c0 + (lo - c0) * P.inflaciona, c0 + (hi - c0) * P.inflaciona]; };
  out.br.band = { pL: faixa(brpL, out.br.pL), pAb: faixa(brAb, out.br.pAb), pBr: faixa(brBr, out.br.pBr), pNu: faixa(brNu, out.br.pNu), margem: [quant(brMargem, 0.05), quant(brMargem, 0.95)] };
  out.br.band.pF = [100 - out.br.band.pL[1], 100 - out.br.band.pL[0]];
  out.br.pWinL = winL / ND;
  out.br.pstProb = out.br.pst >= P.minPstProb;
  for (const uf of UF_IDS) {
    out.uf[uf].band = { pL: faixa(ufpL[uf], out.uf[uf].pL) }; out.uf[uf].band.pF = [100 - out.uf[uf].band.pL[1], 100 - out.uf[uf].band.pL[0]];
    out.uf[uf].pWinL = ufwin[uf] / ND;
  }
  // regiões
  out.reg = {};
  for (const r of Object.keys({ N: 1, NE: 1, CO: 1, SE: 1, S: 1, EX: 1 })) {
    const a = { L: 0, F: 0, vb: 0, tvn: 0, c: 0, te: 0, pendEleit: 0 };
    for (const uf of UF_IDS) if (UF_REGIAO[uf] === r) { const u = out.uf[uf]; for (const k of ['L', 'F', 'vb', 'tvn', 'c', 'te', 'pendEleit']) a[k] += u[k] || 0; }
    if (a.te) out.reg[r] = { ...a, pL: 100 * a.L / (a.L + a.F), pF: 100 * a.F / (a.L + a.F), pAb: 100 * (a.te - a.c) / a.te, pendEleit: a.pendEleit };
  }
  // projeção por unidade (para as listas)
  const proj = new Map();
  for (const r of rest) {
    const uf = r.u.uf, tau = clamp(r.t1 + dT[uf], 0.25, 0.99), bl = clamp(r.bl1 + dB[uf], 0, 0.15), nu = clamp(r.nu1 + dN[uf], 0, 0.2);
    const cast = r.R * tau, val = cast * (1 - bl - nu), p = expit(r.l1 + dS[uf]);
    proj.set(r.u.uf + r.u.cd, { L: val * p, F: val * (1 - p) });
  }
  out.unidade = (uf, cd, o) => { const r = proj.get(uf + cd) || { L: 0, F: 0 }; const L = (o?.L || 0) + r.L, F = (o?.F || 0) + r.F; return { L, F, pL: 100 * L / (L + F), pF: 100 * F / (L + F) }; };
  return out;
}

// projeção por município: lista da UF com resultado projetado (para a aba Projeção)
export function projetarMunicipios(B, snap, P, uf) {
  const rows = new Map((snap.mun?.[uf] || []).map(r => [r[0], linhaParaObj(r)]));
  return (B.byUf[uf] || []).map(b => {
    const o = rows.get(b.cd); const o2 = o && o.est ? o : null;
    const f = P.unidade(uf, b.cd, o2);
    return { cd: b.cd, nome: b.nome, uf, apurado: !!o2, pst: o2 ? 100 * o2.st / (o2.ts || 1) : 0, ...f, p1L: 100 * b.L / (b.vv || 1), p1F: 100 * b.F / (b.vv || 1), L1: b.L, F1: b.F };
  });
}
