// Lê a abertura das reportagens que estão nas capas (a partir do manchetes.json) e grava artigos.json.
// Roda no GitHub Actions (que alcança os sites; o ambiente do Claude não). As edições leem o resultado no branch
// "manchetes" e escrevem com ele, sem depender do WebFetch. Guarda só um trecho curto (descrição + abertura), nunca o texto todo.
//   node radar/tools/coletar_artigos.cjs manchetes.json artigos.json
const fs = require('fs');
const ENTRADA = process.argv[2] || 'manchetes.json', SAIDA = process.argv[3] || 'artigos.json';
const UA = 'Mozilla/5.0 (compatible; OficinaPoliticaRadar/1.0; +https://oficinapolitica.com.br)';
const MAX_URLS = 700, POR_FONTE = 5, TRECHO = 1000, LIMITE_MS = 5 * 60 * 1000;
const COMB = { acute: '́', grave: '̀', circ: '̂', tilde: '̃', cedil: '̧', uml: '̈' };
const ent = s => String(s || '').replace(/<!\[CDATA\[|\]\]>/g, '')
  .replace(/&([A-Za-z])(acute|grave|circ|tilde|cedil|uml);/g, (m, l, c) => (l + COMB[c]).normalize('NFC'))
  .replace(/&#x([0-9a-f]+);/gi, (m, n) => String.fromCodePoint(parseInt(n, 16)))
  .replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n))
  .replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&nbsp;/g, ' ').replace(/&apos;|&#39;/g, "'")
  .replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

// extrai título, descrição e as primeiras frases do corpo de uma página de reportagem
function extrair(html) {
  const meta = n => { const m = html.match(new RegExp('<meta[^>]+(?:property|name)=["\']' + n + '["\'][^>]*content=["\']([^"\']*)["\']', 'i')) || html.match(new RegExp('<meta[^>]+content=["\']([^"\']*)["\'][^>]+(?:property|name)=["\']' + n + '["\']', 'i')); return m ? ent(m[1]) : ''; };
  const t = meta('og:title') || ent((html.match(/<title[^>]*>([\s\S]*?)<\/title>/i) || [])[1]);
  const d = meta('og:description') || meta('description');
  const corpo = html.replace(/<(script|style|nav|header|footer|aside|form)[\s\S]*?<\/\1>/gi, ' ');
  const ps = []; const re = /<p\b[^>]*>([\s\S]*?)<\/p>/gi; let m;
  while ((m = re.exec(corpo)) && ps.join(' ').length < TRECHO) { const x = ent(m[1]); if (x.length > 70 && !/^(leia|veja|assista|publicidade|continua depois|siga|compartilh|clique)/i.test(x)) ps.push(x); }
  let txt = ps.join(' ');
  if (d && !txt.startsWith(d.slice(0, 40))) txt = d + ' ' + txt;
  return { t: t.slice(0, 220), d: txt.slice(0, TRECHO).replace(/\s+\S*$/, '') };
}

async function baixar(url) {
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA, 'Accept': 'text/html,*/*;q=0.8', 'Accept-Language': 'pt-BR,pt;q=0.9' }, redirect: 'follow', signal: AbortSignal.timeout(12000) });
    if (r.status !== 200) return '';
    const buf = Buffer.from(await r.arrayBuffer()); let txt = buf.toString('utf8');
    const cs = ((r.headers.get('content-type') || '').match(/charset=([\w-]+)/i) || txt.slice(0, 3000).match(/charset=["']?([\w-]+)/i) || [])[1];
    if (cs && /^(iso-8859-1|latin1|windows-1252|iso-8859-15)$/i.test(cs)) txt = new TextDecoder('windows-1252').decode(buf);
    return txt;
  } catch (e) { return ''; }
}

module.exports = { extrair };
if (require.main === module) (async () => {
  const ini = Date.now();
  const m = JSON.parse(fs.readFileSync(ENTRADA, 'utf8'));
  const urls = []; const vistos = new Set();
  for (let p = 0; p < POR_FONTE; p++) (m.fontes || []).forEach(f => { const i = (f.itens || [])[p]; if (i && i.url && /^https?:/.test(i.url) && !vistos.has(i.url) && urls.length < MAX_URLS) { vistos.add(i.url); urls.push({ url: i.url, fonte: f.nome, t: i.t, d: i.d || '' }); } });
  const itens = {}; let k = 0, ok = 0;
  await Promise.all(Array.from({ length: 12 }, async () => {
    while (k < urls.length && Date.now() - ini < LIMITE_MS) {
      const u = urls[k++]; const html = await baixar(u.url);
      let x = html ? extrair(html) : { t: '', d: '' };
      if (!x.d && u.d) x = { t: u.t, d: u.d };           // sem página legível: guarda ao menos a descrição do feed
      if (x.d && x.d.length > 60) { itens[u.url] = { f: u.fonte, t: x.t || u.t, d: x.d }; ok++; }
    }
  }));
  fs.writeFileSync(SAIDA, JSON.stringify({ coletado: m.coletado, n: ok, tentadas: urls.length, itens }));
  console.log('artigos com trecho: ' + ok + '/' + urls.length + ' em ' + Math.round((Date.now() - ini) / 1000) + 's');
})();
