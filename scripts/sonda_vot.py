import sys, zipfile, csv, io, collections
for z in sys.argv[1:]:
    zf = zipfile.ZipFile(z); print("\n" + "="*70 + "\nZIP:", z)
    nomes = [i for i in zf.infolist() if i.filename.lower().endswith('.csv')]
    print("  %d csv; maiores:" % len(nomes), [(i.filename, i.file_size) for i in sorted(nomes, key=lambda i: -i.file_size)[:3]])
    alvo = next((i.filename for i in nomes if i.filename.upper().endswith('_BRASIL.CSV')), None) or next(i.filename for i in nomes if i.filename.upper().endswith('_RO.CSV'))
    print("ALVO:", alvo)
    with zf.open(alvo) as f:
        r = csv.reader(io.TextIOWrapper(f, encoding='latin-1', newline=''), delimiter=';')
        h = next(r); print("COLUNAS (%d): %s" % (len(h), " | ".join(h)))
        cont = [collections.Counter() for _ in h]; n = 0; am = []
        for row in r:
            n += 1
            if n <= 2: am.append(row)
            for i, x in enumerate(row[:len(h)]):
                if len(cont[i]) <= 30: cont[i][x] += 1
        print("LINHAS:", n)
        for i, c in enumerate(h):
            if len(cont[i]) <= 12 and c not in ('DT_GERACAO','HH_GERACAO'): print(f"[{c}] " + "; ".join(f"{v}={q}" for v, q in cont[i].most_common(12)))
        for row in am: print("AMOSTRA: " + " | ".join(f"{c}={row[i]}" for i, c in enumerate(h)))
