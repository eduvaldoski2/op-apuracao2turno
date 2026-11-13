<?php
// E-mails do Radar da Oficina Política: compartilhar matéria por e-mail e boletim diário.
// Usa o SMTP do site (smtp_envia, de api/_conta.php, só chamada). Todo e-mail leva link de descadastro de um clique e List-Unsubscribe.
require_once __DIR__ . '/_track.php';

const RADAR_SITE = 'https://oficinapolitica.com.br';
function radar_e($s) { return htmlspecialchars((string)$s, ENT_QUOTES, 'UTF-8'); }
function radar_b64($s) { return rtrim(strtr(base64_encode($s), '+/', '-_'), '='); }
function radar_tok($arr) { $p = radar_b64(json_encode($arr)); return $p . '.' . substr(hash_hmac('sha256', $p, radar_segredo()), 0, 24); }
function radar_untok($t) {
  $x = explode('.', (string)$t, 2); if (count($x) !== 2 || radar_segredo() === '') return null;
  if (!hash_equals(substr(hash_hmac('sha256', $x[0], radar_segredo()), 0, 24), $x[1])) return null;
  $j = json_decode(base64_decode(strtr($x[0], '-_', '+/')), true); return is_array($j) ? $j : null;
}
function radar_url_sair($arr) { return RADAR_SITE . '/radar/sair.php?t=' . radar_tok($arr); }

// Envia uma mensagem multipart (texto + HTML) com cabeçalhos de descadastro.
function radar_mail($para, $assunto, $texto, $html, $urlSair) {
  $c = cfg('CONTA', []); $de = $c['email_de'] ?? 'contato@oficinapolitica.com.br';
  if (!filter_var($de, FILTER_VALIDATE_EMAIL) || !filter_var($para, FILTER_VALIDATE_EMAIL)) return false;
  $b = '=_op' . bin2hex(random_bytes(8));
  $h = 'From: ' . mb_encode_mimeheader('Oficina Política', 'UTF-8', 'B') . " <$de>\r\nReply-To: $de\r\nMIME-Version: 1.0\r\nContent-Type: multipart/alternative; boundary=\"$b\"\r\n"
     . "List-Unsubscribe: <$urlSair>, <mailto:$de?subject=SAIR>\r\nList-Unsubscribe-Post: List-Unsubscribe=One-Click\r\nPrecedence: bulk\r\nX-Auto-Response-Suppress: OFResponse\r\n";
  $corpo = "--$b\r\nContent-Type: text/plain; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($texto))
         . "--$b\r\nContent-Type: text/html; charset=UTF-8\r\nContent-Transfer-Encoding: base64\r\n\r\n" . chunk_split(base64_encode($html)) . "--$b--";
  $ass = mb_encode_mimeheader($assunto, 'UTF-8', 'B', "\r\n"); $sm = $c['smtp'] ?? [];
  if (!empty($sm['host']) && !empty($sm['user']) && !empty($sm['pass'])) return smtp_envia($sm, $de, $para, $ass, $h, $corpo);
  return @mail($para, $ass, $corpo, $h, '-f' . $de);
}

// ---------- peças de layout (HTML de e-mail: tabelas e estilos em linha) ----------
const RC_LOGO = RADAR_SITE . '/img/radar-negativo-email.png';
function rc_serif() { return "font-family:'DM Serif Display',Georgia,'Times New Roman',serif;font-weight:400"; }
function rc_btn($txt, $url, $bg = '#F08A24', $fg = '#2a1700') {
  return '<table role="presentation" cellpadding="0" cellspacing="0"><tr><td style="background:' . $bg . ';border-radius:4px"><a href="' . radar_e($url) . '" style="display:inline-block;padding:13px 24px;font-weight:700;font-size:15px;color:' . $fg . ';text-decoration:none">' . radar_e($txt) . '</a></td></tr></table>';
}
function rc_casca($topo, $miolo, $preheader) {
  return '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head>'
    . '<body style="margin:0;background:#EFEBF8;font-family:\'Space Grotesk\',Arial,Helvetica,sans-serif;color:#1b1530"><div style="display:none;max-height:0;overflow:hidden;opacity:0">' . radar_e($preheader) . '</div>'
    . '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEBF8"><tr><td align="center" style="padding:24px 12px"><table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width:600px;max-width:100%;background:#FBF9F5">'
    . '<tr><td style="background:#3E347E;padding:24px 28px 20px"><img src="' . RC_LOGO . '" width="240" alt="Radar da Oficina Política" style="display:block;border:0;max-width:100%;height:auto">' . $topo . '</td></tr>'
    . '<tr><td style="background:#F08A24;height:4px;line-height:4px;font-size:0">&nbsp;</td></tr>' . $miolo . '</table></td></tr></table></body></html>';
}

// E-mail "uma matéria para você". $m = matéria (k, t, resumo), $nome = primeiro nome de quem enviou, $msg = frase opcional dele
function radar_html_compartilhar($m, $nome, $msg, $linkMateria, $urlSair) {
  $topo = '<div style="margin-top:14px;font-size:12px;letter-spacing:.14em;text-transform:uppercase;color:#D9D4F0">Uma matéria para você</div>';
  $fr = $msg !== '' ? '<tr><td style="padding:0 28px 8px"><div style="padding:12px 14px;background:#EFEBF8;border-left:4px solid #3E347E;font-size:15px;line-height:1.5;font-style:italic">“' . radar_e($msg) . '”<div style="font-style:normal;font-size:12px;color:#5d5675;margin-top:4px">mensagem de ' . radar_e($nome) . '</div></div></td></tr>' : '';
  $mi = '<tr><td style="padding:28px 28px 8px;font-size:16px;line-height:1.5"><b>' . radar_e($nome) . '</b> compartilhou uma matéria do Radar com você.</td></tr>' . $fr
    . '<tr><td style="padding:18px 28px 0"><div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b45f06">' . radar_e($m['k']) . '</div>'
    . '<div style="' . rc_serif() . ';font-size:28px;line-height:1.15;color:#2A2260;margin:6px 0 10px">' . radar_e($m['t']) . '</div>'
    . '<div style="font-size:16px;line-height:1.55;color:#3d3860;margin-bottom:20px">' . radar_e($m['resumo']) . '</div>' . rc_btn('Ler a matéria completa', $linkMateria) . '</td></tr>'
    . '<tr><td style="padding:26px 28px 6px"><div style="padding:16px 18px;background:#fff;border:1px solid #ddd8ea;font-size:14.5px;line-height:1.5"><b style="color:#3E347E">O Radar é gratuito.</b> Quatro edições por dia com as principais notícias de política, economia, regiões e mundo, com as fontes à vista. <a href="' . radar_e($linkMateria) . '" style="color:#3E347E;font-weight:700">Crie sua conta</a>.</div></td></tr>'
    . '<tr><td style="padding:18px 28px 28px;font-size:12px;line-height:1.6;color:#5d5675">Você recebeu este e-mail porque ' . radar_e($nome) . ' digitou o seu endereço no Radar da Oficina Política. Enviamos uma única mensagem e não guardamos o seu e-mail nem o incluímos em nenhuma lista.<br>'
    . '<a href="' . radar_e($urlSair) . '" style="color:#3E347E;font-weight:700;text-decoration:underline">Não quero receber e-mails do Radar</a> (um clique; bloqueamos este endereço) · <a href="' . RADAR_SITE . '/privacidade.html" style="color:#3E347E">Privacidade</a><br>Oficina Política · oficinapolitica.com.br · contato@oficinapolitica.com.br</td></tr>';
  return rc_casca($topo, $mi, $nome . ' compartilhou: ' . $m['t']);
}
function radar_texto_compartilhar($m, $nome, $msg, $linkMateria, $urlSair) {
  return $nome . " compartilhou uma matéria do Radar da Oficina Política com você.\n\n" . ($msg !== '' ? "“$msg”\n(mensagem de $nome)\n\n" : '') . $m['t'] . "\n\n" . $m['resumo'] . "\n\nLeia a matéria completa: $linkMateria\n\n"
    . "Você recebeu este e-mail porque $nome digitou o seu endereço. Enviamos uma única mensagem e não guardamos o seu e-mail.\nNão quero receber e-mails do Radar: $urlSair\n\nOficina Política · oficinapolitica.com.br\n";
}

// ---------- boletim ----------
function rc_dados() {   // dados da última edição (gerados por publicar.cjs): data, hora, lead, order, amanha, stories
  $f = __DIR__ . '/_dados_email.php'; if (!is_file($f)) return null;
  $raw = file_get_contents($f); $raw = substr($raw, (int)strpos($raw, "\n") + 1); $d = json_decode($raw, true); return is_array($d) ? $d : null;
}
const RC_COR = ['politica' => '#3E347E', 'economia' => '#1f7a5a', 'regioes' => '#b45f06', 'mundo' => '#0f5f8a'];
const RC_NOME = ['politica' => 'Política', 'economia' => 'Economia', 'regioes' => 'Regiões', 'mundo' => 'Mundo'];
const RC_REG = ['rj' => 'Rio de Janeiro', 'sp' => 'São Paulo', 'mg' => 'Minas Gerais', 'ne' => 'Nordeste', 'sul' => 'Sul', 'norte' => 'Norte', 'co' => 'Centro-Oeste'];
const RC_AM = ['congresso' => 'Congresso', 'agenda' => 'Agenda', 'economia' => 'Economia', 'justica' => 'Justiça', 'eleicao' => 'Eleição', 'mundo' => 'Mundo'];

// Seleciona o que entra no boletim de uma pessoa: cada matéria aparece uma única vez.
function radar_boletim_montar($d, $prefs) {
  $S = $d['stories']; $ord = $d['order']; $eds = $prefs['ed']; $regs = $prefs['reg'];
  $lista = [];   // editoria => ids na ordem
  foreach ($eds as $e) $lista[$e] = array_values(array_filter($ord[$e] ?? [], fn($i) => isset($S[$i])));
  if ($regs) { $r = []; foreach ($regs as $g) { foreach ($ord['regioes'] ?? [] as $i) if (isset($S[$i]) && ($S[$i]['reg'] ?? '') === $g) { $r[] = $i; break; } } $lista['regioes'] = $r; }
  $usados = []; $destaque = null;
  $lead = $d['lead'] ?? '';
  if ($lead !== '' && isset($S[$lead])) $destaque = $lead;   // manchete da edição mais recente, de qualquer editoria (inclusive regional)
  if (!$destaque) foreach ($lista as $e => $ids) if ($e !== 'regioes' && in_array($lead, $ids, true)) { $destaque = $lead; break; }
  if (!$destaque) foreach ($lista as $e => $ids) if ($ids) { $destaque = $ids[0]; break; }
  if ($destaque) $usados[] = $destaque;
  $apoio = [];   // até 2, de editorias diferentes da do destaque
  $edDest = $destaque ? $S[$destaque]['ed'] : '';
  foreach ($lista as $e => $ids) { if (count($apoio) >= 2 || $e === $edDest || $e === 'regioes') continue; foreach ($ids as $i) if (!in_array($i, $usados, true)) { $apoio[] = $i; $usados[] = $i; break; } }
  $max = ['politica' => 5, 'economia' => 3, 'mundo' => 3, 'regioes' => 7]; $blocos = [];
  foreach ($lista as $e => $ids) { $rest = array_values(array_filter($ids, fn($i) => !in_array($i, $usados, true))); $rest = array_slice($rest, 0, $max[$e] ?? 3); if ($rest) $blocos[$e] = $rest; }
  return ['destaque' => $destaque, 'apoio' => $apoio, 'blocos' => $blocos];
}
function rc_corta($s, $n) {   // corta em fim de palavra
  $s = trim((string)$s); if (mb_strlen($s) <= $n) return $s;
  $c = mb_substr($s, 0, $n - 1); $p = mb_strrpos($c, ' '); if ($p !== false && $p > $n * 0.6) $c = mb_substr($c, 0, $p);
  return rtrim($c, " ,;:.") . '…';
}
// "Resumo do dia": os dados vêm de todas as edições do dia (radar/tools/resumo_dia.cjs), na versão mais recente de cada matéria.
function radar_html_boletim($d, $sel, $nome, $prefs, $urlSair) {
  $S = $d['stories']; $link = fn($id) => RADAR_SITE . '/radar/?utm_source=boletim&utm_medium=email&utm_campaign=diario&m=' . rawurlencode($id) . '#materia-' . rawurlencode($id);
  $serif = rc_serif();
  $topo = '<div style="margin-top:16px;' . $serif . ';font-size:30px;line-height:1.1;color:#fff">Resumo do dia</div><div style="margin-top:4px;font-size:13px;color:#D9D4F0">' . radar_e($d['data']) . '</div>';
  $ne = count($d['edicoes'] ?? []); $nt = (int)($d['tocadas'] ?? 0);
  $conta = $ne > 1 && $nt > 0 ? ' O Radar publicou ' . $ne . ' edições hoje e ' . $nt . ' matérias novas ou atualizadas; estas são as que mais pesaram.' : ' Estas são as notícias que mais pesaram hoje.';
  $mi = '<tr><td style="padding:24px 28px 0;font-size:16px;line-height:1.5">Boa noite, <b>' . radar_e($nome) . '</b>.' . radar_e($conta) . '</td></tr>';
  if ($sel['destaque']) { $id = $sel['destaque'];
    $mi .= '<tr><td style="padding:20px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ddd8ea;border-top:5px solid #F08A24"><tr><td style="padding:18px 20px 20px"><div style="font-size:12px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:#b45f06">Destaque do dia · ' . radar_e(RC_NOME[$S[$id]['ed']] ?? '') . '</div>'
      . '<a href="' . radar_e($link($id)) . '" style="' . $serif . ';font-size:27px;line-height:1.13;color:#2A2260;text-decoration:none;display:block;margin:6px 0 8px">' . radar_e($S[$id]['t']) . '</a><div style="font-size:15px;line-height:1.55;color:#3d3860;margin-bottom:16px">' . radar_e($S[$id]['resumo'] ?? $S[$id]['sub']) . '</div>' . rc_btn('Ler a matéria completa', $link($id)) . '</td></tr></table></td></tr>'; }
  if ($sel['apoio']) {
    $card = function ($id) use ($S, $link, $serif) { $c = RC_COR[$S[$id]['ed']] ?? '#3E347E'; $sub = rc_corta($S[$id]['sub'], 120);
      return '<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ddd8ea;border-top:4px solid ' . $c . '"><tr><td style="padding:14px 14px 16px"><div style="font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase;color:' . $c . '">' . radar_e(RC_NOME[$S[$id]['ed']] ?? '') . '</div><a href="' . radar_e($link($id)) . '" style="' . $serif . ';font-size:19px;line-height:1.18;color:#2A2260;text-decoration:none;display:block;margin:5px 0 6px">' . radar_e($S[$id]['t']) . '</a><div style="font-size:13.5px;line-height:1.45;color:#3d3860">' . radar_e($sub) . '</div></td></tr></table>'; };
    $a = $sel['apoio'];
    $mi .= '<tr><td style="padding:12px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="' . (count($a) > 1 ? '49%' : '100%') . '" valign="top">' . $card($a[0]) . '</td>' . (count($a) > 1 ? '<td width="2%">&nbsp;</td><td width="49%" valign="top">' . $card($a[1]) . '</td>' : '') . '</tr></table></td></tr>'; }
  foreach ($sel['blocos'] as $e => $ids) { $c = RC_COR[$e] ?? '#3E347E'; $linhas = '';
    foreach ($ids as $n => $id) {
      if ($e === 'regioes') $linhas .= '<tr><td style="padding:10px 0;border-top:1px solid #e6e1f2"><span style="display:inline-block;background:#FDEBD3;color:#7a420a;font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;padding:3px 8px;border-radius:3px">' . radar_e(RC_REG[$S[$id]['reg'] ?? ''] ?? '') . '</span><br><a href="' . radar_e($link($id)) . '" style="display:block;margin-top:5px;font-size:16px;line-height:1.35;font-weight:600;color:#1b1530;text-decoration:none">' . radar_e($S[$id]['t']) . '</a><div style="margin-top:3px;font-size:13.5px;line-height:1.45;color:#5d5675">' . radar_e(rc_corta($S[$id]['sub'] ?? '', 150)) . '</div></td></tr>';
      else $linhas .= '<tr><td style="padding:10px 0;border-top:1px solid #e6e1f2"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="34" valign="top" style="' . $serif . ';font-size:24px;line-height:1;color:' . $c . '">' . ($n + 1) . '</td><td valign="top"><a href="' . radar_e($link($id)) . '" style="font-size:16px;line-height:1.35;font-weight:600;color:#1b1530;text-decoration:none">' . radar_e($S[$id]['t']) . '</a><div style="margin-top:3px;font-size:13.5px;line-height:1.45;color:#5d5675">' . radar_e(rc_corta($S[$id]['sub'] ?? '', 150)) . '</div></td></tr></table></td></tr>';
    }
    $mi .= '<tr><td style="padding:22px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#fff;border:1px solid #ddd8ea"><tr><td style="background:' . $c . ';padding:9px 18px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#fff">' . radar_e(RC_NOME[$e]) . '</td></tr><tr><td style="padding:6px 18px 14px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0">' . $linhas . '</table></td></tr></table></td></tr>';
  }
  if (!empty($d['amanha'])) { $it = '';
    foreach ($d['amanha'] as $a) $it .= '<tr><td style="padding:8px 20px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td width="112" valign="top" style="font-size:12px;font-weight:700;color:#F5A855;letter-spacing:.04em;text-transform:uppercase">' . radar_e($a[0]) . '</td><td style="font-size:15px;line-height:1.35;color:#FBF9F5"><b>' . radar_e($a[2]) . '</b><br><span style="font-size:13.5px;color:#D9D4F0">' . radar_e($a[3]) . '</span></td></tr></table></td></tr>';
    $mi .= '<tr><td style="padding:22px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#2A2260"><tr><td style="padding:16px 20px 6px;font-size:12px;font-weight:700;letter-spacing:.14em;text-transform:uppercase;color:#F5A855">👀 Para ficar de olho</td></tr>' . $it . '<tr><td style="height:12px;font-size:0">&nbsp;</td></tr></table></td></tr>'; }
  $voce = [];
  foreach ($prefs['ed'] as $e) $voce[] = RC_NOME[$e] ?? $e; if ($prefs['reg']) $voce[] = 'regiões ' . implode(', ', array_map(fn($g) => RC_REG[$g] ?? $g, $prefs['reg']));
  $mi .= '<tr><td align="center" style="padding:28px 28px 0">' . rc_btn('Abrir o Radar', RADAR_SITE . '/radar/?utm_source=boletim&utm_medium=email&utm_campaign=diario', '#3E347E', '#fff') . '</td></tr>'
    . '<tr><td style="padding:26px 28px 0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEBF8"><tr><td style="padding:16px 18px;font-size:14px;line-height:1.5;color:#3d3860;text-align:center">Você recebe: ' . radar_e(implode(', ', $voce)) . '.<br><a href="' . RADAR_SITE . '/radar/#boletim" style="color:#3E347E;font-weight:700">Mudar editorias e regiões</a></td></tr></table></td></tr>'
    . '<tr><td style="padding:18px 28px 28px;font-size:12px;line-height:1.6;color:#5d5675;text-align:center">Não quer mais receber este boletim? <a href="' . radar_e($urlSair) . '" style="color:#3E347E;font-weight:700;text-decoration:underline">Cancelar com um clique</a> (sem senha, sem formulário).<br>Você recebe este e-mail porque ativou o boletim no Radar da Oficina Política. <a href="' . RADAR_SITE . '/privacidade.html" style="color:#3E347E">Privacidade</a><br>Oficina Política · oficinapolitica.com.br · contato@oficinapolitica.com.br</td></tr>';
  return rc_casca($topo, $mi, 'O resumo do dia no Radar da Oficina Política');
}
function radar_texto_boletim($d, $sel, $nome, $urlSair) {
  $S = $d['stories']; $t = "Resumo do dia · " . $d['data'] . "\nRadar da Oficina Política\n\nBoa noite, $nome.\n\n";
  $l = fn($id) => RADAR_SITE . '/radar/?utm_source=boletim&utm_medium=email&utm_campaign=diario&m=' . rawurlencode($id) . '#materia-' . rawurlencode($id);
  if ($sel['destaque']) $t .= "DESTAQUE DO DIA: " . $S[$sel['destaque']]['t'] . "\n" . ($S[$sel['destaque']]['resumo'] ?? $S[$sel['destaque']]['sub']) . "\n" . $l($sel['destaque']) . "\n\n";
  foreach ($sel['apoio'] as $id) $t .= mb_strtoupper(RC_NOME[$S[$id]['ed']] ?? '') . ': ' . $S[$id]['t'] . "\n" . $l($id) . "\n\n";
  foreach ($sel['blocos'] as $e => $ids) { $t .= mb_strtoupper(RC_NOME[$e]) . "\n"; foreach ($ids as $id) $t .= '- ' . $S[$id]['t'] . "\n  " . rc_corta($S[$id]['sub'] ?? '', 150) . "\n  " . $l($id) . "\n"; $t .= "\n"; }
  if (!empty($d['amanha'])) { $t .= "PARA FICAR DE OLHO AMANHÃ\n"; foreach ($d['amanha'] as $a) $t .= '- ' . $a[0] . ': ' . $a[2] . ' (' . $a[3] . ")\n"; $t .= "\n"; }
  return $t . "Cancelar o boletim com um clique: $urlSair\nMudar editorias e regiões: " . RADAR_SITE . "/radar/#boletim\n\nOficina Política · oficinapolitica.com.br\n";
}
