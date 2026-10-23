#!/usr/bin/env node
// Servidor que imita a árvore de arquivos do TSE com apuração SIMULADA (para testar coletor e painel).
// Uso: node scripts/mock_tse.mjs [--port 8787] [--auto 120] [--seed 7]   (--auto N = apuração completa em N segundos)
//      GET /__mock/t?set=0.4  fixa o instante (0 a ~1.05)
import http from 'node:http';
import { simular } from '../js/sim.js';
import { UF_IDS } from '../js/util.js';
const arg = (k, d) => { const i = process.argv.indexOf('--' + k); return i > 0 ? process.argv[i + 1] : d; };
const port = +arg('port', 8787), auto = +arg('auto', 0), seed = +arg('seed', 7);
const sim = simular({ seed });
let t = 0.0, t0 = Date.now(); let fixo = null;
const agora = () => fixo ?? (auto ? Math.min(1.06, (Date.now() - t0) / 1000 / auto * 1.06) : t);
const cache = new Map();
const snapEm = tt => { const k = tt.toFixed(3); if (!cache.has(k)) { cache.clear(); cache.set(k, sim.snapshot(tt)); } return cache.get(k); };
const s = x => String(x), p = (a, b) => (b ? (100 * a / b).toFixed(2).replace('.', ',') : '0,00');

function resultado(o, tt) {
  const vv = o.L + o.F;
  return { dg: '25/10/2026', hg: hora(tt), tf: 's', carg: [{ cd: '1', nm: 'PRESIDENTE', agr: [{ cand: [
    { n: '13', nmu: 'CANDIDATO A (SIMULADO)', vap: s(o.L), pvap: p(o.L, vv), st: o.eL ? 'Eleito' : '2º turno', e: o.eL ? 's' : 'n' },
    { n: '22', nmu: 'CANDIDATO B (SIMULADO)', vap: s(o.F), pvap: p(o.F, vv), st: o.eF ? 'Eleito' : '2º turno', e: o.eF ? 's' : 'n' }] }] }],
    s: { ts: s(o.ts), st: s(o.st), pst: p(o.st, o.ts) }, e: { te: s(o.te), est: s(o.est), c: s(o.c), a: s(o.a), pc: p(o.c, o.est), pa: p(o.a, o.est) },
    v: { tv: s(o.c), vv: s(o.L + o.F), vb: s(o.vb), tvn: s(o.tvn), vn: s(o.tvn), vnt: '0', pvb: p(o.vb, o.c), ptvn: p(o.tvn, o.c) } };
}
import { hora } from '../js/sim.js';
const ab = (snap, uf) => { // acompanhamento
  const linhas = [];
  const base = new Map(sim.muns.filter(m => m.uf === uf).map(m => [m.cd, m]));
  const rows = new Map((snap.mun[uf] || []).map(r => [r[0], r]));
  for (const [cd, m] of base) { const r = rows.get(cd); linhas.push({ cdabr: cd, tpabr: 'mu', ht: hora(agora()), s: { ts: s(m.ts), st: s(r ? r[2] : 0), pst: p(r ? r[2] : 0, m.ts) }, e: { te: s(m.te), est: s(r ? r[4] : 0), c: s(r ? r[5] : 0) } }); }
  const u = snap.uf[uf]; linhas.push({ cdabr: uf, tpabr: 'uf', ht: hora(agora()), s: { ts: s(u.ts), st: s(u.st), pst: p(u.st, u.ts) }, e: { te: s(u.te), est: s(u.est), c: s(u.c) } });
  return { abr: linhas };
};

http.createServer((req, res) => {
  const u = new URL(req.url, 'http://x'); const path = u.pathname;
  res.setHeader('Access-Control-Allow-Origin', '*'); res.setHeader('Content-Type', 'application/json');
  const send = (o, c = 200) => { res.statusCode = c; res.end(JSON.stringify(o)); };
  if (path === '/__mock/t') { if (u.searchParams.has('set')) fixo = +u.searchParams.get('set'); return send({ t: agora() }); }
  const tt = agora(), snap = snapEm(tt); let m;
  if ((m = path.match(/\/dados\/br\/br-c0001-e006258-u\.json$/))) return send(resultado({ ...snap.br }, tt));
  if ((m = path.match(/\/dados\/br\/br-e006258-ab\.json$/))) return send({ abr: [] });
  if ((m = path.match(/\/dados\/([a-z]{2})\/\1-e006258-ab\.json$/))) return snap.uf[m[1]] ? send(ab(snap, m[1])) : send({}, 404);
  if ((m = path.match(/\/dados\/([a-z]{2})\/\1-c0001-e006258-u\.json$/))) return snap.uf[m[1]] ? send(resultado(snap.uf[m[1]], tt)) : send({}, 404);
  if ((m = path.match(/\/dados\/([a-z]{2})\/\1(\d{5})-c0001-e006258-u\.json$/))) {
    const r = (snap.mun[m[1]] || []).find(x => x[0] === m[2]); const mm = sim.muns.find(x => x.uf === m[1] && x.cd === m[2]);
    if (!mm) return send({}, 404);
    const o = r ? { ts: r[1], st: r[2], te: r[3], est: r[4], c: r[5], a: r[6], vb: r[7], tvn: r[8], L: r[9], F: r[10] } : { ts: mm.ts, st: 0, te: mm.te, est: 0, c: 0, a: 0, vb: 0, tvn: 0, L: 0, F: 0 };
    return send(resultado(o, tt));
  }
  send({ erro: 'não encontrado', path }, 404);
}).listen(port, () => console.log(`mock TSE em http://localhost:${port}  (auto=${auto}s seed=${seed})`));
