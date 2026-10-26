// Tela cheia de "eleito": aparece quando o TSE confirma o vencedor do 2º turno (campo "Eleito" do candidato nos dados do TSE).
// Cada visitante vê uma vez (guarda no navegador); "?teste-eleito=L" ou "=F" mostra uma prévia sem gravar nada.
import { CAND, fNum, fInt } from './util.js?v=f0623a7c';

const KEY = 'op_eleito_visto';
const lido = () => { try { return localStorage.getItem(KEY) || ''; } catch { return ''; } };
const gravar = v => { try { localStorage.setItem(KEY, v); } catch { /* sem armazenamento */ } };
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export function mostrarEleito(snap, { simulado = false } = {}) {
  let k = null, previa = false;
  try { const t = new URLSearchParams(location.search).get('teste-eleito'); if (t === 'L' || t === 'F') { k = t; previa = true; } } catch { /* sem URLSearchParams */ }
  if (!k && snap?.br) k = snap.br.eL ? 'L' : snap.br.eF ? 'F' : null;
  if (!k || document.getElementById('eleito-tela')) return;
  if (!previa && lido() === k + (simulado ? 's' : '')) return;
  const c = CAND[k], b = snap?.br || {}, vv = b.vv || 0, v = k === 'L' ? b.L : b.F, p = vv ? 100 * v / vv : NaN;
  const hora = snap?.hg ? String(snap.hg).slice(0, 5) : '';
  const el = document.createElement('div');
  el.id = 'eleito-tela'; el.setAttribute('role', 'dialog'); el.setAttribute('aria-modal', 'true'); el.setAttribute('aria-label', `${c.nome} eleito`);
  el.style.setProperty('--ec', c.cor);
  el.innerHTML = `<div class="el-in">
    ${simulado || previa ? `<div class="el-sim">${previa ? 'PRÉVIA — o TSE ainda não confirmou' : 'DADOS SIMULADOS'}</div>` : ''}
    <div class="el-kick">O TSE confirmou</div>
    <div class="el-eleito">ELEITO</div>
    <div class="el-nome">${esc(c.nomeCompleto)}</div>
    <div class="el-cargo">Presidente da República · ${esc(c.partido)} ${c.n}</div>
    ${isFinite(p) ? `<div class="el-num"><b>${fNum(p, 2)}%</b> dos votos válidos<span>${fInt(v)} votos</span></div>` : ''}
    <div class="el-nota">${hora ? `Confirmação às ${esc(hora)} · ` : ''}2º turno 2026 · Oficina Política</div>
    <button type="button" class="el-bt">Ver a apuração completa</button>
  </div>`;
  const fechar = () => { if (!previa) gravar(k + (simulado ? 's' : '')); el.remove(); document.removeEventListener('keydown', tecla); document.body.style.overflow = ''; };
  const tecla = ev => { if (ev.key === 'Escape') fechar(); };
  el.querySelector('.el-bt').addEventListener('click', fechar);
  document.addEventListener('keydown', tecla);
  document.body.appendChild(el); document.body.style.overflow = 'hidden';
  el.querySelector('.el-bt').focus();
}
