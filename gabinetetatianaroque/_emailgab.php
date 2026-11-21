<?php
// E-mail diário (7h) do Radar do Gabinete. Layout em tabelas e estilos em linha, como os e-mails do Radar.
if (!defined('GAB_OK')) { http_response_code(404); exit; }
const GAB_SITE = 'https://oficinapolitica.com.br';

function gab_email_html(array $m, $urlSair) {
  $e = 'gab_e'; $url = GAB_SITE . '/' . GAB_SLUG . '/?d=' . $m['data'];
  $h2 = fn($t) => '<h2 style="font:400 21px Georgia,serif;color:#2A2260;margin:26px 0 8px;padding-bottom:5px;border-bottom:2px solid #3E347E">' . $e($t) . '</h2>';
  $item = function ($t, $linhas = [], $cor = '#F08A24') use ($e) { $o = '<div style="border-left:4px solid ' . $cor . ';background:#fff;padding:8px 11px;margin:8px 0"><div style="font-weight:700;font-size:15px;line-height:1.35">' . $e($t) . '</div>'; foreach ($linhas as $l) if ($l !== '') $o .= '<div style="font-size:13.5px;color:#5a5670;margin-top:3px">' . $l . '</div>'; return $o . '</div>'; };
  $vc = ['sim' => '#1f7a4d', 'nao' => '#b3261e', 'abstencao' => '#5a5670', 'verificar' => '#b45f06'];
  $txt = [];
  $b = '<div style="font:400 16px/1.5 Arial,Helvetica,sans-serif;color:#1b1530">';
  $b .= '<p style="margin:0 0 4px;font-weight:700;color:#3E347E;font-size:17px;text-transform:capitalize">' . $e($m['extenso']) . '</p>';
  if (!$m['tem_edicao']) $b .= '<p style="background:#EFEBF8;padding:10px">Sem edições dos diários nesta data.</p>';
  $b .= $h2('Resumo do dia') . '<ul style="padding-left:18px;margin:6px 0">';
  foreach ($m['resumo'] as $r) { $b .= '<li style="margin:5px 0">' . $e($r['t']) . '</li>'; $txt[] = '- ' . $r['t']; } $b .= '</ul>';
  // agir hoje
  $acao = array_values(array_filter($m['mandato'], fn($i) => ($i['prio'] ?? '') === 'acao' && ($i['tipo'] ?? '') !== 'citacao'));
  if ($acao) { $b .= $h2('Pede ação do mandato'); $txt[] = "\nPEDE AÇÃO"; foreach (array_slice($acao, 0, 8) as $i) { $b .= $item($i['titulo'], [$e(($i['rotulo'] ?? '') . ' · ' . ($i['fonte'] === 'dcm' ? 'DCM' : 'D.O. RIO') . ' p. ' . $i['pagina'])], '#b3261e'); $txt[] = '* ' . $i['titulo']; } }
  // ordem do dia
  $oi = []; foreach ($m['ordem'] as $s) foreach ($s['itens'] as $i) $oi[] = [$s, $i];
  if ($oi) {
    $b .= $h2('Ordem do Dia e orientação de voto'); $txt[] = "\nORDEM DO DIA";
    foreach (array_slice($oi, 0, 25) as [$s, $i]) {
      $o = $i['orient'] ?? null; $l = [];
      if ($o) $l[] = '<span style="display:inline-block;background:' . ($vc[$o['voto']] ?? '#5a5670') . ';color:#fff;padding:1px 9px;border-radius:3px;font-weight:700">' . $e(GAB_VOTOS[$o['voto']] ?? $o['voto']) . '</span>' . ($o['comentario'] ? ' <span style="color:#1b1530">' . $e($o['comentario']) . '</span>' : '');
      else $l[] = '<i>Sem orientação de voto registrada.</i>';
      if (!empty($i['prazo'])) $l[] = 'Prazo: ' . $e(implode('/', array_reverse(explode('-', $i['prazo']))));
      $b .= $item(($i['refs'][0] ?? 'Item ' . $i['ordem']) . ' — ' . mb_substr($i['titulo'], 0, 170), $l, $o ? ($vc[$o['voto']] ?? '#5a5670') : '#F08A24');
      $txt[] = '* ' . ($i['refs'][0] ?? 'Item ' . $i['ordem']) . ': ' . ($o ? (GAB_VOTOS[$o['voto']] ?? '') . ($o['comentario'] ? ' — ' . $o['comentario'] : '') : 'sem orientação');
    }
  }
  // agenda do dia
  $hoje = array_values(array_filter($m['semana'], fn($d) => $d['data'] === $m['data']));
  if ($hoje && ($hoje[0]['eventos'] || $hoje[0]['sessoes'])) {
    $b .= $h2('Agenda da Câmara hoje'); $txt[] = "\nAGENDA DE HOJE";
    foreach ($hoje[0]['sessoes'] as $s) { $b .= $item($s['hora'] . ' — ' . $s['tipo'] . ' (Ordem do Dia)', [], '#3E347E'); $txt[] = '* ' . $s['hora'] . ' ' . $s['tipo']; }
    foreach ($hoje[0]['eventos'] as $ev) { $b .= $item($ev['horario'] . ' — ' . $ev['evento'], [$e($ev['local'] . ($ev['iniciativa'] ? ' · ' . $ev['iniciativa'] : ''))], '#3E347E'); $txt[] = '* ' . $ev['horario'] . ' ' . $ev['evento']; }
  }
  // nomeações
  if ($m['executivo']['nomeacoes']) { $b .= $h2('Nomeações de alto escalão (D.O. RIO)'); $txt[] = "\nNOMEAÇÕES"; foreach (array_slice($m['executivo']['nomeacoes'], 0, 8) as $i) { $b .= $item($i['titulo'], [$e($i['orgao'] ?? '')], in_array('smcti', $i['tags'], true) ? '#0f6b78' : '#F08A24'); $txt[] = '* ' . $i['titulo']; } }
  $b .= '<p style="margin:26px 0 8px">' . '<a href="' . $e($url) . '" style="display:inline-block;background:#F08A24;color:#2a1700;font-weight:700;padding:13px 24px;border-radius:4px;text-decoration:none">Abrir o Radar completo e baixar o PDF</a></p>';
  $b .= '<p style="font-size:12.5px;color:#5a5670;margin-top:22px">Extração automática dos diários oficiais; confira no original antes de agir. Você recebe este e-mail por ter acesso autorizado ao Radar do Gabinete Tatiana Roque. <a href="' . $e($urlSair) . '" style="color:#3E347E">Deixar de receber</a>.</p></div>';
  $topo = '<tr><td style="background:#fff;padding:16px 22px;border-bottom:4px solid #F08A24"><img src="' . GAB_SITE . '/gabinetetatianaroque/img/tatiana-roque.png" alt="Vereadora Tatiana Roque" height="44" style="height:44px;vertical-align:middle"> &nbsp; <img src="' . GAB_SITE . '/gabinetetatianaroque/img/radar-cor.png" alt="Radar da Oficina Política" height="38" style="height:38px;vertical-align:middle"></td></tr>'
    . '<tr><td style="padding:18px 22px 0;background:#FBF9F5"><div style="font:400 26px/1.15 Georgia,serif;color:#2A2260">Radar Oficina Política para o Gabinete Tatiana Roque</div><div style="font:14.5px Arial,sans-serif;color:#5a5670;margin-top:5px">Destaques dos Diários Oficiais da Câmara e Município e a agenda do dia</div></td></tr>';
  $html = '<!doctype html><html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light only"></head><body style="margin:0;background:#EFEBF8"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#EFEBF8"><tr><td align="center" style="padding:20px 10px"><table role="presentation" width="640" cellpadding="0" cellspacing="0" style="width:640px;max-width:100%;background:#FBF9F5">'
    . $topo . '<tr><td style="padding:6px 22px 26px;background:#FBF9F5">' . $b . '</td></tr></table></td></tr></table></body></html>';
  return [$html, "Radar Oficina Política para o Gabinete Tatiana Roque\n" . $m['extenso'] . "\n\n" . implode("\n", $txt) . "\n\nRadar completo: $url\nPara deixar de receber: $urlSair\n"];
}
