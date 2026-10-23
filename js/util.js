// Utilidades compartilhadas (navegador + Node): constantes, formatação pt-BR, leitura tolerante de números do TSE.

export const CAND = {
  L: { k: 'L', n: 13, nome: 'Lula', nomeCompleto: 'Luiz Inácio Lula da Silva', partido: 'PT', cor: '#c8102e' },
  F: { k: 'F', n: 22, nome: 'Flávio Bolsonaro', nomeCompleto: 'Flávio Bolsonaro', partido: 'PL', cor: '#1d4ea8' },
};

// ordem usada em listas e no mapa
export const UFS = [
  ['ac', 'Acre', 'N'], ['al', 'Alagoas', 'NE'], ['ap', 'Amapá', 'N'], ['am', 'Amazonas', 'N'], ['ba', 'Bahia', 'NE'],
  ['ce', 'Ceará', 'NE'], ['df', 'Distrito Federal', 'CO'], ['es', 'Espírito Santo', 'SE'], ['go', 'Goiás', 'CO'],
  ['ma', 'Maranhão', 'NE'], ['mt', 'Mato Grosso', 'CO'], ['ms', 'Mato Grosso do Sul', 'CO'], ['mg', 'Minas Gerais', 'SE'],
  ['pa', 'Pará', 'N'], ['pb', 'Paraíba', 'NE'], ['pr', 'Paraná', 'S'], ['pe', 'Pernambuco', 'NE'], ['pi', 'Piauí', 'NE'],
  ['rj', 'Rio de Janeiro', 'SE'], ['rn', 'Rio Grande do Norte', 'NE'], ['rs', 'Rio Grande do Sul', 'S'], ['ro', 'Rondônia', 'N'],
  ['rr', 'Roraima', 'N'], ['sc', 'Santa Catarina', 'S'], ['sp', 'São Paulo', 'SE'], ['se', 'Sergipe', 'NE'], ['to', 'Tocantins', 'N'],
  ['zz', 'Exterior', 'EX'],
];
export const UF_IDS = UFS.map(u => u[0]);
export const UF_NOME = Object.fromEntries(UFS.map(u => [u[0], u[1]]));
export const UF_REGIAO = Object.fromEntries(UFS.map(u => [u[0], u[2]]));
export const REGIOES = { N: 'Norte', NE: 'Nordeste', CO: 'Centro-Oeste', SE: 'Sudeste', S: 'Sul', EX: 'Exterior' };
export const sigla = uf => uf === 'zz' ? 'EXT' : uf.toUpperCase();

// ---------- leitura tolerante (o TSE manda quase tudo como texto; % com vírgula) ----------
export function cnt(v) { // contagem inteira
  if (v == null || v === '') return 0;
  if (typeof v === 'number') return v;
  const s = String(v).trim();
  if (/^\d+$/.test(s)) return +s;
  const n = parseFloat(s.replace(/\./g, '').replace(',', '.'));
  return isNaN(n) ? 0 : n;
}
export function pct(v) { // percentual
  if (v == null || v === '') return NaN;
  if (typeof v === 'number') return v;
  const n = parseFloat(String(v).replace('%', '').replace(',', '.'));
  return isNaN(n) ? NaN : n;
}

// ---------- formatação pt-BR ----------
const nf0 = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 });
const nfs = {};
const nf = d => (nfs[d] ??= new Intl.NumberFormat('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d }));
export const fInt = v => (v == null || isNaN(v)) ? '–' : nf0.format(Math.round(v));
export const fPct = (v, d = 2) => (v == null || isNaN(v)) ? '–' : nf(d).format(v) + '%';
export const fNum = (v, d = 1) => (v == null || isNaN(v)) ? '–' : nf(d).format(v);
// variação em pontos percentuais com sinal: (+0,6)
export function fDelta(v, d = 1, unit = ' p.p.') {
  if (v == null || isNaN(v)) return '';
  const r = Math.round(v * 10 ** d) / 10 ** d;
  const s = nf(d).format(Math.abs(r));
  return (r > 0 ? '+' : r < 0 ? '−' : '±') + s + unit;
}
export function fGrowth(v, d = 1) { // crescimento relativo (%)
  if (v == null || !isFinite(v)) return '';
  const r = Math.round(v * 10 ** d) / 10 ** d;
  return (r > 0 ? '+' : r < 0 ? '−' : '±') + nf(d).format(Math.abs(r)) + '%';
}
export function fCompact(v) {
  if (v == null || isNaN(v)) return '–';
  const a = Math.abs(v);
  if (a >= 1e6) return nf(a >= 1e7 ? 1 : 2).format(v / 1e6) + ' mi';
  if (a >= 1e3) return nf(0).format(v / 1e3) + ' mil';
  return nf0.format(v);
}
export const clamp = (x, a, b) => Math.min(b, Math.max(a, x));
export const logit = p => Math.log(p / (1 - p));
export const expit = x => 1 / (1 + Math.exp(-x));
export const sdiv = (a, b) => (b ? a / b : NaN);

// ---------- cores ----------
function hex(c) { return [1, 3, 5].map(i => parseInt(c.slice(i, i + 2), 16)); }
function mix(c1, c2, t) { const a = hex(c1), b = hex(c2); return '#' + a.map((x, i) => Math.round(x + (b[i] - x) * t).toString(16).padStart(2, '0')).join(''); }
// tom do vencedor: maior % = mais escuro. 50% -> claro; 75%+ -> escuro.
export function corDoPct(k, p, cfg = {}) {
  if (p == null || isNaN(p)) return '#e4e1ea';
  const t = clamp((p - 50) / ((cfg.max || 78) - 50), 0, 1);
  const claro = k === 'L' ? '#f7cfcb' : '#cddcf3';
  const medio = k === 'L' ? '#e0483f' : '#4a7fd6';
  const escuro = k === 'L' ? '#7d0a14' : '#0b2a66';
  return t < 0.5 ? mix(claro, medio, t * 2) : mix(medio, escuro, (t - 0.5) * 2);
}
export const corTexto = bg => { const [r, g, b] = hex(bg); return (0.299 * r + 0.587 * g + 0.114 * b) > 150 ? '#1b1530' : '#ffffff'; };

export function horaBR(iso) { return iso ? new Date(iso).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' }) : ''; }
