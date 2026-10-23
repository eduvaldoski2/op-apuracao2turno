// Compara o resultado por seção coletado (out/bairros) com o 1º turno oficial por seção (data/bairros).
import fs from 'node:fs'; import path from 'node:path';
const [coletado, estatico, uf] = process.argv.slice(2);
let ok = 0, dif = 0, falta = 0, amostra = [];
for (const f of fs.readdirSync(path.join(coletado, uf))) {
  const c = JSON.parse(fs.readFileSync(path.join(coletado, uf, f), 'utf8')), e = JSON.parse(fs.readFileSync(path.join(estatico, uf, f), 'utf8'));
  for (const l of e.l) for (const s of l[14]) {
    const k = l[0] + '-' + s[0], x = c.s[k]; if (!x) { falta++; continue; }
    const igual = x[0] === s[2] && x[1] === s[3] && x[2] === s[4] && x[3] === s[5] && x[4] === s[6];
    if (igual) ok++; else { dif++; if (amostra.length < 6) amostra.push({ k, bu: x, csv: s.slice(1) }); }
  }
}
console.log(`seções iguais ${ok} | diferentes ${dif} | sem BU coletado ${falta}`); console.log(JSON.stringify(amostra));
