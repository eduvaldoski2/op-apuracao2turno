// Exportações: CSV (UTF-8 com BOM, separador ";"), PNG e PDF (geração direta, sem diálogo de impressão).
import { carregaScript, cardCanvas, FORMATOS } from './card.js?v=b43e71fe';
export const baixar = (blob, nome) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };

export function slug(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
const celula = v => { if (v == null || (typeof v === 'number' && isNaN(v))) return ''; if (typeof v === 'number') return String(Math.round(v * 1e4) / 1e4).replace('.', ','); const s = String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

export function baixarCSV(nome, cabecalho, linhas, rodape = []) {
  const txt = [cabecalho, ...linhas].map(l => l.map(celula).join(';')).concat(rodape.map(r => celula(r))).join('\r\n');
  baixar(new Blob(['\uFEFF' + txt], { type: 'text/csv;charset=utf-8' }), nome + '.csv');
}

async function capturar(el, titulo, sub, cadeia = '', omitir = '') {
  await carregaScript('vendor/html2canvas.min.js');
  return window.html2canvas(el, {
    scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: Math.max(1100, el.scrollWidth),
    onclone: doc => {
      doc.querySelectorAll('.sem-export').forEach(n => n.remove());
      doc.querySelectorAll('.mapa-tip,.g-tip').forEach(n => n.remove());
      doc.querySelectorAll('.tela-topo').forEach(n => n.remove());
      if (omitir) doc.querySelectorAll(omitir).forEach(n => n.remove());
      doc.querySelectorAll('details').forEach(d => { d.open = true; });
      const alvo = doc.querySelector('[data-export-raiz]') || doc.body;
      const cab = doc.createElement('div');
      cab.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:20px;padding:20px 24px;margin-bottom:6px;background:linear-gradient(100deg,#2A2260,#3E347E);color:#fff;border-radius:12px;font-family:system-ui,sans-serif';
      cab.innerHTML = `<img src="img/logo-negativo.svg" alt="Oficina Política" style="height:54px;width:auto"><div style="text-align:right;font-size:13px;opacity:.92;line-height:1.4">${sub}</div>`;
      const tit = doc.createElement('div');
      tit.style.cssText = 'padding:14px 6px 12px;margin-bottom:6px';
      tit.innerHTML = `<div style="font:400 44px/1.1 'DM Serif Display',Georgia,serif;color:#3E347E">${titulo}</div>${cadeia ? `<div style="margin-top:8px;font:500 15px/1.35 'Space Grotesk',system-ui,sans-serif;color:#5d5675">${cadeia}</div>` : ''}`;
      alvo.insertBefore(tit, alvo.firstChild); alvo.insertBefore(cab, alvo.firstChild);
      const rod = doc.createElement('div');
      rod.style.cssText = 'display:flex;flex-direction:column;align-items:center;gap:10px;padding:26px 18px 18px;margin-top:22px;border-top:2px solid #e4dfee;font-family:system-ui,sans-serif;color:#6f6888;font-size:11.5px;line-height:1.45;text-align:center';
      rod.innerHTML = `<div style="display:flex;align-items:center;gap:14px"><img src="img/icone.svg" alt="" style="width:60px;height:60px"><div style="font-weight:700;font-size:28px;color:#3E347E">oficinapolitica.com.br</div></div><div style="max-width:900px">Fonte: TSE — Divulgação de Resultados. Iniciativa independente da Oficina Política, sem vínculo com o TSE; o resultado oficial é o do TSE.</div>`;
      alvo.appendChild(rod);
    },
  });
}
// PNG da tela inteira (inclui mapas e tabelas) — alternativa ao card
export async function baixarPNGTela(el, nome, titulo, sub, cadeia) {
  const c = await capturar(el, titulo, sub, cadeia);
  await new Promise(ok => c.toBlob(b => { baixar(b, nome + '.png'); ok(); }, 'image/png'));
}
// PNG do card (peça de redes: margens, proporção fixa, hierarquia entre candidatos)
export const blobCard = async (dados, fmt = FORMATOS['3x5'], escala = 1) => { const c = await cardCanvas(dados, fmt, escala); return new Promise(ok => c.toBlob(ok, 'image/png')); };
export async function baixarCardPNG(dados, nome, fmt = FORMATOS['4x5']) { baixar(await blobCard(dados, fmt, 1), `${nome}_${fmt.rot.replace(':', 'x')}.png`); }

// PDF: página 1 = card (A4) com a hierarquia de candidatos; páginas seguintes = mapas e tabelas da tela.
export async function baixarPDF(el, nome, titulo, sub, cadeia, dadosCard = null, extra = null) {
  await carregaScript('vendor/jspdf.umd.min.js');
  const { jsPDF } = window.jspdf, pdf = new jsPDF('p', 'mm', 'a4');
  const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 8;
  let pag = 0;
  if (dadosCard) {
    const cv = await cardCanvas(dadosCard, FORMATOS.a4, 1.5);
    pdf.addImage(cv.toDataURL('image/jpeg', 0.93), 'JPEG', 0, 0, pw, ph); pag = 1;
    if (!el.querySelector('#vista .painel')) { pdf.save(nome + '.pdf'); return; }
  }
  const rodape = n => { pdf.setFontSize(7); pdf.setTextColor(120); pdf.text(`oficinapolitica.com.br · ${sub} · pág. ${n}`, m, ph - 4); };
  const c = await capturar(el, titulo, sub, cadeia, dadosCard ? '.resumo,.fichas,.kpis,.placar,.foco-aviso,.nota-base,.comp-toggle,.aviso.t1' : '');
  const larg = pw - 2 * m, escala = larg / c.width, altPag = (ph - 2 * m - 6) / escala;
  let y = 0;
  while (y < c.height - 1) {
    const h = Math.min(altPag, c.height - y), pc = document.createElement('canvas'); pc.width = c.width; pc.height = Math.ceil(h);
    pc.getContext('2d').drawImage(c, 0, y, c.width, h, 0, 0, c.width, h);
    if (pag) pdf.addPage();
    pdf.addImage(pc.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, larg, h * escala);
    rodape(pag + 1);
    y += h; pag++;
  }
  // páginas extras (ex.: seções de cada local de votação): blocos agrupados por página, sem cortar um local ao meio quando possível
  if (extra?.blocos?.length) {
    await carregaScript('vendor/html2canvas.min.js');
    const LARG = 1100, altCss = ((ph - 2 * m - 6) / larg) * LARG - 30;
    const caixa = document.createElement('div'); caixa.style.cssText = `position:fixed;left:-99999px;top:0;width:${LARG}px;background:#fff;padding:12px 18px`; document.body.appendChild(caixa);
    try {
      const grupos = []; let atual = [], alt = 0;
      const tit = `<div style="font:400 26px 'DM Serif Display',Georgia,serif;color:#3E347E;margin:0 0 12px">${extra.titulo}</div>`;
      caixa.innerHTML = tit; const hTit = caixa.offsetHeight - 24; let primeiro = true;
      for (const bl of extra.blocos) {
        caixa.innerHTML = bl; const h = caixa.offsetHeight - 24 + 18;
        if (atual.length && alt + h > altCss) { grupos.push(atual); atual = []; alt = 0; }
        atual.push(bl); alt += h + (primeiro ? hTit : 0); primeiro = false;
      }
      if (atual.length) grupos.push(atual);
      for (let g = 0; g < grupos.length; g++) {
        caixa.innerHTML = (g === 0 ? tit : '') + grupos[g].join('');
        const c2 = await window.html2canvas(caixa, { scale: 1.6, backgroundColor: '#ffffff', logging: false, useCORS: true, windowWidth: LARG + 40 });
        const e2 = larg / c2.width, altP = (ph - 2 * m - 6) / e2; let y2 = 0;
        while (y2 < c2.height - 1) {
          const h2 = Math.min(altP, c2.height - y2), pc2 = document.createElement('canvas'); pc2.width = c2.width; pc2.height = Math.ceil(h2);
          pc2.getContext('2d').drawImage(c2, 0, y2, c2.width, h2, 0, 0, c2.width, h2);
          if (pag) pdf.addPage(); pdf.addImage(pc2.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, larg, h2 * e2); rodape(pag + 1); y2 += h2; pag++;
        }
      }
    } finally { caixa.remove(); }
  }
  pdf.save(nome + '.pdf');
}

// ---- XLSX (Excel/Sheets/Numbers abrem sem problema de acento ou de vírgula decimal) ----
const crcT = (() => { const t = []; for (let n = 0; n < 256; n++) { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; t[n] = c >>> 0; } return t; })();
const crc32 = b => { let c = 0xFFFFFFFF; for (let i = 0; i < b.length; i++) c = crcT[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ 0xFFFFFFFF) >>> 0; };
function zip(arquivos) {   // sem compressão (método 0)
  const enc = new TextEncoder(), partes = [], central = []; let off = 0;
  const u16 = v => [v & 255, v >> 8 & 255], u32 = v => [v & 255, v >> 8 & 255, v >> 16 & 255, v >>> 24 & 255];
  for (const [nome, txt] of arquivos) {
    const n = enc.encode(nome), d = enc.encode(txt), c = crc32(d);
    const loc = new Uint8Array([0x50, 0x4b, 3, 4, ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0)]);
    partes.push(loc, n, d);
    central.push(new Uint8Array([0x50, 0x4b, 1, 2, ...u16(20), ...u16(20), ...u16(0x0800), ...u16(0), ...u16(0), ...u16(0x21), ...u32(c), ...u32(d.length), ...u32(d.length), ...u16(n.length), ...u16(0), ...u16(0), ...u16(0), ...u16(0), ...u32(0), ...u32(off)]), n);
    off += loc.length + n.length + d.length;
  }
  const tam = central.reduce((t, x) => t + x.length, 0);
  const fim = new Uint8Array([0x50, 0x4b, 5, 6, ...u16(0), ...u16(0), ...u16(arquivos.length), ...u16(arquivos.length), ...u32(tam), ...u32(off), ...u16(0)]);
  return new Blob([...partes, ...central, fim], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
}
const xe = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])).replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/g, '');
const col = i => { let s = ''; for (i++; i > 0; i = Math.floor((i - 1) / 26)) s = String.fromCharCode(65 + (i - 1) % 26) + s; return s; };
export function baixarXLSX(nome, cabecalho, linhas, rodape = []) {
  const cel = (v, r, c, st) => { const ref = col(c) + (r + 1); if (v == null || (typeof v === 'number' && !isFinite(v))) return ''; return typeof v === 'number' ? `<c r="${ref}"${st ? ` s="${st}"` : ''}><v>${v}</v></c>` : `<c r="${ref}" t="inlineStr"${st ? ` s="${st}"` : ''}><is><t xml:space="preserve">${xe(v)}</t></is></c>`; };
  const todas = [cabecalho, ...linhas, ...(rodape.length ? [[''], ...rodape.map(x => [x])] : [])];
  const rows = todas.map((l, r) => `<row r="${r + 1}">${l.map((v, c) => cel(v, r, c, r === 0 ? 1 : 0)).join('')}</row>`).join('');
  const larg = cabecalho.map((h, i) => Math.min(48, Math.max(10, String(h).length + 2, ...linhas.slice(0, 200).map(l => String(l[i] ?? '').length + 2))));
  const cols = larg.map((w, i) => `<col min="${i + 1}" max="${i + 1}" width="${w}" customWidth="1"/>`).join('');
  const sheet = `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><sheetViews><sheetView workbookViewId="0"><pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/></sheetView></sheetViews><cols>${cols}</cols><sheetData>${rows}</sheetData></worksheet>`;
  const arq = [
    ['[Content_Types].xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/><Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/><Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/></Types>'],
    ['_rels/.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/></Relationships>'],
    ['xl/workbook.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><sheets><sheet name="Dados" sheetId="1" r:id="rId1"/></sheets></workbook>'],
    ['xl/_rels/workbook.xml.rels', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/><Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/></Relationships>'],
    ['xl/styles.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"><fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><color rgb="FFFFFFFF"/><name val="Calibri"/></font></fonts><fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill><fill><patternFill patternType="solid"><fgColor rgb="FF3E347E"/></patternFill></fill></fills><borders count="1"><border/></borders><cellStyleXfs count="1"><xf/></cellStyleXfs><cellXfs count="2"><xf/><xf fontId="1" fillId="2" applyFont="1" applyFill="1"/></cellXfs></styleSheet>'],
    ['xl/worksheets/sheet1.xml', sheet],
  ];
  baixar(zip(arq), nome + '.xlsx');
}
