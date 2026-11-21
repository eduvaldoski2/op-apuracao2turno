const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const dirs=['radar/tools/_frag8/','radar/tools/_frag9/','radar/tools/_frag10/'];
let code="\n/* ---- Edição 19h 21/11 ---- */\nEDICAO.hora = '19h';\nEDICAO.data = 'Sábado, 21 de novembro de 2026';\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};
for(const d of dirs)for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort()){
 const t=fs.readFileSync(d+f,'utf8');const id=f.replace(/\.js$/,'');
 const ed=(t.match(/ED: (\w+)/)||[])[1]||(t.match(/ed:'(\w+)'/)||[])[1];
 const m=t.match(/ed:\s*'(\w+)'/);const e2=m?m[1]:ed;
 ord[e2].push(id);
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
for(const k in ord)if(ord[k].length)code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(ord[k])});\n`;
code+=fs.readFileSync('radar/tools/_tail8.js','utf8');
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(JSON.stringify(ord));
