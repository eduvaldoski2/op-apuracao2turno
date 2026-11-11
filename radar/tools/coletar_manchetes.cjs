// Coleta as manchetes das capas e dos feeds dos principais veículos brasileiros.
// Roda no GitHub Actions (que alcança os sites; o ambiente do Claude não) e grava manchetes.json no branch "manchetes".
// Uso: node radar/tools/coletar_manchetes.cjs <saida.json>
const fs = require('fs');
const SAIDA = process.argv[2] || 'manchetes.json';
const UA = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124 Safari/537.36 OficinaPolitica-curadoria';

// tipo: 'rss' (feed) ou 'capa' (extrai os links com texto de manchete da página inicial, na ordem em que aparecem)
const FONTES = [
  ['O Globo', 'capa', 'https://oglobo.globo.com/'],
  ['O Globo (feed)', 'rss', 'https://oglobo.globo.com/rss.xml'],
  ['Folha', 'capa', 'https://www.folha.uol.com.br/'],
  ['Folha (em cima da hora)', 'rss', 'https://feeds.folha.uol.com.br/emcimadahora/rss091.xml'],
  ['Folha (poder)', 'rss', 'https://feeds.folha.uol.com.br/poder/rss091.xml'],
  ['Folha (mercado)', 'rss', 'https://feeds.folha.uol.com.br/mercado/rss091.xml'],
  ['Folha (mundo)', 'rss', 'https://feeds.folha.uol.com.br/mundo/rss091.xml'],
  ['Estadão', 'capa', 'https://www.estadao.com.br/'],
  ['Estadão (política)', 'capa', 'https://www.estadao.com.br/politica/'],
  ['g1', 'capa', 'https://g1.globo.com/'],
  ['g1 (política)', 'rss', 'https://g1.globo.com/rss/g1/politica/'],
  ['g1 (economia)', 'rss', 'https://g1.globo.com/rss/g1/economia/'],
  ['g1 (mundo)', 'rss', 'https://g1.globo.com/rss/g1/mundo/'],
  ['Agência Brasil', 'capa', 'https://agenciabrasil.ebc.com.br/'],
  ['Agência Brasil (feed)', 'rss', 'https://agenciabrasil.ebc.com.br/rss/ultimasnoticias/feed.xml'],
  ['Agência Brasil (política)', 'rss', 'https://agenciabrasil.ebc.com.br/rss/politica/feed.xml'],
  ['Agência Brasil (economia)', 'rss', 'https://agenciabrasil.ebc.com.br/rss/economia/feed.xml'],
  ['Agência Brasil (internacional)', 'rss', 'https://agenciabrasil.ebc.com.br/rss/internacional/feed.xml'],
  ['Agência Câmara', 'rss', 'https://www.camara.leg.br/noticias/rss/ultimas-noticias'],
  ['Agência Senado', 'rss', 'https://www12.senado.leg.br/noticias/feed/ultimas/@@feed'],
  ['UOL', 'capa', 'https://www.uol.com.br/'],
  ['UOL (feed)', 'rss', 'https://rss.uol.com.br/feed/noticias.xml'],
  ['CNN Brasil', 'rss', 'https://www.cnnbrasil.com.br/feed/'],
  ['Poder360', 'rss', 'https://www.poder360.com.br/feed/'],
  ['Metrópoles', 'rss', 'https://www.metropoles.com/feed'],
  ['Correio Braziliense', 'capa', 'https://www.correiobraziliense.com.br/'],
  ['Valor Econômico', 'capa', 'https://valor.globo.com/'],
  ['InfoMoney', 'rss', 'https://www.infomoney.com.br/feed/'],
  ['BBC Brasil', 'rss', 'https://feeds.bbci.co.uk/portuguese/rss.xml'],
  ['DW Brasil', 'rss', 'https://rss.dw.com/rdf/rss-br-all'],
  ['Gazeta do Povo', 'rss', 'https://www.gazetadopovo.com.br/feed/'],
  ['CartaCapital', 'rss', 'https://www.cartacapital.com.br/feed/'],
  ['Congresso em Foco', 'rss', 'https://congressoemfoco.uol.com.br/feed/'],
  ['Jota', 'capa', 'https://www.jota.info/'],
  ['R7', 'rss', 'https://noticias.r7.com/feed.xml'],
  ['Terra', 'capa', 'https://www.terra.com.br/noticias/'],
  ['Exame', 'rss', 'https://exame.com/feed/'],
  ['Veja', 'capa', 'https://veja.abril.com.br/'],
  ['Brasil de Fato', 'rss', 'https://www.brasildefato.com.br/feed'],
  ['Intercept Brasil', 'rss', 'https://www.intercept.com.br/feed/'],
  ['O Tempo', 'capa', 'https://www.otempo.com.br/'],
  ['GZH', 'capa', 'https://gauchazh.clicrbs.com.br/'],
  ['Estado de Minas', 'capa', 'https://www.em.com.br/'],
  ['Diário de Pernambuco', 'capa', 'https://www.diariodepernambuco.com.br/'],
  ['Migalhas', 'rss', 'https://www.migalhas.com.br/rss/quentes'],
  ['Reuters Brasil', 'capa', 'https://www.reuters.com/world/americas/'],
  ['Poder360 (capa)', 'capa', 'https://www.poder360.com.br/']
];


// ---- Fontes regionais: g1 de cada estado + principais veículos locais. 'auto' = tenta <site>/feed/ e, se não houver feed, lê a capa.
const G1 = { AC:'ac/acre', AL:'al/alagoas', AP:'ap/amapa', AM:'am/amazonas', BA:'ba/bahia', CE:'ce/ceara', DF:'df/distrito-federal', ES:'es/espirito-santo', GO:'go/goias', MA:'ma/maranhao', MT:'mt/mato-grosso', MS:'ms/mato-grosso-do-sul', MG:'mg/minas-gerais', PA:'pa/para', PB:'pb/paraiba', PR:'pr/parana', PE:'pe/pernambuco', PI:'pi/piaui', RJ:'rj/rio-de-janeiro', RN:'rn/rio-grande-do-norte', RS:'rs/rio-grande-do-sul', RO:'ro/rondonia', RR:'rr/roraima', SC:'sc/santa-catarina', SP:'sp/sao-paulo', SE:'se/sergipe', TO:'to/tocantins' };
const LOCAIS = {
  AC: [['ac24horas','https://ac24horas.com/'],['A Gazeta do Acre','https://agazetadoacre.com/'],['ContilNet','https://contilnet.com/']],
  AL: [['Gazeta de Alagoas','https://gazetaweb.com/'],['TNH1','https://tnh1.com.br/'],['Tribuna Hoje','https://tribunahoje.com/']],
  AP: [['Seles Nafes','https://selesnafes.com/'],['Diário do Amapá','https://www.diariodoamapa.com.br/'],['Agência Amapá','https://agenciaamapa.ap.gov.br/']],
  AM: [['A Crítica','https://www.acritica.com/'],['Amazonas Atual','https://amazonasatual.com.br/'],['D24AM','https://d24am.com/']],
  BA: [['Correio','https://www.correio24horas.com.br/'],['A Tarde','https://atarde.com.br/'],['Bahia Notícias','https://www.bahianoticias.com.br/'],['Metro1','https://www.metro1.com.br/']],
  CE: [['Diário do Nordeste','https://diariodonordeste.verdesmares.com.br/'],['O Povo','https://www.opovo.com.br/'],['Tribuna do Ceará','https://tribunadoceara.com.br/']],
  DF: [['Metrópoles DF','https://www.metropoles.com/distrito-federal'],['Jornal de Brasília','https://jornaldebrasilia.com.br/'],['Agência Brasília','https://www.agenciabrasilia.df.gov.br/']],
  ES: [['Folha Vitória','https://www.folhavitoria.com.br/'],['A Gazeta ES','https://www.agazeta.com.br/'],['Século Diário','https://www.seculodiario.com.br/']],
  GO: [['O Popular','https://opopular.com.br/'],['Jornal Opção','https://www.jornalopcao.com.br/'],['Mais Goiás','https://www.maisgoias.com.br/']],
  MA: [['O Imparcial','https://oimparcial.com.br/'],['Imirante','https://imirante.com/'],['O Estado MA','https://oestadoma.com/']],
  MT: [['Gazeta Digital','https://www.gazetadigital.com.br/'],['Olhar Direto','https://www.olhardireto.com.br/'],['FolhaMax','https://www.folhamax.com/']],
  MS: [['Campo Grande News','https://www.campograndenews.com.br/'],['Correio do Estado','https://correiodoestado.com.br/'],['Midiamax','https://www.midiamax.com.br/']],
  MG: [['O Tempo','https://www.otempo.com.br/'],['Estado de Minas','https://www.em.com.br/'],['Itatiaia','https://www.itatiaia.com.br/']],
  PA: [['O Liberal','https://www.oliberal.com/'],['Diário do Pará','https://www.diarioonline.com.br/'],['Agência Pará','https://www.agenciapara.com.br/']],
  PB: [['Jornal da Paraíba','https://jornaldaparaiba.com.br/'],['ClickPB','https://www.clickpb.com.br/'],['Paraíba Online','https://paraibaonline.com.br/']],
  PR: [['Gazeta do Povo PR','https://www.gazetadopovo.com.br/parana/'],['Bem Paraná','https://www.bemparana.com.br/'],['Plural','https://www.plural.jor.br/'],['AEN-PR','https://www.aen.pr.gov.br/']],
  PE: [['Diario de Pernambuco','https://www.diariodepernambuco.com.br/'],['Folha de Pernambuco','https://www.folhape.com.br/'],['JC','https://jc.ne10.uol.com.br/']],
  PI: [['Meio Norte','https://www.meionorte.com/'],['Cidade Verde','https://cidadeverde.com/'],['180graus','https://180graus.com/']],
  RJ: [['O Dia','https://odia.ig.com.br/'],['Extra','https://extra.globo.com/'],['O Fluminense','https://www.ofluminense.com.br/'],['Diário do Rio','https://diariodorio.com/']],
  RN: [['Tribuna do Norte','https://tribunadonorte.com.br/'],['Nova Notícias','https://novanoticias.com.br/'],['Saiba Mais','https://saibamais.jor.br/']],
  RS: [['GZH','https://gauchazh.clicrbs.com.br/'],['Correio do Povo','https://www.correiodopovo.com.br/'],['Jornal do Comércio','https://www.jornaldocomercio.com/']],
  RO: [['Rondônia ao Vivo','https://www.rondoniaovivo.com/'],['Tudo Rondônia','https://www.tudorondonia.com/'],['News Rondônia','https://www.newsrondonia.com.br/']],
  RR: [['Folha BV','https://folhabv.com.br/'],['Roraima em Tempo','https://roraimaemtempo.com.br/'],['Agência Roraima','https://agenciaroraima.com.br/']],
  SC: [['NSC Total','https://www.nsctotal.com.br/'],['ND Mais','https://ndmais.com.br/'],['Notícias do Dia','https://ndmais.com.br/noticias/']],
  SP: [['Agência SP','https://www.agenciasp.sp.gov.br/'],['Diário do Grande ABC','https://www.dgabc.com.br/'],['Metrópoles SP','https://www.metropoles.com/sao-paulo']],
  SE: [['Infonet','https://infonet.com.br/'],['F5 News','https://f5news.com.br/'],['Jornal da Cidade SE','https://jornaldacidade.net/']],
  TO: [['Jornal do Tocantins','https://jornaldotocantins.com.br/'],['Conexão Tocantins','https://conexaoto.com.br/'],['T1 Notícias','https://t1noticias.com.br/']]
};
Object.keys(G1).forEach(uf => {
  FONTES.push(['[' + uf + '] g1 ' + uf, 'capa', 'https://g1.globo.com/' + G1[uf] + '/']);
  FONTES.push(['[' + uf + '] g1 ' + uf + ' (feed)', 'rss', 'https://g1.globo.com/rss/g1/' + G1[uf].split('/')[1] + '/']);
  (LOCAIS[uf] || []).forEach(([n, u]) => FONTES.push(['[' + uf + '] ' + n, 'auto', u]));
});

const NOMES = { quot: '"', amp: '&', lt: '<', gt: '>', apos: "'", nbsp: ' ', hellip: '…', ndash: '–', mdash: '—', rsquo: '’', lsquo: '‘', ldquo: '“', rdquo: '”', laquo: '«', raquo: '»', ordm: 'º', ordf: 'ª' };
const COMB = { acute: '\u0301', grave: '\u0300', circ: '\u0302', tilde: '\u0303', cedil: '\u0327', uml: '\u0308' };
const ent = s => s.replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/&([A-Za-z])(acute|grave|circ|tilde|cedil|uml);/g, (m, l, c) => (l + COMB[c]).normalize('NFC'))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
  .replace(/&([a-z]+);/gi, (m, n) => NOMES[n] !== undefined ? NOMES[n] : m)
  .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

function rss(xml) {
  const out = [];
  const re = /<(item|entry)[\s>][\s\S]*?<\/\1>/gi; let m;
  while ((m = re.exec(xml)) && out.length < 40) {
    const b = m[0];
    const t = (b.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1];
    let l = (b.match(/<link[^>]*>([\s\S]*?)<\/link>/i) || [])[1] || (b.match(/<link[^>]*href="([^"]+)"/i) || [])[1] || '';
    const d = (b.match(/<(pubDate|published|updated|dc:date)[^>]*>([\s\S]*?)<\/\1>/i) || [])[2];
    const desc = (b.match(/<(description|summary)[^>]*>([\s\S]*?)<\/\1>/i) || [])[2];
    if (t) out.push({ t: ent(t), url: ent(l), hora: d ? ent(d) : '', d: desc ? ent(desc).slice(0, 220) : '' });
  }
  return out;
}

function capa(html, base, frouxo) {
  const host = new URL(base).hostname.replace(/^www\./, '');
  const out = [], vistos = new Set();
  const re = /<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi; let m;
  while ((m = re.exec(html)) && out.length < 70) {
    let href = m[1]; if (href.startsWith('//')) href = 'https:' + href; else if (href.startsWith('/')) href = new URL(href, base).href;
    if (!/^https?:/.test(href)) continue;
    const t = ent(m[2]);
    if (t.length < 38 || t.length > 260 || t.split(' ').length < 6) continue;           // manchete tem frase
    if (!frouxo && !/\d{4}\/\d{2}|\/\d{4}\/|\.ghtml|\.shtml|\.html|\/noticia|\/politica|\/economia|\/mundo|\/brasil|\/pais|\/radar/.test(href)) continue;
    if (vistos.has(t)) continue; vistos.add(t);
    out.push({ t, url: href });
  }
  return out;
}

async function baixar(url) {
  for (let i = 0; i < 2; i++) {
    try {
      const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8', 'Accept-Language': 'pt-BR,pt;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(25000) });
      const buf = Buffer.from(await r.arrayBuffer());
      let txt = buf.toString('utf8');
      const cs = ((r.headers.get('content-type') || '').match(/charset=([\w-]+)/i) || txt.slice(0, 3000).match(/charset=["']?([\w-]+)/i) || [])[1];
      if (cs && /^(iso-8859-1|latin1|windows-1252|iso-8859-15)$/i.test(cs)) txt = new TextDecoder('windows-1252').decode(buf);
      return { status: r.status, txt };
    } catch (e) { if (i) return { status: 0, txt: '', erro: String(e.message || e).slice(0, 120) }; }
  }
}

(async () => {
  const agora = new Date();
  const res = await Promise.all(FONTES.map(async ([nome, tipo, url]) => {
    let r, itens = [], t = tipo, u = url;
    if (tipo === 'auto') {                       // tenta o feed do site; sem feed, lê a capa
      const fr = await baixar(url.replace(/\/?$/, '/') + 'feed/');
      try { itens = fr.status === 200 ? rss(fr.txt) : []; } catch (e) {}
      if (itens.length) { r = fr; t = 'rss'; u = url.replace(/\/?$/, '/') + 'feed/'; }
    }
    if (!itens.length) { r = await baixar(url); try { itens = r.status === 200 ? (tipo === 'rss' ? rss(r.txt) : capa(r.txt, url, /^\[\w\w\]/.test(nome))) : []; } catch (e) {} if (tipo === 'auto') t = 'capa'; }
    const uf = (/^\[(\w\w)\]/.exec(nome) || [])[1] || '';
    return { nome, tipo: t, uf, url: u, status: r.status, erro: r.erro || '', n: itens.length, itens };
  }));
  const ok = res.filter(x => x.n > 0).length;
  const out = { coletado: agora.toISOString(), coletado_brt: new Date(agora.getTime() - 3 * 3600e3).toISOString().replace('Z', '-03:00'), fontes_ok: ok, fontes_total: res.length, fontes: res };
  fs.writeFileSync(SAIDA, JSON.stringify(out, null, 1));
  console.log('fontes com itens: ' + ok + '/' + res.length);
  res.forEach(x => console.log((x.n ? 'OK ' : '-- ') + x.status + ' ' + String(x.n).padStart(3) + ' ' + x.nome + (x.erro ? ' ' + x.erro : '')));
})();
