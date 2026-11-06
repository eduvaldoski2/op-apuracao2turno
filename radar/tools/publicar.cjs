// Publica uma edição do Radar: valida radar/_edicao.php, marca NOVO/ATUALIZADA em relação à edição
// anterior do arquivo e guarda uma cópia em radar/arquivo/AAAA-MM-DD-HHh.php.
// Uso (na raiz do repo): node radar/tools/publicar.cjs 2026-11-05 11h
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const raiz = path.join(__dirname, '..');
const arq = path.join(raiz, 'arquivo');
const fonte = path.join(raiz, '_edicao.php');
const [data, hh] = process.argv.slice(2);
const die = (m) => { console.error('ERRO: ' + m); process.exit(1); };
if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '') || !/^(0[0-9]|1[0-9]|2[0-3])h$/.test(hh || '')) die('uso: node radar/tools/publicar.cjs AAAA-MM-DD HHh');
const nome = data + '-' + hh;

function carregar(txt) {
  const corpo = txt.replace(/^<\?php.*?\?>\s*/s, '');
  return vm.runInNewContext(corpo + '\n;({S:S,ED:ED,ORDER:ORDER,HOME_LEAD:HOME_LEAD,HOME_ROW:HOME_ROW,GIRO:GIRO,COLUNAS:COLUNAS,TRENDS:TRENDS,EDICAO:EDICAO,AMANHA:(typeof AMANHA==="undefined"?[]:AMANHA)})', {});
}
const txt = fs.readFileSync(fonte, 'utf8');
if (!/^<\?php if \(!defined\('RADAR_OK'\)\)/.test(txt)) die('primeira linha do _edicao.php foi alterada');
let d; try { d = carregar(txt); } catch (e) { die('sintaxe: ' + e.message); }

// validação
const regs = ['rj', 'sp', 'mg', 'ne', 'sul', 'norte', 'co'], erros = [];
if (d.EDICAO.hora !== hh) erros.push('EDICAO.hora (' + d.EDICAO.hora + ') difere de ' + hh);
Object.keys(d.ORDER).forEach(k => d.ORDER[k].forEach(i => { if (!d.S[i]) erros.push('ORDER.' + k + ': id inexistente ' + i); else if (d.S[i].ed !== k) erros.push(i + ': ed ≠ ' + k); }));
Object.keys(d.S).forEach(i => { const s = d.S[i];
  if (!d.S[i].velha && !Object.values(d.ORDER).some(l => l.includes(i))) erros.push('matéria fora do ORDER: ' + i);
  if (s.reg && !regs.includes(s.reg)) erros.push(i + ': reg inválido');
  ['t', 'sub', 'resumo', 'hora'].forEach(c => { if (!s[c]) erros.push(i + ': falta ' + c); });
  if (!Array.isArray(s.fundo) || !Array.isArray(s.fontes) || !s.fontes.length) erros.push(i + ': fundo/fontes'); });
[d.HOME_LEAD].concat(d.HOME_ROW).forEach(i => { if (!d.S[i]) erros.push('home: ' + i); });
d.GIRO.forEach(g => { if (g[5] && !d.S[g[5]]) erros.push('GIRO relacionado: ' + g[5]); });
d.COLUNAS.forEach(g => { if (g[5] && !d.S[g[5]]) erros.push('COLUNAS relacionado: ' + g[5]); });
d.TRENDS.forEach(g => { if (g[3] && !d.S[g[3]]) erros.push('TRENDS relacionado: ' + g[3]); });
if (hh === '19h' || (d.AMANHA && d.AMANHA.length)) {
  const tp = ['congresso', 'agenda', 'economia', 'justica', 'eleicao', 'mundo'];
  if (hh === '19h' && (!Array.isArray(d.AMANHA) || d.AMANHA.length < 3)) erros.push('edição das 19h exige a seção AMANHA (Para ficar de olho) com ao menos 3 itens: [quando, tipo, título, nota, url, idRel]');
  else d.AMANHA.forEach((a, n) => { if (!a[0] || !a[2] || !a[3] || String(a[3]).length < 30) erros.push('AMANHA[' + n + ']: faltam quando, título ou nota (mín. 30 caracteres)'); if (!tp.includes(a[1])) erros.push('AMANHA[' + n + ']: tipo deve ser ' + tp.join('|')); if (a[5] && !d.S[a[5]]) erros.push('AMANHA[' + n + ']: idRel inexistente'); });
}
if (erros.length) die('\n - ' + erros.join('\n - '));

// edição anterior = a mais recente do arquivo, anterior a esta
const lista = fs.existsSync(arq) ? fs.readdirSync(arq).filter(f => /^\d{4}-\d{2}-\d{2}-\d{2}h\.php$/.test(f)).map(f => f.slice(0, -4)).sort() : [];
const ant = lista.filter(n => n < nome).pop();
const hash = s => crypto.createHash('sha1').update(JSON.stringify([s.t, s.sub, s.resumo, s.fundo, (s.fontes || []).map(f => f[1])])).digest('hex');
const flags = {};
const giroFlags = {};
if (ant) {
  const pg = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8')).GIRO || [];
  const pm = {}; pg.forEach(g => { pm[g[0]] = g[1]; });
  (d.GIRO || []).forEach(g => { if (!(g[0] in pm)) giroFlags[g[0]] = 'novo'; else if (pm[g[0]] !== g[1]) giroFlags[g[0]] = 'atualizada'; });
  const p = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8'));
  Object.keys(d.S).forEach(i => { if (!p.S[i]) flags[i] = 'novo'; else if (hash(p.S[i]) !== hash(d.S[i])) flags[i] = 'atualizada'; });
}
const nN = Object.values(flags).filter(v => v === 'novo').length, nA = Object.values(flags).filter(v => v === 'atualizada').length;
if (ant && !process.argv.includes('--aceitar-poucas') && (nN < (hh === '07h' ? 15 : 5) || nN + nA < (hh === '07h' ? 25 : 10))) {
  die('edição quase igual à anterior (' + nN + ' NOVO, ' + nA + ' ATUALIZADA). Exigido: ao menos '+(hh === '07h' ? '15 NOVO e 25' : '5 NOVO e 10')+' NOVO+ATUALIZADA (a edição das 7h é a primeira do dia e precisa de mais novidades: pesquise o que saiu à noite e de madrugada). Busque mais notícias publicadas depois de ' + ant + ' em TODAS as editorias e sub-regiões. Só use --aceitar-poucas se tiver pesquisado de verdade e realmente não houver mais nada (e diga isso no resumo).');
}
// matéria ATUALIZADA precisa dizer o que mudou (campo upd) e o texto não pode repetir o da edição anterior
if (ant) {
  const pa = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8'));
  const semUpd = Object.keys(flags).filter(i => flags[i] === 'atualizada' && (!d.S[i].upd || String(d.S[i].upd).length < 12 || d.S[i].upd === (pa.S[i] || {}).upd));
  if (semUpd.length) die('matérias ATUALIZADAS sem o campo upd novo (1–2 frases dizendo o que mudou desde a edição anterior): ' + semUpd.join(', '));
}
// a capa só pode ter matéria NOVA ou ATUALIZADA nesta edição
if (ant) {
  const naCapa = [d.HOME_LEAD].concat(d.HOME_ROW || []).filter(i => !flags[i]);
  if (naCapa.length) die('capa com matéria que não é nova nem atualizada nesta edição: ' + naCapa.join(', ') + '. Troque HOME_LEAD/HOME_ROW por matérias NOVAS ou ATUALIZADAS.');
  // matéria idêntica em 3 edições seguidas está parada: aposente (velha:true) para sair das editorias, ou atualize com fato novo
  const ant2 = lista.filter(n => n < ant).pop();
  if (ant2) {
    const p1 = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8')), p2 = carregar(fs.readFileSync(path.join(arq, ant2 + '.php'), 'utf8'));
    const paradas = Object.keys(d.S).filter(i => !d.S[i].velha && !flags[i] && p1.S[i] && p2.S[i] && hash(p1.S[i]) === hash(d.S[i]) && hash(p2.S[i]) === hash(d.S[i]));
    if (paradas.length) die('matérias paradas há 3 edições sem fato novo (' + paradas.length + '): ' + paradas.join(', ') + '. Para cada uma: acrescente o desdobramento novo (vira ATUALIZADA, com upd) ou marque velha:true (sai das editorias e continua acessível por link compartilhado).');
  }
}
const bloco = '/* FLAGS (gerado por publicar.js; não editar) */\nvar FLAGS = ' + JSON.stringify(flags) + ';\nvar GIRO_FLAGS = ' + JSON.stringify(giroFlags) + ';\n';
let novo = txt.replace(/\/\* FLAGS \(gerado[^\n]*\nvar FLAGS = [^\n]*\n(var GIRO_FLAGS = [^\n]*\n)?/, '');
if (!novo.includes('/* ===== FIM DOS DADOS ===== */')) die('marcador FIM DOS DADOS ausente');
novo = novo.replace('/* ===== FIM DOS DADOS ===== */', bloco + '/* ===== FIM DOS DADOS ===== */');
fs.mkdirSync(arq, { recursive: true });
fs.writeFileSync(fonte, novo);
fs.writeFileSync(path.join(arq, nome + '.php'), novo);
// versão por matéria, usada para abrir ao visitante a matéria que alguém compartilhou (só com código de quem enviou)
const pub = {}; Object.keys(d.S).forEach(i => { const s = d.S[i]; pub[i] = { k: s.k, t: s.t, sub: s.sub, resumo: s.resumo, fundo: s.fundo, fontes: s.fontes, hora: s.hora }; });
fs.writeFileSync(path.join(raiz, '_publico.php'), "<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>\n" + JSON.stringify(pub).replace(/</g, '\\u003c'));
// dados para o boletim por e-mail (lidos pelo cron em PHP): só o necessário
const mail = { dia: data, hora: hh, data: d.EDICAO.data, lead: d.HOME_LEAD, order: d.ORDER, amanha: d.AMANHA || [], stories: {} };
Object.keys(d.S).forEach(i => { const s = d.S[i]; mail.stories[i] = { ed: s.ed, reg: s.reg || '', t: s.t, sub: s.sub }; });
fs.writeFileSync(path.join(raiz, '_dados_email.php'), "<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>\n" + JSON.stringify(mail).replace(/</g, '\\u003c'));
const n = Object.values(flags).filter(v => v === 'novo').length, a = Object.values(flags).filter(v => v === 'atualizada').length;
console.log('OK ' + nome + ': ' + Object.keys(d.S).length + ' matérias, ' + n + ' NOVO, ' + a + ' ATUALIZADA' + (ant ? ' (vs ' + ant + ')' : ' (sem edição anterior)'));
