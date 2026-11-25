# Brief dos redatores · Radar 07h de 25/11/2026 (quarta)
Repo: /home/claude/op-apuracao2turno (NÃO rode git, NÃO rode publicar.cjs, NÃO edite radar/_edicao.php). Você só cria fragmentos em `radar/tools/_f07/`.

## Leia antes
- `radar/tools/INSTRUCOES.md` seções "Como escrever", "Padrão de matéria", "Roteiro por tipo", "Estilo", "Regras editoriais gerais" (resumo abaixo).
- `radar/tools/_f07/lacunas.txt` (lacunas das capas de hoje), `ranking.txt`, `regional.txt` (manchetes por UF).
- Material: `node radar/tools/artigo.cjs <palavras>` consulta trechos de reportagens de hoje (já baixados); `node radar/tools/artigo.cjs --url <link>`. Use isso e WebSearch (WebFetch só em URL devolvida pelo WebSearch). Cada consulta conta: faça muitas (≥12 por redator), cruze ≥3 veículos por matéria, 1 oficial/primário quando existir.
- Matéria atual de um id existente: `node radar/tools/_show.cjs <id>`; lista de ids ativos: `node radar/tools/_show.cjs --list politica|economia|mundo|regioes`.

## Formato de cada fragmento: um arquivo `radar/tools/_f07/<id>.js` por matéria
```
// ED: politica        (politica|economia|mundo|regioes)
// KIND: N             (N = matéria nova, id novo terminando em _25; U = atualização de id existente)
_N('id_novo_25', {ed:'politica', k:'Política · STF', hora:'25/11', t:"...", sub:"...", dado:{n:'353 a 128', l:'votos'}, resumo:"50-120 palavras", fundo:`lide (20-85 palavras)

## Intertítulo temático

parágrafo...

NUMS valor|rótulo;valor|rótulo;valor|rótulo`, fontes:[["Veículo (recorte)","https://url-lida"],...]});
```
- Para regioes inclua `reg:'rj|sp|mg|ne|sul|norte|co'` e k:'Regiões · <Estado>'. Atualização: `_U('id_existente', {hora:'25/11', t, sub, upd:"1-2 frases do que mudou", resumo, fundo, fontes, dado?})` reescrevendo tudo (sem blocos "Atualização das Xh"; o fato novo no começo, o antigo vira contexto).
- Cada matéria: `fundo` = template string; linhas em branco entre parágrafos; `## ` intertítulo; `- ` item de lista (≤15%); `NUMS a|b;c|d` (3-4 números, no FIM); `TL data|txt;...` só se vários dias.
- Medidas: destaque 600-1500 palavras e ≥3 fontes; demais 400+ palavras (nunca <300) e ≥3 fontes (mín. 2); lide 40-70 palavras com fato, personagem, data, lugar; ≥75% texto narrativo (parágrafos de 2-4 frases, ≤140 palavras); matéria ≥450 palavras tem ≥2 intertítulos `##` temáticos (nunca por horário). `fonteunica:true` só para bastidor/exclusivo (160-400 palavras, dizendo de quem é a informação).
- PROIBIDO em `t`, `sub`, lide e `resumo`: nome de veículo ("g1", "Folha", "segundo o..."). Atribuição entra DENTRO das frases do corpo, variada ("informa a Agência Brasil"); nunca um parágrafo por veículo, nunca "Segundo X" abrindo >40% dos parágrafos.
- Estilo de jornal: frases curtas, voz ativa, sem adjetivo, sem opinião, sem muletas ("vale destacar", "em suma", "nesse sentido", "é importante ressaltar", "bombástico", "chocante"). Explique siglas/cargos/leis na 1ª menção. Na 1ª menção de agente político: cargo, partido e campo ("do PL, partido de direita"). PT = "esquerda" sempre. Acusação é acusação ("é acusado", "segundo a Polícia Federal"). Nunca diga que não achou outra fonte. Nunca invente fato, número, nome, URL: só use URLs vistas em WebSearch/artigo.cjs desta sessão. Reescreva em texto próprio, no máximo uma citação curta.
- `fontes`: só veículos cujo texto leu, com link real; Mundo precisa de pelo menos 1 fonte de fora da imprensa brasileira. Variedade: não use sempre os mesmos veículos.
- Termine com "O que vem agora" curto (1-3 frases) dentro do corpo, e se houver pendência "O que ainda não está confirmado".
- Só notícia das últimas ~24-48h, com fato posterior à edição das 19h de ontem sempre que possível (o que saiu à noite e de madrugada de 25/11).
- Valide cada fragmento: `node radar/tools/_frag_check.cjs radar/tools/_f07/<id>.js` e corrija o que o check apontar (palavras, narrativo %, lide, resumo, upd).

## Ritmo
Escreva UMA matéria de cada vez, do começo ao fim (pesquisa → ficha de 6-10 fatos → escrita → check), gravando cada arquivo assim que passar no check. Prioridade: entregar as primeiras matérias até 06:55 (passada 1) e continuar até 07:20. Hora atual: `date`. No fim devolva APENAS uma lista: id | KIND | ed | palavras | título curto, e quantas buscas/consultas fez. Não devolva o texto das matérias.
