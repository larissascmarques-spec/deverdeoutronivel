# Acesso por compra e link de e-mail

O aplicativo usa link individual do Supabase Auth: a cliente clica e entra, sem senha e sem uma segunda confirmação de cadastro. A sessão fica no navegador. Pedir outro link exige o e-mail da compra.

## Implementado e aplicado
- Licenças em `don_private.access_grants`, sem escrita ou leitura direta pelo navegador.
- Restrição adicional em atividades, catálogo, gabaritos e Storage. O isolamento entre proprietárias permanece.
- A tela confirma a licença no servidor antes de abrir o aplicativo. Não confiar em user_metadata.
- `don-access-link` envia apenas a endereços com licença ativa, com intervalo mínimo de 60 segundos por endereço.
- `don-generate` e `don-ai-connection` confirmam licença no servidor. O worker reconfirma antes de cada etapa que usa IA.
- Downloads assinados expiram em cinco minutos. Um link já emitido pode funcionar até expirar; um arquivo já baixado não pode ser revogado.
- `don-purchase-webhook` valida `X-HOTMART-HOTTOK` e o ID exato do produto. Aprovação libera; reembolso/chargeback revogam. Eventos repetidos não duplicam licenças e aprovações atrasadas não desfazem reembolsos.
- A licença da proprietária foi preservada para teste. Nenhuma cliente foi cadastrada como compradora fictícia.

## Configurações externas pendentes
1. Supabase Authentication > URL Configuration: Site URL `https://dever-outro-nivel-previa.larissa7288.chatgpt.site`; permitir a mesma URL com `/` nos Redirect URLs.
2. Aplicar `supabase/templates/acesso.html` nos modelos Magic Link e Confirm signup. Assunto: Seu acesso ao Dever de Outro Nível. Preservar `{{ .ConfirmationURL }}`.
3. Configurar SMTP de remetente autorizado. O serviço padrão do Supabase não atende clientes externas à organização. Não foi fornecido um remetente/serviço de envio.
4. Em Edge Functions > Secrets: definir `HOTMART_HOTTOK` (segredo da conta Hotmart) e `HOTMART_PRODUCT_ID` (ID do produto correto). Nunca incluir no frontend ou Git.
5. Na Hotmart, registrar a URL `https://sgvdevfcdmhrqnvcvjwp.supabase.co/functions/v1/don-purchase-webhook` para os eventos PURCHASE_APPROVED, PURCHASE_COMPLETE, PURCHASE_REFUNDED e PURCHASE_CHARGEBACK, versão 2.0.
6. Testar pagamento real ou evento de teste autorizado, recebimento em e-mail externo, clique no link e geração de uma folha com a chave da cliente.

Sem token/ID, o webhook responde 503 e não libera acesso. Se o envio falhar após registrar a compra, responde 503 para que a Hotmart repita; a licença fica salva sem duplicação. Entregas simultâneas podem gerar e-mails repetidos após falha de rede, mas não duplicam licenças ou cobranças.

## Verificação desta alteração
Build, TypeScript das funções, testes do gerador/PDF, testes do filtro e token do webhook e teste SQL transacional de licenciamento, RLS, privilégios, repetição, cooldown e reembolso. Testes SQL revertidos. Não houve envio real de mensagem nem chamada paga de IA nesta alteração.

Referências: https://supabase.com/docs/guides/auth/auth-email-passwordless ; https://supabase.com/docs/guides/auth/auth-smtp ; https://developers.hotmart.com/docs/pt-BR/2.0.0/webhook/purchase-webhook/
