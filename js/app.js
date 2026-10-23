import { CONFIG } from './config.js?v=cfb573d5';
import { MODO_DEMO, carregarEstatico, lerAoVivo, criarDemo, municipiosDireto } from './data.js?v=cfb573d5';
import { calcular } from './model.js?v=cfb573d5';
import { projetar, PARAMS } from './proj.js?v=cfb573d5';
import { viewGeral, viewCand, viewUf, viewRegiao, viewCriterios } from './views.js?v=cfb573d5';
import { viewMun, viewDistrito, viewBairro, viewLocal, trilhaHtml } from './bairros.js?v=cfb573d5';
import { baixarCSV, baixarXLSX, baixarCardPNG, baixarPNGTela, baixarPDF, slug } from './export.js?v=cfb573d5';
import { eventosEntre } from './avisos.js?v=cfb573d5';
import { iniciarMetricas, evento, tela as metTela } from './metricas.js?v=cfb573d5';
import { abrirTelao, iniciarTV } from './tv.js?v=cfb573d5';
import { iniciarConsentimento } from './consentimento.js?v=cfb573d5';
import { abrirLeads, leadsAtivos, guardaOrigem } from './leads.js?v=cfb573d5';
import { lerCard } from './card.js?v=cfb573d5';
import { abrirCompartilhar } from './compartilhar.js?v=cfb573d5';
import { setEscala, CAND, fNum, fInt, horaBR } from './util.js?v=cfb573d5';
import { carregarT1, prepT1, viewT1Geral, viewT1Uf } from './t1.js?v=cfb573d5';
import { esc } from './ui.js?v=cfb573d5';
import { getFoco, setFoco, comFoco } from './foco.js?v=cfb573d5';

const $ = s => document.querySelector(s);
const S = { B: null, geo: null, snap: null, hist: [], meta: null, fonte: '', refMode: 'lfl', demo: null, simulado: false, vistoEm: 0, P: null, Psig: '', V: null, Vsig: '' };
const root = $('#conteudo');

function sig() { return S.snap ? `${S.snap.br.st}|${S.snap.hg}|${S.snap.br.L}|${S.snap.br.F}|${S.refMode}` : ''; }
function getV() { const s = sig(); if (S.Vsig !== s) { S.V = calcular(S.B, S.snap, S.refMode); S.Vsig = s; } return S.V; }
function getP() { const s = sig() + '|' + (S.snap.mun ? Object.keys(S.snap.mun).length : 0); if (S.Psig !== s) { S.P = projetar(S.B, S.snap, S.demo ? { draws: 120 } : {}); S.Psig = s; } return S.P; }

// ---------- toast (some em 7 s, sem som) ----------
function toast(msg, forcar = false) {
  if (!forcar && rota().modo === 't1') return;
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('sai'), 6500); setTimeout(() => t.remove(), 7000);
}

// ---------- rota ----------
function rota() { const r = rota0(); if (r.modo === 't1') r.c = new URLSearchParams((location.hash.split('?')[1]) || '').get('c'); return r; }
function rota0() {
  const h = location.hash.replace(/^#\/?/, ''), [caminho, qs] = h.split('?'), p = caminho.split('/').filter(Boolean), q = new URLSearchParams(qs || '');
  let modo = 'ap'; if (p[0] === 'p' || p[0] === 'projecao') { modo = 'pr'; p.shift(); } else if (p[0] === 't1') { modo = 't1'; p.shift(); }
  if (p[0] === 'metodo' || p[0] === 'criterios') return { modo, tela: 'criterios' };
  if (p[0] === 'cand' && CAND[p[1]]) return { modo, tela: 'cand', k: p[1] };
  if (p[0] === 'mun' && p[1] && p[2]) {
    if (p[3] === 'd' && p[4] && p[5] === 'b' && p[6]) return { modo, tela: 'bairro', uf: p[1], cd: p[2], chave: p[6], di: +p[4] };
    if (p[3] === 'd' && p[4]) return { modo, tela: 'distrito', uf: p[1], cd: p[2], di: +p[4] };
    if (p[3] === 'b' && p[4]) return { modo, tela: 'bairro', uf: p[1], cd: p[2], chave: p[4] };
    if (p[3] === 'l' && p[4]) return { modo, tela: 'local', uf: p[1], cd: p[2], id: decodeURIComponent(p[4]) };
    return { modo, tela: 'mun', uf: p[1], cd: p[2] };
  }
  if (p[0] === 'regiao' && p[1]) return { modo, tela: 'regiao', reg: p[1] };
  if (p[0] === 'uf' && p[1]) return { modo, tela: 'uf', uf: p[1], c: q.get('c') };
  return { modo, tela: 'geral' };
}
const ir = h => { location.hash = comFoco(h); };

let ultimoCtx = null;
function render(manterScroll = false, forcar = false) {
  const r = rota(), y = window.scrollY;
  { const fAnt = getFoco(); setFoco(r.modo === 't1' ? r.c : null); metTela(r); if (r.modo === 't1' && r.c && r.c !== fAnt) evento('candidato_foco', { cand: r.c }); }
  const bs = document.getElementById('barra-status'); if (bs) bs.hidden = r.modo === 't1';
  document.querySelectorAll('.aba').forEach(a => a.classList.toggle('on', a.dataset.modo === r.modo));
  if (r.tela === 'criterios') { const v = viewCriterios({ B: S.B, PARAMS }, r.modo); return pintar(v, r, {}); }
  const faixa = document.getElementById('sim'), demoBar = document.getElementById('demo-bar');
  if (faixa) faixa.hidden = r.modo === 't1' || !S.simulado; if (demoBar) demoBar.hidden = r.modo === 't1' || !S.demo;
  if (r.modo === 't1') return renderT1(r, manterScroll, forcar);
  setEscala(50, 78);
  if (!S.snap) return aguardando(r);
  const ctx = { ...r, B: S.B, geo: S.geo, snap: S.snap, hist: S.hist, V: getV(), P: r.modo === 'pr' ? getP() : null, ir, csv: null, demo: !!S.demo };
  let v;
  if (r.tela === 'geral') v = viewGeral(ctx);
  else if (r.tela === 'cand') v = viewCand(ctx, r.k);
  else if (r.tela === 'regiao') v = viewRegiao(ctx, r.reg);
  else if (r.tela === 'mun') v = viewMun(ctx, r.uf, r.cd);
  else if (r.tela === 'bairro') v = viewBairro(ctx, r.uf, r.cd, r.chave, r.di);
  else if (r.tela === 'distrito') v = viewDistrito(ctx, r.uf, r.cd, r.di);
  else if (r.tela === 'local') v = viewLocal(ctx, r.uf, r.cd, r.id);
  else { if (S.fonte === 'tse-direto' && !S.snap.mun?.[r.uf]) { municipiosDireto(r.uf, S.snap).then(() => { S.Psig = ''; S.Vsig = ''; render(true); }).catch(() => {}); } v = viewUf(ctx, r.uf, r.c); }
  ultimoCtx = ctx;
  pintar(v, r, ctx);
  if (manterScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
}

async function renderT1(r, manterScroll, forcar) {
  if (manterScroll && !forcar && S.vRota?.modo === 't1') return;   // dados estáticos: a atualização periódica não precisa redesenhar
  if (!S.T1) {
    root.innerHTML = `<div data-export-raiz><div class="tela-topo"><h1>Resultados do 1º turno</h1></div><p class="carregando">Carregando resultado oficial do 1º turno…</p></div>`;
    try { S.T1 = prepT1(await carregarT1()); } catch (e) { root.innerHTML = `<div class="aviso">O resultado do 1º turno ainda não está disponível (${esc(e.message || e)}).</div>`; return; }
    if (rota().modo !== 't1') return;
  }
  const ctx = { ...r, B: S.B, geo: S.geo, snap: S.snap, T1: S.T1, ir, csv: null, demo: !!S.demo };
  setEscala(25, 65);
  let v;
  if (r.tela === 'uf') v = viewT1Uf(ctx, r.uf);
  else if (r.tela === 'mun') v = viewMun(ctx, r.uf, r.cd);
  else if (r.tela === 'bairro') v = viewBairro(ctx, r.uf, r.cd, r.chave, r.di);
  else if (r.tela === 'distrito') v = viewDistrito(ctx, r.uf, r.cd, r.di);
  else if (r.tela === 'local') v = viewLocal(ctx, r.uf, r.cd, r.id);
  else v = viewT1Geral(ctx);
  const y0 = window.scrollY; pintar(v, r, ctx); window.scrollTo(0, manterScroll ? y0 : 0);
}

function pintar(v, r, ctx) {
  const voltar = r.tela !== 'geral' ? `<a class="voltar sem-export" href="#" data-voltar>← Voltar</a>` : '';
  const sub = r.tela === 'geral' && r.modo !== 't1' ? `<a class="criterios sem-export" href="#/${r.modo === 'pr' ? 'p/' : ''}criterios">ⓘ Critérios ${r.modo === 'pr' ? 'da projeção' : 'da apuração'}</a>` : '';
  const exp = `<div class="exp sem-export" role="group" aria-label="Baixar esta tela"><button class="exp-comp" data-exp="compartilhar" title="Compartilhar no WhatsApp, Instagram e outras redes">⤴ Compartilhar</button><button class="exp-tv" data-exp="tv" title="Modo telão: slides em tela cheia para projetar ou exibir na TV" aria-label="Modo telão"><svg viewBox="0 0 24 24" width="17" height="17" aria-hidden="true"><path fill="currentColor" d="M3 4h18a1 1 0 0 1 1 1v11a1 1 0 0 1-1 1h-7v2h3v2H7v-2h3v-2H3a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1zm1 2v9h16V6H4z"/></svg><span>Telão</span></button><span>⬇ Baixar</span><button data-exp="pdf" title="PDF: página de resumo + mapas e tabelas">PDF</button><button data-exp="png" title="Imagem para redes sociais (card)">PNG</button><button data-exp="csv" ${r.tela === 'criterios' ? 'disabled' : ''}>CSV</button><button data-exp="xlsx" ${r.tela === 'criterios' ? 'disabled' : ''} title="Planilha do Excel (.xlsx)">Excel</button></div>`;
  const trilha = v.trilha ? `<nav class="trilha sem-export" aria-label="Navegação">${trilhaHtml(v.trilha)}</nav>` : '';
  root.innerHTML = `<div data-export-raiz><div class="tela-topo">${voltar}<h1>${esc(v.titulo)}</h1></div><div class="barra-ferr sem-export">${trilha}${sub}${exp}</div><div id="vista">${v.html}</div></div>`;
  v.montar(root);
  root.querySelector('[data-voltar]')?.addEventListener('click', e => { e.preventDefault(); if (history.length > 1) history.back(); else ir(r.modo === 'pr' ? '#/projecao' : r.modo === 't1' ? '#/t1' : '#/'); });
  root.querySelectorAll('[data-ref]').forEach(b => b.addEventListener('click', () => { S.refMode = b.dataset.ref; render(true); }));
  S.vCtx = ctx; S.vTitulo = v.titulo; S.vRota = r;
}

function aguardando(r) {
  const b = S.B.br, pL = 100 * b.L / b.vv, pF = 100 * b.F / b.vv;
  root.innerHTML = `<div data-export-raiz><div class="tela-topo"><h1>Apuração ainda não iniciada</h1></div><section class="painel espera"><p class="lead">O TSE começa a divulgar os resultados do 2º turno no domingo, <b>25/10/2026, a partir das 17h (horário de Brasília)</b>. Este painel atualiza sozinho a cada divulgação.</p><div class="cd" id="cd"></div>
  <h3>Referência: 1º turno (resultado final)</h3>
  <div class="kpis k4"><div class="kpi"><div class="kpi-t">${CAND.L.nome}</div><div class="kpi-v">${fNum(pL, 2)}%</div><div class="kpi-s">${fInt(b.L)} votos</div></div><div class="kpi"><div class="kpi-t">${CAND.F.nome}</div><div class="kpi-v">${fNum(pF, 2)}%</div><div class="kpi-s">${fInt(b.F)} votos</div></div><div class="kpi"><div class="kpi-t">Abstenção</div><div class="kpi-v">${fNum(100 * b.a / b.te, 2)}%</div><div class="kpi-s">${fInt(b.a)} eleitores</div></div><div class="kpi"><div class="kpi-t">Brancos + nulos</div><div class="kpi-v">${fNum(100 * (b.vb + b.tvn) / b.c, 2)}%</div><div class="kpi-s">${fInt(b.vb + b.tvn)} votos</div></div></div>
  <p><a class="btn" href="?demo=1">▶ Ver demonstração com dados simulados</a></p></section></div>`;
  const cd = $('#cd'); const t0 = new Date(CONFIG.inicioApuracao).getTime();
  const tick = () => { if (!cd || !cd.isConnected) return; const d = t0 - Date.now(); if (d <= 0) { cd.textContent = 'A apuração deve começar a qualquer momento…'; return; } const h = Math.floor(d / 36e5), m = Math.floor(d % 36e5 / 6e4), s = Math.floor(d % 6e4 / 1e3); cd.textContent = `Faltam ${Math.floor(h / 24)}d ${h % 24}h ${m}min ${s}s`; setTimeout(tick, 1000); };
  tick();
}

// ---------- status / atualização ----------
function status() {
  const el = $('#status'); if (!S.snap) { el.innerHTML = `<span class="dot off"></span> Aguardando divulgação do TSE`; return; }
  const idade = S.snap.gerado ? Math.max(0, Math.round((Date.now() - new Date(S.snap.gerado).getTime()) / 1000)) : null;
  const atras = S.meta?.checado ? Date.now() - new Date(S.meta.checado).getTime() > CONFIG.atrasoMax : false;
  const fonte = { coletor: 'coletor próprio', 'tse-direto': 'TSE direto (estados)', demo: 'DEMONSTRAÇÃO' }[S.fonte] || S.fonte;
  const v = S.vistoEm ? Math.round((Date.now() - S.vistoEm) / 1000) : 0;
  el.innerHTML = `<span class="dot ${atras ? 'off' : 'on'}"></span> TSE <b>${esc(String(S.snap.hg).slice(0, 5))}</b> · <b>${fNum(100 * S.snap.br.st / S.snap.br.ts, 1)}%</b> apurado · atualizado há ${v}s${atras ? ' · <b class="alerta">fonte atrasada</b>' : ''}`; el.title = `Fonte: ${fonte}`;
}

function aplicar(res) {
  const antes = S.snap;
  S.vistoEm = Date.now();
  if (!res.snap) { status(); if (!antes) render(); return; }
  S.fonte = res.fonte; S.meta = res.meta; S.hist = res.hist || S.hist;
  const mudou = !antes || res.snap.br.st !== antes.br.st || res.snap.hg !== antes.hg || res.snap.br.L !== antes.br.L;
  if (mudou) {
    if (S.snap?.mun && !res.snap.mun) res.snap.mun = S.snap.mun;
    S.snap = res.snap; S.Vsig = ''; S.Psig = '';
    if (antes) {
      const b = res.snap.br, pL = 100 * b.L / b.vv, pF = 100 * b.F / b.vv, la = antes.br.L > antes.br.F ? 'L' : 'F', ln = b.L > b.F ? 'L' : 'F';
      toast(`Nova parcial do TSE (${String(res.snap.hg).slice(0, 5)}): ${fNum(100 * b.st / b.ts, 1)}% apurado — ${CAND.L.nome} ${fNum(pL, 2)}% × ${CAND.F.nome} ${fNum(pF, 2)}%`);
      if (la !== ln) toast(`Virada na liderança: ${CAND[ln].nome} passou à frente.`);
      for (const e of eventosEntre(antes, res.snap, { L: CAND.L.nome, F: CAND.F.nome })) { if (e.tag !== 'virada') toast(`${e.titulo} — ${e.corpo}`); }
    }
    render(true);
  }
  status();
}

async function ciclo() { try { aplicar(await lerAoVivo()); } catch (e) { console.warn(e); status(); } }

// ---------- exportação ----------
// contexto comum a PNG, PDF e compartilhar: título, cadeia (Brasil > UF > município…), subtítulo e dados do card
function contextoExport() {
  const r = S.vRota, titulo = document.querySelector('.tela-topo h1')?.textContent || S.vTitulo || 'Oficina Política';
  const sub = `${r.modo === 'pr' ? 'Projeção' : r.modo === 't1' ? 'Resultado oficial do 1º turno' : 'Apuração'} ${r.modo === 't1' ? '2026 · TSE' : '2º turno 2026 · '}${S.snap && r.modo !== 't1' ? 'TSE ' + String(S.snap.hg).slice(0, 5) + ' · ' + fNum(100 * S.snap.br.st / S.snap.br.ts, 1) + '% apurado' : ''}${S.simulado && r.modo !== 't1' ? ' · DADOS SIMULADOS' : ''}`;
  const nome = `oficina-politica_${slug(titulo)}${S.snap ? '_' + String(S.snap.hg).slice(0, 5).replace(':', 'h') : ''}`;
  const itens = [...document.querySelectorAll('.trilha a, .trilha [aria-current]')].map(x => x.textContent.trim()), semRot = t => t.replace(/^[^:]{1,25}:\s*/, '');
  const principal = itens.length ? semRot(itens[itens.length - 1]) : titulo.replace(/\s+[—–-]\s+[12]º turno$/, ''), cadeia = itens.slice(0, -1).map(semRot).join('  ›  ');
  const base = lerCard($('[data-export-raiz]'));
  return { r, titulo, sub, nome, principal, cadeia, dados: base ? { ...base, titulo: principal, cadeia, sub } : null };
}
async function exportar(tipo, btn) {
  if (tipo === 'compartilhar') { abrirCompartilhar(contextoExport); return; }
  if (tipo === 'tv') { abrirTelao(); return; }
  evento('exportar', { tipo, aba: S.vRota?.modo || 'ap' });
  const c = contextoExport(), { r, nome, sub, principal, cadeia, dados } = c;
  const txt = btn.textContent; btn.disabled = true; btn.textContent = '…';
  try {
    if (tipo === 'csv' || tipo === 'xlsx') { const cs = S.vCtx?.csv?.(); if (!cs) return; const rod = [`Fonte: TSE. Oficina Política.${S.simulado ? ' DADOS SIMULADOS.' : ''}${r.modo === 'pr' ? ' Valores de projeção estatística, não oficiais.' : ''}`]; (tipo === 'csv' ? baixarCSV : baixarXLSX)(cs.nome || nome, cs.cab, cs.linhas, rod); }
    else if (tipo === 'png') { if (dados) await baixarCardPNG(dados, nome); else await baixarPNGTela($('[data-export-raiz]'), nome, esc(principal), sub, esc(cadeia)); }
    else await baixarPDF($('[data-export-raiz]'), nome, esc(principal), sub, esc(cadeia), dados, S.vCtx?.pdfExtra?.() || null);
  } catch (e) { toast('Não foi possível gerar o arquivo: ' + e.message, true); }
  finally { btn.disabled = false; btn.textContent = txt; }
}
document.addEventListener('click', e => { const b = e.target.closest('[data-exp]'); if (b) exportar(b.dataset.exp, b); });

// ---------- início ----------
async function iniciar() {
  try {
    if (MODO_DEMO) {
      S.demo = await criarDemo(); S.B = S.demo.B; S.simulado = true;
      S.geo = (await carregarEstatico({ semBase: true })).geo;
    } else { const e = await carregarEstatico(); S.B = e.B; S.geo = e.geo; S.simulado = e.simulado; }
  } catch (e) { root.innerHTML = `<div class="aviso">A base do 1º turno ainda não está publicada (${esc(e.message)}). Enquanto isso, veja a <a href="?demo=1">demonstração com dados simulados</a>.</div>`; return; }
  $('#sim').hidden = !S.simulado;
  let caminhoAnt = location.hash.split('?')[0];
  window.addEventListener('hashchange', () => { const c = location.hash.split('?')[0], mesmo = c === caminhoAnt && /^#\/t1/.test(c); caminhoAnt = c; render(mesmo, mesmo); });
  if (MODO_DEMO) {
    $('#demo-bar').hidden = false; let rodando = true, vel = 1;
    const passo = () => { if (!rodando) return; const r = S.demo.passo(); aplicar(r); if (r.fim) { rodando = false; $('#demo-play').textContent = '↺ Reiniciar'; } };
    $('#demo-play').onclick = () => { if (!rodando && S.demo.fim !== false) { location.reload(); return; } rodando = !rodando; $('#demo-play').textContent = rodando ? '⏸ Pausar' : '▶ Continuar'; };
    $('#demo-vel').oninput = e => { vel = +e.target.value; };
    passo(); (function laco() { setTimeout(() => { passo(); laco(); }, 2600 / vel); })();
  } else { await ciclo(); const volta = () => setTimeout(async () => { await ciclo(); volta(); }, CONFIG.intervalo * (0.8 + 0.4 * Math.random())); volta(); }   // com variação aleatória, para os visitantes não consultarem todos no mesmo instante

  render(); setInterval(status, 1000);
}
iniciarMetricas(); guardaOrigem(); iniciarConsentimento();
if (leadsAtivos()) { const r = document.querySelector('.rodape-in'); if (r) { const b = document.createElement('button'); b.type = 'button'; b.className = 'lead-link'; b.textContent = CONFIG.leads.link || 'Receber novidades'; b.addEventListener('click', abrirLeads); r.appendChild(b); } }
iniciar().then(iniciarTV);
