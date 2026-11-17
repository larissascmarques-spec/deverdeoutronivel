# Supabase — Dever de Outro Nível

Configurado em 16/11/2026, na organização autorizada pela proprietária.

- Projeto: Dever de Outro Nível
- Referência: sgvdevfcdmhrqnvcvjwp
- Região: sa-east-1 (São Paulo)
- API: https://sgvdevfcdmhrqnvcvjwp.supabase.co
- Painel: https://supabase.com/dashboard/project/sgvdevfcdmhrqnvcvjwp
- Criação gratuita autorizada após pausa de outro projeto de testes. Não houve contratação de plano pago.

## Instalado e verificado remotamente

Migração dever_activities_history_answers aplicada, com cinco tabelas: don_activities, don_activity_files, don_activity_pages, don_answer_keys e don_bncc_skills. RLS habilitada em todas. Bucket dever-activities privado.

Teste SQL transacional com duas identidades temporárias: proprietária vê seu pedido; outra cliente não vê; cliente não pode alterar status; gabarito não revisado permanece bloqueado. Todos os dados temporários foram revertidos; zero usuários de teste permaneceram.

Advisors de segurança: sem alertas. Foi corrigido o índice da referência à habilidade. Índices recém-criados podem aparecer como ainda não utilizados enquanto não há uso real.
Referência do aviso de índice: https://supabase.com/docs/guides/database/database-linter?lint=0001_unindexed_foreign_keys

.env.example contém a URL e a chave publicável do projeto. Copiar para .env.local no ambiente de desenvolvimento. A chave publicável é própria para cliente público; as políticas RLS controlam acesso. Nenhuma chave service_role ou de IA foi registrada no repositório.

## Ainda não ativado

O aplicativo permanece em demonstração. Falta implementar/configurar login das clientes, acesso após compra, provedor de IA, fila, orçamento, geração, segunda revisão e exportação final. Não mudar VITE_APP_MODE para production antes de concluir e testar esse fluxo.

A disponibilidade do banco não significa que a geração esteja pronta. Reabrir material já concluído deve reutilizar os mesmos PDFs e gabaritos, sem nova chamada de IA.
