# Recuperação individual de acesso da proprietária

Alternativa temporária para testar o aplicativo enquanto o envio de e-mails está limitado. Não substitui a configuração de e-mail para as compradoras.

- Ticket aleatório de 256 bits entregue individualmente à proprietária. O banco guarda apenas SHA-256.
- Expiração curta, no máximo uma hora por restrição no banco. Uso único e resgate atômico.
- Só pode autenticar `larissasc.marques@gmail.com`, com licença ativa; não cria licença, conta ou permissão.
- O navegador remove o ticket da barra de endereço antes de enviá-lo por POST HTTPS.
- O servidor valida o ticket e gera uma credencial de autenticação pelo Supabase Admin. A chave administrativa nunca vai ao navegador.
- O cliente verifica a credencial pelo SDK e salva uma sessão normal do Supabase, com atualização automática.
- Respostas não são armazenadas em cache. Não registrar tickets, credenciais ou sessões em logs.
- A emissão de tickets fica restrita à administração do banco. Não existe API pública de emissão por e-mail.
- Repetição, validade, privilégios e montagem duplicada foram testados. Um ticket usado não deve ser reenviado.

Arquivos: `supabase/patches/owner_recovery_tickets.sql`, `supabase/functions/don-redeem-access/index.ts`, `src/services/directAccess.ts`.
