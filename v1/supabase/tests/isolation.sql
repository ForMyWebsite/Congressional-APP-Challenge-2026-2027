-- Run only in a disposable Supabase development project as database owner.
-- Rolls back the users and workspaces it creates. No production users are changed.
begin;
insert into auth.users(id,email) values
 ('00000000-0000-4000-8000-0000000000a1','acadia-a@example.test'),
 ('00000000-0000-4000-8000-0000000000b2','acadia-b@example.test');
insert into public.acadia_workspaces(user_id,state) values
 ('00000000-0000-4000-8000-0000000000a1','{"version":3}');
set local role authenticated;
select set_config('request.jwt.claim.sub','00000000-0000-4000-8000-0000000000b2',true);
do $$begin
 if (select count(*) from public.acadia_workspaces)<>0 then raise exception 'Cross-user read allowed';end if;
 update public.acadia_workspaces set state='{"version":3,"changed":true}' where user_id='00000000-0000-4000-8000-0000000000a1';
 if found then raise exception 'Cross-user update allowed';end if;
 delete from public.acadia_workspaces where user_id='00000000-0000-4000-8000-0000000000a1';
 if found then raise exception 'Cross-user delete allowed';end if;
end $$;
select public.save_acadia_workspace('{"version":3}',0);
do $$begin
 if (select count(*) from public.acadia_workspaces)<>1 then raise exception 'Own record unavailable';end if;
end $$;
rollback;
