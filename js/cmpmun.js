// Comparar candidatos: descida dentro do município (região/distrito > bairro > local de votação > seção).
// Dados: branches hist-<ano> (locais/<uf>/<cd>.json; <eleição>/<uf>/<cd>.json com as seções; votos do candidato por seção)
// e data/bairros_geo, data/regioes (limites e nomes de distritos/bairros). Funciona para qualquer ano/cargo que tenha base por seção.
import { CONFIG } from './config.js?v=5f5759e6';
import { getJSON } from './tse.js?v=5f5759e6';
import { esc, sem, tabela } from './ui.js?v=5f5759e6';
import { fNum, fInt } from './util.js?v=5f5759e6';
import { baixarCSV } from './export.js?v=5f5759e6';

const RAW = `https://raw.githubusercontent.com/${CONFIG.repo}/`;
const cache = new Map();
const pega = (u, o = {}) => { if (!cache.has(u)) cache.set(u, getJSON(u, { retries: 2, timeout: 60000, ...o }).catch(e => { cache.delete(u); throw e; })); return cache.get(u); };
const arq = (ano, rel) => pega(`${RAW}hist-${ano}/${rel}`);
const bonito = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());
const NIVEIS = { dist: 'Região', bairro: 'Bairro', local: 'Local de votação', secao: 'Seção' };
const PROX = { dist: 'bairro', bairro: 'local', local: 'secao' };

// votos de uma candidatura por seção (chave "zona-seção") e total de votos válidos de cada seção
async function dadosCand(c, t, uf, cd) {
  const [ano, cargo, , , , n] = c, id = `c${cargo}t${t || 1}`;
  const sec = await arq(ano, `${id}/${uf}/${cd}.json`);
  const votos = new Map();
  const triplas = l => { for (let i = 0; i + 2 < (l || []).length; i += 3) { const k = `${l[i]}-${l[i + 1]}`; votos.set(k, (votos.get(k) || 0) + l[i + 2]); } };
  if (cargo === 6 || cargo === 7 || cargo === 8) triplas(((await arq(ano, `${id}/${uf}/c/${n}.json`)).s || {})[cd]);
  else if (cargo === 13) {
    const ci = (sec.cands || []).findIndex(x => x.n === n); if (ci < 0) throw new Error('candidato sem votos neste município');
    triplas(((await arq(ano, `${id}/${uf}/${cd}/cs.json`).catch(() => ({})))[ci]) || []);
  } else {
    const cands = sec.cands || (await arq(ano, `${id}/${uf}.json`)).cands || [], ci = cands.findIndex(x => x.n === n); if (ci < 0) throw new Error('candidato sem votos neste município');
    for (const [k, l] of Object.entries(sec.s || {})) votos.set(k, l[4 + ci] || 0);
  }
  const tot = new Map(); for (const [k, l] of Object.entries(sec.s || {})) tot.set(k, Math.max(0, (l[1] || 0) - (l[2] || 0) - (l[3] || 0)));
  const loc = await arq(ano, `locais/${uf}/${cd}.json`).catch(() => ({ l: [] }));
  let ls = loc.l || [];
  const semLoc = !ls.length;
  if (semLoc) { const pz = new Map(); for (const k of tot.keys()) { const [z, s] = k.split('-').map(Number); if (!pz.has(z)) pz.set(z, []); pz.get(z).push(s); } ls = [...pz].sort((x, y) => x[0] - y[0]).map(([z, ss]) => [z, 0, `Zona ${z}`, '', '', null, null, ss, -1, -1]); }
  return { ano, votos, tot, locais: ls, semLoc };
}

export async function abrirMunicipio(host, { cs, cores, rotulo, mun, fechar }) {
  const { cd, uf, nome } = mun, nC = cs.length;
  host.innerHTML = `<section class="cc-md"><p class="aviso">Carregando locais de votação e seções de ${esc(nome)}…</p></section>`;
  host.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  const [geo, geoB] = await Promise.all([pega(`data/bairros_geo/${cd}.json`, { retries: 0 }).catch(() => null), pega(`data/regioes/${cd}_bairros.json`, { retries: 0 }).catch(() => null)]);
  const temDist = geo?.rotulo === 'distrito', geoBairro = temDist ? geoB : (geo?.rotulo === 'bairro' ? geo : null);
  const rotDist = geo?.rotuloNome || 'Distrito';
  const res = await Promise.all(cs.map(async x => {
    try {
      if (x.c[1] !== 1 && String(x.c[2]).toLowerCase() !== uf) throw new Error('candidatura de outro estado');
      return await dadosCand(x.c, x.t, uf, cd);
    } catch (e) { return { erro: e?.status === 404 ? 'base por seção indisponível para esta eleição' : (e?.message || 'falha ao carregar') }; }
  }));
  // seções: o cadastro de locais mais recente fornece o bairro/local de cada seção
  const S = new Map();
  const ordem = res.map((r, i) => i).filter(i => !res[i].erro).sort((a, b) => res[b].ano - res[a].ano);
  for (const i of ordem) {
    for (const l of res[i].locais) {
      const [z, nr, lnome, end, baiTse, , , secs, g, b] = l, gb = temDist ? b : g, lid = `${z}-${nr}`;
      const bk = geoBairro && gb >= 0 && geoBairro.f[gb] ? 'g' + gb : 't' + sem(baiTse || '(sem bairro informado)');
      const bn = geoBairro && gb >= 0 && geoBairro.f[gb] ? geoBairro.f[gb].n : (baiTse || '(sem bairro informado)');
      const dk = temDist && g >= 0 && geo.f[g] ? 'd' + g : 'd-', dn = temDist && g >= 0 && geo.f[g] ? geo.f[g].n : '(sem ' + rotDist.toLowerCase() + ')';
      for (const s of secs) { const k = `${z}-${s}`; if (!S.has(k)) S.set(k, { k, z, s, lid, ln: bonito(lnome), end: bonito(end), bk, bn: bonito(bn), dk, dn: bonito(dn), vals: Array(nC).fill(null) }); }
    }
  }
  ordem.forEach(i => {
    const r = res[i];
    for (const [k, t] of r.tot) { let o = S.get(k); if (!o) { const [z, s] = k.split('-').map(Number); S.set(k, o = { k, z, s, lid: `${z}-?`, ln: `Zona ${z}`, end: '', bk: 't?', bn: '(sem bairro informado)', dk: 'd-', dn: '', vals: Array(nC).fill(null) }); } o.vals[i] = { v: r.votos.get(k) || 0, t }; }
  });
  const todas = [...S.values()];
  const temNivel = { dist: temDist && todas.some(o => o.dk !== 'd-'), bairro: true, local: true, secao: true };
  const niveis = Object.keys(NIVEIS).filter(k => temNivel[k]);
  const nav = { nivel: niveis[0], dk: null, bk: null, lid: null };
  const avisos = res.map((r, i) => r.erro ? `<li><i class="cc-dot" style="background:${cores[i]}"></i><b>${esc(rotulo(cs[i]))}</b>: ${esc(r.erro)} (coluna em branco).</li>` : '').join('');
  const semLocAno = res.filter(r => r.semLoc).map(r => r.ano);

  const soma = (arr, i) => { let v = 0, t = 0, n = 0; for (const o of arr) { const x = o.vals[i]; if (x) { v += x.v; t += x.t; n++; } } return n ? { v, t, p: t > 0 ? 100 * v / t : NaN } : null; };
  const filtradas = () => todas.filter(o => (nav.dk == null || o.dk === nav.dk) && (nav.bk == null || o.bk === nav.bk) && (nav.lid == null || o.lid === nav.lid));
  const chaveDe = { dist: o => o.dk, bairro: o => o.bk, local: o => o.lid, secao: o => o.k };
  const nomeDe = { dist: o => o.dn, bairro: o => o.bn, local: o => o.ln, secao: o => `Zona ${o.z} · seção ${o.s}` };
  const subDe = { dist: () => '', bairro: () => '', local: o => [o.end, o.bn].filter(Boolean).join(' · '), secao: o => o.ln };

  const el = host.querySelector('.cc-md');
  let tab = null;
  function render() {
    const fs = filtradas();
    const g = new Map(); for (const o of fs) { const k = chaveDe[nav.nivel](o); let r = g.get(k); if (!r) g.set(k, r = { k, nome: nomeDe[nav.nivel](o), sub: subDe[nav.nivel](o), o, arr: [] }); r.arr.push(o); }
    const rows = [...g.values()].map(r => ({ ...r, n: r.arr.length, vals: cs.map((_, i) => soma(r.arr, i)) }));
    const trilha = [`<button type="button" data-t="mun">${esc(nome)}</button>`];
    if (nav.dk != null) trilha.push(nav.bk != null || nav.lid != null || nav.nivel !== 'bairro' ? `<button type="button" data-t="dk">${esc(todas.find(o => o.dk === nav.dk)?.dn || '')}</button>` : `<b>${esc(todas.find(o => o.dk === nav.dk)?.dn || '')}</b>`);
    if (nav.bk != null) trilha.push(nav.lid != null ? `<button type="button" data-t="bk">${esc(todas.find(o => o.bk === nav.bk)?.bn || '')}</button>` : `<b>${esc(todas.find(o => o.bk === nav.bk)?.bn || '')}</b>`);
    if (nav.lid != null) trilha.push(`<b>${esc(todas.find(o => o.lid === nav.lid)?.ln || '')}</b>`);
    const resumo = cs.map((x, i) => { const s = soma(fs, i); const mx = Math.max(1, ...cs.map((_, j) => soma(fs, j)?.v || 0)); return `<div class="cc-md-r"><span><i class="cc-dot" style="background:${cores[i]}"></i><b>${esc(rotulo(x))}</b></span><span class="cc-md-b"><span style="width:${s ? Math.max(1.5, 100 * s.v / mx) : 0}%;background:${cores[i]}"></span></span><span class="cc-md-v">${s ? `<b>${fInt(s.v)}</b> votos · <b>${isFinite(s.p) ? fNum(s.p, 2) + '%' : '–'}</b>` : '<small>sem dado neste recorte</small>'}</span></div>`; }).join('');
    el.innerHTML = `<div class="cc-md-top"><h3>${esc(nome)} (${esc(uf.toUpperCase())}): comparação por ${niveis.map(k => NIVEIS[k].toLowerCase()).join(', ')}</h3><button type="button" class="chip cc-md-x">Fechar</button></div>
      <nav class="cc-md-trilha" aria-label="Onde você está">${trilha.join(' › ')}</nav>
      <div class="cc-md-resumo">${resumo}</div>
      <div class="cc-md-niv" role="group" aria-label="Ver por"><span>Ver por:</span>${niveis.map(k => `<button type="button" class="chip${k === nav.nivel ? ' on' : ''}" data-n="${k}" aria-pressed="${k === nav.nivel}">${NIVEIS[k]}</button>`).join('')}<button type="button" class="chip cc-md-csv">⬇ Planilha (CSV)</button></div>
      ${avisos ? `<ul class="cc-md-av">${avisos}</ul>` : ''}
      <div id="cc-md-tab"></div>
      <p class="cmp-nota">Percentual = votos da candidatura ÷ votos válidos (nominais e de legenda) da unidade, no turno e na eleição de cada candidatura. ${PROX[nav.nivel] ? 'Toque numa linha para descer ao nível seguinte. ' : ''}Bairros, locais e seções de eleições diferentes são casados pelo nome do bairro/limite do IBGE, pela zona e número do local e pela zona e número da seção; o TSE pode remanejar locais e seções de um ano para outro, e onde a unidade não existia a coluna fica em branco.${semLocAno.length ? ` Em ${semLocAno.join(', ')} o TSE não tem cadastro de locais: a descida é por zona e seção.` : ''} Fonte: TSE.</p>`;
    const cols = [{ k: 'nome', t: NIVEIS[nav.nivel], h: r => `<b>${esc(r.nome)}</b>${r.sub ? `<small class="vt">${esc(r.sub)}</small>` : (nav.nivel !== 'secao' ? `<small class="vt">${fInt(r.n)} ${r.n === 1 ? 'seção' : 'seções'}</small>` : '')}`, v: r => sem(r.nome), x: r => r.nome, ini: 'asc', cls: 'nm' }];
    cs.forEach((x, i) => {
      const nm = `${x.nome} ${x.c[0]}`;
      cols.push({ k: 'v' + i, t: `<span class="cc-th" style="--c:${cores[i]}">${esc(nm)} <small>· votos</small></span>`, h: r => r.vals[i] ? fInt(r.vals[i].v) : '–', v: r => r.vals[i]?.v ?? -1, x: r => r.vals[i]?.v ?? '', cls: 'num' });
      cols.push({ k: 'p' + i, t: `<span class="cc-th" style="--c:${cores[i]}">${esc(nm)} <small>· % válidos</small></span>`, h: r => r.vals[i] && isFinite(r.vals[i].p) ? `<b>${fNum(r.vals[i].p, 2)}%</b>` : '–', v: r => r.vals[i]?.p ?? -1, x: r => r.vals[i] && isFinite(r.vals[i].p) ? fNum(r.vals[i].p, 2) : '', cls: 'num' });
    });
    if (nC > 1) cols.push({ k: 'dif', t: 'Diferença (1ª − 2ª, p.p.)', h: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? `<span class="dlt ${Math.abs(d) < .05 ? 'zero' : d > 0 ? 'pos' : 'neg'}">${d > 0 ? '+' : d < 0 ? '−' : ''}${fNum(Math.abs(d), 1)}</span>` : '–'; }, v: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? d : null; }, x: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? fNum(d, 2) : ''; }, cls: 'num' });
    const desce = PROX[nav.nivel] ? r => {
      if (nav.nivel === 'dist') { nav.dk = r.o.dk; nav.nivel = 'bairro'; }
      else if (nav.nivel === 'bairro') { nav.bk = r.o.bk; nav.nivel = 'local'; }
      else if (nav.nivel === 'local') { nav.lid = r.o.lid; nav.bk ??= r.o.bk; nav.dk ??= r.o.dk; nav.nivel = 'secao'; }
      render();
    } : undefined;
    tab = tabela(el.querySelector('#cc-md-tab'), { cols, rows, sort: 'v0', dir: 'desc', filtro: (r, q) => sem(r.nome + ' ' + r.sub).includes(q), limite: 400, vazio: 'Sem dados neste recorte', onRow: desce });
  }
  host.onclick = e => {
    const b = e.target.closest('button'); if (!b || !el.contains(b)) return;
    if (b.classList.contains('cc-md-x')) { host.innerHTML = ''; fechar?.(); return; }
    if (b.classList.contains('cc-md-csv') && tab) { const d = tab.csv(); baixarCSV(`comparar-candidatos-${sem(nome).replace(/\s+/g, '-')}-por-${NIVEIS[nav.nivel].toLowerCase().replace(/\s+/g, '-')}`, d.cab, d.linhas, ['Fonte: TSE. Percentual = votos ÷ votos válidos da unidade.']); return; }
    if (b.dataset.n) { nav.nivel = b.dataset.n; const ord = Object.keys(NIVEIS), ix = ord.indexOf(nav.nivel); if (ix <= ord.indexOf('dist')) nav.dk = null; if (ix <= ord.indexOf('bairro')) nav.bk = null; if (ix <= ord.indexOf('local')) nav.lid = null; render(); return; }
    if (b.dataset.t) {
      if (b.dataset.t === 'mun') { nav.dk = nav.bk = nav.lid = null; nav.nivel = niveis[0]; }
      else if (b.dataset.t === 'dk') { nav.bk = nav.lid = null; nav.nivel = 'bairro'; }
      else if (b.dataset.t === 'bk') { nav.lid = null; nav.nivel = 'local'; }
      render();
    }
  };
  render();
}
