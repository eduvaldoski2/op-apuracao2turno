// Exportações: CSV (UTF-8 com BOM, separador ";"), PNG e PDF (geração direta, sem diálogo de impressão).
import { carregaScript, cardCanvas, FORMATOS } from './card.js?v=0512f95d';
import { linhas as desenhaLinhas, REG_GRAFICOS } from './charts.js?v=0512f95d';
export const baixar = (blob, nome) => { const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = nome; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500); };

export function slug(s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, ''); }
const celula = v => { if (v == null || (typeof v === 'number' && isNaN(v))) return ''; if (typeof v === 'number') return String(Math.round(v * 1e4) / 1e4).replace('.', ','); const s = String(v); return /[;"\n]/.test(s) ? '"' + s.replace(/"/g, '""') + '"' : s; };

export function baixarCSV(nome, cabecalho, linhas, rodape = []) {
  const txt = [cabecalho, ...linhas].map(l => l.map(celula).join(';')).concat(rodape.map(r => celula(r))).join('\r\n');
  baixar(new Blob(['\uFEFF' + txt], { type: 'text/csv;charset=utf-8' }), nome + '.csv');
}

// ---- Paginação do PDF: corta só entre linhas de tabela e blocos, e repete o cabeçalho da tabela na página seguinte ----
function medeCortes(alvo, esc) {
  const r0 = alvo.getBoundingClientRect().top, yb = n => Math.round((n.getBoundingClientRect().bottom - r0) * esc), set = new Set();
  alvo.querySelectorAll('tbody tr, li, .painel > *, :scope > *').forEach(n => { if (n.getClientRects().length && !n.matches('h1,h2,h3,p.sub,.sub,.nota,.entenda')) set.add(yb(n)); });   // nunca corta logo depois de um título
  const tabelas = [...alvo.querySelectorAll('table')].filter(t => t.tHead && t.getClientRects().length).map(t => { const r = t.getBoundingClientRect(), h = t.tHead.getBoundingClientRect(); return { top: Math.round((h.top - r0) * esc), hb: Math.round((h.bottom - r0) * esc), fim: Math.round((r.bottom - r0) * esc) }; });
  return { cortes: [...set].sort((a, b) => a - b), tabelas };
}
function fatiasPdf(c, altPag) {
  const info = c.info || {}, out = []; let y = 0, cab = null;
  while (y < c.height - 1) {
    const hc = cab ? cab.hb - cab.top : 0, disp = altPag - hc, lim = y + disp; let fim = Math.min(c.height, lim);
    if (lim < c.height && info.cortes?.length) { const cand = info.cortes.filter(p => p > y + disp * 0.5 && p <= lim); if (cand.length) fim = cand[cand.length - 1]; }
    if (fim <= y) fim = Math.min(c.height, y + Math.max(1, Math.floor(disp)));
    out.push({ y0: y, y1: fim, cab });
    y = fim; cab = (info.tabelas || []).find(t => y > t.hb + 4 && y < t.fim - 30) || null;
  }
  return out;
}
function canvasFatia(c, f) {
  const hc = f.cab ? f.cab.hb - f.cab.top : 0, h = f.y1 - f.y0, pc = document.createElement('canvas'); pc.width = c.width; pc.height = Math.ceil(hc + h);
  const g = pc.getContext('2d'); g.fillStyle = '#fff'; g.fillRect(0, 0, pc.width, pc.height);
  if (f.cab) g.drawImage(c, 0, f.cab.top, c.width, hc, 0, 0, c.width, hc);
  g.drawImage(c, 0, f.y0, c.width, h, 0, hc, c.width, h);
  return pc;
}

async function capturar(el, titulo, sub, cadeia = '', omitir = '') {
  await carregaScript('vendor/html2canvas.min.js');
  let info = null;
  const cv = await window.html2canvas(el, {
    scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: Math.max(1100, el.scrollWidth),
    onclone: doc => {
      doc.querySelectorAll('.sem-export').forEach(n => n.remove());
      doc.querySelectorAll('details > summary').forEach(n => n.remove());   // o "Entenda" é dica de tela; o texto fica aberto
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
      info = medeCortes(alvo, 2);
    },
  });
  cv.info = info; return cv;
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
  for (const f of fatiasPdf(c, altPag)) {
    const pc = canvasFatia(c, f);
    if (pag) pdf.addPage();
    pdf.addImage(pc.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, larg, pc.height * escala);
    rodape(pag + 1); pag++;
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

// ---- Exportação de uma seção (painel) da tela: PNG, PDF, CSV e Excel ----
async function capturarSecao(el, sub, topo) {
  await carregaScript('vendor/html2canvas.min.js');
  el.setAttribute('data-exp-alvo', '1');
  try {
    let info = null;
    const cv = await window.html2canvas(el, {
      scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: 1320,
      onclone: doc => {
        const alvo = doc.querySelector('[data-exp-alvo]'); if (!alvo) return;
        // seção de mapa: leva junto a tabela com o resultado de cada bairro (o mapa sozinho só mostra o percentual de quem lidera)
        if (alvo.classList.contains('mapa-sec')) {
          const ps = [...doc.querySelectorAll('.painel')].find(p => p !== alvo && p.querySelector('#tab-b table'));
          if (ps) { const cp = ps.cloneNode(true); cp.removeAttribute('data-exp-alvo'); cp.querySelectorAll('.exp-sec').forEach(n => n.remove()); cp.style.cssText += ';box-shadow:none;margin:22px 0 0;padding:16px 0 0;border-top:2px solid #e4dfee;border-radius:0'; alvo.appendChild(cp); }
        }
        alvo.querySelectorAll('.sem-export').forEach(n => n.remove());
        doc.querySelectorAll('.mapa-tip,.g-tip').forEach(n => n.remove());
        alvo.querySelectorAll('details').forEach(d => { d.open = true; d.querySelector(':scope > summary')?.remove(); });
        alvo.querySelectorAll('.tab-scroll').forEach(n => { n.style.overflow = 'visible'; n.style.maxHeight = 'none'; });
        alvo.querySelectorAll('th,thead,.tab th').forEach(n => { n.style.position = 'static'; n.style.top = 'auto'; });
        alvo.querySelectorAll('table.tab tr > :first-child').forEach(c => { c.style.cssText += ';width:1%;white-space:nowrap;min-width:0'; });
        alvo.style.cssText += ';box-shadow:none;margin:0;padding:18px 20px 14px;width:1240px';
        const cab = doc.createElement('div');
        cab.style.cssText = 'display:flex;justify-content:space-between;align-items:center;gap:20px;padding:14px 18px;margin:-18px -20px 14px;background:linear-gradient(100deg,#2A2260,#3E347E);color:#fff;font-family:system-ui,sans-serif';
        cab.innerHTML = `<img src="img/logo-negativo.svg" alt="Oficina Política" style="height:38px;width:auto"><div style="text-align:right;font-size:12px;opacity:.92;line-height:1.4">${topo ? `<b>${topo}</b><br>` : ''}${sub}</div>`;
        alvo.insertBefore(cab, alvo.firstChild);
        const rod = doc.createElement('div');
        rod.style.cssText = 'margin-top:14px;padding-top:10px;border-top:2px solid #e4dfee;font:11.5px/1.45 system-ui,sans-serif;color:#6f6888;text-align:center';
        rod.innerHTML = '<b style="color:#3E347E;font-size:15px">oficinapolitica.com.br</b><br>Fonte: TSE — Divulgação de Resultados. Iniciativa independente da Oficina Política, sem vínculo com o TSE; o resultado oficial é o do TSE.';
        alvo.appendChild(rod);
        info = medeCortes(alvo, 2);
      },
    });
    cv.info = info; return cv;
  } finally { el.removeAttribute('data-exp-alvo'); }
}

// ---- Imagem da seção nos formatos de redes sociais (1:1, 4:5 e 9:16), com a mesma moldura dos cards ----
export const FORMATOS_SEC = {
  '1x1': { id: '1x1', rot: '1:1', w: 1080, h: 1080, top: 0, bot: 0, t: 52 },
  '4x5': { id: '4x5', rot: '4:5', w: 1080, h: 1350, top: 0, bot: 0, t: 56 },
  '9x16': { id: '9x16', rot: '9:16', w: 1080, h: 1920, top: 120, bot: 120, t: 60 },
};
const carregaImg = src => new Promise((ok, no) => { const i = new Image(); i.onload = () => ok(i); i.onerror = () => no(new Error('imagem ' + src)); i.src = src; });
const quebra = (ctx, txt, larg) => { const pal = String(txt).split(/\s+/).filter(Boolean), lin = []; let at = ''; for (const p of pal) { const t = at ? at + ' ' + p : p; if (ctx.measureText(t).width > larg && at) { lin.push(at); at = p; } else at = t; } if (at) lin.push(at); return lin; };
const retArred = (ctx, x, y, w, h, r) => { ctx.beginPath(); ctx.moveTo(x + r, y); ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r); ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath(); };

// o html2canvas copia o estilo calculado para dentro dos SVG antes do onclone; o que é criado ou mudado aqui precisa levar o estilo junto
const PROPS_SVG = ['font-family', 'font-size', 'font-weight', 'font-style', 'fill', 'stroke', 'stroke-width', 'stroke-dasharray', 'stroke-linecap', 'stroke-linejoin', 'opacity', 'paint-order', 'text-anchor'];
function estilizaSvg(raiz) {
  const win = raiz.ownerDocument.defaultView; raiz.querySelectorAll('*').forEach(n => { const cs = win.getComputedStyle(n); PROPS_SVG.forEach(pr => { const v = cs.getPropertyValue(pr); if (v) n.style.setProperty(pr, v); }); });
}
const setFs = (t, v) => { t.setAttribute('font-size', v); t.style.setProperty('font-size', v + 'px'); };
// mapa do Brasil nas imagens: um rótulo por estado (UF + percentual de quem lidera), em letra maior; o quadro lateral idem
function afinaMapaUF(alvo) {
  const NS = 'http://www.w3.org/2000/svg', fs = t => parseFloat(t.getAttribute('font-size')) || 8;
  const val = t => parseFloat((t.querySelector('tspan')?.textContent || '').replace(',', '.'));
  const vencedor = (ts) => (val(ts[1]) >= val(ts[2]) || isNaN(val(ts[2]))) ? ts[1] : ts[2];
  alvo.querySelectorAll('svg.mapa g.rot').forEach(g => {
    const ts = [...g.querySelectorAll('text')]; if (ts.length !== 3) return;
    const uf = ts[0], w = vencedor(ts), f = fs(uf), x = uf.getAttribute('x'), y = parseFloat(uf.getAttribute('y'));
    g.querySelectorAll('rect').forEach(r => r.remove()); ts.forEach(t => { if (t !== uf && t !== w) t.remove(); });
    w.querySelectorAll('tspan').forEach((t, i) => { if (i) t.remove(); });
    setFs(uf, (f * 1.6).toFixed(1)); uf.setAttribute('y', (y - 2).toFixed(1));
    w.setAttribute('x', x); w.setAttribute('text-anchor', 'middle'); w.setAttribute('y', (y + f * 1.55).toFixed(1)); setFs(w, (f * 1.5).toFixed(1));
    const tw = w.querySelector('tspan'); if (tw) { tw.removeAttribute('dx'); setFs(tw, (f * 1.5).toFixed(1)); tw.style.setProperty('font-weight', '700'); }
  });
  alvo.querySelectorAll('svg.mapa g.callout').forEach(g => {
    const ts = [...g.querySelectorAll('text')]; if (ts.length !== 3) return;
    const uf = ts[0], w = vencedor(ts), bx = parseFloat(uf.getAttribute('x')) - 12, by = parseFloat(uf.getAttribute('y')) - 11;
    g.querySelectorAll('rect').forEach(r => { if (parseFloat(r.getAttribute('height')) < 10) r.remove(); }); ts.forEach(t => { if (t !== uf && t !== w) t.remove(); });
    w.querySelectorAll('tspan').forEach((t, i) => { if (i) t.remove(); });
    setFs(uf, 14); uf.setAttribute('y', (by + 25).toFixed(1)); uf.setAttribute('x', (bx + 14).toFixed(1));
    w.setAttribute('x', (bx + 58).toFixed(1)); w.setAttribute('y', (by + 25).toFixed(1)); setFs(w, 15); w.setAttribute('text-anchor', 'start');
    const tw = w.querySelector('tspan'); if (tw) { tw.removeAttribute('dx'); setFs(tw, 15); tw.style.setProperty('font-weight', '700'); }
  });
}

export async function canvasSecaoSocial(el, fmt, { titulo, topo, sub, de = 0, partes = false }) {
  await carregaScript('vendor/html2canvas.min.js');
  try { await document.fonts?.ready; await Promise.all(['400 40px "DM Serif Display"', '700 24px "Space Grotesk"', '500 24px "Space Grotesk"'].map(f => document.fonts?.load(f))); } catch { /* fonte reserva */ }
  const W = fmt.w, H = fmt.h, M = 56, PAD = 22, innerW = W - 2 * M - 2 * PAD;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const g = cv.getContext('2d');
  // 1) cabeçalho (mede para saber a altura que sobra ao corpo)
  const tam = String(titulo).length > 46 ? fmt.t - 12 : fmt.t;
  g.font = `400 ${tam}px "DM Serif Display", Georgia, serif`; const linT = quebra(g, titulo, W - 2 * M).slice(0, 3);
  g.font = '600 25px "Space Grotesk", system-ui, sans-serif'; const linS = quebra(g, sub || '', W - 2 * M).slice(0, 2);
  const hT = linT.length * Math.round(tam * 1.08), hS = linS.length * 32;
  const hCab = fmt.top + 30 + 44 + 20 + hT + (hS ? 12 + hS : 0) + 28;
  const hRod = 150 + fmt.bot, topoCorpo = hCab + 22, hCorpo = H - topoCorpo - hRod, innerH = hCorpo - 2 * PAD;
  // 2) conteúdo da seção, na largura útil do corpo; tabelas longas são cortadas para caber (a tabela completa fica no CSV/Excel)
  el.setAttribute('data-exp-alvo', '1');
  let c, infoTab = null;
  try {
    c = await window.html2canvas(el, {
      scale: 2, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: 1000,
      onclone: doc => {
        const alvo = doc.querySelector('[data-exp-alvo]'); if (!alvo) return;
        alvo.querySelectorAll('.sem-export,details').forEach(n => n.remove());
        doc.querySelectorAll('.mapa-tip,.g-tip').forEach(n => n.remove());
        alvo.querySelectorAll(':scope > h2').forEach(n => n.remove());
        alvo.querySelectorAll('.tab-scroll').forEach(n => { n.style.overflow = 'visible'; n.style.maxHeight = 'none'; });
        alvo.querySelectorAll('th,thead,.tab th').forEach(n => { n.style.position = 'static'; n.style.top = 'auto'; });
        alvo.style.cssText += `;box-shadow:none;margin:0;padding:0;border:0;width:${innerW}px;max-width:${innerW}px;background:#fff`;
        alvo.classList.add('exp-social', 'exp-' + fmt.id);   // o CSS do painel tem regras de letra maior para as imagens
        alvo.querySelectorAll(':scope > p.sub').forEach(n => n.remove());   // dicas de clique e ordenação só valem na tela
        // gráficos de linha: a legenda de traços sai (a de cores já está) e o desenho é refeito mais alto, para ocupar o corpo da imagem
        alvo.querySelectorAll('.leg-linhas').forEach(n => n.remove());
        const gws = [...alvo.querySelectorAll('.grafico-wrap[id]')].filter(w => REG_GRAFICOS.has(w.id));
        if (gws.length) {
          const sobra = Math.max(0, innerH - alvo.getBoundingClientRect().height - 24);
          gws.forEach(w => { const cfg = REG_GRAFICOS.get(w.id), leg = w.querySelector('.g-leg'); desenhaLinhas(w, { ...cfg, h: Math.min(1100, (cfg.h || 300) + sobra / gws.length / 1.12), mb: Math.max(cfg.mb || 0, 54), mr: 40, xo: 30 }); estilizaSvg(w.querySelector('svg')); if (leg) w.appendChild(leg); });
        }
        // mapa: ocupa a largura toda, com a legenda embaixo; sem a dica de clique (só vale na tela)
        if (alvo.classList.contains('mapa-sec')) {
          const gr = alvo.querySelector('.mapa-grid'); if (gr) { gr.style.cssText += ';display:block'; }
          alvo.querySelectorAll('.mapa-wrap').forEach(n => { n.style.cssText += ';width:100%;max-width:100%'; });
          alvo.querySelectorAll('.mapa-wrap > svg').forEach(n => { n.style.cssText += ';width:100%;height:auto;display:block'; });
          alvo.querySelectorAll('.mapa-lado').forEach(n => { n.style.cssText += ';width:100%;margin-top:10px'; });
          alvo.querySelectorAll('.leg-mapa').forEach(n => { n.style.cssText += ';display:flex;flex-wrap:wrap;gap:6px 26px;justify-content:center;font-size:23px'; });
        }
        // tabela: coluna do nome só do tamanho do conteúdo, letras maiores (a imagem é vista no celular)
        alvo.querySelectorAll('table.tab').forEach(t => {
          t.style.cssText += ';width:100%;font-size:19px';
          t.querySelectorAll('th').forEach(th => { th.style.fontSize = '14px'; });
          t.querySelectorAll('td').forEach(td => { td.style.padding = '8px 9px'; });
          t.querySelectorAll('tr > :first-child').forEach(c => { c.style.cssText += ';width:1%;white-space:nowrap;min-width:0'; });
        });
        // mapa do Brasil: rótulos maiores; a tabela por região só fica quando sobra espaço (num quadrado ela não cabe legível)
        if (alvo.querySelector('svg.mapa')) {
          afinaMapaUF(alvo);
          alvo.querySelectorAll('.mapa-lado p.nota, .mapa-lado h3 + p').forEach(n => n.remove());
          if (alvo.getBoundingClientRect().height > innerH - 150) alvo.querySelectorAll('.mapa-lado').forEach(l => [...l.children].forEach(ch => { if (!ch.matches('.leg-slot,.leg-mapa') && !ch.querySelector('.leg-mapa')) ch.remove(); }));
        }
        // mapas de município e de bairro: rótulos um pouco maiores
        alvo.querySelectorAll('.mapa-wrap svg:not(.mapa) text, #mapa-bm svg text').forEach(t => { const f = parseFloat(t.style.fontSize) || parseFloat(t.getAttribute('font-size')) || 0; if (f) setFs(t, (f * 1.3).toFixed(2)); });
        const tb = alvo.querySelector('table tbody');
        if (tb) {
          // só as linhas visíveis (busca/filtro da tela); a imagem mostra as linhas a partir de "de" e para quando acabar o espaço
          const win = doc.defaultView, todas = [...tb.querySelectorAll('tr')].filter(r => { if (win.getComputedStyle(r).display === 'none') { r.remove(); return false; } return true; });
          const total = todas.length; todas.slice(0, de).forEach(r => r.remove());
          const rest = todas.slice(de); let n = rest.length;
          const alt = () => alvo.getBoundingClientRect().height;
          if (alt() > innerH - 40) for (let i = rest.length - 1; i > 2 && alt() > innerH - 40; i--) { rest[i].remove(); n = i; }
          infoTab = { de, n, total };
          if (de > 0 || n < rest.length) {
            const nota = doc.createElement('div'); nota.style.cssText = 'margin-top:10px;font:600 16px system-ui,sans-serif;color:#6f6888;text-align:center';
            nota.textContent = partes ? `Linhas ${de + 1} a ${de + n} de ${total}${de + n < total ? ' · continua na próxima imagem' : ''}` : `Mostrando ${n} de ${total} linhas · a tabela completa está no painel`; alvo.appendChild(nota);
          }
        }
      },
    });
  } finally { el.removeAttribute('data-exp-alvo'); }
  // 3) composição
  g.fillStyle = '#FBF9F5'; g.fillRect(0, 0, W, H);
  const gr = g.createLinearGradient(0, 0, W, hCab); gr.addColorStop(0, '#2A2260'); gr.addColorStop(1, '#3E347E'); g.fillStyle = gr; g.fillRect(0, 0, W, hCab);
  try { const lg = await carregaImg('img/logo-negativo.svg'); const lh = 44; g.drawImage(lg, M, fmt.top + 30, lh * lg.width / lg.height, lh); } catch { /* sem logo */ }
  g.textBaseline = 'alphabetic';
  if (topo) { g.font = '700 19px "Space Grotesk", system-ui, sans-serif'; const tw = g.measureText(String(topo).toUpperCase()).width + 36; g.strokeStyle = 'rgba(255,255,255,.4)'; g.lineWidth = 2; retArred(g, W - M - tw, fmt.top + 30 + 2, tw, 40, 20); g.stroke(); g.fillStyle = '#fff'; g.fillText(String(topo).toUpperCase(), W - M - tw + 18, fmt.top + 30 + 28); }
  let y = fmt.top + 30 + 44 + 20; g.fillStyle = '#fff'; g.font = `400 ${tam}px "DM Serif Display", Georgia, serif`;
  const lt = Math.round(tam * 1.08); linT.forEach((l, i) => g.fillText(l, M, y + tam * .86 + i * lt)); y += hT + 12;
  g.fillStyle = '#F08A24'; g.font = '600 25px "Space Grotesk", system-ui, sans-serif'; linS.forEach((l, i) => g.fillText(l, M, y + 24 + i * 32));
  // corpo branco com o conteúdo ajustado (sem distorcer)
  g.save(); g.shadowColor = 'rgba(62,52,126,.12)'; g.shadowBlur = 24; g.shadowOffsetY = 8; g.fillStyle = '#fff'; retArred(g, M, topoCorpo, W - 2 * M, hCorpo, 24); g.fill(); g.restore();
  const esc = Math.min(innerW / c.width, innerH / c.height, 1.15 * innerW / c.width), dw = c.width * esc, dh = c.height * esc;
  g.drawImage(c, M + PAD + (innerW - dw) / 2, topoCorpo + PAD + (infoTab ? 0 : (innerH - dh) / 2), dw, dh);
  // rodapé
  const yr = H - hRod + 22; g.textAlign = 'center';
  try { const ic = await carregaImg('img/icone.svg'); g.font = '700 34px "Space Grotesk", system-ui, sans-serif'; const sw = g.measureText('oficinapolitica.com.br').width, tot = 46 + 14 + sw; g.drawImage(ic, W / 2 - tot / 2, yr, 46, 46); g.fillStyle = '#3E347E'; g.textAlign = 'left'; g.fillText('oficinapolitica.com.br', W / 2 - tot / 2 + 60, yr + 35); } catch { g.fillStyle = '#3E347E'; g.font = '700 34px "Space Grotesk", sans-serif'; g.fillText('oficinapolitica.com.br', W / 2, yr + 35); }
  g.textAlign = 'center'; g.fillStyle = '#6f6888'; g.font = '500 16px "Space Grotesk", system-ui, sans-serif';
  const notaIA = el.dataset.exportNota ? ' ' + el.dataset.exportNota + '.' : '';
  quebra(g, 'Fonte: TSE — Divulgação de Resultados. Iniciativa independente da Oficina Política, sem vínculo com o TSE; o resultado oficial é o do TSE.' + notaIA, W - 2 * M - 40).forEach((l, i) => g.fillText(l, W / 2, yr + 78 + i * 22));
  cv.info = infoTab;
  return cv;
}
// Devolve quantas imagens foram geradas. Tabela que não cabe legível em uma imagem sai completa, dividida em partes
// (até 5 partes: arquivos separados; acima disso: um ZIP com todas).
export async function baixarPNGSecaoSocial(el, nome, fmtId, ctx) {
  const fmt = FORMATOS_SEC[fmtId] || FORMATOS_SEC['4x5'];
  const cvs = []; let de = 0;
  for (let k = 0; k < 80; k++) {
    const cv = await canvasSecaoSocial(el, fmt, { ...ctx, de, partes: true }); cvs.push(cv);
    const inf = cv.info; if (!inf || inf.n < 1) break; de += inf.n; if (de >= inf.total) break;
  }
  const blobs = await Promise.all(cvs.map(cv => new Promise(ok => cv.toBlob(ok, 'image/png'))));
  const N = blobs.length, pad = n => String(n).padStart(String(N).length, '0');
  const arq = i => N === 1 ? `${nome}_${fmt.id}.png` : `${nome}_${fmt.id}_parte${pad(i + 1)}de${N}.png`;
  if (N <= 5) { for (let i = 0; i < N; i++) { baixar(blobs[i], arq(i)); if (i < N - 1) await new Promise(r => setTimeout(r, 350)); } }
  else {
    await carregaScript('vendor/jszip.min.js');
    const z = new window.JSZip(); blobs.forEach((b, i) => z.file(arq(i), b));
    baixar(await z.generateAsync({ type: 'blob' }), `${nome}_${fmt.id}_${N}-imagens.zip`);
  }
  return N;
}
export async function baixarPDFSecao(el, nome, sub, topo) {
  await carregaScript('vendor/jspdf.umd.min.js');
  const c = await capturarSecao(el, sub, topo);
  const { jsPDF } = window.jspdf, pdf = new jsPDF('p', 'mm', 'a4');
  const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight(), m = 8;
  const larg = pw - 2 * m, escala = larg / c.width, altPag = (ph - 2 * m - 6) / escala;
  let pag = 0;
  for (const f of fatiasPdf(c, altPag)) {
    const pc = canvasFatia(c, f);
    if (pag) pdf.addPage();
    pdf.addImage(pc.toDataURL('image/jpeg', 0.92), 'JPEG', m, m, larg, pc.height * escala);
    pdf.setFontSize(7); pdf.setTextColor(120); pdf.text(`oficinapolitica.com.br · ${sub} · pág. ${pag + 1}`, m, ph - 4);
    pag++;
  }
  pdf.save(nome + '.pdf');
}
// Lê a tabela que está na tela (o que a pessoa vê, já filtrado/ordenado) e devolve { cab, linhas } com números de verdade.
export function tabelaDaSecao(el) {
  const t = el.querySelector('table'); if (!t) return null;
  const lim = s => String(s).replace(/[↕▲▼]/g, '').replace(/\s+/g, ' ').trim();
  const ths = [...t.querySelectorAll('thead th')].map(th => lim(th.innerText)); if (!ths.length) return null;
  const trs = [...t.querySelectorAll('tbody tr')].filter(tr => !tr.querySelector('td.vazio') && tr.offsetParent !== null);
  const reD = /^(.*?)\s*\(\s*([+\-−]?[\d.,]+)\s*(p\.p\.)?\s*\)\s*$/;
  const numero = s => { s = String(s).trim().replace('−', '-'); if (/^[+-]?\d{1,3}(\.\d{3})+$/.test(s) || /^[+-]?\d+$/.test(s)) return +s.replace(/\./g, ''); if (/^[+-]?\d+,\d+$/.test(s) || /^[+-]?\d{1,3}(\.\d{3})+,\d+$/.test(s)) return +s.replace(/\./g, '').replace(',', '.'); return null; };
  const m = trs.map(tr => [...tr.children].map(td => {
    const linhas = (td.innerText || '').split('\n').map(x => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
    let txt = linhas.join(' · '), delta = null, pp = false;
    const d = txt.match(reD); if (d && d[1] !== '') { txt = d[1].replace(/\s·\s*$/, ''); delta = d[2]; pp = !!d[3]; }
    return { txt, delta, pp };
  }));
  const cab = [], cols = [];
  for (let j = 0; j < ths.length; j++) {
    const cel = m.map(r => r[j]).filter(Boolean);
    const temDelta = cel.some(c => c.delta != null), pp = cel.some(c => c.pp);
    const vazios = c => !c.txt || /^[–-]%?$/.test(c.txt) || /^1º t\.:/.test(c.txt);
    const ehPct = cel.some(c => /^[+\-−]?\d+(,\d+)?%$/.test(c.txt)) && cel.every(c => vazios(c) || /^[+\-−]?\d+(,\d+)?%$/.test(c.txt));
    cab.push(ths[j] + (ehPct && !/%/.test(ths[j]) ? ' (%)' : '')); if (temDelta) cab.push(ths[j] + (pp ? ' – variação (p.p.)' : ' – variação'));
    cols.push({ temDelta, ehPct });
  }
  const linhas = m.map(r => { const out = []; for (let j = 0; j < ths.length; j++) { const c = r[j] || { txt: '', delta: null }, k = cols[j]; let v = c.txt;
    if (k.ehPct) { const n = numero(v.replace('%', '')); v = n != null ? n : (/^1º t\.:/.test(v) || /^[–-]%?$/.test(v) ? '' : v); } else { const n = numero(v); if (n != null) v = n; }
    out.push(v);
    if (k.temDelta) out.push(c.delta != null ? (numero(c.delta) ?? c.delta) : '');
  } return out; });
  return { cab, linhas };
}
