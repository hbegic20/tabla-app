create table public.ai_usage (
  id bigint generated always as identity primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  mode text not null,
  created_at timestamptz not null default now()
);

create index ai_usage_user_created_idx on public.ai_usage (user_id, created_at desc);

alter table public.ai_usage enable row level security;

create function public.consume_ai_quota(p_mode text, p_daily_cap int)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  uid uuid := auth.uid();
  used int;
begin
  if uid is null then
    raise exception 'not authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtextextended(uid::text, 0));

  select count(*) into used
  from public.ai_usage
  where user_id = uid
    and created_at > now() - interval '24 hours';

  if used >= p_daily_cap then
    return false;
  end if;

  insert into public.ai_usage (user_id, mode) values (uid, p_mode);
  return true;
end;
$$;

revoke execute on function public.consume_ai_quota(text, int) from public, anon;
grant execute on function public.consume_ai_quota(text, int) to authenticated;
