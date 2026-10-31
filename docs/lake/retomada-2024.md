# Retomada da aquisição — 29/10/2026

Estado: preparação documental. PR #1 continua aberto; merge bloqueado pela revisão automática, que exigiu confirmação direta na conversa para alterar main. Nenhum contorno, dispatch, nova aquisição TSE, conversão ou publicação foi feito nesta retomada.

## Contrato conferido

Lidos no main a15d7c30: ESTRUTURA.md, scripts/lake_gerais/build_lake.py, .github/workflows/lakeg-build.yml e conferências 2018/2022/2026. As três Releases existentes ficam preservadas. O catálogo original de 255 recursos foi recuperado do commit local 391d1f04; ver catalogo-historico-resumo.md. O mapa de 129 pares origem→canônico de 2024 está em layouts/2024.md, verificado contra os cabeçalhos da inspeção já concluída no Actions.

## Conflitos das instruções antigas com o novo contrato

| Antes | Agora | Tratamento necessário |
|---|---|---|
| Quatro tabelas e Parquet particionado | Sete tabelas, nomes planos canônicos | Portar para build_lake.py; não publicar o formato antigo |
| Qualquer divergência bloqueia | Classificar cada diferença com evidência | C1–C5, CSVs completos, zero não explicadas para validado |
| Log integral e inventário grande em docs | Resumo/hashes em docs; histórico anexo à Release | Preservar o histórico até transferência verificada; remover em PR de migração, sem perder a auditoria |
| Job final grava relatório no branch executado | Nunca push direto em main | Relatórios na Release; branch lake-relatorios opcional |
| ZIP nacional baixado em cada UF | Uma aquisição nacional por execução | Preparo → artifact sanitizado → até três runners |
| Escopo somente municipal 2024 | Histórico municipal/geral e divisões administrativas | Avançar ano a ano apenas após relatório do anterior; não refazer 2018/2022/2026 |

## Pontos de implementação ainda pendentes

1. Portar os filtros de palavra inteira e data, seleção unívoca de membro e descarte de campos privados antes do banco para o conversor canônico. O conversor atual de gerais extrai CSV integral antes de selecionar colunas; não atende à nova regra de intermediários sanitizados.
2. Acrescentar partido e detalhe_zona, preservar todas as colunas canônicas e candidatos vice-prefeito somente no cadastro; manter candidatos com zero votos. Fixar a versão do DuckDB (main usa 1.1.3; testes anteriores usavam 2.0.0), testar a compatibilidade de SQL antes do piloto.
3. Orquestração manual única: entradas ano, escopo, ufs e publicar; preparar nacionais uma vez, lotes por UF, consolidação e Release draft. Não aceitar interpolação de inputs não validados em shell.
4. Registrar por fonte URL, tamanho/hash do ZIP, Last-Modified, ETag, membro, geração, pleitos selecionados e commit/run; conferir checksums dos artifacts e impedir mudanças entre lotes.
5. C1: comparação de votos e conjuntos de seções; C2: nominal por célula UF/município/zona/cargo/turno/candidato; C3: cadastro ausente e completude de bairro/coordenadas; C4: total por cargo/turno contra detalhe_zona; C5: chaves, votos, votável, candidato, siglas, duplicidades, ambiguidades e hashes.
6. Classificação exige causa na própria célula. Situação indeferida não justifica diferença arbitrária; quantificar nominais/nominais válidos. Sinalizadores de seção explicam somente as diferenças correspondentes. Fonte posterior sem evidência de alteração não basta para explicar ausência de local. Não ajustar valores.
7. Persistir todas as diferenças em CSV, inclusive explicadas. Publicar validado apenas sem não explicadas; divergente somente pré-release explícita. Piloto parcial AC não certifica o Brasil nem pode substituir lake-2024 nacional como validado.
8. Portar os cinco testes sintéticos e ampliar com classificação/causa numérica, todas as colunas, extraordinária/suplementar e sanitização antes de disco. Nenhum teste novo foi executado nesta retomada.
9. Depois do porte e validação, aposentar build_2024.py/run_2024.py/lake-2024.yml no mesmo PR de código. Este PR documental não efetua a refatoração nem remove ferramentas antes de haver substituto.

## Ordem de execução e limites

Depois de liberar o merge do PR #1: confirmar presença do workflow no main, preparar a migração em PR (sem mesclar outro PR sem pedido), executar piloto AC no branch com as correções, ler manifesto/CSV/conferência, então 2024 TODAS. Os workflows antigos ainda não satisfazem o contrato novo; não dispará-los como se satisfizessem.

Antes de cada execução, contabilizar número de tentativas e duração acumulada por ano. A nova regra exige parar antes de uma quarta execução ou ao superar duas horas totais de processamento. A inspeção antiga não foi reclassificada como conversão; custo total ainda não apurado. Não inventar minutos cobrados ou custo monetário.

Anos seguintes: municipais 2020, 2016, 2012, 2008, 2004, 2000, 1996 utilizável; depois gerais 2014, 2010, 2006, 2002, 1998 e anteriores disponíveis. Inventário antigo é ponto de partida, não validação de layouts nem prova de cobertura atual.
