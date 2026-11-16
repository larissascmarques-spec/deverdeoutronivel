# Conexão de IA por cliente
Cada cliente conecta sua própria chave em /minha-ia. Supabase Auth identifica o proprietário; o navegador nunca informa um user_id ao endpoint.

## Segurança
- Edge Function don-ai-connection valida o JWT no gateway e confirma o usuário em /auth/v1/user.
- GET retorna somente status; POST connect valida a chave em GET /v1/models antes de salvar; POST test verifica a chave salva; DELETE remove.
- Chaves ficam no Supabase Vault; tabela de referência em schema privado. RPC don_manage_ai_connection é executável apenas por service_role. Nunca chamar essa RPC pelo frontend.
- Troca é transacional; remoção da conexão ou conta apaga o segredo. Nenhuma chave aparece em respostas, logs, localStorage ou variáveis VITE.
- O teste não executa inferência e não comprova saldo, compatibilidade de modelos ou permissão de geração.
- Custos pertencem ao cliente. Não há limite financeiro rígido implementado no aplicativo.
- CORS permite a prévia atual; atualizar a origem ao publicar em outro domínio.

## Implantação e limites
Backend implantado; geração permanece desabilitada. Nenhuma chave global da proprietária é usada pelo endpoint.
Publicar o frontend após build e validação visual. Configurar VITE_APP_MODE=production e variáveis públicas Supabase; provisionar acessos dos clientes. A prévia demo bloqueia entrada de chaves.
O pipeline de atividades deve buscar a chave do proprietário no servidor, sem retornar ao navegador. Ainda faltam geração, revisão independente, modelos autorizados, controle de concorrência/cotas e exportação. Não marcar atividade como aprovada pela simples conexão da API.

## Verificação
Testes SQL transacionais com usuários e chaves fictícias: gravação/leitura Vault, troca, isolamento, exclusão de conta, remoção de segredo e bloqueio de execução por anon/authenticated. Dados de teste revertidos.
