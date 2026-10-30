// Baixa o logotipo de cada partido (Wikipédia/Wikimedia Commons) -> img/partidos/<SIGLA>.png (240 px de largura)
//   node scripts/logos_partidos.mjs
// Cada partido tem o título do artigo na Wikipédia; usa a imagem da infobox e, se faltar, a primeira imagem do artigo com "logo/bandeira/símbolo" no nome.
import fs from 'node:fs';
const UA = { 'User-Agent': 'OficinaPoliticaBot/1.0 (https://oficinapolitica.com.br; contato@oficinapolitica.com.br)' };
const T = {
  PT: ['Partido dos Trabalhadores'], PL: ['Partido Liberal (2006)'], 'UNIÃO': ['União Brasil'], PP: ['Progressistas'], PSD: ['Partido Social Democrático (2011)'],
  PSDB: ['Partido da Social Democracia Brasileira'], MDB: ['Movimento Democrático Brasileiro (1980)'], PSB: ['Partido Socialista Brasileiro', 'Partido Socialista Brasileiro (1985)'],
  PDT: ['Partido Democrático Trabalhista'], PSOL: ['Partido Socialismo e Liberdade'], REDE: ['Rede Sustentabilidade'], PV: ['Partido Verde (Brasil)'], PCDOB: ['Partido Comunista do Brasil'],
  REPUBLICANOS: ['Republicanos (partido político)'], PODE: ['Podemos (Brasil)'], AVANTE: ['Avante (partido político)'], SOLIDARIEDADE: ['Solidariedade (partido político)'],
  PRD: ['Partido Renovação Democrática', 'Partido Renovação Democrática (2023)'], NOVO: ['Partido Novo'], 'MISSÃO': ['Partido Missão'], CIDADANIA: ['Cidadania (partido político)'],
  MOBILIZA: ['Partido da Mobilização Nacional'], UP: ['Unidade Popular pelo Socialismo', 'Unidade Popular (Brasil)', 'Unidade Popular'], PSTU: ['Partido Socialista dos Trabalhadores Unificado'], DC: ['Democracia Cristã (Brasil)'],
  PCO: ['Partido da Causa Operária'], PMB: ['Partido da Mulher Brasileira'], AGIR: ['Agir (partido político)', 'Agir (Brasil)'], PRTB: ['Partido Renovador Trabalhista Brasileiro'],
  PMN: ['Partido da Mobilização Nacional'], PCB: ['Partido Comunista Brasileiro (1996)'],
};
const api = async q => (await fetch('https://pt.wikipedia.org/w/api.php?format=json&redirects=1&' + q, { headers: UA })).json();
const ruim = /icon|commons-logo|wikidata|edit-|question|ambox|flag of (brazil|the)|bandeira do brasil|map|mapa|symbol_|disambig/i;
async function arquivo(titulos) {
  for (const t of titulos) {
    const j = await api('action=query&prop=pageimages|images&piprop=name&imlimit=60&titles=' + encodeURIComponent(t));
    const p = Object.values(j.query?.pages || {})[0]; if (!p || p.missing !== undefined) continue;
    if (p.pageimage) return p.pageimage;
    const im = (p.images || []).map(i => i.title.replace(/^(Ficheiro|File|Imagem):/, '')).filter(n => /\.(svg|png|jpe?g)$/i.test(n) && !ruim.test(n));
    const pref = im.find(n => /logo|logotipo|s[ií]mbolo|bandeira|flag/i.test(n)) || im[0]; if (pref) return pref;
  }
  return null;
}
fs.mkdirSync('img/partidos', { recursive: true });
const rel = [];
for (const [sg, tit] of Object.entries(T)) {
  try {
    const nome = await arquivo(tit); if (!nome) { rel.push(`${sg}\tSEM ARQUIVO`); continue; }
    const fp = h => fetch(`https://${h}/wiki/Special:FilePath/` + encodeURIComponent(nome.replace(/ /g, '_')) + '?width=240', { headers: UA, redirect: 'follow' });
    let r = await fp('commons.wikimedia.org'); if (!r.ok) r = await fp('pt.wikipedia.org');
    if (!r.ok) { rel.push(`${sg}\tERRO ${r.status} ${nome}`); continue; }
    const buf = Buffer.from(await r.arrayBuffer()); fs.writeFileSync(`img/partidos/${sg}.png`, buf); rel.push(`${sg}\tok\t${nome}\t${buf.length}`);
  } catch (e) { rel.push(`${sg}\tFALHA ${e.message}`); }
  await new Promise(ok => setTimeout(ok, 400));
}
fs.writeFileSync('img/partidos/_origem.tsv', rel.join('\n') + '\n'); console.log(rel.join('\n'));
