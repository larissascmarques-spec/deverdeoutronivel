
create schema if not exists don_private;
revoke all on schema don_private from public,anon,authenticated;
create table don_private.ai_connections (
 user_id uuid primary key references auth.users(id) on delete cascade,
 secret_id uuid not null unique references vault.secrets(id),
 tested_at timestamptz not null default now()
);
revoke all on don_private.ai_connections from public,anon,authenticated;
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
 return jsonb_build_object('connected',v_secret is not null,'tested_at',v_time,'generation_enabled',false);
end $$;
revoke all on function public.don_manage_ai_connection(uuid,text,text) from public,anon,authenticated;
grant execute on function public.don_manage_ai_connection(uuid,text,text) to service_role;
create or replace function don_private.remove_ai_secret() returns trigger language plpgsql security definer set search_path='' as $$
begin delete from vault.secrets where id=old.secret_id;return old;end $$;
revoke all on function don_private.remove_ai_secret() from public,anon,authenticated;
create trigger remove_ai_secret_after_delete after delete on don_private.ai_connections for each row execute function don_private.remove_ai_secret();
