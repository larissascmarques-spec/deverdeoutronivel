begin;
insert into auth.users(id,email) values('e1111111-1111-4111-8111-111111111111','licensed-fixture@example.invalid'),('e2222222-2222-4222-8222-222222222222','unlicensed-fixture@example.invalid');
select public.don_apply_purchase('test-access-transaction','licensed-fixture@example.invalid','fixture','active',now());
select public.don_apply_purchase('test-access-transaction','licensed-fixture@example.invalid','fixture','active',now());
do $$begin
 if (select count(*) from don_private.access_grants where transaction_id='test-access-transaction')<>1 then raise exception 'Duplicate grant';end if;
 if not public.don_user_has_access('e1111111-1111-4111-8111-111111111111') then raise exception 'Missing licensed access';end if;
 if public.don_user_has_access('e2222222-2222-4222-8222-222222222222') then raise exception 'Unlicensed access';end if;
 if has_function_privilege('authenticated','public.don_apply_purchase(text,text,text,text,timestamptz)','EXECUTE') then raise exception 'Client can grant access';end if;
 if has_table_privilege('authenticated','don_private.access_grants','INSERT') then raise exception 'Client can grant access';end if;
 if not public.don_request_access('licensed-fixture@example.invalid') then raise exception 'First email rejected';end if;
 if public.don_request_access('licensed-fixture@example.invalid') then raise exception 'Cooldown bypass';end if;
 if public.don_request_access('unlicensed-fixture@example.invalid') then raise exception 'Unlicensed mail';end if;
end $$;
set local role authenticated;
select set_config('request.jwt.claim.sub','e2222222-2222-4222-8222-222222222222',true);
do $$begin
 if public.don_has_access() then raise exception 'Unlicensed authenticated user passed';end if;
 if exists(select 1 from public.don_bncc_skills) then raise exception 'RLS licensing bypass';end if;
end $$;
reset role;
select public.don_apply_purchase('test-access-transaction','licensed-fixture@example.invalid','fixture','revoked',now());
select public.don_apply_purchase('test-access-transaction','licensed-fixture@example.invalid','fixture','active',now()+interval '1 second');
do $$begin
 if public.don_user_has_access('e1111111-1111-4111-8111-111111111111') then raise exception 'Delayed approval reopened refund';end if;
end $$;
select 'PASS: idempotency, licensing, RLS, client privilege denial, email cooldown and refund replay protection' as result;
rollback;
