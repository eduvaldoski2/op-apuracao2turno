#!/usr/bin/env python3
"""Regiões de cada estado (agrupamentos de municípios) para o painel: data/regioes/uf-<uf>.json.

Prioridade: divisão oficial do governo do estado (scripts/regioes/estaduais/<uf>.json, levantada em fontes públicas,
com a fonte registrada); na falta dela, as Regiões Geográficas Intermediárias do IBGE (DTB 2024).
O RJ já tem arquivo próprio (Regiões de Governo do CEPERJ) e não é sobrescrito. O DF (município único) não tem regiões.

Formato: {titulo, divisao, fonte, url, regioes: {nome: [nomes dos municípios como no TSE]}}
Uso: python3 scripts/regioes/build_regioes_uf.py
"""
import csv, json, os, re, unicodedata, glob

R = os.path.dirname(os.path.abspath(__file__)); ROOT = os.path.dirname(os.path.dirname(R))
norm = lambda s: re.sub(r'[^a-z0-9]', '', unicodedata.normalize('NFD', str(s)).encode('ascii', 'ignore').decode().lower())
NOME_UF = {'ac': 'Acre', 'al': 'Alagoas', 'am': 'Amazonas', 'ap': 'Amapá', 'ba': 'Bahia', 'ce': 'Ceará', 'es': 'Espírito Santo', 'go': 'Goiás', 'ma': 'Maranhão', 'mg': 'Minas Gerais', 'ms': 'Mato Grosso do Sul', 'mt': 'Mato Grosso', 'pa': 'Pará', 'pb': 'Paraíba', 'pe': 'Pernambuco', 'pi': 'Piauí', 'pr': 'Paraná', 'rj': 'Rio de Janeiro', 'rn': 'Rio Grande do Norte', 'ro': 'Rondônia', 'rr': 'Roraima', 'rs': 'Rio Grande do Sul', 'sc': 'Santa Catarina', 'se': 'Sergipe', 'sp': 'São Paulo', 'to': 'Tocantins'}
COD_UF = {'11': 'ro', '12': 'ac', '13': 'am', '14': 'rr', '15': 'pa', '16': 'ap', '17': 'to', '21': 'ma', '22': 'pi', '23': 'ce', '24': 'rn', '25': 'pb', '26': 'pe', '27': 'al', '28': 'se', '29': 'ba', '31': 'mg', '32': 'es', '33': 'rj', '35': 'sp', '41': 'pr', '42': 'sc', '43': 'rs', '50': 'ms', '51': 'mt', '52': 'go', '53': 'df'}

base = json.load(open(os.path.join(ROOT, 'data/base_1t.json')))['rows']
tse_por_ibge = {r[3]: r[2] for r in base}                      # código IBGE -> nome no TSE
ibge = list(csv.DictReader(open(os.path.join(R, 'ibge_dtb2024_regioes.csv'), encoding='utf-8')))
ibge_por_uf = {}
for m in ibge: ibge_por_uf.setdefault(COD_UF[m['ibge'][:2]], []).append(m)

def grava(uf, obj):
    p = os.path.join(ROOT, 'data/regioes', f'uf-{uf}.json')
    json.dump(obj, open(p, 'w', encoding='utf-8'), ensure_ascii=False, separators=(',', ':'))

rel = []
for uf, ms in sorted(ibge_por_uf.items()):
    if uf in ('df', 'rj'): continue
    est = os.path.join(R, 'estaduais', f'{uf}.json')
    if os.path.exists(est):
        e = json.load(open(est, encoding='utf-8'))
        por_nome = {norm(m['nome']): m['ibge'] for m in ms}
        for a, b in e.get('apelidos', {}).items(): por_nome[norm(a)] = por_nome.get(norm(b))
        regs, faltam, usados = {}, [], set()
        for nome, lista in e['regioes'].items():
            regs[nome] = []
            for n in lista:
                cod = por_nome.get(norm(n))
                if not cod: faltam.append(n); continue
                if cod in usados: continue
                usados.add(cod); regs[nome].append(tse_por_ibge.get(cod, n.upper()))
        sobram = [m['nome'] for m in ms if m['ibge'] not in usados]
        if faltam or sobram: print(uf, 'ATENÇÃO', 'não achados:', faltam[:10], 'sem região:', sobram[:10])
        if len(sobram) <= max(2, len(ms) * 0.02) and not faltam:
            grava(uf, {'titulo': f'Regiões do estado de {NOME_UF[uf]}', 'divisao': e['divisao'], 'fonte': e['fonte'], 'url': e.get('url', ''), 'regioes': regs})
            rel.append((uf, e['divisao'], len(regs))); continue
        print(uf, 'divisão estadual incompleta: usa a do IBGE')
    # regiões intermediárias; nos estados em que elas são poucas (menos de 5), as imediatas, mais úteis para análise
    nivel = 'rgint' if len({m['rgint'] for m in ms}) >= 5 else 'rgi'
    rot = 'intermediárias' if nivel == 'rgint' else 'imediatas'
    regs = {}
    for m in ms: regs.setdefault(m[nivel], []).append(tse_por_ibge.get(m['ibge'], m['nome'].upper()))
    grava(uf, {'titulo': f'Regiões do estado de {NOME_UF[uf]}', 'divisao': f'Regiões geográficas {rot} (IBGE)', 'fonte': f'IBGE, Divisão Territorial Brasileira 2024 (regiões geográficas {rot})', 'url': 'https://www.ibge.gov.br/geociencias/organizacao-do-territorio/divisao-regional/15778-divisoes-regionais-do-brasil.html', 'regioes': regs})
    rel.append((uf, 'IBGE ' + rot, len(regs)))
for x in rel: print(*x)
