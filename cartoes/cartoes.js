// Cards do 2º turno para compartilhar: catálogo navegável (sem dependências, rotas por hash).
// Consentimento e métricas são opcionais: carregam depois e, se falharem (rede, 503), os cards continuam funcionando.
let evento = () => {}, conversaoLead = () => {}, iniciarConsentimento = () => {};
const carregaExtras = async () => { try { const [c, m] = await Promise.all([import('../js/consentimento.js?v=2e93d5d9'), import('../js/metricas.js?v=2e93d5d9')]); iniciarConsentimento = c.iniciarConsentimento; conversaoLead = c.conversaoLead; evento = m.evento; iniciarConsentimento(); } catch { /* sem métricas/consentimento */ } };

const $ = (s, r = document) => r.querySelector(s), $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').trim();
const fmtN = n => n.toLocaleString('pt-BR');
const pct = n => n.toLocaleString('pt-BR', { minimumFractionDigits: 1, maximumFractionDigits: 1 }) + '%';
const FORMATOS = [
  { k: '1x1', nome: 'WhatsApp', raz: '1:1', cls: 'a11', uso: 'WhatsApp e feed' },
  { k: '4x5', nome: 'Feed', raz: '4:5', cls: 'a45', uso: 'Instagram e Facebook' },
  { k: '9x16', nome: 'Stories', raz: '9:16', cls: 'a916', uso: 'Stories e Reels' },
];
const evt = (n, p) => { try { evento(n, p); } catch { /* métricas desligadas */ } };
const LS = { get(k) { try { return localStorage.getItem(k); } catch { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch { /* ok */ } } };

let CAT = null, POR_ID = {}, POR_COL = {}, POR_SET = {};
const app = $('#app'), trilha = $('#trilha');
const img = (c, fm) => `img/${c.s}/${fm}/${c.n}.jpg`, thumb = c => `img/${c.s}/t/${c.n}.webp`;
const corL = '#c8102e', corF = '#1d4ea8';

async function carregar() {
  let r; for (let i = 0; i < 3; i++) { try { r = await fetch('data/catalogo.json?v=1'); if (r.ok) break; } catch { /* tenta de novo */ } await new Promise(ok => setTimeout(ok, 700 * (i + 1))); }
  if (!r || !r.ok) throw new Error('catálogo');
  CAT = await r.json();
  for (const c of CAT.cards) { POR_ID[c.id] = c; (POR_COL[c.c] ||= []).push(c); (POR_SET[c.s] ||= []).push(c); }
  for (const col of CAT.colecoes) col.n = col.id === 'cidades' ? CAT.cidades.length : (POR_COL[col.id] || []).length;
}
const colPor = id => CAT.colecoes.find(c => c.id === id);
const cidadePor = (u, s) => CAT.cidades.find(c => c.u.toLowerCase() === u && c.s === s);
const ufNome = u => CAT.ufs.find(x => x.u === u.toUpperCase())?.n || u.toUpperCase();
const cardsDe = set => POR_SET[set] || [];

// ---------- componentes ----------
const cartaoHTML = (c, ctx) => `<li class="cartao"><button type="button" class="im" data-card="${esc(c.id)}" data-ctx="${esc(ctx)}" aria-label="Abrir card: ${esc(c.t)}"><img src="${thumb(c)}" width="360" height="450" loading="lazy" decoding="async" alt=""><span class="bd" aria-hidden="true">Baixar ↓</span></button><h3>${esc(c.t)}</h3></li>`;
const mosaico = col => { const cs = col.id === 'cidades' ? ['cidades/rj/niteroi/niteroi_01_placar', 'cidades/sp/sao_paulo/sao_paulo_05_mapa_bairros', 'cidades/ba/salvador/salvador_01_placar'].map(i => POR_ID[i]).filter(Boolean) : (POR_COL[col.id] || []).slice(0, 3);
  const pick = cs.length >= 3 ? cs : (POR_COL[col.id] || []).slice(0, 3);
  return `<div class="mos" aria-hidden="true">${pick.map(c => `<img src="${thumb(c)}" width="360" height="450" loading="lazy" decoding="async" alt="">`).join('')}</div>`; };
const colHTML = (col, dest) => `<a class="col${dest ? ' dest' : ''}" href="${col.id === 'cidades' ? '#/cidades' : '#/colecao/' + col.id}">${mosaico(col)}<div class="cp"><h3>${esc(col.t)}</h3><p>${esc(col.d)}</p><span class="ct">${col.id === 'cidades' ? fmtN(col.n) + ' cidades · ' + fmtN(CAT.cards.filter(c => c.c === 'cidades').length) + ' cards' : fmtN(col.n) + ' cards'} →</span></div></a>`;
const cidHTML = c => { const l = c.v === 'L' ? c.pl : 100 - c.pl; const ln = c.v === 'L' ? 'Lula' : 'Flávio'; return `<li><a class="cid" href="#/cidade/${c.u.toLowerCase()}/${c.s}"><span class="l1"><b>${esc(c.n)}</b><span class="uf">${c.u}</span></span><span class="br" aria-hidden="true"><i class="l" style="width:${c.pl}%"></i><i class="f" style="width:${100 - c.pl}%"></i></span><span class="l3"><span class="${c.v}">${ln} ${pct(l)}</span><span>${c.k} cards</span></span></a></li>`; };
function setTrilha(itens) { if (!itens) { trilha.hidden = true; trilha.innerHTML = ''; return; } trilha.hidden = false; trilha.innerHTML = `<ol>${itens.map(([t, h], i) => `<li>${h && i < itens.length - 1 ? `<a href="${h}">${esc(t)}</a>` : `<span${i === itens.length - 1 ? ' aria-current="page"' : ''}>${esc(t)}</span>`}</li>`).join('')}</ol>`; }

// ---------- páginas ----------
function paginaInicio() {
  document.title = 'Cards do 2º turno para compartilhar · Oficina Política'; setTrilha(null);
  const nC = CAT.cards.length, nCid = CAT.cidades.length;
  const dest = ['resultado/brasil', 'a-virada/' + (POR_COL['tema-01'][0]?.n), 'capitais/' + (POR_COL['tema-02'][0]?.n), 'rio/A01_estado_placar', 'maiores-cidades/' + (POR_COL['tema-03'][0]?.n), 'cidades/rj/niteroi/niteroi_01_placar'].map(i => POR_ID[i]).filter(Boolean);
  const temas = CAT.colecoes.filter(c => c.gr === 'tema');
  app.innerHTML = `
  <section class="hero" aria-labelledby="h1">
    <p class="eyebrow">Eleição presidencial 2026 · 2º turno</p>
    <h1 id="h1">Cards prontos para <em>compartilhar</em></h1>
    <p class="sub">O resultado do 2º turno, do Brasil ao seu bairro. Escolha, baixe no formato certo e publique em segundos.</p>
    <div class="busca" role="search">
      <label for="q">Encontre sua cidade ou seu estado</label>
      <div class="cx"><svg class="lupa" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg>
        <input id="q" type="search" inputmode="search" autocomplete="off" spellcheck="false" placeholder="Ex.: Niterói, Salvador, Minas Gerais" role="combobox" aria-expanded="false" aria-controls="res" aria-autocomplete="list" enterkeyhint="search">
        <button type="button" class="limpa" id="limpa" aria-label="Limpar busca" hidden>✕</button></div>
      <ul class="res" id="res" role="listbox" aria-label="Resultados da busca" hidden></ul>
      <p class="dica">Experimente: <button type="button" data-q="Niterói">Niterói</button> <button type="button" data-q="São Paulo">São Paulo</button> <button type="button" data-q="Recife">Recife</button> <button type="button" data-q="Paraná">Paraná</button></p>
      <p class="livre">Baixar é livre: não precisa de cadastro.</p>
    </div>
  </section>
  <div class="trilhas" role="list">
    <a class="tr" role="listitem" href="#/colecao/resultado"><span class="n">1 · Brasil e estados</span><b>Resultado final</b><span>O placar do Brasil e dos 27 estados.</span></a>
    <a class="tr" role="listitem" href="#/cidades"><span class="n">2 · Minha cidade</span><b>${nCid} grandes cidades</b><span>Placar, mapa por bairro, zonas e muito mais.</span></a>
    <a class="tr" role="listitem" href="#temas"><span class="n">3 · Análises</span><b>Temas e curiosidades</b><span>A virada, disputas de centímetro, abstenção.</span></a>
  </div>
  <p class="stats"><span><b>${fmtN(nC)}</b> cards</span><span><b>${nCid}</b> cidades</span><span><b>27</b> estados</span><span><b>3</b> formatos: WhatsApp 1:1, Feed 4:5 e Stories 9:16</span></p>

  <section class="sec" aria-labelledby="t-dest"><div class="sec-h"><div><h2 id="t-dest">Para publicar agora</h2><p>Seis cards que costumam funcionar bem. Toque para escolher o formato.</p></div></div>
    <div class="rail"><ul class="grade" style="display:flex;gap:14px;padding:0">${dest.map(c => cartaoHTML(c, 'inicio').replace('class="cartao"', 'class="cartao" style="flex:0 0 min(62vw,230px)"')).join('')}</ul></div></section>

  <section class="sec" aria-labelledby="t-col"><div class="sec-h"><div><h2 id="t-col">Coleções</h2><p>Escolha por assunto. Cada coleção abre uma lista com todos os cards.</p></div></div>
    <div class="cols">${['resultado', 'cidades', 'rio', 'tema-01'].map(id => colHTML(colPor(id), id === 'cidades')).join('')}</div></section>

  <section class="sec" id="temas" aria-labelledby="t-tem"><div class="sec-h"><div><h2 id="t-tem">Temas e análises</h2><p>Dados do 2º turno que costumam virar pauta.</p></div></div>
    <div class="cols gr">${temas.filter(t => t.id !== 'tema-01').map(c => colHTML(c)).join('')}</div></section>

  <section class="sec" aria-labelledby="t-como"><div class="sec-h"><div><h2 id="t-como">Como usar</h2></div></div>
    <ol class="passos"><li><span class="nn">1</span><div><b>Escolha o card</b><span>Pela busca, por uma coleção ou pela lista de cidades.</span></div></li>
    <li><span class="nn">2</span><div><b>Escolha o formato</b><span>1:1 para WhatsApp, 4:5 para o feed do Instagram, 9:16 para Stories.</span></div></li>
    <li><span class="nn">3</span><div><b>Baixe ou compartilhe</b><span>No celular, compartilhe direto no app. Já vem com legenda pronta para copiar.</span></div></li></ol></section>`;
  iniciarBusca();
}

function paginaColecao(id, grupo) {
  const col = colPor(id); if (!col) return naoEncontrado();
  const cards = POR_COL[id]; document.title = `${col.t} · Cards do 2º turno · Oficina Política`;
  setTrilha([['Cards', '#/'], [col.t]]);
  const grupos = [...new Set(cards.map(c => c.g).filter(Boolean))];
  const lista = grupo ? cards.filter(c => c.g === grupo) : cards;
  app.innerHTML = `<div class="wrap">
    <div class="cab-pg"><div><h1>${esc(col.t)}</h1><p>${esc(col.d)}</p></div>
      <div class="acoes-pg">${zipControles('colecao:' + id, cards.length > 1 && cards.length <= 60)}</div></div>
    ${grupos.length ? `<div class="filtros" role="group" aria-label="Filtrar por parte da série"><button type="button" class="chip" data-grupo="" aria-pressed="${!grupo}">Todos <small>${cards.length}</small></button>${grupos.map(g => `<button type="button" class="chip" data-grupo="${esc(g)}" aria-pressed="${grupo === g}">${esc(g)} <small>${cards.filter(c => c.g === g).length}</small></button>`).join('')}</div>` : ''}
    <ul class="grade">${lista.map(c => cartaoHTML(c, 'colecao/' + id + (grupo ? '?g=' + encodeURIComponent(grupo) : ''))).join('')}</ul></div>`;
  $$('[data-grupo]').forEach(b => b.addEventListener('click', () => { location.hash = '#/colecao/' + id + (b.dataset.grupo ? '?g=' + encodeURIComponent(b.dataset.grupo) : ''); }));
}

function paginaCidades(ufSel) {
  document.title = 'Cidades · Cards do 2º turno · Oficina Política'; setTrilha([['Cards', '#/'], ['Cidades']]);
  const ufs = CAT.ufs; const base = ufSel ? CAT.cidades.filter(c => c.u.toLowerCase() === ufSel) : CAT.cidades;
  app.innerHTML = `<div class="wrap"><div class="cab-pg"><div><h1>Cards por cidade</h1><p>As ${CAT.cidades.length} cidades com mais de 200 mil eleitores. Cada uma tem uma série de 10 cards: placar, dois turnos, abstenção, mapa por bairro, zonas eleitorais e mais.</p></div></div>
    <label class="hp" for="fc">Filtrar cidade</label>
    <input id="fc" class="filtro-txt" type="search" placeholder="Filtrar por nome da cidade" autocomplete="off" aria-controls="lista-cid">
    <div class="ufs" role="group" aria-label="Filtrar por estado"><button type="button" class="chip" data-uf="" aria-pressed="${!ufSel}">Todos <small>${CAT.cidades.length}</small></button>${ufs.map(u => `<button type="button" class="chip" data-uf="${u.u.toLowerCase()}" aria-pressed="${ufSel === u.u.toLowerCase()}">${u.u} <small>${u.k}</small></button>`).join('')}</div>
    <div id="lista-cid"></div></div>`;
  const pinta = () => { const q = norm($('#fc').value); const ls = base.filter(c => !q || norm(c.n).includes(q));
    if (!ls.length) { $('#lista-cid').innerHTML = `<p class="vazio-pg">Nenhuma cidade encontrada. Confira o nome ou limpe o filtro. Se a sua cidade tem menos de 200 mil eleitores, veja o painel de apuração.</p>`; return; }
    const por = {}; for (const c of ls) (por[c.u] ||= []).push(c);
    $('#lista-cid').innerHTML = Object.keys(por).sort((a, b) => ufNome(a).localeCompare(ufNome(b), 'pt')).map(u => `<h2 class="grupo-uf">${esc(ufNome(u))}</h2><ul class="cids">${por[u].map(cidHTML).join('')}</ul>`).join(''); };
  pinta(); $('#fc').addEventListener('input', pinta);
  $$('[data-uf]').forEach(b => b.addEventListener('click', () => { location.hash = b.dataset.uf ? '#/cidades/' + b.dataset.uf : '#/cidades'; }));
}

function paginaCidade(u, s) {
  const c = cidadePor(u, s); if (!c) return naoEncontrado();
  const cards = cardsDe(`cidades/${u}/${s}`); document.title = `${c.n} (${c.u}) · Cards do 2º turno · Oficina Política`;
  setTrilha([['Cards', '#/'], ['Cidades', '#/cidades'], [ufNome(c.u), '#/cidades/' + u], [c.n]]);
  const l = c.v === 'L' ? c.pl : 100 - c.pl; const outras = CAT.cidades.filter(x => x.u === c.u && x.s !== c.s);
  app.innerHTML = `<div class="wrap"><div class="cab-pg"><div><h1>${esc(c.n)} <span style="font-size:.5em;color:var(--tx2)">${c.u}</span></h1>
    <p>Série de ${cards.length} cards com o resultado do 2º turno em ${esc(c.n)}.</p>
    <span class="placar"><i class="${c.v}"></i>${c.v === 'L' ? 'Lula' : 'Flávio'} venceu com ${pct(l)}${c.fl ? ' · cidade que virou' : ''}</span></div>
    <div class="acoes-pg">${zipControles('set:' + `cidades/${u}/${s}`, true)}<button type="button" class="bt bt-ghost" data-copiar-link>Copiar link desta cidade</button></div></div>
    <ul class="grade">${cards.map(x => cartaoHTML(x, `cidade/${u}/${s}`)).join('')}</ul>
    ${outras.length ? `<div class="sec" style="padding-left:0;padding-right:0"><div class="sec-h"><div><h2>Outras cidades de ${esc(ufNome(c.u))}</h2></div></div><ul class="cids">${outras.map(cidHTML).join('')}</ul></div>` : ''}</div>`;
  const b = $('[data-copiar-link]'); if (b) b.addEventListener('click', () => copiar(location.href.split('#')[0] + '#/cidade/' + u + '/' + s, 'Link copiado'));
}
const naoEncontrado = () => { setTrilha([['Cards', '#/'], ['Não encontrado']]); app.innerHTML = `<div class="wrap"><div class="cab-pg"><div><h1>Não encontramos esta página</h1><p>O endereço pode ter mudado. Volte ao início e use a busca.</p></div><a class="bt" href="#/">Voltar ao início</a></div></div>`; };

// ---------- busca (combobox) ----------
function iniciarBusca() {
  const q = $('#q'), res = $('#res'), limpa = $('#limpa'); let itens = [], at = -1;
  const idx = [...CAT.cidades.map(c => ({ t: 'Cidades', n: c.n, s: c.u, h: `#/cidade/${c.u.toLowerCase()}/${c.s}`, k: norm(c.n + ' ' + ufNome(c.u) + ' ' + c.u), peso: c.te })),
    ...CAT.ufs.map(u => ({ t: 'Estados', n: u.n, s: `${u.k} cidades`, h: `#/cidades/${u.u.toLowerCase()}`, k: norm(u.n + ' ' + u.u), peso: 1e9 })),
    ...CAT.colecoes.map(c => ({ t: 'Coleções', n: c.t, s: c.id === 'cidades' ? 'lista de cidades' : `${c.n} cards`, h: c.id === 'cidades' ? '#/cidades' : '#/colecao/' + c.id, k: norm(c.t + ' ' + c.d), peso: 1 }))];
  const ufCard = CAT.cards.filter(c => c.c === 'resultado').map(c => ({ t: 'Resultado final', n: c.t.split(':')[0], s: 'card do estado', h: '#/card/' + c.id, k: norm(c.t.split(':')[0] + ' resultado ' + c.n), peso: 1e8 }));
  const todos = idx.concat(ufCard);
  const mostra = () => { const v = norm(q.value); limpa.hidden = !q.value;
    if (v.length < 2) { res.hidden = true; q.setAttribute('aria-expanded', 'false'); return; }
    itens = todos.filter(i => i.k.includes(v)).sort((a, b) => (a.k.startsWith(v) ? 0 : 1) - (b.k.startsWith(v) ? 0 : 1) || b.peso - a.peso).slice(0, 9); at = itens.length ? 0 : -1;
    let ult = ''; res.innerHTML = itens.length ? itens.map((i, k) => { const g = i.t !== ult ? `<li class="gp" role="presentation">${i.t}</li>` : ''; ult = i.t; return `${g}<li role="option" id="op${k}" aria-selected="${k === at}" data-i="${k}"><span class="rn">${esc(i.n)}</span><span class="rs">${esc(i.s)}</span></li>`; }).join('') : `<li class="vazio" role="presentation">Nada encontrado para “${esc(q.value)}”. Tente só o nome da cidade, sem abreviações. Cidades com menos de 200 mil eleitores não têm série própria: veja o <a href="../apuracao-2t-2026/">painel de apuração</a>.</li>`;
    res.hidden = false; q.setAttribute('aria-expanded', 'true'); q.setAttribute('aria-activedescendant', at >= 0 ? 'op' + at : ''); };
  const sel = k => { $$('[role=option]', res).forEach((o, i) => o.setAttribute('aria-selected', i === k)); at = k; q.setAttribute('aria-activedescendant', 'op' + k); $('#op' + k)?.scrollIntoView({ block: 'nearest' }); };
  const ir = k => { const i = itens[k]; if (!i) return; evt('busca_ir', { destino: i.t }); location.hash = i.h; };
  q.addEventListener('input', mostra); q.addEventListener('focus', mostra);
  q.addEventListener('keydown', e => { if (res.hidden) return; if (e.key === 'ArrowDown') { e.preventDefault(); sel(Math.min(itens.length - 1, at + 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); sel(Math.max(0, at - 1)); } else if (e.key === 'Enter') { e.preventDefault(); ir(Math.max(0, at)); } else if (e.key === 'Escape') { res.hidden = true; q.setAttribute('aria-expanded', 'false'); } });
  res.addEventListener('mousedown', e => { const o = e.target.closest('[data-i]'); if (o) { e.preventDefault(); ir(+o.dataset.i); } });
  document.addEventListener('click', e => { if (!e.target.closest('.busca')) { res.hidden = true; q.setAttribute('aria-expanded', 'false'); } });
  limpa.addEventListener('click', () => { q.value = ''; mostra(); q.focus(); });
  $$('.dica [data-q]').forEach(b => b.addEventListener('click', () => { q.value = b.dataset.q; mostra(); q.focus(); }));
}

// ---------- janela do card ----------
const dlg = $('#dlg-card'); let cardAtual = null, ctxAtual = '', fmAtual = LS.get('op_cards_fm') || '4x5', lista = [], retorno = '#/', acoes = 0;
if (!FORMATOS.some(f => f.k === fmAtual)) fmAtual = '4x5';
const podeCompartilhar = (() => { try { return !!(navigator.canShare && navigator.canShare({ files: [new File(['a'], 'a.jpg', { type: 'image/jpeg' })] })); } catch { return false; } })();
const jaCadastrado = () => LS.get('op_cards_lead') === '1';
function abrirCard(id, ctx) {
  const c = POR_ID[id]; if (!c) return naoEncontrado();
  cardAtual = c; ctxAtual = ctx || ctxPadrao(c);
  lista = c.c === 'cidades' ? cardsDe(c.s) : (POR_COL[c.c] || []);
  desenharCard(); if (!dlg.open) { dlg.showModal(); document.body.classList.add('trava'); }
}
const ctxPadrao = c => c.c === 'cidades' ? `cidade/${c.s.split('/')[1]}/${c.s.split('/')[2]}` : `colecao/${c.c}`;
function desenharCard() {
  const c = cardAtual, i = lista.findIndex(x => x.id === c.id), fm = FORMATOS.find(f => f.k === fmAtual);
  const link = (c.l.match(/https?:\/\/\S+$/) || [''])[0];
  dlg.innerHTML = `<div class="dc"><div class="dc-vis"><button class="dc-nav dc-ant" data-nav="-1" aria-label="Card anterior" ${i <= 0 ? 'disabled' : ''}>‹</button><img id="dc-img" src="${img(c, fmAtual)}" alt="Card: ${esc(c.t)}. ${esc(c.d)}" width="${fm.k === '1x1' ? 1080 : 1080}" height="${fm.k === '1x1' ? 1080 : fm.k === '4x5' ? 1350 : 1920}"><button class="dc-nav dc-prox" data-nav="1" aria-label="Próximo card" ${i >= lista.length - 1 ? 'disabled' : ''}>›</button></div>
  <div class="dc-pn"><div class="top"><div><h2 id="dc-t" tabindex="-1">${esc(c.t)}</h2>${c.d ? `<p class="ds">${esc(c.d)}</p>` : ''}</div><button type="button" class="x" data-fechar aria-label="Fechar">✕</button></div>
  <fieldset class="fm"><legend>1. Escolha o formato</legend><div class="opc">${FORMATOS.map(f => `<label><input type="radio" name="fm" value="${f.k}" ${f.k === fmAtual ? 'checked' : ''}><span class="ar ${f.cls}" aria-hidden="true"></span><b>${f.nome} ${f.raz}</b><small>${f.uso}</small></label>`).join('')}</div></fieldset>
  <div class="acoes"><p class="lg2">2. Baixe ou compartilhe</p>
    ${podeCompartilhar ? `<button type="button" class="bt bt-bl" data-acao="compartilhar">Compartilhar agora</button><button type="button" class="bt bt-ghost bt-bl" data-acao="baixar">Baixar imagem</button>` : `<button type="button" class="bt bt-bl" data-acao="baixar">Baixar imagem (${fm.nome} ${fm.raz})</button>`}
    <button type="button" class="bt bt-ghost bt-bl" data-acao="legenda">Copiar legenda</button></div>
  <pre class="leg-box" aria-label="Legenda sugerida">${esc(c.l)}</pre>
  <div class="dc-meta">${link ? `<a href="${esc(link)}" target="_blank" rel="noopener">Abrir no painel</a>` : ''}<button type="button" data-acao="link">Copiar link deste card</button></div>
  <div id="pos-acao"></div></div></div>`;
  $$('input[name=fm]', dlg).forEach(r => r.addEventListener('change', () => { fmAtual = r.value; LS.set('op_cards_fm', fmAtual); const im = $('#dc-img', dlg); im.src = img(c, fmAtual); const b = $('[data-acao=baixar]', dlg); if (b && !podeCompartilhar) b.textContent = `Baixar imagem (${FORMATOS.find(f => f.k === fmAtual).nome} ${FORMATOS.find(f => f.k === fmAtual).raz})`; }));
  $('#dc-t', dlg)?.focus({ preventScroll: true });
}
async function blobDe(c, fm) { const r = await fetch(img(c, fm)); if (!r.ok) throw new Error('imagem'); return r.blob(); }
const nomeArq = (c, fm) => `${c.n}_${fm}.jpg`;
function salvar(blob, nome) { const u = URL.createObjectURL(blob), a = document.createElement('a'); a.href = u; a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(u); a.remove(); }, 1500); }
async function copiar(txt, aviso) { try { await navigator.clipboard.writeText(txt); } catch { const t = document.createElement('textarea'); t.value = txt; t.style.cssText = 'position:fixed;opacity:0'; document.body.appendChild(t); t.select(); try { document.execCommand('copy'); } catch { /* ok */ } t.remove(); } aviso && toast(aviso); }
let tt; function toast(m) { const t = $('#toast'); t.textContent = m; t.hidden = false; clearTimeout(tt); tt = setTimeout(() => { t.hidden = true; }, 2800); }
async function acao(a) {
  const c = cardAtual; if (!c) return;
  try {
    if (a === 'baixar') { const b = await blobDe(c, fmAtual); salvar(b, nomeArq(c, fmAtual)); toast('Imagem baixada'); evt('card_baixar', { formato: fmAtual, colecao: c.c }); posAcao(); }
    else if (a === 'compartilhar') { const b = await blobDe(c, fmAtual); const f = new File([b], nomeArq(c, fmAtual), { type: 'image/jpeg' }); try { await navigator.share({ files: [f], text: c.l.split('\n')[0] }); evt('card_compartilhar', { formato: fmAtual, colecao: c.c }); posAcao(); } catch (e) { if (e.name !== 'AbortError') { salvar(b, nomeArq(c, fmAtual)); toast('Imagem baixada'); } } }
    else if (a === 'legenda') { await copiar(c.l, 'Legenda copiada'); evt('card_legenda', { colecao: c.c }); posAcao(); }
    else if (a === 'link') { await copiar(location.href.split('#')[0] + '#/card/' + c.id, 'Link copiado'); }
  } catch { toast('Não foi possível agora. Tente de novo.'); }
}
function posAcao() {
  return; // cadastro é opcional: sem pedido após o download
  acoes++; if (jaCadastrado() || LS.get('op_cards_pos') === '1' || acoes < 1) return; const el = $('#pos-acao', dlg); if (!el || el.innerHTML) return;
  el.innerHTML = `<div class="pos"><b>Gostou? Receba os próximos cards.</b><p>Avisamos por e-mail e WhatsApp quando sair a análise pós-eleição e cards de novas cidades.</p><button type="button" class="bt" data-abrir-cadastro>Quero receber</button><button type="button" class="dp" data-dispensar>Agora não</button></div>`;
}
function fecharCard(voltar = true) { if (dlg.open) dlg.close(); document.body.classList.remove('trava'); if (voltar && location.hash.startsWith('#/card/')) location.hash = retorno; }
dlg.addEventListener('close', () => { document.body.classList.remove('trava'); if (location.hash.startsWith('#/card/')) location.hash = retorno; });
dlg.addEventListener('click', e => {
  if (e.target === dlg) return fecharCard();
  const t = e.target.closest('[data-fechar],[data-nav],[data-acao],[data-dispensar],[data-abrir-cadastro]'); if (!t) return;
  if (t.hasAttribute('data-fechar')) fecharCard();
  else if (t.dataset.nav) { const i = lista.findIndex(x => x.id === cardAtual.id) + +t.dataset.nav; if (lista[i]) { cardAtual = lista[i]; history.replaceState(null, '', '#/card/' + cardAtual.id); desenharCard(); } }
  else if (t.dataset.acao) acao(t.dataset.acao);
  else if (t.hasAttribute('data-dispensar')) { LS.set('op_cards_pos', '1'); $('#pos-acao', dlg).innerHTML = ''; }
  else if (t.hasAttribute('data-abrir-cadastro')) abrirCadastro();
});
dlg.addEventListener('keydown', e => { if (e.key === 'ArrowLeft') $('[data-nav="-1"]', dlg)?.click(); else if (e.key === 'ArrowRight') $('[data-nav="1"]', dlg)?.click(); });

// ---------- ZIP do conjunto ----------
function zipControles(alvo, mostrar) {
  if (!mostrar) return ''; return `<label class="hp" for="zfm">Formato do arquivo ZIP</label><select class="sel" id="zfm" aria-label="Formato do ZIP">${FORMATOS.map(f => `<option value="${f.k}" ${f.k === fmAtual ? 'selected' : ''}>${f.nome} ${f.raz}</option>`).join('')}</select><button type="button" class="bt bt-roxo" data-zip="${esc(alvo)}">Baixar todos (ZIP)</button>`;
}
let zipLib = null;
const carregaZip = () => zipLib || (zipLib = new Promise((ok, no) => { if (window.JSZip) return ok(window.JSZip); const s = document.createElement('script'); s.src = '../vendor/jszip.min.js.10.1'; s.onload = () => ok(window.JSZip); s.onerror = () => no(new Error('zip')); document.head.appendChild(s); }));
async function baixarZip(alvo, btn) {
  const [tipo, v] = alvo.split(':'); const cards = tipo === 'colecao' ? POR_COL[v] : cardsDe(v); const fm = $('#zfm')?.value || fmAtual; const nome = tipo === 'colecao' ? v : v.split('/').pop();
  btn.disabled = true; const rot = btn.textContent; let p = $('.prog'); if (!p) { p = document.createElement('p'); p.className = 'prog'; p.setAttribute('role', 'status'); btn.parentNode.after(p); }
  try { const JSZip = await carregaZip(); const z = new JSZip(); let k = 0;
    for (const c of cards) { p.textContent = `Preparando ${++k} de ${cards.length}…`; z.file(nomeArq(c, fm), await blobDe(c, fm)); }
    z.file('legendas.txt', cards.map(c => `${c.n}\n${c.l}\n`).join('\n')); p.textContent = 'Compactando…';
    const out = await z.generateAsync({ type: 'blob' }); salvar(out, `cards_${nome}_${fm}.zip`); p.textContent = `Pronto: ${cards.length} cards no formato ${FORMATOS.find(f => f.k === fm).nome} ${FORMATOS.find(f => f.k === fm).raz}, com as legendas em um arquivo de texto.`; evt('zip_baixar', { formato: fm, colecao: nome });
  } catch { p.textContent = 'Não foi possível montar o ZIP agora. Você ainda pode baixar os cards um a um.'; }
  btn.disabled = false; btn.textContent = rot;
}

// ---------- cadastro (mesmo endpoint do formulário da página inicial) ----------
const TEXTO_VERSAO = 'c1', ENDPOINT = '../api/lead.php';
const origem = (() => { const o = {}; try { const q = new URLSearchParams(location.search); ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(k => { if (q.get(k)) o[k] = q.get(k).slice(0, 80); }); if (document.referrer && !document.referrer.startsWith(location.origin)) o.ref = new URL(document.referrer).hostname; } catch { /* ok */ } return o; })();
const leadHTML = id => `<form class="lf" novalidate autocomplete="on" data-lf>
  <label class="c" for="${id}-n">Nome completo <small>(obrigatório só para se cadastrar)</small><input id="${id}-n" type="text" name="nome" autocomplete="name" required maxlength="120" placeholder="Seu nome"></label>
  <label class="c" for="${id}-e">E-mail<input id="${id}-e" type="email" name="email" autocomplete="email" inputmode="email" required maxlength="160" placeholder="voce@exemplo.com.br"></label>
  <label class="c" for="${id}-t">WhatsApp <small>(com DDD)</small><input id="${id}-t" type="tel" name="telefone" autocomplete="tel-national" inputmode="tel" required maxlength="20" placeholder="(21) 99999-9999"></label>
  <div class="hp" aria-hidden="true"><label>Não preencha este campo<input type="text" name="site" tabindex="-1" autocomplete="off"></label></div>
  <label class="ck"><input type="checkbox" name="c_contato" required><span>Autorizo a Oficina Política a entrar em contato comigo por e-mail e WhatsApp para enviar novos cards e novidades de suas ferramentas para profissionais da política. Posso revogar esta autorização a qualquer momento.</span></label>
  <p class="nota">Seus dados não são vendidos nem usados para outra finalidade. Saiba mais na <a href="../privacidade.html" target="_blank" rel="noopener">Política de Privacidade</a>, que explica também como pedir a exclusão dos seus dados.</p>
  <p class="msg" role="alert" aria-live="polite"></p>
  <button class="enviar" type="submit">Quero receber os próximos cards</button></form>`;
function ligaForm(f) {
  const msg = $('.msg', f), tel = f.telefone;
  tel.addEventListener('input', () => { let d = tel.value.replace(/\D+/g, ''); if (d.startsWith('55') && d.length > 11) d = d.slice(2); d = d.slice(0, 11); tel.value = d.length > 10 ? `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}` : d.length > 6 ? `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}` : d.length > 2 ? `(${d.slice(0, 2)}) ${d.slice(2)}` : d.length ? `(${d}` : ''; });
  const erro = (c, t) => { msg.textContent = t; if (c) { c.setAttribute('aria-invalid', 'true'); c.focus(); } };
  [...f.elements].forEach(el => el.addEventListener('input', () => { el.removeAttribute('aria-invalid'); msg.textContent = ''; }));
  f.addEventListener('submit', e => {
    e.preventDefault(); if (f.site.value) return; msg.textContent = '';
    const nome = f.nome.value.trim().replace(/\s+/g, ' '), email = f.email.value.trim().toLowerCase(), dig = f.telefone.value.replace(/\D+/g, '');
    if (nome.length < 3 || !nome.includes(' ')) return erro(f.nome, 'Informe seu nome completo.');
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return erro(f.email, 'Informe um e-mail válido.');
    if (dig.length < 10 || dig.length > 11 || /^(\d)\1+$/.test(dig)) return erro(f.telefone, 'Informe o WhatsApp com DDD, por exemplo (21) 99999-9999.');
    if (!f.c_contato.checked) return erro(f.c_contato, 'Para se cadastrar, marque a caixa de autorização para receber nossas mensagens.');
    const bt = $('.enviar', f); bt.disabled = true; bt.textContent = 'Enviando…';
    fetch(ENDPOINT, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ formulario: 'cards', nome, email, telefone: dig, consentimento_contato: true, texto_versao: TEXTO_VERSAO, pagina: 'cartoes' + (location.hash || ''), origem }) })
      .then(r => r.json().catch(() => ({})).then(j => { if (!r.ok || !j.ok) throw new Error(j.erro || 'falha'); }))
      .then(() => { LS.set('op_cards_lead', '1'); evt('lead_enviado', { origem: 'cartoes' }); try { conversaoLead(); } catch { /* ok */ }
        $$('[data-lead-slot]').forEach(s => { s.innerHTML = `<div class="lf-ok" tabindex="-1"><h3>Cadastro recebido!</h3><p>Obrigado, ${esc(nome.split(' ')[0])}. Avisaremos você por e-mail e WhatsApp quando houver novos cards e novidades.</p></div>`; }); $$('.fab').forEach(b => b.remove()); $$('.pos').forEach(p => p.remove()); toast('Cadastro recebido. Obrigado!'); })
      .catch(() => { bt.disabled = false; bt.textContent = 'Quero receber os próximos cards'; msg.textContent = 'Não foi possível enviar agora. Tente de novo em instantes.'; });
  });
}
function montaLeads() { $$('[data-lead-slot]').forEach((s, i) => { if (jaCadastrado()) { s.innerHTML = `<div class="lf-ok"><h3>Você já está na lista</h3><p>Avisaremos quando houver novos cards e novidades.</p></div>`; return; } s.innerHTML = leadHTML('lf' + i); ligaForm($('form', s)); }); if (jaCadastrado()) $$('.fab').forEach(b => b.remove()); }
const dcad = $('#dlg-cad');
function abrirCadastro() { if (jaCadastrado()) return toast('Você já está na lista. Obrigado!'); if (dlg.open) dlg.close(); document.body.classList.add('trava'); if (!dcad.open) dcad.showModal(); evt('lead_abrir'); setTimeout(() => $('input[name=nome]', dcad)?.focus(), 30); }
dcad.addEventListener('click', e => { if (e.target === dcad || e.target.closest('[data-fechar]')) dcad.close(); });
dcad.addEventListener('close', () => { document.body.classList.remove('trava'); });

// ---------- rotas ----------
let pintada = '';
function rota() {
  const h = location.hash.replace(/^#\/?/, ''); const [caminho, qs] = h.split('?'); const p = caminho.split('/').filter(Boolean); const q = new URLSearchParams(qs || '');
  if (p[0] !== 'card' && dlg.open) { dlg.close(); }
  if (p[0] === 'card') { const id = decodeURIComponent(p.slice(1).join('/')); const c = POR_ID[id]; if (!c) return naoEncontrado(); if (!app.innerHTML.trim()) { retorno = '#/' + ctxPadrao(c); if (retorno.startsWith('#/cidade/')) { /* ok */ } renderFundo(ctxPadrao(c)); } abrirCard(id); return; }
  retorno = '#/' + h; if (pintada === h && app.innerHTML.trim()) return; pintada = h; window.scrollTo(0, 0);
  if (!p.length || p[0] === 'temas') { paginaInicio(); if (p[0] === 'temas') setTimeout(() => $('#temas')?.scrollIntoView(), 0); }
  else if (p[0] === 'colecao') paginaColecao(p[1], q.get('g') || '');
  else if (p[0] === 'cidades') paginaCidades(p[1] || '');
  else if (p[0] === 'cidade') paginaCidade(p[1], p[2]);
  else naoEncontrado();
  evt('tela', { rota: p[0] || 'inicio' });
}
function renderFundo(ctx) { const p = ctx.split('/'); if (p[0] === 'cidade') paginaCidade(p[1], p[2]); else if (p[0] === 'colecao') paginaColecao(p[1], ''); else paginaInicio(); retorno = '#/' + ctx; pintada = ctx; }
document.addEventListener('click', e => {
  const c = e.target.closest('[data-card]'); if (c) { retorno = location.hash || '#/'; location.hash = '#/card/' + c.dataset.card; return; }
  const z = e.target.closest('[data-zip]'); if (z) { baixarZip(z.dataset.zip, z); return; }
  if (e.target.closest('[data-abrir-cadastro]') && !e.target.closest('dialog')) { e.preventDefault(); abrirCadastro(); }
});
window.addEventListener('hashchange', rota);
const fab = $('#fab'); const obs = () => { const rod = $('#cadastro').getBoundingClientRect(); fab.classList.toggle('off', rod.top < window.innerHeight - 60); }; window.addEventListener('scroll', obs, { passive: true });

(async () => {
  try { await carregar(); } catch { app.innerHTML = `<div class="wrap"><div class="cab-pg"><div><h1>Não foi possível carregar os cards</h1><p>Verifique sua conexão e tente de novo.</p></div><button class="bt" onclick="location.reload()">Tentar de novo</button></div></div>`; return; }
  montaLeads(); rota(); obs(); carregaExtras();
})();
