(function () {
  'use strict';
  var R = window.RADAR, app = document.getElementById('app');
  var SECOES = [
    ['resumo', 'Resumo do dia'], ['agenda', 'Agenda da semana'], ['mandato', 'Nosso mandato'], ['ordem', 'Ordem do Dia'],
    ['monitorados', 'Projetos monitorados'], ['tematico', 'Radar temático'], ['executivo', 'Executivo (D.O. RIO)'],
    ['camara', 'Câmara em geral'], ['prazos', 'Prazos'], ['fontes', 'Fontes']
  ];
  window.RADAR_SECOES = SECOES;
  function esc(s) { return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function dBR(iso) { var m = /^(\d{4})-(\d\d)-(\d\d)/.exec(iso || ''); return m ? m[3] + '/' + m[2] + '/' + m[1] : (iso || ''); }
  var PRIO = { acao: 'Ação', acompanhar: 'Acompanhar', info: 'Informativo' };
  var TAG = { tatiana: 'Tatiana Roque', cctci: 'Comissão de Ciência e Tecnologia', smcti: 'SMCTI', veto: 'Veto', credito: 'Crédito', camara: 'Câmara', 'alto-escalao': 'Alto escalão' };
  function fonteTxt(i) {
    if (i.fonte === 'dcm') return 'DCM' + (i.caderno && i.caderno !== '1' ? ' cad. ' + i.caderno : '') + ' · p. ' + i.pagina;
    if (i.fonte === 'do') return 'D.O. RIO · p. ' + i.pagina;
    if (i.fonte === 'ordem') return 'Ordem do Dia · ' + (i.sessao || '') + ' ' + (i.hora || '') + ' · item ' + i.ordem;
    return '';
  }
  function chips(i) {
    var h = '';
    (i.tags || []).forEach(function (t) { if (TAG[t] && t !== 'alto-escalao') h += '<span class="chip t-' + esc(t) + '">' + esc(TAG[t]) + '</span>'; });
    (i.hits || []).forEach(function (x) { h += '<span class="chip hit">' + (x.t === 'pl' ? 'Monitorado: ' : 'Tema: ') + esc(x.n) + '</span>'; });
    if (i.cctci_status === 'pendente') h += '<span class="chip t-cctci">Parecer da CCTCI pendente</span>';
    return h;
  }
  function orientHtml(i) {
    var o = i.orient, pode = R.usuario.orienta || R.usuario.admin;
    var h;
    if (o) h = '<div class="orient"><span class="voto ' + esc(o.voto) + '">' + esc(R.votos[o.voto] || o.voto) + '</span>' + (o.comentario ? '<div style="margin-top:6px">' + esc(o.comentario) + '</div>' : '') + '<div class="quem">Orientação registrada por ' + esc(o.por || '—') + '</div></div>';
    else if (i.orient_outra) h = '<div class="orient sem">Sem orientação nesta fase. Em outra fase da matéria: <b>' + esc(R.votos[i.orient_outra.voto] || '') + '</b>' + (i.orient_outra.comentario ? ' — ' + esc(i.orient_outra.comentario) : '') + '</div>';
    else h = '<div class="orient sem">Sem orientação de voto registrada.</div>';
    if (pode) h += '<div style="margin-top:6px"><a href="admin.php?d=' + esc(R.data) + '#orientacao">' + (o ? 'Editar' : 'Registrar') + ' orientação</a></div>';
    return h;
  }
  function card(i, opt) {
    opt = opt || {};
    var prio = i.prio || 'info';
    var h = '<article class="card ' + esc(prio) + '"><div class="cab"><span class="chip ' + esc(prio) + '">' + esc(PRIO[prio]) + '</span>' + (i.rotulo ? '<span class="chip">' + esc(i.rotulo) + '</span>' : '') + chips(i) + '<span class="fonte">' + esc(fonteTxt(i)) + '</span></div>';
    h += '<h4>' + esc(i.titulo) + '</h4>';
    var meta = [];
    if (i.autor) meta.push('Autoria: ' + i.autor);
    if (i.regime) meta.push(i.regime);
    if (i.prazo) meta.push('Prazo: ' + dBR(i.prazo));
    if (i.orgao && i.fonte === 'do') meta.push(i.orgao);
    if (meta.length) h += '<p class="meta">' + esc(meta.join(' · ')) + '</p>';
    if (i.pareceres) h += '<p class="meta"><b>Pareceres:</b> ' + esc(i.pareceres) + '</p>';
    if (i.texto && i.texto.length > (i.titulo || '').length + 5 && !opt.semTexto) h += '<details><summary>Ver texto</summary><p>' + esc(i.texto) + '</p></details>';
    if (opt.orient) h += orientHtml(i);
    return h + '</article>';
  }
  function vazio(t) { return '<p class="vazio">' + esc(t) + '</p>'; }
  function lista(arr, opt, max) { if (!arr.length) return ''; var h = ''; arr.slice(0, max || 60).forEach(function (i) { h += card(i, opt); }); if (max && arr.length > max) h += vazio('… e mais ' + (arr.length - max) + ' item(ns) no diário.'); return h; }

  var S = {};
  S.resumo = function () { var h = '<ul class="resumo">'; R.resumo.forEach(function (r) { h += '<li class="' + (r.k === 'nota' ? 'nota' : '') + '">' + esc(r.t) + '</li>'; }); return h + '</ul>'; };
  S.agenda = function () {
    var h = '<div class="agenda">';
    R.semana.forEach(function (d) {
      h += '<div class="dia' + (d.data === R.data ? ' hoje' : '') + '"><h4>' + esc(d.dia) + ' <small>' + esc(dBR(d.data)) + (d.data === R.data ? ' · hoje' : '') + '</small></h4>';
      d.sessoes.forEach(function (s) { h += '<div class="sessao">' + esc(s.tipo) + ' · ' + esc(s.hora) + ' · Ordem do Dia (' + s.itens + ' itens)</div>'; });
      if (!d.eventos.length && !d.sessoes.length) h += '<div class="ev loc">Sem atividades divulgadas.</div>';
      d.eventos.forEach(function (e) {
        var dest = (e.tags || []).indexOf('cctci') >= 0 || (e.tags || []).indexOf('tatiana') >= 0;
        h += '<div class="ev"><span class="h">' + esc(e.horario) + '</span> ' + (dest ? '<span class="chip t-cctci">Mandato</span> ' : '') + esc(e.evento) + '<div class="loc">' + esc(e.local) + (e.iniciativa ? ' · ' + esc(e.iniciativa) : '') + '</div></div>';
      });
      h += '</div>';
    });
    return h + '</div><p class="lede" style="margin-top:8px">Fonte: agenda oficial da Câmara (camara.rio). Dias passados da semana vêm das edições anteriores.</p>';
  };
  S.mandato = function () {
    var h = '<p class="lede">Ocorrências de Tatiana Roque, da Comissão de Ciência, Tecnologia, Comunicação e Informática (vice-presidência), da SMCTI e dos projetos monitorados.</p>';
    if (R.pend_cctci.length) { h += '<h3>Aguardando parecer da Comissão de Ciência e Tecnologia (' + R.pend_cctci.length + ')</h3>'; R.pend_cctci.slice(0, 30).forEach(function (i) { h += '<article class="card acompanhar"><h4>' + esc((i.refs && i.refs[0]) || '') + ' ' + esc(String(i.titulo || '').replace(/^(PROJETO DE LEI|VETO)[^,]*?(?=DE AUTORIA|QUE|$)/i, '').slice(0, 170)) + '</h4><p class="meta">' + esc(fonteTxt(i)) + '</p></article>'; }); }
    var base = R.mandato.filter(function (i) { return i.tipo !== 'citacao'; }), cit = R.mandato.filter(function (i) { return i.tipo === 'citacao'; });
    h += base.length ? '<h3>Itens do mandato (' + base.length + ')</h3>' + lista(base, { orient: false }, 80) : (cit.length ? '' : vazio('Nenhuma ocorrência do mandato nesta edição.'));
    if (cit.length) h += '<h3>Menções em debates e listas (' + cit.length + ')</h3>' + lista(cit, {}, 25);
    return h;
  };
  S.ordem = function () {
    if (!R.ordem.length) return vazio('Nenhuma Ordem do Dia obtida para esta edição.');
    var h = '<p class="lede">Matérias em pauta e orientação de voto registrada pelo gabinete.</p>';
    R.ordem.forEach(function (s) {
      h += '<h3>' + esc(s.tipo) + ' · ' + esc(dBR(s.data)) + ' · ' + esc(s.hora) + '</h3>';
      if (s.periodo) h += '<p class="lede" style="margin:0">Pauta de ' + esc(s.periodo) + '</p>';
      h += s.itens.length ? lista(s.itens, { orient: true }, 100) : vazio('Sessão sem itens lidos.');
    });
    return h;
  };
  S.monitorados = function () {
    if (!R.monitorados.length) return vazio('Nenhum projeto monitorado cadastrado. O administrador pode incluir PLs e outras medidas.');
    var h = '', sem = [];
    R.monitorados.forEach(function (m) {
      if (!m.ocorrencias.length) { sem.push(m.ref + (m.apelido ? ' (' + m.apelido + ')' : '')); return; }
      h += '<h3>' + esc(m.ref) + (m.apelido ? ' — ' + esc(m.apelido) : '') + '</h3>' + (m.nota ? '<p class="lede" style="margin:0">' + esc(m.nota) + '</p>' : '') + lista(m.ocorrencias, { orient: false }, 12);
    });
    if (sem.length) h += '<p class="vazio">Sem movimentação hoje: ' + esc(sem.join('; ')) + '.</p>';
    return h || vazio('Nenhuma movimentação dos projetos monitorados nesta edição.');
  };
  S.tematico = function () {
    if (!R.tematico.length) return vazio('Nenhum tema de interesse apareceu nesta edição (ou nenhum tema está cadastrado).');
    var h = '';
    R.tematico.forEach(function (t) { h += '<h3>' + esc(t.nome) + ' (' + t.total + ')</h3>' + lista(t.itens, {}, 10); });
    return h;
  };
  S.executivo = function () {
    var e = R.executivo, h = '<h3>Nomeações e exonerações de alto escalão</h3><p class="lede" style="margin:0">Secretário, subsecretário, chefe de gabinete, presidentes e diretores de autarquias e estatais.</p>';
    h += e.nomeacoes.length ? lista(e.nomeacoes, { semTexto: false }, 40) : vazio('Nenhum ato desse tipo no D.O. RIO desta edição.');
    h += '<h3>Secretaria Municipal de Ciência, Tecnologia e Inovação</h3>' + (e.smcti.length ? lista(e.smcti, {}, 20) : vazio('A SMCTI não aparece nesta edição.'));
    h += '<h3>Decretos, leis e outros atos</h3>' + (e.normas.length ? lista(e.normas, {}, 30) : vazio('Sem decretos ou leis de destaque.'));
    return h;
  };
  S.camara = function () {
    var c = R.camara, h = '', nomes = { pl: 'Projetos de lei', plc: 'Projetos de lei complementar', pr: 'Projetos de resolução', pdl: 'Decretos legislativos', pelo: 'Emendas à Lei Orgânica', veto: 'Vetos', parecer: 'Pareceres de comissão', resolucao: 'Resoluções', ato: 'Atos', req_info: 'Requerimentos de informação', requerimento: 'Requerimentos', indicacao: 'Indicações', mocao: 'Moções', edital: 'Editais', errata: 'Errata', citacao: 'Citações' };
    var cont = []; Object.keys(c.contagem).forEach(function (k) { cont.push('<b>' + c.contagem[k] + '</b> ' + esc((nomes[k] || k).toLowerCase())); });
    h += cont.length ? '<p class="resumo" style="padding:0;margin:8px 0">' + cont.join(' · ') + '</p>' : vazio('Sem itens do DCM nesta edição.');
    if (c.itens.length) h += '<h3>Proposições e atos</h3>' + lista(c.itens.filter(function (i) { return i.tipo !== 'ato' && i.tipo !== 'resolucao'; }), {}, 40);
    if (c.pareceres.length) h += '<h3>Pareceres de comissões</h3>' + lista(c.pareceres, { semTexto: true }, 25);
    return h;
  };
  S.prazos = function () {
    if (!R.prazos.length) return vazio('Nenhum prazo regimental nas pautas lidas.');
    var h = '<table class="t"><tr><th>Prazo</th><th>Matéria</th></tr>';
    R.prazos.forEach(function (p) { h += '<tr><td>' + esc(dBR(p.data)) + '</td><td>' + esc((p.item.refs || []).join(', ')) + ' — ' + esc((p.item.titulo || '').slice(0, 150)) + '</td></tr>'; });
    return h + '</table>';
  };
  S.fontes = function () {
    var f = R.fontes || {}, h = '<ul>', cad = (f.dcm && f.dcm.cadernos) || [], ed = (f.do && f.do.edicoes) || [];
    cad.forEach(function (c) { h += '<li>DCM nº ' + esc(c.edicao) + ' — ' + esc(c.tipo) + ' ' + esc(c.volume) + (c.publicado_em ? ' (publicado em ' + esc(c.publicado_em.replace('T', ' ')) + ')' : '') + (c.url ? ' · <a href="' + esc(c.url) + '" target="_blank" rel="noopener">PDF</a>' : '') + '</li>'; });
    ed.forEach(function (e) { h += '<li>D.O. RIO nº ' + esc(e.numero) + ' — ' + esc(e.nome) + (e.url ? ' · <a href="' + esc(e.url) + '" target="_blank" rel="noopener">PDF</a>' : '') + '</li>'; });
    h += '<li>Ordem do Dia: <a href="https://www.camara.rio/atividade-parlamentar/plenario/ordem-do-dia" target="_blank" rel="noopener">camara.rio</a></li><li>Agenda: <a href="https://www.camara.rio/comunicacao/agenda" target="_blank" rel="noopener">camara.rio/comunicacao/agenda</a></li></ul>';
    h += '<p class="lede">Radar gerado em ' + esc((R.gerado_em || '').replace('T', ' ').slice(0, 16)) + '. Extração automática dos PDFs: confira no diário oficial antes de agir.</p>';
    return h;
  };

  function contagem(id) {
    if (id === 'mandato') return R.mandato.filter(function (i) { return i.tipo !== 'citacao'; }).length;
    if (id === 'ordem') return R.ordem.reduce(function (a, s) { return a + s.itens.length; }, 0);
    if (id === 'tematico') return R.tematico.length;
    if (id === 'monitorados') return R.monitorados.filter(function (m) { return m.ocorrencias.length; }).length;
    if (id === 'executivo') return R.executivo.nomeacoes.length;
    return 0;
  }
  function montar() {
    var h = '<header class="topo"><div class="in"><div class="logos"><img class="l1" src="/gabinetetatianaroque/img/tatiana-roque.png" alt="Vereadora Tatiana Roque"><img class="l2" src="/gabinetetatianaroque/img/radar-cor.png" alt="Radar da Oficina Política"></div>';
    h += '<div style="font-size:14px;color:#5a5670">' + esc(R.usuario.nome) + (R.usuario.admin || R.usuario.orienta ? ' · <a href="admin.php?d=' + esc(R.data) + '">Administração</a>' : '') + '</div></div></header>';
    h += '<div class="titulo"><h1>Radar Oficina Política para o Gabinete Tatiana Roque</h1><p class="sub">Destaques dos Diários Oficiais da Câmara e Município e a agenda do dia</p><p class="data">' + esc(R.extenso) + '</p></div>';
    h += '<div class="barra"><label for="selData" style="font-size:14px">Edição:</label><select id="selData">';
    R.datas.forEach(function (d) { h += '<option value="' + esc(d) + '"' + (d === R.data ? ' selected' : '') + '>' + esc(dBR(d)) + '</option>'; });
    h += '</select><button class="btn" id="btnPdf" type="button">Baixar PDF</button></div>';
    h += '<nav class="nav" aria-label="Seções"><div class="in">';
    SECOES.forEach(function (s) { var n = contagem(s[0]); h += '<a href="#s-' + s[0] + '">' + esc(s[1]) + (n ? ' <b>' + n + '</b>' : '') + '</a>'; });
    h += '</div></nav><main>';
    if (!R.tem_edicao) h += '<p class="vazio" style="margin-top:20px"><b>Sem edições dos diários nesta data</b> (fim de semana ou feriado). A agenda da semana segue abaixo.</p>';
    SECOES.forEach(function (s) { h += '<section class="sec" id="s-' + s[0] + '"><h2>' + esc(s[1]) + '</h2>' + S[s[0]]() + '</section>'; });
    h += '<p class="rodape">Radar Oficina Política · uso restrito ao gabinete da vereadora Tatiana Roque. Os dados vêm do Diário Oficial da Câmara (DCM), do D.O. RIO, da Ordem do Dia e da agenda da Câmara.</p></main>';
    h += '<dialog id="dlgPdf"><form method="dialog"><h3>Baixar PDF</h3><p style="margin:0 0 6px;font-size:14.5px;color:#5a5670">Escolha as seções que entram no PDF.</p><div class="atalhos"><button type="button" id="pdfTodas">Marcar todas</button><button type="button" id="pdfNenhuma">Limpar</button></div><div id="pdfLista"></div>';
    h += '<div class="linha"><button class="btn sec" value="cancel">Cancelar</button><button class="btn" id="pdfGo" value="go" type="button">Gerar PDF</button></div></form></dialog>';
    app.innerHTML = h;
    document.getElementById('selData').addEventListener('change', function () { location.search = '?d=' + this.value; });
    var dlg = document.getElementById('dlgPdf'), lista = document.getElementById('pdfLista');
    var salvo = null; try { salvo = JSON.parse(localStorage.getItem('gab_pdf_secoes') || 'null'); } catch (e) {}
    SECOES.forEach(function (s) { lista.insertAdjacentHTML('beforeend', '<label><input type="checkbox" value="' + s[0] + '"' + (!salvo || salvo.indexOf(s[0]) >= 0 ? ' checked' : '') + '> ' + esc(s[1]) + '</label>'); });
    document.getElementById('btnPdf').addEventListener('click', function () { if (dlg.showModal) dlg.showModal(); else dlg.setAttribute('open', ''); });
    document.getElementById('pdfTodas').addEventListener('click', function () { lista.querySelectorAll('input').forEach(function (c) { c.checked = true; }); });
    document.getElementById('pdfNenhuma').addEventListener('click', function () { lista.querySelectorAll('input').forEach(function (c) { c.checked = false; }); });
    document.getElementById('pdfGo').addEventListener('click', function () {
      var sel = []; lista.querySelectorAll('input:checked').forEach(function (c) { sel.push(c.value); });
      if (!sel.length) { alert('Marque ao menos uma seção.'); return; }
      try { localStorage.setItem('gab_pdf_secoes', JSON.stringify(sel)); } catch (e) {}
      var b = this; b.disabled = true; b.textContent = 'Gerando…';
      Promise.resolve().then(function () { return window.RADAR_PDF(R, sel); }).catch(function (e) { alert('Não foi possível gerar o PDF: ' + e.message); }).then(function () { b.disabled = false; b.textContent = 'Gerar PDF'; if (dlg.close) dlg.close(); else dlg.removeAttribute('open'); });
    });
  }
  montar();
})();
