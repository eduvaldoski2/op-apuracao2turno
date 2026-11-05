<?php if (!defined('RADAR_OK')) { http_response_code(404); exit; } ?>
/* ===== DADOS DA EDIÇÃO (trocar este bloco a cada atualização) ===== */
var EDICAO = {hora:'03h', data:'Quinta, 05 de novembro de 2026'};
var ED = [
 {id:'politica', nome:'Política'},
 {id:'economia', nome:'Economia'},
 {id:'regioes',  nome:'Regiões', subs:[['rj','Rio de Janeiro'],['sp','São Paulo'],['mg','Minas Gerais'],['ne','Nordeste'],['sul','Sul'],['norte','Norte'],['co','Centro-Oeste']]},
 {id:'mundo',    nome:'Mundo'}
];
var S = {};

S.flavio = {ed:'politica', k:'Política', hora:'4/11',
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
  ['h','O que vem a seguir'],
  ['p','Dois pontos seguem abertos: o resultado da análise da assessoria técnica do Senado e eventuais decisões de Moraes sobre os pedidos do PT. Nas matérias consultadas, não havia decisão sobre nenhum dos dois.']],
 fontes:[['Metrópoles (Igor Gadelha)','https://www.metropoles.com/colunas/igor-gadelha/em-aceno-a-direita-alcolumbre-indica-que-protegera-mandato-de-flavio'],['Plantão Brasil','https://www.plantaobrasil.net/noticias/161854-randolfe-contesta-voto-de-flavio-bolsonaro-apos-viagem-nao-comunicada-aos-eua'],['Brasil 247','https://www.brasil247.com/brasil/randolfe-pede-anulacao-de-voto-de-flavio-bolsonaro-no-senado-apos-fuga-para-os-eua/'],['Senado Notícias','https://www12.senado.leg.br/noticias/materias/2026/11/04/davi-vai-analisar-questoes-de-randolfe-sobre-situacao-de-flavio-bolsonaro'],['Gazeta do Povo','https://www.gazetadopovo.com.br/republica/lula-chama-viagem-de-flavio-de-vergonhosa-e-lembra-da-propria-prisao-na-lava-jato/'],['Movimento Econômico','https://movimentoeconomico.com.br/politica/2026/10/28/de-miami-flavio-se-diz-verdadeiro-presidente-eleito-e-promete-guiar-oposicao/'],['Metrópoles (Manoela Alcântara)','https://www.metropoles.com/colunas/manoela-alcantara/mendonca-encerra-processo-sobre-desafio-de-lula-e-flavio-para-abrir-sigilos']]};

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

S.pronunciamento = {ed:'politica', k:'Política', hora:'4/11',
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
  ['h','O que ainda não se sabe'],
  ['p','O texto do pronunciamento não foi divulgado, e o conteúdo descrito vem de apuração de bastidores. Veículos de linhas editoriais distintas interpretam a gravação de modo diferente. A apuração atribuída à Folha descreve um discurso que busca alinhar a gestão econômica às expectativas do mercado, enquanto o Blog do BG, crítico ao governo, vê a fala como tentativa de acalmar investidores diante das contas públicas, sem apresentar números.'],
  ['p','O mercado deve medir a recepção do discurso já na segunda-feira (9). Nas reportagens consultadas, não há indicação de metas, medidas ou prazos para o ajuste fiscal.']],
 fontes:[['ICL Notícias (via Plantão Brasil)','https://www.plantaobrasil.net/noticias/161828-em-primeiro-pronunciamento-apos-reeleicao-lula-deve-reforcar-compromisso-com-responsabilidade-fiscal'],['Jornal de Brasília','https://jornaldebrasilia.com.br/noticias/politica-e-poder/lula-grava-pronunciamento-sobre-ajuste-fiscal-e-pacificacao-nacional/'],['Tribuna do Sertão','https://www.tribunadosertao.com.br/financas/2026/11/04/1013525-lula-dara-recado-sobre-contas-publicas-em-pronunciamento-na-tv'],['Brasil 247 (Santander)','https://www.brasil247.com/economia/presidente-do-santander-diz-que-lula-deu-demonstracoes-importantissimas-de-confianca-para-os-mercados/'],['g1 (Copom)','https://g1.globo.com/economia/noticia/2026/11/04/copom-mantem-taxa-basica-de-juros-da-economia-em-1375percent-ao-ano.ghtml']]};

S.pec = {ed:'politica', k:'Política', hora:'3/11',
 t:'Senado aprova PEC da Segurança Pública sem voto contrário; texto vai à promulgação',
 sub:'Foram 73 votos no primeiro turno e 75 no segundo. A redução da maioridade penal ficou de fora, por 38 a 36.',
 dado:{n:'73 × 0', l:'1º turno no Senado · no 2º turno, 75 votos favoráveis e nenhum contrário'},
 resumo:'O Senado aprovou na terça (3) a PEC da Segurança Pública, com 73 votos no primeiro turno e 75 no segundo, sem voto contrário. O texto põe o Susp na Constituição, endurece regras para chefes de facções e milícias e autoriza polícias municipais. A redução da maioridade penal foi separada por 38 votos a 36. A promulgação ainda não tem data.',
 fundo:[
  ['p','O Senado aprovou na terça-feira (3) a PEC da Segurança Pública (PEC 18/2025), com 73 votos favoráveis no primeiro turno e 75 no segundo, sem nenhum voto contrário. A proposta foi apresentada pelo governo Lula em 2025 e aprovada pela Câmara em março deste ano, em segundo turno, por 461 votos a 14, segundo o Sou Brasília. O texto segue para promulgação pelo Congresso, sem data informada.'],
  ['p','A votação foi acelerada: a Comissão de Constituição e Justiça aprovou o texto em 14 de outubro, e o calendário juntou os dois turnos num único dia. Em votações anteriores no plenário, os senadores separaram, por 38 votos a 36, as emendas sobre redução da maioridade penal, que passam a tramitar de forma autônoma. Os 18 anos seguem, por ora, como idade de responsabilização penal. Foi nessas votações que Randolfe Rodrigues contestou o voto remoto de Flávio Bolsonaro.'],
  ['h','O que muda'],
  ['ul',[
   'Susp: o Sistema Único de Segurança Pública entra na Constituição, com regras de integração entre União, estados e municípios, operações conjuntas e compartilhamento de informações e inteligência.',
   'Facções e milícias: tratamento diferenciado conforme a posição na estrutura criminosa, cumprimento de pena em unidades de segurança máxima, restrição à progressão de regime e a benefícios penais, e mecanismos de confisco de patrimônio.',
   'Polícia Federal: competência ampliada para investigar organizações criminosas e milícias com repercussão interestadual ou internacional. As polícias estaduais mantêm as atribuições.',
   'Polícia Rodoviária Federal: passa a atuar também em ferrovias e hidrovias federais.',
   'Polícias municipais: autorização para criar polícias municipais de natureza civil, voltadas ao policiamento ostensivo e comunitário, desde que cumpridos requisitos de formação, fiscalização e capacidade financeira.',
   'Dinheiro: reforço do Fundo Nacional de Segurança Pública e do Fundo Penitenciário Nacional, com 10% do superávit financeiro do Fundo Social destinados à segurança. O relator, Rogério Carvalho (PT-SE), retirou a ideia de destinar 30% da arrecadação das apostas esportivas.',
   'Garantia da Lei e da Ordem: emenda do senador Carlos Portinho (PL-RJ) permite ressarcir as Forças Armadas, com recursos do Fundo Nacional de Segurança Pública, por despesas em operações de GLO.']],
  ['h','Efeito no Rio e nas cidades'],
  ['p','Para o Rio, onde o combate a facções e milícias é um dos principais desafios, o Tempo Real RJ avalia que as mudanças poderão ampliar as possibilidades jurídicas e institucionais de cooperação entre as polícias estaduais, a PF e outras forças, mas que os efeitos práticos dependem de regulamentação, recursos e implementação pelos entes federados.'],
  ['p','O efeito já aparece nas prefeituras. Segundo o Metrópoles, o prefeito de São Paulo, Ricardo Nunes, aproveita a PEC para renomear a Guarda Civil Metropolitana como Polícia Municipal, e um projeto em Belo Horizonte propõe transformar a Guarda Municipal em Polícia Municipal. No Congresso, a Câmara aprovou pena de até cinco anos para quem usar drones para sobrevoar presídios.'],
  ['h','A moldura política'],
  ['p','A aprovação vem nove dias depois do segundo turno presidencial, em que o crime organizado foi tema central da campanha. Lula havia dito que criaria um Ministério da Segurança Pública depois da aprovação da PEC, segundo o Correio da Manhã. A votação sem voto contrário contrasta com o clima de polarização, mas houve disputa nas votações que separaram trechos do texto, como a da maioridade penal.'],
  ['h','O que vem a seguir'],
  ['p','Faltam a data da promulgação, a tramitação autônoma das emendas sobre maioridade penal, a regulamentação das polícias municipais e os primeiros repasses dos fundos. Também está em aberto a criação do Ministério da Segurança Pública, anunciada por Lula.']],
 fontes:[['Tempo Real RJ','https://temporealrj.com/aprovacao-da-pec-da-seguranca-publica-no-congresso/'],['Correio da Manhã','https://www.correiodamanha.com.br/politica/2026/10/327150-senado-acelera-votacao-da-pec-da-seguranca-e-pode-aprovar-texto-antes-do-segundo-turno.html'],['Sou Brasília','https://soubrasilia.com/camara-aprova-pec-da-seguranca-publica-em-segundo-turno-por-461-votos-a-14/'],['Plantão Brasil','https://www.plantaobrasil.net/noticias/161854-randolfe-contesta-voto-de-flavio-bolsonaro-apos-viagem-nao-comunicada-aos-eua'],['Metrópoles','']]};

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


S.copom = {ed:'economia', k:'Economia', hora:'4/11',
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
  ['h','O que vem a seguir'],
  ['p','O pronunciamento de Lula, gravado nesta quinta e previsto para domingo, deve tratar de responsabilidade fiscal. O Boletim Focus das próximas segundas-feiras mostrará se as expectativas para 2026 e 2027 recuam. Nas matérias consultadas, o comunicado não detalha sinais para a próxima reunião do Copom.']],
 fontes:[['g1 (Copom)','https://g1.globo.com/economia/noticia/2026/11/04/copom-mantem-taxa-basica-de-juros-da-economia-em-1375percent-ao-ano.ghtml'],['O Tempo','https://www.otempo.com.br/economia/2026/11/4/copom-mantem-taxa-selic-em-13-75-e-interrompe-sequencia-de-cortes'],['Brasil 247 (Santander)','https://www.brasil247.com/economia/presidente-do-santander-diz-que-lula-deu-demonstracoes-importantissimas-de-confianca-para-os-mercados/'],['Metrópoles',''],['Folha de S.Paulo',''],['O Globo','']]};

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

S.transicao = {ed:'regioes', reg:'rj', k:'Regiões · Rio de Janeiro', hora:'3/11',
 t:'Ruas anuncia secretariado e tenta equilibrar base na Alerj, centrão e relação com Lula',
 sub:'Governador eleito toma posse em janeiro. Aliados querem mais autonomia em relação a Flávio e diálogo com o Planalto.',
 resumo:'O governador eleito do Rio, Douglas Ruas (PL), anunciou nomes do secretariado: Maria Gabriela Bessa na Casa Civil, Anderson Monteze no Planejamento e a vice, Fernanda Louback, na pasta da Mulher. O PL quer reunir cerca de 40 dos 70 deputados da Alerj, e aliados defendem que ele mantenha diálogo com Lula para atrair investimentos federais.',
 fundo:[
  ['p','O governador eleito do Rio, Douglas Ruas (PL), anunciou na terça-feira (3), na sede da Firjan, no Centro, novos nomes do secretariado que assumirá em janeiro. Segundo o Tempo Real RJ, Maria Gabriela Bessa, atual secretária das Cidades e coordenadora da transição, ficará com a Casa Civil e Governança, e Anderson Monteze, que atua na área de Orçamento e Finanças da Alerj, com Planejamento, Gestão e Inovação. A vice-governadora eleita, Fernanda Louback (PL), ficará à frente da Secretaria de Políticas Inclusivas e da Mulher.'],
  ['p','O Diário do Rio informa que Jair Bittencourt (PL), deputado estadual com quatro mandatos e base no Noroeste Fluminense, foi convidado para a Secretaria de Governo, responsável pela articulação com a Assembleia. O nome de Fábio Araújo, o Fabinho, é citado para a chefia de gabinete, e Bruno Bonetti (PL), presidente municipal do partido no Rio, é cotado para a área de comunicação e relações institucionais. Para a Saúde, segundo o Tempo Real RJ, foi convidado o presidente do Cremerj, Antônio Braga, mas a indicação ainda não foi confirmada. A Secretaria de Segurança segue sem titular definido.'],
  ['h','A conta da Alerj'],
  ['p','O Diário do Rio informa que o PL elegeu 21 deputados estaduais e quer reunir cerca de 40 dos 70 integrantes da Alerj, o que daria folga para eleger a Mesa Diretora e aprovar projetos do Executivo. O primeiro passo é a aliança com a federação União Brasil-PP, que tem nove cadeiras, e o partido projeta 31 votos com a federação. Nove deputados independentes estariam em conversa, o que levaria o grupo a 40, mas as adesões dependem de acordos. As contas do jornal não fecham exatamente: a federação aparece com nove cadeiras, mas a projeção soma dez.'],
  ['p','Em 28 de outubro, Ruas confirmou o deputado Anderson Moraes (PL) como candidato do governo à presidência da Alerj, cuja eleição ocorre com a nova legislatura, em fevereiro de 2027. Ele precisa deixar a Assembleia, que hoje preside, para assumir o governo. União Brasil, PP, Republicanos e MDB negociam espaço na futura gestão, segundo o jornal, e o nome de André Ceciliano (PT) foi citado como possível candidato ao comando da Casa.'],
  ['h','Autonomia em relação a Flávio, diálogo com Lula'],
  ['p','Depois da derrota de Flávio Bolsonaro na eleição presidencial, aliados de Ruas defendem que ele escolha os secretários com autonomia e preserve uma relação de trabalho com o governo Lula, para garantir recursos federais, segundo o Diário do Rio. Entre os projetos que dependem de dinheiro de Brasília estão um metrô ligando Rio, Niterói e São Gonçalo, possivelmente com parcerias público-privadas, obras viárias e de ônibus na Baixada Fluminense, unidades de saúde no interior e a conclusão do hospital do câncer de Nova Friburgo.'],
  ['p','Ruas diz que se dá bem com todas as correntes políticas e que tratará o governo federal de forma institucional, mas afirma que continuará leal a Flávio, a quem chama de liderança com a qual sempre esteve. O PL quer manter canais abertos com Brasília porque Lula fica no cargo até 2030 e o partido segue como principal força de oposição, segundo a reportagem. O deputado federal Altineu Côrtes, presidente estadual do PL, atua como conselheiro na montagem do gabinete, mas descartou assumir cargo no Executivo, conforme O Globo, citado pelo Diário do Rio.'],
  ['p','A reportagem registra ainda que Ruas propôs acabar com a independência das secretarias de Polícia Civil e Polícia Militar, que passariam a responder à Segurança Pública. A transição também prepara o estado para eventos climáticos extremos ligados ao El Niño, com atualização de dados de risco de enchentes e revisão de investimentos em prevenção.'],
  ['h','TCE e governo em exercício'],
  ['p','O Globo informa que Flávio Bolsonaro pode indicar seu ex-advogado Victor Gramado Alves a uma das vagas de conselheiro do Tribunal de Contas do Estado. Uma vaga foi aberta com a condenação de Domingos Brazão pelo STF, e outras duas dependem de decisões do STJ. As indicações são feitas pela Assembleia.'],
  ['p','Enquanto isso, o governo estadual segue sob o governador em exercício, Ricardo Couto. O Diário Oficial desta quarta publicou 16 nomeações, 11 exonerações, duas dispensas e duas designações, segundo o Tempo Real RJ, entre elas quatro nomeações na Subsecretaria de Políticas Inclusivas da Secretaria da Mulher, atos assinados pela gestão atual, e não pela equipe eleita. A posse de Ruas está marcada para 6 de janeiro de 2027.']],
 fontes:[['Diário do Rio (secretariado)','https://diariodorio.com/politica/2026/11/02/douglas-ruas-anuncia-novos-secretarios-nesta-terca-feira-veja-os-nomes-cotados.html'],['Diário do Rio (Alerj)','https://diariodorio.com/politica/2026/10/28/douglas-ruas-confirma-anderson-moraes-para-presidencia-da-alerj-e-jair-bittencourt-para-secretaria-de-governo.html'],['Diário do Rio (autonomia)','https://diariodorio.com/politica/2026/10/27/aliados-querem-douglas-ruas-mais-independente-de-flavio-bolsonaro-e-com-dialogo-com-lula-ruas-para-o-governo-do-rio.html'],['Tempo Real RJ','https://temporealrj.com/nomeacoes-cargos-governo-estado-secretaria-mulher/'],['O Globo','']]};

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

var HOME_LEAD = 'fuga';
var HOME_ROW  = ['congresso','ministerio','imprensa'];
var ORDER = {
 politica: ['fuga','flavio','congresso','senado','ldo','ministerio','pec','pronunciamento','desinfo','bets'],
 economia: ['copom','fiscal','seletivo'],
 regioes:  ['paes','sp','mg','ne','sul','norte','co','transicao','guandu','novoguandu','pj','prefeitura','light','reis'],
 mundo:    ['imprensa','eua','argentina']
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
 ['Alcolumbre e Flávio','Segundo bolsonaristas ouvidos pelo Metrópoles, o presidente do Senado não dará andamento a pedidos de cassação de Flávio. A bancada diz que não votará nele em fevereiro.','Metrópoles (Igor Gadelha)','https://www.metropoles.com/colunas/igor-gadelha/em-aceno-a-direita-alcolumbre-indica-que-protegera-mandato-de-flavio','','flavio'],
 ['Sigilos','O ministro André Mendonça encerrou o processo sobre o desafio de Lula e Flávio para abrir os sigilos de ambos, segundo a coluna de Manoela Alcântara.','Metrópoles (Manoela Alcântara)','https://www.metropoles.com/colunas/manoela-alcantara/mendonca-encerra-processo-sobre-desafio-de-lula-e-flavio-para-abrir-sigilos','O processo tratava do desafio mútuo de Lula e Flávio Bolsonaro para tornar públicos os respectivos sigilos. A coluna registra que Mendonça o encerrou, sem detalhar na chamada os fundamentos da decisão.',''],
 ['Mendonça e a Hapvida','Evento organizado por instituto fundado pelo ministro do STF reuniu empresários e lobistas antes de decisões favoráveis à Hapvida, segundo a Agência Pública.','Agência Pública','https://apublica.org/2026/10/mendonca-vota-a-favor-da-hapvida-apos-evento-na-alemanha/','',''],
 ['PSB e a reeleição de Alcolumbre','O PSB abriu diálogo com Alcolumbre sobre apoio à reeleição no Senado, afirma Renato Casagrande.','Brasil 247','https://www.brasil247.com/brasil/psb-abre-dialogo-com-alcolumbre-sobre-apoio-a-reeleicao-no-senado-afirma-casagrande/','','senado'],
 ['Edinho e o centrão','Lula delegou a Edinho Silva o contato com o centrão, a começar pelo MDB. O presidente do PT também busca União Brasil e PP.','Blog do Magno','https://blogdomagno.com.br/lula-delega-contato-com-centrao-a-edinho-que-inicia-conversas-pelo-mdb','O governo precisa formar base no Congresso para os próximos quatro anos. Segundo as reportagens, a interlocução com o centrão começa pelo MDB e passa por União Brasil e PP, que formam a federação União Progressista, hoje alinhada a Alcolumbre na disputa pelo Senado.','congresso'],
 ['Marinho e a Câmara','O PL colocou Rogério Marinho (PL-RN) na disputa pelo Senado e se divide sobre lançar candidato na Câmara, segundo o g1.','g1','https://g1.globo.com/politica/noticia/2026/11/04/com-marinho-na-disputa-a-presidencia-do-senado-pl-se-divide-sobre-lancar-nome-para-camara.ghtml','','congresso'],
 ['Polícia municipal','Ricardo Nunes aproveita a PEC da Segurança para renomear a GCM de São Paulo como Polícia Municipal, e um projeto em Belo Horizonte propõe o mesmo para a Guarda.','Metrópoles','','','pec'],
 ['Emprego','O Caged contabilizou 121 mil vagas formais em setembro, segundo o Metrópoles.','Metrópoles','','O mercado de trabalho segue resiliente, mas com sinais de desaquecimento na margem, segundo o comunicado do Copom desta quarta.','copom'],
 ['Meta e os EUA','Bernie Sanders e outros 12 deputados americanos cobram a Meta por tratamento desigual a Lula, segundo a Agência Pública.','Agência Pública','https://apublica.org/2026/10/parlamentares-dos-eua-cobram-meta-por-tratamento-desigual-a-lula/','','desinfo'],
 ['Cleitinho e o TCE','O Tribunal de Contas de Minas suspendeu R$ 32 milhões em patrocínios a clubes mineiros depois de ação do senador Cleitinho, segundo o Brasil 247.','Brasil 247','https://www.brasil247.com/sudeste/tce-suspende-r-32-milhoes-em-patrocinios-a-clubes-de-minas-apos-acao-de-cleitinho/','','mg']
];

/* Em debate nas redes: só com link. [título, texto, url, id relacionado] */
var TRENDS = [];

/* Colunas e análises, exibidas dentro das editorias: [autor, veículo, título, nota, url, id relacionado, editoria] */
var COLUNAS = [
 ['Igor Gadelha','Metrópoles','Em aceno à direita, Alcolumbre indica que protegerá mandato de Flávio','Bolsonaristas ouvidos nos bastidores avaliam que o presidente do Senado não dará andamento a pedidos de cassação, e a coluna liga o gesto à disputa pelo comando da Casa em fevereiro.','https://www.metropoles.com/colunas/igor-gadelha/em-aceno-a-direita-alcolumbre-indica-que-protegera-mandato-de-flavio','flavio','politica'],
 ['Andrea DiP','Agência Pública','Um beijo em uma mulher trans','Análise do gesto de Lula com a deputada Erika Hilton durante a comemoração da vitória.','https://apublica.org/2026/10/lula-erika-hilton-um-beijo-em-uma-mulher-trans/','desinfo','politica'],
 ['Blogs 247','Brasil 247','Com a humilhação histórica de Trump nas urnas, os dias dos Bolsonaros nos EUA estão contados','Texto de opinião, sem autor identificado na página, argumenta que a derrota de Trump encurtará a permanência da família Bolsonaro nos Estados Unidos.','https://www.brasil247.com/blog/com-a-humilhacao-historica-de-trump-nas-urnas-os-dias-dos-bolsonaros-nos-eua-estao-contados/','fuga','politica'],
 ['Adriana Fernandes','Folha de S.Paulo','A cruzada contra juros altos e o ajuste fiscal','Para a colunista, a cruzada contra juros altos não muda a necessidade de ajuste nas contas públicas.','','copom','economia'],
 ['Reinaldo Azevedo','Metrópoles','Segundo turno no Rio e o debate sobre os juros','O colunista sustenta que a Constituição exigiria segundo turno no Rio, porque ninguém teria alcançado a maioria dos votos, e compara o debate sobre juros a um dogma, com o economista Lara Resende no papel de “herege”.','','paes','regioes']
];
/* ===== FIM DOS DADOS ===== */
