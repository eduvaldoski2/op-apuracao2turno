// Card de compartilhamento (PNG/PDF): peça própria, com margem, proporção fixa e hierarquia entre candidatos.
// Lê os dados que a tela já exibe (fichas do 1º turno ou placar Lula × Flávio) e monta um layout de redes sociais.
import { esc } from './ui.js?v=1e51e44f';

export const carregaScript = src => new Promise((ok, err) => { if (document.querySelector(`script[data-v="${src}"]`)) return ok(); const s = document.createElement('script'); s.src = src; s.dataset.v = src; s.onload = ok; s.onerror = () => err(new Error('falha ao carregar ' + src)); document.head.appendChild(s); });

// QR da página em exibição (qrcode-generator, vendor/qrcode.js). Devolve o objeto qr ou null se a biblioteca não carregar.
export const urlPagina = () => location.href.split('?v=')[0];
export async function criaQR(url = urlPagina()) {
  try { await carregaScript('vendor/qrcode.js'); const q = window.qrcode(0, 'M'); q.addData(url); q.make(); return q; } catch { return null; }
}
// desenha o QR num canvas (quadro branco com margem) — x, y, tam = lado total em px
export function desenhaQR(g, q, x, y, tam) {
  g.fillStyle = '#fff'; g.beginPath(); g.roundRect ? g.roundRect(x, y, tam, tam, tam * .1) : g.rect(x, y, tam, tam); g.fill();
  if (!q) return;
  const n = q.getModuleCount(), m = tam * .08, c = (tam - 2 * m) / n; g.fillStyle = '#000';
  for (let r = 0; r < n; r++) for (let k = 0; k < n; k++) if (q.isDark(r, k)) g.fillRect(Math.floor(x + m + k * c), Math.floor(y + m + r * c), Math.ceil(c), Math.ceil(c));
}

// formatos: w × h em pixels. "livre" = quanto couber (a altura é calculada pelo conteúdo)
export const FORMATOS = {
  '3x5': { id: '3x5', rot: '3:5', desc: 'Vertical alto', w: 1080, h: 1800, k: 1, col2: false, seguro: 0 },
  '1x1': { id: '1x1', rot: '1:1', desc: 'WhatsApp', w: 1080, h: 1080, k: .66, col2: true, seguro: 0 },
  '4x5': { id: '4x5', rot: '4:5', desc: 'Feed · Instagram', w: 1080, h: 1350, k: .8, col2: true, seguro: 0 },
  '9x16': { id: '9x16', rot: '9:16', desc: 'Stories e Reels', w: 1080, h: 1920, k: 1, col2: false, seguro: 120 },
  'a4': { id: 'a4', rot: 'A4', desc: 'Página do PDF', w: 1080, h: 1527, k: .95, col2: false, seguro: 0 },
};
// candidato "relevante" (ganha tamanho intermediário): a partir deste percentual de votos válidos
export const LIMIAR_RELEVANTE = 5;

const num = s => { const n = parseFloat(String(s || '').replace(/\./g, '').replace(',', '.').replace('%', '')); return isFinite(n) ? n : 0; };
const txt = n => n ? n.textContent.replace(/\s+/g, ' ').trim() : '';

// Extrai da tela atual o que o card precisa. Devolve null se a tela não tem placar nem fichas (ex.: critérios, ranking).
export function lerCard(raiz) {
  const fich = [...raiz.querySelectorAll('.fichas .ficha')];
  let cands = [], centro = null, kind = '';
  if (fich.length) {
    kind = 't1';
    cands = fich.map(f => ({ cor: f.style.getPropertyValue('--c').trim() || '#6c757d', num: txt(f.querySelector('.ficha-num')), nome: txt(f.querySelector('.ficha-nome')), part: txt(f.querySelector('.ficha-part')), pct: txt(f.querySelector('.ficha-pct')), votos: txt(f.querySelector('.ficha-votos b')), rk: parseInt(txt(f.querySelector('.pos-rank'))) || 0, selo: txt(f.querySelector('.selo-2t')) }));
    const rs = raiz.querySelector('.resumo');
    centro = { rotulo: txt(rs?.querySelector('.centro-t')), validos: txt(rs?.querySelector('.resumo-t b')) };
  } else {
    const pl = raiz.querySelector('.placar'); if (!pl) return null;
    kind = 'ap';
    cands = [...pl.querySelectorAll('.cand')].map(f => {
      const pctEl = f.querySelector('.cand-pct'), d = pctEl?.querySelector('.dlt');
      return { cor: f.style.getPropertyValue('--c').trim() || '#6c757d', num: txt(f.querySelector('.cand-num')), nome: txt(f.querySelector('.cand-nome')), part: txt(f.querySelector('.cand-part')), pct: txt(pctEl?.firstChild), votos: txt(f.querySelector('.cand-votos b')), votosSufixo: /projetados/.test(txt(f.querySelector('.cand-votos'))) ? 'votos (projetados)' : 'votos', delta: d ? txt(d).replace(/^\(|\)$/g, '') : '', dcls: d ? (d.classList.contains('pos') ? 'pos' : d.classList.contains('neg') ? 'neg' : '') : '', selo: txt(f.querySelector('.selo')), faixa: txt(f.querySelector('.faixa')) };
    });
    cands.forEach(c => { c.rk = 0; }); cands.sort((a, b) => num(b.pct) - num(a.pct)); cands.forEach((c, i) => { c.rk = i + 1; });
    const ce = pl.querySelector('.centro');
    centro = { rotulo: txt(ce?.querySelector('.centro-t')), cobertura: txt(ce?.querySelector('.cobertura')), cobS: txt(ce?.querySelector('.cob-s')), margem: txt(ce?.querySelector('.margem')) };
  }
  if (cands.length < 2) return null;
  cands.forEach(c => { c.v = num(c.pct); });
  const kpis = [...raiz.querySelectorAll('.kpis .kpi')].slice(0, 4).map(k => ({ t: txt(k.querySelector('.kpi-t')), v: txt(k.querySelector('.kpi-v')?.firstChild), d: txt(k.querySelector('.kpi-v .dlt')).replace(/^\(|\)$/g, ''), dcls: k.querySelector('.kpi-v .dlt.pos') ? 'pos' : k.querySelector('.kpi-v .dlt.neg') ? 'neg' : '', s: txt(k.querySelector('.kpi-s')).replace(/faixa:.*$/, '').trim() }));
  return { kind, cands, centro, kpis };
}

const CSS = `
.opcard{box-sizing:border-box;width:var(--w);height:var(--h);background:#fff;color:#2b2540;font-family:'Space Grotesk',system-ui,sans-serif;display:flex;flex-direction:column;padding:calc(var(--pt) + 0px) var(--pad) var(--pb);gap:var(--gap);overflow:hidden;position:relative}
.opcard *{box-sizing:border-box;margin:0}
.opcard .oc-cab{display:flex;justify-content:space-between;align-items:center;gap:24px;padding:calc(22px*var(--k)) calc(34px*var(--k));background:linear-gradient(100deg,#2A2260,#3E347E);border-radius:calc(26px*var(--k));color:#fff;flex:none}
.opcard .oc-cab img{height:calc(70px*var(--k));width:auto;display:block}
.opcard .oc-cab span{font-size:calc(23px*var(--k));line-height:1.3;text-align:right;opacity:.95;max-width:56%;text-wrap:balance}
.opcard .oc-tit{flex:none;padding:calc(8px*var(--k)) calc(6px*var(--k)) 0}
.opcard .oc-tit h1{font:400 calc(var(--ft)*var(--k))/1.06 'DM Serif Display',Georgia,serif;color:#3E347E;letter-spacing:-.01em}
.opcard .oc-tit p{margin-top:calc(14px*var(--k));font-size:calc(28px*var(--k));line-height:1.3;color:#5d5675;font-weight:500}
.opcard .oc-barra{flex:none}
.opcard .oc-barra .oc-rot{font-size:calc(21px*var(--k));letter-spacing:.09em;text-transform:uppercase;font-weight:700;color:#5d5675;margin-bottom:calc(12px*var(--k))}
.opcard .oc-b{display:flex;height:calc(30px*var(--k));border-radius:99px;overflow:hidden;background:#ece9f3}
.opcard .oc-b i{display:block;height:100%;min-width:0}
.opcard .oc-barra .oc-sub{margin-top:calc(12px*var(--k));font-size:calc(24px*var(--k));color:#5d5675}
.opcard .oc-barra .oc-sub b{color:#2b2540}
.opcard .oc-corpo{flex:1;min-height:0;display:flex;flex-direction:column;justify-content:space-evenly;gap:calc(22px*var(--k))}
.opcard .oc-dois{display:grid;grid-template-columns:1fr 1fr;gap:calc(26px*var(--k))}
.opcard .oc-big{border:2px solid #e6e1f0;border-top:calc(14px*var(--k)) solid var(--c);border-radius:calc(30px*var(--k));padding:calc(30px*var(--k)) calc(32px*var(--k)) calc(32px*var(--k));display:flex;flex-direction:column;gap:calc(8px*var(--k));position:relative;background:#fff;min-width:0}
.opcard .oc-bt{display:flex;align-items:center;gap:calc(16px*var(--k))}
.opcard .oc-big .oc-bt{min-height:calc(88px*var(--k))}
.opcard .oc-num{display:inline-flex;align-items:center;justify-content:center;min-width:calc(66px*var(--k));height:calc(54px*var(--k));padding:0 10px;border-radius:calc(14px*var(--k));background:var(--c);color:#fff;font-weight:700;font-size:calc(30px*var(--k));flex:none}
.opcard .oc-nome{font-weight:700;font-size:calc(34px*var(--k));line-height:1.1}
.opcard .oc-part{font-size:calc(22px*var(--k));color:#6f6888;margin-top:2px;letter-spacing:.03em}
.opcard .oc-rk{margin-left:auto;font-size:calc(22px*var(--k));font-weight:700;background:#f0edf7;color:#5d5675;border-radius:99px;padding:calc(6px*var(--k)) calc(16px*var(--k));flex:none}
.opcard .oc-pct{font-weight:700;font-size:calc(var(--fp)*var(--k));line-height:1;color:var(--c);margin-top:calc(14px*var(--k));letter-spacing:-.02em;white-space:nowrap}
.opcard .oc-d{display:block;font-size:calc(26px*var(--k));font-weight:700;margin-top:calc(4px*var(--k));color:#6f6888}
.opcard .oc-d.pos{color:#1b8a5a}.opcard .oc-d.neg{color:#c0392b}
.opcard .oc-votos{font-size:calc(28px*var(--k));color:#5d5675}.opcard .oc-votos b{color:#2b2540}
.opcard .oc-selo{display:inline-block;align-self:flex-start;margin-top:calc(6px*var(--k));padding:calc(5px*var(--k)) calc(16px*var(--k));border-radius:99px;font-size:calc(21px*var(--k));font-weight:700;background:#fff3dc;color:#8a5a00}
.opcard .oc-med{display:grid;gap:calc(20px*var(--k));grid-template-columns:repeat(var(--nm),1fr)}
.opcard .oc-m{border:2px solid #e6e1f0;border-left:calc(12px*var(--k)) solid var(--c);border-radius:calc(24px*var(--k));padding:calc(20px*var(--k)) calc(24px*var(--k));display:flex;flex-direction:column;gap:calc(4px*var(--k));min-width:0}
.opcard .oc-m .oc-bt{gap:calc(12px*var(--k))}
.opcard .oc-m .oc-num{min-width:calc(52px*var(--k));height:calc(42px*var(--k));font-size:calc(24px*var(--k));border-radius:calc(11px*var(--k))}
.opcard .oc-m .oc-nome{font-size:calc(28px*var(--k))}.opcard .oc-m .oc-part{font-size:calc(19px*var(--k))}
.opcard .oc-m .oc-pct{font-size:calc(68px*var(--k));margin-top:calc(6px*var(--k))}
.opcard .oc-m .oc-votos{font-size:calc(23px*var(--k))}
.opcard .oc-med.um .oc-m{display:grid;grid-template-columns:1fr auto;column-gap:calc(24px*var(--k));align-items:center}.opcard .oc-med.um .oc-bt{grid-row:1/3}.opcard .oc-med.um .oc-pct{grid-column:2;grid-row:1;margin:0}.opcard .oc-med.um .oc-votos{grid-column:2;grid-row:2;text-align:right}
.opcard .oc-lista{display:grid;grid-template-columns:repeat(var(--nc),1fr);column-gap:calc(40px*var(--k));row-gap:0;border-top:2px solid #ece9f3}
.opcard .oc-row{display:grid;grid-template-columns:calc(48px*var(--k)) minmax(0,1fr) calc(var(--bw)*var(--k)) calc(var(--vw)*var(--k)) calc(98px*var(--k));align-items:center;gap:calc(12px*var(--k));height:calc(var(--rh)*var(--k));border-bottom:2px solid #ece9f3;font-size:calc(24px*var(--k))}
.opcard .oc-row .oc-num{min-width:0;width:calc(46px*var(--k));height:calc(34px*var(--k));font-size:calc(19px*var(--k));border-radius:calc(9px*var(--k));padding:0}
.opcard .oc-rn{white-space:nowrap;overflow:hidden;text-overflow:ellipsis;font-weight:600}
.opcard .oc-rn small{font-size:.74em;color:#8a85a0;font-weight:500;margin-left:6px;letter-spacing:.03em}
.opcard .oc-rb{height:calc(11px*var(--k));border-radius:99px;background:#f0edf7;overflow:hidden}.opcard .oc-rb i{display:block;height:100%;background:var(--c);border-radius:99px;min-width:2px}
.opcard .oc-rp{text-align:right;font-weight:700;color:var(--c)}
.opcard .oc-rv{text-align:right;color:#6f6888;font-size:.86em}
.opcard .oc-lista.c2 .oc-row{grid-template-columns:calc(46px*var(--k)) minmax(0,1fr) calc(100px*var(--k))}.opcard .oc-lista.c2 .oc-rb,.opcard .oc-lista.c2 .oc-rv,.opcard .oc-lista.c2 .oc-rn small{display:none}
.opcard .oc-lt{font-size:calc(20px*var(--k));letter-spacing:.09em;text-transform:uppercase;font-weight:700;color:#8a85a0;margin-bottom:calc(10px*var(--k))}
.opcard .oc-cob{border:2px solid #e6e1f0;border-radius:calc(26px*var(--k));padding:calc(26px*var(--k)) calc(30px*var(--k));display:flex;flex-direction:column;gap:calc(12px*var(--k))}
.opcard .oc-cob .oc-cn{font-size:calc(46px*var(--k));font-weight:700;color:#3E347E}
.opcard .oc-cob .oc-cbar{height:calc(16px*var(--k));border-radius:99px;background:#ece9f3;overflow:hidden}.opcard .oc-cob .oc-cbar i{display:block;height:100%;background:#E8890C}
.opcard .oc-cob p{font-size:calc(25px*var(--k));color:#5d5675;line-height:1.35}
.opcard .oc-kpis{display:grid;grid-template-columns:repeat(4,1fr);gap:calc(14px*var(--k));flex:none}
.opcard .oc-kpi{background:#f6f4fa;border-radius:calc(20px*var(--k));padding:calc(18px*var(--k)) calc(20px*var(--k));min-width:0}
.opcard .oc-kpi div:first-child{font-size:calc(17px*var(--k));letter-spacing:.07em;text-transform:uppercase;font-weight:700;color:#6f6888;white-space:nowrap}
.opcard .oc-kpi .oc-kv{font-size:calc(38px*var(--k));font-weight:700;color:#3E347E;margin-top:calc(4px*var(--k));white-space:nowrap}
.opcard .oc-kpi .oc-kd{font-size:calc(19px*var(--k));font-weight:700;color:#6f6888;white-space:nowrap}.opcard .oc-kd.pos{color:#1b8a5a}.opcard .oc-kd.neg{color:#c0392b}
.opcard .oc-kpi .oc-ks{font-size:calc(18px*var(--k));color:#6f6888;margin-top:2px;line-height:1.25}
.opcard .oc-rod{flex:none;display:flex;flex-direction:column;gap:calc(10px*var(--k))}
.opcard .oc-rod .oc-qr{display:flex;align-items:center;gap:calc(26px*var(--k));padding:calc(16px*var(--k)) calc(24px*var(--k));background:#3E347E;border-radius:calc(24px*var(--k));color:#fff}
.opcard .oc-rod .oc-qr .oc-qrimg{flex:none;width:calc(136px*var(--k));height:calc(136px*var(--k));background:#fff;border-radius:calc(14px*var(--k));padding:calc(9px*var(--k))}
.opcard .oc-rod .oc-qr .oc-qrimg svg{width:100%;height:100%;display:block}
.opcard .oc-rod .oc-qr .oc-q1{font-weight:700;font-size:calc(34px*var(--k));line-height:1.1}.opcard .oc-rod .oc-qr .oc-q1 u{text-decoration:none;color:#F28C1E}
.opcard .oc-rod .oc-qr .oc-q2{font-weight:700;font-size:calc(42px*var(--k));margin-top:calc(8px*var(--k));color:#F28C1E;white-space:nowrap;letter-spacing:-.01em}
.opcard .oc-rod p{font-size:calc(16px*var(--k));line-height:1.35;color:#8a85a0;text-align:center}
`;

function css() { if (!document.getElementById('opcard-css')) { const s = document.createElement('style'); s.id = 'opcard-css'; s.textContent = CSS; document.head.appendChild(s); } }

const big = c => `<div class="oc-big" style="--c:${esc(c.cor)}"><div class="oc-bt"><span class="oc-num">${esc(c.num)}</span><div><div class="oc-nome">${esc(c.nome)}</div><div class="oc-part">${esc(c.part)}</div></div><span class="oc-rk">${c.rk}º</span></div><div class="oc-pct">${esc(c.pct)}</div>${c.delta ? `<span class="oc-d ${c.dcls || ''}">${esc(c.delta)} vs. 1º turno</span>` : ''}<div class="oc-votos"><b>${esc(c.votos)}</b> ${esc(c.votosSufixo || 'votos')}</div>${c.selo ? `<span class="oc-selo">${esc(c.selo)}</span>` : ''}</div>`;
const med = c => `<div class="oc-m" style="--c:${esc(c.cor)}"><div class="oc-bt"><span class="oc-num">${esc(c.num)}</span><div><div class="oc-nome">${esc(c.nome)}</div><div class="oc-part">${esc(c.part)}${c.selo ? ' · ' + esc(c.selo) : ''}</div></div><span class="oc-rk">${c.rk}º</span></div><div class="oc-pct">${esc(c.pct)}</div><div class="oc-votos"><b>${esc(c.votos)}</b> votos</div></div>`;
const row = (c, max) => `<div class="oc-row" style="--c:${esc(c.cor)}"><span class="oc-num">${esc(c.num)}</span><span class="oc-rn">${esc(c.nome)}<small>${esc(c.part)}</small></span><span class="oc-rb"><i style="width:${max > 0 ? Math.max(0, Math.min(100, 100 * c.v / max)) : 0}%"></i></span><b class="oc-rp">${esc(c.pct)}</b><span class="oc-rv">${esc(c.votos)}</span></div>`;

// monta o elemento do card (largura × altura fixas). d = dados de lerCard + { titulo, cadeia, sub }
export function montarCard(d, fmt = FORMATOS['3x5']) {
  css();
  const k = fmt.k, ord = d.cands.slice().sort((a, b) => b.v - a.v), principais = ord.slice(0, 2), resto = ord.slice(2);
  const medios = resto.filter(c => c.v >= LIMIAR_RELEVANTE), peq = resto.filter(c => c.v < LIMIAR_RELEVANTE);
  const tam = String(d.titulo || '').length, ft = tam <= 16 ? 92 : tam <= 26 ? 76 : tam <= 38 ? 62 : 52;
  const cols = fmt.col2 && peq.length > 4 ? 2 : 1, nlin = Math.ceil(peq.length / cols);
  // altura da linha da lista: cabe o máximo possível no espaço, sem passar de 60px
  const rh = peq.length ? (nlin > 8 ? 46 : nlin > 5 ? 52 : 58) : 0, bw = cols === 2 ? 56 : 130;
  const top2 = ord.slice(0, 2).map(c => ({ ...c })), maxv = Math.max(1, ...top2.map(c => c.v));
  const corBarra = d.cands.slice().sort((a, b) => b.v - a.v).map(c => `<i style="width:${Math.max(0, c.v)}%;background:${esc(c.cor)}"></i>`).join('');
  const el = document.createElement('div');
  el.className = 'opcard'; el.dataset.fmt = fmt.id;
  el.style.cssText = `--w:${fmt.w}px;--h:${fmt.h}px;--k:${k};--pad:${Math.round(64 * k)}px;--pt:${Math.round(56 * k) + fmt.seguro}px;--pb:${Math.round(50 * k) + fmt.seguro}px;--gap:${Math.round(26 * k)}px;--ft:${ft}px;--fp:${k < 1 ? 92 : 104}px;--nm:${Math.max(1, Math.min(3, medios.length))};--nc:${cols};--rh:${rh}px;--bw:${bw}px;--vw:${cols === 2 ? 118 : 132}px`;
  const barraRot = d.centro?.rotulo ? esc(d.centro.rotulo) : esc(d.titulo);
  el.innerHTML = `
  <div class="oc-cab"><img src="img/logo-negativo.svg" alt="Oficina Política"><span>${esc(d.sub || '')}</span></div>
  <div class="oc-tit"><h1>${esc(d.titulo)}</h1>${d.cadeia ? `<p>${esc(d.cadeia)}</p>` : ''}</div>
  <div class="oc-barra"><div class="oc-b">${corBarra}</div>${d.centro?.validos ? `<div class="oc-sub"><b>${esc(d.centro.validos)}</b> votos válidos</div>` : ''}</div>
  <div class="oc-corpo">
    <div class="oc-dois">${principais.map(big).join('')}</div>
    ${d.kind === 'ap' && d.centro && (d.centro.cobertura || d.centro.margem) ? `<div class="oc-cob">${d.centro.cobertura ? `<div class="oc-cn">${esc(d.centro.cobertura)}</div><div class="oc-cbar"><i style="width:${Math.min(100, num(d.centro.cobertura))}%"></i></div>` : ''}${d.centro.cobS ? `<p>${esc(d.centro.cobS)}</p>` : ''}${d.centro.margem ? `<p><b style="color:#2b2540">${esc(d.centro.margem)}</b></p>` : ''}</div>` : ''}
    ${medios.length ? `<div class="oc-med${medios.length === 1 ? ' um' : ''}">${medios.map(med).join('')}</div>` : ''}
    ${peq.length ? `<div><div class="oc-lt">${medios.length ? 'Demais candidatos' : 'Outros candidatos'}</div><div class="oc-lista${cols === 2 ? ' c2' : ''}">${peq.map(c => row(c, maxv * 0 + Math.max(...peq.map(x => x.v), 1))).join('')}</div></div>` : ''}
  </div>
  ${d.kpis?.length ? `<div class="oc-kpis">${d.kpis.map(x => `<div class="oc-kpi"><div>${esc(x.t)}</div><div class="oc-kv">${esc(x.v)}</div>${x.d ? `<div class="oc-kd ${x.dcls || ''}">${esc(x.d)}</div>` : ''}<div class="oc-ks">${esc(x.s)}</div></div>`).join('')}</div>` : ''}
  <div class="oc-rod"><div class="oc-qr"><div class="oc-qrimg">${d.qr ? d.qr.createSvgTag({ cellSize: 4, margin: 0, scalable: true }) : ''}</div><div><div class="oc-q1">Quer ver <u>mais dados</u>?</div><div class="oc-q2">oficinapolitica.com.br ›</div></div></div><p>Fonte: TSE — Divulgação de Resultados. Iniciativa independente da Oficina Política, sem vínculo com o TSE; o resultado oficial é o do TSE.</p></div>`;
  return el;
}

const aguardaImgs = el => Promise.all([...el.querySelectorAll('img')].map(i => i.complete ? 0 : new Promise(ok => { i.onload = i.onerror = ok; })));

// gera o canvas do card (escala 1 = largura de 1080 px; use 1.5–2 para PDF)
export async function cardCanvas(d, fmt = FORMATOS['3x5'], escala = 1) {
  await carregaScript('vendor/html2canvas.min.js');
  if (d.qr === undefined) d = { ...d, qr: await criaQR() };
  try { await document.fonts?.ready; await Promise.all(['700 40px "Space Grotesk"', '400 40px "DM Serif Display"'].map(f => document.fonts?.load(f))); } catch { /* segue com a fonte reserva */ }
  const wrap = document.createElement('div');
  wrap.id = 'opcard-wrap'; wrap.style.cssText = 'position:fixed;left:0;top:0;opacity:0;pointer-events:none;z-index:-1'; document.body.appendChild(wrap);
  try {
    // se o conteúdo não couber na proporção escolhida, reduz a escala até caber (o tamanho final do arquivo não muda)
    let el = null;
    for (const f of [1, .94, .88, .82, .76, .7]) {
      wrap.innerHTML = ''; el = montarCard(d, { ...fmt, k: fmt.k * f }); wrap.appendChild(el);
      const corpo = el.querySelector('.oc-corpo');
      if (corpo.scrollHeight <= corpo.clientHeight + 1 && el.scrollHeight <= el.clientHeight + 1) break;
    }
    await aguardaImgs(el);
    return await window.html2canvas(el, { scale: escala, width: fmt.w, height: fmt.h, backgroundColor: '#ffffff', useCORS: true, logging: false, windowWidth: fmt.w, windowHeight: fmt.h, onclone: doc => { const w = doc.getElementById('opcard-wrap'); if (w) w.style.opacity = '1'; } });
  } finally { wrap.remove(); }
}
