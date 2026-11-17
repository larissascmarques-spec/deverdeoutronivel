# IA por cliente
A cliente cria sua conta no aplicativo e conecta sua própria chave em Minha IA. O servidor confirma Supabase Auth e deriva o proprietário do token, sem confiar em user_id enviado pelo navegador.

- Chaves no Supabase Vault, fora de tabelas expostas ao cliente. RPCs privilegiadas são exclusivas de service_role.
- Teste de conexão consulta acesso aos modelos sem executar inferência. Não comprova saldo nem todos os requisitos de geração.
- don-generate usa o conteúdo revisado e a referência aprovada real, com hash conferido. As etapas ficam em schema privado, com reserva exclusiva de processamento.
- Um scheduler no banco retoma etapas sem depender da página aberta; sua credencial fica no Vault e é preparada pelo primeiro pedido autenticado. Sem chamadas recursivas entre funções.
- Conteúdo e imagem têm passadas de revisão separadas e até uma correção cada. Reprovação persistente fica pendente de conferência; falha técnica exige confirmação antes de nova tentativa.
- PNG, JSON, PDFs e gabarito só são liberados depois das verificações. Histórico e Storage são privados por cliente.
- Não há teto financeiro rígido. Há limite de 10 novos pedidos em 24 horas e uma geração simultânea por conta. O custo da API pertence à cliente e é informado antes da geração.

Modelos fixados: gpt-5.4-mini-2026-03-17 e gpt-image-2.5-sunburst-2026-09-08. Não são usadas chaves globais da proprietária para inferência.

Ver docs/TESTE_DO_APLICATIVO.md para o que foi testado, os limites do catálogo inicial e os requisitos de acesso que ainda precisam de validação real. Compilação e testes fictícios não comprovam fidelidade visual da primeira geração.
