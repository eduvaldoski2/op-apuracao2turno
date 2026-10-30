// Leitura dos arquivos estáticos de divulgação do TSE (navegador e Node).
// O esquema do 2º turno (eleição 6258) foi mapeado a partir do 1º turno (6257); os leitores são tolerantes
// (procuram os campos por nome em qualquer nível) e o coletor registra um diagnóstico quando algo não bate.
import { cnt, pct, UF_IDS } from './util.js?v=9b085892';

export const TSE = {
  base: 'https://resultados.tse.jus.br/oficial',
  ciclo: 'ele2026',
  turno: 2,
  ele: { 1: 6257, 2: 6258 },   // eleição presidente 1º e 2º turno (ele-c.json)
  eleGov: { 1: 6259, 2: 6260 },   // eleição estadual (governador, senador, deputados): o 2º turno de governador só existe nos estados com disputa
  cargo: '0001',
  cargoGov: '0003',
  numL: '13', numF: '22',
};
const pad6 = n => String(n).padStart(6, '0');

export function urls(cfg = TSE, turno = cfg.turno) {
  const ele = cfg.ele[turno], e6 = pad6(ele), raiz = `${cfg.base}/${cfg.ciclo}/${ele}`;
  return {
    br: () => `${raiz}/dados/br/br-c${cfg.cargo}-e${e6}-u.json`,
    uf: uf => `${raiz}/dados/${uf}/${uf}-c${cfg.cargo}-e${e6}-u.json`,
    mun: (uf, cd) => `${raiz}/dados/${uf}/${uf}${cd}-c${cfg.cargo}-e${e6}-u.json`,
    govUf: uf => { const g = cfg.eleGov?.[turno]; return g ? `${cfg.base}/${cfg.ciclo}/${g}/dados/${uf}/${uf}-c${cfg.cargoGov || '0003'}-e${pad6(g)}-u.json` : null; },
    senUf: uf => { const g = cfg.eleGov?.[turno]; return g ? `${cfg.base}/${cfg.ciclo}/${g}/dados/${uf}/${uf}-c${cfg.cargoSen || '0005'}-e${pad6(g)}-u.json` : null; },   // senador: mesmo desenho do arquivo de governador
    abBr: () => `${raiz}/dados/br/br-e${e6}-ab.json`,
    abUf: uf => `${raiz}/dados/${uf}/${uf}-e${e6}-ab.json`,
    cm: () => `${raiz}/config/mun-e${e6}-cm.json`,
  };
}

export async function getJSON(url, { retries = 3, timeout = 20000, signal } = {}) {
  let err;
  for (let i = 0; i <= retries; i++) {
    const ac = new AbortController(); const t = setTimeout(() => ac.abort(), timeout);
    try {
      const r = await fetch(url, { cache: 'no-store', signal: signal || ac.signal });
      if (r.status === 404) { clearTimeout(t); const e = new Error('404 ' + url); e.status = 404; throw e; }
      if (!r.ok) throw new Error(r.status + ' ' + url);
      const j = await r.json();   // o timeout cobre também a leitura do corpo (evita travar se o TSE parar de enviar)
      clearTimeout(t);
      return j;
    } catch (e) { clearTimeout(t); err = e; if (e.status === 404) throw e; await new Promise(r => setTimeout(r, 400 * (i + 1))); }
  }
  throw err;
}

export async function pool(items, n, fn) {
  const out = new Array(items.length); let i = 0;
  await Promise.all(Array.from({ length: Math.min(n, items.length) }, async () => {
    while (i < items.length) { const k = i++; try { out[k] = await fn(items[k], k); } catch (e) { out[k] = { erro: e }; } }
  }));
  return out;
}

// ---------- parsers ----------
function acha(node, pred, prof = 0) {
  if (!node || typeof node !== 'object' || prof > 8) return null;
  if (!Array.isArray(node) && pred(node)) return node;
  for (const k in node) { const r = acha(node[k], pred, prof + 1); if (r) return r; }
  return null;
}
export function candidatos(node, out = [], prof = 0) {
  if (!node || typeof node !== 'object' || prof > 10) return out;
  if (!Array.isArray(node) && node.vap != null && node.n != null) out.push(node);
  for (const k in node) if (node[k] && typeof node[k] === 'object') candidatos(node[k], out, prof + 1);
  return out;
}

// arquivo de resultado (br / uf / município) -> números
export function parseResultado(j, cfg = TSE) {
  const alvo = acha(j, o => o.s && typeof o.s === 'object' && o.e && typeof o.e === 'object') || j;
  const S = alvo.s || {}, E = alvo.e || {}, V = alvo.v || {};
  const cs = candidatos(j);
  let L = 0, F = 0, eleitoL = false, eleitoF = false, achouL = false, achouF = false;
  for (const c of cs) {
    const n = String(c.n);
    if (n === cfg.numL) { L = cnt(c.vap); achouL = true; eleitoL = /^eleit/i.test(c.st || ''); }
    if (n === cfg.numF) { F = cnt(c.vap); achouF = true; eleitoF = /^eleit/i.test(c.st || ''); }
  }
  const te = cnt(E.te), est = cnt(E.est) || te, c = cnt(E.c);
  const a = E.a != null ? cnt(E.a) : Math.max(0, est - c);
  const vb = cnt(V.vb);
  const tvn = V.tvn != null ? cnt(V.tvn) : cnt(V.vn) + cnt(V.vnt);
  const vv = V.vv != null ? cnt(V.vv) : L + F;
  return {
    dg: j.dg || '', hg: j.hg || '',
    ts: cnt(S.ts), st: cnt(S.st), pst: pct(S.pst),
    te, est, c, a, vb, tvn, vv, L, F,
    ok: achouL && achouF, eleito: { L: eleitoL, F: eleitoF },
  };
}

// arquivo de acompanhamento -> { br?:{}, uf:{cd:{...}}, mun:{cd:{...}} }
export function parseAb(j) {
  const r = { uf: {}, mun: {} };
  for (const a of (j.abr || [])) {
    const S = a.s || {}, E = a.e || {};
    const o = { ts: cnt(S.ts), st: cnt(S.st), te: cnt(E.te), est: cnt(E.est), c: cnt(E.c), ht: a.ht || a.dt || '' };
    const tp = String(a.tpabr || '').toLowerCase(), cd = String(a.cdabr || '').toLowerCase();
    if (tp === 'br') r.br = o;
    else if (tp.startsWith('mu') || /^\d+$/.test(cd)) r.mun[cd.padStart(5, '0')] = o;
    else r.uf[cd] = o;
  }
  return r;
}

const linhaMun = (cd, p) => [cd, p.ts, p.st, p.te, p.est, p.c, p.a, p.vb, p.tvn, p.L, p.F, p.vv];
const blocoUF = p => ({ ts: p.ts, st: p.st, te: p.te, est: p.est, c: p.c, a: p.a, vb: p.vb, tvn: p.tvn, vv: p.vv, L: p.L, F: p.F, eL: p.eleito?.L ? 1 : 0, eF: p.eleito?.F ? 1 : 0 });

// governador (arquivo de UF da eleição estadual): candidatos com partido (vem do nó da legenda), votos nominais e andamento da apuração
export function parseGov(j) {
  const cs = [];
  (function w(n, par) {
    if (Array.isArray(n)) return n.forEach(x => w(x, par));
    if (!n || typeof n !== 'object') return;
    if (n.cand && n.sg) par = n.sg;
    if (n.vap != null && n.n != null && !n.cand) cs.push({ n: String(n.n), nm: n.nmu || n.nm || '', sg: par || '', v: cnt(n.vap), e: /^eleit/i.test(n.st || '') || (!n.st && n.e === 's') ? 1 : 0, st: String(n.st || '').slice(0, 20) });   // e = eleito (no 1º turno, "e":"s" também marca quem vai ao 2º turno; por isso vale o texto de st)
    for (const k in n) if (n[k] && typeof n[k] === 'object') w(n[k], par);
  })(j.carg || j, '');
  const S = j.s || {}, E = j.e || {}, V = j.v || {};
  const vv = V.vv != null ? cnt(V.vv) : cs.reduce((a, c) => a + c.v, 0);
  cs.sort((a, b) => b.v - a.v);
  return { hg: j.hg || '', ht: j.ht || '', ts: cnt(S.ts), st: cnt(S.st), te: cnt(E.te), c: cnt(E.c), a: cnt(E.a), vv, vb: cnt(V.vb), tvn: cnt(V.tvn), cand: cs.map(c => ({ ...c, p: vv ? 100 * c.v / vv : 0 })) };
}
// Resultado do 2º turno para governador. Só há arquivo nos estados com segundo turno (os demais respondem 404); a lista é
// revista a cada 10 minutos e, entre uma revisão e outra, só os estados que já têm disputa são lidos de novo.
export async function montarGov({ cfg = TSE, prev = null, ufs = UF_IDS, conc = 8, diag = [] } = {}) {
  const U = urls(cfg); if (!U.govUf(ufs[0])) return null;
  const agora = Date.now(), rever = !prev || !prev.scan || agora - prev.scan > 600000;
  const alvo = rever ? ufs : Object.keys(prev.uf || {});
  const uf = {};
  const res = await pool(alvo, conc, async u => parseGov(await getJSON(U.govUf(u), { retries: 1 })));
  res.forEach((r, i) => {
    const u = alvo[i];
    if (r.erro) { if (r.erro.status !== 404) { diag.push(`gov ${u}: ${r.erro.message}`); if (prev?.uf?.[u]) uf[u] = prev.uf[u]; } return; }
    if (r.cand.length >= 2) uf[u] = r;
  });
  return { ele: cfg.eleGov[cfg.turno], scan: rever ? agora : prev.scan, uf };
}

// Monta o snapshot completo. `prev` = snapshot anterior (reaproveita municípios/UFs que não mudaram).
export async function montarSnapshot({ cfg = TSE, prev = null, conc = 12, log = () => {}, ufs = UF_IDS, municipios = true, suprir = null } = {}) {
  const U = urls(cfg);
  const br = parseResultado(await getJSON(U.br()), cfg);
  const diag = [];
  if (!br.ok) diag.push('br: candidatos 13/22 não localizados no arquivo do TSE');
  // acompanhamento por UF (detecta mudanças) — 1 requisição por UF
  const abs = await pool(ufs, conc, async uf => parseAb(await getJSON(U.abUf(uf))));
  const snap = { v: 1, turno: cfg.turno, dg: br.dg, hg: br.hg, br: blocoUF(br), uf: {}, mun: {}, diag };
  const mudouUf = [];
  ufs.forEach((uf, i) => {
    const ab = abs[i]; if (ab.erro) { diag.push(`ab ${uf}: ${ab.erro.message}`); return; }
    const pr = prev?.uf?.[uf]; const aUf = ab.uf[uf];
    if (!pr || !aUf || aUf.st !== pr.st || aUf.est !== pr.est) mudouUf.push(uf);
    else snap.uf[uf] = pr;
    snap._ab ??= {}; snap._ab[uf] = ab;
  });
  await pool(mudouUf, conc, async uf => { snap.uf[uf] = blocoUF(parseResultado(await getJSON(U.uf(uf)), cfg)); });
  if (municipios) {
    const tarefas = [];
    for (const uf of ufs) {
      const ab = snap._ab?.[uf]; if (!ab) continue;
      const antigas = new Map((prev?.mun?.[uf] || []).map(r => [r[0], r]));
      snap.mun[uf] = [];
      for (const [cd, m] of Object.entries(ab.mun)) {
        if (!m.st) continue;
        const ant = antigas.get(cd);
        if (ant && ant[2] === m.st && ant[4] === m.est) snap.mun[uf].push(ant);
        else tarefas.push({ uf, cd, st: m.st });
      }
    }
    log(`municípios a buscar: ${tarefas.length}`);
    // O TSE às vezes informa seções apuradas no município (arquivo de acompanhamento) e ainda publica o resultado do
    // município zerado/atrasado. Nesse caso `suprir` calcula a linha a partir dos boletins de urna já coletados.
    let supridos = 0;
    const res = await pool(tarefas, conc, async ({ uf, cd, st }) => {
      const base = parseResultado(await getJSON(U.mun(uf, cd)), cfg);
      let linha = linhaMun(cd, base);
      if (suprir && base.st < st) { try { const l2 = await suprir(uf, cd, linha); if (l2) { linha = l2; supridos++; } } catch { /* sem boletins: fica o que o TSE publicou */ } }
      return linha;
    });
    if (suprir) log(`municípios completados pelos boletins: ${supridos}`);
    res.forEach((r, i) => { if (r.erro) diag.push(`mun ${tarefas[i].uf}${tarefas[i].cd}: ${r.erro.message}`); else snap.mun[tarefas[i].uf].push(r); });
  }
  if (cfg.eleGov?.[cfg.turno]) {   // governador: se falhar, o painel de presidente segue normalmente
    try { snap.gov = await montarGov({ cfg, prev: prev?.gov, ufs, conc, diag }); } catch (e) { diag.push('gov: ' + e.message); if (prev?.gov) snap.gov = prev.gov; }
  }
  delete snap._ab;
  // Totais nunca ficam abaixo da soma do que está nos municípios (quando o TSE atrasa o arquivo do estado/Brasil)
  if (municipios && suprir) {
    const soma = rows => { const t = { st: 0, est: 0, c: 0, a: 0, vb: 0, tvn: 0, vv: 0, L: 0, F: 0 }; for (const r of rows) { t.st += r[2]; t.est += r[4]; t.c += r[5]; t.a += r[6]; t.vb += r[7]; t.tvn += r[8]; t.L += r[9]; t.F += r[10]; t.vv += r[11]; } return t; };
    for (const uf of Object.keys(snap.uf)) {
      const t = soma(snap.mun[uf] || []);
      if (t.st > (snap.uf[uf].st || 0)) { Object.assign(snap.uf[uf], t); log(`${uf}: total elevado pela soma dos municípios (${t.st} seções)`); }
    }
    const tb = { st: 0, est: 0, c: 0, a: 0, vb: 0, tvn: 0, vv: 0, L: 0, F: 0 };
    for (const u of Object.values(snap.uf)) for (const k in tb) tb[k] += u[k] || 0;
    if (tb.st > snap.br.st) { Object.assign(snap.br, tb); log(`Brasil: total elevado pela soma dos estados (${tb.st} seções)`); }
  }
  snap.diag = diag.slice(0, 50);
  return snap;
}

export { linhaMun, blocoUF };
