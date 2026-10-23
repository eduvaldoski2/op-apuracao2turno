// Baixa do OpenStreetMap (Overpass) os limites de bairros dos municípios listados e converte para GeoJSON.
//   node scripts/osm_baixar.mjs lista.json saida_dir
import fs from 'node:fs';
import osmtogeojson from 'osmtogeojson';
const [listaf, saida, fatia = '0', de = '1'] = process.argv.slice(2);
const lista = JSON.parse(fs.readFileSync(listaf, 'utf8')).filter((_, i) => i % +de === +fatia); fs.mkdirSync(saida, { recursive: true });
const UA = 'oficina-politica-apuracao/1.0 (https://github.com/eduvaldoski2/op-apuracao2turno)';
const HOSTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.private.coffee/api/interpreter'];
const dorme = ms => new Promise(r => setTimeout(r, ms));
const consulta = ibge => `[out:json][timeout:90];
rel["boundary"="administrative"]["admin_level"="8"]["IBGE:GEOCODIGO"="${ibge}"]->.m; .m map_to_area->.a;
( rel(area.a)["boundary"="administrative"]["admin_level"~"^(9|10|11|12)$"]; rel(area.a)["type"="boundary"]["place"~"^(suburb|neighbourhood|quarter)$"]; );
out geom;`;
let feitos = 0, vazios = 0, erros = 0;
for (const m of lista) {
  let ok = false;
  for (let t = 0; t < 3 && !ok; t++) {
    const h = HOSTS[t % HOSTS.length];
    try {
      const r = await fetch(h, { method: 'POST', headers: { 'User-Agent': UA, 'Content-Type': 'application/x-www-form-urlencoded', Accept: '*/*' }, body: 'data=' + encodeURIComponent(consulta(m.ibge)), signal: AbortSignal.timeout(100000) });
      if (r.status === 429 || r.status >= 500) { await dorme(15000 * (t + 1)); continue; }
      if (!r.ok) throw new Error(r.status);
      const j = await r.json(); const n = (j.elements || []).length;
      if (!n) { vazios++; ok = true; break; }
      fs.writeFileSync(`${saida}/${m.cd5}.geojson`, JSON.stringify(osmtogeojson(j))); feitos++; ok = true;
      console.log('osm', m.uf, m.cd5, m.nome, 'relações', n);
    } catch (e) { console.log('erro', m.cd5, String(e.message || e).slice(0, 80)); await dorme(8000); }
  }
  if (!ok) erros++;
  await dorme(1200);
}
console.log(JSON.stringify({ feitos, vazios, erros }));
