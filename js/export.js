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
      doc.querySelectorAll('details').forEach(d => { d.open = true; });
      const alvo = doc.querySelector('[data-export-raiz]') || doc.body;
      const cab = doc.createElement('div');
      cab.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:20px;padding:18px 22px;margin-bottom:16px;background:linear-gradient(100deg,#2A2260,#3E347E);color:#fff;border-radius:12px;font-family:system-ui,sans-serif';
      cab.innerHTML = `<img src="img/logo-negativo.svg" alt="Oficina Política" style="height:54px;width:auto"><div style="text-align:right"><div style="font-weight:700;font-size:16px">${titulo}</div><div style="font-size:12.5px;opacity:.9;margin-top:3px">${sub}</div></div>`;
      alvo.insertBefore(cab, alvo.firstChild);
      const rod = doc.createElement('div');
      rod.style.cssText = 'display:flex;align-items:center;gap:14px;padding:14px 18px;margin-top:20px;border-top:2px solid #e4dfee;font-family:system-ui,sans-serif;color:#5d5675;font-size:12px;line-height:1.4';
      rod.innerHTML = `<img src="img/icone.svg" alt="" style="width:38px;height:38px"><div><div style="font-weight:700;font-size:16px;color:#3E347E">oficinapolitica.com.br</div><div>Fonte: TSE — Divulgação de Resultados. Iniciativa independente da Oficina Política, sem vínculo com o TSE; o resultado oficial é o do TSE.</div></div>`;
      alvo.appendChild(rod);
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
    pdf.setFontSize(7); pdf.setTextColor(120); pdf.text(`oficinapolitica.com.br · ${sub} · pág. ${pag + 1}`, m, ph - 4);
    y += h; pag++;
  }
  pdf.save(nome + '.pdf');
}
