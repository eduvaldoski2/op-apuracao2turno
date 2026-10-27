// Governador: resultado por estado no 1º turno (data/gov_1t.json) e no 2º turno (snap.gov, só nos estados com disputa).
// Os dados vêm do TSE (eleição estadual 6259/6260, cargo 3) e são independentes da disputa presidencial.
import { UF_NOME, fInt, fNum, clamp } from './util.js?v=3fbb69ff';
import { esc } from './ui.js?v=3fbb69ff';

const COR = ['#3E347E', '#D9741A', '#1b8a6b', '#b3367a', '#2b6cb0', '#8a6d00', '#6b7280', '#a3261a', '#4b5fa8', '#9a5b13', '#2f7d3a', '#7a3fa0'];
export const nomeP = t => String(t || '').toLowerCase().replace(/(^|[\s\-(])(\p{L})/gu, (m, a, b) => a + b.toUpperCase()).replace(/ (D[aeo]s?|E) /g, x => x.toLowerCase());
export const govPst = g => (g.ts ? 100 * g.st / g.ts : 0);
const ESTADOS_ORD = (a, b) => UF_NOME[a].localeCompare(UF_NOME[b], 'pt-BR');
// eleito: pelo texto da situação ("Eleito"); no 1º turno o TSE também marca com e:"s" quem vai ao 2º turno
export const eleitoC = c => (c.st ? /^eleit/i.test(c.st) : !!c.e);
export const decidido = g => !!g.cand?.some(eleitoC);

// painel de um estado: todos os candidatos (barra, %, votos), selo de eleito e rodapé com abstenção e brancos/nulos
export function govPainel(g, uf, turno) {
  if (!g || !g.cand?.length) return '';
  const pst = govPst(g), fim = pst >= 99.995, eleito = g.cand.find(eleitoC), vaiSegundo = turno === 1 && !eleito && fim;
  const linhas = g.cand.map((c, i) => { const cor = COR[i % COR.length];
    return `<div class="gv-c${eleitoC(c) ? ' gv-w' : ''}"><div class="gv-t"><span class="gv-n"><i style="background:${cor}"></i><b>${esc(nomeP(c.nm))}</b> <small>${esc(c.sg)} · ${esc(c.n)}</small>${eleitoC(c) ? '<span class="gv-sel">Eleito(a)</span>' : (vaiSegundo && i < 2 ? '<span class="gv-sel gv-2t">Vai ao 2º turno</span>' : '')}</span><span class="gv-p" style="color:${cor}">${fNum(c.p, 2)}%</span></div><div class="gv-b"><i style="width:${clamp(c.p, 0, 100)}%;background:${cor}"></i></div><div class="gv-v">${fInt(c.v)} votos</div></div>`; }).join('');
  const dif = g.cand.length > 1 ? g.cand[0].v - g.cand[1].v : 0, hora = String(g.ht || g.hg || '').slice(0, 5);
  const frase = eleito && fim ? (turno === 1 ? `<b>${esc(nomeP(eleito.nm))}</b> foi eleito(a) no 1º turno. ` : `<b>${esc(nomeP(eleito.nm))}</b> vence por <b>${fInt(Math.abs(dif))}</b> votos. `)
    : (!fim && dif ? `<b>${esc(nomeP(g.cand[0].nm))}</b> lidera por <b>${fInt(Math.abs(dif))}</b> votos. ` : (vaiSegundo ? 'Nenhum candidato passou de 50% dos votos válidos: a disputa foi para o 2º turno. ' : ''));
  return `<section class="painel gov"><h2>Governador · ${turno}º turno</h2><p class="sub">${esc(UF_NOME[uf])} · ${fim ? '100% das seções apuradas' : `${fNum(pst, 2)}% das seções apuradas (parcial)`}${hora ? ` · TSE ${esc(hora)}` : ''}</p>${linhas}
    <p class="gv-f">${frase}Votos válidos: ${fInt(g.vv)} · Abstenção: ${fNum(g.te ? 100 * g.a / g.te : 0, 2)}% · Brancos e nulos: ${fNum(g.c ? 100 * (g.vb + g.tvn) / g.c : 0, 2)}%. Resultado do governador, separado da disputa presidencial.</p></section>`;
}

// 2º turno: cartões com os estados que tiveram disputa (página do Brasil, apuração)
export function govResumo(snap) {
  const ent = Object.entries(snap.gov?.uf || {}).filter(([, g]) => g.cand?.length >= 2).sort((a, b) => ESTADOS_ORD(a[0], b[0])); if (!ent.length) return '';
  const todos = ent.every(([, g]) => decidido(g) && govPst(g) >= 99.995);
  const cards = ent.map(([u, g]) => { const [a, b] = g.cand;
    return `<a class="gv-card" href="#/uf/${u}"><span class="gv-uf">${esc(UF_NOME[u])}</span><b>${esc(nomeP(a.nm))}</b><small>${esc(a.sg)} · ${fNum(a.p, 2)}%${eleitoC(a) ? ' · eleito(a)' : ''}</small><span class="gv-vs">× ${esc(nomeP(b.nm))} (${esc(b.sg)}) ${fNum(b.p, 2)}%</span></a>`; }).join('');
  return `<section class="painel gov-res"><h2>${todos ? 'Governadores eleitos no 2º turno' : 'Governadores · 2º turno'}</h2><p class="sub">${ent.length} estados tiveram segundo turno para governador. Clique no estado para ver o resultado completo.</p><div class="gv-grid">${cards}</div></section>`;
}

// 1º turno (aba "1º turno" do Brasil): tabela dos 26 estados + DF com os dois mais votados e a situação da disputa
export function govTabelaHtml(G, snap) {
  if (!G?.uf || !Object.keys(G.uf).length) return '';
  const n1 = Object.values(G.uf).filter(decidido).length, n2 = Object.keys(G.uf).length - n1;
  return `<section class="painel gov-t1"><h2>Governadores · 1º turno</h2><p class="sub">${n1} ${n1 === 1 ? 'governador eleito' : 'governadores eleitos'} no 1º turno e ${n2} ${n2 === 1 ? 'disputa que foi' : 'disputas que foram'} ao 2º turno${snap?.gov?.uf && Object.keys(snap.gov.uf).length ? ` (resultado na aba Apuração)` : ''}. Clique em um estado para ver todos os candidatos.</p><div id="tab-gov"></div></section>`;
}
export function govTabelaMontar(el, G, snap, tabela, ir) {
  if (!el || !G?.uf) return;
  const rows = Object.entries(G.uf).map(([u, g]) => { const [a, b] = g.cand, f2 = snap?.gov?.uf?.[u];
    return { id: u, nome: UF_NOME[u], a, b, g, sit: decidido(g) ? 'Eleito no 1º turno' : (f2 && decidido(f2) ? 'Eleito no 2º turno' : 'Foi ao 2º turno'), dec: decidido(g) ? 1 : 0 }; });
  const cel = c => c ? `<b>${esc(nomeP(c.nm))}</b> <small>${esc(c.sg)}</small><small class="vt">${fNum(c.p, 2)}% · ${fInt(c.v)} votos</small>` : '';
  const cols = [
    { k: 'nome', t: 'Estado', h: x => `<b>${esc(x.nome)}</b>`, v: x => x.nome, ini: 'asc' },
    { k: 'a', t: 'Mais votado', h: x => cel(x.a), v: x => x.a.p, x: x => x.a.nm, cls: '' },
    { k: 'pa', t: '%', h: x => `<b>${fNum(x.a.p, 2)}%</b>`, v: x => x.a.p, cls: 'n sec' },
    { k: 'b', t: '2º colocado', h: x => cel(x.b), v: x => x.b.p, x: x => x.b.nm, cls: 'sec' },
    { k: 'pb', t: '%', h: x => `${fNum(x.b.p, 2)}%`, v: x => x.b.p, cls: 'n sec' },
    { k: 'sit', t: 'Situação', h: x => x.dec ? '<span class="gv-sel">Eleito no 1º turno</span>' : `<span class="gv-sel gv-2t">${esc(x.sit)}</span>`, v: x => x.dec, x: x => x.sit },
  ];
  tabela(el, { cols, rows, onRow: x => ir(`#/t1/uf/${x.id}`), sort: 'nome', dir: 'asc' });
}
