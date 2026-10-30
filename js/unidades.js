// Camada de dados compartilhada pelo comparador e pela IA: uma "unidade" é o Brasil, uma região, um estado, um município ou um bairro,
// sempre no mesmo formato (resultado do 2º turno + o 1º turno do mesmo recorte). Referências: br · reg:SE · uf:rj · mun:rj:60011 · bai:rj:60011:NOME
import { listaMunicipios } from './model.js?v=e3dbaa5b';
import { linhaAp } from './views.js?v=e3dbaa5b';
import { UF_IDS, UF_NOME, UF_REGIAO, REGIOES, sigla } from './util.js?v=e3dbaa5b';
import { estatico, aoVivo, agregar, bonito, setSemDelta, demoSecoes } from './bairros.js?v=e3dbaa5b';
import { sem } from './ui.js?v=e3dbaa5b';

export const MAX_COMPARAR = 4;

// ---------- métricas ----------
// pct: percentual · pp: pontos percentuais com sinal · int: contagem · votos: contagem com sinal
export const METRICAS = {
  pL: { rot: 'Lula (% dos válidos)', curto: 'Lula %', tipo: 'pct', cand: 'L' },
  pF: { rot: 'Flávio Bolsonaro (% dos válidos)', curto: 'Flávio %', tipo: 'pct', cand: 'F' },
  L: { rot: 'Votos de Lula', curto: 'Votos Lula', tipo: 'int', cand: 'L' },
  F: { rot: 'Votos de Flávio Bolsonaro', curto: 'Votos Flávio', tipo: 'int', cand: 'F' },
  margemPP: { rot: 'Vantagem de Lula sobre Flávio (p.p.)', curto: 'Margem (p.p.)', tipo: 'pp' },
  margem: { rot: 'Vantagem de Lula sobre Flávio (votos)', curto: 'Margem (votos)', tipo: 'votos' },
  pAb: { rot: 'Abstenção', curto: 'Abstenção', tipo: 'pct' },
  pBrNu: { rot: 'Brancos + nulos', curto: 'Brancos e nulos', tipo: 'pct' },
  dL: { rot: 'Variação de Lula vs 1º turno (p.p.)', curto: 'Δ Lula', tipo: 'pp', cand: 'L' },
  dF: { rot: 'Variação de Flávio vs 1º turno (p.p.)', curto: 'Δ Flávio', tipo: 'pp', cand: 'F' },
  p1L: { rot: 'Lula no 1º turno (%)', curto: 'Lula 1º t.', tipo: 'pct', cand: 'L' },
  p1F: { rot: 'Flávio no 1º turno (%)', curto: 'Flávio 1º t.', tipo: 'pct', cand: 'F' },
  vv: { rot: 'Votos válidos', curto: 'Votos válidos', tipo: 'int' },
  te: { rot: 'Eleitorado', curto: 'Eleitorado', tipo: 'int' },
};
const nf = d => new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const n0 = nf(0), n1 = nf(1), n2 = nf(2);
export function fmtMetrica(k, v) {
  const t = METRICAS[k]?.tipo; if (v == null || !isFinite(v)) return '–';
  if (t === 'pct') return n2.format(v) + '%';
  if (t === 'pp') return (v > 0 ? '+' : v < 0 ? '−' : '') + n1.format(Math.abs(v)) + ' p.p.';
  if (t === 'votos') return (v > 0 ? '+' : v < 0 ? '−' : '') + n0.format(Math.abs(Math.round(v)));
  return n0.format(Math.round(v));
}

// ---------- registro padrão ----------
const pc = (a, b) => (b > 0 ? 100 * a / b : NaN);
function padrao(ref, tipo, nome, rotulo, uf, x) {
  const L = x.L, F = x.F, vv = x.vv ?? (L + F), pL = x.pL, pF = x.pF;
  return {
    ref, tipo, nome, rotulo, uf, L, F, vv, pL, pF,
    margem: L - F, margemPP: pL - pF, lider: x.lider ?? (L === F ? null : L > F ? 'L' : 'F'),
    pAb: x.pAb, pBrNu: (x.pBr ?? NaN) + (x.pNu ?? NaN), dL: x.dL, dF: x.dF,
    vgL: x.vgL ?? (isFinite(x.L1) ? x.L - x.L1 : NaN), vgF: x.vgF ?? (isFinite(x.F1) ? x.F - x.F1 : NaN), p1L: pL - x.dL, p1F: pF - x.dF,
    te: x.te ?? x.est ?? x.ap, pst: x.pst, apurado: x.pst > 0 || x.pst === undefined,
  };
}
const rotMun = (m) => `${bonito(m.nome)} (${sigla(m.uf)})`;

// ---------- índice de busca ----------
export function indice(B) {
  if (B._indice) return B._indice;
  const out = [{ ref: 'br', tipo: 'br', nome: 'Brasil', rotulo: 'Brasil', chave: 'brasil' }];
  for (const r of Object.keys(REGIOES)) if (r !== 'EX') out.push({ ref: 'reg:' + r, tipo: 'reg', nome: REGIOES[r], rotulo: 'Região ' + REGIOES[r], chave: sem('regiao ' + REGIOES[r]) });
  for (const uf of UF_IDS) out.push({ ref: 'uf:' + uf, tipo: 'uf', uf, nome: UF_NOME[uf], rotulo: UF_NOME[uf] + (uf === 'zz' ? '' : ' (' + sigla(uf) + ')'), chave: sem(UF_NOME[uf] + ' ' + uf) });
  for (const m of B.muns) out.push({ ref: `mun:${m.uf}:${m.cd}`, tipo: 'mun', uf: m.uf, cd: m.cd, nome: bonito(m.nome), rotulo: rotMun(m), chave: sem(m.nome), te: m.te });
  return (B._indice = out);
}
export function buscar(B, texto, { tipo, uf, max = 8 } = {}) {
  const q = sem(String(texto || '').trim()), T = tipo ? [].concat(tipo) : null;
  if (!q) return T && !T.includes('mun') ? indice(B).filter(u => T.includes(u.tipo)).slice(0, max) : [];
  const pts = [];
  for (const u of indice(B)) {
    if (T && !T.includes(u.tipo)) continue; if (uf && u.uf !== uf && u.tipo === 'mun') continue;
    const i = u.chave.indexOf(q); if (i < 0) continue;
    pts.push([i === 0 ? 0 : (/\s/.test(u.chave[i - 1]) ? 1 : 2), u.tipo === 'mun' ? -(u.te || 0) : -1e12, u]);
  }
  pts.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return pts.slice(0, max).map(x => x[2]);
}
export const entradaPorRef = (B, ref) => indice(B).find(u => u.ref === ref) || null;

// ---------- obtenção dos resultados ----------
// ctx: { B, V, snap, demo } (V = calcular(B, snap))
const cacheBairros = new Map();
export async function bairrosDe(ctx, uf, cd) {
  const k = (ctx.demo ? 'd:' : '') + uf + cd;
  if (!cacheBairros.has(k)) cacheBairros.set(k, (async () => {
    setSemDelta(false);
    const est = await estatico(uf, cd);
    const live = ctx.demo ? demoSecoes(est, ctx.snap.mun?.[uf]?.find(x => x[0] === cd)) : await aoVivo(uf, cd);
    const ag = agregar(est, live, null);
    const m = ctx.B.byKey[uf + cd], mun = m ? rotMun(m) : cd;
    return ag.bairros.filter(b => b.st > 0).map(b => padrao(`bai:${uf}:${cd}:${encodeURIComponent(b.nome)}`, 'bai', bonito(b.nome), `${bonito(b.nome)} · ${mun}`, uf, { ...b, te: b.ap }));
  })().catch(e => { cacheBairros.delete(k); throw e; }));
  return cacheBairros.get(k);
}
export function municipiosDe(ctx, uf) {
  return listaMunicipios(ctx.B, ctx.V, uf).filter(m => m.apurado && (m.L + m.F) > 0).map(m => padrao(`mun:${uf}:${m.cd}`, 'mun', bonito(m.nome), `${bonito(m.nome)} (${sigla(uf)})`, uf, { ...linhaAp(m.cd, m), te: m.te }));
}
export function todosMunicipios(ctx) { return UF_IDS.flatMap(uf => municipiosDe(ctx, uf)); }
export function ufs(ctx) { return Object.values(ctx.V.uf).map(b => padrao('uf:' + b.id, 'uf', UF_NOME[b.id], UF_NOME[b.id] + (b.id === 'zz' ? '' : ' (' + sigla(b.id) + ')'), b.id, linhaAp(b.id, b))); }

export async function obter(ctx, ref) {
  const [t, a, b, ...r] = String(ref).split(':');
  if (ref === 'br') return padrao('br', 'br', 'Brasil', 'Brasil', null, linhaAp('BR', ctx.V.br));
  if (t === 'reg') { const bl = ctx.V.reg[a]; if (!bl) throw new Error('Região não encontrada'); return padrao(ref, 'reg', REGIOES[a], 'Região ' + REGIOES[a], null, linhaAp(a, bl)); }
  if (t === 'uf') { const bl = ctx.V.uf[a]; if (!bl) throw new Error('Estado não encontrado'); return padrao(ref, 'uf', UF_NOME[a], UF_NOME[a] + (a === 'zz' ? '' : ' (' + sigla(a) + ')'), a, linhaAp(a, bl)); }
  if (t === 'mun') { const x = municipiosDe(ctx, a).find(m => m.ref === ref); if (!x) throw new Error('Município sem resultado apurado'); return x; }
  if (t === 'bai') { const nome = decodeURIComponent(r.join(':')), x = (await bairrosDe(ctx, a, b)).find(y => y.ref === ref || y.nome === bonito(nome)); if (!x) throw new Error('Bairro sem resultado apurado'); return x; }
  throw new Error('Referência inválida');
}
export const regioesDe = ctx => Object.keys(REGIOES).filter(r => r !== 'EX' && ctx.V.reg[r]).map(r => padrao('reg:' + r, 'reg', REGIOES[r], 'Região ' + REGIOES[r], null, linhaAp(r, ctx.V.reg[r])));

// ---------- ranking genérico ----------
export function ordenar(lista, metrica, ordem = 'desc', limite = 10) {
  const k = METRICAS[metrica] ? metrica : 'pL', f = ordem === 'asc' ? 1 : -1;
  return lista.filter(x => isFinite(x[k])).sort((a, b) => f * (a[k] - b[k])).slice(0, limite);
}
export { UF_REGIAO, REGIOES, UF_NOME, sigla };
