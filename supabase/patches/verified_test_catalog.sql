with metadata(code,knowledge_object,thematic_unit_or_field) as (values ('EF15LP03','Estratégia de leitura','Todos os campos de atuação'),
('EF01MA08','Problemas envolvendo diferentes significados da adição e da subtração (juntar, acrescentar, separar, retirar)','Números'),
('EF02MA06','Problemas envolvendo diferentes significados da adição e da subtração (juntar, acrescentar, separar, retirar)','Números'),
('EF03MA06','Problemas envolvendo significados da adição e da subtração: juntar, acrescentar, separar, retirar, comparar e completar quantidades','Números'),
('EF04MA03','Propriedades das operações para o desenvolvimento de diferentes estratégias de cálculo com números naturais','Números'),
('EF05MA07','Problemas: adição e subtração de números naturais e números racionais cuja representação decimal é finita','Números'),
('EF01CI01','Características dos materiais','Matéria e energia'),
('EF02CI04','Seres vivos no ambiente','Vida e evolução'),
('EF03CI04','Características e desenvolvimento dos animais','Vida e evolução'),
('EF04CI04','Cadeias alimentares simples','Vida e evolução'),
('EF05CI01','Propriedades físicas dos materiais','Matéria e energia'),
('EF01HI01','As fases da vida e a ideia de temporalidade (passado, presente, futuro)','Mundo pessoal: meu lugar no mundo'),
('EF02HI01','A noção do “Eu” e do “Outro”: comunidade, convivências e interações entre pessoas','A comunidade e seus registros'),
('EF03HI01','O “Eu”, o “Outro” e os diferentes grupos sociais e étnicos que compõem a cidade e os municípios: os desafios sociais, culturais e ambientais do lugar onde vive','As pessoas e os grupos que compõem a cidade e o município'),
('EF04HI01','A ação das pessoas, grupos sociais e comunidades no tempo e no espaço: nomadismo, agricultura, escrita, navegações, indústria, entre outras','Transformações e permanências nas trajetórias dos grupos humanos'),
('EF05HI01','O que forma um povo: do nomadismo aos primeiros povos sedentarizados','Povos e culturas: meu lugar no mundo e meu grupo social'),
('EF01GE01','O modo de vida das crianças em diferentes lugares','O sujeito e seu lugar no mundo'),
('EF02GE01','Convivência e interações entre pessoas na comunidade','O sujeito e seu lugar no mundo'),
('EF03GE01','A cidade e o campo: aproximações e diferenças','O sujeito e seu lugar no mundo'),
('EF04GE01','Território e diversidade cultural','O sujeito e seu lugar no mundo'),
('EF05GE01','Dinâmica populacional','O sujeito e seu lugar no mundo'))
update public.don_bncc_catalog_candidates c set knowledge_object=m.knowledge_object,thematic_unit_or_field=m.thematic_unit_or_field,review_status='VERIFICADA',review_note='Código, descrição e associação à linha temática conferidos nos excertos oficiais MEC armazenados. Núcleo inicial para teste; demais habilidades continuam NÃO VERIFICADAS.' from metadata m where c.code=m.code;
insert into public.don_bncc_skills(code,description,knowledge_object,thematic_unit_or_field,source_url,verified_at,verified_by)
select c.code,c.official_description,c.knowledge_object,c.thematic_unit_or_field,s.official_url,now(),'conferencia_assistida_fonte_mec_2026_11_16' from public.don_bncc_catalog_candidates c join public.don_curriculum_sources s on s.id=c.source_id where c.review_status='VERIFICADA' on conflict(code) do nothing;
