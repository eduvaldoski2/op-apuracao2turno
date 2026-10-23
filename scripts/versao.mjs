// Carimba os módulos JS/CSS com ?v=<hash do conteúdo> para o navegador nunca usar uma versão antiga em cache.
// Uso: node scripts/versao.mjs   (rodar antes de cada commit; é idempotente)
import fs from 'node:fs'; import crypto from 'node:crypto'; import path from 'node:path';
const limpa = s => s.replace(/(\.(?:js|css|svg))\?v=[0-9a-f]+/g, '$1');
const arqs = fs.readdirSync('js').filter(f => f.endsWith('.js')).map(f => 'js/' + f).concat(['css/app.css', 'css/consent.css', 'painel.html', 'index.html']);
const base = Object.fromEntries(arqs.map(f => [f, limpa(fs.readFileSync(f, 'utf8'))]));
const h = crypto.createHash('sha1'); for (const f of arqs.sort()) h.update(f + base[f]); const v = h.digest('hex').slice(0, 8);
for (const f of arqs) {
  let s = base[f];
  if (f.endsWith('.js')) s = s.replace(/(from\s+'\.\/[\w.\-]+\.js)'/g, `$1?v=${v}'`).replace(/(import\(\s*'\.\/[\w.\-]+\.js)'/g, `$1?v=${v}'`);
  if (f === 'painel.html') s = s.replace(/(src="js\/app\.js)"/, `$1?v=${v}"`).replace(/(href="css\/app\.css)"/, `$1?v=${v}"`);
  if (f === 'index.html') s = s.replace(/(from\s+'\.\/js\/[\w.\-]+\.js)'/g, `$1?v=${v}'`).replace(/(href="css\/consent\.css)"/, `$1?v=${v}"`);
  if (s !== fs.readFileSync(f, 'utf8')) fs.writeFileSync(f, s);
}
console.log('versão', v);
