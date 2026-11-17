# Acesso simples por e-mail

Fluxo da cliente: informar e-mail > receber uma mensagem > tocar em Abrir meu app > entrar. Não há senha, primeiro cadastro ou confirmação em outra mensagem. A sessão fica no navegador; se sair ou o link já tiver sido usado, pode solicitar um novo.

## Implementado
- Supabase Auth signInWithOtp, envio padrão de link, criação automática da conta no primeiro acesso.
- Tratamento de link expirado, reenvio com espera de 60 segundos e correção do e-mail.
- Template visual azul-marinho/laranja com um único botão em supabase/templates/acesso.html.
- Dados e arquivos continuam privados por usuário, mesmo quando a página de entrada for pública.

## Configuração necessária no Supabase
1. Authentication > URL Configuration: Site URL https://dever-outro-nivel-previa.larissa7288.chatgpt.site ; incluir o mesmo endereço com / nos redirects permitidos.
2. Authentication > Email Templates: usar o arquivo acesso.html nos templates Magic Link, Confirm signup e Invite. Assunto sugerido: Seu acesso ao Dever de Outro Nível. Não substituir ConfirmationURL por um endereço fixo: o token individual é necessário para autenticar a cliente.
3. Authentication > SMTP: configurar o serviço de envio e um remetente autorizado. O SMTP padrão só envia para membros da organização e não serve para enviar a clientes externas.
4. Autorizar página de entrada acessível sem login ChatGPT no Site, mantendo a autenticação do aplicativo. Até essa autorização, a barreira de acesso privada do Site continua existindo.
5. Testar recebimento com e-mail externo, clicar no botão e confirmar que o histórico de outra conta não aparece.

Não é necessário desligar a proteção de propriedade do e-mail: o próprio clique no link autentica a conta.

## Entrega após compra
Este ajuste permite solicitar o link na entrada do app. Enviar o primeiro link automaticamente após uma compra depende de integração com a plataforma de pagamento e validação do evento de compra, ainda não implementadas. Não usar e-mail fornecido pelo navegador como prova de pagamento. O teste atual não tem controle de compra/licença.

Referências oficiais: https://supabase.com/docs/guides/auth/auth-email-passwordless e https://supabase.com/docs/guides/auth/auth-smtp .
