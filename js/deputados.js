// Deputado federal e estadual, 1º turno de 2026 (data/dep_1t/*.json, scripts/dep1t.mjs): por estado, com federações, partidos e candidatos.
import { UF_NOME, fInt, fNum } from './util.js?v=8b975ef5';
import { esc, tabela, sem } from './ui.js?v=8b975ef5';
import { getJSON } from './tse.js?v=8b975ef5';
import { nomeP } from './governador.js?v=8b975ef5';
import { corPartido, corTextoSobre, logoP } from './partidos.js?v=8b975ef5';

const ARQ = { depf: ['federal', 'Deputado Federal', 'Deputados federais'], depe: ['estadual', 'Deputado Estadual', 'Deputados estaduais'] };
const cache = {};
export const carregarDep = tipo => (cache[tipo] ??= getJSON(`data/dep_1t/${ARQ[tipo][0]}.json`, { retries: 2 }));
const qs = () => new URLSearchParams(location.hash.split('?')[1] || '');
const eleitosDe = x => (x.par ? x.par.reduce((a, p) => a + eleitosDe(p), 0) : x.cand.filter(c => c.e).length);
const candDe = x => (x.par ? x.par.flatMap(candDe) : x.cand);
const todosCand = g => g.grupos.flatMap(gr => gr.par.flatMap(p => p.cand.map(c => ({ ...c, sg: p.sg, gr: gr.n }))));

export function viewDepBrasil(ctx, tipo) {
  const [, cargo, plural] = ARQ[tipo];
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${esc(cargo)} · TSE</div><section class="painel"><h2>${plural} · 1º turno</h2><p class="sub">Escolha um estado para ver federações, partidos e candidatos.</p><div id="tab-dep"><p class="carregando">Carregando…</p></div></section>`;
  return { html, titulo: `Brasil — ${cargo}`, montar(root) {
    carregarDep(tipo).then(D => {
      const rows = Object.entries(D.uf).map(([u, g]) => { const t = todosCand(g).sort((a, b) => b.v - a.v)[0]; return { id: u, nome: UF_NOME[u], n: g.grupos.reduce((a, x) => a + eleitosDe(x), 0), nc: todosCand(g).length, t }; });
      const cols = [
        { k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' },
        { k: 'n', t: 'Eleitos', h: x => fInt(x.n), v: x => x.n, cls: 'n' },
        { k: 't', t: 'Mais votado', h: x => x.t ? `<b>${esc(nomeP(x.t.nm))}</b> <small>${esc(x.t.sg)}</small><small class="vt">${fInt(x.t.v)} votos</small>` : '', v: x => x.t?.v ?? 0, x: x => x.t?.nm || '' },
        { k: 'nc', t: 'Candidatos', h: x => fInt(x.nc), v: x => x.nc, cls: 'n sec' },
      ];
      tabela(root.querySelector('#tab-dep'), { cols, rows, onRow: x => ctx.ir(`#/t1/uf/${x.id}?cargo=${tipo}`), sort: 'nome', dir: 'asc' });
    }).catch(() => { root.querySelector('#tab-dep').innerHTML = '<p class="aviso">Dados ainda indisponíveis. Tente de novo em instantes.</p>'; });
  } };
}

const chipP = (href, sg, n, on, cor, logo = '') => `<a class="chip-p${on ? ' on' : ''}" href="${href}" style="--pc:${cor};--pt:${corTextoSobre(cor)}">${logo}${esc(sg)} <small>${n}</small></a>`;
const stat = (t, v, s = '') => `<div class="dp-k"><div>${esc(t)}</div><b>${v}</b>${s ? `<small>${s}</small>` : ''}</div>`;

export function viewDepUf(ctx, uf, tipo) {
  const [, cargo] = ARQ[tipo], nomeUf = UF_NOME[uf] || uf.toUpperCase(), F = qs().get('f') || '', P = qs().get('p') || '';
  const html = `<div class="aviso t1">Resultado <b>oficial</b> do 1º turno de 2026 · ${esc(cargo)} · ${esc(nomeUf)} · TSE</div><div id="dep-corpo"><p class="carregando">Carregando…</p></div>`;
  return { html, titulo: `${nomeUf} — ${cargo}`, trilha: [['Brasil', `#/t1?cargo=${tipo}`], [nomeUf]], montar(root) {
    carregarDep(tipo).then(D => {
      const g = D.uf[uf], el = root.querySelector('#dep-corpo');
      if (!g) { el.innerHTML = `<div class="aviso">Sem dados de ${esc(cargo.toLowerCase())} para este estado.</div>`; return; }
      const base = `#/t1/uf/${uf}?cargo=${tipo}`, vv = g.vv || g.grupos.reduce((a, x) => a + x.tn + x.tl, 0);
      const grupos = g.grupos.slice().sort((a, b) => eleitosDe(b) - eleitosDe(a) || (b.tn + b.tl) - (a.tn + a.tl));
      const gr = grupos.find(x => x.n === F), pt = gr?.par.find(x => x.sg === P) || (P && !gr ? g.grupos.flatMap(x => x.par).find(x => x.sg === P) : null);
      const grDoP = pt && !gr ? g.grupos.find(x => x.par.includes(pt)) : gr;
      // 1ª fila: Todos + federações e partidos isolados
      const gcor = x => x.tp === 'f' ? `linear-gradient(90deg,${x.par.map(p => corPartido(p.sg)).join(',')})` : corPartido(x.par[0].sg);
      const chipsG = [`<a class="chip-p${!grDoP ? ' on' : ''}" href="${base}" style="--pc:#3E347E;--pt:#fff">Todos</a>`, ...grupos.map(x => {
        const on = grDoP?.n === x.n, cor = x.tp === 'f' ? corPartido(x.par[0].sg) : corPartido(x.par[0].sg), bg = x.tp === 'f' ? gcor(x) : cor;
        return `<a class="chip-p${on ? ' on' : ''}${x.tp === 'f' ? ' fed' : ''}" href="${base}&f=${encodeURIComponent(x.n)}" style="--pc:${cor};--pt:${corTextoSobre(cor)};--bg:${bg}" title="${esc(x.nm)}">${x.par.map(p => logoP(p.sg)).join('')}${x.tp === 'f' ? 'Fed. ' : ''}${esc(x.tp === 'f' ? x.com.replace(/ \/ /g, '/') : x.par[0].sg)} <small>${eleitosDe(x)}</small></a>`; })].join('');
      // 2ª fila: partidos da federação escolhida
      const chipsP = grDoP && grDoP.tp === 'f' ? `<div class="chips-p" style="margin-top:10px"><span class="chips-t">Partidos da federação:</span>${chipP(`${base}&f=${encodeURIComponent(grDoP.n)}`, 'Federação inteira', eleitosDe(grDoP), !pt, '#3E347E')}${grDoP.par.map(p => chipP(`${base}&f=${encodeURIComponent(grDoP.n)}&p=${encodeURIComponent(p.sg)}`, p.sg, eleitosDe(p), pt === p, corPartido(p.sg), logoP(p.sg))).join('')}</div>` : '';
      // painel de votação do recorte
      const alvo = pt || grDoP, lista = (alvo ? candDe(alvo) : todosCand(g)).map(c => ({ ...c, sg: c.sg || pt?.sg })).sort((a, b) => b.v - a.v);
      let painel;
      if (alvo) {
        const tn = alvo.tn, tl = alvo.tl, tot = tn + tl, ele = eleitosDe(alvo), nome = alvo.par ? (alvo.tp === 'f' ? `Federação ${alvo.com}` : alvo.par[0].nm || alvo.par[0].sg) : (alvo.nm || alvo.sg);
        const vagas = alvo.par ? alvo.vag : null;
        painel = `<section class="painel dp-pn"><div class="dp-logos">${(alvo.par || [alvo]).map(p => logoP(p.sg, 'lg-g')).join('')}</div><h2>${esc(nome)}</h2><p class="sub">${esc(nomeUf)} · ${esc(cargo)} · votação do ${alvo.par && alvo.tp === 'f' ? 'agrupamento' : pt ? 'partido' : 'partido'}</p>
          <div class="dp-bar"><i style="width:${tot ? 100 * tn / tot : 0}%;background:${corPartido((pt || alvo.par?.[0] || alvo).sg)}"></i><i style="width:${tot ? 100 * tl / tot : 0}%;background:${corPartido((pt || alvo.par?.[0] || alvo).sg)};opacity:.4"></i></div>
          <div class="dp-leg"><span><i></i>Nominais</span><span><i class="l"></i>Legenda</span></div>
          <div class="dp-ks">${stat('Votos totais', fInt(tot), `${fNum(vv ? 100 * tot / vv : 0, 2)}% dos válidos`)}${stat('Nominais', fInt(tn), `${fNum(tot ? 100 * tn / tot : 0, 1)}% do total`)}${stat('Legenda', fInt(tl), `${fNum(tot ? 100 * tl / tot : 0, 1)}% do total`)}${stat('Eleitos', fInt(ele), vagas != null && alvo.tp === 'f' ? `cadeiras da federação: ${fInt(vagas)}` : `de ${fInt(lista.length)} candidatos`)}</div>${g.qe ? `<p class="sub" style="margin-top:6px">Quociente eleitoral do estado: ${fInt(g.qe)} votos por cadeira (${fInt(g.vagas)} cadeiras).</p>` : ''}</section>`;
      } else {
        const ele = grupos.reduce((a, x) => a + eleitosDe(x), 0), tn = grupos.reduce((a, x) => a + x.tn, 0), tl = grupos.reduce((a, x) => a + x.tl, 0);
        painel = `<section class="painel resumo"><div class="centro-t">${esc(nomeUf)} · ${esc(cargo)} · 1º turno</div><div class="resumo-t"><span><b>${fInt(ele)}</b> eleitos · <b>${fInt(lista.length)}</b> candidatos</span><span>${fInt(vv)} votos válidos</span></div><p class="sub" style="margin:6px 0 0">Nominais: <b>${fInt(tn)}</b> · Legenda: <b>${fInt(tl)}</b>${g.qe ? ` · Quociente eleitoral: <b>${fInt(g.qe)}</b>` : ''}</p></section>`;
      }
      const titulo = pt ? `Candidatos de ${esc(pt.sg)}` : grDoP ? `Candidatos ${grDoP.tp === 'f' ? 'da federação' : 'de ' + esc(grDoP.par[0].sg)}` : 'Todos os candidatos';
      el.innerHTML = `<section class="painel"><h2>Federações e partidos</h2><p class="sub">O número ao lado da sigla é a quantidade de eleitos. Federações têm a faixa com as cores dos partidos; escolha uma para ver cada partido dela.</p><div class="chips-p">${chipsG}</div>${chipsP}</section>
      ${painel}
      <section class="painel"><h2>${titulo}: ${fInt(lista.length)}</h2><p class="sub">Ordenados por votos. Clique nos títulos para reordenar.</p><div id="tab-dc"></div></section>`;
      const pos = new Map(todosCand(g).sort((a, b) => b.v - a.v).map((c, i) => [c.n + c.sg, i + 1]));
      const rows = lista.map(c => ({ ...c, pos: pos.get(c.n + c.sg), pc: vv ? 100 * c.v / vv : 0 }));
      const cols = [
        { k: 'pos', t: '#', h: x => `${x.pos}º`, v: x => x.pos, cls: 'n' },
        { k: 'nm', t: 'Candidato', h: x => `<b>${esc(nomeP(x.nm))}</b> <small><span class="dot-p" style="background:${corPartido(x.sg)}"></span>${logoP(x.sg, 'lg-m')}${esc(x.sg)} · ${esc(x.n)}</small>${x.e ? ' <span class="gv-sel">Eleito(a)</span>' : ''}`, v: x => x.nm, x: x => x.nm },
        { k: 'v', t: 'Votos', h: x => fInt(x.v), v: x => x.v, cls: 'n' },
        { k: 'pc', t: '%', h: x => fNum(x.pc, 2) + '%', v: x => x.pc, x: x => x.pc, cls: 'n sec' },
      ];
      tabela(el.querySelector('#tab-dc'), { cols, rows, sort: 'pos', dir: 'asc', filtro: (x, q) => sem(x.nm).includes(q), limite: 300 });
      ctx.csv = () => ({ nome: `${uf}_${tipo}_1turno`, cab: ['Posição', 'Candidato', 'Partido', 'Número', 'Votos', '% votos válidos', 'Situação'], linhas: rows.map(x => [x.pos, x.nm, x.sg, x.n, x.v, x.pc.toFixed(2), x.st]) });
    }).catch(() => { root.querySelector('#dep-corpo').innerHTML = '<p class="aviso">Dados ainda indisponíveis. Tente de novo em instantes.</p>'; });
  } };
}
