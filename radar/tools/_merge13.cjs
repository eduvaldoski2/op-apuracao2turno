const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const d='radar/tools/_frag13/';
const mark="\n/* ---- Edição 07h 23/11 ---- */";
const i0=src.lastIndexOf(mark); if(i0>=0) src=src.slice(0,i0);
let code=mark+"\nEDICAO = {hora:'07h', data:'Segunda, 23 de novembro de 2026'};\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};const novas=[];
for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort()){
 const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/\/\/ ED: (\w+)/)||[])[1];
 const m=t.match(/_([NU])\('([^']+)'/);ord[ed].push(m[2]);
 if(m[1]==='N'){let o;new Function('_N','_U',t)((i,x)=>{o=x},()=>{});novas.push([m[2],o]);}
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
const pri={politica:['ajuste_camara_20','bolsonaro_obstrucao_intestinal_21','lula_sem_pressa_ministros_20','stf_gilmar_sigilo_relatorio_pf_ministros_23'],economia:['petrobras_plano_2027_2031_22','escala_6x1_20','risco_brasil_real_estagflacao_23'],mundo:['cop31_impasse_fosseis_21','eua_democratas_258_camara_22'],regioes:[]};
for(const k in ord){const top=pri[k].filter(i=>ord[k].includes(i)).concat(ord[k].filter(i=>!pri[k].includes(i)));code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(top)});\n`;}
code+="HOME_LEAD = 'ajuste_camara_20';\nHOME_ROW = ['bolsonaro_obstrucao_intestinal_21','cop31_impasse_fosseis_21','petrobras_plano_2027_2031_22'];\n";
const giro=novas.filter(([i,o])=>o.fontes&&o.fontes[0]&&o.fontes[0][1]).map(([i,o])=>{const s=o.sub||'';return [o.t.length>90?o.t.slice(0,88).replace(/\s+\S*$/,'')+'…':o.t, s.length>170?s.slice(0,168).replace(/\s+\S*$/,'')+'…':s, o.fontes[0][0].replace(/\s*\(.*$/,''), o.fontes[0][1],'',i];});
code+="GIRO = "+JSON.stringify(giro.slice(0,14))+".concat(GIRO).slice(0,20);\n";
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(JSON.stringify(ord),giro.length);
