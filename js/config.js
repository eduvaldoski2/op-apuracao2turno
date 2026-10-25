// Configuração do painel. Pode ser sobrescrita por parâmetros na URL: ?fonte=URL  ?tse=URL  ?demo=1
// O painel é servido em /apuracao-2t-2026/ (reescrita no .htaccess). Os caminhos do placar ao vivo usam a raiz do site, para que o cache (Cloudflare) enxergue um único endereço.
export const RAIZ = (typeof location !== 'undefined' && /\/apuracao-2t-2026\//.test(location.pathname)) ? location.pathname.replace(/\/apuracao-2t-2026\/.*$/, '/') : '';
export const CONFIG = {
  repo: 'eduvaldoski2/op-apuracao2turno',
  fontes: [   // onde o coletor publica snap.json / hist.json (na ordem de tentativa)
    RAIZ + 'live/',  // intermediário na hospedagem (api/live.php): cópia de 20 s, aguenta picos; no GitHub Pages não existe e é pulado
    'https://raw.githubusercontent.com/eduvaldoski2/op-apuracao2turno/dados/live/',
    'data/live/',
  ],
  base: 'data/base_1t.json',
  // resultado por seção (bairros): 5 branches, cada uma com um grupo de estados (ver .github/workflows/secoes.yml)
  gruposBairros: { sp: 1, mg: 2, pa: 2, pi: 2, am: 2, df: 2, rj: 3, pe: 3, sc: 3, mt: 3, ms: 3, ro: 3, zz: 3, rr: 3, ba: 4, ce: 4, go: 4, es: 4, al: 4, to: 4, ac: 4, rs: 5, pr: 5, ma: 5, pb: 5, rn: 5, se: 5, ap: 5 },
  prefixoBairros: 'dados-b',       // 1º turno por município
  mapa: 'data/mapa_uf.json',
  intervalo: 12000,                // ms entre consultas
  atrasoMax: 12 * 60 * 1000,       // acima disso a fonte é considerada atrasada
  diretoTSE: true,                 // se nenhuma fonte responde, lê direto do TSE (apenas nível de UF)
  // métricas de uso (anônimas, sem cookies). provedor: 'umami' | 'plausible' | 'goatcounter'; id = ID do site (Umami), domínio (Plausible) ou código (GoatCounter).
  // painel = endereço do painel de resultados do provedor (aparece em admin.html). Vazio = métricas desligadas.
  // pareamento com TV (PeerJS): vazio = servidor público de sinalização do PeerJS; ou { host, port, path, secure } de um servidor próprio
  pareamento: {},
  metricas: { provedor: '', id: '', host: '', painel: '' },
  // Google Analytics 4 (só carrega com o consentimento do visitante; vazio = desligado). ga4: ID da métrica, no formato 'G-XXXXXXXXXX'.
  analytics: { ga4: 'G-DE3VNZ3VWH' },
  // anúncios (só são carregados com o consentimento do visitante; vazio = desligado). Veja admin.html.
  anuncios: { meta: { pixel: '' }, google: { id: '', conversaoLead: '' } },   // google.id: 'AW-XXXXXXXXX' ou 'G-XXXXXXXXXX'; conversaoLead: 'AW-XXXXXXXXX/rótulo'
  // captação de contatos (leads): endpoint = endereço do api/lead.php publicado na hospedagem. Vazio = formulário desligado.
  leads: { endpoint: '', link: 'Receber a análise e os próximos painéis', titulo: 'Receba a análise e os próximos painéis', texto: 'Deixe seu contato para receber a análise pós-apuração da Oficina Política e novidades das nossas ferramentas de inteligência eleitoral.' },
  // dados do controlador exibidos em privacidade.html (preencher antes de ligar anúncios/leads)
  privacidade: { controlador: 'Oficina Política', cnpj: '', email: 'contato@oficinapolitica.com.br', endereco: '' },
  inicioApuracao: '2026-10-25T17:00:00-03:00',
};
