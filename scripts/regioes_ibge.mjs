// Regiões geográficas intermediárias do IBGE (2017) por estado: data/regioes_uf/<uf>.json = { fonte, regioes: [{ nome, muns: [ibge7, ...] }] }
import fs from 'node:fs';
const r = await fetch('https://servicodados.ibge.gov.br/api/v1/localidades/municipios');
if (!r.ok) throw new Error('IBGE ' + r.status);
const L = await r.json(), por = {};
for (const m of L) {
  const ri = m['regiao-imediata'], rint = ri?.['regiao-intermediaria']; if (!rint) continue;
  const uf = rint.UF.sigla.toLowerCase(); ((por[uf] ??= {})[rint.nome] ??= []).push(String(m.id));
}
fs.mkdirSync('data/regioes_uf', { recursive: true });
for (const [uf, rs] of Object.entries(por)) fs.writeFileSync(`data/regioes_uf/${uf}.json`, JSON.stringify({ fonte: 'IBGE — Regiões Geográficas Intermediárias (2017)', regioes: Object.entries(rs).map(([nome, muns]) => ({ nome, muns })) }));
console.log('estados', Object.keys(por).length, 'municípios', L.length);
