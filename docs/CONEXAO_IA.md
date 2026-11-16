# Conexão de IA — preparação no servidor

Foi publicada a Edge Function don-ai-connection no projeto sgvdevfcdmhrqnvcvjwp. Ela exige JWT e identidade administrativa em app_metadata.dever_admin=true. A marcação não pode vir de user_metadata. GET apresenta o estado da configuração; POST com action=check_connection confere acesso aos modelos configurados sem gerar material. Origem permitida: a prévia atual do aplicativo. Nenhuma chave ou erro bruto do provedor é retornado.

O módulo openai.ts contém os adaptadores de Responses com JSON estruturado e de edição de imagem com referência. Não é um pipeline completo: os métodos de geração não estão expostos neste endpoint e não são chamados pela interface.

## Configuração pendente

A proprietária deve criar uma chave de projeto/serviço na plataforma de API da OpenAI e guardá-la diretamente em Supabase > Edge Functions > Secrets como OPENAI_API_KEY. Definir modelos via OPENAI_TEXT_MODEL e OPENAI_IMAGE_MODEL após conferir acesso e preços. Declarar o orçamento autorizado em DON_APPROVED_BUDGET_USD. Essa variável é uma declaração de configuração, NÃO um contador ou teto automático de despesas.

Não há credencial de IA no repositório ou no ambiente da prévia. Nenhuma geração paga foi executada durante esta preparação. A assinatura ChatGPT e o uso da plataforma de API têm faturamentos separados.

## Antes de liberar o botão de geração real

Implementar controle transacional de cotas e reservas de custo, idempotência, login/acesso das clientes, fila e worker, conferência das habilidades para promoção do catálogo importado, geração textual + gabarito, segunda revisão, geração da página ilustrada usando a referência, inspeção da página efetiva, PDFs e Storage privado. Somente depois desses testes habilitar don_generation_policies.generation_enabled. O estado permanece false, inclusive após uma verificação de conexão bem-sucedida.

As 488 habilidades importadas continuam com associações curriculares NÃO VERIFICADAS; don_bncc_skills está vazio. Nenhuma conferência de credencial pode ser apresentada como aprovação pedagógica.

## Validação realizada

Deploy do código no Supabase e leitura de conferência dos arquivos publicados. Não foi possível testar uma resposta real da OpenAI por ausência de chave e orçamento. O endpoint de diagnóstico não cria atividades ou arquivos.

Referências oficiais:
- https://developers.openai.com/api/docs/guides/structured-outputs
- https://developers.openai.com/api/reference/resources/images/methods/edit
- https://supabase.com/docs/guides/functions/auth-headers
- https://supabase.com/docs/guides/functions/secrets
