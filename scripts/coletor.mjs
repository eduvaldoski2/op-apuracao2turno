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
  const snap = await montarSnapshot({ cfg, prev, log });
  log(`snapshot montado: st=${snap.br.st} hg=${snap.hg} avisos=${snap.diag.length}${snap.diag.length ? ' ' + snap.diag[0] : ''}`);
  const mudou = !prev || snap.br.st !== prev.br.st || snap.hg !== prev.hg || snap.br.L !== prev.br.L;
  const meta = { checado: new Date().toISOString(), tse: cfg.base, turno: cfg.turno, ele: cfg.ele[cfg.turno], diag: snap.diag, ok: snap.br.ok !== false };
  if (!mudou) { gravar(path.join(out, 'meta.json'), { ...meta, ultimaMudanca: estado.ultima }); return false; }
  const t0 = Date.now(); const P = projetar(B, snap);
  snap.proj = { pL: P.br.pL, pF: P.br.pF, band: P.br.band.pL, pw: P.br.pWinL };
  const h = estado.hist;
  const ht = String(snap.hg).slice(0, 5);
  h.push({ t: new Date().toISOString(), dg: snap.dg, hg: snap.hg, ht, pst: 100 * snap.br.st / (snap.br.ts || 1), st: snap.br.st, ts: snap.br.ts, L: snap.br.L, F: snap.br.F, vv: snap.br.vv, c: snap.br.c, a: snap.br.a, vb: snap.br.vb, tvn: snap.br.tvn, te: snap.br.te, est: snap.br.est,
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
