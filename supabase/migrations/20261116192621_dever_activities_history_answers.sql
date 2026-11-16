-- Prepared for a dedicated Dever de Outro Nível project. Not applied remotely.
create table public.don_bncc_skills (
  code text primary key check (code ~ '^EF[0-9]{2}(LP|MA|CI|HI|GE)[0-9]{2}$'),
  description text not null,
  knowledge_object text not null,
  thematic_unit_or_field text not null,
  source_url text not null check (source_url ~ '^https://'),
  verified_at timestamptz not null,
  verified_by text not null
);
alter table public.don_bncc_skills enable row level security;
create policy don_verified_catalog on public.don_bncc_skills for select to authenticated using (true);
grant select on public.don_bncc_skills to authenticated;
grant all on public.don_bncc_skills to service_role;

create table public.don_activities (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_request_id uuid not null,
  request jsonb not null check (
    jsonb_typeof(request) = 'object'
    and request ?& array['year','subjectId','topicLabel','difficulty','pageCount','visualReferenceVersion']
    and request->>'year' in ('1','2','3','4','5')
    and request->>'subjectId' in ('lingua-portuguesa','matematica','ciencias','historia','geografia')
    and length(btrim(request->>'topicLabel')) between 3 and 120
    and request->>'difficulty' in ('essencial','intermediario','desafiador')
    and request->>'pageCount' in ('1','3','5')
    and request->>'visualReferenceVersion' = 'layout-aprovado-v1'
    and coalesce(length(request->>'extraContext'),0) <= 280
    and not (request @> '{"year":null}' or request @> '{"subjectId":null}' or request @> '{"topicLabel":null}' or request @> '{"difficulty":null}' or request @> '{"pageCount":null}' or request @> '{"visualReferenceVersion":null}')
  ),
  skill_code text references public.don_bncc_skills(code),
  status text not null default 'awaiting' check (status in ('awaiting','processing','completed','failed','needs_review')),
  current_step text check (current_step in ('preparing_content','checking_answers','creating_illustrated_pages','organizing_files')),
  revision integer not null default 1 check (revision > 0),
  reviewed_revision integer,
  generation_pass_id uuid,
  review_pass_id uuid,
  quality_checks jsonb not null default '{}',
  error_message text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, client_request_id),
  constraint don_release_requires_review check (status <> 'completed' or (
    skill_code is not null and reviewed_revision is not null and reviewed_revision = revision
    and generation_pass_id is not null and review_pass_id is not null and generation_pass_id <> review_pass_id
    and quality_checks @> '{"bncc":true,"calculations":true,"spelling":true,"clarity":true,"grade":true,"difficulty":true,"curiosity":true,"layout":true,"originality":true,"variety":true}'
  ))
);
create index don_activities_owner_date on public.don_activities(user_id, created_at desc);
create index don_activities_queue on public.don_activities(created_at) where status = 'awaiting';
alter table public.don_activities enable row level security;
create policy don_own_history on public.don_activities for select to authenticated using ((select auth.uid()) = user_id);
grant select on public.don_activities to authenticated;
-- Only the authenticated server can accept requests, change status or approve output.
grant all on public.don_activities to service_role;

create table public.don_activity_files (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.don_activities(id) on delete cascade,
  kind text not null check (kind in ('child_activity','mother_guide','calculation_sheet','answer_key')),
  object_path text not null unique,
  unique(activity_id,kind)
);
create index don_files_activity on public.don_activity_files(activity_id);
alter table public.don_activity_files enable row level security;
create policy don_own_released_files on public.don_activity_files for select to authenticated using (exists (
  select 1 from public.don_activities a where a.id = activity_id and a.user_id = (select auth.uid()) and a.status = 'completed'
));
grant select on public.don_activity_files to authenticated;
grant all on public.don_activity_files to service_role;

create table public.don_answer_keys (
  activity_id uuid primary key references public.don_activities(id) on delete cascade,
  content jsonb not null check (jsonb_typeof(content) = 'object' and content ? 'entries' and jsonb_typeof(content->'entries') = 'array' and jsonb_array_length(content->'entries') > 0)
);
alter table public.don_answer_keys enable row level security;
create policy don_own_released_answers on public.don_answer_keys for select to authenticated using (exists (
  select 1 from public.don_activities a where a.id = activity_id and a.user_id = (select auth.uid()) and a.status = 'completed'
));
grant select on public.don_answer_keys to authenticated;
grant all on public.don_answer_keys to service_role;

create table public.don_activity_pages (
  id uuid primary key default gen_random_uuid(),
  activity_id uuid not null references public.don_activities(id) on delete cascade,
  page_number integer not null check (page_number between 1 and 5),
  object_path text not null unique,
  width integer not null check (width > 0),
  height integer not null check (height > 0),
  unique(activity_id,page_number)
);
create index don_pages_activity on public.don_activity_pages(activity_id);
alter table public.don_activity_pages enable row level security;
create policy don_own_released_pages on public.don_activity_pages for select to authenticated using (exists (
  select 1 from public.don_activities a where a.id = activity_id and a.user_id = (select auth.uid()) and a.status = 'completed'
));
grant select on public.don_activity_pages to authenticated;
grant all on public.don_activity_pages to service_role;

insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('dever-activities','dever-activities',false,26214400,array['application/pdf','image/png','image/jpeg'])
on conflict(id) do nothing;
create policy don_private_released_downloads on storage.objects for select to authenticated using (
  bucket_id = 'dever-activities' and (
    exists(select 1 from public.don_activity_files f join public.don_activities a on a.id=f.activity_id where f.object_path=storage.objects.name and a.user_id=(select auth.uid()) and a.status='completed')
    or exists(select 1 from public.don_activity_pages p join public.don_activities a on a.id=p.activity_id where p.object_path=storage.objects.name and a.user_id=(select auth.uid()) and a.status='completed')
  )
);

create function public.don_assert_release() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if new.status = 'completed' then
    if not exists (select 1 from public.don_answer_keys k where k.activity_id=new.id)
      or not exists (select 1 from public.don_activity_files f where f.activity_id=new.id and f.kind='child_activity')
      or not exists (select 1 from public.don_activity_files f where f.activity_id=new.id and f.kind='mother_guide')
      or not exists (select 1 from public.don_activity_files f where f.activity_id=new.id and f.kind='answer_key')
      or (new.request->>'subjectId'='matematica' and not exists(select 1 from public.don_activity_files f where f.activity_id=new.id and f.kind='calculation_sheet'))
      or (select count(*) from public.don_activity_pages p where p.activity_id=new.id) <> (new.request->>'pageCount')::integer
    then raise exception 'Material incompleto: atividade, gabarito, guia e páginas devem estar preparados antes da liberação.'; end if;
  end if;
  new.updated_at := now();
  return new;
end;
$$;
revoke all on function public.don_assert_release() from public, anon, authenticated;
grant execute on function public.don_assert_release() to service_role;
create trigger don_validate_before_release before insert or update on public.don_activities for each row execute function public.don_assert_release();

-- Override provider default grants: clients can only read their RLS-visible data.
revoke all on public.don_bncc_skills, public.don_activities, public.don_activity_files, public.don_answer_keys, public.don_activity_pages from anon, authenticated;
grant select on public.don_bncc_skills, public.don_activities, public.don_activity_files, public.don_answer_keys, public.don_activity_pages to authenticated;

-- A published answer/file/page must be withdrawn for review before editing.
create function public.don_protect_published_artifact() returns trigger
language plpgsql security invoker set search_path = '' as $$
begin
  if TG_OP <> 'INSERT' and exists(select 1 from public.don_activities a where a.id=old.activity_id and a.status='completed') then
    raise exception 'Retire o material para revisão antes de alterar seus arquivos ou respostas.';
  end if;
  if TG_OP <> 'DELETE' and exists(select 1 from public.don_activities a where a.id=new.activity_id and a.status='completed') then
    raise exception 'Retire o material para revisão antes de alterar seus arquivos ou respostas.';
  end if;
  if TG_OP = 'DELETE' then return old; end if;
  return new;
end;
$$;
revoke all on function public.don_protect_published_artifact() from public,anon,authenticated;
grant execute on function public.don_protect_published_artifact() to service_role;
create trigger don_protect_answers before insert or update or delete on public.don_answer_keys for each row execute function public.don_protect_published_artifact();
create trigger don_protect_files before insert or update or delete on public.don_activity_files for each row execute function public.don_protect_published_artifact();
create trigger don_protect_pages before insert or update or delete on public.don_activity_pages for each row execute function public.don_protect_published_artifact();
