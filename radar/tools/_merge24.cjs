const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const d='radar/tools/_frag24/';
const mark="\n/* ---- Edição 07h 24/11 ---- */";
const i0=src.lastIndexOf(mark); if(i0>=0) src=src.slice(0,i0);
let code=mark+"\nEDICAO = {hora:'07h', data:'Terça, 24 de novembro de 2026'};\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};const novas=[];
for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort()){
 const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/\/\/ ED: (\w+)/)||[])[1];
 const m=t.match(/_([NU])\('([^']+)'/);ord[ed].push(m[2]);
 if(m[1]==='N'){let o;new Function('_N','_U',t)((i,x)=>{o=x},()=>{});novas.push([m[2],o]);}
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
const pri={politica:['ajuste_camara_20','mendonca_relatorio_20','bolsonaro_obstrucao_intestinal_21','messias_stf_lula_reafirma_23'],economia:['mercado_dolar_toca_r6_ajuste_camara_23','escala_6x1_20','cvm_suspende_registro_brb_refit_ambipar_23'],mundo:['russia_bomba_atomica_espaco_24','ira_cantora_chibatadas_24','ucrania_navio_russo_libia_23','bukele_haiti_18'],regioes:[]};
for(const k in ord){const top=pri[k].filter(i=>ord[k].includes(i)).concat(ord[k].filter(i=>!pri[k].includes(i)));code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(top)});\n`;}
code+="HOME_LEAD = 'ajuste_camara_20';\nHOME_ROW = ['mendonca_relatorio_20','bolsonaro_obstrucao_intestinal_21'];\n";
const giro=novas.filter(([i,o])=>o.fontes&&o.fontes[0]&&o.fontes[0][1]).map(([i,o])=>{const s=o.sub||'';return [o.t.length>90?o.t.slice(0,88).replace(/\s+\S*$/,'')+'…':o.t, s.length>170?s.slice(0,168).replace(/\s+\S*$/,'')+'…':s, o.fontes[0][0].replace(/\s*\(.*$/,''), o.fontes[0][1],'',i];});
code+="GIRO = "+JSON.stringify(giro.slice(0,16))+".concat(GIRO).slice(0,22);\n";
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(JSON.stringify(ord),giro.length);
