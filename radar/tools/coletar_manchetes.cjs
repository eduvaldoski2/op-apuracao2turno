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
  ['Reuters Brasil', 'capa', 'https://www.reuters.com/world/americas/'],
  ['Poder360 (capa)', 'capa', 'https://www.poder360.com.br/']
];

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

function capa(html, base) {
  const host = new URL(base).hostname.replace(/^www\./, '');
  const out = [], vistos = new Set();
  const re = /<a\b[^>]*href="([^"#]+)"[^>]*>([\s\S]*?)<\/a>/gi; let m;
  while ((m = re.exec(html)) && out.length < 70) {
    let href = m[1]; if (href.startsWith('//')) href = 'https:' + href; else if (href.startsWith('/')) href = new URL(href, base).href;
    if (!/^https?:/.test(href)) continue;
    const t = ent(m[2]);
    if (t.length < 38 || t.length > 260 || t.split(' ').length < 6) continue;           // manchete tem frase
    if (!/\d{4}\/\d{2}|\/\d{4}\/|\.ghtml|\.shtml|\.html|\/noticia|\/politica|\/economia|\/mundo|\/brasil|\/pais|\/radar/.test(href)) continue;
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
    const r = await baixar(url);
    let itens = [];
    try { itens = r.status === 200 ? (tipo === 'rss' ? rss(r.txt) : capa(r.txt, url)) : []; } catch (e) {}
    return { nome, tipo, url, status: r.status, erro: r.erro || '', n: itens.length, itens };
  }));
  const ok = res.filter(x => x.n > 0).length;
  const out = { coletado: agora.toISOString(), coletado_brt: new Date(agora.getTime() - 3 * 3600e3).toISOString().replace('Z', '-03:00'), fontes_ok: ok, fontes_total: res.length, fontes: res };
  fs.writeFileSync(SAIDA, JSON.stringify(out, null, 1));
  console.log('fontes com itens: ' + ok + '/' + res.length);
  res.forEach(x => console.log((x.n ? 'OK ' : '-- ') + x.status + ' ' + String(x.n).padStart(3) + ' ' + x.nome + (x.erro ? ' ' + x.erro : '')));
})();
