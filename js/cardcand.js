// Imagem para redes da página do candidato (1:1, 4:5, 9:16): nome, partido, cargo, situação e os 4 indicadores da tela.
import { FORMATOS, criaQR, desenhaQR } from './card.js?v=59429884';

const AZUL = '#3E347E', LARANJA = '#F28C28', TEXTO = '#2A2350', SUAVE = '#6B6491';
const FONTE = 'system-ui, -apple-system, "Segoe UI", Arial, sans-serif';
const SERIF = 'Georgia, "Times New Roman", serif';

// quebra o texto em linhas que cabem em maxW; devolve as linhas (no máximo max linhas, com reticências)
function quebra(g, t, maxW, max = 3) {
  const pal = String(t).split(/\s+/), linhas = []; let atual = '';
  for (const p of pal) {
    const teste = atual ? atual + ' ' + p : p;
    if (g.measureText(teste).width <= maxW || !atual) atual = teste; else { linhas.push(atual); atual = p; }
  }
  if (atual) linhas.push(atual);
  if (linhas.length > max) { const corta = linhas.slice(0, max); corta[max - 1] = corta[max - 1].replace(/\s*\S*$/, '') + '…'; return corta; }
  return linhas;
}

export async function cardCandidato(d, fmt) {
  const W = fmt.w, H = fmt.h, pad = 72;
  const c = document.createElement('canvas'); c.width = W; c.height = H;
  const g = c.getContext('2d');
  g.fillStyle = '#F6F4FA'; g.fillRect(0, 0, W, H);

  // cabeçalho roxo
  const band = Math.round(H * 0.4);
  g.fillStyle = AZUL; g.fillRect(0, 0, W, band);
  g.fillStyle = LARANJA; g.fillRect(0, band, W, 14);
  g.font = `italic 700 58px ${SERIF}`; g.fillStyle = '#fff'; g.fillText('Oficina', pad, pad + 40);
  const w1 = g.measureText('Oficina ').width; g.fillStyle = LARANJA; g.fillText('política', pad + w1, pad + 40);
  g.font = `600 26px ${FONTE}`; g.fillStyle = '#D9D4F0'; g.fillText('PAINEL ELEIÇÕES · APURAÇÃO 2026 · TSE', pad, pad + 84);

  // nome do candidato (até 3 linhas)
  const nomeTop = Math.max(pad + 150, band - 300), lh = 84;
  g.font = `700 80px ${SERIF}`; g.fillStyle = '#fff';
  const nomeL = quebra(g, d.nome, W - 2 * pad, 3);
  nomeL.forEach((l, i) => g.fillText(l, pad, nomeTop + i * lh + 70));
  let y = nomeTop + nomeL.length * lh + 52;
  g.font = `600 34px ${FONTE}`; g.fillStyle = '#E9E5F7';
  const sub = `${d.sigla} · nº ${d.num} · ${d.cargo} · ${d.uf}`;
  quebra(g, sub, W - 2 * pad, 2).forEach((l, i) => g.fillText(l, pad, y + i * 44));
  // situação (selo)
  if (d.sit) {
    const yS = y + 2 * 44 + 6; g.font = `700 28px ${FONTE}`;
    const tw = g.measureText(d.sit).width + 40;
    g.fillStyle = LARANJA; g.beginPath(); g.roundRect ? g.roundRect(pad, yS - 34, tw, 50, 25) : g.rect(pad, yS - 34, tw, 50); g.fill();
    g.fillStyle = '#fff'; g.fillText(d.sit, pad + 20, yS + 2);
  }

  // indicadores 2 × 2
  const rodape = 230, gap = 28, top = band + 70;
  const tileH = Math.min(320, Math.floor((H - top - rodape - gap) / 2));
  const tileW = (W - 2 * pad - gap) / 2;
  d.kpis.forEach(([rot, val, sb], i) => {
    const x = pad + (i % 2) * (tileW + gap), yy = top + Math.floor(i / 2) * (tileH + gap);
    g.fillStyle = '#fff'; g.beginPath(); g.roundRect ? g.roundRect(x, yy, tileW, tileH, 28) : g.rect(x, yy, tileW, tileH); g.fill();
    g.fillStyle = d.cor || AZUL; g.fillRect(x + 36, yy + 34, 56, 6);
    g.font = `700 24px ${FONTE}`; g.fillStyle = SUAVE;
    quebra(g, rot.toUpperCase(), tileW - 72, 2).forEach((l, k) => g.fillText(l, x + 36, yy + 76 + k * 30));
    const yv = yy + tileH - 100;
    g.font = `800 ${tileH > 260 ? 96 : 80}px ${FONTE}`; g.fillStyle = TEXTO; g.fillText(val, x + 36, yv + 40);
    g.font = `500 26px ${FONTE}`; g.fillStyle = SUAVE;
    quebra(g, sb, tileW - 72, 2).forEach((l, k) => g.fillText(l, x + 36, yv + 84 + k * 32));
  });

  // rodapé: convite e link, QR
  const yF = H - rodape + 40, qr = 150;
  g.font = `700 32px ${FONTE}`; g.fillStyle = TEXTO;
  g.fillText('Veja a votação por região e município', pad, yF + 40);
  g.font = `500 26px ${FONTE}`; g.fillStyle = AZUL;
  g.fillText('oficinapolitica.com.br/painel', pad, yF + 84);
  g.fillStyle = SUAVE; g.font = `500 22px ${FONTE}`;
  g.fillText('Fonte: TSE · Oficina Política', pad, yF + 124);
  const q = await criaQR(d.url);
  desenhaQR(g, q, W - pad - qr, yF, qr);
  return c;
}

const slug = s => String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// compartilha a imagem pelo menu do aparelho quando houver; senão baixa o PNG
export async function compartilharCandidato(d, fmtId, botao) {
  const fmt = FORMATOS[fmtId], txt = botao?.textContent;
  if (botao) { botao.disabled = true; botao.textContent = 'Gerando…'; }
  try {
    const canvas = await cardCandidato(d, fmt);
    const blob = await new Promise(r => canvas.toBlob(r, 'image/png'));
    const nome = `candidatura_${slug(d.nome)}_${fmtId}.png`, arq = new File([blob], nome, { type: 'image/png' });
    if (navigator.canShare && navigator.canShare({ files: [arq] })) {
      try { await navigator.share({ files: [arq], title: d.nome, text: `${d.nome} · ${d.sigla} nº ${d.num} · Oficina Política` }); return; }
      catch (e) { if (e.name === 'AbortError') return; }
    }
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome;
    document.body.appendChild(a); a.click(); a.remove(); setTimeout(() => URL.revokeObjectURL(a.href), 4000);
  } finally { if (botao) { botao.disabled = false; botao.textContent = txt; } }
}
