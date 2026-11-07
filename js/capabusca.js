// Capa do Painel: busca de candidato pelo nome + caixa "Comparar" (cartões com a trajetória, no formato do Apuração 4013).
// Dados: branch cand-pessoas (busca s/<3 letras>.json e perfis p/<3 primeiros do id>.json), os mesmos de js/cmpcand.js.
// Não importa o cmpcand.js (que puxa a tela inteira de comparação): só leva até ele, pelo endereço, as candidaturas escolhidas.
import { CONFIG } from './config.js?v=7d90a61c';

const RAW = `https://raw.githubusercontent.com/${CONFIG.repo}/`, MAX = 4;
const SLOT = ['#3E347E', '#F08A24', '#1b8f6a', '#c8102e'];
const CARGO = { 1: 'Presidente', 3: 'Governador', 5: 'Senador', 6: 'Dep. federal', 7: 'Dep. estadual', 8: 'Dep. distrital', 11: 'Prefeito', 13: 'Vereador' };
const COM_VOTOS = new Set([1, 3, 5, 6, 7, 8, 11]);   // cargos com votos por município nos arquivos cv-<ano>
const cache = new Map();
const pega = url => { if (!cache.has(url)) cache.set(url, fetch(url).then(r => { if (r.status === 404) return null; if (!r.ok) throw new Error('http ' + r.status); return r.json(); }).catch(e => { cache.delete(url); throw e; })); return cache.get(url); };
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const norm = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toUpperCase().replace(/[^A-Z0-9]+/g, ' ').trim();
const STOP = new Set(['DAS', 'DOS', 'DEL', 'DEZ']);
const palavras = s => norm(s).split(' ').filter(t => t.length >= 3 && !STOP.has(t));
const bonito = s => String(s || '').toLowerCase().replace(/(^|[\s\-\/(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E|Em) /g, x => x.toLowerCase());
const sgTxt = s => String(s || '').replace(/PC do B/g, 'PCdoB');
const fInt = n => Number(n).toLocaleString('pt-BR');
const compacto = n => n >= 1e6 ? (n / 1e6).toLocaleString('pt-BR', { maximumFractionDigits: 1 }) + ' mi' : n >= 1e4 ? Math.round(n / 1e3) + ' mil' : fInt(n);
// candidatura = [ano, cargo, uf, município, partido, número, situação, sq, votos, %, votos 2º turno, % 2º turno]
const refDe = (pid, c) => `${pid}.${c[0]}.${c[1]}.${c[2]}.${c[7]}`;
const temVotos = c => COM_VOTOS.has(c[1]) && c[0] >= 2006 && (c[8] || c[10]);
const onde = c => [CARGO[c[1]] || 'Cargo ' + c[1], c[3] ? bonito(c[3]) + (c[2] ? ' (' + c[2] + ')' : '') : (c[2] && c[2] !== 'BR' ? c[2] : '')].filter(Boolean).join(' · ');

const CSS = `
.cb{display:grid;gap:14px}
.cb-busca{position:relative;max-width:640px}
.cb-busca input{width:100%;padding:14px 16px;border-radius:14px;border:2px solid var(--roxo);font:500 16px 'Space Grotesk',system-ui,sans-serif;color:var(--tx);background:#fff;outline:none}
.cb-busca input:focus-visible{outline:3px solid var(--laranja);outline-offset:2px}
.cb-sug{position:absolute;z-index:20;left:0;right:0;top:calc(100% + 4px);margin:0;padding:6px;list-style:none;background:#fff;border:1.5px solid var(--roxo);border-radius:14px;box-shadow:0 18px 30px -18px rgba(42,34,96,.6);max-height:340px;overflow:auto}
.cb-sug li{display:flex;justify-content:space-between;gap:12px;align-items:baseline;padding:9px 12px;border-radius:10px;cursor:pointer;font-size:15px}
.cb-sug li:hover,.cb-sug li:focus{background:var(--lilas-2);outline:none}
.cb-sug li b{color:var(--roxo-2)}.cb-sug li small{color:var(--tx2);font-size:12.5px;text-align:right}
.cb-sug li.nada{cursor:default;color:var(--tx2)}
.cb-dica{margin:0;font-size:13.5px;color:var(--tx2);min-height:20px}
.cb-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px}
.cb-card{position:relative;padding:14px 16px;border-radius:16px;background:#fff;border:1.5px solid var(--linha);border-top:5px solid var(--c,var(--roxo))}
.cb-card h3{font:400 19px/1.2 'DM Serif Display',Georgia,serif;color:var(--roxo-2);margin:0 30px 2px 0}
.cb-card .cv{margin:0 0 8px;font-size:12.5px;color:var(--tx2)}
.cb-x{position:absolute;top:8px;right:8px;width:28px;height:28px;border:0;border-radius:50%;background:transparent;color:var(--tx2);font-size:16px;cursor:pointer}
.cb-x:hover{background:var(--lilas-2);color:var(--roxo-2)}
.cb-spark{display:block;width:100%;height:auto;margin:2px 0 6px}
.cb-spark text{font:700 10px 'Space Grotesk',sans-serif;fill:var(--tx2)}
.cb-ch{display:flex;flex-wrap:wrap;gap:6px}
.cb-c{font:500 12.5px/1.25 'Space Grotesk',sans-serif;padding:6px 10px;border-radius:99px;border:1.5px solid var(--linha);background:#fff;color:var(--roxo-2);cursor:pointer;text-align:left}
.cb-c[aria-pressed=true]{background:var(--roxo);border-color:var(--roxo);color:#fff}
.cb-c[disabled]{opacity:.5;cursor:not-allowed}
.cb-c.sem{border-style:dashed;cursor:default;color:var(--tx2)}
.cb-add{display:grid;place-items:center;min-height:90px;padding:14px;border-radius:16px;border:2px dashed var(--lilas);background:var(--lilas-2);color:var(--laranja-2);font:700 15px 'Space Grotesk',sans-serif;cursor:pointer}
.cb-go{display:flex;flex-wrap:wrap;gap:12px;align-items:center;justify-content:space-between;padding:14px 18px;border-radius:16px;background:var(--roxo)}
.cb-go p{margin:0;color:var(--lilas);font-size:14px}.cb-go b{display:block;font:400 clamp(17px,3vw,22px)/1.2 'DM Serif Display',Georgia,serif;color:#fff}
.cb-go .bt{display:flex;gap:10px;align-items:center;flex-wrap:wrap}
.cb-go a.go{display:inline-block;padding:11px 20px;border-radius:99px;background:var(--laranja);color:#2a1700;font-weight:700;text-decoration:none}
.cb-go a.go[aria-disabled=true]{opacity:.5;pointer-events:none}
.cb-go button{border:0;background:transparent;color:var(--lilas);font:600 13px 'Space Grotesk',sans-serif;text-decoration:underline;cursor:pointer}
.cb-aviso{margin:0;padding:10px 14px;border-radius:12px;background:#fff2e2;color:var(--laranja-2);font-size:14px}
.cb-links{display:flex;flex-wrap:wrap;gap:6px 16px;font-size:13.5px}.cb-links a{color:var(--roxo);text-decoration:underline;text-underline-offset:3px}
`;

function spark(p, selecionadas) {
  const pts = p.c.filter(temVotos).map(c => [c[0], c[8] || c[10] || 0, refDe(p.id, c)]).sort((a, b) => a[0] - b[0]);
  if (pts.length < 2) return '';
  const W = 280, H = 62, px = 22, py = 16, a0 = pts[0][0], a1 = pts[pts.length - 1][0], mx = Math.max(...pts.map(x => x[1])), mn = Math.min(...pts.map(x => x[1]));
  const X = a => px + (a1 === a0 ? (W - 2 * px) / 2 : (a - a0) / (a1 - a0) * (W - 2 * px)), Y = v => H - 16 - (mx === mn ? 14 : (v - mn) / (mx - mn) * 28);
  const linha = pts.map(x => `${X(x[0]).toFixed(1)},${Y(x[1]).toFixed(1)}`).join(' ');
  return `<svg class="cb-spark" viewBox="0 0 ${W} ${H}" role="img" aria-label="Votos por candidatura de ${esc(p.u || p.n)}"><polyline points="${linha}" fill="none" stroke="${p.cor}" stroke-width="2.2"/>${pts.map(x => `<circle cx="${X(x[0]).toFixed(1)}" cy="${Y(x[1]).toFixed(1)}" r="${selecionadas.has(x[2]) ? 5 : 3.4}" fill="${selecionadas.has(x[2]) ? p.cor : '#fff'}" stroke="${p.cor}" stroke-width="2"/><text x="${X(x[0]).toFixed(1)}" y="${(Y(x[1]) - 7).toFixed(1)}" text-anchor="middle">${compacto(x[1])}</text><text x="${X(x[0]).toFixed(1)}" y="${H - 2}" text-anchor="middle">${String(x[0]).slice(2)}</text>`).join('')}</svg>`;
}

export function montarBuscaCapa(raiz, { painelUrl = 'painel.html' } = {}) {
  if (!raiz || raiz.dataset.pronto) return; raiz.dataset.pronto = '1';
  if (!document.getElementById('cb-css')) { const st = document.createElement('style'); st.id = 'cb-css'; st.textContent = CSS; document.head.appendChild(st); }
  const pessoas = [];   // {id, n, u, a, v, c, cor}
  const sel = [];       // refs escolhidas (até 4), na ordem
  raiz.innerHTML = `<div class="cb">
    <div class="cb-busca"><input id="cb-in" type="search" autocomplete="off" role="combobox" aria-expanded="false" aria-controls="cb-sug" placeholder="Nome do candidato(a), ex.: Lula, Tiririca, Freixo" aria-label="Buscar candidato pelo nome"><ul id="cb-sug" class="cb-sug" role="listbox" hidden></ul></div>
    <p class="cb-dica" id="cb-dica" aria-live="polite">Digite pelo menos 3 letras do nome de urna ou do nome completo. Candidaturas de 1994 a 2026 (votos por município a partir de 2006).</p>
    <div class="cb-cards" id="cb-cards"></div>
    <div class="cb-go" id="cb-go" hidden><p>Comparação<b id="cb-n"></b></p><div class="bt"><button type="button" id="cb-limpa">Limpar</button><a class="go" id="cb-ir" href="#">Comparar →</a></div></div>
    <div class="cb-links"><a href="${painelUrl}#/comparar/candidatos">Abrir a comparação completa</a><a href="${painelUrl}#/comparar">Comparar territórios</a></div></div>`;
  const $ = s => raiz.querySelector(s), inp = $('#cb-in'), sug = $('#cb-sug'), dica = $('#cb-dica'), cards = $('#cb-cards');
  let seq = 0, tmr = null, itens = [];

  const refsSel = () => new Set(sel);
  function desenha() {
    const S = refsSel();
    cards.innerHTML = pessoas.map((p, i) => {
      const cs = p.c.slice().sort((a, b) => b[0] - a[0] || a[1] - b[1]);
      const chips = cs.map(c => { const r = refDe(p.id, c), ok = temVotos(c), on = S.has(r); const txt = `${c[0]} · ${esc(onde(c))}${c[4] ? ' · ' + esc(sgTxt(c[4])) : ''}`;
        return ok ? `<button type="button" class="cb-c" data-r="${esc(r)}" aria-pressed="${on}" ${!on && sel.length >= MAX ? 'disabled' : ''} title="${on ? 'Tirar da comparação' : 'Pôr na comparação'}">${txt}</button>` : `<span class="cb-c sem" title="Sem votos por município na base">${txt}</span>`; }).join('');
      return `<article class="cb-card" style="--c:${p.cor}"><button type="button" class="cb-x" data-rm="${i}" aria-label="Tirar ${esc(p.u || p.n)} da lista">✕</button>
        <h3>${esc(p.u || bonito(p.n))}</h3><p class="cv">${esc(bonito(p.n))}${p.a ? ' · nasc. ' + esc(p.a) : ''}${p.f ? ` · <span class="cpf-m" title="CPF parcialmente oculto: serve só para diferenciar homônimos">CPF ${esc(p.f)}</span>` : p.f === null ? ' · CPF não consta nos dados do TSE' : ''}${p.v === 'cpf' ? ' · eleições ligadas pelo CPF' : p.v === 'nome_incerta' || p.v === 'nome' ? ' · ligação entre eleições pelo nome: confira se é a mesma pessoa' : ''}</p>
        ${spark(p, S)}<div class="cb-ch">${chips}</div></article>`;
    }).join('') + (pessoas.length && pessoas.length < MAX ? '<button type="button" class="cb-add" id="cb-add">+ Adicionar candidatura</button>' : '');
    const go = $('#cb-go'); go.hidden = !sel.length;
    $('#cb-n').textContent = sel.length === 1 ? '1 candidatura escolhida (escolha mais uma para cruzar)' : `${sel.length} candidaturas escolhidas`;
    const a = $('#cb-ir'); a.setAttribute('aria-disabled', sel.length < 1 ? 'true' : 'false');
    a.href = painelUrl + '#/comparar/candidatos' + (sel.length ? '?' + sel.map((r, i) => 'abcd'[i] + '=' + encodeURIComponent(r)).join('&') : '');
  }
  const fecha = () => { sug.hidden = true; sug.innerHTML = ''; inp.setAttribute('aria-expanded', 'false'); };
  async function buscar() {
    const meu = ++seq, ts = palavras(inp.value);
    if (!ts.length) { fecha(); dica.textContent = 'Digite pelo menos 3 letras do nome de urna ou do nome completo.'; return; }
    dica.textContent = 'Buscando…';
    try {
      const lista = (await pega(RAW + 'cand-pessoas/s/' + ts[0].slice(0, 3).toLowerCase() + '.json')) || []; if (meu !== seq) return;
      const ach = lista.filter(e => { const w = norm(e[1] + ' ' + e[2]).split(' '); return ts.every(t => w.some(x => x.startsWith(t))); });
      const exato = e => { const w = norm(e[1]).split(' '); return ts.every(t => w.includes(t)) ? 0 : 1; };
      itens = ach.map((e, i) => [e, i]).sort((a, b) => exato(a[0]) - exato(b[0]) || a[1] - b[1]).slice(0, 12).map(x => x[0]);
      sug.innerHTML = itens.length ? itens.map((e, i) => `<li role="option" tabindex="-1" data-i="${i}"><span><b>${esc(e[1])}</b>${norm(e[1]) !== norm(e[2]) ? ` <small>${esc(bonito(e[2]))}</small>` : ''}</span><small>${esc(CARGO[e[4]] || '')} ${e[3]}${e[5] && e[5] !== 'BR' ? ' ' + esc(e[5]) : ''} · ${esc(sgTxt(e[6]))}${e[7] > 1 ? ` · ${e[7]} eleições` : ''}${e[8] ? ` · <span class="cpf-m" title="CPF parcialmente oculto: serve só para diferenciar homônimos">CPF ${esc(e[8])}</span>` : ''}</small></li>`).join('') : '<li class="nada">Nenhum candidato com esse nome na base. Tente outra grafia.</li>';
      sug.hidden = false; inp.setAttribute('aria-expanded', 'true'); dica.textContent = itens.length ? 'Escolha o candidato para ver as eleições dele.' : '';
    } catch { if (meu === seq) dica.textContent = 'Não foi possível buscar agora. Tente de novo em instantes.'; }
  }
  async function adiciona(pid) {
    if (pessoas.some(p => p.id === pid)) { dica.textContent = 'Essa pessoa já está na lista.'; return; }
    if (pessoas.length >= MAX) { dica.textContent = `Até ${MAX} candidatos por vez. Tire um para pôr outro.`; return; }
    dica.textContent = 'Carregando as eleições…';
    try {
      const bloco = await pega(RAW + 'cand-pessoas/p/' + pid.slice(0, 3) + '.json'), p = bloco && bloco[pid]; if (!p) throw new Error('não encontrado');
      const cor = SLOT.find(c => !pessoas.some(x => x.cor === c)) || SLOT[0];
      const pessoa = { ...p, id: pid, cor }; pessoas.push(pessoa);
      // escolha inicial: a candidatura mais recente com votos por município; sendo a primeira pessoa, também a anterior (mesmo candidato em anos diferentes)
      const com = p.c.filter(temVotos).sort((a, b) => b[0] - a[0] || a[1] - b[1]);
      const quer = pessoas.length === 1 ? 2 : 1; for (const c of com.slice(0, quer)) if (sel.length < MAX) sel.push(refDe(pid, c));
      dica.textContent = com.length ? 'Marque as candidaturas que quer comparar (até 4) e abra a comparação.' : 'Esse candidato não tem votos por município na base (vereador, vice ou antes de 2006): veja a trajetória abaixo.';
      desenha();
    } catch { dica.textContent = 'Não foi possível carregar esse candidato agora. Tente de novo.'; }
  }
  inp.addEventListener('input', () => { clearTimeout(tmr); tmr = setTimeout(buscar, 220); });
  inp.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); sug.querySelector('li[data-i]')?.click(); } if (e.key === 'Escape') fecha(); if (e.key === 'ArrowDown') sug.querySelector('li[data-i]')?.focus(); });
  sug.addEventListener('keydown', e => { const li = e.target.closest('li[data-i]'); if (!li) return; if (e.key === 'Enter') li.click(); if (e.key === 'ArrowDown') { e.preventDefault(); li.nextElementSibling?.focus(); } if (e.key === 'ArrowUp') { e.preventDefault(); (li.previousElementSibling || inp).focus(); } if (e.key === 'Escape') { fecha(); inp.focus(); } });
  sug.addEventListener('click', e => { const li = e.target.closest('li[data-i]'); if (!li) return; const x = itens[+li.dataset.i]; fecha(); inp.value = ''; adiciona(x[0]); });
  document.addEventListener('click', e => { if (!e.target.closest('.cb-busca')) fecha(); });
  raiz.addEventListener('click', e => {
    const c = e.target.closest('.cb-c[data-r]'); if (c) { const r = c.dataset.r, i = sel.indexOf(r); if (i >= 0) sel.splice(i, 1); else if (sel.length < MAX) sel.push(r); desenha(); return; }
    const x = e.target.closest('[data-rm]'); if (x) { const p = pessoas.splice(+x.dataset.rm, 1)[0]; for (let i = sel.length - 1; i >= 0; i--) if (sel[i].startsWith(p.id + '.')) sel.splice(i, 1); desenha(); return; }
    if (e.target.closest('#cb-add')) { inp.focus(); return; }
    if (e.target.closest('#cb-limpa')) { pessoas.length = 0; sel.length = 0; desenha(); }
  });
  desenha();
}
