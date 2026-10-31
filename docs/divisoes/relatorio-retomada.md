# Divisões administrativas — primeira entrega parcial

Consulta: 29/10/2026 (Brasília). Branch divisoes; somente docs/divisoes. Não há conclusão nacional nem integração automática ao painel.

## Escopo conferido e pendências

- UFs: AC e RJ, 2 de 27 linhas conferidas quanto ao tipo, número e nomes das regiões; 25 restantes ainda não revalidadas. Confianças anteriores das demais linhas foram preservadas, não certificadas por esta pesquisa.
- Municípios: Recife e Fortaleza, 2 dos 100 a pesquisar excluído o Rio; 98 restantes ainda não revalidados. Rio de Janeiro preservado integralmente, inclusive rio_regioes.json.
- uf_municipios_regioes.csv: somente 21 municípios do Acre com classificação coincidente na lei e na tabela oficial. Capixaba omitido por conflito, não por ausência de região. As demais UFs ainda não têm vínculo neste arquivo.
- bairros_regioes_PE_25313.csv: 94 bairros municipais, um vínculo por bairro, seis RPAs (11/18/29/12/16/8). Não foi cruzado com bairros do TSE: não existem ainda local_secao canônico e lista TSE sanitizada disponíveis nesta execução. Não declarar zero bairros TSE sem correspondência.
- Nenhuma linha foi classificada como “sem divisão formal encontrada”: pesquisa não concluída não é prova de inexistência.
- Decisão humana pendente: qual referência/vigência adotar para Capixaba se não for localizada alteração legal que resolva o conflito. Até lá, não incluí-lo em nenhuma das duas regiões.

## Acre — fontes e conflito

[Lei Complementar 126/2003](https://www.legis.ac.gov.br/detalhar/635), arts. 1–6: institui cinco regionais e lista seus municípios. Confirmação da ementa pelo [catálogo SEPLAN](https://seplan.ac.gov.br/catalogo-politicas-publicas/institui-as-regionais-do-alto-acre-do-baixo-acre-do-purus-do-tarauaca-e-envira-e-do-jurua/).

O art. 2º, V coloca Capixaba no Alto Acre; a [tabela territorial da SEAD](https://sead.ac.gov.br/tabela-01-divisa%CC%83o-territorial/) o coloca no Baixo Acre. Não encontrei nesta consulta ato modificador que explique a diferença. A lei escreve “Manuel Urbano”; SEAD e [IBGE](https://www.ibge.gov.br/cidades-e-estados/ac/manoel-urbano.html) usam “Manoel Urbano”. No CSV de municípios usei a grafia do IBGE, sem alterar a identificação territorial.

Códigos IBGE dos 21 municípios: [Censo 2010 — Acre, página 1](https://ftp.ibge.gov.br/Censos/Censo_Demografico_2010/resultados/tabelas_pdf/total_populacao_acre.pdf), lida nesta consulta. São códigos IBGE de sete dígitos, não códigos TSE. Não usei os números populacionais de 2010. API atual de localidades falhou com HTTP 503; a confirmação atualizada dos códigos permanece recomendada antes da carga definitiva.

## Estado do Rio de Janeiro — correção

A linha anterior misturava dez regiões do aplicativo com a regionalização estadual. Corrigida para oito Regiões de Governo, confirmadas no [portal oficial SECTI](https://mapa.secti.rj.gov.br/), seção “Onde estão os registros, por Região de Governo”, que atribui a divisão à CEPERJ. As regiões do município do Rio não foram alteradas. Lista dos 92 municípios por região ainda pendente; nenhuma correspondência foi deduzida de uma lei antiga com composição diferente.

[CEPERJ — histórico e características](https://www.rj.gov.br/ceperj/historico-caracteristicas) e [perguntas frequentes](https://www.rj.gov.br/ceperj/perguntas-frequentes) trouxeram confirmação indexada, mas abrir as páginas falhou (404/timeout). O [mapa areas.pdf](https://www.rj.gov.br/ceperj/sites/default/files/arquivos-paginas/areas.pdf) tinha conteúdo indexado e retornou 404 na abertura; não é tratado como arquivo baixado ou validado visualmente.

## Recife — fontes por grupo

Tipo e quantidade: [Lei 16.293/1997, art. 1º](https://www.legiscidade.recife.pe.gov.br/lei/16293/?keyword=rpa), resultado oficial indexado; a abertura direta retornou 502. Relações de bairros nos resultados oficiais indexados:

| Divisão | Fonte da Prefeitura |
|---|---|
| RPA 1 | https://www2.recife.pe.gov.br/servico/sobre-rpa-1?op=nzq0mq%3D%3D |
| RPA 2 | https://www2.recife.pe.gov.br/servico/sobre-rpa-2?op=NTI4Mg%3D%3D |
| RPA 3 | https://www2.recife.pe.gov.br/servico/sobre-rpa-3?op=NzQ3NQ%3D%3D |
| RPA 4 | https://www2.recife.pe.gov.br/servico/sobre-rpa-4?op=NzQ3Ng%3D%3D |
| RPA 5 | https://www2.recife.pe.gov.br/servico/sobre-rpa-5 |
| RPA 6 | https://www2.recife.pe.gov.br/servico/sobre-rpa-6?op=NzQ3OA%3D%3D |

A página “Sobre a RPA 2” omite Campo Grande em sua lista. Sua vinculação à RPA 2 foi conferida na [página individual do bairro](https://www2.recife.pe.gov.br/servico/campo-grande?op=NzQ1NQ%3D%3D). A página da RPA 5 contém “Mangueria” e “San Msrtin”; as grafias do CSV seguem as páginas oficiais individuais de [Mangueira](https://www2.recife.pe.gov.br/servico/mangueira?op=NzQ3Nw%3D%3D) e [San Martin](https://www2.recife.pe.gov.br/servico/san-martin?op=NzQ3Nw%3D%3D). Isso não é normalização dos bairros do TSE: esse cruzamento não foi feito.

No CSV consta “Recife”, como na fonte de composição; o índice usa também “Bairro do Recife”. Não substituí por um nome suposto do TSE. Pau-Ferro conserva o hífen da fonte.

Malhas oficiais identificadas no [catálogo Área urbana](https://dados.recife.pe.gov.br/pt_BR/dataset/area-urbana): Bairros do Recife em GeoJSON/shapefile e Região Política Administrativa em GeoJSON. Licença declarada do conjunto: Open Data Commons Open Database License (ODbL). Os URLs diretos das malhas não puderam ser recuperados; não baixadas nem geometrias conferidas. O recurso CSV [a378d50a-5e55-4956-a28c-13305acfc2b3](https://dados.recife.pe.gov.br/pt_BR/dataset/area-urbana/resource/a378d50a-5e55-4956-a28c-13305acfc2b3) foi identificado, mas não baixado; a relação entregue foi compilada das páginas, não desse CSV. CKAN retornou 503/indisponível e aberturas das páginas tiveram 400/502/timeouts.

## Fortaleza — correção e limite

A descrição anterior dizia “Centro e Regionais I a XII”, sugerindo uma divisão extra. São 12 Regionais ao todo, conforme [Prefeitura, 07/01/2021](https://fortaleza.ce.gov.br/noticias/entenda-a-nova-territorializacao-administrativa-de-fortaleza), que referencia a LC 278/2019 e os decretos 14.590/2020 e 14.899/2020. A página foi aberta e lida. Numeração confirmada no [índice institucional oficial](https://www.fortaleza.ce.gov.br/institucional).

Relação bairro→regional de Fortaleza ainda pendente. Um mapa antigo indexado apresentou numeração diferente da página atual; não foi usado para classificar bairros. Não inferir região pelo número do território. Licença de malha específica ainda não confirmada.

## Verificações executadas

CSV legível em UTF-8, campos e contagens preservados: 27 UFs e 101 municípios; 21 códigos IBGE únicos nos vínculos do Acre; 94 nomes únicos no Recife; nenhuma atribuição múltipla no CSV entregue. rio_regioes.json permanece idêntico ao main (SHA-256 c85f0ce00701f85bd6c5c0f9d7d3cf127ea054f623c69c5b0ed6ddbb6ccd5c0e). Eleitores_2026, bairros_tse, códigos TSE e ordenação da lista original foram preservados, não auditados nesta pesquisa.
