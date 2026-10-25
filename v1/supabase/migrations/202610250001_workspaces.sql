-- Run in the Supabase SQL editor before enabling account sync.
create table if not exists public.acadia_workspaces (
 user_id uuid primary key references auth.users(id) on delete cascade,
 state jsonb not null check(jsonb_typeof(state)='object' and (state->>'version')='3'),
 revision bigint not null default 1 check(revision>0),
 updated_at timestamptz not null default now()
);
alter table public.acadia_workspaces enable row level security;
alter table public.acadia_workspaces force row level security;
revoke all on public.acadia_workspaces from anon;
grant select,insert,update,delete on public.acadia_workspaces to authenticated;
drop policy if exists owner_only on public.acadia_workspaces;
create policy owner_only on public.acadia_workspaces for all to authenticated
 using ((select auth.uid())=user_id) with check ((select auth.uid())=user_id);
create or replace function public.save_acadia_workspace(payload jsonb,expected_revision bigint)
 returns bigint language plpgsql security invoker set search_path=public as $$
declare next_revision bigint;
begin
 if auth.uid() is null then raise exception 'Authentication required' using errcode='28000';end if;
 if jsonb_typeof(payload)<>'object' or payload->>'version'<>'3' then raise exception 'Invalid workspace';end if;
 if expected_revision=0 then
  insert into public.acadia_workspaces(user_id,state) values(auth.uid(),payload)
   on conflict(user_id) do nothing returning revision into next_revision;
 else
  update public.acadia_workspaces set state=payload,revision=revision+1,updated_at=now()
   where user_id=auth.uid() and revision=expected_revision returning revision into next_revision;
 end if;
 if next_revision is null then raise exception 'Concurrent update' using errcode='40001';end if;
 return next_revision;
end $$;
revoke all on function public.save_acadia_workspace(jsonb,bigint) from public,anon;
grant execute on function public.save_acadia_workspace(jsonb,bigint) to authenticated;
