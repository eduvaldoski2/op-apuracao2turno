// "Pergunte aos dados": a pessoa pergunta, a IA consulta os números do painel (ferramentas em iatools.js) e responde; quando faz sentido, a resposta
// vem com um gráfico que pode ser baixado em 1:1, 4:5 e 9:16. O servidor (api/ia.php) só guarda a chave e repassa a conversa ao provedor de IA.
import { CONFIG, RAIZ } from './config.js?v=e9d27821';
import { esc } from './ui.js?v=e9d27821';
import { FERRAMENTAS, novaSessao, graficoHtml, resumo } from './iatools.js?v=e9d27821';
import { CONTA, montarConta, atualizarCota, sessaoExpirou } from './conta.js?v=e9d27821';

const ENDPOINT = () => (CONFIG.ia?.endpoint ?? (RAIZ + 'api/ia.php'));
const MAX_PASSOS = 8;
const EXEMPLOS = [
  'Quais os 10 municípios do Rio de Janeiro onde o Lula teve maior percentual?',
  'Compare o Nordeste com o Sul e diga onde a abstenção foi maior.',
  'Em quais estados o Flávio teve mais de 60% dos votos válidos?',
  'Quais bairros de Niterói mais votaram no Lula?',
  'Onde o Lula mais cresceu em relação ao 1º turno?',
  'Compare Rio, São Paulo e Minas Gerais.',
];
const ATALHOS = [
  { t: 'Estados onde Lula foi melhor', a: { escopo: 'brasil_estados', metrica: 'pL', ordem: 'desc', limite: 10 } },
  { t: 'Estados onde Flávio foi melhor', a: { escopo: 'brasil_estados', metrica: 'pF', ordem: 'desc', limite: 10 } },
  { t: 'Maior abstenção (estados)', a: { escopo: 'brasil_estados', metrica: 'pAb', ordem: 'desc', limite: 10 } },
  { t: 'Onde Lula mais cresceu (estados)', a: { escopo: 'brasil_estados', metrica: 'dL', ordem: 'desc', limite: 10 } },
  { t: 'Maiores cidades: vantagem do vencedor', a: { escopo: 'brasil_municipios', metrica: 'margemPP', ordem: 'desc', limite: 10, votos_validos_minimo: 200000 } },
];

// conversa guardada enquanto a página estiver aberta
const ESTADO = { itens: [], hist: [], ocupado: false };

const md = t => {   // markdown mínimo e seguro: **negrito**, listas com "- " e parágrafos
  const linhas = esc(t).split('\n'); let out = '', lista = false;
  for (const l of linhas) {
    const m = l.match(/^\s*[-•*]\s+(.*)$/), f = s => s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>');
    if (m) { if (!lista) { out += '<ul>'; lista = true; } out += `<li>${f(m[1])}</li>`; }
    else { if (lista) { out += '</ul>'; lista = false; } if (l.trim()) out += `<p>${f(l)}</p>`; }
  }
  return out + (lista ? '</ul>' : '');
};

async function chamar(mensagens) {
  let r, j = null;
  try { r = await fetch(ENDPOINT(), { method: 'POST', credentials: 'same-origin', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mensagens }) }); j = await r.json().catch(() => null); }
  catch { throw Object.assign(new Error('Sem conexão com o servidor da IA.'), { codigo: 'rede' }); }
  if (!r.ok || !j?.ok) throw Object.assign(new Error(j?.mensagem || (r.status === 404 ? 'A IA ainda não foi ativada neste site.' : 'Não foi possível consultar a IA agora.')), { codigo: j?.erro || ('http_' + r.status) });
  atualizarCota(j.cota);
  return j;
}

export async function perguntarIA(texto, ctxFn, S, aoStatus = () => {}) {
  const msgs = [...ESTADO.hist.slice(-6), { role: 'user', content: [{ type: 'text', text: texto }] }];
  const trace = [];
  for (let passo = 0; passo < MAX_PASSOS; passo++) {
    aoStatus(passo ? 'Consultando os dados…' : 'Pensando…');
    const j = await chamar(msgs);
    msgs.push({ role: 'assistant', content: j.content });
    const usos = (j.content || []).filter(b => b.type === 'tool_use');
    if (j.stop_reason !== 'tool_use' || !usos.length) {
      const resp = (j.content || []).filter(b => b.type === 'text').map(b => b.text).join('\n').trim();
      ESTADO.hist.push({ role: 'user', content: [{ type: 'text', text: texto }] }, { role: 'assistant', content: [{ type: 'text', text: resp || '(sem resposta)' }] });
      return { texto: resp, trace };
    }
    const resultados = [];
    for (const u of usos) {
      aoStatus('Consultando os dados…');
      let saida, erro = false;
      try { saida = await FERRAMENTAS[u.name]?.(ctxFn(), u.input || {}, S); if (saida === undefined) throw new Error('ferramenta desconhecida'); }
      catch (e) { saida = { erro: String(e.message || e) }; erro = true; }
      trace.push({ nome: u.name, args: u.input, erro });
      let s = JSON.stringify(saida); if (s.length > 7000) s = s.slice(0, 7000) + '…(cortado)';
      resultados.push({ type: 'tool_result', tool_use_id: u.id, content: s, ...(erro ? { is_error: true } : {}) });
    }
    msgs.push({ role: 'user', content: resultados });
  }
  throw new Error('A consulta ficou longa demais. Tente uma pergunta mais específica.');
}

const NOTA_IMG = 'Análise assistida por IA · números do TSE';
function blocoImagem(S, im, ia) {
  const r = S.resultados.get(im.id); if (!r) return '';
  const g = r.tipo === 'ranking' ? `<div class="rk-sub">${esc(im.subtitulo || '')}</div>` + graficoHtml(r) : graficoHtml(r);
  return `<section class="painel ia-img" data-export-nota="${ia ? esc(NOTA_IMG) : ''}"><h2>${esc(im.titulo)}</h2>${g}</section>`;
}
const traceHtml = tr => tr.length ? `<details class="ia-trace"><summary>Dados consultados (${tr.length})</summary><ul>${tr.map(t => `<li><code>${esc(t.nome)}</code> ${esc(JSON.stringify(t.args || {}))}${t.erro ? ' <b>(falhou)</b>' : ''}</li>`).join('')}</ul></details>` : '';

function itemHtml(it) {
  if (it.carregando) return `<article class="ia-it"><div class="ia-q">${esc(it.q)}</div><div class="ia-a ia-wait"><span class="ia-pulse"></span><span data-st>${esc(it.status || 'Pensando…')}</span></div></article>`;
  if (it.erro) return `<article class="ia-it"><div class="ia-q">${esc(it.q)}</div><div class="ia-a ia-err">${esc(it.erro)}</div></article>`;
  return `<article class="ia-it"><div class="ia-q">${esc(it.q)}</div><div class="ia-a">${it.ia ? '<span class="ia-tag">Resposta gerada por IA com os dados do painel</span>' : '<span class="ia-tag ia-tag-d">Consulta direta aos dados do painel</span>'}${it.texto ? md(it.texto) : ''}</div>${it.imagens}${traceHtml(it.trace || [])}</article>`;
}

export function viewPerguntar(ctx) {
  const html = `
  <section class="painel ia-box sem-export">
    <h2>Pergunte aos dados</h2>
    <p class="sub">Faça uma pergunta sobre o resultado do 2º turno: a IA consulta os números do painel, responde e, se quiser, monta um gráfico para compartilhar (1:1, 4:5 ou 9:16). <b>É preciso ter uma conta gratuita para usar a pergunta livre.</b></p>
    <div id="ia-conta" class="ia-conta"></div>
    <form id="ia-form" class="ia-form"><textarea id="ia-q" rows="2" maxlength="400" placeholder="Ex.: Quais os 10 municípios onde o Lula foi melhor em Minas Gerais?" aria-label="Sua pergunta"></textarea>
      <div class="ia-acoes"><button type="submit" class="btn" id="ia-go">Perguntar</button><span class="ia-cont" id="ia-cont">0/400</span></div></form>
    <div class="ia-ex"><span>Experimente:</span>${EXEMPLOS.map((e, i) => `<button type="button" data-ex="${i}">${esc(e)}</button>`).join('')}</div>
    <div class="ia-ex ia-at"><span>Consultas rápidas (sem IA):</span>${ATALHOS.map((a, i) => `<button type="button" data-at="${i}">${esc(a.t)}</button>`).join('')}</div>
    <p class="ia-aviso">A IA pode errar na interpretação da pergunta. Ela só usa números do painel (TSE) e mostra, em “Dados consultados”, o que foi buscado. Não escreva dados pessoais: a pergunta é enviada a um provedor de IA. Cada conta tem um número de perguntas por mês e por dia, para manter o serviço gratuito. <a href="privacidade.html">Privacidade</a></p>
  </section>
  <div id="ia-lista"></div>`;
  return { html, titulo: 'Pergunte à IA', trilha: [['Brasil', '#/'], ['Pergunte à IA']], montar(root) {
    const lista = root.querySelector('#ia-lista'), q = root.querySelector('#ia-q'), form = root.querySelector('#ia-form'), go = root.querySelector('#ia-go');
    const ctxFn = () => ctx;
    const pinta = () => { lista.innerHTML = ESTADO.itens.slice().reverse().map(itemHtml).join(''); };
    q.addEventListener('input', () => { root.querySelector('#ia-cont').textContent = `${q.value.length}/400`; });
    q.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); form.requestSubmit(); } });
    async function rodar(texto) {
      texto = texto.trim(); if (!texto || ESTADO.ocupado) return;
      ESTADO.ocupado = true; go.disabled = true;
      const it = { q: texto, carregando: true, status: 'Pensando…', ia: true }; ESTADO.itens.push(it); pinta();
      const S = novaSessao();
      try {
        const r = await perguntarIA(texto, ctxFn, S, st => { it.status = st; const el = lista.querySelector('[data-st]'); if (el) el.textContent = st; });
        it.carregando = false; it.texto = r.texto; it.trace = r.trace;
        it.imagens = S.imagens.map(im => blocoImagem(S, im, true)).join('');
      } catch (e) {
        if (e.codigo === 'login') { sessaoExpirou(); ctl?.mostrarLogin('Sua sessão expirou. Entre de novo para continuar.'); aplica(); }
        it.carregando = false; it.erro = ['limite', 'cota', 'cota_dia', 'orcamento'].includes(e.codigo) ? (e.message || 'Você atingiu o limite de perguntas por enquanto. Tente mais tarde ou use as consultas rápidas.') : (e.message || 'Não foi possível responder agora.');
        if (e.codigo === 'indisponivel' || /^http_404/.test(e.codigo || '')) it.erro += ' As consultas rápidas continuam funcionando.';
      } finally { ESTADO.ocupado = false; ctl?.atualizar(); aplica(); pinta(); }
    }
    form.addEventListener('submit', e => { e.preventDefault(); const t = q.value; q.value = ''; root.querySelector('#ia-cont').textContent = '0/400'; rodar(t); });
    root.querySelector('.ia-ex').addEventListener('click', e => { const b = e.target.closest('[data-ex]'); if (b) rodar(EXEMPLOS[+b.dataset.ex]); });
    root.querySelector('.ia-at').addEventListener('click', async e => {
      const b = e.target.closest('[data-at]'); if (!b || ESTADO.ocupado) return;
      const a = ATALHOS[+b.dataset.at], S = novaSessao(), it = { q: a.t, ia: false, carregando: true }; ESTADO.itens.push(it); pinta();
      try {
        const r = await FERRAMENTAS.ranking(ctx, a.a, S), id = r.resultado_id; S.imagens.push({ id, titulo: r.titulo, subtitulo: '' });
        const topo = r.itens[0]; it.carregando = false; it.trace = [{ nome: 'ranking', args: a.a }];
        it.texto = `**${r.titulo}.** Em primeiro lugar: **${topo.nome}** (${(a.a.metrica === 'dL' || a.a.metrica === 'dF' || a.a.metrica === 'margemPP') ? topo.valor.toLocaleString('pt-BR') + ' p.p.' : topo.valor.toLocaleString('pt-BR') + (['pL', 'pF', 'pAb', 'pBrNu'].includes(a.a.metrica) ? '%' : '')}). Baixe a imagem no botão “⬇ Baixar”.`;
        it.imagens = S.imagens.map(im => blocoImagem(S, im, false)).join('');
      } catch (er) { it.carregando = false; it.erro = 'Não foi possível consultar os dados: ' + (er.message || er); }
      pinta();
    });
    // a pergunta livre só libera para quem tem conta confirmada (e se o servidor tiver a chave da IA configurada)
    const aplica = () => {
      const livre = CONTA.carregado && CONTA.logado && CONTA.ia_ativa && (!CONTA.cota || CONTA.cota.restantes > 0);
      q.disabled = !livre; go.disabled = !livre || ESTADO.ocupado; root.querySelectorAll('[data-ex]').forEach(b => { b.disabled = !livre; });
      q.placeholder = !CONTA.logado ? 'Crie sua conta gratuita (ou entre) para fazer perguntas à IA' : (CONTA.cota && CONTA.cota.restantes <= 0 ? 'Suas perguntas deste mês acabaram. Use as consultas rápidas.' : 'Ex.: Quais os 10 municípios onde o Lula foi melhor em Minas Gerais?');
      root.querySelector('.ia-off')?.remove();
      if (CONTA.carregado && !CONTA.erro && !CONTA.ia_ativa) root.querySelector('.ia-aviso')?.insertAdjacentHTML('beforebegin', '<p class="ia-off">A pergunta livre à IA ainda não está ativada neste site. As <b>consultas rápidas</b> abaixo funcionam normalmente.</p>');
    };
    const ctl = montarConta(root.querySelector('#ia-conta'), aplica);
    aplica();
    pinta();
  } };
}
export { resumo };
