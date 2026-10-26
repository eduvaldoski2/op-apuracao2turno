// Métricas de uso, anônimas e sem cookies: quantos acessaram, de onde vieram (referência/UTM/país, pelo provedor), o que mais usam.
// Provedor configurável em js/config.js (CONFIG.metricas). Sem provedor configurado, nada é enviado.
// Respeita "Do Not Track" / Global Privacy Control e o opt-out local (?semmetricas=1 neste navegador; ?metricas=1 reativa).
import { CONFIG } from './config.js?v=f8e454de';
import { rastrearTela } from './consentimento.js?v=f8e454de';

const KEY = 'op_sem_metricas';
const q = new URLSearchParams(location.search);
try { if (q.get('semmetricas') === '1') localStorage.setItem(KEY, '1'); if (q.get('metricas') === '1') localStorage.removeItem(KEY); } catch { /* sem armazenamento */ }
const optOut = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const dnt = () => navigator.doNotTrack === '1' || window.doNotTrack === '1' || navigator.globalPrivacyControl === true;
const cfg = CONFIG.metricas || {};
export const metricasAtivas = () => !!(cfg.provedor && cfg.id) && !optOut() && !dnt() && !q.has('demo');
export const motivoInativo = () => !(cfg.provedor && cfg.id) ? 'Nenhum provedor configurado.' : optOut() ? 'Este navegador está excluído das métricas (?semmetricas=1).' : dnt() ? 'O navegador pediu para não ser rastreado (Do Not Track).' : q.has('demo') ? 'Modo demonstração não conta.' : '';

let pronto = false; const fila = [];
const ADAPT = {
  umami: {
    src: () => `${cfg.host || 'https://cloud.umami.is'}/script.js`, attrs: () => ({ 'data-website-id': cfg.id, 'data-auto-track': 'false' }),
    evento: (n, p) => window.umami?.track(n, p), tela: (url, titulo) => window.umami?.track(pr => ({ ...pr, url, title: titulo })),
  },
  plausible: {
    src: () => `${cfg.host || 'https://plausible.io'}/js/script.manual.js`, attrs: () => ({ 'data-domain': cfg.id }),
    evento: (n, p) => window.plausible?.(n, { props: p }), tela: url => window.plausible?.('pageview', { u: location.origin + url }),
  },
  goatcounter: {
    src: () => 'https://gc.zgo.at/count.js', attrs: () => ({ 'data-goatcounter': `https://${cfg.id}.goatcounter.com/count`, 'data-goatcounter-settings': '{"no_onload":true}' }),
    evento: (n, p) => window.goatcounter?.count({ path: 'evento/' + n + (p ? '/' + Object.values(p).join('/') : ''), title: n, event: true }), tela: (url, t) => window.goatcounter?.count({ path: url, title: t }),
  },
};
const ad = () => ADAPT[cfg.provedor];

export function iniciarMetricas() {
  if (!metricasAtivas() || !ad()) return;
  const s = document.createElement('script'); s.defer = true; s.src = ad().src();
  Object.entries(ad().attrs()).forEach(([k, v]) => s.setAttribute(k, v));
  s.onload = () => { pronto = true; fila.splice(0).forEach(f => f()); };
  document.head.appendChild(s);
  ligaGlobais();
}
const quando = f => { if (!metricasAtivas() || !ad()) return; try { pronto ? f() : fila.push(f); } catch { /* métrica nunca pode quebrar o painel */ } };

// evento personalizado: nome em minúsculas_com_underscore, propriedades simples (sem dados pessoais)
export function evento(nome, props) { quando(() => ad().evento(nome, props)); }

// visualização de "tela" (as rotas são hash): chamada quando a rota muda
let ultima = '';
export function tela(r) {
  const chave = [r.modo, r.tela, r.uf || '', r.cd || '', r.reg || '', r.id || ''].join('|'); if (chave === ultima) return; ultima = chave;
  const url = `/${r.modo || 'ap'}/${r.tela || 'geral'}${r.uf ? '/' + r.uf : ''}${r.cd ? '/' + r.cd : ''}`;
  rastrearTela(url, document.title);
  quando(() => ad().tela(url, document.title));
}

let erros = 0;
function ligaGlobais() {
  document.addEventListener('click', e => {
    const mm = e.target.closest('[data-mm]'); if (mm) return evento('mapa_modo', { modo: mm.dataset.mm });
    const fm = e.target.closest('[data-forma]'); if (fm) return evento('mapa_modo', { modo: fm.dataset.forma });
    const ex = e.target.closest('[data-eixo]'); if (ex) return evento('dispersao_eixo', { eixo: ex.dataset.eixo });
    const th = e.target.closest('th button, th[data-k]'); if (th) return evento('ordenar_tabela');
    const a = e.target.closest('a[href^="http"]'); if (a && !a.href.startsWith(location.origin)) evento('link_externo', { dominio: new URL(a.href).hostname });
  }, true);
  document.addEventListener('toggle', e => { const d = e.target; if (d.matches?.('details.entenda') && d.open) evento('entenda_aberto', { item: (d.querySelector('summary')?.textContent || '').trim().slice(0, 40) }); }, true);
  addEventListener('error', () => { if (erros++ < 3) evento('erro_js'); });
}
