// Publica uma edição do Radar: valida radar/_edicao.php, marca NOVO/ATUALIZADA em relação à edição
// anterior do arquivo e guarda uma cópia em radar/arquivo/AAAA-MM-DD-HHh.php.
// Uso (na raiz do repo): node radar/tools/publicar.cjs 2026-11-05 11h
const fs = require('fs'), path = require('path'), vm = require('vm'), crypto = require('crypto');
const raiz = path.join(__dirname, '..');
const arq = path.join(raiz, 'arquivo');
const fonte = path.join(raiz, '_edicao.php');
const [data, hh] = process.argv.slice(2);
const motivoArg = (process.argv.find(a => a.startsWith('--motivo=')) || '').slice(9);
const die = (m) => { console.error('ERRO: ' + m); process.exit(1); };
if (!/^\d{4}-\d{2}-\d{2}$/.test(data || '') || !/^(0[0-9]|1[0-9]|2[0-3])h$/.test(hh || '')) die('uso: node radar/tools/publicar.cjs AAAA-MM-DD HHh');
const nome = data + '-' + hh;

function carregar(txt) {
  const corpo = txt.replace(/^<\?php.*?\?>\s*/s, '');
  return vm.runInNewContext(corpo + '\n;({S:S,ED:ED,ORDER:ORDER,HOME_LEAD:HOME_LEAD,HOME_ROW:HOME_ROW,GIRO:GIRO,COLUNAS:COLUNAS,TRENDS:TRENDS,EDICAO:EDICAO,AMANHA:(typeof AMANHA==="undefined"?[]:AMANHA)})', {});
}
const txt = fs.readFileSync(fonte, 'utf8');
if (!/^<\?php if \(!defined\('RADAR_OK'\)\)/.test(txt)) die('primeira linha do _edicao.php foi alterada');
let d; try { d = carregar(txt); } catch (e) { die('sintaxe: ' + e.message); }

// validação
const regs = ['rj', 'sp', 'mg', 'ne', 'sul', 'norte', 'co'], erros = [];
if (d.EDICAO.hora !== hh) erros.push('EDICAO.hora (' + d.EDICAO.hora + ') difere de ' + hh);
Object.keys(d.ORDER).forEach(k => d.ORDER[k].forEach(i => { if (!d.S[i]) erros.push('ORDER.' + k + ': id inexistente ' + i); else if (d.S[i].ed !== k) erros.push(i + ': ed ≠ ' + k); }));
Object.keys(d.S).forEach(i => { const s = d.S[i];
  if (!d.S[i].velha && !Object.values(d.ORDER).some(l => l.includes(i))) erros.push('matéria fora do ORDER: ' + i);
  if (s.reg && !regs.includes(s.reg)) erros.push(i + ': reg inválido');
  ['t', 'sub', 'resumo', 'hora'].forEach(c => { if (!s[c]) erros.push(i + ': falta ' + c); });
  if (!Array.isArray(s.fundo) || !Array.isArray(s.fontes) || !s.fontes.length) erros.push(i + ': fundo/fontes'); });
[d.HOME_LEAD].concat(d.HOME_ROW).forEach(i => { if (!d.S[i]) erros.push('home: ' + i); });
d.GIRO.forEach(g => { if (g[5] && !d.S[g[5]]) erros.push('GIRO relacionado: ' + g[5]); });
d.COLUNAS.forEach(g => { if (g[5] && !d.S[g[5]]) erros.push('COLUNAS relacionado: ' + g[5]); });
d.TRENDS.forEach(g => { if (g[3] && !d.S[g[3]]) erros.push('TRENDS relacionado: ' + g[3]); });
if (hh === '19h' || (d.AMANHA && d.AMANHA.length)) {
  const tp = ['congresso', 'agenda', 'economia', 'justica', 'eleicao', 'mundo'];
  if (hh === '19h' && (!Array.isArray(d.AMANHA) || d.AMANHA.length < 3)) erros.push('edição das 19h exige a seção AMANHA (Para ficar de olho) com ao menos 3 itens: [quando, tipo, título, nota, url, idRel]');
  else d.AMANHA.forEach((a, n) => { if (!a[0] || !a[2] || !a[3] || String(a[3]).length < 30) erros.push('AMANHA[' + n + ']: faltam quando, título ou nota (mín. 30 caracteres)'); if (!tp.includes(a[1])) erros.push('AMANHA[' + n + ']: tipo deve ser ' + tp.join('|')); if (a[5] && !d.S[a[5]]) erros.push('AMANHA[' + n + ']: idRel inexistente'); });
}
if (erros.length) die('\n - ' + erros.join('\n - '));

// edição anterior = a mais recente do arquivo, anterior a esta
const lista = fs.existsSync(arq) ? fs.readdirSync(arq).filter(f => /^\d{4}-\d{2}-\d{2}-\d{2}h\.php$/.test(f)).map(f => f.slice(0, -4)).sort() : [];
const ant = lista.filter(n => n < nome).pop();
const hash = s => crypto.createHash('sha1').update(JSON.stringify([s.t, s.sub, s.resumo, s.fundo, (s.fontes || []).map(f => f[1])])).digest('hex');
const flags = {};
const giroFlags = {};
if (ant) {
  const pg = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8')).GIRO || [];
  const pm = {}; pg.forEach(g => { pm[g[0]] = g[1]; });
  (d.GIRO || []).forEach(g => { if (!(g[0] in pm)) giroFlags[g[0]] = 'novo'; else if (pm[g[0]] !== g[1]) giroFlags[g[0]] = 'atualizada'; });
  const p = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8'));
  Object.keys(d.S).forEach(i => { if (!p.S[i]) flags[i] = 'novo'; else if (hash(p.S[i]) !== hash(d.S[i])) flags[i] = 'atualizada'; });
}
const nN = Object.values(flags).filter(v => v === 'novo').length, nA = Object.values(flags).filter(v => v === 'atualizada').length;
if (ant && !process.argv.includes('--aceitar-poucas') && (nN < (hh === '07h' ? 15 : 5) || nN + nA < (hh === '07h' ? 25 : 10))) {
  die('edição quase igual à anterior (' + nN + ' NOVO, ' + nA + ' ATUALIZADA). Exigido: ao menos '+(hh === '07h' ? '15 NOVO e 25' : '5 NOVO e 10')+' NOVO+ATUALIZADA (a edição das 7h é a primeira do dia e precisa de mais novidades: pesquise o que saiu à noite e de madrugada). Busque mais notícias publicadas depois de ' + ant + ' em TODAS as editorias e sub-regiões. Só use --aceitar-poucas se tiver pesquisado de verdade e realmente não houver mais nada (e diga isso no resumo).');
}
// matéria ATUALIZADA precisa dizer o que mudou (campo upd) e o texto não pode repetir o da edição anterior
if (ant) {
  const pa = carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8'));
  const semUpd = Object.keys(flags).filter(i => flags[i] === 'atualizada' && (!d.S[i].upd || String(d.S[i].upd).length < 12 || d.S[i].upd === (pa.S[i] || {}).upd));
  if (semUpd.length) die('matérias ATUALIZADAS sem o campo upd novo (1–2 frases dizendo o que mudou desde a edição anterior): ' + semUpd.join(', '));
}
// a capa só pode ter matéria NOVA ou ATUALIZADA nesta edição
if (ant) {
  const naCapa = [d.HOME_LEAD].concat(d.HOME_ROW || []).filter(i => !flags[i]);
  if (naCapa.length) die('capa com matéria que não é nova nem atualizada nesta edição: ' + naCapa.join(', ') + '. Troque HOME_LEAD/HOME_ROW por matérias NOVAS ou ATUALIZADAS.');
  // matéria idêntica em várias edições seguidas está parada: aposente (velha:true) ou atualize com fato novo.
  // Até 07/11 19h eram 3 edições (levava a aposentar matéria ainda quente); a partir daí, 6 edições (cerca de um dia e meio).
  const ncorte = (nome >= '2026-11-07-19h' || process.env.RADAR_REGRAS === '1') ? 6 : 3;
  const ants = lista.filter(n => n < nome).slice(-(ncorte - 1));
  if (ants.length === ncorte - 1) {
    const ps = ants.map(n => carregar(fs.readFileSync(path.join(arq, n + '.php'), 'utf8')));
    const paradas = Object.keys(d.S).filter(i => !d.S[i].velha && !flags[i] && ps.every(p => p.S[i] && hash(p.S[i]) === hash(d.S[i])));
    if (paradas.length) die('matérias paradas há ' + ncorte + ' edições sem fato novo (' + paradas.length + '): ' + paradas.join(', ') + '. Para cada uma: acrescente o desdobramento novo (vira ATUALIZADA, com upd) ou marque velha:true com velhaMotivo (sai das editorias e continua acessível por link compartilhado).');
  }
}
// cada sub-região precisa de ao menos 5 matérias ativas (RJ, SP, MG, Nordeste, Sul, Norte, Centro-Oeste)
{
  const nomes = { rj: 'Rio de Janeiro', sp: 'São Paulo', mg: 'Minas Gerais', ne: 'Nordeste', sul: 'Sul', norte: 'Norte', co: 'Centro-Oeste' };
  const falta = Object.keys(nomes).map(r => [r, (d.ORDER.regioes || []).filter(i => d.S[i] && !d.S[i].velha && d.S[i].reg === r).length]).filter(x => x[1] < 5);
  if (falta.length && !process.argv.includes('--aceitar-poucas')) die('regiões com menos de 5 matérias: ' + falta.map(x => nomes[x[0]] + ' (' + x[1] + ')').join(', ') + '. Cada sub-região exige ao menos 5 matérias (Nordeste e Norte: cubra vários estados, não só um). Pesquise mais; só use --aceitar-poucas se realmente não houver mais nada.');
}

// ===== REGRAS DE CURADORIA E PROFUNDIDADE (valem a partir da edição de 07/11/2026 19h) =====
// Objetivo: matéria escrita como texto jornalístico único (não diário de atualizações nem resumo por fonte),
// com fontes variadas, pautas importantes acompanhadas a cada edição e sem aposentar matéria recente.
const CORTE = '2026-11-07-19h';
const NOVAS = nome >= CORTE || process.env.RADAR_REGRAS === '1';
const relaxa = process.argv.includes('--aceitar-poucas');
const curtas = process.argv.includes('--aceitar-curtas');   // último recurso: afrouxa só o piso de palavras/veículos das matérias que NÃO são destaque
const CFG = {
  piso: { politica: 10, economia: 3, mundo: 6 },          // matérias ativas por editoria
  pisoDepois: { '2026-11-09-07h': { politica: 14, economia: 4, mundo: 6 } },
  destaque: { palavras: 450, veiculos: 3 },                // capa + primeira de política/economia/mundo
  tocada: { palavras: 200, veiculos: 2 },                  // toda matéria NOVA ou ATUALIZADA
  fonteUnica: { palavras: 120, maxFracao: 0.25 },          // bastidor/exclusivo/local com um só veículo (campo fonteunica:true)
  medianaTocadas: 280,
  maxVelhasPorEdicao: 8,
  maxCascata: 0.4,                                         // parágrafos que começam por "Segundo X…"
  maxVeiculo: 0.25, minVeiculos: 12
};
if (NOVAS) {
  const e2 = [];
  const p2 = ant ? carregar(fs.readFileSync(path.join(arq, ant + '.php'), 'utf8')) : { S: {} };
  const vv = x => String(x).split(/[(:,]|\svia\s/)[0].trim().toLowerCase();
  const comUrl = s => (s.fontes || []).filter(f => f[1] && /^https?:\/\//.test(f[1]));
  const veic = s => new Set(comUrl(s).map(f => vv(f[0])));
  const BR_COM = /(^|\.)(metropoles\.com|brasil247\.com|exame\.com|jota\.info|globo\.com|oliberal\.com|oriobranco\.net|plantaobrasil\.net|revistaoeste\.com|pleno\.news|terra\.com|uol\.com)$/;
  const estrangeira = u => { try { const h = new URL(u).hostname.replace(/^www\./, ''); return !/\.br$/.test(h) && !BR_COM.test(h); } catch (e) { return false; } };
  const txtBlocos = s => (s.fundo || []).filter(b => b[0] === 'p' || b[0] === 'h').map(b => b[1]).concat((s.fundo || []).filter(b => b[0] === 'ul').flatMap(b => b[1]));
  const palavras = s => txtBlocos(s).join(' ').split(/\s+/).filter(Boolean).length;
  const ATRIB = /^(Segundo|De acordo com|Conforme|Para (o|a|os|as) [A-ZÁÉÍÓÚ]|Em (entrevista|nota|comunicado) )/;
  const dia = h => { const m = /^(\d{1,2})\/(\d{1,2})$/.exec(String(h || '')); if (!m) return null; const [Y] = data.split('-').map(Number); let dt = Date.UTC(Y, +m[2] - 1, +m[1]); const ed = Date.UTC(...data.split('-').map((x, i) => i === 1 ? +x - 1 : +x)); if (dt - ed > 30 * 864e5) dt = Date.UTC(Y - 1, +m[2] - 1, +m[1]); return Math.round((ed - dt) / 864e5); };
  const tocadas = Object.keys(flags).filter(i => !d.S[i].velha);
  const destaques = [...new Set([d.HOME_LEAD].concat(d.HOME_ROW || [], ['politica', 'economia', 'mundo'].map(k => (d.ORDER[k] || [])[0]).filter(Boolean)))].filter(i => d.S[i] && !d.S[i].velha);
  const unicas = tocadas.filter(i => d.S[i].fonteunica === true);
  if (unicas.length > Math.max(2, Math.floor(tocadas.length * CFG.fonteUnica.maxFracao))) e2.push('fonteunica:true em ' + unicas.length + ' matérias novas/atualizadas (máx. 25%): ' + unicas.join(', '));
  new Set(tocadas.concat(destaques)).forEach(i => {
    const s = d.S[i], ehD = destaques.includes(i), w = palavras(s), nv = veic(s).size, uni = s.fonteunica === true && !ehD;
    const minW = ehD ? CFG.destaque.palavras : uni ? CFG.fonteUnica.palavras : CFG.tocada.palavras;
    const minV = ehD ? CFG.destaque.veiculos : uni ? 1 : CFG.tocada.veiculos;
    const rot = i + (ehD ? ' [destaque]' : '');
    if (!s.fundo.length || s.fundo[0][0] !== 'p') e2.push(rot + ': o fundo deve começar por parágrafo com o lide (fato principal, quem, o quê, quando)');
    const diario = (s.fundo || []).filter(b => b[0] === 'h' && /^(atualiza[çc][ãa]o|\d{1,2}h\b|[àa]s \d)/i.test(b[1]));
    if (diario.length) e2.push(rot + ': o fundo tem intertítulo de diário ("' + diario[0][1] + '"). Reescreva a matéria inteira como um texto único com o estado atual; não acrescente blocos "Atualização das Xh"');
    if (!(curtas && !ehD)) {
      if (w < minW) e2.push(rot + ': fundo com ' + w + ' palavras (mínimo ' + minW + ')');
      if (nv < minV) e2.push(rot + ': ' + nv + ' veículo(s) distinto(s) com link (mínimo ' + minV + ')');
    }
    const ps = s.fundo.filter(b => b[0] === 'p');
    if (ps.length >= 4 && ps.filter(b => ATRIB.test(b[1])).length / ps.length > CFG.maxCascata) e2.push(rot + ': mais de 40% dos parágrafos começam por "Segundo X…": isso é resumo por fonte. Reescreva fato a fato, atribuindo dentro da frase');
    if (s.ed === 'mundo' && !comUrl(s).some(f => estrangeira(f[1]))) e2.push(rot + ': matéria de Mundo precisa de ao menos uma fonte fora da imprensa brasileira (agência, veículo internacional ou do país do fato)');
    if (flags[i]) {
      const dd = dia(s.hora);
      if (dd === null) e2.push(rot + ': hora deve ser "d/m" (ex.: 7/11)'); else if (dd < 0 || dd > 1) e2.push(rot + ': hora ' + s.hora + ' não é de hoje nem de ontem; matéria nova ou atualizada deve trazer a data do fato mais recente');
      const a = p2.S[i];
      if (flags[i] === 'atualizada' && a && JSON.stringify(a.fundo) !== JSON.stringify(s.fundo) && a.resumo === s.resumo) e2.push(rot + ': o fundo mudou mas o resumo ficou igual: reescreva t, sub e resumo com o estado atual da matéria');
    }
  });
  // conjunto da edição: mediana, concentração e variedade de fontes
  if (tocadas.length >= 5 && !curtas) {
    const ws = tocadas.map(i => palavras(d.S[i])).sort((a, b) => a - b), med = ws[ws.length >> 1];
    if (med < CFG.medianaTocadas) e2.push('mediana do fundo das matérias novas/atualizadas é ' + med + ' palavras (mínimo ' + CFG.medianaTocadas + '). Aprofunde: lide, contexto, desdobramentos, o que vem a seguir');
    const cont = {}; let tot = 0;
    tocadas.forEach(i => comUrl(d.S[i]).forEach(f => { const k = vv(f[0]); cont[k] = (cont[k] || 0) + 1; tot++; }));
    const top = Object.entries(cont).sort((a, b) => b[1] - a[1])[0];
    if (Object.keys(cont).length < CFG.minVeiculos) e2.push('só ' + Object.keys(cont).length + ' veículos diferentes nas matérias novas/atualizadas (mínimo ' + CFG.minVeiculos + '). Amplie as fontes (veja radar/tools/FONTES.md)');
    if (tot >= 20 && top && top[1] / tot > CFG.maxVeiculo) e2.push('concentração de fontes: ' + top[0] + ' responde por ' + Math.round(100 * top[1] / tot) + '% das citações (máx. ' + Math.round(100 * CFG.maxVeiculo) + '%)');
  }
  // retirada de matéria (velha): limitada, e matéria de ontem/hoje só sai com motivo
  const novasVelhas = Object.keys(d.S).filter(i => d.S[i].velha && p2.S[i] && !p2.S[i].velha);
  if (novasVelhas.length > CFG.maxVelhasPorEdicao) e2.push('foram aposentadas ' + novasVelhas.length + ' matérias nesta edição (máx. ' + CFG.maxVelhasPorEdicao + '). Matéria só envelhece depois de 48 h sem fato novo; o que ainda tem desdobramento fica e é atualizado');
  novasVelhas.forEach(i => { const dd = dia(d.S[i].hora); if (dd !== null && dd <= 1 && !(typeof d.S[i].velhaMotivo === 'string' && d.S[i].velhaMotivo.length >= 12)) e2.push(i + ': matéria de ' + d.S[i].hora + ' aposentada sem velhaMotivo (fato encerrado ou "superada por <id>")'); });
  // piso de matérias ativas por editoria
  let piso = Object.assign({}, CFG.piso); Object.keys(CFG.pisoDepois).sort().forEach(k => { if (nome >= k) piso = CFG.pisoDepois[k]; });
  const abaixo = Object.keys(piso).map(k => [k, (d.ORDER[k] || []).filter(i => d.S[i] && !d.S[i].velha).length]).filter(x => x[1] < piso[x[0]]);
  const pisoErro = abaixo.length ? 'poucas matérias ativas: ' + abaixo.map(x => x[0] + ' ' + x[1] + '/' + piso[x[0]]).join(', ') + '. Recoloque no ORDER matéria ainda quente das últimas 48 h (tire velha:true) ou escreva novas' : '';
  // pautas em curso e varreduras obrigatórias (radar/tools/pautas.json)
  const pj = path.join(__dirname, 'pautas.json'); let PJ = null;
  try { PJ = JSON.parse(fs.readFileSync(pj, 'utf8')); } catch (e) { e2.push('radar/tools/pautas.json ausente ou inválido: ' + e.message); }
  if (PJ) {
    const vf = (PJ.varredura || []).filter(v => v.feita !== nome || !v.achado || String(v.achado).length < 3);
    if (vf.length) e2.push(vf.length + ' varredura(s) de pautas.json sem registro nesta edição (faça a busca e preencha feita:"' + nome + '" e achado, que pode ser "nada novo"): ' + vf.map(v => v.tema.split(':')[0] + ':' + (v.tema.split(':')[1] || '').trim().slice(0, 30)).join(' | '));
    const naoVerif = [];
    (PJ.pautas || []).forEach(p => {
      if (!p.aberta) { if (!p.motivo) e2.push('pauta ' + p.id + ' fechada sem motivo'); return; }
      if (!['P0', 'P1', 'P2'].includes(p.prio)) e2.push('pauta ' + p.id + ': prio deve ser P0, P1 ou P2');
      const ms = p.materias || [];
      if (p.prio !== 'P2') {
        if (p.verificada !== nome) naoVerif.push(p.id + ' (' + p.prio + ')');
        if (!p.ultimo_fato || String(p.ultimo_fato).length < 10) e2.push('pauta ' + p.id + ': ultimo_fato vazio');
        if (!ms.length || ms.some(i => !d.S[i])) e2.push('pauta ' + p.id + ': materias inexistentes ou vazias');
        else if (p.prio === 'P0' && ms.some(i => d.S[i].velha)) e2.push('pauta P0 ' + p.id + ' com matéria aposentada: reative-a (tire velha:true) ou feche a pauta');
        else if (p.fato_novo === true && !ms.some(i => flags[i])) e2.push('pauta ' + p.id + ' tem fato novo, mas nenhuma matéria dela é NOVA ou ATUALIZADA nesta edição');
      }
    });
    if (naoVerif.length) e2.push(naoVerif.length + ' pauta(s) aberta(s) sem verificação nesta edição: busque o fato mais recente de cada uma e atualize verificada:"' + nome + '", ultimo_fato e fato_novo (ou feche com aberta:false e motivo): ' + naoVerif.join(', '));
  }
  if (pisoErro) { if (relaxa) console.warn('AVISO (relaxado): ' + pisoErro); else e2.push(pisoErro); }
  if (e2.length) die('regras de curadoria e profundidade (radar/tools/INSTRUCOES.md):\n - ' + e2.join('\n - '));
  if (relaxa || curtas) {
    const usados = [relaxa ? '--aceitar-poucas' : '', curtas ? '--aceitar-curtas' : ''].filter(Boolean).join(' ');
    if (motivoArg.length < 20) die(usados + ' exige --motivo="…" (mín. 20 caracteres) explicando o que foi pesquisado e por que não foi possível cumprir a regra; o motivo vai para radar/arquivo/_avisos.log');
    fs.mkdirSync(arq, { recursive: true });
    fs.appendFileSync(path.join(arq, '_avisos.log'), nome + ' · ' + usados + ' · ' + motivoArg + '\n');
  }
}
const bloco = '/* FLAGS (gerado por publicar.js; não editar) */\nvar FLAGS = ' + JSON.stringify(flags) + ';\nvar GIRO_FLAGS = ' + JSON.stringify(giroFlags) + ';\n';
let novo = txt.replace(/\/\* FLAGS \(gerado[^\n]*\nvar FLAGS = [^\n]*\n(var GIRO_FLAGS = [^\n]*\n)?/, '');
if (!novo.includes('/* ===== FIM DOS DADOS ===== */')) die('marcador FIM DOS DADOS ausente');
novo = novo.replace('/* ===== FIM DOS DADOS ===== */', bloco + '/* ===== FIM DOS DADOS ===== */');
fs.mkdirSync(arq, { recursive: true });
fs.writeFileSync(fonte, novo);
fs.writeFileSync(path.join(arq, nome + '.php'), novo);
// versão por matéria, usada para abrir ao visitante a matéria que alguém compartilhou (só com código de quem enviou)
const pub = {}; Object.keys(d.S).forEach(i => { const s = d.S[i]; pub[i] = { k: s.k, t: s.t, sub: s.sub, resumo: s.resumo, fundo: s.fundo, fontes: s.fontes, hora: s.hora }; });
fs.writeFileSync(path.join(raiz, '_publico.php'), "<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>\n" + JSON.stringify(pub).replace(/</g, '\\u003c'));
// dados para o boletim por e-mail (lidos pelo cron em PHP): só o necessário
const mail = { dia: data, hora: hh, data: d.EDICAO.data, lead: d.HOME_LEAD, order: d.ORDER, amanha: d.AMANHA || [], stories: {} };
Object.keys(d.S).forEach(i => { const s = d.S[i]; mail.stories[i] = { ed: s.ed, reg: s.reg || '', t: s.t, sub: s.sub }; });
fs.writeFileSync(path.join(raiz, '_dados_email.php'), "<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>\n" + JSON.stringify(mail).replace(/</g, '\\u003c'));
const n = Object.values(flags).filter(v => v === 'novo').length, a = Object.values(flags).filter(v => v === 'atualizada').length;
console.log('OK ' + nome + ': ' + Object.keys(d.S).length + ' matérias, ' + n + ' NOVO, ' + a + ' ATUALIZADA' + (ant ? ' (vs ' + ant + ')' : ' (sem edição anterior)'));
