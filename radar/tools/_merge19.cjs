const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const d='radar/tools/_frag19/';
const mark="\n/* ---- Edição 19h 23/11 ---- */";
const i0=src.lastIndexOf(mark); if(i0>=0) src=src.slice(0,i0);
let code=mark+"\nEDICAO = {hora:'19h', data:'Segunda, 23 de novembro de 2026'};\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};const novas=[];
for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort()){
 const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/\/\/ ED: (\w+)/)||[])[1];
 const m=t.match(/_([NU])\('([^']+)'/);ord[ed].push(m[2]);
 if(m[1]==='N'){let o;new Function('_N','_U',t)((i,x)=>{o=x},()=>{});novas.push([m[2],o]);}
 code+=t.replace(/^\/\/.*\n/gm,'')+'\n';}
const pri={politica:['ajuste_camara_20','bolsonaro_obstrucao_intestinal_21','messias_stf_lula_reafirma_23'],economia:['nvidia_bessent_huang_retorno_22','mercado_dolar_toca_r6_ajuste_camara_23','braskem_acordo_credores_us49bi_23'],mundo:['polonia_misseis_russos_21','mundo_monica_seixas_israel_23','paraguai'],regioes:[]};
for(const k in ord){const top=pri[k].filter(i=>ord[k].includes(i)).concat(ord[k].filter(i=>!pri[k].includes(i)));code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(top)});\n`;}
code+="HOME_LEAD = 'ajuste_camara_20';\nHOME_ROW = ['polonia_misseis_russos_21','mundo_monica_seixas_israel_23'];\n";
const giro=novas.filter(([i,o])=>o.fontes&&o.fontes[0]&&o.fontes[0][1]).map(([i,o])=>{const s=o.sub||'';return [o.t.length>90?o.t.slice(0,88).replace(/\s+\S*$/,'')+'…':o.t, s.length>170?s.slice(0,168).replace(/\s+\S*$/,'')+'…':s, o.fontes[0][0].replace(/\s*\(.*$/,''), o.fontes[0][1],'',i];});
code+="GIRO = "+JSON.stringify(giro.slice(0,16))+".concat(GIRO).slice(0,22);\n";
code+=`AMANHA = [
 ['Ter, 24/11','congresso','Câmara pode concluir a votação do ajuste fiscal','Os destaques ao PLP 299/2026 podem levar a votação a terça; sem mudanças no texto do Senado, o projeto segue para sanção de Lula.','https://www.camara.leg.br/noticias/1321186-camara-deve-votar-ajuste-fiscal-proposta-do-governo-pretende-economizar-r-70-bilhoes','ajuste_camara_20'],
 ['Ter, 24/11','justica','Audiência de extradição de Carla Zambelli na Itália','A greve de advogados no país pode adiar de novo a audiência que decide o pedido brasileiro de extradição da ex-deputada.','https://www.itatiaia.com.br/politica/justica-italiana-adia-audiencia-de-extradicao-de-carla-zambelli-para-24-de-novembro/','zambelli_arquivamento_19'],
 ['Ter, 24/11','economia','INSS começa a pagar benefícios de novembro','O cronograma vai até 7 de dezembro; a Justiça Federal também liberou R$ 2,77 bi em atrasados.','https://www.metropoles.com/brasil/inss-inicia-pagamento-do-13o-salario-de-aposentados-confira-datas','inss_atrasados_277bi_calendario_novembro_23'],
 ['Qua, 25/11 · 15h','mundo','Santilli faz informe ao Senado argentino','O chefe de Gabinete responde a mais de 1.200 perguntas, com o risco-país acima de 1.000 pontos.','https://www.infobae.com/politica/2026/11/22/la-turbulencia-financiera-antes-de-tiempo-que-numeros-mira-milei-y-los-planes-politicos-de-la-casa-rosada/','ar_riesgo_pais_milei_2027_22'],
 ['Qui, 26/11','mundo','Senado argentino vota a suspensão das primárias abertas (PASO)','O governo de Javier Milei conta entre 37 e 40 votos; se aprovada, a medida segue para a Câmara.','https://www.infobae.com/politica/2026/11/22/milei-en-su-trampa-el-desorden-politico-y-una-economia-en-recesion-apuntalan-la-desconfianza/','ar_riesgo_pais_milei_2027_22']
].concat(AMANHA.filter(function(a){return /30\\/11|Seg, 30|Dom, 29/.test(a[0]);}));
`;
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(JSON.stringify(ord),giro.length);
