alter table public.event_waitlist
  add column if not exists registration_data jsonb not null default '{}';

create or replace function public.reserve_event_seats(p_environment text, p_product_id text, p_product_type text,
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
    occupied := occupied + coalesce((e->>'existingRegistrations')::integer, 0);
    if (e->>'closed')::boolean then return jsonb_build_object('error','closed'); end if;
    if e->>'capacity' is not null and occupied >= (e->>'capacity')::integer then
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

drop function if exists public.join_event_waitlist(text,text,text,text,text,text,jsonb);
create function public.join_event_waitlist(p_environment text,p_product_id text,p_product_type text,
 p_email text,p_name text,p_phone text,p_events jsonb,p_data jsonb)
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
  occupied := occupied + coalesce((e->>'existingRegistrations')::integer, 0);
  if e->>'capacity' is not null and occupied >= (e->>'capacity')::integer then full_event := true; end if;
 end loop;
 if not full_event then return jsonb_build_object('error','available'); end if;
 insert into event_waitlist(environment,product_id,product_type,email,name,phone,registration_data)
 values(p_environment,p_product_id,p_product_type,p_email,p_name,p_phone,p_data)
 on conflict(environment,product_id,email) do update set name=excluded.name, registration_data=excluded.registration_data
 returning * into entry;
 return to_jsonb(entry);
end $$;
revoke all on function public.join_event_waitlist(text,text,text,text,text,text,jsonb,jsonb) from public,anon,authenticated;
grant execute on function public.join_event_waitlist(text,text,text,text,text,text,jsonb,jsonb) to service_role;
