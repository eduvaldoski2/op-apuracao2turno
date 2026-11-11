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
  const f = (m.fundo || []).filter(b => b[0] === 'p' || b[0] === 'h').map(b => b[1]).join(' ');
  return [m.t, m.sub, m.resumo, f.slice(0, 2500)].join(' ');
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
  const mats = Object.keys(S).filter(i => !S[i].velha && (!horas || horas.includes(S[i].hora))).map(i => ({ id: i, tk: new Set(toks(textoMateria(S[i]))), hora: S[i].hora }));
  const res = grupos.map(g => {
    const fontes = [...new Set(g.itens.map(x => x.fonte))];
    const capas = g.itens.filter(x => x.tipo === 'capa' && x.pos < 25).map(x => x.fonte);
    // termos do grupo que aparecem em ≥2 manchetes (o núcleo do fato)
    const cont = {}; g.itens.forEach(x => x.tk.forEach(t => cont[t] = (cont[t] || 0) + 1));
    const nucleo = Object.keys(cont).filter(t => cont[t] >= (g.itens.length > 1 ? 2 : 1)).sort((a, b) => cont[b] - cont[a]).slice(0, 10);
    let melhor = { id: null, n: 0 };
    mats.forEach(m => { const n = nucleo.filter(t => m.tk.has(t)).length; if (n > melhor.n) melhor = { id: m.id, n }; });
    const coberta = melhor.n >= Math.min(3, Math.max(2, Math.ceil(nucleo.length * 0.4)));
    return { titulo: g.itens.slice().sort((a, b) => b.t.length - a.t.length)[0].t, fontes, nfontes: fontes.length, capas: [...new Set(capas)], url: g.itens[0].url, coberta, materia: melhor.id, casou: melhor.n, nucleo };
  });
  const grandes = res.filter(r => !r.coberta && (r.nfontes >= 3 || (r.nfontes >= 2 && r.capas.length >= 1) || r.capas.length >= 2));
  grandes.sort((a, b) => b.nfontes - a.nfontes || b.capas.length - a.capas.length);
  return { total: res.length, cobertas: res.filter(r => r.coberta).length, lacunas: grandes, todas: res };
}

module.exports = { analisar, carregar };

if (require.main === module) {
  const args = process.argv.slice(2);
  const arq = args.find(a => !a.startsWith('--')) || path.join(__dirname, '_manchetes.json');
  if (!fs.existsSync(arq)) { console.error('sem ' + arq + ' (busque: git fetch origin manchetes && git show origin/manchetes:manchetes.json > radar/tools/_manchetes.json)'); process.exit(2); }
  const man = JSON.parse(fs.readFileSync(arq, 'utf8'));
  const d = carregar(fs.readFileSync(path.join(__dirname, '..', '_edicao.php'), 'utf8'));
  const hoje = new Date(Date.now() - 3 * 3600e3), dm = hoje.getUTCDate() + '/' + (hoje.getUTCMonth() + 1);
  const r = analisar(man, d.S, [dm, String(hoje.getUTCDate()).padStart(2, '0') + '/' + String(hoje.getUTCMonth() + 1).padStart(2, '0')]);
  console.log('Manchetes de ' + man.coletado_brt + ' · ' + man.fontes_ok + '/' + man.fontes_total + ' fontes · ' + r.total + ' fatos distintos · ' + r.cobertas + ' já cobertos · ' + r.lacunas.length + ' LACUNAS\n');
  r.lacunas.slice(0, 40).forEach((l, i) => console.log((i + 1) + '. [' + l.nfontes + ' veículos' + (l.capas.length ? '; capa: ' + l.capas.join(', ') : '') + '] ' + l.titulo.slice(0, 170) + '\n   ' + l.fontes.join(', ') + ' · ' + l.url));
  if (args.includes('--json')) fs.writeFileSync('cobertura.json', JSON.stringify(r, null, 1));
}
