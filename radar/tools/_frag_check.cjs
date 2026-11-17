// node radar/tools/_frag_check.cjs radar/tools/_frag/<arquivo>.js  → valida sintaxe e mostra métricas
const fs=require('fs');const f=process.argv[2];const src=fs.readFileSync(f,'utf8');
function _F(s){var out=[],ul=null;s.split('\n').forEach(function(l){l=l.trim();if(!l)return;
 if(l.indexOf('## ')===0){ul=null;out.push(['h',l.slice(3)]);}else if(l.indexOf('- ')===0){if(!ul){ul=[];out.push(['ul',ul]);}ul.push(l.slice(2));}
 else if(l.indexOf('NUMS ')===0){ul=null;out.push(['nums',l.slice(5).split(';').map(x=>x.split('|'))]);}
 else if(l.indexOf('TL ')===0){ul=null;out.push(['tl',l.slice(3).split(';').map(x=>x.split('|'))]);}
 else{ul=null;out.push(['p',l]);}});return out;}
const S={};const wc=s=>String(s).split(/\s+/).filter(Boolean).length;
function rep(id,o,k){const fu=_F(o.fundo);let p=0,ul=0,h=0;let first=null;fu.forEach(b=>{if(b[0]==='p'){p+=wc(b[1]);if(!first)first=b[1];}else if(b[0]==='ul'){ul+=wc(b[1].join(' '));}else if(b[0]==='h')h++;});
 const tot=p+ul;const fo=(o.fontes||[]).length;
 console.log(k,id,'| palavras',tot,'| narrativo',Math.round(100*p/Math.max(tot,1))+'%','| lide',wc(first||''),'| h',h,'| fontes',fo,'| resumo',wc(o.resumo||''),'| t',(o.t||'').length,o.upd?'| upd ok':(k==='_U'?'| FALTA upd':''));
 const bad=['vale destacar','é importante ressaltar','em suma','nesse sentido','bombástico','chocante','falta segunda fonte','não localizou'];bad.forEach(b=>{if((o.fundo+o.resumo+o.t+o.sub).toLowerCase().includes(b))console.log('   !! muleta:',b)});
 if(!o.resumo||wc(o.resumo)<50||wc(o.resumo)>120)console.log('   !! resumo fora de 50-120');if(first&&(wc(first)<20||wc(first)>85))console.log('   !! lide fora de 20-85');}
const _N=(id,o)=>rep(id,o,'_N'),_U=(id,o)=>rep(id,o,'_U');
try{new Function('_N','_U','S','_F',src)(_N,_U,S,_F);console.log('SINTAXE OK');}catch(e){console.log('ERRO',e.message);process.exit(1)}
