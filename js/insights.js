// Leitura automática dos dados: frases geradas por regras estatísticas simples (sem IA ao vivo), exibidas num balão.
import { fNum, fInt } from './util.js?v=d08a3f4d';
import { esc, entenda } from './ui.js?v=d08a3f4d';

export function pearson(xs, ys) {
  const n = xs.length; if (n < 8) return NaN;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx && syy ? sxy / Math.sqrt(sxx * syy) : NaN;
}
const forca = r => Math.abs(r) >= .6 ? 'forte' : Math.abs(r) >= .4 ? 'moderada' : 'fraca';
const rFmt = r => fNum(r, 2);

// unidades: [{ nome, te, vv, pAb, p (% do candidato em foco), top: [i1, i2], p2: [%1, %2] }]
export function leitura(unidades, { cand, total, plural = 'municípios', artigo = 'do estado', minGrande = 10000 }) {
  const us = unidades.filter(u => u.vv > 0 && isFinite(u.p));
  if (us.length < 5) return [];
  const out = [], N = cand;
  // 1) concentração dos maiores
  const porTam = us.slice().sort((a, b) => b.vv - a.vv), k = Math.min(5, Math.floor(us.length / 4) || 1), top = porTam.slice(0, k), resto = porTam.slice(k);
  const vvTop = top.reduce((s, u) => s + u.vv, 0), vvAll = us.reduce((s, u) => s + u.vv, 0), vvRest = vvAll - vvTop;
  const pTop = top.reduce((s, u) => s + u.p * u.vv, 0) / vvTop, pRest = vvRest ? resto.reduce((s, u) => s + u.p * u.vv, 0) / vvRest : NaN;
  if (isFinite(pRest)) out.push({ pri: 3, txt: `Os ${k} maiores ${plural} (${top.map(u => esc(u.nome)).join(', ')}) concentram <b>${fNum(100 * vvTop / vvAll, 0)}%</b> dos votos válidos ${artigo}. Neles, ${esc(N)} tem <b>${fNum(pTop, 1)}%</b>, contra <b>${fNum(pRest, 1)}%</b> no restante${Math.abs(pTop - pRest) >= 4 ? ` — uma diferença de ${fNum(Math.abs(pTop - pRest), 1)} pontos percentuais` : ''}.` });
  // 2) tamanho × votação
  const g = us.filter(u => u.te >= 2000);
  const r1 = pearson(g.map(u => Math.log(u.te)), g.map(u => u.p));
  if (isFinite(r1) && Math.abs(r1) >= .25) out.push({ pri: 2 + Math.abs(r1), txt: `Quanto <b>maior</b> o município, <b>${r1 > 0 ? 'maior' : 'menor'}</b> tende a ser a votação de ${esc(N)} (relação ${forca(r1)}, r = ${rFmt(r1)}).` });
  // 3) abstenção × votação
  const ga = us.filter(u => isFinite(u.pAb) && u.te >= 2000);
  const r2 = pearson(ga.map(u => u.pAb), ga.map(u => u.p));
  if (isFinite(r2) && Math.abs(r2) >= .25) out.push({ pri: 2 + Math.abs(r2), txt: `Onde a abstenção é <b>maior</b>, ${esc(N)} tende a ir <b>${r2 > 0 ? 'melhor' : 'pior'}</b> (relação ${forca(r2)}, r = ${rFmt(r2)}).` });
  // 4) melhor e pior entre os grandes
  const gr = us.filter(u => u.te >= minGrande * .5);
  if (gr.length >= 4) { const o = gr.slice().sort((a, b) => b.p - a.p), a = o[0], b = o[o.length - 1]; out.push({ pri: 2, txt: `Entre ${plural} com mais de ${fInt(minGrande / 2)} eleitores, o melhor desempenho de ${esc(N)} é em <b>${esc(a.nome)}</b> (${fNum(a.p, 1)}%) e o pior em <b>${esc(b.nome)}</b> (${fNum(b.p, 1)}%).` }); }
  // 5) maior abstenção entre os grandes
  const gb = us.filter(u => u.te >= minGrande && isFinite(u.pAb));
  if (gb.length >= 3) { const a = gb.slice().sort((x, y) => y.pAb - x.pAb)[0]; const mAb = us.reduce((s, u) => s + (u.pAb || 0) * u.te, 0) / us.reduce((s, u) => s + u.te, 0); out.push({ pri: 1.5, txt: `Maior abstenção entre ${plural} com mais de ${fInt(minGrande)} eleitores: <b>${esc(a.nome)}</b> (${fNum(a.pAb, 1)}%), contra ${fNum(mAb, 1)}% na média ${artigo}.` }); }
  // 6) disputa mais apertada entre os grandes
  const gd = us.filter(u => u.te >= minGrande * 2 && u.p2);
  if (gd.length >= 3) { const a = gd.slice().sort((x, y) => (x.p2[0] - x.p2[1]) - (y.p2[0] - y.p2[1]))[0]; out.push({ pri: 1.2, txt: `Disputa mais apertada entre os maiores: <b>${esc(a.nome)}</b>, com apenas <b>${fNum(a.p2[0] - a.p2[1], 1)} p.p.</b> entre o 1º e o 2º colocados.` }); }
  return out.sort((a, b) => b.pri - a.pri).slice(0, 4);
}

// balão de análise (formato de balão de diálogo do logo)
export function balao(frases, { titulo = 'Leitura rápida' } = {}) {
  if (!frases.length) return '';
  return `<aside class="balao" aria-label="${esc(titulo)}"><img class="balao-ic" src="img/icone.svg" alt="" width="46" height="46"><div class="balao-c"><div class="balao-t">${esc(titulo)}<span>análise automática dos números desta tela</span></div><ul>${frases.map(f => `<li>${f.txt}</li>`).join('')}</ul>${entenda('Estas frases são geradas por <b>regras estatísticas</b> aplicadas aos números da tela (concentração dos maiores, correlações simples, extremos). Não são opinião, previsão nem análise de causa: “r” é o coeficiente de correlação (de −1 a +1) e só mostra se duas coisas variam juntas. Municípios com poucos eleitores são ignorados nas comparações de extremos.', 'Como é feita')}</div></aside>`;
}
