import { createClient, type User } from '@supabase/supabase-js';

type SyncJob = {
  attempts: number;
  desired_in_members_group: boolean;
  email: string;
  full_name: string;
  marketing_opt_in: boolean;
  phone_number: string | null;
  sms_marketing_opt_in: boolean;
  sms_marketing_opt_in_at: string | null;
  user_id: string;
};

type MailerLiteSubscriber = {
  id: string;
  status?: string;
};

type MailerLiteResponse = {
  data?: MailerLiteSubscriber;
  error?: string;
  message?: string;
  errors?: Record<string, string[]>;
};

const corsHeaders = {
  'Access-Control-Allow-Headers': 'authorization, content-type, x-mailerlite-sync-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Origin': '*',
};

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
}

function requireEnv(name: string) {
  const value = Deno.env.get(name);

  if (!value) {
    throw new Error(`${name} is not configured.`);
  }

  return value;
}

function requireSupabaseProjectKey(modernName: string, legacyName: string) {
  const modernValue = Deno.env.get(modernName);

  if (modernValue) {
    try {
      const keys = JSON.parse(modernValue) as Record<string, string>;
      const key = keys.default ?? Object.values(keys)[0];

      if (key) {
        return key;
      }
    } catch {
      throw new Error(`${modernName} is invalid.`);
    }
  }

  return requireEnv(legacyName);
}

async function parseMailerLiteError(response: Response) {
  let body: MailerLiteResponse | undefined;

  try {
    body = (await response.json()) as MailerLiteResponse;
  } catch {
    body = undefined;
  }

  const validationMessage = body?.errors ? Object.values(body.errors).flat().join(' ') : '';
  return validationMessage || body?.message || body?.error || `MailerLite returned ${response.status}.`;
}

async function mailerLiteRequest(
  apiKey: string,
  path: string,
  init: RequestInit = {},
) {
  const response = await fetch(`https://connect.mailerlite.com/api${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await parseMailerLiteError(response));
  }

  return response;
}

async function fetchSubscriber(apiKey: string, email: string) {
  const response = await fetch(
    `https://connect.mailerlite.com/api/subscribers/${encodeURIComponent(email)}`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(await parseMailerLiteError(response));
  }

  const body = (await response.json()) as MailerLiteResponse;
  return body.data ?? null;
}

async function removeFromGroup(apiKey: string, subscriberId: string, groupId?: string) {
  if (!groupId) {
    return;
  }

  const response = await fetch(
    `https://connect.mailerlite.com/api/subscribers/${subscriberId}/groups/${groupId}`,
    {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
    },
  );

  if (!response.ok && response.status !== 404) {
    throw new Error(await parseMailerLiteError(response));
  }
}

async function syncJob({
  apiKey,
  job,
  marketingGroupId,
  membersGroupId,
  smsMarketingGroupId,
}: {
  apiKey: string;
  job: SyncJob;
  marketingGroupId?: string;
  membersGroupId: string;
  smsMarketingGroupId: string;
}) {
  if (!job.desired_in_members_group) {
    const subscriber = await fetchSubscriber(apiKey, job.email);

    if (subscriber) {
      await removeFromGroup(apiKey, subscriber.id, membersGroupId);
      await removeFromGroup(apiKey, subscriber.id, marketingGroupId);
      await removeFromGroup(apiKey, subscriber.id, smsMarketingGroupId);
    }

    return subscriber;
  }

  const groups = [
    membersGroupId,
    ...(job.marketing_opt_in && marketingGroupId ? [marketingGroupId] : []),
    ...(job.sms_marketing_opt_in ? [smsMarketingGroupId] : []),
  ];
  const response = await mailerLiteRequest(apiKey, '/subscribers', {
    method: 'POST',
    body: JSON.stringify({
      email: job.email,
      fields: {
        name: job.full_name,
        ...(job.phone_number ? { phone: job.phone_number } : {}),
        sms_marketing_consent: job.sms_marketing_opt_in ? 'yes' : 'no',
        ...(job.sms_marketing_opt_in_at
          ? { sms_consent_at: job.sms_marketing_opt_in_at }
          : {}),
        sms_consent_source: 'member_profile',
      },
      groups,
    }),
  });
  const body = (await response.json()) as MailerLiteResponse;

  if (!body.data?.id) {
    throw new Error('MailerLite returned an invalid subscriber response.');
  }

  if (!job.marketing_opt_in) {
    await removeFromGroup(apiKey, body.data.id, marketingGroupId);
  }

  if (!job.sms_marketing_opt_in) {
    await removeFromGroup(apiKey, body.data.id, smsMarketingGroupId);
  }

  return body.data;
}

async function getAuthenticatedUser(request: Request, supabaseUrl: string, anonKey: string) {
  const authorization = request.headers.get('Authorization');

  if (!authorization?.startsWith('Bearer ')) {
    return null;
  }

  const token = authorization.slice('Bearer '.length);
  const authClient = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
  const {
    data: { user },
    error,
  } = await authClient.auth.getUser(token);

  return error ? null : user;
}

async function claimUserJob(admin: ReturnType<typeof createClient>, user: User) {
  const { data: existing, error: fetchError } = await admin
    .from('mailerlite_member_syncs')
    .select('user_id,email,full_name,marketing_opt_in,phone_number,sms_marketing_opt_in,sms_marketing_opt_in_at,desired_in_members_group,attempts,status')
    .eq('user_id', user.id)
    .maybeSingle();

  if (fetchError) {
    throw fetchError;
  }

  if (!existing || existing.status === 'synced') {
    return [];
  }

  const { data, error } = await admin
    .from('mailerlite_member_syncs')
    .update({
      attempts: existing.attempts + 1,
      last_attempt_at: new Date().toISOString(),
      status: 'processing',
    })
    .eq('user_id', user.id)
    .select('user_id,email,full_name,marketing_opt_in,phone_number,sms_marketing_opt_in,sms_marketing_opt_in_at,desired_in_members_group,attempts');

  if (error) {
    throw error;
  }

  return (data ?? []) as SyncJob[];
}

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  if (request.method !== 'POST') {
    return json({ error: 'Method not allowed.' }, 405);
  }

  try {
    const supabaseUrl = requireEnv('SUPABASE_URL');
    const serviceRoleKey = requireSupabaseProjectKey(
      'SUPABASE_SECRET_KEYS',
      'SUPABASE_SERVICE_ROLE_KEY',
    );
    const anonKey = requireSupabaseProjectKey(
      'SUPABASE_PUBLISHABLE_KEYS',
      'SUPABASE_ANON_KEY',
    );
    const apiKey = requireEnv('MAILERLITE_API_KEY');
    const membersGroupId = requireEnv('MAILERLITE_MEMBERS_GROUP_ID');
    const marketingGroupId = Deno.env.get('MAILERLITE_MEMBER_MARKETING_GROUP_ID') || undefined;
    const smsMarketingGroupId = requireEnv('MAILERLITE_SMS_MARKETING_GROUP_ID');
    const configuredSyncSecret = Deno.env.get('MAILERLITE_SYNC_SECRET');
    const suppliedSyncSecret = request.headers.get('x-mailerlite-sync-secret');
    const isBatchRequest = Boolean(
      configuredSyncSecret && suppliedSyncSecret && suppliedSyncSecret === configuredSyncSecret,
    );
    const admin = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });
    let jobs: SyncJob[];

    if (isBatchRequest) {
      const { data, error } = await admin.rpc('claim_mailerlite_member_syncs', { batch_size: 25 });

      if (error) {
        throw error;
      }

      jobs = (data ?? []) as SyncJob[];
    } else {
      const user = await getAuthenticatedUser(request, supabaseUrl, anonKey);

      if (!user) {
        return json({ error: 'Unauthorized.' }, 401);
      }

      jobs = await claimUserJob(admin, user);
    }

    let synced = 0;
    let failed = 0;

    for (const job of jobs) {
      try {
        const subscriber = await syncJob({
          apiKey,
          job,
          marketingGroupId,
          membersGroupId,
          smsMarketingGroupId,
        });
        const { error } = await admin
          .from('mailerlite_member_syncs')
          .update({
            last_error: null,
            mailerlite_subscriber_id: subscriber?.id ?? null,
            mailerlite_subscriber_status: subscriber?.status ?? null,
            status: 'synced',
            synced_at: new Date().toISOString(),
          })
          .eq('user_id', job.user_id);

        if (error) {
          throw error;
        }

        synced += 1;
      } catch (reason) {
        const message = reason instanceof Error ? reason.message : 'Unknown MailerLite sync error.';
        const retrySeconds = Math.min(3600, 60 * 2 ** Math.min(job.attempts, 6));
        const { error } = await admin
          .from('mailerlite_member_syncs')
          .update({
            last_error: message.slice(0, 1000),
            next_attempt_at: new Date(Date.now() + retrySeconds * 1000).toISOString(),
            status: 'failed',
          })
          .eq('user_id', job.user_id);

        if (error) {
          console.error('Could not record MailerLite sync failure.', error);
        }

        failed += 1;
      }
    }

    return json({ claimed: jobs.length, failed, synced });
  } catch (reason) {
    console.error('MailerLite member sync failed.', reason);
    return json({ error: 'MailerLite member sync failed.' }, 500);
  }
});
