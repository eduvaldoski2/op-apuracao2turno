# Fontes do Radar: o que abre para a edição (testado em 07/11/2026)

Teste feito com WebSearch filtrado por domínio (`allowed_domains`, um domínio por busca). "Abre" = a busca devolve links do site. Para ler o texto, use WebFetch numa URL que apareceu na busca; alguns sites bloqueiam o WebFetch por robots (exemplo: france24.com): nesse caso use o trecho da busca e confirme em outra fonte. Se um site da lista falhar numa edição, registre no resumo e siga.

## Regra de variedade (o `publicar.cjs` confere)
- Toda matéria nova ou atualizada: ao menos **2 veículos diferentes com link**; destaques (capa, primeira de Política/Economia/Mundo): **3**.
- Mundo: ao menos **1 fonte fora da imprensa brasileira** (agência, veículo internacional ou do país do fato).
- Na edição inteira: no mínimo 12 veículos diferentes, e nenhum passa de 25% das citações. CNN Brasil e Metrópoles são úteis, mas não podem ser a espinha de toda a edição.
- Fato único de um veículo só = bastidor ou exclusivo: marque `fonteunica:true` (no máx. 25% das matérias) e diga no texto de quem é a informação.

## Oficiais e institucionais (abrem)
- Câmara: camara.leg.br (Agência Câmara, pauta do Plenário). Senado: www12.senado.leg.br (Agência Senado, TV Senado).
- STF: noticias.stf.jus.br. TSE: tse.jus.br/comunicacao/noticias.
- Agência Brasil: agenciabrasil.ebc.com.br (internacional, política, economia, regiões).
- Pesquisas: Genial/Quaest em analisa.genialinvestimentos.com.br e lp.genialinvestimentos.com.br/pesquisas.
- Não testados (tente; se não abrir, anote): planalto.gov.br, gov.br, bcb.gov.br, ibge.gov.br, tcu.gov.br, in.gov.br, mpf.mp.br, cnj.jus.br, stj.jus.br, Datafolha, AtlasIntel, Ipespe, PoderData.

## Imprensa nacional e de análise (abrem)
- Congresso em Foco (congressoemfoco.com.br), JOTA (jota.info), Gazeta do Povo (gazetadopovo.com.br), Nexo (nexojornal.com.br), CartaCapital (cartacapital.com.br), Revista Fórum (revistaforum.com.br), Brasil 247 (brasil247.com), Diário do Centro do Mundo (diariodocentrodomundo.com.br), Terra (terra.com.br; reproduz RFI e AFP), InfoMoney (infomoney.com.br), Exame (exame.com).
- Já usados nas edições (sem teste de domínio): CNN Brasil, Metrópoles, Correio Braziliense, Estado de Minas, O Rio Branco, Diário do Grande ABC.
- Sem links na busca (tente a capa por WebFetch e outros sites que reproduzem): Folha (folha.uol.com.br), O Globo (oglobo.globo.com), Veja (veja.abril.com.br).
- Rejeitados pela busca (não perca tempo; procure a matéria em quem a reproduz): estadao.com.br, poder360.com.br, uol.com.br, r7.com.

## Internacional (abrem)
- Al Jazeera (aljazeera.com), France 24 (france24.com; WebFetch bloqueado por robots), Euronews em português (pt.euronews.com; traz AP), SWI swissinfo.ch (versão em espanhol), CNN internacional (cnn.com), NPR (npr.org), The Washington Post (washingtonpost.com), Times of Israel (timesofisrael.com), Kyiv Independent (kyivindependent.com), South China Morning Post (scmp.com).
- Rejeitados pela busca (use quem os cita: Al Jazeera cita Reuters; Infobae reproduz EFE, AFP e The New York Times; Euronews reproduz AP; Terra reproduz RFI e AFP): reuters.com, apnews.com, bbc.com, dw.com, rfi.fr, theguardian.com, nytimes.com, politico.com, lemonde.fr.

## América Latina (abrem)
- Regional: Infobae (infobae.com/america), SWI swissinfo.ch (versão em espanhol), La Nación Argentina (lanacion.com.ar), Página/12 (pagina12.com.ar), La Tercera Chile (latercera.com), Montevideo Portal (montevideo.com.uy), El Tiempo Colômbia (eltiempo.com).
- Paraguai: ABC Color (abc.com.py), Última Hora (ultimahora.com). Priorize-os em qualquer pauta paraguaia.
- Rejeitados: clarin.com, elpais.com, efe.com.
- Não testados: Bolívia, Venezuela, Peru, Equador, México, Uruguai (El País, El Observador), Argentina (Ámbito, La Política Online já apareceram como fonte), Paraguai (La Nación PY, Hoy). Teste e registre.

## Regionais
Veja `FONTES_REGIONAIS.md` (lista por estado).

## Como achar a notícia que "ainda não saiu em lugar nenhum do Brasil"
1. Faça a busca no veículo do **país do fato** (idioma local) e nas agências que o citam, não só nas seções internacionais brasileiras, que chegam horas depois.
2. Busque por verbo do fato + país: "destituído", "renuncia", "preso", "golpe", "estado de sítio", "quebra", "decreta", "explosão", "eleição", com o nome do país.
3. Abra o "ao vivo" de Infobae, La Nación, Al Jazeera, CNN e Times of Israel quando houver: trazem hora a hora e apontam o que é confirmado.
