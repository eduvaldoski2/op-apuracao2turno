"""Distribuição de cadeiras proporcionais (Código Eleitoral arts. 106-112, Lei 14.211/2021, com a decisão do STF
nas ADIs 7228/7263/7325 sobre as sobras). Entrada: listas (partido isolado ou federação) com candidatos e votos de legenda."""
import math

def arred_qe(x):                      # art. 106: despreza fração <= 0,5; >0,5 equivale a 1
    f = math.floor(x); return f if x - f <= 0.5 else f + 1

def distribui(listas, vagas, variante=None):
    """listas: {lid: {'cands': [(votos, chave)], 'leg': int}}. Retorna (eleitos, info).
    eleitos: lista de (lid, chave, votos, fase) com fase 'QP' | 'MÉDIA' | 'MÉDIA (sem barreira)' | 'MAIS VOTADOS'."""
    v = variante or {}
    tot = {l: d['leg'] + sum(c[0] for c in d['cands']) for l, d in listas.items()}
    validos = sum(tot.values())
    QE = arred_qe(validos / vagas)
    ordem = {l: sorted(d['cands'], key=lambda c: (-c[0], str(c[1]))) for l, d in listas.items()}
    prox = {l: 0 for l in listas}      # índice do próximo candidato não eleito
    eleitos = []; n = {l: 0 for l in listas}
    qp = {l: int(tot[l] // QE) for l in listas}
    info = {'QE': QE, 'validos': validos, 'qp': qp, 'tot': tot}
    def elege(l, fase):
        c = ordem[l][prox[l]]; prox[l] += 1; n[l] += 1
        eleitos.append((l, c[1], c[0], fase))
    if all(q == 0 for q in qp.values()):             # art. 111: ninguém atingiu o QE
        todos = sorted(((c[0], str(c[1]), l) for l in listas for c in ordem[l]), reverse=True)[:vagas]
        for votos, k, l in todos:
            c = next(c for c in ordem[l] if str(c[1]) == k); eleitos.append((l, c[1], c[0], 'MAIS VOTADOS'))
        return eleitos, info
    # 1ª fase: quociente partidário, só candidatos com >= 10% do QE
    piso1 = 0.10 * QE
    for l in listas:
        for _ in range(qp[l]):
            if prox[l] < len(ordem[l]) and ordem[l][prox[l]][0] >= piso1: elege(l, 'QP')
            else: break
    # 2ª fase: sobras. Partido/federação >= 80% do QE e candidato >= 20% do QE, por maior média
    barr_p, barr_c = 0.80 * QE, 0.20 * QE
    def media(l): return tot[l] / (n[l] + 1)
    while len(eleitos) < vagas:
        el = [l for l in listas if tot[l] >= barr_p and prox[l] < len(ordem[l]) and ordem[l][prox[l]][0] >= barr_c]
        if not el: break
        l = max(el, key=lambda x: (media(x), tot[x])); elege(l, 'MÉDIA')
    # 3ª fase (após o STF): só a maior média, sem barreira de 80%/20%
    while len(eleitos) < vagas:
        el = [l for l in listas if prox[l] < len(ordem[l])]
        if not el: break
        l = max(el, key=lambda x: (media(x), tot[x])); elege(l, 'MÉDIA (sem barreira)')
    return eleitos, info
