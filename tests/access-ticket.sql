begin;
insert into don_private.access_tickets(token_hash,user_id,expires_at) select repeat('a',64),id,now()+interval '5 minutes' from auth.users where lower(email)='larissasc.marques@gmail.com';
insert into don_private.access_tickets(token_hash,user_id,expires_at) select repeat('b',64),id,now()-interval '1 minute' from auth.users where lower(email)='larissasc.marques@gmail.com';
do $$begin
 if public.don_redeem_access_ticket(repeat('a',64)) is distinct from 'larissasc.marques@gmail.com' then raise exception 'Valid owner ticket failed';end if;
 if public.don_redeem_access_ticket(repeat('a',64)) is not null then raise exception 'Ticket reuse allowed';end if;
 if public.don_redeem_access_ticket(repeat('b',64)) is not null then raise exception 'Expired ticket allowed';end if;
 if public.don_redeem_access_ticket(repeat('c',64)) is not null then raise exception 'Unknown ticket allowed';end if;
 if has_function_privilege('anon','public.don_redeem_access_ticket(text)','EXECUTE') or has_function_privilege('authenticated','public.don_redeem_access_ticket(text)','EXECUTE') then raise exception 'Public RPC privilege';end if;
 if has_table_privilege('authenticated','don_private.access_tickets','INSERT') then raise exception 'Client can issue tickets';end if;
end $$;
select 'PASS: valid owner ticket, one-use redemption, expiration, unknown-ticket rejection and private privileges' as result;
rollback;
