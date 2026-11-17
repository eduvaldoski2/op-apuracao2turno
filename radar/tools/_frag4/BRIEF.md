# Brief para redatores do Radar (edição 15h de 17/11/2026)
Contexto: Radar da Oficina Política, jornal digital de política brasileira. Hoje é terça 17/11/2026; são ~14h30 em Brasília. A edição das 11h já saiu: queremos o que saiu DEPOIS disso e o que ficou de fora.
Seu trabalho: pesquisar com WebSearch (e `node radar/tools/artigo.cjs <palavras>` / `--url <link>`, que lê radar/tools/_artigos.json, trechos de reportagens já baixados; `node radar/tools/cobertura.cjs` lista lacunas das capas) e ESCREVER arquivos em radar/tools/_frag4/<id>.js, UM por matéria NOVA. NÃO use git, NÃO edite outros arquivos, NÃO crie matéria sobre assunto que já tem matéria (confira: `grep -c "<palavra>" radar/_edicao.php` e olhe títulos com `grep -o "t:'[^']*" radar/_edicao.php | tail -300`).
Fatos: só o que leu nas buscas desta execução; URL só se apareceu em resultado de busca/leitura; não invente número, cargo, partido. Matéria vale só com data de 16–17/11/2026.
## Formato do arquivo (copie a estrutura de radar/tools/_frag3/sp_pcc_chantagem_tarcisio_17_11.js e de radar/tools/_frag3/ba_operacao_safra_oculta_17_11.js)
```
// ED: politica        (politica|economia|mundo|regioes)
// KIND: N
_N('id_curto_17_11', {ed:'politica', k:'Política · Tema', hora:'17/11',   // regioes: acrescente reg:'rj|sp|mg|ne|sul|norte|co'
 t:'manchete com o estado atual da história, sem citar veículo',
 sub:'1–2 frases com o segundo fato mais importante, sem veículo',
 dado:{n:'número', l:'rótulo'},
 resumo:'50–120 palavras, quem fez o quê, quando, número central, o que está pendente. Sem citar veículo.',
 fundo:`Lide de 20 a 85 palavras (fato principal; não começa por "Segundo"; sem nome de veículo).

Parágrafos narrativos de 2–4 frases (máx 140 palavras), contando a história: contexto, desenvolvimento, reações, efeito prático. Atribuição dentro da frase ("informa a Agência Brasil"), varie; nunca "Segundo X" em mais de 40% dos parágrafos.

## Intertítulo temático

mais parágrafos...

## O que vem agora

1–3 frases.

## O que ainda não está confirmado

1–3 frases de fatos pendentes (nunca "falta fonte").
NUMS 3|rótulo;4|rótulo;5|rótulo`,
 fontes:[['Veículo (recorte)','https://url-lida-nesta-execução'],['Outro veículo','https://...']]});
```
(Para matéria de fonte única, acrescente fonteunica:true após hora e escreva 160–400 palavras dizendo de quem é a informação; use isso em no máximo 1 de cada 4.)
## Regras (o validador recusa/penaliza)
- fundo 300–800 palavras (destaque 600+), ≥75% em parágrafos narrativos; listas `- ` ≤15% (prefira nenhuma); ≥2 veículos DIFERENTES em `fontes` (ideal 3), lidos de verdade; pelo menos 1 oficial/primária quando existir. Matéria de 450+ palavras: ≥2 intertítulos `## `.
- NUMS (3–4) vai no fim; "O que vem agora" e "O que ainda não está confirmado" curtos.
- Explique siglas, órgãos, cargos na primeira menção; cargo, partido e campo político na primeira menção de cada político ("deputado X (PL-SP), partido de direita"). Classificação por Wikipédia pt; o PT é sempre "esquerda".
- Frases curtas, voz ativa, sem adjetivo, sem opinião. Proibido: "vale destacar", "é importante ressaltar", "em suma", "nesse sentido", "bombástico", "chocante", "falta segunda fonte", "não localizou", "único veículo".
- Acusação é acusação ("é suspeito", "segundo a Polícia"). Citação direta: no máximo 1 curta por matéria. Reescreva com palavras próprias.
- Valide cada arquivo: `node radar/tools/_frag_check.cjs radar/tools/_frag4/<id>.js` (SINTAXE OK, narrativo ≥75%, lide 20–85, resumo 50–120, fontes ≥2). Corrija o que apontar. Cuidado com crases dentro do template e com apóstrofos em strings entre aspas simples (use \').
- Ao terminar (prazo: 20 minutos de relógio), responda só com a lista: id | editoria | t | (nº palavras).

## ATUALIZAÇÕES (_U) — para quem foi designado a atualizar matéria existente
Leia a matéria atual: `node -e "..."` não é necessário; use `grep -n "_N('ID'" radar/_edicao.php` e leia o bloco (ou `sed -n`). Escreva em radar/tools/_frag4u/<id>.js (mesmo id da matéria) assim:
```
// ED: politica
// KIND: U
_U('id_existente', {hora:'17/11',
 t:'...estado de agora...', sub:'...', dado:{n:'',l:''}, resumo:'50–120 palavras', upd:'1–2 frases: o que mudou desde a edição anterior',
 fundo:`...matéria REESCRITA INTEIRA com o fato novo (300–800 palavras, mesmo padrão: lide, narrativa, ## temáticos, fecho curto, NUMS)...`,
 fontes:[[...],[...]]});
```
Reescreva tudo (não anexe "Atualização das 15h"); o fato anterior vira contexto. Valide com `node radar/tools/_frag_check.cjs <arquivo>` (aceita _U).
