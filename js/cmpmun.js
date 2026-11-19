// Comparar candidatos: descida dentro do município (região/distrito > bairro > local de votação > seção).
// Dados: branches hist-<ano> (locais/<uf>/<cd>.json; <eleição>/<uf>/<cd>.json com as seções; votos do candidato por seção)
// e data/bairros_geo, data/regioes (limites e nomes de distritos/bairros). Funciona para qualquer ano/cargo que tenha base por seção.
import { CONFIG } from './config.js?v=fbfcffa0';
import { getJSON } from './tse.js?v=fbfcffa0';
import { esc, sem, tabela } from './ui.js?v=fbfcffa0';
import { fNum, fInt } from './util.js?v=fbfcffa0';

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

// Página própria: #/comparar/candidatos/mun/<uf>/<cd>?a=…&b=…[&t=2][&nv=<nível>&dk=…&bk=…&lid=…]
export function viewCmpMun(ctx, q, uf, cd, H) {
  const refs = H.refsCC(q), turno = q.get('t') === '2' ? 2 : 1, B = ctx.B;
  const m = (B?.muns || []).find(x => String(x.cd) === String(cd) && String(x.uf).toLowerCase() === uf);
  const nome = m ? bonito(m.nome) : `Município ${cd}`;
  const volta = H.hashCC(refs, turno);
  const html = `<section class="painel" id="cm-res" data-export-titulo="Candidaturas comparadas"><h2>Candidaturas comparadas</h2><div id="cm-resumo"><p class="carregando">Carregando as candidaturas e os resultados por seção de ${esc(nome)}…</p></div></section>
    <section class="painel" id="cm-det" data-export-titulo="Comparação por região, bairro, local e seção"><h2 id="cm-h2">Comparação por região, bairro, local de votação e seção</h2><div id="cm-corpo"></div></section>`;
  return { html, sel: '', titulo: `Comparar candidatos em ${nome}`, trilha: [['Brasil', '#/'], ['Comparar', '#/comparar'], ['Candidatos', volta], [nome]], async montar(root) {
    const cres = root.querySelector('#cm-resumo');
    if (!refs.length) { cres.innerHTML = `<div class="aviso">Nenhuma candidatura escolhida. <a href="${volta}">Voltar à comparação</a>.</div>`; return; }
    const ok = (await Promise.allSettled(refs.map(r => H.carregar(r, turno, B)))).filter(x => x.status === 'fulfilled').map(x => x.value);
    if (!ok.length) { cres.innerHTML = `<div class="aviso">Não foi possível carregar as candidaturas. <a href="${volta}">Voltar à comparação</a>.</div>`; return; }
    try { await montar(root, ctx, { cs: ok, cores: H.SLOT, rotulo: H.rotulo, mun: { cd: String(cd), uf, nome }, q, volta }); }
    catch (e) { cres.innerHTML = `<div class="aviso">Não foi possível montar a descida deste município (${esc(e?.message || e)}).</div>`; }
  } };
}

async function montar(root, ctx, { cs, cores, rotulo, mun, q, volta }) {
  const { cd, uf, nome } = mun, nC = cs.length;
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
    for (const [k, t] of res[i].tot) { let o = S.get(k); if (!o) { const [z, s] = k.split('-').map(Number); S.set(k, o = { k, z, s, lid: `${z}-?`, ln: `Zona ${z}`, end: '', bk: 't?', bn: '(sem bairro informado)', dk: 'd-', dn: '', vals: Array(nC).fill(null) }); } o.vals[i] = { v: res[i].votos.get(k) || 0, t }; }
  });
  const todas = [...S.values()];
  const niveis = Object.keys(NIVEIS).filter(k => k !== 'dist' || (temDist && todas.some(o => o.dk !== 'd-')));
  const nomeNivel = k => k === 'dist' ? rotDist : NIVEIS[k];
  const avisos = res.map((r, i) => r.erro ? `<li><i class="cc-dot" style="background:${cores[i]}"></i><b>${esc(rotulo(cs[i]))}</b>: ${esc(r.erro)} (coluna em branco).</li>` : '').join('');
  const semLocAno = res.filter(r => r.semLoc).map(r => r.ano);
  const nav = { nivel: niveis.includes(q.get('nv')) ? q.get('nv') : niveis[0], dk: q.get('dk'), bk: q.get('bk'), lid: q.get('lid') };

  const soma = (arr, i) => { let v = 0, t = 0, n = 0; for (const o of arr) { const x = o.vals[i]; if (x) { v += x.v; t += x.t; n++; } } return n ? { v, t, p: t > 0 ? 100 * v / t : NaN } : null; };
  const filtradas = () => todas.filter(o => (nav.dk == null || o.dk === nav.dk) && (nav.bk == null || o.bk === nav.bk) && (nav.lid == null || o.lid === nav.lid));
  const chaveDe = { dist: o => o.dk, bairro: o => o.bk, local: o => o.lid, secao: o => o.k };
  const nomeDe = { dist: o => o.dn, bairro: o => o.bn, local: o => o.ln, secao: o => `Zona ${o.z} · seção ${o.s}` };
  const subDe = { dist: () => '', bairro: () => '', local: o => [o.end, o.bn].filter(Boolean).join(' · '), secao: o => o.ln };

  const corpo = root.querySelector('#cm-corpo'), resumo = root.querySelector('#cm-resumo'), h2 = root.querySelector('#cm-h2');
  let tab = null;
  const guarda = () => { const p = new URLSearchParams(location.hash.split('?')[1] || ''); for (const k of ['nv', 'dk', 'bk', 'lid']) p.delete(k); p.set('nv', nav.nivel); for (const k of ['dk', 'bk', 'lid']) if (nav[k] != null) p.set(k, nav[k]); history.replaceState(null, '', location.hash.split('?')[0] + '?' + p.toString().replace(/%2C/g, ',')); };
  function render() {
    const fs = filtradas();
    const g = new Map(); for (const o of fs) { const k = chaveDe[nav.nivel](o); let r = g.get(k); if (!r) g.set(k, r = { k, nome: nomeDe[nav.nivel](o), sub: subDe[nav.nivel](o), o, arr: [] }); r.arr.push(o); }
    const rows = [...g.values()].map(r => ({ ...r, n: r.arr.length, vals: cs.map((_, i) => soma(r.arr, i)) }));
    const dn = nav.dk != null ? todas.find(o => o.dk === nav.dk)?.dn : '', bn = nav.bk != null ? todas.find(o => o.bk === nav.bk)?.bn : '', ln = nav.lid != null ? todas.find(o => o.lid === nav.lid)?.ln : '';
    const trilha = [`<button type="button" data-t="mun">${esc(nome)}</button>`];
    if (nav.dk != null) trilha.push(nav.bk != null || nav.lid != null || nav.nivel !== 'bairro' ? `<button type="button" data-t="dk">${esc(dn)}</button>` : `<b>${esc(dn)}</b>`);
    if (nav.bk != null) trilha.push(nav.lid != null || nav.nivel !== 'local' ? `<button type="button" data-t="bk">${esc(bn)}</button>` : `<b>${esc(bn)}</b>`);
    if (nav.lid != null) trilha.push(`<b>${esc(ln)}</b>`);
    const recorte = [dn, bn, ln].filter(Boolean).pop() || nome;
    const mx = Math.max(1, ...cs.map((_, j) => soma(fs, j)?.v || 0));
    resumo.innerHTML = `<p class="sub">${esc(recorte)}${recorte !== nome ? ` · ${esc(nome)} (${esc(uf.toUpperCase())})` : ` (${esc(uf.toUpperCase())})`}</p>` + cs.map((x, i) => { const s = soma(fs, i); return `<div class="cc-md-r"><span><i class="cc-dot" style="background:${cores[i]}"></i><b>${esc(rotulo(x))}</b></span><span class="cc-md-b"><span style="width:${s ? Math.max(1.5, 100 * s.v / mx) : 0}%;background:${cores[i]}"></span></span><span class="cc-md-v">${s ? `<b>${fInt(s.v)}</b> votos · <b>${isFinite(s.p) ? fNum(s.p, 2) + '%' : '–'}</b>` : '<small>sem dado neste recorte</small>'}</span></div>`; }).join('');
    h2.textContent = `Comparação por ${nomeNivel(nav.nivel).toLowerCase()}${recorte !== nome ? ' · ' + recorte : ''}`;
    corpo.innerHTML = `<nav class="cc-md-trilha sem-export" aria-label="Onde você está">${trilha.join(' › ')}</nav>
      <div class="cc-md-niv sem-export" role="group" aria-label="Ver por"><span>Ver por:</span>${niveis.map(k => `<button type="button" class="chip${k === nav.nivel ? ' on' : ''}" data-n="${k}" aria-pressed="${k === nav.nivel}">${esc(nomeNivel(k))}</button>`).join('')}</div>
      ${avisos ? `<ul class="cc-md-av">${avisos}</ul>` : ''}
      <div id="cc-md-tab"></div>
      <p class="cmp-nota">Percentual = votos da candidatura ÷ votos válidos (nominais e de legenda) da unidade, no turno e na eleição de cada candidatura. <span class="sem-export">${PROX[nav.nivel] ? 'Toque numa linha para descer ao nível seguinte. ' : ''}</span>Bairros, locais e seções de eleições diferentes são casados pelo nome do bairro/limite do IBGE, pela zona e número do local e pela zona e número da seção; o TSE pode remanejar locais e seções de um ano para outro, e onde a unidade não existia a coluna fica em branco.${semLocAno.length ? ` Em ${semLocAno.join(', ')} o TSE não tem cadastro de locais: a descida é por zona e seção.` : ''} Fonte: TSE.</p>`;
    const cols = [{ k: 'nome', t: nomeNivel(nav.nivel), h: r => `<b>${esc(r.nome)}</b>${r.sub ? `<small class="vt">${esc(r.sub)}</small>` : (nav.nivel !== 'secao' ? `<small class="vt">${fInt(r.n)} ${r.n === 1 ? 'seção' : 'seções'}</small>` : '')}`, v: r => sem(r.nome), x: r => r.nome, ini: 'asc', cls: 'nm' }];
    cs.forEach((x, i) => {
      const nm = `${x.nome} ${x.c[0]}`;
      cols.push({ k: 'v' + i, t: `<span class="cc-th" style="--c:${cores[i]}">${esc(nm)} <small>· votos</small></span>`, h: r => r.vals[i] ? fInt(r.vals[i].v) : '–', v: r => r.vals[i]?.v ?? -1, x: r => r.vals[i]?.v ?? '', cls: 'num' });
      cols.push({ k: 'p' + i, t: `<span class="cc-th" style="--c:${cores[i]}">${esc(nm)} <small>· % válidos</small></span>`, h: r => r.vals[i] && isFinite(r.vals[i].p) ? `<b>${fNum(r.vals[i].p, 2)}%</b>` : '–', v: r => r.vals[i]?.p ?? -1, x: r => r.vals[i] && isFinite(r.vals[i].p) ? fNum(r.vals[i].p, 2) : '', cls: 'num' });
    });
    if (nC > 1) cols.push({ k: 'dif', t: 'Diferença (1ª − 2ª, p.p.)', h: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? `<span class="dlt ${Math.abs(d) < .05 ? 'zero' : d > 0 ? 'pos' : 'neg'}">${d > 0 ? '+' : d < 0 ? '−' : ''}${fNum(Math.abs(d), 1)}</span>` : '–'; }, v: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? d : null; }, x: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? fNum(d, 2) : ''; }, cls: 'num' });
    const desce = PROX[nav.nivel] ? r => {
      if (nav.nivel === 'dist') { nav.dk = r.o.dk; nav.nivel = 'bairro'; }
      else if (nav.nivel === 'bairro') { nav.bk = r.o.bk; nav.dk ??= r.o.dk; nav.nivel = 'local'; }
      else if (nav.nivel === 'local') { nav.lid = r.o.lid; nav.bk ??= r.o.bk; nav.dk ??= r.o.dk; nav.nivel = 'secao'; }
      render(); window.scrollTo({ top: root.querySelector('#cm-res').offsetTop - 10, behavior: 'smooth' });
    } : undefined;
    tab = tabela(corpo.querySelector('#cc-md-tab'), { cols, rows, sort: 'v0', dir: 'desc', filtro: (r, q2) => sem(r.nome + ' ' + r.sub).includes(q2), limite: 400, vazio: 'Sem dados neste recorte', onRow: desce });
    ctx.csv = () => { const d = tab.csv(); return { nome: `comparar-candidatos_${sem(nome).replace(/\s+/g, '-')}_${sem(nomeNivel(nav.nivel)).replace(/\s+/g, '-')}`, cab: d.cab, linhas: d.linhas }; };
    guarda();
  }
  corpo.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.n) { nav.nivel = b.dataset.n; const ord = Object.keys(NIVEIS), ix = ord.indexOf(nav.nivel); if (ix <= 0) nav.dk = null; if (ix <= 1) nav.bk = null; if (ix <= 2) nav.lid = null; render(); return; }
    if (b.dataset.t) {
      if (b.dataset.t === 'mun') { nav.dk = nav.bk = nav.lid = null; nav.nivel = niveis[0]; }
      else if (b.dataset.t === 'dk') { nav.bk = nav.lid = null; nav.nivel = 'bairro'; }
      else if (b.dataset.t === 'bk') { nav.lid = null; nav.nivel = 'local'; }
      render();
    }
  };
  render();
}
