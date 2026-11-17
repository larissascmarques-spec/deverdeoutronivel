
create table don_private.generation_work (
 activity_id uuid primary key references public.don_activities(id) on delete cascade,
 stage text not null default 'content',
 page_index integer not null default 0,
 contents jsonb not null default '[]',
 images jsonb not null default '[]',
 reviews jsonb not null default '[]',
 lease uuid, lease_until timestamptz
);
revoke all on don_private.generation_work from public,anon,authenticated;
create function public.don_start_generation(p_user_id uuid,p_request jsonb,p_client_id uuid,p_skill_code text)
returns uuid language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,1));
 select id into v_id from public.don_activities where user_id=p_user_id and client_request_id=p_client_id;
 if v_id is not null then return v_id;end if;
 if exists(select 1 from public.don_activities where user_id=p_user_id and status in ('awaiting','processing')) then raise exception 'ACTIVE_JOB'; end if;
 if (select count(*) from public.don_activities where user_id=p_user_id and created_at>now()-interval '1 day')>=10 then raise exception 'DAILY_LIMIT'; end if;
 if not exists(select 1 from don_private.ai_connections where user_id=p_user_id) then raise exception 'KEY_REQUIRED';end if;
 insert into public.don_activities(user_id,client_request_id,request,skill_code,status,current_step,generation_pass_id)
 values(p_user_id,p_client_id,p_request,p_skill_code,'awaiting','preparing_content',gen_random_uuid()) returning id into v_id;
 insert into don_private.generation_work(activity_id) values(v_id);
 return v_id;
end $$;
create function public.don_generation_work(p_id uuid,p_action text,p_lease uuid default null,p_data jsonb default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare w don_private.generation_work;
begin
 select * into w from don_private.generation_work where activity_id=p_id for update;
 if not found then return null;end if;
 if p_action='claim' then
  if not exists(select 1 from public.don_activities where id=p_id and status in ('awaiting','processing')) then return null;end if;
  if w.lease is not null then
   if w.lease_until<now() then
    update public.don_activities set status='failed',error_message='O processamento foi interrompido. Reabrir não gera uma nova cobrança automaticamente.' where id=p_id;
   end if;
   return null;
  end if;
  update don_private.generation_work set lease=gen_random_uuid(),lease_until=now()+interval '180 seconds' where activity_id=p_id returning * into w;
  update public.don_activities set status='processing' where id=p_id;
 elsif p_action='save' then
  if w.lease is distinct from p_lease then raise exception 'LEASE_MISMATCH';end if;
  update don_private.generation_work set stage=p_data->>'stage',page_index=(p_data->>'page_index')::int,
   contents=p_data->'contents',images=p_data->'images',reviews=p_data->'reviews',lease=null,lease_until=null where activity_id=p_id returning * into w;
 elsif p_action='release_lease' then
  if w.lease is distinct from p_lease then raise exception 'LEASE_MISMATCH';end if;
  update don_private.generation_work set lease=null,lease_until=null where activity_id=p_id returning * into w;
 else raise exception 'INVALID_ACTION';end if;
 return to_jsonb(w);
end $$;
revoke all on function public.don_start_generation(uuid,jsonb,uuid,text), public.don_generation_work(uuid,text,uuid,jsonb) from public,anon,authenticated;
grant execute on function public.don_start_generation(uuid,jsonb,uuid,text), public.don_generation_work(uuid,text,uuid,jsonb) to service_role;



alter table don_private.generation_work enable row level security;
alter table don_private.ai_connections enable row level security;
create or replace function public.don_retry_generation(p_id uuid,p_user_id uuid)
returns boolean language plpgsql security definer set search_path='' as $$
declare w don_private.generation_work;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,1));
 if exists(select 1 from public.don_activities where user_id=p_user_id and id<>p_id and status in ('awaiting','processing')) then raise exception 'ACTIVE_JOB';end if;
 if not exists(select 1 from public.don_activities where id=p_id and user_id=p_user_id and status='failed') then return false;end if;
 select * into w from don_private.generation_work where activity_id=p_id for update;
 if not found or w.lease_until>now() then return false;end if;
 update don_private.generation_work set lease=null,lease_until=null where activity_id=p_id;
 update public.don_activities set status='awaiting',error_message=null where id=p_id;
 return true;
end $$;
revoke all on function public.don_retry_generation(uuid,uuid) from public,anon,authenticated;
grant execute on function public.don_retry_generation(uuid,uuid) to service_role;


create or replace function public.don_manage_ai_connection(p_user_id uuid,p_action text,p_key text default null)
returns jsonb language plpgsql security definer set search_path='' as $$
declare v_secret uuid; v_time timestamptz;
begin
 if p_action not in ('status','save','read','delete','tested') then raise exception 'invalid action'; end if;
 perform pg_advisory_xact_lock(hashtextextended(p_user_id::text,0));
 select secret_id,tested_at into v_secret,v_time from don_private.ai_connections where user_id=p_user_id;
 if p_action='save' then
  if p_key is null or length(p_key)<20 or length(p_key)>512 or p_key !~ '^sk-[A-Za-z0-9_-]+$' then raise exception 'invalid key'; end if;
  if v_secret is null then
   v_secret:=vault.create_secret(p_key);
   insert into don_private.ai_connections(user_id,secret_id) values(p_user_id,v_secret);
  else
   perform vault.update_secret(v_secret,p_key);
   update don_private.ai_connections set tested_at=now() where user_id=p_user_id;
  end if;
  v_time:=now();
 elsif p_action='delete' then
  delete from don_private.ai_connections where user_id=p_user_id;
  delete from vault.secrets where id=v_secret;
  v_secret:=null;v_time:=null;
 elsif p_action='read' then
  return jsonb_build_object('key',(select decrypted_secret from vault.decrypted_secrets where id=v_secret));
 elsif p_action='tested' and v_secret is not null then
  update don_private.ai_connections set tested_at=now() where user_id=p_user_id;
  v_time:=now();
 end if;
 return jsonb_build_object('connected',v_secret is not null,'tested_at',v_time,'generation_enabled',(select generation_enabled from public.don_generation_policies where is_current));
end $$;
revoke all on function public.don_manage_ai_connection(uuid,text,text) from public,anon,authenticated;
grant execute on function public.don_manage_ai_connection(uuid,text,text) to service_role;


create policy don_server_keys on don_private.ai_connections for all to service_role using(true) with check(true);
create policy don_server_work on don_private.generation_work for all to service_role using(true) with check(true);


create extension if not exists pg_cron;
create extension if not exists pg_net;
revoke all on schema net from public,anon,authenticated;
revoke all on schema cron from public,anon,authenticated;
create function public.don_setup_generation_worker(p_secret text)
returns boolean language plpgsql security definer set search_path='' as $$
declare v_id uuid;
begin
 if p_secret is null or length(p_secret)<40 then raise exception 'INVALID_SECRET';end if;
 perform pg_advisory_xact_lock(812021);
 select id into v_id from vault.secrets where name='don-generation-worker-auth';
 if v_id is null then perform vault.create_secret(p_secret,'don-generation-worker-auth','Internal scheduler credential; never return to clients.');
 else perform vault.update_secret(v_id,p_secret);end if;
 return true;
end $$;
revoke all on function public.don_setup_generation_worker(text) from public,anon,authenticated;
grant execute on function public.don_setup_generation_worker(text) to service_role;
select cron.schedule('don-generation-worker','* * * * *',$job$
select net.http_post(
 url:='https://sgvdevfcdmhrqnvcvjwp.supabase.co/functions/v1/don-generate',
 headers:=jsonb_build_object('Content-Type','application/json','Authorization','Bearer '||(select decrypted_secret from vault.decrypted_secrets where name='don-generation-worker-auth'),'apikey',(select decrypted_secret from vault.decrypted_secrets where name='don-generation-worker-auth')),
 body:='{"action":"tick"}'::jsonb,timeout_milliseconds:=5000
)
where exists(select 1 from public.don_activities where status in ('awaiting','processing'))
and exists(select 1 from vault.secrets where name='don-generation-worker-auth');
$job$);


alter table public.don_activity_files drop constraint don_activity_files_kind_check;
alter table public.don_activity_files add constraint don_activity_files_kind_check check(kind in ('child_activity','mother_guide','calculation_sheet','answer_key','structured_content'));
update storage.buckets set allowed_mime_types=array['application/pdf','image/png','image/jpeg','application/json'] where id='dever-activities';

update public.don_generation_policies set generation_enabled=true,updated_at=now() where is_current;
