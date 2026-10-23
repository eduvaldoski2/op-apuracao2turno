// Configuração do painel. Pode ser sobrescrita por parâmetros na URL: ?fonte=URL  ?tse=URL  ?demo=1
export const CONFIG = {
  repo: 'eduvaldoski2/op-apuracao2turno',
  fontes: [   // onde o coletor publica snap.json / hist.json (na ordem de tentativa)
    'https://raw.githubusercontent.com/eduvaldoski2/op-apuracao2turno/dados/live/',
    'data/live/',
  ],
  base: 'data/base_1t.json',       // 1º turno por município
  mapa: 'data/mapa_uf.json',
  intervalo: 30000,                // ms entre consultas
  atrasoMax: 12 * 60 * 1000,       // acima disso a fonte é considerada atrasada
  diretoTSE: true,                 // se nenhuma fonte responde, lê direto do TSE (apenas nível de UF)
  inicioApuracao: '2026-10-25T17:00:00-03:00',
};
