#!/usr/bin/env node
// Coleta do resultado POR SEÇÃO (boletim de urna) das seções já totalizadas e grava, por município,
// out/bairros/{uf}/{cd5}.json = { t: 'hh:mm:ss', s: { 'zona-seção': [L, F, O, B, N] } }.
// O painel junta isso com data/bairros (locais de votação, bairro, 1º turno por seção).
// Uso: node scripts/secoes.mjs --out dados/live --ufs sp,rj [--pleito 3221 --ele 6258] [--loop 25 --max-min 340]
import fs from 'node:fs';
import path from 'node:path';
import { decodificarBU } from './bu.mjs';

const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const out = arg('out', 'data/live'), pleito = arg('pleito', '3221'), ele = +arg('ele', '6258'), tse = arg('tse', 'https://resultados.tse.jus.br/oficial/ele2026');
const ufs = (arg('ufs', '') || '').split(',').filter(Boolean);
const loop = +arg('loop', 0), maxMin = +arg('max-min', 340), conc = +arg('conc', 48), maxT = +arg('max-tarefas', 6000), somente = arg('mun', null);
const P6 = 'p' + String(pleito).padStart(6, '0'), log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);
const ler = (f, d) => { try { return JSON.parse(fs.readFileSync(f, 'utf8')); } catch { return d; } };
const gravar = (f, o) => { fs.mkdirSync(path.dirname(f), { recursive: true }); const t = f + '.tmp'; fs.writeFileSync(t, JSON.stringify(o)); fs.renameSync(t, f); };
const pad = (x, n) => String(x).padStart(n, '0');
const etagF = path.join(out, 'etags.json'); const etags = ler(etagF, {});

// ritmo global (requisições/s) e pausa coletiva quando o TSE responde 429
const rps = +arg('rps', 60); let proximo = 0, pausaAte = 0, n429 = 0;
async function vez() { const agora = Date.now(); proximo = Math.max(proximo, agora, pausaAte) + 1000 / rps; const espera = proximo - 1000 / rps - agora; if (espera > 0) await new Promise(r => setTimeout(r, espera)); }
async function get(url, { json = true, buf = false, retries = 5, inm } = {}) {
  for (let t = 0; t <= retries; t++) {
    try {
      await vez();
      const r = await fetch(url, { headers: inm ? { 'If-None-Match': inm } : {}, signal: AbortSignal.timeout(30000) });
      if (r.status === 304) return { naoMudou: true };
      if (r.status === 404) return { nada: true };
      if (r.status === 429 || r.status === 503) { n429++; const ra = +r.headers.get('retry-after') || 0; pausaAte = Math.max(pausaAte, Date.now() + Math.max(1500, ra * 1000) * (1 + t * 0.5)); throw new Error('HTTP ' + r.status); }
      if (!r.ok) throw new Error('HTTP ' + r.status);
      const et = r.headers.get('etag');
      return { dado: buf ? Buffer.from(await r.arrayBuffer()) : json ? await r.json() : await r.text(), etag: et };
    } catch (e) { if (t === retries) return { erro: String(e.message || e) }; await new Promise(r => setTimeout(r, 300 * (t + 1))); }
  }
}
async function pool(itens, n, fn) { let i = 0; const ws = Array.from({ length: Math.min(n, itens.length) }, async () => { while (i < itens.length) { const k = i++; await fn(itens[k], k); } }); await Promise.all(ws); }

const cache = new Map();   // cd5 -> {uf, t, s}
const falhas = new Map();  // url -> tentativas
function arq(uf, cd) { return path.join(out, 'bairros', uf, cd + '.json'); }
function carregar(uf, cd) { const k = uf + cd; if (!cache.has(k)) cache.set(k, { uf, cd, t: '', s: ler(arq(uf, cd), { s: {} }).s || {}, sujo: false }); return cache.get(k); }

async function ciclo(uf, ciclo_n) {
  const cfgUrl = `${tse}/arquivo-urna/${pleito}/config/${uf}/${uf}-${P6}-cs.json`;
  const r = await get(cfgUrl, { inm: etags[uf] });
  if (r.naoMudou) return { novas: 0, total: 0 };
  if (r.nada || r.erro) { log(uf, 'config indisponível', r.nada ? '404' : r.erro); return { novas: 0, total: 0 }; }
  etags[uf] = r.etag; gravar(etagF, etags);
  const tarefas = []; let total = 0;
  for (const abr of r.dado.abr || []) for (const mu of abr.mu || []) {
    if (somente && mu.cd !== somente) continue;
    const m = carregar(uf, mu.cd);
    for (const z of mu.zon || []) for (const s of z.sec || []) {
      total++; const k = +z.cd + '-' + +s.ns;
      if (m.s[k]) continue;
      const base = `${tse}/arquivo-urna/${pleito}/dados/${uf}/${mu.cd}/${z.cd}/${s.ns}/${P6}-${uf}-m${mu.cd}-z${z.cd}-s${s.ns}`;
      const nf = falhas.get(base) || 0; if (nf >= 3 && ciclo_n % 20 !== 0) continue;
      tarefas.push({ m, k, base, z: z.cd, ns: s.ns, mu: mu.cd });
    }
  }
  if (tarefas.length > maxT) tarefas.length = maxT;
  let novas = 0, erros = 0;
  await pool(tarefas, conc, async tk => {
    const aux = await get(tk.base + '-aux.json');
    if (!aux.dado) { falhas.set(tk.base, (falhas.get(tk.base) || 0) + 1); if (aux.erro) erros++; return; }
    const hs = (aux.dado.hashes || []).filter(h => (h.arq || []).some(a => a.tp === 'bu'));
    const h = hs[hs.length - 1]; if (!h) { falhas.set(tk.base, (falhas.get(tk.base) || 0) + 1); return; }
    const nm = h.arq.find(a => a.tp === 'bu').nm;
    const bu = await get(`${tse}/arquivo-urna/${pleito}/dados/${uf}/${tk.mu}/${tk.z}/${tk.ns}/${h.hash}/${nm}`, { buf: true });
    if (!bu.dado) { falhas.set(tk.base, (falhas.get(tk.base) || 0) + 1); if (bu.erro) erros++; return; }
    let d = null; try { d = decodificarBU(bu.dado, ele); } catch { /* arquivo fora do padrão */ }
    if (!d) { falhas.set(tk.base, (falhas.get(tk.base) || 0) + 1); return; }
    tk.m.s[tk.k] = [d.L, d.F, d.O, d.B, d.N, d.aptos]; tk.m.sujo = true; novas++;
  });
  const hora = new Date(Date.now() - 3 * 3600e3).toISOString().slice(11, 19);
  for (const m of cache.values()) if (m.uf === uf && m.sujo) { gravar(arq(uf, m.cd), { t: hora, s: m.s }); m.sujo = false; }
  return { novas, total, erros, pend: tarefas.length };
}

const ini = Date.now(); let n = 0;
do {
  const t0 = Date.now();
  for (const uf of ufs) { const r = await ciclo(uf, n); if (r.novas || r.erros) log(uf, `novas ${r.novas}/${r.pend ?? 0} (cfg ${r.total}) erros ${r.erros} 429:${n429}`); }
  n++;
  const resto = loop * 1000 - (Date.now() - t0); if (loop && resto > 0) await new Promise(r => setTimeout(r, resto));
} while (loop && Date.now() - ini < maxMin * 60000);
