create type public.membership_status as enum ('active', 'suspended', 'revoked');
create type public.membership_subscription_status as enum (
  'incomplete',
  'trialing',
  'active',
  'past_due',
  'paused',
  'canceled',
  'unpaid',
  'expired'
);
create type public.mailerlite_sync_status as enum ('pending', 'processing', 'synced', 'failed');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  avatar_url text,
  marketing_opt_in boolean not null default false,
  marketing_opt_in_at timestamptz,
  marketing_opt_out_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint profiles_full_name_length check (char_length(full_name) <= 120),
  constraint profiles_avatar_url_length check (avatar_url is null or char_length(avatar_url) <= 2048)
);

create table public.memberships (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  status public.membership_status not null default 'active',
  tier text not null default 'free',
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint memberships_tier_format check (tier ~ '^[a-z][a-z0-9_-]{1,31}$'),
  constraint memberships_end_after_start check (ended_at is null or ended_at >= started_at)
);

comment on table public.memberships is
  'Free DiasporaSpot registration. Paid benefit access is tracked separately in membership_subscriptions.';

create table public.membership_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  provider text not null default 'stripe',
  provider_customer_id text not null,
  provider_subscription_id text not null,
  plan_key text not null,
  status public.membership_subscription_status not null default 'incomplete',
  current_period_start timestamptz,
  current_period_end timestamptz,
  cancel_at_period_end boolean not null default false,
  canceled_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint membership_subscriptions_provider_format
    check (provider ~ '^[a-z][a-z0-9_-]{1,31}$'),
  constraint membership_subscriptions_plan_key_format
    check (plan_key ~ '^[a-z][a-z0-9_-]{1,63}$'),
  constraint membership_subscriptions_period_order
    check (
      current_period_start is null
      or current_period_end is null
      or current_period_end >= current_period_start
    ),
  unique (provider, provider_subscription_id)
);

create index membership_subscriptions_user_status_idx
  on public.membership_subscriptions (user_id, status, current_period_end desc);

comment on table public.membership_subscriptions is
  'Provider-backed paid subscriptions. Only active or trialing rows with a current period unlock member benefits.';

create table public.mailerlite_member_syncs (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  email text not null,
  full_name text not null default '',
  marketing_opt_in boolean not null default false,
  desired_in_members_group boolean not null default true,
  status public.mailerlite_sync_status not null default 'pending',
  attempts integer not null default 0,
  next_attempt_at timestamptz not null default now(),
  last_attempt_at timestamptz,
  last_error text,
  mailerlite_subscriber_id text,
  mailerlite_subscriber_status text,
  synced_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint mailerlite_member_syncs_email_length check (char_length(email) between 3 and 320),
  constraint mailerlite_member_syncs_full_name_length check (char_length(full_name) <= 120),
  constraint mailerlite_member_syncs_attempts_nonnegative check (attempts >= 0)
);

create index mailerlite_member_syncs_pending_idx
  on public.mailerlite_member_syncs (next_attempt_at, updated_at)
  where status in ('pending', 'failed', 'processing');

create table public.member_email_consent_events (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  opted_in boolean not null,
  source text not null,
  occurred_at timestamptz not null default now(),
  constraint member_email_consent_events_source_length check (char_length(source) between 1 and 64)
);

create index member_email_consent_events_user_idx
  on public.member_email_consent_events (user_id, occurred_at desc);

create function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create function public.is_active_member()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.memberships
    where user_id = (select auth.uid())
      and status = 'active'
      and (ended_at is null or ended_at > now())
  );
$$;

create function public.has_active_membership_subscription()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.membership_subscriptions
    where user_id = (select auth.uid())
      and status in ('active', 'trialing')
      and (current_period_end is null or current_period_end > now())
  );
$$;

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  member_name text;
  member_avatar text;
  member_marketing_opt_in boolean;
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

  insert into public.profiles (
    id,
    full_name,
    avatar_url,
    marketing_opt_in,
    marketing_opt_in_at
  )
  values (
    new.id,
    member_name,
    member_avatar,
    member_marketing_opt_in,
    case when member_marketing_opt_in then now() else null end
  );

  insert into public.memberships (user_id)
  values (new.id);

  insert into public.mailerlite_member_syncs (
    user_id,
    email,
    full_name,
    marketing_opt_in,
    desired_in_members_group
  )
  values (
    new.id,
    lower(coalesce(new.email, '')),
    member_name,
    member_marketing_opt_in,
    true
  );

  if member_marketing_opt_in then
    insert into public.member_email_consent_events (user_id, opted_in, source)
    values (new.id, true, 'signup');
  end if;

  return new;
end;
$$;

create function public.handle_profile_email_preferences()
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

  return new;
end;
$$;

create function public.queue_profile_mailerlite_sync()
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
    status = 'pending',
    next_attempt_at = now(),
    last_error = null,
    synced_at = null
  where user_id = new.id;

  if new.marketing_opt_in is distinct from old.marketing_opt_in then
    insert into public.member_email_consent_events (user_id, opted_in, source)
    values (new.id, new.marketing_opt_in, 'member_settings');
  end if;

  return new;
end;
$$;

create function public.queue_membership_mailerlite_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.mailerlite_member_syncs
  set
    desired_in_members_group = (
      new.status = 'active'
      and (new.ended_at is null or new.ended_at > now())
    ),
    status = 'pending',
    next_attempt_at = now(),
    last_error = null,
    synced_at = null
  where user_id = new.user_id;

  return new;
end;
$$;

create function public.queue_auth_email_mailerlite_sync()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.mailerlite_member_syncs
  set
    email = lower(coalesce(new.email, '')),
    status = 'pending',
    next_attempt_at = now(),
    last_error = null,
    synced_at = null
  where user_id = new.id;

  return new;
end;
$$;

create function public.claim_mailerlite_member_syncs(batch_size integer default 25)
returns setof public.mailerlite_member_syncs
language plpgsql
security definer
set search_path = ''
as $$
begin
  return query
  with candidates as (
    select sync.user_id
    from public.mailerlite_member_syncs as sync
    where (
      sync.status in ('pending', 'failed')
      or (sync.status = 'processing' and sync.last_attempt_at < now() - interval '15 minutes')
    )
      and sync.next_attempt_at <= now()
    order by sync.next_attempt_at, sync.updated_at
    limit greatest(1, least(coalesce(batch_size, 25), 100))
    for update skip locked
  )
  update public.mailerlite_member_syncs as sync
  set
    status = 'processing',
    attempts = sync.attempts + 1,
    last_attempt_at = now(),
    updated_at = now()
  from candidates
  where sync.user_id = candidates.user_id
  returning sync.*;
end;
$$;

create trigger profiles_set_email_preferences
  before update of marketing_opt_in on public.profiles
  for each row execute function public.handle_profile_email_preferences();

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

create trigger profiles_queue_mailerlite_sync
  after update of full_name, marketing_opt_in on public.profiles
  for each row execute function public.queue_profile_mailerlite_sync();

create trigger memberships_set_updated_at
  before update on public.memberships
  for each row execute function public.set_updated_at();

create trigger memberships_queue_mailerlite_sync
  after update of status, ended_at on public.memberships
  for each row execute function public.queue_membership_mailerlite_sync();

create trigger membership_subscriptions_set_updated_at
  before update on public.membership_subscriptions
  for each row execute function public.set_updated_at();

create trigger mailerlite_member_syncs_set_updated_at
  before update on public.mailerlite_member_syncs
  for each row execute function public.set_updated_at();

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

create trigger on_auth_user_email_updated
  after update of email on auth.users
  for each row
  when (old.email is distinct from new.email)
  execute function public.queue_auth_email_mailerlite_sync();

alter table public.profiles enable row level security;
alter table public.memberships enable row level security;
alter table public.membership_subscriptions enable row level security;
alter table public.mailerlite_member_syncs enable row level security;
alter table public.member_email_consent_events enable row level security;

create policy "Members can read their own profile"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

create policy "Members can update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

create policy "Members can read their own membership"
  on public.memberships for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Members can read their own subscriptions"
  on public.membership_subscriptions for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Members can read their own MailerLite sync"
  on public.mailerlite_member_syncs for select
  to authenticated
  using ((select auth.uid()) = user_id);

create policy "Members can read their own consent history"
  on public.member_email_consent_events for select
  to authenticated
  using ((select auth.uid()) = user_id);

revoke all on table public.profiles from anon, authenticated;
revoke all on table public.memberships from anon, authenticated;
revoke all on table public.membership_subscriptions from anon, authenticated;
revoke all on table public.mailerlite_member_syncs from anon, authenticated;
revoke all on table public.member_email_consent_events from anon, authenticated;

grant select on table public.profiles to authenticated;
grant update (full_name, avatar_url, marketing_opt_in) on table public.profiles to authenticated;
grant select on table public.memberships to authenticated;
grant select on table public.membership_subscriptions to authenticated;
grant select on table public.mailerlite_member_syncs to authenticated;
grant select on table public.member_email_consent_events to authenticated;

grant all on table public.profiles to service_role;
grant all on table public.memberships to service_role;
grant all on table public.membership_subscriptions to service_role;
grant all on table public.mailerlite_member_syncs to service_role;
grant all on table public.member_email_consent_events to service_role;
grant usage, select on sequence public.member_email_consent_events_id_seq to service_role;

revoke all on function public.is_active_member() from public, anon;
grant execute on function public.is_active_member() to authenticated, service_role;

revoke all on function public.has_active_membership_subscription() from public, anon;
grant execute on function public.has_active_membership_subscription() to authenticated, service_role;

revoke all on function public.claim_mailerlite_member_syncs(integer) from public, anon, authenticated;
grant execute on function public.claim_mailerlite_member_syncs(integer) to service_role;
