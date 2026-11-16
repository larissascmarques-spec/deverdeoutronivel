# Back-end: primeira etapa

Implementado no código, sem aplicação em projeto remoto:

- Estrutura de histórico por cliente, arquivos privados, páginas e gabaritos estruturados.
- RLS por proprietária; arquivos e respostas somente após liberação.
- Bloqueio de material incompleto e exigência de dez verificações, revisão da mesma versão e segunda passada distinta.
- Adaptadores de leitura e URLs temporárias do Storage. Conteúdo de gabarito validado antes da apresentação.
- Consulta Ver gabarito na interface e download separado em PDF, indisponível quando não há arquivo.

Teste local com PostgreSQL embarcado (PGlite 0.3.14), com Auth/Storage simulados: validação do pedido, liberação incompleta, segunda passada, permissões, isolamento entre duas clientes e bloqueio anônimo. Isso não equivale a teste de Supabase remoto nem à revisão pedagógica de atividades reais.

Para reproduzir: instalar @electric-sql/pglite@0.3.14 em diretório de teste e executar tests/database-security.mjs com PGLITE_MODULE apontando para seu dist/index.js. A migração foi criada pelo Supabase CLI 3.2.0.

## Dependências antes de ativar

Não foi encontrado projeto Dever de Outro Nível na conexão atual. Identificar ou criar o projeto correto antes de aplicar a migração; inspecionar tabelas, políticas e avisos de segurança nesse projeto. Nenhum banco conectado foi alterado.

Depois: aplicar e testar migração no projeto correto; configurar autenticação da cliente e regras de acesso da compra; escolher e configurar o provedor de IA no servidor; implementar fila, orçamento, geração e segunda revisão; validar gabaritos e PDFs finais; testar o fluxo completo com duas contas.

createRequest e retry continuam bloqueados em produção até a implementação do servidor de geração. O modo demo permanece ativo. Nenhuma chave privilegiada foi adicionada e não foi contratado serviço pago.
