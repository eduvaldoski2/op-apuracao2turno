// Modelo de dados do painel: combina a base do 1º turno (por município) com o snapshot do 2º turno.
import { UF_IDS, REGIOES, UF_REGIAO, sdiv } from './util.js?v=7d0b3ec3';

const ROW = { uf: 0, cd: 1, nome: 2, cdi: 3, ts: 4, te: 5, c: 6, a: 7, vb: 8, tvn: 9, L: 10, F: 11, vv: 12 };

export function prepBase(raw) {
  const muns = raw.rows.map(r => ({ uf: r[0], cd: r[1], nome: r[2], cdi: r[3], ts: r[4], te: r[5], c: r[6], a: r[7], vb: r[8], tvn: r[9], L: r[10], F: r[11], vv: r[12] }));
  const byUf = {}, byKey = {};
  for (const m of muns) { (byUf[m.uf] ??= []).push(m); byKey[m.uf + m.cd] = m; }
  const ufTot = {}, br = zero();
  for (const uf of UF_IDS) { ufTot[uf] = zero(); for (const m of byUf[uf] || []) add(ufTot[uf], m); add(br, ufTot[uf]); }
  return { muns, byUf, byKey, ufTot, br, meta: raw };
}
function zero() { return { ts: 0, te: 0, c: 0, a: 0, vb: 0, tvn: 0, L: 0, F: 0, vv: 0 }; }
function add(t, m, f = 1) { for (const k in t) t[k] += (m[k] || 0) * f; return t; }

// converte uma linha do snapshot em objeto
export const linhaParaObj = r => ({ cd: r[0], ts: r[1], st: r[2], te: r[3], est: r[4], c: r[5], a: r[6], vb: r[7], tvn: r[8], L: r[9], F: r[10], vv: r[11] });

// referência do 1º turno "do mesmo recorte": soma do 1º turno nos municípios apurados, ponderada pela fração do eleitorado apurada
function refLfl(B, snap, uf) {
  const t = zero(); t.est = 0; let cobertos = 0;
  const rows = snap.mun?.[uf];
  if (rows && rows.length) {
    for (const r of rows) {
      const o = linhaParaObj(r), b = B.byKey[uf + o.cd]; if (!b || !o.est) continue;
      const f = b.te ? Math.min(1, o.est / b.te) : 0; add(t, b, f); t.est += b.te * f; cobertos += o.est;
    }
    const u = snap.uf?.[uf];
    if (!u || cobertos >= (u.est || 0) * 0.98) return t;   // municípios cobrem a UF
  }
  const u = snap.uf?.[uf]; const bt = B.ufTot[uf];
  if (!u || !bt || !bt.te) return t;
  const f = Math.min(1, u.est / bt.te); const z = zero(); add(z, bt, f); z.est = bt.te * f; return z;
}

function pcts(x) {
  const est = x.est ?? x.te, vv = x.vv || (x.L + x.F);
  return { pAb: 100 * sdiv(x.a, est), pBr: 100 * sdiv(x.vb, x.c), pNu: 100 * sdiv(x.tvn, x.c), pL: 100 * sdiv(x.L, vv), pF: 100 * sdiv(x.F, vv), pCo: 100 * sdiv(x.c, est),
    ali: 100 * sdiv(x.a + x.vb + x.tvn, est) };
}

// monta bloco de exibição: valores atuais + referência do 1º turno + variações
export function bloco(cur, ref, finalRef = null) {
  const o = { ...cur };
  o.pst = 100 * sdiv(cur.st, cur.ts);
  Object.assign(o, pcts(cur));
  const base = finalRef || ref;
  const rp = pcts({ ...base, est: base.est ?? base.te });
  o.ref = rp; o.refRaw = { ...ref }; o.cmpRaw = { ...base };
  o.refAbs = { L: ref.L, F: ref.F, a: ref.a, vb: ref.vb, tvn: ref.tvn };
  o.d = { Ab: o.pAb - rp.pAb, Br: o.pBr - rp.pBr, Nu: o.pNu - rp.pNu, L: o.pL - rp.pL, F: o.pF - rp.pF, ali: o.ali - rp.ali, Co: o.pCo - rp.pCo };
  o.g = { L: 100 * (sdiv(cur.L, ref.L) - 1), F: 100 * (sdiv(cur.F, ref.F) - 1) };   // crescimento de votos x 1º turno (mesmo recorte)
  o.margem = cur.L - cur.F;
  o.lider = cur.L === cur.F ? null : (cur.L > cur.F ? 'L' : 'F');
  return o;
}

// refMode: 'lfl' (mesmos municípios, proporcional ao apurado) | 'final' (1º turno final do recorte)
export function calcular(B, snap, refMode = 'lfl') {
  const V = { uf: {}, reg: {}, snap, refMode };
  const refBr = zero(); refBr.est = 0;
  for (const uf of UF_IDS) {
    const cur = snap.uf?.[uf]; if (!cur) continue;
    const lfl = refLfl(B, snap, uf);
    V.uf[uf] = bloco({ ...cur }, lfl, refMode === 'final' ? { ...B.ufTot[uf], est: B.ufTot[uf].te } : null);
    V.uf[uf].id = uf;
    add(refBr, lfl);
  }
  const cb = snap.br;
  V.br = bloco({ ...cb }, refBr, refMode === 'final' ? { ...B.br, est: B.br.te } : null);
  // regiões (soma de UFs)
  const RK = ['ts', 'st', 'te', 'est', 'c', 'a', 'vb', 'tvn', 'vv', 'L', 'F'], RR = ['est', 'c', 'a', 'vb', 'tvn', 'vv', 'L', 'F'];
  for (const r of Object.keys(REGIOES)) {
    const cur = Object.fromEntries(RK.map(k => [k, 0])), ref = Object.fromEntries(RR.map(k => [k, 0])), cmp = { ...ref };
    let any = false;
    for (const uf of UF_IDS) if (UF_REGIAO[uf] === r && V.uf[uf]) {
      any = true; const u = V.uf[uf];
      for (const k of RK) cur[k] += u[k] || 0;
      for (const k of RR) { ref[k] += u.refRaw[k] || 0; cmp[k] += u.cmpRaw[k] || 0; }
    }
    if (any) { V.reg[r] = bloco(cur, ref, refMode === 'final' ? cmp : null); V.reg[r].id = r; }
  }
  return V;
}

// lista de municípios de uma UF (inclui os ainda não apurados)
export function listaMunicipios(B, V, uf) {
  const snap = V.snap, rows = new Map((snap.mun?.[uf] || []).map(r => [r[0], linhaParaObj(r)]));
  const out = [];
  for (const b of B.byUf[uf] || []) {
    const o = rows.get(b.cd);
    const base = { cd: b.cd, nome: b.nome, uf, ts1: b.ts };
    const p1 = pcts({ ...b, est: b.te });
    if (!o || !o.est) { out.push({ ...base, apurado: false, pst: 0, p1L: p1.pL, p1F: p1.pF, L1: b.L, F1: b.F, te: b.te }); continue; }
    const f = b.te ? Math.min(1, o.est / b.te) : 0;
    const ref = { L: b.L * f, F: b.F * f, a: b.a * f, vb: b.vb * f, tvn: b.tvn * f, c: b.c * f, vv: b.vv * f, est: b.te * f };
    const blk = bloco(o, ref, V.refMode === 'final' ? { ...b, est: b.te } : null);
    out.push({ ...base, apurado: true, ...blk, te: o.te || b.te, p1L: p1.pL, p1F: p1.pF, L1: b.L, F1: b.F });
  }
  return out;
}

// ranking de UFs para um candidato k ('L'|'F')
export function rankingUfs(V, k) {
  return Object.values(V.uf).filter(u => u.id !== 'zz' || true).map(u => ({ id: u.id, votos: u[k], p: k === 'L' ? u.pL : u.pF, d: u.d[k], g: u.g[k], pst: u.pst, p1: k === 'L' ? u.ref.pL : u.ref.pF }))
    .sort((a, b) => (isNaN(b.p) - isNaN(a.p)) || b.p - a.p);
}

// pontos para o gráfico de avanço
export const serieAvanco = hist => hist.map(h => ({ t: h.t, ht: h.ht, dg: h.dg, pst: h.pst, L: h.L, F: h.F, vv: h.vv, pL: 100 * h.L / (h.vv || 1), pF: 100 * h.F / (h.vv || 1) }));
