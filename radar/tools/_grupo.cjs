const a=JSON.parse(require('fs').readFileSync(__dirname+'/_artigos.json','utf8'));
const e=Object.entries(a.itens);
const groups={
 hilton:['erika hilton'], vera:['ministra negra','vera lucia','mulher negra','negra no stf'],
 zanin:['cidadania'], hattem:['hattem'], tornado:['tornado'], peru:['terremoto'],
 robos:['robôs','robos assassinos','armas autônomas'], filip:['filipinas'],
 sal13:['13º salário','13o salário'], atibaia:['atibaia','data center'], gilmar:['gilmar'],
 caneta:['canetas'], huang:['huang'], europa:['jovens'], sex6:['6x1','5x2'], focus:['focus','projeções','boletim'],
};
const [g,max,len]=[process.argv[2],+process.argv[3]||4,+process.argv[4]||500];
const ks=groups[g]; const seen=new Set(); let n=0;
console.log('#### '+g);
for(const [u,x] of e){ const t=(x.t+' '+x.d).toLowerCase(); if(ks.some(k=>t.includes(k.toLowerCase()))){ if(seen.has(x.t)) continue; seen.add(x.t); if(++n>max) break; console.log('['+x.f+'] '+x.t+'\n  '+x.d.slice(0,len)+'\n  '+u.slice(0,120)); } }
