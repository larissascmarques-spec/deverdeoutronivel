# BNCC e regras de geração salvas

Fonte oficial: https://basenacionalcomum.mec.gov.br/images/BNCC_EI_EF_110518_versaofinal_site.pdf

Recorte do produto: 1º ao 5º ano, Língua Portuguesa, Matemática, Ciências, História e Geografia.

Importados 488 códigos únicos e descrições: Língua Portuguesa 206, Matemática 126, Ciências 48, História 52 e Geografia 56. Os códigos de LP dos blocos EF12, EF15 e EF35 preservam os anos de abrangência, sem duplicar o código. Verificação de continuidade numérica por grupo: sem lacunas.

As cinco seções da fonte foram preservadas em don_curriculum_sections com linhas e páginas para conferência. O PDF oficial completo permanece referenciado por URL em don_curriculum_sources; o banco guarda o texto extraído do recorte do produto, não o arquivo PDF binário.

IMPORTANTE: don_bncc_catalog_candidates é uma área de importação, não o catálogo liberado. As 488 associações específicas entre habilidade, objeto de conhecimento e unidade temática/campo ainda aguardam conferência. Todos esses registros estão como NÃO VERIFICADA e não foram promovidos para don_bncc_skills. Não usar candidatos como se fossem habilidades completamente verificadas para geração.

A política dever-v1 foi salva em don_generation_policies, incluindo as instruções e o JSON estruturado. É a especificação atual; generation_enabled permanece false. Contrato: uma atividade completa por folha A4, criativa e clara, visual aprovado, dificuldade adequada, respostas comentadas separadas, guia da mãe, cálculos em folha separada e segunda revisão antes da liberação.

RLS está habilitada nas quatro novas tabelas; clientes autenticadas podem consultar a referência, mas não modificá-la. Advisors de segurança após a gravação: sem alertas.

Arquivos de dados em supabase/data servem para auditoria e recuperação. O SQL em supabase/patches/bncc_reference_catalog_generation_policy.sql corresponde à migração remota com esse nome. Ao retomar ambiente local, sincronizar o histórico do banco com a CLI antes de gerar novas migrações.
