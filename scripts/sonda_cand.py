import sys, zipfile, csv, io, collections
PII = ('CPF','EMAIL','TITULO')
for z in sys.argv[1:]:
    zf = zipfile.ZipFile(z)
    print("\n" + "="*70 + "\nZIP:", z)
    for i in zf.infolist(): print(f"  {i.filename}  {i.file_size:,} B")
    nomes = [i.filename for i in zf.infolist() if i.filename.lower().endswith('.csv')]
    brasil = [n for n in nomes if n.upper().endswith('_BRASIL.CSV')]
    alvo = brasil[0] if brasil else nomes[0]
    print("ALVO:", alvo)
    with zf.open(alvo) as f:
        r = csv.reader(io.TextIOWrapper(f, encoding='latin-1', newline=''), delimiter=';')
        h = next(r); print("COLUNAS (%d): %s" % (len(h), " | ".join(h)))
        cont = [collections.Counter() for _ in h]; amostra = []; n = 0
        for row in r:
            n += 1
            if n <= 2: amostra.append(row)
            for i, v in enumerate(row[:len(h)]):
                if len(cont[i]) <= 40: cont[i][v] += 1
        print("LINHAS:", n)
        for i, c in enumerate(h):
            if any(p in c for p in PII): continue
            if len(cont[i]) <= 30 and c not in ('DT_GERACAO','HH_GERACAO'):
                print(f"[{c}] " + "; ".join(f"{v}={q}" for v, q in cont[i].most_common(30)))
        for row in amostra:
            print("AMOSTRA: " + " | ".join(f"{c}={row[i]}" for i, c in enumerate(h) if not any(p in c for p in PII)))
