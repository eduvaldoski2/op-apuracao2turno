import { ler, inteiro } from './ber.mjs';
const url = process.argv[2];
const buf = Buffer.from(await (await fetch(url)).arrayBuffer());
console.log('bytes', buf.length);
const pr = (ns, d = 0) => { for (const n of ns) {
  let v = ''; if (!n.cons) { const s = n.v; const txt = Buffer.from(s).toString('latin1'); v = (s.length <= 6 ? 'int=' + inteiro(s) + ' ' : '') + (/^[\x20-\x7e]+$/.test(txt) && s.length > 1 ? JSON.stringify(txt.slice(0, 60)) : 'hex=' + Buffer.from(s.subarray(0, 12)).toString('hex') + (s.length > 12 ? '…' + s.length : '')); }
  console.log(' '.repeat(d * 2) + `[${n.cls}:${n.tag}${n.cons ? ' C' : ''}] ${v}`); if (n.cons && d < 9) { if (n.f.length > 40) { pr(n.f.slice(0, 6), d + 1); console.log(' '.repeat(d * 2 + 2) + `… ${n.f.length} filhos`); } else pr(n.f, d + 1); } } };
pr(ler(buf));
