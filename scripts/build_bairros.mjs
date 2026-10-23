#!/usr/bin/env node
// Monta data/bairros/{uf}/{cd5}.json: locais de votação (TSE, 2026) agrupados com bairro, endereço, coordenadas,
// seções e o 1º turno (presidente) de cada seção. Fontes (dados abertos do TSE):
//   eleitorado_locais_votacao/eleitorado_local_votacao_2026.zip   (seção → local → bairro)
//   votacao_secao/votacao_secao_2026_BR.zip                       (1º turno, presidente, por seção)
// Uso: node scripts/build_bairros.mjs <locais.zip> <votacao_secao_BR.zip> <saida>
import { spawn } from 'node:child_process';
import { createInterface } from 'node:readline';
import fs from 'node:fs';
import path from 'node:path';

const [zipLocais, zipVotos, outDir] = process.argv.slice(2);
function linhas(zip, membro, fn) {
  return new Promise((ok, err) => {
    const p = spawn('unzip', ['-p', zip, membro], { stdio: ['ignore', 'pipe', 'inherit'] });
    p.stdout.setEncoding('latin1');
    const rl = createInterface({ input: p.stdout, crlfDelay: Infinity });
    let cab = null, n = 0;
    rl.on('line', l => { if (!cab) { cab = parse(l); return; } n++; const v = parse(l), o = {}; for (let i = 0; i < cab.length; i++) o[cab[i]] = v[i]; fn(o); });
    p.on('close', c => c ? err(new Error('unzip ' + c)) : ok(n));
  });
}
function parse(l) { // CSV com ; e aspas
  const r = []; let i = 0; const n = l.length;
  while (i <= n) {
    if (l[i] === '"') { let j = i + 1, s = ''; for (; j < n; j++) { if (l[j] === '"') { if (l[j + 1] === '"') { s += '"'; j++; } else break; } else s += l[j]; } r.push(s); i = j + 2; }
    else { let j = l.indexOf(';', i); if (j < 0) j = n; r.push(l.slice(i, j)); i = j + 1; }
  }
  return r;
}
const lista = zip => new Promise(ok => { const p = spawn('unzip', ['-Z1', zip]); let s = ''; p.stdout.on('data', d => s += d); p.on('close', () => ok(s.trim().split('\n'))); });
const pad = (x, n) => String(x).padStart(n, '0');
const num = s => { const v = parseFloat(String(s).replace(',', '.')); return isFinite(v) ? v : null; };
const normB = s => (s || '').replace(/\s+/g, ' ').trim().toUpperCase();

// 1) locais e seções
const mun = new Map();   // cd5 -> {uf, nome, locais: Map(z-nrLocal -> local), secs: Map(z-sec -> sec)}
const mLoc = (await lista(zipLocais)).find(f => /BRASIL\.csv$/i.test(f)) || (await lista(zipLocais)).find(f => /\.csv$/i.test(f));
console.error('locais:', mLoc);
const agreg = [];
function entrada(r, sec, principal) {
  const uf = r.SG_UF.toLowerCase(), cd = pad(r.CD_MUNICIPIO, 5), z = +r.NR_ZONA;
  if (!mun.has(cd)) mun.set(cd, { uf, nome: r.NM_MUNICIPIO, locais: new Map(), secs: new Map() });
  const m = mun.get(cd), kl = z + '-' + r.NR_LOCAL_VOTACAO;
  let loc = m.locais.get(kl);
  if (!loc) { loc = { z, id: +r.NR_LOCAL_VOTACAO, nome: r.NM_LOCAL_VOTACAO, end: r.DS_ENDERECO, bairro: normB(r.NM_BAIRRO), cep: r.NR_CEP, lat: num(r.NR_LATITUDE), lon: num(r.NR_LONGITUDE), secs: new Map() }; m.locais.set(kl, loc); }
  let s = loc.secs.get(principal);
  if (!s) { s = { n: principal, ap: 0, L: 0, F: 0, O: 0, B: 0, N: 0 }; loc.secs.set(principal, s); m.secs.set(z + '-' + principal, s); }
  s.ap += +r.QT_ELEITOR_SECAO || 0;
  return s;
}
// 1ª passada: seções principais (as agregadas votam na urna da principal; o resultado sai na seção principal)
const vistas = new Set();   // o arquivo traz a mesma seção mais de uma vez (ex.: uma linha por turno): conta cada seção uma só vez
const nL = await linhas(zipLocais, mLoc, r => {
  const kv = pad(r.CD_MUNICIPIO, 5) + '-' + (+r.NR_ZONA) + '-' + (+r.NR_SECAO); if (vistas.has(kv)) return; vistas.add(kv);
  const sec = +r.NR_SECAO, ehPrincipal = r.CD_TIPO_SECAO_AGREGADA === '1' || +r.NR_SECAO_PRINCIPAL < 0 || +r.NR_SECAO_PRINCIPAL === sec;
  if (!ehPrincipal) { agreg.push(r); return; }
  entrada(r, sec, sec);
});
// 2ª passada: eleitores das seções agregadas somam na seção principal; se a principal não existir, vira entrada própria
for (const r of agreg) {
  const m = mun.get(pad(r.CD_MUNICIPIO, 5)), z = +r.NR_ZONA, p = +r.NR_SECAO_PRINCIPAL, s = m && m.secs.get(z + '-' + p);
  if (s) { s.ap += +r.QT_ELEITOR_SECAO || 0; m.secs.set(z + '-' + (+r.NR_SECAO), s); } else { const e = entrada(r, p, p); m.secs.set(z + '-' + (+r.NR_SECAO), e); }
}
console.error('linhas de locais:', nL, 'municípios:', mun.size);

// 2) 1º turno por seção (presidente)
const mV = (await lista(zipVotos)).find(f => /BR\.csv$/i.test(f));
console.error('votos:', mV);
const vot = {}; let semSec = 0, linhasV = 0;
await linhas(zipVotos, mV, r => {
  if (r.CD_CARGO !== '1' || r.NR_TURNO !== '1') return;
  linhasV++;
  const cd = pad(r.CD_MUNICIPIO, 5), m = mun.get(cd); const q = +r.QT_VOTOS || 0; const v = +r.NR_VOTAVEL;
  vot[v] = (vot[v] || 0) + q;
  const s = m && m.secs.get(+r.NR_ZONA + '-' + +r.NR_SECAO);
  if (!s) { semSec += q; return; }
  if (v === 13) s.L += q; else if (v === 22) s.F += q; else if (v === 95) s.B += q; else if (v === 96) s.N += q; else { s.O += q; (s.X ??= {})[v] = (s.X[v] || 0) + q; }
});
console.error('linhas presidente:', linhasV, 'votos sem seção no cadastro:', semSec);
console.error('votáveis (presidente, total):', JSON.stringify(Object.fromEntries(Object.entries(vot).sort((a, b) => b[1] - a[1]).slice(0, 14))));

// candidatos além de Lula (13) e Flávio (22), do mais ao menos votado: voto por seção vai em data/b1t (carregado só na aba do 1º turno)
const outros = Object.entries(vot).filter(([n]) => !['13', '22', '95', '96'].includes(n)).sort((a, b) => b[1] - a[1]).map(([n]) => +n);
const dirB1 = path.join(path.dirname(outDir), 'b1t');
// 3) saída
let nf = 0, nloc = 0, nsec = 0, semBairro = 0, semGeo = 0; const tot = { L: 0, F: 0 };
for (const [cd, m] of mun) {
  const ls = [...m.locais.values()].sort((a, b) => a.z - b.z || a.id - b.id).map(l => {
    const secs = [...l.secs.values()].sort((a, b) => a.n - b.n), s = k => secs.reduce((t, x) => t + x[k], 0);
    nloc++; nsec += secs.length; if (!l.bairro) semBairro++; if (l.lat == null || l.lat === 0) semGeo++; tot.L += s('L'); tot.F += s('F');
    return [l.z, l.id, l.nome, l.end, l.bairro, l.cep, l.lat, l.lon, s('ap'), s('L'), s('F'), s('O'), s('B'), s('N'), secs.map(x => [x.n, x.ap, x.L, x.F, x.O, x.B, x.N])];
  });
  const ordenados = [...m.locais.values()].sort((a, b) => a.z - b.z || a.id - b.id).map(l => [...l.secs.values()].sort((a, b) => a.n - b.n).map(x => outros.map(n => (x.X && x.X[n]) || 0)));
  fs.mkdirSync(path.join(dirB1, m.uf), { recursive: true });
  fs.writeFileSync(path.join(dirB1, m.uf, cd + '.json'), JSON.stringify({ c: outros, l: ordenados }));
  const dir = path.join(outDir, m.uf); fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, cd + '.json'), JSON.stringify({ cd, uf: m.uf, n: m.nome, l: ls }));
  nf++;
}
console.error(`arquivos ${nf} locais ${nloc} seções ${nsec} sem bairro ${semBairro} sem coordenada ${semGeo} | Lula ${tot.L} Flávio ${tot.F}`);
