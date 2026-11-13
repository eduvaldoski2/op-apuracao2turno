// Consulta os trechos de reportagens coletados pelo Actions (radar/tools/_artigos.json, baixado do branch "manchetes").
//   node radar/tools/artigo.cjs <palavras da busca...>     → lista as reportagens que casam (todas as palavras), com o trecho
//   node radar/tools/artigo.cjs --url <endereço>            → trecho daquele link
const fs = require('fs'), path = require('path');
const f = path.join(__dirname, '_artigos.json');
if (!fs.existsSync(f)) { console.error('sem radar/tools/_artigos.json: git show origin/manchetes:artigos.json > radar/tools/_artigos.json'); process.exit(1); }
const a = JSON.parse(fs.readFileSync(f, 'utf8')); const args = process.argv.slice(2);
const norm = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
let achados;
if (args[0] === '--url') achados = Object.entries(a.itens).filter(([u]) => u === args[1] || u.startsWith(args[1]));
else { const ps = args.map(norm).filter(Boolean); achados = Object.entries(a.itens).filter(([u, x]) => ps.every(p => norm(x.t + ' ' + x.d + ' ' + u).includes(p))); }
console.log('coletado: ' + a.coletado + ' · ' + achados.length + ' resultado(s) de ' + a.n);
achados.slice(0, 15).forEach(([u, x]) => console.log('\n[' + x.f + '] ' + x.t + '\n' + u + '\n' + x.d));
