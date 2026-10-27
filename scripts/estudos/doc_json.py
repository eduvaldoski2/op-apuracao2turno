"""Gera o documento inteiro em blocos JSON (para importar no Docs por blob).
Uso: doc_json.py <est.json> <saida.json>
Estaduais e distritais são tratados como um só cargo (7). Só entram no Capítulo 2 as UFs em que algum cenário muda quem é eleito."""
import sys, json, collections
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from base import UFS
res = json.load(open(sys.argv[1], encoding='utf-8')); OUT = sys.argv[2]

# ------------------------------------------------------------------ dados
CEN = ['A', 'B', 'C', 'D', 'E', 'F']
LAB = {'A': 'FBE + PSB', 'B': 'PSB + PDT', 'C': 'FBE + PSB + PDT', 'D': 'FBE + PSB + PDT + PSOL/Rede', 'E': 'FBE + PSOL/Rede', 'F': 'PSB + Cidadania'}
EMO = {'A': '🟦', 'B': '🟧', 'C': '🟪', 'D': '🟨', 'E': '🟫', 'F': '⬛'}
def CH(k): return f'{EMO[k]} {k} · {LAB[k]}'          # cabeçalho de cenário
CARGO = {6: 'Deputado federal', 7: 'Deputado estadual/distrital'}
CAMPO = ['PT', 'PCdoB', 'PV', 'PSB', 'PDT', 'PSOL', 'REDE']
NOME_P = {'REDE': 'Rede', 'CIDADANIA': 'Cidadania'}
UFNOME = {'AC':'Acre','AL':'Alagoas','AM':'Amazonas','AP':'Amapá','BA':'Bahia','CE':'Ceará','DF':'Distrito Federal','ES':'Espírito Santo','GO':'Goiás','MA':'Maranhão','MG':'Minas Gerais','MS':'Mato Grosso do Sul','MT':'Mato Grosso','PA':'Pará','PB':'Paraíba','PE':'Pernambuco','PI':'Piauí','PR':'Paraná','RJ':'Rio de Janeiro','RN':'Rio Grande do Norte','RO':'Rondônia','RR':'Roraima','RS':'Rio Grande do Sul','SC':'Santa Catarina','SE':'Sergipe','SP':'São Paulo','TO':'Tocantins'}
VAGA = {'QP': 'QP', 'MÉDIA': 'Sobra', 'MÉDIA (sem barreira)': 'Sobra (sem barreira)', 'MAIS VOTADOS': 'Mais votado'}
GAIN, LOSS, MIX = '#e5f4e4', '#fbebeb', '#f9eeda'
def n(x): return f'{x:,}'.replace(',', '.')
def pn(p): return NOME_P.get(p, p)
def dl(d): return f'+{d}' if d > 0 else ('−' + str(-d) if d < 0 else '0')
def pct(a, b): return f'{a/b:.1%}'.replace('.', ',')

def norm(es):
    for e in es:
        if e['cargo'] == 8: e['cargo'] = 7
real = res['eleitos_real']; norm(real)
for k in CEN: norm(res['cenarios']['S' + k]['eleitos'])
S = {k: res['cenarios']['S' + k] for k in CEN}
info = {}
for b in res['base_info']:
    c = 7 if b['cargo'] == 8 else b['cargo']; info[(c, b['uf'])] = b
TOT = {6: sum(b['vagas'] for (c, u), b in info.items() if c == 6), 7: sum(b['vagas'] for (c, u), b in info.items() if c == 7)}
assert TOT == {6: 513, 7: 1059}, TOT
def conta(es, cargo, uf=None):
    return collections.Counter(e['partido'] for e in es if e['cargo'] == cargo and (uf is None or e['uf'] == uf))
sets_real = collections.defaultdict(dict)
for e in real: sets_real[(e['cargo'], e['uf'])][e['sq']] = e
sets = {k: collections.defaultdict(dict) for k in CEN}
for k in CEN:
    for e in S[k]['eleitos']: sets[k][(e['cargo'], e['uf'])][e['sq']] = e
def mud(k, cargo, uf=None):
    ent, sai = [], []
    for (c, u), rs in sets_real.items():
        if c != cargo or (uf and u != uf): continue
        ss = sets[k][(c, u)]
        for sq in ss.keys() - rs.keys(): ent.append(ss[sq])
        for sq in rs.keys() - ss.keys(): sai.append(rs[sq])
    return ent, sai
fed = {'real': conta(real, 6)}; est = {'real': conta(real, 7)}
for k in CEN: fed[k] = conta(S[k]['eleitos'], 6); est[k] = conta(S[k]['eleitos'], 7)
def campo(c): return sum(c[p] for p in CAMPO)
partidos = sorted({p for c in fed.values() for p in c}, key=lambda p: (-fed['real'][p], p))

# ------------------------------------------------------------------ blocos
def run(t, bold=False):
    d = {'type': 'text', 'text': t}
    if bold: d['marks'] = [{'type': 'bold'}]
    return d
def runs(s):
    return [run(p, i % 2 == 1) for i, p in enumerate(s.split('**')) if p]
def P(s): return {'type': 'paragraph', 'content': runs(s)}
def H(l, s): return {'type': 'paragraph', 'heading': l, 'content': runs(s)}
def LST(items, kind='bullet'): return {'type': 'list', 'kind': kind, 'content': [{'type': 'listItem', 'content': [P(i)]} for i in items]}
def Q(s): return {'type': 'blockquote', 'content': [P(s)]}
def C(v, header=False):
    bg = None
    if isinstance(v, tuple): v, bg = v
    d = {'type': 'cell', 'content': [P(str(v))]}
    if header: d['header'] = True
    if bg: d['background'] = bg
    return d
def TBL(head, rows):
    out = [{'type': 'row', 'content': [C(h, True) for h in head]}]
    for r in rows:
        assert len(r) == len(head), (head, r)
        out.append({'type': 'row', 'content': [C(v) for v in r]})
    return {'type': 'table', 'content': out}
def cel(v, base, bold=False):
    d = v - base; t = f'{v}' if d == 0 else f'{v} ({dl(d)})'
    if bold: t = f'**{t}**'
    return (t, GAIN if d > 0 else LOSS) if d else t
def dcel(d, bold=False):               # só a diferença
    t = dl(d); t = f'**{t}**' if bold else t
    return (t, GAIN if d > 0 else LOSS) if d else t
B = []                                  # lista de blocos do documento
def add(*bl): B.extend(bl)
CENH = [CH(k) for k in CEN]

# ------------------------------------------------------------------ números-chave (e checagens do texto)
tf = {k: campo(fed[k]) for k in ['real'] + CEN}; te = {k: campo(est[k]) for k in ['real'] + CEN}
psbf = {k: fed[k]['PSB'] for k in ['real'] + CEN}; psbe = {k: est[k]['PSB'] for k in ['real'] + CEN}
ent_n = {k: len(mud(k, 6)[0]) for k in CEN}
assert all(len(mud(k, 6)[0]) == len(mud(k, 6)[1]) for k in CEN)
print('federais esquerda', tf); print('estaduais+distritais esquerda', te); print('PSB fed', psbf, 'est', psbe); print('entram', ent_n)

def rotulo(p, k):
    FBE = {'real': 'FBE', 'A': 'FBE + PSB', 'B': 'FBE', 'C': 'FBE + PSB + PDT', 'D': 'FBE + PSB + PDT + PSOL/Rede', 'E': 'FBE + PSOL/Rede', 'F': 'FBE'}
    if p in ('PT', 'PCdoB', 'PV'): return FBE[k]
    if p == 'PSB': return {'real': 'PSB', 'A': FBE['A'], 'B': 'PSB + PDT', 'C': FBE['C'], 'D': FBE['D'], 'E': 'PSB', 'F': 'PSB + Cidadania'}[k]
    if p == 'PDT': return {'real': 'PDT', 'A': 'PDT', 'B': 'PSB + PDT', 'C': FBE['C'], 'D': FBE['D'], 'E': 'PDT', 'F': 'PDT'}[k]
    if p in ('PSOL', 'REDE'): return FBE[k] if k in ('D', 'E') else 'PSOL/Rede'
    if p == 'CIDADANIA': return 'PSB + Cidadania' if k == 'F' else 'PSDB/Cidadania'
    if p == 'PSDB': return 'PSDB' if k == 'F' else 'PSDB/Cidadania'
    if p in ('UNIÃO', 'PP'): return 'UNIÃO/PP'
    if p in ('PRD', 'SOLIDARIEDADE'): return 'PRD/SOLIDARIEDADE'
    return p
def bancadas(k):
    d = collections.Counter()
    for p, v in fed[k].items(): d[rotulo(p, k)] += v
    return sorted(d.items(), key=lambda kv: (-kv[1], kv[0]))
top = {k: bancadas(k) for k in ['real'] + CEN}

# ------------------------------------------------------------------ título e introdução
add(H(1, 'Cenários para uma Federação de Esquerda nas Eleições de 2026'))
add(P('Oficina Política · Eduardo Valdoski · 27 de outubro de 2026'))
add(H(2, 'Introdução'))
add(P('Este estudo é um produto da **Oficina Política**. Autor: **Eduardo Valdoski**, jornalista e especialista em gestão de partidos políticos.'))
add(P('Ele simula o que teria acontecido na eleição de 2026 para deputado federal, estadual e distrital se partidos de esquerda tivessem se unido em federações, mantidos os votos que cada candidato e cada legenda tiveram. Há um interesse especial nos casos em que o **PSB** compõe federações. Duas perguntas orientam a análise:'))
add(LST(['**Impacto para o PSB:** quantas cadeiras o PSB ganharia ou perderia ao integrar cada federação, e quais deputados entrariam ou deixariam de ser eleitos.',
         '**Tamanho da esquerda:** quantas cadeiras teriam, em cada cenário, PT, PCdoB, PV, PSB, PDT, PSOL e Rede, e quem perde cadeira para que elas ganhem.'], 'ordered'))
add(P('São seis cenários, comparados com o resultado real de 2026. **FBE** é a Federação Brasil da Esperança (PT, PCdoB e PV). Deputados estaduais e distritais são tratados como um só cargo.'))
add(TBL(['Cenário', 'Federação simulada', 'O que muda em relação a 2026'], [
    [CH('A'), 'FBE + PSB', 'O PSB entra na FBE'],
    [CH('B'), 'PSB + PDT', 'Nova federação entre os dois partidos; a FBE continua como está'],
    [CH('C'), 'FBE + PSB + PDT', 'PSB e PDT entram na FBE'],
    [CH('D'), 'FBE + PSB + PDT + PSOL/Rede', 'As duas federações de esquerda e os dois partidos numa lista só'],
    [CH('E'), 'FBE + PSOL/Rede', 'Federação entre as duas federações de esquerda, sem PSB e PDT. O PSOL já é federado com a Rede e a federação não se divide, então a Rede entra junto'],
    [CH('F'), 'PSB + Cidadania', 'Desfaz a federação PSDB/Cidadania: o PSDB passa a concorrer sozinho e o Cidadania forma uma lista única com o PSB. Cada partido leva seus candidatos e os votos de legenda que o TSE publica para ele']]))
add(P('**Como ler as cores.** Cada cenário tem um marcador de cor (🟦 A, 🟧 B, 🟪 C, 🟨 D, 🟫 E, ⬛ F). Nas tabelas, **verde** indica ganho de cadeiras ou candidato que entra; **vermelho**, perda de cadeiras ou candidato que sai. Os valores entre parênteses são a diferença em relação ao resultado real de 2026.'))
add(Q('**Limite de candidatos por lista.** A lei limita cada partido ou federação a um número máximo de candidatos (vagas + 1). Este estudo trabalha com o número de candidatos que cada partido e cada federação efetivamente lançaram em 2026. Numa federação real, a lista única teria de ter menos candidatos do que a soma dos partidos que a formam, e esse número menor poderia alterar os resultados aqui apresentados. Em vários estados a soma passa do limite.'))
add(Q('**Antes de usar estes números:** confira as regras de divisão de cadeiras (como entram os eleitos por quociente partidário e por sobras, as barreiras de 10%, 80% e 20% do quociente e a decisão do STF sobre as sobras) com a legislação e as resoluções do TSE em vigor. A simulação não é previsão: mantém os votos de 2026 e ignora o limite de candidatos por lista (ver Regras e método).'))
add(H(3, 'O que cada parte traz'))
add(TBL(['Parte', 'O que traz'], [
    ['Quadro-resumo', 'Os achados principais em uma tabela, logo abaixo'],
    ['Regras e método', 'Como as cadeiras são divididas (quociente eleitoral, quociente partidário, sobras por maior média), como a simulação foi feita e validada, e os limites dela'],
    ['Capítulo 1 · Brasil', 'Composição da Câmara dos Deputados nos seis cenários, impacto em todos os partidos, foco no PSB, tamanho da esquerda e os deputados federais que entram e saem, com nome, partido e votos'],
    ['Capítulo 2 · Estados', 'Uma tabela com o que muda em cada estado e, em seguida, as UFs em que algum cenário muda quem é eleito: cadeiras por partido, quem entra e quem sai e os candidatos de esquerda cujo resultado muda. Estados sem nenhuma mudança não aparecem'],
    ['Apêndice', 'Exemplo passo a passo de um estado, pontos das regras a conferir, glossário e fontes']]))

# ------------------------------------------------------------------ quadro-resumo
add(H(3, 'Quadro-resumo dos achados'))
add(P('Cadeiras em cada cenário; entre parênteses, a diferença para o resultado real de 2026. "Esquerda" = PT, PCdoB, PV, PSB, PDT, PSOL e Rede.'))
def lin(lab, base, vals, bold=False):
    t = f'**{lab}**' if bold else lab
    return [t, f'**{base}**' if bold else str(base)] + [cel(v, base, bold) for v in vals]
HQ = ['Indicador', '2026 (real)'] + CENH
rows = [lin('PSB, deputados federais', psbf['real'], [psbf[k] for k in CEN], True),
        lin('PSB, deputados estaduais e distritais', psbe['real'], [psbe[k] for k in CEN], True),
        lin('Esquerda, deputados federais', tf['real'], [tf[k] for k in CEN], True),
        ['Esquerda, % da Câmara (513)', pct(tf['real'], 513)] + [pct(tf[k], 513) for k in CEN],
        lin('Esquerda, deputados estaduais e distritais', te['real'], [te[k] for k in CEN], True),
        ['Esquerda, % do total (1.059)', pct(te['real'], 1059)] + [pct(te[k], 1059) for k in CEN],
        lin('PT, federais', fed['real']['PT'], [fed[k]['PT'] for k in CEN]),
        lin('PCdoB, federais', fed['real']['PCdoB'], [fed[k]['PCdoB'] for k in CEN]),
        lin('PDT, federais', fed['real']['PDT'], [fed[k]['PDT'] for k in CEN]),
        lin('PSOL + Rede, federais', fed['real']['PSOL'] + fed['real']['REDE'], [fed[k]['PSOL'] + fed[k]['REDE'] for k in CEN]),
        lin('PSDB, federais', fed['real']['PSDB'], [fed[k]['PSDB'] for k in CEN]),
        lin('Cidadania, federais', fed['real']['CIDADANIA'], [fed[k]['CIDADANIA'] for k in CEN]),
        lin('Demais partidos, federais', 513 - tf['real'], [513 - tf[k] for k in CEN]),
        ['Federais que entram (e o mesmo número que sai)', '—'] + [str(ent_n[k]) for k in CEN],
        ['Maior bancada da Câmara', f'{top["real"][0][0]} · {top["real"][0][1]}'] + [f'{top[k][0][0]} · {top[k][0][1]}' for k in CEN]]
# PSDB/Cidadania: o PSDB nos cenários A–E continua o mesmo; a linha Cidadania só muda em F
add(TBL(HQ, rows))
d = {k: tf[k] - tf['real'] for k in CEN}
assert d == {'A': 8, 'B': 7, 'C': 13, 'D': 19, 'E': 5, 'F': 2}, d
add(P('**O que o quadro mostra**'))
add(LST([
    '**O PSB ganha quando se federa, mas não em todo estado.** Entre os federais, o melhor resultado é em B (PSB + PDT) e em D, com +5 cada. Em A, o PSB ganha em CE, GO, MA e PB e perde em BA e SP, com saldo de +2.',
    '**No cenário B, o PSB tem o maior ganho nos dois cargos:** +5 federais e +3 estaduais e distritais. No cenário E, em que não entra, o PSB fica igual nos federais e perde 1 estadual.',
    '**Com o Cidadania (F), o PSB ganha 2 federais e perde 1 estadual.** Os dois federais vêm do Ceará e do Maranhão. O ganho vem de votos que a federação PSDB/Cidadania não aproveitava: no Ceará, os votos do Cidadania não elegiam ninguém; no Maranhão, o PSDB sozinho fica abaixo da barreira de 80% do quociente e perde a vaga para o PSB. Em Goiás, o PSB perde 1 estadual para um candidato do Cidadania na mesma lista.',
    '**Quem paga em F é o PSDB, não o campo adversário:** o PSDB cai de 11 para 9 federais (MA e SP) e o PSD perde 1 (CE). O Cidadania passa de 0 a 1 federal (SP).',
    '**A esquerda vai de 124 a, no máximo, 143 federais** (27,9% da Câmara, cenário D); em F chega a 126. Nenhum cenário chega perto da maioria de 257.',
    '**Nos cenários A a E, quem paga são os partidos de fora do campo.** Em D, UNIÃO perde 4 cadeiras; PSD e Republicanos, 3 cada. O PL perde 2 em A, B, C e D.',
    '**Dentro da federação, nem todo partido ganha.** O PCdoB perde 1 federal em A e em B; o PDT perde 2 estaduais em C e 3 em D. A vaga vai para o candidato mais votado da lista, de qualquer partido.',
    '**Nos cenários C e D, a federação vira a maior bancada da Câmara** (122 e 143 contra 119 do PL). Em A e E fica em segundo lugar; em F, o PL segue na frente.',
    '**Nos estados, o efeito é menor:** a esquerda varia de −1 (F) a +11 estaduais e distritais; os 7 distritais do DF não mudam em nenhum cenário.']))

# checagens dos números citados nos bullets
assert psbf['real'] == 15 and [psbf[k] - 15 for k in CEN] == [2, 5, 4, 5, 0, 2]
assert [psbe[k] - psbe['real'] for k in CEN] == [1, 3, 2, 1, -1, -1]
assert fed['real']['PL'] == 121 and [fed[k]['PL'] for k in CEN] == [119, 119, 119, 119, 121, 121]
assert [fed[k]['UNIÃO'] - fed['real']['UNIÃO'] for k in CEN][3] == -4 and fed['D']['PSD'] - fed['real']['PSD'] == -3 and fed['D']['REPUBLICANOS'] - fed['real']['REPUBLICANOS'] == -3
assert [fed[k]['PCdoB'] - 11 for k in CEN][:2] == [-1, -1]
assert [te[k] - te['real'] for k in CEN] == [3, 2, 6, 11, 4, -1]
assert top['C'][0] == ('FBE + PSB + PDT', 122) and top['D'][0] == ('FBE + PSB + PDT + PSOL/Rede', 143)
pdt_est = [est[k]['PDT'] - est['real']['PDT'] for k in CEN]; print('PDT est', pdt_est)
assert pdt_est[2] == -2 and pdt_est[3] == -3, pdt_est
assert fed['F']['PSDB'] == 9 and fed['F']['CIDADANIA'] == 1 and fed['F']['PSD'] - fed['real']['PSD'] == -1

# ------------------------------------------------------------------ Regras e método
add(H(2, 'Regras de divisão de cadeiras, cenários e método'))
add(P('As cadeiras de deputado são divididas por um sistema proporcional: cada partido ou federação conquista vagas conforme a soma de seus votos, e dentro dele são eleitos os candidatos mais votados. As regras abaixo foram aplicadas tal como descritas e **precisam ser conferidas com a legislação e as resoluções do TSE em vigor antes de qualquer uso público dos números**.'))
add(H(3, 'Passo a passo da divisão'))
add(LST([
    '**Votos válidos** = votos nominais + votos de legenda. Brancos, nulos e votos anulados (inclusive *sub judice*) ficam de fora. Neste estudo, "legenda" = voto de legenda válido + voto nominal convertido em legenda, como o TSE publica.'.replace('*sub judice*', 'sub judice'),
    '**Quociente eleitoral (QE)** = votos válidos do estado ÷ número de vagas. Fração igual ou inferior a 0,5 é desprezada; fração superior a 0,5 vale 1 (Código Eleitoral, art. 106).',
    '**Quociente partidário (QP)** = votos da lista (partido ou federação) ÷ QE, desprezada a fração (art. 107). É o número de vagas que a lista conquista **por QP**. Lista abaixo do QE não tem QP.',
    '**Quem ocupa as vagas do QP:** os candidatos mais votados da lista, desde que cada um tenha pelo menos **10% do QE** em votos nominais (art. 108).',
    '**Sobras, por maior média:** as vagas que restaram vão uma a uma para a lista de maior média = votos da lista ÷ (vagas já obtidas + 1) (art. 109). Nessa etapa só concorrem listas com pelo menos **80% do QE** e candidatos com pelo menos **20% do QE**. Quem entra aqui é eleito **por sobra**.',
    '**Se ainda sobrarem vagas,** vale a decisão do STF nas ADIs 7228, 7263 e 7325: todas as listas disputam pela maior média, **sem** as barreiras de 80% e 20%. Em 2026 essa etapa não foi necessária em nenhum estado.',
    '**Se nenhuma lista atingir o QE,** as vagas vão aos candidatos mais votados (art. 111). Não ocorreu em 2026.',
    '**Federação** vale como um único partido: soma votos nominais e de legenda e tem uma só lista. A vaga vai ao mais votado da federação, seja de que partido for. Por isso a federação pode crescer e, ainda assim, um partido pequeno dentro dela perder cadeira.'], 'ordered'))
add(P('Nas tabelas, a coluna "Vaga por" mostra como o candidato é eleito: **QP** (vaga do quociente partidário) ou **Sobra** (vaga das sobras, pela maior média).'))
add(H(3, 'Dados e como foram validados'))
add(LST([
    '**Votos:** arquivos oficiais do TSE de votação por candidato e por partido, 1º turno de 2026, gerados em 25/10/2026. Cadastro de candidaturas também do TSE.',
    '**Cargos:** deputados estaduais (1.035 vagas) e distritais (24, no DF) são tratados como um só cargo, com 1.059 vagas. Os federais somam 513.',
    '**Validação:** aplicado às listas reais, o cálculo reproduz os **1.572 eleitos de 2026** (513 federais, 1.035 estaduais e 24 distritais), um a um, e a forma de eleição de cada um (por QP ou por sobra), sem nenhuma divergência. O mesmo cálculo reproduz os 1.572 eleitos de 2022. Um segundo cálculo, feito de forma independente a partir dos arquivos brutos do TSE, chegou aos mesmos eleitos nos seis cenários, em todos os estados.',
    '**Nos cenários,** os votos de cada candidato e de cada legenda ficam exatamente como foram em 2026. Só muda a forma de contar: os votos dos partidos fundidos formam uma lista única e as cadeiras são divididas pelas regras acima. No cenário F, a federação PSDB/Cidadania é desfeita e cada partido leva seus candidatos e seu voto de legenda.']))
add(H(3, 'Limites da simulação'))
add(LST([
    '**Não é previsão.** Numa federação real, partidos escolhem candidatos de outro jeito e o eleitor pode votar de outro jeito.',
    '**Limite de candidatos por lista:** a lei permite no máximo número de vagas + 1 candidatos por partido ou federação. Este estudo usa o número de candidatos que cada partido e federação lançaram em 2026. Em vários estados, a soma dos candidatos dos partidos que se fundem passa desse limite; a lista fundida teria de ter menos candidatos, e isso poderia mudar os resultados. No cenário F, cortar cada lista fundida nos mais votados até o limite não muda nenhum eleito.',
    '**Cenário F e o voto de legenda:** na federação PSDB/Cidadania o voto de legenda vale para a lista única. Para desfazê-la, cada partido ficou com os votos de legenda que o TSE publica para ele. O resultado de F não muda se esse voto for dividido em proporção aos votos nominais de cada partido, nem se ficar todo com o PSDB. Só mudaria se ficasse todo com o Cidadania (cinco combinações de estado e cargo).',
    '**Não modelado:** exigências estatutárias das federações (permanência mínima de 4 anos, programa e estatuto comuns), fundo partidário, tempo de rádio e TV, cotas de gênero e desempate por idade.',
    '**"Esquerda"** neste estudo = PT, PCdoB, PV, PSB, PDT, PSOL e Rede. É uma escolha de análise, ajustável. O Cidadania não entra, nem em F, quando se junta ao PSB: seus deputados aparecem à parte.']))

# ------------------------------------------------------------------ Capítulo 1
add(H(2, 'Capítulo 1 · Brasil'))
add(P('Este capítulo mostra o efeito das federações na Câmara dos Deputados (513 cadeiras): a composição em cada cenário, quem ganha e quem perde, o foco no PSB, o tamanho da esquerda e os deputados que entram e saem. Nas tabelas, "n (+d)" é o número de cadeiras no cenário e a diferença para 2026.'))
add(H(3, '1.1 Composição da Câmara dos Deputados nos seis cenários'))
add(P('O PL continua sendo a maior bancada nos cenários A, B, E e F; em C e D, a federação de esquerda passa à frente.'))
rows = [[pn(p), str(fed['real'][p])] + [cel(fed[k][p], fed['real'][p]) for k in CEN] for p in partidos]
rows.append(['**Total**', '**513**'] + [f'**{sum(fed[k].values())}**' for k in CEN])
add(TBL(['Partido', '2026 (real)'] + CENH, rows))
add(P('Por lista (partido ou federação), as três maiores bancadas em cada cenário:'))
rows = [['2026 (real)'] + [f'{a} · {v}' for a, v in top['real'][:3]]]
for k in CEN: rows.append([CH(k)] + [f'{a} · {v}' for a, v in top[k][:3]])
add(TBL(['Cenário', '1ª maior', '2ª maior', '3ª maior'], rows))
add(P(f'UNIÃO/PP, PSDB/Cidadania e PRD/Solidariedade são federações que já existem; aqui UNIÃO e PP aparecem separados na primeira tabela e somados na segunda. Em B, PSB + PDT somam {fed["B"]["PSB"] + fed["B"]["PDT"]}. Em F, a PSDB/Cidadania é desfeita: PSDB ({fed["F"]["PSDB"]}) e Cidadania ({fed["F"]["CIDADANIA"]}) aparecem separados e PSB + Cidadania somam {fed["F"]["PSB"] + fed["F"]["CIDADANIA"]}.'))

add(H(3, '1.2 Impacto em todos os partidos'))
dem = {k: sum(fed[k][p] - fed['real'][p] for p in partidos if p not in CAMPO) for k in CEN}
add(P(f'Toda cadeira que a esquerda ganha sai de outro partido, porque o total é fixo em 513: em D, os demais partidos perdem {-dem["D"]} cadeiras; em E, {-dem["E"]}; em F, {-dem["F"]}.'))
assert (-dem['D'], -dem['E'], -dem['F']) == (19, 5, 2)
add(P('**Os sete partidos de esquerda**'))
rows = [[pn(p), str(fed['real'][p])] + [cel(fed[k][p], fed['real'][p]) for k in CEN] for p in CAMPO]
rows.append(['**Esquerda**', f'**{tf["real"]}**'] + [cel(tf[k], tf['real'], True) for k in CEN])
add(TBL(['Partido', '2026 (real)'] + CENH, rows))
add(P('**Os partidos que perdem cadeiras** (só aparecem os que mudam; a diferença em relação a 2026)'))
rows = []
for p in partidos:
    if p in CAMPO: continue
    ds = [fed[k][p] - fed['real'][p] for k in CEN]
    if any(ds): rows.append([f'{pn(p)} (2026: {fed["real"][p]})'] + [dcel(x) for x in ds])
rows.append(['**Soma dos demais**'] + [dcel(dem[k], True) for k in CEN])
add(TBL(['Partido'] + CENH, rows))
add(P('Avante, PRD, Solidariedade, Missão e os demais não mudam em nenhum cenário. O PSDB e o Cidadania só mudam em F: o PSDB perde 2 federais (Juscelino Filho, no Maranhão, e Paulo Serra, em São Paulo) e o Cidadania ganha 1 (Alex Manente, em São Paulo). Dentro das federações, o PCdoB perde 1 federal em A e em B, e nos dois casos é Márcio Jerry, do Maranhão (54.953 votos). Em A, na lista fundida, Othelino Neto (PSB, 74.414) tem mais votos que ele. Em B, a nova lista PSB + PDT leva a vaga de sobra que era dele.'))

add(H(3, '1.3 Foco 1 · O PSB'))
add(P('O PSB sobe de 15 para 17 a 20 deputados federais nos cinco cenários em que entra numa federação (A a D e F), e fica em 15 no cenário E, em que não entra. Em F, a federação é só com o Cidadania: o PSB ganha 2 federais e perde 1 estadual.'))
add(TBL(['PSB', '2026 (real)'] + CENH, [
    ['Deputados federais', str(psbf['real'])] + [cel(psbf[k], psbf['real']) for k in CEN],
    ['Deputados estaduais e distritais', str(psbe['real'])] + [cel(psbe[k], psbe['real']) for k in CEN]]))
add(P('**Onde o PSB muda (deputados federais).** Só aparecem os estados em que algum cenário altera a bancada.'))
rows = []
for uf in UFS:
    base = conta(real, 6, uf)['PSB']; vs = [conta(S[k]['eleitos'], 6, uf)['PSB'] for k in CEN]
    if any(v != base for v in vs): rows.append([uf, str(base)] + [cel(v, base) for v in vs])
add(TBL(['UF', '2026 (real)'] + CENH, rows))
add(P('**Quais deputados federais do PSB entram e saem.** Dentro de uma lista fundida, a vaga vai pelo voto, não pelo partido: em A, na Bahia, Mario Negromonte Jr (PSB, 101.536 votos) perde a vaga para Zé Neto (PT, 104.550) e Bacelar (PV, 102.703), mais votados da mesma lista.'))
rows = []
for k in CEN:
    ent, sai = mud(k, 6)
    for e in sorted([e for e in ent if e['partido'] == 'PSB'], key=lambda e: (e['uf'], -e['votos'])): rows.append([CH(k), ('Entra', GAIN), e['uf'], e['nome'], n(e['votos']), VAGA[e['fase']]])
    for e in sorted([e for e in sai if e['partido'] == 'PSB'], key=lambda e: (e['uf'], -e['votos'])): rows.append([CH(k), ('Sai', LOSS), e['uf'], e['nome'], n(e['votos']), VAGA[e['fase']] + ' em 2026'])
add(TBL(['Cenário', 'Situação', 'UF', 'Candidato', 'Votos', 'Vaga por'], rows))
add(P('No cenário E, nenhum deputado federal do PSB entra ou sai. Em "Vaga por", QP é a vaga do quociente partidário e Sobra é a vaga das sobras; para quem sai, é a forma como foi eleito em 2026.'))

add(H(3, '1.4 Foco 2 · O tamanho da esquerda'))
add(P(f'A esquerda tem {tf["real"]} deputados federais em 2026 ({pct(tf["real"], 513)}) e chega a {tf["D"]} ({pct(tf["D"], 513)}) no cenário D, o de maior alcance. O de menor alcance é o F, com {tf["F"]} ({pct(tf["F"], 513)}). Nenhum cenário se aproxima da maioria de 257.'))
add(TBL(['Federais', '2026 (real)'] + CENH, [
    ['Esquerda (7 partidos)', str(tf['real'])] + [cel(tf[k], tf['real']) for k in CEN],
    ['% da Câmara (513)', pct(tf['real'], 513)] + [pct(tf[k], 513) for k in CEN],
    ['Demais partidos', str(513 - tf['real'])] + [str(513 - tf[k]) for k in CEN]]))
add(P('Nas assembleias legislativas e na Câmara Legislativa do DF, o efeito é menor:'))
add(TBL(['Estaduais e distritais', '2026 (real)'] + CENH, [
    ['Esquerda (7 partidos)', str(te['real'])] + [cel(te[k], te['real']) for k in CEN],
    ['% do total (1.059)', pct(te['real'], 1059)] + [pct(te[k], 1059) for k in CEN],
    ['Demais partidos', str(1059 - te['real'])] + [str(1059 - te[k]) for k in CEN]]))

add(H(3, '1.5 Deputados federais que entram e que saem'))
add(P('O número de deputados que entram é sempre igual ao dos que saem, pois o total é fixo. Em cada cenário: ' + ', '.join(f'**{k}** {ent_n[k]}' for k in CEN[:-1]) + f' e **F** {ent_n["F"]}. "Vaga por" é a forma de eleição: QP (quociente partidário) ou Sobra (maior média); para quem sai, é a forma como foi eleito em 2026. A lista dos eleitos de cada cenário, estado a estado, está no Capítulo 2 (estados em que há mudança).'))
for k in CEN:
    ent, sai = mud(k, 6)
    add(H(4, f'{EMO[k]} Cenário {k} · {LAB[k]}: {len(ent)} entram, {len(sai)} saem'))
    rows = []
    for uf in sorted({e['uf'] for e in ent + sai}):
        for e in sorted([e for e in ent if e['uf'] == uf], key=lambda e: -e['votos']): rows.append([uf, ('Entra', GAIN), e['nome'], pn(e['partido']), n(e['votos']), VAGA[e['fase']]])
        for e in sorted([e for e in sai if e['uf'] == uf], key=lambda e: -e['votos']): rows.append([uf, ('Sai', LOSS), e['nome'], pn(e['partido']), n(e['votos']), VAGA[e['fase']] + ' em 2026'])
    add(TBL(['UF', 'Situação', 'Candidato', 'Partido', 'Votos', 'Vaga por'], rows))

# ------------------------------------------------------------------ Capítulo 2
mudou = {}
for k in CEN:
    for cargo in (6, 7):
        for (c, u) in info:
            if c != cargo: continue
            ent, sai = mud(k, cargo, u)
            if ent or sai: mudou.setdefault((cargo, u), []).append(k)
UFS_M = [u for u in UFS if any((c, u) in mudou for c in (6, 7))]
UFS_N = [u for u in UFS if u not in UFS_M]
print('UFs com mudança', len(UFS_M), UFS_M, '| sem mudança', UFS_N)
def celmud(k, cargo, uf):
    ent, sai = mud(k, cargo, uf)
    if not ent and not sai: return '—'
    b = conta(real, cargo, uf); c = conta(S[k]['eleitos'], cargo, uf)
    ds = {p: c[p] - b[p] for p in set(b) | set(c) if c[p] != b[p]}
    net = campo(c) - campo(b)
    if ds:
        its = sorted(ds.items(), key=lambda kv: (-kv[1], pn(kv[0])))
        txt = ', '.join(f'{pn(p)} {dl(v)}' for p, v in its)
    else: txt = f'troca {len(ent)} candidato' + ('s' if len(ent) > 1 else '') + ', mesmos partidos'
    return (txt, GAIN if net > 0 else (LOSS if net < 0 else MIX))
add(H(2, 'Capítulo 2 · Estados'))
add(P(f'Este capítulo detalha os {len(UFS_M)} estados em que pelo menos um cenário muda quem é eleito, para deputado federal ou para deputado estadual/distrital. Os outros {len(UFS_N)} ({", ".join(UFS_N)}) não têm nenhuma mudança em nenhum cenário e não aparecem. Cada estado começa com as mudanças que ocorreriam; depois, para cada cargo com mudança, vêm três tabelas: (1) as cadeiras de cada partido de esquerda no resultado real e nos cenários; (2) quem entra e quem sai em relação a 2026, de qualquer partido; (3) os candidatos de esquerda cujo resultado muda, cenário a cenário, com a forma de eleição (QP, Sobra ou — para não eleito), em verde quando entra e em vermelho quando sai.'))
add(P('Nas tabelas de cadeiras, "n (+d)" é o número no cenário e a diferença para 2026; QE é o quociente eleitoral do estado. O QE não muda entre os cenários, porque os votos válidos são os mesmos.'))
add(H(3, 'O que muda em cada estado'))
add(P('Em cada cenário, as cadeiras que mudam de partido (a diferença em relação a 2026). **Verde:** a esquerda ganha cadeiras. **Vermelho:** a esquerda perde. **Amarelo:** o total da esquerda não muda, mas muda quem é eleito. "—": nenhuma mudança.'))
rows = []
for uf in UFS_M:
    for cargo, rot in ((6, 'Federal'), (7, 'Estadual/distrital')):
        if (cargo, uf) in mudou: rows.append([f'{uf} · {rot}'] + [celmud(k, cargo, uf) for k in CEN])
add(TBL(['UF · cargo'] + CENH, rows))


NOTA_F = {
    (6, 'CE'): 'Os votos do Cidadania, que na federação PSDB/Cidadania não elegiam ninguém, passam a somar na lista do PSB, que ganha uma vaga de sobra (Roger Aguiar); a vaga sai do PSD (Célio Studart).',
    (6, 'MA'): 'Sem o Cidadania, o PSDB sozinho fica abaixo da barreira de 80% do quociente e perde a vaga de sobra de Juscelino Filho, que vai para o PSB (Othelino Neto).',
    (6, 'SP'): 'Sem o Cidadania, o PSDB soma 250.766 votos, abaixo do quociente (338.203) e da barreira de 80%, e perde a vaga por QP que a federação tinha. O PSB + Cidadania soma 1.092.823 (3,23 quocientes) e passa de 2 para 3 vagas por QP; a terceira é de Alex Manente (Cidadania).',
    (7, 'GO'): 'Na lista PSB + Cidadania (149.820 votos, 1 vaga por QP), a vaga vai ao candidato mais votado da lista, GCM Romário Policarpo (Cidadania, 55.337 votos), e Rubens Marques (PSB) fica de fora. O PSDB sozinho (233.239) tem 2 vagas por QP e ganha a terceira por sobra.'}
def nota_f(cargo, uf):
    ent, sai = mud('F', cargo, uf)
    if not ent: return None
    base = conta(real, cargo, uf); cf = conta(S['F']['eleitos'], cargo, uf)
    partes = [f'{pn(p)} {base[p]} → {cf[p]}' for p in sorted(set(base) | set(cf), key=lambda p: (p not in ('PSB', 'CIDADANIA', 'PSDB'), pn(p))) if cf[p] != base[p]]
    t0, t1 = campo(base), campo(cf)
    fim = f'A esquerda (7 partidos) vai de {t0} para {t1}.' if t0 != t1 else 'O total da esquerda (7 partidos) não muda.'
    return f'**{EMO["F"]} Cenário F · PSB + Cidadania.** {len(ent)} entra e {len(sai)} sai: ' + '; '.join(partes) + f'. {fim} ' + NOTA_F[(cargo, uf)]

def secao(uf):
    add(H(3, f'{uf} · {UFNOME[uf]}'))
    add(P('**O que muda neste estado**'))
    rows = []
    for cargo, rot in ((6, 'Federal'), (7, 'Estadual/distrital')):
        if (cargo, uf) in info and (cargo, uf) in mudou: rows.append([rot] + [celmud(k, cargo, uf) for k in CEN])
    add(TBL(['Cargo'] + CENH, rows))
    for cargo in (6, 7):
        if (cargo, uf) not in info: continue
        b = info[(cargo, uf)]
        add(H(4, f'{CARGO[cargo]}: {b["vagas"]} vagas · QE {n(b["QE"])}'))
        if (cargo, uf) not in mudou:
            fch = any(sets[k][(cargo, uf)][sq]['fase'] != sets_real[(cargo, uf)][sq]['fase'] for k in CEN for sq in sets_real[(cargo, uf)] if sq in sets[k][(cargo, uf)])
            add(P('Nenhum dos seis cenários muda os eleitos neste cargo.' + (' A forma de eleição (QP ou sobra) de alguns deles pode mudar.' if fch else '')))
            continue
        base = conta(real, cargo, uf); ccs = {k: conta(S[k]['eleitos'], cargo, uf) for k in CEN}
        t0 = campo(base); totc = {k: campo(ccs[k]) for k in CEN}
        rows = [[pn(p), str(base[p])] + [cel(ccs[k][p], base[p]) for k in CEN] for p in CAMPO]
        rows.append(['**Esquerda**', f'**{t0}**'] + [cel(totc[k], t0, True) for k in CEN])
        dm = b['vagas'] - t0
        rows.append(['Demais partidos', str(dm)] + [cel(b['vagas'] - totc[k], dm) for k in CEN])
        add(TBL(['Partido', '2026 (real)'] + CENH, rows))
        rows = []
        for k in CEN:
            ent, sai = mud(k, cargo, uf)
            for e in sorted(ent, key=lambda e: -e['votos']): rows.append([CH(k), ('Entra', GAIN), e['nome'], pn(e['partido']), n(e['votos']), VAGA[e['fase']]])
            for e in sorted(sai, key=lambda e: -e['votos']): rows.append([CH(k), ('Sai', LOSS), e['nome'], pn(e['partido']), n(e['votos']), VAGA[e['fase']] + ' em 2026'])
        add(P('**Quem entra e quem sai em relação a 2026**'))
        add(TBL(['Cenário', 'Situação', 'Candidato', 'Partido', 'Votos', 'Vaga por'], rows))
        nf = nota_f(cargo, uf)
        if nf: add(P(nf))
        sqs = {}
        for e in real:
            if e['cargo'] == cargo and e['uf'] == uf and e['partido'] in CAMPO: sqs[e['sq']] = e
        for k in CEN:
            for e in S[k]['eleitos']:
                if e['cargo'] == cargo and e['uf'] == uf and e['partido'] in CAMPO: sqs.setdefault(e['sq'], e)
        add(P('**Candidatos de esquerda cujo resultado muda** (QP ou Sobra = forma de eleição; — = não eleito; verde = entra; vermelho = sai). Os demais deputados de esquerda do estado têm o mesmo resultado em todos os cenários.'))
        rows = []
        def muda_sq(sq):
            r0 = sets_real[(cargo, uf)].get(sq)
            for k in CEN:
                e1 = sets[k][(cargo, uf)].get(sq)
                if bool(e1) != bool(r0) or (e1 and r0 and e1['fase'] != r0['fase']): return True
            return False
        for sq, e in sorted(sqs.items(), key=lambda kv: -kv[1]['votos']):
            if not muda_sq(sq): continue
            r0 = sets_real[(cargo, uf)].get(sq)
            row = [e['nome'], pn(e['partido']), n(e['votos']), VAGA[r0['fase']] if r0 else '—']
            for k in CEN:
                e1 = sets[k][(cargo, uf)].get(sq)
                v = VAGA[e1['fase']] if e1 else '—'
                row.append((v, GAIN) if (e1 and not r0) else ((v, LOSS) if (r0 and not e1) else v))
            rows.append(row)
        if rows: add(TBL(['Candidato', 'Partido', 'Votos', '2026'] + [f'{EMO[k]} {k} · {LAB[k]}' for k in CEN], rows))
        else: add(P('Nenhum candidato de esquerda tem resultado diferente em algum cenário neste cargo.'))
for uf in UFS_M: secao(uf)

# ------------------------------------------------------------------ Apêndice
add(H(2, 'Apêndice'))
add(H(3, 'A. Exemplo passo a passo: Sergipe, deputado federal (8 vagas)'))
add(P('O exemplo mostra, com um estado pequeno, como a divisão de cadeiras funciona e por que o cenário A (PSB na FBE, com PT/PCdoB/PV) elege Marcio Macedo (PT) no lugar de Gustinho Ribeiro (PP). Qualquer pessoa pode refazer as contas com uma calculadora.'))
add(P('**1. Quociente eleitoral.** Votos válidos: 1.283.700. Divididos por 8 vagas, dão 160.462,5. A fração é exatamente 0,5, e fração igual ou inferior a 0,5 é desprezada: QE = 160.462.'))
add(P('**2. Quociente partidário, no resultado real de 2026.** Votos da lista ÷ QE, sem a fração.'))
add(TBL(['Lista', 'Votos (nominais + legenda)', '÷ QE', 'QP'], [
    ['UNIÃO/PP', '315.092', '1,96', '1'], ['PSD', '257.174', '1,60', '1'], ['REPUBLICANOS', '202.916', '1,26', '1'],
    ['PSB', '193.321', '1,20', '1'], ['PT/PCdoB/PV (FBE)', '173.171', '1,08', '1'], ['PL', '93.013', '0,58', '0']]))
add(P('Cinco vagas saem por QP. Restam 3. Em cada lista, a vaga do QP vai ao mais votado, desde que tenha ao menos 10% do QE (16.046 votos).'))
add(P('**3. Sobras por maior média.** Média = votos da lista ÷ (vagas já obtidas + 1). Só disputam listas com pelo menos 80% do QE (128.370 votos) e candidatos com pelo menos 20% do QE (32.092 votos).'))
add(TBL(['Rodada', 'Médias das listas', 'Vence'], [
    ['1ª sobra', 'UNIÃO/PP 315.092 ÷ 2 = 157.546; PSD 257.174 ÷ 2 = 128.587; REPUBLICANOS 101.458; PSB 96.660; PT/PCdoB/PV 86.586', 'UNIÃO/PP (Capitão Samuel, 66.342)'],
    ['2ª sobra', 'UNIÃO/PP 315.092 ÷ 3 = 105.031; PSD 128.587', 'PSD (Delegada Katarina, 71.592)'],
    ['3ª sobra', 'UNIÃO/PP 105.031; PSD 257.174 ÷ 3 = 85.725', 'UNIÃO/PP (Gustinho Ribeiro, 58.289)']]))
add(P('Resultado real: UNIÃO/PP 3, PSD 2, REPUBLICANOS 1, PSB 1, PT/PCdoB/PV 1, ou seja, 8 vagas.'))
add(P('**4. Cenário A.** PT/PCdoB/PV e PSB viram uma lista só, com 173.171 + 193.321 = 366.492 votos. ÷ QE = 2,28, então QP = 2, e as duas vagas vão aos mais votados da lista, Claudio Mitidieri (PSB, 105.865) e Joao Daniel (PT, 88.900). Os QP dos demais ficam como antes (UNIÃO/PP 1, PSD 1, REPUBLICANOS 1), e restam 3 sobras.'))
add(TBL(['Rodada', 'Médias das listas', 'Vence'], [
    ['1ª sobra', 'UNIÃO/PP 157.546; PSD 128.587; PT/PCdoB/PV/PSB 366.492 ÷ 3 = 122.164', 'UNIÃO/PP (Capitão Samuel)'],
    ['2ª sobra', 'PSD 128.587; UNIÃO/PP 105.031; fundida 122.164', 'PSD (Delegada Katarina)'],
    ['3ª sobra', 'fundida 122.164; UNIÃO/PP 105.031; PSD 85.725', 'Federação: Marcio Macedo (PT, 59.143), o 3º mais votado da lista']]))
add(P('A federação fica com 3 vagas (2 por QP e 1 por sobra), a UNIÃO/PP com 2 e o PP perde Gustinho Ribeiro. Os votos são os mesmos; mudou a lista que os soma. Repare que, na lista única, o PSB continua com 1 deputado (Mitidieri) e o PT passa de 1 para 2.'))
add(H(3, 'B. Pontos das regras a conferir'))
add(P('A leitura das regras usada aqui reproduz os resultados oficiais de 2022 e 2026. Mas os cenários criam situações que a eleição real não criou, como uma federação de esquerda com mais candidatos do que o limite por lista, ou o voto de legenda de uma federação dividido entre dois partidos (cenário F). Por isso convém conferir com a legislação e as resoluções do TSE, em especial: (a) a ordem de preenchimento das vagas por QP e por sobra; (b) as barreiras de 10%, 80% e 20% do QE; (c) o tratamento das sobras após a decisão do STF; (d) o limite de candidatos por lista.'))
add(H(3, 'C. Glossário'))
add(TBL(['Termo', 'Significado'], [
    ['FBE', 'Federação Brasil da Esperança: PT, PCdoB e PV'],
    ['Votos válidos', 'Votos nominais e de legenda válidos. Não contam brancos, nulos nem votos anulados'],
    ['Voto de legenda', 'Voto no partido ou federação, mais os votos nominais que o TSE converte em legenda'],
    ['QE (quociente eleitoral)', 'Votos válidos ÷ número de vagas, com a regra da fração'],
    ['QP (quociente partidário)', 'Votos da lista ÷ QE, sem a fração: as vagas que a lista ganha direto'],
    ['Sobra (maior média)', 'Votos da lista ÷ (vagas obtidas + 1): critério para distribuir as vagas que sobram depois do QP'],
    ['Vaga por', 'Forma como o candidato é eleito: QP ou Sobra'],
    ['Lista', 'Partido que concorre sozinho ou federação. A federação vale como um partido só'],
    ['Federação', 'União de partidos que atua como um partido: um número, uma lista, uma soma de votos'],
    ['Sub judice', 'Candidatura ainda em julgamento. Se for anulada, os votos não contam e o candidato não pode ser eleito'],
    ['Entra / Sai', 'Candidato que é eleito no cenário e não foi em 2026 / foi eleito em 2026 e não é no cenário'],
    ['Esquerda', 'Neste estudo, PT, PCdoB, PV, PSB, PDT, PSOL e Rede'],
    ['Federação desfeita (cenário F)', 'PSDB e Cidadania voltam a ser listas separadas. Cada um leva seus candidatos e os votos de legenda que o TSE publica para o seu número; o Cidadania forma uma lista única com o PSB'],
    ['Estaduais e distritais', 'Tratados como um só cargo: 1.035 deputados estaduais e 24 distritais (DF), 1.059 vagas']]))
add(H(3, 'D. Fontes e dados'))
add(P('Votos e candidaturas: dados abertos do TSE (dadosabertos.tse.jus.br), votação por candidato e por partido do 1º turno de 2026 e de 2022, e cadastro de candidaturas de 2026.'))
add(P('Regras: Código Eleitoral (Lei 4.737/1965), arts. 106 a 112; Lei 14.211/2021; Lei 9.504/1997, art. 10; decisão do STF nas ADIs 7228, 7263 e 7325 sobre as sobras. Matérias explicativas consultadas: Congresso em Foco, TRE-SP e O Povo.'))

json.dump(B, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))
import os; print('blocos', len(B), 'bytes', os.path.getsize(OUT))
