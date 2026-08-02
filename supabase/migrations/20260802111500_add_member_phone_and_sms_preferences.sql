alter table public.profiles
  add column phone_number text,
  add column sms_marketing_opt_in boolean not null default false,
  add column sms_marketing_opt_in_at timestamptz,
  add column sms_marketing_opt_out_at timestamptz,
  add constraint profiles_phone_number_e164
    check (phone_number is null or phone_number ~ '^\+[1-9][0-9]{7,14}$'),
  add constraint profiles_sms_marketing_requires_phone
    check (not sms_marketing_opt_in or phone_number is not null);

alter table public.mailerlite_member_syncs
  add column phone_number text,
  add column sms_marketing_opt_in boolean not null default false,
  add column sms_marketing_opt_in_at timestamptz,
  add constraint mailerlite_member_syncs_phone_number_e164
    check (phone_number is null or phone_number ~ '^\+[1-9][0-9]{7,14}$'),
  add constraint mailerlite_member_syncs_sms_marketing_requires_phone
    check (not sms_marketing_opt_in or phone_number is not null);

create table public.member_sms_consent_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  phone_number text not null,
  opted_in boolean not null,
  source text not null,
  occurred_at timestamptz not null default now(),
  constraint member_sms_consent_events_phone_number_e164
    check (phone_number ~ '^\+[1-9][0-9]{7,14}$'),
  constraint member_sms_consent_events_source_length
    check (char_length(source) between 1 and 64)
);

create index member_sms_consent_events_user_idx
  on public.member_sms_consent_events (user_id, occurred_at desc);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_name text;
  member_avatar text;
  member_marketing_opt_in boolean;
  member_phone_number text;
  member_sms_marketing_opt_in boolean;
begin
  member_name := left(
    trim(coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', '')),
    120
  );
  member_avatar := nullif(
    left(coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture', ''), 2048),
    ''
  );
  member_marketing_opt_in := lower(coalesce(new.raw_user_meta_data ->> 'marketing_opt_in', 'false')) in ('true', '1');
  member_phone_number := nullif(trim(coalesce(new.raw_user_meta_data ->> 'phone_number', '')), '');

  if member_phone_number is not null and member_phone_number !~ '^\+[1-9][0-9]{7,14}$' then
    member_phone_number := null;
  end if;

  member_sms_marketing_opt_in :=
    member_phone_number is not null
    and lower(coalesce(new.raw_user_meta_data ->> 'sms_marketing_opt_in', 'false')) in ('true', '1');

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    marketing_opt_in,
    marketing_opt_in_at,
    phone_number,
    sms_marketing_opt_in,
    sms_marketing_opt_in_at
  )
  values (
    new.id,
    member_name,
    member_avatar,
    member_marketing_opt_in,
    case when member_marketing_opt_in then now() else null end,
    member_phone_number,
    member_sms_marketing_opt_in,
    case when member_sms_marketing_opt_in then now() else null end
  );

  insert into public.memberships (user_id)
  values (new.id);

  insert into public.mailerlite_member_syncs (
    user_id,
    email,
    full_name,
    marketing_opt_in,
    phone_number,
    sms_marketing_opt_in,
    sms_marketing_opt_in_at,
    desired_in_members_group
  )
  values (
    new.id,
    lower(coalesce(new.email, '')),
    member_name,
    member_marketing_opt_in,
    member_phone_number,
    member_sms_marketing_opt_in,
    case when member_sms_marketing_opt_in then now() else null end,
    true
  );

  if member_marketing_opt_in then
    insert into public.member_email_consent_events (user_id, opted_in, source)
    values (new.id, true, 'signup');
  end if;

  if member_sms_marketing_opt_in and member_phone_number is not null then
    insert into public.member_sms_consent_events (user_id, phone_number, opted_in, source)
    values (new.id, member_phone_number, true, 'signup');
  end if;

  return new;
end;
$$;

create or replace function public.handle_profile_email_preferences()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    if new.marketing_opt_in then
      new.marketing_opt_in_at = now();
      new.marketing_opt_out_at = null;
    else
      new.marketing_opt_out_at = now();
    end if;
  end if;

  if new.sms_marketing_opt_in is distinct from old.sms_marketing_opt_in then
    if new.sms_marketing_opt_in then
      if new.phone_number is null then
        raise exception 'A phone number is required for SMS marketing consent.';
      end if;

      new.sms_marketing_opt_in_at = now();
      new.sms_marketing_opt_out_at = null;
    else
      new.sms_marketing_opt_out_at = now();
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.queue_profile_mailerlite_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.mailerlite_member_syncs
  set
    full_name = new.full_name,
    marketing_opt_in = new.marketing_opt_in,
    phone_number = new.phone_number,
    sms_marketing_opt_in = new.sms_marketing_opt_in,
    sms_marketing_opt_in_at = new.sms_marketing_opt_in_at,
    status = 'pending',
    next_attempt_at = now(),
    last_error = null,
    synced_at = null
  where user_id = new.id;

  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    insert into public.member_email_consent_events (user_id, opted_in, source)
    values (new.id, new.marketing_opt_in, 'member_settings');
  end if;

  if new.sms_marketing_opt_in is distinct from old.sms_marketing_opt_in then
    insert into public.member_sms_consent_events (user_id, phone_number, opted_in, source)
    values (
      new.id,
      coalesce(new.phone_number, old.phone_number),
      new.sms_marketing_opt_in,
      'member_settings'
    );
  end if;

  return new;
end;
$$;

drop trigger profiles_set_email_preferences on public.profiles;
create trigger profiles_set_email_preferences
  before update of marketing_opt_in, phone_number, sms_marketing_opt_in on public.profiles
  for each row execute function public.handle_profile_email_preferences();

drop trigger profiles_queue_mailerlite_sync on public.profiles;
create trigger profiles_queue_mailerlite_sync
  after update of full_name, marketing_opt_in, phone_number, sms_marketing_opt_in on public.profiles
  for each row execute function public.queue_profile_mailerlite_sync();

alter table public.member_sms_consent_events enable row level security;

create policy "Members can read their own SMS consent history"
  on public.member_sms_consent_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.member_sms_consent_events from anon, authenticated;
grant select on table public.member_sms_consent_events to authenticated;
grant update (phone_number, sms_marketing_opt_in) on table public.profiles to authenticated;

grant all on table public.member_sms_consent_events to service_role;
grant usage, select on sequence public.member_sms_consent_events_id_seq to service_role;

update public.mailerlite_member_syncs as sync
set
  phone_number = profile.phone_number,
  sms_marketing_opt_in = profile.sms_marketing_opt_in,
  sms_marketing_opt_in_at = profile.sms_marketing_opt_in_at
from public.profiles as profile
where sync.user_id = profile.id;
