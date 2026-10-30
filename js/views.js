// Telas do painel (Apuração, Projeção, ranking por candidato, UF com municípios, método).
import { CAND, UF_NOME, REGIOES, UF_REGIAO, UF_IDS, fInt, fPct, fNum, fCompact, fDelta, sigla, corDoPct, corTexto, clamp, mix } from './util.js?v=0372e8a8';
import { listaMunicipios, rankingUfs } from './model.js?v=0372e8a8';
import { projetarMunicipios } from './proj.js?v=0372e8a8';
import { esc, dlt, grw, pcel, vcel, entenda, tabela, sem } from './ui.js?v=0372e8a8';
import { graficoPlacar } from './charts.js?v=0372e8a8';
import { criarMapa, legendaMapa } from './map.js?v=0372e8a8';
import { criarMapaMun } from './mapamun.js?v=0372e8a8';
import { getJSON } from './tse.js?v=0372e8a8';
import { govPainel, govResumo } from './governador.js?v=0372e8a8';
import { secaoRegioesUf, montarRegioesUf } from './regioes_uf.js?v=0372e8a8';

const KS = ['L', 'F'];
const pc = (a, b) => (b ? 100 * a / b : NaN);
export const ref1 = t => ({ pL: pc(t.L, t.vv), pF: pc(t.F, t.vv), pAb: pc(t.a, t.te), pBr: pc(t.vb, t.c), pNu: pc(t.tvn, t.c), pCo: pc(t.c, t.te), ali: pc(t.a + t.vb + t.tvn, t.te) });

// ---- linhas normalizadas (nível UF / região / Brasil) ----
export function linhaAp(id, b) {
  return { id, nome: id === 'BR' ? 'Brasil' : (UF_NOME[id] || REGIOES[id] || id), pst: b.pst, st: b.st, ts: b.ts, L: b.L, F: b.F, pL: b.pL, pF: b.pF, dL: b.d.L, dF: b.d.F, gL: b.g.L, gF: b.g.F, vgL: b.L - (b.refAbs?.L ?? NaN), vgF: b.F - (b.refAbs?.F ?? NaN),
    pAb: b.pAb, dAb: b.d.Ab, pBr: b.pBr, dBr: b.d.Br, pNu: b.pNu, dNu: b.d.Nu, ali: b.ali, dAli: b.d.ali, pCo: b.pCo, dCo: b.d.Co, lider: b.lider, est: b.est, te: b.te, a: b.a, vb: b.vb, tvn: b.tvn, c: b.c, vv: b.vv };
}
export function linhaPr(id, p, B, snap) {
  const t = id === 'BR' ? B.br : B.ufTot[id], r = ref1(t);
  return { id, nome: id === 'BR' ? 'Brasil' : (UF_NOME[id] || id), pst: p.pst, L: p.L, F: p.F, pL: p.pL, pF: p.pF, dL: p.pL - r.pL, dF: p.pF - r.pF, gL: 100 * (p.L / t.L - 1), gF: 100 * (p.F / t.F - 1), vgL: p.L - t.L, vgF: p.F - t.F,
    pAb: p.pAb, dAb: p.pAb - r.pAb, pBr: p.pBr, dBr: p.pBr - r.pBr, pNu: p.pNu, dNu: p.pNu - r.pNu, ali: p.ali, dAli: p.ali - r.ali, pCo: p.pCo, dCo: p.pCo - r.pCo, lider: p.L > p.F ? 'L' : 'F',
    band: p.band, pw: p.pWinL, pend: p.pendEleit, te: p.te, a: p.a, vb: p.vb, tvn: p.tvn, c: p.c, vv: p.L + p.F };
}

export const cabCand = k => `<span class="cab-c" style="--c:${CAND[k].cor}">${CAND[k].nome.split(' ')[0]}</span>`;
export const barraDupla = (pL, pF) => `<div class="barra2" role="img" aria-label="${CAND.L.nome} ${fNum(pL, 2)}% e ${CAND.F.nome} ${fNum(pF, 2)}%"><i style="width:${clamp(pL, 0, 100)}%;background:${CAND.L.cor}"></i><i style="width:${clamp(pF, 0, 100)}%;background:${CAND.F.cor}"></i><b></b></div>`;

// ---------- cartões ----------
export function cartaoCand(k, r, { modo, conf, projecao, semLink }) {
  const c = CAND[k], p = k === 'L' ? r.pL : r.pF, d = k === 'L' ? r.dL : r.dF, v = r[k];
  let selo = '';
  if (modo === 'ap') selo = conf ? `<span class="selo ok">ELEITO · confirmado pelo TSE</span>` : (r.lider === k && r.pst > 0 ? (r.pst >= 99.995 ? `<span class="selo parcial">Vence · 100% apurado</span>` : `<span class="selo parcial">Lidera na parcial</span>`) : '');
  else selo = r.lider === k ? `<span class="selo proj">Projeção: à frente</span>` : '';
  const faixa = modo === 'pr' && r.band ? `<div class="faixa">faixa de 90%: ${fNum(k === 'L' ? r.band.pL[0] : r.band.pF[0], 2)}% a ${fNum(k === 'L' ? r.band.pL[1] : r.band.pF[1], 2)}%</div>` : '';
  const tag = semLink ? 'div' : 'a';
  return `<${tag} class="cand" ${semLink ? '' : `href="#/${modo === 'pr' ? 'p/' : ''}cand/${k}" title="Abrir os resultados de ${c.nome}"`} style="--c:${c.cor}">
    <div class="cand-topo"><span class="cand-num">${c.n}</span><div><div class="cand-nome">${c.nome}</div><div class="cand-part">${c.partido}</div></div>${selo}</div>
    <div class="cand-pct">${fNum(p, 2)}%${dlt(d, 2)}</div>
    <div class="cand-votos"><b>${fInt(v)}</b> votos${modo === 'pr' ? ' (projetados)' : ''}</div>${faixa}
  </${tag}>`;
}
export function kpi(titulo, valor, delta, sub, { dica, cls = '' } = {}) {
  return `<div class="kpi ${cls}" ${dica ? `title="${esc(dica)}"` : ''}><div class="kpi-t">${titulo}</div><div class="kpi-v">${valor}${delta != null ? ' ' + delta : ''}</div><div class="kpi-s">${sub || ''}</div></div>`;
}


// ---------- mapa de variação (swing): quanto cada lugar mudou em relação ao 1º turno ----------
// modoMapa: 'venc' (Geral: quem lidera) | 'L' (variação de Lula) | 'F' (variação de Flávio)
let modoMapa = 'venc';
const SW = { L: ['#f9d5d3', '#c8102e'], F: ['#cfdcf3', '#1d4ea8'], N: '#f1eef6' };
const corSwing = (v, mx, k = 'L') => { if (!isFinite(v)) return '#e4e1ea'; const o = k === 'L' ? 'F' : 'L', [c, f] = SW[v >= 0 ? k : o], t = Math.min(1, Math.abs(v) / mx); return t < .5 ? mix(SW.N, c, t * 2) : mix(c, f, (t - .5) * 2); };
const sinal = v => (v > 0.049 ? '+' : v < -0.049 ? '−' : '') + fNum(Math.abs(v), 1);
const escalaSwing = vals => { const a = vals.filter(isFinite).map(Math.abs).sort((x, y) => x - y); return a.length ? clamp(Math.ceil(a[Math.floor(.9 * (a.length - 1))]), 2, 12) : 4; };
// itens: [[id, linha]] (linha com L, F, pL, pF, dL, dF) -> dados no formato dos mapas (fill/lab personalizados)
function swingMapa(itens, mx, k) {
  const d = {};
  for (const [id, r] of itens) { const v = r['d' + k]; d[id] = isFinite(v) && r.L + r.F > 0 ? { k, fill: corSwing(v, mx, k), solo: true, pw: v, lab: sinal(v), pL: r.pL, pF: r.pF, dL: r.dL, dF: r.dF } : { k: null }; }
  return d;
}
function legendaSwing(mx, k) {
  const o = k === 'L' ? 'F' : 'L', g = `linear-gradient(90deg,${SW[o][1]},${SW[o][0]},${SW.N},${SW[k][0]},${SW[k][1]})`;
  return `<div class="leg-mapa leg-sw"><div class="sw-bar" style="background:${g}"></div><div class="sw-esc"><span>${CAND[o].nome.split(' ')[0]} +${mx} p.p.</span><span>0</span><span>${CAND[k].nome.split(' ')[0]} +${mx} p.p.</span></div><span><i style="background:#e4e1ea"></i>sem apuração</span>${entenda(`Cada área mostra <b>quantos pontos percentuais</b> a votação de ${CAND[k].nome} (% dos votos válidos) <b>subiu ou caiu</b> em relação ao 1º turno. Na cor de ${CAND[k].nome.split(' ')[0]}: ganhou terreno; na cor do adversário: perdeu. Como a apuração chega por partes, a comparação usa o 1º turno <b>nas mesmas urnas já apuradas</b>. A escala vai até ±${mx} p.p.; valores maiores ficam na cor máxima.`)}</div>`;
}
export const seletorMapa = () => `<div class="mapa-modo sem-export" role="group" aria-label="O que o mapa mostra">${[['venc', 'Geral', 'Quem lidera em cada área'], ['L', 'Lula', 'Variação da votação de Lula em relação ao 1º turno'], ['F', 'Flávio', 'Variação da votação de Flávio Bolsonaro em relação ao 1º turno']].map(([m, t, d]) => `<button data-mm="${m}" title="${d}" class="${modoMapa === m ? 'on' : ''}">${t}</button>`).join('')}</div>`;
// ---- legenda e tabela que só aparecem na IMAGEM exportada (na tela ficam ocultas): dizem de qual candidato é o mapa,
// o que ele mede e trazem os maiores destaques. Alimenta-se das mesmas linhas (itens) que pintam o mapa.
const nomeUn = (r, opt) => { const n = opt.nome ? opt.nome(r.nome) : r.nome; return esc(n) + (opt.uf && r.uf ? ` <small>${esc(sigla(r.uf))}</small>` : ''); };
function infoExport(s, modo) {
  const opt = s.opt, [um, mais] = opt.un, itens = s.itens.filter(([, r]) => r && r.L + r.F > 0);
  if (itens.length < 2) return '';
  const vv = r => r.L + r.F;
  let el = itens;
  if (itens.length > 40) { const o = itens.map(([, r]) => vv(r)).sort((x, y) => y - x), cut = o[Math.floor(o.length * .2)]; el = itens.filter(([, r]) => vv(r) >= cut); }
  const filtro = el.length < itens.length ? `Entre os 20% de ${mais} com mais votos válidos.` : '';
  const lin = (r, v, pct, k) => `<div class="ei-l"><span class="ei-n">${nomeUn(r, opt)}</span><span class="ei-p">${fNum(pct, 1)}%</span><b style="color:${CAND[k].cor}">${v}</b></div>`;
  const bloco = (tit, linhas) => linhas.length ? `<div class="ei-b"><div class="ei-t">${tit}</div>${linhas.join('')}</div>` : '';
  let cap, resumo, blocos;
  if (modo === 'venc') {
    const nL = itens.filter(([, r]) => r.L >= r.F).length, nF = itens.length - nL;
    cap = `<b>Mapa geral:</b> cada ${um} na cor de quem lidera; tom mais escuro = maior percentual dos votos válidos.`;
    resumo = `<span style="color:${CAND.L.cor}"><b>${fInt(nL)}</b> com Lula na frente</span> · <span style="color:${CAND.F.cor}"><b>${fInt(nF)}</b> com Flávio na frente</span>`;
    const marg = r => r.pL - r.pF, topo = k => el.filter(([, r]) => (k === 'L' ? marg(r) > 0 : marg(r) < 0)).sort((a, b) => k === 'L' ? marg(b[1]) - marg(a[1]) : marg(a[1]) - marg(b[1])).slice(0, 5)
      .map(([, r]) => lin(r, `+${fNum(Math.abs(marg(r)), 1)} p.p.`, k === 'L' ? r.pL : r.pF, k));
    blocos = bloco('Maior vantagem de Lula', topo('L')) + bloco('Maior vantagem de Flávio', topo('F'));
  } else {
    const k = modo, o = k === 'L' ? 'F' : 'L', c = CAND[k], d = r => r['d' + k], p = r => r['p' + k];
    const v = itens.filter(([, r]) => isFinite(d(r))), sobe = v.filter(([, r]) => d(r) > 0).length, cai = v.filter(([, r]) => d(r) < 0).length;
    cap = `<b>Mapa de ${esc(c.nome)}:</b> quanto a votação dele (% dos votos válidos) subiu ou caiu em cada ${um} em relação ao 1º turno, em pontos percentuais. Cor de ${esc(c.nome.split(' ')[0])} = ganhou; cor do adversário = perdeu.`;
    resumo = `${esc(c.nome.split(' ')[0])} <b style="color:${c.cor}">subiu em ${fInt(sobe)}</b> de ${fInt(v.length)} ${mais} · <b style="color:${CAND[o].cor}">caiu em ${fInt(cai)}</b>`;
    const ord = el.filter(([, r]) => isFinite(d(r)));
    const altas = ord.slice().sort((a, b) => d(b[1]) - d(a[1])).filter(([, r]) => d(r) > 0).slice(0, 5).map(([, r]) => lin(r, '+' + fNum(d(r), 1) + ' p.p.', p(r), k));
    const quedas = ord.slice().sort((a, b) => d(a[1]) - d(b[1])).filter(([, r]) => d(r) < 0).slice(0, 5).map(([, r]) => lin(r, '−' + fNum(Math.abs(d(r)), 1) + ' p.p.', p(r), o));
    blocos = bloco('Maiores altas', altas) + bloco('Maiores quedas', quedas);
  }
  return `<div class="ei-top"><p class="ei-cap">${cap}</p><p class="ei-res">${resumo}</p></div><div class="ei-bs">${blocos}</div>${filtro ? `<p class="ei-nt">${filtro}</p>` : ''}`;
}
const TIT = { venc: 'Quem lidera', L: 'Lula: variação vs 1º turno', F: 'Flávio: variação vs 1º turno' };
// liga o seletor (dentro de "escopo") ao mapa: dm = dados "quem lidera", itens = [[id, linha]] para as variações.
// opt: { leg, un: [singular, plural], nome, uf }. O clique é delegado ao escopo, então pode ser chamado de novo a cada
// atualização dos dados sem duplicar ouvintes.
function aplicaModoMapa(escopo) {
  const s = escopo._mm; if (!s) return;
  s.mp.atualizar(modoMapa === 'venc' ? s.dm : s.dsw[modoMapa]);
  const slot = escopo.querySelector('.leg-slot'); if (slot) slot.innerHTML = modoMapa === 'venc' ? (s.opt.leg ? s.opt.leg() : legendaMapa()) : legendaSwing(s.mx, modoMapa);
  escopo.querySelectorAll('[data-mm]').forEach(b => b.classList.toggle('on', b.dataset.mm === modoMapa));
  // título e quadro de destaques da imagem exportada
  const sec = escopo.closest('.painel'); if (sec) { sec.dataset.exportTitulo = `${TIT[modoMapa]} · ${s.opt.un[1]}`; }
  const lado = escopo.querySelector('.mapa-lado');
  if (lado) { let ex = lado.querySelector(':scope > .exp-info'); if (!ex) { ex = document.createElement('div'); ex.className = 'exp-info so-export'; lado.appendChild(ex); } ex.innerHTML = infoExport(s, modoMapa); }
}
export function ligaModoMapa(escopo, mp, dm, itens, opt = {}) {
  const mx = escalaSwing(itens.flatMap(([, r]) => [r.dL, r.dF]));
  opt = { un: ['área', 'áreas'], ...opt };
  escopo._mm = { mp, dm, mx, opt, itens, dsw: { L: swingMapa(itens, mx, 'L'), F: swingMapa(itens, mx, 'F') } };
  if (!escopo._mmL) { escopo._mmL = true; escopo.addEventListener('click', ev => { const b = ev.target.closest('[data-mm]'); if (!b || !escopo.contains(b)) return; modoMapa = b.dataset.mm; aplicaModoMapa(escopo); }); }
  aplicaModoMapa(escopo);
}

// ---------- abas do quadro do mapa: por estado | por municípios (Brasil inteiro, cor = quem lidera) ----------
let abaMapa = 'uf', geoBR = null, bmTexto = '', bmFoco = false;   // lembram a busca quando o painel é redesenhado por nova parcial
const bonitoM = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());
function abasMapa(root, ctx, ap) {
  const bt = root.querySelectorAll('[data-am]'), pUf = root.querySelector('#am-uf'), pMun = root.querySelector('#am-mun'), h2 = root.querySelector('#am-h2'), sub = root.querySelector('#am-sub');
  if (!pUf || !pMun) return;
  const T = {
    uf: [ap ? 'Resultado por estado' : 'Projeção por estado', `Clique em um estado para ver os municípios${ap ? '' : ' (resultado projetado)'}.`],
    mun: [ap ? 'Resultado por municípios' : 'Projeção por municípios', 'Cada município na cor de quem está na frente. Busque pelo nome ou clique no mapa para abrir a página do município.'],
  };
  let montado = false;
  const mostrar = a => {
    abaMapa = a; pUf.hidden = a !== 'uf'; pMun.hidden = a !== 'mun';
    bt.forEach(b => { const on = b.dataset.am === a; b.classList.toggle('on', on); b.setAttribute('aria-selected', on); });
    h2.textContent = T[a][0]; sub.textContent = T[a][1];
    if (a === 'mun' && !montado) { montado = true; try { montarMunBR(root, ctx, ap); } catch (e) { root.querySelector('#mapa-bm').innerHTML = '<p class="aviso">Mapa dos municípios indisponível no momento.</p>'; } }
  };
  bt.forEach(b => b.addEventListener('click', () => mostrar(b.dataset.am)));
  mostrar(abaMapa);
}
function montarMunBR(root, ctx, ap) {
  const { B, V, P, snap } = ctx, rota = (uf, cd) => `#/${ap ? '' : 'p/'}mun/${uf}/${cd}`;
  const idx = [], dm = {}, porCdi = {}; let nL = 0, nF = 0, nA = 0;
  for (const uf of UF_IDS) {
    if (uf === 'zz') continue;
    const lista = B.byUf[uf] || []; if (!lista.length) continue;
    const cdi = new Map(lista.map(b => [b.cd, String(b.cdi)]));
    for (const b of lista) idx.push({ n: bonitoM(b.nome), s: sem(b.nome), uf, cd: b.cd });
    if (ap ? !V.uf[uf] : !P.uf[uf]) { nA += lista.length; continue; }
    for (const m of (ap ? listaMunicipios(B, V, uf) : projetarMunicipios(B, snap, P, uf))) {
      const id = cdi.get(m.cd); if (!id) continue;
      const ok = (ap ? m.apurado : true) && m.L + m.F > 0;
      const dL = ap ? m.d?.L : m.pL - m.p1L, dF = ap ? m.d?.F : m.pF - m.p1F;
      porCdi[id] = { uf, cd: m.cd, nome: bonitoM(m.nome), ok, pst: m.pst, L: m.L, F: m.F, pL: m.pL, pF: m.pF, dL, dF };
      if (ok) { const k = m.L >= m.F ? 'L' : 'F'; dm[id] = { k, pw: Math.max(m.pL, m.pF), pL: m.pL, pF: m.pF, dL, dF }; k === 'L' ? nL++ : nF++; } else { dm[id] = { k: null }; nA++; }
    }
  }
  root.querySelector('#bm-resumo').innerHTML = `<div class="bm-res"><div class="bm-tt">${ap ? 'Municípios na frente' : 'Municípios na frente (projeção)'}</div>
    <div class="bm-lin"><i style="background:${CAND.L.cor}"></i><span>${CAND.L.nome}</span><b>${fInt(nL)}</b></div>
    <div class="bm-lin"><i style="background:${CAND.F.cor}"></i><span>${CAND.F.nome}</span><b>${fInt(nF)}</b></div>
    ${nA ? `<div class="bm-lin"><i style="background:#e4e1ea"></i><span>${ap ? 'Aguardando apuração' : 'Sem dados'}</span><b>${fInt(nA)}</b></div>` : ''}</div>`;
  // busca por nome
  const q = root.querySelector('#bm-q'), ul = root.querySelector('#bm-lista'); let achados = [], sel = 0;
  const pinta = () => { ul.querySelectorAll('li[data-i]').forEach(li => li.classList.toggle('on', +li.dataset.i === sel)); };
  const busca = () => {
    const t = sem(q.value).trim();
    if (t.length < 2) { ul.hidden = true; achados = []; return; }
    achados = idx.filter(r => r.s.includes(t)).sort((a, b) => (b.s.startsWith(t) - a.s.startsWith(t)) || a.s.length - b.s.length || a.n.localeCompare(b.n, 'pt-BR')).slice(0, 8); sel = 0;
    ul.innerHTML = achados.length ? achados.map((r, i) => `<li role="option" data-i="${i}" class="${i === 0 ? 'on' : ''}"><b>${esc(r.n)}</b><small>${esc(UF_NOME[r.uf] || r.uf.toUpperCase())}</small></li>`).join('') : '<li class="vazio">Nenhum município encontrado</li>';
    ul.hidden = false;
  };
  const abrir = r => { if (r) { ul.hidden = true; ctx.ir(rota(r.uf, r.cd)); } };
  q.addEventListener('input', () => { bmTexto = q.value; busca(); });
  q.addEventListener('focus', () => { bmFoco = true; busca(); });
  if (bmTexto) { q.value = bmTexto; if (bmFoco) { q.focus({ preventScroll: true }); } }
  q.addEventListener('keydown', ev => {
    if (ev.key === 'ArrowDown' && achados.length) { ev.preventDefault(); sel = (sel + 1) % achados.length; pinta(); }
    else if (ev.key === 'ArrowUp' && achados.length) { ev.preventDefault(); sel = (sel - 1 + achados.length) % achados.length; pinta(); }
    else if (ev.key === 'Enter') { ev.preventDefault(); abrir(achados[sel]); }
    else if (ev.key === 'Escape') { ul.hidden = true; }
  });
  ul.addEventListener('mousedown', ev => { ev.preventDefault(); const li = ev.target.closest('li[data-i]'); if (li) abrir(achados[+li.dataset.i]); });
  ul.addEventListener('touchend', ev => { const li = ev.target.closest('li[data-i]'); if (li) { ev.preventDefault(); abrir(achados[+li.dataset.i]); } });
  q.addEventListener('blur', () => { if (q.isConnected) bmFoco = false; setTimeout(() => { ul.hidden = true; }, 150); });
  // mapa
  const alvo = root.querySelector('#mapa-bm');
  const tip = id => { const m = porCdi[id]; if (!m) return ''; const nome = `<b>${esc(m.nome)}</b> <span class="t-s">${esc(sigla(m.uf))}</span>`;
    if (!m.ok) return `${nome}<br><span class="t-s">${ap ? 'aguardando apuração' : 'sem dados'}</span>`;
    return `${nome}<br><span class="t-s">${ap ? fNum(m.pst, 2) + '% das seções apuradas' : 'projeção'}</span><br><span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(m.pL, 2)}%</b> ${fDelta(m.dL, 1)} · ${fInt(m.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(m.pF, 2)}%</b> ${fDelta(m.dF, 1)} · ${fInt(m.F)}`; };
  (geoBR ??= getJSON('data/mapa_br_mun.json', { retries: 2, timeout: 90000 })).then(geo => {
    for (const [id, g] of Object.entries(geo.muns)) if (porCdi[id]) g.n = porCdi[id].nome;
    const mp = criarMapaMun(alvo, geo, { onClick: id => { const m = porCdi[id]; if (m) ctx.ir(rota(m.uf, m.cd)); }, tooltip: tip });
    ligaModoMapa(root.querySelector('#am-mun'), mp, dm, Object.entries(porCdi).map(([id, m]) => [id, m.ok ? m : { L: 0, F: 0 }]), { un: ['município', 'municípios'], uf: true });
  }).catch(e => {
    geoBR = null; console.warn('mapa de municípios:', e);
    alvo.innerHTML = '<p class="aviso">Não consegui carregar o mapa dos municípios agora. A busca por nome continua funcionando. <button type="button" class="cmp-limpar" id="bm-de-novo">Tentar de novo</button></p>';
    alvo.querySelector('#bm-de-novo')?.addEventListener('click', () => { alvo.innerHTML = '<p class="carregando">Carregando mapa…</p>'; montarMunBR(root, ctx, ap); });
  });
}

// ---------- mapa: dados ----------
function dadosMapa(linhas) {
  const d = {};
  for (const r of linhas) {
    if (!(r.id in UF_NOME) || r.id === 'zz') continue;
    if (!(r.L + r.F > 0)) { d[r.id] = { k: null }; continue; }
    const k = r.L >= r.F ? 'L' : 'F';
    d[r.id] = { k, pw: k === 'L' ? r.pL : r.pF, pL: r.pL, pF: r.pF, dL: r.dL, dF: r.dF };
  }
  return d;
}
const tipUF = (r, modo) => !r ? '' : `<b>${UF_NOME[r.id]}</b><br>${modo === 'ap' ? `<span class="t-s">${fNum(r.pst, 2)}% das seções apuradas</span>` : `<span class="t-s">projeção · ${fNum(r.pst, 2)}% apurado</span>`}<br>
  <span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(r.pL, 2)}%</b> ${fDelta(r.dL, 1)} · ${fInt(r.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(r.pF, 2)}%</b> ${fDelta(r.dF, 1)} · ${fInt(r.F)}<br>
  <span class="t-s">Abstenção ${fNum(r.pAb, 1)}% ${fDelta(r.dAb, 1)} · Brancos ${fNum(r.pBr, 1)}% · Nulos ${fNum(r.pNu, 1)}%</span>`;

// ---------- tabela de UFs ----------
export function colsUF(modo) {
  const mk = k => [
    { k: 'v' + k, t: `${cabCand(k)} votos`, h: r => vcel(r[k], r.pst > 0 ? r['vg' + k] : NaN, r['g' + k] != null && isFinite(r['g' + k]) ? `crescimento de ${fNum(r['g' + k], 1)}% em relação ao 1º turno` : ''), v: r => r[k], cls: 'n' },
    { k: 'p' + k, t: `${cabCand(k)} %`, h: r => pcel(r['p' + k], r['d' + k]), v: r => r['p' + k], x: r => r['p' + k], cls: 'n' },
  ];
  return [
    { k: 'nome', t: 'Estado', h: r => `<b>${esc(r.nome)}</b>`, v: r => r.nome, ini: 'asc' },
    { k: 'pst', t: modo === 'ap' ? '% apurado' : '% apurado hoje', h: r => `${fNum(r.pst, 2)}%`, v: r => r.pst, cls: 'n' },
    ...mk('L'), ...mk('F'),
    { k: 'marg', t: 'Margem', h: r => `<span style="color:${r.lider ? CAND[r.lider].cor : '#666'}">${r.lider ? CAND[r.lider].nome.split(' ')[0] : '–'} +${fInt(Math.abs(r.L - r.F))}</span>`, v: r => r.L - r.F, cls: 'n sec' },
    { k: 'ab', t: 'Abstenção', h: r => pcel(r.pAb, r.dAb, 1, true), v: r => r.pAb, cls: 'n sec' },
    { k: 'br', t: 'Brancos', h: r => pcel(r.pBr, r.dBr, 2, true), v: r => r.pBr, cls: 'n sec' },
    { k: 'nu', t: 'Nulos', h: r => pcel(r.pNu, r.dNu, 2, true), v: r => r.pNu, cls: 'n sec' },
    ...(modo === 'pr' ? [{ k: 'pw', t: 'Chance de vitória de Lula', h: r => r.pw == null ? '' : probCel(r.pw), v: r => r.pw, cls: 'n' }, { k: 'pend', t: 'Eleitores a apurar', h: r => fCompact(r.pend), v: r => r.pend, cls: 'n sec' }] : []),
  ];
}
const probCel = p => { const x = Math.round(p * 100); const t = x >= 99 ? '>99%' : x <= 1 ? '<1%' : x + '%'; return `<span class="prob" style="--p:${p}">${t}<i></i></span>`; };

// ---------- visão geral (Apuração e Projeção) ----------
export function viewGeral(ctx) {
  const { modo, B, V, P, hist, snap } = ctx;
  const ap = modo === 'ap';
  const base = ap ? linhaAp('BR', V.br) : linhaPr('BR', P.br, B, snap);
  const ufs = UF_IDS.filter(u => (ap ? V.uf[u] : P.uf[u])).map(u => ap ? linhaAp(u, V.uf[u]) : linhaPr(u, P.uf[u], B, snap));
  const conf = ap ? { L: !!snap.br.eL, F: !!snap.br.eF } : {};
  const dif = base.L - base.F, lider = base.lider;
  const alienados = base.a + base.vb + base.tvn;
  let h = '';

  // aviso de contexto
  h += ap ? `<div class="proj-btn sem-export"><a class="btn-proj" href="#/projecao">Ver projeção do resultado final ›</a></div>` : `<div class="proj-btn sem-export"><a class="btn-proj" href="#/">‹ Voltar à apuração oficial</a></div>`;
  if (ap) {
    if (base.pst < 98) h += `<div class="aviso">Apuração parcial: as urnas chegam por regiões em horários diferentes, então o placar de agora ainda não é o resultado final. Veja a <a href="#/projecao">projeção do resultado final</a>.</div>`;
  } else {
    h += `<div class="aviso proj">Projeção estatística — <b>não é resultado oficial</b>. Baseada nas seções já apuradas e no 1º turno de cada município (<a href="#/p/criterios">critérios</a>).</div>`;
  }

  // placar
  const prob = !ap ? probBloco(P.br, base) : '';
  h += `<section class="placar ${ap ? '' : 'proj'}">
    ${cartaoCand('L', base, { modo, conf: conf.L })}
    <div class="centro">
      <div class="centro-t">${ap ? 'Apuração' : 'Projeção do resultado final'}</div>
      ${ap ? `<div class="cobertura"><b>${fNum(base.pst, 2)}%</b> das seções</div><div class="cob-bar"><i style="width:${clamp(base.pst, 0, 100)}%"></i></div><div class="cob-s">${fInt(base.st)} de ${fInt(base.ts)} seções · eleitorado apurado ${fNum(pc(base.est, base.te), 1)}%</div>`
          : `<div class="cobertura"><b>${fNum(base.pst, 2)}%</b> já apurado</div><div class="cob-bar"><i style="width:${clamp(base.pst, 0, 100)}%"></i></div>${prob}`}
      ${barraDupla(base.pL, base.pF)}
      <div class="margem">${lider ? `<b style="color:${CAND[lider].cor}">${CAND[lider].nome}</b> ${ap ? 'à frente por' : 'por'} <b>${fInt(Math.abs(dif))}</b> votos${!ap && P.br.band.margem ? ` <span class="faixa">(margem de Lula, faixa de 90%: ${fCompact(P.br.band.margem[0])} a ${fCompact(P.br.band.margem[1])})</span>` : ''}` : 'Empate'}</div>
    </div>
    ${cartaoCand('F', base, { modo, conf: conf.F })}
  </section>`;

  // KPIs (depois das tabelas)
  let kp = '';
  const lbl = ap ? (V.refMode === 'final' ? 'em relação ao 1º turno completo' : 'em relação ao 1º turno nas mesmas urnas já apuradas') : 'em relação ao 1º turno final';
  const fx = (b, k) => !ap && P.br.band?.[k] ? `<br><span class="faixa">faixa: ${fNum(P.br.band[k][0], 1)}–${fNum(P.br.band[k][1], 1)}%</span>` : '';
  kp += `<div class="comp-toggle sem-export">${ap ? `Comparar com: <button class="tg ${V.refMode === 'lfl' ? 'on' : ''}" data-ref="lfl" title="Compara com o que o candidato teve no 1º turno só nos locais que já foram apurados agora">mesmas urnas do 1º turno</button><button class="tg ${V.refMode === 'final' ? 'on' : ''}" data-ref="final" title="Compara com o resultado final do 1º turno">1º turno completo</button>` : ''}<span class="comp-s">Variações em pontos percentuais (p.p.) ${lbl}.</span>${ap ? entenda('<b>Mesmas urnas do 1º turno</b> (padrão): como a apuração chega por partes, o placar parcial só é justo se comparado ao que cada candidato teve, no 1º turno, <b>nos mesmos lugares já apurados</b>. Ex.: se só o Sul apurou, a variação compara com o 1º turno do Sul, e não do Brasil inteiro.<br><b>1º turno completo</b>: compara com o resultado final do 1º turno no Brasil/estado inteiro. Só é equivalente quando a apuração chega perto de 100%.', 'O que é “mesmas urnas”?') : ''}</div>
  <section class="kpis">
    ${ap ? kpi('Seções apuradas', fNum(base.pst, 2) + '%', null, `${fInt(base.st)} de ${fInt(base.ts)}`) : kpi('Eleitores ainda a apurar', fCompact(P.br.pendEleit), null, `de ${fCompact(P.br.te)} no total`)}
    ${kpi('Abstenção', fNum(base.pAb, 2) + '%', dlt(base.dAb, 2), `${fInt(base.a)} eleitores${fx(0, 'pAb')}`, { dica: 'Abstenção = eleitores que não compareceram ÷ eleitorado (das seções apuradas, na aba Apuração).' })}
    ${kpi('Votos brancos', fNum(base.pBr, 2) + '%', dlt(base.dBr, 2), `${fInt(base.vb)} votos${fx(0, 'pBr')}`, { dica: 'Percentual sobre os votos dados (comparecimento).' })}
    ${kpi('Votos nulos', fNum(base.pNu, 2) + '%', dlt(base.dNu, 2), `${fInt(base.tvn)} votos${fx(0, 'pNu')}`, { dica: 'Inclui nulos por digitação e nulos por anulação do TSE. Percentual sobre os votos dados.' })}
    ${kpi('Alienação eleitoral', fNum(base.ali, 2) + '%', dlt(base.dAli, 2), `abstenção + brancos + nulos · ${fCompact(alienados)}`, { cls: 'destaque', dica: 'Índice usado em estudos sobre participação: (abstenções + brancos + nulos) ÷ eleitorado.' })}
    ${kpi('Comparecimento', fNum(base.pCo, 2) + '%', dlt(base.dCo, 2), `${fInt(base.c)} votos dados`)}
  </section>`;
  kp += `<p class="nota-base">Base dos percentuais: candidatos = votos válidos; brancos e nulos = votos dados (comparecimento); abstenção e alienação = eleitorado${ap ? ' das seções apuradas' : ''}.</p>`;

  // gráficos
  if (ap) {
    h += `<section class="painel"><h2>Marcha da apuração</h2><p class="sub">% dos votos válidos de cada candidato conforme as urnas são apuradas.</p>${entenda('Cada ponto é uma parcial divulgada pelo TSE: o eixo mostra o % apurado e, sob o ponto, o horário da divulgação.')}<div id="g-placar" class="grafico-wrap"></div>${legLinhas(false)}</section>`;
  } else {
    h += `<section class="painel"><h2>Marcha da projeção</h2><p class="sub">Placar parcial e projeção do resultado final.</p>${entenda('Linhas cheias: placar parcial. Linhas tracejadas e sombra: projeção do resultado final de cada candidato com faixa de 90% de confiança — a faixa estreita à medida que as urnas chegam.')}<div id="g-placar" class="grafico-wrap"></div>${legLinhas(true)}</section>`;
  }

  // mapa
  h += `<section class="painel mapa-sec"><h2 id="am-h2">${ap ? 'Resultado por estado' : 'Projeção por estado'}</h2><p class="sub" id="am-sub">Clique em um estado para ver os municípios${ap ? '' : ' (resultado projetado)'}.</p>
  <div class="abas-mapa sem-export" role="tablist" aria-label="Escolha o mapa"><button type="button" role="tab" data-am="uf" class="on">${ap ? 'Resultado' : 'Projeção'} por estado</button><button type="button" role="tab" data-am="mun">${ap ? 'Resultado' : 'Projeção'} por municípios</button></div>
  <div id="am-uf">${seletorMapa()}<div class="mapa-grid"><div id="mapa"></div><div class="mapa-lado"><div class="leg-slot">${legendaMapa()}</div>${tabelaRegioes(ctx, ap)}</div></div></div>
  <div id="am-mun" hidden><div class="busca-mun sem-export"><label for="bm-q">Buscar município</label><div class="bm-box"><input id="bm-q" type="search" placeholder="Digite o nome do município…" autocomplete="off" aria-controls="bm-lista" aria-autocomplete="list"><ul id="bm-lista" role="listbox" hidden></ul></div></div>
  ${seletorMapa()}<div class="mapa-grid"><div id="mapa-bm"><p class="carregando">Carregando mapa…</p></div><div class="mapa-lado"><div class="leg-slot">${legendaMapa()}</div><div id="bm-resumo"></div></div></div></div></section>`;

  // tabela de UFs
  h += govResumo(snap);
  h += `<section class="painel"><h2>Todos os estados</h2><p class="sub">Ordem alfabética — altere clicando nos títulos. <b>Clique em um estado</b> para abrir os municípios.</p><div id="tab-uf"></div></section>`;
  h += kp;
  // balanço (apuração) ou composição de pendentes (projeção)
  h += ap ? faltaApurar(base, ufs, B) + viradas(hist, ufs, B) + balanco(V.br) : pendentes(P, B);

  return {
    html: h,
    montar(root) {
      graficoPlacar(root.querySelector('#g-placar'), hist, { projecao: !ap });
      const dm = dadosMapa(ufs), mp = criarMapa(root.querySelector('#mapa'), ctx.geo, { onClick: u => ctx.ir(`#/${ap ? '' : 'p/'}uf/${u}`), tooltip: u => tipUF(ufs.find(x => x.id === u), modo) });
      ligaModoMapa(root.querySelector('#am-uf') || root, mp, dm, ufs.map(u => [u.id, u]), { un: ['estado', 'estados'] });
      abasMapa(root, ctx, ap);
      const t = tabela(root.querySelector('#tab-uf'), { cols: colsUF(modo), rows: ufs, sort: 'nome', dir: 'asc', onRow: r => ctx.ir(`#/${ap ? '' : 'p/'}uf/${r.id}`) });
      ctx.csv = () => ({ nome: `${ap ? 'apuracao' : 'projecao'}_2t_estados`, ...csvUF(base, ufs, modo) });
      root.querySelectorAll('tr[data-reg]').forEach(tr => tr.addEventListener('click', () => ctx.ir(`#/${ap ? '' : 'p/'}regiao/${tr.dataset.reg}`)));
      void t;
    },
    titulo: ap ? '2º turno · Presidente' : 'Projeção do resultado final',
  };
}

function csvUF(base, ufs, modo) {
  const cab = ['Território', '% apurado', 'Lula votos', 'Lula %', 'Lula var. p.p.', 'Lula cresc. votos %', 'Flávio votos', 'Flávio %', 'Flávio var. p.p.', 'Flávio cresc. votos %', 'Abstenção %', 'Abstenção var. p.p.', 'Brancos %', 'Nulos %', 'Alienação %', 'Alienação var. p.p.'];
  const l = r => [r.nome, r.pst, r.L, r.pL, r.dL, r.gL, r.F, r.pF, r.dF, r.gF, r.pAb, r.dAb, r.pBr, r.pNu, r.ali, r.dAli];
  return { cab, linhas: [...(base ? [l(base)] : []), ...ufs.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(l)] };
}

function probBloco(pb, base) {
  const p = pb.pWinL;
  if (!pb.pstProb) return `<div class="prob-bloco"><div class="prob-t">Probabilidade de vitória</div><div class="prob-na">disponível a partir de ${PARAMS_MIN}% apurado (hoje ${fNum(pb.pst, 2)}%)</div></div>`;
  const pl = Math.round(p * 100), pf = 100 - pl, fmt = x => x >= 99 ? '>99' : x <= 1 ? '<1' : x;
  return `<div class="prob-bloco"><div class="prob-t">Probabilidade de vitória <small>(modelo)</small></div><div class="prob-dup"><span style="width:${clamp(pl, 3, 97)}%;background:${CAND.L.cor}">${CAND.L.nome.split(' ')[0]} ${fmt(pl)}%</span><span style="width:${clamp(pf, 3, 97)}%;background:${CAND.F.cor}">${CAND.F.nome.split(' ')[0]} ${fmt(pf)}%</span></div></div>`;
}
const PARAMS_MIN = 30;
// legenda das linhas do gráfico de marcha
function legLinhas(proj) {
  const sw = (cor, dash, faixa) => `<svg width="30" height="10" aria-hidden="true">${faixa ? `<rect x="0" y="1" width="30" height="8" rx="2" fill="${cor}" opacity=".22"/>` : ''}<line x1="1" y1="5" x2="29" y2="5" stroke="${cor}" stroke-width="2.4" ${dash ? 'stroke-dasharray="5 4"' : ''}/></svg>`;
  const it = (cor, dash, t, faixa) => `<span>${sw(cor, dash, faixa)}${t}</span>`;
  const L = CAND.L.nome.split(' ')[0], F = CAND.F.nome.split(' ')[0];
  return `<div class="leg-linhas" aria-label="Legenda das linhas">${proj
    ? it(CAND.L.cor, 0, `${L} — placar parcial`) + it(CAND.F.cor, 0, `${F} — placar parcial`) + it(CAND.L.cor, 1, `${L} — projeção do resultado final`, 1) + it(CAND.F.cor, 1, `${F} — projeção do resultado final`, 1) + '<span class="leg-n">Sombra = faixa de 90% de confiança da projeção</span>'
    : it(CAND.L.cor, 0, L) + it(CAND.F.cor, 0, F)}</div>`;
}

function tabelaRegioes(ctx, ap) {
  const { V, P } = ctx; const rs = Object.keys(REGIOES).filter(r => (ap ? V.reg[r] : P.reg[r]));
  if (!rs.length) return '';
  const lin = r => {
    if (ap) { const b = V.reg[r]; return `<tr class="clic" data-reg="${r}"><td><b>${REGIOES[r]}</b></td><td class="n">${fNum(b.pst, 2)}%</td><td class="n">${fNum(b.pL, 1)}% ${dlt(b.d.L)}</td><td class="n">${fNum(b.pF, 1)}% ${dlt(b.d.F)}</td><td class="n">${fNum(b.pAb, 1)}% ${dlt(b.d.Ab)}</td></tr>`; }
    const b = P.reg[r]; return `<tr class="clic" data-reg="${r}"><td><b>${REGIOES[r]}</b></td><td class="n">${fCompact(b.pendEleit)}</td><td class="n">${fNum(b.pL, 1)}%</td><td class="n">${fNum(b.pF, 1)}%</td><td class="n">${fNum(b.pAb, 1)}%</td></tr>`;
  };
  return `<h3>Por região</h3><p class="nota" style="margin:0 0 6px">Clique numa região para ver os estados.</p><div class="tab-scroll"><table class="tab mini"><thead><tr><th>Região</th><th class="n">${ap ? '% apurado' : 'a apurar'}</th><th class="n">${cabCand('L')}</th><th class="n">${cabCand('F')}</th><th class="n">Abst.</th></tr></thead><tbody>${rs.map(lin).join('')}</tbody></table></div>`;
}

// ---------- quanto falta apurar (aba Apuração) ----------
// Estimativa simples e transparente: eleitores restantes × (1 − alienação); mostra quanto do restante o candidato atrás precisa.
function faltaApurar(base, ufs, B) {
  const R = Math.max(0, base.te - base.est);
  const ali1 = B?.br ? 100 * (B.br.a + B.br.vb + B.br.tvn) / B.br.te : base.ali;
  const vvA = R * (1 - base.ali / 100), vvB = R * (1 - ali1 / 100), vvR = (vvA + vvB) / 2;
  const lider = base.L >= base.F ? 'L' : 'F', atras = lider === 'L' ? 'F' : 'L', m = Math.abs(base.L - base.F);
  const conc = base.pst >= 99.995 || R < 1;
  const necA = vvA > 0 ? 100 * (0.5 + m / (2 * vvA)) : NaN, necB = vvB > 0 ? 100 * (0.5 + m / (2 * vvB)) : NaN;
  const nec = [necA, necB].filter(isFinite), necMin = Math.min(...nec), necMax = Math.max(...nec);
  const hoje = atras === 'L' ? base.pL : base.pF;
  let frase;
  if (conc) frase = `A apuração está concluída: <b style="color:${CAND[lider].cor}">${CAND[lider].nome}</b> venceu por <b>${fInt(m)}</b> votos.`;
  else if (!nec.length) frase = 'Aguardando dados para estimar o que falta.';
  else if (necMin > 100) frase = `<b>Matematicamente decidido:</b> mesmo com todos os votos válidos que faltam, <b>${CAND[atras].nome}</b> não alcança <b style="color:${CAND[lider].cor}">${CAND[lider].nome}</b>.`;
  else frase = `Faltam cerca de <b>${fCompact(vvR)}</b> votos válidos. Para virar, <b style="color:${CAND[atras].cor}">${CAND[atras].nome}</b> precisaria de <b>${necMin > 100 ? '>100' : fNum(necMin, 1)}${necMax - necMin > 0.15 && necMax <= 100 ? `–${fNum(necMax, 1)}` : ''}%</b> dos votos válidos que ainda não foram contados (hoje tem ${fNum(hoje, 1)}% dos apurados).`;
  const marca = (v, cor, rot) => isFinite(v) && v >= 0 && v <= 100 ? `<span class="fa-m" style="left:${v}%;--c:${cor}"><b>${rot}</b></span>` : '';
  const rs = ufs.map(u => ({ u, r: Math.max(0, (u.te || 0) - (u.est || 0)) })).filter(x => x.r > 0).sort((a, b) => b.r - a.r).slice(0, 6), tot = R || 1;
  return `<details class="painel colapsa falta"><summary><h2>Quanto falta apurar</h2><span class="sub">${fNum(100 - pc(base.est, base.te), 1)}% do eleitorado ainda não foi apurado (${fCompact(R)} eleitores).</span></summary><div class="colapsa-c">
  <p class="fa-frase">${frase}</p>
  ${!conc && nec.length && necMin <= 100 ? `<div class="fa-barra" role="img" aria-label="Quanto do restante o candidato atrás precisa"><div class="fa-trilho"><i style="width:${clamp(hoje, 0, 100)}%;background:${CAND[atras].cor}"></i></div>${marca(hoje, CAND[atras].cor, 'hoje')}${marca(necMin, '#2b2540', 'precisa')}<div class="fa-esc"><span>0%</span><span>50%</span><span>100% dos votos restantes</span></div></div>` : ''}
  ${!conc && rs.length ? `<h3 class="fa-h">Onde estão os eleitores que faltam</h3><div class="pend">${rs.map(({ u, r }) => `<div class="pend-l"><span>${esc(u.nome)}</span><div class="pend-b"><i style="width:${100 * r / rs[0].r}%"></i></div><b>${fCompact(r)}</b><small>${fNum(100 * r / tot, 0)}% do restante · ${fNum(u.pst, 0)}% apurado${u.lider && u.pst > 0 ? ' · ' + CAND[u.lider].nome.split(' ')[0] + ' ' + fNum(u.lider === 'L' ? u.pL : u.pF, 1) + '%' : ''}</small></div>`).join('')}</div>` : ''}
  ${entenda(`<b>Como é calculado.</b> Eleitores restantes = eleitorado total − eleitorado das seções já apuradas. Votos válidos restantes = restantes × (1 − alienação), usando a alienação (abstenção + brancos + nulos) observada até agora e a do 1º turno; o painel mostra a média e, quando as duas estimativas diferem, uma faixa. O candidato atrás precisa de <b>½ + diferença ÷ (2 × votos válidos restantes)</b> dos votos que ainda faltam. É uma conta aritmética de cenário, <b>não é projeção</b>: as urnas restantes não são uma amostra aleatória (veja a aba Projeção).`)}</div></details>`;
}
// ---------- viradas e marcos da apuração (aba Apuração) ----------
export function eventosApuracao(hist) {
  hist = hist.filter(h => h.L + h.F > 0);   // ignora os arquivos do TSE publicados antes da apuração (0 votos)
  const ev = []; let ant = null;
  hist.forEach((h, i) => {
    const lid = h.L > h.F ? 'L' : h.F > h.L ? 'F' : null, dif = Math.abs(h.L - h.F);
    if (i === 0) ev.push({ h, tipo: 'ini', lid, dif });
    else if (lid && ant && lid !== ant) ev.push({ h, tipo: 'virada', lid, dif });
    for (const m of [25, 50, 75, 90, 99]) if (i > 0 && hist[i - 1].pst < m && h.pst >= m) ev.push({ h, tipo: 'marco', m, lid, dif });
    if (lid) ant = lid;
  });
  return ev;
}
function viradas(hist, ufs, B) {
  if (!hist.length) return '';
  const ev = eventosApuracao(hist).reverse().slice(0, 10);
  if (!ev.length) return '';
  const li = e => {
    const c = e.lid ? CAND[e.lid] : null, quem = c ? `<b style="color:${c.cor}">${c.nome}</b>` : 'Empate';
    const txt = e.tipo === 'virada' ? `<b>Virada:</b> ${quem} passa à frente, por ${fInt(e.dif)} votos` : e.tipo === 'marco' ? `<b>${e.m}% das seções apuradas</b> — ${quem} ${e.lid ? 'à frente por ' + fInt(e.dif) + ' votos' : ''}` : `<b>Primeira parcial</b> — ${quem} ${e.lid ? 'à frente por ' + fInt(e.dif) + ' votos' : ''}`;
    return `<li class="tl-${e.tipo}"><span class="tl-h">${esc(e.h.ht || String(e.h.hg).slice(0, 5))}</span><span class="tl-p">${fNum(e.h.pst, 2)}%</span><span class="tl-t">${txt}</span></li>`;
  };
  const virou = ufs.filter(u => u.pst > 0 && B.ufTot?.[u.id] && u.lider && (B.ufTot[u.id].L > B.ufTot[u.id].F ? 'L' : 'F') !== u.lider && u.id !== 'zz');
  const chips = virou.map(u => { const a = B.ufTot[u.id].L > B.ufTot[u.id].F ? 'L' : 'F'; return `<a class="chip-v" href="#/uf/${u.id}" title="No 1º turno (Lula × Flávio) o estado foi de ${CAND[a].nome}; hoje lidera ${CAND[u.lider].nome}">${esc(u.nome)} <i style="background:${CAND[a].cor}"></i>→<i style="background:${CAND[u.lider].cor}"></i></a>`; }).join('');
  return `<details class="painel colapsa viradas"><summary><h2>Viradas e marcos</h2><span class="sub">O que mudou ao longo da apuração (mais recentes primeiro).</span></summary><div class="colapsa-c">
  <ol class="tl">${ev.map(li).join('')}</ol>
  <h3 class="fa-h">Estados que mudaram de lado em relação ao 1º turno</h3>
  ${virou.length ? `<div class="chips-v">${chips}</div>` : '<p class="vazio">Até agora nenhum estado apurado mudou de lado.</p>'}
  ${entenda('“Mudou de lado” compara quem lidera hoje no estado com quem tinha mais votos, no 1º turno, entre Lula e Flávio (somando só os dois). Estados com apuração muito baixa ainda podem oscilar. As viradas na liderança nacional são detectadas entre uma parcial e outra do TSE.')}</div></details>`;
}
function balanco(b) {
  const r = b.refAbs, v1 = b.refRaw.vv, o1 = Math.max(0, v1 - r.L - r.F);
  const lin = (n, a1, a2, cor) => `<tr><td>${cor ? `<i class="pt" style="background:${cor}"></i>` : ''}${n}</td><td class="n">${fInt(a1)}</td><td class="n">${fInt(a2)}</td><td class="n"><b class="${a2 - a1 >= 0 ? 'pos' : 'neg'}">${a2 - a1 >= 0 ? '+' : '−'}${fInt(Math.abs(a2 - a1))}</b></td></tr>`;
  return `<details class="painel colapsa"><summary><h2>Balanço de votos em relação ao 1º turno</h2><span class="sub">No mesmo recorte já apurado (1º turno proporcional às seções contadas): para onde foram os votos de quem votou em outros candidatos e como variaram os não-votos.</span></summary><div class="colapsa-c">
  <div class="tab-scroll"><table class="tab mini"><thead><tr><th></th><th class="n">1º turno</th><th class="n">2º turno</th><th class="n">Variação</th></tr></thead><tbody>
  ${lin(CAND.L.nome, r.L, b.L, CAND.L.cor)}${lin(CAND.F.nome, r.F, b.F, CAND.F.cor)}${lin('Outros candidatos do 1º turno', o1, 0, '#9a93ad')}${lin('Abstenção', r.a, b.a)}${lin('Votos brancos', r.vb, b.vb)}${lin('Votos nulos', r.tvn, b.tvn)}
  </tbody></table></div></div></details>`;
}
function pendentes(P, B) {
  const rs = UF_IDS.map(u => P.uf[u]).filter(Boolean).map((p, i) => ({ u: UF_IDS[i], p })).sort((a, b) => b.p.pendEleit - a.p.pendEleit).slice(0, 8);
  const tot = P.br.pendEleit || 1;
  return `<section class="painel"><h2>Onde estão os votos que faltam</h2><p class="sub">Eleitores ainda não apurados (estimativa) — o resultado final depende de onde eles estão.</p><div class="pend">${rs.map(({ u, p }) => `<div class="pend-l"><span>${UF_NOME[u]}</span><div class="pend-b"><i style="width:${100 * p.pendEleit / rs[0].p.pendEleit}%"></i></div><b>${fCompact(p.pendEleit)}</b><small>${fNum(100 * p.pendEleit / tot, 0)}% do restante · proj. Lula ${fNum(p.pL, 1)}%</small></div>`).join('')}</div></section>`;
}

// ---------- ranking de UFs de um candidato ----------
export function viewCand(ctx, k) {
  const { modo, B, V, P, snap } = ctx, ap = modo === 'ap', c = CAND[k];
  const ufs = UF_IDS.filter(u => u !== 'zz' || true).filter(u => (ap ? V.uf[u] : P.uf[u])).map(u => ap ? linhaAp(u, V.uf[u]) : linhaPr(u, P.uf[u], B, snap));
  const cols = [
    { k: 'pos', t: '#', h: (r, i) => `${i + 1}`, v: r => r['p' + k], cls: 'n' },
    { k: 'nome', t: 'Estado', h: r => `<b>${esc(r.nome)}</b>`, v: r => r.nome, ini: 'asc' },
    { k: 'votos', t: 'Votos', h: r => `<span class="num">${fInt(r[k])}</span>`, v: r => r[k], cls: 'n' },
    { k: 'p', t: '% dos válidos', h: r => `<span class="barra-cel"><i style="width:${clamp(r['p' + k], 0, 100)}%;background:${c.cor}"></i></span><b>${fNum(r['p' + k], 2)}%</b>`, v: r => r['p' + k], cls: 'n larga' },
    { k: 'd', t: 'Var. p.p. vs 1º turno', h: r => dlt(r['d' + k], 2), v: r => r['d' + k], cls: 'n' },
    { k: 'g', t: 'Cresc. de votos vs 1º turno', h: r => grw(r['g' + k]), v: r => r['g' + k], cls: 'n' },
    { k: 'pst', t: '% apurado', h: r => `${fNum(r.pst, 2)}%`, v: r => r.pst, cls: 'n' },
  ];
  const html = `<section class="painel"><h2>${c.nome}: estados do maior para o menor percentual</h2><p class="sub">${ap ? 'Resultado parcial do 2º turno' : 'Resultado projetado'}. Variação e crescimento em relação ao 1º turno${ap ? ' (mesmo recorte apurado)' : ''}. Clique em um estado para ver os municípios.</p><div id="tab-c"></div></section>`;
  return { html, titulo: `${c.nome} · estados`, montar(root) {
    tabela(root.querySelector('#tab-c'), { cols, rows: ufs, sort: 'p', dir: 'desc', onRow: r => ctx.ir(`#/${ap ? '' : 'p/'}uf/${r.id}?c=${k}`), });
    ctx.csv = () => ({ nome: `${slugn(c.nome)}_estados_${ap ? 'apuracao' : 'projecao'}`, cab: ['Estado', 'Votos', '% válidos', 'Var. p.p.', 'Cresc. votos %', '% apurado'], linhas: ufs.slice().sort((a, b) => b['p' + k] - a['p' + k]).map(r => [r.nome, r[k], r['p' + k], r['d' + k], r['g' + k], r.pst]) });
  } };
}
const slugn = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

// ---------- UF com municípios ----------
// ---------- região (Norte, Nordeste…) → estados ----------
export function viewRegiao(ctx, reg) {
  const { modo, B, V, P, snap } = ctx, ap = modo !== 'pr', nome = REGIOES[reg];
  if (!nome) return { html: `<div class="aviso">Região não encontrada.</div>`, titulo: 'Região', montar() {} };
  const ufs = UF_IDS.filter(u => UF_REGIAO[u] === reg && (ap ? V.uf[u] : P.uf[u])).map(u => ap ? linhaAp(u, V.uf[u]) : linhaPr(u, P.uf[u], B, snap));
  const base = ap && V.reg[reg] ? linhaAp(reg, V.reg[reg]) : null;
  const placar = base ? `<section class="placar uf">${cartaoCand('L', base, { modo, conf: false, semLink: true })}<div class="centro"><div class="centro-t">${esc(nome)}</div>${base.ts ? `<div class="cobertura"><b>${fNum(base.pst, 2)}%</b> das seções</div><div class="cob-bar"><i style="width:${clamp(base.pst, 0, 100)}%"></i></div><div class="cob-s">${fInt(base.st)} de ${fInt(base.ts)} seções apuradas</div>` : ''}${barraDupla(base.pL, base.pF)}<div class="margem">${base.lider ? `<b style="color:${CAND[base.lider].cor}">${CAND[base.lider].nome}</b> à frente por <b>${fInt(Math.abs(base.L - base.F))}</b> votos` : 'Aguardando a apuração'}</div></div>${cartaoCand('F', base, { modo, conf: false, semLink: true })}</section>` : '';
  const html = `${placar}<section class="painel"><h2>Estados — ${esc(nome)}</h2><p class="sub">Ordem alfabética — altere clicando nos títulos. <b>Clique em um estado</b> para abrir os municípios.</p><div id="tab-uf"></div></section>`;
  return { html, titulo: `${nome} · estados`, trilha: [['Brasil', ap ? '#/' : '#/p/'], [nome]], montar(root) {
    tabela(root.querySelector('#tab-uf'), { cols: colsUF(ap ? 'ap' : 'pr'), rows: ufs, sort: 'nome', dir: 'asc', onRow: r => ctx.ir(`#/${ap ? '' : 'p/'}uf/${r.id}`) });
    ctx.csv = () => ({ nome: `${slugn(nome)}_estados_${ap ? 'apuracao' : 'projecao'}`, ...csvUF(base, ufs, ap ? 'ap' : 'pr') });
  } };
}

export function viewUf(ctx, uf, kOrd) {
  const { modo, B, V, P, snap } = ctx, ap = modo === 'ap';
  const blk = ap ? V.uf[uf] : P.uf[uf];
  if (!blk) return { html: `<div class="aviso">Ainda não há dados de ${esc(UF_NOME[uf] || uf)}.</div>`, titulo: UF_NOME[uf], montar() {} };
  const r = ap ? linhaAp(uf, blk) : linhaPr(uf, blk, B, snap);
  const ms = ap ? listaMunicipios(B, V, uf) : projetarMunicipios(B, snap, P, uf);
  const rows = ms.map(m => ap
    ? (m.apurado ? { id: m.cd, nome: m.nome, apurado: true, pst: m.pst, L: m.L, F: m.F, pL: m.pL, pF: m.pF, dL: m.d.L, dF: m.d.F, gL: m.g.L, gF: m.g.F, L1: m.refAbs?.L, F1: m.refAbs?.F, lider: m.lider }
      : { id: m.cd, nome: m.nome, apurado: false, pst: 0, L: NaN, F: NaN, pL: NaN, pF: NaN, dL: NaN, dF: NaN, gL: NaN, gF: NaN, p1L: m.p1L, p1F: m.p1F, _cls: 'aguardando' })
    : { id: m.cd, nome: m.nome, apurado: m.apurado, pst: m.pst, L: m.L, F: m.F, pL: m.pL, pF: m.pF, dL: m.pL - m.p1L, dF: m.pF - m.p1F, gL: 100 * (m.L / (m.L1 || NaN) - 1), gF: 100 * (m.F / (m.F1 || NaN) - 1), L1: m.L1, F1: m.F1, lider: m.L > m.F ? 'L' : 'F' });
  const ord = kOrd || r.lider || 'L';
  const cols = [
    { k: 'nome', t: 'Município', h: m => `<b>${esc(m.nome)}</b>${m.apurado || !ap ? '' : ' <small class="agu">aguardando</small>'}`, v: m => m.nome, ini: 'asc' },
    { k: 'pst', t: '% apurado', h: m => ap ? (m.apurado ? `${fNum(m.pst, 2)}%` : '–') : (m.apurado ? `${fNum(m.pst, 2)}%` : 'proj.'), v: m => m.pst, cls: 'n' },
    ...KS.flatMap(k => [
      { k: 'v' + k, t: `${cabCand(k)} votos`, h: m => isNaN(m[k]) ? '' : vcel(m[k], m.apurado || !ap ? m[k] - m[k + '1'] : NaN, isFinite(m['g' + k]) ? `crescimento de ${fNum(m['g' + k], 1)}% em relação ao 1º turno` : ''), v: m => m[k], cls: 'n' },
      { k: 'p' + k, t: `${cabCand(k)} %`, h: m => isNaN(m['p' + k]) ? '' : pcel(m['p' + k], m['d' + k]), v: m => m['p' + k], x: m => m['p' + k], cls: 'n' },
    ]),
    { k: 'lid', t: 'Vence', h: m => m.lider ? `<span class="chip-l" style="background:${CAND[m.lider].cor}">${CAND[m.lider].nome.split(' ')[0]}</span>` : '', v: m => m.lider ? (m.lider === 'L' ? 1 : 0) : NaN, cls: 'c' },
  ];
  const kp = ap
    ? `${kpi('Apurado', fNum(r.pst, 2) + '%', null, `${fInt(r.st)} de ${fInt(r.ts)} seções`)}${kpi('Abstenção', fNum(r.pAb, 2) + '%', dlt(r.dAb, 2), fInt(r.a) + ' eleitores')}${kpi('Brancos + nulos', fNum(r.pBr + r.pNu, 2) + '%', dlt(r.dBr + r.dNu, 2), `${fInt(r.vb + r.tvn)} votos`)}${kpi('Alienação', fNum(r.ali, 2) + '%', dlt(r.dAli, 2), 'abst. + brancos + nulos', { cls: 'destaque' })}`
    : `${kpi('Já apurado', fNum(r.pst, 2) + '%', null, '')}${kpi('Abstenção (proj.)', fNum(r.pAb, 2) + '%', dlt(r.dAb, 2), '')}${kpi('Brancos + nulos (proj.)', fNum(r.pBr + r.pNu, 2) + '%', dlt(r.dBr + r.dNu, 2), '')}${kpi('Chance de Lula vencer', `${Math.round(100 * r.pw)}%`, null, 'modelo estatístico')}`;
  const html = `<section class="placar uf ${ap ? '' : 'proj'}">${cartaoCand('L', r, { modo, conf: false })}<div class="centro"><div class="centro-t">${esc(UF_NOME[uf])}</div>${ap ? `<div class="cobertura"><b>${fNum(r.pst, 2)}%</b> das seções</div><div class="cob-bar"><i style="width:${clamp(r.pst, 0, 100)}%"></i></div><div class="cob-s">${fInt(r.st)} de ${fInt(r.ts)} seções apuradas</div>` : `<div class="cobertura"><b>${fNum(r.pst, 2)}%</b> já apurado</div><div class="cob-bar"><i style="width:${clamp(r.pst, 0, 100)}%"></i></div>`}${barraDupla(r.pL, r.pF)}<div class="margem">${r.lider ? `<b style="color:${CAND[r.lider].cor}">${CAND[r.lider].nome}</b> à frente por <b>${fInt(Math.abs(r.L - r.F))}</b> votos` : ''}</div></div>${cartaoCand('F', r, { modo, conf: false })}</section>
  <section class="kpis k4">${kp}</section>
  ${govPainel(snap.gov?.uf?.[uf], uf, 2)}
  ${uf === 'zz' || uf === 'df' ? '' : `<section class="painel mapa-sec"><h2>Mapa de ${esc(UF_NOME[uf])} por município${ap ? '' : ' (projeção)'}</h2><p class="sub">Clique em um município para ver os bairros.</p>${entenda('Cor = quem lidera no município; tom mais escuro = maior percentual dos votos válidos. Use + / − ou a roda do mouse para aproximar.')}${seletorMapa()}<div class="mapa-grid"><div id="mapa-mun"><p class="carregando">Carregando mapa…</p></div><div class="mapa-lado"><div class="leg-slot">${legendaMapa()}</div></div></div></section>`}
  ${secaoRegioesUf(uf, UF_NOME[uf])}
  <section class="painel"><h2>Municípios de ${esc(UF_NOME[uf])}${ap ? '' : ' (projeção)'}</h2><p class="sub">Ordem alfabética — altere clicando nos títulos. <b>Clique em um município</b> para ver os bairros.</p>${entenda(ap ? 'Municípios sem urnas apuradas aparecem como “aguardando”. Variações em p.p. comparam com o 1º turno no mesmo recorte apurado.' : 'Municípios ainda não apurados mostram a projeção a partir do 1º turno.')}<div id="tab-m"></div></section>`;
  const cdi = new Map((B.byUf[uf] || []).map(b => [b.cd, String(b.cdi)]));
  const dm = {}, porCdi = {};
  for (const m of rows) { const id = cdi.get(m.id); if (!id) continue; porCdi[id] = m;
    dm[id] = (m.apurado || !ap) && m.L + m.F > 0 ? { k: m.L >= m.F ? 'L' : 'F', pw: Math.max(m.pL, m.pF), pL: m.pL, pF: m.pF, dL: m.dL, dF: m.dF } : { k: null }; }
  const tipM = id => { const m = porCdi[id]; if (!m) return ''; const nome = esc(m.nome);
    if (!(m.L + m.F > 0)) return `<b>${nome}</b><br><span class="t-s">aguardando apuração</span>`;
    return `<b>${nome}</b><br><span class="t-s">${ap ? fNum(m.pst, 2) + '% das seções apuradas' : 'projeção'}</span><br><span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(m.pL, 2)}%</b> ${fDelta(m.dL, 1)} · ${fInt(m.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(m.pF, 2)}%</b> ${fDelta(m.dF, 1)} · ${fInt(m.F)}`; };
  return { html, titulo: UF_NOME[uf], trilha: [['Brasil', ap ? '#/' : '#/p/'], [UF_NOME[uf]]], montar(root) {
    const alvoMapa = root.querySelector('#mapa-mun');
    if (alvoMapa) getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
      const idPorCdi = new Map((B.byUf[uf] || []).map(b => [String(b.cdi), b.cd]));
      const mp = criarMapaMun(alvoMapa, geo, { onClick: id => { const cd = idPorCdi.get(id); if (cd) ctx.ir(`#/${ap ? '' : 'p/'}mun/${uf}/${cd}`); }, tooltip: tipM });
      for (const [id, g] of Object.entries(geo.muns)) if (porCdi[id]) g.n = porCdi[id].nome.replace(/\b(\p{L})(\p{L}*)/gu, (_, a, b) => (a + b.toLowerCase())).replace(/ (D[aeo]s?|E) /g, x => x.toLowerCase());
      ligaModoMapa(root, mp, dm, rows.filter(m => cdi.get(m.id)).map(m => [cdi.get(m.id), m]), { un: ['município', 'municípios'] });
    }).catch(() => { alvoMapa.innerHTML = '<p class="aviso">Mapa municipal indisponível no momento.</p>'; });
    montarRegioesUf(root, uf, rows, ap);
    tabela(root.querySelector('#tab-m'), { cols, rows, onRow: m => ctx.ir(`#/${ap ? '' : 'p/'}mun/${uf}/${m.id}`), sort: 'nome', dir: 'asc', filtro: (m, q) => sem(m.nome).includes(q), limite: 1000 });
    ctx.csv = () => ({ nome: `${slugn(UF_NOME[uf])}_municipios_${ap ? 'apuracao' : 'projecao'}`, cab: ['Município', '% apurado', 'Lula votos', 'Lula %', 'Lula var. p.p.', 'Lula cresc. votos %', 'Flávio votos', 'Flávio %', 'Flávio var. p.p.', 'Flávio cresc. votos %'], linhas: rows.slice().sort((a, b) => (isNaN(b['p' + ord]) - isNaN(a['p' + ord])) || b['p' + ord] - a['p' + ord]).map(m => [m.nome, m.pst, m.L, m.pL, m.dL, m.gL, m.F, m.pF, m.dF, m.gF]) });
  } };
}

// ---------- critérios (apuração e projeção, cada um na sua aba) ----------
export function viewCriterios(ctx, modo) {
  const { PARAMS } = ctx;
  const proj = `<section class="painel" id="projecao"><h2>Critérios da projeção</h2>
  <p class="lead">A projeção parte do que já foi apurado no 2º turno e usa o 1º turno como régua: ela pergunta, urna a urna, <b>o quanto cada município mudou em relação ao 1º turno</b> e aplica essa mudança ao que ainda falta apurar.</p>
  <ol class="passos">
   <li><b>Ponto de partida: o 1º turno por município.</b> Para cada um dos ${fInt(ctx.B.muns.length)} municípios (e cidades do exterior) guardamos o resultado oficial do 1º turno: comparecimento, brancos, nulos e votos de ${CAND.L.nome} e ${CAND.F.nome}. É a "linha de base" de cada lugar — cidades com histórico forte de um candidato continuam sendo projetadas como tal.</li>
   <li><b>Mudança medida onde já há urnas apuradas.</b> Em cada município com seções contadas, comparamos o 2º turno parcial com o 1º turno: (a) a variação da proporção entre os dois candidatos (<i>swing</i>, medida em escala logística para não distorcer em lugares muito favoráveis a um lado), (b) a variação do comparecimento, (c) a variação de brancos e (d) de nulos.</li>
   <li><b>Combinação hierárquica: município → estado → região → Brasil.</b> A mudança de cada estado é estimada pelos seus próprios municípios apurados, ponderados pelo volume de votos. Onde há poucas urnas, a estimativa é "puxada" para a tendência da região e do país (encolhimento estatístico). Estados que ainda não começaram a apurar herdam a tendência da região e do país. Assim, a ordem de chegada das urnas (Sul/Sudeste primeiro, Norte/Nordeste depois) <b>não</b> distorce a projeção como distorce o placar parcial.</li>
   <li><b>Projeção do que falta.</b> Para cada município, o eleitorado ainda não apurado é projetado com o comparecimento, os brancos e os nulos do 1º turno daquele município mais a mudança do seu estado, e a divisão entre os candidatos parte do 1º turno do município mais o <i>swing</i> do estado. Soma-se isso ao que já está apurado.</li>
   <li><b>Faixa de incerteza (90%).</b> Simulamos ${PARAMS.draws} cenários, sorteando a mudança nacional, regional e estadual dentro da incerteza de cada nível (e o ruído entre municípios). A faixa mostrada é o intervalo que contém 90% dos cenários. Ela é larga no início e estreita conforme a apuração avança.</li>
   <li><b>Probabilidade de vitória.</b> É a fração dos cenários em que o candidato termina à frente. Só é exibida a partir de ${PARAMS.minPstProb}% das seções apuradas, quando o modelo já tem informação suficiente para isso ser razoável.</li>
   <li><b>Quando os dados são só por estado.</b> Se os resultados por município não estiverem disponíveis, a mesma lógica roda com cada estado como unidade única (menos precisa).</li>
  </ol>
  <h3>Limites e cuidados</h3>
  <ul>
   <li>É uma estimativa estatística, <b>não o resultado oficial</b>. O resultado oficial é o do TSE.</li>
   <li>Pressupõe que as urnas que faltam em um município se comportam como as já apuradas do mesmo município (e que a mudança de um estado vale para o restante dele). Zonas rurais e urbanas, bairros e voto em trânsito podem fugir disso.</li>
   <li>Os parâmetros (quanto confiar no estado vs. na região vs. no país) foram calibrados em <b>simulações</b>, pois não há série nacional de 2º turno por município nos arquivos do TSE para validação histórica.</li>
   <li>Não usa pesquisas de opinião, nem informações de fora do TSE.</li>
  </ul>
  <h3>Parâmetros atuais do modelo</h3>
  <div class="tab-scroll"><table class="tab mini"><thead><tr><th>Componente</th><th class="n">Incerteza nacional (a priori)</th><th class="n">Entre regiões</th><th class="n">Entre estados</th><th class="n">Entre municípios</th></tr></thead><tbody>
   ${[['Swing entre candidatos (logit)', PARAMS.swing], ['Comparecimento (proporção)', PARAMS.turn], ['Votos brancos (proporção)', PARAMS.blank], ['Votos nulos (proporção)', PARAMS.nulo]].map(([n, s]) => `<tr><td>${n}</td><td class="n">${s.s0}</td><td class="n">${s.sr}</td><td class="n">${s.su}</td><td class="n">${s.sm}</td></tr>`).join('')}
  </tbody></table></div></section>`;
  const apu = `<section class="painel" id="apuracao"><h2>Critérios da apuração</h2>
  <ul>
   <li><b>Fonte:</b> arquivos de divulgação de resultados do TSE (eleição 6258, 2º turno de 25/10/2026). O painel consulta os arquivos continuamente e mostra o horário de cada divulgação (parcial).</li>
   <li><b>Percentuais dos candidatos:</b> sobre os votos válidos (no 2º turno, votos nominais nos dois candidatos). <b>Brancos e nulos:</b> sobre os votos dados (comparecimento). <b>Abstenção:</b> sobre o eleitorado. <b>Alienação eleitoral:</b> (abstenção + brancos + nulos) ÷ eleitorado.</li>
   <li><b>Comparação com o 1º turno:</b> por padrão, "mesmo recorte" — o 1º turno só dos municípios/eleitorado já apurados no 2º (para comparar o que é comparável durante a apuração). É possível trocar para o 1º turno final. Variações em pontos percentuais (p.p.); "crescimento de votos" é a variação relativa do número de votos.</li>
   <li><b>Marcha da apuração:</b> cada ponto é uma parcial divulgada pelo TSE, no eixo do % apurado, com o horário da divulgação sob o ponto.</li>
   <li><b>Selo "ELEITO":</b> só aparece quando o TSE confirma. "Lidera na parcial" não é resultado final; "Vence · 100% apurado" aparece quando todas as seções do recorte (estado ou município) foram apuradas.</li>
   <li><b>Mapa:</b> cor = quem lidera no estado; tom mais escuro = maior percentual. Estados pequenos têm o resultado no quadro lateral. Na página de cada estado há o mapa por município (use + / − ou a roda do mouse para aproximar).</li>
   <li><b>Município → bairro:</b> o TSE não divulga resultado por bairro. O painel soma o <b>boletim de urna de cada seção</b> e agrupa pelo bairro cadastrado do <b>local de votação</b> (cadastro do TSE, 2026). O mapa do município é um só, por bairro: onde existe malha de limites (IBGE, Censo 2022; em São Paulo capital, os 96 distritos da Prefeitura/GeoSampa), cada local de votação é ligado à área em que fica e a área é colorida; nos demais municípios, cada local aparece como ponto colorido com o resultado do seu bairro. Nos bairros, percentuais e variações consideram só as seções já apuradas, comparadas com o 1º turno nessas mesmas seções. Os resultados por seção chegam alguns minutos depois do total do município.</li>
   <li><b>Seções agregadas:</b> seções com poucos eleitores votam na urna de uma seção principal; o resultado é atribuído ao local da seção principal.</li>
  </ul>
  <h3>Créditos</h3><p>Mapa: <a href="https://github.com/VictorCazanave/svg-maps" target="_blank" rel="noopener">@svg-maps/brazil</a> (CC BY 4.0). Dados: TSE. Painel: Oficina Política — iniciativa independente, sem vínculo com o TSE.</p></section>`;
  return { html: `<article class="metodo">${modo === 'pr' ? proj : apu}</article>`, titulo: modo === 'pr' ? 'Critérios da projeção' : 'Critérios da apuração', montar() {} };
}
