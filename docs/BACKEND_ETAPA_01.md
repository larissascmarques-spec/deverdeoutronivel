# Back-end: primeira etapa

A estrutura foi instalada e verificada no Supabase em 16/11/2026. Estado atual e conexão em [SUPABASE_CONFIGURADO.md](SUPABASE_CONFIGURADO.md).

Implementado: histórico por cliente; arquivos privados; páginas; gabaritos estruturados; RLS por proprietária; bloqueio de liberação incompleta; revisão registrada da mesma versão em segunda passada; adaptadores de leitura; consulta Ver gabarito e opção de PDF separado.

Testes: build TypeScript/Vite e testes locais de renderização, validação de gabarito e PostgreSQL embarcado. Depois da aplicação remota, teste SQL transacional confirmou isolamento entre clientes, bloqueio de respostas não revisadas e negação de alterações de status pela cliente. Não há atividades reais geradas nesta etapa.

A migração inicial foi criada com Supabase CLI 3.2.0. O índice adicional foi aplicado pelo conector e seu SQL foi registrado em supabase/patches/dever_activity_skill_index.sql; sincronizar o histórico remoto com a CLI ao retomar o ambiente local.

Pendências: autenticação da cliente e regras de acesso da compra; provedor de IA no servidor; fila, orçamento, geração e segunda revisão; PDFs finais e teste completo com duas contas. createRequest e retry continuam bloqueados em produção até concluir o servidor. A demonstração permanece ativa.
