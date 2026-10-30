// Deputado federal e estadual, 1º turno de 2026 (data/dep_1t/*.json, scripts/dep1t.mjs): por estado, com federações, partidos e candidatos.
import { UF_NOME, fInt, fNum } from './util.js?v=eee85439';
import { esc, tabela, sem } from './ui.js?v=eee85439';
import { getJSON } from './tse.js?v=eee85439';
import { nomeP } from './governador.js?v=eee85439';
import { criarMapaMun } from './mapamun.js?v=eee85439';
import { corPartido, corTextoSobre, logoP } from './partidos.js?v=eee85439';

const ARQ = { depf: ['federal', 'Deputado Federal', 'Deputados federais'], depe: ['estadual', 'Deputado Estadual', 'Deputados estaduais'] };
const cache = {};
export const carregarDep = tipo => (cache[tipo] ??= getJSON(`data/dep_1t/${ARQ[tipo][0]}.json`, { retries: 3 }).catch(e => { delete cache[tipo]; throw e; }));
const qs = () => new URLSearchParams(location.hash.split('?')[1] || '');
const eleitosDe = x => (x.par ? x.par.reduce((a, p) => a + eleitosDe(p), 0) : x.cand.filter(c => c.e).length);
const candDe = x => (x.par ? x.par.flatMap(candDe) : x.cand);
const todosCand = g => g.grupos.flatMap(gr => gr.par.flatMap(p => p.cand.map(c => ({ ...c, sg: p.sg, gr: gr.n }))));

export function viewDepBrasil(ctx, tipo) {
  const [, cargo, plural] = ARQ[tipo];
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${esc(cargo)} · TSE</div><section class="painel"><h2>${plural} · 1º turno</h2><p class="sub">Não há votação nacional de ${esc(cargo.toLowerCase())}: escolha um estado para ver federações, partidos e candidatos.</p><div id="tab-dep"><p class="carregando">Carregando…</p></div></section>`;
  return { html, titulo: `Brasil — ${cargo}`, montar(root) {
    // não há votação nacional de deputado: a tela é só a escolha do estado (botões aparecem na hora; os números chegam com os dados)
    const REG = [['Norte', ['ac', 'am', 'ap', 'pa', 'ro', 'rr', 'to']], ['Nordeste', ['al', 'ba', 'ce', 'ma', 'pb', 'pe', 'pi', 'rn', 'se']], ['Centro-Oeste', ['df', 'go', 'mt', 'ms']], ['Sudeste', ['es', 'mg', 'rj', 'sp']], ['Sul', ['pr', 'rs', 'sc']]];
    const el = root.querySelector('#tab-dep');
    el.innerHTML = REG.map(([r, ufs]) => `<div class="dep-reg"><h3>${r}</h3><div class="dep-ufs">${ufs.map(u => `<a class="dep-uf" data-uf="${u}" href="#/t1/uf/${u}?cargo=${tipo}"><b>${u.toUpperCase()}</b><span>${esc(UF_NOME[u] || u)}</span><small class="dep-n"></small></a>`).join('')}</div></div>`).join('');
    carregarDep(tipo).then(D => {
      for (const [u, g] of Object.entries(D.uf)) {
        const a = el.querySelector(`[data-uf="${u}"] .dep-n`); if (!a) continue;
        const n = g.grupos.reduce((x, gr) => x + eleitosDe(gr), 0); a.textContent = `${fInt(n)} eleitos`;
      }
    }).catch(() => { el.insertAdjacentHTML('afterbegin', '<p class="aviso">Os números ainda não carregaram; o estado abre normalmente.</p>'); });
  } };
}

const bonito = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());
const SIGLA = { PCDOB: 'PCdoB' };
const sgTxt = sg => SIGLA[String(sg).toUpperCase()] || sg;
// ordem de exibição dos partidos de uma federação (a PT/PCdoB/PV é sempre nessa ordem)
const ORDEM_FED = [['PT', 'PCDOB', 'PV']];
const ordenaPar = par => { const ch = par.map(p => String(p.sg).toUpperCase()); const o = ORDEM_FED.find(l => l.length === ch.length && l.every(x => ch.includes(x))); return o ? o.map(x => par[ch.indexOf(x)]) : par; };
const nomeGrupo = x => x.tp === 'f' ? ordenaPar(x.par).map(p => sgTxt(p.sg)).join('/') : sgTxt(x.par[0].sg);
const chipP = (href, rot, n, on, cor, bg = '', extra = '') => `<a class="chip-p${on ? ' on' : ''}${extra}" href="${href}" style="--pc:${cor};--pt:${corTextoSobre(cor)}${bg ? `;--bg:${bg}` : ''}">${rot}${n != null ? ` <small>${n}</small>` : ''}</a>`;
const stat = (t, v, s = '') => `<div class="dp-k"><div>${esc(t)}</div><b>${v}</b>${s ? `<small>${s}</small>` : ''}</div>`;
const ordinal = n => `${n}º`;

// situação de cada candidato: eleito; suplente na ordem de votos do agrupamento (1º, 2º…); sem cadeira no agrupamento = não eleito
function situacoes(g) {
  const mapa = new Map();
  for (const gr of g.grupos) {
    const ele = eleitosDe(gr), todos = gr.par.flatMap(p => p.cand.map(c => ({ c, sg: p.sg }))).sort((a, b) => b.c.v - a.c.v);
    let sup = 0;
    for (const { c, sg } of todos) {
      let t;
      if (c.e) t = c.st && /m[eé]dia/i.test(c.st) ? 'Eleito(a) por média' : 'Eleito(a)';
      else if (ele > 0 && /suplente/i.test(c.st)) t = `${++sup}º suplente`;
      else t = 'Não eleito';
      mapa.set(c.n + '|' + sg, { t, k: c.e ? 'e' : /suplente/.test(t) ? 's' : 'n' });
    }
  }
  return mapa;
}
const seloSit = s => `<span class="sit sit-${s.k}">${esc(s.t)}</span>`;

export function viewDepUf(ctx, uf, tipo) {
  const [, cargo] = ARQ[tipo], nomeUf = UF_NOME[uf] || uf.toUpperCase(), F = qs().get('f') || '', P = qs().get('p') || '', C = qs().get('c') || '';
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${esc(cargo)} · ${esc(nomeUf)} · TSE</div><div id="dep-corpo"><p class="carregando">Carregando…</p></div>`;
  return { html, titulo: `${nomeUf} — ${cargo}`, trilha: [['Brasil', `#/t1?cargo=${tipo}`], [nomeUf, C ? `#/t1/uf/${uf}?cargo=${tipo}` : undefined].filter(x => x !== undefined)], montar(root) {
    carregarDep(tipo).then(D => {
      const g = D.uf[uf], el = root.querySelector('#dep-corpo');
      if (!g) { el.innerHTML = `<div class="aviso">Sem dados de ${esc(cargo.toLowerCase())} para este estado.</div>`; return; }
      const base = `#/t1/uf/${uf}?cargo=${tipo}`, vv = g.vv || g.grupos.reduce((a, x) => a + x.tn + x.tl, 0);
      const sit = situacoes(g), todos = todosCand(g).sort((a, b) => b.v - a.v), posG = new Map(todos.map((c, i) => [c.n + '|' + c.sg, i + 1]));
      if (C) return candidato(ctx, el, { g, uf, tipo, cargo, nomeUf, base, vv, sit, todos, posG, C });
      const grupos = g.grupos.slice().sort((a, b) => eleitosDe(b) - eleitosDe(a) || (b.tn + b.tl) - (a.tn + a.tl));
      const gr = grupos.find(x => x.n === F), pt = gr?.par.find(x => x.sg === P) || (P && !gr ? g.grupos.flatMap(x => x.par).find(x => x.sg === P) : null);
      const grDoP = pt && !gr ? g.grupos.find(x => x.par.includes(pt)) : gr;
      // quadro do estado (no começo)
      const eleTot = grupos.reduce((a, x) => a + eleitosDe(x), 0), tn = grupos.reduce((a, x) => a + x.tn, 0), tl = grupos.reduce((a, x) => a + x.tl, 0), comp = g.c || 0;
      const quadro = `<section class="painel resumo"><div class="centro-t">${esc(nomeUf)} · ${esc(cargo)} · 1º turno</div><div class="dp-ks dp-ks6">${stat('Cadeiras', fInt(g.vagas || eleTot), `${fInt(todos.length)} candidatos`)}${stat('Votos válidos', fInt(vv), comp ? `${fNum(100 * vv / comp, 1)}% dos comparecidos` : '')}${stat('Nominais', fInt(tn), `${fNum(vv ? 100 * tn / vv : 0, 1)}% dos válidos`)}${stat('Legenda', fInt(tl), `${fNum(vv ? 100 * tl / vv : 0, 1)}% dos válidos`)}${stat('Brancos', fInt(g.vb || 0), comp ? `${fNum(100 * (g.vb || 0) / comp, 1)}%` : '')}${stat('Nulos', fInt(g.tvn || 0), comp ? `${fNum(100 * (g.tvn || 0) / comp, 1)}%` : '')}</div>${g.qe ? `<p class="sub" style="margin:8px 0 0">Quociente eleitoral: <b>${fInt(g.qe)}</b> votos por cadeira.</p>` : ''}</section>`;
      // 1ª fila: Todos + federações e partidos isolados (cores dos partidos, sem logos)
      const gcor = x => x.tp === 'f' ? `linear-gradient(90deg,${ordenaPar(x.par).map(p => corPartido(p.sg)).join(',')})` : corPartido(x.par[0].sg);
      const chipsG = [chipP(base, 'Todos', null, !grDoP, '#3E347E'), ...grupos.map(x => {
        const cor = corPartido(ordenaPar(x.par)[0].sg);
        return chipP(`${base}&f=${encodeURIComponent(x.n)}`, `${x.tp === 'f' ? 'Fed. ' : ''}${esc(nomeGrupo(x))}`, eleitosDe(x), grDoP?.n === x.n, cor, x.tp === 'f' ? gcor(x) : cor, x.tp === 'f' ? ' fed' : '');
      })].join('');
      // 2ª fila: partidos da federação escolhida
      const chipsP = grDoP && grDoP.tp === 'f' ? `<div class="chips-p" style="margin-top:10px"><span class="chips-t">Partidos da federação:</span>${chipP(`${base}&f=${encodeURIComponent(grDoP.n)}`, 'Todos da federação', eleitosDe(grDoP), !pt, '#3E347E')}${ordenaPar(grDoP.par).map(p => chipP(`${base}&f=${encodeURIComponent(grDoP.n)}&p=${encodeURIComponent(p.sg)}`, esc(sgTxt(p.sg)), eleitosDe(p), pt === p, corPartido(p.sg))).join('')}</div>` : '';
      // painel do recorte (partido ou federação)
      const alvo = pt || grDoP;
      let lista = todos;
      if (grDoP) lista = todos.filter(c => (pt ? c.sg === pt.sg : c.gr === grDoP.n));
      let painel = '';
      if (alvo) {
        const tn2 = alvo.tn, tl2 = alvo.tl, tot = tn2 + tl2, ele = eleitosDe(alvo), ehFed = !!alvo.par;
        const nome = ehFed ? (alvo.tp === 'f' ? `Federação ${nomeGrupo(alvo)}` : alvo.par[0].nm || sgTxt(alvo.par[0].sg)) : (alvo.nm || sgTxt(alvo.sg));
        const logos = ehFed ? ordenaPar(alvo.par).map(p => `<a href="${base}&f=${encodeURIComponent(alvo.n)}&p=${encodeURIComponent(p.sg)}" title="Ver só ${esc(sgTxt(p.sg))}">${logoP(p.sg, 'lg-g')}</a>`).join('') : logoP(alvo.sg, 'lg-g');
        painel = `<section class="painel dp-pn"><div class="dp-logos">${logos}</div><h2>${esc(nome)}</h2><p class="sub">${esc(nomeUf)} · ${esc(cargo)} · votação ${ehFed && alvo.tp === 'f' ? 'da federação' : 'do partido'}</p>
          <div class="dp-ks">${stat('Votos totais', fInt(tot), `${fNum(vv ? 100 * tot / vv : 0, 2)}% dos válidos`)}${stat('Nominais', fInt(tn2), `${fNum(tot ? 100 * tn2 / tot : 0, 1)}% do total`)}${stat('Legenda', fInt(tl2), `${fNum(tot ? 100 * tl2 / tot : 0, 1)}% do total`)}${stat('Eleitos', fInt(ele), ehFed && alvo.tp === 'f' ? `cadeiras da federação: ${fInt(alvo.vag)}` : `de ${fInt(lista.length)} candidatos`)}</div></section>`;
      }
      const titulo = pt ? `Candidatos de ${esc(sgTxt(pt.sg))}` : grDoP ? `Candidatos ${grDoP.tp === 'f' ? 'da federação' : 'de ' + esc(sgTxt(grDoP.par[0].sg))}` : 'Todos os candidatos';
      el.innerHTML = `${quadro}
      <section class="painel"><h2>Federações e partidos</h2><p class="sub">O número ao lado da sigla é a quantidade de eleitos. Federações têm a faixa com as cores dos partidos; escolha uma para ver cada partido dela.</p><div class="chips-p">${chipsG}</div>${chipsP}</section>
      ${painel}
      <section class="painel"><h2>${titulo}: ${fInt(lista.length)}</h2><p class="sub">Ordenados por votos. Toque no nome para ver a votação do candidato.</p><div id="tab-dc"></div></section>`;
      const rows = lista.map(c => ({ ...c, pos: posG.get(c.n + '|' + c.sg), pc: vv ? 100 * c.v / vv : 0, sit: sit.get(c.n + '|' + c.sg) }));
      const href = x => `${base}&c=${encodeURIComponent(x.n)}${x.gr && grDoP ? '' : ''}`;
      const cols = [
        { k: 'pos', t: '#', h: x => ordinal(x.pos), v: x => x.pos, cls: 'n' },
        { k: 'nm', t: 'Candidato', h: x => `<a class="dc-nome" href="${href(x)}"><b>${esc(nomeP(x.nm))}</b></a><small class="dc-n">${esc(x.n)}<span class="dc-pm"> · <span class="dc-p" style="--pc:${corPartido(x.sg)};--pt:${corTextoSobre(corPartido(x.sg))}">${esc(sgTxt(x.sg))}</span></span></small>`, v: x => x.nm, x: x => x.nm },
        { k: 'sg', t: 'Partido', cls: 'sec', h: x => `<span class="dc-p" style="--pc:${corPartido(x.sg)};--pt:${corTextoSobre(corPartido(x.sg))}">${esc(sgTxt(x.sg))}</span>`, v: x => x.sg, x: x => x.sg },
        { k: 'v', t: 'Votos', h: x => fInt(x.v), v: x => x.v, cls: 'n' },
        { k: 'pc', t: '%', h: x => fNum(x.pc, 2) + '%', v: x => x.pc, x: x => x.pc, cls: 'n sec' },
        { k: 'sit', t: 'Situação', h: x => seloSit(x.sit), v: x => x.sit.k === 'e' ? 0 : x.sit.k === 's' ? 1 : 2, x: x => x.sit.t },
      ];
      tabela(el.querySelector('#tab-dc'), { cols, rows, onRow: x => ctx.ir(href(x)), sort: 'pos', dir: 'asc', filtro: (x, q) => sem(x.nm).includes(q) || x.n.includes(q) || sem(x.sg).includes(q), limite: 300 });
      ctx.csv = () => ({ nome: `${uf}_${tipo}_1turno`, cab: ['Posição', 'Candidato', 'Partido', 'Número', 'Votos', '% votos válidos', 'Situação'], linhas: rows.map(x => [x.pos, x.nm, x.sg, x.n, x.v, x.pc.toFixed(2), x.sit.t]) });
    }).catch(e => { console.error('dep', e); root.querySelector('#dep-corpo').innerHTML = '<p class="aviso">Dados ainda indisponíveis. Tente de novo em instantes.</p>'; });
  } };
}

// página do candidato: posição geral, posição no partido/federação e votação por município (quando coletada)
function candidato(ctx, el, { g, uf, tipo, cargo, nomeUf, base, vv, sit, todos, posG, C }) {
  const c = todos.find(x => x.n === C);
  if (!c) { el.innerHTML = `<div class="aviso">Candidato não encontrado neste estado. <a href="${base}">Voltar à lista</a></div>`; return; }
  const gr = g.grupos.find(x => x.n === c.gr), mesmoGr = todos.filter(x => x.gr === c.gr), mesmoP = todos.filter(x => x.sg === c.sg);
  const pGr = mesmoGr.findIndex(x => x.n === c.n && x.sg === c.sg) + 1, pP = mesmoP.findIndex(x => x.n === c.n) + 1, s = sit.get(c.n + '|' + c.sg), cor = corPartido(c.sg);
  const ehFed = gr.tp === 'f';
  el.innerHTML = `<section class="painel cd-topo" style="--pc:${cor}"><div class="cd-id">${logoP(c.sg, 'lg-g')}<div><h2>${esc(nomeP(c.nm))}</h2><p class="sub">${esc(sgTxt(c.sg))} · nº ${esc(c.n)} · ${esc(cargo)} · ${esc(nomeUf)}</p>${seloSit(s)}</div></div>
    <div class="dp-ks">${stat('Votos', fInt(c.v), `${fNum(vv ? 100 * c.v / vv : 0, 2)}% dos válidos`)}${stat('Posição no estado', `${posG.get(c.n + '|' + c.sg)}º`, `entre ${fInt(todos.length)} candidatos`)}${stat(ehFed ? 'Posição na federação' : 'Posição no partido', `${pGr}º`, `entre ${fInt(mesmoGr.length)} · ${esc(ehFed ? nomeGrupo(gr) : sgTxt(c.sg))}`)}${ehFed ? stat('Posição no partido', `${pP}º`, `entre ${fInt(mesmoP.length)} do ${esc(sgTxt(c.sg))}`) : stat('Cadeiras do partido', fInt(eleitosDe(gr)), `votos do partido: ${fInt(gr.tn + gr.tl)}`)}</div>
    <p class="sub" style="margin-top:10px"><a href="${base}&f=${encodeURIComponent(gr.n)}${ehFed ? `&p=${encodeURIComponent(c.sg)}` : ''}">← Ver a lista de ${esc(ehFed ? sgTxt(c.sg) : nomeGrupo(gr))}</a></p></section>
  <section class="painel" id="cd-mun"><h2>Votação por região e município</h2><p class="carregando">Carregando…</p></section>`;
  getJSON(`data/dep_mun/${ARQ[tipo][0]}/${uf}.json`, { retries: 1 }).then(M => {
    const v = M.c?.[c.n]; const sec = el.querySelector('#cd-mun');
    if (!v) { sec.innerHTML = '<h2>Votação por região e município</h2><p class="aviso">A votação por município deste candidato ainda não está disponível.</p>'; return; }
    const rows = Object.entries(v).map(([cd, n]) => ({ cd, nome: bonito(M.m[cd] || cd), v: n, pc: c.v ? 100 * n / c.v : 0 })).sort((a, b) => b.v - a.v);
    sec.innerHTML = `<h2>Votação por município</h2><p class="sub">${fInt(rows.length)} municípios com votos · ${fInt(c.v)} votos no estado. Quanto mais escuro, mais votos o candidato teve no município.</p><div id="cd-mapa"></div><div id="cd-desc"></div><div id="cd-tab"></div>`;
    const bm = ctx.B?.byUf?.[uf] || [], cdi = new Map(bm.map(b => [b.cd, String(b.cdi)])), max = Math.max(1, ...rows.map(r => r.v));
    const mix = (t) => { const a = [238, 240, 247], b = [parseInt(cor.slice(1, 3), 16), parseInt(cor.slice(3, 5), 16), parseInt(cor.slice(5, 7), 16)]; return '#' + a.map((x, i) => Math.round(x + (b[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
    if (uf !== 'df') getJSON(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
      const porIbge = new Map(rows.map(r => [cdi.get(r.cd), r])), alvo = sec.querySelector('#cd-mapa'); if (!alvo) return;
      for (const [id, gm] of Object.entries(geo.muns)) { const r = porIbge.get(id); if (r) gm.n = r.nome; }
      const mp = criarMapaMun(alvo, geo, { onClick: id => { const r = porIbge.get(id); if (r) abre(r); }, tooltip: id => { const r = porIbge.get(id); return r ? `<b>${esc(r.nome)}</b><br>${fInt(r.v)} votos` : ''; } });
      mp.atualizar(Object.fromEntries(rows.filter(r => cdi.get(r.cd)).map(r => [cdi.get(r.cd), { k: 1, pw: 1, fill: mix(.12 + .88 * Math.sqrt(r.v / max)), lab: '' }])));
    }).catch(() => {});
    const abre = x => desce(sec.querySelector('#cd-desc'), { uf, tipo, c, cd: x.cd, nome: x.nome, total: x.v, cor });
    tabela(sec.querySelector('#cd-tab'), { onRow: abre, cols: [
      { k: 'pos', t: '#', h: (x, i) => '', v: x => 0, cls: 'n' },
      { k: 'nome', t: 'Município', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, x: x => x.nome, ini: 'asc' },
      { k: 'v', t: 'Votos', h: x => fInt(x.v), v: x => x.v, cls: 'n' },
      { k: 'pc', t: '% dos votos dele', h: x => fNum(x.pc, 1) + '%', v: x => x.pc, x: x => x.pc, cls: 'n sec' },
    ].slice(1), rows, sort: 'v', dir: 'desc', filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
  }).catch(() => { el.querySelector('#cd-mun').innerHTML = '<h2>Votação por região e município</h2><p class="aviso">A votação por município deste candidato ainda não está disponível.</p>'; });
}

// descida dentro do município: bairro > local de votação > seção (votos do candidato; dados por seção do TSE)
async function desce(el, { uf, tipo, c, cd, nome, total, cor }) {
  el.innerHTML = `<div class="painel dsc"><p class="carregando">Carregando a votação de ${esc(nome)} por seção…</p></div>`; el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const arq = ARQ[tipo][0];
  try {
    const [cand, z, loc] = await Promise.all([getJSON(`data/dep_sec/${arq}/${uf}/${c.n}.json`, { retries: 2 }), getJSON(`data/dep_sec/z/${uf}/${cd}.json`, { retries: 2 }), getJSON(`data/bairros/${uf}/${cd}.json`, { retries: 1 }).catch(() => null)]);
    const flat = cand[cd] || [], secoes = []; let idx = 0;
    for (let i = 0; i < flat.length; i += 2) { idx += flat[i]; const [zona, sec, lc] = z[idx]; secoes.push({ zona, sec, lc, v: flat[i + 1] }); }
    const info = new Map(); for (const r of loc?.l || []) info.set(`${r[0]}-${r[1]}`, { nome: r[2], end: r[3], bairro: r[4] });
    const locais = new Map();
    for (const x of secoes) { const k = `${x.zona}-${x.lc}`, i = info.get(k) || { nome: `Local ${x.lc} (zona ${x.zona})`, end: '', bairro: 'Sem bairro informado' }; let L = locais.get(k); if (!L) locais.set(k, L = { k, ...i, v: 0, secoes: [] }); L.v += x.v; L.secoes.push(x); }
    const bairros = new Map(); for (const L of locais.values()) { let b = bairros.get(L.bairro); if (!b) bairros.set(L.bairro, b = { nome: L.bairro, v: 0, locais: [] }); b.v += L.v; b.locais.push(L); }
    const soma = secoes.reduce((a, x) => a + x.v, 0), pc = v => fNum(soma ? 100 * v / soma : 0, 1) + '%';
    const barra = (v, mx) => `<i class="dsc-b"><i style="width:${mx ? 100 * v / mx : 0}%;background:${cor}"></i></i>`;
    const topo = (extra = '') => `<h2>${esc(nome)} · ${esc(nomeP(c.nm))}</h2><p class="sub">${fInt(soma)} votos nas seções${soma !== total ? ` (o total do município é ${fInt(total)}; a diferença são votos de urnas sem seção identificada)` : ''}.${extra}</p>`;
    const nav = [];
    const lista = (itens, mx, cls, fn) => itens.map((it, i) => `<button type="button" class="dsc-l" data-i="${i}"><span class="dsc-n">${fn(it)}</span><span class="dsc-v">${fInt(it.v)}<small>${pc(it.v)}</small></span>${barra(it.v, mx)}</button>`).join('');
    const mostra = (nivel, ctx) => {
      const trilha = `<div class="dsc-t"><button type="button" data-t="0">${esc(nome)}</button>${ctx.b ? ` › <button type="button" data-t="1">${esc(bonito(ctx.b.nome))}</button>` : ''}${ctx.L ? ` › <b>${esc(bonito(ctx.L.nome))}</b>` : ''}</div>`;
      let corpo, itens;
      if (nivel === 0) { itens = [...bairros.values()].sort((a, b) => b.v - a.v); corpo = `<h3>Bairros</h3>${lista(itens, itens[0]?.v, '', b => `${esc(bonito(b.nome))}<small>${b.locais.length} ${b.locais.length === 1 ? 'local' : 'locais'}</small>`)}`; }
      else if (nivel === 1) { itens = ctx.b.locais.slice().sort((a, b) => b.v - a.v); corpo = `<h3>Locais de votação em ${esc(bonito(ctx.b.nome))}</h3>${lista(itens, itens[0]?.v, '', L => `${esc(bonito(L.nome))}<small>${esc(bonito(L.end))}</small>`)}`; }
      else { itens = ctx.L.secoes.slice().sort((a, b) => b.v - a.v); corpo = `<h3>Seções · ${esc(bonito(ctx.L.nome))}</h3><p class="sub">${esc(bonito(ctx.L.end))}</p>${itens.map(x => `<div class="dsc-l fim"><span class="dsc-n">Zona ${x.zona} · seção ${x.sec}</span><span class="dsc-v">${fInt(x.v)}<small>${pc(x.v)}</small></span>${barra(x.v, itens[0]?.v)}</div>`).join('')}`; }
      el.innerHTML = `<div class="painel dsc">${topo()}${trilha}${corpo}</div>`;
      el.querySelectorAll('[data-t]').forEach(b => b.addEventListener('click', () => (b.dataset.t === '0' ? mostra(0, {}) : mostra(1, { b: ctx.b }))));
      if (nivel < 2) el.querySelectorAll('.dsc-l[data-i]').forEach(b => b.addEventListener('click', () => { const it = itens[+b.dataset.i]; nivel === 0 ? mostra(1, { b: it }) : mostra(2, { b: ctx.b, L: it }); }));
    };
    if (!secoes.length) { el.innerHTML = `<div class="painel dsc"><p class="aviso">Sem votos por seção deste candidato em ${esc(nome)}.</p></div>`; return; }
    mostra(0, {});
  } catch (e) { console.error('dep seção', e); el.innerHTML = `<div class="painel dsc"><p class="aviso">A votação por seção deste candidato ainda não está disponível.</p></div>`; }
}
