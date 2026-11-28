const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const d='radar/tools/_frag28_07/';
const mark="\n/* ---- Edição 07h 28/11 ---- */";
const i0=src.lastIndexOf(mark); if(i0>=0) src=src.slice(0,i0);
let code=mark+"\nEDICAO = {hora:'07h', data:'Sábado, 28 de novembro de 2026'};\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};const novas=[],todos=[];
for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort()){
 const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/\/\/ ED: (\w+)/)||[])[1];
 const m=t.match(/_([NU])\('([^']+)'/);ord[ed].push(m[2]);todos.push(m[2]);
 let o;new Function('_N','_U',t)((i,x)=>{o=x},(i,x)=>{o=x});if(m[1]==='N')novas.push([m[2],o]);
 code+=t.replace(/^\/\/ ED.*\n/gm,'')+'\n';}
const pri={politica:['haddad_casa_civil_disputa_25','flavio_emendas_dino_28','lula_ajuste_niteroi_28','alckmin_seguranca_28','stf_vaga_alcolumbre_messias_26','dark_horse_18','lula_fhc_morto_vivo_28','mauro_cid_niteroi_28','camara_protocolo_racismo_escolas_28','moraes_voos_fab_28'],
 economia:['trabuco_fazenda_26','fachin_brb_316mi_28','desemprego_outubro_51_28','superavit_outubro_52bi_28','eua_tarifa_avioes_acucar_embraer_25','bandeira_verde_dezembro_28','btg_fundo_consignados_brb_28','decimo_terceiro_30_11_23','black_friday_golpes_sinais_22'],
 mundo:['ira_bloqueio_pacific_archer_28','ucrania_drones_recorde_28','argentina_senado_paso_26','israel_eisenkot_governo_23','venezuela_gonzalez_volta_lei_28','arabia_houthis_missil_riad_28','eua_trump_cidadania_acao_gracas_28','paraguai','ue_cupula_orcamento_2028_26','brasileira_presa_russia_troca_28'],
 regioes:['rj_toffoli_divida_marco_28','mg_cleitinho_fazenda_seguranca_28','pa_santarem_emergencia_saude_fumaca_28','am_orcamento_queimadas_28','to_pf_indicia_siqueira_28','go_saneago_bloqueio_300mi_28','rj_18bpm_ocupacao_jacarepagua_28','sp_brt_abc_multa_artesp_28','ma_tjma_rescisao_brb_28']};
for(const k in ord){const top=pri[k].filter(i=>ord[k].includes(i)).concat(ord[k].filter(i=>!pri[k].includes(i)));code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(top)});\n`;}
code+="HOME_LEAD = 'trabuco_fazenda_26';\nHOME_ROW = ['haddad_casa_civil_disputa_25','flavio_emendas_dino_28','ira_bloqueio_pacific_archer_28'];\n";
const gp=[].concat(...Object.values(pri));novas.sort((a,b)=>gp.indexOf(a[0])-gp.indexOf(b[0]));
const cut=(s,n)=>s.length>n?s.slice(0,n-2).replace(/\s+\S*$/,'')+'…':s;
const giro=novas.map(([i,o])=>[cut(o.t,90),cut(o.sub||'',170),o.fontes[0][0].replace(/\s*\(.*$/,''),o.fontes[0][1],'',i]);
const pick=[];['politica','economia','mundo','regioes'].forEach(k=>pick.push(...giro.filter(g=>ord[k].includes(g[5])).slice(0,4)));
code+="GIRO = "+JSON.stringify(pick)+".concat(GIRO).slice(0,20);\n";
code+="if(S.ipca15_novembro_ibovespa_trabuco_26){S.ipca15_novembro_ibovespa_trabuco_26.velha=true;S.ipca15_novembro_ibovespa_trabuco_26.velhaMotivo='superada por trabuco_fazenda_26';}\n";
// retenção: aposenta (até 78) o que não tem fato novo há mais de 48 h
const P=JSON.parse(fs.readFileSync('radar/tools/pautas.json','utf8'));
const p0=[].concat(...P.pautas.filter(p=>p.aberta&&p.prio==='P0').map(p=>p.materias));
code+="var _manter="+JSON.stringify(todos.concat(p0))+";\n(function(){var d=function(i){var m=String(S[i].hora||'').match(/^(\\d+)\\/(\\d+)/);return m?(+m[2])*100+(+m[1]):0;};var w=function(i){return JSON.stringify(S[i].fundo||'').split(/\\s+/).length;};var c=[];Object.keys(ORDER).forEach(function(k){ORDER[k].forEach(function(i){var s=S[i];if(s&&!s.velha&&_manter.indexOf(i)<0&&d(i)<1126&&c.indexOf(i)<0)c.push(i);});});c.sort(function(a,b){return d(a)-d(b)||w(a)-w(b);});c.slice(0,78).forEach(function(i){S[i].velha=true;S[i].velhaMotivo='sem desdobramento novo desde '+(S[i].hora||'25/11');});})();\n";
if(fs.existsSync(d+'_extra.txt'))code+=fs.readFileSync(d+'_extra.txt','utf8');
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(Object.entries(ord).map(([k,v])=>k+':'+v.length).join(' '),'novas',novas.length);
