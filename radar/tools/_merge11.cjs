const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const d='radar/tools/_frag11/';
let code="\n/* ---- Edição 07h 22/11 ---- */\nEDICAO.hora = '07h';\nEDICAO.data = 'Domingo, 22 de novembro de 2026';\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};const novas=[];
for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort()){
 const t=fs.readFileSync(d+f,'utf8');const id=f.replace(/\.js$/,'');
 const ed=(t.match(/\/\/ ED: (\w+)/)||[])[1];ord[ed].push(id);
 if(t.includes("_N('"))novas.push([id,t]);
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
const pri={politica:['bolsonaro_obstrucao_intestinal_21','ajuste_fiscal_lula_nao_reforma_21','zanin_cidadania_pp_22','moraes_veta_celulares_visitas_22','van_hattem_20','galipolo_pf_vorcaro_20'],economia:['agenda_economica_semana_23_11','hora_extra_divisor_21','data_centers_economist_21'],mundo:['cop31_impasse_fosseis_21','chapo_isidro_sinaloa_21','israel_coalizao_20'],regioes:[]};
for(const k in ord){const top=pri[k].filter(i=>ord[k].includes(i)).concat(ord[k].filter(i=>!pri[k].includes(i)));if(top.length)code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(top)});\n`;}
code+="HOME_LEAD = 'bolsonaro_obstrucao_intestinal_21';\nHOME_ROW = ['ajuste_fiscal_lula_nao_reforma_21','hora_extra_divisor_21','cop31_impasse_fosseis_21'];\n";
code+="GIRO = ["+novas.map(([id])=>`['@@${id}','','','','','${id}']`).join(',\n')+"].concat(GIRO).slice(0,20);\n";
fs.writeFileSync('radar/tools/_giro_ids.json',JSON.stringify(novas.map(n=>n[0])));
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(JSON.stringify(ord));
