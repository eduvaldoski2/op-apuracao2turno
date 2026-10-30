"""Testes com dados explicitamente sintéticos; não são resultados eleitorais."""

import csv
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import duckdb

import build_2024 as b
import run_2024 as run


def fixture():
    c = duckdb.connect()
    def put(kind, rows):
        columns = b.FIELDS[kind]
        c.execute(f"CREATE TABLE raw_{kind} (" + ",".join(f'"{k}" VARCHAR' for k in columns) + ")")
        for row in rows:
            c.execute(f"INSERT INTO raw_{kind} VALUES (" + ",".join("?" for _ in columns) + ")", [str(row[k]) for k in columns])
    def key(cargo):
        return dict(NR_TURNO=1,SG_UF="AC",CD_MUNICIPIO=100,NR_ZONA=1,CD_CARGO=cargo)
    candidates = [dict(NR_TURNO=1,SG_UF="AC",SG_UE="00100",CD_CARGO=g,SQ_CANDIDATO=s,NR_CANDIDATO=n,
        NM_CANDIDATO="FICTICIO",NM_URNA_CANDIDATO="FICTICIO",SG_PARTIDO=p,DS_SIT_TOT_TURNO="TESTE",ANO_NASCIMENTO=1982)
        for g,s,n,p in [(11,1001,11,"AA"),(13,1002,13001,"BB")]]
    put("candidato",candidates)
    put("nominal",[dict(key(g),SQ_CANDIDATO=s,NR_CANDIDATO=n,QT_VOTOS_NOMINAIS=v)
        for g,s,n,v in [(11,1001,11,10),(13,1002,13001,20)]])
    put("partido",[dict(key(g),NR_PARTIDO=n,SG_PARTIDO=p,QT_VOTOS_LEGENDA_VALIDOS=v,
        QT_VOTOS_LEGENDA_ANULADOS=0,QT_VOTOS_LEGENDA_ANUL_SUBJUD=0)
        for g,n,p,v in [(11,11,"AA",0),(13,13,"BB",3)]])
    put("secao",[dict(key(g),NR_SECAO=1,NR_LOCAL_VOTACAO=10,NR_VOTAVEL=n,NM_VOTAVEL="TESTE",QT_VOTOS=v,SQ_CANDIDATO=s)
        for g,n,v,s in [(11,11,10,1001),(11,95,1,-1),(11,96,2,-1),(13,13001,20,1002),(13,95,2,-1),(13,96,1,-1),(13,13,3,-1)]])
    put("detalhe_secao",[dict(key(g),NR_SECAO=1,ST_SECAO_INSTALADA="S",ST_SECAO_ANULADA="N") for g in [11,13]])
    put("detalhe_zona",[dict(key(g),QT_VOTOS=v,QT_SECOES_PRINCIPAIS=1,QT_SECOES_AGREGADAS=0,QT_SECOES_NAO_INSTALADAS=0,QT_TOTAL_SECOES=1) for g,v in [(11,13),(13,26)]])
    put("local",[dict(NR_TURNO=1,SG_UF="AC",CD_MUNICIPIO=100,NR_ZONA=1,NR_SECAO=1,NR_LOCAL_VOTACAO=10,
        NM_LOCAL_VOTACAO="ESCOLA FICTICIA",DS_ENDERECO="ENDERECO FICTICIO",NM_BAIRRO="",NR_LATITUDE="-9,0",NR_LONGITUDE="-68,0",QT_ELEITOR_SECAO=100)])
    b.create_tables(c)
    return c


class BuildTests(unittest.TestCase):
    def test_ingestion_discards_private_fields_before_database(self):
        fields = [k for k in b.FIELDS['candidato'] if k != 'ANO_NASCIMENTO'] + [
            'DT_NASCIMENTO','NR_CPF_CANDIDATO','DS_EMAIL','NM_SOCIAL_CANDIDATO',
            'ANO_ELEICAO','NM_TIPO_ELEICAO','CD_ELEICAO','DT_GERACAO','HH_GERACAO']
        row = dict.fromkeys(fields,'TESTE')
        row.update(SG_UF='AC',NR_TURNO='1',CD_CARGO='11',DT_NASCIMENTO='01/01/1900',
            NR_CPF_CANDIDATO='SEGREDO',DS_EMAIL='SEGREDO',NM_SOCIAL_CANDIDATO='SEGREDO',
            ANO_ELEICAO='2024',NM_TIPO_ELEICAO='Eleição Ordinária',CD_ELEICAO='619',
            DT_GERACAO='28/10/2026',HH_GERACAO='12:00:00')
        text=io.StringIO();writer=csv.DictWriter(text,fieldnames=fields,delimiter=';');writer.writeheader()
        writer.writerow(row);writer.writerow(dict(row,NM_TIPO_ELEICAO='Eleição Suplementar',CD_ELEICAO='9999'))
        with tempfile.TemporaryDirectory() as work:
            root=Path(work);(root/'docs').mkdir()
            url='https://cdn.tse.jus.br/estatistica/sead/odsele/consulta_cand/consulta_cand_2024.zip'
            (root/'docs/inventario-municipal-fontes.json').write_text(json.dumps({'conjuntos':[{'ano':2024,'recursos':[{'familia':'consulta_cand','url':url}]}]}))
            def fake_download(url,path):
                with zipfile.ZipFile(path,'w') as z:z.writestr('consulta_cand_2024_AC.csv',text.getvalue().encode('iso-8859-1'))
                return {'zip_bytes':path.stat().st_size,'zip_sha256':'FICTICIO'}
            c=duckdb.connect();m={'fontes':[]}
            with patch.object(b,'ROOT',root),patch.object(b,'download',fake_download):
                b.ingest(c,'candidato','AC',root,m)
            columns=[d[0] for d in c.execute('DESCRIBE raw_candidato').fetchall()]
            self.assertNotIn('DT_NASCIMENTO',columns);self.assertNotIn('NR_CPF_CANDIDATO',columns)
            self.assertEqual(c.execute('SELECT ANO_NASCIMENTO FROM raw_candidato').fetchall(),[('1900',)])
            self.assertNotIn('SEGREDO',json.dumps(c.execute('SELECT * FROM raw_candidato').fetchall()))
            self.assertEqual(m['fontes'][0]['linhas_outras_eleicoes_na_uf'],1)
            self.assertFalse((root/'fonte.zip').exists());self.assertFalse((root/'candidato.csv').exists())
            c.close()

    def test_missing_batch_prevents_publication(self):
        with tempfile.TemporaryDirectory() as work:
            root=Path(work);(root/'docs').mkdir()
            with patch.object(run,'ROOT',root):
                result=run.summarize(['AC'])
                self.assertEqual(result['status'],'nao_validado')
                with patch.dict('os.environ',{'GITHUB_ACTIONS':'true'}),patch.object(run.subprocess,'run') as command:
                    with self.assertRaises(ValueError):run.publish()
                    command.assert_not_called()

    def test_privacy_and_election_filter(self):
        row = {field: "TESTE" for field in b.FIELDS["candidato"] if field != "ANO_NASCIMENTO"}
        row.update(DT_NASCIMENTO="01/01/1900",NR_CPF_CANDIDATO="SEGREDO",DS_EMAIL="SEGREDO",NM_SOCIAL_CANDIDATO="SEGREDO")
        result = b.sanitize(row,"candidato")
        self.assertEqual(result["ANO_NASCIMENTO"],"1900")
        self.assertNotIn("SEGREDO",json.dumps(result))
        self.assertNotIn("DT_NASCIMENTO",result)
        self.assertTrue(b.regular({"ANO_ELEICAO":"2024","NM_TIPO_ELEICAO":"Eleição Ordinária"},"secao"))
        self.assertFalse(b.regular({"ANO_ELEICAO":"2024","NM_TIPO_ELEICAO":"Suplementar"},"secao"))
        self.assertFalse(b.regular({"ANO_ELEICAO":"2024","NM_TIPO_ELEICAO":"Eleição Extraordinária"},"secao"))
        self.assertFalse(b.regular({"DT_ELEICAO":"01/06/2025"},"local"))

    def test_reconciliation_and_all_four_schemas(self):
        with tempfile.TemporaryDirectory() as work:
            c=fixture();m={"uf":"AC","conferencias":[],"arquivos":[]}
            b.reconciliation(c,m,Path(work))
            self.assertTrue(all(x["status"]=="aprovada" for x in m["conferencias"]),m)
            self.assertEqual(m["municipios_sem_bairro"],[100])
            self.assertEqual(c.execute("SELECT secoes FROM local_votacao_turno").fetchone()[0],[1])
            self.assertEqual(c.execute("SELECT sum(qt_votos) FROM secao").fetchone()[0],39)
            b.export(c,m,"AC",Path(work))
            self.assertEqual({x["tabela"] for x in m["arquivos"]},set(b.SCHEMAS))
            self.assertTrue(all(x["sha256"] and x["turno"]==1 for x in m["arquivos"]))
            c.close()

    def test_differences_are_listed(self):
        with tempfile.TemporaryDirectory() as work:
            c=fixture();c.execute("UPDATE nominal SET qt_votos=qt_votos+1 WHERE cargo=11")
            m={"uf":"AC","conferencias":[]};b.reconciliation(c,m,Path(work))
            result=next(x for x in m["conferencias"] if x["nome"]=="candidato_municipio")
            self.assertEqual(result["divergencias"],1)
            self.assertIn("-1",(Path(work)/result["arquivo"]).read_text())
            c.close()


if __name__ == "__main__":
    unittest.main()
