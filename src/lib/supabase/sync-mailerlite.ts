import 'server-only';

import { getSupabasePublicConfig } from '@/lib/supabase/config';

export async function requestMailerLiteMemberSync(accessToken: string) {
  const { url } = getSupabasePublicConfig();

  try {
    const response = await fetch(`${url}/functions/v1/sync-mailerlite-members`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      cache: 'no-store',
      signal: AbortSignal.timeout(5000),
    });

    if (!response.ok) {
      console.error('MailerLite member sync request failed.', response.status);
    }
  } catch (reason) {
    console.error('MailerLite member sync request could not be completed.', reason);
  }
}
