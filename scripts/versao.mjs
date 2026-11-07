// Carimba os módulos JS/CSS com ?v=<hash do conteúdo> para o navegador nunca usar uma versão antiga em cache.
// Uso: node scripts/versao.mjs   (rodar antes de cada commit; é idempotente)
import fs from 'node:fs'; import crypto from 'node:crypto'; import path from 'node:path';
const limpa = s => s.replace(/(\.(?:js|css|svg))\?v=[0-9a-f]+/g, '$1');
const arqs = fs.readdirSync('js').filter(f => f.endsWith('.js')).map(f => 'js/' + f).concat(['css/app.css', 'css/consent.css', 'painel.html', 'index.html', 'conta.html', 'painel-inicio.html', 'radar/_login.html', 'radar/_shell.html', 'cartoes/cartoes.js', 'cartoes/cartoes.css', 'cartoes/index.html']);
const base = Object.fromEntries(arqs.map(f => [f, limpa(fs.readFileSync(f, 'utf8'))]));
const h = crypto.createHash('sha1'); for (const f of arqs.sort()) h.update(f + base[f]); const v = h.digest('hex').slice(0, 8);
for (const f of arqs) {
  let s = base[f];
  if (f.endsWith('.js')) s = s.replace(/(from\s+'\.\/[\w.\-]+\.js)'/g, `$1?v=${v}'`).replace(/(import\(\s*'\.\/[\w.\-]+\.js)'/g, `$1?v=${v}'`);
  if (f === 'painel.html') s = s.replace(/(src="js\/app\.js)"/, `$1?v=${v}"`).replace(/(href="css\/app\.css)"/, `$1?v=${v}"`);
  if (f === 'cartoes/cartoes.js') s = s.replace(/(from\s+'\.\.\/js\/[\w.\-]+\.js)'/g, `$1?v=${v}'`).replace(/(import\(\s*'\.\.\/js\/[\w.\-]+\.js)'/g, `$1?v=${v}'`);
  if (f === 'cartoes/index.html') s = s.replace(/(href="cartoes\.css)"/, `$1?v=${v}"`).replace(/(src="cartoes\.js)"/, `$1?v=${v}"`);
  if (f === 'radar/_login.html') s = s.replace(/(import\(\s*'\/js\/[\w.\-]+\.js)'/g, `$1?v=${v}'`);
  if (f === 'radar/_shell.html') s = s.replace(/(import\(\s*'\/js\/[\w.\-]+\.js)'/g, `$1?v=${v}'`).replace(/(href="\/css\/consent\.css)/, `$1?v=${v}`).replace(/(href="\/css\/consent\.css\?v=[0-9a-f]+)"/, '$1"');
  if (f === 'conta.html') s = s.replace(/(src="js\/contapag\.js)"/, `$1?v=${v}"`).replace(/(href="css\/consent\.css)"/, `$1?v=${v}"`);
  if (f === 'painel-inicio.html') s = s.replace(/(import\(\s*'\.\/js\/menuconta\.js)'/g, `$1?v=${v}'`);
  if (f === 'index.html') s = s.replace(/(from\s+'\.\/js\/[\w.\-]+\.js)'/g, `$1?v=${v}'`).replace(/(href="css\/consent\.css)"/, `$1?v=${v}"`);
  if (s !== fs.readFileSync(f, 'utf8')) fs.writeFileSync(f, s);
}
console.log('versão', v);
