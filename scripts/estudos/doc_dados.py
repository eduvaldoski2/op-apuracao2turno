"""Gera os trechos em markdown do documento a partir de est2026.json. Uso: doc_dados.py <est.json> <dir_saida>"""
import sys, json, os, collections
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from base import *
res = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]; os.makedirs(out, exist_ok=True)
CEN = ['A', 'B', 'C', 'D', 'E']
LAB = {'A': 'PT/PCdoB/PV + PSB', 'B': 'PSB + PDT', 'C': 'PT/PCdoB/PV + PSB + PDT', 'D': 'PT/PCdoB/PV + PSB + PDT + PSOL/Rede', 'E': 'PT/PCdoB/PV + PSOL/Rede'}
CARGO = {6: 'Deputado federal', 7: 'Deputado estadual', 8: 'Deputado distrital'}
CAMPO = ['PT', 'PCdoB', 'PV', 'PSB', 'PDT', 'PSOL', 'REDE']
NOME_P = {'REDE': 'Rede'}
UFNOME = {'AC':'Acre','AL':'Alagoas','AM':'Amazonas','AP':'Amapá','BA':'Bahia','CE':'Ceará','DF':'Distrito Federal','ES':'Espírito Santo','GO':'Goiás','MA':'Maranhão','MG':'Minas Gerais','MS':'Mato Grosso do Sul','MT':'Mato Grosso','PA':'Pará','PB':'Paraíba','PE':'Pernambuco','PI':'Piauí','PR':'Paraná','RJ':'Rio de Janeiro','RN':'Rio Grande do Norte','RO':'Rondônia','RR':'Roraima','RS':'Rio Grande do Sul','SC':'Santa Catarina','SE':'Sergipe','SP':'São Paulo','TO':'Tocantins'}
FASE = {'QP': 'QP', 'MÉDIA': 'Média', 'MÉDIA (sem barreira)': 'Média (sem barreira)', 'MAIS VOTADOS': 'Mais votados'}
def n(x): return f'{x:,}'.replace(',', '.')
def pn(p): return NOME_P.get(p, p)
real = res['eleitos_real']; S = {k: res['cenarios']['S' + k] for k in CEN}
info = {(b['cargo'], b['uf']): b for b in res['base_info']}
def conta(es, cargo, uf=None):
    return collections.Counter(e['partido'] for e in es if e['cargo'] == cargo and (uf is None or e['uf'] == uf))
def dl(d): return f'+{d}' if d > 0 else ('−' + str(-d) if d < 0 else '0')
def cel(v, base): 
    d = v - base
    return f'{v}' if d == 0 else f'{v} ({dl(d)})'
sets_real = collections.defaultdict(dict)
for e in real: sets_real[(e['cargo'], e['uf'])][e['sq']] = e
sets = {k: collections.defaultdict(dict) for k in CEN}
for k in CEN:
    for e in S[k]['eleitos']: sets[k][(e['cargo'], e['uf'])][e['sq']] = e
def mudancas(k, cargo, uf=None):
    """retorna listas (entram, saem) do cenário k"""
    ent, sai = [], []
    for (c, u), rs in sets_real.items():
        if c != cargo or (uf and u != uf): continue
        ss = sets[k][(c, u)]
        for sq in ss.keys() - rs.keys(): ent.append(ss[sq])
        for sq in rs.keys() - ss.keys(): sai.append(rs[sq])
    return ent, sai
res_data = {}
# ---------------------------------------------------------------- dados nacionais
fed = {'real': conta(real, 6)}
for k in CEN: fed[k] = conta(S[k]['eleitos'], 6)
est = {'real': conta(real, 7)}
for k in CEN: est[k] = conta(S[k]['eleitos'], 7)
dis = {'real': conta(real, 8)}
for k in CEN: dis[k] = conta(S[k]['eleitos'], 8)
partidos = sorted({p for c in fed.values() for p in c}, key=lambda p: (-fed['real'][p], p))
md = []
# tabela de composição
md.append('| Partido | 2026 (real) | A | B | C | D | E |\n| --- | --- | --- | --- | --- | --- | --- |')
for p in partidos:
    b = fed['real'][p]
    row = [pn(p) + (' ★' if False else ''), str(b)] + [cel(fed[k][p], b) for k in CEN]
    md.append('| ' + ' | '.join(row) + ' |')
md.append('| **Total** | **513** | ' + ' | '.join(f'**{sum(fed[k].values())}**' for k in CEN) + ' |')
open(f'{out}/cap1_composicao.md', 'w').write('\n'.join(md))
# resumo por campo
def campo_sum(c): return sum(c[p] for p in CAMPO)
tot = {'real': campo_sum(fed['real'])}
for k in CEN: tot[k] = campo_sum(fed[k])
md = ['| Federais | 2026 (real) | A | B | C | D | E |', '| --- | --- | --- | --- | --- | --- | --- |']
md.append('| Esquerda (7 partidos) | ' + str(tot['real']) + ' | ' + ' | '.join(cel(tot[k], tot['real']) for k in CEN) + ' |')
md.append('| % da Câmara (513) | ' + f"{tot['real']/513:.1%}".replace('.', ',') + ' | ' + ' | '.join(f"{tot[k]/513:.1%}".replace('.', ',') for k in CEN) + ' |')
md.append('| Demais partidos | ' + str(513 - tot['real']) + ' | ' + ' | '.join(str(513 - tot[k]) for k in CEN) + ' |')
open(f'{out}/cap1_campo.md', 'w').write('\n'.join(md))
# maiores bancadas (partido ou federação) por cenário
FED_OUT = {'PSDB': 'PSDB/CIDADANIA', 'CIDADANIA': 'PSDB/CIDADANIA', 'UNIÃO': 'UNIÃO/PP', 'PP': 'UNIÃO/PP', 'PRD': 'PRD/SOLIDARIEDADE', 'SOLIDARIEDADE': 'PRD/SOLIDARIEDADE'}
def blocos(c, k):
    d = collections.Counter()
    for p, v in c.items():
        if p in FED_OUT: d[FED_OUT[p]] += v
        elif p in ('PT', 'PCdoB', 'PV'): d['PT/PCdoB/PV' if k in ('real', 'B') else {'A': 'PT/PCdoB/PV/PSB', 'C': 'PT/PCdoB/PV/PSB/PDT', 'D': 'PT/PCdoB/PV/PSB/PDT/PSOL/Rede', 'E': 'PT/PCdoB/PV/PSOL/Rede'}[k]] += v
        elif p in ('PSOL', 'REDE'): d['PSOL/Rede' if k not in ('D', 'E') else {'D': 'PT/PCdoB/PV/PSB/PDT/PSOL/Rede', 'E': 'PT/PCdoB/PV/PSOL/Rede'}[k]] += v
        elif p == 'PSB': d['PSB' if k in ('real', 'E') else {'A': 'PT/PCdoB/PV/PSB', 'B': 'PSB/PDT', 'C': 'PT/PCdoB/PV/PSB/PDT', 'D': 'PT/PCdoB/PV/PSB/PDT/PSOL/Rede'}[k]] += v
        elif p == 'PDT': d['PDT' if k in ('real', 'A', 'E') else {'B': 'PSB/PDT', 'C': 'PT/PCdoB/PV/PSB/PDT', 'D': 'PT/PCdoB/PV/PSB/PDT/PSOL/Rede'}[k]] += v
        else: d[p] += v
    return d
md = ['| Cenário | 1ª maior | 2ª maior | 3ª maior |', '| --- | --- | --- | --- |']
for k, lab in [('real', '2026 (real)')] + [(k, f'{k}) {LAB[k]}') for k in CEN]:
    c = fed[k]; b = blocos(c, k)
    top = sorted(b.items(), key=lambda kv: -kv[1])[:3]
    md.append(f'| {lab} | ' + ' | '.join(f'{a} · {v}' for a, v in top) + ' |')
open(f'{out}/cap1_maiores.md', 'w').write('\n'.join(md))
# variação dos demais partidos
md = ['| Partido | A | B | C | D | E |', '| --- | --- | --- | --- | --- | --- |']
outros = [p for p in partidos if p not in CAMPO]
for p in outros:
    ds = [fed[k][p] - fed['real'][p] for k in CEN]
    if any(ds): md.append(f'| {p} (2026: {fed["real"][p]}) | ' + ' | '.join(dl(d) for d in ds) + ' |')
md.append('| **Soma dos demais** | ' + ' | '.join('**' + dl(sum(fed[k][p] - fed['real'][p] for p in outros)) + '**' for k in CEN) + ' |')
open(f'{out}/cap1_variacao_demais.md', 'w').write('\n'.join(md))
# campo por partido (federais): variação
md = ['| Partido | 2026 (real) | A | B | C | D | E |', '| --- | --- | --- | --- | --- | --- | --- |']
for p in CAMPO: md.append(f'| {pn(p)} | {fed["real"][p]} | ' + ' | '.join(cel(fed[k][p], fed['real'][p]) for k in CEN) + ' |')
md.append('| **Esquerda** | **' + str(tot['real']) + '** | ' + ' | '.join(f'**{cel(tot[k], tot["real"])}**' for k in CEN) + ' |')
open(f'{out}/cap1_campo_partidos.md', 'w').write('\n'.join(md))
# estaduais
md = ['| Estaduais e distritais | 2026 (real) | A | B | C | D | E |', '| --- | --- | --- | --- | --- | --- | --- |']
for lab, d, tt in (('Esquerda, deputados estaduais', est, 1035), ('Esquerda, deputados distritais (DF)', dis, 24)):
    t0 = campo_sum(d['real']); md.append(f'| {lab} | {t0} | ' + ' | '.join(cel(campo_sum(d[k]), t0) for k in CEN) + ' |')
    md.append(f'| % do total ({tt}) | ' + f'{t0/tt:.1%}'.replace('.', ',') + ' | ' + ' | '.join(f'{campo_sum(d[k])/tt:.1%}'.replace('.', ',') for k in CEN) + ' |')
open(f'{out}/cap1_estaduais.md', 'w').write('\n'.join(md))
# PSB
md = ['| PSB | 2026 (real) | A | B | C | D | E |', '| --- | --- | --- | --- | --- | --- | --- |']
for lab, d in (('Deputados federais', fed), ('Deputados estaduais', est), ('Deputados distritais (DF)', dis)):
    md.append(f'| {lab} | {d["real"]["PSB"]} | ' + ' | '.join(cel(d[k]['PSB'], d['real']['PSB']) for k in CEN) + ' |')
open(f'{out}/cap1_psb.md', 'w').write('\n'.join(md))
# PSB por UF (federal): onde ganha/perde
md = ['| UF | 2026 (real) | A | B | C | D | E |', '| --- | --- | --- | --- | --- | --- | --- |']
linhas = 0
for uf in UFS:
    base = conta(real, 6, uf)['PSB']; vs = [conta(S[k]['eleitos'], 6, uf)['PSB'] for k in CEN]
    if any(v != base for v in vs): md.append(f'| {uf} | {base} | ' + ' | '.join(cel(v, base) for v in vs) + ' |'); linhas += 1
open(f'{out}/cap1_psb_uf.md', 'w').write('\n'.join(md)); print('PSB UFs com mudança federal', linhas)
# PSB: quem entra e quem sai (federais), por cenário
md = ['| Cenário | Situação | UF | Candidato | Votos | Fase |', '| --- | --- | --- | --- | --- | --- |']
for k in CEN:
    ent, sai = mudancas(k, 6)
    for e in sorted([e for e in ent if e['partido'] == 'PSB'], key=lambda e: (e['uf'], -e['votos'])): md.append(f'| {k} | Entra | {e["uf"]} | {e["nome"]} | {n(e["votos"])} | {FASE[e["fase"]]} |')
    for e in sorted([e for e in sai if e['partido'] == 'PSB'], key=lambda e: (e['uf'], -e['votos'])): md.append(f'| {k} | Sai | {e["uf"]} | {e["nome"]} | {n(e["votos"])} | {FASE[e["fase"]]} (2026) |')
open(f'{out}/cap1_psb_nomes.md', 'w').write('\n'.join(md))
# deputados federais que entram/saem por cenário
tamanhos = {}
for k in CEN:
    ent, sai = mudancas(k, 6)
    tamanhos[k] = (len(ent), len(sai))
    md = ['| UF | Situação | Candidato | Partido | Votos | Fase |', '| --- | --- | --- | --- | --- | --- |']
    ufs = sorted({e['uf'] for e in ent + sai})
    for uf in ufs:
        for e in sorted([e for e in ent if e['uf'] == uf], key=lambda e: -e['votos']): md.append(f'| {uf} | Entra | {e["nome"]} | {pn(e["partido"])} | {n(e["votos"])} | {FASE[e["fase"]]} |')
        for e in sorted([e for e in sai if e['uf'] == uf], key=lambda e: -e['votos']): md.append(f'| {uf} | Sai | {e["nome"]} | {pn(e["partido"])} | {n(e["votos"])} | {FASE[e["fase"]]} (2026) |')
    open(f'{out}/cap1_mudancas_{k}.md', 'w').write('\n'.join(md))
print('federais entram/saem', tamanhos)
# ---------------------------------------------------------------- por estado
def secao_uf(uf):
    L = []
    L.append(f'### {uf} · {UFNOME[uf]}\n')
    for cargo in (6, 7, 8):
        if (cargo, uf) not in info: continue
        b = info[(cargo, uf)]
        base = conta(real, cargo, uf); ccs = {k: conta(S[k]['eleitos'], cargo, uf) for k in CEN}
        totc = {k: sum(ccs[k][p] for p in CAMPO) for k in CEN}; t0 = sum(base[p] for p in CAMPO)
        trecho = ', '.join(f'{k}: {cel(totc[k], t0)}' if totc[k] != t0 else f'{k}: {t0}' for k in CEN)
        L.append(f'#### {CARGO[cargo]}: {b["vagas"]} vagas · QE {n(b["QE"])}\n')
        L.append(f'A esquerda elege **{t0}** em 2026. Nos cenários: {trecho}.\n')
        L.append('| Partido | 2026 (real) | A | B | C | D | E |\n| --- | --- | --- | --- | --- | --- | --- |')
        for p in CAMPO: L.append(f'| {pn(p)} | {base[p]} | ' + ' | '.join(cel(ccs[k][p], base[p]) for k in CEN) + ' |')
        L.append(f'| **Esquerda** | **{t0}** | ' + ' | '.join(f'**{cel(totc[k], t0)}**' for k in CEN) + ' |')
        dem = b['vagas'] - t0
        L.append(f'| Demais partidos | {dem} | ' + ' | '.join(cel(b['vagas'] - totc[k], dem) for k in CEN) + ' |')
        L.append('')
        # mudanças
        linhas = []
        for k in CEN:
            ent, sai = mudancas(k, cargo, uf)
            for e in sorted(ent, key=lambda e: -e['votos']): linhas.append(f'| {k} | Entra | {e["nome"]} | {pn(e["partido"])} | {n(e["votos"])} | {FASE[e["fase"]]} |')
            for e in sorted(sai, key=lambda e: -e['votos']): linhas.append(f'| {k} | Sai | {e["nome"]} | {pn(e["partido"])} | {n(e["votos"])} | {FASE[e["fase"]]} (2026) |')
        if linhas:
            L.append('**Quem entra e quem sai em relação a 2026**\n')
            L.append('| Cenário | Situação | Candidato | Partido | Votos | Fase |\n| --- | --- | --- | --- | --- | --- |'); L += linhas; L.append('')
        else:
            L.append('Nenhum dos cinco cenários muda os eleitos neste cargo.\n')
        # bancada de esquerda
        sqs = {}
        for e in real:
            if e['cargo'] == cargo and e['uf'] == uf and e['partido'] in CAMPO: sqs[e['sq']] = e
        for k in CEN:
            for e in S[k]['eleitos']:
                if e['cargo'] == cargo and e['uf'] == uf and e['partido'] in CAMPO: sqs.setdefault(e['sq'], e)
        L.append('**Bancada de esquerda por cenário** (QP = eleito pelo quociente partidário, Média = pelas sobras, — = não eleito)\n')
        L.append('| Candidato | Partido | Votos | 2026 | A | B | C | D | E |\n| --- | --- | --- | --- | --- | --- | --- | --- | --- |')
        def fase_em(esc, sq):
            e = esc.get((cargo, uf), {}).get(sq); return FASE[e['fase']] if e else '—'
        for sq, e in sorted(sqs.items(), key=lambda kv: -kv[1]['votos']):
            L.append(f'| {e["nome"]} | {pn(e["partido"])} | {n(e["votos"])} | {fase_em(sets_real, sq)} | ' + ' | '.join(fase_em(sets[k], sq) for k in CEN) + ' |')
        L.append('')
    return '\n'.join(L)
tam = {}
for uf in UFS:
    t = secao_uf(uf); open(f'{out}/uf_{uf}.md', 'w').write(t); tam[uf] = len(t)
print('tamanho por UF (chars):', {k: v for k, v in sorted(tam.items(), key=lambda kv: -kv[1])[:6]}, 'total', sum(tam.values()))
