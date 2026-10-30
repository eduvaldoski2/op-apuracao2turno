// Página do candidato (deputado): descida estado > região > município > região do município > bairro > local de votação > seção.
// Os quadros de números acompanham o nível em que a pessoa está. Dados: data/dep_mun (por município), data/dep_sec (por seção),
// data/bairros (locais de votação), data/bairros_geo (limites), data/regioes_uf (regiões do estado).
import { fInt, fNum } from './util.js?v=3e0c8414';
import { esc, tabela, sem } from './ui.js?v=3e0c8414';
import { getJSON } from './tse.js?v=3e0c8414';
import { criarMapaMun } from './mapamun.js?v=3e0c8414';
import { criarMapaBairros } from './mapabairros.js?v=3e0c8414';
import { criarMapaPontos } from './mapapontos.js?v=3e0c8414';

const cache = new Map(), pega = (u, o) => { if (!cache.has(u)) cache.set(u, getJSON(u, o).catch(e => { cache.delete(u); throw e; })); return cache.get(u); };


// lista com busca por nome e ordenação (setas) — usada em toda lista geográfica da página
export function listaBusca(host, { itens, render, filtro, bind, inicial = 'v' }) {
  let k = inicial, d = k === 'nome' ? 'asc' : 'desc', q = '';
  host.classList.add('lb');
  host.innerHTML = `<div class="lb-ctl sem-export"><input type="search" placeholder="Buscar pelo nome…" aria-label="Buscar pelo nome"><span class="lb-n"></span></div><div class="lb-ord sem-export" role="group" aria-label="Ordenar"><button type="button" data-k="nome">Nome <i></i></button><button type="button" data-k="v">Votos <i></i></button></div><div class="lb-corpo"></div>`;
  const corpo = host.querySelector('.lb-corpo');
  const ordena = arr => arr.slice().sort((a, b) => (k === 'nome' ? String(a.nome).localeCompare(String(b.nome), 'pt-BR') : (a.v - b.v)) * (d === 'asc' ? 1 : -1));
  const desenha = () => {
    const rs = ordena(itens.filter(x => !q || filtro(x, q)));
    corpo.innerHTML = rs.length ? rs.map(x => render(x, q, ordena)).join('') : '<p class="aviso">Nada encontrado com esse nome.</p>';
    host.querySelector('.lb-n').textContent = `${rs.length} de ${itens.length}`;
    host.querySelectorAll('.lb-ord button').forEach(b => { const on = b.dataset.k === k; b.classList.toggle('on', on); b.querySelector('i').textContent = on ? (d === 'asc' ? '▲' : '▼') : '↕'; b.setAttribute('aria-pressed', String(on)); });
    bind?.(corpo);
  };
  host.querySelector('input').addEventListener('input', e => { q = sem(e.target.value.trim()); desenha(); });
  host.querySelector('.lb-ord').addEventListener('click', e => { const b = e.target.closest('button'); if (!b) return; if (b.dataset.k === k) d = d === 'asc' ? 'desc' : 'asc'; else { k = b.dataset.k; d = k === 'nome' ? 'asc' : 'desc'; } desenha(); });
  desenha();
}

export async function candidatoDin(ctx, sec, { uf, tipo, arq, c, cor, todos, sit, nomeUf, vv, H }) {
  const { bonito, stat, nomeGrupo, sgTxt } = H;
  const bm = ctx.B?.byUf?.[uf] || [], cdi = new Map(bm.map(b => [b.cd, String(b.cdi)])), cdPorIbge = new Map(bm.map(b => [String(b.cdi), b.cd])), nomeMun = new Map(bm.map(b => [b.cd, bonito(b.nome)]));
  let M;
  try { M = await pega(`data/dep_mun/${arq}/${uf}.json`, { retries: 2 }); } catch { sec.innerHTML = '<h2>Votação por região e município</h2><p class="aviso">A votação por município deste candidato ainda não está disponível.</p>'; return; }
  const meu = M.c?.[c.n]; if (!meu) { sec.innerHTML = '<h2>Votação por região e município</h2><p class="aviso">Sem votos por município deste candidato.</p>'; return; }
  const nm = cd => nomeMun.get(cd) || bonito(M.m[cd] || cd);
  const meta = new Map(todos.map(x => [x.n, { sg: x.sg, gr: x.gr }])), eu = meta.get(c.n);
  // votos de todos os candidatos por município (para totais e posições)
  const porMun = {}; for (const [n, o] of Object.entries(M.c)) for (const [cd, v] of Object.entries(o)) (porMun[cd] ??= {})[n] = v;
  const rank = cds => {   // posição geral, na federação e no partido para um conjunto de municípios
    const s = new Map(); for (const cd of cds) for (const [n, v] of Object.entries(porMun[cd] || {})) s.set(n, (s.get(n) || 0) + v);
    const arr = [...s.entries()].sort((a, b) => b[1] - a[1]), tot = arr.reduce((t, x) => t + x[1], 0);
    const pos = f => { const l = arr.filter(([n]) => f(meta.get(n))); const i = l.findIndex(([n]) => n === c.n); return { p: i + 1, de: l.length }; };
    return { tot, geral: pos(() => true), gr: pos(m => m && m.gr === eu.gr), pt: pos(m => m && m.sg === eu.sg), meu: s.get(c.n) || 0 };
  };
  const todosCds = Object.keys(M.m);
  const mix = t => { const a = [238, 240, 247], b = [1, 3, 5].map(i => parseInt(cor.slice(i, i + 2), 16)); return '#' + a.map((x, i) => Math.round(x + (b[i] - x) * t).toString(16).padStart(2, '0')).join(''); };
  const PALE = '#ece9f4', ehFed = !!H.ehFed;
  // regiões do estado
  let regioes = [];
  try {
    if (uf === 'rj') { const d = await pega('data/regioes/uf-rj.json', { retries: 1 }), por = new Map(bm.map(b => [sem(b.nome), b.cd])); regioes = Object.entries(d.regioes).map(([nome, ms]) => ({ nome, cds: ms.map(n => por.get(sem(n))).filter(Boolean) })); }
    else { const d = await pega(`data/regioes_uf/${uf}.json`, { retries: 1 }); regioes = d.regioes.map(r => ({ nome: r.nome, cds: r.muns.map(i => cdPorIbge.get(i)).filter(Boolean) })); }
    regioes = regioes.filter(r => r.cds.length);
  } catch { regioes = []; }
  const nav = { reg: null, cd: null, d: null, b: null, l: null };
  let munDados = null;   // dados do município aberto
  const el = sec;

  const caixas = (lista) => `<div class="dp-ks">${lista.join('')}</div>`;
  const pcDe = (v, t) => `${fNum(t ? 100 * v / t : 0, 1)}%`;
  const itemLista = (i, nome, sub, v, extra, max) => `<button type="button" class="dsc-l" data-i="${i}"><span class="dsc-n">${esc(nome)}${sub ? `<small>${esc(sub)}</small>` : ''}</span><span class="dsc-v">${fInt(v)}<small>${extra}</small></span><i class="dsc-b"><i style="width:${max ? 100 * v / max : 0}%;background:${cor}"></i></i></button>`;

  async function carregaMun(cd) {
    if (munDados?.cd === cd) return munDados;
    const [cand, z, loc, geo] = await Promise.all([pega(`data/dep_sec/${arq}/${uf}/${c.n}.json`, { retries: 2 }), pega(`data/dep_sec/z/${uf}/${cd}.json`, { retries: 2 }), pega(`data/bairros/${uf}/${cd}.json`, { retries: 1 }).catch(() => null), pega(`data/bairros_geo/${cd}.json`, { retries: 0 }).catch(() => null)]);
    const flat = cand[cd] || [], secoes = []; let idx = 0;
    for (let i = 0; i < flat.length; i += 2) { idx += flat[i]; const [zona, s, lc] = z[idx]; secoes.push({ zona, sec: s, lc, v: flat[i + 1] }); }
    const info = new Map(); for (const r of loc?.l || []) info.set(`${r[0]}-${r[1]}`, { nome: r[2], end: r[3], bairro: r[4], lat: r[6], lon: r[7] });
    const locais = new Map();
    for (const x of secoes) { const k = `${x.zona}-${x.lc}`, i = info.get(k) || { nome: `Local ${x.lc} (zona ${x.zona})`, end: '', bairro: 'Sem bairro informado' }; let L = locais.get(k); if (!L) locais.set(k, L = { k, ...i, v: 0, secoes: [] }); L.v += x.v; L.secoes.push(x); }
    const geoD = geo && geo.rotulo === 'distrito' ? geo : null, geoB = geo && geo.rotulo !== 'distrito' ? geo : null;
    for (const L of locais.values()) { const gi = geo?.loc?.[L.k]; L.gi = gi ?? null; }
    munDados = { cd, secoes, locais: [...locais.values()], geo, geoD, geoB, soma: secoes.reduce((a, x) => a + x.v, 0) };
    return munDados;
  }
  const grupos = (locais, porIdx, geo) => {   // bairros: polígonos da malha de bairros quando existe; senão o bairro do cadastro do TSE
    const mp = new Map();
    for (const L of locais) { const poli = porIdx && L.gi != null; const k = poli ? 'g' + L.gi : 't' + L.bairro; let g = mp.get(k); if (!g) mp.set(k, g = { k, nome: poli ? geo.f[L.gi].n : L.bairro, gi: poli ? L.gi : null, v: 0, locais: [] }); g.v += L.v; g.locais.push(L); }
    return [...mp.values()].sort((a, b) => b.v - a.v);
  };

  async function render() {
    el.querySelector('.carregando')?.remove();
    const regSel = nav.reg != null ? regioes[nav.reg] : null;
    let titulo = nomeUf, quadros = '', corpo = '', pos = null, mun = null; const jobs = [];
    const trilha = [`<button type="button" data-n="estado">${esc(nomeUf)}</button>`];
    if (regSel) trilha.push(nav.cd ? `<button type="button" data-n="reg">${esc(regSel.nome)}</button>` : `<b>${esc(regSel.nome)}</b>`);
    if (nav.cd) { try { mun = await carregaMun(nav.cd); } catch { mun = null; } }
    // ----- níveis acima do município -----
    if (!nav.cd) {
      const cds = regSel ? regSel.cds.filter(cd => M.m[cd]) : todosCds, r = rank(cds), minha = r.meu;
      titulo = regSel ? regSel.nome : nomeUf;
      quadros = caixas([stat(regSel ? `Votos em ${regSel.nome}` : 'Votos no estado', fInt(minha), regSel ? `${pcDe(minha, c.v)} dos votos dele` : `${fNum(vv ? 100 * c.v / vv : 0, 2)}% dos válidos`), stat(regSel ? 'Posição na região' : 'Posição no estado', `${r.geral.p}º`, `entre ${fInt(r.geral.de)} candidatos`), stat(ehFed ? 'Posição na federação' : 'Posição no partido', `${r.gr.p}º`, `entre ${fInt(r.gr.de)}`), ehFed ? stat('Posição no partido', `${r.pt.p}º`, `entre ${fInt(r.pt.de)} do ${esc(sgTxt(c.sg))}`) : stat('Total de votos nominais', fInt(r.tot), `${pcDe(minha, r.tot)} são dele`)]);
      const regs = regioes.map((g, i) => ({ i, nome: g.nome, n: g.cds.length, v: g.cds.reduce((t, cd) => t + (meu[cd] || 0), 0) })), rmax = Math.max(1, ...regs.map(g => g.v));
      if (!regSel && regs.length) jobs.push({ sel: '#cd-regs', itens: regs, filtro: (g, q) => sem(g.nome).includes(q), render: g => itemLista(g.i, g.nome, `${fInt(g.n)} municípios`, g.v, pcDe(g.v, c.v), rmax), bind: h => h.querySelectorAll('.dsc-l').forEach(b => b.addEventListener('click', () => ir({ reg: +b.dataset.i }))) });
      corpo = (!regSel && regs.length ? `<h3>Regiões do estado</h3><div id="cd-regs"></div>` : '') + `<h3>Municípios${regSel ? ' da região' : ''}</h3><div id="cd-mapa"></div><div id="cd-tab"></div>`;
    } else if (mun) {
      const cd = nav.cd, r = rank([cd]), geoD = mun.geoD, geoB = mun.geoB, geo = mun.geo;
      const dSel = nav.d != null ? geoD?.f[nav.d] : null;
      let locais = mun.locais; if (nav.d != null) locais = locais.filter(L => L.gi === nav.d);
      const gruposB = grupos(locais, !!geoB, geoB), bSel = nav.b != null ? gruposB.find(g => g.k === nav.b) : null, lSel = nav.l != null ? mun.locais.find(L => L.k === nav.l) : null;
      titulo = nm(cd);
      trilha.push(nav.d != null || nav.b != null || nav.l != null ? `<button type="button" data-n="mun">${esc(nm(cd))}</button>` : `<b>${esc(nm(cd))}</b>`);
      if (dSel) trilha.push(nav.b != null || nav.l != null ? `<button type="button" data-n="dist">${esc(bonito(dSel.n))}</button>` : `<b>${esc(bonito(dSel.n))}</b>`);
      if (bSel) trilha.push(nav.l != null ? `<button type="button" data-n="bairro">${esc(bonito(bSel.nome))}</button>` : `<b>${esc(bonito(bSel.nome))}</b>`);
      if (lSel) trilha.push(`<b>${esc(bonito(lSel.nome))}</b>`);
      // quadros do nível
      const nSec = x => x.reduce((t, L) => t + L.secoes.length, 0);
      if (lSel) quadros = caixas([stat('Votos no local', fInt(lSel.v), `${pcDe(lSel.v, mun.soma)} dos votos dele em ${esc(nm(cd))}`), stat('Seções', fInt(lSel.secoes.length), esc(bonito(lSel.end))), stat('Melhor seção', fInt(Math.max(...lSel.secoes.map(x => x.v))), `zona ${lSel.secoes.slice().sort((a, b) => b.v - a.v)[0].zona}, seção ${lSel.secoes.slice().sort((a, b) => b.v - a.v)[0].sec}`)]);
      else if (bSel) quadros = caixas([stat(`Votos em ${bonito(bSel.nome)}`, fInt(bSel.v), `${pcDe(bSel.v, mun.soma)} dos votos dele em ${esc(nm(cd))}`), stat('Locais de votação', fInt(bSel.locais.length), `${fInt(nSec(bSel.locais))} seções`), stat('Média por seção', fNum(nSec(bSel.locais) ? bSel.v / nSec(bSel.locais) : 0, 1), 'votos')]);
      else if (dSel) { const v = locais.reduce((t, L) => t + L.v, 0); quadros = caixas([stat(`Votos em ${bonito(dSel.n)}`, fInt(v), `${pcDe(v, mun.soma)} dos votos dele em ${esc(nm(cd))}`), stat('Locais de votação', fInt(locais.length), `${fInt(nSec(locais))} seções`), stat('Média por seção', fNum(nSec(locais) ? v / nSec(locais) : 0, 1), 'votos')]); }
      else quadros = caixas([stat(`Votos em ${nm(cd)}`, fInt(r.meu), `${pcDe(r.meu, c.v)} dos votos dele no estado`), stat('Posição no município', `${r.geral.p}º`, `entre ${fInt(r.geral.de)} candidatos`), stat(ehFed ? 'Posição na federação' : 'Posição no partido', `${r.gr.p}º`, `entre ${fInt(r.gr.de)}`), stat('% dos votos nominais', pcDe(r.meu, r.tot), `${fInt(r.tot)} votos nominais no município`)]);
      // corpo
      let lista = '';
      if (lSel) {
        const mx = Math.max(1, ...lSel.secoes.map(y => y.v));
        lista = `<h3>Seções · ${esc(bonito(lSel.nome))}</h3><p class="sub">${esc(bonito(lSel.end))}</p><div id="cd-secs"></div>`;
        jobs.push({ sel: '#cd-secs', itens: lSel.secoes.map(x => ({ ...x, nome: `Zona ${x.zona} · seção ${x.sec}` })), filtro: (x, q) => sem(x.nome).includes(q) || String(x.sec).includes(q), render: x => `<div class="dsc-l fim"><span class="dsc-n">${esc(x.nome)}</span><span class="dsc-v">${fInt(x.v)}<small>${pcDe(x.v, mun.soma)}</small></span><i class="dsc-b"><i style="width:${100 * x.v / mx}%;background:${cor}"></i></i></div>` });
      } else if (bSel) {
        const mx = Math.max(1, ...bSel.locais.map(L => L.v));
        lista = `<h3>Locais de votação em ${esc(bonito(bSel.nome))}</h3><div id="cd-locs"></div>`;
        jobs.push({ sel: '#cd-locs', itens: bSel.locais.map(L => ({ ...L, nome: bonito(L.nome) })), filtro: (L, q) => sem(L.nome).includes(q) || sem(L.end || '').includes(q), render: L => `<button type="button" class="dsc-l" data-k="${esc(L.k)}"><span class="dsc-n">${esc(L.nome)}<small>${esc(bonito(L.end))}</small></span><span class="dsc-v">${fInt(L.v)}<small>${L.secoes.length} seções</small></span><i class="dsc-b"><i style="width:${100 * L.v / mx}%;background:${cor}"></i></i></button>`, bind: h => h.querySelectorAll('.dsc-l').forEach(b => b.addEventListener('click', () => ir({ l: b.dataset.k }))) });
      } else if (geoD && nav.d == null) {
        const ds = geoD.f.map((f, i) => { const ls = mun.locais.filter(L => L.gi === i); const gb = grupos(ls, false, null).map(g => ({ ...g, nome: bonito(g.nome) })); return { i, nome: bonito(f.n), v: ls.reduce((t, L) => t + L.v, 0), nl: ls.length, gb }; }).filter(d => d.v > 0), dmax = Math.max(1, ...ds.map(d => d.v));
        lista = `<h3>Distritos e bairros</h3><p class="sub">Busque pelo nome do distrito ou do bairro. Toque no distrito para ver os bairros dentro dele; no mapa, toque num distrito para abri-lo.</p><div id="cd-dists"></div>`;
        jobs.push({ sel: '#cd-dists', itens: ds, filtro: (d, q) => sem(d.nome).includes(q) || d.gb.some(g => sem(g.nome).includes(q)), render: (d, q, ordena) => {
          const casaD = q && sem(d.nome).includes(q), bs = ordena(q && !casaD ? d.gb.filter(g => sem(g.nome).includes(q)) : d.gb), bm = Math.max(1, ...d.gb.map(g => g.v));
          return `<details class="dsc-d"${q && !casaD ? ' open' : ''}><summary><span class="dsc-l dsc-dl"><span class="dsc-n">${esc(d.nome)}<small>${d.nl} locais · ${d.gb.length} bairros</small></span><span class="dsc-v">${fInt(d.v)}<small>${pcDe(d.v, mun.soma)}</small></span><i class="dsc-b"><i style="width:${100 * d.v / dmax}%;background:${cor}"></i></i></span></summary><div class="dsc-bs"><button type="button" class="dsc-go" data-i="${d.i}">Ver só este distrito no mapa →</button>${bs.map(g => `<button type="button" class="dsc-l dsc-bl" data-d="${d.i}" data-b="${esc(g.k)}"><span class="dsc-n">${esc(g.nome)}<small>${g.locais.length} ${g.locais.length === 1 ? 'local' : 'locais'}</small></span><span class="dsc-v">${fInt(g.v)}<small>${pcDe(g.v, mun.soma)}</small></span><i class="dsc-b"><i style="width:${100 * g.v / bm}%;background:${cor}"></i></i></button>`).join('')}</div></details>`;
        }, bind: h => { h.querySelectorAll('.dsc-go').forEach(b => b.addEventListener('click', () => ir({ d: +b.dataset.i, b: null, l: null }))); h.querySelectorAll('.dsc-bl').forEach(b => b.addEventListener('click', () => ir({ d: +b.dataset.d, b: b.dataset.b, l: null }))); } });
      } else {
        const bmx = Math.max(1, ...gruposB.map(g => g.v));
        lista = `<h3>Bairros${dSel ? ' · ' + esc(bonito(dSel.n)) : ''}</h3><div id="cd-bairros"></div>`;
        jobs.push({ sel: '#cd-bairros', itens: gruposB.map(g => ({ ...g, nome: bonito(g.nome) })), filtro: (g, q) => sem(g.nome).includes(q), render: g => `<button type="button" class="dsc-l" data-k="${esc(g.k)}"><span class="dsc-n">${esc(g.nome)}<small>${g.locais.length} ${g.locais.length === 1 ? 'local' : 'locais'}</small></span><span class="dsc-v">${fInt(g.v)}<small>${pcDe(g.v, mun.soma)}</small></span><i class="dsc-b"><i style="width:${100 * g.v / bmx}%;background:${cor}"></i></i></button>`, bind: h => h.querySelectorAll('.dsc-l').forEach(b => b.addEventListener('click', () => ir({ b: b.dataset.k, l: null }))) });
      }
      corpo = (lSel || bSel ? '' : '<div id="cd-mapa"></div>') + lista;
      pos = { gruposB, locais, geoD, geoB, geo };
    } else corpo = `<p class="aviso">A votação por seção deste candidato não está disponível para ${esc(nm(nav.cd))}.</p>`;
    delete el.dataset.expSec; el.classList.remove('tem-exp');
    el.innerHTML = `<h2>Votação de ${esc(bonito(c.nm))} · ${esc(titulo)}</h2><div class="dsc-t">${trilha.join(' › ')}</div>${quadros}${corpo}`;
    el.querySelectorAll('[data-n]').forEach(b => b.addEventListener('click', () => { const t = b.dataset.n; if (t === 'estado') Object.assign(nav, { reg: null, cd: null, d: null, b: null, l: null }); else if (t === 'reg') Object.assign(nav, { cd: null, d: null, b: null, l: null }); else if (t === 'mun') Object.assign(nav, { d: null, b: null, l: null }); else if (t === 'dist') Object.assign(nav, { b: null, l: null }); else if (t === 'bairro') Object.assign(nav, { l: null }); render(); topo(); }));
    for (const j of jobs) { const h = el.querySelector(j.sel); if (h) listaBusca(h, j); }
    if (!nav.cd) desenhaEstado(regSel);
    else if (mun && pos) desenhaMun(mun, pos);
  }
  const topo = () => el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  const ir = obj => { Object.assign(nav, obj); render(); topo(); };

  function desenhaEstado(regSel) {
    const regs = regioes;
    const cds = (regSel ? regSel.cds : todosCds).filter(cd => M.m[cd]), set = new Set(cds);
    const rows = cds.filter(cd => meu[cd]).map(cd => ({ cd, nome: nm(cd), v: meu[cd], pc: c.v ? 100 * meu[cd] / c.v : 0, pt: (porMun[cd] && Object.values(porMun[cd]).reduce((a, b) => a + b, 0)) ? 100 * meu[cd] / Object.values(porMun[cd]).reduce((a, b) => a + b, 0) : 0 })).sort((a, b) => b.v - a.v);
    const max = Math.max(1, ...rows.map(r => r.v));
    if (uf !== 'df') pega(`data/mapa_mun/${uf}.json`, { retries: 1 }).then(geo => {
      const porIbge = new Map(rows.map(r => [cdi.get(r.cd), r])), alvo = el.querySelector('#cd-mapa'); if (!alvo) return;
      const g2 = JSON.parse(JSON.stringify({ viewBox: geo.viewBox, k: geo.k, uf: geo.uf, muns: geo.muns }));
      for (const [id, gm] of Object.entries(g2.muns)) { const cdm = cdPorIbge.get(id); if (cdm) gm.n = nm(cdm); }
      const mp = criarMapaMun(alvo, g2, { onClick: id => { const cdm = cdPorIbge.get(id); if (cdm && meu[cdm]) abrir(cdm); }, tooltip: id => { const r = porIbge.get(id); return r ? `<b>${esc(r.nome)}</b><br>${fInt(r.v)} votos` : ''; } });
      const dados = {}; for (const b of bm) { const i = cdi.get(b.cd); if (!i) continue; if (regSel && !set.has(b.cd)) { dados[i] = { k: 1, pw: 1, fill: '#f1eff6', lab: '' }; continue; } const r = porIbge.get(i); dados[i] = r ? { k: 1, pw: 1, fill: mix(.12 + .88 * Math.sqrt(r.v / max)), lab: '' } : { k: 1, pw: 1, fill: PALE, lab: '' }; }
      mp.atualizar(dados);
    }).catch(() => {});
    tabela(el.querySelector('#cd-tab'), { onRow: x => abrir(x.cd), cols: [
      { k: 'nome', t: 'Município', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, x: x => x.nome, ini: 'asc' },
      { k: 'v', t: 'Votos', h: x => fInt(x.v), v: x => x.v, cls: 'n' },
      { k: 'pc', t: '% dos votos dele', h: x => fNum(x.pc, 1) + '%', v: x => x.pc, x: x => x.pc, cls: 'n sec' },
      { k: 'pt', t: '% nominais do município', h: x => fNum(x.pt, 1) + '%', v: x => x.pt, x: x => x.pt, cls: 'n sec' },
    ], rows, sort: 'v', dir: 'desc', filtro: (x, q) => sem(x.nome).includes(q), limite: 1000 });
  }
  const abrir = cd => ir({ cd, d: null, b: null, l: null });

  function desenhaMun(mun, { gruposB, locais, geoD, geoB, geo }) {
    const alvo = el.querySelector('#cd-mapa'); if (!alvo) return; const max = Math.max(1, ...mun.locais.map(L => L.v));
    // mapa do município: regiões/distritos, bairros (malha do IBGE) ou, sem malha, um ponto por local de votação
    if (geo) {
      const soma = {}; for (const L of mun.locais) if (L.gi != null) soma[L.gi] = (soma[L.gi] || 0) + L.v;
      const mx = Math.max(1, ...Object.values(soma));
      const dados = {}; geo.f.forEach((f, i) => { const sel = geoD ? nav.d : (nav.b != null ? gruposB.find(g => g.k === nav.b)?.gi : null); const v = soma[i] || 0; dados[i] = { k: 1, pw: 1, lab: '', fill: sel != null && sel !== i ? '#f1eff6' : (v ? mix(.15 + .85 * Math.sqrt(v / mx)) : PALE) }; });
      const mp = criarMapaBairros(alvo, geo, { nome: bonito, onClick: i => { if (geoD) { if (soma[i]) ir({ d: i, b: null, l: null }); } else { const g = grupos(mun.locais, true, geoB).find(x => x.gi === i); if (g) ir({ b: g.k, l: null }); } }, tooltip: i => `<b>${esc(bonito(geo.f[i].n))}</b><br>${fInt(soma[i] || 0)} votos` });
      mp.atualizar(dados);
    } else {
      const pts = mun.locais.filter(L => L.lat != null && L.lat !== 0).map(L => ({ id: L.k, lat: L.lat, lon: L.lon, ap: Math.max(1, L.v) * 40 })), selB = nav.b != null ? gruposB.find(g => g.k === nav.b) : null;
      if (pts.length >= 3) { const mp = criarMapaPontos(alvo, pts, { onClick: id => { const L = mun.locais.find(x => x.k === id); if (L) ir({ b: 't' + L.bairro, l: id }); }, tooltip: id => { const L = mun.locais.find(x => x.k === id); return `<b>${esc(bonito(L.nome))}</b><br>${fInt(L.v)} votos`; } });
        const dados = {}; for (const L of mun.locais) { const dentro = !selB || selB.locais.includes(L) && (nav.l == null || nav.l === L.k); dados[L.k] = { fill: dentro ? mix(.2 + .8 * Math.sqrt(L.v / max)) : '#e0dde9' }; } mp.atualizar(dados); }
      else alvo.remove();
    }
  }
  await render();
}
