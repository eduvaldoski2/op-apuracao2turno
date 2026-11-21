# Radar Oficina Política para o Gabinete Tatiana Roque

Destaques dos Diários Oficiais da Câmara e Município e a agenda do dia.
Endereço: `oficinapolitica.com.br/gabinetetatianaroque`

## Como funciona

1. **Coleta** (`.github/workflows/gabinete.yml` + `scripts/gabinete/`): às 05h50 (Brasília) o GitHub Actions
   confere o DCM, o D.O. Rio, a Ordem do Dia e a agenda da Câmara. Se ainda não saíram, repete a cada 5 min até as 09h.
   Reforços às 12h30 e 18h30 (cadernos/suplementos tardios). Grava JSON no branch `gabinete-dados`.
2. **Site** (PHP + SQLite): sincroniza o branch `gabinete-dados` (sem deploy) e monta o boletim aplicando as listas do
   mandato (PLs, temas, áreas) e as orientações de voto cadastradas na administração.
3. **E-mail das 7h**: cron do Hostinger, um e-mail por usuário autorizado, pelo remetente da Oficina Política.

## Colocar no ar (uma vez)

1. Fazer o merge do branch `gabinete-radar` em `main` (o Hostinger publica sozinho).
2. No GitHub, rodar o workflow **Radar do Gabinete…** manualmente (Run workflow) para criar o branch `gabinete-dados`.
   Conferir `ultimo-log.txt` no branch: ali aparece se os sites da Câmara e da Prefeitura responderam.
3. No hPanel da Hostinger, criar o cron (a cada 5 min, de seg. a sex., 7h–9h):
   `*/5 7-9 * * 1-5 php /home/USUARIO/public_html/gabinetetatianaroque/cron/enviar.php`
   Teste: `php .../cron/enviar.php --seco` (não envia) e `--teste=seu@email` (envia só para você).
4. Entrar em `/gabinetetatianaroque/admin.php` com o token de administrador (`$TOKEN_ADMIN` de `api/config.php`),
   autorizar o primeiro administrador e depois os demais usuários (todos precisam da conta normal da Oficina Política).

## Regras de envio

- Envia depois das 07h assim que DCM e D.O. estiverem prontos; às 09h30 envia com o que houver (e avisa o que faltou).
- Fins de semana e feriados (nacionais e do Rio) sem expediente: sem e-mail, a menos que haja edição extraordinária.
- Cada usuário recebe no máximo um e-mail por dia; o descadastro é por link no próprio e-mail.

## Administração

- **Usuários**: caixas para ver o boletim, orientar votos, administrar e receber o e-mail das 7h.
- **Ordem do Dia**: orientação de voto (sim, não, abstenção, verificar orientação de bancada) com comentário.
- **PLs e medidas** a acompanhar, **temas de interesse** (um termo por linha) e **áreas temáticas**.
