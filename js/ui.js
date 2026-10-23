// Componentes de interface: tabela ordenável, cartões, formatação de variações.
import { fDelta, fGrowth, fNum } from './util.js?v=082c440a';
// texto sem acentos e em minúsculas (busca "sao" acha "São")
export const sem = t => String(t ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
export const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export const dlt = (v, d = 1, unit = ' p.p.') => { if (v == null || isNaN(v)) return ''; const t = fDelta(v, d, unit); const c = Math.round(v * 10 ** d) === 0 ? 'zero' : v > 0 ? 'pos' : 'neg'; return `<span class="dlt ${c}" title="variação em relação ao 1º turno">(${t})</span>`; };
// célula "percentual + variação" com largura fixa para a variação: os números alinham na coluna
export const pcel = (p, d, dig = 2, leve = false) => `<span class="pc${leve ? ' leve' : ''}"><b>${fNum(p, dig)}%</b>${d == null || isNaN(d) ? '' : dlt(d)}</span>`;
// célula de votos com o ganho em relação ao 1º turno entre parênteses: 150.930 (+12.345)
export const vcel = (v, g, tit = '') => `<span class="vc" ${tit ? `title="${tit}"` : ''}><b>${fNum(v, 0)}</b>${g == null || isNaN(g) ? '' : `<span class="dlt ${Math.round(g) === 0 ? 'zero' : g > 0 ? 'pos' : 'neg'}">(${fDelta(g, 0, '')})</span>`}</span>`;
// bloco recolhível de explicação: [+] Entenda
export const entenda = (html, rot = 'Entenda') => `<details class="entenda"><summary><span class="mais" aria-hidden="true"></span>${rot}</summary><div class="entenda-c">${html}</div></details>`;
export const grw = (v, d = 1) => { if (v == null || !isFinite(v)) return ''; const t = fGrowth(v, d); const c = Math.round(v * 10 ** d) === 0 ? 'zero' : v > 0 ? 'pos' : 'neg'; return `<span class="dlt ${c}">${t}</span>`; };

// cols: [{k,t,h(row)=>html,v(row)=>valor ordenável,x(row)=>valor CSV,cls,ini:'asc'|'desc'}]
export function tabela(el, { cols, rows, sort, dir = 'desc', onRow, vazio = 'Sem dados', filtro, limite }) {
  let s = sort ?? cols[0].k, d = dir, q = '';
  const col = () => cols.find(c => c.k === s) || cols[0];
  function desenhar() {
    const c = col(); let rs = rows.slice();
    if (q && filtro) rs = rs.filter(r => filtro(r, q));
    rs.sort((a, b) => { const va = c.v(a), vb = c.v(b), na = va == null || (typeof va === 'number' && isNaN(va)), nb = vb == null || (typeof vb === 'number' && isNaN(vb)); if (na || nb) return na - nb; const r = typeof va === 'string' ? va.localeCompare(vb, 'pt-BR') : va - vb; return d === 'asc' ? r : -r; });
    el._linhas = rs;
    const mostrar = limite ? rs.slice(0, limite) : rs;
    el.querySelector('tbody').innerHTML = mostrar.map((r, i) => `<tr data-i="${i}" class="${onRow ? 'clic' : ''}${r._cls ? ' ' + r._cls : ''}">${cols.map(c => `<td class="${c.cls || ''}">${c.h(r, i)}</td>`).join('')}</tr>`).join('') || `<tr><td colspan="${cols.length}" class="vazio">${vazio}</td></tr>`;
    el.querySelectorAll('th').forEach(th => { const on = th.dataset.k === s; th.classList.toggle('on', on); th.setAttribute('aria-sort', on ? (d === 'asc' ? 'ascending' : 'descending') : 'none'); th.querySelector('.seta').textContent = on ? (d === 'asc' ? '▲' : '▼') : '↕'; });
    const n = el.querySelector('.tab-n'); if (n) n.textContent = limite && rs.length > limite ? `${limite} de ${rs.length}` : `${rs.length}`;
  }
  el.innerHTML = `${filtro ? `<div class="tab-filtro sem-export"><input type="search" placeholder="Buscar…" aria-label="Buscar"><span class="tab-n"></span></div>` : ''}<div class="tab-scroll"><table class="tab"><thead><tr>${cols.map(c => `<th data-k="${c.k}" class="${c.cls || ''}" scope="col"><button type="button">${c.t}<span class="seta">↕</span></button></th>`).join('')}</tr></thead><tbody></tbody></table></div>`;
  el.querySelector('thead').addEventListener('click', e => { const th = e.target.closest('th'); if (!th) return; const k = th.dataset.k; if (k === s) d = d === 'asc' ? 'desc' : 'asc'; else { s = k; d = cols.find(c => c.k === k).ini || 'desc'; } desenhar(); });
  if (onRow) el.querySelector('tbody').addEventListener('click', e => { const tr = e.target.closest('tr[data-i]'); if (tr) onRow(el._linhas[+tr.dataset.i]); });
  const inp = el.querySelector('input'); if (inp) inp.addEventListener('input', () => { q = sem(inp.value.trim()); desenhar(); });
  desenhar();
  return { csv: () => ({ cab: cols.map(c => c.t.replace(/<[^>]+>/g, '')), linhas: el._linhas.map(r => cols.map(c => (c.x || c.v)(r))) }) };
}
