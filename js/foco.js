// Candidato em foco na aba "Resultados 1º Turno": guardado na rota (?c=L, ?c=F, ?c=c70…) e repassado a cada nível do drill-down.
let f = null;
export const getFoco = () => f;
export const setFoco = v => { f = v || null; };
export const comFoco = h => (f && typeof h === 'string' && h.startsWith('#/t1') && !h.includes('?')) ? `${h}?c=${encodeURIComponent(f)}` : h;
