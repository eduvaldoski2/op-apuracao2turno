// Deputado federal e estadual, 1º turno de 2026 (data/dep_1t/*.json, scripts/dep1t.mjs): por estado, com federações, partidos e candidatos.
import { UF_NOME, fInt, fNum } from './util.js?v=c6f95a49';
import { esc, tabela, sem } from './ui.js?v=c6f95a49';
import { getJSON } from './tse.js?v=c6f95a49';
import { nomeP } from './governador.js?v=c6f95a49';
import { criarMapaMun } from './mapamun.js?v=c6f95a49';
import { corPartido, corTextoSobre, logoP } from './partidos.js?v=c6f95a49';

const ARQ = { depf: ['federal', 'Deputado Federal', 'Deputados federais'], depe: ['estadual', 'Deputado Estadual', 'Deputados estaduais'] };
const cache = {};
export const carregarDep = tipo => (cache[tipo] ??= getJSON(`data/dep_1t/${ARQ[tipo][0]}.json`, { retries: 3 }).catch(e => { delete cache[tipo]; throw e; }));
const qs = () => new URLSearchParams(location.hash.split('?')[1] || '');
const eleitosDe = x => (x.par ? x.par.reduce((a, p) => a + eleitosDe(p), 0) : x.cand.filter(c => c.e).length);
const candDe = x => (x.par ? x.par.flatMap(candDe) : x.cand);
const todosCand = g => g.grupos.flatMap(gr => gr.par.flatMap(p => p.cand.map(c => ({ ...c, sg: p.sg, gr: gr.n }))));

export function viewDepBrasil(ctx, tipo) {
  const [, cargo, plural] = ARQ[tipo];
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${esc(cargo)} · TSE</div><section class="painel"><h2>${plural} · 1º turno</h2><p class="sub">Não há votação nacional de ${esc(cargo.toLowerCase())}: escolha um estado ou um partido/federação para ver os candidatos.</p><div id="tab-dep"><p class="carregando">Carregando…</p></div></section>`;
  return { html, titulo: `Brasil — ${cargo}`, montar(root) {
    // não há votação nacional de deputado: a tela é só a escolha do estado (botões aparecem na hora; os números chegam com os dados)
    const REG = [['Norte', ['ac', 'am', 'ap', 'pa', 'ro', 'rr', 'to']], ['Nordeste', ['al', 'ba', 'ce', 'ma', 'pb', 'pe', 'pi', 'rn', 'se']], ['Centro-Oeste', ['df', 'go', 'mt', 'ms']], ['Sudeste', ['es', 'mg', 'rj', 'sp']], ['Sul', ['pr', 'rs', 'sc']]];
    const el = root.querySelector('#tab-dep'), Q = qs(), modo = Q.get('m') === 'p' ? 'p' : 'e', gSel = Q.get('g');
    const ab = (m, rot) => `<a class="chip-p${modo === m ? ' on' : ''}" href="#/t1?cargo=${tipo}${m === 'p' ? '&m=p' : ''}">${rot}</a>`;
    const abas = `<div class="dep-abas">${ab('e', 'Por estado')}${ab('p', 'Partidos e federações')}</div>`;
    if (modo === 'e') {
      el.innerHTML = abas + REG.map(([r, ufs]) => `<div class="dep-reg"><h3>${r}</h3><div class="dep-ufs">${ufs.map(u => `<a class="dep-uf" data-uf="${u}" href="#/t1/uf/${u}?cargo=${tipo}"><b>${u.toUpperCase()}</b><span>${esc(UF_NOME[u] || u)}</span><small class="dep-n"></small></a>`).join('')}</div></div>`).join('');
      carregarDep(tipo).then(D => {
        for (const [u, g] of Object.entries(D.uf)) {
          const a = el.querySelector(`[data-uf="${u}"] .dep-n`); if (!a) continue;
          const n = g.grupos.reduce((x, gr) => x + eleitosDe(gr), 0); a.textContent = `${fInt(n)} eleitos`;
        }
      }).catch(() => { el.insertAdjacentHTML('afterbegin', '<p class="aviso">Os números ainda não carregaram; o estado abre normalmente.</p>'); });
      return;
    }
    el.innerHTML = abas + '<p class="carregando">Carregando partidos e federações…</p>';
    carregarDep(tipo).then(D => {
      // agrupa por federação/partido em todo o país
      const G = new Map();
      for (const [u, g] of Object.entries(D.uf)) for (const gr of g.grupos) {
        const k = nomeGrupo(gr); let o = G.get(k); if (!o) G.set(k, o = { k, fed: gr.tp === 'f', par: ordenaPar(gr.par), tot: 0, ele: 0, ufs: [] });
        const tot = gr.tn + gr.tl, ele = eleitosDe(gr); o.tot += tot; o.ele += ele; o.ufs.push({ u, gr, tot, ele });
      }
      const L = [...G.values()].sort((a, b) => b.ele - a.ele || b.tot - a.tot);
      const sel = gSel && G.get(gSel);
      if (!sel) {
        el.innerHTML = abas + `<p class="sub">Escolha um partido ou federação para ver os candidatos de todo o país, separados por estado.</p><div class="dep-ufs dep-gs">${L.map(o => `<a class="dep-uf dep-g" href="#/t1?cargo=${tipo}&m=p&g=${encodeURIComponent(o.k)}" style="--pc:${corPartido(o.par[0].sg)}"><span class="dp-logos">${o.par.map(p => logoP(p.sg, 'lg-m')).join('')}</span><span><b>${esc(o.fed ? 'Federação ' + o.k : o.k)}</b><small>${fInt(o.ele)} eleitos · ${fInt(o.tot)} votos</small></span></a>`).join('')}</div>`;
        return;
      }
      const P = sel.fed ? Q.get('p') : null, pSel = P && sel.par.find(p => String(p.sg).toUpperCase() === P.toUpperCase()), vista = pSel ? [pSel] : sel.par, cor = corPartido(vista[0].sg);
      const base = `#/t1?cargo=${tipo}&m=p&g=${encodeURIComponent(sel.k)}`;
      const ufs = sel.ufs.map(x => { const ps = x.gr.par.filter(p => vista.some(v => String(v.sg).toUpperCase() === String(p.sg).toUpperCase())); return { ...x, ps, ele: ps.reduce((t, p) => t + eleitosDe(p), 0), tot: ps.reduce((t, p) => t + (p.tn != null ? p.tn + (p.tl || 0) : p.cand.reduce((a, c) => a + c.v, 0)), 0) }; }).filter(x => x.ps.length).sort((a, b) => b.ele - a.ele || b.tot - a.tot);
      const nUf = u => UF_NOME[u.u] || u.u.toUpperCase(), eleT = ufs.reduce((t, x) => t + x.ele, 0), totT = ufs.reduce((t, x) => t + x.tot, 0);
      const nome = pSel ? sgTxt(pSel.sg) : (sel.fed ? 'Federação ' + sel.k : sel.k);
      const logos = sel.fed ? sel.par.map(p => `<a href="${base}${pSel && pSel === p ? '' : '&p=' + encodeURIComponent(p.sg)}" title="${pSel === p ? 'Voltar à federação' : 'Ver só ' + esc(sgTxt(p.sg))}" style="${pSel && pSel !== p ? 'opacity:.35' : ''}">${logoP(p.sg, 'lg-g')}</a>`).join('') : logoP(sel.par[0].sg, 'lg-g');
      const chips = sel.fed ? `<div class="dep-abas">${chipP(base, 'Federação inteira', null, !pSel, cor)}${sel.par.map(p => chipP(`${base}&p=${encodeURIComponent(p.sg)}`, esc(sgTxt(p.sg)), null, pSel === p, corPartido(p.sg))).join('')}</div>` : '';
      el.innerHTML = abas + `<section class="painel dp-pn" style="--pc:${cor}"><div class="dp-logos">${logos}</div><h2>${esc(nome)}</h2><p class="sub">${pSel ? `Partido da federação ${esc(sel.k)} · ` : ''}<a href="#/t1?cargo=${tipo}&m=p">← Todos os partidos e federações</a></p>${chips}
        <div class="dp-ks">${stat('Eleitos no país', fInt(eleT), `${fInt(ufs.filter(x => x.ele).length)} estados com cadeira`)}${stat('Votos totais', fInt(totT))}${stat('Estados com candidatos', fInt(ufs.length))}</div></section>` +
        ufs.map(x => {
          const cs = x.ps.flatMap(p => p.cand.map(c => ({ ...c, sg: p.sg }))).sort((a, b) => b.v - a.v), mostra = cs.filter(c => c.e);
          const li = c => `<a class="dpn-c" href="#/t1/uf/${x.u}?cargo=${tipo}&c=${encodeURIComponent(c.n)}"><span class="dpn-n">${esc(bonito(c.nm))}</span>${sel.fed && !pSel ? `<small>${esc(sgTxt(c.sg))}</small>` : ''}<b>${fInt(c.v)}</b>${c.e ? '<i class="sit sit-e">Eleito(a)</i>' : ''}</a>`;
          return `<details class="painel dpn-uf"${x.ele ? ' open' : ''}><summary><b>${esc(nUf(x))}</b><span>${fInt(x.ele)} eleitos · ${fInt(x.tot)} votos · ${fInt(cs.length)} candidatos</span></summary>${mostra.map(li).join('')}${cs.length > mostra.length ? `<details class="dpn-resto"><summary>Ver os demais ${fInt(cs.length - mostra.length)} candidatos</summary>${cs.filter(c => !c.e).map(li).join('')}</details>` : ''}<p class="sub"><a href="#/t1/uf/${x.u}?cargo=${tipo}&f=${encodeURIComponent(x.gr.n)}${pSel ? `&p=${encodeURIComponent(pSel.sg)}` : ''}">Abrir a lista completa em ${esc(nUf(x))} →</a></p></details>`;
        }).join('');
    }).catch(() => { el.innerHTML = abas + '<p class="aviso">Os números ainda não carregaram. Tente de novo em instantes.</p>'; });
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
  import('./depcand.js?v=' + Date.now().toString(36).slice(0, 4)).then(m => m.candidatoDin(ctx, el.querySelector('#cd-mun'), { uf, tipo, arq: ARQ[tipo][0], c, cor, todos, sit, nomeUf, vv, H: { bonito, stat, nomeGrupo, sgTxt, ehFed } })).catch(e => { console.error('cand', e); el.querySelector('#cd-mun').innerHTML = '<h2>Votação por região e município</h2><p class="aviso">Não foi possível carregar a votação detalhada. Tente de novo.</p>'; });
}
