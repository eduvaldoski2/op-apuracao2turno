// node radar/tools/_show.cjs <id> [--list ed]  -> mostra a matéria atual (t, sub, hora, resumo, fundo, fontes) ou lista ids ativos
const fs=require('fs'),vm=require('vm');
let src=fs.readFileSync('radar/_edicao.php','utf8').replace(/^<\?php[^\n]*\?>/,'');
const ctx={console,Object,Array,JSON,Math,String};vm.createContext(ctx);
try{vm.runInContext(src+'\n;this.__S=S;this.__O=ORDER;',ctx,{timeout:60000});}catch(e){console.error('ERRO',e.message);process.exit(1)}
const S=ctx.__S,O=ctx.__O;
if(process.argv[2]==='--list'){const ed=process.argv[3];(O[ed]||[]).filter(i=>S[i]&&!S[i].velha).forEach(i=>console.log(i,'|',S[i].hora,'|',(S[i].t||'').slice(0,110)));process.exit(0)}
const s=S[process.argv[2]];if(!s){console.log('id não existe');process.exit(1)}
console.log(JSON.stringify({ed:s.ed,reg:s.reg,k:s.k,hora:s.hora,t:s.t,sub:s.sub,resumo:s.resumo,fundo:s.fundo,fontes:s.fontes,velha:s.velha},null,1));
