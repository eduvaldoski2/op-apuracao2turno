import sys, zipfile, csv, io, collections, glob
z = sys.argv[1]
zf = zipfile.ZipFile(z)
print("ARQUIVOS:")
for i in zf.infolist(): print(f"  {i.filename}  {i.file_size:,} B")
nomes = [i.filename for i in zf.infolist() if i.filename.lower().endswith('.csv')]
brasil = [n for n in nomes if n.upper().endswith('_BRASIL.CSV')]
alvo = brasil[0] if brasil else nomes[0]
print("\nALVO:", alvo)
with zf.open(alvo) as f:
    r = csv.reader(io.TextIOWrapper(f, encoding='latin-1', newline=''), delimiter=';')
    h = next(r)
    print("COLUNAS (%d):" % len(h)); print("  " + " | ".join(h))
    ix = {c: i for i, c in enumerate(h)}
    n = 0; amostra = []
    cont = collections.defaultdict(collections.Counter)
    pessoas = set(); turnos = collections.Counter()
    for row in r:
        n += 1
        if n <= 3: amostra.append(row)
        for c in ('DS_CARGO','DS_SITUACAO_CANDIDATURA','DS_SIT_TOT_TURNO','DS_GENERO','DS_COR_RACA','DS_GRAU_INSTRUCAO','TP_AGREMIACAO','NR_TURNO','DS_ELEICAO','ST_REELEICAO'):
            if c in ix: cont[c][row[ix[c]]] += 1
        if 'SG_UF' in ix: cont['UF'][row[ix['SG_UF']]] += 1
    print("\nLINHAS:", n)
    for c, k in cont.items():
        print(f"\n[{c}]")
        for v, q in k.most_common(40): print(f"  {q:>8,}  {v}")
    print("\nAMOSTRA (3 linhas, CPF/e-mail/título omitidos):")
    omit = {'NR_CPF_CANDIDATO','NM_EMAIL','NR_TITULO_ELEITORAL_CANDIDATO','NR_CPF_VICE_CANDIDATO'}
    for row in amostra:
        print("  " + " | ".join(f"{c}={row[i]}" for i, c in enumerate(h) if c not in omit))
    for c in ('NR_CPF_CANDIDATO','NM_EMAIL','NR_TITULO_ELEITORAL_CANDIDATO'):
        if c in ix:
            print(f"{c}: exemplo de valores ->", [x[ix[c]][:3]+'…' if x[ix[c]] else '' for x in amostra])
