// Comparar candidatos: busca por nome (2006-2026 + trajetória desde 1994), escolha da candidatura e cruzamento por município.
// Dados: branch cand-pessoas (perfis p/<ddd>.json e busca s/<xxx>.json) e branches cv-<ano> (votos por município de cada candidatura).
// Gerados por scripts/lake_cand/build_cand_votos.py a partir do TSE (votação por município e zona + consulta de candidatos). Sem CPF nem dados pessoais além do nome público e do ano de nascimento.
import { CONFIG } from './config.js?v=e9c8f0e7';
import { getJSON } from './tse.js?v=e9c8f0e7';
import { esc, sem, tabela } from './ui.js?v=e9c8f0e7';
import { fNum, fInt } from './util.js?v=e9c8f0e7';
import { dispersao } from './dispersao.js?v=e9c8f0e7';
import { corPartido, corTextoSobre } from './partidos.js?v=e9c8f0e7';
import { baixarCSV } from './export.js?v=e9c8f0e7';

export const MAX_CC = 4;
const CH = ['a', 'b', 'c', 'd'];
const SLOT = ['#3E347E', '#F08A24', '#1b8f6a', '#c8102e'];
export const hashCC = (refs, t) => '#/comparar/candidatos' + (refs.length ? '?' + refs.map((r, i) => CH[i] + '=' + encodeURIComponent(r)).join('&') + (t === 2 ? '&t=2' : '') : '');
export const refsCC = q => CH.map(k => q.get(k)).filter(Boolean).slice(0, MAX_CC);

const CARGO = { 1: 'Presidente', 2: 'Vice-presidente', 3: 'Governador', 4: 'Vice-governador', 5: 'Senador', 6: 'Deputado federal', 7: 'Deputado estadual', 8: 'Deputado distrital', 9: '1º suplente de senador', 10: '2º suplente de senador', 11: 'Prefeito', 12: 'Vice-prefeito', 13: 'Vereador' };
const COM_VOTOS = new Set([1, 3, 5, 6, 7, 8, 11]);   // cargos com votos por município nos arquivos cv-<ano>
const ANO_MIN_VOTOS = 2006;

// ---------- dados ----------
const RAW = `https://raw.githubusercontent.com/${CONFIG.repo}/`;
const cache = new Map();
const pega = url => { if (!cache.has(url)) cache.set(url, getJSON(url, { retries: 2, timeout: 60000 }).catch(e => { cache.delete(url); throw e; })); return cache.get(url); };
const perfilBloco = pid => pega(RAW + 'cand-pessoas/p/' + pid.slice(0, 3) + '.json');
const buscaBloco = k => pega(RAW + 'cand-pessoas/s/' + k + '.json').catch(e => { if (e.status === 404) return []; throw e; });
const votosArq = (ano, cargo, uf) => pega(`${RAW}cv-${ano}/${cargo}/${uf}.json`);

// ---------- texto ----------
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
const STOP = new Set(['DAS', 'DOS', 'DEL', 'DEZ']);
const palavras = s => norm(s).split(' ').filter(t => t.length >= 3 && !STOP.has(t));
const bonito = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());
const sgTxt = s => String(s || '').replace(/PC do B/g, 'PCdoB');
const chipP = sg => { if (!sg) return ''; const c = corPartido(sg); return `<span class="h-p" style="background:${c};color:${corTextoSobre(c)}">${esc(sgTxt(sg))}</span>`; };
const situ = st => { const s = String(st || ''); if (/^ELEITO/.test(s)) return '<span class="h-sel">Eleito</span>'; if (/2º TURNO/.test(s)) return '<span class="h-sel h-2t">2º turno</span>'; if (/SUPLENTE/.test(s)) return '<span class="h-sel h-2t">Suplente</span>'; if (/^NÃO ELEITO|^MÉDIA/.test(s)) return '<span class="cc-sit">Não eleito</span>'; return s ? `<span class="cc-sit">${esc(bonito(s))}</span>` : ''; };
const ufTxt = uf => (uf === 'BR' ? '' : uf);
const local = c => { const [, cg, uf, mun] = c; return [CARGO[cg] || 'Cargo ' + cg, mun ? bonito(mun) + (uf ? ' (' + uf + ')' : '') : ufTxt(uf)].filter(Boolean).join(' · '); };
const refDe = (pid, c) => `${pid}.${c[0]}.${c[1]}.${c[2]}.${c[7]}`;
const temVotos = c => COM_VOTOS.has(c[1]) && c[0] >= ANO_MIN_VOTOS && (c[8] || c[10]);
const votosTxt = c => c[8] == null && c[10] == null ? '<span class="cc-nd">sem votos na base</span>' : `<b>${fInt(c[8] || 0)}</b>${c[9] != null ? ` <small>(${fNum(c[9], 2)}%)</small>` : ''}${c[10] ? `<br><small>2º turno: <b>${fInt(c[10])}</b>${c[11] != null ? ` (${fNum(c[11], 2)}%)` : ''}</small>` : ''}`;
const motivo = c => !COM_VOTOS.has(c[1]) ? (c[1] === 13 ? 'vereador: só no histórico' : 'vice/suplente: sem votos próprios') : c[0] < ANO_MIN_VOTOS ? 'votos por município só a partir de 2006' : 'sem votos na base (registro indeferido ou renúncia)';

// ---------- análise ----------
const pearson = (xs, ys) => {
  const n = xs.length; if (n < 5) return NaN;
  const mx = xs.reduce((a, b) => a + b, 0) / n, my = ys.reduce((a, b) => a + b, 0) / n;
  let sxy = 0, sxx = 0, syy = 0; for (let i = 0; i < n; i++) { const dx = xs[i] - mx, dy = ys[i] - my; sxy += dx * dy; sxx += dx * dx; syy += dy * dy; }
  return sxx > 0 && syy > 0 ? sxy / Math.sqrt(sxx * syy) : NaN;
};
// carrega a candidatura e monta os votos por município no turno pedido (2º só se a candidatura teve)
async function carregar(ref, turnoPedido) {
  const [pid, ano, cargo, uf, sq] = ref.split('.');
  const bloco = await perfilBloco(pid), p = bloco[pid];
  if (!p) throw new Error('pessoa não encontrada');
  const c = p.c.find(x => String(x[0]) === ano && String(x[1]) === cargo && x[2] === uf && String(x[7]) === sq);
  if (!c) throw new Error('candidatura não encontrada');
  const arq = await votosArq(ano, cargo, uf);
  const t = turnoPedido === 2 && c[10] ? 2 : 1;
  const flat = (arq['c' + t] || {})[sq] || [], tot = arq['t' + t] || {}, v = new Map();
  for (let i = 0; i < flat.length; i += 2) v.set(flat[i], flat[i + 1]);
  // prefeito: o recorte da candidatura é só o município dela (o arquivo traz todos os do estado, para o denominador)
  const T = new Map(Object.entries(tot).filter(([k]) => cargo !== '11' || v.has(+k)).map(([k, x]) => [+k, x]));
  return { ref, pid, p, c, nome: p.u || p.n, t, v, T };
}
const rotulo = x => `${x.nome} · ${CARGO[x.c[1]] || ''} ${x.c[0]}${x.c[2] && x.c[2] !== 'BR' ? ' ' + x.c[2] : ''}${x.c[3] ? ' ' + bonito(x.c[3]) : ''}${x.c[10] ? (x.t === 2 ? ' · 2º turno' : ' · 1º turno') : ''}`;

export function viewCmpCand(ctx, q) {
  const refs = refsCC(q), turno = q.get('t') === '2' ? 2 : 1, B = ctx.B;
  const html = `
  <section class="painel cmp-pick sem-export">
    <div class="cmp-modo" role="tablist" aria-label="O que comparar"><a href="#/comparar" role="tab">Territórios</a><a href="${hashCC([])}" role="tab" class="on" aria-selected="true">Candidatos</a></div>
    <h2>Escolha as candidaturas</h2>
    <p class="sub">Até ${MAX_CC} candidaturas de qualquer eleição de 2006 a 2026 e de qualquer cargo (presidente, governador, senador, deputados e prefeito): o mesmo candidato em anos diferentes, candidatos entre si ou em cargos diferentes. Os votos são cruzados por município.</p>
    <div class="cmp-chips" id="cc-chips"><span class="cmp-vazio">${refs.length ? 'Carregando…' : 'Nenhuma candidatura escolhida ainda.'}</span></div>
    <div class="cmp-add" id="cc-add" ${refs.length >= MAX_CC ? 'hidden' : ''}>
      <div class="cmp-busca"><input id="cc-in" type="search" autocomplete="off" placeholder="Nome do candidato (ex.: Lula, Tiririca)…" aria-label="Buscar candidato pelo nome"><ul id="cc-sug" class="cmp-sug" role="listbox" hidden></ul></div>
      <p class="cmp-dica" id="cc-dica">Digite pelo menos 3 letras do nome de urna ou do nome completo.</p>
      <div id="cc-pessoa"></div>
    </div>
  </section>
  <div id="cc-res"></div>`;
  return { html, titulo: 'Comparar candidatos', trilha: [['Brasil', '#/'], ['Comparar', '#/comparar'], ['Candidatos']], montar(root) {
    const ir = (rs, t = turno) => { location.hash = hashCC(rs, t); };
    const sel = new Set(refs);
    const inp = root.querySelector('#cc-in'), sug = root.querySelector('#cc-sug'), dica = root.querySelector('#cc-dica'), pessoaEl = root.querySelector('#cc-pessoa');
    const cheio = () => refs.length >= MAX_CC;

    // ---- candidaturas de uma pessoa (usada na escolha e na trajetória)
    const linhasCand = (pid, p) => {
      const cs = p.c.slice().sort((a, b) => b[0] - a[0] || a[1] - b[1]);
      return `<div class="tab-scroll"><table class="cc-tab"><thead><tr><th>Ano</th><th>Cargo e local</th><th>Partido</th><th>Votos</th><th>Situação</th><th></th></tr></thead><tbody>${cs.map(c => {
        const r = refDe(pid, c), ok = temVotos(c), ja = sel.has(r);
        return `<tr><td>${c[0]}</td><td>${esc(local(c))}</td><td>${chipP(c[4])}${c[5] ? ` <small>${c[5]}</small>` : ''}</td><td class="num">${votosTxt(c)}</td><td>${situ(c[6])}</td>
          <td>${ja ? '<small class="cc-nd">na comparação</small>' : ok ? `<button type="button" class="cc-add" data-add="${esc(r)}" ${cheio() ? 'disabled' : ''}>＋ Comparar</button>` : `<small class="cc-nd">${esc(motivo(c))}</small>`}</td></tr>`;
      }).join('')}</tbody></table></div>`;
    };
    const abrirPessoa = async (pid, nomeEx) => {
      pessoaEl.innerHTML = '<p class="carregando">Carregando candidaturas…</p>';
      try {
        const bloco = await perfilBloco(pid), p = bloco[pid]; if (!p) throw new Error('não encontrado');
        const idade = p.a ? ` · nascimento: ${p.a}` : '';
        pessoaEl.innerHTML = `<div class="cc-pessoa"><div class="cc-ph"><b>${esc(p.u || p.n)}</b><small>${esc(bonito(p.n))}${idade}${p.v === 'nome_incerta' || p.v === 'nome' ? ' · ligação entre eleições feita pelo nome (sem CPF): confira se é a mesma pessoa' : ''}</small></div>${linhasCand(pid, p)}</div>`;
      } catch (e) { pessoaEl.innerHTML = `<p class="aviso">Não foi possível carregar as candidaturas (${esc(e.message)}).</p>`; }
    };
    pessoaEl.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b && !cheio()) ir([...refs, b.dataset.add]); });

    // ---- busca
    let seq = 0, tmr = null;
    const fecha = () => { sug.hidden = true; sug.innerHTML = ''; };
    const buscar = async () => {
      const meu = ++seq, ts = palavras(inp.value);
      if (!ts.length) { fecha(); dica.textContent = 'Digite pelo menos 3 letras do nome de urna ou do nome completo.'; return; }
      dica.textContent = 'Buscando…';
      try {
        const lista = await buscaBloco(ts[0].slice(0, 3).toLowerCase()); if (meu !== seq) return;
        const ach = lista.filter(e => { const w = norm(e[1] + ' ' + e[2]).split(' '); return ts.every(t => w.some(x => x.startsWith(t))); });
        const exato = e => { const w = norm(e[1]).split(' '); return ts.every(t => w.includes(t)) ? 0 : 1; };
        const top = ach.map((e, i) => [e, i]).sort((a, b) => exato(a[0]) - exato(b[0]) || a[1] - b[1]).slice(0, 12).map(x => x[0]);
        sug._itens = top;
        sug.innerHTML = top.length ? top.map((e, i) => `<li role="option" data-i="${i}" tabindex="-1"><span><b>${esc(e[1])}</b>${norm(e[1]) !== norm(e[2]) ? ` <small>${esc(bonito(e[2]))}</small>` : ''}</span><small>${esc(CARGO[e[4]] || '')} ${e[3]}${e[5] && e[5] !== 'BR' ? ' ' + esc(e[5]) : ''} · ${esc(sgTxt(e[6]))}${e[7] > 1 ? ` · ${e[7]} eleições` : ''}</small></li>`).join('') : '<li class="nada">Nenhum candidato encontrado. Confira a grafia ou use outra parte do nome.</li>';
        sug.hidden = false; dica.textContent = top.length ? 'Escolha o candidato para ver as candidaturas dele.' : '';
      } catch (e) { if (meu === seq) dica.textContent = 'Não foi possível buscar agora. Tente de novo em instantes.'; }
    };
    inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(buscar, 220); });
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sug.querySelector('li[data-i]')?.click(); } if (e.key === 'Escape') fecha(); });
    sug.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (!li) return; const x = sug._itens[+li.dataset.i]; fecha(); inp.value = x[1]; dica.textContent = ''; abrirPessoa(x[0]); });
    document.addEventListener('click', e => { if (!e.target.closest('.cmp-busca') && sug.isConnected) fecha(); }, { capture: true });

    if (!refs.length) return;
    // ---- resultado
    const alvo = root.querySelector('#cc-res'), chips = root.querySelector('#cc-chips');
    alvo.innerHTML = '<section class="painel sem-export"><p class="carregando">Carregando votos por município…</p></section>';
    chips.addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) ir(refs.filter((_, i) => i !== +b.dataset.rm)); });
    Promise.allSettled(refs.map(r => carregar(r, turno))).then(res => {
      if (!alvo.isConnected) return;
      const ok = [], falhas = [], idxFalha = [];
      res.forEach((x, i) => x.status === 'fulfilled' ? ok.push({ ...x.value, i }) : (falhas.push(`${refs[i]}: ${x.reason?.message || x.reason}`), idxFalha.push(i)));
      chips.innerHTML = ok.map(x => `<span class="cmp-chip" style="--c:${SLOT[x.i]}"><i class="cc-dot" style="background:${SLOT[x.i]}"></i><b>${esc(rotulo(x))}</b><button type="button" class="cmp-x" data-rm="${x.i}" aria-label="Remover ${esc(rotulo(x))}">✕</button></span>`).join('')
        + idxFalha.map(i => `<span class="cmp-chip cc-erro"><b>Não carregou</b><button type="button" class="cmp-x" data-rm="${i}" aria-label="Remover">✕</button></span>`).join('');
      alvo.innerHTML = resultado(ok, falhas, B, turno);
      ligarResultado(alvo, ok, B, ir, refs, turno);
    });
  } };
}

// ---------- resultado ----------
function resultado(cs, falhas, B, turno) {
  if (!cs.length) return `<section class="painel sem-export"><div class="aviso">Não foi possível carregar os votos desta escolha. ${falhas.length ? esc(falhas.join('; ')) : ''}</div></section>`;
  const cards = cs.map(x => {
    const c = x.c, v = c[8] != null || c[10] != null;
    return `<article class="cc-card" style="--c:${SLOT[x.i]}"><div class="cc-top"></div>
      <h3>${esc(x.nome)}</h3><p class="cc-civil">${esc(bonito(x.p.n))}</p>
      <p class="cc-loc">${esc(local(c))} · <b>${c[0]}</b></p>
      <p class="cc-par">${chipP(c[4])}${c[5] ? ` <span>nº ${c[5]}</span>` : ''} ${situ(c[6])}</p>
      <p class="cc-vot">${v ? votosTxt(c) : '<span class="cc-nd">sem votos</span>'}</p>
      <p class="cc-t">${c[10] ? `Comparando o <b>${x.t}º turno</b> nos municípios` : 'Votos do 1º turno nos municípios'}</p></article>`;
  }).join('');
  const temT2 = cs.some(x => x.c[10]);
  const ctl = temT2 ? `<div class="cc-turno sem-export" role="group" aria-label="Turno comparado"><span>Turno nos municípios:</span><button type="button" data-t="1" class="${turno === 1 ? 'on' : ''}">1º turno</button><button type="button" data-t="2" class="${turno === 2 ? 'on' : ''}">2º turno (quando houve)</button></div>` : '';
  const pids = [...new Map(cs.map(x => [x.pid, x])).values()];
  const traj = pids.map(x => `<details class="entenda cc-traj" ${pids.length === 1 ? 'open' : ''}><summary><span class="mais" aria-hidden="true"></span>Trajetória de ${esc(x.nome)}</summary><div class="entenda-c" data-pid="${esc(x.pid)}"></div></details>`).join('');
  return `<section class="painel sem-export"><h2>Candidaturas</h2><div class="cc-cards">${cards}</div>${ctl}${falhas.length ? `<p class="cmp-nota">Não foi possível carregar: ${esc(falhas.join('; '))}</p>` : ''}</section>
  <section class="painel sem-export" id="cc-mun"><h2>${cs.length > 1 ? 'Votos cruzados por município' : 'Votos por município'}</h2><div id="cc-mun-c"></div></section>
  <section class="painel sem-export"><h2>Trajetória eleitoral</h2>${traj}<p class="cmp-nota">Votos por município e zona: TSE (2006 a 2026). Trajetória: candidaturas registradas no TSE desde 1994 (antes de 2006 não há votos por município nesta base).</p></section>`;
}

function ligarResultado(alvo, cs, B, ir, refs, turno) {
  alvo.querySelectorAll('.cc-turno button').forEach(b => b.addEventListener('click', () => ir(refs, +b.dataset.t)));
  // trajetória (usa as mesmas linhas da escolha, sem botões para o que já está na comparação)
  alvo.querySelectorAll('.cc-traj .entenda-c').forEach(async el => {
    const pid = el.dataset.pid; const bloco = await perfilBloco(pid).catch(() => null); const p = bloco?.[pid]; if (!p) { el.innerHTML = '<p class="aviso">Trajetória indisponível.</p>'; return; }
    const sel = new Set(refs), cs2 = p.c.slice().sort((a, b) => b[0] - a[0] || a[1] - b[1]);
    el.innerHTML = `<div class="tab-scroll"><table class="cc-tab"><thead><tr><th>Ano</th><th>Cargo e local</th><th>Partido</th><th>Votos</th><th>Situação</th><th></th></tr></thead><tbody>${cs2.map(c => {
      const r = refDe(pid, c), ok = temVotos(c), ja = sel.has(r);
      return `<tr><td>${c[0]}</td><td>${esc(local(c))}</td><td>${chipP(c[4])}${c[5] ? ` <small>${c[5]}</small>` : ''}</td><td class="num">${votosTxt(c)}</td><td>${situ(c[6])}</td><td>${ja ? '<small class="cc-nd">na comparação</small>' : ok && refs.length < MAX_CC ? `<button type="button" class="cc-add" data-add="${esc(r)}">＋ Comparar</button>` : ''}</td></tr>`;
    }).join('')}</tbody></table></div>`;
    el.addEventListener('click', e => { const b = e.target.closest('[data-add]'); if (b && refs.length < MAX_CC) ir([...refs, b.dataset.add], turno); });
  });
  munSecao(alvo.querySelector('#cc-mun-c'), cs, B);
}

// ---------- cruzamento por município ----------
function munSecao(el, cs, B) {
  const info = new Map(); for (const m of B.muns || []) info.set(+m.cd, m);
  const nomeMun = cd => { const m = info.get(cd); return m ? bonito(m.nome) : `Município ${cd}`; };
  const ufMun = cd => { const m = info.get(cd); return m ? (m.uf === 'zz' ? 'EXT' : m.uf.toUpperCase()) : ''; };
  const cds = new Set(); for (const x of cs) for (const k of x.T.keys()) cds.add(k);
  // linhas: votos e % de cada candidatura (null = o recorte da candidatura não inclui o município)
  const linhas = [...cds].map(cd => {
    const r = { cd, nome: nomeMun(cd), uf: ufMun(cd), vals: cs.map(x => { const t = x.T.get(cd); if (t == null) return null; const v = x.v.get(cd) || 0; return { v, t, p: t > 0 ? 100 * v / t : NaN }; }) };
    return r;
  });
  const emComum = linhas.filter(r => r.vals.every(Boolean));
  const base = cs.length > 1 ? emComum : linhas;
  if (!base.length) { el.innerHTML = '<div class="aviso">Estas candidaturas não têm nenhum município em comum (por exemplo, estados diferentes). O cruzamento por município só vale quando os recortes se sobrepõem.</div>'; return; }

  const leit = () => {
    if (cs.length < 2) return '';
    const p = [`<b>${fInt(emComum.length)}</b> município${emComum.length === 1 ? '' : 's'} em comum entre as candidaturas.`];
    for (let a = 0; a < cs.length; a++) for (let b = a + 1; b < cs.length; b++) {
      const xs = emComum.map(r => r.vals[a].p), ys = emComum.map(r => r.vals[b].p), r = pearson(xs, ys);
      const maisA = emComum.filter(r => r.vals[a].p > r.vals[b].p).length;
      const na = esc(cs[a].nome) + ' ' + cs[a].c[0], nb = esc(cs[b].nome) + ' ' + cs[b].c[0];
      let t = `<b>${na}</b> teve percentual maior que <b>${nb}</b> em ${fInt(maisA)} de ${fInt(emComum.length)} município${emComum.length === 1 ? '' : 's'} (${fNum(100 * maisA / emComum.length, 0)}%).`;
      if (isFinite(r)) { const f = Math.abs(r) >= .7 ? 'forte' : Math.abs(r) >= .4 ? 'moderada' : 'fraca'; t += ` Correlação entre os percentuais municipais: <b>${fNum(r, 2)}</b> (${f}${Math.abs(r) < .4 ? '' : r > 0 ? ': vão bem nos mesmos municípios' : ': vão bem em municípios opostos'}).`; }
      p.push(t);
    }
    p.push('<small>A correlação compara os municípios, não os eleitores: ela mostra onde cada candidatura foi forte, mas não prova que o mesmo eleitor votou nas duas.</small>');
    return p.join(' ');
  };
  const disp = cs.length > 1 && emComum.length >= 5 ? `<div class="cc-eixos sem-export"><label>Eixo X <select id="cc-x">${cs.map((x, i) => `<option value="${i}">${esc(rotulo(x))}</option>`).join('')}</select></label><label>Eixo Y <select id="cc-y">${cs.map((x, i) => `<option value="${i}" ${i === 1 ? 'selected' : ''}>${esc(rotulo(x))}</option>`).join('')}</select></label></div><div id="cc-disp" class="cc-disp"></div>` : '';
  el.innerHTML = `${cs.length > 1 ? `<p class="cmp-leit">${leit()}</p>` : `<p class="cmp-leit"><b>${fInt(base.length)}</b> município${base.length === 1 ? '' : 's'} com votos neste recorte.</p>`}
    ${disp}
    <div class="cc-agr sem-export" role="group" aria-label="Agrupar por"><span>Tabela por:</span><button type="button" data-g="mun" class="on">Município</button><button type="button" data-g="uf">Estado</button><button type="button" class="cc-csv">⬇ Planilha (CSV)</button></div>
    <div id="cc-tab"></div>
    <p class="cmp-nota">Percentual = votos da candidatura ÷ votos válidos nominais do mesmo cargo no município, no turno indicado. ${cs.length > 1 ? 'A tabela e o gráfico usam só os municípios que fazem parte dos recortes de todas as candidaturas escolhidas. ' : ''}Nas eleições de 2006 a 2014 o TSE não separa os votos anulados sub judice nos arquivos por município; nesses anos usa-se o total de votos nominais. Fonte: TSE.</p>`;

  const desenhaDisp = () => {
    const d = el.querySelector('#cc-disp'); if (!d) return;
    const ix = +el.querySelector('#cc-x').value, iy = +el.querySelector('#cc-y').value;
    if (ix === iy) { d.innerHTML = '<p class="vazio">Escolha candidaturas diferentes nos dois eixos.</p>'; return; }
    const A = cs[ix], Bc = cs[iy];
    const pts = emComum.map(r => ({ id: r.cd, nome: r.nome, x: r.vals[ix].p, y: r.vals[iy].p, r: r.vals[ix].t, cor: SLOT[iy],
      tip: `<b>${esc(r.nome)}${r.uf ? ' (' + r.uf + ')' : ''}</b><br>${esc(A.nome)} ${A.c[0]}: ${fNum(r.vals[ix].p, 1)}% (${fInt(r.vals[ix].v)})<br>${esc(Bc.nome)} ${Bc.c[0]}: ${fNum(r.vals[iy].p, 1)}% (${fInt(r.vals[iy].v)})` }));
    const dec = k => { const m = Math.max(...pts.map(p => p[k])); return m < 1 ? 2 : m < 10 ? 1 : 0; }, dx = dec('x'), dy = dec('y');
    dispersao(d, { pts, xFmt: v => fNum(v, dx) + '%', yFmt: v => fNum(v, dy) + '%', xRot: `${A.nome} ${A.c[0]} (% no município)`, yRot: `${Bc.nome} ${Bc.c[0]} (% no município)` });
  };
  if (disp) { el.querySelectorAll('#cc-x,#cc-y').forEach(s => s.addEventListener('change', desenhaDisp)); desenhaDisp(); }

  let modo = 'mun', tab = null;
  const desenhaTab = () => {
    let rs;
    if (modo === 'mun') rs = base.map(r => ({ nome: r.nome, uf: r.uf, vals: r.vals, k: r.cd }));
    else {
      const g = new Map();
      for (const r of base) {
        const k = r.uf || '—'; let o = g.get(k); if (!o) g.set(k, o = { nome: k === '—' ? 'Sem estado' : k, uf: k, k, n: 0, vals: cs.map(() => ({ v: 0, t: 0 })) });
        o.n++; r.vals.forEach((x, i) => { if (x) { o.vals[i].v += x.v; o.vals[i].t += x.t; } });
      }
      rs = [...g.values()].map(o => ({ ...o, vals: o.vals.map(x => ({ ...x, p: x.t > 0 ? 100 * x.v / x.t : NaN })) }));
    }
    const cols = [{ k: 'nome', t: modo === 'mun' ? 'Município' : 'Estado', h: r => `<b>${esc(r.nome)}</b>${modo === 'mun' && r.uf ? ` <small>${esc(r.uf)}</small>` : r.n ? ` <small>${fInt(r.n)} municípios</small>` : ''}`, v: r => sem(r.nome), x: r => r.nome, ini: 'asc', cls: 'nm' }];
    cs.forEach((x, i) => {
      const nm = `${x.nome} ${x.c[0]}`;
      cols.push({ k: 'v' + i, t: `<span class="cc-th" style="--c:${SLOT[i]}">${esc(nm)} <small>· votos</small></span>`, h: r => r.vals[i] ? fInt(r.vals[i].v) : '–', v: r => r.vals[i]?.v ?? -1, x: r => r.vals[i]?.v ?? '', cls: 'num' });
      cols.push({ k: 'p' + i, t: `<span class="cc-th" style="--c:${SLOT[i]}">${esc(nm)} <small>· % no local</small></span>`, h: r => r.vals[i] && isFinite(r.vals[i].p) ? `<b>${fNum(r.vals[i].p, 2)}%</b>` : '–', v: r => r.vals[i]?.p ?? -1, x: r => r.vals[i] && isFinite(r.vals[i].p) ? fNum(r.vals[i].p, 2) : '', cls: 'num' });
    });
    if (cs.length > 1) cols.push({ k: 'dif', t: 'Diferença (1ª − 2ª, p.p.)', h: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? `<span class="dlt ${Math.abs(d) < .05 ? 'zero' : d > 0 ? 'pos' : 'neg'}">${d > 0 ? '+' : d < 0 ? '−' : ''}${fNum(Math.abs(d), 1)}</span>` : '–'; }, v: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? d : null; }, x: r => { const d = r.vals[0]?.p - r.vals[1]?.p; return isFinite(d) ? fNum(d, 2) : ''; }, cls: 'num' });
    tab = tabela(el.querySelector('#cc-tab'), { cols, rows: rs, sort: 'v0', dir: 'desc', filtro: (r, q2) => sem(r.nome).includes(q2) || sem(r.uf || '').includes(q2), limite: modo === 'mun' ? 300 : 0, vazio: 'Sem dados' });
  };
  desenhaTab();
  el.querySelector('.cc-agr').addEventListener('click', e => {
    const b = e.target.closest('button'); if (!b) return;
    if (b.dataset.g) { modo = b.dataset.g; el.querySelectorAll('.cc-agr [data-g]').forEach(x => x.classList.toggle('on', x === b)); desenhaTab(); }
    else if (b.classList.contains('cc-csv') && tab) { const d = tab.csv(); baixarCSV('comparar-candidatos-por-' + (modo === 'mun' ? 'municipio' : 'estado'), d.cab, d.linhas, ['Fonte: TSE. Percentual = votos ÷ votos válidos nominais do cargo no município.']); }
  });
}
