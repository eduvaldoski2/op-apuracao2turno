// Cores dos partidos (tom de referência dos logotipos oficiais; aproximadas) e utilitários de contraste.
const COR = {
  PT: '#D0112B', PL: '#1B3F94', 'UNIÃO': '#0A58A8', PP: '#1565B5', PSD: '#E8A317', PSDB: '#1F7AC4', MDB: '#1E8A3C', PSB: '#F2A100', PDT: '#D9232D',
  PSOL: '#C8102E', REDE: '#2DA84F', PV: '#3FA535', PCDOB: '#A50F15', 'PC DO B': '#A50F15', REPUBLICANOS: '#1A5DAB', PODE: '#2AA7DF', PODEMOS: '#2AA7DF', AVANTE: '#F26522',
  SOLIDARIEDADE: '#F58220', PRD: '#1B7F5A', NOVO: '#F26B21', 'MISSÃO': '#E0A800', CIDADANIA: '#C2185B', MOBILIZA: '#E65100', UP: '#C62828', PSTU: '#B71C1C',
  DC: '#2E7D32', PCO: '#8E0000', PMB: '#4CAF50', AGIR: '#00897B', PRTB: '#1E7F3C', PMN: '#546E7A',
};
const FALL = ['#6D4C9F', '#00838F', '#8D6E63', '#5C6BC0', '#7CB342', '#AD1457'];
export const corPartido = sg => { const k = String(sg || '').toUpperCase().replace(/\./g, ''); if (COR[k]) return COR[k]; let h = 0; for (const c of k) h = (h * 31 + c.charCodeAt(0)) >>> 0; return FALL[h % FALL.length]; };
// texto branco ou escuro conforme o fundo
export function corTextoSobre(hex) { const n = parseInt(hex.slice(1), 16), r = n >> 16, g = (n >> 8) & 255, b = n & 255; return (0.299 * r + 0.587 * g + 0.114 * b) > 170 ? '#2a2540' : '#fff'; }
// logotipo do partido (img/partidos/<SIGLA>.png); se o arquivo não existir, a imagem some e fica só a sigla
export const logoP = (sg, cls = 'lg-p') => `<img class="${cls}" src="img/partidos/${encodeURIComponent(String(sg || '').toUpperCase().replace(/\./g, ''))}.png" alt="" loading="lazy" onerror="this.remove()">`;
