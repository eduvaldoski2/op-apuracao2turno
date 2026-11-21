<?php
// Administração do Radar do Gabinete: usuários autorizados, PLs/medidas monitoradas, temas e áreas, orientação de voto da Ordem do Dia.
header('Content-Type: text/html; charset=utf-8'); header('Cache-Control: private, no-store, max-age=0'); header('X-Robots-Tag: noindex, nofollow'); header('Referrer-Policy: same-origin');
define('GAB_OK', 1);
try {
  $cfg = __DIR__ . '/../api/config.php'; if (!is_file($cfg)) { http_response_code(503); echo 'Indisponível.'; exit; }
  require $cfg; require __DIR__ . '/../api/_conta.php'; require __DIR__ . '/_lib.php'; require __DIR__ . '/_modelo.php';
} catch (Throwable $e) { http_response_code(503); echo 'Indisponível.'; exit; }
if (!cfg('CONTA_ATIVA', false)) { http_response_code(503); echo 'Indisponível.'; exit; }

$aviso = '';
// entrada de emergência com o token de administração (mesmo token do /radar/relatorio.php): serve para o primeiro administrador marcar a si mesmo
if (($_SERVER['REQUEST_METHOD'] ?? '') === 'POST' && isset($_POST['token'])) {
  $tok = (string)$_POST['token']; $TOK = (string)cfg('TOKEN_ADMIN', '');
  if (!taxa_ok('gabtok:' . ip_hash(), 6, 900)) $aviso = 'Muitas tentativas. Aguarde alguns minutos.';
  elseif (strlen($TOK) >= 20 && $tok !== '' && hash_equals($TOK, $tok)) { gab_token_cookie_emite(); header('Location: admin.php'); exit; }
  else $aviso = 'Token inválido.';
}
$ctx = gab_ctx();
function pg_topo($t) { return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow"><title>' . gab_e($t) . '</title><link rel="stylesheet" href="app.css?v=' . @filemtime(__DIR__ . '/app.css') . '"><style>.adm h2{margin-top:30px}.adm table.t td input[type=text],.adm table.t td textarea,.adm table.t td select{width:100%;font:inherit;padding:6px;border:1px solid #ddd8ea;border-radius:3px}.adm textarea{min-height:64px}.adm .ok{color:#1f7a4d;font-weight:700}.adm .er{color:#b3261e;font-weight:700}.adm form.novo{display:grid;gap:8px;background:#fff;border:1px solid #ddd8ea;padding:12px;margin:10px 0}.adm form.novo label{font-size:14px;color:#5a5670;display:grid;gap:3px}.adm form.novo input,.adm form.novo textarea,.adm form.novo select{font:inherit;padding:8px;border:1px solid #ddd8ea;border-radius:3px}.adm .x{background:none;border:0;color:#b3261e;cursor:pointer;font:inherit;text-decoration:underline}.adm .badge{display:inline-block;background:#fff3e0;color:#7a3f00;border:1px solid #f4c98f;border-radius:999px;padding:1px 8px;font-size:12px;font-weight:700}.adm .tabela{overflow-x:auto}.adm .ori{background:#fff;border:1px solid #ddd8ea;border-left:5px solid #F08A24;padding:10px 12px;margin:10px 0}.adm .ori h4{margin:0 0 6px;font-size:15.5px}.adm .ori .l{display:flex;gap:8px;flex-wrap:wrap;align-items:center;margin-top:6px}.adm .ori textarea{width:100%;font:inherit;padding:8px;border:1px solid #ddd8ea;border-radius:3px;min-height:70px}</style></head><body class="adm">'; }
if (!$ctx) {
  echo pg_topo('Administração · Radar do Gabinete') . '<main style="max-width:520px"><h1 style="font-family:Georgia,serif;color:#2A2260">Administração do Radar</h1>'
    . '<p>Entre com sua conta da Oficina Política (pela <a href="./">página do Radar</a>) e peça a um administrador para liberar a administração, ou use o token de administração.</p>'
    . ($aviso ? '<p class="er">' . gab_e($aviso) . '</p>' : '') . '<form method="post" class="novo" autocomplete="off"><label>Token de administração<input type="password" name="token" autocomplete="off" required></label><button class="btn">Entrar</button></form></main></body></html>'; exit;
}

$db = gab_db(); $cfgm = gab_config(); $csrf = gab_csrf();
$datas = gab_datas(); $d = isset($_GET['d']) && preg_match('/^\d{4}-\d{2}-\d{2}$/', (string)$_GET['d']) && in_array($_GET['d'], $datas, true) ? $_GET['d'] : ($datas[0] ?? '');
$ed = $d ? gab_ed($d) : null;
$orient = gab_orientacoes();
$h = pg_topo('Administração · Radar do Gabinete') . '<main><p><a href="./' . ($d ? '?d=' . gab_e($d) : '') . '">← Voltar ao Radar</a> · ' . gab_e($ctx['nome']) . ($ctx['admin'] ? ' <span class="badge">administrador</span>' : ' <span class="badge">orientação de voto</span>') . '</p><h1 style="font-family:Georgia,serif;color:#2A2260;margin:6px 0">Administração do Radar</h1>';

// ---------- orientação de voto ----------
$h .= '<h2 id="orientacao" style="font-family:Georgia,serif;color:#2A2260">Ordem do Dia — orientação de voto</h2><p style="color:#5a5670;margin:0 0 6px">Registre a orientação (e o motivo) para cada matéria em pauta. Ela aparece no boletim, no PDF e no e-mail das 7h.</p>';
if ($datas) { $h .= '<p><label>Edição: <select onchange="location.search=\'?d=\'+this.value+\'#orientacao\'">'; foreach (array_slice($datas, 0, 30) as $x) $h .= '<option value="' . gab_e($x) . '"' . ($x === $d ? ' selected' : '') . '>' . gab_e(implode('/', array_reverse(explode('-', $x)))) . '</option>'; $h .= '</select></label></p>'; }
$vistos = [];
if ($ed) foreach (($ed['ordem'] ?? []) as $s) {
  $h .= '<h3>' . gab_e($s['tipo'] . ' · ' . implode('/', array_reverse(explode('-', $s['data']))) . ' · ' . $s['hora']) . '</h3>';
  if (!$s['itens']) $h .= '<p class="vazio">Sem itens lidos nesta sessão.</p>';
  foreach ($s['itens'] as $i) {
    if (isset($vistos[$i['chave']])) continue; $vistos[$i['chave']] = 1;
    $o = $orient[$i['chave']] ?? null;
    $h .= '<div class="ori" data-chave="' . gab_e($i['chave']) . '" data-rotulo="' . gab_e(mb_substr($i['titulo'], 0, 200)) . '"><h4>' . gab_e(($i['refs'][0] ?? 'Item ' . $i['ordem']) . ' · ' . ($i['discussao'] ?: $i['tramitacao'])) . (!empty($i['prazo']) ? ' <span class="badge">prazo ' . gab_e(implode('/', array_reverse(explode('-', $i['prazo'])))) . '</span>' : '') . '</h4>'
      . '<div style="font-size:14.5px;color:#3d3860">' . gab_e(mb_substr($i['titulo'], 0, 260)) . '</div>' . ($i['pareceres'] ? '<div style="font-size:13.5px;color:#5a5670;margin-top:4px"><b>Pareceres:</b> ' . gab_e($i['pareceres']) . '</div>' : '')
      . '<div class="l"><select class="voto" aria-label="Orientação de voto"><option value="">Sem orientação</option>';
    foreach (GAB_VOTOS as $k => $v) $h .= '<option value="' . $k . '"' . ($o && $o['voto'] === $k ? ' selected' : '') . '>' . gab_e($v) . '</option>';
    $h .= '</select><button class="btn salvarOri" type="button">Salvar</button><span class="stat" role="status"></span></div>'
      . '<textarea class="com" placeholder="Por que essa orientação? (comentário explicativo para o gabinete)" aria-label="Comentário explicativo">' . gab_e($o['comentario'] ?? '') . '</textarea>'
      . ($o ? '<div style="font-size:12.5px;color:#5a5670;margin-top:3px">Último registro: ' . gab_e($o['por']) . ' em ' . gab_e(date('d/m H:i', $o['ts'])) . '</div>' : '') . '</div>';
  }
}
if (!$vistos) $h .= '<p class="vazio">Nenhuma Ordem do Dia nesta edição. As sessões aparecem aqui assim que a pauta é publicada.</p>';

if ($ctx['admin']) {
  // ---------- usuários ----------
  $h .= '<h2 id="usuarios" style="font-family:Georgia,serif;color:#2A2260">Usuários</h2><p style="color:#5a5670;margin:0 0 6px">Contas da Oficina Política (cadastro normal). Marque quem pode <b>ver o boletim</b>, quem pode <b>orientar votos</b> e quem <b>administra</b>. Quem pediu acesso aparece com o selo “pediu acesso”.</p>';
  $q = trim((string)($_GET['q'] ?? ''));
  $sql = "SELECT id, nome, canal, contato, email, ultimo_login FROM usuarios WHERE status = 'ativo'"; $par = [];
  if ($q !== '') { $sql .= ' AND (nome LIKE ? OR contato LIKE ? OR email LIKE ?)'; $par = ['%' . $q . '%', '%' . $q . '%', '%' . $q . '%']; }
  $sql .= ' ORDER BY nome LIMIT 300'; $st = conta_db()->prepare($sql); $st->execute($par); $us = $st->fetchAll();
  $acs = []; foreach ($db->query('SELECT * FROM gab_acesso')->fetchAll() as $r) $acs[(int)$r['uid']] = $r;
  usort($us, function ($a, $b) use ($acs) { $pa = isset($acs[(int)$a['id']]) ? ((int)$acs[(int)$a['id']]['autorizado'] ? 1 : 0) : 2; $pb = isset($acs[(int)$b['id']]) ? ((int)$acs[(int)$b['id']]['autorizado'] ? 1 : 0) : 2; return [$pa === 0 ? 0 : 1, $a['nome']] <=> [$pb === 0 ? 0 : 1, $b['nome']]; });
  $h .= '<form method="get" style="margin:8px 0"><input type="hidden" name="d" value="' . gab_e($d) . '"><input type="text" name="q" value="' . gab_e($q) . '" placeholder="Buscar por nome, e-mail ou WhatsApp" style="font:inherit;padding:8px;border:1px solid #ddd8ea;width:min(360px,100%)"> <button class="btn sec">Buscar</button></form>';
  $h .= '<div class="tabela"><table class="t" id="tbUsu"><tr><th>Nome</th><th>Contato</th><th>Ver boletim</th><th>Orientar voto</th><th>Admin</th><th>E-mail 7h</th><th></th></tr>';
  foreach ($us as $u) {
    $a = $acs[(int)$u['id']] ?? null; $pediu = $a && !(int)$a['autorizado'] && ($a['por'] ?? '') === 'pedido';
    $h .= '<tr data-uid="' . (int)$u['id'] . '"><td>' . gab_e($u['nome']) . ($pediu ? ' <span class="badge">pediu acesso</span>' : '') . '</td><td>' . gab_e(gab_email_de($u) ?: mascara($u['canal'], $u['contato'])) . '</td>'
      . '<td><input type="checkbox" class="f-aut" aria-label="Autorizado a ver o boletim"' . ($a && (int)$a['autorizado'] ? ' checked' : '') . '></td>'
      . '<td><input type="checkbox" class="f-ori" aria-label="Pode orientar voto"' . ($a && (int)$a['orienta'] ? ' checked' : '') . '></td>'
      . '<td><input type="checkbox" class="f-adm" aria-label="Administrador"' . ($a && (int)$a['admin'] ? ' checked' : '') . '></td>'
      . '<td><input type="checkbox" class="f-eml" aria-label="Recebe o e-mail das 7h"' . (!$a || (int)$a['email'] ? ' checked' : '') . '></td>'
      . '<td><button class="btn salvarUsu" type="button">Salvar</button> <span class="stat" role="status"></span></td></tr>';
  }
  if (!$us) $h .= '<tr><td colspan="7">Nenhum usuário encontrado.</td></tr>';
  $h .= '</table></div>';

  // ---------- PLs ----------
  $h .= '<h2 id="pls" style="font-family:Georgia,serif;color:#2A2260">Projetos e medidas monitoradas</h2><p style="color:#5a5670;margin:0 0 6px">Todo aparecimento destes projetos nos diários e na Ordem do Dia vira alerta de ação no boletim.</p><div class="tabela"><table class="t" id="tbPl"><tr><th>Medida</th><th>Apelido</th><th>Nota para o gabinete</th><th>Área</th><th>Ativo</th><th></th></tr>';
  $optA = function ($sel) use ($cfgm) { $o = '<option value="">—</option>'; foreach ($cfgm['areas'] as $a) $o .= '<option' . ($a === $sel ? ' selected' : '') . '>' . gab_e($a) . '</option>'; return $o; };
  foreach ($db->query('SELECT * FROM gab_pls ORDER BY id')->fetchAll() as $p)
    $h .= '<tr data-id="' . (int)$p['id'] . '"><td><input type="text" class="f-ref" value="' . gab_e($p['ref']) . '"></td><td><input type="text" class="f-ap" value="' . gab_e($p['apelido']) . '"></td><td><textarea class="f-nt">' . gab_e($p['nota']) . '</textarea></td><td><select class="f-ar">' . $optA($p['area']) . '</select></td><td><input type="checkbox" class="f-at"' . ((int)$p['ativo'] ? ' checked' : '') . '></td><td><button class="btn salvarPl" type="button">Salvar</button> <button class="x exclPl" type="button">excluir</button> <span class="stat" role="status"></span></td></tr>';
  $h .= '</table></div><form class="novo" id="novoPl"><b>Incluir medida</b><label>Número (ex.: PL 2154/2026, PLC 86/2025, PR 1711/2026)<input name="ref" required placeholder="PL 2154/2026"></label><label>Apelido (opcional)<input name="apelido"></label><label>Nota para o gabinete (opcional)<textarea name="nota"></textarea></label><label>Área temática<select name="area">' . $optA('') . '</select></label><button class="btn">Incluir</button><span class="stat" role="status"></span></form>';

  // ---------- temas e áreas ----------
  $h .= '<h2 id="temas" style="font-family:Georgia,serif;color:#2A2260">Temas de interesse</h2><p style="color:#5a5670;margin:0 0 6px">Um termo por linha. O Radar procura os termos nos itens dos dois diários e da Ordem do Dia e agrupa o que encontrar. Os temas iniciais são sugestões para lapidar.</p><div class="tabela"><table class="t" id="tbTema"><tr><th>Tema</th><th>Termos (um por linha)</th><th>Área</th><th>Ativo</th><th></th></tr>';
  foreach ($db->query('SELECT * FROM gab_temas ORDER BY id')->fetchAll() as $t)
    $h .= '<tr data-id="' . (int)$t['id'] . '"><td><input type="text" class="f-nm" value="' . gab_e($t['nome']) . '"></td><td><textarea class="f-tm" rows="5">' . gab_e($t['termos']) . '</textarea></td><td><select class="f-ar">' . $optA($t['area']) . '</select></td><td><input type="checkbox" class="f-at"' . ((int)$t['ativo'] ? ' checked' : '') . '></td><td><button class="btn salvarTema" type="button">Salvar</button> <button class="x exclTema" type="button">excluir</button> <span class="stat" role="status"></span></td></tr>';
  $h .= '</table></div><form class="novo" id="novoTema"><b>Incluir tema</b><label>Nome<input name="nome" required></label><label>Termos (um por linha)<textarea name="termos" required></textarea></label><label>Área temática<select name="area">' . $optA('') . '</select></label><button class="btn">Incluir</button><span class="stat" role="status"></span></form>';
  $h .= '<h2 id="areas" style="font-family:Georgia,serif;color:#2A2260">Áreas temáticas</h2><p>';
  foreach ($cfgm['areas'] as $a) $h .= '<span class="badge" style="margin:2px">' . gab_e($a) . ' <button class="x exclArea" type="button" data-n="' . gab_e($a) . '" aria-label="Excluir área ' . gab_e($a) . '">×</button></span> ';
  $h .= '</p><form class="novo" id="novaArea" style="grid-template-columns:1fr auto"><label>Nova área<input name="nome" required></label><button class="btn" style="align-self:end">Incluir</button></form>';
}
$h .= '</main><script>var CSRF=' . json_encode($csrf) . ';'
  . "function api(o){return fetch('api.php',{method:'POST',headers:{'Content-Type':'application/json','X-Gab-CSRF':CSRF},body:JSON.stringify(o),credentials:'same-origin'}).then(function(r){return r.json().catch(function(){return{ok:false,erro:'resposta'}})})}
function msg(el,r){if(!el)return;el.className='stat '+(r.ok?'ok':'er');el.textContent=r.ok?' Salvo ✓':(' '+(r.mensagem||('Erro: '+(r.erro||'falha'))))}
function q(e,s){return e.querySelector(s)}
document.addEventListener('click',function(ev){var b=ev.target.closest('button');if(!b)return;var tr=b.closest('tr'),bx=b.closest('.ori'),st=(tr||bx||document).querySelector('.stat');
 if(b.classList.contains('salvarOri')){api({a:'orient_salvar',chave:bx.dataset.chave,rotulo:bx.dataset.rotulo,voto:q(bx,'.voto').value,comentario:q(bx,'.com').value}).then(function(r){msg(st,r)})}
 else if(b.classList.contains('salvarUsu')){api({a:'usuario_salvar',uid:+tr.dataset.uid,autorizado:q(tr,'.f-aut').checked,orienta:q(tr,'.f-ori').checked,admin:q(tr,'.f-adm').checked,email:q(tr,'.f-eml').checked}).then(function(r){msg(st,r);if(r.ok){q(tr,'.f-aut').checked=!!r.autorizado;q(tr,'.f-ori').checked=!!r.orienta;var p=tr.querySelector('.badge');if(p&&r.autorizado)p.remove()}})}
 else if(b.classList.contains('salvarPl')){api({a:'pl_salvar',id:+tr.dataset.id,ref:q(tr,'.f-ref').value,apelido:q(tr,'.f-ap').value,nota:q(tr,'.f-nt').value,area:q(tr,'.f-ar').value,ativo:q(tr,'.f-at').checked}).then(function(r){msg(st,r)})}
 else if(b.classList.contains('exclPl')){if(confirm('Excluir esta medida da lista?'))api({a:'pl_excluir',id:+tr.dataset.id}).then(function(){location.reload()})}
 else if(b.classList.contains('salvarTema')){api({a:'tema_salvar',id:+tr.dataset.id,nome:q(tr,'.f-nm').value,termos:q(tr,'.f-tm').value,area:q(tr,'.f-ar').value,ativo:q(tr,'.f-at').checked}).then(function(r){msg(st,r)})}
 else if(b.classList.contains('exclTema')){if(confirm('Excluir este tema?'))api({a:'tema_excluir',id:+tr.dataset.id}).then(function(){location.reload()})}
 else if(b.classList.contains('exclArea')){if(confirm('Excluir a área \"'+b.dataset.n+'\"?'))api({a:'area_excluir',nome:b.dataset.n}).then(function(){location.reload()})}});
function envia(id,acao,map){var f=document.getElementById(id);if(!f)return;f.addEventListener('submit',function(e){e.preventDefault();var o={a:acao},fd=new FormData(f);fd.forEach(function(v,k){o[k]=v});api(o).then(function(r){msg(f.querySelector('.stat'),r);if(r.ok)setTimeout(function(){location.reload()},500)})})}
envia('novoPl','pl_salvar');envia('novoTema','tema_salvar');envia('novaArea','area_salvar');
</script></body></html>";
echo $h;
