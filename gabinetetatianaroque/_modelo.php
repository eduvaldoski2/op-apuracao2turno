<?php
// Monta o "modelo" do boletim: aplica a configuração do mandato (PLs, temas) e as orientações de voto sobre os itens neutros da coleta.
if (!defined('GAB_OK')) { http_response_code(404); exit; }

function gab_sem($s) {   // minúsculas sem acento, para comparar
  $s = mb_strtolower((string)$s, 'UTF-8');
  return strtr($s, ['á' => 'a', 'à' => 'a', 'â' => 'a', 'ã' => 'a', 'ä' => 'a', 'é' => 'e', 'è' => 'e', 'ê' => 'e', 'í' => 'i', 'ì' => 'i', 'ó' => 'o', 'ò' => 'o', 'ô' => 'o', 'õ' => 'o', 'ú' => 'u', 'ù' => 'u', 'ç' => 'c']);
}
function gab_ref_norm($r) {   // "PL 1.501/2025", "pl1501/2025" -> "PL 1501/2025"
  if (!preg_match('/^\s*(PLC|PL|PR|PDL|PELO|MSG)\s*n?[º°o\.]*\s*(\d[\d\.]*(?:-[A-Za-z])?)\s*\/\s*(\d{4})\s*$/iu', (string)$r, $m)) return '';
  return strtoupper($m[1]) . ' ' . str_replace('.', '', strtoupper($m[2])) . '/' . $m[3];
}
function gab_termos($txt) { $o = []; foreach (preg_split('/[\r\n;]+/', (string)$txt) as $t) { $t = trim($t); if ($t !== '') $o[] = gab_sem($t); } return $o; }
function gab_casa($texto_sem, $termo) {   // termo em qualquer posição de palavra
  if ($termo === '') return false;
  return (bool)preg_match('/(?<![a-z0-9])' . preg_quote($termo, '/') . '/u', $texto_sem);
}

function gab_marca(array &$it, array $cfg, array $refsMon, array $temas) {
  $it['hits'] = [];
  $txt = gab_sem(($it['titulo'] ?? '') . ' ' . ($it['texto'] ?? '') . ' ' . ($it['orgao'] ?? ''));
  foreach (($it['refs'] ?? []) as $r) if (isset($refsMon[$r])) $it['hits'][] = ['t' => 'pl', 'n' => $refsMon[$r]['apelido'] ?: $r, 'ref' => $r];
  foreach ($temas as $t) { foreach ($t['_termos'] as $x) if (gab_casa($txt, $x)) { $it['hits'][] = ['t' => 'tema', 'n' => $t['nome']]; break; } }
}

function gab_prio(array $it) {
  $tg = $it['tags'] ?? []; $tp = $it['tipo'] ?? '';
  $pl = array_filter($it['hits'] ?? [], fn($h) => $h['t'] === 'pl');
  if (($it['cctci_status'] ?? '') === 'pendente' && in_array('tatiana', $tg, true)) return 'acao';
  if (in_array($tp, ['pl', 'plc', 'veto', 'parecer'], true) && in_array('tatiana', $tg, true)) return $tp === 'parecer' ? 'acompanhar' : 'acao';
  if ($tp === 'nomeacao' && in_array('smcti', $tg, true)) return 'acao';
  if ($pl) return 'acao';
  if (!empty($it['prazo']) && $it['prazo'] <= gab_hoje()) return 'acao';
  if ($tg || ($it['hits'] ?? [])) return 'acompanhar';
  return 'info';
}

function gab_modelo(array $ed, array $cfg, array $orient) {
  $data = $ed['data'];
  $refsMon = []; foreach ($cfg['pls'] as $p) { $r = gab_ref_norm($p['ref']); if ($r) $refsMon[$r] = $p; }
  $temas = []; foreach ($cfg['temas'] as $t) { $t['_termos'] = gab_termos($t['termos']); $temas[] = $t; }

  $dcm = $ed['dcm'] ?? []; $do = $ed['do'] ?? [];
  foreach ($dcm as &$i) { gab_marca($i, $cfg, $refsMon, $temas); $i['prio'] = gab_prio($i); } unset($i);
  foreach ($do as &$i) { gab_marca($i, $cfg, $refsMon, $temas); $i['prio'] = gab_prio($i); } unset($i);

  // ---- Ordem do Dia, com orientação de voto ----
  $ordem = [];
  foreach (($ed['ordem'] ?? []) as $s) {
    $its = [];
    foreach ($s['itens'] as $i) {
      gab_marca($i, $cfg, $refsMon, $temas); $i['prio'] = gab_prio($i);
      $i['orient'] = $orient[$i['chave']] ?? null;
      if (!$i['orient'] && !empty($i['refs'])) { foreach ($orient as $k => $v) if (strpos($k, $i['refs'][0] . '|') === 0) { $i['orient_outra'] = ['chave' => $k] + $v; break; } }   // orientação dada em outra fase da mesma matéria
      $i['sessao_data'] = $s['data']; $its[] = $i;
    }
    $ordem[] = ['data' => $s['data'], 'hora' => $s['hora'], 'tipo' => $s['tipo'], 'periodo' => $s['periodo'] ?? '', 'url' => $s['url'] ?? '', 'itens' => $its];
  }

  $todos = array_merge($dcm, $do);
  $ordemItens = []; foreach ($ordem as $s) foreach ($s['itens'] as $i) $ordemItens[] = $i;

  // ---- Nosso mandato ----
  $mandato = array_values(array_filter(array_merge($dcm, $do), function ($i) {
    $tg = $i['tags'] ?? [];
    return (bool)array_intersect($tg, ['tatiana', 'cctci', 'smcti']) || count(array_filter($i['hits'] ?? [], fn($h) => $h['t'] === 'pl')) > 0;
  }));
  $ordPrio = ['acao' => 0, 'acompanhar' => 1, 'info' => 2];
  usort($mandato, fn($a, $b) => [$ordPrio[$a['prio']], $a['tipo'] === 'citacao' ? 1 : 0, $a['fonte'], $a['pagina']] <=> [$ordPrio[$b['prio']], $b['tipo'] === 'citacao' ? 1 : 0, $b['fonte'], $b['pagina']]);
  $pendCctci = array_values(array_filter(array_merge($dcm, $ordemItens), fn($i) => ($i['cctci_status'] ?? '') === 'pendente' || (in_array('cctci', $i['tags'] ?? [], true) && preg_match('/Ci[êe]ncia,?\s+Tecnologia[^;]{0,80}PENDENTE/iu', $i['texto'] ?? ''))));

  // ---- Projetos monitorados ----
  $monit = [];
  foreach ($refsMon as $ref => $p) {
    $oc = [];
    foreach (array_merge($todos, $ordemItens) as $i) if (in_array($ref, $i['refs'] ?? [], true)) $oc[] = $i;
    $monit[] = ['ref' => $ref, 'apelido' => $p['apelido'], 'nota' => $p['nota'], 'area' => $p['area'], 'ocorrencias' => $oc];
  }

  // ---- Radar temático ----
  $tem = [];
  foreach ($temas as $t) {
    $oc = array_values(array_filter(array_merge($todos, $ordemItens), function ($i) use ($t) {
      if (in_array($i['tipo'] ?? '', ['citacao'], true)) return false;
      foreach (($i['hits'] ?? []) as $h) if ($h['t'] === 'tema' && $h['n'] === $t['nome']) return true; return false;
    }));
    if ($oc) $tem[] = ['nome' => $t['nome'], 'area' => $t['area'], 'itens' => array_slice($oc, 0, 40), 'total' => count($oc)];
  }

  // ---- Executivo (D.O. RIO) ----
  $exec = ['nomeacoes' => [], 'smcti' => [], 'normas' => []];
  foreach ($do as $i) {
    if ($i['tipo'] === 'nomeacao') $exec['nomeacoes'][] = $i;
    elseif (in_array($i['tipo'], ['smcti', 'smcti_secao'], true)) $exec['smcti'][] = $i;
    elseif ($i['tipo'] === 'norma') $exec['normas'][] = $i;
    elseif ($i['tipo'] === 'pessoal_tag') $exec['smcti'][] = $i;
  }
  usort($exec['nomeacoes'], fn($a, $b) => (in_array('smcti', $b['tags'], true) <=> in_array('smcti', $a['tags'], true)));

  // ---- Câmara em geral ----
  $cont = []; foreach ($dcm as $i) { $cont[$i['tipo']] = ($cont[$i['tipo']] ?? 0) + 1; }
  $cam = ['contagem' => $cont, 'itens' => array_values(array_filter($dcm, fn($i) => in_array($i['tipo'], ['pl', 'plc', 'pr', 'pdl', 'pelo', 'veto', 'resolucao', 'ato'], true)))];
  $cam['pareceres'] = array_values(array_filter($dcm, fn($i) => $i['tipo'] === 'parecer'));

  // ---- Prazos ----
  $prazos = [];
  foreach ($ordemItens as $i) if (!empty($i['prazo'])) $prazos[$i['prazo'] . '|' . $i['chave']] = ['data' => $i['prazo'], 'item' => $i];
  ksort($prazos); $prazos = array_values($prazos);

  // ---- Semana ----
  $semana = gab_semana($data, $ed, $ordem);

  // ---- Resumo ----
  $nAcao = count(array_filter(array_merge($mandato, $ordemItens), fn($i) => ($i['prio'] ?? '') === 'acao'));
  $res = [];
  $f = $ed['fontes'] ?? [];
  $cad = $f['dcm']['cadernos'] ?? []; $ed_do = $f['do']['edicoes'] ?? [];
  $res[] = ['k' => 'fontes', 't' => 'DCM: ' . ($cad ? 'nº ' . ($cad[0]['edicao'] ?? '?') . ' (' . count($cad) . ' caderno' . (count($cad) > 1 ? 's' : '') . '/suplemento' . (count($cad) > 1 ? 's' : '') . ')' : 'sem edição') . ' · D.O. RIO: ' . ($ed_do ? 'nº ' . ($ed_do[0]['numero'] ?? '?') : 'sem edição')];
  if ($mandato) $res[] = ['k' => 'mandato', 't' => count($mandato) . ' ocorrência(s) do mandato (Tatiana Roque, Comissão de Ciência e Tecnologia, SMCTI e projetos monitorados); ' . $nAcao . ' pedem ação.'];
  if ($pendCctci) $res[] = ['k' => 'cctci', 't' => count($pendCctci) . ' matéria(s) aguardando parecer da Comissão de Ciência, Tecnologia, Comunicação e Informática (a vereadora é vice-presidente).'];
  if ($ordemItens) { $nv = count(array_filter($ordemItens, fn($i) => ($i['tipo'] ?? '') === 'veto')); $sem = count(array_filter($ordemItens, fn($i) => empty($i['orient']))); $res[] = ['k' => 'ordem', 't' => 'Ordem do Dia: ' . count($ordemItens) . ' item(ns)' . ($nv ? ', ' . $nv . ' veto(s)' : '') . '; ' . $sem . ' sem orientação de voto registrada.']; }
  $alto = array_filter($exec['nomeacoes'], fn($i) => !in_array($i['acao'] ?? '', ['designação'], true) || true);
  if ($exec['nomeacoes']) { $ns = count(array_filter($exec['nomeacoes'], fn($i) => in_array('smcti', $i['tags'], true))); $res[] = ['k' => 'nomeacoes', 't' => count($exec['nomeacoes']) . ' ato(s) de pessoal de alto escalão no D.O. RIO' . ($ns ? ' (' . $ns . ' na SMCTI)' : '') . '.']; }
  elseif (!empty($f['do']['ok'])) $res[] = ['k' => 'nomeacoes', 't' => 'Sem nomeações/exonerações de secretário, subsecretário, chefe de gabinete, presidente ou diretor de autarquia/estatal no D.O. RIO de hoje.'];
  if ($exec['smcti']) $res[] = ['k' => 'smcti', 't' => 'A Secretaria Municipal de Ciência, Tecnologia e Inovação aparece no D.O. RIO de hoje (' . count($exec['smcti']) . ' publicação(ões)).'];
  $hoje = array_values(array_filter($semana, fn($d) => $d['data'] === $data));
  if ($hoje && count($hoje[0]['eventos'])) $res[] = ['k' => 'agenda', 't' => 'Agenda da Câmara hoje: ' . count($hoje[0]['eventos']) . ' atividade(s).'];
  foreach (($ed['notas'] ?? []) as $n) $res[] = ['k' => 'nota', 't' => $n];

  return [
    'data' => $data, 'extenso' => gab_data_extensa($data), 'gerado_em' => $ed['gerado_em'] ?? '', 'tem_edicao' => !empty($ed['tem_edicao']),
    'fontes' => $f, 'resumo' => $res, 'semana' => $semana, 'mandato' => $mandato, 'pend_cctci' => $pendCctci, 'ordem' => $ordem,
    'monitorados' => $monit, 'tematico' => $tem, 'executivo' => $exec, 'camara' => $cam, 'prazos' => $prazos,
    'votos' => GAB_VOTOS,
  ];
}

// calendário da semana (seg–sex; sáb/dom só se houver evento), juntando as agendas das edições da mesma semana
function gab_semana($data, array $ed, array $ordem) {
  $d = new DateTime($data, new DateTimeZone('America/Sao_Paulo')); $dow = (int)$d->format('N');
  $seg = (clone $d)->modify('-' . ($dow - 1) . ' days');
  $dias = []; for ($k = 0; $k < 7; $k++) { $x = (clone $seg)->modify("+$k days"); $dias[$x->format('Y-m-d')] = ['data' => $x->format('Y-m-d'), 'eventos' => [], 'sessoes' => []]; }
  $nomes = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo']; $k = 0; foreach ($dias as $dk => &$v) { $v['dia'] = $nomes[$k++]; } unset($v);
  $fontes = [$ed]; foreach (gab_datas() as $dd) { if (isset($dias[$dd]) && $dd !== $data) { $o = gab_ed($dd); if ($o) $fontes[] = $o; } }
  foreach ($fontes as $e) foreach (($e['agenda'] ?? []) as $a) if (isset($dias[$a['data']]) && !$dias[$a['data']]['eventos']) $dias[$a['data']]['eventos'] = $a['eventos'];
  foreach ($fontes as $e) foreach (($e['ordem'] ?? []) as $s) if (isset($dias[$s['data']])) { $ch = $s['data'] . $s['hora'] . $s['tipo']; $dias[$s['data']]['sessoes'][$ch] = ['hora' => $s['hora'], 'tipo' => $s['tipo'], 'itens' => count($s['itens'])]; }
  $out = [];
  foreach ($dias as $v) { $v['sessoes'] = array_values($v['sessoes']); if ((int)date('N', strtotime($v['data'])) <= 5 || $v['eventos'] || $v['sessoes']) $out[] = $v; }
  return $out;
}
