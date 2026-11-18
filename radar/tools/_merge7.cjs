const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
let code="/* ===== passada 15h (2026-11-18) ===== */\n";const ord={politica:[],economia:[],mundo:[],regioes:[]};
for(const d of ['radar/tools/_frag7/','radar/tools/_frag7u/'])for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js'))){
 const t=fs.readFileSync(d+f,'utf8');const id=f.replace(/\.js$/,'');
 if(d.endsWith('_frag7/')){if(src.includes("_N('"+id+"'"))continue;const ed=(t.match(/ED: (\w+)/)||[])[1];ord[ed].push(id);}
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
for(const k in ord)if(ord[k].length)code+=`ORDER['${k}']=_top(ORDER['${k}'],${JSON.stringify(ord[k])});\n`;
const i=src.indexOf('/* FLAGS (gerado');fs.writeFileSync('radar/_edicao.php',src.slice(0,i)+code+'\n'+src.slice(i));
console.log('merged', JSON.stringify(ord));
