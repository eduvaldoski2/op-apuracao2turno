// Resumo do dia para o boletim: junta TODAS as edições publicadas no dia (7h, 11h, 15h, 19h…) e escolhe
// o que mais pesou, na versão mais recente de cada matéria. Gera radar/_dados_email.php (lido pelo cron do boletim).
// É chamado pelo publicar.cjs a cada edição; também roda sozinho para refazer o arquivo sem publicar nada:
//   node radar/tools/resumo_dia.cjs 2026-11-07            (usa as edições do dia que já estão no arquivo)
//   node radar/tools/resumo_dia.cjs 2026-11-07 --ver      (só mostra o ranking, não grava)
const fs = require('fs'), path = require('path'), vm = require('vm');
const raiz = path.join(__dirname, '..');

function carregar(txt) {
  const corpo = txt.replace(/^<\?php.*?\?>\s*/s, '');
  return vm.runInNewContext(corpo + '\n;({S:S,ORDER:ORDER,HOME_LEAD:(typeof HOME_LEAD==="undefined"?"":HOME_LEAD),HOME_ROW:(typeof HOME_ROW==="undefined"?[]:HOME_ROW),EDICAO:EDICAO,FLAGS:(typeof FLAGS==="undefined"?{}:FLAGS),AMANHA:(typeof AMANHA==="undefined"?[]:AMANHA)})', {});
}

// Pesos (um lugar só para ajustar). Pontos por edição do dia em que a matéria aparece.
const PESO = {
  lead: 6,                    // manchete da capa
  linha: 4,                   // linha de apoio da capa
  topo: [3, 2, 1],            // 1ª, 2ª e 3ª posição na editoria
  tocada: 1.5, tocadaMax: 4,  // NOVO/ATUALIZADA na edição (até 4 edições)
  p0: 4, p1: 2,               // pauta em curso (radar/tools/pautas.json)
};
const MAX = { politica: 6, economia: 4, mundo: 4 };   // por editoria, antes do corte por pessoa

function resumoDoDia(data, opts) {
  opts = opts || {};
  const arq = path.join(raiz, 'arquivo');
  const nomes = fs.readdirSync(arq).filter(f => /^\d{4}-\d{2}-\d{2}-\d{2}h\.php$/.test(f)).map(f => f.slice(0, -4)).filter(n => n.startsWith(data + '-')).sort();
  if (!nomes.length) return null;
  const eds = nomes.map(n => ({ nome: n, hh: n.slice(-3), d: carregar(fs.readFileSync(path.join(arq, n + '.php'), 'utf8')) }));
  const [aa, mm, dd] = data.split('-'); const hojeLabel = (+dd) + '/' + (+mm);
  const ont = new Date(Date.UTC(+aa, +mm - 1, +dd - 1)); const ontemLabel = ont.getUTCDate() + '/' + (ont.getUTCMonth() + 1);
  let pautas = []; try { pautas = JSON.parse(fs.readFileSync(path.join(__dirname, 'pautas.json'), 'utf8')).pautas || []; } catch (e) {}
  const prio = {}; pautas.filter(p => p.aberta !== false).forEach(p => (p.materias || []).forEach(i => { prio[i] = Math.max(prio[i] || 0, p.prio === 'P0' ? PESO.p0 : p.prio === 'P1' ? PESO.p1 : 0); }));

  const ult = {}, pts = {}, tocadaEm = {}, naCapa = {}, topoOrdem = {};
  eds.forEach(e => {
    const d = e.d;
    Object.keys(d.S).forEach(i => { ult[i] = d.S[i]; });
    if (d.HOME_LEAD && d.S[d.HOME_LEAD]) { pts[d.HOME_LEAD] = (pts[d.HOME_LEAD] || 0) + PESO.lead; naCapa[d.HOME_LEAD] = 1; }
    (d.HOME_ROW || []).forEach(i => { if (d.S[i]) { pts[i] = (pts[i] || 0) + PESO.linha; naCapa[i] = 1; } });
    Object.keys(d.ORDER).forEach(k => { if (k === 'regioes') return; d.ORDER[k].filter(i => d.S[i] && !d.S[i].velha).slice(0, 3).forEach((i, p) => { pts[i] = (pts[i] || 0) + PESO.topo[p]; }); });
    Object.keys(d.FLAGS || {}).forEach(i => { if (d.S[i]) { tocadaEm[i] = (tocadaEm[i] || 0) + 1; } });
  });
  // posição na última edição, só para desempate
  const ultEd = eds[eds.length - 1].d; const pos = {};
  Object.keys(ultEd.ORDER).forEach(k => ultEd.ORDER[k].forEach((i, p) => { pos[i] = p; }));

  // entra no resumo do dia a matéria de hoje; a de ontem só se foi atualizada ou foi à capa hoje; mais velha que isso não entra
  const elegivel = i => ult[i] && !ult[i].velha && (ult[i].hora === hojeLabel || (ult[i].hora === ontemLabel && (tocadaEm[i] || naCapa[i])));
  const placar = i => (pts[i] || 0) + Math.min(tocadaEm[i] || 0, PESO.tocadaMax) * PESO.tocada + (prio[i] || 0) * (elegivel(i) ? 1 : 0);
  const ids = Object.keys(ult).filter(elegivel);
  ids.sort((a, b) => placar(b) - placar(a) || (pos[a] ?? 999) - (pos[b] ?? 999) || (a < b ? -1 : 1));

  const order = { politica: [], economia: [], regioes: [], mundo: [] };
  ids.forEach(i => { const e = ult[i].ed; if (order[e]) order[e].push(i); });
  ['politica', 'economia', 'mundo'].forEach(k => { order[k] = order[k].slice(0, MAX[k]); });
  // regiões: as de maior placar de cada sub-região primeiro (o PHP pega a primeira de cada região escolhida)
  order.regioes = order.regioes.slice(0, 40);
  const lead = ids.find(i => ult[i].ed !== 'regioes') || '';
  const ultimo = eds[eds.length - 1];
  const mail = {
    dia: data, hora: ultimo.hh, data: ultimo.d.EDICAO.data, lead, order,
    amanha: ultimo.hh === '19h' ? (ultimo.d.AMANHA || []) : [],
    edicoes: eds.map(e => e.hh), tocadas: Object.keys(tocadaEm).filter(i => ult[i]).length, stories: {},
  };
  const incluir = new Set([lead]); Object.keys(order).forEach(k => order[k].forEach(i => incluir.add(i)));
  incluir.forEach(i => { if (!i) return; const s = ult[i]; mail.stories[i] = { ed: s.ed, reg: s.reg || '', t: s.t, sub: s.sub, hora: s.hora, pts: Math.round(placar(i) * 10) / 10 }; if (i === lead || order[s.ed].slice(0, 3).includes(i)) mail.stories[i].resumo = s.resumo; });
  return mail;
}

function gravar(mail) {
  fs.writeFileSync(path.join(raiz, '_dados_email.php'), "<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>\n" + JSON.stringify(mail).replace(/</g, '\\u003c'));
}
module.exports = { resumoDoDia, gravar };

if (require.main === module) {
  const data = process.argv[2];
  if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '')) { console.error('uso: node radar/tools/resumo_dia.cjs AAAA-MM-DD [--ver]'); process.exit(1); }
  const m = resumoDoDia(data); if (!m) { console.error('nenhuma edição de ' + data + ' no arquivo'); process.exit(1); }
  console.log('edições do dia: ' + m.edicoes.join(', ') + ' · matérias novas ou atualizadas no dia: ' + m.tocadas);
  console.log('destaque: ' + m.lead + ' (' + m.stories[m.lead].pts + ' pts) ' + m.stories[m.lead].t);
  Object.keys(m.order).forEach(k => { console.log('\n' + k); m.order[k].slice(0, k === 'regioes' ? 12 : 6).forEach(i => console.log('  ' + String(m.stories[i].pts).padStart(5) + '  ' + i + (m.stories[i].reg ? ' [' + m.stories[i].reg + ']' : '') + ' · ' + m.stories[i].hora + ' · ' + m.stories[i].t.slice(0, 90))); });
  if (!process.argv.includes('--ver')) { gravar(m); console.log('\n_dados_email.php gravado'); }
}
