// Carregamento dos dados: base do 1º turno, snapshot do 2º turno (fonte do coletor, TSE direto ou demonstração).
import { CONFIG } from './config.js?v=70ccdf5a';
import { TSE, montarSnapshot, getJSON } from './tse.js?v=70ccdf5a';
import { projetar, PARAMS } from './proj.js?v=70ccdf5a';
import { prepBase } from './model.js?v=70ccdf5a';

const q = new URLSearchParams(location.search);
export const MODO_DEMO = q.has('demo');
const bust = () => '?t=' + Math.floor(Date.now() / 20000);

export async function carregarEstatico({ semBase = false } = {}) {
  const geo = await getJSON(CONFIG.mapa, { retries: 1 });
  if (semBase) return { geo };
  const raw = await getJSON(q.get('base') || CONFIG.base, { retries: 1 });
  return { B: prepBase(raw), geo, simulado: !!raw.simulado };
}

// ---- fonte do coletor ----
const falhouEm = new Map();   // fonte -> quando falhou; uma fonte que falhou fica 2 min de lado se houver outra
let cacheFonte = null;   // última leitura do coletor: só baixa snap/hist de novo quando o meta.json (minúsculo) indica mudança
async function daFonte() {
  const todas = q.get('fonte') ? [q.get('fonte')] : CONFIG.fontes;
  const boas = todas.filter(f => !(falhouEm.get(f) > Date.now() - 120000));
  for (const f of (boas.length ? boas : todas)) {
    try {
      let meta = null; try { meta = await getJSON(f + 'meta.json' + bust(), { retries: 0 }); } catch { /* opcional */ }
      if (cacheFonte && cacheFonte.f === f && meta?.ultimaMudanca && meta.ultimaMudanca === cacheFonte.mudanca) return { ...cacheFonte.res, meta };
      const [snap, hist] = await Promise.all([getJSON(f + 'snap.json' + bust(), { retries: 1 }), getJSON(f + 'hist.json' + bust(), { retries: 1 }).catch(() => [])]);
      if (snap?.br && snap.turno === 2) {
        const res = { snap, hist, fonte: 'coletor' }; cacheFonte = { f, mudanca: meta?.ultimaMudanca ?? null, res };
        return { ...res, meta };
      }
      falhouEm.set(f, Date.now());
    } catch { falhouEm.set(f, Date.now()); /* tenta a próxima */ }
  }
  return null;
}

// ---- leitura direta do TSE (somente UF; municípios sob demanda) ----
let prevDireto = null; const histDireto = [];
async function diretoTSE() {
  const cfg = { ...TSE, base: q.get('tse') || TSE.base };
  const snap = await montarSnapshot({ cfg, prev: prevDireto, municipios: false, conc: 6 });
  if (!snap.br.ts || !snap.br.st) return { snap: null };
  prevDireto = snap;
  const u = snap.br, ult = histDireto[histDireto.length - 1];
  if (!ult || ult.st !== u.st || ult.hg !== snap.hg) histDireto.push({ t: new Date().toISOString(), dg: snap.dg, hg: snap.hg, ht: String(snap.hg).slice(0, 5), pst: 100 * u.st / u.ts, st: u.st, ts: u.ts, L: u.L, F: u.F, vv: u.vv, c: u.c, a: u.a, vb: u.vb, tvn: u.tvn, te: u.te, est: u.est });
  return { snap, hist: histDireto.slice(), meta: null, fonte: 'tse-direto' };
}

export async function lerAoVivo() {
  const a = await daFonte(); if (a) return a;
  if (CONFIG.diretoTSE || q.get('tse')) { try { const d = await diretoTSE(); if (d.snap) return d; } catch (e) { /* segue */ } }
  return { snap: null, hist: [], fonte: 'nenhuma' };
}

// carrega municípios de uma UF diretamente do TSE (modo direto)
export async function municipiosDireto(uf, snap) {
  const { urls, parseAb, parseResultado, pool } = await import('./tse.js?v=70ccdf5a');
  const cfg = { ...TSE, base: q.get('tse') || TSE.base }, U = urls(cfg);
  const ab = parseAb(await getJSON(U.abUf(uf)));
  const cds = Object.entries(ab.mun).filter(([, m]) => m.st > 0).map(([cd]) => cd);
  const rs = await pool(cds, 10, async cd => { const p = parseResultado(await getJSON(U.mun(uf, cd)), cfg); return [cd, p.ts, p.st, p.te, p.est, p.c, p.a, p.vb, p.tvn, p.L, p.F, p.vv]; });
  snap.mun ??= {}; snap.mun[uf] = rs.filter(r => !r.erro);
}

// ---- demonstração (dados simulados, reprodução acelerada) ----
export async function criarDemo() {
  const { simular } = await import('./sim.js?v=70ccdf5a');
  let real = null;
  try { real = (await (await fetch('data/base_1t.json')).json()).rows; } catch { /* sem base real: usa o país sintético */ }
  const sim = simular({ seed: +q.get('seed') || 7, real });
  const B = prepBase(sim.base);
  const hist = []; let t = 0.015;
  const passo = () => {
    const snap = sim.snapshot(Math.min(t, 1.06));
    const P = projetar(B, snap, { draws: 80 });
    const h = snap.hg.slice(0, 5);
    hist.push({ t: new Date().toISOString(), dg: snap.dg, hg: snap.hg, ht: h, pst: 100 * snap.br.st / snap.br.ts, st: snap.br.st, ts: snap.br.ts, L: snap.br.L, F: snap.br.F, vv: snap.br.vv, c: snap.br.c, a: snap.br.a, vb: snap.br.vb, tvn: snap.br.tvn, te: snap.br.te, est: snap.br.est,
      pL: P.br.pL, lo: P.br.band.pL[0], hi: P.br.band.pL[1], pw: P.br.pWinL });
    t += 0.035; return { snap, hist: hist.slice(), meta: null, fonte: 'demo', fim: t > 1.06 };
  };
  return { B, base: sim.base, passo, simulado: true };
}
