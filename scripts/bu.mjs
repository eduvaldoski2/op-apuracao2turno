// Decodifica o boletim de urna (arquivo *-bu.dat, BER/ASN.1) e devolve a votação para presidente de uma eleição.
import { ler, inteiro } from './ber.mjs';

const ehInt = n => n && n.cls === 0 && n.tag === 2 && !n.cons;
const ctx = (n, t) => n && n.cls === 2 && n.tag === t;

// retorna { aptos, L, F, O, B, N } para a eleição `idEleicao` (ex.: 6258 no 2º turno, 6257 no 1º) ou null
export function decodificarBU(buf, idEleicao, { cargo = 1, nL = 13, nF = 22 } = {}) {
  const raiz = ler(buf)[0];
  if (!raiz?.f) return null;
  const oct = raiz.f.find(n => n.cls === 0 && n.tag === 4 && !n.cons && n.fim - n.ini > 100);
  if (!oct) return null;
  const inner = ler(buf, oct.ini, oct.fim)[0];
  let out = null;
  const achaEleicao = n => {
    if (out || !n.f) return;
    if (n.tag === 16 && n.f.length >= 5 && ehInt(n.f[0]) && inteiro(n.f[0].v) === idEleicao && ehInt(n.f[1])) {
      const aptos = inteiro(n.f[1].v);
      const r = { aptos, L: 0, F: 0, O: 0, B: 0, N: 0, ok: false };
      achaCargo(n, r); if (r.ok) out = r; return;
    }
    for (const c of n.f) achaEleicao(c);
  };
  const achaCargo = (n, r) => {
    if (!n.f || r.ok) return;
    if (n.tag === 16 && n.f.length >= 3 && ctx(n.f[0], 1) && inteiro(n.f[0].v) === cargo && n.f[2].cons && n.f[2].f.length) {
      for (const v of n.f[2].f) {
        const tipo = v.f?.find(x => ctx(x, 1)), q = v.f?.find(x => ctx(x, 2)), id = v.f?.find(x => ctx(x, 3));
        if (!tipo || !q) continue;
        const t = inteiro(tipo.v), qt = inteiro(q.v);
        if (t === 1) { const cod = id?.f?.[1] ? inteiro(id.f[1].v) : id?.f?.[0] ? inteiro(id.f[0].v) : -1; if (cod === nL) r.L += qt; else if (cod === nF) r.F += qt; else r.O += qt; }
        else if (t === 2) r.B += qt; else if (t === 3) r.N += qt; else r.O += qt;
      }
      r.ok = true; return;
    }
    for (const c of n.f) achaCargo(c, r);
  };
  achaEleicao(inner);
  return out;
}
