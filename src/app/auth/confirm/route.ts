import type { EmailOtpType, Session } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { requestMailerLiteMemberSync } from '@/lib/supabase/sync-mailerlite';
import {
  isValidInternationalPhoneNumber,
  normalizeInternationalPhoneNumber,
} from '@/lib/phone';

function getSafeNext(value: string | null) {
  return value?.startsWith('/') && !value.startsWith('//') ? value : '/members';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const next = getSafeNext(url.searchParams.get('next'));

  if (!isSupabaseConfigured()) {
    return NextResponse.redirect(new URL('/members?error=configuration', url.origin));
  }

  const tokenHash = url.searchParams.get('token_hash');
  const type = url.searchParams.get('type') as EmailOtpType | null;
  const code = url.searchParams.get('code');
  const supabase = await createClient();
  let session: Session | null = null;

  if (code) {
    const { data, error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      session = data.session;
    }
  } else if (tokenHash && type) {
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: tokenHash, type });

    if (!error) {
      session = data.session;
    }
  }

  if (session) {
    const metadataPhone = normalizeInternationalPhoneNumber(session.user.user_metadata.phone_number);
    const profileUpdate: {
      marketing_opt_in?: boolean;
      phone_number?: string;
      sms_marketing_opt_in?: boolean;
    } = {};

    if (url.searchParams.get('marketing') === '1') {
      profileUpdate.marketing_opt_in = true;
    }

    if (isValidInternationalPhoneNumber(metadataPhone)) {
      profileUpdate.phone_number = metadataPhone;

      if (url.searchParams.get('sms_marketing') === '1') {
        profileUpdate.sms_marketing_opt_in = true;
      }
    }

    if (Object.keys(profileUpdate).length) {
      await supabase
        .from('profiles')
        .update(profileUpdate)
        .eq('id', session.user.id);
    }

    await requestMailerLiteMemberSync(session.access_token);
    return NextResponse.redirect(new URL(next, url.origin));
  }

  return NextResponse.redirect(new URL('/members?error=authentication', url.origin));
}
