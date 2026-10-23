// Avisos do navegador (notificações do sistema) para viradas e marcos da apuração. Só funcionam com a página aberta (pode estar em segundo plano).
const KEY = 'op_avisos';
const ler = () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } };
const gravar = v => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* sem armazenamento */ } };
export const suportaAvisos = () => typeof Notification !== 'undefined';
export const avisosLigados = () => ler() && suportaAvisos() && Notification.permission === 'granted';

export function rotuloAvisos() { return avisosLigados() ? '🔔 Avisos ligados' : '🔕 Ativar avisos'; }

// alterna; devolve mensagem para o usuário
export async function alternarAvisos() {
  if (!suportaAvisos()) return 'Este navegador não permite notificações.';
  if (avisosLigados()) { gravar(false); return 'Avisos desligados.'; }
  let p = Notification.permission;
  if (p === 'default') { try { p = await Notification.requestPermission(); } catch { p = 'denied'; } }
  if (p !== 'granted') { gravar(false); return 'O navegador bloqueou as notificações. Libere nas permissões do site para receber avisos.'; }
  gravar(true); notificar('Avisos ligados', 'Você será avisado de viradas e marcos da apuração enquanto esta página estiver aberta.', 'op-teste');
  return 'Avisos ligados.';
}

export function notificar(titulo, corpo, tag = 'op') {
  if (!avisosLigados()) return;
  try { new Notification(titulo, { body: corpo, tag, icon: 'img/favicon.png', badge: 'img/favicon.png' }); } catch { /* alguns navegadores móveis exigem service worker */ }
}

// eventos entre duas parciais consecutivas: virada de liderança, marcos de % apurado, candidato confirmado
export function eventosEntre(antes, depois, nomes) {
  const out = [], a = antes.br, b = depois.br;
  const la = a.L > a.F ? 'L' : a.F > a.L ? 'F' : null, lb = b.L > b.F ? 'L' : b.F > b.L ? 'F' : null;
  if (la && lb && la !== lb) out.push({ tag: 'virada', titulo: `Virada: ${nomes[lb]} passa à frente`, corpo: `Diferença de ${Math.abs(b.L - b.F).toLocaleString('pt-BR')} votos.` });
  const pa = 100 * a.st / a.ts, pb = 100 * b.st / b.ts;
  for (const m of [25, 50, 75, 90, 99, 100]) if (pa < m && pb >= m) out.push({ tag: 'marco' + m, titulo: m === 100 ? 'Apuração concluída' : `${m}% das seções apuradas`, corpo: lb ? `${nomes[lb]} lidera por ${Math.abs(b.L - b.F).toLocaleString('pt-BR')} votos.` : 'Empate técnico.' });
  for (const k of ['L', 'F']) if (!a['e' + k] && b['e' + k]) out.push({ tag: 'eleito' + k, titulo: `${nomes[k]} eleito`, corpo: 'Confirmado pelo TSE.' });
  return out;
}
