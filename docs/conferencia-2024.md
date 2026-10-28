# Conferências municipais de 2024 — estado inicial

**As conferências sobre votos reais ainda não foram executadas.** A inspeção de arquivos no Actions mede estrutura, linhas e geração; não valida as somas eleitorais.

| Conferência exigida | Estado |
| --- | --- |
| Votos por candidato e município contra votação por município/zona | Não executada |
| Seções distintas por município contra fonte do TSE | Não executada |
| Total de votos por cargo e turno contra detalhe oficial | Não executada |
| Lista integral das divergências numéricas | A produzir após execução |
| Municípios com bairro ausente | A produzir após execução |

Problemas de fonte já observados no inventário: as bases nacionais de 2024 contêm suplementares posteriores; cadastro também inclui vice-prefeitos; fontes têm gerações internas distintas; relatórios de totalização vêm em PDF, embora o catálogo os rotule como CSV. Nenhum desses pontos foi convertido em correção silenciosa de valores.

O workflow manual `lake-2024.yml` começará pelo piloto AC. Ele substituirá este relatório com o resultado real e preservará as listas CSV de divergências e os manifestos com URL, geração e SHA-256. Falhas e divergências bloqueiam a publicação de Parquets como validados. Os testes locais de código usam somente dados sintéticos.
