const fs=require('fs');const d='radar/tools/_frag/';const F=fs.readdirSync(d).filter(f=>f.endsWith('.js'));
let src=fs.readFileSync('radar/_edicao.php','utf8');
const ord={politica:[],economia:[],mundo:[],regioes:[]};let code='\n/* ===== Edição 07h 17/11 ===== */\n';const wc=s=>s.split(/\s+/).length;const big=[];
for(const f of F){const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/ED: (\w+)/)||[])[1];const id=f.replace(/\.js$/,'');
 const re=new RegExp("_[NU]\\('"+id+"'");if(!re.test(t)){console.log('id não bate',f);continue}
 if(/KIND: U/.test(t)&&!src.includes("S."+id+" =")&&!src.includes("_N('"+id+"'")&&!src.includes("S['"+id+"']"))console.log('AVISO U sem base?',id);
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';ord[ed].push(id);big.push([id,wc(t)]);}
code+="\nvar _o=function(k,ids){ORDER[k]=_top(ORDER[k],ids);};\n";
for(const k in ord)code+=`_o('${k}',${JSON.stringify(ord[k])});\n`;
fs.writeFileSync('radar/tools/_merge_code.js',code);
console.log(big.sort((a,b)=>b[1]-a[1]).slice(0,10).join(' | '));
