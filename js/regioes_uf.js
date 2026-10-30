// Regiões do estado (agrupamentos de municípios). Hoje só o RJ tem a lista de municípios por região confirmada.
import { CAND, fInt, fNum } from './util.js?v=2792a339';
import { esc, pcel, tabela, sem } from './ui.js?v=2792a339';
import { getJSON } from './tse.js?v=2792a339';

export const UF_COM_REGIOES = new Set(['rj']);
export const secaoRegioesUf = (uf, titulo) => UF_COM_REGIOES.has(uf)
  ? `<section class="painel" id="sec-reg-uf" hidden><h2>Regiões de ${esc(titulo)}</h2><p class="sub" id="reg-uf-sub"></p><div id="tab-reg-uf"></div></section>` : '';

const soma = ms => {
  const a = ms.filter(m => m.L + m.F > 0); if (!a.length) return null;
  const L = a.reduce((s, m) => s + m.L, 0), F = a.reduce((s, m) => s + m.F, 0), v = L + F;
  const c1 = a.filter(m => m.L1 + m.F1 > 0), L1 = c1.reduce((s, m) => s + m.L1, 0), F1 = c1.reduce((s, m) => s + m.F1, 0);
  const pL = 100 * L / v, pF = 100 * F / v;
  return { L, F, pL, pF, dL: L1 + F1 > 0 ? pL - 100 * L1 / (L1 + F1) : NaN, dF: L1 + F1 > 0 ? pF - 100 * F1 / (L1 + F1) : NaN, n: a.length, lider: L >= F ? 'L' : 'F' };
};

export function montarRegioesUf(root, uf, rows, ap) {
  if (!UF_COM_REGIOES.has(uf)) return;
  getJSON(`data/regioes/uf-${uf}.json`, { retries: 1 }).then(def => {
    const porNome = new Map(rows.map(m => [sem(m.nome), m]));
    const lin = Object.entries(def.regioes).map(([nome, muns]) => {
      const ms = muns.map(n => porNome.get(sem(n))).filter(Boolean), s = soma(ms);
      return { id: nome, nome, nm: ms.length, ...(s || { L: NaN, F: NaN, pL: NaN, pF: NaN, dL: NaN, dF: NaN, n: 0, lider: null }) };
    });
    const sec = root.querySelector('#sec-reg-uf'); if (!sec) return;
    sec.hidden = false;
    root.querySelector('#reg-uf-sub').textContent = `${lin.length} regiões (${def.fonte}). Soma dos municípios ${ap ? 'já apurados' : '(projeção)'} de cada uma.`;
    const cel = (k, m) => isNaN(m['p' + k]) ? '' : pcel(m['p' + k], m['d' + k]);
    tabela(sec.querySelector('#tab-reg-uf'), {
      rows: lin, sort: 'nome', dir: 'asc',
      cols: [
        { k: 'nome', t: 'Região', h: m => `<b>${esc(m.nome)}</b>`, v: m => m.nome, ini: 'asc' },
        { k: 'n', t: 'Municípios', h: m => `${m.n}/${m.nm}`, v: m => m.n, cls: 'n' },
        { k: 'pL', t: `${CAND.L.nome.split(' ')[0]} %`, h: m => cel('L', m), v: m => m.pL, cls: 'n' },
        { k: 'pF', t: `${CAND.F.nome.split(' ')[0]} %`, h: m => cel('F', m), v: m => m.pF, cls: 'n' },
        { k: 'lid', t: 'Vence', h: m => m.lider ? `<span class="chip-l" style="background:${CAND[m.lider].cor}">${CAND[m.lider].nome.split(' ')[0]}</span>` : '', v: m => m.lider ? (m.lider === 'L' ? 1 : 0) : NaN, cls: 'c' },
      ],
    });
  }).catch(() => {});
}
