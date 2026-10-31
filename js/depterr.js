// "Mais votados por território": ranking de candidatos em qualquer nível (estado > região > município > distrito > bairro > local de votação),
// respeitando o partido/federação escolhido na página. Reaproveita os dados da página do candidato (dep_mun, bairros, bairros_geo) e dep_top (mais votados por local).
import { fInt, fNum } from './util.js?v=472774c2';
import { esc, sem } from './ui.js?v=472774c2';
import { getJSON } from './tse.js?v=472774c2';
import { listaBusca } from './depcand.js?v=472774c2';
import { corPartido, corTextoSobre } from './partidos.js?v=472774c2';

const cache = new Map(), pega = (u, o) => { if (!cache.has(u)) cache.set(u, getJSON(u, o).catch(e => { cache.delete(u); throw e; })); return cache.get(u); };

export async function territorioTop(ctx, host, { uf, tipo, arq, todos, lista, base, nomeUf, H, rotuloRecorte }) {
  const { bonito, sgTxt } = H;
  host.innerHTML = '<h2>Mais votados por território</h2><p class="carregando">Carregando…</p>';
  let M; try { M = await pega(`data/dep_mun/${arq}/${uf}.json`, { retries: 2 }); } catch { host.innerHTML = '<h2>Mais votados por território</h2><p class="aviso">A votação por município ainda não está disponível.</p>'; return; }
  const bm = ctx.B?.byUf?.[uf] || [], cdPorIbge = new Map(bm.map(b => [String(b.cdi), b.cd])), nomeMun = new Map(bm.map(b => [b.cd, bonito(b.nome)]));
  const nm = cd => nomeMun.get(cd) || bonito(M.m[cd] || cd);
  const meta = new Map(todos.map(x => [x.n, x])), ok = new Set(lista.map(x => x.n));
  let regioes = [];
  try {
    if (uf === 'rj') { const d = await pega('data/regioes/uf-rj.json', { retries: 1 }), por = new Map(bm.map(b => [sem(b.nome), b.cd])); regioes = Object.entries(d.regioes).map(([nome, ms]) => ({ nome, cds: ms.map(n => por.get(sem(n))).filter(Boolean) })); }
    else { const d = await pega(`data/regioes_uf/${uf}.json`, { retries: 1 }); regioes = d.regioes.map(r => ({ nome: r.nome, cds: r.muns.map(i => cdPorIbge.get(i)).filter(Boolean) })); }
    regioes = regioes.filter(r => r.cds.length);
  } catch { regioes = []; }
  // ranking de um conjunto de municípios (exato) a partir de dep_mun
  const rankMun = cds => {
    const s = new Map(); let tot = 0;
    for (const [n, o] of Object.entries(M.c)) { let v = 0; for (const cd of cds) v += o[cd] || 0; if (v) { tot += v; if (ok.has(n)) s.set(n, v); } }
    return { arr: [...s.entries()].sort((a, b) => b[1] - a[1]), tot };
  };
  const todosCds = Object.keys(M.m), nav = { reg: null, cd: null, d: null, b: null, l: null };
  let mun = null;
  async function carregaMun(cd) {
    if (mun?.cd === cd) return mun;
    const [top, loc, geo] = await Promise.all([pega(`data/dep_top/${arq}/${uf}/${cd}.json`, { retries: 1 }).catch(() => null), pega(`data/bairros/${uf}/${cd}.json`, { retries: 1 }).catch(() => null), pega(`data/bairros_geo/${cd}.json`, { retries: 0 }).catch(() => null)]);
    const info = new Map(); for (const r of loc?.l || []) info.set(`${r[0]}-${r[1]}`, { nome: r[2], end: r[3], bairro: r[4] });
    const locais = Object.entries(top?.l || {}).map(([k, a]) => { const i = info.get(k) || { nome: `Local ${k}`, end: '', bairro: 'Sem bairro informado' }; const t = a[0], c = new Map(); for (let j = 1; j < a.length; j += 2) c.set(String(a[j]), a[j + 1]); return { k, ...i, t, c, gi: geo?.loc?.[k] ?? null }; });
    mun = { cd, top: !!top, locais, geo, geoD: geo && geo.rotulo === 'distrito' ? geo : null, geoB: geo && geo.rotulo !== 'distrito' ? geo : null };
    return mun;
  }
  const soma = ls => { const s = new Map(); let tot = 0; for (const L of ls) { tot += L.t; for (const [n, v] of L.c) if (ok.has(n)) s.set(n, (s.get(n) || 0) + v); } return { arr: [...s.entries()].sort((a, b) => b[1] - a[1]), tot }; };
  const agrupaBairros = (ls, geoB) => { const mp = new Map(); for (const L of ls) { const poli = geoB && L.gi != null, k = poli ? 'g' + L.gi : 't' + L.bairro; let g = mp.get(k); if (!g) mp.set(k, g = { k, nome: bonito(poli ? geoB.f[L.gi].n : L.bairro), locais: [] }); g.locais.push(L); } return [...mp.values()]; };

  const chipC = n => { const c = meta.get(n), cor = corPartido(c.sg); return `<span class="dc-p" style="--pc:${cor};--pt:${corTextoSobre(cor)}">${esc(sgTxt(c.sg))}</span>`; };
  const linhaCand = (n, v, tot, i, extra = false) => { const c = meta.get(n); return `<a class="dtr-c${extra ? ' dtr-extra' : ''}" href="${base}&c=${encodeURIComponent(n)}"><b class="dtr-p">${i + 1}º</b><span class="dtr-n">${esc(bonito(c.nm))}<small>${chipC(n)} ${c.e ? '<i class="sit sit-e">Eleito(a)</i>' : ''}</small></span><span class="dtr-v">${fInt(v)}<small>${tot ? fNum(100 * v / tot, 1) + '%' : ''}</small></span></a>`; };

  async function render() {
    const regSel = nav.reg != null ? regioes[nav.reg] : null;
    let m = null; if (nav.cd) { try { m = await carregaMun(nav.cd); } catch { m = null; } }
    const trilha = [`<button type="button" data-n="estado">${esc(nomeUf)}</button>`];
    if (regSel) trilha.push(nav.cd ? `<button type="button" data-n="reg">${esc(regSel.nome)}</button>` : `<b>${esc(regSel.nome)}</b>`);
    let rk, titulo, filhos = null, filhosTit = '', nota = '';
    const dSel = m && nav.d != null ? m.geoD?.f[nav.d] : null;
    if (!nav.cd) {
      const cds = (regSel ? regSel.cds : todosCds).filter(cd => M.m[cd]); rk = rankMun(cds); titulo = regSel ? regSel.nome : nomeUf;
      if (!regSel && regioes.length) { filhosTit = 'Regiões do estado'; filhos = { sel: 'regs', itens: regioes.map((g, i) => ({ i, nome: g.nome, ...(() => { const r = rankMun(g.cds); return { v: r.tot, lid: r.arr[0], tot: r.tot, sub: `${g.cds.length} municípios` }; })() })), ir: x => { nav.reg = x.i; } }; }
      else { filhosTit = regSel ? 'Municípios da região' : 'Municípios'; filhos = { sel: 'muns', itens: cds.map(cd => { const r = rankMun([cd]); return { cd, nome: nm(cd), v: r.tot, lid: r.arr[0], tot: r.tot }; }).filter(x => x.v), ir: x => { nav.cd = x.cd; nav.d = nav.b = nav.l = null; } }; }
    } else {
      trilha.push(nav.d != null || nav.b != null || nav.l != null ? `<button type="button" data-n="mun">${esc(nm(nav.cd))}</button>` : `<b>${esc(nm(nav.cd))}</b>`);
      titulo = nm(nav.cd);
      if (!m || !m.top) { rk = rankMun([nav.cd]); filhosTit = ''; nota = 'O detalhe por bairro e local de votação deste município ainda não está disponível.'; }
      else {
        const geoD = m.geoD, geoB = m.geoB;
        let ls = m.locais; if (nav.d != null) ls = ls.filter(L => L.gi === nav.d);
        const gb = agrupaBairros(ls, geoB), bSel = nav.b != null ? gb.find(g => g.k === nav.b) : null, lSel = nav.l != null ? m.locais.find(L => L.k === nav.l) : null;
        if (dSel) trilha.push(nav.b != null || nav.l != null ? `<button type="button" data-n="dist">${esc(bonito(dSel.n))}</button>` : `<b>${esc(bonito(dSel.n))}</b>`);
        if (bSel) trilha.push(nav.l != null ? `<button type="button" data-n="bairro">${esc(bSel.nome)}</button>` : `<b>${esc(bSel.nome)}</b>`);
        if (lSel) trilha.push(`<b>${esc(bonito(lSel.nome))}</b>`);
        if (lSel) { rk = soma([lSel]); titulo = bonito(lSel.nome); nota = `${esc(bonito(lSel.end))}. Mostra os 25 mais votados do local.`; }
        else if (bSel) { rk = soma(bSel.locais); titulo = bSel.nome; filhosTit = 'Locais de votação'; filhos = { sel: 'locs', itens: bSel.locais.map(L => { const r = soma([L]); return { k: L.k, nome: bonito(L.nome), sub: bonito(L.end), v: L.t, lid: r.arr[0], tot: L.t }; }), ir: x => { nav.l = x.k; } }; nota = 'Classificação a partir dos 25 mais votados de cada local de votação.'; }
        else if (dSel) { rk = soma(ls); titulo = bonito(dSel.n); filhosTit = 'Bairros'; filhos = { sel: 'bairros', itens: gb.map(g => { const r = soma(g.locais); return { k: g.k, nome: g.nome, sub: `${g.locais.length} ${g.locais.length === 1 ? 'local' : 'locais'}`, v: r.tot, lid: r.arr[0], tot: r.tot }; }), ir: x => { nav.b = x.k; } }; nota = 'Classificação a partir dos 25 mais votados de cada local de votação.'; }
        else {
          rk = rankMun([nav.cd]);
          if (geoD) { const ds = geoD.f.map((f, i) => { const l2 = m.locais.filter(L => L.gi === i); const r = soma(l2); return { i, nome: bonito(f.n), sub: `${l2.length} locais`, v: r.tot, lid: r.arr[0], tot: r.tot }; }).filter(x => x.v); filhosTit = 'Distritos / regiões'; filhos = { sel: 'dists', itens: ds, ir: x => { nav.d = x.i; } }; }
          else { filhosTit = 'Bairros'; filhos = { sel: 'bairros', itens: gb.map(g => { const r = soma(g.locais); return { k: g.k, nome: g.nome, sub: `${g.locais.length} ${g.locais.length === 1 ? 'local' : 'locais'}`, v: r.tot, lid: r.arr[0], tot: r.tot }; }), ir: x => { nav.b = x.k; } }; }
          nota = 'No município, a classificação é exata. Nos distritos, bairros e locais, considera os 25 mais votados de cada local de votação.';
        }
      }
    }
    const N = 15;
    delete host.dataset.expSec; host.classList.remove('tem-exp');
    host.innerHTML = `<h2>Mais votados por território</h2><p class="sub">Escolha um território na lista abaixo para ver quem mais teve votos nele${rotuloRecorte ? ` · <b>${esc(rotuloRecorte)}</b>` : ''}.</p>
      <div class="dsc-t">${trilha.join(' › ')}</div>
      <h3 class="dtr-t">Mais votados · ${esc(titulo)}</h3><div id="dtr-rk" data-export-lista>${rk.arr.length ? rk.arr.slice(0, 100).map(([n, v], i) => linhaCand(n, v, rk.tot, i, i >= N)).join('') : '<p class="aviso">Sem votos para este recorte neste território.</p>'}</div>
      ${rk.arr.length > N ? `<button type="button" class="dtr-mais sem-export" aria-expanded="false">Ver mais candidatos (${Math.min(rk.arr.length, 100) - N})</button>` : ''}
      ${nota ? `<p class="sub">${nota}</p>` : ''}${filhos ? `<h3 class="sem-export">${filhosTit}</h3><div id="dtr-f" class="sem-export"></div>` : ''}`;
    host.dataset.exportTitulo = `Mais votados · ${titulo}${rotuloRecorte ? ' · ' + rotuloRecorte : ''}`;
    host.querySelector('.dtr-mais')?.addEventListener('click', e => { const a = host.classList.toggle('dtr-aberto'); e.currentTarget.setAttribute('aria-expanded', String(a)); e.currentTarget.textContent = a ? 'Ver menos' : `Ver mais candidatos (${Math.min(rk.arr.length, 100) - N})`; });
    host.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { const t = b.dataset.n; if (t === 'estado') Object.assign(nav, { reg: null, cd: null, d: null, b: null, l: null }); else if (t === 'reg') Object.assign(nav, { cd: null, d: null, b: null, l: null }); else if (t === 'mun') Object.assign(nav, { d: null, b: null, l: null }); else if (t === 'dist') Object.assign(nav, { b: null, l: null }); else if (t === 'bairro') Object.assign(nav, { l: null }); render(); }));
    if (filhos) {
      const max = Math.max(1, ...filhos.itens.map(x => x.v));
      listaBusca(host.querySelector('#dtr-f'), { itens: filhos.itens, filtro: (x, q) => sem(x.nome).includes(q) || sem(x.sub || '').includes(q), render: x => `<button type="button" class="dsc-l" data-i="${filhos.itens.indexOf(x)}"><span class="dsc-n">${esc(x.nome)}<small>${x.lid ? `1º: ${esc(bonito(meta.get(x.lid[0]).nm))} (${esc(sgTxt(meta.get(x.lid[0]).sg))}) · ${fInt(x.lid[1])}` : 'sem votos neste recorte'}</small></span><span class="dsc-v">${fInt(x.v)}<small>votos nominais</small></span><i class="dsc-b"><i style="width:${100 * x.v / max}%"></i></i></button>`,
        bind: h => h.querySelectorAll('.dsc-l').forEach(b => b.addEventListener('click', () => { filhos.ir(filhos.itens[+b.dataset.i]); render(); host.scrollIntoView({ behavior: 'smooth', block: 'start' }); })) });
    }
  }
  await render();
}
