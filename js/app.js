import { CONFIG } from './config.js';
import { MODO_DEMO, carregarEstatico, lerAoVivo, criarDemo, municipiosDireto } from './data.js';
import { calcular } from './model.js';
import { projetar, PARAMS } from './proj.js';
import { viewGeral, viewCand, viewUf, viewCriterios } from './views.js';
import { viewMun } from './bairros.js';
import { baixarCSV, baixarPNG, baixarPDF, slug } from './export.js';
import { CAND, fNum, fInt, horaBR } from './util.js';
import { esc } from './ui.js';

const $ = s => document.querySelector(s);
const S = { B: null, geo: null, snap: null, hist: [], meta: null, fonte: '', refMode: 'lfl', demo: null, simulado: false, vistoEm: 0, P: null, Psig: '', V: null, Vsig: '' };
const root = $('#conteudo');

function sig() { return S.snap ? `${S.snap.br.st}|${S.snap.hg}|${S.snap.br.L}|${S.snap.br.F}|${S.refMode}` : ''; }
function getV() { const s = sig(); if (S.Vsig !== s) { S.V = calcular(S.B, S.snap, S.refMode); S.Vsig = s; } return S.V; }
function getP() { const s = sig() + '|' + (S.snap.mun ? Object.keys(S.snap.mun).length : 0); if (S.Psig !== s) { S.P = projetar(S.B, S.snap, S.demo ? { draws: 120 } : {}); S.Psig = s; } return S.P; }

// ---------- toast (some em 7 s, sem som) ----------
function toast(msg) {
  const t = document.createElement('div'); t.className = 'toast'; t.textContent = msg; $('#toasts').appendChild(t);
  setTimeout(() => t.classList.add('sai'), 6500); setTimeout(() => t.remove(), 7000);
}

// ---------- rota ----------
function rota() {
  const h = location.hash.replace(/^#\/?/, ''), [caminho, qs] = h.split('?'), p = caminho.split('/').filter(Boolean), q = new URLSearchParams(qs || '');
  let modo = 'ap'; if (p[0] === 'p' || p[0] === 'projecao') { modo = 'pr'; if (p[0] === 'projecao') p.shift(); else p.shift(); }
  if (p[0] === 'metodo' || p[0] === 'criterios') return { modo, tela: 'criterios' };
  if (p[0] === 'cand' && CAND[p[1]]) return { modo, tela: 'cand', k: p[1] };
  if (p[0] === 'mun' && p[1] && p[2]) return { modo, tela: 'mun', uf: p[1], cd: p[2] };
  if (p[0] === 'uf' && p[1]) return { modo, tela: 'uf', uf: p[1], c: q.get('c') };
  return { modo, tela: 'geral' };
}
const ir = h => { location.hash = h; };

let ultimoCtx = null;
function render(manterScroll = false) {
  const r = rota(), y = window.scrollY;
  document.querySelectorAll('.aba').forEach(a => a.classList.toggle('on', a.dataset.modo === r.modo));
  if (r.tela === 'criterios') { const v = viewCriterios({ B: S.B, PARAMS }, r.modo); return pintar(v, r, {}); }
  if (!S.snap) return aguardando(r);
  const ctx = { ...r, B: S.B, geo: S.geo, snap: S.snap, hist: S.hist, V: getV(), P: r.modo === 'pr' ? getP() : null, ir, csv: null, demo: !!S.demo };
  let v;
  if (r.tela === 'geral') v = viewGeral(ctx);
  else if (r.tela === 'cand') v = viewCand(ctx, r.k);
  else if (r.tela === 'mun') v = viewMun(ctx, r.uf, r.cd);
  else { if (S.fonte === 'tse-direto' && !S.snap.mun?.[r.uf]) { municipiosDireto(r.uf, S.snap).then(() => { S.Psig = ''; S.Vsig = ''; render(true); }).catch(() => {}); } v = viewUf(ctx, r.uf, r.c); }
  ultimoCtx = ctx;
  pintar(v, r, ctx);
  if (manterScroll) window.scrollTo(0, y); else window.scrollTo(0, 0);
}

function pintar(v, r, ctx) {
  const voltar = r.tela !== 'geral' ? `<a class="voltar sem-export" href="#" data-voltar>← Voltar</a>` : '';
  const sub = r.tela === 'geral' ? `<a class="criterios sem-export" href="#/${r.modo === 'pr' ? 'p/' : ''}criterios">ⓘ Critérios ${r.modo === 'pr' ? 'da projeção' : 'da apuração'}</a>` : '';
  const exp = `<div class="exp sem-export" role="group" aria-label="Baixar"><span>Baixar:</span><button data-exp="pdf">PDF</button><button data-exp="png">PNG</button><button data-exp="csv" ${r.tela === 'criterios' ? 'disabled' : ''}>CSV</button></div>`;
  root.innerHTML = `<div data-export-raiz><div class="tela-topo">${voltar}<h1>${esc(v.titulo)}</h1>${sub}${exp}</div><div id="vista">${v.html}</div></div>`;
  v.montar(root);
  root.querySelector('[data-voltar]')?.addEventListener('click', e => { e.preventDefault(); if (history.length > 1) history.back(); else ir(r.modo === 'pr' ? '#/projecao' : '#/'); });
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
  el.innerHTML = `<span class="dot ${atras ? 'off' : 'on'}"></span> TSE <b>${esc(String(S.snap.hg).slice(0, 5))}</b> · <b>${fNum(100 * S.snap.br.st / S.snap.br.ts, 1)}%</b> apurado · checado há ${v}s · ${fonte}${atras ? ' · <b class="alerta">fonte atrasada</b>' : ''}`;
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
    }
    render(true);
  }
  status();
}

async function ciclo() { try { aplicar(await lerAoVivo()); } catch (e) { console.warn(e); status(); } }

// ---------- exportação ----------
async function exportar(tipo, btn) {
  const r = S.vRota, titulo = S.vTitulo || 'Oficina Política';
  const sub = `${r.modo === 'pr' ? 'Projeção' : 'Apuração'} 2º turno 2026 · ${S.snap ? 'TSE ' + String(S.snap.hg).slice(0, 5) + ' · ' + fNum(100 * S.snap.br.st / S.snap.br.ts, 1) + '% apurado' : ''}${S.simulado ? ' · DADOS SIMULADOS' : ''}`;
  const nome = `oficina-politica_${slug(titulo)}${S.snap ? '_' + String(S.snap.hg).slice(0, 5).replace(':', 'h') : ''}`;
  const txt = btn.textContent; btn.disabled = true; btn.textContent = '…';
  try {
    if (tipo === 'csv') { const c = S.vCtx?.csv?.(); if (!c) return; const rod = [`Fonte: TSE. Oficina Política.${S.simulado ? ' DADOS SIMULADOS.' : ''}${r.modo === 'pr' ? ' Valores de projeção estatística, não oficiais.' : ''}`]; baixarCSV(c.nome || nome, c.cab, c.linhas, rod); }
    else if (tipo === 'png') await baixarPNG($('[data-export-raiz]'), nome, titulo, sub);
    else await baixarPDF($('[data-export-raiz]'), nome, titulo, sub);
  } catch (e) { toast('Não foi possível gerar o arquivo: ' + e.message); }
  btn.disabled = false; btn.textContent = txt;
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
  window.addEventListener('hashchange', () => render(false));
  if (MODO_DEMO) {
    $('#demo-bar').hidden = false; let rodando = true, vel = 1;
    const passo = () => { if (!rodando) return; const r = S.demo.passo(); aplicar(r); if (r.fim) { rodando = false; $('#demo-play').textContent = '↺ Reiniciar'; } };
    $('#demo-play').onclick = () => { if (!rodando && S.demo.fim !== false) { location.reload(); return; } rodando = !rodando; $('#demo-play').textContent = rodando ? '⏸ Pausar' : '▶ Continuar'; };
    $('#demo-vel').oninput = e => { vel = +e.target.value; };
    passo(); (function laco() { setTimeout(() => { passo(); laco(); }, 2600 / vel); })();
  } else { await ciclo(); setInterval(ciclo, CONFIG.intervalo); }
  render(); setInterval(status, 1000);
}
iniciar();
