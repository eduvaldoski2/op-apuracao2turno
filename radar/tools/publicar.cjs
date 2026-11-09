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
  const semUpd = Object.keys(flags).filter(i => flags[i] === 'atualizada' && d.S[i].semAviso !== true && (!d.S[i].upd || String(d.S[i].upd).length < 12 || d.S[i].upd === (pa.S[i] || {}).upd));
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
  destaque: { palavras: 600, veiculos: 3 },                // capa + primeira de política/economia/mundo
  tocada: { palavras: 300, veiculos: 2 },                  // toda matéria NOVA ou ATUALIZADA
  fonteUnica: { palavras: 160, maxFracao: 0.25 },          // bastidor/exclusivo/local com um só veículo (campo fonteunica:true)
  medianaTocadas: 380,
  acervo: { palavras: 250, reducao: 6 },                   // dívida de profundidade: matéria ativa abaixo disso tem de ser ampliada, ao menos 6 por edição
  lide: { min: 20, max: 85 }, paragrafoMax: 140, resumo: { min: 50, max: 120 },
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
    // lide, parágrafos e estrutura (padrão de redação)
    if (ps.length) {
      const lw = ps[0][1].split(/\s+/).filter(Boolean).length;
      if (lw < CFG.lide.min || lw > CFG.lide.max) e2.push(rot + ': o lide (1º parágrafo) tem ' + lw + ' palavras; deve ter ' + CFG.lide.min + ' a ' + CFG.lide.max + ' e trazer o fato principal. O contexto vai nos parágrafos seguintes');
      if (ATRIB.test(ps[0][1])) e2.push(rot + ': o lide começa pela fonte ("Segundo…"). Abra pelo fato: quem fez o quê, quando; a fonte entra na frase');
      const longo = ps.find(b => b[1].split(/\s+/).filter(Boolean).length > CFG.paragrafoMax);
      if (longo) e2.push(rot + ': parágrafo com mais de ' + CFG.paragrafoMax + ' palavras ("' + longo[1].slice(0, 40) + '…"). Quebre em parágrafos de 2 a 4 frases');
    }
    if (!(curtas && !ehD)) {
      if (w >= 300 && ps.length < 4) e2.push(rot + ': ' + w + ' palavras em só ' + ps.length + ' parágrafo(s); escreva ao menos 4 (lide, por que importa, desenvolvimento, o que vem agora)');
      if (w >= 450 && s.fundo.filter(b => b[0] === 'h').length < 2) e2.push(rot + ': matéria longa sem ao menos 2 intertítulos temáticos (h)');
    }
    const rw = String(s.resumo || '').split(/\s+/).filter(Boolean).length;
    if (rw < CFG.resumo.min || rw > CFG.resumo.max) e2.push(rot + ': resumo com ' + rw + ' palavras; deve ter ' + CFG.resumo.min + ' a ' + CFG.resumo.max);
    if (ps.length && String(s.resumo || '').trim() === ps[0][1].trim()) e2.push(rot + ': o resumo é igual ao 1º parágrafo; o resumo é a versão curta (fato, número central, o que está pendente), o lide é o começo do artigo');
    if (ehD) {
      const hs = s.fundo.filter(b => b[0] === 'h').map(b => b[1]);
      if (!hs.some(x => /o que vem|pr[óo]ximos passos|e agora|o que esperar/i.test(x))) e2.push(rot + ': destaque sem intertítulo "O que vem agora" (próximos passos, prazos, quem decide)');
      if (!hs.some(x => /n[ãa]o est[áa] confirmado|n[ãa]o se sabe|ainda n[ãa]o|em aberto|o que falta/i.test(x))) e2.push(rot + ': destaque sem intertítulo "O que ainda não está confirmado" (divergências e lacunas)');
      if (!s.fundo.some(b => b[0] === 'nums' || b[0] === 'tl')) e2.push(rot + ': destaque sem bloco de números (nums) ou cronologia (tl)');
    }
    // atores políticos: matéria de Mundo ou destaque político situa quem são os agentes (partido, campo ideológico, alianças, quem acusou quem)
    if (nome >= '2026-11-08-15h' && s.semAtores !== true && (s.ed === 'mundo' || (ehD && s.ed === 'politica'))) {
      const hs2 = s.fundo.filter(b => b[0] === 'h').map(b => b[1]);
      if (!hs2.some(x => /quem [ée] quem|quem s[ãa]o|os atores|mapa d|campos? (pol[íi]tic|ideol)|quem disputa|quem governa|quem acusa|alian[çc]as|os partidos|o campo/i.test(x))) e2.push(rot + ': falta o intertítulo que situa os atores políticos ("Quem é quem", "Os partidos e as alianças"…): partido e campo ideológico de cada agente, alianças locais, quem acusou quem e se é do mesmo partido (se não houver ator político, use semAtores:true)');
    }
    // estilo: clichês e adjetivação não entram; frase repetida é enchimento
    const corpo = txtBlocos(s).join(' ');
    const CLICHE = /(vale (a pena )?(destacar|ressaltar|lembrar|mencionar)|é importante (destacar|ressaltar|notar|frisar)|cabe (destacar|ressaltar|lembrar)|em suma|nesse sentido|no cen[áa]rio atual|sem sombra de d[úu]vida|bomb[áa]stic|esc[âa]ndalo (absurdo|total)|chocante|pol[êe]mica envolvendo|diante (disso|desse cen[áa]rio)|como j[áa] dito|ficou marcado|n[ãa]o poderia ser diferente)/i.exec(corpo);
    if (CLICHE) e2.push(rot + ': expressão de enchimento ou adjetivação ("' + CLICHE[0] + '"). Escreva o fato, sem adjetivo nem muleta');
    const frases = corpo.split(/(?<=[.!?])\s+/).map(x => x.trim()).filter(x => x.split(/\s+/).length >= 9);
    const rep1 = frases.find((x, k) => frases.indexOf(x) !== k);
    if (rep1) e2.push(rot + ': frase repetida no texto ("' + rep1.slice(0, 50) + '…"); é enchimento. Pesquise mais em vez de repetir');
    if (ps.length >= 4 && ps.filter(b => ATRIB.test(b[1])).length / ps.length > CFG.maxCascata) e2.push(rot + ': mais de 40% dos parágrafos começam por "Segundo X…": isso é resumo por fonte. Reescreva fato a fato, atribuindo dentro da frase');
    if (s.ed === 'mundo' && !comUrl(s).some(f => estrangeira(f[1]))) e2.push(rot + ': matéria de Mundo precisa de ao menos uma fonte fora da imprensa brasileira (agência, veículo internacional ou do país do fato)');
    if (flags[i]) {
      const dd = dia(s.hora);
      if (dd === null) e2.push(rot + ': hora deve ser "d/m" (ex.: 7/11)'); else if (dd < 0 || dd > 1) e2.push(rot + ': hora ' + s.hora + ' não é de hoje nem de ontem; matéria nova ou atualizada deve trazer a data do fato mais recente');
      const a = p2.S[i];
      if (s.ampliada === true && a && palavras(s) < 1.4 * palavras(a)) e2.push(rot + ': ampliada:true exige o fundo ao menos 40% maior que o da edição anterior (' + palavras(a) + ' → ' + palavras(s) + ' palavras)');
      if (flags[i] === 'atualizada' && a && !s.ampliada && JSON.stringify(a.fundo) !== JSON.stringify(s.fundo) && a.resumo === s.resumo) e2.push(rot + ': o fundo mudou mas o resumo ficou igual: reescreva t, sub e resumo com o estado atual da matéria');
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
  // dívida de profundidade: toda matéria ativa tem de chegar ao piso de palavras; ao menos 6 por edição saem da lista de rasas
  if (!curtas) {
    const rasa = (S, i) => S[i] && !S[i].velha && palavras(S[i]) < (S[i].fonteunica === true ? CFG.fonteUnica.palavras : CFG.acervo.palavras);
    const ativas = (D) => [...new Set(Object.values(D.ORDER).flat())];
    const antes = ant ? ativas(p2).filter(i => rasa(p2.S, i)).length : 0, agora = ativas(d).filter(i => rasa(d.S, i));
    const alvo = Math.max(0, antes - CFG.acervo.reducao);
    if (agora.length > alvo) e2.push('acervo raso: ' + agora.length + ' matéria(s) ativa(s) com menos de ' + CFG.acervo.palavras + ' palavras (a edição anterior tinha ' + antes + '; o máximo agora é ' + alvo + '). Amplie ao menos ' + (agora.length - alvo) + ' (pesquise mais fontes, escreva contexto, reações e o que vem a seguir; marque ampliada:true se não houver fato novo) ou aposente a que já esgotou: ' + agora.slice(0, 12).join(', '));
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
// O boletim é o RESUMO DO DIA: junta todas as edições do dia e escolhe o que mais pesou (radar/tools/resumo_dia.cjs).
try { const rd = require('./resumo_dia.cjs'); const mail = rd.resumoDoDia(data); if (!mail) throw new Error('sem edições do dia'); rd.gravar(mail); }
catch (e) { console.warn('AVISO: resumo do dia não gerado (' + e.message + '); usando só esta edição no boletim');
  const mail = { dia: data, hora: hh, data: d.EDICAO.data, lead: d.HOME_LEAD, order: d.ORDER, amanha: d.AMANHA || [], stories: {} };
  Object.keys(d.S).forEach(i => { const s = d.S[i]; mail.stories[i] = { ed: s.ed, reg: s.reg || '', t: s.t, sub: s.sub }; });
  fs.writeFileSync(path.join(raiz, '_dados_email.php'), "<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>\n" + JSON.stringify(mail).replace(/</g, '\\u003c')); }
const n = Object.values(flags).filter(v => v === 'novo').length, a = Object.values(flags).filter(v => v === 'atualizada').length;
console.log('OK ' + nome + ': ' + Object.keys(d.S).length + ' matérias, ' + n + ' NOVO, ' + a + ' ATUALIZADA' + (ant ? ' (vs ' + ant + ')' : ' (sem edição anterior)'));
