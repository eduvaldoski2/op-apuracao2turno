"""Monta a planilha dos estudos a partir de estudos.py. Uso: planilha.py <est.json> <saida.xlsx>"""
import sys, json, re, collections
sys.path.insert(0, __file__.rsplit('/', 1)[0])
from base import *
from openpyxl import Workbook
from openpyxl.styles import Font, PatternFill, Alignment, Border, Side
from openpyxl.utils import get_column_letter as L

res = json.load(open(sys.argv[1], encoding='utf-8')); out = sys.argv[2]; ano = res['ano']
F1, F2 = 'PT/PC do B/PV', 'PSOL/REDE'
ROT = {F1: 'PT/PCdoB/PV', F2: 'PSOL/Rede', 'PSB': 'PSB', 'PDT': 'PDT'}
GRUPOS = [F1, F2, 'PSB', 'PDT']
CARGO = {6: 'Dep. federal', 7: 'Dep. estadual', 8: 'Dep. distrital (DF)'}
FASE = {'QP': 'Quociente partidário', 'MÉDIA': 'Sobras (maior média)', 'MÉDIA (sem barreira)': 'Sobras (maior média, sem barreira)', 'MAIS VOTADOS': 'Mais votados (ninguém atingiu o QE)'}
PARTIDOS = ['PT', 'PCdoB', 'PV', 'PSB', 'PDT', 'PSOL', 'REDE']
PNOME = {'REDE': 'Rede'}
CEN = {'A': 'PT/PCdoB/PV + PSB', 'B': 'PSB + PDT', 'C': 'PT/PCdoB/PV + PSB + PDT', 'D': 'PT/PCdoB/PV + PSB + PDT + PSOL/Rede', 'E': 'PT/PCdoB/PV + PSOL/Rede'}
HIP = {'S': 'Simulação', 'T': 'Com teto'}
FONT = 'Arial'
f_norm = Font(name=FONT, size=10); f_b = Font(name=FONT, size=10, bold=True); f_h = Font(name=FONT, size=10, bold=True, color='FFFFFF')
f_t = Font(name=FONT, size=14, bold=True); f_i = Font(name=FONT, size=9, italic=True, color='555555')
fill_h = PatternFill('solid', fgColor='1F3864'); fill_sub = PatternFill('solid', fgColor='D9E1F2'); fill_tot = PatternFill('solid', fgColor='F2F2F2')
fill_pos = PatternFill('solid', fgColor='E2EFDA'); fill_neg = PatternFill('solid', fgColor='FCE4D6')
thin = Side(style='thin', color='BFBFBF'); box = Border(top=thin, bottom=thin, left=thin, right=thin)
wb = Workbook(); wb.remove(wb.active)

def sheet(nome, tab=None):
    ws = wb.create_sheet(nome); ws.sheet_view.showGridLines = False
    if tab: ws.sheet_properties.tabColor = tab
    return ws
def cab(ws, row, heads, widths=None):
    for j, h in enumerate(heads, 1):
        c = ws.cell(row, j, h); c.font = f_h; c.fill = fill_h; c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True); c.border = box
    ws.row_dimensions[row].height = 32
    if widths:
        for j, w in enumerate(widths, 1): ws.column_dimensions[L(j)].width = w
def fmt(ws, r0, r1, c0, c1, nf=None):
    for r in range(r0, r1 + 1):
        for c in range(c0, c1 + 1):
            x = ws.cell(r, c)
            if not x.font.bold: x.font = f_norm
            if nf and isinstance(x.value, (int, float, str)) and (not isinstance(x.value, str) or x.value.startswith('=')): x.number_format = nf
            x.border = box
def titulo(ws, t, sub=None):
    ws['A1'] = t; ws['A1'].font = f_t
    if sub: ws['A2'] = sub; ws['A2'].font = f_i

# ------------------------------------------------------------------ dados auxiliares
vagas = {(b['cargo'], b['uf']): b for b in res['base_info']}
real = res['eleitos_real']; real_sq = {(e['cargo'], e['uf']): set() for e in real}
for e in real: real_sq[(e['cargo'], e['uf'])].add(e['sq'])
ufs_cargo = sorted(vagas, key=lambda k: (k[0], k[1]))
# cadastro: candidaturas registradas na urna por lista (teto legal)
reg = collections.defaultdict(int)
for uf in UFS:
    j = json.load(open(f'{RAIZ}/data/cand/2026/{uf}.json', encoding='utf-8')); I = {c: i for i, c in enumerate(j['cols'])}
    for r in j['rows']:
        if r[I['turno']] == 1 and r[I['cargo']] in (6, 7, 8) and r[I['na_urna']] == 'SIM':
            f = r[I['federacao']]; reg[(uf, r[I['cargo']], re.sub(r'\d+-', '', f) if f else r[I['sigla']])] += 1
# votos de legenda: pura x convertida
leg = collections.defaultdict(lambda: {'leg': 0, 'conv': 0, 'por': collections.defaultdict(int)})
for uf in UFS:
    j = carrega(ano, uf)
    for r in j['part']:
        p = dict(zip(j['part_cols'], r)); lid = p['fed'] or p['sigla']
        d = leg[(p['cargo'], uf, lid)]; d['leg'] += p['leg']; d['conv'] += p['conv']; d['por'][{'PCDOB': 'PCdoB'}.get(p['sigla'], p['sigla'])] += p['totleg']

# ------------------------------------------------------------------ Leia-me
ws = sheet('Leia_me', '7F7F7F'); ws.column_dimensions['A'].width = 130
titulo(ws, f'Oficina Política · Estudos sobre federações e distribuição de cadeiras · Eleições {ano}')
linhas = [
 ('ESCOPO', True),
 ('Estudo 1: deputados federais, estaduais (e distritais, no DF) eleitos em 2026 por PT/PCdoB/PV (federação), PSOL/Rede (federação), PSB e PDT, com votos nominais e votos de legenda.', False),
 ('Estudo 2: simulação do resultado de 2026 se houvesse as federações: A) PT/PCdoB/PV + PSB; B) PSB + PDT; C) PT/PCdoB/PV + PSB + PDT; D) PT/PCdoB/PV + PSB + PDT + PSOL/Rede; E) PT/PCdoB/PV + PSOL/Rede (o PSOL é federado com a Rede e a federação não se divide).', False),
 ('', False), ('FONTES', True),
 ('TSE, dados abertos: votacao_candidato_munzona_2026 e votacao_partido_munzona_2026 (1º turno, gerados em 25/10/2026) e consulta_cand_2026. Dados no repositório, em data/vot/2026 e data/cand/2026.', False),
 ('"Votos de legenda" = votos de legenda válidos + votos nominais convertidos em legenda (QT_TOTAL_VOTOS_LEG_VALIDOS do TSE). Votos anulados (inclusive sub judice) não entram nos votos válidos.', False),
 ('', False), ('REGRAS APLICADAS (Código Eleitoral arts. 106-112, Lei 14.211/2021, e decisão do STF sobre as sobras)', True),
 ('1. Quociente eleitoral (QE) = votos válidos (nominais + legenda) ÷ vagas; fração igual ou inferior a 0,5 é desprezada e superior a 0,5 vale 1.', False),
 ('2. Quociente partidário (QP) de cada partido ou federação = votos da lista ÷ QE, desprezada a fração. Ocupam as vagas do QP os candidatos mais votados da lista com pelo menos 10% do QE em votos nominais.', False),
 ('3. Sobras: cada vaga restante vai à lista de maior média (votos da lista ÷ (vagas já obtidas + 1)). Nessa etapa só concorrem listas com pelo menos 80% do QE e candidatos com pelo menos 20% do QE.', False),
 ('4. Se ainda restarem vagas (decisão do STF), todas as listas concorrem pela maior média, sem as barreiras de 80% e 20%. Se nenhuma lista atingir o QE, vencem os candidatos mais votados.', False),
 ('5. Federação vale como um único partido: soma votos nominais e de legenda e tem uma só lista; as vagas vão aos mais votados da federação, de qualquer partido dela.', False),
 ('', False), ('VALIDAÇÃO', True),
 ('O simulador, aplicado às listas reais, reproduz os 1.572 eleitos de 2026 (513 federais, 1.035 estaduais, 24 distritais) e a fase de entrada de cada um (QP ou média), sem nenhuma divergência. Também reproduz os 1.572 eleitos de 2022.', False),
 ('', False), ('COMO O ESTUDO 2 FOI FEITO', True),
 ('Os votos de 2026 ficam exatamente como foram, em cada candidato e em cada legenda. Só muda como eles são contados: nas federações simuladas, os votos dos partidos viram uma única lista e a divisão das cadeiras segue a regra do TSE acima.', False),
 ('Na prática, uma federação muda a estratégia de candidaturas e o voto do eleitor; isso não é simulado.', False),
 ('Aviso (aba E2_Teto): a lei limita cada lista a vagas + 1 candidatos. Em vários estados a soma dos candidatos dos partidos que se fundem passa desse limite, então a lista fundida teria de ter menos candidatos. Isso não entrou nas contas.', False),
 ('Não modelado: exigências estatutárias das federações (permanência mínima de 4 anos, programa e estatuto comuns), fundo partidário, tempo de TV e cotas de gênero.', False),
 ('Deputado distrital (DF) aparece separado dos estaduais. O resultado distrital não muda em nenhum cenário.', False),
 ('', False), ('ABAS', True),
 ('E1_Resumo · E1_UF · E1_Eleitos: Estudo 1.   E2_Resumo: cadeiras por partido (Brasil).   E2_Var_UF: variação por estado e partido.', False),
 ('E2_Eleitos: lista de eleitos de cada cenário, por estado.   E2_Mudancas: quem entra e quem sai em relação ao resultado real.   E2_Teto: aviso sobre o limite de candidatos por lista.', False),
 ('As abas E1_Resumo, E2_Resumo e E2_Var_UF são fórmulas sobre as listas (E1_UF, E1_Eleitos e E2_Eleitos).', False),
]
for i, (t, b) in enumerate(linhas, 3):
    c = ws.cell(i, 1, t); c.font = f_b if b else f_norm; c.alignment = Alignment(wrap_text=True, vertical='top')

# ------------------------------------------------------------------ E1_UF
ws1u = sheet('E1_UF', '2F75B5'); titulo(ws1u, 'Estudo 1 · Votação e cadeiras por estado, por partido ou federação', 'Votos de legenda = legenda válida + nominais convertidos em legenda. QE, QP e fases conforme as regras da aba Leia_me.')
H = ['Cargo', 'UF', 'Lista', 'Votos nominais', 'Legenda (pura)', 'Nominais convertidos em legenda', 'Votos de legenda (total)', 'Total da lista', 'Votos válidos da UF', '% dos válidos', 'QE', 'QP (cadeiras pelo quociente)', 'Eleitos por QP', 'Eleitos por sobras', 'Eleitos (total)', 'Legenda por partido']
cab(ws1u, 4, H, [18, 6, 16, 14, 13, 16, 14, 14, 14, 10, 11, 14, 10, 10, 10, 40])
r = 5
for (cargo, uf) in ufs_cargo:
    bi = vagas[(cargo, uf)]
    for g in GRUPOS:
        lr = next((x for x in res['listas_real'] if x['cargo'] == cargo and x['uf'] == uf and x['lista'] == g), None)
        if not lr: continue
        d = leg[(cargo, uf, g)]
        elq = sum(1 for e in real if e['cargo'] == cargo and e['uf'] == uf and e['lista'] == g and e['fase'] == 'QP')
        pt = '; '.join(f'{k} {v:,}'.replace(',', '.') for k, v in sorted(d['por'].items(), key=lambda kv: -kv[1]))
        vals = [CARGO[cargo], uf, ROT[g], lr['voto_nominal'], d['leg'], d['conv'], f'=E{r}+F{r}', f'=D{r}+G{r}', bi['validos'], f'=H{r}/I{r}', bi['QE'], lr['qp'], elq, lr['eleitos'] - elq, f'=M{r}+N{r}', pt]
        for j, v in enumerate(vals, 1): ws1u.cell(r, j, v)
        r += 1
ult_uf = r - 1
fmt(ws1u, 5, ult_uf, 1, 16)
for rr in range(5, ult_uf + 1):
    for c in (4, 5, 6, 7, 8, 9, 11): ws1u.cell(rr, c).number_format = '#,##0'
    ws1u.cell(rr, 10).number_format = '0.0%'
ws1u.freeze_panes = 'D5'; ws1u.auto_filter.ref = f'A4:P{ult_uf}'

# ------------------------------------------------------------------ E1_Eleitos
ws1e = sheet('E1_Eleitos', '2F75B5'); titulo(ws1e, 'Estudo 1 · Eleitos de PT/PCdoB/PV, PSOL/Rede, PSB e PDT em 2026', 'Ordenado por cargo, UF, grupo e votos. Votos de legenda são da lista (federação ou partido) no estado, comuns a todos os eleitos dela.')
H = ['Cargo', 'UF', 'Grupo', 'Partido', 'Candidato', 'Nome civil', 'Votos nominais', 'Como foi eleito', 'Posição na lista', 'Votos de legenda da lista no estado', 'Total da lista no estado']
cab(ws1e, 4, H, [18, 6, 16, 10, 28, 40, 14, 30, 10, 16, 14])
el1 = sorted([e for e in real if e['lista'] in GRUPOS], key=lambda e: (e['cargo'], e['uf'], GRUPOS.index(e['lista']), -e['votos']))
r = 5
for e in el1:
    lr = next(x for x in res['listas_real'] if x['cargo'] == e['cargo'] and x['uf'] == e['uf'] and x['lista'] == e['lista'])
    d = leg[(e['cargo'], e['uf'], e['lista'])]
    vals = [CARGO[e['cargo']], e['uf'], ROT[e['lista']], PNOME.get(e['partido'], e['partido']), e['nome'], e['nome_civil'], e['votos'], FASE[e['fase']], e['pos_lista'], d['leg'] + d['conv'], lr['total']]
    for j, v in enumerate(vals, 1): ws1e.cell(r, j, v)
    r += 1
ult_e1 = r - 1; fmt(ws1e, 5, ult_e1, 1, 11)
for rr in range(5, ult_e1 + 1):
    for c in (7, 10, 11): ws1e.cell(rr, c).number_format = '#,##0'
ws1e.freeze_panes = 'F5'; ws1e.auto_filter.ref = f'A4:K{ult_e1}'

# ------------------------------------------------------------------ E1_Resumo (fórmulas)
ws1 = sheet('E1_Resumo', '2F75B5'); titulo(ws1, f'Estudo 1 · Eleitos em {ano} pelas federações PT/PCdoB/PV e PSOL/Rede e pelos partidos PSB e PDT', 'Fórmulas sobre as abas E1_UF e E1_Eleitos. Votos válidos nacionais por cargo (entrada, fonte TSE): ver células na coluna L.')
H = ['Cargo', 'Grupo', 'Eleitos', 'Por QP', 'Por sobras', 'PT', 'PCdoB', 'PV', 'PSOL', 'Rede', 'Votos nominais (lista)', 'Votos válidos Brasil (entrada)', 'Votos de legenda (lista)', 'Total da lista', '% dos votos válidos', 'Votos nominais dos eleitos', 'Votos nominais por eleito (média)']
cab(ws1, 4, H, [18, 16, 9, 9, 10, 7, 8, 7, 7, 7, 16, 18, 16, 14, 12, 16, 16])
val_br = collections.Counter()
for (cargo, uf), b in vagas.items(): val_br[cargo] += b['validos']
r = 5; rows_cargo = {}
UF_ = f"E1_UF!$A$5:$A${ult_uf}"; EU = lambda col: f"E1_UF!${col}$5:${col}${ult_uf}"; EE = lambda col: f"E1_Eleitos!${col}$5:${col}${ult_e1}"
for cargo in (6, 7, 8):
    ini = r
    for g in GRUPOS:
        n = ROT[g]; cg = CARGO[cargo]
        ws1.cell(r, 1, cg); ws1.cell(r, 2, n)
        ws1.cell(r, 3, f'=SUMIFS({EU("O")},{EU("A")},$A{r},{EU("C")},$B{r})')
        ws1.cell(r, 4, f'=SUMIFS({EU("M")},{EU("A")},$A{r},{EU("C")},$B{r})')
        ws1.cell(r, 5, f'=SUMIFS({EU("N")},{EU("A")},$A{r},{EU("C")},$B{r})')
        for c, p in zip(range(6, 11), ['PT', 'PCdoB', 'PV', 'PSOL', 'Rede']):
            ws1.cell(r, c, f'=COUNTIFS({EE("A")},$A{r},{EE("C")},$B{r},{EE("D")},"{p}")')
        ws1.cell(r, 11, f'=SUMIFS({EU("D")},{EU("A")},$A{r},{EU("C")},$B{r})')
        ws1.cell(r, 12, val_br[cargo])
        ws1.cell(r, 13, f'=SUMIFS({EU("G")},{EU("A")},$A{r},{EU("C")},$B{r})')
        ws1.cell(r, 14, f'=K{r}+M{r}'); ws1.cell(r, 15, f'=N{r}/L{r}')
        ws1.cell(r, 16, f'=SUMIFS({EE("G")},{EE("A")},$A{r},{EE("C")},$B{r})')
        ws1.cell(r, 17, f'=IF(C{r}=0,0,P{r}/C{r})')
        r += 1
    ws1.cell(r, 1, CARGO[cargo]); ws1.cell(r, 2, 'Total dos quatro')
    for c in (3, 4, 5, 6, 7, 8, 9, 10, 11, 13, 14, 16): ws1.cell(r, c, f'=SUM({L(c)}{ini}:{L(c)}{r-1})')
    ws1.cell(r, 12, val_br[cargo]); ws1.cell(r, 15, f'=N{r}/L{r}'); ws1.cell(r, 17, f'=IF(C{r}=0,0,P{r}/C{r})')
    for c in range(1, 18): ws1.cell(r, c).font = f_b; ws1.cell(r, c).fill = fill_tot
    r += 2
fmt(ws1, 5, r - 1, 1, 17)
for rr in range(5, r):
    for c in (11, 12, 13, 14, 16, 17): ws1.cell(rr, c).number_format = '#,##0'
    ws1.cell(rr, 15).number_format = '0.0%'
    if ws1.cell(rr, 2).value == 'Total dos quatro':
        for c in range(1, 18): ws1.cell(rr, c).font = f_b
ws1.freeze_panes = 'C5'
ws1.cell(r, 1, 'Votos válidos Brasil: soma dos votos válidos (nominais + legenda) das UFs em cada cargo, a partir de votacao_partido_munzona_2026 e votacao_candidato_munzona_2026 (TSE). O distrital é só do DF.').font = f_i

# ------------------------------------------------------------------ E2_Eleitos
ws2e = sheet('E2_Eleitos', 'C55A11'); titulo(ws2e, 'Estudo 2 · Eleitos em cada cenário, por estado', 'Resultado real de 2026 e cenários A a D, pela regra do TSE. "Mudança" compara com o resultado real.')
H = ['Hipótese', 'Cenário', 'Cargo', 'UF', 'Candidato', 'Partido', 'Lista', 'Votos nominais', 'Como foi eleito', 'Posição na lista', 'Mudança vs. real']
cab(ws2e, 4, H, [11, 24, 18, 6, 28, 10, 30, 14, 32, 10, 14])
rows = []
for e in real:
    rows.append(['Real', 'Real 2026', CARGO[e['cargo']], e['uf'], e['nome'], PNOME.get(e['partido'], e['partido']), e['lista'], e['votos'], FASE[e['fase']], e['pos_lista'], 'Mantido'])
NOMELISTA = lambda l: {F1: 'PT/PCdoB/PV', F2: 'PSOL/Rede'}.get(l, l)
rows[:] = [[*x[:6], NOMELISTA(x[6]), *x[7:]] for x in rows]
for key, cen in res['cenarios'].items():
    if cen['hip'] != 'S': continue
    for e in cen['eleitos']:
        mud = 'Mantido' if e['sq'] in real_sq[(e['cargo'], e['uf'])] else 'Novo'
        rows.append([HIP[cen['hip']], f"{cen['cen']}) {CEN[cen['cen']]}", CARGO[e['cargo']], e['uf'], e['nome'], PNOME.get(e['partido'], e['partido']), NOMELISTA(e['lista']), e['votos'], FASE[e['fase']], e['pos_lista'], mud])
ordem_h = {'Real': 0, 'Simulação': 1}
rows.sort(key=lambda x: (ordem_h[x[0]], x[1], x[2], x[3], x[6], -x[7]))
for i, x in enumerate(rows, 5):
    for j, v in enumerate(x, 1): ws2e.cell(i, j, v)
ult_e2 = 4 + len(rows)
for rr in range(5, ult_e2 + 1):
    for c in range(1, 12): ws2e.cell(rr, c).font = f_norm
    ws2e.cell(rr, 8).number_format = '#,##0'
ws2e.freeze_panes = 'F5'; ws2e.auto_filter.ref = f'A4:K{ult_e2}'
E2 = lambda col: f"E2_Eleitos!${col}$5:${col}${ult_e2}"

# ------------------------------------------------------------------ E2_Resumo (Brasil) e E2_Var_* (por UF)
cen_keys = ['A', 'B', 'C', 'D', 'E']
def bloco_cabecalho(ws, r, primeira):
    heads = [primeira, 'Partido', 'Real 2026'] + sum([[f'{k}) {CEN[k]}', f'Δ {k}'] for k in cen_keys], [])
    for j, h in enumerate(heads, 1):
        c = ws.cell(r, j, h); c.font = f_h; c.fill = fill_h; c.alignment = Alignment(horizontal='center', vertical='center', wrap_text=True); c.border = box
    ws.row_dimensions[r].height = 44
def linhas_partido(ws, r, cargo_txt, uf, hip):
    """escreve 7 partidos + soma + demais + total; retorna próxima linha"""
    crit_uf = f',{E2("D")},"{uf}"' if uf else ''
    ini = r
    def cnt(cen_txt, hip_txt, party=None):
        s = f'COUNTIFS({E2("A")},"{hip_txt}",{E2("B")},"{cen_txt}",{E2("C")},"{cargo_txt}"{crit_uf}'
        if party: s += f',{E2("F")},"{party}"'
        return s + ')'
    for p in PARTIDOS + ['Soma dos 7', 'Demais partidos', 'Total de cadeiras']:
        ws.cell(r, 1, (uf or 'Brasil') if p == PARTIDOS[0] else None); ws.cell(r, 2, PNOME.get(p, p))
        for ci, (col, cen_txt, hp) in enumerate([(3, 'Real 2026', 'Real')] + [(4 + 2 * i, f'{k}) {CEN[k]}', hip) for i, k in enumerate(cen_keys)]):
            if p in PARTIDOS: f = '=' + cnt(cen_txt, hp, PNOME.get(p, p))
            elif p == 'Soma dos 7': f = f'=SUM({L(col)}{ini}:{L(col)}{ini+6})'
            elif p == 'Total de cadeiras': f = '=' + cnt(cen_txt, hp)
            else: f = f'={L(col)}{r+1}-{L(col)}{r-1}'
            ws.cell(r, col, f)
            if col > 3: ws.cell(r, col + 1, f'={L(col)}{r}-$C{r}')
        if p in ('Soma dos 7', 'Demais partidos', 'Total de cadeiras'):
            for c in range(1, 14): ws.cell(r, c).font = f_b; ws.cell(r, c).fill = fill_tot
        r += 1
    return r
def formata_var(ws, r0, r1):
    for rr in range(r0, r1):
        for c in range(1, 14):
            x = ws.cell(rr, c); x.border = box
            if not x.font.bold: x.font = f_norm
            if c >= 3: x.number_format = '#,##0;[Red]-#,##0;-' if c in (5, 7, 9, 11, 13) else '#,##0'
            if c in (5, 7, 9, 11, 13): x.number_format = '+#,##0;[Red]-#,##0;-'
            if c in (5, 7, 9, 11, 13) and x.value is not None: x.alignment = Alignment(horizontal='right')
        if ws.cell(rr, 2).value in ('Soma dos 7', 'Demais partidos', 'Total de cadeiras'):
            for c in range(1, 14): ws.cell(rr, c).font = f_b
ws2r = sheet('E2_Resumo', 'C55A11'); titulo(ws2r, f'Estudo 2 · Cadeiras por partido, Brasil · cenários de federação ({ano})', 'Cadeiras pela regra do TSE com os votos de 2026 como foram. Δ = cenário menos resultado real. "Demais partidos" = total menos os sete.')
for j, w in enumerate([22, 16, 11, 20, 8, 20, 8, 20, 8, 20, 8, 20, 8], 1): ws2r.column_dimensions[L(j)].width = w
r = 4
for hip in ('Simulação',):
    for cargo in (6, 7, 8):
        ws2r.cell(r, 1, f'{CARGO[cargo]}').font = Font(name=FONT, size=11, bold=True); r += 1
        bloco_cabecalho(ws2r, r, 'Âmbito'); r += 1
        r0 = r; r = linhas_partido(ws2r, r, CARGO[cargo], None, hip); formata_var(ws2r, r0, r); r += 1
ws2r.freeze_panes = 'C4'
for hip, nome in (('Simulação', 'E2_Var_UF'),):
    ws = sheet(nome, 'C55A11'); titulo(ws, 'Estudo 2 · Variação de cadeiras por estado e partido', 'Cada bloco soma o total de cadeiras do estado. Δ = cenário menos resultado real (verde: ganha; vermelho: perde).')
    for j, w in enumerate([8, 16, 11, 20, 8, 20, 8, 20, 8, 20, 8, 20, 8], 1): ws.column_dimensions[L(j)].width = w
    r = 4
    for cargo in (6, 7, 8):
        ws.cell(r, 1, CARGO[cargo]).font = Font(name=FONT, size=11, bold=True); r += 1
        bloco_cabecalho(ws, r, 'UF'); r += 1
        r0 = r
        for uf in [u for (c, u) in ufs_cargo if c == cargo]:
            r = linhas_partido(ws, r, CARGO[cargo], uf, hip)
        formata_var(ws, r0, r); r += 1
    ws.freeze_panes = 'C4'
    from openpyxl.formatting.rule import CellIsRule
    for col in 'EGIKM':
        ws.conditional_formatting.add(f'{col}4:{col}{r}', CellIsRule(operator='greaterThan', formula=['0'], fill=fill_pos))
        ws.conditional_formatting.add(f'{col}4:{col}{r}', CellIsRule(operator='lessThan', formula=['0'], fill=fill_neg))
for col in 'EGIKM':
    ws2r.conditional_formatting.add(f'{col}4:{col}{r+200}', CellIsRule(operator='greaterThan', formula=['0'], fill=fill_pos))
    ws2r.conditional_formatting.add(f'{col}4:{col}{r+200}', CellIsRule(operator='lessThan', formula=['0'], fill=fill_neg))

# ------------------------------------------------------------------ E2_Mudancas
wsm = sheet('E2_Mudancas', 'C55A11'); titulo(wsm, 'Estudo 2 · Quem entra e quem sai em relação ao resultado real de 2026', 'Entra = eleito só no cenário. Sai = eleito em 2026 que perde a vaga no cenário.')
H = ['Hipótese', 'Cenário', 'Cargo', 'UF', 'Situação', 'Candidato', 'Partido', 'Lista real 2026', 'Votos nominais']
cab(wsm, 4, H, [11, 24, 18, 6, 10, 28, 10, 22, 14])
real_por = {(e['cargo'], e['uf'], e['sq']): e for e in real}
cand_nome = {}
mud = []
for key, cen in res['cenarios'].items():
    if cen['hip'] != 'S': continue
    por = collections.defaultdict(set)
    for e in cen['eleitos']: por[(e['cargo'], e['uf'])].add(e['sq'])
    byk = {(e['cargo'], e['uf'], e['sq']): e for e in cen['eleitos']}
    for (cargo, uf), rs in real_sq.items():
        for sq in por[(cargo, uf)] - rs:
            e = byk[(cargo, uf, sq)]; mud.append([HIP[cen['hip']], f"{cen['cen']}) {CEN[cen['cen']]}", CARGO[cargo], uf, 'Entra', e['nome'], PNOME.get(e['partido'], e['partido']), '(fora em 2026)', e['votos']])
        for sq in rs - por[(cargo, uf)]:
            e = real_por[(cargo, uf, sq)]; mud.append([HIP[cen['hip']], f"{cen['cen']}) {CEN[cen['cen']]}", CARGO[cargo], uf, 'Sai', e['nome'], PNOME.get(e['partido'], e['partido']), NOMELISTA(e['lista']), e['votos']])
mud.sort(key=lambda x: (ordem_h[x[0]], x[1], x[2], x[3], x[4] != 'Entra', -x[8]))
for i, x in enumerate(mud, 5):
    for j, v in enumerate(x, 1):
        c = wsm.cell(i, j, v); c.font = f_norm
    wsm.cell(i, 9).number_format = '#,##0'
    wsm.cell(i, 5).fill = fill_pos if x[4] == 'Entra' else fill_neg
wsm.freeze_panes = 'F5'; wsm.auto_filter.ref = f'A4:I{4+len(mud)}'

# ------------------------------------------------------------------ E2_Teto
wst = sheet('E2_Teto', 'C55A11'); titulo(wst, 'Estudo 2 · Aviso: limite de candidatos por lista (Lei 9.504, art. 10: vagas + 1)', 'Informativo, não altera as contas. Soma dos candidatos de 2026 dos partidos que se fundem contra o limite. Onde há excesso, a lista fundida teria de ter menos candidatos do que os partidos tiveram separados.')
H = ['Cargo', 'UF', 'Vagas', 'Limite (vagas + 1)'] + sum([[f'{k}) candidaturas somadas', f'{k}) excesso'] for k in cen_keys], [])
cab(wst, 4, H, [18, 6, 8, 12] + [14, 10] * 5)
IDS = {'A': [F1, 'PSB'], 'B': ['PSB', 'PDT'], 'C': [F1, 'PSB', 'PDT'], 'D': [F1, 'PSB', 'PDT', F2], 'E': [F1, F2]}
r = 5
for (cargo, uf) in ufs_cargo:
    b = vagas[(cargo, uf)]
    vals = [CARGO[cargo], uf, b['vagas'], f'=C{r}+1']
    for i, k in enumerate(cen_keys):
        n = sum(reg.get((uf, cargo, {F1: 'PT/PC do B/PV', F2: 'PSOL/REDE'}.get(l, l)), 0) for l in IDS[k])
        vals += [n, f'=MAX(0,{L(5+2*i)}{r}-$D{r})']
    for j, v in enumerate(vals, 1): wst.cell(r, j, v)
    r += 1
fmt(wst, 5, r - 1, 1, 14)
wst.cell(r, 1, 'UFs que excedem'); 
for i, k in enumerate(cen_keys): wst.cell(r, 6 + 2 * i, f'=COUNTIF({L(6+2*i)}5:{L(6+2*i)}{r-1},">0")')
for c in range(1, 15): wst.cell(r, c).font = f_b; wst.cell(r, c).fill = fill_tot
wst.freeze_panes = 'C5'

order = ['Leia_me', 'E1_Resumo', 'E1_UF', 'E1_Eleitos', 'E2_Resumo', 'E2_Var_UF', 'E2_Eleitos', 'E2_Mudancas', 'E2_Teto']
wb._sheets = [wb[n] for n in order]
wb.save(out); print('salvo', out, 'E1_UF', ult_uf, 'E1_Eleitos', ult_e1, 'E2_Eleitos', ult_e2, 'Mudancas', len(mud))
