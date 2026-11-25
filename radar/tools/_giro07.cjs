const fs=require('fs');const ids=process.argv.slice(2);const out=[];
for(const id of ids){const t=fs.readFileSync('radar/tools/_f07/'+id+'.js','utf8');const S={};
 new Function('_N','_U','_F','S',t)((i,o)=>{S[i]=o},(i,o)=>{S[i]=o},x=>x,S);const o=S[id];
 const f=o.fontes[0];const s=o.resumo.split(/(?<=\.)\s/)[0];
 out.push([o.t.split(/[:,;]/)[0].slice(0,38).replace(/"/g,"'"),s+' Informa '+f[0].replace(/\s*\(.*/,'')+'.',f[0].replace(/\s*\(.*/,''),f[1],'',id]);}
console.log(JSON.stringify(out));
