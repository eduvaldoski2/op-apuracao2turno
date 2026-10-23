// Telas do painel (Apuração, Projeção, ranking por candidato, UF com municípios, método).
import { CAND, UF_NOME, REGIOES, UF_REGIAO, UF_IDS, fInt, fPct, fNum, fCompact, fDelta, sigla, corDoPct, corTexto, clamp } from './util.js';
import { listaMunicipios, rankingUfs } from './model.js';
import { projetarMunicipios } from './proj.js';
import { esc, dlt, grw, tabela } from './ui.js';
import { graficoPlacar } from './charts.js';
import { criarMapa, legendaMapa } from './map.js';
import { criarMapaMun } from './mapamun.js';
import { getJSON } from './tse.js';

const KS = ['L', 'F'];
const pc = (a, b) => (b ? 100 * a / b : NaN);
export const ref1 = t => ({ pL: pc(t.L, t.vv), pF: pc(t.F, t.vv), pAb: pc(t.a, t.te), pBr: pc(t.vb, t.c), pNu: pc(t.tvn, t.c), pCo: pc(t.c, t.te), ali: pc(t.a + t.vb + t.tvn, t.te) });

// ---- linhas normalizadas (nível UF / região / Brasil) ----
export function linhaAp(id, b) {
  return { id, nome: id === 'BR' ? 'Brasil' : (UF_NOME[id] || REGIOES[id] || id), pst: b.pst, st: b.st, ts: b.ts, L: b.L, F: b.F, pL: b.pL, pF: b.pF, dL: b.d.L, dF: b.d.F, gL: b.g.L, gF: b.g.F,
    pAb: b.pAb, dAb: b.d.Ab, pBr: b.pBr, dBr: b.d.Br, pNu: b.pNu, dNu: b.d.Nu, ali: b.ali, dAli: b.d.ali, pCo: b.pCo, dCo: b.d.Co, lider: b.lider, est: b.est, te: b.te, a: b.a, vb: b.vb, tvn: b.tvn, c: b.c, vv: b.vv };
}
export function linhaPr(id, p, B, snap) {
  const t = id === 'BR' ? B.br : B.ufTot[id], r = ref1(t);
  return { id, nome: id === 'BR' ? 'Brasil' : (UF_NOME[id] || id), pst: p.pst, L: p.L, F: p.F, pL: p.pL, pF: p.pF, dL: p.pL - r.pL, dF: p.pF - r.pF, gL: 100 * (p.L / t.L - 1), gF: 100 * (p.F / t.F - 1),
    pAb: p.pAb, dAb: p.pAb - r.pAb, pBr: p.pBr, dBr: p.pBr - r.pBr, pNu: p.pNu, dNu: p.pNu - r.pNu, ali: p.ali, dAli: p.ali - r.ali, pCo: p.pCo, dCo: p.pCo - r.pCo, lider: p.L > p.F ? 'L' : 'F',
    band: p.band, pw: p.pWinL, pend: p.pendEleit, te: p.te, a: p.a, vb: p.vb, tvn: p.tvn, c: p.c, vv: p.L + p.F };
}

export const cabCand = k => `<span class="cab-c" style="--c:${CAND[k].cor}">${CAND[k].nome.split(' ')[0]}</span>`;
export const barraDupla = (pL, pF) => `<div class="barra2" role="img" aria-label="${CAND.L.nome} ${fNum(pL, 2)}% e ${CAND.F.nome} ${fNum(pF, 2)}%"><i style="width:${clamp(pL, 0, 100)}%;background:${CAND.L.cor}"></i><i style="width:${clamp(pF, 0, 100)}%;background:${CAND.F.cor}"></i><b></b></div>`;

// ---------- cartões ----------
export function cartaoCand(k, r, { modo, conf, projecao }) {
  const c = CAND[k], p = k === 'L' ? r.pL : r.pF, d = k === 'L' ? r.dL : r.dF, v = r[k];
  let selo = '';
  if (modo === 'ap') selo = conf ? `<span class="selo ok">ELEITO · confirmado pelo TSE</span>` : (r.lider === k && r.pst > 0 ? `<span class="selo parcial">Lidera na parcial</span>` : '');
  else selo = r.lider === k ? `<span class="selo proj">Projeção: à frente</span>` : '';
  const faixa = modo === 'pr' && r.band ? `<div class="faixa">faixa de 90%: ${fNum(k === 'L' ? r.band.pL[0] : r.band.pF[0], 2)}% a ${fNum(k === 'L' ? r.band.pL[1] : r.band.pF[1], 2)}%</div>` : '';
  return `<a class="cand" href="#/${modo === 'pr' ? 'p/' : ''}cand/${k}" style="--c:${c.cor}" title="Ver o ranking de estados de ${c.nome}">
    <div class="cand-topo"><span class="cand-num">${c.n}</span><div><div class="cand-nome">${c.nome}</div><div class="cand-part">${c.partido}</div></div>${selo}</div>
    <div class="cand-pct">${fNum(p, 2)}%${dlt(d, 2)}</div>
    <div class="cand-votos"><b>${fInt(v)}</b> votos${modo === 'pr' ? ' (projetados)' : ''}</div>${faixa}
    <div class="cand-dica sem-export">ver estados ›</div></a>`;
}
export function kpi(titulo, valor, delta, sub, { dica, cls = '' } = {}) {
  return `<div class="kpi ${cls}" ${dica ? `title="${esc(dica)}"` : ''}><div class="kpi-t">${titulo}</div><div class="kpi-v">${valor}${delta != null ? ' ' + delta : ''}</div><div class="kpi-s">${sub || ''}</div></div>`;
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
const tipUF = (r, modo) => !r ? '' : `<b>${UF_NOME[r.id]}</b><br>${modo === 'ap' ? `<span class="t-s">${fNum(r.pst, 1)}% das seções apuradas</span>` : `<span class="t-s">projeção · ${fNum(r.pst, 1)}% apurado</span>`}<br>
  <span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(r.pL, 2)}%</b> ${fDelta(r.dL, 1)} · ${fInt(r.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(r.pF, 2)}%</b> ${fDelta(r.dF, 1)} · ${fInt(r.F)}<br>
  <span class="t-s">Abstenção ${fNum(r.pAb, 1)}% ${fDelta(r.dAb, 1)} · Brancos ${fNum(r.pBr, 1)}% · Nulos ${fNum(r.pNu, 1)}%</span>`;

// ---------- tabela de UFs ----------
export function colsUF(modo) {
  const mk = k => [
    { k: 'v' + k, t: `${cabCand(k)} votos`, h: r => `<span class="num">${fInt(r[k])}</span>`, v: r => r[k], cls: 'n' },
    { k: 'p' + k, t: `${cabCand(k)} %`, h: r => `<b>${fNum(r['p' + k], 2)}%</b> ${dlt(r['d' + k])}`, v: r => r['p' + k], x: r => r['p' + k], cls: 'n' },
    { k: 'g' + k, t: `cresc. votos`, h: r => grw(r['g' + k]), v: r => r['g' + k], cls: 'n sec' },
  ];
  return [
    { k: 'nome', t: 'Estado', h: r => `<b>${esc(r.nome)}</b>`, v: r => r.nome, ini: 'asc' },
    { k: 'pst', t: modo === 'ap' ? '% apurado' : '% apurado hoje', h: r => `${fNum(r.pst, 1)}%`, v: r => r.pst, cls: 'n' },
    ...mk('L'), ...mk('F'),
    { k: 'marg', t: 'Margem', h: r => `<span style="color:${r.lider ? CAND[r.lider].cor : '#666'}">${r.lider ? CAND[r.lider].nome.split(' ')[0] : '–'} +${fInt(Math.abs(r.L - r.F))}</span>`, v: r => r.L - r.F, cls: 'n sec' },
    { k: 'ab', t: 'Abstenção', h: r => `${fNum(r.pAb, 1)}% ${dlt(r.dAb)}`, v: r => r.pAb, cls: 'n sec' },
    { k: 'br', t: 'Brancos', h: r => `${fNum(r.pBr, 2)}% ${dlt(r.dBr, 2)}`, v: r => r.pBr, cls: 'n sec' },
    { k: 'nu', t: 'Nulos', h: r => `${fNum(r.pNu, 2)}% ${dlt(r.dNu, 2)}`, v: r => r.pNu, cls: 'n sec' },
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
  if (ap) {
    if (base.pst < 98) h += `<div class="aviso">Apuração parcial: as urnas chegam por regiões em horários diferentes, então o placar de agora ainda não é o resultado final. Veja a aba <a href="#/projecao">Projeção</a>.</div>`;
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
          : `<div class="cobertura"><b>${fNum(base.pst, 1)}%</b> já apurado</div><div class="cob-bar"><i style="width:${clamp(base.pst, 0, 100)}%"></i></div>${prob}`}
      ${barraDupla(base.pL, base.pF)}
      <div class="margem">${lider ? `<b style="color:${CAND[lider].cor}">${CAND[lider].nome}</b> ${ap ? 'à frente por' : 'por'} <b>${fInt(Math.abs(dif))}</b> votos${!ap && P.br.band.margem ? ` <span class="faixa">(margem de Lula, faixa de 90%: ${fCompact(P.br.band.margem[0])} a ${fCompact(P.br.band.margem[1])})</span>` : ''}` : 'Empate'}</div>
      <div class="alien">Abstenção + brancos + nulos${ap ? '' : ' (projeção)'}: <b>${fCompact(alienados)}</b> (${fNum(base.ali, 1)}% do eleitorado)${dif ? ` — <b>${fNum(alienados / Math.abs(dif), 1)}×</b> a diferença entre os candidatos` : ''}</div>
    </div>
    ${cartaoCand('F', base, { modo, conf: conf.F })}
  </section>`;

  // KPIs
  const lbl = ap ? (V.refMode === 'final' ? 'em relação ao 1º turno final' : 'em relação ao 1º turno no mesmo recorte') : 'em relação ao 1º turno final';
  const fx = (b, k) => !ap && P.br.band?.[k] ? `<br><span class="faixa">faixa: ${fNum(P.br.band[k][0], 1)}–${fNum(P.br.band[k][1], 1)}%</span>` : '';
  h += `<div class="comp-toggle sem-export">${ap ? `Comparar com: <button class="tg ${V.refMode === 'lfl' ? 'on' : ''}" data-ref="lfl" title="Compara com o 1º turno apenas nos municípios/eleitorado já apurados (maçã com maçã)">mesmo recorte do 1º turno</button><button class="tg ${V.refMode === 'final' ? 'on' : ''}" data-ref="final" title="Compara com o resultado final do 1º turno">1º turno final</button>` : ''}<span class="comp-s">Variações em pontos percentuais (p.p.) ${lbl}.</span></div>
  <section class="kpis">
    ${ap ? kpi('Seções apuradas', fNum(base.pst, 2) + '%', null, `${fInt(base.st)} de ${fInt(base.ts)}`) : kpi('Eleitores ainda a apurar', fCompact(P.br.pendEleit), null, `de ${fCompact(P.br.te)} no total`)}
    ${kpi('Abstenção', fNum(base.pAb, 2) + '%', dlt(base.dAb, 2), `${fInt(base.a)} eleitores${fx(0, 'pAb')}`, { dica: 'Abstenção = eleitores que não compareceram ÷ eleitorado (das seções apuradas, na aba Apuração).' })}
    ${kpi('Votos brancos', fNum(base.pBr, 2) + '%', dlt(base.dBr, 2), `${fInt(base.vb)} votos${fx(0, 'pBr')}`, { dica: 'Percentual sobre os votos dados (comparecimento).' })}
    ${kpi('Votos nulos', fNum(base.pNu, 2) + '%', dlt(base.dNu, 2), `${fInt(base.tvn)} votos${fx(0, 'pNu')}`, { dica: 'Inclui nulos por digitação e nulos por anulação do TSE. Percentual sobre os votos dados.' })}
    ${kpi('Alienação eleitoral', fNum(base.ali, 2) + '%', dlt(base.dAli, 2), `abstenção + brancos + nulos · ${fCompact(alienados)}`, { cls: 'destaque', dica: 'Índice usado em estudos sobre participação: (abstenções + brancos + nulos) ÷ eleitorado.' })}
    ${kpi('Comparecimento', fNum(base.pCo, 2) + '%', dlt(base.dCo, 2), `${fInt(base.c)} votos dados`)}
  </section>`;
  h += `<p class="nota-base">Base dos percentuais: candidatos = votos válidos; brancos e nulos = votos dados (comparecimento); abstenção e alienação = eleitorado${ap ? ' das seções apuradas' : ''}.</p>`;

  // gráficos
  if (ap) {
    h += `<section class="painel"><h2>Marcha da apuração</h2><p class="sub">% dos votos válidos de cada candidato conforme as urnas são apuradas. Cada ponto é uma parcial divulgada pelo TSE: o eixo mostra o % apurado e, sob o ponto, o horário da divulgação.</p><div id="g-placar" class="grafico-wrap"></div></section>`;
  } else {
    h += `<section class="painel"><h2>Marcha da projeção</h2><p class="sub">Linhas cheias: placar parcial. Linhas tracejadas e sombra: projeção do resultado final de cada candidato com faixa de 90% de confiança — a faixa estreita à medida que as urnas chegam.</p><div id="g-placar" class="grafico-wrap"></div></section>`;
  }

  // mapa
  h += `<section class="painel mapa-sec"><h2>${ap ? 'Resultado por estado' : 'Projeção por estado'}</h2><p class="sub">Clique em um estado para ver os municípios${ap ? '' : ' (resultado projetado)'}.</p><div class="mapa-grid"><div id="mapa"></div><div class="mapa-lado">${legendaMapa()}${tabelaRegioes(ctx, ap)}</div></div></section>`;

  // balanço (apuração) ou composição de pendentes (projeção)
  h += ap ? balanco(V.br) : pendentes(P, B);

  // tabela de UFs
  h += `<section class="painel"><h2>Todos os estados</h2><p class="sub">Clique nos títulos para ordenar. Clique em um estado para abrir os municípios.</p><div id="tab-uf"></div></section>`;
  return {
    html: h,
    montar(root) {
      graficoPlacar(root.querySelector('#g-placar'), hist, { projecao: !ap });
      const dm = dadosMapa(ufs), mp = criarMapa(root.querySelector('#mapa'), ctx.geo, { onClick: u => ctx.ir(`#/${ap ? '' : 'p/'}uf/${u}`), tooltip: u => tipUF(ufs.find(x => x.id === u), modo) });
      mp.atualizar(dm);
      const t = tabela(root.querySelector('#tab-uf'), { cols: colsUF(modo), rows: ufs, sort: 'pL', dir: 'desc', onRow: r => ctx.ir(`#/${ap ? '' : 'p/'}uf/${r.id}`) });
      ctx.csv = () => ({ nome: `${ap ? 'apuracao' : 'projecao'}_2t_estados`, ...csvUF(base, ufs, modo) });
      void t;
    },
    titulo: ap ? 'Apuração · 2º turno' : 'Projeção do resultado final',
  };
}

function csvUF(base, ufs, modo) {
  const cab = ['Território', '% apurado', 'Lula votos', 'Lula %', 'Lula var. p.p.', 'Lula cresc. votos %', 'Flávio votos', 'Flávio %', 'Flávio var. p.p.', 'Flávio cresc. votos %', 'Abstenção %', 'Abstenção var. p.p.', 'Brancos %', 'Nulos %', 'Alienação %', 'Alienação var. p.p.'];
  const l = r => [r.nome, r.pst, r.L, r.pL, r.dL, r.gL, r.F, r.pF, r.dF, r.gF, r.pAb, r.dAb, r.pBr, r.pNu, r.ali, r.dAli];
  return { cab, linhas: [l(base), ...ufs.slice().sort((a, b) => a.nome.localeCompare(b.nome, 'pt-BR')).map(l)] };
}

function probBloco(pb, base) {
  const p = pb.pWinL;
  if (!pb.pstProb) return `<div class="prob-bloco"><div class="prob-t">Probabilidade de vitória</div><div class="prob-na">disponível a partir de ${PARAMS_MIN}% apurado (hoje ${fNum(pb.pst, 1)}%)</div></div>`;
  const pl = Math.round(p * 100), pf = 100 - pl, fmt = x => x >= 99 ? '>99' : x <= 1 ? '<1' : x;
  return `<div class="prob-bloco"><div class="prob-t">Probabilidade de vitória <small>(modelo)</small></div><div class="prob-dup"><span style="width:${clamp(pl, 3, 97)}%;background:${CAND.L.cor}">${CAND.L.nome.split(' ')[0]} ${fmt(pl)}%</span><span style="width:${clamp(pf, 3, 97)}%;background:${CAND.F.cor}">${CAND.F.nome.split(' ')[0]} ${fmt(pf)}%</span></div></div>`;
}
const PARAMS_MIN = 30;

function tabelaRegioes(ctx, ap) {
  const { V, P } = ctx; const rs = Object.keys(REGIOES).filter(r => (ap ? V.reg[r] : P.reg[r]));
  if (!rs.length) return '';
  const lin = r => {
    if (ap) { const b = V.reg[r]; return `<tr><td><b>${REGIOES[r]}</b></td><td class="n">${fNum(b.pst, 0)}%</td><td class="n">${fNum(b.pL, 1)}% ${dlt(b.d.L)}</td><td class="n">${fNum(b.pF, 1)}% ${dlt(b.d.F)}</td><td class="n">${fNum(b.pAb, 1)}% ${dlt(b.d.Ab)}</td></tr>`; }
    const b = P.reg[r]; return `<tr><td><b>${REGIOES[r]}</b></td><td class="n">${fCompact(b.pendEleit)}</td><td class="n">${fNum(b.pL, 1)}%</td><td class="n">${fNum(b.pF, 1)}%</td><td class="n">${fNum(b.pAb, 1)}%</td></tr>`;
  };
  return `<h3>Por região</h3><div class="tab-scroll"><table class="tab mini"><thead><tr><th>Região</th><th class="n">${ap ? '% apurado' : 'a apurar'}</th><th class="n">${cabCand('L')}</th><th class="n">${cabCand('F')}</th><th class="n">Abst.</th></tr></thead><tbody>${rs.map(lin).join('')}</tbody></table></div>`;
}

function balanco(b) {
  const r = b.refAbs, v1 = b.refRaw.vv, o1 = Math.max(0, v1 - r.L - r.F);
  const lin = (n, a1, a2, cor) => `<tr><td>${cor ? `<i class="pt" style="background:${cor}"></i>` : ''}${n}</td><td class="n">${fInt(a1)}</td><td class="n">${fInt(a2)}</td><td class="n"><b class="${a2 - a1 >= 0 ? 'pos' : 'neg'}">${a2 - a1 >= 0 ? '+' : '−'}${fInt(Math.abs(a2 - a1))}</b></td></tr>`;
  return `<section class="painel"><h2>Balanço de votos em relação ao 1º turno</h2><p class="sub">No mesmo recorte já apurado (1º turno proporcional às seções contadas): para onde foram os votos de quem votou em outros candidatos e como variaram os não-votos.</p>
  <div class="tab-scroll"><table class="tab mini"><thead><tr><th></th><th class="n">1º turno</th><th class="n">2º turno</th><th class="n">Variação</th></tr></thead><tbody>
  ${lin(CAND.L.nome, r.L, b.L, CAND.L.cor)}${lin(CAND.F.nome, r.F, b.F, CAND.F.cor)}${lin('Outros candidatos do 1º turno', o1, 0, '#9a93ad')}${lin('Abstenção', r.a, b.a)}${lin('Votos brancos', r.vb, b.vb)}${lin('Votos nulos', r.tvn, b.tvn)}
  </tbody></table></div></section>`;
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
    { k: 'pst', t: '% apurado', h: r => `${fNum(r.pst, 1)}%`, v: r => r.pst, cls: 'n' },
  ];
  const html = `<section class="painel"><h2>${c.nome}: estados do maior para o menor percentual</h2><p class="sub">${ap ? 'Resultado parcial do 2º turno' : 'Resultado projetado'}. Variação e crescimento em relação ao 1º turno${ap ? ' (mesmo recorte apurado)' : ''}. Clique em um estado para ver os municípios.</p><div id="tab-c"></div></section>`;
  return { html, titulo: `${c.nome} · estados`, montar(root) {
    tabela(root.querySelector('#tab-c'), { cols, rows: ufs, sort: 'p', dir: 'desc', onRow: r => ctx.ir(`#/${ap ? '' : 'p/'}uf/${r.id}?c=${k}`), });
    ctx.csv = () => ({ nome: `${slugn(c.nome)}_estados_${ap ? 'apuracao' : 'projecao'}`, cab: ['Estado', 'Votos', '% válidos', 'Var. p.p.', 'Cresc. votos %', '% apurado'], linhas: ufs.slice().sort((a, b) => b['p' + k] - a['p' + k]).map(r => [r.nome, r[k], r['p' + k], r['d' + k], r['g' + k], r.pst]) });
  } };
}
const slugn = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-');

// ---------- UF com municípios ----------
export function viewUf(ctx, uf, kOrd) {
  const { modo, B, V, P, snap } = ctx, ap = modo === 'ap';
  const blk = ap ? V.uf[uf] : P.uf[uf];
  if (!blk) return { html: `<div class="aviso">Ainda não há dados de ${esc(UF_NOME[uf] || uf)}.</div>`, titulo: UF_NOME[uf], montar() {} };
  const r = ap ? linhaAp(uf, blk) : linhaPr(uf, blk, B, snap);
  const ms = ap ? listaMunicipios(B, V, uf) : projetarMunicipios(B, snap, P, uf);
  const rows = ms.map(m => ap
    ? (m.apurado ? { id: m.cd, nome: m.nome, apurado: true, pst: m.pst, L: m.L, F: m.F, pL: m.pL, pF: m.pF, dL: m.d.L, dF: m.d.F, gL: m.g.L, gF: m.g.F, lider: m.lider }
      : { id: m.cd, nome: m.nome, apurado: false, pst: 0, L: NaN, F: NaN, pL: NaN, pF: NaN, dL: NaN, dF: NaN, gL: NaN, gF: NaN, p1L: m.p1L, p1F: m.p1F, _cls: 'aguardando' })
    : { id: m.cd, nome: m.nome, apurado: m.apurado, pst: m.pst, L: m.L, F: m.F, pL: m.pL, pF: m.pF, dL: m.pL - m.p1L, dF: m.pF - m.p1F, gL: 100 * (m.L / (m.L1 || NaN) - 1), gF: 100 * (m.F / (m.F1 || NaN) - 1), lider: m.L > m.F ? 'L' : 'F' });
  const ord = kOrd || r.lider || 'L';
  const cols = [
    { k: 'nome', t: 'Município', h: m => `<b>${esc(m.nome)}</b>${m.apurado || !ap ? '' : ' <small class="agu">aguardando</small>'}`, v: m => m.nome, ini: 'asc' },
    { k: 'pst', t: '% apurado', h: m => ap ? (m.apurado ? `${fNum(m.pst, 0)}%` : '–') : (m.apurado ? `${fNum(m.pst, 0)}%` : 'proj.'), v: m => m.pst, cls: 'n' },
    ...KS.flatMap(k => [
      { k: 'v' + k, t: `${cabCand(k)} votos`, h: m => isNaN(m[k]) ? '' : `<span class="num">${fInt(m[k])}</span>`, v: m => m[k], cls: 'n' },
      { k: 'p' + k, t: `${cabCand(k)} %`, h: m => isNaN(m['p' + k]) ? '' : `<b>${fNum(m['p' + k], 2)}%</b> ${dlt(m['d' + k])}`, v: m => m['p' + k], x: m => m['p' + k], cls: 'n' },
      { k: 'g' + k, t: 'cresc. votos', h: m => grw(m['g' + k]), v: m => m['g' + k], cls: 'n sec' },
    ]),
    { k: 'lid', t: 'Vence', h: m => m.lider ? `<span class="chip-l" style="background:${CAND[m.lider].cor}">${CAND[m.lider].nome.split(' ')[0]}</span>` : '', v: m => m.lider ? (m.lider === 'L' ? 1 : 0) : NaN },
  ];
  const kp = ap
    ? `${kpi('Apurado', fNum(r.pst, 1) + '%', null, `${fInt(r.st)} de ${fInt(r.ts)} seções`)}${kpi('Abstenção', fNum(r.pAb, 2) + '%', dlt(r.dAb, 2), fInt(r.a) + ' eleitores')}${kpi('Brancos + nulos', fNum(r.pBr + r.pNu, 2) + '%', dlt(r.dBr + r.dNu, 2), `${fInt(r.vb + r.tvn)} votos`)}${kpi('Alienação', fNum(r.ali, 2) + '%', dlt(r.dAli, 2), 'abst. + brancos + nulos', { cls: 'destaque' })}`
    : `${kpi('Já apurado', fNum(r.pst, 1) + '%', null, '')}${kpi('Abstenção (proj.)', fNum(r.pAb, 2) + '%', dlt(r.dAb, 2), '')}${kpi('Brancos + nulos (proj.)', fNum(r.pBr + r.pNu, 2) + '%', dlt(r.dBr + r.dNu, 2), '')}${kpi('Chance de Lula vencer', `${Math.round(100 * r.pw)}%`, null, 'modelo estatístico')}`;
  const html = `<section class="placar uf ${ap ? '' : 'proj'}">${cartaoCand('L', r, { modo, conf: false })}<div class="centro"><div class="centro-t">${esc(UF_NOME[uf])}</div>${barraDupla(r.pL, r.pF)}<div class="margem">${r.lider ? `<b style="color:${CAND[r.lider].cor}">${CAND[r.lider].nome}</b> à frente por <b>${fInt(Math.abs(r.L - r.F))}</b> votos` : ''}</div></div>${cartaoCand('F', r, { modo, conf: false })}</section>
  <section class="kpis k4">${kp}</section>
  ${uf === 'zz' || uf === 'df' ? '' : `<section class="painel mapa-sec"><h2>Mapa de ${esc(UF_NOME[uf])} por município${ap ? '' : ' (projeção)'}</h2><p class="sub">Cor = quem lidera no município; tom mais escuro = maior percentual. Clique para ver os bairros; use + / − ou a roda do mouse para aproximar.</p><div class="mapa-grid"><div id="mapa-mun"><p class="carregando">Carregando mapa…</p></div><div class="mapa-lado">${legendaMapa()}</div></div></section>`}
  <section class="painel"><h2>Municípios de ${esc(UF_NOME[uf])}${ap ? '' : ' (projeção)'}</h2><p class="sub">Ordenado por ${CAND[ord].nome} (maior % primeiro) — altere clicando nos títulos. Clique em um município para ver os bairros. ${ap ? 'Municípios sem urnas apuradas aparecem no fim, como "aguardando".' : 'Municípios ainda não apurados mostram a projeção a partir do 1º turno.'}</p><div id="tab-m"></div></section>`;
  const cdi = new Map((B.byUf[uf] || []).map(b => [b.cd, String(b.cdi)]));
  const dm = {}, porCdi = {};
  for (const m of rows) { const id = cdi.get(m.id); if (!id) continue; porCdi[id] = m;
    dm[id] = (m.apurado || !ap) && m.L + m.F > 0 ? { k: m.L >= m.F ? 'L' : 'F', pw: Math.max(m.pL, m.pF), pL: m.pL, pF: m.pF, dL: m.dL, dF: m.dF } : { k: null }; }
  const tipM = id => { const m = porCdi[id]; if (!m) return ''; const nome = esc(m.nome);
    if (!(m.L + m.F > 0)) return `<b>${nome}</b><br><span class="t-s">aguardando apuração</span>`;
    return `<b>${nome}</b><br><span class="t-s">${ap ? fNum(m.pst, 0) + '% das seções apuradas' : 'projeção'}</span><br><span style="color:${CAND.L.cor}">■</span> ${CAND.L.nome}: <b>${fNum(m.pL, 2)}%</b> ${fDelta(m.dL, 1)} · ${fInt(m.L)}<br><span style="color:${CAND.F.cor}">■</span> ${CAND.F.nome}: <b>${fNum(m.pF, 2)}%</b> ${fDelta(m.dF, 1)} · ${fInt(m.F)}`; };
  return { html, titulo: UF_NOME[uf], montar(root) {
    const alvoMapa = root.querySelector('#mapa-mun');
    if (alvoMapa) getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
      const idPorCdi = new Map((B.byUf[uf] || []).map(b => [String(b.cdi), b.cd]));
      const mp = criarMapaMun(alvoMapa, geo, { onClick: id => { const cd = idPorCdi.get(id); if (cd) ctx.ir(`#/${ap ? '' : 'p/'}mun/${uf}/${cd}`); }, tooltip: tipM });
      for (const [id, g] of Object.entries(geo.muns)) if (porCdi[id]) g.n = porCdi[id].nome.replace(/\b(\p{L})(\p{L}*)/gu, (_, a, b) => (a + b.toLowerCase())).replace(/ (D[aeo]s?|E) /g, x => x.toLowerCase());
      mp.atualizar(dm);
    }).catch(() => { alvoMapa.innerHTML = '<p class="aviso">Mapa municipal indisponível no momento.</p>'; });
    tabela(root.querySelector('#tab-m'), { cols, rows, onRow: m => ctx.ir(`#/${ap ? '' : 'p/'}mun/${uf}/${m.id}`), sort: 'p' + ord, dir: 'desc', filtro: (m, q) => m.nome.toLowerCase().includes(q), limite: 1000 });
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
   <li><b>Selo "ELEITO":</b> só aparece quando o TSE confirma. "Lidera na parcial" não é resultado final.</li>
   <li><b>Mapa:</b> cor = quem lidera no estado; tom mais escuro = maior percentual. Estados pequenos têm o resultado no quadro lateral. Na página de cada estado há o mapa por município (use + / − ou a roda do mouse para aproximar).</li>
   <li><b>Município → bairro:</b> o TSE não divulga resultado por bairro. O painel soma o <b>boletim de urna de cada seção</b> e agrupa pelo bairro cadastrado do <b>local de votação</b> (cadastro do TSE, 2026). Cada local aparece como ponto no mapa; onde existe a malha de bairros do IBGE (Censo 2022) há também o mapa por bairro, e o painel diz em qual bairro do IBGE cada local cai. Nos bairros, percentuais e variações consideram só as seções já apuradas, comparadas com o 1º turno nessas mesmas seções. Os resultados por seção chegam alguns minutos depois do total do município.</li>
   <li><b>Seções agregadas:</b> seções com poucos eleitores votam na urna de uma seção principal; o resultado é atribuído ao local da seção principal.</li>
  </ul>
  <h3>Créditos</h3><p>Mapa: <a href="https://github.com/VictorCazanave/svg-maps" target="_blank" rel="noopener">@svg-maps/brazil</a> (CC BY 4.0). Dados: TSE. Painel: Oficina Política — iniciativa independente, sem vínculo com o TSE.</p></section>`;
  return { html: `<article class="metodo">${modo === 'pr' ? proj : apu}</article>`, titulo: modo === 'pr' ? 'Critérios da projeção' : 'Critérios da apuração', montar() {} };
}
