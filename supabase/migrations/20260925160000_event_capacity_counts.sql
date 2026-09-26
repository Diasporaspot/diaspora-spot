create function public.event_capacity_counts(p_environment text,p_event_ids text[])
returns table(event_id text,confirmed bigint,held bigint,waiting bigint)
language sql security definer set search_path=public as $$
 select e,
  (select count(*) from event_seats s join event_bookings b on b.id=s.booking_id where s.event_id=e and b.environment=p_environment and b.state='confirmed'),
  (select count(*) from event_seats s join event_bookings b on b.id=s.booking_id where s.event_id=e and b.environment=p_environment and b.state='held'),
  (select count(*) from event_waitlist w where w.product_id=e and w.environment=p_environment and w.state='waiting')
 from unnest(p_event_ids) e;
$$;
revoke all on function public.event_capacity_counts(text,text[]) from public,anon,authenticated;
grant execute on function public.event_capacity_counts(text,text[]) to service_role;
