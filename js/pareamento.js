// Pareamento por código: qualquer TV com navegador abre tv.html, mostra um código de 4 dígitos, e o celular/computador digita o código.
// A partir daí a TV acompanha a tela escolhida no celular. Conexão direta entre os aparelhos (WebRTC, via PeerJS); só a "apresentação" passa pelo servidor público de sinalização.
import { carregaScript } from './card.js?v=a5e0d9ed';
import { CONFIG } from './config.js?v=a5e0d9ed';
import { evento } from './metricas.js?v=a5e0d9ed';

const PREF = 'opapur-', CHAVES = ['demo', 'fonte', 'tse'];
const opcoes = () => {
  const pe = new URLSearchParams(location.search).get('peer');   // ?peer=host:porta (teste / servidor próprio sem TLS em localhost)
  if (pe) { const [host, port] = pe.split(':'); return { debug: 0, host, port: +port || 9000, path: '/', secure: false }; }
  return { debug: 0, ...(CONFIG.pareamento || {}) };
};
const buscaUtil = () => { const q = new URLSearchParams(location.search), o = new URLSearchParams(); CHAVES.forEach(k => q.has(k) && o.set(k, q.get(k))); return o.toString(); };
const sorteio = () => String(Math.floor(1000 + Math.random() * 9000));

// ---------- TV (receptor) ----------
export async function iniciarReceptor() {
  const q = new URLSearchParams(location.search), par = q.get('par'); if (!par) return;
  let fixo = /^\d{4}$/.test(par) ? par : null, peer = null, codigo = null, conectado = false;
  const el = document.createElement('div'); el.className = 'tv-par'; document.body.appendChild(el);
  const mostra = (cls, html) => { el.className = 'tv-par ' + cls; el.innerHTML = html; };
  const aplica = m => {
    if (!m || m.t !== 'rota') return;
    const atual = buscaUtil(), pedida = new URLSearchParams(m.s || '').toString();
    if (atual !== pedida) { const u = new URLSearchParams(pedida); u.set('tv', '1'); u.set('par', codigo); if (q.get('peer')) u.set('peer', q.get('peer')); location.href = `${location.pathname}?${u}${m.h || '#/'}`; return; }
    if (location.hash !== m.h) location.hash = m.h || '#/';
    scrollTo(0, 0);
  };
  async function abrir() {
    try { await carregaScript('vendor/peerjs.min.js'); } catch { mostra('erro', 'Não foi possível carregar o pareamento.'); return; }
    codigo = fixo || sorteio();
    peer = new window.peerjs.Peer(PREF + codigo, opcoes());
    peer.on('open', () => mostra('espera', `<small>Para controlar esta TV, abra o painel no celular → Transmitir para a TV → Parear, e digite o código</small><b>${codigo}</b>`));
    peer.on('connection', c => {
      c.on('open', () => { conectado = true; mostra('ok', '● TV conectada'); setTimeout(() => el.classList.add('sai'), 4000); });
      c.on('data', aplica);
      c.on('close', () => { conectado = false; mostra('espera', `<small>Conexão encerrada. Para reconectar, digite o código no celular</small><b>${codigo}</b>`); });
    });
    peer.on('disconnected', () => { try { peer.reconnect(); } catch {} });
    peer.on('error', e => {
      if (e.type === 'unavailable-id') { peer.destroy(); if (!fixo) return abrir(); return setTimeout(abrir, 3000); }
      mostra('erro', 'Sem conexão com o serviço de pareamento. Tentando de novo…'); setTimeout(() => { try { peer.destroy(); } catch {} abrir(); }, 5000);
    });
  }
  addEventListener('keydown', () => { if (conectado) { el.classList.remove('sai'); setTimeout(() => el.classList.add('sai'), 3000); } });
  mostra('espera', '<small>Preparando o pareamento…</small>'); abrir();
}

// ---------- celular / computador (emissor) ----------
let ativo = null;
export const pareado = () => ativo ? { codigo: ativo.codigo, estado: ativo.estado } : null;
export function parear(codigo, aoMudar) {
  if (ativo) desparear();
  const a = ativo = { codigo, estado: 'conectando', fechado: false, conn: null, peer: null };
  const set = (e, extra) => { a.estado = e; chip(); aoMudar?.(e, extra); };
  const enviar = () => { try { a.conn?.open && a.conn.send({ t: 'rota', h: location.hash || '#/', s: buscaUtil() }); } catch {} };
  const dica = () => { if (a.fechado) return; clearTimeout(a.rt); a.rt = setTimeout(conectar, 2500); };
  function conectar() {
    if (a.fechado) return;
    a.conn = a.peer.connect(PREF + codigo, { reliable: true });
    a.conn.on('open', () => { set('conectado'); enviar(); evento('tv', { acao: 'parear_ok' }); });
    a.conn.on('close', () => { if (!a.fechado) { set('reconectando'); dica(); } });
    a.conn.on('error', () => dica());
  }
  const rota = () => enviar();
  carregaScript('vendor/peerjs.min.js').then(() => {
    if (a.fechado) return;
    a.peer = new window.peerjs.Peer(undefined, opcoes());
    a.peer.on('open', conectar);
    a.peer.on('error', e => {
      if (a.fechado) return;
      if (e.type === 'peer-unavailable') { if (a.estado === 'conectando') { set('erro', 'Código não encontrado. Confira o número na tela da TV.'); desparear(); } else dica(); }
      else { set('reconectando', 'Sem conexão com o serviço de pareamento.'); dica(); }
    });
  }).catch(() => { set('erro', 'Não foi possível carregar o pareamento.'); desparear(); });
  addEventListener('hashchange', rota); a.rota = rota;
  set('conectando'); return a;
}
export function desparear() {
  const a = ativo; if (!a) return; a.fechado = true; clearTimeout(a.rt);
  removeEventListener('hashchange', a.rota); try { a.conn?.close(); a.peer?.destroy(); } catch {}
  ativo = null; chip();
}
function chip() {
  let c = document.querySelector('.tv-chip');
  if (!ativo || ativo.estado === 'erro') { c?.remove(); return; }
  if (!c) { c = document.createElement('button'); c.className = 'tv-chip'; c.title = 'Desconectar da TV'; c.onclick = () => { desparear(); }; document.body.appendChild(c); }
  c.textContent = `📺 ${ativo.estado === 'conectado' ? 'TV conectada' : 'Conectando à TV…'} · ${ativo.codigo}  ✕`;
}
