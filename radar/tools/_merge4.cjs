const fs=require('fs');const d='radar/tools/_frag4/';const F=fs.readdirSync(d).filter(f=>f.endsWith('.js'));
let src=fs.readFileSync('radar/_edicao.php','utf8');
const ord={politica:[],economia:[],mundo:[],regioes:[]};const info={};
let code="/* ===== Edição 15h 17/11 ===== */\nEDICAO.hora = '15h';\nEDICAO.data = 'Terça, 17 de novembro de 2026';\n";
for(const f of F){const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/ED: (\w+)/)||[])[1];const id=f.replace(/\.js$/,'');
 if(!new RegExp("_N\\('"+id+"'").test(t)){console.log('id não bate',f);continue}
 if(src.includes("_N('"+id+"'"))continue;
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';ord[ed].push(id);
 const m=t.match(/ t:'((?:[^'\\]|\\.)*)'/);const fo=t.match(/fontes:\[\['((?:[^'\\]|\\.)*)','([^']*)'/);info[id]={ed,t:m&&m[1],fn:fo&&fo[1],u:fo&&fo[2]};}
for(const f of fs.readdirSync('radar/tools/_frag4u/').filter(f=>f.endsWith('.js'))){const t=fs.readFileSync('radar/tools/_frag4u/'+f,'utf8');code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
code+="var _o4=function(k,ids){ORDER[k]=_top(ORDER[k],ids);};\n";
for(const k in ord)code+=`_o4('${k}',${JSON.stringify(ord[k])});\n`;
fs.writeFileSync('radar/tools/_info4.json',JSON.stringify(info,null,1));
const i=src.indexOf('/* FLAGS (gerado');
fs.writeFileSync('radar/_edicao.php',src.slice(0,i)+code+'\n'+src.slice(i));
console.log(Object.keys(info).length,'frags');
