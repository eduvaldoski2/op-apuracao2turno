// Compara as manchetes dos grandes veículos (manchetes.json, coletado pelo GitHub Actions no branch "manchetes")
// com as matérias do Radar e lista o que as capas dão e o Radar ainda NÃO cobre.
// Uso: node radar/tools/cobertura.cjs [manchetes.json] [--json]   (padrão: radar/tools/_manchetes.json)
// Também é chamado pelo publicar.cjs (módulo: require('./cobertura.cjs').analisar(...)).
const fs = require('fs'), path = require('path'), vm = require('vm');

const PARADAS = new Set(('para pela pelo pelas pelos como mais mas com sem sob sobre entre depois antes apos ainda desde ate '+
 'seu sua seus suas dele dela eles elas isso essa esse esta este estao esta foi ser sera tem ter tinha vai vao pode podem '+
 'quer quem qual quais onde quando porque nao sim muito muita muitos muitas outro outra outros outras todo toda todos todas '+
 'cada nova novo novos novas diz dizem disse afirma afirmam veja saiba entenda confira apos contra durante segundo ante '+
 'brasil brasileiro brasileira governo presidente ministro nesta neste quarta quinta terca segunda sexta sabado domingo hoje '+
 'ontem amanha anos ano dias dia semana mes meses entre sobre caso casos pais paises estado estados federal nacional '+
 'noticias noticia ultimas video fotos foto analise opiniao editorial coluna').split(/\s+/));
const norm = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const toks = s => [...new Set((norm(s).replace(/&#x27;|&#39;/g, ' ').match(/[a-z0-9]{4,}|\d+/g) || []).filter(t => !PARADAS.has(t)))];
const base = n => n.replace(/\s*\(.*\)$/, '');
// editorias que não são o foco do Radar (política, economia, mundo, regiões): crônica policial miúda, celebridades, esporte, culinária, saúde de consumo
const RUIDO = /novela|bbb|famos|influenciador|celebridade|receita de|gordon ramsay|preenchimento|horoscopo|signo|loteria|mega-sena|futebol|flamengo|corinthians|palmeiras|vasco|selecao|ancelotti|goleiro|penalti|vacina|dieta|ameixa|prisao de ventre|quem ama cuida|festival|padaria|moda|cinema|show |musica|jogo do bicho/;

function carregar(txt) {
  const corpo = txt.replace(/^<\?php.*?\?>\s*/s, '');
  return vm.runInNewContext(corpo + '\n;({S:S,ORDER:ORDER})', {});
}
function textoMateria(m) {
  const f = (m.fundo || []).filter(b => b[0] === 'p').slice(0, 1).map(b => b[1]).join(' ');   // título, subtítulo, resumo e lide: o assunto da matéria
  return [m.t, m.sub, m.resumo, f].join(' ');
}

function analisar(man, S, horas) {
  const pos = [];
  man.fontes.forEach(f => (f.itens || []).forEach((it, i) => {
    if (RUIDO.test(norm(it.t))) return;
    const tk = toks(it.t); if (tk.length < 3) return;
    pos.push({ fonte: base(f.nome), nome: f.nome, tipo: f.tipo, pos: i, t: it.t.replace(/&#x27;|&#39;/g, "'"), url: it.url, tk });
  }));
  // agrupa manchetes sobre o mesmo fato (≥3 termos em comum, ou ≥2 se forem raros e a manchete curta)
  const grupos = [];
  pos.forEach(h => {
    let g = grupos.find(g => g.tk.filter(t => h.tk.includes(t)).length >= 3);
    if (!g) { g = { tk: [], itens: [] }; grupos.push(g); }
    g.itens.push(h); g.tk = [...new Set(g.tk.concat(h.tk))];
  });
  const todas = Object.keys(S).filter(i => !S[i].velha).map(i => ({ id: i, tk: new Set(toks(textoMateria(S[i]))) }));
  const mats = Object.keys(S).filter(i => !S[i].velha && (!horas || horas.includes(S[i].hora))).map(i => ({ id: i, tk: new Set(toks(textoMateria(S[i]))), hora: S[i].hora }));
  const res = grupos.map(g => {
    const fontes = [...new Set(g.itens.map(x => x.fonte))];
    const capas = g.itens.filter(x => x.tipo === 'capa' && x.pos < 25).map(x => x.fonte);
    // termos do grupo que aparecem em ≥2 manchetes (o núcleo do fato)
    const cont = {}; g.itens.forEach(x => x.tk.forEach(t => cont[t] = (cont[t] || 0) + 1));
    const nucleo = Object.keys(cont).filter(t => cont[t] >= (g.itens.length > 1 ? 2 : 1)).sort((a, b) => cont[b] - cont[a]).slice(0, 10);
    let melhor = { id: null, n: 0 };
    mats.forEach(m => { const n = nucleo.filter(t => m.tk.has(t)).length; if (n > melhor.n) melhor = { id: m.id, n }; });
    const lim = Math.min(4, Math.max(3, Math.ceil(nucleo.length * 0.5)));
    const coberta = melhor.n >= lim;
    // matéria ANTIGA (de dias anteriores) sobre o mesmo assunto: a ação é ATUALIZAR, não escrever nova
    let antiga = { id: null, n: 0 };
    if (!coberta) todas.forEach(m => { const n = nucleo.filter(t => m.tk.has(t)).length; if (n > antiga.n) antiga = { id: m.id, n }; });
    const acao = coberta ? 'coberta' : (antiga.n >= lim ? 'atualizar' : 'nova');
    return { titulo: g.itens.slice().sort((a, b) => b.t.length - a.t.length)[0].t, fontes, nfontes: fontes.length, capas: [...new Set(capas)], url: g.itens[0].url, coberta, acao, materia: coberta ? melhor.id : antiga.id, casou: melhor.n, nucleo };
  });
  const grandes = res.filter(r => !r.coberta && (r.nfontes >= 3 || (r.nfontes >= 2 && r.capas.length >= 1) || r.capas.length >= 2));
  grandes.sort((a, b) => b.nfontes - a.nfontes || b.capas.length - a.capas.length);
  return { total: res.length, cobertas: res.filter(r => r.coberta).length, lacunas: grandes, todas: res };
}

// junta todas as coletas do dia (historico.json do branch manchetes): o sistema "guarda" o que cada capa mostrou ao longo do dia
function mesclar(hist) {
  const por = {};
  hist.coletas_.forEach(c => c.fontes.forEach(f => {
    const o = por[f.nome] || (por[f.nome] = { nome: f.nome, tipo: f.tipo, uf: f.uf, status: 200, n: 0, mapa: {} });
    f.itens.forEach(i => { const k = i.t; if (!o.mapa[k] || i.p < o.mapa[k].p) o.mapa[k] = { t: i.t, url: i.url, p: i.p }; });
  }));
  const fontes = Object.values(por).map(o => { const itens = Object.values(o.mapa).sort((a, b) => a.p - b.p); return { nome: o.nome, tipo: o.tipo, uf: o.uf, n: itens.length, itens }; });
  return { coletado: hist.ate, coletado_brt: new Date(Date.parse(hist.ate) - 3 * 3600e3).toISOString().replace('Z', '-03:00') + ' (' + hist.coletas + ' coletas desde ' + hist.desde + ')', fontes_ok: fontes.filter(f => f.n).length, fontes_total: fontes.length, fontes };
}
function ranking(r) { return r.todas.filter(x => x.nfontes >= 3 || x.capas.length >= 1).sort((a, b) => b.nfontes - a.nfontes || b.capas.length - a.capas.length); }

module.exports = { analisar, carregar, mesclar, ranking };

if (require.main === module) {
  const args = process.argv.slice(2);
  const arq = args.find(a => !a.startsWith('--')) || path.join(__dirname, '_manchetes.json');
  if (!fs.existsSync(arq)) { console.error('sem ' + arq + ' (busque: git fetch origin manchetes && git show origin/manchetes:manchetes.json > radar/tools/_manchetes.json)'); process.exit(2); }
  let man = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const hf = path.join(__dirname, '_historico.json');
  if (!args.includes('--so-ultima') && fs.existsSync(hf)) { try { man = mesclar(JSON.parse(fs.readFileSync(hf, 'utf8'))); } catch (e) {} }
  const d = carregar(fs.readFileSync(path.join(__dirname, '..', '_edicao.php'), 'utf8'));
  const hoje = new Date(Date.now() - 3 * 3600e3), dm = hoje.getUTCDate() + '/' + (hoje.getUTCMonth() + 1);
  const r = analisar(man, d.S, [dm, String(hoje.getUTCDate()).padStart(2, '0') + '/' + String(hoje.getUTCMonth() + 1).padStart(2, '0')]);
  console.log('Manchetes de ' + man.coletado_brt + ' · ' + man.fontes_ok + '/' + man.fontes_total + ' fontes · ' + r.total + ' fatos distintos · ' + r.cobertas + ' já cobertos · ' + r.lacunas.length + ' LACUNAS\n');
  r.lacunas.slice(0, 40).forEach((l, i) => console.log((i + 1) + '. ' + (l.acao === 'atualizar' ? '→ATUALIZAR ' + l.materia + ' ' : '→NOVA ') + '[' + l.nfontes + ' veículos' + (l.capas.length ? '; capa: ' + l.capas.join(', ') : '') + '] ' + l.titulo.slice(0, 170) + '\n   ' + l.fontes.join(', ') + ' · ' + l.url));
  if (args.includes('--regional')) { const por = {}; man.fontes.filter(f => f.uf).forEach(f => (por[f.uf] = por[f.uf] || []).push(...f.itens.slice(0, 12).map(i => '  [' + f.nome.replace(/^\[\w\w\] /, '') + '] ' + i.t.slice(0, 140)))); Object.keys(por).sort().forEach(uf => console.log('\n== ' + uf + '\n' + por[uf].join('\n'))); }
  if (args.includes('--ranking')) { console.log('\nRANKING DO DIA (o que mais aparece nos veículos; ✔ = coberto por matéria de hoje):'); ranking(r).slice(0, 30).forEach((l, i) => console.log((i + 1) + '. ' + (l.coberta ? '✔ ' + l.materia : '✘ LACUNA') + ' [' + l.nfontes + ' veíc.' + (l.capas.length ? ', capas: ' + l.capas.join('/') : '') + '] ' + l.titulo.slice(0, 120))); }
  if (args.includes('--json')) fs.writeFileSync('cobertura.json', JSON.stringify(r, null, 1));
}
