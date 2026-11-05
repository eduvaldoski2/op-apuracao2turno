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
  return vm.runInNewContext(corpo + '\n;({S:S,ED:ED,ORDER:ORDER,HOME_LEAD:HOME_LEAD,HOME_ROW:HOME_ROW,GIRO:GIRO,COLUNAS:COLUNAS,TRENDS:TRENDS,EDICAO:EDICAO})', {});
}
const txt = fs.readFileSync(fonte, 'utf8');
if (!/^<\?php if \(!defined\('RADAR_OK'\)\)/.test(txt)) die('primeira linha do _edicao.php foi alterada');
let d; try { d = carregar(txt); } catch (e) { die('sintaxe: ' + e.message); }

// validação
const regs = ['rj', 'sp', 'mg', 'ne', 'sul', 'norte', 'co'], erros = [];
if (d.EDICAO.hora !== hh) erros.push('EDICAO.hora (' + d.EDICAO.hora + ') difere de ' + hh);
Object.keys(d.ORDER).forEach(k => d.ORDER[k].forEach(i => { if (!d.S[i]) erros.push('ORDER.' + k + ': id inexistente ' + i); else if (d.S[i].ed !== k) erros.push(i + ': ed ≠ ' + k); }));
Object.keys(d.S).forEach(i => { const s = d.S[i];
  if (!Object.values(d.ORDER).some(l => l.includes(i))) erros.push('matéria fora do ORDER: ' + i);
  if (s.reg && !regs.includes(s.reg)) erros.push(i + ': reg inválido');
  ['t', 'sub', 'resumo', 'hora'].forEach(c => { if (!s[c]) erros.push(i + ': falta ' + c); });
  if (!Array.isArray(s.fundo) || !Array.isArray(s.fontes) || !s.fontes.length) erros.push(i + ': fundo/fontes'); });
[d.HOME_LEAD].concat(d.HOME_ROW).forEach(i => { if (!d.S[i]) erros.push('home: ' + i); });
d.GIRO.forEach(g => { if (g[5] && !d.S[g[5]]) erros.push('GIRO relacionado: ' + g[5]); });
d.COLUNAS.forEach(g => { if (g[5] && !d.S[g[5]]) erros.push('COLUNAS relacionado: ' + g[5]); });
d.TRENDS.forEach(g => { if (g[3] && !d.S[g[3]]) erros.push('TRENDS relacionado: ' + g[3]); });
if (erros.length) die('\n - ' + erros.join('\n - '));

// edição anterior = a mais recente do arquivo, anterior a esta
const lista = fs.existsSync(arq) ? fs.readdirSync(arq).filter(f => /^\d{4}-\d{2}-\d{2}-\d{2}h\.php$/.test(f)).map(f => f.slice(0, -4)).sort() : [];
const ant = lista.filter(n => n < nome).pop();
const hash = s => crypto.createHash('sha1').update(JSON.stringify([s.t, s.sub, s.resumo, s.fundo, (s.fontes || []).map(f => f[1])])).digest('hex');
const flags = {};
if (ant) {
  const p = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8'));
  Object.keys(d.S).forEach(i => { if (!p.S[i]) flags[i] = 'novo'; else if (hash(p.S[i]) !== hash(d.S[i])) flags[i] = 'atualizada'; });
}
const nN = Object.values(flags).filter(v => v === 'novo').length, nA = Object.values(flags).filter(v => v === 'atualizada').length;
if (ant && !process.argv.includes('--aceitar-poucas') && (nN < 5 || nN + nA < 10)) {
  die('edição quase igual à anterior (' + nN + ' NOVO, ' + nA + ' ATUALIZADA). Exigido: ao menos 5 NOVO e 10 NOVO+ATUALIZADA. Busque mais notícias publicadas depois de ' + ant + ' em TODAS as editorias e sub-regiões. Só use --aceitar-poucas se tiver pesquisado de verdade e realmente não houver mais nada (e diga isso no resumo).');
}
const bloco = '/* FLAGS (gerado por publicar.js; não editar) */\nvar FLAGS = ' + JSON.stringify(flags) + ';\n';
let novo = txt.replace(/\/\* FLAGS \(gerado[^\n]*\nvar FLAGS = [^\n]*\n/, '');
if (!novo.includes('/* ===== FIM DOS DADOS ===== */')) die('marcador FIM DOS DADOS ausente');
novo = novo.replace('/* ===== FIM DOS DADOS ===== */', bloco + '/* ===== FIM DOS DADOS ===== */');
fs.mkdirSync(arq, { recursive: true });
fs.writeFileSync(fonte, novo);
fs.writeFileSync(path.join(arq, nome + '.php'), novo);
const n = Object.values(flags).filter(v => v === 'novo').length, a = Object.values(flags).filter(v => v === 'atualizada').length;
console.log('OK ' + nome + ': ' + Object.keys(d.S).length + ' matérias, ' + n + ' NOVO, ' + a + ' ATUALIZADA' + (ant ? ' (vs ' + ant + ')' : ' (sem edição anterior)'));
