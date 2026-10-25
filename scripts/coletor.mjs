#!/usr/bin/env node
// Coletor da apuração: lê os arquivos do TSE, calcula a projeção e grava snap.json / hist.json / meta.json.
//   node scripts/coletor.mjs --out data/live [--loop 30] [--max-min 340] [--tse URL]   apuração (2º turno)
//   node scripts/coletor.mjs --base data/base_1t.json [--tse URL]                      monta a base do 1º turno por município
import fs from 'node:fs';
import path from 'node:path';
import { TSE, montarSnapshot, getJSON, parseResultado, pool, urls } from '../js/tse.js';
import { prepBase } from '../js/model.js';
import { projetar } from '../js/proj.js';
import { UF_IDS } from '../js/util.js';

// grupos de estados dos boletins por seção (igual a js/config.js › gruposBairros)
const GRUPOS = { sp: 1, mg: 2, pa: 2, pi: 2, am: 2, df: 2, rj: 3, pe: 3, sc: 3, mt: 3, ms: 3, ro: 3, zz: 3, rr: 3, ba: 4, ce: 4, go: 4, es: 4, al: 4, to: 4, ac: 4, rs: 5, pr: 5, ma: 5, pb: 5, rn: 5, se: 5, ap: 5 };
const REPO = process.env.GITHUB_REPOSITORY || 'eduvaldoski2/op-apuracao2turno';
// Soma os boletins de urna já coletados do município (branch dados-bN) e devolve a linha do município, se tiver mais seções que o TSE publicou.
async function dosBoletins(uf, cd, base) {
  const g = GRUPOS[uf]; if (!g) return null;
  const j = await getJSON(`https://raw.githubusercontent.com/${REPO}/dados-b${g}/live/bairros/${uf}/${cd}.json?t=${Date.now()}`, { retries: 1, timeout: 15000 });
  const v = Object.values(j?.s || {}); if (!v.length || v.length <= base[2]) return null;
  const t = { L: 0, F: 0, O: 0, B: 0, N: 0, ap: 0 };
  for (const x of v) { t.L += x[0]; t.F += x[1]; t.O += x[2]; t.B += x[3]; t.N += x[4]; t.ap += x[5] || 0; }
  const c = t.L + t.F + t.O + t.B + t.N;
  // [cd, ts, st, te, est, c, a, vb, tvn, L, F, vv]
  return [cd, base[1], v.length, base[3], t.ap, c, Math.max(0, t.ap - c), t.B, t.N, t.L, t.F, t.L + t.F + t.O];
}

// O TSE serve os arquivos por uma CDN que, para o servidor do coletor, às vezes devolve cópias velhas (horas atrás).
// Por isso toda leitura do TSE leva um parâmetro único na URL, que força a cópia mais nova.
const fetchOrig = globalThis.fetch;
globalThis.fetch = (u, o = {}) => { const s = String(u); return fetchOrig(/tse\.jus\.br\//.test(s) ? s + (s.includes('?') ? '&' : '?') + 'cb=' + Date.now() + Math.floor(Math.random() * 1000) : u, { ...o, headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache', ...(o.headers || {}) } }); };

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? (process.argv[i + 1]?.startsWith('--') ? true : process.argv[i + 1]) : d; };
const cfg = { ...TSE, base: arg('tse', process.env.TSE_BASE || TSE.base), ele: { ...TSE.ele } };
if (arg('ele', null)) cfg.ele[2] = +arg('ele');   // ensaio: ex. --ele 6257 lê o 1º turno como se fosse o 2º
const ler = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const gravar = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); const tmp = f + '.tmp'; fs.writeFileSync(tmp, JSON.stringify(o)); fs.renameSync(tmp, f); };
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

// ---------- base do 1º turno ----------
async function montarBase(destino) {
  const U = urls(cfg, 1);
  const conf = await getJSON(U.cm());
  const lista = [];
  (function walk(n) {
    if (Array.isArray(n)) return n.forEach(walk);
    if (!n || typeof n !== 'object') return;
    if (n.cd && Array.isArray(n.mu)) { const uf = String(n.cd).toLowerCase(); for (const m of n.mu) lista.push({ uf, cd: String(m.cd).padStart(5, '0'), nome: m.nm, cdi: m.cdi || 0 }); return; }
    for (const k in n) walk(n[k]);
  })(conf);
  log('municípios na configuração:', lista.length);
  const rows = [];
  const res = await pool(lista, 10, async m => parseResultado(await getJSON(U.mun(m.uf, m.cd)), cfg));
  let falhas = 0;
  res.forEach((r, i) => { const m = lista[i]; if (r.erro) { falhas++; return; } rows.push([m.uf, m.cd, m.nome, m.cdi, r.ts, r.te, r.c, r.a, r.vb, r.tvn, r.L, r.F, r.vv, r.st]); });
  log('linhas', rows.length, 'falhas', falhas);
  if (falhas > 0) { // 2ª tentativa
    const faltam = lista.filter(m => !rows.some(r => r[0] === m.uf && r[1] === m.cd));
    const res2 = await pool(faltam, 4, async m => parseResultado(await getJSON(U.mun(m.uf, m.cd), { retries: 5 }), cfg));
    res2.forEach((r, i) => { const m = faltam[i]; if (!r.erro) rows.push([m.uf, m.cd, m.nome, m.cdi, r.ts, r.te, r.c, r.a, r.vb, r.tvn, r.L, r.F, r.vv, r.st]); });
  }
  gravar(destino, { turno: 1, eleicao: cfg.ele[1], gerado: new Date().toISOString(), ufs: UF_IDS.map(cd => ({ cd, ds: cd })), rows });
  log('base gravada em', destino, rows.length, 'linhas');
}

// ---------- apuração ----------
async function ciclo(out, B, estado) {
  const prev = estado.prev;
  const tIni = Date.now();
  const snap = await montarSnapshot({ cfg, prev, log, suprir: dosBoletins, conc: 40 });
  log(`leitura do TSE em ${Date.now() - tIni} ms`);
  log(`snapshot montado: st=${snap.br.st} hg=${snap.hg} avisos=${snap.diag.length}${snap.diag.length ? ' ' + snap.diag[0] : ''}`);
  // O arquivo do Brasil do TSE às vezes fica parado enquanto os de estado/município continuam sendo atualizados
  // (e o TSE reescreve arquivos mantendo a mesma hora). Por isso a mudança considera também estados e municípios.
  const assin = x => Object.entries(x.uf || {}).map(([k, v]) => `${k}${v.st}.${v.L}.${v.F}`).join(',') + '|' +
    Object.entries(x.mun || {}).map(([k, r]) => `${k}${r.length}.${r.reduce((a, m) => a + m[2] + m[9] + m[10], 0)}`).join(',');
  const mudouBr = !prev || snap.br.st !== prev.br.st || snap.hg !== prev.hg || snap.br.L !== prev.br.L;
  const mudou = mudouBr || assin(snap) !== assin(prev);
  log(`mudou=${mudou} (brasil=${mudouBr}) prev.st=${prev?.br?.st} prev.hg=${prev?.hg} snap.hg=${snap.hg}`);
  const meta = { checado: new Date().toISOString(), tse: cfg.base, turno: cfg.turno, ele: cfg.ele[cfg.turno], diag: snap.diag, ok: snap.br.ok !== false };
  if (!mudou) { gravar(path.join(out, 'meta.json'), { ...meta, ultimaMudanca: estado.ultima }); return false; }
  log('projetando…');
  const t0 = Date.now(); const P = projetar(B, snap);
  log('projeção ok');
  snap.proj = { pL: P.br.pL, pF: P.br.pF, band: P.br.band.pL, pw: P.br.pWinL };
  const h = estado.hist;
  const ht = String(snap.hg).slice(0, 5);
  if (mudouBr || !h.length) h.push({ t: new Date().toISOString(), dg: snap.dg, hg: snap.hg, ht, pst: 100 * snap.br.st / (snap.br.ts || 1), st: snap.br.st, ts: snap.br.ts, L: snap.br.L, F: snap.br.F, vv: snap.br.vv, c: snap.br.c, a: snap.br.a, vb: snap.br.vb, tvn: snap.br.tvn, te: snap.br.te, est: snap.br.est,
    pL: +P.br.pL.toFixed(3), lo: +P.br.band.pL[0].toFixed(3), hi: +P.br.band.pL[1].toFixed(3), pw: +P.br.pWinL.toFixed(3) });
  snap.gerado = new Date().toISOString();
  gravar(path.join(out, 'snap.json'), snap);
  gravar(path.join(out, 'hist.json'), h);
  estado.ultima = snap.gerado; estado.prev = snap;
  gravar(path.join(out, 'meta.json'), { ...meta, ultimaMudanca: estado.ultima });
  log(`TSE ${snap.hg} apurado ${(100 * snap.br.st / snap.br.ts).toFixed(2)}%  L=${snap.br.L} F=${snap.br.F}  proj L ${P.br.pL.toFixed(2)}% [${P.br.band.pL.map(x => x.toFixed(2))}]  (${Date.now() - t0} ms proj, ${snap.diag.length} avisos)`);
  return true;
}

const dest = arg('base', null);
if (dest) { await montarBase(dest); process.exit(0); }

const out = arg('out', 'data/live'); const loop = +arg('loop', 0), maxMin = +arg('max-min', 340);
const baseFile = arg('basefile', 'data/base_1t.json');
const B = prepBase(JSON.parse(fs.readFileSync(baseFile, 'utf8')));
const estado = { prev: ler(path.join(out, 'snap.json'), null), hist: ler(path.join(out, 'hist.json'), []), ultima: null };
const fim = Date.now() + maxMin * 60000;
let falhasSeguidas = 0;
do {
  try { await ciclo(out, B, estado); falhasSeguidas = 0; }
  catch (e) { falhasSeguidas++; log('erro no ciclo:', e.message); if (!loop) process.exitCode = 1; }
  if (!loop) break;
  const espera = Math.min(300, loop * (1 + falhasSeguidas)) * 1000;
  await new Promise(r => setTimeout(r, espera));
} while (Date.now() < fim);
