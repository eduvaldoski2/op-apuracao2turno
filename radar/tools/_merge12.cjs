const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const ds=['radar/tools/_frag12/','radar/tools/_frag12b/'];
const ed0=src.lastIndexOf("\n/* ---- Edição 19h 22/11 ---- */");
if(ed0>=0) src=src.slice(0,ed0);
let code="\n/* ---- Edição 19h 22/11 ---- */\nEDICAO = {hora:'19h', data:'Domingo, 22 de novembro de 2026'};\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};const novas=[];
for(const [d,f] of ds.flatMap(d=>fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort().map(f=>[d,f]))){
 const t=fs.readFileSync(d+f,'utf8');const id=f.replace(/\.js$/,'');
 const ed=(t.match(/\/\/ ED: (\w+)/)||[])[1];
 const m=t.match(/_([NU])\('([^']+)'/);ord[ed].push(m[2]);
 if(m[1]==='N'){let o;new Function('_N','_U',t)((i,x)=>{o=x},()=>{});novas.push([m[2],o]);}
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
const pri0={politica:['bolsonaro_obstrucao_intestinal_21','lula_putin_trump_xi_21','orcamento_2027_emendas_comissoes_seguro_rural_22'],economia:['petrobras_plano_2027_2031_22','nvidia_bessent_huang_retorno_22','black_friday_golpes_sinais_22'],mundo:['eua_democratas_258_camara_22','equador_el_nino_galapagos_22'],regioes:[]};
const pri={politica:['bolsonaro_obstrucao_intestinal_21','flavio_fox_news_sem_provas_22','lula_sem_pressa_ministros_20','lula_volta_giro_agenda_16_11'],economia:['petrobras_plano_2027_2031_22','nvidia_bessent_huang_retorno_22'],mundo:['cop31_impasse_fosseis_21','ar_riesgo_pais_milei_2027_22','itaipu_diretor_destituido_20'],regioes:[]};
for(const k in ord){const top=pri[k].filter(i=>ord[k].includes(i)).concat(ord[k].filter(i=>!pri[k].includes(i)));code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(top)});\n`;}
code+="HOME_LEAD = 'bolsonaro_obstrucao_intestinal_21';\nHOME_ROW = ['flavio_fox_news_sem_provas_22','cop31_impasse_fosseis_21','lula_volta_giro_agenda_16_11'];\n";
const giro=novas.filter(([i,o])=>o.fontes&&o.fontes[0]&&o.fontes[0][1]).map(([i,o])=>{const s=o.sub||'';return [o.t.length>90?o.t.slice(0,88).replace(/\s+\S*$/,'')+'…':o.t, s.length>170?s.slice(0,168).replace(/\s+\S*$/,'')+'…':s, o.fontes[0][0].replace(/\s*\(.*$/,''), o.fontes[0][1],'',i];});
code+="GIRO = "+JSON.stringify(giro.slice(0,14))+".concat(GIRO).slice(0,20);\n";
code+=JSON.stringify(JSON.parse(fs.readFileSync('radar/tools/_aposentar12.json','utf8')))+".map(function(i){return [i,S[i]];}).filter(function(x){var a=x[1];return a && !a.velha && a.reg!=='sul' && parseInt(String(a.hora||'99').split('/')[0],10)<=19;}).sort(function(p,q){return parseInt(p[1].hora,10)-parseInt(q[1].hora,10);}).slice(0,79).forEach(function(x){ x[1].velha=true; x[1].velhaMotivo='sem desdobramento novo desde '+x[1].hora; });\n";
code+="AMANHA = "+fs.readFileSync('radar/tools/_amanha.json','utf8')+";\n";
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(JSON.stringify(ord),giro.length);
