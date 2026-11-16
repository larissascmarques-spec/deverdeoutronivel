# Dever de Outro Nível — handoff do front-end

Front-end em React + TypeScript + Vite. Esta etapa não cria banco, autenticação real, storage, Edge Functions nem chamadas de IA.

## Como executar

```bash
npm install
npm run dev
```

Build de verificação:

```bash
npm run build
```

Abra `http://localhost:5173`. Sem `.env`, o aplicativo inicia em **modo demonstração**.

Copie `.env.example` para `.env.local` quando for conectar o Supabase externo.

## Modo demonstração

`VITE_APP_MODE=demo` (padrão se a variável estiver vazia).

O que a demonstração faz:

- Permite preencher o formulário, navegar e acompanhar estados de geração.
- Marca pedidos, etapas e itens da biblioteca como **simulados**.
- Guarda os pedidos só no `localStorage` do navegador.
- Mostra a imagem `public/references/layout-aprovado.png` como **Referência visual aprovada**.
- Não afirma geração real, aprovação pedagógica, login ou salvamento no servidor.
- Não libera download: os arquivos nascem com `available: false` e `url: null`.
- Não usa a folha de cookies como se fosse o resultado do pedido da mãe.

No formulário, em **Opções da demonstração**, dá para ver os estados *concluído sem arquivos*, *falhou* e *precisa de revisão*.

Se `VITE_APP_MODE=production` e o Supabase não estiver configurado, a tela mostra erro de conexão. **Não há retorno automático para o modo demo.**

## Estrutura dos componentes

- `src/pages/MontarAtividadePage.tsx` — formulário único (ano, matéria, assunto, dificuldade, quantidade).
- `src/pages/GeracaoPage.tsx` — acompanhamento assíncrono.
- `src/pages/ResultadoPage.tsx` — prévia A4, downloads e guia.
- `src/pages/MinhasAtividadesPage.tsx` — biblioteca simples.
- `src/components/layout/` — casca, navegação e faixa de demonstração.
- `src/components/visual/` — moldura A4 e referência aprovada (`object-fit: contain`, proporção 210/297).
- `src/state/DraftContext.tsx` — preserva o pedido se a mãe voltar para editar.

## Contratos dos serviços

Definidos em `src/types/contracts.ts` e `src/services/interfaces.ts`.

### Pedido de geração (`GenerationRequest`)

- `year` — 1 a 5
- `subjectId` — matéria
- `topicId` — sugestão do catálogo ou `null` se digitado
- `topicLabel` — texto visível do assunto
- `difficulty` — `essencial` | `intermediario` | `desafiador`
- `pageCount` — 1, 3 ou 5
- `extraContext` — texto opcional
- `visualReferenceVersion` — hoje `layout-aprovado-v1`

### Tarefa de geração (`GenerationJob`)

- `id`
- `status` — `awaiting` | `processing` | `completed` | `failed` | `needs_review`
- `currentStep` — `preparing_content` | `checking_answers` | `creating_illustrated_pages` | `organizing_files`
- `createdAt` / `updatedAt`
- `errorMessage`
- `pages[]` — prévias (url, largura, altura, número)
- `files[]` — atividade da criança, guia da mãe e, em Matemática, folha de cálculo

Camada de serviços (`src/services/index.ts`):

| Serviço | Demo | Produção (adaptador) |
| --- | --- | --- |
| Catálogo | `services/demo/catalogDemo.ts` | `services/supabase/catalogAdapter.ts` |
| Geração | `services/demo/generationDemo.ts` | `services/supabase/generationAdapter.ts` |
| Biblioteca | `services/demo/libraryDemo.ts` | `services/supabase/libraryAdapter.ts` |
| Sessão | `services/demo/sessionDemo.ts` | `services/supabase/sessionAdapter.ts` |

Os adaptadores de produção **não consultam tabelas**. Eles falham de forma explícita até o back-end existir.

## Variáveis de ambiente

Ver `.env.example`:

- `VITE_APP_MODE` — `demo` ou `production`
- `VITE_SUPABASE_URL` — URL pública do projeto
- `VITE_SUPABASE_PUBLISHABLE_KEY` — chave publicável (anon)

Nunca exponha `service_role`, segredos de IA ou outras credenciais de servidor no front-end.

O cliente (`src/lib/supabaseClient.ts`) só é criado quando URL e chave publicável são válidas. Sem isso, o app não quebra no build nem abre tela branca em modo demo.

## Arquivos preparados para integração

- `src/types/contracts.ts`
- `src/services/interfaces.ts`
- `src/services/supabase/*`
- `src/lib/supabaseClient.ts`
- `src/config/env.ts`
- `src/config/visualReference.ts`
- `public/references/layout-aprovado.png` — modelo original da folha; preservar arquivo e proporções

A prévia futura deve preencher `GenerationJob.pages` com imagens A4 geradas. Não substituir a folha por HTML de exercícios.

## O que falta no Supabase

1. Projeto externo, autenticação real e permissões da usuária.
2. Catálogo de anos, matérias e assuntos (sem exigir código BNCC na interface da mãe).
3. Fila de geração assíncrona com os estados e etapas acima.
4. Identificação da habilidade BNCC no servidor, a partir do assunto informado.
5. Criação e conferência de conteúdo, gabarito e cálculos.
6. Geração da folha ilustrada completa por IA, usando `layout-aprovado.png` como referência.
7. Conferência da imagem produzida (texto, layout, consistência).
8. PDFs separados: atividade da criança e guia da mãe; folha de cálculo em Matemática.
9. Storage dos arquivos, URLs de visualização/download e biblioteca da usuária.
10. Limites de uso, tentativas, reuso e política de revisão humana quando `needs_review`.

A compra futura libera o 1º ao 5º ano juntos, sem vender por ano.
