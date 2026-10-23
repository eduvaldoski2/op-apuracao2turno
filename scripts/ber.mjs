// Leitor mínimo de BER/ASN.1 (suficiente para o boletim de urna do TSE).
export function ler(buf, i = 0, fim = buf.length) {
  const nos = [];
  while (i < fim) {
    const t0 = buf[i++]; if (t0 === undefined) break;
    const cls = t0 >> 6, cons = !!(t0 & 0x20); let tag = t0 & 0x1f;
    if (tag === 0x1f) { tag = 0; let b; do { b = buf[i++]; tag = (tag << 7) | (b & 0x7f); } while (b & 0x80); }
    let len = buf[i++];
    if (len & 0x80) { const n = len & 0x7f; len = 0; for (let k = 0; k < n; k++) len = len * 256 + buf[i++]; }
    const ini = i, f = Math.min(ini + len, fim);
    const no = { cls, tag, cons, ini, fim: f };
    if (cons) no.f = ler(buf, ini, f);
    else { no.v = buf.subarray(ini, f); if (cls === 0 && tag === 4 && f - ini > 4) { try { const sub = ler(buf, ini, f); if (sub.length && sub.every(x => x.fim <= f) && sub[sub.length - 1].fim === f) { no.cons = true; no.f = sub; } } catch { /* octet string comum */ } } }
    nos.push(no); i = f;
  }
  return nos;
}
export const inteiro = v => { let n = 0; for (const b of v) n = n * 256 + b; return n; };
