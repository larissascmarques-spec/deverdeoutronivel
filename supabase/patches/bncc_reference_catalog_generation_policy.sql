
create table public.don_curriculum_sources (
 id text primary key, title text not null, official_url text not null,
 scope jsonb not null, retrieved_at timestamptz not null default now()
);
create table public.don_curriculum_sections (
 source_id text not null references public.don_curriculum_sources(id),
 component text not null, first_source_line integer not null, last_source_line integer not null,
 content text not null, primary key(source_id,component)
);
create table public.don_bncc_catalog_candidates (
 code text primary key check(code ~ '^EF[0-9]{2}(LP|MA|CI|HI|GE)[0-9]{2}$'),
 source_id text not null references public.don_curriculum_sources(id),
 component text not null, school_years smallint[] not null,
 official_description text not null, source_line integer not null,
 pdf_page integer not null, printed_page integer not null,
 knowledge_object text, thematic_unit_or_field text,
 review_status text not null default 'NÃO VERIFICADA' check(review_status in ('NÃO VERIFICADA','VERIFICADA')),
 review_note text not null,
 imported_at timestamptz not null default now(),
 check(review_status <> 'VERIFICADA' or (knowledge_object is not null and thematic_unit_or_field is not null))
);
create index don_bncc_candidates_source on public.don_bncc_catalog_candidates(source_id);
create index don_bncc_candidates_component on public.don_bncc_catalog_candidates(component);
create index don_bncc_candidates_years on public.don_bncc_catalog_candidates using gin(school_years);
create table public.don_generation_policies (
 version text primary key, title text not null, instructions text not null,
 specification jsonb not null, reference_asset jsonb not null,
 is_current boolean not null default false, generation_enabled boolean not null default false,
 updated_at timestamptz not null default now()
);
create unique index don_one_current_generation_policy on public.don_generation_policies(is_current) where is_current;
alter table public.don_curriculum_sources enable row level security;
alter table public.don_curriculum_sections enable row level security;
alter table public.don_bncc_catalog_candidates enable row level security;
alter table public.don_generation_policies enable row level security;
create policy don_source_read on public.don_curriculum_sources for select to authenticated using(true);
create policy don_section_read on public.don_curriculum_sections for select to authenticated using(true);
create policy don_candidate_read on public.don_bncc_catalog_candidates for select to authenticated using(true);
create policy don_policy_read on public.don_generation_policies for select to authenticated using(true);
revoke all on public.don_curriculum_sources,public.don_curriculum_sections,public.don_bncc_catalog_candidates,public.don_generation_policies from anon,authenticated;
grant select on public.don_curriculum_sources,public.don_curriculum_sections,public.don_bncc_catalog_candidates,public.don_generation_policies to authenticated;
grant all on public.don_curriculum_sources,public.don_curriculum_sections,public.don_bncc_catalog_candidates,public.don_generation_policies to service_role;
