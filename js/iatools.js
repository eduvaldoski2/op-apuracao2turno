// Ferramentas que a IA (ou os atalhos) usam para consultar os dados do painel. Rodam no navegador, sobre os mesmos números que a pessoa vê na tela:
// assim a resposta nunca usa um número que não esteja no painel, e os gráficos saem direto dos dados (não do texto da IA).
import { METRICAS, fmtMetrica, buscar, obter, bairrosDe, municipiosDe, todosMunicipios, ufs, regioesDe, ordenar, entradaPorRef, UF_NOME, sigla } from './unidades.js?v=152c678e';
import { esc } from './ui.js?v=152c678e';
import { CAND } from './util.js?v=152c678e';
import { resultadoHtml } from './comparar.js?v=152c678e';

const num = (v, d = 2) => (v == null || !isFinite(v) ? null : Math.round(v * 10 ** d) / 10 ** d);
const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
const METRICAS_RANK = ['pL', 'pF', 'L', 'F', 'margemPP', 'margem', 'pAb', 'pBrNu', 'dL', 'dF', 'vv', 'te'];

export function resumo(x) {
  return { ref: x.ref, nome: x.rotulo, tipo: x.tipo, venceu: x.lider ? CAND[x.lider].nome : 'empate',
    lula_pct: num(x.pL), flavio_pct: num(x.pF), votos_lula: x.L, votos_flavio: x.F, vantagem_lula_pp: num(x.margemPP), vantagem_lula_votos: x.margem,
    votos_validos: x.vv, abstencao_pct: num(x.pAb), brancos_nulos_pct: num(x.pBrNu), lula_1turno_pct: num(x.p1L), flavio_1turno_pct: num(x.p1F),
    variacao_lula_pp: num(x.dL, 1), variacao_flavio_pp: num(x.dF, 1), eleitorado: x.te, apurado_pct: num(x.pst, 1) };
}

export const FERRAMENTAS = {
  async buscar_local(ctx, a) {
    const tipo = { estado: ['uf'], municipio: ['mun'], regiao: ['reg'], pais: ['br'] }[a.tipo] || null;
    const uf = a.uf ? String(a.uf).toLowerCase() : null;
    const r = buscar(ctx.B, a.consulta, { tipo, uf, max: 8 });
    return { candidatos: r.map(u => ({ ref: u.ref, nome: u.rotulo, tipo: u.tipo, eleitorado: u.te })), dica: r.length ? 'Use o campo ref nas outras ferramentas.' : 'Nada encontrado: tente outra grafia ou informe a UF.' };
  },
  async resultado_local(ctx, a) {
    const x = await obter(ctx, a.ref); return { resultado: resumo(x) };
  },
  async comparar(ctx, a, S) {
    const refs = [].concat(a.refs || []).slice(0, 4); if (refs.length < 2) throw new Error('Informe de 2 a 4 refs.');
    const es = await Promise.all(refs.map(r => obter(ctx, r)));
    const id = S.novoId(); S.resultados.set(id, { tipo: 'comparar', titulo: es.map(x => x.nome).join(' × '), dados: es });
    return { resultado_id: id, itens: es.map(resumo) };
  },
  async ranking(ctx, a, S) {
    const met = METRICAS_RANK.includes(a.metrica) ? a.metrica : 'pL', ordem = a.ordem === 'asc' ? 'asc' : 'desc', lim = clamp(+a.limite || 10, 1, 15);
    const esc_ = a.escopo; let lista, rotEscopo;
    if (esc_ === 'brasil_estados') { lista = ufs(ctx).filter(u => u.uf !== 'zz'); rotEscopo = 'Estados'; }
    else if (esc_ === 'regioes') { lista = regioesDe(ctx); rotEscopo = 'Regiões'; }
    else if (esc_ === 'brasil_municipios') { lista = todosMunicipios(ctx).filter(m => m.uf !== 'zz'); rotEscopo = 'Municípios do Brasil'; }
    else if (esc_ === 'uf_municipios') { const uf = String(a.uf || '').toLowerCase(); if (!UF_NOME[uf]) throw new Error('Informe a UF (sigla de 2 letras).'); lista = municipiosDe(ctx, uf); rotEscopo = `Municípios de ${UF_NOME[uf]}`; }
    else if (esc_ === 'municipio_bairros') {
      const [t, uf, cd] = String(a.municipio_ref || '').split(':'); if (t !== 'mun') throw new Error('Informe municipio_ref (ref de município).');
      lista = await bairrosDe(ctx, uf, cd); rotEscopo = `Bairros de ${entradaPorRef(ctx.B, a.municipio_ref)?.nome || cd}`;
    } else throw new Error('escopo inválido');
    const minVV = a.votos_validos_minimo != null ? +a.votos_validos_minimo : (['brasil_municipios', 'uf_municipios', 'municipio_bairros'].includes(esc_) ? 1000 : 0);
    const base = lista.filter(x => (x.vv || 0) >= minVV);
    const top = ordenar(base, met, ordem, lim);
    const id = S.novoId();
    const titulo = `${rotEscopo}: ${ordem === 'desc' ? 'maiores' : 'menores'} valores de ${METRICAS[met].curto.toLowerCase()}`;
    const itens = top.map((x, i) => ({ pos: i + 1, ref: x.ref, nome: x.rotulo, valor: num(x[met], 2), lula_pct: num(x.pL), flavio_pct: num(x.pF), votos_validos: x.vv, abstencao_pct: num(x.pAb), venceu: x.lider ? CAND[x.lider].nome : 'empate' }));
    S.resultados.set(id, { tipo: 'ranking', titulo, escopo: esc_, metrica: met, ordem, nUF: esc_ === 'brasil_municipios', itens: top, universo: base.length, minVV });
    return { resultado_id: id, titulo, metrica: METRICAS[met].rot, universo: base.length, filtro: minVV ? `votos válidos ≥ ${minVV}` : 'sem filtro', itens };
  },
  async sugerir_imagem(ctx, a, S) {
    const r = S.resultados.get(a.resultado_id); if (!r) throw new Error('resultado_id desconhecido: use um resultado_id devolvido por ranking ou comparar.');
    S.imagens.push({ id: a.resultado_id, titulo: String(a.titulo || r.titulo).slice(0, 110), subtitulo: String(a.subtitulo || '').slice(0, 160) });
    return { ok: true, nota: 'A imagem será montada a partir dos dados desse resultado. Não repita os números no texto além do necessário.' };
  },
};

export function novaSessao() { let n = 0; return { resultados: new Map(), imagens: [], novoId: () => 'r' + (++n) }; }

// ---------- gráficos (HTML) que viram imagem 1:1, 4:5 e 9:16 ----------
export function graficoHtml(r) {
  if (r.tipo === 'comparar') return resultadoHtml(r.dados);
  const met = r.metrica, k = METRICAS[met], itens = r.itens, mx = Math.max(...itens.map(x => Math.abs(x[met]) || 0), 1e-9);
  const corBarra = k.cand ? CAND[k.cand].cor : '#3E347E';
  const dois = met === 'pL' || met === 'pF';
  const linhas = itens.map((x, i) => {
    const w = (['pL', 'pF', 'pAb', 'pBrNu'].includes(met) ? Math.min(100, Math.abs(x[met])) : 100 * Math.abs(x[met]) / mx);
    const nome = esc(x.nome);
    const barra = dois ? `<div class="rk-bar rk-2"><i style="width:${Math.max(0, Math.min(100, x.pL))}%;background:${CAND.L.cor}"></i><i style="width:${Math.max(0, Math.min(100, x.pF))}%;background:${CAND.F.cor}"></i></div>`
      : `<div class="rk-bar"><i style="width:${Math.max(2, w)}%;background:${corBarra}"></i></div>`;
    return `<div class="rk-l"><span class="rk-pos">${i + 1}</span><div class="rk-n"><div class="rk-nome">${nome}</div>${barra}</div><b class="rk-v">${fmtMetrica(met, x[met])}</b></div>`;
  }).join('');
  const leg = dois ? `<div class="rk-leg"><span style="--c:${CAND.L.cor}">Lula</span><span style="--c:${CAND.F.cor}">Flávio Bolsonaro</span><em>% dos votos válidos</em></div>` : `<div class="rk-leg"><em>${esc(k.rot)}</em></div>`;
  const nota = r.minVV ? `Considera ${r.escopo.endsWith('municipios') || r.escopo.endsWith('bairros') ? 'locais' : 'recortes'} com ao menos ${new Intl.NumberFormat('pt-BR').format(r.minVV)} votos válidos (${new Intl.NumberFormat('pt-BR').format(r.universo)} no total).` : '';
  return `<div class="rk">${leg}${linhas}</div>${nota ? `<p class="cmp-nota">${nota} Fonte: TSE.</p>` : '<p class="cmp-nota">Fonte: TSE.</p>'}`;
}
