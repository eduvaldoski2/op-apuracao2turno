<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>
/* ===== DADOS DA EDIÇÃO (trocar este bloco a cada atualização) ===== */
var EDICAO = {hora:'15h', data:'Quinta, 05 de novembro de 2026'};
var ED = [
 {id:'politica', nome:'Política'},
 {id:'economia', nome:'Economia'},
 {id:'regioes',  nome:'Regiões', subs:[['rj','Rio de Janeiro'],['sp','São Paulo'],['mg','Minas Gerais'],['ne','Nordeste'],['sul','Sul'],['norte','Norte'],['co','Centro-Oeste']]},
 {id:'mundo',    nome:'Mundo'}
];
var S = {};

S.flavio = {ed:'politica', k:'Política', hora:'5/11',
 t:'Flávio vota por celular de fora do país, e Randolfe pede a anulação do voto',
 sub:'Alcolumbre manda a assessoria técnica analisar o caso. Nos bastidores, indica que não dará andamento a pedidos de cassação.',
 dado:{n:'3/11', l:'Voto remoto de Flávio, com o senador nos Estados Unidos'},
 resumo:'O senador Flávio Bolsonaro (PL-RJ) votou por celular, na terça (3), em sessão semipresencial da PEC da Segurança, estando nos Estados Unidos. Nesta quarta (4), o líder do governo no Congresso, Randolfe Rodrigues (PT-AP), pediu a anulação do voto, alegando que a viagem não foi comunicada à Mesa. Davi Alcolumbre mandou a assessoria técnica analisar o caso, sem prazo para decidir.',
 fundo:[
  ['p','O senador Flávio Bolsonaro (PL-RJ) participou por celular de votações do Senado na terça-feira (3) enquanto estava nos Estados Unidos, e o episódio chegou ao plenário no dia seguinte. Na quarta (4), o líder do governo no Congresso, Randolfe Rodrigues (PT-AP), apresentou uma questão de ordem pedindo a anulação do voto e perguntando se a Mesa Diretora havia sido formalmente avisada da ausência do parlamentar.'],
  ['p','O voto contestado foi dado na votação de requerimentos que separaram trechos da PEC da Segurança Pública, em sessão semipresencial. Segundo o Plantão Brasil, Flávio se posicionou contra. Randolfe sustenta que o senador deixou o país sem a comunicação exigida pelas normas da Casa e que, sem ela, a participação remota deveria ser invalidada.'],
  ['p','O presidente do Senado, Davi Alcolumbre (União-AP), respondeu que a modalidade semipresencial permite, tecnicamente, o voto à distância, e que a Mesa vai encaminhar as questões à assessoria técnica, que verificará se houve descumprimento do regimento. De acordo com o Senado Notícias, não há prazo para a conclusão da análise, e até a publicação das reportagens consultadas não havia decisão.'],
  ['h','Exceção para o celular'],
  ['p','Segundo o Metrópoles, Alcolumbre abriu uma exceção para que Flávio votasse de forma remota mesmo sem ter autenticado o novo aparelho, procedimento que normalmente exigiria presença no Senado. A liberação, conforme o jornal, ocorreu a pedido de lideranças do PL.'],
  ['h','Viagem sob restrição judicial'],
  ['p','A ausência do senador já era assunto desde o fim de outubro. No dia 26, o ministro Alexandre de Moraes, do Supremo Tribunal Federal, mandou Flávio entregar os passaportes e proibiu a saída do país. No mesmo dia, o PL reconheceu a vitória de Lula na eleição presidencial. No dia seguinte, fontes ligadas à Polícia Federal confirmaram que ele estava nos Estados Unidos.'],
  ['p','O presidente Lula disse que o adversário saiu escondido e chamou o ato de vergonhoso, segundo a Gazeta do Povo. Deputados do PT pediram a prisão preventiva de Flávio e a inclusão do nome dele na difusão vermelha da Interpol. De Miami, em 28 de outubro, o senador se disse o “verdadeiro presidente eleito” e prometeu liderar a oposição, conforme o Movimento Econômico. A Gazeta do Povo também registrou, com base na imprensa americana, que os EUA concederiam vistos a ele e à família.'],
  ['tl',[
   ['26/10','Moraes manda Flávio entregar os passaportes e proíbe a saída do país. O PL reconhece a vitória de Lula.'],
   ['27/10','Fontes ligadas à PF confirmam que o senador está nos EUA. Lula critica a saída. O PT pede prisão preventiva e difusão vermelha.'],
   ['28/10','De Miami, Flávio se diz “verdadeiro presidente eleito” e promete liderar a oposição.'],
   ['3/11','Flávio vota por celular na sessão semipresencial do Senado.'],
   ['4/11','Randolfe apresenta a questão de ordem. Alcolumbre manda a assessoria técnica analisar.']]],
  ['h','Termos em disputa'],
  ['p','O episódio é descrito de formas diferentes pela imprensa. Metrópoles e Brasil 247 falam em “fuga”, termo também usado por Lula. A Gazeta do Povo trata o caso como viagem, e o Plantão Brasil, como viagem não comunicada. A distinção pesa no pedido de Randolfe, que depende justamente de a viagem não ter sido avisada à Mesa.'],
  ['h','Alcolumbre e a eleição do Senado'],
  ['p','A coluna de Igor Gadelha, no Metrópoles, afirma que bolsonaristas ouvidos nos bastidores avaliam que Alcolumbre vai proteger o mandato de Flávio, que termina em janeiro de 2027, e não dará andamento a pedidos petistas de cassação. A coluna liga o gesto à eleição para a presidência do Senado, marcada para 1º de fevereiro de 2027, na qual Alcolumbre tenta a reeleição e o PL terá o senador Rogério Marinho (PL-RN) como candidato. Integrantes da bancada bolsonarista dizem que não votarão em Alcolumbre.'],
  ['p','A coluna menciona ainda uma apuração da PF sobre um voo que pode ter levado a mulher e as filhas de Flávio até a fronteira. Segundo as fontes consultadas, a polícia investiga uma possível saída pela Argentina.'],
  ['h','O pano de fundo familiar'],
  ['ul',[
   'Em novembro de 2025, Moraes decretou a prisão preventiva de Jair Bolsonaro.',
   'Em julho de 2026, o ministro suspendeu por 90 dias as visitas de Flávio ao pai, por entender que publicações do senador contornavam a proibição de manifestação política por terceiros. As visitas foram retomadas em meados de outubro.',
   'Eduardo Bolsonaro, que está nos Estados Unidos, foi condenado pelo STF por coação no curso do processo, com mandado de prisão de quatro anos e dois meses, suspensão de direitos políticos e cancelamento de passaportes.',
   'O ministro André Mendonça encerrou o processo sobre o desafio de Lula e Flávio para abrir os próprios sigilos, segundo a coluna de Manoela Alcântara, no Metrópoles.']],
  ['h','Mandato e salário'],
  ['p','A Revista Fórum, que cita a coluna de Igor Gadelha no Metrópoles, informa que Alcolumbre não pretende criar obstáculos à permanência de Flávio no mandato, que termina em 31 de janeiro de 2027, nem ao pagamento do salário de R$ 46.366,19 mensais. Um aliado do presidente do Senado disse ao Metrópoles que não há processo de cassação nem decisão judicial que impeça o exercício do mandato. Alcolumbre busca a reeleição para a presidência da Casa e, segundo a reportagem, conta com ao menos quatro votos do PL.'],
  ['p','A Fórum registra ainda que, em 31 de outubro, os advogados Leonardo Marinho e Rodrigo da Silva Roma ajuizaram ação popular na Justiça Federal do Rio pedindo a suspensão de salário, auxílio-moradia e verbas de gabinete do senador, e que o gabinete mantém 21 funcionários. A reportagem não informa decisão sobre a ação. Segundo O Tempo, o voto de Flávio foi relevante: a separação das propostas sobre maioridade penal foi rejeitada por 38 a 36, e sem o voto dele o placar seria 38 a 35.'],
  ['h','O que vem a seguir'],
  ['p','Dois pontos seguem abertos: o resultado da análise da assessoria técnica do Senado e eventuais decisões de Moraes sobre os pedidos do PT. Nas matérias consultadas, não havia decisão sobre nenhum dos dois.']],
 fontes:[['Revista Fórum (5/11)','https://revistaforum.com.br/politica/flavio-bolsonaro-salario-eua'],['O Tempo (Karen Couto)','https://www.otempo.com.br/politica/congresso/2026/11/4/randolfe-acusa-flavio-bolsonaro-de-fuga-e-pede-anulacao-de-voto-dado-dos-eua'],['Coluna Política (Agência Senado)','https://colunapolitica.com.br/politica/alcolumbre-vai-analisar-questoes-de-randolfe-sobre-situacao-de-flavio-bolsonaro/'],['Metrópoles (Igor Gadelha)','https://www.metropoles.com/colunas/igor-gadelha/em-aceno-a-direita-alcolumbre-indica-que-protegera-mandato-de-flavio'],['Plantão Brasil','https://www.plantaobrasil.net/noticias/161854-randolfe-contesta-voto-de-flavio-bolsonaro-apos-viagem-nao-comunicada-aos-eua'],['Brasil 247','https://www.brasil247.com/brasil/randolfe-pede-anulacao-de-voto-de-flavio-bolsonaro-no-senado-apos-fuga-para-os-eua/'],['Senado Notícias','https://www12.senado.leg.br/noticias/materias/2026/11/04/davi-vai-analisar-questoes-de-randolfe-sobre-situacao-de-flavio-bolsonaro'],['Gazeta do Povo','https://www.gazetadopovo.com.br/republica/lula-chama-viagem-de-flavio-de-vergonhosa-e-lembra-da-propria-prisao-na-lava-jato/'],['Movimento Econômico','https://movimentoeconomico.com.br/politica/2026/10/28/de-miami-flavio-se-diz-verdadeiro-presidente-eleito-e-promete-guiar-oposicao/'],['Metrópoles (Manoela Alcântara)','https://www.metropoles.com/colunas/manoela-alcantara/mendonca-encerra-processo-sobre-desafio-de-lula-e-flavio-para-abrir-sigilos']]};

S.senado = {ed:'politica', k:'Política', hora:'4/11',
 t:'Corrida pelo comando da Câmara e do Senado já redesenha alianças',
 sub:'Alcolumbre busca votos na direita e na esquerda, o PL põe Marinho na disputa e o governo tenta formar base no centrão.',
 resumo:'A eleição das mesas da Câmara e do Senado, em fevereiro de 2027, já mexe com o Congresso. O PL colocou o senador Rogério Marinho (PL-RN) contra Davi Alcolumbre, que busca a reeleição, e ainda discute candidato na Câmara. O PT conversa com MDB, União Brasil e PP para formar a base de Lula, e Hugo Motta tenta se manter com apoio de 15 partidos.',
 fundo:[
  ['p','A disputa pelo comando do Congresso, que será decidida em fevereiro de 2027, passou a organizar as movimentações de PL, centrão e governo logo depois da reeleição de Lula. No Senado, o PL colocou na disputa o senador Rogério Marinho (PL-RN) para enfrentar o atual presidente, Davi Alcolumbre (União-AP), que tenta a reeleição. Integrantes da bancada bolsonarista dizem que não votarão em Alcolumbre, segundo a coluna de Igor Gadelha, no Metrópoles.'],
  ['h','Alcolumbre procura votos nos dois lados'],
  ['p','Alcolumbre tem o apoio oficial da federação União Progressista, formada por União Brasil e PP, em nota assinada pelos presidentes das siglas, Antonio Rueda e Ciro Nogueira. Segundo o Correio da Manhã, ele enfrenta resistência de senadores de direita e de integrantes dos próprios partidos. O jornal diz que o senador eleito Arthur Lira (PP-AL) pode ajudar a atrair os indecisos de centro-direita e que Lira também quer presidir a Comissão de Constituição e Justiça, sem acordo formalizado. A senadora Tereza Cristina (PP-MS) aparece como candidata de uma possível base de centro-direita e do agronegócio.'],
  ['p','Segundo o Brasil 247, Alcolumbre entregou a relatoria da Lei de Diretrizes Orçamentárias a um senador do PL, o que amplia o poder da oposição sobre o Orçamento, e o PSB abriu diálogo sobre apoio à reeleição, conforme afirmou Renato Casagrande. O mesmo site registra que o presidente do Senado lamentou a eleição de políticos que atacam e ofendem adversários, em reação a críticas do líder do PL.'],
  ['p','O Correio da Manhã informa ainda que, segundo aliados, Alcolumbre pretende discutir com Lula uma proposta de perdão ou anistia a Jair Bolsonaro, com o objetivo de conquistar votos da direita e aliviar a pressão por impeachment de ministros do Supremo. A proposta não foi apresentada formalmente. O Brasil 247 noticia que senadores do PL repensam o pedido de impeachment de ministros do STF.'],
  ['h','Câmara: Motta e a incógnita do PL'],
  ['p','Na Câmara, Hugo Motta (Republicanos-PB) tenta se manter com uma coalizão de 15 partidos, que inclui a federação PT-PV-PCdoB, PSD, MDB, Republicanos, Podemos, PSB, PDT, União Progressista, PSDB-Cidadania e Solidariedade-PRD, segundo o Correio da Manhã. A vitória no primeiro turno exige 257 votos, e o voto é secreto, o que impede os líderes de garantir votos individuais.'],
  ['p','O PL, que elegeu 121 deputados e 29 senadores, as maiores bancadas das duas Casas, discute se lança candidato próprio. Os nomes de Sóstenes Cavalcante e Altineu Côrtes, ambos do PL-RJ, chegaram a ser cogitados, mas Sóstenes sinalizou que não concorrerá. Segundo o g1, a bancada está dividida sobre apresentar um nome. O partido avalia também negociar cargos nas estruturas de comando e comissões, de olho em propostas ligadas ao Supremo.'],
  ['p','Motta chega à disputa com um revés regional: o pai dele, Nabor Wanderley (Republicanos), perdeu a vaga ao Senado na Paraíba para Veneziano Vital do Rêgo (MDB), que também tinha o apoio de Lula.'],
  ['h','A base de Lula'],
  ['p','O governo tenta, ao mesmo tempo, montar a própria base. O presidente do PT, Edinho Silva, reuniu-se com o MDB e busca União Brasil e PP, segundo Igor Gadelha. O Blog do Magno registra que Lula delegou a ele a interlocução com o centrão, a começar pelo MDB. De acordo com o Correio da Manhã, Lula garantiu a Motta e Alcolumbre, em encontro no Palácio da Alvorada, que a base do governo apoiaria a reeleição dos dois, informação atribuída a fontes do jornal e não confirmada oficialmente.'],
  ['h','Quem sai fortalecido'],
  ['p','As análises divergem. A Itatiaia avalia que a vitória de Lula fortalece Motta e Alcolumbre. O Correio da Manhã e o Poder360 apontam que o avanço do PL ameaça a reeleição dos dois. Para o cientista político Gabriel Jubran Miranda, da UnB e do IDP, ouvido pelo Correio da Manhã, apoiar o presidente, apoiar o comandante da Casa e votar com o governo são coisas distintas, e a maior bancada não garante o controle do Congresso. Ele vê na candidatura de Tereza Cristina um obstáculo real para Alcolumbre, mas não definitivo, dado o caráter individual do voto.'],
  ['h','Outras movimentações'],
  ['ul',[
   'O partido Missão se juntou ao PDT em processo que busca mudar o cálculo de vagas no Congresso, segundo o Metrópoles.',
   'Na Assembleia Legislativa de São Paulo, o coordenador da campanha de Haddad quer um cargo na Mesa Diretora, e o autor do modelo de escolas cívico-militares do estado quer a presidência da Casa, conforme o Metrópoles.']]],
 fontes:[['Correio da Manhã','https://www.correiodamanha.com.br/politica/2026/10/330984-motta-e-alcolumbre-costuram-apoios-para-seguir-no-comando.html'],['g1','https://g1.globo.com/politica/noticia/2026/11/04/com-marinho-na-disputa-a-presidencia-do-senado-pl-se-divide-sobre-lancar-nome-para-camara.ghtml'],['Metrópoles (Igor Gadelha)','https://www.metropoles.com/colunas/igor-gadelha/em-aceno-a-direita-alcolumbre-indica-que-protegera-mandato-de-flavio'],['Brasil 247 (LDO)','https://www.brasil247.com/brasil/alcolumbre-entrega-relatoria-da-ldo-a-senador-do-pl-e-amplia-poder-da-oposicao-sobre-orcamento/'],['Brasil 247 (PSB)','https://www.brasil247.com/brasil/psb-abre-dialogo-com-alcolumbre-sobre-apoio-a-reeleicao-no-senado-afirma-casagrande/'],['Brasil 247 (STF)','https://www.brasil247.com/poder/senadores-do-pl-repensam-impeachment-de-ministros-do-stf/'],['Blog do Magno','https://blogdomagno.com.br/lula-delega-contato-com-centrao-a-edinho-que-inicia-conversas-pelo-mdb'],['Itatiaia','https://www.itatiaia.com.br/politica/vitoria-de-lula-fortalece-motta-e-alcolumbre-na-disputa-pelo-congresso/']]};

S.pronunciamento = {ed:'politica', k:'Política', hora:'5/11',
 t:'Lula grava pronunciamento sobre responsabilidade fiscal, com exibição no domingo',
 sub:'Primeira fala em rede nacional depois da reeleição deve agradecer o apoio e dar um recado ao mercado.',
 resumo:'Lula grava nesta quinta (5) o primeiro pronunciamento em rede nacional depois da reeleição, que vai ao ar no domingo (8). Segundo a apuração do ICL atribuída à Folha, ele dirá que políticas sociais duradouras dependem de contas equilibradas, agradecerá os eleitores e tentará acalmar o mercado, sem anunciar medidas concretas.',
 fundo:[
  ['p','O presidente Lula grava nesta quinta-feira (5) o pronunciamento em rede de rádio e TV que será transmitido no domingo (8), o primeiro depois da vitória nas urnas. O tom previsto é de agradecimento aos eleitores, inclusive ao apoio que garantiu a virada no segundo turno, e de compromisso com a responsabilidade fiscal, segundo apuração publicada pelo ICL e atribuída à Folha.'],
  ['p','O eixo da mensagem, de acordo com a reportagem, é a ideia de que programas sociais robustos e duradouros dependem do equilíbrio das contas públicas. Dentro do governo, há debate sobre a profundidade do ajuste necessário, e o presidente quer evitar qualquer leitura de recuo em relação às promessas de campanha.'],
  ['p','O texto vem sendo escrito por um grupo que inclui Sidônio Palmeira, da Secretaria de Comunicação Social, Miriam Belchior, da Casa Civil, Dario Durigan, da Fazenda, e Bruno Moretti, do Planejamento. O Jornal de Brasília descreve a gravação como voltada a ajuste fiscal e pacificação nacional.'],
  ['h','Recado ao mercado'],
  ['p','O pronunciamento chega depois de um período de pressão nos mercados. Segundo o g1, depois de confirmada a vitória de Lula para o quarto mandato, o mercado elevou consideravelmente as projeções de inflação, reduziu as de crescimento e passou a prever juros mais altos. Na quarta (4), o Copom manteve a Selic em 13,75% ao ano e citou expectativas de inflação desancoradas.'],
  ['p','No mesmo dia, o presidente do Santander disse, segundo o Brasil 247, que Lula deu “demonstrações importantíssimas de confiança para os mercados”. O dólar comercial fechou a R$ 5,45, em queda de 0,64%, e o Ibovespa subiu, em movimento também ligado ao resultado das eleições americanas.'],
  ['p','O InfoMoney, em sua agenda desta quinta (5) e com base no Estadão/Broadcast, registra que a fala em cadeia nacional será no domingo (8) e dirá que o governo seguirá perseguindo as metas fiscais sem deixar de cumprir promessas de campanha.'],
  ['h','O que ainda não se sabe'],
  ['p','O texto do pronunciamento não foi divulgado, e o conteúdo descrito vem de apuração de bastidores. Veículos de linhas editoriais distintas interpretam a gravação de modo diferente. A apuração atribuída à Folha descreve um discurso que busca alinhar a gestão econômica às expectativas do mercado, enquanto o Blog do BG, crítico ao governo, vê a fala como tentativa de acalmar investidores diante das contas públicas, sem apresentar números.'],
  ['p','O mercado deve medir a recepção do discurso já na segunda-feira (9). Nas reportagens consultadas, não há indicação de metas, medidas ou prazos para o ajuste fiscal.']],
 fontes:[['InfoMoney (agenda de 5/11)','https://www.infomoney.com.br/mercados/copom-industria-balancos-boe-agenda-05112026/'],['ICL Notícias (via Plantão Brasil)','https://www.plantaobrasil.net/noticias/161828-em-primeiro-pronunciamento-apos-reeleicao-lula-deve-reforcar-compromisso-com-responsabilidade-fiscal'],['Jornal de Brasília','https://jornaldebrasilia.com.br/noticias/politica-e-poder/lula-grava-pronunciamento-sobre-ajuste-fiscal-e-pacificacao-nacional/'],['Tribuna do Sertão','https://www.tribunadosertao.com.br/financas/2026/11/04/1013525-lula-dara-recado-sobre-contas-publicas-em-pronunciamento-na-tv'],['Brasil 247 (Santander)','https://www.brasil247.com/economia/presidente-do-santander-diz-que-lula-deu-demonstracoes-importantissimas-de-confianca-para-os-mercados/'],['g1 (Copom)','https://g1.globo.com/economia/noticia/2026/11/04/copom-mantem-taxa-basica-de-juros-da-economia-em-1375percent-ao-ano.ghtml']]};

S.bets = {ed:'politica', k:'Política', hora:'4/11',
 t:'Fachin sinaliza julgamento conjunto de bets, loterias e jogos de azar no STF',
 sub:'Fux pede mais tempo para o voto, e Dino diz estar pronto para devolver a vista. Não há data para o julgamento.',
 resumo:'O presidente do STF, Edson Fachin, indicou que a Corte pode julgar juntas as ações sobre bets e sobre loterias municipais. O relator é Kassio Nunes Marques. Fux pediu mais tempo para votar, e Flávio Dino disse estar pronto para devolver o pedido de vista do julgamento sobre jogos de azar. Não há data.',
 fundo:[
  ['p','O presidente do Supremo Tribunal Federal, Edson Fachin, indicou que a Corte pode julgar em conjunto as ações sobre apostas esportivas e sobre a regulamentação municipal de loterias. Ele defendia julgamentos separados e aceitou reuni-los depois que ministros apontaram conexões entre os temas. O relator dos processos é Kassio Nunes Marques.'],
  ['p','Quatro ações diretas de inconstitucionalidade questionam a lei que autorizou as bets, e outras quatro passaram a contestar medidas que restringem a atividade. A Procuradoria-Geral da República pede a declaração de inconstitucionalidade da lei, e os pontos centrais do debate são a restrição de apostas por beneficiários de programas sociais e as apostas em um único atleta.'],
  ['h','O que mudou nesta semana'],
  ['p','O ministro Luiz Fux, que presidiu a audiência pública sobre a medida provisória que proíbe as bets, disse que precisa de mais tempo para elaborar o voto e defendeu tratar de forma conjunta as loterias e as várias modalidades de apostas. Já Flávio Dino perguntou se o julgamento sobre jogos de azar, suspenso por pedido de vista dele, poderia ser analisado junto com o das bets, e disse estar pronto para devolver a vista.'],
  ['p','Fachin afirmou que levará em conta o tempo necessário para os votos e a possibilidade de reunir os processos numa sessão futura. Nas matérias consultadas, não há data para retomar os julgamentos. Em julho, o STF previa julgar a ação da PGR no segundo semestre, segundo o Jornal do Comércio.'],
  ['h','Por que o tema importa agora'],
  ['p','Uma medida provisória de setembro proibiu apostas esportivas e jogos virtuais no país, o que levou à audiência pública presidida por Fux. A PEC da Segurança Pública, aprovada no Senado na terça, chegou a prever 30% da arrecadação das bets para fundos de segurança, ideia que o relator retirou do texto. Já o Imposto Seletivo, regulado pela MP publicada nesta quarta, não fixa alíquota para apostas. As três frentes dependem do desfecho no Supremo.']],
 fontes:[['CNN Brasil','https://www.cnnbrasil.com.br/politica/stf-quer-julgamento-conjunto-de-acoes-sobre-bets-loterias-e-jogos-de-azar/'],['Metrópoles (Manoela Alcântara)',''],['Jornal do Comércio','https://www.jornaldocomercio.com/politica/2026/07/1255766-stf-preve-julgar-acoes-contra-legalizacao-das-bets-no-segundo-semestre.html']]};


S.copom = {ed:'economia', k:'Economia', hora:'5/11',
 t:'Copom interrompe cortes e mantém a Selic em 13,75% ao ano',
 sub:'Decisão unânime vem na primeira reunião depois da reeleição de Lula. Brasil segue com o maior juro real entre 40 países.',
 dado:{n:'13,75%', l:'Selic ao ano · juro real de 8,45%, o maior entre 40 países'},
 resumo:'O Copom manteve a Selic em 13,75% ao ano na quarta (4), por unanimidade, e interrompeu o ciclo de cortes iniciado em março. O comitê citou inflação e expectativas em alta, desaceleração da atividade e cenário externo adverso. Com juro real de 8,45%, o Brasil lidera um ranking de 40 países.',
 fundo:[
  ['p','O Comitê de Política Monetária do Banco Central manteve a taxa básica de juros em 13,75% ao ano na quarta-feira (4), em decisão unânime, na primeira reunião depois da reeleição do presidente Lula. A pausa interrompe o ciclo de cortes iniciado em março, que Metrópoles e O Globo contam como cinco reduções seguidas. O mercado já esperava a manutenção.'],
  ['p','No comunicado, o comitê descreve um cenário que exige “serenidade e cautela”: aumento significativo das incertezas em torno do cenário-base, expectativas de inflação mais elevadas e desaceleração mais acentuada da atividade doméstica. O Copom diz acompanhar com atenção a desancoragem das expectativas de prazos mais longos, que encarece o processo de desinflação, e classifica a Selic atual como “substancialmente contracionista”.'],
  ['nums',[
   ['13,75%','Selic ao ano, mantida por unanimidade'],
   ['8,45%','juro real do Brasil, o maior de um ranking de 40 países; a Rússia aparece em segundo, com 6,79%'],
   ['5,22% e 4,76%','expectativas do Focus para a inflação de 2026 e 2027, para uma meta de 3%'],
   ['3,5%','projeção do BC para o 2º trimestre de 2028, acima dos 3,4% anteriores']]],
  ['h','Por que o BC parou'],
  ['p','O comunicado aponta quatro fatores. No cenário externo, o prolongamento dos conflitos no Oriente Médio pressiona o petróleo e os derivados, e as economias avançadas mantêm política monetária mais restritiva, o que exige cautela dos emergentes. Na atividade, os indicadores desde setembro apontam moderação mais acentuada; o mercado de trabalho segue resiliente, com sinais de desaquecimento na margem.'],
  ['p','Na inflação, o comitê afirma que a inflação cheia e a média das medidas subjacentes aceleraram e ficaram acima do limite superior do intervalo de tolerância da meta, que é de 3%, com margem de 1,5 ponto para cima e para baixo. Nas expectativas, avalia que as projeções se distanciaram ainda mais da meta desde a reunião de setembro. O IPCA-15 de outubro desacelerou para 0,32%, ante 0,70% em setembro, com queda de passagens aéreas e energia elétrica, e acumula 4,62% em 12 meses, segundo O Tempo.'],
  ['h','O efeito da eleição'],
  ['p','O g1 registra que, depois de confirmada a vitória de Lula para o quarto mandato, o mercado elevou consideravelmente as projeções de inflação, reduziu as expectativas de crescimento e passou a prever juros mais altos. As estimativas para o dólar também subiram.'],
  ['p','No dia da decisão, o dólar comercial fechou a R$ 5,45, com queda de 0,64%, e o Ibovespa subiu, em movimento também ligado à eleição americana. O g1 aponta alta de 1,14% do índice em horário intradiário, e o Metrópoles, de 1,23% no fechamento. A Folha informa que o fluxo cambial de outubro teve entrada líquida de US$ 18,15 bilhões, o maior valor do ano. O petróleo caiu cerca de 9% com a expectativa de fim do conflito entre EUA e Irã, segundo O Globo.'],
  ['h','O debate sobre os juros'],
  ['p','A indústria avalia que a manutenção dos juros em patamar tão alto é injustificável, segundo o Metrópoles. Na Folha, a colunista Adriana Fernandes escreve que a cruzada contra juros altos não muda a necessidade de ajuste fiscal. No Metrópoles, Reinaldo Azevedo compara o debate sobre juros a um dogma e cita o economista Lara Resende como o “herege” do cenário.'],
  ['p','Outros indicadores do dia: o Caged contabilizou 121 mil vagas formais em setembro, e a procura por crédito cresceu 49,56% no mês, segundo levantamento de CNDL e SPC. O Brasil 247 destaca a declaração do presidente do Santander, para quem Lula deu “demonstrações importantíssimas de confiança para os mercados”.'],
  ['h','Nesta quinta (5)'],
  ['p','Segundo o InfoMoney, o Ibovespa interrompeu a sequência de quedas registrada desde a reeleição de Lula e fechou em alta na quarta. O Money Times relata que entidades da indústria e do comércio criticaram a manutenção dos juros, apontando efeitos sobre atividade, crédito e investimentos, e que o deputado Lindbergh Farias (PT-RJ) também criticou a decisão. Na agenda de hoje, o IBGE divulga às 9h a Pesquisa Industrial Mensal de setembro, com projeção de queda de 0,1% na comparação mensal.'],
  ['h','O que vem a seguir'],
  ['p','O pronunciamento de Lula, gravado nesta quinta e previsto para domingo, deve tratar de responsabilidade fiscal. O Boletim Focus das próximas segundas-feiras mostrará se as expectativas para 2026 e 2027 recuam. Nas matérias consultadas, o comunicado não detalha sinais para a próxima reunião do Copom.']],
 fontes:[['Money Times (tempo real, 5/11)','https://www.moneytimes.com.br/tempo-real-5-11-26-lils-davs/'],['InfoMoney (agenda de 5/11)','https://www.infomoney.com.br/mercados/copom-industria-balancos-boe-agenda-05112026/'],['g1 (Copom)','https://g1.globo.com/economia/noticia/2026/11/04/copom-mantem-taxa-basica-de-juros-da-economia-em-1375percent-ao-ano.ghtml'],['O Tempo','https://www.otempo.com.br/economia/2026/11/4/copom-mantem-taxa-selic-em-13-75-e-interrompe-sequencia-de-cortes'],['Brasil 247 (Santander)','https://www.brasil247.com/economia/presidente-do-santander-diz-que-lula-deu-demonstracoes-importantissimas-de-confianca-para-os-mercados/'],['Metrópoles',''],['Folha de S.Paulo',''],['O Globo','']]};

S.seletivo = {ed:'economia', k:'Economia', hora:'4/11',
 t:'Governo publica MP do “imposto do pecado” e fixa alíquotas a partir de 2027',
 sub:'Cobrança começa em fevereiro, com transição até 2028. Cigarro, bebidas e carros pagam, e minérios ficam com alíquota zero.',
 dado:{n:'R$ 42 bi', l:'Arrecadação prevista com o Imposto Seletivo no PLOA 2027'},
 resumo:'A medida provisória publicada na quarta (4) fixa as alíquotas do Imposto Seletivo: 66,7% mais R$ 3,50 por maço para cigarros, 2,6% para bebidas açucaradas, 4,2% para cerveja e 8% para vinho. A cobrança começa em fevereiro de 2027, com regime de transição até o fim do ano, e a MP precisa ser votada em 120 dias.',
 fundo:[
  ['p','O governo publicou na quarta-feira (4) a medida provisória que define as alíquotas do Imposto Seletivo, tributo criado pela reforma tributária para incidir sobre bens e serviços considerados prejudiciais à saúde ou ao meio ambiente. A cobrança começa em fevereiro de 2027, e não em janeiro, por causa da noventena, e o regime de transição vai até 31 de dezembro do mesmo ano.'],
  ['nums',[
   ['66,7%','cigarros e cigarrilhas, mais R$ 3,50 por conjunto de 20 unidades'],
   ['2,6%','bebidas açucaradas'],
   ['4,2%','cerveja de malte; o vinho paga 8%'],
   ['6,3%','alíquota-base de carros de passeio, com ajustes'],
   ['0%','minerais extraídos, até 31/12/2027'],
   ['0,5%','concursos de prognósticos, como Mega-Sena e Lotofácil']]],
  ['h','Carros e exceções'],
  ['p','Para carros de passeio, a alíquota-base de 6,3% pode subir ou cair conforme cinco critérios: fonte de energia e tecnologia de propulsão, eficiência energética, potência, desempenho estrutural e tecnologias de assistência à direção, além da reciclabilidade. Há alíquota zero para algumas categorias, como veículos comprados por pessoas com deficiência ou com transtorno do espectro autista e por motoristas profissionais de aluguel, como taxistas, se cumpridas as condições da MP.'],
  ['p','Caminhões com peso bruto total igual ou superior a 3.500 kg, exceto picapes, ficam fora da incidência, assim como veículos, aeronaves e embarcações de características técnicas específicas usados pelas Forças Armadas e por órgãos de segurança pública.'],
  ['h','Apostas e mineração'],
  ['p','O texto não define alíquota para apostas. Uma MP de setembro proibiu apostas esportivas e jogos virtuais no país, tema que também está no STF. Para os minerais extraídos, a alíquota zero vale até o fim de 2027, e o modelo permanente fica para discussão legislativa específica.'],
  ['tl',[
   ['4/11','MP publicada. Passa a ter força de lei, com validade de 120 dias.'],
   ['Fev/27','Início da cobrança. A noventena impede começar em 1º de janeiro.'],
   ['31/05/27','Prazo para o Executivo enviar ao Congresso o projeto com as alíquotas permanentes.'],
   ['1º/1/28','Início das alíquotas permanentes, se aprovadas.']]],
  ['h','Dinheiro e discurso do governo'],
  ['p','O Projeto de Lei Orçamentária de 2027 prevê quase R$ 42 bilhões de arrecadação com o Imposto Seletivo. Eventuais diferenças serão compensadas por ajustes na alíquota de referência da CBS, em sentido inverso, e o governo afirma que a MP não representa renúncia de receita.'],
  ['p','Na transição, as alíquotas de veículos, aeronaves, embarcações, fumígenos e bebidas alcoólicas e açucaradas equivalem às atuais alíquotas do IPI, depois de fatores de conversão. O objetivo declarado é manter o nível efetivo de tributação, sem aumento de carga nem perda de arrecadação. O governo também pretende propor uma PEC para prorrogar a incidência do IPI sobre os bens que migrarão para o Seletivo. O ministro da Fazenda, Dario Durigan, disse que a transição foi negociada com os setores afetados, que concordaram em manter a carga atual do IPI. A conversão exige ajustes porque o ICMS integra a base de cálculo do IPI.'],
  ['h','Por que só agora'],
  ['p','Segundo o Agenda do Poder, o governo adiou a edição da MP para depois do segundo turno, em 25 de outubro, por receio de desgaste na campanha. O prazo de 2 de outubro, que permitiria cobrar em janeiro, junto com a CBS, foi perdido, e por isso a cobrança só começa em fevereiro. Para valer, a medida precisa ser aprovada por Câmara e Senado em 120 dias, o que a coloca no meio da disputa pelas presidências das duas Casas.'],
  ['p','As matérias consultadas não registram a reação de setores como bebidas, fumo e montadoras.']],
 fontes:[['Agenda do Poder','https://agendadopoder.com.br/governo-publica-mp-do-imposto-do-pecado-e-preve-transicao-na-cobranca-ate-2028/'],['Brasil 247','https://www.brasil247.com/economia/mp-cria-regime-gradual-para-o-imposto-do-pecado-a-partir-de-fevereiro-de-2027/'],['Plantão Brasil','https://www.plantaobrasil.net/noticias/161872-governo-lula-define-aliquotas-do-imposto-seletivo-para-2027-e-zera-taxa-sobre-minerios'],['g1',''],['Metrópoles','']]};

S.paes = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'4/11',
 t:'Paes acusa campanha de Ruas de fraude e insiste em segundo turno no Rio',
 sub:'Ex-prefeito cita 204 mil votos perdidos no número 13, e a coligação pede ao TRE-RJ a cassação da chapa. O PL fala em abuso de poder político.',
 dado:{n:'50,88%', l:'Douglas Ruas depois da anulação dos votos de Garotinho · antes, 49,27%'},
 resumo:'Eduardo Paes (PSD) voltou a questionar a eleição no Rio. Ele diz que panfletos ligaram seu nome ao 13 e que 204 mil eleitores perderam o voto ao digitar o número. A coligação pediu ao TRE-RJ a cassação da chapa de Douglas Ruas (PL), eleito no primeiro turno depois da anulação dos votos de Garotinho, e o PSD pede segundo turno ao STF.',
 fundo:[
  ['p','O ex-prefeito Eduardo Paes (PSD) voltou a questionar o resultado da eleição para o governo do Rio. Em vídeo publicado na quarta-feira (4), ele acusou a campanha do governador eleito, Douglas Ruas (PL), de espalhar panfletos que associavam seu nome ao número 13, do PT, e ao 22, do PL, e de divulgar informações falsas sobre aborto, drogas e valores cristãos. Segundo Paes, 204 mil eleitores digitaram 13 para governador e perderam o voto, porque nenhum candidato tinha esse número. Ele disputou com o 55.'],
  ['p','No mesmo dia, a coligação de Paes pediu ao Tribunal Regional Eleitoral do Rio a cassação da chapa de Ruas e da vice, Fernanda Louback, e a inelegibilidade dos dois por oito anos. O PSD também pede ao Supremo Tribunal Federal, na ADPF 1362, a realização de um segundo turno. O relator, Cristiano Zanin, recebeu Ruas na terça-feira (3). O PL, por sua vez, acusa Paes de abuso de poder político durante a eleição.'],
  ['h','Como se chegou aqui'],
  ['p','O primeiro turno foi em 4 de outubro. Ruas teve 49,27% dos votos válidos (4.270.934), Paes, 42,76% (3.706.901), e Anthony Garotinho (Republicanos), 3,17% (274.331). Em 8 de outubro, o TSE negou em definitivo o registro de Garotinho, que disputava sub judice, por 5 votos a 2, e anulou os votos dele. Com a nova base de cálculo da maioria absoluta, Ruas chegou a 50,88% e foi eleito no primeiro turno. O TRE-RJ confirmou o resultado em retotalização e proclamou o eleito em 16 de outubro, segundo O Povo.'],
  ['p','Paes reconheceu o resultado em 8 de outubro, disse que decisões judiciais devem ser respeitadas e criticou a anulação como contrária à vontade dos eleitores. Sua campanha pediu ao Supremo a suspensão da decisão do TSE, e Zanin negou o pedido, segundo a Agência Brasil. O presidente do TSE, Kassio Nunes Marques, informou ao STF que não havia condições técnicas para uma nova votação no Rio em 25 de outubro, data do segundo turno presidencial.'],
  ['tl',[
   ['4/10','Primeiro turno: Ruas 49,27%, Paes 42,76%, Garotinho 3,17%.'],
   ['8/10','TSE nega em definitivo o registro de Garotinho, por 5 a 2, e anula os votos. Ruas vai a 50,88%. Paes reconhece o resultado.'],
   ['16/10','TRE-RJ proclama Ruas eleito.'],
   ['3/11','Ruas se reúne com Zanin sobre a ADPF 1362.'],
   ['4/11','Paes publica o vídeo, e a coligação pede ao TRE-RJ a cassação da chapa.'],
   ['6/12','Última data que o TSE admite para eleição suplementar em 2026, se houver nova votação.']]],
  ['h','As acusações'],
  ['ul',[
   'Panfletos que associavam Paes ao 13 e Ruas ao 22. Segundo Paes, isso “não acontece por acaso”.',
   'Informações falsas sobre aborto, drogas e valores cristãos, que Paes diz que a campanha sabia serem mentiras.',
   'Santinhos com a foto de Paes e o número 22 que circularam no dia da votação, sem CNPJ ou identificação da gráfica. Fiscais do TRE-RJ os apreenderam.',
   'Compra de votos, com relatos de pagamentos de R$ 50 a R$ 200 em redes sociais, segundo a petição ao TRE-RJ, que pede dados de mais de 60 perfis.']],
  ['h','Os pedidos à Justiça'],
  ['p','No TRE-RJ, a ação de investigação judicial eleitoral (processo 0605082-18.2026.6.19.0000) aponta abuso de poder econômico, uso indevido dos meios de comunicação e captação ilícita de votos, e pede a anulação dos votos de Ruas e da vice. A defesa de Paes diz ter notas fiscais de 1,1 milhão de exemplares do panfleto “Rio Escolhe”. Tudo isso é alegação da coligação, e nada foi julgado. A reportagem do Tempo Real RJ não traz resposta da campanha de Ruas ou do PL.'],
  ['p','No vídeo, Paes fala em 500 mil panfletos impressos dois dias antes da votação, somados a 100 mil encomendados em setembro. A petição, segundo o Conjur, cita 1,1 milhão de exemplares do “Rio Escolhe”, além de outro panfleto com mais de 100 mil unidades. As contas não foram conciliadas nas reportagens consultadas.'],
  ['p','No Supremo, o PSD questiona a decisão do TSE que confirmou a vitória de Ruas. Para o colunista Reinaldo Azevedo, do Metrópoles, a Constituição exigiria o segundo turno porque ninguém teria alcançado a maioria dos votos, tese que Paes também defende, segundo a Jovem Pan. Revista Oeste e A Crítica haviam registrado que o ex-prefeito admitira a derrota em outubro, o que torna a disputa de novembro uma reabertura do caso.'],
  ['h','O que vem a seguir'],
  ['p','Estão pendentes a decisão de Zanin sobre a ADPF 1362 e o prazo de 6 de dezembro para eventual votação suplementar, a admissão da ação no TRE-RJ e a resposta formal de Ruas e do PL, que as matérias consultadas ainda não registram.']],
 fontes:[['Tempo Real RJ','https://temporealrj.com/eleicoes-paes-acusa-campanha-ruas-fraude-eleitoral/'],['Conjur','https://conjur.com.br/2026-nov-04/eduardo-paes-pede-cassacao-de-douglas-ruas-por-panfletos-falsos-e-compra-de-votos/'],['Gazeta do Povo','https://www.gazetadopovo.com.br/republica/douglas-ruas-se-reune-com-zanin-para-tratar-de-acao-que-pede-segundo-turno-no-rio-de-janeiro/'],['Agência Brasil','https://agenciabrasil.ebc.com.br/justica/noticia/2026-10/zanin-nega-pedido-feito-por-paes-de-determinar-segundo-turno-no-rio'],['O Povo','https://mais.opovo.com.br/jornal/farol/2026/10/16/tre-rj-proclama-douglas-ruas-eleito-para-o-governo-do-rio.html'],['A Crítica','https://acritica.net/eleicoes-2026/paes-reconhece-fim-da-disputa-no-rio-apos-decisoes-do-tse-e-do-stf/'],['Jovem Pan','https://jovempan.com.br/politica/paes-defende-2o-turno-no-rj-ninguem-alcancou-a-maioria/']]};


S.guandu = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'4/11',
 t:'Cedae religa o Guandu depois de atraso de concessionárias; abastecimento normaliza até sexta',
 sub:'Manutenção anual terminou na terça à noite, mas a retomada só começou na manhã de quarta. Praça Seca é a última área a voltar ao normal.',
 resumo:'A Cedae religou o Sistema Guandu na quarta (4), depois de atraso na autorização das concessionárias. A manutenção anual terminou às 23h30 de terça. O abastecimento já voltou ao Centro e às zonas Norte e Sul, e a normalização completa é esperada até sexta (6). A Praça Seca aguarda a instalação de um macromedidor.',
 fundo:[
  ['p','A Cedae religou na quarta-feira (4) o Sistema Guandu, principal fonte de água do Rio e de parte da Baixada Fluminense, depois de a manutenção anual da Estação de Tratamento terminar às 23h30 de terça (3). A retomada só começou na manhã seguinte, e às 7h20 o sistema operava com 19% da capacidade. A companhia atribuiu o intervalo ao tempo que as concessionárias de distribuição levaram para autorizar o religamento.'],
  ['p','Iguá e Rio+Saneamento deram o aval primeiro. A Águas do Rio foi a última a autorizar e disse que liberou a retomada, mas ainda instalava um macromedidor na Praça Seca, na Zona Oeste, que vai medir o volume de água transportado por uma adutora que abastece a região. O fornecimento já foi retomado no Centro e nas zonas Norte e Sul, e na Praça Seca a normalização era esperada para o fim da tarde de quarta. A Cedae prevê normalização total até sexta-feira (6).'],
  ['p','A Estação do Guandu abastece o Rio e os municípios de Belford Roxo, Duque de Caxias, Mesquita, Nilópolis, Nova Iguaçu, Queimados e São João de Meriti, atendendo cerca de 9 milhões de pessoas, segundo a legenda de uma foto do Tempo Real RJ, que não informa se o número é estimativa oficial. A manutenção é feita todos os anos para preparar o sistema para a maior demanda do verão.'],
  ['p','As reportagens consultadas não explicam o que causou a demora na autorização nem por quanto tempo a Praça Seca ficará sem abastecimento normal.']],
 fontes:[['Tempo Real RJ','https://temporealrj.com/cedae-religa-sistema-guandu/']]};

S.novoguandu = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'4/11',
 t:'Empresas sob auditoria na Cedae participaram de etapas do Novo Guandu, obra de R$ 1,35 bilhão',
 sub:'Auditoria do governo tem 180 dias e pode levar achados ao Ministério Público. Empresas ligadas a investigações têm contratos na obra.',
 resumo:'Empresas sob auditoria de contratos da Cedae participaram de etapas do Novo Guandu, estação de R$ 1,35 bilhão em Nova Iguaçu. A Construverde tem oito contratos de cerca de R$ 427 milhões, e a Engeconsult aparece na Operação Ouroboros e nega irregularidades. A reportagem não aponta irregularidade nos contratos da obra.',
 fundo:[
  ['p','Empresas que já são alvo de auditorias e investigações participaram de etapas do Novo Guandu, estação de tratamento de água em construção em Nova Iguaçu, na Baixada Fluminense, que custará R$ 1,35 bilhão e é a peça central de um complexo de produção e distribuição de água estimado em R$ 2,1 bilhões. As obras começaram na semana da reportagem do Tempo Real RJ, 12 anos depois de o projeto ser anunciado.'],
  ['p','O governo do estado formalizou em julho, por resolução conjunta do Gabinete de Segurança Institucional, da Casa Civil e da própria Cedae, uma auditoria de contratos da companhia, com prazo de 180 dias. Se houver indícios de crime, os achados serão encaminhados ao Ministério Público e à Polícia Civil.'],
  ['h','As empresas'],
  ['p','A Construverde Construções e Serviços foi contratada pela Cedae em 2022 para os serviços iniciais no terreno de mais de 390 mil metros quadrados, entre terraplenagem, macrodrenagem e cerca de 4 quilômetros de muro de proteção. A empresa tem oito contratos com a Cedae, num total de cerca de R$ 427 milhões, e quatro deles, assinados entre 2021 e 2025 e somando mais de R$ 355 milhões, estão na auditoria. Eles tratam de terraplenagem, remanejamento de tubulações perto da Fundação Casa de Rui Barbosa, em Botafogo, e fornecimento de água por caminhões-pipa.'],
  ['p','A Cedae aplicou à Construverde multas administrativas que somam cerca de R$ 400 mil, e a empresa seguiu recebendo contratos. Separadamente, o Ministério Público do Rio investiga um suposto sobrepreço de R$ 30 milhões num contrato de R$ 71 milhões com o Departamento de Estradas de Rodagem, assinado em 2023. A reportagem registra ainda que, em 2023, um contrato emergencial de abastecimento com a Cedae habilitou a empresa um dia depois de assinado. A resposta da Construverde não é informada.'],
  ['p','A Engeconsult foi contratada em 2021, por R$ 22,3 milhões, para gerenciar e supervisionar o programa Novo Guandu, e dez aditivos elevaram o valor a R$ 29,6 milhões. A empresa é citada na Operação Ouroboros, investigação do Ministério Público sobre suposta corrupção e fraude em contratos com o Instituto Rio Metrópole. Segundo a reportagem, convênios com o instituto teriam sido usados para desviar recursos públicos, e uma auditoria do governo mostrou que um acordo entre a Engeconsult e o instituto passou de cerca de R$ 20 milhões para quase R$ 60 milhões. A empresa nega irregularidades e diz estar à disposição das autoridades.'],
  ['h','Quem decide'],
  ['p','O contrato da Engeconsult é acompanhado pela Diretoria Técnica e de Projetos da Cedae, comandada por Humberto de Mello Filho, que autorizou em abril uma transferência de R$ 30 milhões ao Instituto Rio Metrópole, dois meses antes da Operação Ouroboros. Ele ocupa cargos de chefia de engenharia na companhia desde 2015. A reportagem não diz que ele seja acusado de irregularidade.'],
  ['p','Pelos números do Ministério Público, o esquema investigado na Ouroboros movimentaria R$ 86,28 milhões, e 11 pessoas foram denunciadas por organização criminosa, corrupção passiva e lavagem de dinheiro. O ponto central da reportagem é a presença, no principal projeto de água do estado, de empresas que já estão sob escrutínio dos órgãos de controle. A reportagem não aponta irregularidade nos contratos do Novo Guandu em si.']],
 fontes:[['Tempo Real RJ','https://temporealrj.com/empresas-auditoria-cedae-etapas-do-novo-guandu/']]};

S.pj = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'4/11',
 t:'Sindicato denuncia troca de médicos CLT por PJ na rede municipal de saúde do Rio',
 sub:'Prefeitura diz que a contratação de PJ preenche vagas abertas e que o custo é equivalente ao da CLT.',
 resumo:'O Sindicato dos Médicos (SinMed-RJ) denuncia que a Secretaria Municipal de Saúde autorizou organizações sociais a trocar contratos CLT por PJ em unidades como a CER do Leblon e as maternidades Maria Amélia e Alexander Fleming. A vereadora Maíra do MST cobra explicações. A secretaria diz que a contratação PJ visa suprir vagas abertas.',
 fundo:[
  ['p','Profissionais da rede municipal de saúde do Rio denunciam a substituição de contratos com carteira assinada por vínculos de pessoa jurídica. Segundo o Sindicato dos Médicos (SinMed-RJ), a Secretaria Municipal de Saúde autorizou as organizações sociais que administram unidades a fazer a troca, e o próprio secretário, Rodrigo Prado, teria confirmado a autorização em reunião com a entidade. O presidente do sindicato, Alexandre Telles, afirma que a mudança aconteceu sem aviso prévio.'],
  ['p','A vereadora Maíra do MST (PT) enviou ofício ao secretário na quarta-feira (4) pedindo explicações. Ela diz que o gabinete recebe reclamações de trabalhadores sobre mudanças de contratação, demissões de equipes e mobilizações contra a chamada pejotização, e pergunta quais razões jurídicas justificam a substituição dos vínculos nas três unidades, que, segundo ela, pode precarizar as relações de trabalho.'],
  ['h','As três unidades'],
  ['ul',[
   'CER do Leblon, na Zona Sul, administrada pelo Centro de Estudos e Pesquisas Científicas Francisco Antônio de Salles: intensivistas teriam recebido determinação de demissão para dar lugar a profissionais que atuem apenas como pessoa jurídica, segundo o sindicato, que diz que a medida levou à saída de médicos com mais de dez anos de casa.',
   'Maternidade Maria Amélia Buarque de Hollanda, no Centro, gerida pela SPDM: a organização anunciou vagas para PJ em meio à greve de obstetras e pediatras, que dura mais de três meses. As profissionais pedem reajuste e dizem que a SPDM fez dezenas de contratações emergenciais com remuneração até 70% superior à das médicas que já trabalhavam na unidade.',
   'Maternidade Alexander Fleming, em Marechal Hermes, administrada pelo Instituto de Gestão e Desenvolvimento Social: os profissionais questionam a transição dos modelos e apontam indícios de tentativas indiretas de implantar o regime de pessoa jurídica.']],
  ['h','Os argumentos'],
  ['p','Para Telles, a pejotização retira direitos trabalhistas dos médicos e ameaça a continuidade e a qualidade do atendimento, porque a troca constante de profissionais prejudica a assistência. Ele afirma que os médicos da rede estão sem reajuste salarial desde 2018 e que a mudança pode aumentar a rotatividade.'],
  ['p','Em nota sobre o caso da Maria Amélia, enviada na semana passada, a secretaria disse que negocia com os profissionais e que a contratação via PJ “visa suprir vagas que estão abertas e não substituir a força de trabalho atual”, e que o custo é equivalente ao do profissional CLT, que tem direitos assegurados além dos encargos pagos pela gestão. Na quarta, em resposta ao Tempo Real RJ, a pasta repetiu que as contratações PJ preenchem vagas em aberto, de forma complementar às equipes, e que a medida garante a cobertura das escalas e atende à demanda.'],
  ['p','Sindicato e vereadora falam em substituição de vínculos e em demissões, e a secretaria fala em complemento. A nota da pasta não responde, nas matérias consultadas, se houve demissões de celetistas nas três unidades. Também não consta se o caso chegou ao Ministério Público ou à Justiça do Trabalho.']],
 fontes:[['Tempo Real RJ','https://temporealrj.com/']]};

S.prefeitura = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'4/11',
 t:'Prefeitura do Rio remaneja R$ 43,3 milhões para pagar dívida; vereador do PL critica cortes sociais',
 sub:'Verbas saem de assistência social, conservação, trânsito, Guarda Municipal e outras áreas.',
 resumo:'A Prefeitura do Rio remanejou R$ 43,3 milhões de várias secretarias para reforçar o pagamento da dívida interna. Quase R$ 10 milhões saem da assistência social. O vereador Fernando Armelau (PL) fala em “clara inversão de prioridades”. A reportagem não traz resposta da prefeitura nem o valor da dívida.',
 fundo:[
  ['p','A Prefeitura do Rio remanejou R$ 43,3 milhões do orçamento de várias secretarias e órgãos para reforçar o pagamento da dívida interna do município. O remanejamento foi feito por decreto publicado no Diário Oficial. A reportagem do Tempo Real RJ descreve o movimento como rotineiro, sobretudo nos últimos meses do ano, quando recursos não utilizados são levados para áreas que precisam deles, e diz que isso não significa necessariamente a paralisação de serviços ou projetos.'],
  ['h','De onde sai o dinheiro'],
  ['ul',[
   'Assistência social: quase R$ 10 milhões, sendo R$ 5,7 milhões da Proteção Social Básica e R$ 4,1 milhões da reorganização da rede de acolhimento de pessoas em situação de rua e famílias vulneráveis.',
   'Conservação e infraestrutura: mais de R$ 7,8 milhões, dos quais R$ 7,6 milhões da revitalização de espaços públicos, como praças e parques.',
   'Trânsito e sinalização semafórica: R$ 8,5 milhões.',
   'Integração Metropolitana, que toca o programa Embaixadas Cariocas: R$ 6,9 milhões.',
   'Guarda Municipal: R$ 2,2 milhões de apoio operacional.',
   'Riotur: R$ 2,3 milhões ligados ao Carnaval.',
   'Trabalho e Economia Solidária: R$ 1,5 milhão de programas de empregabilidade e geração de renda.',
   'Cultura: R$ 1 milhão da revitalização do Centro.',
   'Cortes menores atingem ações de prevenção à violência contra a mulher, inclusão de pessoas com deficiência, creches institucionais e mecanismos de transparência.']],
  ['h','A crítica da oposição'],
  ['p','O vereador Fernando Armelau (PL), do maior bloco de oposição na Câmara Municipal, criticou o remanejamento. Para ele, é inaceitável que a cidade sacrifique serviços essenciais e a proteção de pessoas vulneráveis para cobrir dificuldades financeiras. Cortar verbas de assistência social, segurança e conservação para pagar dívida, disse, mostra “uma clara inversão de prioridades”.'],
  ['p','A reportagem não informa o tamanho da dívida nem sua origem, não traz resposta da prefeitura e não detalha como os cortes afetarão serviços específicos. O texto cita um decreto publicado em uma quinta-feira, dia 20, sem esclarecer a data exata do ato.']],
 fontes:[['Tempo Real RJ','https://temporealrj.com/prefeitura-do-rio-remaneja-433-milhoes-para-divida/']]};

S.light = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'4/11',
 t:'Polícia Civil investiga 25 funcionários da Light por furto de cabos de cobre',
 sub:'Operação Blackout cumpriu sete mandados de busca em quatro cidades. Veículos da empresa foram a um ferro-velho 37 vezes em pouco mais de um mês.',
 resumo:'A Polícia Civil do Rio investiga 25 funcionários da Light suspeitos de furtar cabos de cobre. A Operação Blackout cumpriu sete mandados de busca nesta quarta (4) em Magé, Nova Iguaçu, São Gonçalo e no Rio. Segundo a polícia, 16 veículos da empresa foram 37 vezes a um ferro-velho no Caju sem ordem de serviço.',
 fundo:[
  ['p','A Polícia Civil do Rio deflagrou na manhã desta quarta-feira (4) a Operação Blackout e cumpriu sete mandados de busca e apreensão em casas de funcionários da Light suspeitos de furtar cabos. Os endereços ficam em Magé, Nova Iguaçu, São Gonçalo e na capital, incluindo Bangu, Oswaldo Cruz, Guadalupe e Caju. Desde a atualização anterior da investigação, 25 funcionários da concessionária de energia estão sob apuração, segundo a reportagem do Tempo Real RJ, que credita as informações ao g1.'],
  ['h','Como o caso começou'],
  ['p','A investigação teve origem em um flagrante em abril, na Rua da Passagem, em Botafogo. Um veículo da Light estava no local, e os técnicos puxaram cabos da rede, o que cortou a energia da área. Segundo a Light, foram levados cerca de 500 metros de cobre, com prejuízo de aproximadamente R$ 80 mil. Dados de rastreamento mostraram que o mesmo veículo seguiu para um ferro-velho em Parque Boa Esperança, no Caju, que, segundo a polícia, é suspeito de receber o material.'],
  ['h','O padrão de viagens'],
  ['p','A polícia diz que 16 veículos da Coordenação de Operações Centro-Sul da Light foram ao ferro-velho 37 vezes entre 12 de abril e 19 de maio. Segundo os investigadores, nenhuma dessas viagens tinha ordem de serviço ou justificativa operacional. A suspeita é que os deslocamentos estejam ligados a outros furtos que somam mais de 2 quilômetros de cabos de cobre.'],
  ['p','A reportagem não informa se há acusações formais ou prisões, e não traz a defesa dos suspeitos nem uma resposta detalhada da Light além dos números citados.']],
 fontes:[['Tempo Real RJ (com informações do g1)','https://temporealrj.com/policia-civil-funcionarios-light-furto-cabos/']]};

S.reis = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'4/11',
 t:'STF retoma julgamento de recurso de Washington Reis por crime ambiental',
 sub:'Placar estava em 4 a 1 pela manutenção da condenação do ex-prefeito de Duque de Caxias, antes do pedido de vista de Fux.',
 resumo:'O STF retomou na quarta (4), a partir das 14h, o julgamento do recurso do ex-prefeito de Duque de Caxias Washington Reis (MDB) contra condenação por dano ambiental. O placar estava em 4 a 1 pela manutenção, quando Fux pediu vista, em fevereiro. Faltam os votos de Fux, Nunes Marques, Fachin e Cármen Lúcia.',
 fundo:[
  ['p','O Supremo Tribunal Federal retomou na quarta-feira (4), em sessão marcada para as 14h, o julgamento do recurso que contesta a condenação do ex-prefeito de Duque de Caxias Washington Reis (MDB) por crime ambiental. A Segunda Turma já o havia condenado pelo loteamento Vila Verde, desenvolvido entre 2005 e 2009 na zona de amortecimento da Reserva Biológica do Tinguá. A defesa argumenta que a conduta deixou de ser crime depois de mudanças de 2010 nas regras do Conama, que reduziram a zona de amortecimento de 10 para 3 quilômetros.'],
  ['p','A análise foi suspensa em fevereiro, quando o ministro Luiz Fux pediu vista, com o placar em 4 a 1 pela manutenção da condenação. O relator, Flávio Dino, votou por manter a condenação integral, e Cristiano Zanin, Alexandre de Moraes e Gilmar Mendes o acompanharam. André Mendonça divergiu em parte e votou por absolver o réu dos crimes ambientais. Dias Toffoli não participa, por ter se declarado suspeito.'],
  ['p','Os votos de Fux, Kassio Nunes Marques, Edson Fachin e Cármen Lúcia vão definir se a condenação será mantida integralmente, reduzida ou anulada. A reportagem do Tempo Real RJ não descreve as penas nem as consequências políticas para Reis, e as matérias consultadas não trazem o resultado da sessão.']],
 fontes:[['Tempo Real RJ','https://temporealrj.com/stf-retoma-nesta-quarta-04-washington-reis/']]};

S.eua = {ed:'mundo', k:'Mundo', hora:'5/11',
 t:'Democratas vencem as eleições de meio de mandato, e Trump admite que a guerra pesou',
 sub:'Partido conquista as duas Casas do Congresso. O presidente da Câmara, Mike Johnson, vai deixar o cargo.',
 dado:{n:'54 × 44', l:'Senado: democratas e republicanos, com 2 vagas em disputa · Folha, 00h28 de 5/11'},
 resumo:'Os democratas conquistaram o controle da Câmara e do Senado nas eleições de 3 de novembro, segundo o g1. Trump disse ser “majoritariamente verdadeiro” que a guerra do Irã pesou na derrota, mas afirmou que faria tudo de novo. O presidente da Câmara, Mike Johnson, vai deixar o comando da Casa.',
 fundo:[
  ['p','Os democratas conquistaram o controle das duas Casas do Congresso americano nas eleições de meio de mandato de 3 de novembro, segundo o g1. A apuração ainda corria em alguns estados, como Mississippi e Colorado, e em Maine e Alasca cadeiras ocupadas por republicanos podiam ser conquistadas pelos democratas. Na contagem da Folha, às 00h28 desta quinta (5), o Senado estava em 54 democratas a 44 republicanos, com duas vagas em disputa.'],
  ['nums',[
   ['54 × 44','Senado, democratas e republicanos, com 2 em disputa (Folha, 00h28)'],
   ['240 × 147','Câmara, democratas e republicanos, apuração em andamento (Folha)'],
   ['28','estados governados por democratas, no mínimo (g1)'],
   ['69%','dos eleitores latinos votaram em democratas (Metrópoles)']]],
  ['p','As contagens variam por fonte e horário: em horário anterior, o Metrópoles registrava 22 a 12 nos 36 estados que escolheram governador, enquanto o g1 fala em democratas governando ao menos 28 estados. Segundo o Metrópoles, cinco estados antes republicanos passaram aos democratas: Geórgia, Iowa, Texas, Ohio e Nevada. A Folha destaca o recorde de governadoras, com 17 estados chefiados por mulheres a partir de 2027, ou 34% do total, e diz que a Câmara pode ter a maior presença feminina da história.'],
  ['h','A reação de Trump'],
  ['p','Em entrevista na quarta (4), Trump disse ser “majoritariamente verdadeiro” que os republicanos perderam por causa da guerra contra o Irã, porque o preço da gasolina subiu no curto prazo, mas defendeu a ofensiva e afirmou que faria tudo de novo, porque o Irã não pode ter uma arma nuclear. Afirmou ainda que o partido teria ido melhor se o nome dele estivesse na cédula e que o apoio dos comícios não se transferiu aos candidatos.'],
  ['p','Sobre o Congresso, Trump disse que deve se dar bem com os democratas, a menos que eles queiram ser destrutivos, e que tem poder de veto sobre o que for aprovado. O vice, JD Vance, também atribuiu a derrota à guerra e afirmou que pesquisas internas mostram eleitores de 2024 migrando para os democratas.'],
  ['h','A Câmara sem Johnson'],
  ['p','O presidente da Câmara, Mike Johnson, de 54 anos, vai deixar o comando da Casa. Ele comunicou a decisão à equipe na manhã de quarta, e o porta-voz confirmou à AFP com uma palavra: “Correto”. Johnson preside a Câmara desde outubro de 2023, quando chegou como candidato de consenso depois da destituição de Kevin McCarthy. Trump o elogiou e disse que não vai interferir na escolha do sucessor. A votação interna republicana está marcada para terça (10), e Steve Scalise e Jim Jordan, presidente da Comissão de Justiça, são os nomes citados.'],
  ['h','Ineditismos'],
  ['p','Segundo o g1 e o Jornal Nacional, a eleição trouxe o primeiro senador muçulmano, a primeira senadora indígena, o primeiro senador gay e a primeira governadora negra. Sete brasileiros foram eleitos deputados estaduais, todos democratas, segundo Metrópoles e g1.'],
  ['h','Efeito no Brasil'],
  ['p','No mercado, o dólar fechou a R$ 5,45, em queda de 0,64%, e o Ibovespa subiu. O petróleo caiu cerca de 9% com a expectativa de fim do conflito entre EUA e Irã, segundo O Globo. A Folha diz que a vitória democrata pode favorecer emergentes, mas que o efeito depende do cenário fiscal de cada país.'],
  ['p','Na política, a Folha registra celebração de lulistas e crítica do deputado Nikolas Ferreira à primeira-dama, Janja, e o Metrópoles traz um democrata que agradeceu ao Brasil por “mostrar o caminho”. O Itamaraty evita comentar a derrota de Trump, segundo a coluna de Matheus Leitão. O g1 informa que o empresário Elon Musk perdeu mais de R$ 200 bilhões em valor de mercado depois da derrota de aliados de Trump.'],
  ['h','O que vem a seguir'],
  ['p','A eleição interna republicana de terça (10), o fechamento das contagens em Maine, Alasca, Mississippi e Colorado e o uso do veto por Trump são os pontos a acompanhar. Trump já havia dito que a guerra com o Irã terminaria depois das eleições.']],
 fontes:[['g1 (Mike Johnson)','https://g1.globo.com/mundo/noticia/2026/11/04/presidente-da-camara-dos-representantes-decide-renunciar-apos-derrota-republicana.ghtml'],['Metrópoles (Trump)','https://www.metropoles.com/mundo/trump-culpa-guerra-pelo-tsunami-democrata-mas-diz-que-faria-novamente'],['Metrópoles (latinos)','https://www.metropoles.com/mundo/onda-azul-nos-eua-69-dos-eleitores-latinos-votaram-em-democratas'],['Yahoo News','https://www.yahoo.com/news/politics/live/midterms-2026-live-updates-election-day-voters-head-to-the-polls-as-democrats-look-to-flip-gop-control-of-the-house-and-senate-110000715.html'],['Folha de S.Paulo',''],['O Globo','']]};

/* Ordem na capa */

/* ---------- POLÍTICA (novas) ---------- */
S.fuga = {ed:'politica', k:'Política', hora:'5/11',
 t:'A rota de Flávio até Miami: saída na noite de 27 de outubro e aliados espalhados por ao menos quatro países',
 sub:'Reconstituição da Agência Pública e agências internacionais mostram o trajeto do senador, que chegou à Flórida em 28 de outubro, dois dias depois de ter o passaporte recolhido por ordem de Moraes.',
 dado:{n:'28/10', l:'Chegada de Flávio Bolsonaro e da família a Miami'},
 resumo:'Flávio Bolsonaro deixou o Brasil na noite de 27 de outubro e desembarcou em Miami no dia 28, com a família, segundo a Agência Pública e a cobertura internacional. A saída ocorreu depois de Alexandre de Moraes mandar recolher os passaportes do senador, no dia 26. A Pública mapeou ainda aliados de Jair Bolsonaro investigados que deixaram o país, a maioria nos Estados Unidos.',
 fundo:[
  ['p','O senador Flávio Bolsonaro (PL-RJ), derrotado por Lula no segundo turno de 25 de outubro, chegou a Miami, na Flórida, em 28 de outubro, acompanhado da família. A informação foi dada por agências internacionais, e a imprensa suíça registrou que ele “fugia do Brasil”, em reportagem do Le Temps. O senador deixou o país na noite do dia 27, conforme a reconstituição da Agência Pública, que apontou muita desinformação sobre o paradeiro dele nas horas anteriores.'],
  ['h','O que veio antes'],
  ['tl',[['26/10','O ministro Alexandre de Moraes, do STF, manda Flávio entregar os passaportes e proíbe a saída do país. No mesmo dia, o PL reconhece a vitória de Lula.'],['27/10','A Pública relata que a filha do senador faltou à escola por dois dias, em coincidência com o fim do prazo para entrega do passaporte. À noite, ele deixa o Brasil.'],['28/10','Flávio e a família desembarcam em Miami. De lá, o senador se diz o “verdadeiro presidente eleito”.']]],
  ['h','Aliados fora do país'],
  ['p','Outra reportagem da Pública, assinada por Maria Martha Bruno, mapeou aliados de Jair Bolsonaro investigados pela Justiça que deixaram o Brasil e se espalham por ao menos quatro países. A maioria está nos Estados Unidos.'],
  ['h','Reação no Brasil'],
  ['p','O presidente Lula chamou a viagem de vergonhosa, segundo a Gazeta do Povo. Deputados do PT pediram a prisão preventiva do senador e a inclusão do nome dele na difusão vermelha da Interpol. Na terça (3), Flávio votou por celular no Senado, de fora do país, e o voto é contestado por Randolfe Rodrigues (veja a matéria sobre o voto remoto).'],
  ['p','Os relatos sobre o trajeto exato diferem entre os veículos consultados. O Radar mantém o que consta nas reportagens citadas e atualiza a cronologia conforme houver confirmação oficial.']
 ],
 fontes:[['Agência Pública: a fuga de Flávio Bolsonaro','https://apublica.org/2026/10/em-fuga-flavio-bolsonaro-embarcou-da-argentina-rumo-ao-equador-e-ainda-nao-chegou-aos-eua/'],['Agência Pública: filha falta à escola','https://apublica.org/nota/filha-de-flavio-bolsonaro-falta-a-escola-ha-2-dias-em-meio-a-suspeita-de-fuga-do-senador/'],['Agência Pública: bolsonaristas fogem da Justiça','https://apublica.org/2026/10/flavio-bolsonaro-bolsonaristas-fogem-e-se-espalham-por-paises/'],['ITV News (agências)','https://www.itv.com/news/2026-10-28/defeated-brazilian-presidential-candidate-flvio-bolsonaro-and-his-family-arrive-in-miami'],['Le Temps (Suíça)','https://www.letemps.ch/articles/fuyant-le-bresil-flavio-bolsonaro-est-arrive-en-floride']]};

S.congresso = {ed:'politica', k:'Política', hora:'5/11',
 t:'PL vira a maior força do Congresso, Motta reúne 15 partidos e Lula terá de negociar com o centrão',
 sub:'O PL elegeu 121 deputados e chegará a 28 senadores. Os aliados do governo somam 124 deputados e 16 senadores. As Mesas serão eleitas em fevereiro de 2027.',
 dado:{n:'121', l:'Deputados do PL na próxima legislatura, a maior bancada da Câmara'},
 resumo:'O PL fez 121 deputados e terá 28 senadores, a maior bancada partidária do Senado desde 1988. Os aliados de Lula têm 124 deputados e 16 senadores. Hugo Motta (Republicanos-PB) já reúne 15 partidos, do PT ao centrão, para continuar na presidência da Câmara, e o PL ainda decide se lança candidato próprio.',
 fundo:[
  ['p','A eleição de outubro redesenhou o Congresso. O PL passou de 98 para 121 deputados e elegeu 19 dos 54 senadores em disputa, chegando a 28 cadeiras de 81, segundo o Correio da Manhã. É a maior bancada partidária do Senado no início de uma legislatura desde a Constituição de 1988. Pela contagem do O Povo, os aliados de Lula ficam com 124 deputados e 16 senadores, e União Brasil/PP, Republicanos, MDB, Podemos e Novo podem ampliar o bloco de oposição.'],
  ['nums',[['121','deputados do PL, ante 98 hoje'],['28','senadores do PL em 2027'],['124','deputados aliados de Lula'],['41','votos para presidir o Senado']]],
  ['h','Câmara: Motta reúne 15 partidos'],
  ['p','Segundo a Gazeta do Povo, Hugo Motta (Republicanos-PB) tem o apoio declarado de 15 legendas: PT, PCdoB, PV, Republicanos, PSD, MDB, Podemos, PSB, PDT e as federações União Brasil-PP, PSDB-Cidadania e Solidariedade-PRD. O PL ainda não decidiu se lança candidato próprio, como o líder Sóstenes Cavalcante (PL-RJ), ou se negocia apoio em troca de espaço na Mesa e em comissões. A prioridade declarada do partido é o Senado.'],
  ['p','Motta enfrenta desgaste com a ala bolsonarista pela condução da anistia ao 8 de janeiro e pela aproximação com Lula, segundo o jornal.'],
  ['h','Senado: Marinho contra Alcolumbre'],
  ['p','No Senado, o PL deve lançar Rogério Marinho (PL-RN) contra Davi Alcolumbre (União-AP). O Correio da Manhã lembra que Alcolumbre teve revés no Amapá, onde o governador Clécio Luís (União) não se reelegeu e os candidatos do grupo dele não ficaram com as duas vagas ao Senado. Tereza Cristina (PP-MS) também aparece como nome possível.'],
  ['h','Leitura da imprensa estrangeira'],
  ['p','A The Economist avalia que a direita, com a maior bancada nas duas Casas, pode transformar Lula em um “pato manco” já no início do quarto mandato. A Reuters aponta possíveis dificuldades para aprovar indicações ao Banco Central, a agências reguladoras e ao Supremo.']
 ],
 fontes:[['Gazeta do Povo','https://www.gazetadopovo.com.br/republica/hugo-motta-acelera-acordos-para-manter-comando-da-camara-em-2027/'],['Correio da Manhã','https://www.correiodamanha.com.br/politica/2026/10/324784-avanco-do-pl-ameaca-reeleicao-de-motta-e-alcolumbre-em-2027.html'],['O Povo','https://mais.opovo.com.br/jornal/politica/2026/10/29/lula-4-o-que-o-presidente-ja-antecipou-e-qual-o-cenario-do-proximo-mandato.html'],['The Economist (via Gazeta do Povo)','https://www.gazetadopovo.com.br/mundo/revista-inglesa-diz-lula-pode-ser-pato-manco-quarto-mandato/'],['Reuters (via A Crítica)','https://acritica.net/eleicoes-2026/vitoria-de-lula-repercute-no-exterior-e-imprensa-destaca-virada-historica-nas-eleicoes/']]};

S.ldo = {ed:'politica', k:'Política', hora:'4/11',
 t:'Alcolumbre escolhe Eduardo Gomes, do PL, para relatar a LDO, e senadores do PL repensam impeachment de ministros do STF',
 sub:'A escolha amplia o poder da oposição sobre o Orçamento de 2027. No mesmo dia, o Brasil 247 diz que a ofensiva contra o Supremo enfrenta entraves políticos.',
 resumo:'O senador Eduardo Gomes (PL-TO), ex-líder do governo Jair Bolsonaro, foi escolhido por Davi Alcolumbre para relatar a Lei de Diretrizes Orçamentárias de 2027, segundo a Folha, citada pelo Brasil 247. Em outra frente, senadores do PL avaliam recuar do impeachment de ministros do STF, porque a eventual saída deles daria a Lula a indicação de sete das onze cadeiras.',
 fundo:[
  ['p','A Lei de Diretrizes Orçamentárias define metas fiscais, prioridades de investimento e parâmetros para o Orçamento do ano seguinte. Em 4 de novembro, o Brasil 247, citando a Folha de S.Paulo e duas fontes, informou que o presidente do Senado, Davi Alcolumbre (União-AP), escolheu o senador Eduardo Gomes (PL-TO) como relator da LDO de 2027.'],
  ['p','O relator conduz as negociações, analisa as propostas dos parlamentares e redige o parecer, que ainda passa pela Comissão Mista de Orçamento e pelo plenário do Congresso. A reportagem lembra que, em anos anteriores, o Legislativo usou a LDO para ampliar o controle sobre emendas, inclusive com calendários de pagamento, e avalia que um relator da oposição pode dificultar a vida do Executivo. A matéria não traz manifestação do governo.'],
  ['h','Ligação com a disputa pelo Senado'],
  ['p','Segundo o texto, a indicação está ligada à eleição para a presidência do Senado: o PL deve lançar Rogério Marinho (PL-RN) contra Alcolumbre, e a escolha de Gomes é lida como tentativa de aproximação com setores do partido.'],
  ['h','Impeachment no STF: freio estratégico'],
  ['p','Outra reportagem do Brasil 247, também de 4 de novembro, diz que senadores do PL repensam a ofensiva para afastar ministros do Supremo. O argumento é aritmético: se o Senado afastasse Alexandre de Moraes, Kassio Nunes Marques e Dias Toffoli, Lula indicaria os substitutos e, somadas às quatro vagas já previstas, preencheria sete das onze cadeiras. A matéria não nomeia os senadores e não informa a situação formal dos pedidos. Segundo articuladores conservadores ouvidos pelo site, as cassações devem ser contidas nos bastidores, enquanto as declarações públicas continuam.']
 ],
 fontes:[['Brasil 247: LDO','https://www.brasil247.com/brasil/alcolumbre-entrega-relatoria-da-ldo-a-senador-do-pl-e-amplia-poder-da-oposicao-sobre-orcamento/'],['Brasil 247: impeachment no STF','https://www.brasil247.com/poder/senadores-do-pl-repensam-impeachment-de-ministros-do-stf/'],['Folha de S.Paulo (citada pelo Brasil 247)','']]};

S.ministerio = {ed:'politica', k:'Política', hora:'5/11',
 t:'Lula monta o quarto mandato: Camilo na Casa Civil e Fonteles na Fazenda são cotados, e o STF ganha até quatro vagas',
 sub:'A equipe vale a partir de 2027. O presidente promete “entrar agora” na segurança e defende um Ministério da Segurança Pública se a PEC passar.',
 resumo:'Segundo o O Povo, o senador Camilo Santana (PT-CE) é o favorito para a Casa Civil, e o governador do Piauí, Rafael Fonteles, aparece entre os cotados para a Fazenda. Lula também poderá indicar até quatro ministros ao STF no mandato. A The Economist diz que ele precisará de um nome de peso na Fazenda e de um plano crível de corte de gastos.',
 fundo:[
  ['p','Passada uma semana da vitória de 25 de outubro, o desenho do novo governo começa a aparecer. De acordo com o O Povo+, de 29 de outubro, o senador Camilo Santana (PT-CE) é cotado para a Casa Civil e apontado como favorito, e o governador do Piauí, Rafael Fonteles (PT), está entre os nomes lembrados para a Fazenda. A nova equipe passa a valer em 2027, e os nomes seguem como especulação até o anúncio oficial.'],
  ['h','Prioridades já antecipadas'],
  ['ul',['Segurança: Lula disse que o governo federal vai “entrar agora” na área e defende um Ministério da Segurança Pública, caso a PEC da Segurança seja aprovada.','Educação: escola em tempo integral, expansão do Pé-de-Meia para o ensino superior e para o ensino técnico.','Saúde: continuidade do Farmácia Popular, com possível ampliação para exames, e do Agora Tem Especialistas.','Meio ambiente: desmatamento líquido zero até 2030 e cumprimento da nova meta climática, de redução de 59% a 67% das emissões até 2035.']],
  ['h','Supremo e Judiciário'],
  ['p','O presidente poderá indicar até quatro ministros ao STF: a vaga de Barroso e as de Fux, Cármen Lúcia e Gilmar Mendes, que completam 75 anos até 2030. No mandato atual, a indicação de Jorge Messias foi rejeitada pelo Senado.'],
  ['h','O recado do mercado'],
  ['p','A The Economist afirma que Lula precisaria nomear para a Fazenda alguém de peso, e não um colega de partido, e apresentar um plano crível de corte de gastos para acalmar o mercado. A revista lembra que a relação dívida/PIB subiu mais de dez pontos percentuais nos últimos quatro anos de governo Lula.'],
  ['p','A revista portuguesa Sábado lista como desafios a governabilidade sem maioria, a dívida acima de 80% do PIB, a segurança e a relação com os Estados Unidos.']
 ],
 fontes:[['O Povo+','https://mais.opovo.com.br/jornal/politica/2026/10/29/lula-4-o-que-o-presidente-ja-antecipou-e-qual-o-cenario-do-proximo-mandato.html'],['The Economist (via Gazeta do Povo)','https://www.gazetadopovo.com.br/mundo/revista-inglesa-diz-lula-pode-ser-pato-manco-quarto-mandato/'],['Sábado (Portugal)','https://www.sabado.pt/mundo/detalhe/do-congresso-de-direita-a-divida-publica-quais-os-maiores-desafios-de-lula-no-4-mandato']]};

S.desinfo = {ed:'politica', k:'Política', hora:'5/11',
 t:'Laboratório eleitoral da Pública: Meta restringiu mais conteúdo pró-Lula, e congressistas dos EUA cobram a empresa',
 sub:'Levantamento de outubro registrou mais de mil casos de restrições e banimentos. Bernie Sanders e outros 12 parlamentares questionam a Meta sobre interferência eleitoral no Brasil.',
 resumo:'Um levantamento do Laboratório de Investigação Eleitoral, que reúne Agência Pública, Aos Fatos, Núcleo e Amado Mundo, documentou mais de mil casos de restrições e banimentos na Meta em outubro, com mais conteúdos pró-Lula e progressistas afetados do que pró-Flávio. Em 27 de outubro, Bernie Sanders e 12 deputados dos EUA cobraram a empresa.',
 fundo:[
  ['p','O Laboratório de Investigação Eleitoral (LIE) é uma cobertura colaborativa de Agência Pública, Amado Mundo, Aos Fatos e Núcleo Jornalismo para monitorar redes e plataformas e investigar a desinformação nas eleições de 2026. Os números abaixo são do próprio laboratório.'],
  ['nums',[['+1.000','casos de restrições e banimentos na Meta em outubro'],['9,5 mil','processos sobre desinformação e propaganda digital no 1º turno, ante 3,4 mil em 2022'],['US$ 120 mil','em quase mil anúncios sobre Lula e Flávio pagos em dólar, sem rótulo político']]],
  ['h','Moderação na Meta'],
  ['p','Reportagem de Aline Melo, de 15 de outubro, aponta que o levantamento documentou mais de mil casos de restrições e banimentos e que foram afetados mais conteúdos pró-Lula e progressistas do que pró-Flávio. Em 27 de outubro, a mesma repórter relatou que o senador americano Bernie Sanders e outros 12 deputados questionaram a Meta sobre tratamento desigual e interferência eleitoral no Brasil.'],
  ['h','Financiamento e influência externa'],
  ['p','Em 20 de outubro, a Pública informou que o Instituto Sivis recebeu R$ 150 mil do Departamento de Estado dos EUA. A entidade nega ingerência externa e afirma ter autonomia.'],
  ['h','A virada nas redes'],
  ['p','Uma análise de Rafael Oliveira, de 25 de outubro, argumenta que a mobilização digital em torno de Andre Janones e de outros influenciadores ajudou a reduzir a abstenção e a produzir a virada de Lula. A coluna de Andrea DiP trata do gesto do presidente com a deputada Erika Hilton na festa da vitória.'],
  ['p','O Radar apresenta os achados como dados do laboratório, que podem ser contestados pelas plataformas e pelos citados.']
 ],
 fontes:[['Agência Pública: Laboratório de Investigação Eleitoral','https://apublica.org/especial/republica-nas-eleicoes/'],['Agência Pública: parlamentares dos EUA cobram a Meta','https://apublica.org/2026/10/parlamentares-dos-eua-cobram-meta-por-tratamento-desigual-a-lula/'],['Agência Pública: exército de Janones','https://apublica.org/2026/10/exercito-de-lula-presidente-consegue-virada-inedita/']]};

/* ---------- ECONOMIA (nova) ---------- */
S.fiscal = {ed:'economia', k:'Economia', hora:'5/11',
 t:'Contas públicas serão o maior teste do quarto mandato, avaliam Reuters, The Economist e a imprensa portuguesa',
 sub:'Dívida acima de 80% do PIB, juros entre os mais altos do mundo e promessas como aumento real do salário mínimo aparecem no centro da pauta.',
 resumo:'Em análise de Brendan O’Boyle, a Reuters diz que o controle da dívida pode entrar em conflito com promessas como aumentos reais do salário mínimo. A The Economist descreve uma economia frágil e juros reais muito altos. A Sábado aponta dívida acima de 80% do PIB.',
 fundo:[
  ['p','Uma semana depois da reeleição, a imprensa estrangeira concentra a análise na economia. Segundo a Reuters, em texto de Brendan O’Boyle, o controle da dívida pública pode entrar em conflito com promessas de campanha, como os aumentos reais do salário mínimo, e há resistência parlamentar a medidas de arrecadação.'],
  ['p','A The Economist, em 26 de outubro, descreve a economia brasileira como frágil, atribui parte do problema aos gastos do governo e afirma que o Banco Central elevou os juros reais a níveis muito altos como resposta. A revista também critica os programas de distribuição de recursos anunciados antes da eleição, que, na visão dela, vão na direção oposta à que o mercado espera.'],
  ['p','A Sábado, de Portugal, resume o quadro: dívida acima de 80% do PIB e uma das taxas de juros mais altas do mundo, o que pode exigir medidas impopulares.'],
  ['h','O contraponto'],
  ['p','No Brasil 247, o presidente do Santander disse que Lula deu “demonstrações importantíssimas de confiança para os mercados”. Também há leituras de que a política de juros, e não apenas o gasto, pesa na dívida: a cruzada contra juros altos é tema de colunistas na semana do Copom (veja a matéria sobre a decisão).']
 ],
 fontes:[['Reuters (via A Crítica)','https://acritica.net/eleicoes-2026/vitoria-de-lula-repercute-no-exterior-e-imprensa-destaca-virada-historica-nas-eleicoes/'],['The Economist (via Gazeta do Povo)','https://www.gazetadopovo.com.br/mundo/revista-inglesa-diz-lula-pode-ser-pato-manco-quarto-mandato/'],['Sábado (Portugal)','https://www.sabado.pt/mundo/detalhe/do-congresso-de-direita-a-divida-publica-quais-os-maiores-desafios-de-lula-no-4-mandato'],['Brasil 247','https://www.brasil247.com/economia/presidente-do-santander-diz-que-lula-deu-demonstracoes-importantissimas-de-confianca-para-os-mercados/']]};

/* ---------- REGIÕES ---------- */
S.sp = {ed:'regioes', reg:'sp', k:'Regiões · São Paulo', hora:'5/11',
 t:'Tarcísio prepara o secretariado do segundo mandato: MDB ganha peso, PSD perde e Eleuses Paiva deixa a Saúde',
 sub:'Reeleito no primeiro turno sobre Fernando Haddad, o governador deve anunciar as mudanças “nos próximos dias”. A tendência é manter o perfil técnico.',
 resumo:'Reeleito no primeiro turno, Tarcísio de Freitas (Republicanos) deve anunciar o novo secretariado nos próximos dias, segundo a BNews, com base no Metrópoles. O MDB ganha espaço, o PSD de Kassab perde influência e o secretário da Saúde, Eleuses Paiva (PSD), confirmou que sai. As equipes valem a partir de 2027.',
 fundo:[
  ['p','O governador de São Paulo, Tarcísio de Freitas (Republicanos), derrotou Fernando Haddad (PT) no primeiro turno e prepara a equipe do segundo mandato. A BNews São Paulo, com informações do Metrópoles, publicou em 29 de outubro que o anúncio deve sair “nos próximos dias”, sem data definida, e que as novas equipes passam a valer em 2027.'],
  ['h','Quem fica e quem sai'],
  ['ul',['Cotados para permanecer: Geraldo Melo Filho (Agricultura), Marília Marton (Cultura e Economia Criativa) e Natália Resende (Meio Ambiente, Infraestrutura e Logística), que pode ganhar protagonismo.','Saída confirmada: Eleuses Paiva (PSD) comunicou que deixará a Secretaria da Saúde.','Para a Saúde, são cotados Luiz Carlos Zamarco, secretário municipal da capital, e Maurício Serpa, secretário-adjunto da pasta estadual, opção para uma transição sem interrupção.']],
  ['h','Rearranjo político'],
  ['p','Segundo a reportagem, o MDB do prefeito Ricardo Nunes, que teve papel direto na coordenação da campanha, ganha mais espaço e peso, enquanto o PSD de Gilberto Kassab perde influência nas decisões do Executivo. A diretriz é manter parte da equipe atual e o perfil técnico, para dar continuidade a projetos de infraestrutura e concessões. A matéria não detalha o peso de PL e bolsonaristas na formação do secretariado.'],
  ['h','Na Alesp'],
  ['p','Na Assembleia Legislativa, segundo o Metrópoles, o coordenador da campanha de Haddad quer um cargo na Mesa, e o autor do modelo de escolas cívico-militares quer presidir a Casa.']
 ],
 fontes:[['BNews São Paulo','https://www.bnewssaopaulo.com.br/noticias/politica/tarcisio-deve-novo-secretariado-de-sao-paulo-para-seu-segundo-mandato-nos-proximos-dias.html'],['Metrópoles (citado pela BNews)',''],['CNN Brasil: os 27 governadores eleitos','https://www.cnnbrasil.com.br/eleicoes/veja-quem-sao-os-27-governadores-eleitos-em-2026/']]};

S.mg = {ed:'regioes', reg:'mg', k:'Regiões · Minas Gerais', hora:'5/11',
 t:'Cleitinho descarta privatizar a Cemig e promete diálogo com o governo federal em Minas',
 sub:'Eleito no primeiro turno com 55,40% dos votos válidos, o senador do Republicanos quer usar o lucro da estatal para reduzir a conta de energia.',
 dado:{n:'55,40%', l:'Votos válidos de Cleitinho Azevedo no 1º turno em Minas'},
 resumo:'Cleitinho Azevedo (Republicanos) foi eleito governador de Minas com 6.321.590 votos, 55,40% dos válidos. Em entrevista publicada em 5 de outubro, descartou privatizar a Cemig, sugeriu usar o lucro para subsidiar a conta de luz e disse que não fará barganha com cargos, inclusive em estatais.',
 fundo:[
  ['p','Cleitinho Azevedo (Republicanos) venceu a disputa pelo governo de Minas Gerais no primeiro turno, com 6.321.590 votos, 55,40% dos válidos. O terceiro colocado, Flávio Roscoe (PL), teve 795.193 votos, 6,97%. Os dados constam do Diário do Grande ABC.'],
  ['h','Cemig fora da lista de privatizações'],
  ['p','Depois da eleição, Cleitinho descartou privatizar a Cemig. Afirmou que a companhia dá lucro e sugeriu usar esses recursos para subsidiar a conta de energia. Criticou o uso de estatais em negociações políticas e disse que não fará barganha com cargos, inclusive em estatais.'],
  ['h','Equipe e transição'],
  ['p','O governador eleito pretende montar uma equipe técnica, mas aceita indicações partidárias de nomes qualificados. Sinalizou convidar Flávio Roscoe e disse que dará continuidade às ações bem-sucedidas da gestão de Mateus Simões (PSD), com quem as conversas de transição começaram.'],
  ['h','Relação com Brasília'],
  ['p','Cleitinho prometeu diálogo com a União, independentemente do resultado presidencial, e citou como temas a dívida de Minas, a saúde e as estradas. A posse está prevista para 6 de janeiro de 2027.'],
  ['p','Em outra frente, o Tribunal de Contas de Minas suspendeu R$ 32 milhões em patrocínios a clubes mineiros depois de ação do senador, segundo o Brasil 247.']
 ],
 fontes:[['Diário do Grande ABC','https://www.dgabc.com.br/Noticia/4351099/cleitinho-descarta-privatizar-cemig-e-promete-dialogo-com-lula-ou-flavio-em-governo'],['Brasil 247','https://www.brasil247.com/sudeste/tce-suspende-r-32-milhoes-em-patrocinios-a-clubes-de-minas-apos-acao-de-cleitinho/'],['CNN Brasil: posse em 6 de janeiro','https://www.cnnbrasil.com.br/eleicoes/veja-quem-sao-os-27-governadores-eleitos-em-2026/']]};

S.ne = {ed:'regioes', reg:'ne', k:'Regiões · Nordeste', hora:'5/11',
 t:'PT e PSD elegem sete dos nove governadores do Nordeste, e Cadu de Lula vira no RN por 32.625 votos',
 sub:'O PT segue com Bahia, Ceará, Piauí e Rio Grande do Norte. Só o RN foi decidido no segundo turno.',
 dado:{n:'32.625', l:'Votos de diferença para Cadu de Lula no 2º turno do RN'},
 resumo:'O PT elegeu quatro governadores no Nordeste e o PSD, três, segundo o Diário do Nordeste. Os outros dois ficaram com PP (Paraíba) e PSDB (Alagoas). No Rio Grande do Norte, Cadu de Lula (PT) venceu Allyson Bezerra (União) por 50,77% a 49,23%, uma diferença de 32.625 votos.',
 fundo:[
  ['p','Oito dos nove estados nordestinos definiram o governador no primeiro turno. De acordo com o Diário do Nordeste, de 26 de outubro, o PT elegeu quatro governadores e o PSD, três.'],
  ['tl',[['BA','Jerônimo Rodrigues (PT)'],['CE','Elmano de Freitas (PT)'],['PI','Rafael Fonteles (PT)'],['RN','Cadu de Lula (PT), no 2º turno'],['PE','Raquel Lyra (PSD)'],['MA','Eduardo Braide (PSD)'],['SE','Fábio Mitidieri (PSD)'],['PB','Lucas Ribeiro (PP)'],['AL','JHC (PSDB)']]],
  ['h','Virada no Rio Grande do Norte'],
  ['p','No segundo turno de 25 de outubro, Cadu de Lula (PT) teve 1.073.024 votos, 50,77% dos válidos, contra 1.040.399 de Allyson Bezerra (União), 49,23%. A diferença foi de 32.625 votos, segundo O Povo.'],
  ['h','Peso nacional'],
  ['p','O governador do Piauí, Rafael Fonteles, aparece entre os nomes cotados para a Fazenda de Lula, conforme O Povo+. Já o senador Rogério Marinho (PL-RN) é o nome do PL para disputar a presidência do Senado. A posse dos governadores está marcada para 6 de janeiro de 2027.'],
  ['p','Os veículos consultados divergem em rótulos partidários de alguns governadores. O Radar adota a lista da CNN Brasil, conferida com o Diário do Nordeste.']
 ],
 fontes:[['Diário do Nordeste','https://diariodonordeste.verdesmares.com.br/pontopoder/pt-e-psd-sao-partidos-com-mais-governadores-eleitos-no-nordeste-saiba-quem-sao-1.3801601'],['O Povo','https://mais.opovo.com.br/jornal/politica/2026/10/26/cadu-de-lula-vira-e-e-eleito-governador-do-rio-grande-do-norte-4-estados-e-df-tambem-escolhem-governadores.html'],['CNN Brasil','https://www.cnnbrasil.com.br/eleicoes/veja-quem-sao-os-27-governadores-eleitos-em-2026/']]};

S.sul = {ed:'regioes', reg:'sul', k:'Regiões · Sul', hora:'5/11',
 t:'PL elege os três governadores do Sul; Moro monta equipe e Zucco abre transição com Leite',
 sub:'Moro (PR) venceu com 50,10%, Zucco (RS) com 58,05% e Jorginho Mello (SC) foi reeleito. Todos no primeiro turno.',
 resumo:'O PL elegeu Sergio Moro no Paraná, Luciano Zucco no Rio Grande do Sul e reelegeu Jorginho Mello em Santa Catarina, todos no primeiro turno. Moro anunciou Pricilla Santana para a Fazenda e promete reduzir secretarias. Zucco e Eduardo Leite combinaram seis semanas de reuniões temáticas.',
 fundo:[
  ['p','A região Sul ficou inteira com o PL. Sergio Moro foi eleito governador do Paraná com 50,10% dos votos válidos. Luciano Zucco venceu no Rio Grande do Sul com 3.516.048 votos, 58,05%, contra 31,65% de Juliana Brizola (PDT), e Jorginho Mello foi reeleito em Santa Catarina. A CNN Brasil lista a posse de todos em 6 de janeiro de 2027.'],
  ['h','Paraná: Moro anuncia a Fazenda e promete enxugar a máquina'],
  ['p','Em 20 de outubro, Moro anunciou Pricilla Santana, secretária da Fazenda do Rio Grande do Sul desde 2023 e ex-subsecretária do Tesouro Nacional, como futura secretária da Fazenda paranaense. Ele reiterou a promessa de reduzir o número de secretarias: “Nós vamos diminuir o tamanho da máquina”. Moro se reuniu com o governador Ratinho Junior (PSD) em 15 de outubro para discutir a transição.'],
  ['h','Rio Grande do Sul: transição em seis semanas'],
  ['p','Em 9 de outubro, Eduardo Leite (PSD) recebeu Zucco no Palácio Piratini. As equipes se reunirão por seis semanas, em encontros temáticos semanais, segundo o Jornal do Comércio. Zucco é deputado federal e militar da reserva, apoiado por Flávio Bolsonaro, com vice do PP, e prometeu ampliar as escolas cívico-militares e combater as facções.'],
  ['h','A leitura do campo progressista'],
  ['p','O Brasil de Fato titulou “Extrema direita vence no RS” e destacou que Zucco recebeu grandes doações de empresários e que não admite como erro o voto na PEC da Blindagem, ao acusar o STF de perseguir políticos de direita. Zucco disse que “a direita venceu” e defendeu um pacto de união pelo estado.']
 ],
 fontes:[['Brasil de Fato','https://www.brasildefato.com.br/2026/10/04/extrema-direita-vence-no-rs-com-eleicao-de-zucco-pl-no-primeiro-turno/'],['Diário do Grande ABC','https://www.dgabc.com.br/Noticia/4353787/moro-anuncia-pricilla-santana-como-secretaria-da-fazenda-do-parana'],['Jornal do Comércio (RS)','https://www.jornaldocomercio.com/politica/2026/10/1266405-zucco-e-leite-acertam-transicao-com-reunioes-tematicas-semanais.html'],['CNN Brasil','https://www.cnnbrasil.com.br/eleicoes/veja-quem-sao-os-27-governadores-eleitos-em-2026/']]};

S.norte = {ed:'regioes', reg:'norte', k:'Regiões · Norte', hora:'5/11',
 t:'Dr. Daniel desbanca a governadora no Pará, e Omar Aziz volta ao governo do Amazonas',
 sub:'No Norte, PL elege em Rondônia e Roraima, PSD no Amapá e no Amazonas, e PP e PSDB vencem no Acre e no Tocantins.',
 resumo:'No Pará, Dr. Daniel (Podemos) teve 51,48% dos válidos e derrotou a governadora Hana Ghassan (MDB), que somou 46,41%. No Amazonas, Omar Aziz (PSD) foi eleito no segundo turno com cerca de 59,96% na apuração parcial. Acre e Tocantins também foram decididos em 25 de outubro.',
 fundo:[
  ['p','Dos sete estados do Norte, quatro elegeram o governador no primeiro turno: Amapá (Dr. Furlan, PSD), Pará (Dr. Daniel, Podemos), Rondônia (Marcos Rogério, PL) e Roraima (Arthur Henrique, PL). Acre, Amazonas e Tocantins foram para o segundo turno.'],
  ['h','Pará'],
  ['p','Dr. Daniel, ex-prefeito de Ananindeua, teve 2.335.896 votos, 51,48% dos válidos, e a atual governadora, Hana Ghassan (MDB), 2.106.177. O vice é Ellayne D’Almeida (PL). Segundo o Brasil de Fato, Helder Barbalho (MDB) foi eleito senador e Dr. Daniel rompeu com o MDB em 2022 por causa do apoio do partido a Lula. O governador eleito anunciou a equipe de transição em 15 de outubro, segundo O Liberal.'],
  ['h','Amazonas, Acre e Tocantins'],
  ['ul',['Amazonas: Omar Aziz (PSD), 68 anos, senador e ex-governador, teve 1.090.351 votos (59,96% dos válidos) contra 728.255 (39,98%) da professora Maria do Carmo (PL), em apuração parcial.','Acre: Mailza Assis (PP) foi reeleita com 66,21% sobre Alan Rick (Republicanos).','Tocantins: Vicentinho Júnior (PSDB) venceu a professora Dorinha (União) com 64,52%.']],
  ['h','Amapá e o Senado'],
  ['p','O Correio da Manhã registra que o governador do Amapá, Clécio Luís (União), não se reelegeu e que os candidatos do grupo de Davi Alcolumbre não conquistaram as duas vagas ao Senado no estado, o que enfraquece o presidente do Senado em casa.']
 ],
 fontes:[['Brasil de Fato','https://www.brasildefato.com.br/2026/10/04/dr-daniel-podemos-e-eleito-governador-do-para-com-5148/'],['Brasil 61','https://brasil61.com/n/eleicoes-2026-norte-tem-4-governadores-eleitos-e-3-disputas-de-segundo-turno-bras2617223'],['O Liberal: transição de Dr. Daniel','https://www.oliberal.com/politica/dr-daniel-santos-anuncia-equipe-de-transic-o-do-governo-do-para-1.1183013'],['Correio da Manhã: Omar Aziz','https://www.correiodamanha.com.br/nacional/norte/2026/10/329819-omar-aziz-e-eleito-governador-do-amazonas-com-599-dos-votos.html'],['O Povo: segundo turno','https://mais.opovo.com.br/jornal/politica/2026/10/26/cadu-de-lula-vira-e-e-eleito-governador-do-rio-grande-do-norte-4-estados-e-df-tambem-escolhem-governadores.html']]};

S.co = {ed:'regioes', reg:'co', k:'Regiões · Centro-Oeste', hora:'5/11',
 t:'Celina Leão é reeleita no DF com 57,18%, e Goiás, Mato Grosso e Mato Grosso do Sul reelegem governadores no 1º turno',
 sub:'No DF, a governadora enfrentou Leandro Grass (PT) em meio à crise do BRB/Master. O PL ficou em segundo em Goiás e em Mato Grosso.',
 dado:{n:'57,18%', l:'Votos de Celina Leão (PP) no 2º turno do Distrito Federal'},
 resumo:'Celina Leão (PP) venceu Leandro Grass (PT) no segundo turno do DF com 57,18% dos votos, contra 42,82%. Em Goiás, Daniel Vilela (MDB) teve cerca de 59%, em Mato Grosso, Otaviano Pivetta (Republicanos) cerca de 60,77%, e em Mato Grosso do Sul, Eduardo Riedel (PP), cerca de 67,07%, nas apurações do primeiro turno.',
 fundo:[
  ['p','O Centro-Oeste elegeu quatro governadores de partidos de centro-direita. No Distrito Federal, Celina Leão (PP) obteve cerca de 987 mil votos, 57,18%, contra cerca de 739 mil, 42,82%, de Leandro Grass (PT), com 100% das urnas apuradas, segundo o TSE citado pelo Correio da Manhã. Ela é a primeira mulher eleita governadora do DF, e o vice é Gustavo Rocha (Republicanos).'],
  ['h','Contexto no DF'],
  ['p','Celina assumiu o governo em março de 2026, quando Ibaneis Rocha (MDB) deixou o cargo, e Ibaneis desistiu de disputar o Senado em meio à crise do BRB/Master. Ela teve o apoio de Michelle Bolsonaro, Bia Kicis, Damares Alves e Flávio Bolsonaro e não participou de debates. Grass disse que a campanha superou 700 mil votos, a maior votação do campo progressista desde 2010.'],
  ['p','No dia da votação, o TRE-DF não prorrogou o horário até as 19h, apesar de decisão do ministro Cristiano Zanin, porque as urnas já estavam fechadas quando a medida foi anunciada. Segundo o TSE, 26 mil eleitores anularam o voto ao digitar o número errado.'],
  ['h','Os demais estados'],
  ['ul',['Goiás: Daniel Vilela (MDB), cerca de 59% dos válidos, contra Wilder Morais (PL), 22,12%.','Mato Grosso: Otaviano Pivetta (Republicanos), 60,77%, contra Wellington Fagundes (PL), 23,22%.','Mato Grosso do Sul: Eduardo Riedel (PP), 67,07%, contra Fábio Trad (PT), 23,67%.']],
  ['p','Os percentuais de Goiás, Mato Grosso e Mato Grosso do Sul são da apuração de 4 de outubro, com 95,94% a 99,93% das urnas.']
 ],
 fontes:[['Correio da Manhã','https://www.correiodamanha.com.br/nacional/distrito-federal/brasilia-df/2026/10/329900-celina-leao-e-reeleita-governadora-do-distrito-federal.html'],['Diário do Grande ABC','https://www.dgabc.com.br/Noticia/4350894/centro-oeste-reelege-governadores-de-todos-estados-no-1-turno-df-vai-a-2-turno'],['CNN Brasil','https://www.cnnbrasil.com.br/eleicoes/veja-quem-sao-os-27-governadores-eleitos-em-2026/']]};

/* ---------- MUNDO (novas) ---------- */
S.imprensa = {ed:'mundo', k:'Mundo', hora:'5/11',
 t:'Le Monde fala em “milagre”, BBC vê país dividido e Reuters foca nas contas: como o mundo leu a vitória de Lula',
 sub:'China, Rússia e União Europeia cumprimentaram o presidente. Para a The Economist, a direita pode transformá-lo em “pato manco”.',
 resumo:'Le Monde classificou a vitória como “nada menos do que um milagre”. A BBC ressaltou que mais de 48% dos votos foram para Flávio Bolsonaro e apontou um Congresso conservador. O Guardian leu o resultado como revés para Trump. Putin, a China e Ursula von der Leyen reagiram em 26 de outubro.',
 fundo:[
  ['p','A reeleição de Lula, confirmada em 25 de outubro com 51,79% dos votos válidos contra 48,21% de Flávio Bolsonaro, foi manchete no exterior. O resumo abaixo é de A Crítica de Campo Grande, que compilou a cobertura.'],
  ['ul',['Le Monde (França): chamou a vitória de “nada menos do que um milagre”, já que Lula ficara atrás no primeiro turno, com 45,16% contra 47,03% de Flávio. Atribuiu a virada à mobilização nas ruas e nas redes e à resistência ao retorno do bolsonarismo.','BBC (Reino Unido): destacou as comemorações, mas lembrou que mais de 48% dos votos válidos foram para Flávio e apontou um Congresso conservador como obstáculo.','The Guardian (Reino Unido): analisou a derrota de Flávio pela ótica das relações Brasil-EUA, como revés político para Donald Trump.','Reuters: análise de Brendan O’Boyle sobre o risco fiscal e a resistência parlamentar a medidas de arrecadação e a indicações ao Banco Central, a agências e ao STF.','The Japan Times (Japão): classificou o resultado como surpreendente.']],
  ['h','Governos'],
  ['p','Em 26 de outubro, o Ministério das Relações Exteriores da China manifestou interesse em continuar a cooperação, Vladimir Putin parabenizou Lula, e a presidente da Comissão Europeia, Ursula von der Leyen, afirmou que a democracia e o multilateralismo venceram no Brasil. Na América do Sul, parabenizaram o presidente José Antonio Kast (Chile), Santiago Peña (Paraguai), Daniel Noboa (Equador) e Keiko Fujimori (Peru), segundo o Correio da Manhã.'],
  ['h','Visão crítica'],
  ['p','A The Economist, de 26 de outubro, avalia que a direita, com a maior bancada nas duas Casas, pode deixar Lula como “pato manco” e descreve a economia como frágil. A revista portuguesa Sábado lembra que Jair Bolsonaro cumpre 27 anos e três meses de prisão e cita a tensão comercial com Donald Trump.'],
  ['p','O Le Temps, da Suíça, e agências de língua francesa também acompanharam a reeleição e a ida de Flávio à Flórida.']
 ],
 fontes:[['A Crítica de Campo Grande (compilação)','https://acritica.net/eleicoes-2026/vitoria-de-lula-repercute-no-exterior-e-imprensa-destaca-virada-historica-nas-eleicoes/'],['The Economist (via Gazeta do Povo)','https://www.gazetadopovo.com.br/mundo/revista-inglesa-diz-lula-pode-ser-pato-manco-quarto-mandato/'],['Sábado (Portugal)','https://www.sabado.pt/mundo/detalhe/do-congresso-de-direita-a-divida-publica-quais-os-maiores-desafios-de-lula-no-4-mandato'],['Correio da Manhã','https://www.correiodamanha.com.br/mundo/internacional/2026/10/330316-milei-se-recusa-a-reconhecer-vitoria-de-lula-e-fica-isolado-entre-lideres-sul-americanos.html']]};

S.argentina = {ed:'mundo', k:'Mundo', hora:'5/11',
 t:'Milei segue sem reconhecer a vitória de Lula e fica isolado entre líderes sul-americanos',
 sub:'Macri e o PRO parabenizaram o presidente brasileiro. Clarín, Página 12 e La Nación já tratavam como crise a tensão aberta em julho.',
 resumo:'Segundo o Correio da Manhã, Milei não reconheceu publicamente a reeleição de Lula, de 25 de outubro, e compartilhou publicações que criticam a condução da votação. Macri e o PRO parabenizaram o petista. A crise diplomática começou em julho, quando Milei chamou Lula de “ex-presidiário” e os dois países convocaram embaixadores.',
 fundo:[
  ['p','Lula venceu o segundo turno com 64.256.232 votos, 51,79% dos válidos, contra 59.826.041 (48,21%) de Flávio Bolsonaro. Segundo o Correio da Manhã, de 27 de outubro, o presidente argentino, Javier Milei, que apoiou Flávio na campanha, “permanece sem reconhecer publicamente” o resultado, compartilhou publicações criticando a condução da votação e não mencionou o tema na reunião ministerial de 26 de outubro. A chancelaria não emitiu nota de reconhecimento.'],
  ['h','Isolamento regional'],
  ['p','Já parabenizaram Lula o chileno José Antonio Kast, o paraguaio Santiago Peña, o equatoriano Daniel Noboa e a peruana Keiko Fujimori. Na Argentina, o ex-presidente Mauricio Macri, aliado de Milei, e o PRO fizeram o mesmo. O deputado Esteban Paulón propôs que o governo reconheça o resultado e retome o diálogo diplomático.'],
  ['h','Como a tensão começou'],
  ['p','A CNN Brasil relatou, em 27 de julho, que Milei criticou Lula na convenção do PL, e o Brasil convocou o embaixador Júlio Bitelli para consultas, enquanto a Argentina chamou Daniel Raimondi. O jornal Clarín destacou o “protesto do Brasil”. A Página 12, crítica de Milei, estampou “Vergonha” e falou na crise mais profunda desde a redemocratização. A La Nación registrou que um pedido de desculpas estava descartado por ora, segundo fontes do governo argentino.'],
  ['p','O chefe de gabinete, Diego Santilli, respondeu às convocações com “não exagerem”.']
 ],
 fontes:[['Correio da Manhã','https://www.correiodamanha.com.br/mundo/internacional/2026/10/330316-milei-se-recusa-a-reconhecer-vitoria-de-lula-e-fica-isolado-entre-lideres-sul-americanos.html'],['CNN Brasil: imprensa argentina','https://www.cnnbrasil.com.br/internacional/imprensa-argentina-repercute-tensao-com-o-brasil-crise-mais-profunda/']]};

S.maioridade = {
 "ed": "politica",
 "k": "Política",
 "hora": "4/11",
 "t": "Alcolumbre tira a maioridade penal da pauta, e líder do PL rompe: “acabou o diálogo”",
 "sub": "O presidente do Senado decidiu esperar a Câmara, onde tramita a PEC que fixa a idade em 16 anos. Governo e oposição trocam acusações.",
 "resumo": "O presidente do Senado, Davi Alcolumbre (União-AP), retirou da pauta, na quarta (4), a votação da redução da maioridade penal e disse que vai aguardar a Câmara, onde tramita a PEC 32/2015, que fixa a idade em 16 anos. Segundo ele, o presidente da Câmara, Hugo Motta (Republicanos-PB), se comprometeu a votar o tema em novembro. O líder do PL, Carlos Portinho (RJ), afirmou que o acordo foi descumprido e ameaçou travar medidas do governo.",
 "fundo": [
  [
   "p",
   "A negociação foi fechada na terça (3), quando o Senado aprovou a PEC da Segurança Pública sem as emendas sobre maioridade penal. Pelo entendimento, as emendas seriam separadas do texto, que seguiria para promulgação sem voltar à Câmara, e o Senado votaria depois a redução para 16 anos, prevista em emenda do líder do PT, Camilo Santana (CE). A separação das emendas passou por 38 votos a 36, depois que Alcolumbre colocou os requerimentos do relator em votação antes do texto principal, segundo O Tempo."
  ],
  [
   "p",
   "Na quarta, Alcolumbre remeteu a discussão à Câmara. Ele pediu desculpas aos senadores que defendiam a votação e afirmou: “Eu preciso reconhecer que a Câmara dos Deputados saiu à frente da deliberação desta PEC”. Em outro momento, disse que, se a Câmara votar a redução, pautará a matéria no Senado “um dia depois”. A Folha de Pernambuco registrou que a decisão veio depois de um pedido do presidente Lula, que defendia o adiamento."
  ],
  [
   "p",
   "Portinho respondeu que o acordo foi descumprido: “Acabou o diálogo” e “Compromisso é para ser cumprido”. O líder do PL ameaçou travar a medida provisória que proíbe apostas online, a PEC da tarifa zero e mudanças na escala 6x1. A oposição, por sua vez, acusou o governo de “tentativa de enganar o eleitor”, segundo o Plantão publicado pela Folha de Pernambuco e pelo DGABC."
  ],
  [
   "h",
   "Próximos passos na Câmara"
  ],
  [
   "p",
   "O relator da PEC da Maioridade Penal na Câmara, Mendonça Filho (União-PE), afirmou que deve apresentar o parecer até o fim do mês, segundo o DGABC. De acordo com O Globo, citado por O Tempo, o relatório deve ser votado na comissão especial em novembro, e o plenário está previsto para o início de dezembro. O senador Rogério Marinho (PL-RN), autor de emenda sobre o tema, disse duvidar do avanço da proposta em 2026."
  ]
 ],
 "fontes": [
  [
   "O Tempo",
   "https://www.otempo.com.br/politica/congresso/2026/11/4/portinho-apos-alcolumbre-tirar-reducao-da-maioridade-penal-da-pauta-do-senado-acabou-o-dialogo"
  ],
  [
   "Folha de Pernambuco",
   "https://www.folhape.com.br/politica/alcolumbre-retira-maioridade-penal-da-pauta-e-vai-aguardar-camara/522487/"
  ],
  [
   "DGABC",
   "https://www.dgabc.com.br/Noticia/4366934/relator-da-pec-da-maioridade-penal-afirma-que-deve-apresentar-parecer-ate-final-do-mes"
  ],
  [
   "O Povo",
   "https://www.opovo.com.br/noticias/politica/2026/11/04/reducao-da-maioridade-penal-senado-vai-aguardar-votacao-de-pec-da-camara.html"
  ]
 ]
};

S.vorcaro = {
 "ed": "politica",
 "k": "Política · STF",
 "hora": "4/11",
 "t": "Fachin dá 15 dias à PGR para se manifestar sobre o indiciamento de Vorcaro",
 "sub": "Relatório parcial da PF descreve o dono do Banco Master como líder de organização criminosa e liga o caso a R$ 17,5 bilhões em créditos vendidos ao BRB.",
 "resumo": "O presidente do Supremo, Edson Fachin, deu 15 dias à Procuradoria-Geral da República para se manifestar sobre o relatório da Polícia Federal que indiciou Daniel Vorcaro e outros 14 investigados por fraudes envolvendo o Banco Master. A PF descreve Vorcaro como líder de organização criminosa e relaciona os crimes a R$ 17,5 bilhões em créditos vendidos ao BRB, dos quais R$ 12,2 bilhões seriam “créditos podres”. A polícia pede mais 60 dias de inquérito.",
 "fundo": [
  [
   "p",
   "Segundo a Agência O Globo, publicada pela Folha de Pernambuco, o parecer da PGR deve tratar das conclusões dos investigadores e de pedidos feitos pelos alvos da Operação Compliance Zero. Os crimes imputados são gestão fraudulenta de instituição financeira, induzimento a erro, fraude em fiscalização e lavagem de dinheiro. Os delitos se relacionam a créditos vendidos pelo Master ao BRB entre julho de 2024 e outubro de 2025. Segundo a PF, R$ 12,2 bilhões do total “não tinham a devida comprovação de sua existência”."
  ],
  [
   "p",
   "A PGR pode pedir novas diligências ou preparar uma primeira denúncia contra Vorcaro. A PF pediu prorrogação de 60 dias do inquérito, porque ainda estão em andamento perícias e análises bancárias, fiscais e patrimoniais, com o objetivo de medir o “proveito econômico” dos investigados."
  ],
  [
   "p",
   "A defesa de Vorcaro apresentou laudo de perito particular que afirma que o celular dele foi manuseado e teve arquivos alterados depois da apreensão, em 17 de novembro do ano passado. Os advogados pedem os dados brutos do aparelho e a substituição da prisão preventiva. Vorcaro está preso na Papudinha, em Brasília. O DGABC e O Povo chegaram a noticiar o prazo como decisão de Mendonça e publicaram correção atribuindo-o a Fachin."
  ]
 ],
 "fontes": [
  [
   "Folha de Pernambuco",
   "https://www.folhape.com.br/politica/fachin-da-15-dias-para-pgr-se-manifestar-sobre-relatorio-da-pf-que/522454/"
  ]
 ]
};

S.darkhorse = {
 "ed": "politica",
 "k": "Política · STF",
 "hora": "4/11",
 "t": "Gonet tem 15 dias para opinar sobre prorrogar o inquérito Dark Horse, que investiga Flávio e Eduardo Bolsonaro",
 "sub": "A PF pede mais 90 dias para apurar US$ 12,3 milhões que Vorcaro teria repassado ao filme sobre Jair Bolsonaro.",
 "resumo": "O procurador-geral da República, Paulo Gonet, tem 15 dias para se manifestar sobre o pedido da Polícia Federal de prorrogar por 90 dias o inquérito Dark Horse. A investigação apura suspeita de lavagem de dinheiro e evasão de divisas envolvendo o senador Flávio Bolsonaro (PL-RJ) e o ex-deputado Eduardo Bolsonaro (PL-SP), a partir de repasses de US$ 12,3 milhões, atribuídos a Daniel Vorcaro, para a cinebiografia de Jair Bolsonaro.",
 "fundo": [
  [
   "p",
   "Segundo O Tempo, o dono do extinto Banco Master teria repassado os recursos por meio da Entre Investimentos e Participações. Na época, o valor correspondia a cerca de R$ 69 milhões. O inquérito foi aberto em 23 de julho, e o prazo original venceria em 10 de outubro de 2026. O relator é o ministro André Mendonça. Como os autos estão na Presidência do STF desde a véspera de uma sessão sobre possível investigação contra o ministro Alexandre de Moraes, o presidente do tribunal, Edson Fachin, intimou Gonet."
  ],
  [
   "p",
   "A PF justifica a prorrogação com pendências: a perícia contábil-financeira do Instituto Nacional de Criminalística, ainda em andamento; a cooperação jurídica internacional com os Estados Unidos para obter registros da produtora GoUP Entertainment, que se recusou a enviar documentos sem essa formalização; e a análise de dados telemáticos de Fabiano Zettel e de Antônio Carlos Freixo Jr., que já firmou acordo de colaboração premiada com a PGR."
  ]
 ],
 "fontes": [
  [
   "O Tempo",
   "https://www.otempo.com.br/politica/judiciario/2026/11/4/gonet-tem-15-dias-para-opinar-se-prorroga-inquerito-do-dark-horse-por-90-dias"
  ]
 ]
};

S.marinho = {
 "ed": "politica",
 "k": "Política · Senado",
 "hora": "4/11",
 "t": "Marinho confirma candidatura à presidência do Senado e diz contar com 40 votos; Alcolumbre critica o PL",
 "sub": "O senador do PL nega acordo com Tereza Cristina e defende voto aberto. O atual presidente ironiza quem questiona a urna.",
 "resumo": "O senador Rogério Marinho (PL-RN) confirmou na quarta (4) que será candidato à presidência do Senado, após reunião com a bancada do PL. Ele disse acreditar em pelo menos 40 votos, um a menos que os 41 necessários no primeiro turno, e negou acordo com Tereza Cristina (PP-MS), que também deve concorrer. Alcolumbre, que pode ser reeleito, criticou o PL por questionar o resultado da eleição depois do lançamento de Marinho.",
 "fundo": [
  [
   "p",
   "Segundo o Correio do Estado, Marinho afirmou que “Tereza tem toda a legitimidade de ser candidata” e que os dois lançarão seus nomes e decidirão depois quem permanece. Ele evitou confirmar um revezamento, em que um disputaria em 2027 e o outro em 2029. Citou apoio do Novo e de integrantes do PP e do Republicanos. O PL avalia pressionar senadores eleitos na onda bolsonarista que poderiam votar pela reeleição de Alcolumbre, e defende a votação aberta, que Marinho considera “recomendável”. Hoje o voto é secreto."
  ],
  [
   "p",
   "Marinho defendeu ainda votar a anistia aos condenados pelos atos de 8 de janeiro, como qualquer outro projeto. Segundo a Itatiaia, ele avisou ao STF que “não será omisso” diante de denúncias contra a Corte."
  ],
  [
   "p",
   "Em discurso no plenário, Alcolumbre disse que parte dos eleitos venceu com “ofensas, agressões e ameaças” e questionou quem aceita a urna eletrônica no primeiro turno e duvida dela depois de uma derrota no segundo. Segundo a Folha de Pernambuco, ele afirmou ainda que avaliará a situação de Flávio Bolsonaro no Senado. O Congresso em Foco registrou o discurso. A eleição da Mesa será em fevereiro de 2027."
  ]
 ],
 "fontes": [
  [
   "Correio do Estado",
   "https://correiodoestado.com.br/2026/11/04/rogerio-marinho-diz-que-acordo-com-tereza-sera-fechado-no-futuro-e-evita-falar-em-rodizio.html"
  ],
  [
   "Itatiaia",
   "https://www.itatiaia.com.br/politica/marinho-se-lanca-candidato-a-presidencia-do-senado-e-avisa-stf-que-nao-sera-omisso-sobre-denuncias-contra-corte/"
  ],
  [
   "Congresso em Foco",
   "https://www.congressoemfoco.com.br/noticia/131317/alcolumbre-ironiza-ataques-a-urna-e-lamenta-eleitos-sem-proposta"
  ],
  [
   "Folha de Pernambuco",
   "https://www.folhape.com.br/politica/alcolumbre-critica-pl-por-questionar-resultado-da-eleicao-apos/522453/"
  ]
 ]
};

S.seis1x1 = {
 "ed": "politica",
 "k": "Política · Trabalho",
 "hora": "4/11",
 "t": "Governo prevê decreto da escala 6x1 para segunda; CNI e CNC vão ao STF contra o fim da jornada",
 "sub": "Marinho diz que o texto será discutido com Lula nesta quinta. A CNI calcula alta de 11,1% no custo do trabalho formal na indústria.",
 "resumo": "O ministro do Trabalho, Luiz Marinho, disse na quarta (4) que o decreto que regulamenta o fim da escala 6x1 deve ser publicado na segunda (9). No mesmo dia, a CNI e a CNC acionaram o Supremo para suspender a Emenda Constitucional 141/2026, promulgada em 16 de outubro. A CNI estima que a medida elevaria em 11,1% o custo do trabalho formal na indústria, cerca de R$ 88 bilhões.",
 "fundo": [
  [
   "p",
   "Segundo a Folha de Pernambuco, a publicação estava prevista para a semana anterior, mas foi adiada porque Lula não conseguiu assinar o despacho. O texto será discutido com o presidente nesta quinta (5). O decreto busca coordenar a adoção das escalas nos setores, e os trabalhadores terão no mínimo oito folgas em 30 dias. Marinho disse que não há lista de flexibilidades: a PEC exige dois descansos semanais, que podem ser consolidados dentro do mês. Acordos coletivos terão papel central, e setores de funcionamento contínuo, como saúde, transporte, segurança e limpeza urbana, devem ser contemplados."
  ],
  [
   "p",
   "O governo prevê início da implementação em 15 de dezembro, com a jornada caindo gradualmente de 44 para 40 horas semanais. A emenda extingue a escala 6x1 e estabelece cinco dias de trabalho para dois de descanso."
  ],
  [
   "p",
   "Na ação ao STF, segundo O Povo, a CNI alega que a emenda afeta a segurança jurídica, a livre iniciativa e a autonomia coletiva trabalhista, e que acordos coletivos vigentes deveriam manter seus efeitos até o fim do prazo ou até nova negociação. Indústrias de operação contínua dependem de folgas negociadas coletivamente. A CNC pretende adiar o início da redução da jornada para outubro de 2027. A Folha de Pernambuco informou que o ministro Flávio Dino foi sorteado relator da ação da CNC."
  ]
 ],
 "fontes": [
  [
   "Folha de Pernambuco",
   "https://www.folhape.com.br/politica/governo-preve-decreto-do-fim-da-escala-6x1-para-segunda-feira/522431/"
  ],
  [
   "O Povo",
   "https://www.opovo.com.br/noticias/politica/2026/11/04/entidades-da-industria-e-do-comercio-recorrem-ao-stf-contra-fim-da-6x1.html"
  ],
  [
   "Folha de Pernambuco (relatoria)",
   "https://www.folhape.com.br/politica/ministro-do-stf-flavio-dino-e-sorteado-relator-da-acao-da-cnc-que/522428/"
  ]
 ]
};

S.tse = {
 "ed": "politica",
 "k": "Política · Justiça Eleitoral",
 "hora": "4/11",
 "t": "Gilmar critica, sem citar o nome, a atuação de Nunes Marques no TSE no segundo turno",
 "sub": "“Silêncios e hesitações não são neutros”, disse o decano do STF, em referência à prorrogação do horário de votação.",
 "resumo": "O decano do Supremo, Gilmar Mendes, criticou a condução do presidente do TSE, Kassio Nunes Marques, no segundo turno, sem citar o nome do colega. Segundo ele, quem comanda a Corte Eleitoral deve manter a “postura de árbitro equidistante que a Constituição pressupõe”, e “silêncios e hesitações não são neutros”. A crítica refere-se ao pedido de prorrogação da votação, feito após denúncias de falta de ônibus e chuvas, sobre o qual Nunes Marques não se manifestou.",
 "fundo": [
  [
   "p",
   "De acordo com o Correio Braziliense, o PT recorreu ao STF, e o ministro Cristiano Zanin autorizou a extensão do horário, mas a decisão foi publicada quando grande parte das urnas já havia fechado. Gilmar disse que “a colegialidade cumpriu seu papel” e avaliou que a omissão pode levar outras instâncias a resolver problemas por conta própria e alimentar ataques ao sistema eleitoral. Até a publicação, Nunes Marques não respondeu às críticas."
  ],
  [
   "p",
   "O Em.com.br e O Liberal também registraram a fala do ministro, feita em evento, e a classificaram como crítica à condução do TSE."
  ]
 ],
 "fontes": [
  [
   "Correio Braziliense",
   "https://www.correiobraziliense.com.br/politica/2026/11/7532650-gilmar-critica-atuacao-de-nunes-marques-no-segundo-turno-das-eleicoes.html"
  ],
  [
   "Estado de Minas",
   "https://www.em.com.br/politica/2026/11/7532858-crise-no-stf-gilmar-mendes-questiona-postura-de-nunes-marques-no-tse.html"
  ]
 ]
};

S.pauta5 = {
 "ed": "politica",
 "k": "Política · Congresso",
 "hora": "4/11",
 "t": "Governo quer votar cinco pautas antes do recesso, com bets, tarifa zero e Orçamento",
 "sub": "A articulação envolve Alcolumbre e Motta, antes da posse dos novos parlamentares em fevereiro de 2027.",
 "resumo": "Depois da aprovação da PEC da Segurança no Senado, o governo Lula quer votar cinco pautas prioritárias antes do recesso: a conversão em lei da MP que proíbe apostas online, a PEC da tarifa zero no transporte aos fins de semana, a regulamentação da reforma tributária com foco na alíquota da CBS, o Orçamento de 2027 e indicações para agências reguladoras. A MP das bets perde a validade em 23 de novembro, segundo o Plantão Brasil.",
 "fundo": [
  [
   "p",
   "A estratégia é aproveitar a composição atual do Congresso, antes da posse dos novos parlamentares, em fevereiro. A articulação envolve os presidentes do Senado, Davi Alcolumbre (União-AP), e da Câmara, Hugo Motta (Republicanos-PB)."
  ],
  [
   "p",
   "O líder do PL no Senado, Carlos Portinho, ameaçou travar a MP das bets, a tarifa zero e mudanças na escala 6x1 depois da retirada da maioridade penal da pauta. Segundo O Tempo, a PEC 18/2026, da tarifa zero, reservaria ao menos 26,8% das emendas obrigatórias, cerca de R$ 12 bilhões por ano. Para o Correio Braziliense, o comando do Congresso e o ministro da Fazenda definirão o desenho do novo governo."
  ]
 ],
 "fontes": [
  [
   "Plantão Brasil",
   "https://www.plantaobrasil.net/noticias/161723-lula-articula-forca-tarefa-no-congresso-para-destravar-agenda-prioritaria-antes-do-recesso"
  ],
  [
   "O Tempo",
   "https://www.otempo.com.br/politica/congresso/2026/11/4/portinho-apos-alcolumbre-tirar-reducao-da-maioridade-penal-da-pauta-do-senado-acabou-o-dialogo"
  ]
 ]
};

S.segmin = {
 "ed": "politica",
 "k": "Política · Segurança",
 "hora": "4/11",
 "t": "PEC da Segurança abre caminho para o Ministério da Segurança Pública; Curitiba e São Paulo já falam em Polícia Municipal",
 "sub": "O texto vai à promulgação sem sanção. Lula condicionou a criação da pasta à aprovação da PEC.",
 "resumo": "A PEC da Segurança Pública, aprovada pelo Senado na terça (3), segue para promulgação pelo Congresso, sem necessidade de sanção. O texto endurece regras para integrantes de facções e milícias, inclui o Sistema Único de Segurança Pública na Constituição e amplia as atribuições da Polícia Rodoviária Federal. Lula comemorou e reafirmou que criará o Ministério da Segurança Pública. A prefeitura de Curitiba começou a estudar a transição da Guarda Municipal para Polícia Municipal.",
 "fundo": [
  [
   "p",
   "Segundo a Itatiaia, a PEC prevê transferência de presos para unidades de segurança máxima, restrição à progressão de regime, perda de bens ligados a atividades criminosas sem indenização, responsabilização de empresas envolvidas e proteção a denunciantes e familiares. Também permite forças-tarefas e compartilhamento de informações entre as polícias e autoriza a PRF a atuar em ferrovias e hidrovias federais. A redução da maioridade penal ficou de fora e será analisada separadamente."
  ],
  [
   "p",
   "Em outubro, na sabatina da TV Globo, Lula disse: “Aprovada a PEC, vou criar o Ministério da Segurança Pública”. A reportagem não informa prazo. No Senado, a PEC foi aprovada com 73 votos favoráveis, segundo o Diário do Nordeste."
  ],
  [
   "p",
   "Na Gazeta do Povo, a prefeitura de Curitiba, comandada por Eduardo Pimentel, determinou o início da transição da Guarda para Polícia Municipal, com estudos técnicos, jurídicos e administrativos conduzidos pela Secretaria de Defesa Social e Trânsito. Não há prazo, e a mudança depende da promulgação da PEC."
  ]
 ],
 "fontes": [
  [
   "Itatiaia",
   "https://www.itatiaia.com.br/politica/pec-da-seguranca-abre-caminho-para-lula-criar-novo-ministerio/"
  ],
  [
   "Diário do Nordeste",
   "https://diariodonordeste.verdesmares.com.br/pontopoder/pec-da-seguranca-e-aprovada-no-senado-com-73-votos-favoraveis-e-segue-para-promulgacao-1.3803214"
  ],
  [
   "Gazeta do Povo",
   "https://www.gazetadopovo.com.br/parana/curitiba-inicia-transicao-da-guarda-municipal-para-policia-municipal/"
  ]
 ]
};

S.assedio = {
 "ed": "politica",
 "k": "Política · Trabalho",
 "hora": "4/11",
 "t": "Ministério do Trabalho já recebeu mais de 7 mil denúncias de assédio eleitoral",
 "sub": "Marinho diz não saber quantos casos são reais e afirma que o foco é proteger o trabalhador, não punir.",
 "resumo": "O ministro do Trabalho, Luiz Marinho, informou na quarta (4) que a pasta recebeu mais de 7 mil denúncias de assédio eleitoral no trabalho. Ele disse não saber quantas são casos reais e concretos. Antes, o ministério havia registrado 4,3 mil denúncias em três dias de funcionamento do canal depois do segundo turno. Marinho afirmou que o Estado “não pretende punir absolutamente ninguém” e que o foco é proteger o trabalhador.",
 "fundo": [
  [
   "p",
   "Segundo o DGABC, o Ministério Público do Trabalho obteve liminares, e a Justiça do Trabalho determinou que a Meta removesse postagens que incentivavam demissões por voto. A reportagem não informa distribuição das denúncias por estado. Em Alagoas, o deputado Ronaldo Medeiros denunciou demissões de trabalhadores por voto em Lula, segundo a Gazeta de Alagoas."
  ]
 ],
 "fontes": [
  [
   "DGABC",
   "https://www.dgabc.com.br/Noticia/4366935/mte-recebeu-mais-de-7-000-denuncias-de-assedio-eleitoral-segundo-ministro"
  ]
 ]
};

S.meta = {
 "ed": "politica",
 "k": "Política · Plataformas",
 "hora": "4/11",
 "t": "Justiça de SP suspende novas regras da Meta para uso de conteúdo jornalístico",
 "sub": "Liminar atende ANJ, Abert e Aner e fixa multa diária de R$ 1 milhão. Termos entrariam em vigor em 20 de novembro.",
 "resumo": "A 44ª Vara Cível de São Paulo suspendeu, em liminar, partes dos Termos Comerciais da Meta que permitiriam o uso de programas automatizados para copiar e analisar conteúdo de veículos, inclusive para treinar sistemas de inteligência artificial. A decisão atende ação da ANJ, da Abert e da Aner. Em caso de descumprimento, a multa é de R$ 1 milhão por dia, limitada a R$ 100 milhões.",
 "fundo": [
  [
   "p",
   "Segundo o Correio Braziliense, o juiz Guilherme Madeira Dezem proibiu a Meta de coletar e usar os conteúdos sem autorização e determinou que a empresa mantenha as contas, páginas e ferramentas dos veículos associados, sem bloqueios ou punições por recusarem as novas condições. As regras entrariam em vigor em 20 de novembro, e a autorização abrangeria materiais publicados fora da Meta. A ordem vale até o julgamento definitivo da ação."
  ],
  [
   "p",
   "Em 28 de outubro, um tribunal da Noruega também suspendeu temporariamente as novas regras, após ação de 10 grupos de mídia do país."
  ]
 ],
 "fontes": [
  [
   "Correio Braziliense",
   "https://www.correiobraziliense.com.br/politica/2026/11/7532787-justica-suspende-novas-regras-da-meta-para-uso-de-conteudo-jornalistico.html"
  ]
 ]
};

S.lulasaude = {
 "ed": "politica",
 "k": "Política · Governo",
 "hora": "4/11",
 "t": "Lula faz avaliação de rotina no Sírio-Libanês e hospital diz que exames estão normais",
 "sub": "Boletim divulgado na noite de terça aponta que “todos os resultados estão dentro da normalidade”.",
 "resumo": "O presidente Lula fez na terça (3) uma avaliação médica de rotina, agendada previamente, no Hospital Sírio-Libanês, em São Paulo. Segundo o boletim divulgado às 23h, “todos os resultados estão dentro da normalidade”. Ele segue acompanhado pelos médicos Roberto Kalil Filho e Ana Helena Germoglio. A Itatiaia informou que, após os exames, Lula recebeu alta e voltou a Brasília, onde manteve a agenda de quarta.",
 "fundo": [
  [
   "p",
   "O boletim não detalha quais exames foram feitos. O Poder360 e o DGABC registraram o episódio. Na quarta (4), segundo a Itatiaia, o presidente reuniu-se com o vice, Geraldo Alckmin, e ministros para definir ações ambientais antes da COP31, conforme O Tempo. O Liberal informou que Lula viajará com Motta e Alcolumbre para a COP31 e as Filipinas."
  ]
 ],
 "fontes": [
  [
   "DGABC",
   "https://www.dgabc.com.br/Noticia/4366728/lula-passa-por-exames-medicos-em-sao-paulo-veja-o-resultado"
  ],
  [
   "Itatiaia",
   "https://www.itatiaia.com.br/politica/apos-exames-em-sp-lula-recebe-alta-e-retorna-a-brasilia/"
  ],
  [
   "O Liberal",
   "https://www.oliberal.com/politica/lula-viajara-com-motta-e-alcolumbre-para-a-cop-31-e-as-filipinas-1.1190034"
  ]
 ]
};

S.psdb = {
 "ed": "politica",
 "k": "Política · Partidos",
 "hora": "4/11",
 "t": "PSDB prepara 2028 com foco no Norte e Nordeste, a partir de Alagoas e Tocantins",
 "sub": "Aécio Neves preside reunião com os governadores eleitos JHC e Vicentinho Júnior. Partido não elegeu prefeito de capital em 2024.",
 "resumo": "O PSDB iniciou a preparação para as eleições municipais de 2028, com foco no Norte e no Nordeste. Em reunião ampliada da Executiva Nacional, presidida por Aécio Neves, a sigla decidiu usar as vitórias nos governos de Alagoas, com JHC, e do Tocantins, com Vicentinho Júnior, para ampliar suas bases. Em 2026, o partido elegeu dois governadores, dois senadores e 11 deputados federais, contra 13 antes.",
 "fundo": [
  [
   "p",
   "Segundo o Congresso em Foco, participaram da reunião os prefeitos Igor Normando (Belém) e Léo Bezerra (João Pessoa), que entraram no PSDB em 2026. Em 2024, o partido elegeu 273 prefeitos, contra 523 em 2020, e pela primeira vez desde a fundação, em 1988, não elegeu prefeito de capital. Os senadores eleitos são Plínio Valério (AM) e Marina Candia (AL), esposa de JHC. A federação PSDB-Cidadania superou a cláusula de desempenho e mantém acesso aos fundos Eleitoral e Partidário. O Tempo também registrou a fala de Aécio."
  ]
 ],
 "fontes": [
  [
   "Congresso em Foco",
   "https://www.congressoemfoco.com.br/noticia/131318/psdb-prepara-estrategia-eleitoral-de-2028-com-foco-no-norte-e-nordeste"
  ]
 ]
};

S.orcamento = {
 "ed": "economia",
 "k": "Economia",
 "hora": "4/11",
 "t": "Eduardo Braga será relator do Orçamento de R$ 7,4 trilhões para 2027",
 "sub": "Votação em plenário está marcada para 17 de dezembro. Salário mínimo previsto é de R$ 1.741.",
 "resumo": "O senador Eduardo Braga (MDB-AM) foi escolhido relator-geral do Orçamento da União de 2027, anunciou o Congresso na terça (3). O projeto prevê despesas de R$ 7,4 trilhões, incluindo o refinanciamento da dívida, limite de despesas primárias de R$ 2,576 trilhões e superávit primário de R$ 18,6 bilhões. O relator disse que a análise deve ser feita até 2 de dezembro.",
 "fundo": [
  [
   "p",
   "Segundo o Congresso em Foco, a indicação saiu após reunião de líderes com o presidente do Senado, Davi Alcolumbre, e com o presidente da Comissão Mista de Orçamento, deputado Domingos Neto (PSD-CE). Braga foi relator-geral em 2016. Ele prometeu priorizar saúde, educação, infraestrutura e segurança, com equilíbrio fiscal. A LDO de 2027 ainda não foi aprovada."
  ],
  [
   "p",
   "O projeto (PLN 24/2026), enviado em agosto, prevê salário mínimo de R$ 1.741, investimentos de R$ 133,8 bilhões e emendas individuais e de bancada de R$ 44,8 bilhões. O limite de despesas primárias representa alta de 7,7% sobre 2026."
  ],
  [
   "tl",
   [
    [
     "9 a 11/11",
     "Audiências públicas"
    ],
    [
     "16 a 27/11",
     "Prazo para emendas"
    ],
    [
     "até 9/12",
     "LDO na CMO"
    ],
    [
     "16/12",
     "Relatório-geral"
    ],
    [
     "17/12",
     "Votação no plenário do Congresso"
    ]
   ]
  ]
 ],
 "fontes": [
  [
   "Congresso em Foco (relator)",
   "https://www.congressoemfoco.com.br/noticia/131287/eduardo-braga-sera-relator-do-orcamento-de-r-7-4-trilhoes-para-2027"
  ],
  [
   "Congresso em Foco (prazo)",
   "https://www.congressoemfoco.com.br/noticia/131316/analise-do-orcamento-deve-ser-feita-ate-2-de-dezembro-afirma-relator"
  ]
 ]
};

S.betsaud = {
 "ed": "economia",
 "k": "Economia · Apostas",
 "hora": "3/11",
 "t": "Em audiência no STF, governo defende a proibição das bets; clubes pedem transição",
 "sub": "Fux diz estar convencido de que as apostas devem ser banidas. Flamengo estima perda de R$ 430 milhões.",
 "resumo": "Na audiência pública do STF sobre a proibição das apostas online, o relator, ministro Luiz Fux, disse estar convencido de que as bets devem ser banidas, sem antecipar o entendimento do colegiado. O advogado-geral da União, Jorge Messias, pediu a manutenção integral da MP e citou pesquisa Datafolha segundo a qual 78% apoiam a proibição. Clubes de futebol criticaram a suspensão imediata e pediram um período de transição.",
 "fundo": [
  [
   "p",
   "Segundo o Correio Braziliense, a audiência foi convocada por Fux na ADI 8.027, ação de entidades do setor que pede a suspensão da MP. Dos 34 representantes convocados, pelo menos 22 eram contrários à proibição. Abras, CNC e CNI apoiam a medida. O ministro Alexandre Padilha citou 28 milhões de brasileiros que apostaram nos últimos 12 meses, 11 milhões deles com comportamento de risco. O ministro da Justiça, Wellington César de Lima e Silva, disse que o governo analisou alternativas de regulamentação antes de optar pela suspensão."
  ],
  [
   "p",
   "O vice-presidente do Flamengo, Flávio Willeman, estimou perda de R$ 430 milhões em receitas e cerca de 1,2 mil empregos afetados. Representantes de Fluminense, Botafogo, Corinthians, Cruzeiro e São Paulo pediram transição. A MP ainda precisa ser apreciada pelo Congresso. Na quarta (4), a Folha de Pernambuco informou que Fachin sinalizou pautar em conjunto o julgamento sobre bets no STF."
  ]
 ],
 "fontes": [
  [
   "Correio Braziliense",
   "https://www.correiobraziliense.com.br/politica/2026/11/7532729-proibicao-das-bets-divide-governo-e-clubes-em-audiencia-no-supremo.html"
  ]
 ]
};

S.sp_barba = {
 "ed": "regioes",
 "k": "Regiões · São Paulo",
 "hora": "4/11",
 "t": "Deputado Teonilio Barba defende “oxigenar o PT” após a vitória de Lula e cobra calma sobre 2026 em São Paulo",
 "sub": "Petista, eleito para o quarto mandato na Alesp, diz que partido deve atuar de forma articulada como oposição a Tarcísio.",
 "resumo": "O deputado estadual Teonilio Barba (PT), eleito para o quarto mandato na Assembleia Legislativa de São Paulo, defendeu que a vitória de Lula sobre Flávio Bolsonaro abre espaço para o PT rever seus rumos e renovar quadros: “Precisamos oxigenar o PT, trazer gente nova”. Em entrevista ao podcast Política em Cena, ele disse que a juventude foi decisiva e que o partido deve atuar de forma articulada como oposição ao governo Tarcísio de Freitas.",
 "fundo": [
  [
   "p",
   "Segundo o DGABC, Barba avaliou que o partido deve atrair novas gerações e dialogar com temas como a inteligência artificial. Sobre candidaturas ao governo paulista, como a do prefeito de Mauá, disse: “Temos que ter calma e cuidado”. Em São Bernardo, afirmou que a decisão sobre apoiar a reeleição de Marcelo Lima (Podemos) em 2028 será interna, mas que “na minha cabeça não passa apoiar o Marcelo Lima em 2028”. Sobre a Alesp: “Lá dentro, você vira apenas um voto e o mundo é outro”."
  ],
  [
   "p",
   "Em São Paulo, a capital e o Grande ABC também discutem a PEC da Segurança. O prefeito Ricardo Nunes (MDB) aproveita o texto para propor a mudança da GCM para Polícia Municipal, conforme o Metrópoles."
  ]
 ],
 "fontes": [
  [
   "DGABC",
   "https://www.dgabc.com.br/Noticia/4366918/barba-defende-oxigenacao-do-pt-apos-vitoria-de-lula"
  ]
 ],
 "reg": "sp"
};

S.mg_tce = {
 "ed": "regioes",
 "k": "Regiões · Minas Gerais",
 "hora": "4/11",
 "t": "TCE-MG suspende R$ 32 milhões em patrocínios de estatais a Atlético, Cruzeiro e América",
 "sub": "Liminar atende representação do governador eleito Cleitinho, que aponta desvio de finalidade.",
 "resumo": "O Tribunal de Contas de Minas suspendeu, em liminar, patrocínios de R$ 32 milhões de estatais mineiras a clubes de futebol. Os contratos envolvem Cemig, Codemge, Codemig e Invest Minas e as sociedades anônimas do Atlético, do Cruzeiro e do América. A decisão atende representação do governador eleito, Cleitinho Azevedo (Republicanos), que aponta indícios de desvio de finalidade. O governo disse, segundo a Itatiaia, que não havia respondido até a publicação.",
 "fundo": [
  [
   "p",
   "Segundo a Itatiaia, o governo anunciou os patrocínios em 29 de setembro, para compensar os clubes pela perda de receita causada pela medida provisória federal que proibiu a publicidade de bets. A representação foi protocolada em 20 de outubro, e a liminar saiu em 3 de novembro. A representação aponta falta de estudos de viabilidade, de critérios objetivos para escolher beneficiários e definir preços, e descumprimento de regras de governança. Também questiona o gasto diante da situação fiscal do estado, com dívida de R$ 179,3 bilhões e caixa líquido negativo de R$ 11,3 bilhões no fim de 2025."
  ],
  [
   "p",
   "O relator, conselheiro em exercício Licurgo Mourão, entendeu, em análise preliminar, que a finalidade do patrocínio, fortalecer a marca da estatal, diverge da finalidade pública alegada, recompor receitas dos clubes. Cleitinho foi eleito governador no primeiro turno."
  ]
 ],
 "fontes": [
  [
   "Itatiaia",
   "https://www.itatiaia.com.br/politica/tce-suspende-patrocinio-de-r-32-milhoes-de-estatais-mineiras-a-clubes-de-futebol-de-bh/"
  ]
 ],
 "reg": "mg"
};

S.mg_china = {
 "ed": "regioes",
 "k": "Regiões · Minas Gerais",
 "hora": "4/11",
 "t": "Mateus Simões leva missão à China com o ex-adversário Flávio Roscoe, da Fiemg",
 "sub": "Governador participou em Xangai do Brazil China Business Forum e se reuniu com a mineradora CMOC.",
 "resumo": "O governador Mateus Simões esteve em Xangai na quarta (4), em missão organizada pela Fiemg e pelo governo de Minas para ampliar negócios com o mercado chinês, com foco em mineração. Na comitiva estava o presidente da Fiemg, Flávio Roscoe, que foi adversário de Simões na disputa pelo governo, segundo O Tempo. A agenda incluiu a abertura do Brazil China Business Forum e encontro com a CMOC.",
 "fundo": [
  [
   "p",
   "Segundo O Tempo, a China respondeu por mais de 36% das exportações mineiras em 2026 até setembro, cerca de US$ 11,8 bilhões. Nos últimos quatro anos, investimentos chineses em Minas superaram R$ 500 milhões e geraram mais de 2 mil empregos diretos. Integraram a comitiva secretários estaduais e dirigentes da Codemge e da Invest Minas."
  ]
 ],
 "fontes": [
  [
   "O Tempo",
   "https://www.otempo.com.br/politica/aparte/2026/11/4/separados-pela-eleicao-mateus-simoes-e-flavio-roscoe-se-reencontram-na-china"
  ]
 ],
 "reg": "mg"
};

S.mg_ipva = {
 "ed": "regioes",
 "k": "Regiões · Minas Gerais",
 "hora": "4/11",
 "t": "Projeto que isenta de IPVA pessoas com doenças raras e síndrome de Down está pronto para o plenário da ALMG",
 "sub": "Comissão de Fiscalização Financeira deu parecer favorável em segundo turno ao PL 779/19, do deputado Cristiano Silveira (PT).",
 "resumo": "A Comissão de Fiscalização Financeira e Orçamentária da Assembleia de Minas deu parecer favorável, em segundo turno, ao PL 779/19, que amplia a isenção de IPVA para pessoas com síndrome de Down e doenças raras. O projeto, do deputado Cristiano Silveira (PT), pode agora ser votado em definitivo pelo plenário. Para doenças raras, seria a primeira previsão do benefício em norma estadual.",
 "fundo": [
  [
   "p",
   "Segundo O Tempo, o relator, deputado João Magalhães (PSD), apresentou substitutivo que incorpora emenda de Carlos Henrique (Republicanos): a isenção poderá ser concedida mesmo quando o veículo estiver em nome do representante legal. A síndrome de Down já consta em decreto, mas passaria a estar expressamente na lei. A isenção para doenças raras só valeria 180 dias após a publicação, prazo de adaptação do estado."
  ]
 ],
 "fontes": [
  [
   "O Tempo",
   "https://www.otempo.com.br/politica/2026/11/4/isencao-de-ipva-para-pessoas-com-doencas-raras-e-sindrome-de-down"
  ]
 ],
 "reg": "mg"
};

S.ba_blocos = {
 "ed": "regioes",
 "k": "Regiões · Nordeste · Bahia",
 "hora": "4/11",
 "t": "PDT e MDB negociam bloco de sete deputados na Assembleia da Bahia; grupo de Carletto avalia ir ao Podemos",
 "sub": "Rearranjos partidários miram a cláusula de desempenho e as comissões da AL-BA a partir de fevereiro.",
 "resumo": "PDT e MDB avançam nas conversas para formar um bloco parlamentar de sete deputados na Assembleia Legislativa da Bahia a partir de fevereiro, para ampliar a participação na Mesa e nas comissões, segundo o Bahia Notícias. Em outra frente, o grupo de Ronaldo Carletto, presidente estadual do Avante, negocia migrar para o Podemos, caso a federação Avante-PRD-Solidariedade não seja reconhecida.",
 "fundo": [
  [
   "p",
   "O deputado eleito Luciano Pinheiro (PDT) e o presidente de honra do MDB, Lúcio Vieira Lima, confirmaram a articulação. O PDT elegeu cinco deputados e o MDB, dois, o “número mágico” citado por Lúcio. Os dois partidos integram a base do governo estadual. O PDT não atingiu a cláusula de desempenho em 2026, e há discussões judiciais sobre federações."
  ],
  [
   "p",
   "No caso do Avante, dois dos três deputados federais eleitos, Elmo Vaz e Neto Carletto, acompanhariam a mudança. Em 29 de outubro, a Procuradoria-Geral Eleitoral se manifestou a favor de somar os votos da federação para a cláusula de desempenho, mas não para a distribuição de cadeiras. Se o TSE aceitar, o Avante mantém fundo partidário e tempo de TV. O Podemos elegeu 27 deputados federais."
  ]
 ],
 "fontes": [
  [
   "Bahia Notícias (PDT e MDB)",
   "https://www.bahianoticias.com.br/noticia/323303-pdt-e-mdb-negociam-formacao-de-bloco-com-sete-deputados-na-assembleia-legislativa"
  ],
  [
   "Bahia Notícias (Carletto)",
   "https://www.bahianoticias.com.br/noticia/323263-grupo-de-carletto-negocia-migrar-para-podemos-mas-federacao-avante-prd-e-solidariedade-pode-mudar-planos-entenda-cenario"
  ]
 ],
 "reg": "ne"
};

S.ba_jeronimo = {
 "ed": "regioes",
 "k": "Regiões · Nordeste · Bahia",
 "hora": "4/11",
 "t": "Jerônimo: sucessor de Lula “não precisa ser necessariamente do PT” e Nordeste não quer ser “só fonte de voto”",
 "sub": "Governador reeleito da Bahia cobra mais espaço para a região no PT e no governo do quarto mandato.",
 "resumo": "O governador reeleito da Bahia, Jerônimo Rodrigues (PT), disse a O Globo que o sucessor de Lula “não precisa ser necessariamente do PT” e que deve vir de um campo que dê continuidade ao projeto do governo. Ele citou o vice Geraldo Alckmin (PSB) como exemplo de liderança fora do partido, mas afirmou que ainda é cedo para nomes. Cobrou mais espaço para o Nordeste: “Não queremos ser só fonte de voto.”",
 "fundo": [
  [
   "p",
   "Segundo a entrevista, republicada pela Folha de Pernambuco, Jerônimo lembrou que a região tem quatro governadores petistas e a maior parte dos senadores do partido. Também comentou a investigação sobre a redução da frota de ônibus em Salvador no segundo turno, defendeu a apuração de casos envolvendo o senador Jaques Wagner e citou ações de segurança pública. No Maranhão, o Imparcial registra que nomes do estado ganham força nas articulações para ministérios de Lula, entre eles Eliziane Gama (PT), cotada para Direitos Humanos."
  ]
 ],
 "fontes": [
  [
   "Folha de Pernambuco",
   "https://www.folhape.com.br/politica/sucessor-de-lula-nao-precisa-necessariamente-ser-do-pt-diz/522425/"
  ],
  [
   "O Imparcial",
   "https://oimparcial.com.br/politica/2026/11/nomes-do-maranhao-ganham-forca-nas-articulacoes-para-ministerios-de-lula/"
  ]
 ],
 "reg": "ne"
};

S.pe_emprestimo = {
 "ed": "regioes",
 "k": "Regiões · Nordeste · Pernambuco",
 "hora": "4/11",
 "t": "Alepe autoriza Raquel Lyra a contratar empréstimo de até R$ 1,935 bilhão",
 "sub": "Aprovação foi unânime, em dois turnos. Recursos financiariam obras hídricas, estradas, hospitais e escolas.",
 "resumo": "A Assembleia Legislativa de Pernambuco autorizou, por unanimidade e em sessão extraordinária na quarta (4), o governo estadual a contratar empréstimo de até R$ 1,935 bilhão. O valor corresponde ao espaço fiscal do estado em 2027. O projeto, enviado pela governadora Raquel Lyra em 8 de outubro, tramitou em regime de urgência e segue para sanção.",
 "fundo": [
  [
   "p",
   "Segundo a Folha de Pernambuco, o deputado Diogo Moraes disse que os recursos financiariam projetos já previstos, como obras hídricas, estradas, reformas de hospitais e construção de escolas. O texto não indica o banco: fala apenas em instituições financeiras nacionais. A operação pode ser feita com ou sem garantia da União; sem ela, o estado pode oferecer receitas do ICMS e do FPE como contragarantia. A aprovação não libera os recursos de imediato."
  ]
 ],
 "fontes": [
  [
   "Folha de Pernambuco",
   "https://www.folhape.com.br/colunistas/blogdafolha/alepe-autoriza-governo-de-pernambuco-a-contratar-emprestimo-de-r-19-bilhao/60835/"
  ]
 ],
 "reg": "ne"
};

S.ce_mpe = {
 "ed": "regioes",
 "k": "Regiões · Nordeste · Ceará",
 "hora": "4/11",
 "t": "MP Eleitoral pede cassação de Yury do Paredão e Davi de Raimundão, do MDB, por abuso de poder",
 "sub": "Ação diz que carreta de saúde do Cariri foi usada como ferramenta eleitoral. Anulação dos votos pode mudar a bancada cearense.",
 "resumo": "O Ministério Público Eleitoral pediu a cassação do deputado federal reeleito Yury do Paredão e do deputado estadual eleito Davi de Raimundão, ambos do MDB do Ceará, por abuso de poder político e econômico. Segundo a ação, o programa “Carreta Conectados pela Cura”, unidade móvel de saúde, foi usado como ferramenta eleitoral no Cariri. Os pedidos incluem a anulação dos votos e a inelegibilidade por oito anos.",
 "fundo": [
  [
   "p",
   "De acordo com O Povo, o procurador regional eleitoral Celso Costa Lima Verde Leal diz que o serviço era promovido pelo Instituto Dra. Yanny Brena, presidido pela mãe de Yury, e que o deputado destinou emendas à unidade. Os procedimentos saltaram de cerca de 300 por ano entre 2023 e 2025 para 3.773 até 1º de outubro de 2026; moradores de Juazeiro do Norte passaram de 2,6% dos atendimentos para 83,4%, e 62,7% da produção de 2026 ocorreu no período de campanha."
  ],
  [
   "p",
   "A anulação dos votos levaria à retotalização. Segundo cálculos citados por O Povo, o MDB poderia perder as duas cadeiras na Câmara, com Eduardo Bismarck (PV) e Renato Roseno (PSOL) podendo assumir. Yury afirmou, por nota, que mantém parceria com o instituto, que atua em ações sociais. Davi disse não ter sido notificado e confiar na Justiça Eleitoral."
  ]
 ],
 "fontes": [
  [
   "O Povo",
   "https://www.opovo.com.br/noticias/politica/eleicoes/2026/11/04/mp-eleitoral-pede-cassacao-e-anulacao-dos-votos-de-yury-do-paredao-e-de-davi-de-raimundao.html"
  ]
 ],
 "reg": "ne"
};

S.ce_gastos = {
 "ed": "regioes",
 "k": "Regiões · Nordeste · Ceará",
 "hora": "4/11",
 "t": "Elmano e Ciro declararam mais de R$ 10 milhões cada em gastos de campanha no Ceará",
 "sub": "Reeleito, Elmano gastou R$ 11,34 milhões. A maior despesa de ambos foi impulsionamento nas redes.",
 "resumo": "Os candidatos ao governo do Ceará Elmano de Freitas (PT), reeleito, e Ciro Gomes (PSDB) declararam mais de R$ 10 milhões cada em gastos de campanha, segundo dados do TSE levantados por O Povo. Elmano arrecadou R$ 13,16 milhões e gastou R$ 11,34 milhões. Ciro declarou receitas de R$ 12,48 milhões.",
 "fundo": [
  [
   "p",
   "A maior despesa de Elmano foi R$ 5,89 milhões à DLocal Brasil, para impulsionamento nas redes, cerca de 52% do total. Ciro pagou R$ 4,5 milhões à Polis Propaganda & Marketing e R$ 2,6 milhões ao Facebook. As duas campanhas somaram mais de R$ 1,6 milhão em transporte aéreo."
  ],
  [
   "p",
   "Entre os doadores de Elmano estão Pedro Grendene Bartelle (R$ 5 milhões), Maria Consuelo Saraiva Leão Dias Branco (R$ 1,68 milhão) e o PT nacional (R$ 1,15 milhão). Ciro recebeu R$ 7,3 milhões do PSDB nacional, R$ 1 milhão de Manoel Salviano Sobrinho e R$ 1 milhão de Tasso Jereissati. A reportagem ressalta que os números da Biblioteca de Anúncios da Meta não coincidem com os declarados ao TSE."
  ],
  [
   "p",
   "Na Assembleia, segundo o Diário do Nordeste, a Alece aprovou projeto de transferência de armas a agentes de segurança aposentados e da reserva."
  ]
 ],
 "fontes": [
  [
   "O Povo",
   "https://www.opovo.com.br/noticias/politica/eleicoes/2026/11/04/elmano-e-ciro-gastam-cada-um-mais-de-rs-10-milhoes-na-campanha.html"
  ]
 ],
 "reg": "ne"
};

S.ma_tce = {
 "ed": "regioes",
 "k": "Regiões · Nordeste · Maranhão",
 "hora": "4/11",
 "t": "Braide pode herdar três vagas no TCE do Maranhão",
 "sub": "Impasse sobre as cadeiras pode ficar para a transição; Dino suspendeu nomeações.",
 "resumo": "O governador eleito do Maranhão, Eduardo Braide (PSD), pode herdar a indicação de vagas no Tribunal de Contas do Estado, se o impasse seguir até o fim da gestão de Carlos Brandão (MDB). Há três cadeiras abertas: duas cabem à Assembleia e uma ao Executivo. A mais recente surgiu com a aposentadoria de João Jorge Pavão, em 30 de outubro, quatro dias antes de ele completar 75 anos.",
 "fundo": [
  [
   "p",
   "Segundo O Imparcial, Washington Oliveira saiu em 2024 e Álvaro César em 2025. A vaga de Álvaro cabe ao governador, e Brandão indicou o advogado Flávio Vinicius Araújo Costa, mas a nomeação foi suspensa pelo ministro Flávio Dino, do STF, em ação sobre as regras de preenchimento. O sobrinho do governador, Daniel Brandão, também está afastado por decisão de Dino desde agosto. Sem as indicações, o tribunal funciona com titulares reduzidos e conselheiros substitutos. A eleição da Mesa da Assembleia, em fevereiro, deve medir a articulação de Braide."
  ]
 ],
 "fontes": [
  [
   "O Imparcial",
   "https://oimparcial.com.br/politica/2026/11/braide-pode-herdar-tres-vagas-no-tce-ma/"
  ]
 ],
 "reg": "ne"
};

S.al_trans = {
 "ed": "regioes",
 "k": "Regiões · Nordeste · Alagoas",
 "hora": "4/11",
 "t": "Em Alagoas, Paulo Dantas abre a transição para JHC: “Eleição acabou”",
 "sub": "Governador eleito pede que a atual gestão evite novas despesas, nomeações e empréstimos. Decisão sobre a Arsal gera reação.",
 "resumo": "O governador de Alagoas, Paulo Dantas, abriu a transição de governo e defendeu diálogo com o governador eleito, JHC (PSDB): “Eleição acabou”, segundo a Gazeta de Alagoas. JHC pediu que o governo evite novas despesas, nomeações e empréstimos durante a transição e indicou o ex-presidente do Iplam para a equipe. Dantas também reagiu a decisão sobre a Arsal e sustentou a legalidade da escolha de Otávio Lessa para comandar a agência reguladora.",
 "fundo": [
  [
   "p",
   "A matéria sobre a transição e as manchetes da Gazeta de Alagoas não detalham o conteúdo da decisão sobre a Arsal nem o valor de eventuais empréstimos. A Itatiaia registrou que o vice de Flávio Bolsonaro, sem mandato em 2027, mira a Prefeitura de Maceió em 2028. O PSDB de Aécio Neves quer usar o governo de Alagoas como vitrine para 2028."
  ]
 ],
 "fontes": [
  [
   "Gazeta de Alagoas (transição)",
   "https://www.gazetaweb.com/noticias/politica/paulo-dantas-abre-transicao-e-defende-dialogo-com-jhc-eleicao-acabou-946821"
  ],
  [
   "Gazeta de Alagoas (JHC)",
   "https://www.gazetaweb.com/noticias/politica/jhc-pede-que-governo-de-al-evite-novas-despesas-nomeacoes-e-emprestimos-durante-transicao-945970"
  ],
  [
   "Gazeta de Alagoas (Arsal)",
   "https://www.gazetaweb.com/noticias/politica/paulo-dantas-reage-a-decisao-sobre-arsal-e-sustenta-legalidade-da-escolha-de-otavio-lessa-946826"
  ]
 ],
 "reg": "ne"
};

S.sc_alesc = {
 "ed": "regioes",
 "k": "Regiões · Sul · Santa Catarina",
 "hora": "4/11",
 "t": "Na Alesc, Mesa Diretora está “praticamente definida” e traições eleitorais seguem na memória",
 "sub": "Deputados discutiram pauta final da legislatura. Dr. Vicente Caropreso defende destinar emendas a entidades de pessoas com deficiência.",
 "resumo": "Na conversa informal que encerrou a sessão da terça (3), deputados da Assembleia Legislativa de Santa Catarina trataram da pauta final da legislatura e do resultado das urnas, segundo o ND Mais. A composição da Mesa Diretora está “praticamente definida”. O deputado Dr. Vicente Caropreso (União Brasil) defendeu destinar parte das emendas impositivas a instituições que atendem pessoas com deficiência e autismo e punir gestores que deixam de executar recursos para obras e serviços.",
 "fundo": [
  [
   "p",
   "Segundo a reportagem, há deputados cobrando explicações, outros fazendo contas e alguns insatisfeitos com traições eleitorais. A “ressaca eleitoral” deve durar mais algumas sessões. O ND Mais cita, em link relacionado, um acordo entre o governador Jorginho Mello (PL), reeleito, e a bancada do PL para o comando da Casa, sem detalhar o conteúdo."
  ]
 ],
 "fontes": [
  [
   "ND Mais",
   "https://ndmais.com.br/politica/roda-de-conversa-na-alesc-tem-projetos-na-pauta-e-traicoes-eleitorais-ainda-na-memoria/"
  ]
 ],
 "reg": "sul"
};

S.pr_cwb = {
 "ed": "regioes",
 "k": "Regiões · Sul · Paraná",
 "hora": "4/11",
 "t": "Curitiba começa a transição da Guarda Municipal para Polícia Municipal, um dia após a PEC no Senado",
 "sub": "Prefeitura de Eduardo Pimentel inicia estudos técnicos e jurídicos; não há prazo.",
 "resumo": "A Prefeitura de Curitiba, comandada por Eduardo Pimentel, determinou o início da transição da Guarda Municipal para Polícia Municipal, um dia depois de o Senado aprovar a PEC da Segurança Pública. A Secretaria de Defesa Social e Trânsito conduzirá o planejamento, com estudos técnicos, jurídicos e administrativos para adequar a corporação às regras da PEC. Não há prazo, e a mudança depende da promulgação do texto.",
 "fundo": [
  [
   "p",
   "Segundo a Gazeta do Povo, até lá a Guarda mantém suas atribuições. O governo estadual, segundo a mesma publicação, planeja criar um parque estadual na região de praias de água doce do Rio Paraná, e a Ponte da Integração, na fronteira, tem novas regras de travessia de veículos. Em São Paulo, Ricardo Nunes propõe mudança semelhante para a GCM, segundo o Metrópoles."
  ]
 ],
 "fontes": [
  [
   "Gazeta do Povo",
   "https://www.gazetadopovo.com.br/parana/curitiba-inicia-transicao-da-guarda-municipal-para-policia-municipal/"
  ]
 ],
 "reg": "sul"
};

S.rs_zucco = {
 "ed": "regioes",
 "k": "Regiões · Sul · Rio Grande do Sul",
 "hora": "2/11",
 "t": "Schirmer, do MDB, defende união de partidos no governo Zucco e vê “consagração” do centro-direita",
 "sub": "Secretário de Porto Alegre coordenou a campanha do governador eleito mesmo com o MDB tendo candidato próprio.",
 "resumo": "O secretário municipal de Planejamento e Gestão de Porto Alegre, Cezar Schirmer, hoje afastado do MDB, defende a união de vários partidos em torno do governo de Luciano Zucco (PL), eleito governador do Rio Grande do Sul. Schirmer coordenou a campanha de Zucco, mesmo com o MDB tendo lançado o vice-governador Gabriel Souza ao governo. Ele classificou a eleição como “consagradora” para o centro-direita.",
 "fundo": [
  [
   "p",
   "O texto do Jornal do Comércio está disponível apenas para assinantes, e só a introdução pôde ser lida, sem detalhes sobre os partidos ou as ações previstas. Em outubro, segundo o mesmo jornal, Zucco reuniu-se com os governadores eleitos do Sul, Jorginho Mello (SC) e Sergio Moro (PR), todos do PL, para debater pautas conjuntas da região."
  ]
 ],
 "fontes": [
  [
   "Jornal do Comércio",
   "https://www.jornaldocomercio.com/politica/2026/11/1268931-schirmer-defende-uniao-de-partidos-no-governo-zucco.html"
  ],
  [
   "Jornal do Comércio (reunião)",
   "https://www.jornaldocomercio.com/politica/2026/10/1266277-zucco-se-reune-com-governadores-eleitos-no-sul-para-articular-acoes-conjuntas.html"
  ]
 ],
 "reg": "sul"
};

S.pa_parau = {
 "ed": "regioes",
 "k": "Regiões · Norte · Pará",
 "hora": "3/11",
 "t": "Câmara de Parauapebas aprova três denúncias contra o prefeito Aurélio Goiano, por 8 votos a 7",
 "sub": "Comissões processantes terão 90 dias. Recebimento não significa cassação.",
 "resumo": "A Câmara Municipal de Parauapebas (PA) aceitou três denúncias por supostas infrações político-administrativas contra o prefeito Aurélio Goiano. Cada denúncia foi aprovada por 8 votos a 7. Os vereadores já haviam analisado as matérias em agosto, mas decisão judicial de 28 de outubro anulou o recebimento anterior por questões procedimentais, sem julgar o mérito.",
 "fundo": [
  [
   "p",
   "Segundo O Liberal, as denúncias tratam de suposto racismo religioso, ligado a declarações sobre religiões de matriz africana; suposta omissão em responder pedidos de informação de vereadores; e suposta falta de publicação, no Diário Oficial Eletrônico, de decretos de crédito suplementar. Três comissões processantes vão instruir os processos e elaborar relatórios para o plenário, com prazo legal de 90 dias a partir da notificação do prefeito. A Prefeitura não respondeu ao pedido de manifestação até a publicação."
  ]
 ],
 "fontes": [
  [
   "O Liberal",
   "https://www.oliberal.com/politica/camara-de-parauapebas-aprova-tres-denuncias-contra-aurelio-goiano-1.1189983"
  ]
 ],
 "reg": "norte"
};

S.ms_assoma = {
 "ed": "regioes",
 "k": "Regiões · Centro-Oeste · Mato Grosso do Sul",
 "hora": "4/11",
 "t": "Assomasul gastou R$ 596,6 mil com restaurantes e viagens no primeiro semestre, mostra levantamento",
 "sub": "Entidade diz que as despesas são institucionais e constam de prestação de contas aprovada em assembleia.",
 "resumo": "A Associação dos Municípios de Mato Grosso do Sul gastou R$ 596,6 mil com restaurantes, viagens e representações entre janeiro e junho de 2026, segundo levantamento do Correio do Estado. Com passagens da Marcha a Brasília e veículos, o total chega a R$ 896,6 mil. A Assomasul diz que os gastos são institucionais. O presidente, Thalles Tomazelli (PL), não quis comentar.",
 "fundo": [
  [
   "p",
   "Segundo o levantamento, R$ 159,1 mil foram para restaurantes e churrascarias, e R$ 437,5 mil para viagens e representações, dos quais R$ 424,5 mil em passagens aéreas. A receita total foi de R$ 11,17 milhões, com repasses de prefeituras de R$ 3,62 milhões, cerca de 32%. A despesa foi de R$ 10,67 milhões, com superávit de R$ 503 mil. A entidade afirma que as despesas ligam-se a reuniões com gestores e parlamentares e que as contas foram aprovadas pela Assembleia Geral; não apresentou a lista de beneficiários das viagens."
  ]
 ],
 "fontes": [
  [
   "Correio do Estado",
   "https://correiodoestado.com.br/politica/2026/11/04/bancada-por-prefeituras-assomasul-gasta-r-5966-mil-apenas-com-restaurantes-e-viagens.html"
  ]
 ],
 "reg": "co"
};

S.ms_senado = {
 "ed": "regioes",
 "k": "Regiões · Centro-Oeste · Mato Grosso do Sul",
 "hora": "4/11",
 "t": "Azambuja, senador eleito pelo PL, e Nelsinho Trad, seu suplente, alinham atuação e debatem saúde em MS",
 "sub": "Telemedicina e demandas dos municípios, como UTI móvel para Figueirão, foram pauta do encontro.",
 "resumo": "O senador Nelsinho Trad (PSD) recebeu em seu gabinete o senador eleito Reinaldo Azambuja (PL) para tratar das prioridades de Mato Grosso do Sul e das demandas dos municípios. Saúde foi tema central, com destaque para a telemedicina e o pedido de Figueirão por uma UTI móvel. Azambuja assume o mandato como titular em fevereiro, e Nelsinho, que é seu primeiro suplente, voltará à suplência.",
 "fundo": [
  [
   "p",
   "Segundo o Correio do Estado, os dois falaram sobre atuação conjunta no Senado. Não foram informados valores, fontes de recursos nem prazos para atender a demanda de Figueirão. No mesmo dia, o jornal registrou a fala de Rogério Marinho sobre a disputa pela presidência do Senado, em que a senadora Tereza Cristina (PP-MS) também aparece como possível candidata."
  ]
 ],
 "fontes": [
  [
   "Correio do Estado",
   "https://correiodoestado.com.br/politica/2026/11/04/nelsinho-e-azambuja-alinham-atuacao-no-senado-e-debatem-saude-em-ms.html"
  ]
 ],
 "reg": "co"
};

S.eua_pioneiros = {
 "ed": "mundo",
 "k": "Mundo",
 "hora": "4/11",
 "t": "Democratas elegem governadoras indígena e negra e senadores gay e muçulmano nos EUA",
 "sub": "Midterms de 3 de novembro deram aos democratas a maioria na Câmara e no Senado. Brasileiro é eleito deputado estadual na Flórida.",
 "resumo": "Os democratas conquistaram a maioria na Câmara dos Representantes e no Senado nas eleições de meio de mandato de terça (3), segundo o Congresso em Foco. A reportagem destaca vitórias inéditas: Keisha Lance Bottoms, primeira governadora negra, na Geórgia; Deb Haaland, primeira governadora indígena, no Novo México; Abdul El-Sayed, primeiro senador muçulmano, em Michigan; e Chris Pappas, primeiro senador abertamente gay, em New Hampshire.",
 "fundo": [
  [
   "p",
   "Entre os republicanos, Byron Donalds venceu na Flórida e será o primeiro governador negro do estado, e Marsha Blackburn será a primeira mulher a governar o Tennessee. No Texas, Gina Hinojosa (D) derrotou Greg Abbott (R) e será a primeira governadora latina do estado; o democrata James Talarico encerrou jejum de décadas no Senado pelo Texas, segundo o DGABC. Em Ohio, Amy Acton (D) derrotou Vivek Ramaswamy (R). Em Minnesota, Peggy Flanagan (D) será a primeira mulher indígena no Senado. Hakeem Jeffries pode se tornar presidente da Câmara em janeiro, se escolhido internamente."
  ],
  [
   "p",
   "Segundo o Poder360, Donald Trump reconheceu a vitória dos democratas e disse que “fizeram um bom trabalho”, depois de postar um boné com a palavra “veto”. O Brasil 247 destaca o peso da guerra contra o Irã na derrota. O brasileiro Felipe Sousa-Lazaballet foi eleito deputado estadual na Flórida depois de viver 15 anos sem documentos, e é filho de empregada doméstica cearense, segundo O Povo."
  ]
 ],
 "fontes": [
  [
   "Congresso em Foco",
   "https://www.congressoemfoco.com.br/noticia/131285/eua-elegem-governadoras-indigena-e-negra-e-senadores-gay-e-muculmano"
  ]
 ]
};

S.mei = {ed:'economia', k:'Economia', hora:'4/11',
 t:'Congresso aprova ampliação do teto do MEI para R$ 110 mil em 2027 e R$ 140 mil em 2028',
 sub:'Proposta passou na Câmara por 461 a 4 e no Senado por unanimidade, com 78 votos.',
 dado:{n:'R$ 140 mil', l:'Teto anual do MEI em 2028, ante R$ 81 mil hoje'},
 resumo:'O Congresso aprovou a elevação do limite anual de faturamento do MEI, de R$ 81 mil para R$ 110 mil em 2027 e R$ 140 mil em 2028. Na Câmara, o placar foi de 461 a 4; no Senado, de 78 votos, sem contrários, segundo o InfoMoney. A votação integrou um conjunto de três pautas do governo com apoio de partidos de oposição.',
 fundo:[
  ['p','A ampliação do teto do Microempreendedor Individual (MEI) foi aprovada pelo Congresso na quarta-feira (4). De acordo com o InfoMoney, o limite anual de faturamento sobe de R$ 81 mil para R$ 110 mil em 2027 e para R$ 140 mil em 2028. Na Câmara, o texto recebeu 461 votos favoráveis e 4 contrários. No Senado, foi aprovado por unanimidade, com 78 votos.'],
  ['p','A reportagem inclui o tema entre três votações em que o governo Lula obteve apoio de adversários na mesma semana, ao lado da PEC da Segurança e da PEC do fim da escala 6x1. Para o InfoMoney, o resultado cria um dilema para a oposição, que votou com o governo em pautas populares às vésperas de uma legislatura em que o PL terá as maiores bancadas.'],
  ['p','O InfoMoney anota que as mesas da Câmara e do Senado serão eleitas em fevereiro de 2027 e que o próximo teste do governo será o ajuste fiscal. A matéria consultada não detalha impacto fiscal da mudança nem data de sanção.']],
 fontes:[['InfoMoney (Marina Verenicz)','https://www.infomoney.com.br/politica/lula-consegue-apoio-da-direita-em-3-votacoes-no-congresso-e-cria-dilema-para-oposicao/']]};

S.tarifas = {ed:'mundo', k:'Mundo', hora:'4/11',
 t:'Governo espera proposta dos EUA sobre tarifas até a próxima semana, depois da derrota de Trump no Congresso',
 sub:'Ministro Márcio Elias Rosa diz que "nada muda" no percurso brasileiro. Novo Congresso americano só toma posse em janeiro.',
 resumo:'A derrota dos republicanos nas eleições legislativas dos EUA abre espaço para o Brasil negociar as tarifas, mas não as suspende automaticamente, segundo o InfoMoney. O governo espera receber até a próxima semana uma proposta americana indicando setores com possível redução. O novo Congresso toma posse em janeiro de 2027.',
 fundo:[
  ['p','Segundo o InfoMoney, a vitória democrata nas eleições de meio de mandato dos EUA abre uma nova frente para o Brasil negociar as tarifas impostas pelo governo Trump, sem significar suspensão automática. Os democratas poderão ampliar investigações, convocar integrantes do governo e propor limites às autorizações dadas ao Executivo, mas Trump mantém instrumentos legais próprios e mudanças legislativas podem enfrentar veto.'],
  ['p','O novo Congresso americano toma posse em janeiro de 2027; até lá, os republicanos seguem no comando das duas Casas. O governo brasileiro espera receber até a próxima semana uma proposta americana apontando setores com possíveis reduções tarifárias. Em 3 de novembro, o ministro do Desenvolvimento, Indústria, Comércio e Serviços, Márcio Elias Rosa, afirmou: "Não, nada, não muda absolutamente. O Brasil segue no seu percurso".'],
  ['p','A reportagem lembra que, em 30 de setembro, o chanceler Mauro Vieira e Elias Rosa se reuniram com o representante comercial americano, Jamieson Greer, em encontro do G20 em Milwaukee, e os dois países concordaram em criar um grupo de trabalho sobre barreiras tarifárias e não tarifárias. A professora Ana Carolina Marson, da FESPSP, avalia que pode haver melhora nas relações, mas "não significa uma mudança completa".']],
 fontes:[['InfoMoney (Marina Verenicz)','https://infomoney.com.br/politica/derrota-de-trump-no-congresso-pode-abrir-espaco-para-brasil-negociar-tarifas']]};


/* ---------- EDIÇÃO EXTRA 13h ---------- */
S.industria = {
 "ed": "economia",
 "k": "Economia",
 "hora": "5/11",
 "t": "Produção industrial cai 0,8% em setembro, a quarta queda em cinco meses",
 "sub": "Dado do IBGE mostra recuo em 17 dos 25 ramos. Derivados de petróleo e alimentos puxam a queda.",
 "dado": {
  "n": "−0,8%",
  "l": "Produção industrial em setembro frente a agosto · IBGE"
 },
 "resumo": "A produção industrial brasileira recuou 0,8% em setembro na comparação com agosto, segundo a Pesquisa Industrial Mensal do IBGE divulgada nesta quinta (5). É a quarta queda em cinco meses. Em relação a setembro de 2025, a queda é de 2,5%, e no terceiro trimestre o acumulado é de −1,4%. Três das quatro grandes categorias e 17 dos 25 ramos pesquisados tiveram resultado negativo.",
 "fundo": [
  [
   "p",
   "A indústria brasileira produziu 0,8% menos em setembro do que em agosto, informou o IBGE nesta quinta-feira (5), segundo o Metrópoles. O resultado se soma a uma sequência de oscilações: maio (−0,2%), junho (−1,8%), julho (+0,2%) e agosto (−0,6%, dado anterior), o que faz de setembro a quarta queda em cinco meses."
  ],
  [
   "nums",
   [
    [
     "−0,8%",
     "produção industrial em setembro, frente a agosto"
    ],
    [
     "−2,5%",
     "frente a setembro de 2025"
    ],
    [
     "−1,4%",
     "acumulado do terceiro trimestre contra o mesmo período do ano anterior"
    ],
    [
     "17 de 25",
     "ramos pesquisados com queda"
    ]
   ]
  ],
  [
   "h",
   "Onde caiu e onde subiu"
  ],
  [
   "p",
   "A maior queda foi de coque, derivados do petróleo e biocombustíveis (−4,2%). Também recuaram produtos alimentícios (−1,7%) e veículos, reboques e carrocerias (−1,2%). Entre as altas, aparecem produtos do fumo (+20,3%), indústrias extrativas (+1,7%) e produtos químicos (+1,7%)."
  ],
  [
   "h",
   "Por que importa agora"
  ],
  [
   "p",
   "O dado chega um dia depois de o Copom manter a Selic em 13,75%, decisão que entidades da indústria criticaram. O comunicado do comitê já apontava desaceleração mais acentuada da atividade doméstica."
  ]
 ],
 "fontes": [
  [
   "Metrópoles (IBGE)",
   "https://www.metropoles.com/brasil/producao-industrial-recua-08-em-setembro-diz-ibge"
  ]
 ]
};

S.durigan = {
 "ed": "economia",
 "k": "Economia",
 "hora": "5/11",
 "t": "Durigan diz que ajustes no Orçamento só seguem a Lula depois da viagem à COP31",
 "sub": "Fazenda discute ampliar a parcela do Orçamento sujeita a contingenciamento, o que depende do Congresso. Superávit de setembro foi de R$ 4,8 bilhões.",
 "dado": {
  "n": "R$ 4,84 bi",
  "l": "Superávit primário de setembro · a Fazenda esperava déficit de R$ 7,5 bi"
 },
 "resumo": "O ministro da Fazenda, Dario Durigan, afirmou nesta quinta (5) que enviará ao presidente Lula os ajustes no Orçamento depois da viagem à COP31, em Antalya, na Turquia, prevista para a próxima semana. A equipe econômica discute ampliar a parcela do Orçamento sujeita a contingenciamento, o que exige aprovação do Congresso. O governo registrou superávit de R$ 4,839 bilhões em setembro.",
 "fundo": [
  [
   "p",
   "Durigan disse que conversa diariamente com Lula, mas que não haverá novidades nos próximos dias. “Acho que quando o presidente voltar da viagem dele, a gente deve ter mais informações”, afirmou, segundo o Metrópoles, em texto publicado às 10h16."
  ],
  [
   "h",
   "Medidas em discussão"
  ],
  [
   "p",
   "Entre as ideias da equipe econômica está ampliar a parcela do Orçamento sujeita a contingenciamento. A mudança depende de aprovação do Congresso Nacional."
  ],
  [
   "h",
   "Resultado de setembro e juros"
  ],
  [
   "p",
   "O governo registrou superávit de R$ 4,839 bilhões em setembro, contra déficit de R$ 14,4 bilhões no mesmo mês de 2025, em valores correntes. A Fazenda esperava déficit de R$ 7,5 bilhões. Durigan reconheceu que o déficit acumulado ainda é alto, atribuiu-o ao governo anterior e disse que a gestão atual busca superávit a partir do próximo ano."
  ],
  [
   "p",
   "Sobre o Copom, que interrompeu cinco cortes seguidos e manteve a Selic em 13,75%, o ministro afirmou que o governo precisa criar condições para que os juros caiam de forma sustentável e estrutural."
  ]
 ],
 "fontes": [
  [
   "Metrópoles (Durigan)",
   "https://www.metropoles.com/brasil/durigan-diz-que-enviara-ajustes-no-orcamento-apos-viagem-de-lula-a-cop31"
  ]
 ]
};

S.ato_obsceno = {
 "ed": "politica",
 "k": "Política",
 "hora": "5/11",
 "t": "STF forma cinco votos para manter o crime de ato obsceno, com ressalvas à punição",
 "sub": "Ministros propõem excluir manifestações culturais e artísticas e limitar o crime a condutas de conotação sexual. Julgamento foi suspenso.",
 "dado": {
  "n": "5 votos",
  "l": "Pela validade do art. 233 do Código Penal · faltam 5 ministros"
 },
 "resumo": "O STF reuniu na quarta (4) cinco votos pela validade do crime de ato obsceno (art. 233 do Código Penal), mas com ressalvas: Fux, relator, Dino, Zanin, Mendonça e Nunes Marques aceitam a norma, e parte deles quer excluir manifestações culturais e artísticas, como a nudez no Carnaval. O julgamento, com repercussão geral, foi suspenso sem data para retomar.",
 "fundo": [
  [
   "p",
   "O Supremo analisa a constitucionalidade do crime de ato obsceno, previsto no artigo 233 do Código Penal, com pena de detenção de três meses a um ano ou multa. Votaram pela validade da norma o relator Luiz Fux, Flávio Dino, Cristiano Zanin, André Mendonça e Kassio Nunes Marques, segundo a CNN Brasil."
  ],
  [
   "h",
   "As ressalvas"
  ],
  [
   "p",
   "Dino e Zanin defenderam excluir expressamente manifestações culturais e artísticas, como a nudez no Carnaval. Zanin também quis deixar claro que a norma vale só para condutas de conotação sexual, e ele e Mendonça criticaram o uso do padrão local como critério, defendendo que prevaleça o contexto da conduta."
  ],
  [
   "p",
   "Para Fux, a expressão deve ser interpretada conforme os costumes e o padrão de pudor de cada época e lugar. Ele disse que manifestações políticas, artísticas ou literárias podem ultrapassar a liberdade de expressão quando há exposição obscena em local público sem proteção a crianças e adolescentes."
  ],
  [
   "h",
   "O que falta"
  ],
  [
   "p",
   "Faltam os votos de Dias Toffoli, Gilmar Mendes, Alexandre de Moraes, Edson Fachin e Cármen Lúcia, em data não definida. Como o caso tem repercussão geral, a tese fixada valerá para processos semelhantes em todo o país. A Cladem, admitida como amicus curiae, defendeu a inconstitucionalidade e pediu que protestos fiquem fora da punição."
  ]
 ],
 "fontes": [
  [
   "CNN Brasil (STF e ato obsceno)",
   "https://www.cnnbrasil.com.br/politica/stf-tem-5-votos-para-manter-crime-de-ato-obsceno-com-ressalvas-a-punicao/"
  ]
 ]
};

S.oea = {
 "ed": "politica",
 "k": "Política",
 "hora": "5/11",
 "t": "Brasil leva à OEA o debate sobre interferência estrangeira em eleições; EUA se opõem a regulação",
 "sub": "Conselho Permanente incluiu o tema na pauta a pedido do governo. Uruguai, México e Canadá se mostraram abertos a discutir regras.",
 "resumo": "A OEA incluiu na reunião do Conselho Permanente desta quarta (4) o tema da interferência estrangeira nas eleições, a pedido do Brasil. A secretária nacional de Justiça, Maria Rosa Loula, defendeu cooperação contra a manipulação estrangeira de informação. O representante dos EUA disse que governos autoritários usam a desinformação como pretexto para censura e rejeitou regulação com alcance extraterritorial.",
 "fundo": [
  [
   "p",
   "Em vídeo exibido na sessão, a secretária nacional de Justiça, Maria Rosa Loula, afirmou que o problema vai além de notícias falsas e defendeu que a OEA enfrente a Interferência e Manipulação Estrangeira de Informação (FIMI). O embaixador Benoni Belli, representante do Brasil, pediu a exibição do vídeo, segundo a CNN Brasil."
  ],
  [
   "p",
   "As propostas brasileiras incluem troca de alertas entre países, rastreamento transnacional de operações coordenadas, preservação de provas digitais e criação de pontos de contato entre autoridades."
  ],
  [
   "h",
   "Casos citados"
  ],
  [
   "p",
   "O Brasil mencionou o inquérito aberto pelo STF em 27 de outubro sobre manipulações algorítmicas, o relato de nove organizações sobre o bloqueio de cerca de 30 perfis jornalísticos no Instagram e a decisão do TSE por tratamento igualitário entre candidaturas depois de a Meta AI gerar propaganda para apenas uma delas no segundo turno."
  ],
  [
   "h",
   "Reações"
  ],
  [
   "p",
   "O representante dos EUA defendeu a liberdade de expressão, disse que informação e financiamento externos, por si só, não configuram interferência e se opôs a regulação extraterritorial. Uruguai, México e Canadá reconheceram a importância do debate e se disseram abertos a discutir regras."
  ]
 ],
 "fontes": [
  [
   "CNN Brasil (OEA)",
   "https://www.cnnbrasil.com.br/politica/brasil-leva-a-oea-debate-sobre-interferencia-estrangeira-nas-eleicoes/"
  ]
 ]
};

S.g20_trump = {
 "ed": "mundo",
 "k": "Mundo",
 "hora": "5/11",
 "t": "Governo espera reunião de Lula com Trump à margem do G20, em Miami, em dezembro",
 "sub": "Nenhum dos lados fez pedido formal. Brasil avalia dar agrément a Daniel Perez, indicado por Trump para embaixador.",
 "resumo": "Integrantes do governo Lula esperam uma reunião bilateral com Donald Trump ainda neste ano, à margem da cúpula do G20, marcada para 14 e 15 de dezembro em Miami, segundo a CNN Brasil. Ninguém pediu formalmente o encontro, e Trump ainda não reconheceu nem parabenizou a vitória de Lula. O Brasil avalia conceder agrément a Daniel Perez, indicado para embaixador dos EUA.",
 "fundo": [
  [
   "p",
   "A expectativa surgiu depois que Trump disse publicamente que falaria com Lula, ao ser questionado sobre a vitória eleitoral do brasileiro, segundo apuração da âncora Débora Bergamasco no CNN 360º. O governo brasileiro considera cedo formalizar o pedido, mas pode tomar a iniciativa se não houver sinal do lado americano."
  ],
  [
   "p",
   "Em paralelo, o Brasil avalia conceder neste ano o agrément a Daniel Perez, indicado por Trump para a embaixada em Brasília, como gesto de aproximação. A embaixada americana está sem embaixador desde o início do governo Trump, e a indicação ficou pendente depois de ser considerada mal conduzida pelo lado brasileiro."
  ]
 ],
 "fontes": [
  [
   "CNN Brasil (Lula e Trump)",
   "https://www.cnnbrasil.com.br/politica/lula-espera-ter-reuniao-bilateral-com-trump-durante-cupula-do-g20/"
  ]
 ]
};

S.sc_tornados = {
 "ed": "regioes",
 "reg": "sul",
 "k": "Regiões · Sul",
 "hora": "5/11",
 "t": "Tornados e ventos de 126 km/h atingem 106 municípios de Santa Catarina e deixam 2 mortos",
 "sub": "23 cidades decretaram emergência. Aeroporto de Chapecó teve parte da estrutura destruída e está fechado.",
 "dado": {
  "n": "5.358",
  "l": "Residências com danos em Santa Catarina · Defesa Civil"
 },
 "resumo": "Dois tornados atingiram o oeste de Santa Catarina na quarta (4), em Chapecó e Xanxerê, com rajadas de até 126 km/h. Segundo a Defesa Civil, 106 municípios foram afetados, 23 decretaram emergência, 5.358 residências tiveram danos e há 2 mortos. Em Chapecó, cerca de 2.400 casas e indústrias perderam parte do telhado, e o aeroporto suspendeu pousos e decolagens.",
 "fundo": [
  [
   "p",
   "O primeiro tornado ocorreu em Chapecó, por volta das 10h30, e o segundo em Xanxerê, às 10h48, segundo o Metrópoles. Uma das mortes foi em Rio Negrinho, onde a estrutura de um posto de combustível desabou; a vítima foi identificada como Jonathan Oliveira da Cruz, de 20 anos. A segunda morte foi divulgada pela Defesa Civil sem detalhes."
  ],
  [
   "nums",
   [
    [
     "106",
     "municípios afetados"
    ],
    [
     "23",
     "decretaram situação de emergência"
    ],
    [
     "56 e 252",
     "pessoas desabrigadas e desalojadas"
    ],
    [
     "200",
     "ocorrências atendidas pelos Bombeiros"
    ]
   ]
  ],
  [
   "p",
   "O Aeroporto Serafim Enoss Bertaso, em Chapecó, teve parte da estrutura destruída, e as operações foram suspensas por tempo indeterminado."
  ]
 ],
 "fontes": [
  [
   "Metrópoles (tornados em SC)",
   "https://www.metropoles.com/brasil/tornados-e-ventos-de-126-km-h-afetam-106-municipios-e-deixam-2-mortos-em-sc"
  ]
 ]
};

S.seletivo.upd = "Detalhamento publicado nesta quinta: alíquotas de aeronaves, barcos e apostas, PEC para manter o IPI até 2 de fevereiro de 2027 e prazos da CBS.";
S.seletivo.fundo.push(['h','Atualização das 13h'],['p',"Segundo o Metrópoles, o Imposto Seletivo começa a ser cobrado em 2 de fevereiro de 2027. A Fazenda enviou ao Congresso uma PEC que permite manter temporariamente o IPI nesses setores até a vigência do novo tributo, e a ideia é manter a carga em 2027 e debater a permanência em 2028. Outras alíquotas de 2027: aeronaves 6,8%, barcos a motor 12%, demais embarcações de recreio 7,8%, concursos de prognósticos e apostas 0,5%, vermutes 12% e demais destilados 24%. Bens minerais extraídos ficam em 0% até 31 de dezembro de 2027. A CBS começa em 1º de janeiro de 2027; o TCU propôs 11,3%, o governo estima cerca de 8,5%, e o Senado tem até 15 de dezembro para decidir."]);
S.seletivo.fontes.push(["Metrópoles (transição do imposto do pecado)","https://www.metropoles.com/brasil/fazenda-reforca-transicao-para-setores-afetados-pelo-imposto-do-pecado"]);
S.fiscal.upd = "Durigan afirmou nesta quinta que os ajustes no Orçamento só seguem a Lula depois da COP31, e o governo teve superávit de R$ 4,8 bi em setembro.";
S.fiscal.fundo.push(['h','Atualização das 13h'],['p',"O ministro da Fazenda, Dario Durigan, disse nesta quinta que enviará ajustes no Orçamento depois da viagem de Lula à COP31, na Turquia. A equipe econômica discute ampliar a parcela sujeita a contingenciamento, o que depende do Congresso. O resultado primário de setembro foi superávit de R$ 4,839 bilhões, contra expectativa da Fazenda de déficit de R$ 7,5 bilhões."]);
S.fiscal.fontes.push(["Metrópoles (Durigan)","https://www.metropoles.com/brasil/durigan-diz-que-enviara-ajustes-no-orcamento-apos-viagem-de-lula-a-cop31"]);
S.orcamento.upd = "Durigan disse nesta quinta que ajustes no Orçamento seguem a Lula só depois da COP31 e que a Fazenda discute ampliar o contingenciamento.";
S.orcamento.fundo.push(['h','Atualização das 13h'],['p',"Segundo o Metrópoles, o ministro da Fazenda, Dario Durigan, afirmou que enviará ajustes no Orçamento da União ao presidente depois da viagem à COP31, prevista para a próxima semana. Entre as medidas em discussão está ampliar a parcela do Orçamento sujeita a contingenciamento, o que depende de aprovação do Congresso."]);
S.orcamento.fontes.push(["Metrópoles (Durigan)","https://www.metropoles.com/brasil/durigan-diz-que-enviara-ajustes-no-orcamento-apos-viagem-de-lula-a-cop31"]);
S.copom.upd = "Produção industrial caiu 0,8% em setembro (IBGE) e Durigan comentou a pausa nos cortes: juros precisam cair de forma sustentável.";
S.copom.fundo.push(['h','Atualização das 13h'],['p',"Na quinta, o IBGE informou que a produção industrial recuou 0,8% em setembro, a quarta queda em cinco meses, dado que reforça o diagnóstico de desaceleração citado pelo Copom. O ministro Dario Durigan disse que o governo precisa criar condições para que a Selic caia de forma sustentável e estrutural."]);
S.copom.fontes.push(["Metrópoles (IBGE)","https://www.metropoles.com/brasil/producao-industrial-recua-08-em-setembro-diz-ibge"]);
S.desinfo.upd = "Brasil levou o tema da interferência estrangeira à OEA na quarta (4), citando o inquérito do STF, os perfis bloqueados no Instagram e a decisão do TSE sobre a Meta AI.";
S.desinfo.fundo.push(['h','Atualização das 13h'],['p',"O governo brasileiro levou ao Conselho Permanente da OEA o debate sobre interferência estrangeira em eleições e citou, entre os casos, a decisão do TSE por tratamento igualitário depois de a Meta AI gerar propaganda para apenas uma candidatura no segundo turno. Os EUA se opuseram a regulação com alcance extraterritorial."]);
S.desinfo.fontes.push(["CNN Brasil (OEA)","https://www.cnnbrasil.com.br/politica/brasil-leva-a-oea-debate-sobre-interferencia-estrangeira-nas-eleicoes/"]);
/* ---------- MUNDO (fatos de cada país) ---------- */
S.paraguai = {
 "ed": "mundo",
 "k": "Mundo",
 "hora": "5/11",
 "t": "Presidente do Paraguai, Santiago Peña, anuncia renúncia em meio à quebra do Banco Ueno",
 "sub": "Decisão vem horas depois de um pedido de impeachment. Renúncia depende do Congresso, e o vice, Pedro Alliana, também é alvo do processo.",
 "dado": {
  "n": "3 milhões",
  "l": "Clientes do Banco Ueno sem acesso às contas · cerca de US$ 850 mi em depósitos"
 },
 "resumo": "Santiago Peña anunciou nesta quinta (5) a renúncia à Presidência do Paraguai, em meio à crise do Banco Ueno, o maior banco digital do país, declarado insolvente em 3 de novembro. Ele foi acionista do grupo controlador até março de 2025, e 35 deputados da oposição pediram o impeachment. A renúncia precisa ser aceita pelo Congresso. O vice, Pedro Alliana, deve assumir, mas também é alvo do processo.",
 "fundo": [
  [
   "p",
   "Peña publicou um vídeo nas redes sociais em que diz ter tomado a decisão de renunciar pensando na estabilidade do país e na preservação das instituições democráticas. Chamou o momento de “um dos mais difíceis” da sua vida e pediu desculpas às pessoas afetadas pela crise bancária, segundo o Correio Braziliense. Ele governava desde 2023, com mandato até 2028."
  ],
  [
   "h",
   "A crise do Banco Ueno"
  ],
  [
   "p",
   "O Banco Ueno, banco digital do Grupo Vázquez, fechou na terça (3), depois que o Banco Central do Paraguai (BCP) iniciou a liquidação ao constatar déficit nos índices de solvência ligado a empréstimos a empresas vinculadas, segundo a Reuters. Eram cerca de 3 milhões de clientes e aproximadamente US$ 850 milhões em depósitos, incluindo recursos do Instituto de Previdência Social."
  ],
  [
   "nums",
   [
    [
     "35",
     "deputados assinaram o pedido de impeachment"
    ],
    [
     "8",
     "diretores do banco presos, entre eles o presidente-executivo, Miguel Vázquez"
    ],
    [
     "27",
     "pessoas acusadas formalmente pela Procuradoria, com bens bloqueados"
    ],
    [
     "2/3",
     "maioria exigida na Câmara para iniciar o processo, segundo a Reuters"
    ]
   ]
  ],
  [
   "p",
   "O presidente do BCP, Carlos Carvallo, que antes presidiu o Ueno, também renunciou. A oposição acusa Peña de conflito de interesses, já que ele foi acionista do grupo dono do banco até março de 2025, e o BCP de encobrir irregularidades. Antes de anunciar a saída, Peña promulgou uma lei para que os poupadores recuperem o dinheiro mais rapidamente."
  ],
  [
   "h",
   "O que vem agora"
  ],
  [
   "p",
   "A renúncia precisa ser aceita pelo Legislativo, que deve convocar sessão. Se for recusada, o impeachment pode seguir; o Metrópoles informa que a Câmara aprovou a abertura do processo no mesmo dia, ponto que os demais textos consultados não detalham. Se a renúncia for aceita, o vice Pedro Alliana deve assumir, e Peña se tornaria senador vitalício, cargo previsto na Constituição para ex-presidentes que não foram destituídos."
  ],
  [
   "p",
   "A associação de bancos do país afirma que o sistema segue operando normalmente, apesar de falhas em aplicativos com a migração de clientes do Ueno."
  ]
 ],
 "fontes": [
  [
   "Metrópoles (renúncia de Peña)",
   "https://www.metropoles.com/mundo/presidente-do-paraguai-santiago-pena-renuncia-ao-cargo"
  ],
  [
   "Correio Braziliense",
   "https://www.correiobraziliense.com.br/mundo/2026/11/7533691-presidente-do-paraguai-santiago-pena-renuncia-apos-crise.html"
  ],
  [
   "Estado de Minas",
   "https://www.em.com.br/internacional/2026/11/7533684-presidente-do-paraguai-santiago-pena-anuncia-renuncia.html"
  ],
  [
   "CNN Brasil (Reuters)",
   "https://www.cnnbrasil.com.br/internacional/crise-bancaria-provoca-pedido-de-impeachment-contra-presidente-do-paraguai/"
  ]
 ]
};

S.franca = {
 "ed": "mundo",
 "k": "Mundo",
 "hora": "5/11",
 "t": "França tem novos protestos e greves nesta quinta, e Macron convoca reunião de crise",
 "sub": "Sindicatos e estudantes saem às ruas por custo de vida e serviços públicos. 70 mil policiais serão mobilizados, a cinco meses da eleição presidencial.",
 "dado": {
  "n": "500–700 mil",
  "l": "Manifestantes previstos fora de Paris, segundo a inteligência interna · BFM TV"
 },
 "resumo": "Sindicatos, entre eles a CGT, e grupos estudantis convocaram manifestações e greves em cidades francesas nesta quinta (5), com adesão de servidores e do setor de energia. O governo mobiliza cerca de 70 mil policiais, e Macron fez uma reunião de defesa e segurança na quarta (4), depois dos tumultos e saques de 17 de outubro. A eleição presidencial está a cerca de cinco meses.",
 "fundo": [
  [
   "p",
   "Os atos se somam a protestos sobre custo de vida, serviços públicos e educação. O Ministério da Educação estima que 17,5% dos professores do ensino fundamental público aderirão à greve, e sindicatos alertam para paralisações em ferrovias e no transporte público. A estatal EDF informou que sindicatos de energia também devem aderir, segundo a Reuters, reproduzida pela CNN Brasil."
  ],
  [
   "h",
   "Resposta do governo"
  ],
  [
   "p",
   "Cerca de 70 mil policiais serão mobilizados. A porta-voz Maud Bregeon disse que o governo está muito atento e que um novo 17 de outubro está fora de cogitação; um assessor de Macron afirmou que o objetivo é restabelecer a calma antes da eleição. Os tumultos e saques daquele dia pegaram as forças de segurança de surpresa e geraram críticas à gestão da crise."
  ],
  [
   "p",
   "Os atos do último sábado foram em geral pacíficos, com confrontos isolados, e há menos escolas de ensino médio bloqueadas do que na fase anterior. Partidos de oposição tentam capitalizar a insatisfação com o padrão de vida."
  ],
  [
   "h",
   "Outro caso na França"
  ],
  [
   "p",
   "O banco Crédit Mutuel Arkéa informou na noite de quarta (4) ter sido alvo de ataque hacker que desviou cerca de € 100 milhões (R$ 615 milhões), segundo o Metrópoles. O banco diz que a situação está controlada e que os ativos de clientes não foram afetados."
  ]
 ],
 "fontes": [
  [
   "CNN Brasil (Reuters)",
   "https://www.cnnbrasil.com.br/internacional/franca-se-prepara-para-novos-protestos-e-macron-convoca-gestao-de-crise/"
  ],
  [
   "Metrópoles (ataque ao Arkéa)",
   "https://www.metropoles.com/mundo/banco-frances-sofre-ataque-hacker-e-perde-cerca-de-r-615-milhoes"
  ]
 ]
};

S.israel = {
 "ed": "mundo",
 "k": "Mundo",
 "hora": "5/11",
 "t": "Israel: sem maioria clara, Herzog ouve partidos para escolher quem tenta formar governo",
 "sub": "Netanyahu contesta o resultado e tende a cair de 64 para 53 cadeiras. Eisenkot depende de partidos árabes.",
 "dado": {
  "n": "120",
  "l": "Cadeiras do Knesset · Eisenkot teria 67 com apoio externo dos partidos árabes"
 },
 "resumo": "O resultado da eleição de 27 de outubro foi certificado em 4 de novembro sem vencedor claro. O presidente Isaac Herzog ouve os líderes partidários até esta quinta (5) e depois indica um nome para formar governo. Netanyahu e o Likud contestam o resultado, e Gadi Eisenkot, do partido Yashar, parece ter apoio da maioria, mas depende dos partidos árabes. Há cerca de 100 dias para formar governo.",
 "fundo": [
  [
   "p",
   "Segundo a CNN Brasil, a coalizão de Netanyahu tinha 64 cadeiras e deve cair para 53. Há investigação de denúncias de fraude, sem indício de comprometimento sistemático da eleição. Herzog pediu paciência e que os partidos negociem com a mente aberta para evitar nova eleição."
  ],
  [
   "nums",
   [
    [
     "66",
     "cadeiras de um governo de unidade Likud, Yashar, Lieberman e Bennett, visto como remoto"
    ],
    [
     "48",
     "cadeiras da coalizão de Eisenkot"
    ],
    [
     "67",
     "com apoio externo de Ra’am e Lista Conjunta, 19 cadeiras"
    ],
    [
     "100",
     "dias, aproximadamente, para formar governo"
    ]
   ]
  ],
  [
   "p",
   "Se nenhum candidato conseguir, o Knesset pode indicar outro nome e, se isso também falhar, será convocada nova eleição. A matéria ressalta que um governo de Eisenkot apoiado por partidos árabes seria difícil de vender a muitos israelenses e que a retomada de confrontos com o Irã poderia aproximar os lados."
  ]
 ],
 "fontes": [
  [
   "CNN Brasil (Israel)",
   "https://www.cnnbrasil.com.br/internacional/israel-continua-negociacoes-para-formacao-de-novo-governo-nesta-quinta/"
  ]
 ]
};

S.hongkong = {
 "ed": "mundo",
 "k": "Mundo",
 "hora": "5/11",
 "t": "Hong Kong: ativista Joshua Wong é condenado a mais 10 anos de prisão por segurança nacional",
 "sub": "Ele se declarou culpado de conspirar para pedir sanções estrangeiras à China. Já cumpria 4 anos e 8 meses por outro caso.",
 "resumo": "Um tribunal de Hong Kong ampliou em 10 anos a pena do ativista Joshua Wong, em segunda condenação por segurança nacional, nesta quinta (5). Em setembro, ele se declarou culpado de conspirar com outros ativistas para pedir sanções estrangeiras à China e a Hong Kong em 2020. Sua libertação estava prevista para janeiro.",
 "fundo": [
  [
   "p",
   "Segundo a CNN, os promotores afirmam que o grupo fez lobby nos EUA e em outros países, por redes sociais e reuniões com políticos americanos, incluindo Nancy Pelosi e Marco Rubio, então senador e hoje secretário de Estado. Dizem também que o lobby continuou depois da Lei de Segurança Nacional de 2020 e que os EUA sancionaram mais de uma dúzia de autoridades chinesas e de Hong Kong."
  ],
  [
   "p",
   "O governo de Hong Kong afirmou que a liberdade de expressão legítima não deve ser confundida com conluio com outro país. Líderes chineses já classificaram Wong e outros ativistas como “separatistas”. Wong foi preso pela primeira vez aos 23 anos e completou 30 em outubro."
  ]
 ],
 "fontes": [
  [
   "CNN Brasil (Joshua Wong)",
   "https://www.cnnbrasil.com.br/internacional/ativista-de-hong-kong-joshua-wong-e-condenado-a-mais-10-anos-de-prisao/"
  ]
 ]
};

S.imprensa.ed='politica';S.imprensa.k='Política';
S.argentina.ed='politica';S.argentina.k='Política';
S.g20_trump.ed='politica';S.g20_trump.k='Política';
S.tarifas.ed='economia';S.tarifas.k='Economia';

var HOME_LEAD = 'fuga';
var HOME_ROW  = ['ato_obsceno','durigan','paraguai'];
var ORDER = {
 politica: ['fuga','ato_obsceno','oea','g20_trump','imprensa','argentina','maioridade','vorcaro','darkhorse','seis1x1','marinho','flavio','congresso','senado','tse','pauta5','segmin','ldo','ministerio','pronunciamento','assedio','desinfo','meta','bets','lulasaude','psdb'],
 economia: ['durigan','industria','orcamento','mei','copom','fiscal','seletivo','tarifas','betsaud'],
 regioes:  ['sc_tornados','paes','sp','sp_barba','mg','mg_tce','mg_china','mg_ipva','ne','ce_mpe','ce_gastos','pe_emprestimo','ba_jeronimo','ba_blocos','ma_tce','al_trans','sul','sc_alesc','pr_cwb','rs_zucco','norte','pa_parau','co','ms_assoma','ms_senado','guandu','novoguandu','pj','prefeitura','light','reis'],
 mundo:    ['paraguai','eua','franca','israel','eua_pioneiros','hongkong']
};
/* Notas curtas de fonte externa: [título, url, fonte] */
var BRIEFS = {
 politica: [],
 economia: [],
 regioes:  [],
 mundo:    [['Com foco na tolerância, Parlamento venezuelano avança com reforma da Lei contra o Ódio','https://www.brasil247.com/america-latina/com-foco-na-tolerancia-parlamento-venezuelano-avanca-com-reforma-da-lei-contra-o-odio/','Brasil 247']]
};

/* Giro OP: só entram notas com caminho para aprofundar.
   [título, nota, fonte, url, detalhe (opcional), id da matéria relacionada (opcional)] */
var GIRO = [
 ['Pronunciamento de domingo','Lula prepara pronunciamento para domingo (8), em que deve defender responsabilidade fiscal, segundo o g1 reproduzido pelo Portal Viu.','Portal Viu (g1)','https://www.portalviu.com.br/economia/lula-deve-defender-responsabilidade-fiscal-e-manutencao-de-programas-sociais-em-pronunciamento','','pronunciamento'],
 ['Embaixador dos EUA','O Brasil avalia conceder agrément a Daniel Perez, indicado por Trump, como gesto de aproximação, segundo a CNN Brasil.','CNN Brasil','https://www.cnnbrasil.com.br/politica/lula-espera-ter-reuniao-bilateral-com-trump-durante-cupula-do-g20/','A embaixada americana está sem embaixador desde o início do governo Trump.','g20_trump'],
 ['Casagrande e Alckmin','Para Renato Casagrande, Geraldo Alckmin é apto para a Fazenda, mas a decisão exige avaliação política, segundo a CNN Brasil.','CNN Brasil','https://www.cnnbrasil.com.br/politica/casagrande-alckmin-e-apto-a-fazenda-mas-decisao-exige-avaliacao-politica/','',''],
 ['COP31','Lula viaja na próxima semana à COP31, em Antalya, na Turquia, e os ajustes do Orçamento aguardam a volta, segundo o Metrópoles.','Metrópoles','https://www.metropoles.com/brasil/durigan-diz-que-enviara-ajustes-no-orcamento-apos-viagem-de-lula-a-cop31','','durigan'],
 ['Imposto Seletivo','O governo estima arrecadar R$ 41,9 bilhões em 2027 com o Imposto Seletivo, regulamentado por medida provisória assinada por Lula na quarta (4), segundo o WSCOM, que cita o g1.','WSCOM (g1)','https://wscom.com.br/destaque/destaque-especial/2026/11/05/imposto-do-pecado-arrecadacao-2027-produtos-tributados/','A cobrança começa em 2027, respeitada a noventena, e alcança bebidas alcoólicas e açucaradas, cigarros, veículos poluentes, extração mineral e apostas.','seletivo'],
 ['Live com Janones','Lula faz live às 19h desta quinta, no próprio canal no YouTube, com o deputado André Janones (Rede-MG), numa conversa sobre o resultado da eleição, segundo A Crítica de Campo Grande.','A Crítica (MS)','https://acritica.net/politica/lula-agenda-quinta-5-minerais-estrategicos-live-janones/','A agenda do dia traz ainda reunião com Sidônio Palmeira (Secom) às 9h e encontros com Miriam Belchior (Casa Civil) e Wellington César Lima e Silva (Justiça e Segurança Pública) às 17h, sem pautas informadas.',''],
 ['Minerais críticos','Lula participa às 15h30 desta quinta da primeira reunião do Conselho Nacional de Minerais Críticos, segundo a agenda do InfoMoney.','InfoMoney','https://www.infomoney.com.br/mercados/copom-industria-balancos-boe-agenda-05112026/','',''],
 ['Alcolumbre e Flávio','Segundo bolsonaristas ouvidos pelo Metrópoles, o presidente do Senado não dará andamento a pedidos de cassação de Flávio. A bancada diz que não votará nele em fevereiro.','Metrópoles (Igor Gadelha)','https://www.metropoles.com/colunas/igor-gadelha/em-aceno-a-direita-alcolumbre-indica-que-protegera-mandato-de-flavio','','flavio'],
 ['Sigilos','O ministro André Mendonça encerrou o processo sobre o desafio de Lula e Flávio para abrir os sigilos de ambos, segundo a coluna de Manoela Alcântara.','Metrópoles (Manoela Alcântara)','https://www.metropoles.com/colunas/manoela-alcantara/mendonca-encerra-processo-sobre-desafio-de-lula-e-flavio-para-abrir-sigilos','O processo tratava do desafio mútuo de Lula e Flávio Bolsonaro para tornar públicos os respectivos sigilos. A coluna registra que Mendonça o encerrou, sem detalhar na chamada os fundamentos da decisão.',''],
 ['Mendonça e a Hapvida','Evento organizado por instituto fundado pelo ministro do STF reuniu empresários e lobistas antes de decisões favoráveis à Hapvida, segundo a Agência Pública.','Agência Pública','https://apublica.org/2026/10/mendonca-vota-a-favor-da-hapvida-apos-evento-na-alemanha/','',''],
 ['PSB e a reeleição de Alcolumbre','O PSB abriu diálogo com Alcolumbre sobre apoio à reeleição no Senado, afirma Renato Casagrande.','Brasil 247','https://www.brasil247.com/brasil/psb-abre-dialogo-com-alcolumbre-sobre-apoio-a-reeleicao-no-senado-afirma-casagrande/','','senado'],
 ['Edinho e o centrão','Lula delegou a Edinho Silva o contato com o centrão, a começar pelo MDB. O presidente do PT também busca União Brasil e PP.','Blog do Magno','https://blogdomagno.com.br/lula-delega-contato-com-centrao-a-edinho-que-inicia-conversas-pelo-mdb','O governo precisa formar base no Congresso para os próximos quatro anos. Segundo as reportagens, a interlocução com o centrão começa pelo MDB e passa por União Brasil e PP, que formam a federação União Progressista, hoje alinhada a Alcolumbre na disputa pelo Senado.','congresso'],
 ['Marinho e a Câmara','O PL colocou Rogério Marinho (PL-RN) na disputa pelo Senado e se divide sobre lançar candidato na Câmara, segundo o g1.','g1','https://g1.globo.com/politica/noticia/2026/11/04/com-marinho-na-disputa-a-presidencia-do-senado-pl-se-divide-sobre-lancar-nome-para-camara.ghtml','','congresso'],
 ['Polícia municipal','Ricardo Nunes aproveita a PEC da Segurança para renomear a GCM de São Paulo como Polícia Municipal, e um projeto em Belo Horizonte propõe o mesmo para a Guarda.','Metrópoles','','','segmin'],
 ['Emprego','O Caged contabilizou 121 mil vagas formais em setembro, segundo o Metrópoles.','Metrópoles','','O mercado de trabalho segue resiliente, mas com sinais de desaquecimento na margem, segundo o comunicado do Copom desta quarta.','copom'],
 ['Meta e os EUA','Bernie Sanders e outros 12 deputados americanos cobram a Meta por tratamento desigual a Lula, segundo a Agência Pública.','Agência Pública','https://apublica.org/2026/10/parlamentares-dos-eua-cobram-meta-por-tratamento-desigual-a-lula/','','desinfo'],
 ['Cleitinho e o TCE','O Tribunal de Contas de Minas suspendeu R$ 32 milhões em patrocínios a clubes mineiros depois de ação do governador eleito Cleitinho, segundo o Brasil 247.','Brasil 247','https://www.brasil247.com/sudeste/tce-suspende-r-32-milhoes-em-patrocinios-a-clubes-de-minas-apos-acao-de-cleitinho/','','mg'],
 ["Drones sobre presídios", "A Câmara aprovou pena de 1 a 5 anos de prisão para quem usar drones sobre presídios; o texto segue ao Senado.", "Congresso em Foco", "https://www.congressoemfoco.com.br/noticia/131313/camara-aprova-pena-de-prisao-para-uso-de-drones-sobre-presidios", "O PL 5.902/2023, de Kim Kataguiri, teve relatoria de Nikolas Ferreira e foi aprovado em votação simbólica. Segundo a reportagem, houve mais de 700 ocorrências em 20 estados desde 2018.", "segmin"],
 ["Topless no STF", "Em voto no RE 1093553, Mendonça cita projetos de lei sobre topless para sustentar que o ato obsceno segue proibido.", "Congresso em Foco", "https://www.congressoemfoco.com.br/noticia/131319/projetos-sobre-topless-reforcam-proibicao-de-ato-obsceno-diz-mendonca", "", ""],
 ["Magno Malta e Bolsonaro", "O senador Magno Malta pediu a Moraes autorização para orar por Bolsonaro, Braga Netto e Heleno.", "O Tempo", "https://www.otempo.com.br/politica/judiciario/2026/11/4/magno-malta-pede-autorizacao-a-moraes-para-orar-por-bolsonaro-braga-netto-e-heleno", "", ""],
 ["Zambelli", "A comunidade paga criada por Carla Zambelli para se manter na Itália foi cancelada, segundo a Folha de Pernambuco.", "Folha de Pernambuco", "https://www.folhape.com.br/politica/comunidade-paga-criada-por-zambelli-para-se-manter-na-italia-e/522459/", "", ""],
 ["Posse de Lula", "A posse de Lula para o novo mandato será em 5 de janeiro, informa a Agência Brasil.", "Agência Brasil", "https://agenciabrasil.ebc.com.br/politica/noticia/2026-10/posse-de-lula-sera-em-5-de-janeiro", "", ""],
 ["CPI das big techs", "O deputado Amom (AM) afirmou que assinará a CPI para investigar a atuação das big techs nas eleições.", "A Crítica", "https://www.acritica.com/politica/amom-afirma-que-assinara-cpi-para-investigar-atuacao-das-big-techs-nas-eleicoes/", "", ""],
 ["Transição no Amazonas", "Omar Aziz e Roberto Cidade iniciaram a transição de governo no Amazonas.", "A Crítica", "https://www.acritica.com/politica/omar-aziz-e-roberto-cidade-iniciam-transicao-de-governo-no-amazonas/", "", ""],
 ["Senadores do MA e a PEC", "Senadores do Maranhão apoiam a PEC da Segurança e assinam proposta sobre maioridade penal.", "O Imparcial", "https://oimparcial.com.br/politica/2026/11/senadores-do-maranhao-apoiam-pec-da-seguranca-e-assinam-proposta-sobre-maioridade-penal/", "", "segmin"],
 ["Fora da Câmara de Salvador", "Carlos Muniz deixa a presidência da Câmara de Salvador e deve atuar nos bastidores do mandato do filho.", "Bahia Notícias", "https://www.bahianoticias.com.br/noticia/323159-fora-da-presidencia-da-camara-muniz-deve-atuar-nos-bastidores-do-mandato-do-filho-e-mira-comando-de-partido-entenda", "", ""]
];

/* Em debate nas redes: só com link. [título, texto, url, id relacionado] */
var TRENDS = [];

/* De olho amanhã: só na edição das 19h. [quando, tipo, título, nota, url, id relacionado]
   tipo: congresso | agenda | economia | justica | eleicao | mundo. Nas outras edições deixe []. */
var AMANHA = [
 ['Dom, 08/11','agenda','Lula faz pronunciamento sobre responsabilidade fiscal','O presidente deve defender o compromisso fiscal e a manutenção de programas sociais no primeiro pronunciamento depois da reeleição. O mercado mede a recepção na segunda.','https://www.portalviu.com.br/economia/lula-deve-defender-responsabilidade-fiscal-e-manutencao-de-programas-sociais-em-pronunciamento','pronunciamento'],
 ['Seg, 09/11 a qua, 11/11','congresso','Audiências públicas do Orçamento de 2027','A Comissão Mista de Orçamento abre a fase de audiências do projeto de R$ 7,4 trilhões, relatado por Eduardo Braga. A votação em plenário está marcada para 17 de dezembro.','https://www.congressoemfoco.com.br/noticia/131287/eduardo-braga-sera-relator-do-orcamento-de-r-7-4-trilhoes-para-2027','orcamento'],
 ['Próxima semana','mundo','Lula viaja à COP31, em Antalya (Turquia)','Os ajustes do Orçamento só seguem ao presidente depois da viagem, segundo o ministro Dario Durigan. A volta destrava as medidas fiscais.','https://www.metropoles.com/brasil/durigan-diz-que-enviara-ajustes-no-orcamento-apos-viagem-de-lula-a-cop31','durigan'],
 ['Sem data','justica','STF retoma julgamento sobre ato obsceno','Faltam os votos de Toffoli, Gilmar, Moraes, Fachin e Cármen Lúcia. A tese terá repercussão geral.','https://www.cnnbrasil.com.br/politica/stf-tem-5-votos-para-manter-crime-de-ato-obsceno-com-ressalvas-a-punicao/','ato_obsceno']
];

/* Colunas e análises, exibidas dentro das editorias: [autor, veículo, título, nota, url, id relacionado, editoria] */
var COLUNAS = [
 ['Igor Gadelha','Metrópoles','Em aceno à direita, Alcolumbre indica que protegerá mandato de Flávio','Bolsonaristas ouvidos nos bastidores avaliam que o presidente do Senado não dará andamento a pedidos de cassação, e a coluna liga o gesto à disputa pelo comando da Casa em fevereiro.','https://www.metropoles.com/colunas/igor-gadelha/em-aceno-a-direita-alcolumbre-indica-que-protegera-mandato-de-flavio','flavio','politica'],
 ['Andrea DiP','Agência Pública','Um beijo em uma mulher trans','Análise do gesto de Lula com a deputada Erika Hilton durante a comemoração da vitória.','https://apublica.org/2026/10/lula-erika-hilton-um-beijo-em-uma-mulher-trans/','desinfo','politica'],
 ['Blogs 247','Brasil 247','Com a humilhação histórica de Trump nas urnas, os dias dos Bolsonaros nos EUA estão contados','Texto de opinião, sem autor identificado na página, argumenta que a derrota de Trump encurtará a permanência da família Bolsonaro nos Estados Unidos.','https://www.brasil247.com/blog/com-a-humilhacao-historica-de-trump-nas-urnas-os-dias-dos-bolsonaros-nos-eua-estao-contados/','fuga','politica'],
 ['Adriana Fernandes','Folha de S.Paulo','A cruzada contra juros altos e o ajuste fiscal','Para a colunista, a cruzada contra juros altos não muda a necessidade de ajuste nas contas públicas.','','copom','economia'],
 ['Reinaldo Azevedo','Metrópoles','Segundo turno no Rio e o debate sobre os juros','O colunista sustenta que a Constituição exigiria segundo turno no Rio, porque ninguém teria alcançado a maioria dos votos, e compara o debate sobre juros a um dogma, com o economista Lara Resende no papel de “herege”.','','paes','regioes']
];

/* ---- Edição 15h: matérias novas e atualizadas ---- */
S.messias = {"ed": "politica", "k": "Política", "hora": "5/11", "t": "Lula avalia insistir em Messias para o STF, mas esbarra em resistência no Senado", "sub": "O Planalto vê uma janela na disputa pela presidência do Senado. O regimento impede nova votação do nome na mesma sessão legislativa.", "resumo": "Segundo a Folha de S.Paulo, reproduzida pelo Plantão Brasil, Lula estuda insistir na indicação do advogado-geral da União, Jorge Messias, ao STF, rejeitada pelo Senado em abril de 2026. O Planalto enxerga uma oportunidade na disputa pelo comando do Senado, mas a ala governista se divide e o regimento barra nova apreciação do nome na mesma sessão legislativa.", "fundo": [["p", "Lula avalia insistir na indicação de Jorge Messias, advogado-geral da União, para uma vaga no STF, informa a Folha de S.Paulo, em reportagem de Catia Seabra, Thaísa Oliveira e Mariana Brasil reproduzida pelo Plantão Brasil nesta quinta (5). O Senado rejeitou o nome em abril de 2026."], ["p", "O Planalto vê uma janela na disputa pela presidência do Senado, em que o governo precisa do apoio de Davi Alcolumbre (União Brasil-AP). Alcolumbre enfrenta uma oposição bolsonarista fortalecida, e foi convidado por Lula para integrar a comitiva oficial às Filipinas e à Turquia."], ["p", "A ala governista está dividida. Uma parte alerta que insistir em um nome já rejeitado pode desgastar a relação com o Legislativo. O PL consolidou a maior bancada do Senado, com 28 parlamentares, segundo o texto. O regimento impede reapreciar tema rejeitado na mesma sessão legislativa, o que inviabilizaria a votação ainda em 2026."], ["p", "Em conversas reservadas, Lula argumenta que a rejeição não foi técnica, e sim fruto de uma conjuntura política desfavorável. Senadores da base sugerem cautela, e interlocutores de Alcolumbre dizem que o debate teria de recomeçar do zero. Trata-se de informação de bastidor, sem confirmação oficial do Planalto."]], "fontes": [["Plantão Brasil (Folha de S.Paulo)", "https://www.plantaobrasil.net/noticias/161953-lula-avalia-insistir-em-messias-para-o-stf-mas-enfrenta-resistencia-no-senado"]]};
S.sucessao = {"ed": "politica", "k": "Política", "hora": "5/11", "t": "Motta busca reeleição com 15 partidos e 361 deputados, e o PL decide dia 11 se adere", "sub": "A eleição da Câmara é em 1º de fevereiro de 2027. No Senado, o PL oficializou Marinho contra Alcolumbre.", "resumo": "Hugo Motta (Republicanos-PB) busca a reeleição na Câmara em 1º de fevereiro de 2027 com apoio de 15 partidos que somam 361 deputados, e precisa de 257 votos. O PL, com 121 deputados, adiou para 11/11 a decisão de aderir. No Senado, o partido oficializou Rogério Marinho (PL-RN), que precisa de 41 votos, contra Davi Alcolumbre.", "fundo": [["p", "Segundo o Metrópoles, Hugo Motta (Republicanos-PB) disputa a reeleição à presidência da Câmara em 1º de fevereiro de 2027, com apoio de 15 partidos que elegeram juntos 361 deputados. Para vencer no primeiro turno, precisa de 257 dos 513 votos."], ["p", "O PL elegeu 121 deputados, a maior bancada, mas não tem votos para uma candidatura competitiva sozinho. Com a adesão do partido, o apoio chegaria a 16 partidos e 482 deputados. Uma ala teme perder comissões estratégicas, como a CCJ e a de Saúde, espaço na Mesa Diretora e influência sobre emendas de comissão. O líder Sóstenes Cavalcante (PL-RJ) adiou a definição para quarta (11/11), depois de reunião de mais de duas horas na terça (3). “A gente precisa ouvir todo mundo”, disse. Nikolas Ferreira (PL-MG) criticou publicamente o apoio de Motta a Lula."], ["p", "Pela contagem do jornal, os partidos que apoiaram Flávio Bolsonaro no segundo turno elegeram 286 deputados, contra 124 das legendas que ficaram com Lula."], ["h", "Senado"], ["p", "No Senado, o PL oficializou na quarta (4) a candidatura de Rogério Marinho (PL-RN), que precisa de ao menos 41 votos. O partido tem 29 dos 81 senadores, segundo o Metrópoles (outras contagens citadas pelo Radar falam em 28), e conta com o apoio do Novo, que tem três. Tereza Cristina (PP-MS) mantém a pré-candidatura. Davi Alcolumbre (União Brasil-AP) tenta a reeleição e deve referendar a indicação de Eduardo Gomes (PL-TO) para relatar a LDO de 2027."]], "fontes": [["Metrópoles (Maria Laura Giuliani)", "https://www.metropoles.com/brasil/sucessao-no-congresso-motta-isola-pl-e-alcolumbre-tenta-driblar-oposicao"]], "dado": {"n": "11/11", "l": "Data em que o PL deve definir se apoia a reeleição de Motta"}};
S.reuniao_eco = {"ed": "economia", "k": "Economia", "hora": "5/11", "t": "Lula reúne Haddad, Durigan e Galípolo para discutir dívida pública e o rumo da economia", "sub": "O encontro, em Brasília, vem um dia depois de o Copom manter a Selic em 13,75%. A dívida bruta está perto de 83% do PIB.", "resumo": "Lula convocou para esta quinta (5), em Brasília, uma reunião com a equipe econômica e ex-colaboradores, entre eles o ministro da Fazenda, Dario Durigan, o antecessor Fernando Haddad e o presidente do BC, Gabriel Galípolo. Segundo o InfoMoney, que cita a CNN Brasil, o tema é a dívida pública, hoje perto de 83% do PIB.", "fundo": [["p", "O presidente Lula convocou para esta quinta (5), em Brasília, uma reunião com integrantes da equipe econômica e antigos colaboradores, segundo o InfoMoney, que cita confirmação da CNN Brasil. Estão entre os convidados o ministro da Fazenda, Dario Durigan, e Fernando Haddad, que deixou a pasta para disputar o governo de São Paulo. Há previsão de participação do presidente do Banco Central, Gabriel Galípolo, do ex-ministro Guido Mantega, do ministro do Planejamento, Bruno Moretti, e do presidente do BNDES, Aloizio Mercadante. O governador reeleito do Piauí, Rafael Fonteles (PT), cotado para a Fazenda, não participa."], ["nums", [["83%", "dívida bruta, em proporção do PIB"], ["9%", "despesa com juros em 12 meses, em proporção do PIB"], ["7,5%", "Selic proposta por Lara Resende, de forma gradual"]]], ["p", "Durigan defende um ajuste fiscal gradual, com revisão de despesas e de benefícios tributários, e a equipe ainda não apresentou pacote definitivo para 2027. O economista André Lara Resende propôs um Conselho Fiscal e Monetário Nacional e a redução gradual da Selic para 7,5% ao ano, com apoio de José Sérgio Gabrielli, coordenador do programa de governo. Durigan disse que a proposta tem deficiências e descartou mecanismos administrativos para limitar juros. Mercadante negou que o tabelamento da Selic esteja em discussão."], ["p", "A reunião ocorre um dia depois de o Copom manter a Selic em 13,75%. Lula deve fazer pronunciamento em rede nacional no domingo (8)."]], "fontes": [["InfoMoney (Marina Verenicz)", "https://www.infomoney.com.br/politica/lula-reune-haddad-durigan-e-galipolo-para-discutir-divida-publica-e-rumo-da-economia/"]]};
S.rj_pm = {"ed": "regioes", "k": "Regiões · Rio de Janeiro", "hora": "5/11", "t": "MP do Rio faz buscas contra o comandante do 23º BPM, em investigação sobre suposta milícia", "sub": "O coronel Ângelo Barbosa Castro comanda o batalhão do Leblon. A PM diz que colabora com o MPRJ, e o caso corre sob sigilo.", "resumo": "O Gaeco do Ministério Público do Rio cumpriu na manhã desta quinta (5) mandados de busca e apreensão contra o coronel Ângelo Barbosa Castro, comandante do 23º BPM (Leblon), em ação acompanhada pela Corregedoria da PM. Segundo as informações iniciais, a apuração mira uma suposta milícia. A PM afirma colaborar integralmente.", "fundo": [["p", "O coronel Ângelo Barbosa Castro, comandante do 23º BPM (Leblon), foi alvo de mandados de busca e apreensão cumpridos pelo Ministério Público do Rio (MPRJ) na manhã desta quinta (5), segundo o Agenda do Poder. A ação foi conduzida pelo Gaeco/MPRJ e acompanhada pela Corregedoria-Geral da PM. Outros policiais também foram alvos."], ["p", "Segundo informações iniciais, a investigação mira uma suposta milícia, e o procedimento tramita sob sigilo. A PM disse que acompanha os desdobramentos e colabora integralmente com o MPRJ, mas não informou se abrirá apuração interna nem se o oficial será afastado. A reportagem não localizou a defesa do comandante."], ["p", "O coronel tem cerca de 30 anos de carreira e já comandou o 7º BPM (São Gonçalo) e o 20º BPM (Mesquita). Em 2021, recebeu a Medalha Tiradentes da Alerj, por iniciativa do então deputado Jalmir Junior."]], "fontes": [["Agenda do Poder", "https://agendadopoder.com.br/comandante-da-pm-e-alvo-de-buscas-em-acao-do-ministerio-publico-do-rio/"]], "reg": "rj"};
S.rj_teto = {"ed": "regioes", "k": "Regiões · Rio de Janeiro", "hora": "5/11", "t": "Ruas defende teto de gastos no Rio diante de déficit previsto de R$ 13,98 bilhões em 2027", "sub": "O projeto de teto é contrapartida do Propag, programa federal de renegociação de dívidas, ao qual o Estado aderiu em junho.", "resumo": "A proposta de orçamento do Rio para 2027 prevê R$ 138,37 bilhões em despesas para receita líquida de R$ 124,39 bilhões, déficit de R$ 13,98 bilhões. O governador eleito, Douglas Ruas (PL), quer aprovar ainda em 2026 o projeto de teto de gastos, contrapartida do Propag. Emendas ao orçamento podem ser apresentadas de 5 a 11 de novembro.", "fundo": [["p", "Segundo o Portal Viu, a proposta orçamentária de 2027 enviada à Alerj prevê R$ 138,37 bilhões em despesas, para uma receita líquida estimada em R$ 124,39 bilhões, o que deixa um déficit de R$ 13,98 bilhões. O resultado é cerca de R$ 5 bilhões menor que o de 2026."], ["nums", [["R$ 138,37 bi", "despesas previstas em 2027"], ["R$ 124,39 bi", "receita líquida estimada"], ["R$ 13,98 bi", "déficit previsto"]]], ["p", "O governador eleito, Douglas Ruas (PL), defende regras para limitar o crescimento das despesas e quer ver aprovado ainda em 2026 o Projeto de Lei nº 8.238/2026, apresentado em agosto, quando era deputado. O texto distribui o limite entre Executivo, Alerj, Tribunal de Justiça, Ministério Público, Defensoria Pública e Tribunal de Contas, prevê relatórios periódicos e cria um Comitê Estadual de Acompanhamento e Monitoramento do Propag. O teto é contrapartida do Propag, ao qual o Estado aderiu em 22 de junho."], ["p", "Na Alerj, o projeto tramita em regime ordinário, nas comissões de Constituição e Justiça, com relatoria do deputado Rodrigo Amorim, e de Orçamento. Emendas ao orçamento podem ser apresentadas de 5 a 11 de novembro."]], "fontes": [["Portal Viu", "https://www.portalviu.com.br/cidades/ruas-defende-teto-de-gastos-para-o-rio-diante-de-deficit-previsto-de-quase-r-14-bilhoes"]], "reg": "rj"};
S.ce_oposicao = {"ed": "regioes", "k": "Regiões · Nordeste", "hora": "5/11", "t": "No Ceará, Ciro reúne a oposição, e a líder do PL aponta falha de unidade nas urnas para a Assembleia", "sub": "O PL foi de quatro para seis deputados estaduais, e o PSDB cairá para três. Ciro Gomes quer manter o bloco unido.", "resumo": "Ciro Gomes (PSDB) reuniu aliados na terça (3), em Fortaleza, e defendeu manter o bloco de oposição unido. Na quarta (4), a líder do PL na Alece, Dra. Silvana, disse que faltou unidade para reeleger mais deputados: o PL foi de quatro para seis cadeiras, e o PSDB cairá para três.", "fundo": [["p", "O ex-candidato a governador Ciro Gomes (PSDB) reapareceu após o segundo turno e reuniu aliados na terça (3), no diretório estadual do PSDB, em Fortaleza, segundo O Povo. Participaram Roberto Cláudio (União Brasil), candidato a vice, Capitão Wagner (União Brasil) e Alcides Fernandes (PL), candidatos ao Senado, deputados estaduais e o ex-prefeito José Sarto. Ciro disse que o grupo acompanhará as eleições das mesas diretoras da Alece e das câmaras municipais."], ["p", "Na quarta (4), a deputada Dra. Silvana, líder do PL na Assembleia, afirmou que a oposição falhou na articulação: “Falhamos na unidade do bloco para tentar o retorno de mais parlamentares”. O PL foi de quatro para seis parlamentares, e ela, reeleita com 66.473 votos, é a única do partido que se manteve. Seis deputados migraram para o PL na janela partidária e nenhum se reelegeu. Ela defendeu a reeleição de Romeu Aldigueri (PSB) à presidência da Casa e reiterou apoio a Ciro."], ["p", "As duas reportagens divergem sobre o ponto de partida do PSDB (cinco ou sete cadeiras), mas concordam que a legenda terá três a partir de 2027. Elmano de Freitas (PT) inicia o segundo mandato."]], "fontes": [["O Povo (Ciro reúne oposição)", "https://www.opovo.com.br/noticias/politica/2026/11/03/ciro-reune-oposicao-e-defende-manutencao-do-bloco-unido.html"], ["O Povo (líder do PL)", "https://mais.opovo.com.br/jornal/politica/2026/11/05/lider-do-pl-aponta-grande-falha-da-oposicao-para-reeleger-mais-deputados-na-assembleia.html"]], "reg": "ne"};
S.ce_arma = {"ed": "regioes", "k": "Regiões · Nordeste", "hora": "5/11", "t": "Elmano envia à Alece projeto que garante porte de arma a agentes de segurança aposentados", "sub": "A proposta abrange PM, Bombeiros, Polícia Civil, Pefoce e policiais penais, e o governo pede celeridade na votação.", "resumo": "O governador Elmano de Freitas (PT) anunciou na terça (3) o envio à Assembleia de projeto que garante a profissionais da segurança pública e do sistema prisional o direito de manter arma de fogo após a aposentadoria. O Executivo pediu celeridade.", "fundo": [["p", "O governador do Ceará, Elmano de Freitas (PT), anunciou na terça (3), pelas redes sociais, o envio à Alece de mensagem com projeto de lei que garante a profissionais da segurança pública e do sistema prisional o direito ao uso de arma de fogo após a aposentadoria, segundo O Povo."], ["p", "A proposta abrange servidores da Polícia Militar, do Corpo de Bombeiros, da Polícia Civil, da Perícia Forense (Pefoce) e policiais penais, e iguala o Estado a normas federais, como as da Polícia Federal. Quem está na ativa já tem o direito, segundo o governador. O secretário de Administração Penitenciária, Mauro Albuquerque, apoiou: “Quem se aposentar terá direito a levar o seu armamento”. Elmano disse que a medida reconhece o trabalho dos servidores e reforça o combate ao crime organizado."]], "fontes": [["O Povo+", "https://mais.opovo.com.br/jornal/cidades/2026/11/04/elmano-envia-projeto-a-alece-que-garante-direito-a-manter-arma-de-fogo-para-agentes-de-seguranca-aposentados.html"]], "reg": "ne"};
S.maioridade.upd = "O relator na Câmara, Mendonça Filho (PL-PE), busca acordo para votar a PEC ainda em novembro, e Motta diz não haver prazo para levar o texto ao plenário.";
S.maioridade.fundo.push(["h", "Atualização das 15h"]);
S.maioridade.fundo.push(["p", "O relator da PEC na Câmara, deputado Mendonça Filho (PL-PE), negocia um consenso entre governo e oposição para votar o texto ainda em novembro, primeiro na comissão especial e depois no plenário, segundo o Diário Carioca. A oposição quer 16 anos para todos os delitos e 14 anos em crimes hediondos e violentos; os governistas defendem 16 anos apenas em crimes graves, posição que Lula mencionou na campanha."]);
S.maioridade.fundo.push(["p", "A coluna de Igor Gadelha, no Metrópoles, registra que Hugo Motta afirmou não haver prazo para levar o tema ao plenário, e que a pauta cabe a ele. Segundo a coluna, lideranças bolsonaristas falam em “fazer Lula sangrar” e dizem que o presidente descumpriu uma promessa de campanha."]);
S.maioridade.fontes.push(["Diário Carioca", "https://www.diariocarioca.com/2026/11/05/politica/relator-pec-maioridade-penal-acordo-novembro/"]);
S.maioridade.fontes.push(["Metrópoles (coluna Igor Gadelha)", "https://www.metropoles.com/colunas/igor-gadelha/bolsonaristas-se-preparam-para-fazer-lula-sangrar-com-maioridade-penal"]);
S.copom.upd = "Nesta quinta, os juros futuros longos operaram em alta, Citi e Itaú BBA esperam Selic estável nas próximas reuniões, e Durigan disse que o juro alto prejudica todos os setores.";
S.copom.fundo.push(["h", "Atualização das 15h: reação do mercado"]);
S.copom.fundo.push(["p", "Segundo a CNN Brasil, os juros longos tinham viés de alta nesta quinta: pela manhã, o contrato de DI para janeiro de 2029 subia a 14,855%, de 14,785% no ajuste anterior. Citi e Itaú BBA esperam Selic estável nas próximas reuniões, e o Citi avaliou que o comunicado aumenta a liberdade do Comitê. O ministro da Fazenda, Dario Durigan, disse que não faria “comentários valorativos” sobre a decisão, mas afirmou que o juro no Brasil é alto e prejudica todos os setores."]);
S.copom.fontes.push(["CNN Brasil (juros futuros, 5/11)", "https://www.cnnbrasil.com.br/economia/money/mercado/juros-futuros-hoje-5-novembro-2026/"]);
S.congresso.upd = "A eleição da Câmara é em 1º de fevereiro, o PL decide em 11/11 se adere a Motta, e o partido oficializou Marinho para o Senado.";
S.congresso.fundo.push(["h", "Atualização das 15h"]);
S.congresso.fundo.push(["p", "O Metrópoles detalha que a eleição da Câmara será em 1º de fevereiro de 2027, com 257 votos necessários, que o PL adiou para 11 de novembro a decisão sobre apoiar Motta e que o partido oficializou na quarta (4) a candidatura de Rogério Marinho ao Senado. Veja a matéria “Motta busca reeleição com 15 partidos e 361 deputados”."]);
S.congresso.fontes.push(["Metrópoles (sucessão no Congresso)", "https://www.metropoles.com/brasil/sucessao-no-congresso-motta-isola-pl-e-alcolumbre-tenta-driblar-oposicao"]);
S.ministerio.upd = "O PT, por meio de Edinho Silva, pede propostas e estimativas de apoio no Congresso aos partidos, e a definição dos nomes deve começar no fim de novembro.";
S.ministerio.fundo.push(["h", "Atualização das 15h: como o PT negocia"]);
S.ministerio.fundo.push(["p", "Segundo a Folha de S.Paulo, reproduzida pelo Vero Notícias, o presidente do PT, Edinho Silva, conduz as conversas e pede aos partidos propostas de governo e estimativas de apoio no Congresso. MDB, PSD, PSB e União Brasil participaram das reuniões. O Planalto pretende condicionar a indicação de ministros ao compromisso das siglas com pautas prioritárias. A definição dos nomes deve começar no fim de novembro, e a reforma pode incluir a criação do Ministério da Segurança Pública. Em outra frente, Lula avalia insistir em Jorge Messias para o STF (veja a matéria específica)."]);
S.ministerio.fontes.push(["Vero Notícias (Folha de S.Paulo)", "https://veronoticias.com/politica/pt-cobra-propostas-e-apoio-no-congresso-para-definir-ministerios-de-lula/"]);
S.fiscal.upd = "Lula convocou para esta quinta uma reunião com Durigan, Haddad e Galípolo sobre a dívida, que está perto de 83% do PIB, e a proposta de Lara Resende para a Selic voltou ao debate.";
S.fiscal.fundo.push(["h", "Atualização das 15h"]);
S.fiscal.fundo.push(["p", "Segundo o InfoMoney, a dívida bruta está próxima de 83% do PIB e as despesas com juros somam cerca de 9% do PIB em 12 meses. Lula reúne nesta quinta a equipe econômica e ex-colaboradores para discutir o tema, e o ministro Dario Durigan defende ajuste gradual, com revisão de despesas e benefícios tributários (veja a matéria sobre a reunião)."]);
S.fiscal.fontes.push(["InfoMoney (reunião sobre a dívida)", "https://www.infomoney.com.br/politica/lula-reune-haddad-durigan-e-galipolo-para-discutir-divida-publica-e-rumo-da-economia/"]);
GIRO = GIRO.filter(function(g){return ["Embaixador dos EUA", "Casagrande e Alckmin", "COP31", "Mendonça e a Hapvida", "Meta e os EUA", "Emprego", "Cleitinho e o TCE", "Drones sobre presídios", "Topless no STF", "Magno Malta e Bolsonaro", "Zambelli", "CPI das big techs", "Transição no Amazonas", "Fora da Câmara de Salvador", "Sigilos"].indexOf(g[0])<0;}).concat([["Messias de novo", "Lula avalia insistir em Jorge Messias para o STF, segundo a Folha reproduzida pelo Plantão Brasil, mas o regimento barra nova votação em 2026.", "Plantão Brasil (Folha)", "https://www.plantaobrasil.net/noticias/161953-lula-avalia-insistir-em-messias-para-o-stf-mas-enfrenta-resistencia-no-senado", "", "messias"], ["Maioridade na Câmara", "Mendonça Filho (PL-PE), relator da PEC, busca acordo para votar em novembro, segundo o Diário Carioca.", "Diário Carioca", "https://www.diariocarioca.com/2026/11/05/politica/relator-pec-maioridade-penal-acordo-novembro/", "", "maioridade"], ["“Fazer Lula sangrar”", "Bolsonaristas veem o adiamento da maioridade penal como descumprimento de promessa de campanha, segundo a coluna de Igor Gadelha.", "Metrópoles (Igor Gadelha)", "https://www.metropoles.com/colunas/igor-gadelha/bolsonaristas-se-preparam-para-fazer-lula-sangrar-com-maioridade-penal", "", "maioridade"], ["Ministérios e o PT", "Edinho Silva pede aos partidos propostas e estimativas de apoio no Congresso, e o Planalto quer condicionar cargos a pautas, segundo a Folha reproduzida pelo Vero Notícias.", "Vero Notícias (Folha)", "https://veronoticias.com/politica/pt-cobra-propostas-e-apoio-no-congresso-para-definir-ministerios-de-lula/", "", "ministerio"], ["Reunião sobre a dívida", "Lula reúne Durigan, Haddad e Galípolo nesta quinta; a dívida bruta está perto de 83% do PIB, segundo o InfoMoney.", "InfoMoney", "https://www.infomoney.com.br/politica/lula-reune-haddad-durigan-e-galipolo-para-discutir-divida-publica-e-rumo-da-economia/", "", "reuniao_eco"], ["Teto de gastos no Rio", "Douglas Ruas (PL) quer aprovar em 2026 o teto de gastos, contrapartida do Propag, com déficit de R$ 13,98 bilhões previsto para 2027, segundo o Portal Viu.", "Portal Viu", "https://www.portalviu.com.br/cidades/ruas-defende-teto-de-gastos-para-o-rio-diante-de-deficit-previsto-de-quase-r-14-bilhoes", "", "rj_teto"], ["Buscas no 23º BPM", "O MPRJ cumpriu mandados de busca contra o comandante do batalhão do Leblon, em apuração sobre suposta milícia, segundo o Agenda do Poder.", "Agenda do Poder", "https://agendadopoder.com.br/comandante-da-pm-e-alvo-de-buscas-em-acao-do-ministerio-publico-do-rio/", "", "rj_pm"], ["Oposição no Ceará", "A líder do PL na Alece diz que faltou unidade ao bloco para eleger mais deputados, segundo O Povo.", "O Povo", "https://mais.opovo.com.br/jornal/politica/2026/11/05/lider-do-pl-aponta-grande-falha-da-oposicao-para-reeleger-mais-deputados-na-assembleia.html", "", "ce_oposicao"]]);
COLUNAS.unshift(["Igor Gadelha", "Metrópoles", "Bolsonaristas se preparam para fazer Lula “sangrar” com maioridade penal", "Para a coluna, o adiamento da votação virou munição para a oposição, que fala em promessa de campanha descumprida; a pauta da Câmara cabe a Hugo Motta.", "https://www.metropoles.com/colunas/igor-gadelha/bolsonaristas-se-preparam-para-fazer-lula-sangrar-com-maioridade-penal", "maioridade", "politica"]);
EDICAO.hora = '15h';
HOME_LEAD = 'maioridade';
HOME_ROW = ['messias','reuniao_eco','rj_pm'];
ORDER.politica = ['maioridade','messias','sucessao'].concat(ORDER.politica.filter(function(i){return ['maioridade','messias','sucessao'].indexOf(i)<0;}));
ORDER.economia = ['reuniao_eco'].concat(ORDER.economia);
ORDER.regioes = ['rj_pm','rj_teto'].concat(ORDER.regioes);
ORDER.regioes.splice(ORDER.regioes.indexOf('ne')+1,0,'ce_oposicao','ce_arma');
/* ===== Edição das 19h ===== */
EDICAO.hora = '19h';
S.paraguai.t = "Peña renuncia no Paraguai, Câmara aprova acusação contra ele e livra o vice, Alliana, que deve assumir";
S.paraguai.sub = "Deputados aprovaram o juízo político de Peña, que segue ao Senado, e rejeitaram por 48 a 30 o processo contra o vice. A posse é esperada para as próximas horas.";
S.paraguai.resumo = "Santiago Peña renunciou nesta quinta (5) à Presidência do Paraguai, em meio à quebra do Banco Ueno. Horas depois, a Câmara dos Deputados aprovou a acusação de mau desempenho contra ele, que segue ao Senado, e rejeitou por 48 votos a 30 o juízo político contra o vice, Pedro Alliana. O resultado abre caminho para Alliana assumir; a posse era esperada nas próximas horas, segundo a imprensa paraguaia e argentina.";
S.paraguai.upd = "A Câmara paraguaia aprovou a acusação contra Peña, enviada ao Senado, e rejeitou por 48 a 30 o processo contra Alliana, o que o deixa a caminho da posse.";
S.paraguai.fundo.push(["h","Atualização das 19h: a Câmara decide"]);
S.paraguai.fundo.push(["p","Em sessão extraordinária nesta quinta, a Câmara dos Deputados do Paraguai rejeitou o juízo político contra o vice-presidente Pedro Alliana por 48 votos contra 30 a favor, entre 78 presentes, segundo a EFE publicada pela Infobae. Para a agência, o resultado abre o caminho de Alliana como sucessor. Segundo a Cadena 3, colorados governistas, dissidentes e afins apoiaram o vice, e as bancadas contrárias ao processo argumentaram que ele não tinha responsabilidade legal nem ingerência na crise financeira."]);
S.paraguai.fundo.push(["p","Peña já havia renunciado, mas, segundo a EFE, os 78 deputados presentes aprovaram a acusação contra ele por “grave e sistemático mau desempenho de suas funções”, e o caso foi remetido ao Senado, que decidirá se haverá processo. A Constituição exige dois terços para a acusação ir ao Senado e dois terços ali para condená-lo. O ADN País informa que a posse de Alliana está prevista para as próximas horas; nenhuma das páginas consultadas informa hora nem formato da cerimônia."]);
S.paraguai.fontes.push(["Infobae (EFE): Câmara rejeita juízo político contra Alliana","https://www.infobae.com/america/agencias/2026/11/05/diputados-rechazan-juicio-politico-a-vicepresidente-paraguayo-posible-sucesor-de-pena/"]);
S.paraguai.fontes.push(["Cadena 3","https://www.cadena3.com/noticia/mundo/paraguay-la-camara-de-diputados-desestima-juicio-politico-contra-el-vicepresidente-alliana_610602"]);
S.paraguai.fontes.push(["ADN País","https://adnpais.com/notas/104360-El-vicepresidente-de-Paraguay-asumira-la-presidencia-tras-quedar-afuera-del-juicio-politico"]);
S.paraguai.fontes.push(["La Política Online","https://www.lapoliticaonline.com/paraguay/politica-py/acorralado-pena-renuncia-a-la-presidencia-y-alliana-da-un-paso-al-frente/"]);

S.juicio = {ed:'mundo', k:'Mundo', hora:'5/11',
 t:"Cartes abandona Peña, e o Partido Colorado vira o jogo que levou à renúncia",
 sub:"O ex-presidente e chefe da ANR passou a apoiar o juízo político. Peña pediu desculpas em vídeo e deve ter o foro de senador vitalício discutido.",
 resumo:"A renúncia de Santiago Peña foi precedida da perda de apoio do Partido Colorado. Horacio Cartes, presidente da ANR e padrinho político do presidente, escreveu no X que o partido acompanharia o juízo político e não ficaria “do lado do latrocínio” de fundos públicos, privados e de aposentados, segundo a Infobae. Peña pediu desculpas em vídeo. Ainda estão em aberto o futuro do foro de senador vitalício e uma denúncia penal.",
 fundo:[
  ["p","O juízo político foi apresentado na quarta (4) por 35 deputados, com base no artigo 225 da Constituição, e pedia sessão extraordinária para a quinta. Segundo a Infobae, a acusação também mirava Alliana. Eram necessários 53 dos 80 votos na Câmara e, depois, 30 dos 45 no Senado."],
  ["p","O ponto de virada, segundo a Infobae, foi a posição de Horacio Cartes, presidente da ANR (Partido Colorado) e quem impulsionou a candidatura de Peña em 2023. Cartes escreveu no X: “Acompanhamos o juízo político ao presidente da República” e “não estaremos do lado do latrocínio dos fundos públicos, privados e dos aposentados”. A BioBioChile lista cinco causas da acusação, entre elas conflito de interesses e créditos de cerca de US$ 123 milhões a empresas relacionadas."],
  ["p","No vídeo da renúncia, Peña disse ter “tomado a decisão de apresentar a renúncia à presidência da República” e pediu desculpas: “Nunca foi minha intenção defraudar a confiança que depositaram em mim”."],
  ["h","O que está pendente"],
  ["p","Segundo a La Política Online, o Congresso decidirá se Peña mantém o foro de senador vitalício, e o ministro do Interior, Enrique Riera, foi ao Legislativo notificar a renúncia. O senador Luis Pettengill (Fuerza Republicana) disse que, com ou sem blindagem, “isso não vai ser um problema”, e que podem votar para retirar os foros. O mesmo veículo diz que Alliana prepara uma troca completa de ministros e que o senador Antonio “Tony” Barrios, ligado a Cartes, seria o novo vice, informação que outras fontes não confirmam."],
  ["nums",[["48 × 30","votos contra e a favor do juízo político a Alliana"],["35","deputados que assinaram o pedido contra Peña"],["2/3","maioria exigida em cada Casa para destituir"]]]
 ],
 fontes:[["Infobae: renúncia de Peña","https://www.infobae.com/america/america-latina/2026/11/05/santiago-pena-renuncio-a-la-presidencia-de-paraguay-por-el-escandalo-del-ueno-bank/"],["BioBioChile","https://www.biobiochile.cl/noticias/internacional/america-latina/2026/11/05/santiago-pena-renuncia-a-la-presidencia-de-paraguay-en-medio-de-crisis-por-ueno-bank.shtml"],["La Política Online","https://www.lapoliticaonline.com/paraguay/politica-py/acorralado-pena-renuncia-a-la-presidencia-y-alliana-da-un-paso-al-frente/"],["CNN Brasil","https://www.cnnbrasil.com.br/internacional/presidente-do-paraguai-apresenta-renuncia-em-meio-a-crise-em-banco-no-pais/"]]};

S.ueno = {ed:'mundo', k:'Mundo', hora:'5/11',
 t:"Ueno Bank: lei de emergência antecipa pagamentos a poupadores, e BC paraguaio troca de comando",
 sub:"A Promotoria imputou 27 pessoas e pediu prisão preventiva do fundador. O Fundo de Garantia paga adiantamento de até 40 salários mínimos.",
 dado:{n:'2,9 mi', l:'Clientes do Ueno · US$ 850 mi em depósitos públicos, incluindo o IPS'},
 resumo:"O Banco Central do Paraguai mandou intervir e liquidar o Ueno na terça (3), depois de o índice de solvência cair a menos da metade do mínimo exigido. O Congresso aprovou em tempo recorde uma lei de emergência, promulgada por Peña na quarta (4), que antecipa do Fundo de Garantia de Depósitos até 40 salários mínimos por poupador. A Promotoria imputou 27 pessoas e Raúl Vera Bogado foi indicado para presidir o BCP.",
 fundo:[
  ["p","Segundo a Infobae, o banco tem cerca de 2,9 milhões de clientes num país de 6,1 milhões de habitantes, e guarda aproximadamente US$ 850 milhões em recursos públicos, incluindo o Instituto de Previsão Social (IPS). Houve filas nas agências e protestos noturnos em Assunção."],
  ["p","A lei de emergência permite antecipar do Fundo de Garantia até 40 salários mínimos mensais (121,7 milhões de guaranis, cerca de US$ 19,8 mil), em até cinco dias úteis. O teto do fundo é de 75 salários mínimos por pessoa, e um primeiro pagamento de até 10 milhões de guaranis (cerca de US$ 1.675) foi anunciado para breve."],
  ["p","Peña nomeou o economista Raúl Vera Bogado para a presidência do Banco Central, no lugar de Carlos Carvallo, que renunciou. A indicação precisa ser confirmada pelo Senado. A Promotoria imputou 27 pessoas por operações de 2025 e 2026 e pediu prisão preventiva do fundador e maior acionista, Miguel Vásquez, e domiciliar para os demais executivos, segundo a Infobae. Peña foi acionista do grupo dono do banco até março de 2025, de acordo com a CNN Brasil."]
 ],
 fontes:[["Infobae","https://www.infobae.com/america/america-latina/2026/11/05/santiago-pena-renuncio-a-la-presidencia-de-paraguay-por-el-escandalo-del-ueno-bank/"],["CNN Brasil","https://www.cnnbrasil.com.br/internacional/presidente-do-paraguai-apresenta-renuncia-em-meio-a-crise-em-banco-no-pais/"],["BioBioChile","https://www.biobiochile.cl/noticias/internacional/america-latina/2026/11/05/santiago-pena-renuncia-a-la-presidencia-de-paraguay-en-medio-de-crisis-por-ueno-bank.shtml"]]};

S.maioridade.upd = "Planalto e PT intensificaram, segundo a CNN Brasil, o esforço para a PEC não avançar: a comissão especial da Câmara aprovou 12 pedidos de audiência, o que pode levar o debate a 2027.";
S.maioridade.sub = "A comissão especial da Câmara aprovou 12 requerimentos de audiências, e Planalto e PT trabalham para esfriar o tema. O relator ainda busca votar em novembro.";
S.maioridade.fundo.push(["h","Atualização das 19h: audiências e articulação do Planalto"]);
S.maioridade.fundo.push(["p","Segundo o Diário Carioca, que cita a CNN Brasil, Planalto e PT intensificaram os esforços para impedir que a proposta avance, com entendimentos com Alcolumbre e Hugo Motta para que o tema não seja prioridade. Na Câmara, a comissão especial aprovou 12 requerimentos de audiências públicas, o que, se todas ocorrerem, pode estender a discussão até a próxima legislatura, em fevereiro de 2027, informa a BNews. Interlocutores do governo dizem que a proposta não tem apoio da maioria dos petistas nem do Executivo."]);
S.maioridade.fundo.push(["p","O Terra Brasil Notícias registra que Lula defende reduzir a idade de 18 para 16 anos apenas em crimes hediondos, enquanto a oposição quer 16 para todos os crimes e 14 nos hediondos. O Senado havia aprovado a PEC da Segurança na terça (3) e retirado, por 38 votos a 36, as emendas sobre maioridade, que seguem em tramitação separada. Um ponto levantado pela BNews é o impacto sobre o sistema prisional."]);
S.maioridade.fontes.push(["Diário Carioca (Planalto e PT)","https://www.diariocarioca.com/2026/11/05/politica/plano-pt-adiam-maioridade-penal-congresso/"]);
S.maioridade.fontes.push(["BNews São Paulo","https://www.bnewssaopaulo.com.br/noticias/politica/governo-e-pt-tentam-esfriar-debate-sobre-maioridade-penal.html"]);
S.maioridade.fontes.push(["Terra Brasil Notícias","https://terrabrasilnoticias.com/2026/11/lula-atua-nos-bastidores-e-alcolumbre-adia-votacao-da-maioridade-penal/"]);

S.fuga.t = "NYT: assessor de Milei ajudou Flávio a embarcar para Miami; Itamaraty pediu explicações a Buenos Aires";
S.fuga.sub = "Santiago Caputo teria ido a Puerto Iguazú e acelerado documentos, diz o jornal americano. Flávio e o governo argentino negam participação.";
S.fuga.upd = "O New York Times reportou que Santiago Caputo, assessor de Milei, esteve em Puerto Iguazú e ajudou na saída de Flávio; ele e a chancelaria argentina negam.";
S.fuga.fundo.push(["h","Atualização das 19h: o papel de um assessor de Milei"]);
S.fuga.fundo.push(["p","Segundo reportagem do New York Times resumida pelo Diário Carioca, três pessoas disseram que Santiago Caputo, assessor de Javier Milei, encontrou Flávio no aeroporto de Puerto Iguazú em 27 de outubro e ajudou a acelerar passaportes e documentos. Duas fontes dizem que Caputo chegou na noite de 26 de outubro em jato particular. A aeronave pertence à Baires Fly e foi fretada por um intermediário por US$ 150 mil. Flávio, a mulher e as duas filhas embarcaram pouco depois da meia-noite rumo a Miami, e, segundo as fontes, Caputo pediu a um policial que apagasse vídeos do pátio."]);
S.fuga.fundo.push(["p","Flávio negou ajuda do governo argentino: “vários argentinos estavam ao meu lado, não sei se um deles era esse cara”. Caputo disse não ter tido “nenhum papel”, e a chancelaria argentina rejeitou participação do governo. O jornal diz que não havia mandado de prisão contra o senador quando ele cruzou a fronteira, e que o Itamaraty convocou o encarregado de negócios argentino em Brasília para pedir explicações."]);
S.fuga.fontes.push(["Diário Carioca (NYT)","https://www.diariocarioca.com/2026/11/05/mundo/americas/assessor-milei-ajudou-flavio-fuga-miami/"]);

S.argentina.upd = "A reportagem do NYT sobre o papel de um assessor de Milei na saída de Flávio, e o pedido de explicações do Itamaraty, aprofundam a crise entre Brasília e Buenos Aires.";
S.argentina.fundo.push(["h","Atualização das 19h"]);
S.argentina.fundo.push(["p","O New York Times relatou que Santiago Caputo, assessor de Milei, teria ajudado Flávio Bolsonaro a embarcar em Puerto Iguazú rumo a Miami; a chancelaria argentina nega participação do governo, segundo o Diário Carioca. A matéria diz que o Itamaraty convocou o encarregado de negócios da Argentina em Brasília para pedir explicações."]);
S.argentina.fontes.push(["Diário Carioca (NYT)","https://www.diariocarioca.com/2026/11/05/mundo/americas/assessor-milei-ajudou-flavio-fuga-miami/"]);

S.cpac = {ed:'politica', k:'Política · Bastidores', hora:'5/11',
 t:"Flávio e Eduardo buscam aliados estrangeiros na CPAC da Flórida; oposição quer voto aberto na eleição do Senado",
 sub:"Segundo o programa Sem Rodeios, da Gazeta do Povo, o grupo quer pressionar Lula e o STF e impedir a reeleição de Alcolumbre em fevereiro de 2027.",
 resumo:"Flávio Bolsonaro e Eduardo Bolsonaro buscam alianças com conservadores estrangeiros na CPAC, na Flórida, para fortalecer a oposição a Lula e ao STF, segundo o programa Sem Rodeios, da Gazeta do Povo. No Senado, a direita quer voto aberto para disputar a presidência da Casa em fevereiro de 2027, com Rogério Marinho (PL-RN) como candidato. É conteúdo de programa de opinião, tratado aqui como bastidor.",
 fundo:[
  ["p","O resumo do programa, publicado na manhã desta quinta, diz que Flávio e Eduardo Bolsonaro tentam fechar apoios externos na CPAC, nos Estados Unidos. Segundo o mesmo texto, a oposição de direita quer que o voto na eleição para a presidência do Senado seja aberto, para impedir a reeleição de Davi Alcolumbre, e Marinho defende que os parlamentares declarem publicamente o voto."],
  ["p","O programa também cita o adiamento da maioridade penal no Senado a pedido de Hugo Motta, que frustrou um acordo entre governistas e oposição, e menciona mensagens entre Daniel Vorcaro e Márcio Chaer, do ConJur, sobre um evento em Londres em abril de 2024 patrocinado pelo Banco Master. Nenhuma dessas afirmações foi verificada de forma independente pelo Radar."]
 ],
 fontes:[["Gazeta do Povo (Sem Rodeios)","https://www.gazetadopovo.com.br/sem-rodeios/flavio-busca-apoio-externo-contra-lula/"]]};

S.marinho.upd = "A oposição de direita quer voto aberto na eleição do Senado, de fevereiro de 2027, para barrar a reeleição de Alcolumbre, segundo o programa Sem Rodeios.";
S.marinho.fundo.push(["h","Atualização das 19h"]);
S.marinho.fundo.push(["p","Segundo o Sem Rodeios, da Gazeta do Povo, a direita quer que a eleição para a presidência do Senado, em fevereiro de 2027, tenha voto aberto, e Marinho defende que os parlamentares declarem publicamente o voto."]);
S.marinho.fontes.push(["Gazeta do Povo (Sem Rodeios)","https://www.gazetadopovo.com.br/sem-rodeios/flavio-busca-apoio-externo-contra-lula/"]);

S.vorcaro.upd = "Mensagens entre Vorcaro e Márcio Chaer, do ConJur, citadas pelo programa Sem Rodeios, ligam um evento em Londres em 2024, patrocinado pelo Master, a convites de Moraes a colegas.";
S.vorcaro.fundo.push(["h","Atualização das 19h"]);
S.vorcaro.fundo.push(["p","O programa Sem Rodeios, da Gazeta do Povo, afirma que mensagens entre Daniel Vorcaro e Márcio Chaer indicam que Alexandre de Moraes convidou colegas para um evento em Londres, em abril de 2024, patrocinado pelo Banco Master; entre os convidados estariam Gilmar Mendes e Luís Felipe Salomão. Vorcaro teria pedido que o nome do banco fosse retirado dos convites. A informação vem de programa de opinião e não foi confirmada por outras fontes consultadas."]);
S.vorcaro.fontes.push(["Gazeta do Povo (Sem Rodeios)","https://www.gazetadopovo.com.br/sem-rodeios/flavio-busca-apoio-externo-contra-lula/"]);

S.eua.upd = "Trump disse à Fox que parabenizava os democratas e que não via a derrota como golpe contra ele; o novo Congresso passa a controlar comissões e a poder convocar integrantes do governo.";
S.eua.fundo.push(["h","Atualização das 19h"]);
S.eua.fundo.push(["p","Em entrevista por telefone à Fox News, segundo o Metrópoles, Trump disse: “Parabéns aos democratas. Eles fizeram um bom trabalho”, e afirmou que os adversários esperavam isso havia 11 anos, mas que não encarava o resultado como “um golpe contra mim”. Com o controle da Câmara, a oposição passa a presidir comissões e pode convocar integrantes do governo e abrir investigações; um impeachment exigiria maioria na Câmara e dois terços do Senado para condenar. No Senado, a oposição também pode dificultar indicações. Os números do Metrópoles, de 4/11, eram de 54 a 44 no Senado e 225 a 138 na Câmara, ainda parciais."]);
S.eua.fontes.push(["Metrópoles (apuração)","https://www.metropoles.com/mundo/eleicoes-nos-eua-apuracao-de-votos-midterms"]);

S.franca.t = "França para com greve geral: 260 atos, Torre Eiffel fechada, e Parlamento rejeita parte do orçamento de 2027";
S.franca.sub = "Autoridades estimam até 700 mil manifestantes fora de Paris. Os sindicatos da SNCF mantêm paralisação até a manhã de sexta, e os coletes amarelos convocam ato para sábado.";
S.franca.upd = "Os atos ocorreram: cerca de 260 manifestações, gás lacrimogêneo em Paris, Torre Eiffel fechada, e o Parlamento rejeitou na quarta a primeira parte do orçamento de 2027.";
S.franca.fundo.push(["h","Atualização das 19h: o dia dos protestos"]);
S.franca.fundo.push(["p","Segundo a NC News, foram convocadas cerca de 260 manifestações, e as autoridades estimavam até 700 mil pessoas fora da capital e entre 40 mil e 80 mil em Paris, com 70 mil policiais mobilizados. Em Paris, a polícia usou gás lacrimogêneo contra estudantes que bloqueavam escolas, centenas de escolas foram afetadas e a Torre Eiffel fechou ao público. A CGT defende reajuste de 10% no salário mínimo."]);
S.franca.fundo.push(["p","Na quarta (4), o Parlamento rejeitou a primeira parte do orçamento de 2027. O primeiro-ministro, Sébastien Lecornu, se reuniu com sindicatos sem acordo, e o ministro do Interior, Laurent Nuñez, anunciou reforço do policiamento. Os quatro principais sindicatos da SNCF convocaram paralisação da noite de quarta até a manhã de sexta (6), os coletes amarelos chamaram ato em Paris no sábado (7), e os sindicatos avaliam novas paralisações."]);
S.franca.fontes.push(["NC News","https://ncnews.com.br/2026/11/05/franca-greve-geral-protestos-macron/"]);
S.franca.fontes.push(["Folha de Curitiba","https://folhadecuritiba.com.br/franca-mobiliza-70-mil-policiais-para-protestos-e-macron-convoca-reuniao-de-crise/"]);

S.mercado = {ed:'economia', k:'Economia', hora:'5/11',
 t:"Ibovespa sobe e dólar fica perto de R$ 5,45 um dia depois de o Copom parar os cortes",
 sub:"Na quarta, o índice interrompeu seis quedas seguidas. Na manhã desta quinta, avançava cerca de 0,8%, e os juros longos tinham viés de alta.",
 dado:{n:'167,5 mil', l:'Ibovespa no fechamento de quarta (4), alta de 1,23% · Money Times'},
 resumo:"O Ibovespa fechou a quarta (4) em alta de 1,23%, a 167.563 pontos, e interrompeu seis quedas seguidas. Na manhã desta quinta (5), subia cerca de 0,8% e o dólar oscilava perto de R$ 5,45, depois de o Copom manter a Selic em 13,75%. Os dados são parciais, de antes do fechamento de quinta.",
 fundo:[
  ["p","Segundo o Money Times, o dólar à vista fechou quarta a R$ 5,4518 (-0,65%). Na quinta, de acordo com a Suno, a moeda chegou à mínima de R$ 5,427 antes das 11h e, às 11h40, valia R$ 5,453, com máxima de R$ 5,473. O Ibovespa abriu perto de 167,9 mil pontos e, às 11h25, subia 0,79%, a 168.888 pontos."],
  ["p","A Suno atribui parte do movimento à vitória democrata nas eleições dos EUA, que reforçou a expectativa de fim da guerra EUA-Irã. Entre as ações, C&A subia 10,13%, Cosan 8,79% e Hapvida 7,13%, enquanto Tenda caía 10,03%."],
  ["p","Nos juros futuros, conforme a CNN Brasil, na manhã de quinta o DI para janeiro de 2029 ia a 14,855% (de 14,785%) e o de janeiro de 2031 a 15,130% (de 14,975% no ajuste anterior), com viés de alta nos vencimentos longos. O Citi avalia que o Copom “indicou que há alguma margem antes de iniciar um possível ciclo de alta de juros” e projeta Selic inalterada nas próximas reuniões; o Itaú BBA vê tom “um pouco menos duro” do que esperava."],
  ["h","Agenda econômica de quinta"],
  ["p","O Money Times lista a divulgação da balança comercial de outubro, às 15h, e de produção industrial de setembro, esperada em queda de 0,3% pela mediana do Broadcast. Nos EUA, saem o payroll e falas de dirigentes do Fed."]
 ],
 fontes:[["Suno Notícias","https://www.suno.com.br/noticias/dolar-ibovespa-05112026-selic-copom-go/"],["CNN Brasil (juros futuros)","https://www.cnnbrasil.com.br/economia/money/mercado/juros-futuros-hoje-5-novembro-2026/"],["Money Times","https://www.moneytimes.com.br/copom-pausa-cortes-e-bolsa-ainda-surfa-onda-azul-nos-eua-ibovespa-em-dolar-sobe-nesta-quinta-feira-5-rens/"]]};

S.copom.upd = "Citi e Itaú BBA avaliam que o tom do comunicado foi menos duro que o esperado e projetam Selic estável, enquanto os juros futuros longos têm viés de alta.";
S.copom.fundo.push(["h","Atualização das 19h: leitura dos bancos"]);
S.copom.fundo.push(["p","Segundo a CNN Brasil, o Citi disse que o Copom “indicou que há alguma margem antes de iniciar um possível ciclo de alta de juros, conforme atualmente precificado pelos mercados”, e o Itaú BBA afirmou que “o tom foi um pouco menos duro do que esperávamos”; ambos esperam estabilidade nas próximas reuniões. O ministro Dario Durigan disse que não faria comentários valorativos, mas que o juro alto prejudica todos os setores."]);
S.copom.fontes.push(["CNN Brasil (juros futuros)","https://www.cnnbrasil.com.br/economia/money/mercado/juros-futuros-hoje-5-novembro-2026/"]);

S.tse_name = {ed:'regioes', reg:'co', k:'Centro-Oeste', hora:'5/11',
 t:"TSE julga a partir de sexta o recurso de Jamilson Name, deputado do PP de MS com 35 mil votos",
 sub:"A sessão virtual da Segunda Turma vai de 6 a 12 de novembro. Se o registro continuar indeferido, os votos seguem anulados para a federação.",
 dado:{n:'35.211', l:'Votos de Jamilson Name no 1º turno · Correio do Estado'},
 resumo:"A Segunda Turma do TSE julga em sessão virtual, prevista entre 6 e 12 de novembro, o recurso do deputado estadual Jamilson Name (PP-MS) contra o indeferimento do registro de candidatura. Ele teve 35.211 votos. Se o recurso for acolhido, os votos podem ser validados para a Federação União Progressista; se não, seguem anulados. A inclusão em pauta não garante decisão no dia.",
 fundo:[
  ["p","Segundo o Correio do Estado, o registro foi indeferido em 2 de outubro pelo ministro Sebastião Reis Júnior, relator, que acolheu recurso do Ministério Público Eleitoral e reformou decisão do TRE-MS, que havia autorizado a candidatura por 5 votos a 1. O MPE cita investigações da Operação Omertà; a defesa diz que o parlamentar não integra organização paramilitar ou armada."],
  ["p","Name integra a Federação União Progressista (PP e União Brasil), que conquistou quatro vagas na disputa proporcional em Mato Grosso do Sul, e estava entre os 12 deputados estaduais mais votados. O processo é o 0600455-63.2026.6.12.0000. A própria matéria ressalva que a inclusão na pauta não significa decisão definitiva na data, e sessões virtuais podem ser afetadas por pedido de vista ou destaque."]
 ],
 fontes:[["Correio do Estado","https://correiodoestado.com.br/politica/2026/10/30/tse-marca-para-6-de-novembro-julgamento-que-pode-definir-futuro-de-jamilson-name.html"]]};

HOME_LEAD = 'fuga';
HOME_ROW = ['paraguai','copom','rj_pm'];
var _mv=function(arr,ids){return ids.concat(arr.filter(function(i){return ids.indexOf(i)<0;}));};
ORDER.politica = _mv(ORDER.politica,['fuga','cpac','maioridade','argentina']);
ORDER.economia = _mv(ORDER.economia,['mercado','copom']);
ORDER.mundo = _mv(ORDER.mundo,['paraguai','juicio','ueno']);
ORDER.regioes.splice(ORDER.regioes.indexOf('co')+1,0,'tse_name');
GIRO = GIRO.filter(function(g){return ["Reunião sobre a dívida","Maioridade na Câmara","“Fazer Lula sangrar”","Oposição no Ceará","Ministérios e o PT"].indexOf(g[0])<0;}).concat([
 ["Caputo em Iguazú","O NYT diz que um assessor de Milei ajudou Flávio a embarcar para Miami; Flávio e Buenos Aires negam, segundo o Diário Carioca.","Diário Carioca (NYT)","https://www.diariocarioca.com/2026/11/05/mundo/americas/assessor-milei-ajudou-flavio-fuga-miami/","","fuga"],
 ["Esfriar a maioridade","Planalto e PT buscam acordos com Alcolumbre e Motta para o tema não ser prioridade, segundo o Diário Carioca, que cita a CNN Brasil.","Diário Carioca","https://www.diariocarioca.com/2026/11/05/politica/plano-pt-adiam-maioridade-penal-congresso/","","maioridade"],
 ["Voto aberto no Senado","A oposição quer voto aberto para tentar barrar a reeleição de Alcolumbre, diz o programa Sem Rodeios.","Gazeta do Povo","https://www.gazetadopovo.com.br/sem-rodeios/flavio-busca-apoio-externo-contra-lula/","","cpac"],
 ["Bolsa sobe após o Copom","Ibovespa avançava cerca de 0,8% na manhã de quinta, e o dólar rondava R$ 5,45, segundo a Suno.","Suno Notícias","https://www.suno.com.br/noticias/dolar-ibovespa-05112026-selic-copom-go/","","mercado"],
 ["Greve na França","A SNCF mantém paralisação até a manhã de sexta, e os coletes amarelos convocam ato em Paris no sábado, diz a NC News.","NC News","https://ncnews.com.br/2026/11/05/franca-greve-geral-protestos-macron/","","franca"],
 ["Votos de Name no TSE","A Segunda Turma julga a partir de sexta o recurso do deputado Jamilson Name, com 35.211 votos, segundo o Correio do Estado.","Correio do Estado","https://correiodoestado.com.br/politica/2026/10/30/tse-marca-para-6-de-novembro-julgamento-que-pode-definir-futuro-de-jamilson-name.html","","tse_name"]
]);
AMANHA = AMANHA.filter(function(a){return a[5]!=='ato_obsceno';});
AMANHA.unshift(
 ["Sex, 06/11","justica","TSE começa a julgar o recurso de Jamilson Name","A Segunda Turma analisa em sessão virtual, de 6 a 12 de novembro, o registro do deputado do PP de MS, que teve 35.211 votos. Está em jogo a validação desses votos para a federação; a inclusão em pauta não garante decisão no dia.","https://correiodoestado.com.br/politica/2026/10/30/tse-marca-para-6-de-novembro-julgamento-que-pode-definir-futuro-de-jamilson-name.html","tse_name"],
 ["Sex, 06/11 · manhã","mundo","Termina a paralisação da SNCF na França","Os quatro principais sindicatos da estatal ferroviária pararam da noite de quarta até a manhã de sexta, no fim da greve geral contra Macron. A retomada dos trens e a decisão sobre novas paralisações medem o fôlego do movimento.","https://ncnews.com.br/2026/11/05/franca-greve-geral-protestos-macron/","franca"],
 ["Sáb, 07/11","mundo","Coletes amarelos convocam ato em Paris","O grupo chamou manifestação na capital francesa no sábado, dois dias depois da greve geral. O governo teme repetir os tumultos de 17 de outubro.","https://ncnews.com.br/2026/11/05/franca-greve-geral-protestos-macron/","franca"]
);

/* ===== Edição das 07h ===== */
EDICAO.hora = '07h';
EDICAO.data = 'Sexta, 06 de novembro de 2026';
S.ms_seg = {"ed": "politica", "k": "Política · Segurança", "hora": "5/11", "t": "Lula anuncia MP para criar o Ministério da Segurança Pública e marca a primeira reunião para esta sexta", "sub": "Em live com André Janones, o presidente disse que a pasta, condicionada à PEC aprovada pelo Senado na terça, será criada por medida provisória; encontro com ministros está previsto para as 16h.", "dado": {"n": "16h", "l": "Reunião de Lula com Casa Civil, Justiça, Fazenda e Planejamento sobre a MP, nesta sexta (6)"}, "resumo": "Lula anunciou na quinta (5), em live com o deputado André Janones (Rede-MG), que vai editar medida provisória para criar o Ministério da Segurança Pública. A criação da pasta estava condicionada à PEC da Segurança, aprovada pelo Senado na terça (3). A primeira discussão será nesta sexta (6), às 16h, com as áreas de Casa Civil, Justiça, Fazenda e Planejamento. Lula não informou custo nem quem comandará o ministério.", "fundo": [["p", "O presidente Lula afirmou na quinta-feira (5), durante transmissão no YouTube com o deputado André Janones (Rede-MG), que enviará uma medida provisória criando o Ministério da Segurança Pública. “Amanhã, já vamos fazer a primeira discussão, que vou criar e mandar a Medida Provisória criando o Ministério da Segurança Pública”, disse, segundo o ND Mais. Para o presidente, a criação da pasta “é uma reivindicação da sociedade brasileira”."], ["p", "Segundo o Jornal de Brasília, a reunião está marcada para as 16h desta sexta e reúne Miriam Belchior (Casa Civil), Wellington César Lima e Silva (Justiça e Segurança Pública), Dario Durigan (Fazenda) e Bruno Moretti (Planejamento). O governo quer reforçar o combate às organizações criminosas, o enfrentamento ao tráfico de armas e explosivos, o estrangulamento financeiro do crime organizado e das milícias e a segurança nos presídios. Uma MP tem força de lei assim que é assinada, mas perde a validade se Câmara e Senado não a aprovarem em 60 dias, prorrogáveis por mais 60."], ["p", "Lula defende a criação do ministério desde fevereiro e a condicionou à aprovação da PEC da Segurança Pública, que o Senado aprovou na terça (3). O Jornal Razão registra que o presidente comemorou os 73 votos favoráveis e disse que “nem a extrema-direita teve coragem de votar contra”; O Tempo e o ND Mais descrevem a votação como unânime. A PEC ainda aguarda promulgação pelo Congresso."], ["p", "Na live, Lula também falou em criar uma “Guarda Nacional muito especial” e afirmou, segundo o Jornal Razão, que “nós temos que criar o ministério, colocar dinheiro, preparar Polícia Militar”. Ele não informou o custo do novo ministério, o nome do futuro ministro nem o funcionamento da guarda."]], "fontes": [["O Tempo", "https://www.otempo.com.br/politica/governo/2026/11/5/lula-promete-mp-para-criar-ministerio-da-seguranca-publica-nesta-sexta-feira-6-11"], ["ND Mais", "https://ndmais.com.br/politica/reivindicacao-da-sociedade-lula-anuncia-criacao-do-ministerio-da-seguranca-publica-apos-aprovacao-de-pec-em-live/"], ["Jornal de Brasília", "https://jornaldebrasilia.com.br/noticias/politica-e-poder/lula-anuncia-mp-para-criar-ministerio-da-seguranca-publica/"], ["Jornal Razão", "https://jornalrazao.com/politica/lula-ensinar-bandidos-guarda-nacional-ministerio-seguranca"]]};
S.brent = {"ed": "economia", "k": "Economia", "hora": "5/11", "t": "Petróleo Brent sobe 3,9% a US$ 98,29 após novos ataques a petroleiros, depois de queda de mais de 8% na véspera", "sub": "Ao menos cinco embarcações relataram incidentes desde domingo, segundo a UKMTO; em outubro foram 35, recorde mensal da guerra contra o Irã.", "dado": {"n": "US$ 98,29", "l": "Brent no fechamento de quinta (5), alta de 3,88% · Reuters"}, "resumo": "O Brent fechou a quinta (5) em alta de US$ 3,67 (3,88%), a US$ 98,29 por barril, e o WTI subiu 2,72%, a US$ 90,52, segundo a Reuters. Os contratos tinham caído mais de 8% na quarta, para os menores níveis desde 31 de agosto. A recuperação veio com novos relatos de petroleiros atingidos, por minas ou drones, no Oriente Médio, em meio à guerra contra o Irã.", "fundo": [["p", "O petróleo Brent fechou em alta de US$ 3,67, ou 3,88%, a US$ 98,29 por barril na quinta-feira (5), e o WTI avançou US$ 2,40 (2,72%), a US$ 90,52, de acordo com a Reuters publicada pelo Investing.com Brasil. Na quarta (4), os dois contratos haviam caído mais de 8%, para os menores fechamentos desde 31 de agosto."], ["p", "Segundo a agência, a Organização Marítima do Reino Unido (UKMTO) registra ao menos cinco embarcações com incidentes desde domingo, ritmo próximo do recorde. Em outubro, 35 navios foram atingidos, o maior número mensal desde o início da guerra contra o Irã, iniciada em fevereiro por EUA e Israel. O analista Andy Lipow citou relatos de petroleiros atingidos por minas ou drones."], ["p", "A Reuters atribui a recuperação à cautela com a precificação de uma rápida normalização dos fluxos de petróleo. No Brasil, a alta pesou na sessão: as ações da Petrobras fecharam em queda, segundo o Campo Grande News, e a commodity entra no debate sobre preço do diesel."]], "fontes": [["Investing.com Brasil (Reuters)", "https://br.investing.com/news/commodities-news/petroleobrent-dispara-e-fecha-com-alta-de-mais-de-us3-apos-ataques-a-petroleiros-2117999"], ["Campo Grande News", "https://www.campograndenews.com.br/economia/dolar-sobe-a-r-5-48-com-pressao-externa-e-manutencao-dos-juros"]]};
S.wall_street = {"ed": "economia", "k": "Economia", "hora": "5/11", "t": "Wall Street tem dia de perdas fortes com ações de tecnologia e IA; Nasdaq cai 5,52%", "sub": "Pressão sobre semicondutores e data centers derrubou também S&P 500 (-4,36%) e Dow Jones (-3,44%), segundo o Portal Viu.", "dado": {"n": "-5,52%", "l": "Nasdaq na quinta (5) · Portal Viu"}, "resumo": "As bolsas de Nova York fecharam a quinta (5) em forte queda, com pressão sobre tecnologia, semicondutores e data centers ligados à inteligência artificial. Segundo o Portal Viu, a Nasdaq caiu 5,52%, o S&P 500 recuou 4,36% e o Dow Jones, 3,44%. O dólar ganhou força no exterior, e o movimento contribuiu para a queda do Ibovespa. Os números vêm de uma única fonte lida pelo Radar.", "fundo": [["p", "As bolsas americanas fecharam em baixa expressiva na quinta-feira (5). De acordo com o Portal Viu, a Nasdaq caiu 5,52%, a 24.315 pontos; o S&P 500 recuou 4,36%, a 7.353,73 pontos; e o Dow Jones perdeu 3,44%, a 51.523,06 pontos. O índice DXY, que mede o dólar frente a uma cesta de moedas, subiu 0,09%, a 101,560."], ["p", "A pressão concentrou-se em empresas de tecnologia, semicondutores e data centers ligados à inteligência artificial. O Campo Grande News associa a queda à cautela dos investidores e ao fortalecimento do dólar. No Brasil, o Ibovespa devolveu parte do ganho de quarta e fechou em queda de 0,82%, e o dólar subiu 0,67%."], ["p", "A magnitude das quedas aparece em apenas uma das fontes consultadas; o Radar não encontrou, até esta edição, segunda confirmação independente dos percentuais."]], "fontes": [["Portal Viu", "https://www.portalviu.com.br/economia/dolar-sobe-para-r-549-e-bolsa-brasileira-fecha-em-queda-apos-perdas-em-wall-street"], ["Campo Grande News", "https://www.campograndenews.com.br/economia/dolar-sobe-a-r-5-48-com-pressao-externa-e-manutencao-dos-juros"]]};
S.rnest = {"ed": "regioes", "reg": "ne", "k": "Nordeste · Pernambuco", "hora": "5/11", "t": "Raquel Lyra e a presidente da Petrobras discutem segundo trem da Refinaria Abreu e Lima e logística em Suape", "sub": "Encontro no Rio definiu nova rodada técnica entre governo estadual e a estatal; a capacidade da RNEST subiu de 230 mil para 260 mil barris por dia.", "resumo": "A governadora de Pernambuco, Raquel Lyra, reuniu-se na quinta (5), no Rio, com a presidente da Petrobras, Magda Chambriard, para tratar da ampliação da Refinaria Abreu e Lima (RNEST), com o segundo trem, e de projetos de logística, como o Porto de Suape. Segundo Magda, a capacidade da refinaria passou de 230 mil para 260 mil barris por dia. Equipes do estado e da estatal voltarão a se reunir, sem prazo informado.", "fundo": [["p", "Raquel Lyra esteve na sede da Petrobras, no Rio de Janeiro, na quinta-feira (5), e se reuniu com a presidente da estatal, Magda Chambriard. Segundo o Blog do Elielson, da CBN Recife, a pauta foi a ampliação da Refinaria Abreu e Lima, com a construção do segundo trem, além de projetos de logística, responsabilidade social e territorial."], ["p", "Magda informou que a capacidade da RNEST foi ampliada de 230 mil para 260 mil barris por dia e afirmou que a refinaria “será importante para alcançarmos a autossuficiência do Brasil na produção de diesel”. A governadora disse que “Pernambuco está crescendo sem deixar ninguém para trás”."], ["p", "Ficou definido que equipes do governo estadual e da Petrobras voltarão a se reunir para encaminhar as demandas, incluindo oportunidades logísticas no Nordeste, como o Porto de Suape. Não há prazo para esses encontros. Acompanharam Raquel o secretário André Teixeira Filho (Mobilidade e Infraestrutura) e a secretária executiva de Imprensa, Daniella Brito."]], "fontes": [["Blog do Elielson (CBN Recife)", "https://www.cbnrecife.com/blogdoelielson/2026/11/05/raquel-lyra-e-presidente-da-petrobras-tratam-sobre-investimentos-para-pernambuco/"]]};
S.ba_lula = {"ed": "regioes", "reg": "ne", "k": "Nordeste · Bahia", "hora": "5/11", "t": "Lula recebe Jerônimo, Rui Costa e Jaques Wagner, primeiro encontro com a cúpula petista da Bahia após a eleição", "sub": "Nomes baianos são cotados para ministérios do quarto mandato; Jerônimo diz que a conversa tratou de projetos do estado.", "resumo": "Lula recebeu em Brasília o governador da Bahia, Jerônimo Rodrigues, e os senadores Jaques Wagner e Rui Costa, em meio à montagem da Esplanada do quarto mandato. É o primeiro encontro com a cúpula petista baiana desde a eleição, segundo o Farol da Bahia. Jerônimo evitou comentar ministérios e disse ter tratado de projetos do estado.", "fundo": [["p", "O presidente Lula recebeu na quinta-feira (5), em Brasília, o governador Jerônimo Rodrigues e os senadores Jaques Wagner e Rui Costa, todos do PT da Bahia, segundo o Farol da Bahia. Foi o primeiro encontro do presidente com a cúpula petista baiana desde a eleição, em meio à montagem da equipe do quarto mandato, e nomes do estado são cotados para ministérios a partir de 2027."], ["p", "Jerônimo evitou falar em cargos. “Tratamos de projetos, dialogamos com ele. A Bahia vai continuar unida”, disse. Wagner comemorou a aprovação da PEC da Segurança Pública no Senado, que abre caminho para a criação de um Ministério da Segurança Pública separado."]], "fontes": [["Farol da Bahia", "https://www.faroldabahia.com.br/noticia/lula-recebe-jeronimo-rui-costa-e-jaques-wagner-em-meio-a-montagem-de-ministerios"]]};
S.cedears = {"ed": "mundo", "k": "Mundo · Argentina", "hora": "4/11", "t": "Governo Milei retira da Câmara projeto com imposto de 15% sobre ganhos em CEDEARs, três dias depois de enviá-lo", "sub": "Texto de 240 artigos, assinado por Milei na madrugada de 31/10, foi chamado de “rascunho antigo” por um assessor de Caputo.", "resumo": "O governo de Javier Milei pediu a retirada da Câmara dos Deputados do projeto de Competitividade Financeira, enviado três dias antes. O texto, de 240 artigos, previa imposto de 15% sobre ganhos com compra e venda de CEDEARs, certificados que dão acesso a ações estrangeiras. Segundo o La Nación, a justificativa oficial foi que o dispositivo vinha de um “rascunho antigo”.", "fundo": [["p", "O governo argentino formalizou na terça-feira (3), às 22h50, o pedido de retirada do projeto de lei de Competitividade Financeira, que havia entrado na Câmara dos Deputados no sábado à noite, segundo o La Nación. A iniciativa, impulsionada por Federico Sturzenegger, foi assinada por Milei e pelos ministros Luis Caputo, Alejandra Monteoliva e Diego Santilli. Milei a avalizou digitalmente em 31 de outubro, à 1h42."], ["p", "O texto, de 240 artigos, incluía imposto de 15% sobre ganhos com compra e venda de CEDEARs adquiridos a partir de 31 de outubro. Um assessor de Caputo, Felipe Núñez, escreveu a um interlocutor que o dispositivo “quedó de un borrador viejo” e seria retirado. Conforme o jornal, a retirada alcançou o projeto inteiro, e não apenas o artigo, para evitar que a oposição avançasse com o imposto. O governo ainda não sabe se vai reapresentá-lo no curto prazo."]], "fontes": [["La Nación", "https://www.lanacion.com.ar/politica/el-insolito-recorrido-de-un-proyecto-de-ley-que-milei-firmo-de-madrugada-y-pidio-retirar-tres-dias-nid04112026/"]]};
S.bomba_europa = {"ed": "mundo", "k": "Mundo · Europa", "hora": "5/11", "t": "Falsas ameaças de bomba atingem voos na Europa pelo terceiro dia; nenhum explosivo foi encontrado", "sub": "Na terça (3) foram ao menos sete voos; na quinta (5), 27 voos foram afetados, segundo o resumo do ClicRDC. Autoria é desconhecida.", "resumo": "Uma série de falsas ameaças de bomba afeta voos na Europa desde segunda (2). Na terça (3), ao menos sete voos receberam alertas, segundo Reuters e The Guardian citados pelo DGABC; na quinta (5), o ClicRDC fala em 27 voos afetados, com pousos não programados e escoltas militares. Nenhum explosivo foi encontrado, e a autoria é desconhecida. Rússia e Irã negam participação, segundo o ClicRDC.", "fundo": [["p", "Ao menos sete voos na Europa receberam ameaças de bomba na terça-feira (3), após um alerta na segunda (2), segundo o DGABC, que cita Reuters, The Guardian e a agência búlgara BTA. Um voo da LOT vindo de Londres foi desviado para Modlin, na Polônia, cujo terminal fechou temporariamente. Em Sófia, duas aeronaves pousaram após ameaças. Dois voos da Ryanair, Lisboa-Roma e Dublin-Roma, tiveram alertas falsos, e o aeroporto de Múrcia foi isolado por um alerta sobre voo vindo de Manchester."], ["p", "Em resumo publicado na madrugada desta sexta, o ClicRDC afirma que ao menos 27 voos de passageiros foram afetados na quinta (5), com pousos não programados e escoltas militares, incluindo um voo da Aer Lingus entre Dublin e Roma desviado para uma base na França. Nenhum explosivo foi encontrado, a autoria é desconhecida, e Rússia e Irã negam participação. O número de 27 voos vem de um único resumo; as demais fontes lidas trazem apenas o balanço de terça."]], "fontes": [["DGABC", "https://www.dgabc.com.br/Noticia/4366575/ameacas-de-bomba-em-voos-fecham-aeroportos-na-europa-e-provocam-desvios"], ["ClicRDC", "https://clicrdc.com.br/fique-bem-informado/cafe-com-noticias-de-sexta-feira-06-de-novembro-de-2026/"]]};
S.mercado.t = "Ibovespa cai 0,82% e dólar fecha a R$ 5,49, o maior do ano, um dia depois de o Copom parar os cortes";
S.mercado.sub = "Wall Street em queda e petróleo em alta pesaram na quinta; Petrobras recuou mais de 2%. Na semana, o Ibovespa acumula perda de 1,03%.";
S.mercado.dado = {"n": "166,2 mil", "l": "Ibovespa no fechamento de quinta (5), queda de 0,82% · Portal Viu"};
S.mercado.resumo = "O Ibovespa fechou a quinta (5) em queda de 0,82%, aos 166.191 pontos, e devolveu parte do ganho de quarta. O dólar comercial subiu 0,67% e encerrou perto de R$ 5,49, a maior cotação do ano, segundo o Campo Grande News. A bolsa chegou perto de 169 mil pontos no início do pregão e perdeu força com as perdas em Nova York. Petrobras e Bradesco recuaram; Itaú e Vale subiram.";
S.mercado.upd = "O pregão virou de alta para queda: o Ibovespa fechou em -0,82% e o dólar, perto de R$ 5,49, após os ganhos da manhã.";
S.mercado.fundo.push(["h", "Atualização das 7h: o fechamento de quinta"]);
S.mercado.fundo.push(["p", "Ao fim do pregão de quinta (5), o Ibovespa caiu 0,82%, aos 166.191,45 pontos, com máxima de 168.994 e volume de R$ 31,16 bilhões, segundo o Portal Viu. O Campo Grande News registra o dólar comercial a R$ 5,4885 (alta de 0,67%) e o Portal Viu, a R$ 5,4876; ambos o descrevem como a maior cotação do ano. Na semana, o dólar acumula alta de 0,81% e o Ibovespa, queda de 1,03%."]);
S.mercado.fundo.push(["p", "Petrobras PN recuou 2,48% e o Bradesco, 2,06%, enquanto Itaú subiu 0,65% e Vale, 0,51%. A pressão veio de Wall Street, onde a Nasdaq caiu 5,52%, e do petróleo, que voltou a subir após ataques a petroleiros. O Copom manteve a Selic em 13,75% por unanimidade na quarta, e a produção industrial de setembro recuou 0,8% sobre agosto."]);
S.mercado.fontes.push(["Portal Viu", "https://www.portalviu.com.br/economia/dolar-sobe-para-r-549-e-bolsa-brasileira-fecha-em-queda-apos-perdas-em-wall-street"]);
S.mercado.fontes.push(["Campo Grande News", "https://www.campograndenews.com.br/economia/dolar-sobe-a-r-5-48-com-pressao-externa-e-manutencao-dos-juros"]);
S.fuga.upd = "Em entrevista ao New York Times, Flávio afirmou que a fuga foi “obra minha”, sem ajuda de governos, e que o desfecho será sua prisão.";
S.fuga.fundo.push(["h", "Atualização das 7h: Flávio fala ao New York Times"]);
S.fuga.fundo.push(["p", "Em entrevista ao The New York Times, relatada pelo A Tarde, Flávio Bolsonaro disse que “foi tudo obra minha” e que não houve “ajuda de absolutamente ninguém, de nenhum governo”, e que levará o segredo da fuga “para o túmulo”. O jornal americano descreve uma viagem de cerca de 8 mil km, com passagens por Equador e Argentina até Miami, e diz que o jato foi providenciado por um funcionário da Casa Branca; Flávio nega participação de autoridades estrangeiras."]);
S.fuga.fundo.push(["p", "Em outra entrevista, divulgada nas redes e gravada nos EUA, ele afirmou: “Eu já sei que o resultado final vai ser a minha prisão”, referindo-se a Alexandre de Moraes, a quem acusa de montar “um pacote” contra ele. Segundo o Jornal Razão, a defesa pediu ao STF que o caso saia das mãos de Moraes e vá a André Mendonça. Flávio não foi formalmente acusado, nega irregularidades, e seu mandato no Senado vai até 31 de janeiro de 2027."]);
S.fuga.fontes.push(["A Tarde", "https://atarde.com.br/politica/flavio-diz-que-levara-segredo-da-fuga-do-brasil-para-o-tumulo-1408469"]);
S.fuga.fontes.push(["Jornal Razão", "https://jornalrazao.com/politica/flavio-bolsonaro-resultado-final-prisao-por-que-deixou-brasil"]);
S.cpac.upd = "Flávio participou do jantar da CPAC em Mar-a-Lago na quinta, com Eduardo Bolsonaro e o ator Jim Caviezel entre os oradores.";
S.cpac.fundo.push(["h", "Atualização das 7h: o jantar em Mar-a-Lago"]);
S.cpac.fundo.push(["p", "Flávio Bolsonaro participou na noite de quinta (5) do jantar da CPAC em Mar-a-Lago, na Flórida, residência de Donald Trump, segundo a EFE citada pela Gazeta do Povo e o Estado de Minas. A cerimônia estava prevista para as 20h à meia-noite (Brasília), e a organização não divulgou o horário das falas. Eduardo Bolsonaro e o ator Jim Caviezel, que interpretou Jair Bolsonaro no filme “Dark Horse”, também constavam entre os participantes. O Radar não encontrou, até esta edição, relato do conteúdo do discurso."]);
S.cpac.fundo.push(["p", "O Estado de Minas lembra que a Polícia Federal investiga a produção de “Dark Horse” e que, segundo a PF, Flávio tratou diretamente com Daniel Vorcaro sobre pagamentos ligados ao filme; o senador confirmou ter buscado investidores e nega irregularidades. A Gazeta do Povo informa que a família entrou nos EUA com humanitarian parole, válido por um ano."]);
S.cpac.fontes.push(["Gazeta do Povo (EFE)", "https://www.gazetadopovo.com.br/mundo/flavio-sera-palestrante-evento-conservador-residencia-trump-florida/"]);
S.cpac.fontes.push(["Estado de Minas (Correio Braziliense)", "https://www.em.com.br/politica/2026/11/7533620-jantar-de-luxo-e-investigacao-flavio-bolsonaro-discursa-hoje-nos-eua.html"]);
S.paraguai.upd = "A posse de Alliana ainda dependia de procedimentos no Congresso; o Colorado decidiu por 48 a 30 poupar o vice, e Milei negou que Peña esteja na Argentina.";
S.paraguai.fundo.push(["h", "Atualização das 7h: posse pendente"]);
S.paraguai.fundo.push(["p", "Segundo o Hora Brasil, de sexta (6), a posse de Pedro Alliana ainda dependia dos procedimentos do Congresso. O artigo 234 da Constituição prevê que o vice assume em caso de vacância definitiva e fica até o fim do mandato, em agosto de 2028, sem nova eleição. A saída de Alliana da Vice-Presidência abrirá outra vacância, que o Congresso preenche por maioria absoluta. A Exame informa que a bancada B do Colorado, com nove deputados, apoiou o juízo político contra Peña mas rejeitou o do vice. As páginas lidas não informam data nem formato da posse."]);
S.paraguai.fundo.push(["p", "Na Argentina, o Ámbito registra que circularam versões de que Peña teria ido ao país após renunciar; fontes oficiais disseram ao La Nación que não há registro de sua entrada, e o porta-voz Guillermo Grance afirmou não saber onde ele está. O jornal compara o caso à saída de Flávio Bolsonaro por Puerto Iguazú."]);
S.paraguai.fontes.push(["Hora Brasil", "https://www.horabrasil.com.br/2026/11/06/quem-assume-presidencia-paraguai"]);
S.paraguai.fontes.push(["Exame", "https://exame.com/mundo/quem-e-pedro-alliana-vice-que-assume-apos-renuncia-de-pena-no-paraguai/"]);
S.paraguai.fontes.push(["Ámbito", "https://www.ambito.com/politica/javier-milei-nego-que-santiago-pena-haya-escapado-la-argentina-su-renuncia-n6342207"]);
S.maioridade.upd = "Alcolumbre retirou o tema da pauta do Senado e a Câmara articula votar a PEC na primeira semana de dezembro.";
S.maioridade.fundo.push(["h", "Atualização das 7h: cronograma muda"]);
S.maioridade.fundo.push(["p", "O presidente do Senado, Davi Alcolumbre, retirou da pauta de quarta (4) a proposta que reduz a maioridade penal de 18 para 16 anos, a pedido de Hugo Motta, e disse: “Vou aguardar a Câmara dos Deputados”, segundo o Portal Itapipoca. O tema também saiu da PEC 18/2025, a da Segurança Pública, aprovada na terça. O Portal Itapipoca fala em expectativa de votação em novembro."]);
S.maioridade.fundo.push(["p", "O Plantão Brasil, que reproduz o Brasil 247, informa que a Câmara prepara a votação para a primeira semana de dezembro, após articulação entre Alcolumbre e Motta, embora o relator, Mendonça Filho, queira levar o texto ao plenário antes do fim de novembro. Mendonça Filho prefere 16 anos como idade-base e sugeriu alas separadas em presídios. Rogério Marinho defende 14 anos em crimes hediondos, e Camilo Santana (PT-CE) propõe 16 anos só para crimes graves. Os dois prazos, novembro e dezembro, divergem entre as fontes."]);
S.maioridade.fontes.push(["Portal Itapipoca", "https://www.portalitapipoca.com.br/politica/2026/11/05/alcolumbre-retira-reducao-da-maioridade-penal-da-pauta-e-aguarda-decisao-da-camara.html"]);
S.maioridade.fontes.push(["Plantão Brasil", "https://www.plantaobrasil.net/noticias/162034-camara-articula-votacao-da-maioridade-penal-para-dezembro-apos-alinhamento-entre-cupulas"]);
S.segmin.upd = "Lula anunciou que criará o Ministério da Segurança Pública por medida provisória, com primeira reunião nesta sexta.";
S.segmin.fundo.push(["h", "Atualização das 7h: da PEC ao ministério"]);
S.segmin.fundo.push(["p", "Na live com André Janones, Lula disse que enviará medida provisória criando o Ministério da Segurança Pública, com primeira reunião nesta sexta (6), às 16h. A PEC aprovada pelo Senado na terça (3) tem 73 votos segundo o Jornal Razão e o Jornal de Brasília; O Tempo e o ND Mais falam em votação unânime. O texto aguarda promulgação pelo Congresso."]);
S.segmin.fontes.push(["Jornal de Brasília", "https://jornaldebrasilia.com.br/noticias/politica-e-poder/lula-anuncia-mp-para-criar-ministerio-da-seguranca-publica/"]);
S.seletivo.upd = "Durigan disse que os novos tributos de 2027 não elevam a carga em si; as regras da MP 1.399/2026 seguem ao Congresso.";
S.seletivo.fundo.push(["h", "Atualização das 7h: Durigan defende a carga"]);
S.seletivo.fundo.push(["p", "O ministro da Fazenda, Dario Durigan, afirmou na quinta (5) que os novos tributos de 2027 não aumentam, por si só, a carga tributária, segundo o Portal Viu. A CBS substitui PIS e Cofins, o IBS substitui gradualmente ICMS e ISS, e o Imposto Seletivo incide sobre cigarros, bebidas alcoólicas e açucaradas e certos veículos e embarcações. As regras constam da MP 1.399/2026, publicada na quarta (4) e enviada ao Congresso. O texto afirma que a carga global deve ser preservada, mas que preços por setor podem mudar."]);
S.seletivo.fontes.push(["Portal Viu", "https://www.portalviu.com.br/economia/governo-diz-que-novos-impostos-de-2027-nao-elevarao-carga-tributaria"]);
HOME_LEAD = 'ms_seg';
HOME_ROW = ['paraguai','mercado','ba_lula'];
var _mv2=function(arr,ids){return ids.concat(arr.filter(function(i){return ids.indexOf(i)<0;}));};
ORDER.politica = _mv2(ORDER.politica,['ms_seg','fuga','cpac','maioridade','segmin']);
ORDER.economia = _mv2(ORDER.economia,['mercado','wall_street','brent','seletivo']);
ORDER.mundo = _mv2(ORDER.mundo,['paraguai','cedears','bomba_europa']);
ORDER.regioes.splice(ORDER.regioes.indexOf('ne')+1,0,'ba_lula','rnest');
GIRO = GIRO.filter(function(g){return ["Live com Janones", "Minerais críticos", "Bolsa sobe após o Copom", "Esfriar a maioridade", "Mendonça e a Hapvida", "Votos de Name no TSE"].indexOf(g[0])<0;}).concat([]);
GIRO = [["MP do Ministério da Segurança", "Lula diz que cria a pasta por medida provisória e reúne ministros às 16h desta sexta, segundo o Jornal de Brasília.", "Jornal de Brasília", "https://jornaldebrasilia.com.br/noticias/politica-e-poder/lula-anuncia-mp-para-criar-ministerio-da-seguranca-publica/", "", "ms_seg"], ["“Obra minha”", "Flávio disse ao NYT que a fuga foi só dele e que “o desfecho final será a minha prisão”, segundo o A Tarde.", "A Tarde (NYT)", "https://atarde.com.br/politica/flavio-diz-que-levara-segredo-da-fuga-do-brasil-para-o-tumulo-1408469", "", "fuga"], ["Maioridade em dezembro", "A Câmara articula votar a PEC da maioridade penal na primeira semana de dezembro, segundo o Plantão Brasil.", "Plantão Brasil (Brasil 247)", "https://www.plantaobrasil.net/noticias/162034-camara-articula-votacao-da-maioridade-penal-para-dezembro-apos-alinhamento-entre-cupulas", "", "maioridade"], ["Bolsa cai e dólar a R$ 5,49", "O Ibovespa fechou em queda de 0,82% e o dólar, na maior cotação do ano, segundo o Portal Viu.", "Portal Viu", "https://www.portalviu.com.br/economia/dolar-sobe-para-r-549-e-bolsa-brasileira-fecha-em-queda-apos-perdas-em-wall-street", "", "mercado"], ["Brent a US$ 98", "O petróleo subiu 3,9% após novos ataques a petroleiros, segundo a Reuters.", "Investing.com (Reuters)", "https://br.investing.com/news/commodities-news/petroleobrent-dispara-e-fecha-com-alta-de-mais-de-us3-apos-ataques-a-petroleiros-2117999", "", "brent"], ["Lula e a bancada baiana", "Lula recebeu Jerônimo, Rui Costa e Jaques Wagner, em meio à montagem da Esplanada, segundo o Farol da Bahia.", "Farol da Bahia", "https://www.faroldabahia.com.br/noticia/lula-recebe-jeronimo-rui-costa-e-jaques-wagner-em-meio-a-montagem-de-ministerios", "", "ba_lula"], ["Petrobras e Pernambuco", "Raquel Lyra e Magda Chambriard trataram do segundo trem da RNEST e de Suape, segundo o Blog do Elielson.", "CBN Recife (Blog do Elielson)", "https://www.cbnrecife.com/blogdoelielson/2026/11/05/raquel-lyra-e-presidente-da-petrobras-tratam-sobre-investimentos-para-pernambuco/", "", "rnest"], ["CEDEARs e Milei", "Buenos Aires retirou o projeto com imposto de 15% sobre CEDEARs três dias depois de enviá-lo, segundo o La Nación.", "La Nación", "https://www.lanacion.com.ar/politica/el-insolito-recorrido-de-un-proyecto-de-ley-que-milei-firmo-de-madrugada-y-pidio-retirar-tres-dias-nid04112026/", "", "cedears"], ["Peña na Argentina?", "Fontes oficiais dizem não ter registro de entrada de Peña no país, segundo o Ámbito.", "Ámbito", "https://www.ambito.com/politica/javier-milei-nego-que-santiago-pena-haya-escapado-la-argentina-su-renuncia-n6342207", "", "paraguai"]].concat(GIRO);
AMANHA.unshift(["Sex, 06/11 · 16h", "agenda", "Lula reúne ministros para discutir a MP do Ministério da Segurança Pública", "Casa Civil, Justiça, Fazenda e Planejamento discutem a medida provisória que cria a pasta, condicionada à PEC aprovada pelo Senado. Em jogo: desenho, custo e comando do novo ministério.", "https://jornaldebrasilia.com.br/noticias/politica-e-poder/lula-anuncia-mp-para-criar-ministerio-da-seguranca-publica/", "ms_seg"]);
/* ===== Edição das 11h ===== */
EDICAO.hora = '11h';
EDICAO.data = 'Sexta, 06 de novembro de 2026';
S.dino_6x1 = {"ed": "politica", "k": "Política · STF", "hora": "6/11", "t": "Dino convoca audiência no STF para tratar das ações contra o fim da escala 6x1, mas diz que a redução da jornada não está em negociação", "sub": "A audiência está marcada para 10 de novembro. Câmara, Senado, AGU e PGR têm cinco dias para responder às ações da CNC e da CNI, que pedem mais prazo.", "dado": {"n": "5 dias", "l": "Prazo para Câmara, Senado, AGU e PGR responderem às ações · O Hoje"}, "resumo": "O ministro Flávio Dino, do STF, convocou uma audiência de conciliação para 10 de novembro, às 14h, segundo O Hoje e a Folha Expressa, com entidades de empregadores e de trabalhadores. Ele deu cinco dias para AGU, PGR, Câmara e Senado se manifestarem sobre as ações da CNC e da CNI contra o prazo da nova jornada. Dino escreveu que “a redução da jornada e a ampliação do repouso semanal não estão em negociação”.", "fundo": [["p", "O ministro Flávio Dino, relator das ações no Supremo Tribunal Federal, marcou uma audiência de conciliação sobre o fim da escala 6x1. Segundo O Hoje e a Folha Expressa, o encontro será em 10 de novembro, às 14h, na Primeira Turma, e reunirá representantes de entidades de empregadores e de trabalhadores. O Globo, reproduzido pela Fetransul, diz apenas que a audiência será “na próxima semana”. A decisão foi tomada na quinta-feira (5)."], ["p", "As ações foram apresentadas pela Confederação Nacional do Comércio (CNC), que pede que a redução comece só em outubro de 2027, e pela Confederação Nacional da Indústria (CNI), que pede mais um ano de prazo. O processo da CNC chegou ao STF na quarta (4), e a CNI protocolou o seu horas depois, segundo O Globo. Câmara, Senado, AGU e PGR têm cinco dias para responder."], ["h", "O que Dino disse"], ["p", "Na decisão, citada pelo O Globo, Dino afirmou que a audiência não vai “conciliar” a redução da jornada, porque a mudança é “plenamente constitucional em sua finalidade” e o mérito “não está sujeito a transação”. Em análise preliminar, ele disse que o prazo de dois meses para a redução de duas horas não seria “inviável” e que a capacidade de resposta do setor pode indicar que é “suficiente”, mas considerou “plausíveis” as ponderações das empresas sobre o regime de transição, que precisam ser examinadas. Também escreveu que não cabe ao STF “substituir as escolhas” do Congresso, apenas verificar a compatibilidade da emenda com os limites constitucionais."], ["h", "A regra em jogo"], ["p", "Pelo texto aprovado, a escala 6x1 dá lugar a cinco dias de trabalho e dois de descanso remunerado por semana, sem redução salarial. A jornada máxima cai de 44 para 40 horas, com transição de 14 meses. Segundo O Hoje e a Folha Expressa, a nova jornada entra em vigor em 15 de dezembro. A Folha Expressa registra que a mudança foi aprovada com votos da base governista e da oposição, e O Hoje cita pesquisa Nexus de fevereiro, na qual 73% dos brasileiros eram favoráveis ao fim da escala."], ["p", "O ministro do Trabalho, Luiz Marinho, disse que o governo pretende publicar na segunda-feira (9) um decreto que regulamenta as escalas, com orientações por setor e ao menos oito folgas mensais, segundo as duas publicações. A audiência no STF ocorre um dia depois."]], "fontes": [["O Hoje", "https://ohoje.com/2026/11/06/dino-convoca-audiencia-no-stf-para-discutir-acoes-contra-o-fim-da-escala-6x1/"], ["Folha Expressa", "https://folhaexpressa.com/politica/dino-convoca-audiencia-no-stf-para-discutir-mudancas-no-fim-da-escala-6x1/"], ["Fetransul (O Globo)", "https://www.fetransul.com.br/2026/11/06/stf-marca-audiencia-de-conciliacao-para-debater-o-fim-da-escala-6-x-1/"]]};
S.tse_novo = {"ed": "politica", "k": "Política · Justiça Eleitoral", "hora": "6/11", "t": "TSE admite ação do Novo contra a chapa Lula-Alckmin e dá cinco dias para a defesa", "sub": "O corregedor Villas Bôas Cueva aceitou a ação que questiona 35 atos do governo em ano eleitoral. O partido pede cassação e inelegibilidade por oito anos.", "dado": {"n": "35", "l": "Atos normativos questionados pelo Novo · R$ 73 bi de custo estimado · CartaCapital"}, "resumo": "O corregedor-geral da Justiça Eleitoral, ministro Ricardo Villas Bôas Cueva, admitiu na quinta (5) a ação do Partido Novo que acusa a chapa Lula-Alckmin de abuso de poder político e econômico, segundo InfoMoney e CartaCapital. Lula e Alckmin têm cinco dias para se manifestar. O Novo questiona 35 atos normativos que criaram ou ampliaram benefícios, com custo estimado em R$ 73 bilhões, e pede cassação e inelegibilidade.", "fundo": [["p", "O ministro Ricardo Villas Bôas Cueva, corregedor-geral da Justiça Eleitoral, admitiu na quinta-feira (5) a ação do Partido Novo que tenta cassar a chapa de Lula e Geraldo Alckmin, segundo a CartaCapital e o InfoMoney, que cita confirmação da Folha de S.Paulo. O ministro considerou que a petição cumpre os requisitos, como a descrição dos fatos, a identificação dos atos e os documentos, e deu cinco dias para Lula e Alckmin se manifestarem."], ["p", "A ação questiona 35 atos normativos editados entre 1º de janeiro e 16 de outubro de 2026, que criaram ou ampliaram benefícios em ano eleitoral. O Novo estima o custo fiscal em R$ 73 bilhões e cita, entre os exemplos, o reajuste do Bolsa Família, que alcança cerca de 19,29 milhões de famílias, e o subsídio aos combustíveis, com custo projetado de R$ 40 bilhões neste ano. A ação aponta ainda 13 créditos extraordinários que somam R$ 99,7 bilhões em 2026. Segundo a CartaCapital, o partido compara o total de atos com os de anos anteriores: 17 em 2023, 4 em 2024 e 14 em 2025."], ["p", "O partido atribui responsabilidade a Alckmin por integrar a chapa e por ter participado de eventos de anúncio de parte das medidas. Pede a cassação dos registros ou diplomas dos dois e a inelegibilidade de ambos por oito anos. A CartaCapital diz que procurou a defesa da campanha petista e aguardava retorno."], ["h", "O conjunto de ações no TSE"], ["p", "A Revista Fórum, que chama o conjunto de “terceiro turno”, conta 14 ações contra a chapa, entre elas as do Novo e as apresentadas pela campanha de Flávio Bolsonaro, que trazem alvos como o canal de WhatsApp “Exército de Lula”, o desfile da Acadêmicos de Niterói e os gastos de comunicação do governo. Depois da defesa, Cueva decide se arquiva o caso ou segue com a investigação, que pode incluir testemunhas e provas. Novas ações podem ser apresentadas até a diplomação, prevista para até 18 de dezembro."], ["p", "O InfoMoney, com base em consulta ao banco de dados do tribunal, conta 28 ações de investigação judicial eleitoral ainda em julgamento: 15 procedimentos têm a campanha de Lula como alvo (13 apresentados pela campanha de Flávio e 2 pelo Novo) e 14 têm Flávio como alvo, 9 deles apresentados pela campanha de Lula. Os dois veículos não explicam a diferença entre as contagens. A Fórum avalia que as chances de cassação são “praticamente nulas”, avaliação do veículo e não fato apurado."]], "fontes": [["InfoMoney", "https://www.infomoney.com.br/politica/tse-aceita-acao-contra-chapa-lula-alckmin-por-abuso-de-poder-economico/"], ["CartaCapital", "https://www.cartacapital.com.br/politica/tse-admite-acao-do-novo-contra-lula-e-alckmin-por-suposto-abuso-de-poder-politico/"], ["Revista Fórum", "https://revistaforum.com.br/politica/tse-flavio-bolsonaro-cassar-lula"]]};
S.nikolas = {"ed": "politica", "k": "Política · Congresso", "hora": "6/11", "t": "Nikolas rebate Alcolumbre: “jamais vou pedir licença a nenhum senador”", "sub": "O deputado reagiu a críticas do presidente do Senado ao ato que organizou em Macapá para cobrar a análise de pedidos de impeachment de ministros do STF.", "resumo": "O deputado Nikolas Ferreira (PL-MG) respondeu na quinta (5) às críticas do presidente do Senado, Davi Alcolumbre, ao ato que organizou em Macapá para cobrar a análise de pedidos de impeachment de ministros do STF. Segundo o Terra Brasil Notícias, que cita a Revista Oeste, Alcolumbre não o nomeou, mas aludiu à manifestação de 13 de setembro. Nikolas disse que o ato foi pacífico e defendeu a renovação da presidência da Casa.", "fundo": [["p", "O deputado Nikolas Ferreira (PL-MG) rebateu na quinta-feira (5) as críticas do presidente do Senado, Davi Alcolumbre, ao ato que organizou em Macapá (AP) para cobrar a análise de pedidos de impeachment de ministros do Supremo Tribunal Federal. Segundo o Terra Brasil Notícias, que cita a Revista Oeste, Alcolumbre não citou o parlamentar pelo nome, mas fez referência à manifestação de 13 de setembro. A frase de Nikolas, que dá título à notícia, é: “jamais vou pedir licença a nenhum senador”."], ["p", "O deputado defendeu o caráter pacífico do ato e afirmou que a cobrança foi legítima. Também criticou o Senado, defendeu a renovação da presidência da Casa na eleição prevista para fevereiro de 2027 e reclamou da retirada da redução da maioridade penal da PEC da Segurança Pública."], ["p", "O embate ocorre em meio à disputa pela presidência do Senado, na qual Alcolumbre busca a recondução e o PL discute candidato próprio. A informação desta matéria vem de uma única publicação, que por sua vez cita outro veículo."]], "fontes": [["Terra Brasil Notícias (Revista Oeste)", "https://terrabrasilnoticias.com/2026/11/nikolas-bate-de-frente-com-alcolumbre-e-dispara-jamais-vou-pedir-licenca-a-nenhum-senador/"]]};
S.ucrania_acordo = {"ed": "mundo", "k": "Mundo · Rússia e Ucrânia", "hora": "6/11", "t": "Trump diz ter “um grande acordo” para encerrar a guerra na Ucrânia, sem dar detalhes; negociação formal é esperada em Abu Dhabi", "sub": "O anúncio veio após reunião na Casa Branca com o enviado de Putin, Kirill Dmitriev. Não há texto, signatários nem prazos divulgados.", "resumo": "Donald Trump anunciou na quinta (5) que há um acordo para encerrar a guerra entre Rússia e Ucrânia, depois de reunião na Casa Branca com Kirill Dmitriev, enviado especial de Vladimir Putin, segundo o Diario Crónica. Ele não deu detalhes técnicos nem disse que países estariam envolvidos. Negociações formais, mediadas pelos EUA, são esperadas em Abu Dhabi em 10 e 11 de novembro.", "fundo": [["p", "O presidente dos EUA, Donald Trump, afirmou na quinta-feira (5), em Washington, que existe um acordo para pôr fim ao conflito entre Rússia e Ucrânia, segundo o jornal argentino Diario Crónica. Ele falou depois de uma reunião privada na Casa Branca com Kirill Dmitriev, enviado especial de Vladimir Putin. Trump disse que “será um grande acordo e abrangerá mais do que apenas a Ucrânia”, na tradução do Radar, mas não apresentou detalhes técnicos, não citou países e afirmou não ter tido encontro formal com a delegação ucraniana que estava em Washington."], ["p", "Segundo a mesma publicação, Dmitriev e autoridades ucranianas participaram de um evento da primeira-dama Melania Trump em torno de um cessar-fogo de seis dias em Oleshky, cidade sob controle russo. O genro de Trump, Jared Kushner, reuniu-se em Bruxelas com representantes da Otan, da Ucrânia e da Europa. As negociações formais estão previstas para 10 e 11 de novembro em Abu Dhabi."], ["p", "Até a publicação desta edição, o anúncio de Trump era a única fonte do acordo: não havia texto, signatários, prazos nem confirmação independente da Rússia ou da Ucrânia nas páginas consultadas. Por isso o Radar trata a informação como declaração do presidente americano, e não como acordo fechado."]], "fontes": [["Diario Crónica", "https://diariocronica.com.ar/noticias/2026/11/06/176391-donald-trump-anuncio-un-acuerdo-para-poner-fin-al-conflicto-entre-rusia-y-ucrania"]]};
S.zaporizhzhia = {"ed": "mundo", "k": "Mundo · Ucrânia", "hora": "6/11", "t": "Sobe para 50 o número de mortos em ataque russo a ponto de ajuda humanitária em Zaporizhzhia", "sub": "A ONU acusa o Exército russo de saber da operação humanitária ou de não tomar precauções básicas. Moscou não comentou.", "dado": {"n": "50", "l": "Mortos no ataque de 2/11 em Komychuvakha (antes, 40) · AFP"}, "resumo": "O balanço do ataque russo de segunda-feira (2) a um ponto de distribuição de ajuda humanitária em Komychuvakha, na região de Zaporizhzhia, subiu de 40 para 50 mortos, segundo a AFP. Kiev diz que foram usadas bombas guiadas a 15 km da linha de frente. Uma missão de observação da ONU acusou o Exército russo de saber da operação ou de não ter tomado cuidados básicos. As autoridades russas não comentaram.", "fundo": [["p", "Subiu de 40 para 50 o número de mortos no ataque russo de 2 de novembro (segunda-feira) a um ponto de distribuição de ajuda humanitária em Komychuvakha, na região de Zaporizhzhia, no sul da Ucrânia, segundo a AFP, publicada pelo jornal O Povo nesta sexta (6). Segundo Kiev, foram usadas bombas guiadas, e o local fica a cerca de 15 quilômetros da linha de frente."], ["p", "Uma missão de observação da ONU acusou o Exército russo de saber da operação humanitária ou de não ter tomado medidas básicas de precaução. As autoridades russas não comentaram, e blogueiros militares afirmaram que o prédio abrigava operadores de drones ucranianos, segundo a agência. O Serviço de Situações de Emergência ucraniano disse que as buscas e o resgate continuam “apesar das difíceis condições e da ameaça constante de novos ataques russos”."], ["p", "O presidente Volodymyr Zelensky chamou o ataque de “horrível” justamente quando as negociações mediadas pelos EUA deveriam ser retomadas, previstas em Abu Dhabi na semana que vem, segundo a AFP."]], "fontes": [["O Povo (AFP)", "https://www.opovo.com.br/noticias/mundo/2026/11/06/numero-de-mortos-em-ataque-russo-de-segunda-feira-no-sul-da-ucrania-sobe-para-50.html"]]};
S.paraguai.t = "Renúncia de Peña não é aceita por falta de quórum, e o Senado do Paraguai retoma nesta sexta o julgamento político";
S.paraguai.sub = "Peña segue formalmente na Presidência e diz que vai se defender. Para destituí-lo, o Senado precisa de 30 dos 45 votos. O vice, Alliana, foi poupado pela Câmara.";
S.paraguai.resumo = "A renúncia anunciada por Santiago Peña na quinta (5) não foi aceita: segundo o Diário do Centro do Mundo, que cita o Última Hora, a sessão conjunta do Congresso que deveria votá-la caiu por falta de quórum, depois que governistas deixaram o plenário. Peña permanece formalmente na Presidência. O Senado retoma o julgamento político nesta sexta (6), às 10h, e para destituí-lo são necessários 30 dos 45 votos. Peña diz que vai se defender. O vice, Pedro Alliana, foi poupado pela Câmara por 48 votos a 30.";
S.paraguai.upd = "A renúncia de Peña não foi aceita: a sessão do Congresso caiu por falta de quórum, ele segue formalmente na Presidência e o Senado retoma o julgamento nesta sexta, às 10h.";
S.paraguai.fundo.push(["h", "Atualização das 11h: renúncia sem decisão"]);
S.paraguai.fundo.push(["p", "Segundo o Diário do Centro do Mundo, que cita o jornal paraguaio Última Hora, a sessão conjunta das duas Casas que deveria votar a renúncia de Peña caiu por falta de quórum na quinta, depois que parlamentares governistas deixaram o plenário. A Terra, com RFI e AFP, também diz que a sessão foi cancelada por falta de quórum, e a CartaCapital escreve que a saída “ainda não foi aceita pelo Congresso”. Peña, portanto, permanece formalmente na Presidência. As edições anteriores do Radar trataram a renúncia como consumada; a informação mais recente é a de que ela segue sem decisão."]);
S.paraguai.fundo.push(["p", "O Senado, que recebeu da Câmara a acusação de mau desempenho, marcou a sessão do julgamento para as 10h desta sexta (6). Segundo o Portal Terra da Luz, são necessários pelo menos 30 votos dos 45 senadores para afastá-lo, e o presidente do Congresso, Basilio Núñez, disse que o procedimento tem cinco fases e não será concluído em um dia. A CartaCapital fala em votação esperada para a noite, e a RFI diz que o senador Derlis Maidana quer concluir “ainda hoje”. A CartaCapital descreve a acusação como um documento de 15 páginas com cerca de 300 anexos."]);
S.paraguai.fundo.push(["p", "Peña disse em vídeo, segundo a Terra (RFI): “Ante la continuidad del juicio político, me presentaré y ejerceré mi derecho a la defensa”. Segundo a Monumental, que reproduz a Infobae, ele pediu 72 horas de prazo, ponto ainda sem decisão do Senado. O senador oposicionista Amarilla argumentou, segundo o Portal Terra da Luz, que aceitar a renúncia permitiria a Peña obter foro parlamentar. Se a renúncia for aceita ou ele for condenado, o vice Pedro Alliana assume até o fim do mandato, em agosto de 2028."]);
S.paraguai.fundo.push(["p", "Sobre o paradeiro de Peña, a CartaCapital diz que não há confirmação independente de que ele deixou o país, e o governo argentino negou que ele tenha entrado ou pedido asilo. Os relatos divergem na contagem da votação da Câmara e no valor dos depósitos do Ueno Bank: o Diário do Centro do Mundo e o Portal Terra da Luz falam em cerca de US$ 850 milhões, a CartaCapital em US$ 862 milhões."]);
S.paraguai.fontes.push(["Diário do Centro do Mundo", "https://www.diariodocentrodomundo.com.br/renuncia-de-pena-fica-sem-decisao-e-senado-paraguaio-inicia-impeachment/"]);
S.paraguai.fontes.push(["Portal Terra da Luz", "https://portalterradaluz.com.br/principal/politica-internacional-paraguai-retoma-julgamento-de-impeachment-de-pena-nesta-sexta/"]);
S.paraguai.fontes.push(["Terra (RFI e AFP)", "https://www.terra.com.br/noticias/mundo/america-latina/senado-do-paraguai-retoma-sessao-de-impeachment-de-santiago-pena-que-promete-se-defender-com-argumentos-e-provas,2d44d9710abbbba5d2c010956ea9c8a1s0icp5nt.html"]);
S.paraguai.fontes.push(["CartaCapital", "https://cartacapital.com.br/politica/os-proximos-passos-na-crise-no-paraguai-senado-decide-impeachment-de-santiago-pena-apos-renuncia"]);
S.paraguai.fontes.push(["Monumental (Infobae)", "https://www.monumental.co.cr/2026/11/06/quien-gobierna-paraguay-tras-la-fallida-renuncia-de-santiago-pena-y-mientras-es-sometido-a-juicio-politico/"]);
S.mercado.t = "Ibovespa abre perto da estabilidade e dólar sobe a R$ 5,50 à espera do payroll e do ajuste fiscal";
S.mercado.sub = "Depois da queda de 5,52% da Nasdaq na quinta, a bolsa brasileira oscilou na abertura. Brent a US$ 98,63.";
S.mercado.upd = "Na abertura de sexta, o Ibovespa oscilava perto da estabilidade e o dólar subia a R$ 5,50, com o mercado à espera do payroll e do anúncio de corte de gastos.";
S.mercado.fundo.push(["h", "Atualização das 11h: a abertura de sexta"]);
S.mercado.fundo.push(["p", "Segundo o Metrópoles, o Ibovespa marcava 165.937 pontos (-0,15%) às 10h08, e o dólar comercial estava em R$ 5,50 (+0,15%) às 9h16. O Money Times registra que o índice abriu em queda de 0,12% e, às 10h15, estava em 166.243 pontos (+0,03%), com o dólar a R$ 5,5011 (+0,23%). O petróleo Brent era negociado a US$ 98,63 (+0,35% em 24 horas)."]);
S.mercado.fundo.push(["p", "O mercado aguarda o relatório de emprego dos EUA (payroll), às 10h30, com expectativa entre 60 mil e 65 mil vagas, segundo Money Times e BPMoney, e a balança comercial brasileira, às 15h, com superávit previsto de US$ 9,4 bilhões, segundo o BPMoney. A queda de 5,52% da Nasdaq na quinta, a maior desde abril de 2025, segue pressionando as ações de tecnologia, em meio ao temor de maior regulação da inteligência artificial após a vitória democrata nas eleições americanas, segundo o Metrópoles."]);
S.mercado.fontes.push(["Metrópoles (abertura da bolsa)", "https://www.metropoles.com/brasil/bolsa-nesta-sexta-4"]);
S.mercado.fontes.push(["Money Times", "https://www.moneytimes.com.br/ibovespa-opera-proximo-da-estabilidade-com-pressao-do-cenario-fiscal-5-coisas-para-saber-antes-de-investir-hoje-6-davs-rens/"]);
S.mercado.fontes.push(["BPMoney", "https://bpmoney.com.br/mercado/payroll-eua-balanca-comercial-brasil-agenda-6-novembro/"]);
S.fiscal.upd = "Durigan reconheceu que a meta fiscal de 2026 não será cumprida, e os detalhes do corte de privilégios só devem sair depois da viagem de Lula à COP31, de 9 a 20 de novembro.";
S.fiscal.fundo.push(["h", "Atualização das 11h: o ajuste em construção"]);
S.fiscal.fundo.push(["p", "Segundo o Metrópoles, o governo intensifica a revisão de gastos e o “corte de privilégios” para levar propostas a Lula. As conversas começaram em 26 de outubro, entre o ministro da Fazenda, Dario Durigan, e o do Planejamento, Bruno Moretti, e os detalhes devem sair só depois da viagem de Lula à COP31, em Antália (Turquia), de 9 a 20 de novembro. Durigan afirmou: “Nós precisamos adotar as medidas necessárias”."]);
S.fiscal.fundo.push(["p", "Os números citados pelo Metrópoles: a meta de 2026 é de superávit primário de 0,25% do PIB, cerca de R$ 35 bilhões, e a de 2027, de 0,5% do PIB, ou R$ 73,2 bilhões, com piso de R$ 36,6 bilhões pela tolerância. Cada ponto percentual de corte na Selic, mantida em 13,75% pelo Copom na quarta (4), reduziria em cerca de R$ 20 bilhões por ano os juros da dívida. Desde o segundo turno, a Bolsa perdeu mais de 30 mil pontos, e o dólar passou de menos de R$ 5,00 para R$ 5,49."]);
S.fiscal.fundo.push(["p", "O Diário do Centro do Mundo acrescenta que Durigan prometeu cortar privilégios sem atingir os mais pobres, que a dívida pública equivale a 82,9% do PIB e que a Instituição Fiscal Independente, do Senado, projeta déficit primário de 0,5% do PIB em 2026. Segundo o site, Durigan reconheceu que a meta de superávit não será cumprida."]);
S.fiscal.fontes.push(["Metrópoles (ajuste fiscal)", "https://www.metropoles.com/brasil/pressionado-por-juros-e-mercado-governo-tenta-construir-ajuste-fiscal"]);
S.fiscal.fontes.push(["Diário do Centro do Mundo (Durigan)", "https://www.diariodocentrodomundo.com.br/ministro-da-fazenda-promete-cortar-privilegios-sem-prejudicar-os-mais-pobres/"]);
S.senado.upd = "A disputa de fevereiro ganhou números: Rogério Marinho precisa de 41 votos, aliados de Alcolumbre falam em 48, e a líder do governo, Teresa Leitão, vê o PT apoiando Alcolumbre sem posição fechada.";
S.senado.fundo.push(["h", "Atualização das 11h: a conta dos votos no Senado"]);
S.senado.fundo.push(["p", "Segundo o Diário do Centro do Mundo, Davi Alcolumbre (União-AP) busca a recondução e negocia relatorias e comissões, enquanto Rogério Marinho (PL-RN) e Tereza Cristina (PP-MS) disputam a candidatura de oposição. A federação União-PP, o MDB, o PSD e o PSB terão 26 senadores em fevereiro; somados aos 11 do PT, chegam a 37. Aliados de Alcolumbre falam em 48 votos, conta que adversários consideram otimista, já que a eleição é secreta."]);
S.senado.fundo.push(["p", "O PL terá 29 senadores e o Novo, 3, num total de 32; Marinho precisa de 41 votos. Aliados de Tereza Cristina dizem que ela poderia chegar a 42 se Marinho desistisse, mas ela enfrenta resistência na ala bolsonarista por sua proximidade com Michelle Bolsonaro. A líder do governo, Teresa Leitão (PT-PE), disse: “Pelo cenário que se apresenta, creio que o PT vai apoiar Alcolumbre, mas ainda não fechamos oficialmente a posição”. A CCJ é disputada por Arthur Lira (PP-AL). As contas partem de uma única publicação e são projeções de bastidor."]);
S.senado.fontes.push(["Diário do Centro do Mundo (disputa no Senado)", "https://www.diariodocentrodomundo.com.br/alcolumbre-negocia-apoio-presidencia-senado-marinho-tereza"]);
S.israel.upd = "A Lista Conjunta Árabe, por meio de Ahmad Tibi, sinalizou apoio externo a um governo contrário a Netanyahu, sem entrar na coalizão.";
S.israel.fundo.push(["h", "Atualização das 11h: os partidos árabes"]);
S.israel.fundo.push(["p", "Segundo o Estadão Conteúdo, publicado pelo InfoMoney, o líder da Lista Conjunta Árabe, Ahmad Tibi, disse à Associated Press que o bloco está disposto a apoiar um governo anti-Netanyahu sem integrar formalmente a coalizão, votando a favor ou se abstendo, o que reduziria a maioria necessária. “Queremos fazer coisas que não fizemos no passado para remover este governo criminoso”, afirmou. Apenas um partido árabe já participou de um governo em Israel, em 2021."]);
S.israel.fundo.push(["p", "A oposição liderada por Gadi Eisenkot tem 48 das 120 cadeiras do Knesset, e a coalizão de Netanyahu, 53. A Lista Conjunta elegeu 11 deputados e o Raam, 8, o que os torna decisivos para uma maioria. Árabes israelenses são cerca de 20% da população. A matéria não trata de moção de censura nem de data de nova eleição."]);
S.israel.fontes.push(["InfoMoney (Estadão Conteúdo)", "https://www.infomoney.com.br/mundo/partidos-arabes-sinalizam-apoio-para-derrubar-netanyahu/"]);
HOME_LEAD = 'dino_6x1';
HOME_ROW = ['paraguai','fiscal','ba_lula'];
var _mv3=function(arr,ids){return ids.concat(arr.filter(function(i){return ids.indexOf(i)<0;}));};
ORDER.politica = _mv3(ORDER.politica,['dino_6x1','tse_novo','ms_seg','fuga','senado','nikolas']);
ORDER.economia = _mv3(ORDER.economia,['mercado','fiscal']);
ORDER.mundo = _mv3(ORDER.mundo,['paraguai','israel','ucrania_acordo','zaporizhzhia']);
GIRO = GIRO.filter(function(g){return ["Bolsa cai e dólar a R$ 5,49","Peña na Argentina?","MP do Ministério da Segurança"].indexOf(g[0])<0;});
GIRO = [["6x1 no STF", "Dino marcou audiência para 10 de novembro, às 14h, e deu cinco dias para Câmara, Senado, AGU e PGR responderem às ações da CNC e da CNI, segundo O Hoje.", "O Hoje", "https://ohoje.com/2026/11/06/dino-convoca-audiencia-no-stf-para-discutir-acoes-contra-o-fim-da-escala-6x1/", "", "dino_6x1"], ["Novo no TSE", "O corregedor Villas Bôas Cueva admitiu a ação contra a chapa Lula-Alckmin e deu cinco dias para a defesa, segundo o InfoMoney.", "InfoMoney", "https://www.infomoney.com.br/politica/tse-aceita-acao-contra-chapa-lula-alckmin-por-abuso-de-poder-economico/", "", "tse_novo"], ["Peña segue no cargo", "A renúncia ficou sem decisão por falta de quórum, e o Senado paraguaio retoma o julgamento às 10h desta sexta, segundo o Portal Terra da Luz.", "Portal Terra da Luz", "https://portalterradaluz.com.br/principal/politica-internacional-paraguai-retoma-julgamento-de-impeachment-de-pena-nesta-sexta/", "", "paraguai"], ["Ajuste depois da COP31", "Os detalhes do corte de privilégios só saem depois da viagem de Lula à Turquia, de 9 a 20 de novembro, segundo o Metrópoles.", "Metrópoles", "https://www.metropoles.com/brasil/pressionado-por-juros-e-mercado-governo-tenta-construir-ajuste-fiscal", "", "fiscal"], ["Bolsa abre estável", "O Ibovespa oscilava perto da estabilidade e o dólar subia a R$ 5,50 antes do payroll, segundo o Money Times.", "Money Times", "https://www.moneytimes.com.br/ibovespa-opera-proximo-da-estabilidade-com-pressao-do-cenario-fiscal-5-coisas-para-saber-antes-de-investir-hoje-6-davs-rens/", "", "mercado"], ["PT e Alcolumbre", "A líder do governo no Senado vê o PT apoiando Alcolumbre, mas sem posição oficial, segundo o Diário do Centro do Mundo.", "Diário do Centro do Mundo", "https://www.diariodocentrodomundo.com.br/alcolumbre-negocia-apoio-presidencia-senado-marinho-tereza", "", "senado"], ["Nikolas e Alcolumbre", "O deputado disse que “jamais” pedirá licença a um senador, ao rebater críticas ao ato de Macapá, segundo o Terra Brasil Notícias.", "Terra Brasil Notícias", "https://terrabrasilnoticias.com/2026/11/nikolas-bate-de-frente-com-alcolumbre-e-dispara-jamais-vou-pedir-licenca-a-nenhum-senador/", "", "nikolas"], ["Trump e a Ucrânia", "Trump diz haver um acordo para encerrar a guerra, sem detalhes; as conversas formais devem ocorrer em Abu Dhabi, segundo o Diario Crónica.", "Diario Crónica", "https://diariocronica.com.ar/noticias/2026/11/06/176391-donald-trump-anuncio-un-acuerdo-para-poner-fin-al-conflicto-entre-rusia-y-ucrania", "", "ucrania_acordo"], ["Ataque em Zaporizhzhia", "Subiu para 50 o total de mortos em ataque a ponto de ajuda humanitária, segundo a AFP publicada pelo O Povo.", "O Povo (AFP)", "https://www.opovo.com.br/noticias/mundo/2026/11/06/numero-de-mortos-em-ataque-russo-de-segunda-feira-no-sul-da-ucrania-sobe-para-50.html", "", "zaporizhzhia"], ["Árabes e Netanyahu", "A Lista Conjunta Árabe sinaliza apoio externo a um governo sem Netanyahu, segundo o InfoMoney.", "InfoMoney (Estadão Conteúdo)", "https://www.infomoney.com.br/mundo/partidos-arabes-sinalizam-apoio-para-derrubar-netanyahu/", "", "israel"]].concat(GIRO);
AMANHA.unshift.apply(AMANHA,[["Seg, 09/11", "agenda", "Governo deve publicar decreto sobre as escalas de trabalho", "O ministro do Trabalho, Luiz Marinho, disse que pretende publicar o decreto com orientações por setor e ao menos oito folgas mensais, um dia antes da audiência no STF.", "https://ohoje.com/2026/11/06/dino-convoca-audiencia-no-stf-para-discutir-acoes-contra-o-fim-da-escala-6x1/", "dino_6x1"], ["Ter, 10/11 · 14h", "justica", "STF realiza audiência sobre o fim da escala 6x1", "O ministro Flávio Dino reúne empregadores e trabalhadores, e diz que a redução da jornada não está em negociação. O foco são os prazos de transição pedidos pela CNC e pela CNI.", "https://folhaexpressa.com/politica/dino-convoca-audiencia-no-stf-para-discutir-mudancas-no-fim-da-escala-6x1/", "dino_6x1"], ["Ter, 10/11 e qua, 11/11", "mundo", "Negociações formais sobre a Ucrânia em Abu Dhabi", "Rússia, Ucrânia e EUA devem se reunir, segundo o Diario Crónica, depois de Trump dizer que há um acordo, sem detalhes.", "https://diariocronica.com.ar/noticias/2026/11/06/176391-donald-trump-anuncio-un-acuerdo-para-poner-fin-al-conflicto-entre-rusia-y-ucrania", "ucrania_acordo"], ]);
/* ===== Edição das 12h (extra) ===== */
EDICAO.hora = '12h';
EDICAO.data = 'Sexta, 06 de novembro de 2026';
S.pgdf_master = {"hora":"6/11","ed":"politica","k":"Política · Banco Master","t":"DF pede ao STF que preserve ativos do Master para ressarcir o BRB, que transferiu R$ 12,2 bilhões ao banco","sub":"A Procuradoria-Geral do DF também pediu a transferência imediata de R$ 2,2 bilhões bloqueados do pai de Daniel Vorcaro, encontrados na segunda fase da Operação Compliance Zero.","dado":{"n":"R$ 12,2 bi","l":"Transferidos pelo BRB ao Banco Master, cujos ativos o DF quer preservar · CNN Brasil"},"resumo":"Na noite de quinta (5), a Procuradoria-Geral do Distrito Federal (PGDF) pediu ao Supremo Tribunal Federal, em petição dirigida ao ministro Edson Fachin, que preserve os ativos ligados ao Banco Master para que o Banco de Brasília (BRB) possa ser ressarcido dos R$ 12,2 bilhões que transferiu à instituição, segundo a CNN Brasil. A PGDF também pediu a transferência imediata de R$ 2,2 bilhões bloqueados de Henrique Moura Vorcaro, pai de Daniel Vorcaro, valores localizados na segunda fase da Operação Compliance Zero.","fundo":[["p","A petição quer garantir que o dinheiro apreendido ou bloqueado no caso seja usado para recompor o BRB, banco controlado pelo governo do Distrito Federal. O pedido sobre os R$ 2,2 bilhões do pai do dono do Master é o ponto mais concreto: a PGDF quer que o valor seja transferido de imediato, e não fique parado à espera do fim do processo."],["nums",[["R$ 12,2 bi","transferidos pelo BRB ao Master"],["R$ 2,2 bi","bloqueados de Henrique Moura Vorcaro, pai de Daniel Vorcaro"]]],["p","O caso Master segue em duas frentes no Supremo: a Dark Horse, em que a PGR tem 15 dias para opinar sobre prorrogar o inquérito, e o indiciamento de Vorcaro, sobre o qual Fachin também deu 15 dias à PGR."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/politica/df-pede-ao-stf-que-preserve-ativos-do-master-para-ressarcir-o-brb/"]]};
S.lula_cop = {"hora":"6/11","ed":"politica","k":"Política · Governo","t":"Lula embarca na segunda (9) para a COP31, em Antália, e segue para Manila; só volta a Brasília na manhã do dia 16","sub":"É a primeira grande agenda externa depois da reeleição. A cúpula do clima será nos dias 11 e 12; a da Asean, em Manila, nos dias 14 e 15, com visita de Estado às Filipinas no dia 13.","resumo":"O presidente Lula embarca na segunda-feira (9) para Antália, na Turquia, onde participa da COP31, nos dias 11 e 12, segundo a CNN Brasil. Em seguida vai a Manila, para a cúpula da Asean (14 e 15), com visita de Estado às Filipinas no dia 13. A volta a Brasília está prevista para a manhã de 16 de novembro. A viagem é a primeira grande agenda externa depois da reeleição e tem peso político no momento em que o governo ainda discute o ajuste fiscal.","fundo":[["p","Segundo o Metrópoles, os detalhes do corte de privilégios só devem sair depois da viagem de Lula, o que empurra o anúncio do ajuste fiscal para a segunda quinzena de novembro."],["nums",[["9/11","embarque para Antália"],["11 e 12/11","COP31"],["13/11","visita de Estado às Filipinas"],["14 e 15/11","cúpula da Asean, em Manila"]]]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/politica/lula-prepara-ida-a-cop31-com-relevancia-de-1a-agenda-externa-apos-reeleicao/"]]};
S.planalto_pena = {"hora":"6/11","ed":"politica","k":"Política · Itamaraty","t":"Planalto vê a saída de Peña como novo revés da direita na região, e o Itamaraty trata o caso como assunto interno do Paraguai","sub":"O governo brasileiro evita se pronunciar sobre o impeachment. Lula deve ir à cúpula do Mercosul, em Montevidéu, no início de dezembro.","resumo":"Segundo a CNN Brasil, auxiliares de Lula no Planalto avaliam que a queda do presidente paraguaio Santiago Peña é mais um revés para a direita na América do Sul, região em que Javier Milei segue sem reconhecer a vitória de Lula. O Itamaraty, porém, trata o processo como questão interna do Paraguai e não deve se manifestar. O tema deve voltar à mesa na cúpula do Mercosul, em Montevidéu, no começo de dezembro, em que Lula é esperado.","fundo":[["p","A leitura política do governo contrasta com a cautela diplomática: dentro do Planalto, a crise paraguaia é vista como parte de uma virada regional, mas o Ministério das Relações Exteriores quer evitar qualquer sinal de interferência."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/politica/planalto-ve-saida-de-pena-como-novo-reves-da-direita-na-regiao/"]]};
S.janones_live = {"hora":"6/11","ed":"politica","k":"Política · Governo","t":"Lula chama Flávio de “pé-frio” em live com Janones e diz que o senador foi aos EUA buscar “proteção”","sub":"No mesmo bate-papo, o presidente disse que sua reeleição foi uma “vitória para o mundo” e citou as derrotas de Netanyahu e Trump.","resumo":"Em transmissão ao vivo com o deputado André Janones, Lula chamou o senador Flávio Bolsonaro de “pé-frio” e afirmou que ele foi aos Estados Unidos buscar “proteção”, segundo a CNN Brasil. O presidente também disse que sua reeleição foi uma “vitória para o mundo” e mencionou as perdas políticas do primeiro-ministro israelense, Benjamin Netanyahu, e do presidente americano, Donald Trump. A fala vem depois da reportagem do New York Times sobre o embarque de Flávio para Miami.","fundo":[["p","A live com Janones é um dos primeiros movimentos de comunicação de Lula depois do resultado. A provocação a Flávio dialoga com a reportagem do New York Times, que diz que um assessor de Milei ajudou o senador a embarcar para Miami."]],"fontes":[["CNN Brasil (pé-frio)","https://www.cnnbrasil.com.br/politica/lula-diz-que-flavio-e-pe-frio-e-que-senador-foi-aos-eua-buscar-protecao/"],["CNN Brasil (vitória mundial)","https://www.cnnbrasil.com.br/politica/lula-cita-perdas-de-netanyahu-e-trump-e-diz-que-sua-vitoria-foi-mundial/"]]};
S.camisotti = {"hora":"6/11","ed":"politica","k":"Política · STF","t":"Mendonça autoriza prisão domiciliar para Maurício Camisotti, investigado na fraude do INSS","sub":"O ministro do STF converteu a prisão preventiva em domiciliar.","resumo":"O ministro André Mendonça, do Supremo Tribunal Federal, converteu em prisão domiciliar a prisão preventiva de Maurício Camisotti, investigado na fraude de descontos do INSS, segundo o blog de Teo Cury, da CNN Brasil.","fundo":[["p","A decisão troca a cela pela casa do investigado, sem encerrar o processo. Os termos da domiciliar (monitoramento, restrições e prazo) não foram detalhados na matéria consultada."]],"fontes":[["CNN Brasil (Teo Cury)","https://www.cnnbrasil.com.br/blogs/teo-cury/politica/inss-mendonca-autoriza-prisao-domiciliar-para-mauricio-camisotti/"]]};
S.bolsonaros_eua = {"hora":"6/11","ed":"politica","k":"Política · Bolsonaros","t":"Governo vê caminho para investigar os Bolsonaros nos EUA depois da vitória democrata nas eleições de meio de mandato","sub":"A PF pediu cooperação sobre o caso Dark Horse e a ligação do Banco Master com a Havengate. Eduardo Bolsonaro foi condenado a quatro anos e dois meses.","resumo":"Segundo o blog de Jussara Soares, na CNN Brasil, o governo brasileiro avalia que a vitória dos democratas nas eleições americanas abre caminho para investigar os Bolsonaros nos Estados Unidos. A Polícia Federal já pediu cooperação às autoridades americanas sobre a Dark Horse e sobre a ligação entre o Banco Master e a Havengate. Eduardo Bolsonaro foi condenado a quatro anos e dois meses.","fundo":[["p","A avaliação é do governo brasileiro. A matéria não registra resposta das autoridades americanas ao pedido de cooperação da PF."]],"fontes":[["CNN Brasil (Jussara Soares)","https://www.cnnbrasil.com.br/blogs/jussara-soares/politica/brasil-ve-caminho-para-investigar-bolsonaros-nos-eua-apos-eleicao/"]]};
S.bolsas_ia = {"hora":"6/11","ed":"economia","k":"Economia · Mercados globais","t":"Bolsas globais despencam com pânico em torno da inteligência artificial: Nasdaq cai 5,5%, e o Nikkei, perto de 6%","sub":"Mais de US$ 3,2 trilhões em valor de mercado evaporaram. A Nvidia caiu 9%, com receio de regulação da IA depois da vitória democrata.","dado":{"n":"US$ 3,2 tri","l":"Valor de mercado perdido nas bolsas globais · Metrópoles"},"resumo":"As bolsas mundiais tiveram um dia de pânico, segundo o Metrópoles: o Nasdaq caiu cerca de 5,5%, o S&P 500, 4,36%, e o Dow Jones perdeu 1.833 pontos. Na Ásia, o Nikkei recuou perto de 6% e o Kospi, 6,7%. Mais de US$ 3,2 trilhões em valor de mercado foram perdidos. A Nvidia recuou 9%, com investidores temendo regulação mais dura da IA depois da vitória democrata nas eleições de meio de mandato.","fundo":[["nums",[["−5,5%","Nasdaq"],["−4,36%","S&P 500"],["−1.833 pts","Dow Jones"],["−6,7%","Kospi"],["−9%","Nvidia"]]],["p","O movimento ajuda a explicar a abertura cautelosa do Ibovespa nesta sexta e a alta do dólar a R$ 5,50, às vésperas do payroll americano."]],"fontes":[["Metrópoles","https://www.metropoles.com/mundo/bolsas-globais-despencam-com-mercados-tomados-por-panico-em-torno-de-ia"]]};
S.seletivo_vinho = {"hora":"6/11","ed":"economia","k":"Economia · Tributos","t":"Imposto Seletivo sobre bebidas pode corroer a vantagem do vinho europeu no acordo Mercosul-UE","sub":"A MP 1.399/2026 fixa 8% para a maioria dos vinhos e 16% para os fortificados, a partir de 2 de fevereiro de 2027.","dado":{"n":"8%","l":"Alíquota do Imposto Seletivo sobre a maioria dos vinhos, a partir de 2/2/2027 · CNN Brasil"},"resumo":"Segundo o blog de Stevão Limana, na CNN Brasil, as alíquotas do Imposto Seletivo sobre bebidas alcoólicas, fixadas pela MP 1.399/2026, podem reduzir o benefício que o acordo entre Mercosul e União Europeia daria aos vinhos europeus. A medida cobra 8% sobre a maioria dos vinhos e 16% sobre os fortificados, a partir de 2 de fevereiro de 2027.","fundo":[["p","A tarifa de importação cai com o acordo, mas o imposto seletivo incide sobre o produto vendido no Brasil, seja nacional ou importado, e pode compensar parte da queda de preço esperada pelo consumidor."]],"fontes":[["CNN Brasil (Stevão Limana)","https://www.cnnbrasil.com.br/blogs/stevao-limana/economia/money/macroeconomia/imposto-seletivo-ameaca-beneficio-de-acordo-com-a-ue-para-vinhos/"]]};
S.localiza = {"hora":"6/11","ed":"economia","k":"Economia · Empresas","t":"Localiza tem lucro de R$ 1,13 bilhão no 3º trimestre, alta de 29,1%","sub":"Ebitda de R$ 4,03 bilhões e receita de R$ 12,28 bilhões no período.","dado":{"n":"R$ 1,13 bi","l":"Lucro da Localiza no 3º trimestre, +29,1% · CNN Brasil"},"resumo":"A Localiza informou lucro de R$ 1,13 bilhão no terceiro trimestre, alta de 29,1% sobre um ano antes, segundo a CNN Brasil. O Ebitda somou R$ 4,03 bilhões e a receita, R$ 12,28 bilhões.","fundo":[["nums",[["R$ 1,13 bi","lucro (+29,1%)"],["R$ 4,03 bi","Ebitda"],["R$ 12,28 bi","receita"]]]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/economia/money/negocios/localiza-tem-lucro-de-r-11-bilhao-no-3-trimestre-avanco-de-291/"]]};
S.sp_chuva = {"hora":"6/11","ed":"regioes","reg":"sp","k":"São Paulo · Clima","t":"Capital paulista registra o segundo outubro mais chuvoso desde 1995, e o El Niño deve durar até pelo menos fevereiro de 2027","sub":"Choveram 220,3 mm, contra 112 mm esperados. Houve mortes nos dias 14 de outubro e 2 de novembro, e a Defesa Civil mantém gabinete de crise.","dado":{"n":"220,3 mm","l":"Chuva em outubro na capital paulista (esperado: 112 mm) · CNN Brasil"},"resumo":"A cidade de São Paulo teve o segundo outubro mais chuvoso desde 1995, com 220,3 mm, quase o dobro dos 112 mm esperados para o mês, segundo a CNN Brasil; o recorde da série recente é o de outubro de 2023, com 250,4 mm. O El Niño deve continuar até pelo menos fevereiro de 2027. Houve uma morte em 14 de outubro e duas em 2 de novembro, e a Defesa Civil mantém um gabinete de crise.","fundo":[["nums",[["220,3 mm","outubro de 2026"],["112 mm","média esperada"],["250,4 mm","outubro de 2023"]]],["p","O El Niño deve seguir até pelo menos fevereiro de 2027, segundo a reportagem, e a Defesa Civil mantém o gabinete de crise."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/nacional/sudeste/sp/cidade-de-sao-paulo-registra-o-segundo-outubro-mais-chuvoso-desde-1995/"]]};
S.sp_marcola = {"hora":"6/11","ed":"regioes","reg":"sp","k":"São Paulo · Segurança","t":"Defesa de Marcola contesta acusação do MP-SP sobre lavagem de dinheiro do PCC, em caso que bloqueou R$ 327 milhões","sub":"A resposta foi apresentada na Operação Vérnix, que também envolve Deolane.","resumo":"A defesa de Marcola respondeu ao Ministério Público de São Paulo na Operação Vérnix, que apura lavagem de dinheiro ligada ao PCC e que envolve também Deolane, segundo a CNN Brasil. O caso já levou ao bloqueio de R$ 327 milhões.","fundo":[["p","A manifestação é a primeira resposta formal do lado de Marcola à acusação. O Ministério Público ainda deve se manifestar sobre os argumentos antes de uma decisão da Justiça."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/nacional/sudeste/sp/marcola-contesta-acusacao-do-mp-sobre-lavagem-de-dinheiro-com-pcc-e-deolane/"]]};
S.sul_ana = {"hora":"6/11","ed":"regioes","reg":"sul","k":"Sul · Clima","t":"Levantamento da ANA aponta 878 municípios do Sul sob risco de inundações","sub":"São 73,7% das cidades da região; 115 estão em risco muito alto.","dado":{"n":"878","l":"Municípios do Sul sob risco de inundação (73,7% do total) · CNN Brasil"},"resumo":"Um levantamento da Agência Nacional de Águas (ANA) identificou 878 municípios do Sul do país sob risco de inundações, 73,7% do total, e 115 deles em risco muito alto, segundo a CNN Brasil.","fundo":[["nums",[["266 de 295","municípios de Santa Catarina"],["346 de 497","municípios do Rio Grande do Sul"],["266 de 399","municípios do Paraná"]]]],"fontes":[["CNN Brasil","https://stories.cnnbrasil.com.br/nacional/levantamento-revela-878-municipios-sob-risco-de-inundacoes-no-sul-do-brasil/"]]};
S.sul_frente = {"hora":"6/11","ed":"regioes","reg":"sul","k":"Sul · Clima","t":"Frente fria traz temporais ao Sul no sábado, com mais de 50 mm em 24 horas no PR, em SC e no norte do RS","sub":"Rajadas passam de 60 km/h no litoral, e a temperatura cai no Rio Grande do Sul.","resumo":"Uma frente fria deve provocar temporais no Centro-Sul, segundo a CNN Brasil. No sábado (7), a chuva pode passar de 50 mm em 24 horas no Paraná, em Santa Catarina e no norte do Rio Grande do Sul, com rajadas acima de 60 km/h no litoral do Sul e queda de temperatura no Rio Grande do Sul.","fundo":[["p","O alerta chega depois dos tornados e ventos de 126 km/h que atingiram 106 municípios catarinenses e com o levantamento da ANA sobre o risco de inundações na região."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/nacional/brasil/frente-fria-deve-provocar-temporais-e-queda-de-temperatura-no-centro-sul/"]]};
S.trump_arco = {"hora":"6/11","ed":"mundo","k":"Mundo · Estados Unidos","t":"Juíza suspende por 14 dias a obra do “Arco do Triunfo” de Trump, menos de uma hora depois da aprovação do projeto","sub":"A comissão federal de planejamento aprovou o arco de 76 metros por 8 votos a 4. A juíza Tanya Chutkan barrou as obras.","dado":{"n":"76 m","l":"Altura do arco que Trump quer construir em Washington · CNN Brasil"},"resumo":"Na noite de quinta (5), a Comissão Nacional de Planejamento da Capital dos EUA aprovou, por 8 votos a 4, o projeto do arco de 76 metros que Donald Trump quer erguer em Washington. Em menos de uma hora, a juíza Tanya Chutkan suspendeu as obras por 14 dias, segundo a CNN Brasil.","fundo":[["p","A suspensão vale por 14 dias, contados a partir da decisão da juíza Tanya Chutkan."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/internacional/juiza-barra-arco-do-triunfo-de-trump-menos-de-uma-hora-apos-aprovacao/"]]};
S.ira_trump = {"hora":"6/11","ed":"mundo","k":"Mundo · Irã e Estados Unidos","t":"Trump diz que talvez precise “destruir o resto” do Irã, enquanto Teerã enviou proposta nuclear pelo Catar","sub":"A fala do presidente americano veio no mesmo dia em que o Irã encaminhou uma proposta sobre o programa nuclear.","resumo":"O presidente Donald Trump afirmou que talvez tenha de “destruir o resto” do Irã, segundo a CNN Brasil. Na quinta (5), o governo iraniano enviou, por intermédio do Catar, uma proposta sobre seu programa nuclear.","fundo":[["p","A ameaça e a proposta correm em paralelo: Washington mantém a pressão militar enquanto o canal de negociação via Doha segue aberto. O Brent subiu a US$ 98,29 na quinta, depois de novos ataques a petroleiros."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/internacional/trump-afirma-que-talvez-precise-destruir-o-resto-do-ira/"]]};
S.papa_leao = {"hora":"6/11","ed":"mundo","k":"Mundo · Uruguai, Argentina e Peru","t":"Papa Leão XIV chega ao Uruguai nesta sexta, e a viagem segue pela Argentina e pelo Peru","sub":"Ele chega à Argentina no domingo (8) e visita o Peru de 11 a 17 de novembro.","resumo":"O papa Leão XIV chega ao Uruguai nesta sexta (6), primeira escala de uma viagem pela América do Sul, segundo a CNN Brasil. Na Argentina, a agenda começa a partir de 8 de novembro, e o Peru será visitado de 11 a 17.","fundo":[["p","A passagem pela Argentina ocorre com o presidente Javier Milei isolado entre os líderes da região, por não reconhecer a vitória de Lula."]],"fontes":[["CNN Brasil","https://www.cnnbrasil.com.br/internacional/papa-leao-chega-ao-uruguai-nesta-sexta-feira-para-agenda-na-america-do-sul/"]]};
S.paraguai.t = "Senado do Paraguai inicia o impeachment de Peña, que pede 72 horas para apresentar a defesa";
S.paraguai.sub = "A Câmara já aprovou o afastamento, a acusação é da deputada Rocío Vallejo, e a sessão desta sexta estava marcada para as 10h. A renúncia anunciada por Peña não foi votada por falta de quórum.";
S.paraguai.upd = "A Câmara já aprovou o afastamento, o Senado iniciou o julgamento e Peña pediu 72 horas para apresentar a defesa.";
S.paraguai.fundo.push(["h","Atualização das 12h: o rito no Senado"]);
S.paraguai.fundo.push(["p","Segundo a CNN Brasil, a Câmara dos Deputados já aprovou o afastamento de Peña, e o Senado começou o impeachment na noite de quinta (5). A acusação foi apresentada pela deputada Rocío Vallejo, e a sessão desta sexta (6) estava marcada para as 10h. O Metrópoles informa que Peña pediu 72 horas de prazo para apresentar a defesa."]);
S.paraguai.fontes.push(["CNN Brasil (Senado retoma impeachment)","https://www.cnnbrasil.com.br/internacional/congresso-do-paraguai-retoma-discussao-sobre-impeachment-de-pena/"]);
S.paraguai.fontes.push(["Metrópoles (72 horas de defesa)","https://www.metropoles.com/mundo/paraguai-pena-pede-72-horas-para-apresentar-defesa-contra-impeachment"]);
S.ms_seg.upd = "Lula disse que discute a MP nesta sexta com os ministros Wellington César Lima e Silva e Miriam Belchior; a PEC da Segurança foi aprovada por unanimidade no Senado na terça (3).";
S.ms_seg.fundo.push(["h","Atualização das 12h: reunião desta sexta"]);
S.ms_seg.fundo.push(["p","Segundo a CNN Brasil, Lula afirmou que discutirá nesta sexta a criação do Ministério da Segurança Pública com os ministros Wellington César Lima e Silva (Justiça) e Miriam Belchior. A PEC da Segurança foi aprovada por unanimidade pelo Senado na terça (3)."]);
S.ms_seg.fontes.push(["CNN Brasil (reunião de sexta)","https://www.cnnbrasil.com.br/politica/lula-diz-que-discutira-criacao-do-ministerio-da-seguranca-nesta-sexta/"]);
S.tse_novo.upd = "A ação do Novo é uma AIJE: questiona 35 medidas, 12 delas durante a campanha, e cerca de R$ 99,7 bilhões em créditos; a defesa tem cinco dias.";
S.tse_novo.fundo.push(["h","Atualização das 12h: o tamanho da ação"]);
S.tse_novo.fundo.push(["p","Segundo a CNN Brasil, o corregedor Ricardo Villas Bôas Cueva aceitou a ação de investigação judicial eleitoral (AIJE) do Novo contra Lula e Alckmin. O partido aponta 35 medidas, 12 delas tomadas durante a campanha, que somariam cerca de R$ 99,7 bilhões em créditos. A defesa tem cinco dias."]);
S.tse_novo.fontes.push(["CNN Brasil (AIJE)","https://www.cnnbrasil.com.br/politica/tse-aceita-acao-do-novo-contra-lula-e-alckmin-por-abuso-de-poder-politico/"]);
S.zaporizhzhia.upd = "A CNN Brasil, citando o governador, fala em 53 mortos, e há apagões em sete regiões; a AFP seguia com 50.";
S.zaporizhzhia.fundo.push(["h","Atualização das 12h: balanço diverge"]);
S.zaporizhzhia.fundo.push(["p","A CNN Brasil informa, citando o governador regional, que o ataque de segunda (2) a um ponto de ajuda em Komychuvakha deixou 53 mortos, número acima dos 50 divulgados pela AFP. A reportagem registra ainda apagões em sete regiões ucranianas."]);
S.zaporizhzhia.fontes.push(["CNN Brasil (balanço de 53 mortos)","https://www.cnnbrasil.com.br/internacional/ataque-russo-a-ponto-de-ajuda-na-ucrania-deixa-53-mortos-diz-governador/"]);
S.bomba_europa.upd = "Pelo menos 27 voos foram alvo de ameaças, e um grupo extremista russo é citado nas mensagens, segundo o Metrópoles.";
S.bomba_europa.fundo.push(["h","Atualização das 12h: o alcance das ameaças"]);
S.bomba_europa.fundo.push(["p","Segundo o Metrópoles, pelo menos 27 voos foram atingidos por ameaças de bomba na Europa, e as mensagens citam um grupo extremista russo."]);
S.bomba_europa.fontes.push(["Metrópoles (grupo russo citado)","https://www.metropoles.com/mundo/grupo-extremista-russo-e-citado-em-ameacas-de-bombas-em-voos-na-europa"]);
HOME_LEAD = 'pgdf_master';
HOME_ROW = ['seletivo_vinho','sp_chuva','trump_arco'];
ORDER.politica = _mv3(ORDER.politica,['pgdf_master','lula_cop','janones_live','planalto_pena','bolsonaros_eua','camisotti','ms_seg','tse_novo','dino_6x1']);
ORDER.economia = _mv3(ORDER.economia,['bolsas_ia','seletivo_vinho','localiza','mercado','fiscal']);
ORDER.regioes = _mv3(ORDER.regioes,['sp_chuva','sul_ana','sul_frente','sp_marcola']);
ORDER.mundo = _mv3(ORDER.mundo,['paraguai','trump_arco','ira_trump','papa_leao','ucrania_acordo','zaporizhzhia','bomba_europa']);
GIRO = GIRO.filter(function(g){return ["Bolsa abre estável","Peña segue no cargo","Greve na França","Caputo em Iguazú","Voto aberto no Senado","Posse de Lula","Messias de novo","CEDEARs e Milei","Árabes e Netanyahu"].indexOf(g[0])<0;});
GIRO = [["Master e o BRB","A PGDF pede ao STF que preserve ativos do Master e que sejam transferidos R$ 2,2 bilhões bloqueados do pai de Vorcaro, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/politica/df-pede-ao-stf-que-preserve-ativos-do-master-para-ressarcir-o-brb/","","pgdf_master"],["Lula e o “pé-frio”","Em live com Janones, Lula diz que Flávio foi aos EUA buscar “proteção”, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/politica/lula-diz-que-flavio-e-pe-frio-e-que-senador-foi-aos-eua-buscar-protecao/","","janones_live"],["Agenda externa de Lula","Embarque para a COP31 na segunda (9); volta de Manila na manhã do dia 16, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/politica/lula-prepara-ida-a-cop31-com-relevancia-de-1a-agenda-externa-apos-reeleicao/","","lula_cop"],["Planalto e Peña","Governo vê a queda do paraguaio como revés da direita, e o Itamaraty trata o caso como interno, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/politica/planalto-ve-saida-de-pena-como-novo-reves-da-direita-na-regiao/","","planalto_pena"],["Peña pede 72 horas","O presidente paraguaio pediu prazo para a defesa no Senado, segundo o Metrópoles.","Metrópoles","https://www.metropoles.com/mundo/paraguai-pena-pede-72-horas-para-apresentar-defesa-contra-impeachment","","paraguai"],["Arco de Trump na Justiça","A juíza Tanya Chutkan suspendeu por 14 dias as obras do arco de 76 metros, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/internacional/juiza-barra-arco-do-triunfo-de-trump-menos-de-uma-hora-apos-aprovacao/","","trump_arco"],["Pânico nas bolsas","Nasdaq cai 5,5% e a Nvidia, 9%, com receio de regulação da IA, segundo o Metrópoles.","Metrópoles","https://www.metropoles.com/mundo/bolsas-globais-despencam-com-mercados-tomados-por-panico-em-torno-de-ia","","bolsas_ia"],["Vinho e Imposto Seletivo","Alíquota de 8% pode corroer o ganho do acordo com a UE, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/blogs/stevao-limana/economia/money/macroeconomia/imposto-seletivo-ameaca-beneficio-de-acordo-com-a-ue-para-vinhos/","","seletivo_vinho"],["Chuva em São Paulo","Outubro foi o segundo mais chuvoso desde 1995, com 220,3 mm, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/nacional/sudeste/sp/cidade-de-sao-paulo-registra-o-segundo-outubro-mais-chuvoso-desde-1995/","","sp_chuva"],["Papa no Cone Sul","Leão XIV chega ao Uruguai hoje; Argentina a partir do dia 8 e Peru de 11 a 17, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/internacional/papa-leao-chega-ao-uruguai-nesta-sexta-feira-para-agenda-na-america-do-sul/","","papa_leao"]].concat(GIRO);
AMANHA = AMANHA.filter(function(a){return ["Termina a paralisação da SNCF na França","Lula viaja à COP31, em Antalya (Turquia)"].indexOf(a[2])<0;});
AMANHA.unshift.apply(AMANHA,[["Sex, 06/11","mundo","Papa Leão XIV chega ao Uruguai","Primeira escala da viagem pela América do Sul; no domingo (8) ele segue para a Argentina.","https://www.cnnbrasil.com.br/internacional/papa-leao-chega-ao-uruguai-nesta-sexta-feira-para-agenda-na-america-do-sul/","papa_leao"],["Sáb, 07/11","agenda","Frente fria traz temporais ao Sul","Chuva acima de 50 mm em 24 horas no Paraná, em Santa Catarina e no norte do Rio Grande do Sul, com rajadas de mais de 60 km/h no litoral.","https://www.cnnbrasil.com.br/nacional/brasil/frente-fria-deve-provocar-temporais-e-queda-de-temperatura-no-centro-sul/","sul_frente"],["Seg, 09/11","agenda","Lula embarca para a COP31, em Antália","Primeira grande agenda externa depois da reeleição; depois da COP31 (11 e 12), ele segue para Manila e volta a Brasília na manhã do dia 16.","https://www.cnnbrasil.com.br/politica/lula-prepara-ida-a-cop31-com-relevancia-de-1a-agenda-externa-apos-reeleicao/","lula_cop"],["Qua, 11/11 e qui, 12/11","mundo","COP31 reúne líderes em Antália, na Turquia","Lula participa da conferência do clima; em seguida, vai à cúpula da Asean, em Manila, nos dias 14 e 15.","https://www.cnnbrasil.com.br/politica/lula-prepara-ida-a-cop31-com-relevancia-de-1a-agenda-externa-apos-reeleicao/","lula_cop"]]);
/* Matérias paradas aposentadas na edição das 12h */
var _VEL = ["flavio", "pronunciamento", "bets", "copom", "seletivo", "paes", "guandu", "novoguandu", "pj", "prefeitura", "light", "reis", "eua", "fuga", "congresso", "ldo", "ministerio", "desinfo", "sp", "mg", "ne", "sul", "norte", "co", "imprensa", "argentina", "maioridade", "vorcaro", "darkhorse", "marinho", "seis1x1", "tse", "pauta5", "segmin", "assedio", "meta", "lulasaude", "psdb", "orcamento", "betsaud", "sp_barba", "mg_tce", "mg_china", "mg_ipva", "ba_blocos", "ba_jeronimo", "pe_emprestimo", "ce_mpe", "ce_gastos", "ma_tce", "al_trans", "sc_alesc", "pr_cwb", "rs_zucco", "pa_parau", "ms_assoma", "ms_senado", "eua_pioneiros", "mei", "tarifas", "industria", "durigan", "ato_obsceno", "oea", "g20_trump", "sc_tornados", "franca", "hongkong", "messias", "sucessao", "reuniao_eco", "rj_pm", "rj_teto", "ce_oposicao", "ce_arma", "juicio", "ueno", "cpac", "tse_name", "brent", "wall_street", "rnest", "ba_lula", "cedears"];
_VEL.forEach(function(i){ if(S[i]) S[i].velha = true; });
Object.keys(ORDER).forEach(function(k){ ORDER[k] = ORDER[k].filter(function(i){ return _VEL.indexOf(i)<0; }); });
/* Edição das 15h */
EDICAO.hora = '15h';
EDICAO.data = 'Sexta, 06 de novembro de 2026';
S.payroll_out = {"hora":"6/11","ed":"economia","k":"Economia · Estados Unidos","t":"Payroll de outubro vem em 165 mil vagas, mais que o dobro do esperado, e reforça a aposta de alta de juros nos EUA","sub":"O desemprego caiu a 4,1%. O dólar global se fortaleceu, e o mercado vê cerca de 80% de chance de aumento de 0,25 ponto do Fed em dezembro.","dado":{"n":"165 mil","l":"Vagas criadas nos EUA em outubro, contra 65 mil esperadas · InfoMoney (Reuters)"},"resumo":"O Departamento do Trabalho dos EUA informou, nesta sexta (6), a criação de 165 mil vagas fora do setor agrícola em outubro, contra estimativa de 65 mil, segundo a Reuters reproduzida pelo InfoMoney. Setembro foi revisado para 60 mil, e a taxa de desemprego caiu a 4,1%. O índice do dólar acelerou a alta, e os contratos de juros passaram a precificar cerca de 80% de chance de alta de 0,25 ponto percentual do Fed em dezembro.","fundo":[["p","Segundo a Reuters, reproduzida pelo InfoMoney, o relatório de emprego dos EUA (payroll) de outubro registrou 165 mil novas vagas não agrícolas, bem acima da projeção de 65 mil. O dado de setembro foi revisado para cima, para 60 mil, e a taxa de desemprego recuou a 4,1%."],["p","O InfoMoney registra que o índice do dólar (DXY) subia 0,64%, a 102,20 pontos, às 14h33, e que, após o relatório, os contratos de juros precificavam cerca de 80% de chance de alta de 0,25 ponto percentual dos juros pelo Fed em dezembro, contra cerca de 75% antes do dado. O presidente do Fed de St. Louis, Alberto Musalem, disse que “a inflação é um imposto regressivo, um imposto distorcionador” e defendeu novos aumentos de juros."],["p","Nos EUA, o S&P 500 subia 0,86% e o Nasdaq, 1,56% às 14h32, um dia depois da queda de 5,52% do Nasdaq, a maior desde abril de 2025."]],"fontes":[["InfoMoney (Ibovespa hoje ao vivo)","https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-de-valores-ao-vivo-06112026/"],["Money Times (pré-abertura)","https://www.moneytimes.com.br/payroll-fecha-semana-antes-de-pronunciamento-de-lula-ao-mercado-ibovespa-em-dolar-cai-nesta-sexta-feira-6-rens/"]]};
S.bradesco_pib = {"hora":"6/11","ed":"economia","k":"Economia · Projeções","t":"Bradesco reduz a projeção do PIB de 2027 a 0,4% e eleva a inflação de 2026 a 5,5%","sub":"A XP também prevê PIB de 0,3% em 2027, com dólar a R$ 5,50 e Selic em 13,75%.","dado":{"n":"0,4%","l":"PIB de 2027 projetado pelo Bradesco (antes, 1,0%) · InfoMoney"},"resumo":"O Bradesco revisou para baixo a projeção do PIB: de 1,7% para 1,5% em 2026 e de 1,0% para 0,4% em 2027, segundo o InfoMoney. A inflação projetada subiu de 4,9% para 5,5% em 2026 e de 4,1% para 5,3% em 2027. A XP, na mesma cobertura, vê PIB de 0,3% em 2027.","fundo":[["p","De acordo com o InfoMoney, o Bradesco revisou suas estimativas macroeconômicas nesta sexta (6). Para o PIB, a projeção de 2026 caiu de 1,7% para 1,5%, e a de 2027, de 1,0% para 0,4%. Para a inflação, a estimativa de 2026 subiu de 4,9% para 5,5%, e a de 2027, de 4,1% para 5,3%."],["p","Na mesma cobertura, o InfoMoney informa que a XP projeta PIB de 0,3% em 2027, dólar a R$ 5,50 e Selic em 13,75%. Às 13h22, Lula disse que o governo tem responsabilidade fiscal e social, e o pronunciamento do presidente sobre o tema está previsto para domingo (8), segundo o Money Times."]],"fontes":[["InfoMoney (Ibovespa hoje ao vivo)","https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-de-valores-ao-vivo-06112026/"],["Money Times (pronunciamento de Lula)","https://www.moneytimes.com.br/payroll-fecha-semana-antes-de-pronunciamento-de-lula-ao-mercado-ibovespa-em-dolar-cai-nesta-sexta-feira-6-rens/"]]};
S.balancos_3t = {"hora":"6/11","ed":"economia","k":"Economia · Empresas","t":"Dasa dispara cerca de 20% após lucro de R$ 173 milhões no 3º trimestre; CSN sobe 9% e Ânima, 10%","sub":"A temporada de balanços movimenta a bolsa nesta sexta. Petrobras recua, com PETR4 em baixa de 1,70%.","dado":{"n":"+79%","l":"Alta do lucro da Dasa no 3º trimestre, a R$ 173 milhões · InfoMoney"},"resumo":"Segundo o InfoMoney, a Dasa disparou cerca de 20% depois de informar lucro de R$ 173 milhões no 3º trimestre, alta de 79%. A Ânima saltou cerca de 10% após o balanço, a CSN subia 9,38% e o Assaí, 5,44%. A Petrobras operava em queda: PETR4 recuava 1,70% e PETR3, 0,60%.","fundo":[["p","O InfoMoney acompanha os balanços do 3º trimestre ao vivo. A Dasa (DASA3) subia cerca de 20% após lucro de R$ 173 milhões, 79% acima de um ano antes. A Ânima (ANIM3) avançava cerca de 10%, a CSN (CSNA3), 9,38% às 14h20, e o Assaí (ASAI3), 5,44% às 14h25. Na Petrobras, PETR4 caía 1,70% e PETR3, 0,60% às 14h37."],["p","Na Suzano, o vice-presidente financeiro, Marcos Assumpção, disse: “Estamos esperando geração de caixa muito forte para o quarto trimestre”. O Ibovespa operava em alta de 1,57%, aos 168.801 pontos, às 13h07."]],"fontes":[["InfoMoney (Ibovespa hoje ao vivo)","https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-de-valores-ao-vivo-06112026/"]]};
S.ministerio_4mandato = {"hora":"6/11","ed":"politica","k":"Política · Governo","t":"Lula quer abrir espaço a indicados de Motta e Alcolumbre no ministério do 4º mandato, mas só define o governo depois da viagem","sub":"O presidente convidou os dois para a Turquia e as Filipinas. Edinho Silva negocia “no atacado” com as cúpulas dos partidos.","resumo":"Segundo o blog de Tainá Falcão, na CNN Brasil, Lula pretende abrir espaço para indicações de Hugo Motta e Davi Alcolumbre no ministério do quarto mandato, fora da cota de Republicanos e União Brasil, e exigir compromissos de apoio parlamentar em troca. Pelo blog de Jussara Soares, a definição só avança depois da volta da Turquia e das Filipinas, em 16 de novembro, e depende de quem comandará a Fazenda.","fundo":[["p","O blog de Tainá Falcão, na CNN Brasil, informa que Lula pretende conversar diretamente com Hugo Motta (Republicanos-PB) e Davi Alcolumbre (União-AP) sobre indicados na Esplanada, além da cota proposta aos partidos deles. O presidente quer cobrar compromissos de apoio no Legislativo para evitar repetir o modelo de 2023. A reportagem lembra derrotas recentes do governo, como a derrubada do aumento do IOF por 383 votos a 98, em junho de 2025."],["p","Já o blog de Jussara Soares avalia que Lula só deve avançar na composição depois de voltar da viagem, prevista para 16 de novembro, e que aliados esperam antes a definição de quem comandará a Fazenda e a política fiscal. Por orientação do presidente, o presidente do PT, Edinho Silva, conversou com Baleia Rossi (MDB), Gilberto Kassab (PSD) e Marcos Pereira (Republicanos), e há expectativa de encontro com Antonio Rueda (União Brasil). Aliados veem MDB e PSD com mais chances de espaço, e há cautela no entorno de Lula com Republicanos, União Brasil e PP, que se engajaram na campanha de Flávio Bolsonaro no fim."],["p","A CNN Brasil informou em 3/11 que Lula convidou Motta e Alcolumbre para acompanhá-lo a Antália (COP31, 11 e 12) e a Manila (Asean, 14 e 15); os dois ainda não responderam."]],"fontes":[["CNN Brasil (blog de Tainá Falcão)","https://www.cnnbrasil.com.br/blogs/taina-falcao/politica/cupula-do-congresso-deve-indicar-nomes-para-ministerios-de-lula/"],["CNN Brasil (blog de Jussara Soares)","https://www.cnnbrasil.com.br/blogs/jussara-soares/politica/lula-deixa-definicao-do-governo-para-depois-da-viagem-a-turquia-e-filipinas/"],["CNN Brasil (convite a Hugo e Alcolumbre)","https://www.cnnbrasil.com.br/politica/lula-convida-hugo-e-alcolumbre-para-viagens-a-turquia-e-as-filipinas/"]]};
S.zelensky_madrid = {"hora":"6/11","ed":"mundo","k":"Mundo · Europa e América Latina","t":"Zelensky faz visita surpresa à Cúpula Ibero-Americana em Madri e pede ajuda de líderes latino-americanos para reparar a rede elétrica da Ucrânia","sub":"A cúpula foi marcada por ausências. O apelo ocorre depois de ataques russos que causaram apagões em sete regiões ucranianas.","resumo":"A Euronews relata que a Cúpula Ibero-Americana, em Madri, foi marcada por ausências e por uma visita surpresa do presidente ucraniano, Volodymyr Zelensky. Nesta sexta (6), a emissora informa que ele apelou a líderes latino-americanos para ajudar a reparar a rede elétrica da Ucrânia.","fundo":[["p","Segundo a Euronews em português, a Cúpula Ibero-Americana em Madri foi marcada por ausências e pela visita surpresa de Zelensky, noticiada na quinta (5). Em boletim desta sexta (6), a emissora informa que o presidente ucraniano pediu a líderes da América Latina que ajudem a reparar a rede elétrica do país."],["p","A CNN Brasil registrou, na edição das 12h do Radar, apagões em sete regiões ucranianas após o ataque russo a Zaporizhzhia. A reportagem da Euronews não detalha quais governos responderam ao apelo."]],"fontes":[["Euronews (cúpula em Madri)","https://pt.euronews.com/video/2026/11/05/cimeira-ibero-americana-em-madrid-marcada-por-ausencias-e-visita-surpresa-de-zelenskyy"],["Euronews (apelo pela rede elétrica)","https://pt.euronews.com/video/2026/11/06/zelenskyy-apela-aos-lideres-latino-americanos-que-ajudem-a-reparar-a-rede-eletrica-da-ucra"]]};
S.franca_greve = {"hora":"5/11","ed":"mundo","k":"Mundo · França","t":"Greve nacional de estudantes e professores na França protesta contra o orçamento de austeridade; Lyon tem confrontos","sub":"A Euronews fala em até 55 mil manifestantes em Lyon, com gás lacrimogêneo.","resumo":"Estudantes e professores franceses fizeram greve nacional e bloquearam escolas contra o orçamento de austeridade, segundo a Euronews. Em Lyon, a emissora relata até 55 mil manifestantes, com confrontos e uso de gás lacrimogêneo.","fundo":[["p","A Euronews em português registrou, na quinta (5), greve nacional e bloqueios de escolas na França, com estudantes e professores exigindo melhores salários e serviços públicos e protestando contra o orçamento de austeridade para reduzir a dívida. Em Lyon, a emissora fala em até 55 mil manifestantes, com confrontos e gás lacrimogêneo."],["p","O Radar não confirmou em fonte aberta os números nacionais de mobilização nem a posição do governo francês sobre os protestos."]],"fontes":[["Euronews (greve nacional)","https://pt.euronews.com/video/2026/11/05/franca-enfrenta-greve-nacional-contra-orcamento-de-austeridade-para-reduzir-divida"],["Euronews (Lyon)","https://pt.euronews.com/video/2026/11/05/franca-ate-55-mil-manifestam-se-em-lyon-com-confrontos-e-gas-lacrimogeneo"]]};
S.hk_wong = {"hora":"5/11","ed":"mundo","k":"Mundo · China","t":"Hong Kong condena o ativista Joshua Wong a mais dez anos de prisão por conluio","sub":"A Euronews noticiou a sentença na quinta (5).","resumo":"Um tribunal de Hong Kong condenou o ativista Joshua Wong a mais dez anos de prisão por conluio, segundo a Euronews em português.","fundo":[["p","Segundo a Euronews em português, Hong Kong condenou o ativista Joshua Wong a mais dez anos de prisão por conluio. A página consultada pelo Radar traz apenas a manchete e o vídeo, sem detalhes da acusação ou do tribunal."]],"fontes":[["Euronews (Joshua Wong)","https://pt.euronews.com/video/2026/11/05/hong-kong-condena-ativista-joshua-wong-a-mais-dez-anos-de-prisao-por-conluio"]]};
S.sc_chapeco = {"hora":"6/11","ed":"regioes","reg":"sul","k":"Sul · Santa Catarina","t":"Chapecó lança campanha de ajuda após tornado de quarta; sexta tem risco de temporais isolados e granizo em SC","sub":"Prefeitura e entidades empresariais organizam doações. A previsão é de instabilidade a partir da tarde.","resumo":"Depois do tornado que atingiu Chapecó (SC) na quarta (4), a prefeitura e entidades empresariais criaram a campanha “Ajude Chapecó e Região”, coordenada pelo Centro Empresarial de Chapecó, segundo o ClicRDC. Para esta sexta (6), a previsão é de tempo firme de manhã e risco baixo a moderado de temporais isolados, granizo pontual e alagamentos a partir da tarde.","fundo":[["p","Segundo o ClicRDC, o tornado que atingiu Chapecó na quarta-feira (4) levou a prefeitura e entidades empresariais a criar a campanha “Ajude Chapecó e Região”, coordenada pelo Centro Empresarial de Chapecó (CEC), com doações por Pix ou transferência. Os canais oficiais de doação estão na própria página do veículo."],["p","Para sexta (6), o boletim do mesmo veículo prevê tempo firme pela manhã e instabilidade a partir da tarde, com risco baixo a moderado de temporais isolados, granizo pontual e alagamentos. As mínimas ficam entre 7°C e 13°C no Planalto Sul e nas serras, e as máximas chegam a 32°C e 33°C no Grande Oeste. O Radar não encontrou balanço oficial de danos e vítimas nas fontes lidas."]],"fontes":[["ClicRDC (Café com notícias, 6/11)","https://clicrdc.com.br/fique-bem-informado/cafe-com-noticias-de-sexta-feira-06-de-novembro-de-2026/"]]};
S.sc_arabia = {"hora":"6/11","ed":"regioes","reg":"sul","k":"Sul · Santa Catarina","t":"Exportações catarinenses para a Arábia Saudita somam US$ 249,1 milhões até setembro, 77,6% em carne de aves","sub":"Levantamento da Fiesc com a Embaixada do Brasil em Riade aponta oportunidades ligadas ao programa Visão 2030.","dado":{"n":"US$ 249,1 mi","l":"Exportações de SC à Arábia Saudita, jan–set de 2026 · ClicRDC"},"resumo":"Santa Catarina exportou US$ 249,1 milhões à Arábia Saudita de janeiro a setembro de 2026, segundo o ClicRDC. A carne de aves respondeu por US$ 193,3 milhões, 77,6% do total. As importações do estado vindas do país somaram US$ 63 milhões.","fundo":[["p","De acordo com o ClicRDC, além da carne de aves (US$ 193,3 milhões), SC vendeu à Arábia Saudita madeira serrada (US$ 26,9 milhões), papel kraft (US$ 6,4 milhões), motores elétricos (US$ 6,3 milhões) e transformadores (US$ 6 milhões). O levantamento é da Fiesc, com a Embaixada do Brasil em Riade, e trata de oportunidades ligadas ao programa saudita Visão 2030."]],"fontes":[["ClicRDC (Café com notícias, 6/11)","https://clicrdc.com.br/fique-bem-informado/cafe-com-noticias-de-sexta-feira-06-de-novembro-de-2026/"]]};
S.am_honda = {"hora":"6/11","ed":"regioes","reg":"norte","k":"Norte · Amazonas","t":"Honda anuncia expansão e 2 mil empregos, manchete do jornal Em Tempo desta sexta","sub":"A página do veículo traz só a chamada de capa da edição impressa.","resumo":"A capa do jornal Em Tempo, de Manaus, desta sexta (6) destaca que a Honda anuncia expansão e 2 mil empregos. A página consultada pelo Radar não traz o texto da reportagem, e detalhes de investimento, local e prazo não foram confirmados.","fundo":[["p","A edição impressa do Em Tempo de 6 de novembro traz como manchete “Honda anuncia expansão e 2 mil empregos”. O Radar leu apenas a página da edição, sem o texto da matéria, e por isso não informa valores, cronograma nem a unidade envolvida."]],"fontes":[["Em Tempo (edição impressa de 6/11)","https://emtempo.com.br/611605/jornal-impresso-em-tempo/jornal-em-tempo-sexta-feira-6-de-novembro-de-2026/"]]};

S.paraguai.t = "Senado do Paraguai rejeita por 39 votos o pedido de Peña por 72 horas, e ele não comparece ao julgamento; advogados o representam";
S.paraguai.sub = "A Câmara aprovou a abertura do processo por unanimidade, com 78 votos. Para destituí-lo, o Senado precisa de dois terços. O resultado final não estava publicado nas fontes lidas.";
S.paraguai.upd = "O Senado negou o prazo de 72 horas (39 votos contra 3, com 2 abstenções, segundo a CNN Brasil), e Peña não foi à sessão e enviou os advogados Ricardo Preda e Adolfo Ferreiro.";
S.paraguai.fundo.push(["h","Atualização das 15h: prazo negado e defesa por advogados"]);
S.paraguai.fundo.push(["p","Segundo a CNN Brasil (11h46), o Senado rejeitou o pedido de prorrogação de 72 horas feito por Peña, por 39 votos, contra 3 favoráveis e 2 abstenções. Peña deveria depor às 10h, no horário local. O Metrópoles (13h57) informa que ele não compareceu e enviou os advogados Ricardo Preda e Adolfo Ferreiro para falar aos senadores. A Agência Brasil confirma a negativa do prazo e lembra que o pedido de renúncia ainda precisa ser analisado pelo Congresso."]);
S.paraguai.fundo.push(["p","O Metrópoles lembra que a abertura do processo passou na Câmara por unanimidade, com 78 votos, e que a destituição exige dois terços dos senadores. A oposição, segundo o veículo, vê na renúncia uma manobra para manter o foro de senador vitalício. As acusações incluem vínculo com o Ueno Bank, a nomeação de um ex-presidente da financeira para presidir o Banco Central e a concentração de recursos do IPS no banco acima dos limites legais; o Ministério Público abriu investigação formal. As fontes lidas não registram o resultado final do julgamento."]);
S.paraguai.fontes.push(["CNN Brasil (prorrogação rejeitada)","https://www.cnnbrasil.com.br/internacional/senado-do-paraguai-rejeita-pedido-de-prorrogacao-de-pena/"]);
S.paraguai.fontes.push(["Metrópoles (Peña não comparece)","https://www.metropoles.com/mundo/paraguai-pena-nao-comparece-a-sessao-de-impeachment-e-envia-advogados"]);
S.paraguai.fontes.push(["Agência Brasil (prazo negado)","https://agenciabrasil.ebc.com.br/radioagencia-nacional/internacional/audio/2026-11/senado-paraguaio-nega-prorrogacao-de-processo-de-impeachment-de-pena"]);
S.paraguai.fontes.push(["Metrópoles (nova direita)","https://www.metropoles.com/mundo/queda-de-presidente-do-paraguai-abala-nova-direita-na-america-latina"]);

S.ms_seg.upd = "A CNN Brasil diz que os nomes cotados para a pasta ainda não foram definidos (Rui Costa, Camilo Santana e Haddad, no perfil político; Lincoln Gakiya e Chico Lucas, no técnico), e a PF espera ser vinculada ao novo ministério, segundo o Metrópoles.";
S.ms_seg.fundo.push(["h","Atualização das 15h: nomes cotados, financiamento e a PF"]);
S.ms_seg.fundo.push(["p","Em entrevista à CNN Brasil, o ministro da Justiça, Wellington César Lima e Silva, disse que o governo estuda cenários para o novo ministério e que, com a PEC, “teremos muito avanço em questão de investimento em segurança pública”. Segundo a CNN, a PEC reforça fundos de segurança com recursos do Fundo Social, com 10% do valor escalonado em três anos (2027 a 2029), e Wellington afirmou que o contingenciamento “não mais poderá incidir” sobre a área. A PEC foi aprovada com 73 votos na primeira votação e 75 na segunda, sem votos contrários, e vai à promulgação."]);
S.ms_seg.fundo.push(["p","A CNN descreve um dilema entre perfil político, com Rui Costa e Camilo Santana (PT) e também Fernando Haddad na lista, e perfil técnico, com o promotor Lincoln Gakiya (Gaeco/MP-SP) e Chico Lucas, secretário nacional de Segurança Pública. A coluna de Igor Gadelha, no Metrópoles, diz que a cúpula da PF espera deixar o Ministério da Justiça e passar à nova pasta; a PF esteve vinculada à Segurança entre 2018 e 2019. A Agência Brasil informa que, por MP, a pasta passa a valer de imediato, e uma comissão mista analisa o texto depois."]);
S.ms_seg.fontes.push(["CNN Brasil (cenários, nomes e financiamento)","https://www.cnnbrasil.com.br/politica/estamos-estudando-cenarios-para-novo-ministerio-da-seguranca-diz-ministro/"]);
S.ms_seg.fontes.push(["Metrópoles (Igor Gadelha, expectativa da PF)","https://www.metropoles.com/colunas/igor-gadelha/a-expectativa-da-cupula-da-pf-para-a-recriacao-do-ministerio-da-seguranca"]);
S.ms_seg.fontes.push(["Agência Brasil (reunião e MP)","https://agenciabrasil.ebc.com.br/radioagencia-nacional/seguranca/audio/2026-11/lula-se-reune-para-discutir-ministerio-da-seguranca-publica"]);

S.mercado.t = "Ibovespa vira para alta de 1,6% com payroll forte e balanços; dólar fica perto de R$ 5,49";
S.mercado.sub = "O índice chegou a 168,8 mil pontos às 13h07. Brent a US$ 97,74 e juros futuros em alta.";
S.mercado.upd = "Depois do payroll de 165 mil vagas, o Ibovespa subia 1,57%, aos 168.801 pontos, e o dólar comercial estava a R$ 5,488 às 14h12.";
S.mercado.fundo.push(["h","Atualização das 15h: bolsa sobe depois do payroll"]);
S.mercado.fundo.push(["p","Segundo o InfoMoney, o Ibovespa operava em alta de 1,57%, aos 168.801,65 pontos, às 13h07, e o contrato futuro subia 1,91%, aos 170.675 pontos, às 14h23. O dólar comercial estava a R$ 5,488 na venda às 14h12 (mínima de R$ 5,481 e máxima de R$ 5,531). O Brent recuava 0,56%, a US$ 97,74, e o WTI subia 0,13%, a US$ 90,64. Os juros futuros avançavam."]);
S.mercado.fontes.push(["InfoMoney (Ibovespa hoje ao vivo)","https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-de-valores-ao-vivo-06112026/"]);

S.lula_cop.upd = "A CNN Brasil informa que Hugo Motta e Davi Alcolumbre ainda não responderam ao convite para acompanhar a viagem, e que Lula só define o ministério depois de voltar, em 16 de novembro.";
S.lula_cop.fundo.push(["h","Atualização das 15h: convite ao Congresso"]);
S.lula_cop.fundo.push(["p","Segundo a CNN Brasil, Lula convidou os presidentes da Câmara, Hugo Motta, e do Senado, Davi Alcolumbre, para a viagem à Turquia (COP31, 11 e 12) e às Filipinas (Asean, 14 e 15), e os dois ainda não responderam. O blog de Jussara Soares diz que a definição do ministério do quarto mandato fica para depois da volta, em 16 de novembro."]);
S.lula_cop.fontes.push(["CNN Brasil (convite a Hugo e Alcolumbre)","https://www.cnnbrasil.com.br/politica/lula-convida-hugo-e-alcolumbre-para-viagens-a-turquia-e-as-filipinas/"]);

S.seletivo_vinho.upd = "O ClicRDC detalha as alíquotas temporárias de 2027 da MP: 2,6% para bebidas açucaradas, 4,2% para cervejas, 8% para vinhos e 6,3% de base para automóveis.";
S.seletivo_vinho.fundo.push(["h","Atualização das 15h: alíquotas de 2027"]);
S.seletivo_vinho.fundo.push(["p","Segundo o ClicRDC, a MP 1.399/2026 fixa para 2027, de forma temporária, 2,6% para bebidas açucaradas, 4,2% para cervejas e 8% para vinhos, e alíquota-base de 6,3% para automóveis de passeio, com ajustes por eficiência energética, potência e tecnologia. Pessoas com deficiência, pessoas com TEA e taxistas aparecem entre as isenções. As alíquotas definitivas valem a partir de 2028 e ainda serão discutidas."]);
S.seletivo_vinho.fontes.push(["ClicRDC (Café com notícias, 6/11)","https://clicrdc.com.br/fique-bem-informado/cafe-com-noticias-de-sexta-feira-06-de-novembro-de-2026/"]);

S.bolsas_ia.upd = "Nesta sexta, o Nikkei abriu em queda de 6,04% e as bolsas europeias recuaram, mas o Nasdaq reagia, com alta de 1,56% por volta das 14h30.";
S.bolsas_ia.fundo.push(["h","Atualização das 15h: Ásia e Europa caem, Nova York reage"]);
S.bolsas_ia.fundo.push(["p","Segundo o Money Times, o Nikkei caiu 6,04% na abertura desta sexta, o Hang Seng recuou 1,27% e Xangai, 1,10%. Londres perdia 1,71%, Frankfurt, 1,73% e Paris, 1,39%. Já o InfoMoney registra, às 14h32, alta de 1,56% do Nasdaq e de 0,86% do S&P 500, depois da queda de 5,52% do Nasdaq na quinta."]);
S.bolsas_ia.fontes.push(["Money Times (pré-abertura)","https://www.moneytimes.com.br/payroll-fecha-semana-antes-de-pronunciamento-de-lula-ao-mercado-ibovespa-em-dolar-cai-nesta-sexta-feira-6-rens/"]);
S.bolsas_ia.fontes.push(["InfoMoney (Ibovespa hoje ao vivo)","https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-de-valores-ao-vivo-06112026/"]);

HOME_LEAD = 'ministerio_4mandato';
HOME_ROW = ['payroll_out','paraguai','ms_seg'];
ORDER.politica = _mv3(ORDER.politica,['ministerio_4mandato','ms_seg','lula_cop']);
ORDER.economia = _mv3(ORDER.economia,['payroll_out','mercado','bradesco_pib','balancos_3t','bolsas_ia','seletivo_vinho']);
ORDER.regioes = _mv3(ORDER.regioes,['sc_chapeco','sc_arabia','am_honda']);
ORDER.mundo = _mv3(ORDER.mundo,['paraguai','zelensky_madrid','franca_greve','hk_wong']);
GIRO = [["Payroll acima do esperado","Os EUA criaram 165 mil vagas em outubro, contra 65 mil esperadas, e o desemprego caiu a 4,1%, segundo o InfoMoney.","InfoMoney","https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-de-valores-ao-vivo-06112026/","","payroll_out"],["Bradesco corta o PIB de 2027","O banco projeta PIB de 0,4% em 2027, contra 1,0% antes, e inflação de 5,5% em 2026, segundo o InfoMoney.","InfoMoney","https://www.infomoney.com.br/mercados/ibovespa-hoje-bolsa-de-valores-ao-vivo-06112026/","","bradesco_pib"],["Peña perde o pedido de prazo","O Senado paraguaio rejeitou por 39 votos o pedido de 72 horas, segundo a CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/internacional/senado-do-paraguai-rejeita-pedido-de-prorrogacao-de-pena/","","paraguai"],["Ministério e a PF","A cúpula da PF espera ser vinculada ao novo Ministério da Segurança, segundo a coluna de Igor Gadelha, no Metrópoles.","Metrópoles","https://www.metropoles.com/colunas/igor-gadelha/a-expectativa-da-cupula-da-pf-para-a-recriacao-do-ministerio-da-seguranca","","ms_seg"],["Indicados de Motta e Alcolumbre","Lula quer abrir espaço a nomes dos presidentes das Casas no ministério, segundo o blog de Tainá Falcão, na CNN Brasil.","CNN Brasil","https://www.cnnbrasil.com.br/blogs/taina-falcao/politica/cupula-do-congresso-deve-indicar-nomes-para-ministerios-de-lula/","","ministerio_4mandato"]].concat(GIRO);
GIRO = GIRO.filter(function(g){return ["Bolsa abre estável"].indexOf(g[0])<0;}).slice(0,20);
/* Matérias paradas aposentadas na edição das 15h */
["senado","fiscal","israel","dino_6x1","nikolas","ucrania_acordo"].forEach(function(i){ if(S[i]) S[i].velha = true; });
Object.keys(ORDER).forEach(function(k){ ORDER[k] = ORDER[k].filter(function(i){ return !(S[i] && S[i].velha); }); });
/* Edição das 19h */
EDICAO.hora = '19h';
EDICAO.data = 'Sexta, 06 de novembro de 2026';
S.lula_cnpe = {"hora":"6/11","ed":"politica","k":"Política · Governo","t":"Lula diz ter pressa para tirar o Brasil da condição de país em desenvolvimento em quatro anos e promete que \"o pobre não pagará a conta\" do ajuste","sub":"O presidente falou na reunião extraordinária do Conselho Nacional de Política Energética, em Brasília, e citou energia renovável, minerais críticos e terras raras.","resumo":"Em reunião extraordinária do Conselho Nacional de Política Energética (CNPE), no Ministério de Minas e Energia, Lula afirmou nesta sexta (6) que quer, em apenas quatro anos, tirar o Brasil do estágio de país em desenvolvimento, segundo a Agência Brasil. Ele destacou o potencial em energia renovável e minerais críticos, disse que data centers terão de produzir a própria energia e defendeu que o mercado saiba que o ajuste fiscal não recairá sobre os mais pobres.","fundo":[["p","Segundo a Agência Brasil, Lula disse na reunião do CNPE, em Brasília, que tem pressa para levar o país à condição de desenvolvido em quatro anos. Para ele, o Brasil tem vantagens em energia renovável, minerais críticos e terras raras. O presidente citou o avanço do Mapa do Caminho para a transição energética, que enfrentou resistência de países produtores de petróleo na COP30."],["p","Sobre data centers, Lula afirmou que o governo vai exigir que os empreendimentos produzam a própria energia. Ele atribuiu parte dos resultados do governo à articulação política, mesmo sem maioria no Congresso, disse ter assumido com déficit fiscal de 2,8% do PIB e afirmou que a gestão agora trabalha com orçamento superavitário."],["p","Ao falar do endividamento, o presidente disse que a dívida pode financiar ferrovias, estradas, pontes e aeroportos, desde que seja possível pagá-la. Sobre o ajuste fiscal, afirmou: \"A única coisa que ele [o mercado] tem que saber é que o pobre não pagará a conta\". A fala ocorre dois dias antes do pronunciamento em que ele deve tratar de responsabilidade fiscal."]],"fontes":[["Agência Brasil (Lula no CNPE)","https://agenciabrasil.ebc.com.br/politica/noticia/2026-11/lula-quer-levar-brasil-condicao-de-pais-desenvolvido-em-quatro-anos"]]};
S.bolsonaro_wal = {"hora":"6/11","ed":"politica","k":"Política · Justiça","t":"Justiça Federal rejeita ação de improbidade do MPF contra Bolsonaro no caso da ex-secretária \"Wal do Açaí\"","sub":"O MPF pedia o ressarcimento de R$ 280 mil; o juiz diz não haver prova de desvio de verba. O Ministério Público pode recorrer.","resumo":"A 6ª Vara Federal do DF rejeitou a ação de improbidade do Ministério Público Federal contra Jair Bolsonaro, relativa ao período em que ele era deputado federal, segundo a Agência Brasil. O MPF dizia que Walderice Santos da Conceição, a \"Wal do Açaí\", nomeada em 2003 para o gabinete, não exercia a função, e pedia R$ 280 mil. O juiz Rodrigo de Godoy Mendes entendeu que não há demonstração de desvio.","fundo":[["p","A decisão, de quinta (5), foi noticiada pela Agência Brasil nesta sexta (6). A ação do MPF tratava da ex-secretária parlamentar Walderice Santos da Conceição, indicada em fevereiro de 2003 para o gabinete de Bolsonaro e que, segundo o órgão, não exercia o cargo. O MPF pedia o ressarcimento de R$ 280 mil."],["p","Para o juiz Rodrigo de Godoy Mendes, da 6ª Vara Federal no DF, não é possível afirmar que houve desvio da verba parlamentar destinada ao pagamento dela. Os saques em dinheiro se explicariam pelo fato de ela morar na Vila Histórica de Mambucaba, localidade sem agência bancária. O magistrado também considerou comprovado que ela fazia intermediação política para Bolsonaro, em paralelo ao pequeno comércio de açaí. Na decisão, escreveu que \"não há nos autos demonstração de repasse de valores da servidora ao corréu\". O MPF pode recorrer."]],"fontes":[["Agência Brasil (improbidade rejeitada)","https://agenciabrasil.ebc.com.br/justica/noticia/2026-11/justica-federal-rejeita-acao-de-improbidade-contra-bolsonaro"]]};
S.dolar_maxima = {"hora":"6/11","ed":"economia","k":"Economia · Mercado","t":"Dólar fecha a R$ 5,5087, maior valor desde dezembro de 2025, com payroll forte e cautela fiscal; alta de 1,18% na semana","sub":"O índice do dólar global (DXY) subiu 0,76% e o mercado passou a precificar nova alta de juros do Fed em dezembro.","dado":{"n":"R$ 5,5087","l":"Dólar à vista no fechamento de sexta (6), alta de 0,37% · Money Times"},"resumo":"O dólar à vista fechou a sexta (6) a R$ 5,5087, alta de 0,37%, o maior fechamento desde 30 de dezembro de 2025, segundo o Money Times. Na semana, a moeda subiu 1,18%. O payroll americano acima do esperado fortaleceu o dólar no exterior, e a cautela com a política fiscal do governo Lula limitou o alívio do real. A máxima do dia foi R$ 5,5345.","fundo":[["p","Segundo o Money Times, o dólar ensaiou queda no início do pregão e acelerou após o relatório de emprego dos EUA, que superou as projeções (média de 60 mil vagas no Broadcast). O índice DXY, que mede o dólar frente a uma cesta de moedas, subia 0,76%, a 102,31 pontos, por volta das 17h30."],["p","Para Luca Girardi, da Nomad, o payroll reforçou a imagem de um mercado de trabalho resiliente e elevou a precificação de nova alta de juros pelo Fed em dezembro. No cenário doméstico, a cautela com a política fiscal do governo limitou o alívio do real. O fechamento do Ibovespa não foi localizado nas fontes lidas nesta edição."]],"fontes":[["Money Times (dólar fecha no maior nível de 2026)","https://www.moneytimes.com.br/dolar-06-11-2026-davs/"]]};
S.ueno_bank = {"hora":"6/11","ed":"mundo","k":"Mundo · Paraguai","t":"Colapso do Ueno Bank congela contas de cerca de 3 milhões de paraguaios e está na origem da crise que ameaça o governo Peña","sub":"O banco, que guardava cerca de US$ 850 milhões em depósitos públicos e previdenciários, foi liquidado pelo Banco Central na terça (3); oito pessoas tiveram prisão pedida.","resumo":"O Banco Central do Paraguai iniciou na terça (3) a liquidação do Ueno Bank, do Grupo Vázquez, por déficit de solvência, e congelou depósitos de cerca de 3 milhões de clientes, segundo CNN Brasil e Agência Brasil. O banco tinha cerca de US$ 850 milhões em recursos públicos e previdenciários. O presidente Santiago Peña foi acionista do grupo até março de 2025.","fundo":[["p","Segundo a Agência Brasil, o presidente do Banco Central, Carlos Carvallo, renunciou após a liquidação. O Ministério Público pediu a prisão de oito pessoas, entre elas o presidente do Ueno, Juan Manuel Gustale. O banco administra o pagamento de pensões e concentrava cerca de 30% dos depósitos de fundos públicos, estimados em US$ 850 milhões. A oposição acusa o governo por investimentos do Instituto de Previsão Social no banco."],["p","O fundo garantidor pode reembolsar até US$ 38 mil por pessoa. A agência cita a Moody's (via Bloomberg Línea) para dizer que só 30% dos depósitos estavam dentro do limite de garantia, enquanto o Banco Central afirma que 97% dos depositantes estariam totalmente cobertos. A associação Asimcopar disse que duas em cada três transações das grandes redes varejistas passam por contas do Ueno."],["p","Segundo a AFP, reproduzida pelo Jornal de Brasília, o ministro do Interior, Enrique Riera, também renunciou na quinta (5), e oito diretores do banco foram presos. Peña afirmou nas redes que os responsáveis responderão à Justiça e promulgou uma lei para acelerar a devolução do dinheiro aos poupadores."]],"fontes":[["Agência Brasil (renúncia em meio à crise bancária)","https://agenciabrasil.ebc.com.br/internacional/noticia/2026-11/presidente-do-paraguai-renuncia-em-meio-crise-bancaria-vice-assume"],["CNN Brasil (Congresso suspende sessão)","https://www.cnnbrasil.com.br/internacional/congresso-paraguai-renuncia-santiago-pena/"],["Jornal de Brasília (AFP)","https://jornaldebrasilia.com.br/noticias/mundo/senado-do-paraguai-rejeita-pedido-de-pena-e-abre-caminho-para-processo-de-impeachment/"]]};
S.mg_ipva_simoes = {"hora":"6/11","ed":"regioes","reg":"mg","k":"Regiões · Minas Gerais","t":"Projeto de Simões que reduz em até 75% o IPVA ainda não foi lido em plenário na Assembleia de Minas","sub":"A proposta foi protocolada em 16 de outubro e não começou a tramitar; a equipe de Cleitinho diz que a mudança exige estudos de impacto.","resumo":"O projeto do governador Mateus Simões (PSD) que reduz em até 75% a alíquota do IPVA está parado na Assembleia de Minas: protocolado em 16 de outubro, ainda não foi lido em plenário, segundo O Tempo. A Presidência da Casa não explicou o motivo. O governador eleito, Cleitinho (Republicanos), defendeu a redução na campanha, mas sua equipe diz que a mudança deve ser precedida de estudos.","fundo":[["p","Segundo O Tempo, outras propostas enviadas depois, como a PEC 69/2026 sobre recomposição inflacionária de servidores da segurança pública, já foram lidas, e a PEC seguiu à CCJ. O IPVA arrecada cerca de R$ 12 bilhões por ano em Minas. Na justificativa, Simões afirma que a medida permite a Cleitinho cumprir o compromisso de campanha; Simões terminou a eleição em quarto lugar, e Cleitinho venceu no primeiro turno."],["p","O vice-governador eleito, Luís Eduardo Falcão (Republicanos), disse que \"é um direito dele também enviar os projetos para a Assembleia\". A equipe de transição informou que a mudança deverá ser precedida de estudos sobre os impactos financeiros."]],"fontes":[["O Tempo (projeto do IPVA em compasso de espera)","https://otempo.com.br/politica/aparte/2026/11/6/projeto-de-simoes-para-reduzir-ipva-em-minas-esta-em-compasso-de-espera-na-assembleia"]]};
S.ce_aldigueri = {"hora":"6/11","ed":"regioes","reg":"ne","k":"Nordeste · Ceará","t":"Romeu Aldigueri (PSB) pode tentar a reeleição na Assembleia do Ceará, com apoio da base e de parte da oposição; eleição da mesa é em 1º de fevereiro","sub":"A nova bancada terá 26 deputados novos e 20 reeleitos; PSB fica com 13 cadeiras, PT com 12, e a oposição cai de 11 para 9.","resumo":"O presidente da Assembleia Legislativa do Ceará, Romeu Aldigueri (PSB), poderá disputar a recondução para o biênio 2027/2028 na eleição de 1º de fevereiro, segundo O Povo. O cenário ainda é de indefinição, mas o PSD do Ceará defende a continuidade e a deputada Dra. Silvana (PL) também apoia. O grupo governista só deve conversar sobre o tema no fim de dezembro.","fundo":[["p","Segundo O Povo, o presidente do PSD Ceará, Domingos Filho, descartou concorrer e disse que o partido defende a continuidade de Aldigueri. A deputada Dra. Silvana (PL, oposição) afirmou não ver outro nome para o cargo. Zezinho Albuquerque (PP) disse: \"A eleição é só primeiro de fevereiro, vamos conversar sobre o assunto final de dezembro\". Osmar Baquit (PSB) afirmou que \"não é o momento\"."],["p","A nova bancada terá 26 deputados novos e 20 reeleitos. O PSB terá 13 cadeiras e o PT, 12; a oposição cairá de 11 para 9 deputados."]],"fontes":[["O Povo (Aldigueri tem apoio da base à oposição)","https://opovo.com.br/noticias/politica/2026/11/06/aldigueri-tem-apoio-da-base-a-oposicao-mas-ha-indefinicao.html"]]};
S.ce_mpox = {"hora":"6/11","ed":"regioes","reg":"ne","k":"Nordeste · Ceará","t":"Ceará confirma 40 casos de mpox em 2026, 87,5% em Fortaleza; Sobral identifica dois casos","sub":"A Secretaria da Saúde diz que não houve mortes; dois pacientes foram internados e o Ministério da Saúde autorizou até 20 mil doses da vacina.","resumo":"A Secretaria da Saúde do Ceará informou nesta sexta (6) 40 casos confirmados de mpox em 2026, segundo O Povo: 18 em outubro e 17 em novembro. Todos os pacientes são homens de 24 a 51 anos, e 87,5% dos casos estão em Fortaleza. Não houve óbitos, e duas pessoas foram internadas. O Ministério da Saúde autorizou a compra de até 20 mil doses da vacina.","fundo":[["p","Até 5 de novembro foram 113 notificações de suspeita: 35% confirmadas, 60 descartadas, uma encerrada como provável e 12 em investigação. Sobral informou na manhã de sexta ter identificado dois casos. O estado teve 567 confirmações em 2022, 8 em 2023, 25 em 2024 e 13 em 2025, segundo O Povo."],["p","As doses serão adquiridas por meio do Fundo Rotatório da Opas, com prioridade para pessoas que vivem com HIV e têm CD4 abaixo de 100 células/mm³, em esquema de duas doses com intervalo de 28 dias."]],"fontes":[["O Povo (Ceará registra 40 casos de mpox)","https://opovo.com.br/noticias/ceara/2026/11/06/ceara-registra-40-casos-de-mpox-em-2026.html"]]};

S.paraguai.t = "Congresso do Paraguai não aceita a renúncia de Peña, Senado nega prazo e julgamento do impeachment segue; Ministério Público abre investigação contra o presidente";
S.paraguai.sub = "Peña segue formalmente na Presidência. A destituição exige dois terços do Senado, e o resultado final não estava publicado nas fontes lidas.";
S.paraguai.upd = "O Congresso ainda não aceitou a renúncia anunciada na quinta, o Ministério Público abriu investigação formal contra Peña e o ministro do Interior, Enrique Riera, também renunciou.";
S.paraguai.fundo.push(["h","Atualização das 19h: renúncia não aceita e investigação criminal"]);
S.paraguai.fundo.push(["p","Segundo a CartaCapital e a AFP, Peña anunciou na quinta (5) que renunciaria, mas o Congresso não aceitou a saída, e ele segue tecnicamente chefe de Estado. A oposição afirma que a renúncia seria estratégica, para preservar o foro privilegiado de senador vitalício, direito de ex-presidentes no Paraguai que ele perderia com o impeachment. Se a renúncia for aceita, o vice Pedro Alliana (grafado Allana pela Agência Brasil) deve assumir; a Câmara rejeitou abrir processo contra ele, por 48 votos a 30, segundo a CNN Brasil."]);
S.paraguai.fundo.push(["p","A Procuradoria-Geral abriu investigação formal contra Peña por suposto enriquecimento ilícito, lavagem de dinheiro, corrupção, fraude administrativa e tráfico de influência, segundo o Metrópoles; a AFP fala em fatos relativos à supervisão do Ueno Bank e à colocação de fundos públicos nele. O presidente do Senado, Basilio Núñez, disse que a prorrogação foi rejeitada e que o presidente seria convocado. A CartaCapital informou que Peña afirmou que exerceria o direito de defesa. Nas fontes lidas, o resultado da votação não aparece."]);
S.paraguai.fontes.push(["CartaCapital (próximos passos da crise)","https://www.cartacapital.com.br/politica/os-proximos-passos-na-crise-no-paraguai-senado-decide-impeachment-de-santiago-pena-apos-renuncia/"]);
S.paraguai.fontes.push(["Jornal de Brasília (AFP, prorrogação rejeitada)","https://jornaldebrasilia.com.br/noticias/mundo/senado-do-paraguai-rejeita-pedido-de-pena-e-abre-caminho-para-processo-de-impeachment/"]);
S.paraguai.fontes.push(["Metrópoles (Senado nega prorrogação)","https://www.metropoles.com/mundo/senado-do-paraguai-nega-prorrogacao-de-prazo-e-votara-impeachment-de-pena"]);

S.mercado.upd = "O dólar à vista fechou a R$ 5,5087 (+0,37%), maior valor desde 30 de dezembro de 2025, com alta de 1,18% na semana; o fechamento do Ibovespa não foi localizado nas fontes lidas.";
S.mercado.fundo.push(["h","Atualização das 19h: dólar fecha no maior nível do ano"]);
S.mercado.fundo.push(["p","Segundo o Money Times, o dólar à vista encerrou a sexta a R$ 5,5087, com a máxima do dia em R$ 5,5345, depois do payroll americano acima do esperado e com cautela em relação à política fiscal do governo. A semana fechou com alta de 1,18% para a moeda."]);
S.mercado.fontes.push(["Money Times (dólar fecha no maior nível de 2026)","https://www.moneytimes.com.br/dolar-06-11-2026-davs/"]);

S.papa_leao.t = "Papa Leão XIV chega ao Uruguai nesta sexta; no sábado vai a Paysandú e preside vigília no Centenario, e no domingo segue para a Argentina";
S.papa_leao.sub = "É a primeira visita de um papa ao Uruguai em 38 anos. Na Argentina ele fica de 8 a 11 de novembro; o Peru será visitado de 11 a 17.";
S.papa_leao.upd = "A programação divulgada prevê boas-vindas na Plaza Independencia e encontro com o presidente Yamandú Orsi nesta sexta, missa em Paysandú e vigília no Estádio Centenario no sábado, e missa em Florida no domingo.";
S.papa_leao.fundo.push(["h","Atualização das 19h: programação no Uruguai"]);
S.papa_leao.fundo.push(["p","Segundo o Montevideo Portal, com base na programação divulgada em setembro, o papa chega a Montevidéu na sexta, por volta das 16h30, com cerimônia de boas-vindas na Plaza Independencia às 17h30 e reunião privada com o presidente Yamandú Orsi por volta das 18h15. No sábado (7), vai a Paysandú para uma das duas missas, visita a Universidade Católica do Uruguai e preside uma vigília de oração no Estádio Centenario. No domingo (8), vai a Florida, visita o santuário da Virgem dos Trinta e Três, celebra a segunda missa no hipódromo Irineo Leguisamo e segue para Buenos Aires. A visita é a primeira de um papa ao país desde a de João Paulo II, em 1988. O roteiro pode ter sofrido ajustes desde a divulgação."]);
S.papa_leao.fontes.push(["Montevideo Portal (programação no Uruguai)","https://www.montevideo.com.uy/Noticias/Leon-XIV-en-Uruguay-vigilia-en-el-Centenario-dos-misas-y-encuentro-con-Orsi-uc975961"]);

HOME_LEAD = 'paraguai';
HOME_ROW = ['lula_cnpe','dolar_maxima','mg_ipva_simoes'];
ORDER.politica = _mv3(ORDER.politica,['lula_cnpe','bolsonaro_wal']);
ORDER.economia = _mv3(ORDER.economia,['dolar_maxima','mercado']);
ORDER.regioes = _mv3(ORDER.regioes,['mg_ipva_simoes','ce_aldigueri','ce_mpox']);
ORDER.mundo = _mv3(ORDER.mundo,['paraguai','ueno_bank','papa_leao']);
GIRO = [
["Dólar no maior nível do ano","O dólar fechou a R$ 5,5087, o maior valor desde 30 de dezembro de 2025, e subiu 1,18% na semana, segundo o Money Times.","Money Times","https://www.moneytimes.com.br/dolar-06-11-2026-davs/","","dolar_maxima"],
["Lula quer pressa","Lula diz que quer tirar o Brasil da condição de país em desenvolvimento em quatro anos e que o pobre não pagará a conta do ajuste, segundo a Agência Brasil.","Agência Brasil","https://agenciabrasil.ebc.com.br/politica/noticia/2026-11/lula-quer-levar-brasil-condicao-de-pais-desenvolvido-em-quatro-anos","","lula_cnpe"],
["Wal do Açaí","A Justiça Federal rejeitou a ação de improbidade do MPF contra Bolsonaro; o juiz diz que não há demonstração de desvio, e o MPF pode recorrer.","Agência Brasil","https://agenciabrasil.ebc.com.br/justica/noticia/2026-11/justica-federal-rejeita-acao-de-improbidade-contra-bolsonaro","","bolsonaro_wal"],
["Ueno Bank","Cerca de 3 milhões de clientes do Ueno Bank, liquidado na terça, estão com contas congeladas; oito pessoas tiveram prisão pedida, segundo a Agência Brasil.","Agência Brasil","https://agenciabrasil.ebc.com.br/internacional/noticia/2026-11/presidente-do-paraguai-renuncia-em-meio-crise-bancaria-vice-assume","","ueno_bank"],
["IPVA em Minas","O projeto de Simões que reduz o IPVA em até 75% ainda não foi lido em plenário na Assembleia, segundo O Tempo.","O Tempo","https://otempo.com.br/politica/aparte/2026/11/6/projeto-de-simoes-para-reduzir-ipva-em-minas-esta-em-compasso-de-espera-na-assembleia","","mg_ipva_simoes"],
["Mesa da Alece","Romeu Aldigueri (PSB) pode tentar a reeleição na presidência da Assembleia do Ceará; a votação é em 1º de fevereiro, segundo O Povo.","O Povo","https://opovo.com.br/noticias/politica/2026/11/06/aldigueri-tem-apoio-da-base-a-oposicao-mas-ha-indefinicao.html","","ce_aldigueri"]
].concat(GIRO).slice(0,20);
AMANHA = AMANHA.filter(function(a){return a[0].indexOf('Sex, 06/11')!==0;});
AMANHA.push(["Sáb, 07/11","mundo","Papa Leão XIV vai a Paysandú e preside vigília no Estádio Centenario","Segundo a programação divulgada, o papa celebra missa em Paysandú, visita a Universidade Católica e encerra o dia com vigília em Montevidéu. No domingo segue para a Argentina.","https://www.montevideo.com.uy/Noticias/Leon-XIV-en-Uruguay-vigilia-en-el-Centenario-dos-misas-y-encuentro-con-Orsi-uc975961","papa_leao"]);
AMANHA.push(["Dom, 08/11","agenda","Primeiro dia de provas do Enem 2026","O MEC confirmou o exame em dois domingos, 8 e 15 de novembro.","https://www.jornalopcao.com.br/educacao/enem-2026-saiba-como-ira-funcionar-828644/",""]);
AMANHA.push(["Sex, 06/11 a sáb, 07/11","mundo","Senado do Paraguai deve concluir o julgamento de Peña","O Senado rejeitou o prazo extra pedido por Peña e, segundo as fontes lidas, a votação do impeachment poderia ocorrer ainda na sexta; a destituição exige dois terços dos senadores. O resultado não estava publicado nas fontes consultadas.","https://www.metropoles.com/mundo/senado-do-paraguai-nega-prorrogacao-de-prazo-e-votara-impeachment-de-pena","paraguai"]);
(function(){var k=function(a){var m=/(\d{2})\/(\d{2})/.exec(a[0]);return m?m[2]*100+ +m[1]:9999;};AMANHA=AMANHA.map(function(a,i){return [a,i];}).sort(function(x,y){return k(x[0])-k(y[0])||x[1]-y[1];}).map(function(p){return p[0];});})();
/* Matérias paradas aposentadas na edição das 19h */
["bomba_europa","tse_novo","zaporizhzhia","pgdf_master","planalto_pena","janones_live","camisotti","bolsonaros_eua","localiza","sp_chuva","sp_marcola","sul_ana","sul_frente","trump_arco","ira_trump"].forEach(function(i){ if(S[i]) S[i].velha = true; });
Object.keys(ORDER).forEach(function(k){ ORDER[k] = ORDER[k].filter(function(i){ return !(S[i] && S[i].velha); }); });
/* FLAGS (gerado por publicar.js; não editar) */
var FLAGS = {"paraguai":"atualizada","mercado":"atualizada","papa_leao":"atualizada","lula_cnpe":"novo","bolsonaro_wal":"novo","dolar_maxima":"novo","ueno_bank":"novo","mg_ipva_simoes":"novo","ce_aldigueri":"novo","ce_mpox":"novo"};
var GIRO_FLAGS = {"Dólar no maior nível do ano":"novo","Lula quer pressa":"novo","Wal do Açaí":"novo","Ueno Bank":"novo","IPVA em Minas":"novo","Mesa da Alece":"novo"};
/* ===== FIM DOS DADOS ===== */
