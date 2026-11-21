// PDF do Radar por seções (jsPDF, texto real e selecionável). window.RADAR_PDF(modelo, [ids das seções])
(function () {
  'use strict';
  var ROXO = [62, 52, 126], LAR = [240, 138, 36], CINZA = [90, 86, 112], TINTA = [27, 21, 48];
  var PRIO = { acao: 'AÇÃO', acompanhar: 'ACOMPANHAR', info: 'INFORMATIVO' }, PCOR = { acao: [179, 38, 30], acompanhar: [240, 138, 36], info: [120, 116, 140] };
  var VCOR = { sim: [31, 122, 77], nao: [179, 38, 30], abstencao: [90, 86, 112], verificar: [180, 95, 6] };
  function limpa(s) {
    s = String(s == null ? '' : s).replace(/[“”„]/g, '"').replace(/[‘’]/g, "'").replace(/[–—]/g, '-').replace(/…/g, '...').replace(/[•·]/g, '-').replace(/ /g, ' ');
    return s.replace(/[^\x09\x0a\x20-\x7e¡-ÿ]/g, '');
  }
  function dBR(iso) { var m = /^(\d{4})-(\d\d)-(\d\d)/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || ''); }
  function imgData(url) {
    return new Promise(function (ok) {
      var im = new Image(); im.onload = function () { var c = document.createElement('canvas'); c.width = im.naturalWidth; c.height = im.naturalHeight; c.getContext('2d').drawImage(im, 0, 0); ok({ d: c.toDataURL('image/png'), w: im.naturalWidth, h: im.naturalHeight }); };
      im.onerror = function () { ok(null); }; im.src = url;
    });
  }
  function fonteTxt(i) {
    if (i.fonte === 'dcm') return 'DCM' + (i.caderno && i.caderno !== '1' ? ' cad. ' + i.caderno : '') + ' p.' + i.pagina;
    if (i.fonte === 'do') return 'D.O. RIO p.' + i.pagina;
    if (i.fonte === 'ordem') return 'Ordem do Dia item ' + i.ordem;
    return '';
  }

  window.RADAR_PDF = async function (R, secoes) {
    var jsPDF = window.jspdf.jsPDF, doc = new jsPDF({ unit: 'mm', format: 'a4' });
    var W = 210, H = 297, M = 15, CW = W - 2 * M, y = 0, pag = 1;
    var L1 = await imgData('/gabinetetatianaroque/img/tatiana-roque.png'), L2 = await imgData('/gabinetetatianaroque/img/radar-cor.png');
    var NOMES = {}; (window.RADAR_SECOES || []).forEach(function (s) { NOMES[s[0]] = s[1]; });

    function rodape() {
      doc.setFont('helvetica', 'normal'); doc.setFontSize(8); doc.setTextColor.apply(doc, CINZA);
      doc.text(limpa('Radar Oficina Política para o Gabinete Tatiana Roque · ' + dBR(R.data)), M, H - 8);
      doc.text(String(pag), W - M, H - 8, { align: 'right' });
    }
    function nova() { rodape(); doc.addPage(); pag++; y = M + 4; }
    function espaco(n) { if (y + n > H - 16) nova(); }
    function texto(t, o) {
      o = o || {}; var sz = o.size || 10, ind = o.indent || 0, lh = sz * 0.4 + 0.9;
      doc.setFont('helvetica', o.style || 'normal'); doc.setFontSize(sz); doc.setTextColor.apply(doc, o.cor || TINTA);
      var linhas = doc.splitTextToSize(limpa(t), CW - ind);
      linhas.forEach(function (l) { espaco(lh); doc.text(l, M + ind, y); y += lh; });
      y += (o.depois == null ? 1 : o.depois);
    }
    function secao(nome) {
      espaco(20); y += 4; doc.setFont('helvetica', 'bold'); doc.setFontSize(14); doc.setTextColor.apply(doc, ROXO); doc.text(limpa(nome), M, y);
      y += 1.8; doc.setDrawColor.apply(doc, ROXO); doc.setLineWidth(0.5); doc.line(M, y, W - M, y); y += 5;
    }
    function sub(t) { espaco(14); y += 2; texto(t.toUpperCase(), { size: 9, style: 'bold', cor: ROXO, depois: 1.5 }); }
    function vazio(t) { texto(t, { size: 9.5, cor: CINZA, depois: 2 }); }
    function card(i, opt) {
      opt = opt || {}; var pr = i.prio || 'info';
      espaco(22);
      var y0 = y;
      var sel = PRIO[pr] + '   ' + (i.rotulo || '') + '   ' + fonteTxt(i);
      texto(sel, { size: 7.5, style: 'bold', cor: PCOR[pr], indent: 3, depois: 0.6 });
      texto(i.titulo || '', { size: 10, style: 'bold', indent: 3, depois: 0.6 });
      var meta = []; if (i.autor) meta.push('Autoria: ' + i.autor); if (i.regime) meta.push(i.regime); if (i.prazo) meta.push('Prazo: ' + dBR(i.prazo)); if (i.orgao && i.fonte === 'do') meta.push(i.orgao);
      var tg = []; (i.tags || []).forEach(function (t) { var n = { tatiana: 'Tatiana Roque', cctci: 'Comissão de Ciência e Tecnologia', smcti: 'SMCTI', veto: 'Veto' }[t]; if (n) tg.push(n); }); (i.hits || []).forEach(function (h) { tg.push((h.t === 'pl' ? 'Monitorado: ' : 'Tema: ') + h.n); });
      if (i.cctci_status === 'pendente') tg.push('Parecer da CCTCI pendente');
      if (meta.length) texto(meta.join(' - '), { size: 8.5, cor: CINZA, indent: 3, depois: 0.4 });
      if (tg.length) texto(tg.join(' | '), { size: 8.5, style: 'bold', cor: ROXO, indent: 3, depois: 0.4 });
      if (i.pareceres) texto('Pareceres: ' + i.pareceres, { size: 8.5, cor: CINZA, indent: 3, depois: 0.4 });
      if (opt.texto && i.texto && i.texto.length > (i.titulo || '').length + 10) texto(i.texto.slice(0, opt.texto), { size: 8.5, indent: 3, depois: 0.4 });
      if (opt.orient) {
        var o = i.orient;
        if (o) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(9); var rot = limpa(R.votos[o.voto] || o.voto); var wv = doc.getTextWidth(rot) + 4;
          espaco(10); y += 2; doc.setFillColor.apply(doc, VCOR[o.voto] || CINZA); doc.rect(M + 3, y - 3.4, wv, 5, 'F'); doc.setTextColor(255, 255, 255); doc.text(rot, M + 5, y); doc.setTextColor.apply(doc, TINTA); y += 3.6;
          if (o.comentario) texto(o.comentario, { size: 9, indent: 3, depois: 0.4 });
          texto('Orientação registrada por ' + (o.por || '-'), { size: 7.5, cor: CINZA, indent: 3, depois: 0.4 });
        } else texto('Sem orientação de voto registrada.', { size: 8.5, cor: CINZA, indent: 3, depois: 0.4 });
      }
      doc.setDrawColor.apply(doc, PCOR[pr]); doc.setLineWidth(0.9); if (y > y0) doc.line(M, y0 - 2.8, M, y - 0.8);
      y += 2.2;
    }
    function lista(arr, opt, max) { arr.slice(0, max || 60).forEach(function (i) { card(i, opt); }); if (max && arr.length > max) vazio('... e mais ' + (arr.length - max) + ' item(ns) no diário.'); }

    // ---------- capa/cabeçalho ----------
    y = M;
    var hh = 20;
    if (L1) { var w1 = hh * L1.w / L1.h; doc.addImage(L1.d, 'PNG', M, y, w1, hh); }
    if (L2) { var h2 = 15, w2 = h2 * L2.w / L2.h; doc.addImage(L2.d, 'PNG', W - M - w2, y + 2.5, w2, h2); }
    y += hh + 7;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(17); doc.setTextColor.apply(doc, ROXO);
    doc.splitTextToSize(limpa('Radar Oficina Política para o Gabinete Tatiana Roque'), CW).forEach(function (l) { doc.text(l, M, y); y += 7; });
    doc.setFont('helvetica', 'normal'); doc.setFontSize(10.5); doc.setTextColor.apply(doc, CINZA); doc.text(limpa('Destaques dos Diários Oficiais da Câmara e Município e a agenda do dia'), M, y); y += 6;
    doc.setFont('helvetica', 'bold'); doc.setFontSize(11); doc.setTextColor.apply(doc, TINTA); doc.text(limpa(R.extenso.charAt(0).toUpperCase() + R.extenso.slice(1)), M, y); y += 3;
    doc.setDrawColor.apply(doc, LAR); doc.setLineWidth(1.2); doc.line(M, y, W - M, y); y += 3;

    var F = {
      resumo: function () { R.resumo.forEach(function (r) { texto('- ' + r.t, { size: 10, cor: r.k === 'nota' ? CINZA : TINTA, indent: 2, depois: 1.2 }); }); },
      agenda: function () {
        R.semana.forEach(function (d) {
          sub(d.dia + ' ' + dBR(d.data) + (d.data === R.data ? ' (hoje)' : ''));
          d.sessoes.forEach(function (s) { texto(s.hora + ' - ' + s.tipo + ' - Ordem do Dia (' + s.itens + ' itens)', { size: 9, style: 'bold', cor: LAR, indent: 2, depois: 0.5 }); });
          if (!d.eventos.length && !d.sessoes.length) vazio('Sem atividades divulgadas.');
          d.eventos.forEach(function (e) { texto(e.horario + '  ' + e.evento, { size: 9.5, indent: 2, depois: 0.2, style: (e.tags || []).length ? 'bold' : 'normal' }); texto(e.local + (e.iniciativa ? ' - ' + e.iniciativa : ''), { size: 8.5, cor: CINZA, indent: 6, depois: 1.2 }); });
        });
      },
      mandato: function () {
        if (R.pend_cctci.length) { sub('Aguardando parecer da Comissão de Ciência e Tecnologia (' + R.pend_cctci.length + ')'); R.pend_cctci.slice(0, 30).forEach(function (i) { texto('- ' + ((i.refs && i.refs[0]) || '') + '  ' + String(i.titulo || '').slice(0, 150) + '  [' + fonteTxt(i) + ']', { size: 9, indent: 2, depois: 0.8 }); }); }
        var base = R.mandato.filter(function (i) { return i.tipo !== 'citacao'; });
        sub('Itens do mandato (' + base.length + ')'); if (base.length) lista(base, { texto: 380 }, 60); else vazio('Nenhuma ocorrência do mandato nesta edição.');
      },
      ordem: function () {
        if (!R.ordem.length) return vazio('Nenhuma Ordem do Dia obtida para esta edição.');
        R.ordem.forEach(function (s) { sub(s.tipo + ' - ' + dBR(s.data) + ' - ' + s.hora); if (s.itens.length) lista(s.itens, { orient: true, texto: 300 }, 100); else vazio('Sessão sem itens lidos.'); });
      },
      monitorados: function () {
        if (!R.monitorados.length) return vazio('Nenhum projeto monitorado cadastrado.');
        var sem = []; R.monitorados.forEach(function (m) { if (!m.ocorrencias.length) { sem.push(m.ref + (m.apelido ? ' (' + m.apelido + ')' : '')); return; } sub(m.ref + (m.apelido ? ' - ' + m.apelido : '')); if (m.nota) vazio(m.nota); lista(m.ocorrencias, {}, 12); });
        if (sem.length) vazio('Sem movimentação hoje: ' + sem.join('; ') + '.');
      },
      tematico: function () { if (!R.tematico.length) return vazio('Nenhum tema de interesse apareceu nesta edição.'); R.tematico.forEach(function (t) { sub(t.nome + ' (' + t.total + ')'); lista(t.itens, {}, 10); }); },
      executivo: function () {
        var e = R.executivo; sub('Nomeações e exonerações de alto escalão'); if (e.nomeacoes.length) lista(e.nomeacoes, { texto: 300 }, 40); else vazio('Nenhum ato desse tipo no D.O. RIO desta edição.');
        sub('Secretaria Municipal de Ciência, Tecnologia e Inovação'); if (e.smcti.length) lista(e.smcti, { texto: 500 }, 20); else vazio('A SMCTI não aparece nesta edição.');
        sub('Decretos, leis e outros atos'); if (e.normas.length) lista(e.normas, {}, 30); else vazio('Sem decretos ou leis de destaque.');
      },
      camara: function () {
        var nomes = { pl: 'projetos de lei', plc: 'projetos de lei complementar', pr: 'projetos de resolução', pdl: 'decretos legislativos', veto: 'vetos', parecer: 'pareceres', resolucao: 'resoluções', ato: 'atos', req_info: 'requerimentos de informação', requerimento: 'requerimentos', indicacao: 'indicações', mocao: 'moções' };
        var c = R.camara, t = []; Object.keys(c.contagem).forEach(function (k) { t.push(c.contagem[k] + ' ' + (nomes[k] || k)); }); texto(t.length ? t.join(' - ') : 'Sem itens do DCM nesta edição.', { size: 10, depois: 2 });
        var it = c.itens.filter(function (i) { return i.tipo !== 'ato' && i.tipo !== 'resolucao'; }); if (it.length) { sub('Proposições'); lista(it, {}, 40); }
      },
      prazos: function () { if (!R.prazos.length) return vazio('Nenhum prazo regimental nas pautas lidas.'); R.prazos.forEach(function (p) { texto(dBR(p.data) + '  -  ' + (p.item.refs || []).join(', ') + '  ' + (p.item.titulo || '').slice(0, 130), { size: 9.5, indent: 2, depois: 1 }); }); },
      fontes: function () {
        var f = R.fontes || {}; ((f.dcm && f.dcm.cadernos) || []).forEach(function (c) { texto('DCM nº ' + c.edicao + ' - ' + c.tipo + ' ' + c.volume + (c.url ? ' - ' + c.url : ''), { size: 8.5, indent: 2, depois: 0.8 }); });
        ((f.do && f.do.edicoes) || []).forEach(function (e) { texto('D.O. RIO nº ' + e.numero + ' - ' + e.nome + (e.url ? ' - ' + e.url : ''), { size: 8.5, indent: 2, depois: 0.8 }); });
        texto('Ordem do Dia: camara.rio/atividade-parlamentar/plenario/ordem-do-dia - Agenda: camara.rio/comunicacao/agenda', { size: 8.5, indent: 2 });
        texto('Extração automática dos PDFs: confira no diário oficial antes de agir. Gerado em ' + (R.gerado_em || '').replace('T', ' ').slice(0, 16) + '.', { size: 8.5, cor: CINZA, indent: 2 });
      }
    };
    (window.RADAR_SECOES || []).forEach(function (s) { if (secoes.indexOf(s[0]) >= 0) { secao(NOMES[s[0]]); F[s[0]](); } });
    rodape();
    doc.save('radar-gabinete-tatiana-roque-' + R.data + '.pdf');
  };
})();
