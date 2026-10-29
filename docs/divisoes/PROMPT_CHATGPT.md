# Prompt para o ChatGPT (agente): completar divisões administrativas

Cole o texto abaixo. Os arquivos estão no repositório público eduvaldoski2/op-apuracao2turno, pasta docs/divisoes/ (branch main).

```
Você vai completar e verificar um levantamento de divisões administrativas do Brasil para uma plataforma de análise eleitoral. Use SOMENTE fontes oficiais (governos estaduais, prefeituras, IBGE, leis e decretos) e informe a URL de cada fonte. Não invente nomes, números nem divisões; quando não encontrar divisão oficial, escreva "sem divisão formal encontrada". Trabalhe em um branch novo chamado divisoes e abra um pull request alterando apenas docs/divisoes/.

ARQUIVOS (raw: https://raw.githubusercontent.com/eduvaldoski2/op-apuracao2turno/main/docs/divisoes/<arquivo>)
1) uf_macrorregioes.csv: 27 UFs. Colunas: uf, divisao_oficial, qtd, regioes, confianca, fonte_url.
2) cidades_200k_divisoes.csv: 101 municípios com mais de 200 mil eleitores (todas as capitais e Brasília inclusas). Colunas: ordem, uf, cd_municipio_tse, municipio, eleitores_2026, bairros_tse, divisao_tipo, qtd_divisoes, nomes_divisoes, confianca, fonte_url.
3) rio_regioes.json: divisão do Rio de Janeiro (município). NÃO ALTERAR.

TAREFA A - macrorregiões das UFs
Para cada UF, identifique a divisão administrativa/de planejamento do ESTADO (ex.: regiões de planejamento, de integração, de desenvolvimento, territórios, macrorregiões, regiões administrativas). Preencha divisao_oficial (nome do tipo), qtd, regioes (lista dos nomes, separados por ponto e vírgula), fonte_url e confianca (Alta = lei ou site oficial confirma; Média = fonte secundária; Baixa = incerto). Para as linhas marcadas "A verificar", pesquise do zero. Para as já preenchidas, confira e corrija se estiver errado (registre a correção na coluna confianca). Quando o estado usar mais de uma divisão (ex.: regiões de planejamento e de saúde), priorize a de planejamento/administração geral e cite a outra na coluna regioes entre parênteses apenas se for relevante.
Informe também, por UF, a lista de municípios de cada região quando a fonte oficial publicar (arquivo separado docs/divisoes/uf_municipios_regioes.csv com colunas uf, regiao, cd_municipio_ibge, municipio).

TAREFA B - divisões dos municípios
Para cada um dos 101 municípios (exceto Rio de Janeiro, que já está feito), identifique a divisão administrativa interna oficial usada pela prefeitura (subprefeituras, regionais, regiões administrativas, distritos, zonas, regiões de planejamento ou do orçamento participativo). Preencha divisao_tipo, qtd_divisoes, nomes_divisoes (separados por ponto e vírgula), fonte_url e confianca. Linhas já preenchidas devem ser conferidas.
Para cada CAPITAL e para os 20 municípios com mais eleitores, entregue também o arquivo docs/divisoes/bairros_regioes_<UF>_<cd_municipio_tse>.csv com a relação bairro → divisão (colunas bairro, divisao), sempre que a prefeitura publicar essa relação. Se um bairro estiver em mais de uma divisão ou a relação não for pública, marque e explique.

REGRAS
- Não grave dados pessoais.
- Se a fonte for um PDF ou uma lei, cite o artigo ou a página.
- Ao final, entregue um resumo: quantas linhas foram confirmadas, quantas ficaram sem divisão formal e quais dependem de decisão humana.
```
