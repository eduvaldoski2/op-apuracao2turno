// Comparador: Brasil, regiões, estados, municípios e bairros lado a lado (até 4), com leitura automática e imagem em 1:1, 4:5 e 9:16.
import { MAX_COMPARAR, METRICAS, fmtMetrica, buscar, obter, bairrosDe, entradaPorRef } from './unidades.js?v=1df2c59c';
import { esc, sem } from './ui.js?v=1df2c59c';
import { CAND } from './util.js?v=1df2c59c';
import { bonito } from './bairros.js?v=1df2c59c';

const CHAVES = ['a', 'b', 'c', 'd'];
export const refsDaRota = q => CHAVES.map(k => q.get(k)).filter(Boolean).slice(0, MAX_COMPARAR);
export const hashComparar = refs => '#/comparar' + (refs.length ? '?' + refs.map((r, i) => CHAVES[i] + '=' + encodeURIComponent(r)).join('&') : '');

const PRESETS = [
  { t: 'Brasil × Rio de Janeiro', refs: ['br', 'uf:rj'] },
  { t: 'Sudeste × Nordeste × Sul', refs: ['reg:SE', 'reg:NE', 'reg:S'] },
  { t: 'Rio × São Paulo × Minas', refs: ['uf:rj', 'uf:sp', 'uf:mg'] },
  { t: 'Norte × Centro-Oeste', refs: ['reg:N', 'reg:CO'] },
];
const CAPITAIS = [['Rio de Janeiro', 'rj'], ['São Paulo', 'sp'], ['Belo Horizonte', 'mg'], ['Salvador', 'ba']];

const cor = k => CAND[k].cor;
const linhaBarra = x => `<div class="cmp-bar" role="img" aria-label="Lula ${fmtMetrica('pL', x.pL)} e Flávio ${fmtMetrica('pF', x.pF)}"><i style="width:${Math.max(0, Math.min(100, x.pL))}%;background:${cor('L')}"></i><i style="width:${Math.max(0, Math.min(100, x.pF))}%;background:${cor('F')}"></i></div>`;

function tipoRot(x) { return { br: 'País', reg: 'Região', uf: 'Estado', mun: 'Município', bai: 'Bairro' }[x.tipo] || ''; }

function leitura(es) {
  if (es.length < 2) return '';
  const nome = x => esc(x.nome), pp = v => fmtMetrica('margemPP', Math.abs(v)).replace(/^\+/, '');
  const vit = x => x.lider ? `${CAND[x.lider].nome} venceu em ${nome(x)} com ${pp(x.margemPP)} de vantagem` : `houve empate em ${nome(x)}`;
  const mais = (k, m = 'max') => es.slice().sort((a, b) => (m === 'max' ? b[k] - a[k] : a[k] - b[k]))[0];
  const p = [];
  if (es.length === 2) {
    const [a, b] = es, d = a.pL - b.pL;
    p.push(`${CAND.L.nome} tem <b>${fmtMetrica('pL', a.pL)}</b> em ${nome(a)} e <b>${fmtMetrica('pL', b.pL)}</b> em ${nome(b)}: ${Math.abs(d) < 0.05 ? 'praticamente a mesma votação' : `${pp(d)} ${d > 0 ? 'a mais' : 'a menos'} em ${nome(a)}`}.`);
    p.push(`${vit(a)}; ${vit(b)}.`);
    if (isFinite(a.pAb) && isFinite(b.pAb)) p.push(`A abstenção foi de ${fmtMetrica('pAb', a.pAb)} em ${nome(a)} e ${fmtMetrica('pAb', b.pAb)} em ${nome(b)}.`);
  } else {
    const mx = mais('pL'), mn = mais('pL', 'min'), ab = mais('pAb');
    p.push(`Maior votação de ${CAND.L.nome}: <b>${nome(mx)}</b> (${fmtMetrica('pL', mx.pL)}). Menor: <b>${nome(mn)}</b> (${fmtMetrica('pL', mn.pL)}).`);
    const fl = es.filter(x => x.lider === 'F').map(nome), lu = es.filter(x => x.lider === 'L').map(nome);
    if (lu.length && fl.length) p.push(`${CAND.L.nome} venceu em ${lu.join(', ')}; ${CAND.F.nome} venceu em ${fl.join(', ')}.`);
    else if (lu.length) p.push(`${CAND.L.nome} venceu em todos os recortes comparados.`);
    else if (fl.length) p.push(`${CAND.F.nome} venceu em todos os recortes comparados.`);
    if (isFinite(ab.pAb)) p.push(`Maior abstenção: ${nome(ab)} (${fmtMetrica('pAb', ab.pAb)}).`);
  }
  return p.join(' ');
}

// Tabela transposta: cada recorte é uma linha; os dados de cada candidato ficam em colunas com a cor dele.
const sinal = v => (isFinite(v) ? fmtMetrica('margem', v) : '');
export function resultadoHtml(es) {
  const n = es.length, parc = es.some(x => x.pst < 99.995);
  const melhor = (k, modo = 'max') => { const v = es.map(x => x[k]).filter(isFinite); if (v.length < 2) return null; return modo === 'max' ? Math.max(...v) : Math.min(...v); };
  const M = { pL: melhor('pL'), pF: melhor('pF'), dL: melhor('dL'), dF: melhor('dF') };
  const top = (k, x) => (M[k] != null && x[k] === M[k] ? ' melhor' : '');
  const temBrNu = es.some(x => isFinite(x.pBrNu));
  const temAb = es.some(x => isFinite(x.pAb));
  const cand = k => {
    const c = CAND[k];
    return `<div class="cmp-gh g-${k}" style="--c:${c.cor}">${esc(c.nome)}<small>${c.n} · ${esc(c.partido)}</small></div>`;
  };
  const sub = (cls, t, extra = '') => `<div class="cmp-sh ${cls}${extra}">${t}</div>`;
  const cab = `<div class="cmp-r cmp-r-g"><div class="cmp-gl"></div>${cand('L')}${cand('F')}<div class="cmp-gh g-G">Geral</div></div>
    <div class="cmp-r cmp-r-s"><div class="cmp-sh cmp-sl">Local</div>${sub('g-L', '% válidos')}${sub('g-L', 'Votos')}${sub('g-L', 'vs 1º turno')}${sub('g-F', '% válidos')}${sub('g-F', 'Votos')}${sub('g-F', 'vs 1º turno')}${sub('g-G', 'Abstenção')}${temBrNu ? sub('g-G cmp-tela', 'Brancos e nulos') : ''}</div>`;
  const delta = (k, d, vg, x) => `<div class="cmp-c g-${k} cmp-dl${top('d' + k, x)}" style="--c:${cor(k)}"><span class="cmp-d1">${fmtMetrica('d' + k, x['d' + k])}</span>${isFinite(x[vg]) ? `<span class="cmp-d2">(${sinal(x[vg])})</span>` : ''}</div>`;
  const linhas = es.map(x => {
    const w = x.lider ? CAND[x.lider] : null;
    const ref = `${esc(tipoRot(x))}${x.uf && x.tipo !== 'uf' ? ' · ' + x.uf.toUpperCase() : ''}`;
    const apu = parc && isFinite(x.pst) && x.pst < 99.995 ? ` · ${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(x.pst)}% apurado` : '';
    const venc = w ? `<span class="cmp-venc" style="--c:${w.cor}">${esc(w.nome.split(' ')[0])} +${fmtMetrica('margemPP', Math.abs(x.margemPP)).replace(/^\+/, '')}</span>` : '<span class="cmp-venc">Empate</span>';
    return `<div class="cmp-r cmp-r-d"><div class="cmp-loc"><div class="cmp-nome">${esc(x.nome)}</div><div class="cmp-tipo">${ref}${apu}</div>${venc}${linhaBarra(x)}</div>
      <div class="cmp-c g-L cmp-pc${top('pL', x)}" style="--c:${cor('L')}">${fmtMetrica('pL', x.pL)}</div>
      <div class="cmp-c g-L cmp-vt" style="--c:${cor('L')}">${fmtMetrica('L', x.L)}</div>
      ${delta('L', 'dL', 'vgL', x)}
      <div class="cmp-c g-F cmp-pc${top('pF', x)}" style="--c:${cor('F')}">${fmtMetrica('pF', x.pF)}</div>
      <div class="cmp-c g-F cmp-vt" style="--c:${cor('F')}">${fmtMetrica('F', x.F)}</div>
      ${delta('F', 'dF', 'vgF', x)}
      <div class="cmp-c g-G">${temAb ? fmtMetrica('pAb', x.pAb) : '–'}</div>
      ${temBrNu ? `<div class="cmp-c g-G cmp-tela">${fmtMetrica('pBrNu', x.pBrNu)}</div>` : ''}</div>`;
  }).join('');
  return `<p class="cmp-rolica">← deslize para o lado para ver todas as colunas →</p><div class="cmp-rol"><div class="cmp-grid n${n}${temBrNu ? ' tem-bn' : ''}" style="--n:${n}">${cab}${linhas}</div></div>
  <p class="cmp-leit"><b>Leitura:</b> ${leitura(es)}</p>
  <p class="cmp-nota">“vs 1º turno” = diferença, em pontos percentuais, nas mesmas seções; entre parênteses, os votos a mais (+) ou a menos (−) que o candidato teve em relação ao 1º turno. Contorno = maior valor entre os recortes. Fonte: TSE.</p>`;
}

let ultMun = null;   // último município escolhido para buscar bairro (sobrevive à remontagem da tela)
export function viewComparar(ctx, q) {
  const refs = refsDaRota(q), B = ctx.B;
  const rotRef = r => { const e = entradaPorRef(B, r); if (e) return e.rotulo; const [, uf, cd, ...n] = r.split(':'), m = B.byKey[uf + cd]; return `${bonito(decodeURIComponent(n.join(':')))} · ${m ? bonito(m.nome) : cd} (${String(uf).toUpperCase()})`; };
  const chips = refs.map((r, i) => `<span class="cmp-chip" data-i="${i}"><b>${esc(rotRef(r))}</b><button type="button" class="cmp-x" data-rm="${i}" aria-label="Remover ${esc(rotRef(r))}">✕</button></span>`).join('');
  const html = `
  <section class="painel cmp-pick sem-export">
    <h2>Escolha o que comparar</h2>
    <p class="sub">Até ${MAX_COMPARAR} recortes: Brasil, região, estado, município ou bairro. Misture à vontade.</p>
    <div class="cmp-chips" id="cmp-chips">${chips || '<span class="cmp-vazio">Nenhum recorte escolhido ainda.</span>'}</div>
    <div class="cmp-add" ${refs.length >= MAX_COMPARAR ? 'hidden' : ''}>
      <div class="cmp-tabs" role="tablist" aria-label="Tipo de recorte"><button type="button" class="on" data-t="uf">Estado / região</button><button type="button" data-t="mun">Município</button><button type="button" data-t="bai">Bairro</button></div>
      <div class="cmp-busca"><input id="cmp-in" type="search" autocomplete="off" placeholder="Digite o nome…" aria-label="Buscar recorte"><ul id="cmp-sug" class="cmp-sug" role="listbox" hidden></ul></div>
      <p class="cmp-dica" id="cmp-dica"></p>
    </div>
    <div class="cmp-presets"><span>Atalhos:</span>${PRESETS.map((p, i) => `<button type="button" data-pre="${i}">${esc(p.t)}</button>`).join('')}<button type="button" data-cap="1">Capitais: RJ × SP × BH × Salvador</button>${refs.length ? '<button type="button" data-limpar="1" class="cmp-limpar">Limpar</button>' : ''}</div>
  </section>
  <section class="painel" id="cmp-res" ${refs.length ? '' : 'hidden'}><h2>Comparação</h2><div id="cmp-corpo"><p class="carregando">Carregando…</p></div></section>
  ${refs.length === 1 ? '<div class="aviso">Escolha pelo menos mais um recorte para comparar.</div>' : ''}`;
  return { html, titulo: 'Comparar', trilha: [['Brasil', '#/'], ['Comparar']], montar(root) {
    const ir = rs => { location.hash = hashComparar(rs); };
    const sel = new Set(refs); let tipo = 'uf', munBai = null;
    const inp = root.querySelector('#cmp-in'), sug = root.querySelector('#cmp-sug'), dica = root.querySelector('#cmp-dica');
    const add = r => { if (sel.has(r) || refs.length >= MAX_COMPARAR) return; ir([...refs, r]); };
    const fecha = () => { sug.hidden = true; sug.innerHTML = ''; };
    const mostra = itens => { sug.innerHTML = itens.map((u, i) => `<li role="option" data-i="${i}" tabindex="-1">${esc(u.rotulo)}${u.tipo === 'reg' ? '<small>região</small>' : u.tipo === 'br' ? '<small>país</small>' : u.nota ? `<small>${u.nota}</small>` : ''}</li>`).join('') || '<li class="nada">Nada encontrado</li>'; sug._itens = itens; sug.hidden = false; };
    const DICA1 = 'Passo 1 de 2: escolha o município; em seguida você escolhe o bairro dele.';
    const escolheMun = u => { ultMun = u; munBai = { u, lista: bairrosDe(ctx, u.uf, u.cd) }; inp.value = ''; inp.placeholder = `Bairro de ${u.nome}…`; dica.innerHTML = `Passo 2 de 2: escolha o bairro. Município: <b>${esc(u.rotulo)}</b> <button type="button" class="cmp-troca" id="cmp-troca">trocar</button>`; };
    const munPadrao = () => {
      for (const r of [...refs].reverse()) { const [t, uf, cd] = r.split(':'); const e = t === 'mun' ? entradaPorRef(B, r) : t === 'bai' ? entradaPorRef(B, `mun:${uf}:${cd}`) : null; if (e) return e; }
      return ultMun && entradaPorRef(B, ultMun.ref) ? ultMun : null;
    };
    const atualiza = async () => {
      const t = inp.value.trim();
      if (tipo === 'uf') return mostra(buscar(B, t, { tipo: ['br', 'reg', 'uf'], max: 12 }));
      if (tipo === 'mun') { if (t.length < 2) return fecha(); return mostra(buscar(B, t, { tipo: 'mun', max: 10 })); }
      if (!munBai) { if (t.length < 2) return fecha(); return mostra(buscar(B, t, { tipo: 'mun', max: 10 }).map(x => ({ ...x, nota: 'ver bairros' }))); }
      try { const lista = await munBai.lista; const q2 = sem(t); mostra(lista.filter(x => !sel.has(x.ref) && (!q2 || sem(x.nome).includes(q2))).sort((a, b) => b.vv - a.vv).slice(0, 14).map(x => ({ ...x, rotulo: x.nome }))); } catch (e) { dica.textContent = 'Não consegui carregar os bairros desse município (' + (e.message || e) + ').'; }
    };
    inp.addEventListener('input', atualiza); inp.addEventListener('focus', atualiza);
    inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sug.querySelector('li[data-i]')?.click(); } if (e.key === 'Escape') fecha(); });
    sug.addEventListener('click', e => {
      const li = e.target.closest('li[data-i]'); if (!li) return; const u = sug._itens[+li.dataset.i];
      if (tipo === 'bai' && !munBai) { escolheMun(u); fecha(); atualiza(); inp.focus(); return; }
      fecha(); add(u.ref);
    });
    root.querySelector('.cmp-tabs').addEventListener('click', e => {
      const b = e.target.closest('button[data-t]'); if (!b) return; tipo = b.dataset.t; munBai = null; inp.value = ''; dica.textContent = '';
      root.querySelectorAll('.cmp-tabs button').forEach(x => x.classList.toggle('on', x === b));
      inp.placeholder = tipo === 'uf' ? 'Digite o estado ou a região…' : tipo === 'mun' ? 'Digite o município…' : 'Primeiro, digite o município do bairro…';
      if (tipo === 'bai') { const d = munPadrao(); if (d) escolheMun(d); else dica.textContent = DICA1; }
      fecha(); inp.focus(); atualiza();
    });
    dica.addEventListener('click', e => { if (e.target.id === 'cmp-troca') { munBai = null; ultMun = null; inp.value = ''; inp.placeholder = 'Primeiro, digite o município do bairro…'; dica.textContent = DICA1; fecha(); inp.focus(); } });
    document.addEventListener('click', e => { if (!e.target.closest('.cmp-busca') && sug.isConnected) fecha(); }, { capture: true });
    root.querySelector('#cmp-chips').addEventListener('click', e => { const b = e.target.closest('[data-rm]'); if (b) ir(refs.filter((_, i) => i !== +b.dataset.rm)); });
    root.querySelector('.cmp-presets').addEventListener('click', e => {
      const b = e.target.closest('button'); if (!b) return;
      if (b.dataset.pre) ir(PRESETS[+b.dataset.pre].refs);
      else if (b.dataset.limpar) ir([]);
      else if (b.dataset.cap) { const rs = CAPITAIS.map(([n, uf]) => buscar(B, n, { tipo: 'mun', max: 20 }).find(u => u.uf === uf && sem(u.nome) === sem(n))?.ref).filter(Boolean); ir(rs); }
    });
    if (!refs.length) return;
    const alvo = root.querySelector('#cmp-corpo'), sec = root.querySelector('#cmp-res');
    Promise.allSettled(refs.map(r => obter(ctx, r))).then(res => {
      if (!alvo.isConnected) return;
      const ok = res.filter(x => x.status === 'fulfilled').map(x => x.value), falhas = res.map((x, i) => x.status === 'rejected' ? `${refs[i]}: ${x.reason?.message || x.reason}` : null).filter(Boolean);
      if (ok.length < 2) { sec.hidden = true; return; }
      alvo.innerHTML = resultadoHtml(ok) + (falhas.length ? `<p class="cmp-nota">Não foi possível carregar: ${esc(falhas.join('; '))}</p>` : '');
      sec.querySelector('h2').textContent = ok.length === 2 ? `${ok[0].nome} × ${ok[1].nome}` : ok.map(x => x.nome).join(' × ');
      sec.dataset.exportNota = '';
    });
  } };
}
