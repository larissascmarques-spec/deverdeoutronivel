# Teste do gerador

## O que foi implementado
- Entrada por e-mail e senha, primeiro acesso e recuperação de senha.
- Chave OpenAI própria, criptografada no Vault, com teste dos modelos de texto e imagem, troca e remoção.
- Pedido idempotente, uma geração simultânea por conta e até 10 novos pedidos nas últimas 24 horas. Isso não representa um teto financeiro.
- Criação por folha, segunda passada de revisão, até uma correção de conteúdo, ilustração com o arquivo aprovado como referência real, conferência visual da imagem, até uma correção visual e PDF A4 sem distorção.
- PDFs separados: criança, gabarito comentado, guia da mãe e folha de cálculo em Matemática.
- Histórico privado com data, ano, matéria, assunto, dificuldade e downloads dos mesmos arquivos. Reabrir não chama geração de IA.
- Etapas privadas persistidas e scheduler a cada minuto; o processamento pode continuar com a página fechada. Pedidos interrompidos são marcados como falha após expirar a reserva; nova tentativa requer confirmação de possíveis custos.

## Catálogo deste teste
21 habilidades únicas foram conferidas nos excertos oficiais do MEC, cobrindo os cinco componentes e os cinco anos (EF15LP03 é compartilhada pelos cinco anos). As outras 467 habilidades importadas permanecem NÃO VERIFICADAS e não são usadas para liberar materiais. Um assunto fora desse núcleo não é aprovado automaticamente.

## Verificado tecnicamente
- Build do frontend e testes automatizados de parser aritmético, IDs de perguntas, bloqueio de revisão incompleta, ausência do gabarito no prompt infantil, PDF A4 e os três tipos de PDF de apoio.
- Testes SQL transacionais com dados fictícios: idempotência, reserva exclusiva de etapa, isolamento, bloqueio de liberação incompleta, retomada explícita e privilégios. Dados de teste revertidos.
- Funções publicadas com verificação de JWT; usuário reconfirmado no servidor; nenhuma chave de cliente exposta.
- Scheduler só envia requisições quando existem pedidos ativos e sua credencial interna já foi configurada no Vault pela primeira solicitação autenticada.

## Antes do primeiro acesso externo
O Site continua privado para a proprietária. É preciso adicionar o e-mail da pessoa convidada ao acesso do Site. Isso é separado do cadastro no Supabase.
No Supabase, Authentication > URL Configuration deve ter:
- Site URL: https://dever-outro-nivel-previa.larissa7288.chatgpt.site
- Redirect URL: https://dever-outro-nivel-previa.larissa7288.chatgpt.site/minha-ia
Essa configuração não pode ser alterada pelos métodos disponíveis do conector e ainda precisa de verificação no painel. Manter confirmação de e-mail ativada.

## Teste real que ainda falta
Não foi fornecida nem conectada uma chave OpenAI real; portanto nenhum pedido foi gerado pela API até o fim nesta sessão. A compilação e os testes com dados fictícios não comprovam a fidelidade visual de um material gerado, o acesso real aos modelos, saldo, tempo de processamento ou entrega do e-mail de acesso.
O primeiro teste real deve usar Matemática, 3º ano, Adição e subtração, uma folha. Conferir o PDF contra o layout aprovado, resolver todas as questões e comparar gabarito e guia antes de chamar o produto de pronto para venda. A revisão automática não substitui essa validação humana de lançamento.

## Formatos e custos
Além dos PDFs, a cliente pode baixar a imagem PNG da folha e o JSON do conteúdo aprovado. São exportações do mesmo pedido, sem outra geração de imagem. O JSON não contém credenciais nem os metadados internos do provedor.
Modelo de imagem configurado: gpt-image-2.5-sunburst-2026-09-08, qualidade high, 1536x2176. A calculadora oficial do guia, consultada com esses valores, estimou 2180 tokens de saída e US$ 0,06540 de saída por imagem. Isso exclui o texto e a imagem de entrada, revisão, criação de conteúdo e novas tentativas. Não apresentar esse número como custo total por atividade. O valor real só será conhecido após o primeiro pedido com chave válida e consulta do usage/faturamento da OpenAI. Fonte: https://developers.openai.com/api/docs/guides/image-generation
