// Exportações: CSV (UTF-8 com BOM, separador ";"), PNG e PDF (geração direta, sem diálogo de impressão).
const carregaScript = src => new Promise((ok, err) => { if (document.querySelector(`script[data-v="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.dataset.v = src; s.onload = ok; s.onerror = () => err(new Error('falha ao carregar ' + src)); document.head.appendChild(s); });
const baixar = (blob, nome) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };

export function slug(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
const celula = v => { if (v == null || (typeof v === 'number' && isNaN(v))) return ''; if (typeof v === 'number') return String(Math.round(v * 1e4) / 1e4).replace('.', ','); const s = String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

export function baixarCSV(nome, cabecalho, linhas, rodape = []) {
  const txt = [cabecalho, ...linhas].map(l => l.map(celula).join(';')).concat(rodape.map(r => celula(r))).join('\r\n');
  baixar(new Blob(['﻿' + txt], { type: 'text/csv;charset=utf-8' }), nome + '.csv');
}

async function capturar(el, titulo, sub) {
  await carregaScript('vendor/html2canvas.min.js');
  return window.html2canvas(el, {
    scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: Math.max(1100, el.scrollWidth),
    onclone: doc => {
      doc.querySelectorAll('.sem-export').forEach(n => n.remove());
      doc.querySelectorAll('.mapa-tip,.g-tip').forEach(n => n.remove());
      const alvo = doc.querySelector('[data-export-raiz]') || doc.body;
      const cab = doc.createElement('div');
      cab.style.cssText = 'display:flex;justify-content:space-between;align-items:center;padding:14px 18px;margin-bottom:14px;background:#2d1450;color:#fff;border-radius:10px;font-family:system-ui,sans-serif';
      cab.innerHTML = `<div><div style="font-weight:800;font-size:20px;letter-spacing:.2px">Oficina <span style="color:#f7a84a">Política</span></div><div style="font-size:12px;opacity:.85">Para quem faz política sem improviso</div></div><div style="text-align:right"><div style="font-weight:700;font-size:15px">${titulo}</div><div style="font-size:12px;opacity:.9">${sub}</div></div>`;
      alvo.insertBefore(cab, alvo.firstChild);
    },
  });
}
export async function baixarPNG(el, nome, titulo, sub) {
  const c = await capturar(el, titulo, sub);
  await new Promise(ok => c.toBlob(b => { baixar(b, nome + '.png'); ok(); }, 'image/png'));
}
export async function baixarPDF(el, nome, titulo, sub) {
  const c = await capturar(el, titulo, sub);
  await carregaScript('vendor/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf, pdf = new jsPDF('p', 'mm', 'a4');
  const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 8;
  const larg = pw - 2 * m, escala = larg / c.width, altPag = (ph - 2 * m - 6) / escala;
  let y = 0, pag = 0;
  while (y < c.height - 1) {
    const h = Math.min(altPag, c.height - y), pc = document.createElement('canvas'); pc.width = c.width; pc.height = Math.ceil(h);
    pc.getContext('2d').drawImage(c, 0, y, c.width, h, 0, 0, c.width, h);
    if (pag) pdf.addPage();
    pdf.addImage(pc.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, larg, h * escala);
    pdf.setFontSize(7); pdf.setTextColor(120); pdf.text(`Oficina Política · ${sub} · pág. ${pag + 1}`, m, ph - 4);
    y += h; pag++;
  }
  pdf.save(nome + '.pdf');
}
