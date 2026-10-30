"""Renderiza o inventário de 2024 a partir de metadados reais do Actions."""

import json
from pathlib import Path

from inspect_2024 import ROOT


def render():
    catalog = json.loads((ROOT / 'docs/inventario-municipal-fontes.json').read_text())
    resources = [r for p in catalog['conjuntos'] if p['ano'] == 2024 for r in p['recursos']]
    batches = [json.loads(p.read_text()) for p in sorted((ROOT/'docs/inventario-2024').glob('*.json'))]
    observed = {r['id']: r for batch in batches for r in batch['recursos']}
    complete = len(observed) == len(resources) and all(r['status'] != 'falha' for r in observed.values())
    run = 'https://github.com/eduvaldoski2/op-apuracao2turno/actions/runs/40721672249'
    lines = ['# Inventário municipal — teste de 2024', '',
        '**Escopo ativo: somente 2024. Os demais anos estão adiados.** GitHub Releases foi aprovado pelo usuário para este teste em 28/10/2026.', '',
        f'Inventário de conteúdo: **{"concluído para os CSVs; PDFs classificados sem leitura interna" if complete else "em andamento"}**. '
        f'{len(observed)} de {len(resources)} ZIPs têm resultados importados da [execução no GitHub Actions]({run}). '
        'Nenhum ZIP do TSE foi baixado na máquina local; aqui foram importados apenas os metadados gerados pelos runners.', '',
        '## Disponibilidade por ano', '',
        '| Ano | Arquivos catalogados | Níveis | Cargos observados | Turnos | Tamanho inicial dos ZIPs por HEAD |',
        '| --- | ---: | --- | --- | --- | ---: |',
        f"| 2024 | {len(resources)} | seção; município/zona; candidatura; cadastro seção/local | 11 e 13 nos votos; 12 também no cadastro (será excluído) | 1 e 2 | {sum(r['zip_bytes'] for r in resources):,} bytes |", '',
        'Fontes: [Resultados 2024](https://dadosabertos.tse.jus.br/dataset/resultados-2024), '
        '[Candidatos 2024](https://dadosabertos.tse.jus.br/dataset/candidatos-2024) e '
        '[Eleitorado 2024](https://dadosabertos.tse.jus.br/dataset/eleitorado-2024). '
        'As URLs e datas de consulta do catálogo/HEAD estão em [inventario-municipal-fontes.json](inventario-municipal-fontes.json). '
        'Os metadados completos dos CSVs internos estão em [inventario-2024/](inventario-2024/).', '',
        '## Arquivos, tamanhos, geração e linhas', '',
        'Bytes abaixo são os tamanhos efetivamente baixados no Actions quando disponíveis; o catálogo inicial é preservado separadamente. '
        'Linhas são contagens exatas de registros, sem cabeçalho nem linhas vazias, do CSV indicado. Nas bases com BRASIL e cópias por UF, '
        'a tabela usa somente BRASIL; não soma réplicas. As linhas são do arquivo original: ainda incluem suplementares e, no cadastro, vice-prefeitos. '
        'Não representam o tamanho do lake filtrado. Geração vem de DT_GERACAO/HH_GERACAO, nunca de Last-Modified.', '',
        '| Arquivo oficial | ZIP (bytes) | Conteúdo de referência / linhas | Geração interna observada | Estrutura |',
        '| --- | ---: | --- | --- | --- |']
    schemas = {}
    for resource in resources:
        result = observed.get(resource['id'])
        name = resource['url'].rsplit('/',1)[-1]
        if result is None:
            lines.append(f"| [{name}]({resource['url']}) | {resource['zip_bytes']:,} (HEAD) | pendente | pendente | pendente |")
            continue
        size = f"{result['zip_bytes']:,}" if 'zip_bytes' in result else 'não baixado'
        if result['status'] == 'sem_csv':
            extensions = result.get('outros_membros_por_extensao',{})
            content = '; '.join(f'{count} {extension}' for extension,count in extensions.items())
            lines.append(f"| [{name}]({resource['url']}) | {size} | {content}; linhas CSV não se aplicam | geração interna dos PDFs não lida | sem CSV |")
        elif result['status'] == 'falha':
            lines.append(f"| [{name}]({resource['url']}) | {size} | falha: {result.get('erro_classe')} | não confirmada | não confirmada |")
        else:
            members = result['arquivos']
            member = next((m for m in members if m['arquivo'].upper().endswith('_BRASIL.CSV')), members[0])
            dates = '; '.join(f"{g['DT_GERACAO']} {g['HH_GERACAO'] or g['HORA_GERACAO'] or ''}".strip() for g in member['geracoes'])
            family = resource['familia']
            for m in members:
                columns = tuple(m['colunas'])
                if columns not in schemas.setdefault(family,[]):
                    schemas[family].append(columns)
            lines.append(f"| [{name}]({resource['url']}) | {size} | {member['arquivo']}: **{member['linhas']:,}** | {dates} | {family} |")
    lines += ['', '## Colunas observadas', '',
        'Nomes de campos pessoais abaixo são apenas o cabeçalho oficial. Seus valores não foram incluídos no inventário e não serão persistidos nas saídas. '
        'O processamento seleciona explicitamente os campos autorizados e deriva apenas o ano de nascimento em memória.']
    for family, versions in schemas.items():
        lines += ['', f'### {family}', '']
        for i,columns in enumerate(versions):
            lines += [f'Estrutura {i+1}, {len(columns)} colunas:', '', '`' + ', '.join(columns) + '`', '']
    lines += ['', '## O que existe, o que não foi encontrado e limitações', '',
        '- Os 26 ZIPs de votação por seção estão catalogados, um por UF com eleição municipal. Não criar dados municipais para DF ou exterior. A cobertura de todos os municípios/seções precisa ser conferida no processamento.',
        '- O cadastro de locais contém NR_SECAO, NR_LOCAL_VOTACAO, endereço, NM_BAIRRO e coordenadas. A presença das colunas não significa preenchimento completo. Municípios sem bairro ainda precisam ser listados após processar os valores; não se inventará bairro nem se fará geocodificação.',
        '- Não foi localizado, nesses recursos, um arquivo independente de votos por bairro ou por local. Esses níveis dependem de agregar as seções com correspondência no cadastro histórico do TSE.',
        '- Os ZIPs de relatórios de totalização inspecionados contêm PDFs, embora o catálogo os rotule como CSV. Contagem de registros e cabeçalho CSV não se aplicam. Datas internas e conteúdo dos PDFs ainda não foram lidos; o manifesto não apresenta Last-Modified como geração desses relatórios.',
        '- As bases nacionais de ano 2024 incluem numerosos códigos de eleições suplementares posteriores. O teste se limita à eleição ordinária: não se deve filtrar apenas ANO_ELEICAO. Os códigos e turnos encontrados constam nos metadados completos.',
        '- As fontes têm gerações diferentes. Por exemplo, o CSV de seção do Acre foi gerado em 28/10/2024, enquanto a votação nominal nacional por município/zona foi gerada em 28/10/2026. Mudanças judiciais e de totalização podem aparecer como divergências; não serão ajustadas em silêncio.',
        '- Ainda não foi executada conferência de votos reais nem publicada release de Parquet deste trabalho. A inspeção de arquivos não é validação eleitoral. Os resultados futuros ficarão em [conferencia-2024.md](conferencia-2024.md).', '',
        '## Contrato e processamento preparado', '',
        'Os nomes e a ordem das colunas dos quatro esquemas solicitados estão em SCHEMAS, em `scripts/lake/build_2024.py`, e são verificados depois de escrever cada Parquet. '
        'Brancos 95, nulos 96 e legendas são linhas próprias; candidatos sem votos vêm do cadastro. '
        'Como zona e local_votacao não têm turno no esquema, o turno fica no caminho, nome e manifesto. O cadastro de locais é comum aos cargos, sem uma partição de cargo artificial.', '',
        'O workflow `lake-2024.yml` é exclusivamente manual, com piloto padrão AC e opção TODAS ou lista de UFs. Há até três runners em paralelo. '
        'Downloads rodam no Actions, um ZIP de cada vez; intermediários já minimizados; Parquet zstd particionado por ano/UF/cargo e turno. '
        'As conferências com junção externa comparam candidato/município, candidato/zona, seções por município e totais por cargo/turno. '
        'Ambiguidades, votos sem cadastro, seções sem local, votos negativos e códigos desconhecidos também bloqueiam publicação. Todas as diferenças são listadas em CSV.', '',
        '## Armazenamento aprovado', '',
        'GitHub Releases, em pré-releases de teste identificadas pelo run_id e pelas UFs. Assets recebem nomes únicos, SHA-256, linhas, bytes e mapeamento para a partição original. '
        'Não há ZIP bruto nem arquivos de dados acima de 90 MB no git. Relatório e manifesto pequeno vão para o branch da execução. '
        'Uma release só sai de rascunho após todas as UFs solicitadas passarem e todos os assets serem enviados. '
        'O código limita cada asset a menos de 2 GiB e a release a 1.000 assets, conforme [limites oficiais](https://docs.github.com/en/repositories/releasing-projects-on-github/about-releases).', '',
        '## Próximo passo', '',
        'O [PR #1](https://github.com/eduvaldoski2/op-apuracao2turno/pull/1) contém o teste. O workflow manual novo precisa estar no branch padrão para seu primeiro despacho, '
        'conforme [documentação do GitHub](https://docs.github.com/en/actions/how-tos/manage-workflow-runs/manually-run-a-workflow). '
        'O PR não foi mesclado automaticamente. A primeira execução de conversão deverá usar AC; só após avaliar o piloto deve-se solicitar TODAS.', '',
        'Os testes locais usam dados declaradamente sintéticos: não são conferências eleitorais nem resultados de votos do TSE. '
        'Instruções e limitações completas em `scripts/lake/README.md`.']
    (ROOT/'docs/inventario-municipal.md').write_text('\n'.join(lines)+'\n')
    print(f'Inventário renderizado: {len(observed)}/{len(resources)} recursos; completo={complete}')


if __name__ == '__main__':
    render()
