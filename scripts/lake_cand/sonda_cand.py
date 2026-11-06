# Sonda: baixa consulta_cand_<ano>.zip do TSE e mostra membros, cabeçalhos e preenchimento de colunas-chave (sem imprimir dados pessoais).
import sys, zipfile, io, urllib.request, csv, collections
B = 'https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand'
for ano in sys.argv[1:]:
    try:
        d = urllib.request.urlopen(f'{B}/consulta_cand_{ano}.zip', timeout=300).read()
    except Exception as e:
        print(ano, 'ERRO', e); continue
    z = zipfile.ZipFile(io.BytesIO(d)); nomes = z.namelist()
    print(f'== {ano}: {len(d)/1e6:.1f} MB, {len(nomes)} membros: {nomes[:6]}{"..." if len(nomes)>6 else ""}')
    csvs = [n for n in nomes if n.lower().endswith(('.csv', '.txt')) and 'leia' not in n.lower()]
    alvo = next((n for n in csvs if 'BRASIL' in n.upper()), csvs[0]); print('arquivo-amostra:', alvo)
    raw = z.open(alvo).read(); txt = raw.decode('latin-1')
    rd = csv.reader(io.StringIO(txt), delimiter=';'); cab = next(rd); print('colunas:', cab)
    linhas = list(rd); print('linhas:', len(linhas))
    cont = collections.Counter()
    for l in linhas:
        for c, v in zip(cab, l):
            if v.strip() not in ('', '#NULO#', '#NE#', '-1', '-3', '#NULO', '0'): cont[c] += 1
    chaves = [c for c in cab if any(k in c.upper() for k in ('CPF', 'TITULO', 'NASC', 'SQ_', 'SEQUENCIAL', 'NOME', 'NM_CANDIDATO'))]
    print('preenchimento:', {c: f'{cont[c]}/{len(linhas)}' for c in chaves})
    if linhas:
        i = {c: k for k, c in enumerate(cab)}
        for c in cab:
            if 'NASC' in c.upper() and linhas: print('formato', c, '->', len(linhas[0][i[c]]), 'chars (ex. mascarado):', ''.join('9' if ch.isdigit() else ch for ch in linhas[0][i[c]]))
