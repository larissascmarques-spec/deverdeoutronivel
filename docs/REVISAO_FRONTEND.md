# Revisão do front-end — 16/11/2026

Versão para aprovação visual e de navegação. Geração, autenticação e downloads reais aguardam o back-end. Nenhuma habilidade BNCC ou atividade é apresentada como pedagogicamente aprovada por esta demonstração.

## Alterações

- Fluxo direto: Montar atividade e Minhas atividades.
- Formulário com escolhas numeradas, sugestões e assunto livre, três dificuldades, 1/3/5 folhas e observação opcional.
- Referência original preservada, sem deformação e identificada como exemplo.
- Azul-marinho e laranja, tipografia legível, seleções visíveis e botões com área de toque confortável.
- Layout em duas colunas no computador e uma coluna no celular, com navegação inferior.
- Estados de carregamento, busca sem resultados, erro, nova tentativa, revisão pendente e pedido inexistente.
- Modal nativo: foco contido, fechamento por Escape e retorno do foco ao botão que abriu.
- Rascunho preservado ao voltar; troca de ano ou matéria limpa o assunto anterior.
- Pedidos de demonstração persistidos neste navegador. Retomada da simulação ao atualizar um pedido em preparação.
- Arquivos indisponíveis permanecem bloqueados; a referência nunca substitui o resultado.

## Verificação executada

- Compilação TypeScript e build Vite.
- Navegação e fluxo completo no navegador em computador.
- Formulário vazio: mensagens locais e foco no primeiro campo pendente.
- Escolha de assunto sugerido e de assunto digitado.
- Mudança de matéria elimina o assunto anterior.
- Layout em largura móvel de 390 px e 320 px, sem rolagem horizontal. Em telas até 360 px, anos distribuídos em três colunas para manter área de toque.
- Falha simulada, botão Tentar de novo e edição com escolhas preservadas.
- Revisão pendente permanece sem arquivos disponíveis.
- Busca sem resultados, histórico e rotas de resultado inexistente.
- Ampliação da referência, Escape e restauração de foco.

A revisão técnica não substitui testes de usabilidade com mães reais. Não há nota objetiva 10/10 nem promessa de fidelidade de uma geração de IA que ainda não foi implementada.

## Próxima etapa após aprovação

Integrar o Supabase pelos contratos existentes em src/services/interfaces.ts e src/types/contracts.ts. Usar variáveis VITE_SUPABASE_URL e VITE_SUPABASE_PUBLISHABLE_KEY apenas para configuração pública. Credenciais de IA e chaves privilegiadas ficam exclusivamente no servidor. Manter atividade, guia da mãe e folha de cálculo separados. A IA deve receber a referência visual e passar por revisão pedagógica antes de liberar os arquivos.
