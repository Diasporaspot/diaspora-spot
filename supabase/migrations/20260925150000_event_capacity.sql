-- Shared ledger. No attendee data is accessible through the anonymous/member API.
create table public.event_bookings (
  id uuid primary key default gen_random_uuid(),
  environment text not null check (environment in ('staging','production')),
  product_id text not null,
  product_type text not null check (product_type in ('workshop','series')),
  email text not null,
  name text not null,
  phone text not null default '',
  state text not null check (state in ('held','confirmed','released')),
  session_id text unique,
  expires_at timestamptz,
  created_at timestamptz not null default now(),
  sync_status text not null default 'pending',
  sync_error text,
  registration_data jsonb not null default '{}'
);
create table public.event_seats (
  booking_id uuid references public.event_bookings(id) on delete cascade,
  event_id text not null,
  primary key (booking_id,event_id)
);
create table public.event_waitlist (
  id uuid primary key default gen_random_uuid(),
  environment text not null check (environment in ('staging','production')),
  product_id text not null,
  product_type text not null check (product_type in ('workshop','series')),
  email text not null,
  name text not null,
  phone text not null default '',
  state text not null default 'waiting' check (state in ('waiting','converted')),
  created_at timestamptz not null default now(),
  sync_status text not null default 'pending',
  sync_error text,
  group_id text,
  unique(environment, product_id, email)
);
create table public.event_mailer_groups (
  environment text not null check (environment in ('staging','production')),
  product_id text not null,
  group_id text not null,
  group_name text not null,
  primary key (environment,product_id)
);
create index event_bookings_environment_state on public.event_bookings(environment,state);
create index event_seats_event_id on public.event_seats(event_id);
alter table public.event_bookings enable row level security;
alter table public.event_seats enable row level security;
alter table public.event_waitlist enable row level security;
alter table public.event_mailer_groups enable row level security;
revoke all on public.event_bookings, public.event_seats, public.event_waitlist, public.event_mailer_groups from anon, authenticated;

-- All allocation changes use the same environment lock, including multi-workshop purchases.
-- Holds are released only after Stripe verifies expiry, never merely by the local clock.
create function public.reserve_event_seats(p_environment text, p_product_id text, p_product_type text,
  p_email text, p_name text, p_phone text, p_events jsonb, p_paid boolean, p_data jsonb)
returns jsonb language plpgsql security definer set search_path = public as $$
declare e jsonb; occupied integer; booking uuid;
begin
  perform pg_advisory_xact_lock(hashtextextended('event-capacity:' || p_environment,0));
  if jsonb_array_length(p_events) = 0 then raise exception 'Missing events'; end if;
  if exists (select 1 from event_bookings b join event_seats s on s.booking_id=b.id
    where b.environment=p_environment and b.email=p_email and b.state in ('held','confirmed')
    and s.event_id in (select value->>'id' from jsonb_array_elements(p_events))) then
    return jsonb_build_object('error','existing_booking');
  end if;
  for e in select value from jsonb_array_elements(p_events) loop
    select count(*) into occupied from event_seats s join event_bookings b on b.id=s.booking_id
      where s.event_id=e->>'id' and b.environment=p_environment and b.state in ('held','confirmed');
    if (e->>'closed')::boolean then return jsonb_build_object('error','closed'); end if;
    if (e->>'waitlist')::boolean or (e->>'capacity' is not null and occupied >= (e->>'capacity')::integer) then
      return jsonb_build_object('error','full');
    end if;
  end loop;
  insert into event_bookings(environment,product_id,product_type,email,name,phone,state,expires_at,registration_data)
    values(p_environment,p_product_id,p_product_type,p_email,p_name,p_phone,
      case when p_paid then 'held' else 'confirmed' end,
      case when p_paid then date_trunc('second',now()) + interval '31 minutes' else null end,p_data)
    returning id into booking;
  insert into event_seats select booking,value->>'id' from jsonb_array_elements(p_events);
  return (select to_jsonb(b) from event_bookings b where id=booking);
end $$;

create function public.transition_event_booking(p_environment text,p_id uuid,p_state text,p_session_id text)
returns jsonb language plpgsql security definer set search_path=public as $$
declare b event_bookings;
begin
  perform pg_advisory_xact_lock(hashtextextended('event-capacity:' || p_environment,0));
  select * into b from event_bookings where id=p_id and environment=p_environment for update;
  if not found then raise exception 'Booking not found'; end if;
  if b.session_id is not null and b.session_id is distinct from p_session_id then raise exception 'Session mismatch'; end if;
  if p_state not in ('held','confirmed','released') then raise exception 'Invalid state'; end if;
  if b.state='released' and p_state='confirmed' then raise exception 'Released booking cannot be confirmed'; end if;
  update event_bookings set session_id=coalesce(session_id,p_session_id),
    state=case when state='confirmed' then state else p_state end where id=p_id;
  return (select to_jsonb(x) from event_bookings x where id=p_id);
end $$;
revoke all on function public.reserve_event_seats(text,text,text,text,text,text,jsonb,boolean,jsonb) from public, anon, authenticated;
revoke all on function public.transition_event_booking(text,uuid,text,text) from public, anon, authenticated;
grant execute on function public.reserve_event_seats(text,text,text,text,text,text,jsonb,boolean,jsonb) to service_role;
grant execute on function public.transition_event_booking(text,uuid,text,text) to service_role;
create function public.join_event_waitlist(p_environment text,p_product_id text,p_product_type text,
 p_email text,p_name text,p_phone text,p_events jsonb)
returns jsonb language plpgsql security definer set search_path=public as $$
declare e jsonb; full_event boolean := false; occupied integer; entry event_waitlist;
begin
 perform pg_advisory_xact_lock(hashtextextended('event-capacity:' || p_environment,0));
 if exists(select 1 from event_bookings b join event_seats s on b.id=s.booking_id
  where b.environment=p_environment and b.email=p_email and b.state in ('held','confirmed')
  and s.event_id in(select value->>'id' from jsonb_array_elements(p_events))) then
  return jsonb_build_object('error','existing_booking');
 end if;
 for e in select value from jsonb_array_elements(p_events) loop
  if (e->>'closed')::boolean then return jsonb_build_object('error','closed'); end if;
  select count(*) into occupied from event_seats s join event_bookings b on b.id=s.booking_id
   where s.event_id=e->>'id' and b.environment=p_environment and b.state in ('held','confirmed');
  if (e->>'waitlist')::boolean or (e->>'capacity' is not null and occupied >= (e->>'capacity')::integer) then full_event := true; end if;
 end loop;
 if not full_event then return jsonb_build_object('error','available'); end if;
 insert into event_waitlist(environment,product_id,product_type,email,name,phone)
 values(p_environment,p_product_id,p_product_type,p_email,p_name,p_phone)
 on conflict(environment,product_id,email) do update set name=excluded.name
 returning * into entry;
 return to_jsonb(entry);
end $$;
revoke all on function public.join_event_waitlist(text,text,text,text,text,text,jsonb) from public,anon,authenticated;
grant execute on function public.join_event_waitlist(text,text,text,text,text,text,jsonb) to service_role;
