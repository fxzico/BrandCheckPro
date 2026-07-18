-- BrandCheck Pro: anonymous scan metering
-- Tracks free AI scans per IP per day for the quick-endpoint edge function.
-- Anonymous visitors get a limited number of operator-paid scans daily;
-- signed-in users bypass this table entirely.

create table if not exists public.bc_anon_usage (
  ip text not null,
  day date not null default (now() at time zone 'utc')::date,
  scans integer not null default 0,
  updated_at timestamptz not null default now(),
  primary key (ip, day)
);

-- Service-role access only: no anon/authenticated policies are defined.
alter table public.bc_anon_usage enable row level security;

-- Atomically consume one scan. Returns true if the caller was under the
-- limit (scan granted), false if the daily cap is already spent.
create or replace function public.bc_consume_anon_scan(p_ip text, p_limit integer)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  v_scans integer;
begin
  insert into bc_anon_usage as u (ip, day, scans)
  values (p_ip, (now() at time zone 'utc')::date, 1)
  on conflict (ip, day) do update
    set scans = u.scans + 1,
        updated_at = now()
    where u.scans < p_limit
  returning scans into v_scans;

  -- No row returned means the conflict update was filtered out: cap reached.
  return v_scans is not null;
end;
$$;

-- Edge functions call this with the service role; block everyone else.
revoke execute on function public.bc_consume_anon_scan(text, integer) from public, anon, authenticated;
grant execute on function public.bc_consume_anon_scan(text, integer) to service_role;
