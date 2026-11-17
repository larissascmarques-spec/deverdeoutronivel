create table don_private.access_tickets (
 token_hash text primary key check(token_hash ~ '^[a-f0-9]{64}$'),
 user_id uuid not null references auth.users(id) on delete cascade,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null check(expires_at<=created_at+interval '1 hour'),
 consumed_at timestamptz
);
alter table don_private.access_tickets enable row level security;
revoke all on don_private.access_tickets from public,anon,authenticated;
-- Only the service can redeem a ticket issued administratively for the owner.
-- This endpoint cannot create grants, choose another email or bypass licensing.
create function public.don_redeem_access_ticket(p_hash text) returns text
language plpgsql security definer set search_path='' as $$
declare v_email text;
begin
 update don_private.access_tickets t set consumed_at=now()
 from auth.users u where t.token_hash=p_hash and t.user_id=u.id
 and lower(u.email)='larissasc.marques@gmail.com'
 and t.expires_at>now() and t.consumed_at is null
 and public.don_user_has_access(t.user_id)
 returning lower(u.email) into v_email;
 return v_email;
end $$;
revoke all on function public.don_redeem_access_ticket(text) from public,anon,authenticated;
grant execute on function public.don_redeem_access_ticket(text) to service_role;
