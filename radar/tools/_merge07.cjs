const fs=require('fs');const d='radar/tools/_f07/';
const F=fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort();
let code='\n/* ===== EDIÇÃO 07h de 25/11 (passada 1) ===== */\nEDICAO = {hora:\'07h\', data:\'Quarta, 25 de novembro de 2026\'};\n';
const ord={politica:[],economia:[],mundo:[],regioes:[]};
for(const f of F){const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/ED: (\w+)/)||[])[1];const id=f.replace(/\.js$/,'');
 if(!new RegExp("_[NU]\\('"+id+"'").test(t)){console.error('id não bate',f);continue}
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';ord[ed].push(id);}
code+="var _o07=function(k,ids){ORDER[k]=_top(ORDER[k],ids);};\n";
for(const k in ord)code+=`_o07('${k}',${JSON.stringify(ord[k])});\n`;
fs.writeFileSync('radar/tools/_merge07_code.js',code);console.log(ord.politica.length,ord.economia.length,ord.mundo.length,ord.regioes.length);
