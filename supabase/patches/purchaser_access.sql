create table don_private.access_grants (
 transaction_id text primary key,email text not null check(email=lower(trim(email))),product_id text not null,
 status text not null check(status in ('active','revoked')),event_at timestamptz not null,link_sent_at timestamptz
);
alter table don_private.access_grants enable row level security;
revoke all on don_private.access_grants from public,anon,authenticated;
create index don_access_email on don_private.access_grants(email) where status='active';
create table don_private.access_requests(email text primary key,requested_at timestamptz not null);
alter table don_private.access_requests enable row level security;
revoke all on don_private.access_requests from public,anon,authenticated;
create function public.don_has_access() returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from don_private.access_grants g join auth.users u on lower(u.email)=g.email where u.id=(select auth.uid()) and g.status='active');
$$;
revoke all on function public.don_has_access() from public,anon;
grant execute on function public.don_has_access() to authenticated;
create function public.don_user_has_access(p_user_id uuid) returns boolean language sql stable security definer set search_path='' as $$
 select exists(select 1 from don_private.access_grants g join auth.users u on lower(u.email)=g.email where u.id=p_user_id and g.status='active');
$$;
revoke all on function public.don_user_has_access(uuid) from public,anon,authenticated;
grant execute on function public.don_user_has_access(uuid) to service_role;
create function public.don_request_access(p_email text) returns boolean language plpgsql security definer set search_path='' as $$
begin
 if p_email is null or length(p_email)>254 then return false;end if;
 p_email:=lower(trim(p_email));perform pg_advisory_xact_lock(hashtextextended(p_email,31));
 if exists(select 1 from don_private.access_requests where email=p_email and requested_at>now()-interval '60 seconds') then return false;end if;
 if not exists(select 1 from don_private.access_grants where email=p_email and status='active') then return false;end if;
 insert into don_private.access_requests values(p_email,now()) on conflict(email) do update set requested_at=excluded.requested_at;
 return true;
end $$;
revoke all on function public.don_request_access(text) from public,anon,authenticated;
grant execute on function public.don_request_access(text) to service_role;
create function public.don_apply_purchase(p_transaction text,p_email text,p_product text,p_status text,p_event_at timestamptz) returns jsonb language plpgsql security definer set search_path='' as $$
declare g don_private.access_grants;
begin
 if p_status not in ('active','revoked') or p_transaction is null or p_transaction='' or length(p_transaction)>160 or p_email is null or length(p_email)>254 or p_product is null or p_event_at is null then raise exception 'INVALID_PURCHASE';end if;
 perform pg_advisory_xact_lock(hashtextextended(p_transaction,32));
 select * into g from don_private.access_grants where transaction_id=p_transaction;
 if found then
  if g.email<>lower(trim(p_email)) or g.product_id<>p_product then raise exception 'PURCHASE_MISMATCH';end if;
  if p_status='revoked' or (g.status<>'revoked' and p_event_at>g.event_at) then
   update don_private.access_grants set status=p_status,event_at=greatest(p_event_at,event_at) where transaction_id=p_transaction;
  end if;
 else
  insert into don_private.access_grants(transaction_id,email,product_id,status,event_at) values(p_transaction,lower(trim(p_email)),p_product,p_status,p_event_at);
 end if;
 select * into g from don_private.access_grants where transaction_id=p_transaction;
 return jsonb_build_object('active',g.status='active','send_link',g.status='active' and g.link_sent_at is null);
end $$;
revoke all on function public.don_apply_purchase(text,text,text,text,timestamptz) from public,anon,authenticated;
grant execute on function public.don_apply_purchase(text,text,text,text,timestamptz) to service_role;
create function public.don_mark_access_sent(p_transaction text) returns void language sql security definer set search_path='' as $$
 update don_private.access_grants set link_sent_at=now() where transaction_id=p_transaction and status='active';
$$;
revoke all on function public.don_mark_access_sent(text) from public,anon,authenticated;
grant execute on function public.don_mark_access_sent(text) to service_role;
do $$declare t text;begin
 foreach t in array array['don_activities','don_activity_files','don_activity_pages','don_answer_keys','don_bncc_skills','don_curriculum_sources','don_curriculum_sections','don_bncc_catalog_candidates','don_generation_policies'] loop
 execute format('create policy don_requires_access on public.%I as restrictive for all to authenticated using ((select public.don_has_access())) with check ((select public.don_has_access()))',t);
 end loop;
end $$;
create policy don_storage_requires_access on storage.objects as restrictive for select to authenticated using(bucket_id<>'dever-activities' or (select public.don_has_access()));
insert into don_private.access_grants(transaction_id,email,product_id,status,event_at) values('owner-preview','larissasc.marques@gmail.com','owner-preview','active',now());
