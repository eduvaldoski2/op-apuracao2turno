const fs=require('fs');let src=fs.readFileSync('radar/_edicao.php','utf8');
const d='radar/tools/_frag26_07/';
const mark="\n/* ---- Edição 07h 26/11 ---- */";
const i0=src.lastIndexOf(mark); if(i0>=0) src=src.slice(0,i0);
let code=mark+"\nEDICAO = {hora:'07h', data:'Quinta, 26 de novembro de 2026'};\n";
const ord={politica:[],economia:[],mundo:[],regioes:[]};const novas=[];
for(const f of fs.readdirSync(d).filter(f=>f.endsWith('.js')).sort()){
 const t=fs.readFileSync(d+f,'utf8');const ed=(t.match(/\/\/ ED: (\w+)/)||[])[1];
 const m=t.match(/_([NU])\('([^']+)'/);ord[ed].push(m[2]);
 if(m[1]==='N'){let o;new Function('_N','_U',t)((i,x)=>{o=x},()=>{});novas.push([m[2],o]);}
 code+=t.replace(/^\/\/ ED.*\n/gm,'')+'\n';}
const pri={politica:['congresso_pec_fiscal_pauta_25','haddad_casa_civil_disputa_25','pf_relatorios_omissoes_moraes_toffoli_25','messias_stf_lula_reafirma_23','pgr_denuncia_gayer_cota_26','pgr_gonet_penduricalhos_324mi_14_11','camara_marco_tempo_integral_26','tse_grupo_crime_organizado_26','tcu_dilma_multas_2014_26'],
 economia:['cmn_rotativo_limite_cartao_endividamento_26','eua_tarifa_avioes_acucar_embraer_25','mercado_fecha_ibovespa_166_dolar_581_25','diesel_subvencao_25','confederacoes_stf_adiar_reforma_tributaria_26','brb_caixa_celina_fazenda_nega_26'],
 mundo:['ucrania_zelensky_prazo_janeiro_25','houthis_pif_tower_20','argentina_senado_paso_26','eua_secao301_capacidade_25','paraguai','israel_eisenkot_governo_23','ue_cupula_orcamento_2028_26','espanha_debate_quatro_29n_26'],
 regioes:['rj_ruas_reajuste_primeiro_escalao_25','mg_cleitinho_divida_comissao_26','sp_saude_tarcisio_recusas_26','mt_tce_maluf_novelli_voltam_26','am_saude_divida_300mi_medicas_26','al_transicao_jhc_contas_25','rj_lins_operacao_quatro_feridos_26']};
ord.mundo=ord.mundo.filter(i=>i!=='eua_secao301_capacidade_25');ord.economia.push('eua_secao301_capacidade_25');
for(const k in ord){const top=pri[k].filter(i=>ord[k].includes(i)).concat(ord[k].filter(i=>!pri[k].includes(i)));code+=`ORDER.${k} = _top(ORDER.${k}, ${JSON.stringify(top)});\n`;}
code+="HOME_LEAD = 'congresso_pec_fiscal_pauta_25';\nHOME_ROW = ['cmn_rotativo_limite_cartao_endividamento_26','ucrania_zelensky_prazo_janeiro_25'];\n";
const gp=[].concat(...Object.values(pri));novas.sort((a,b)=>gp.indexOf(a[0])-gp.indexOf(b[0]));
const cut=(s,n)=>s.length>n?s.slice(0,n-2).replace(/\s+\S*$/,'')+'…':s;
const giro=novas.map(([i,o])=>[cut(o.t,90),cut(o.sub||'',170),o.fontes[0][0].replace(/\s*\(.*$/,''),o.fontes[0][1],'',i]);
code+="GIRO = "+JSON.stringify(giro.slice(0,16))+".concat(GIRO).slice(0,20);\n";
code+="[['eua_tarifas_china_ue_subsidios_25','superada por eua_secao301_capacidade_25'],['mercado_pec_despesas_obrigatorias_25','superada por congresso_pec_fiscal_pauta_25']].forEach(function(p){if(S[p[0]]){S[p[0]].velha=true;S[p[0]].velhaMotivo=p[1];}});\n";
if(fs.existsSync(d+'_extra.txt'))code+=fs.readFileSync(d+'_extra.txt','utf8');
fs.writeFileSync('radar/_edicao.php',src.replace(/\s*$/,'\n')+code);
console.log(Object.entries(ord).map(([k,v])=>k+':'+v.length).join(' '),'novas',novas.length);
