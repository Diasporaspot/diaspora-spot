'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import { requestMailerLiteMemberSync } from '@/lib/supabase/sync-mailerlite';
import {
  isValidInternationalPhoneNumber,
  normalizeInternationalPhoneNumber,
} from '@/lib/phone';

const avatarSignatures = {
  'image/jpeg': (bytes: Uint8Array) => bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff,
  'image/png': (bytes: Uint8Array) =>
    bytes[0] === 0x89
    && bytes[1] === 0x50
    && bytes[2] === 0x4e
    && bytes[3] === 0x47,
  'image/webp': (bytes: Uint8Array) =>
    String.fromCharCode(...bytes.slice(0, 4)) === 'RIFF'
    && String.fromCharCode(...bytes.slice(8, 12)) === 'WEBP',
} as const;

async function isValidAvatar(file: File) {
  const validator = avatarSignatures[file.type as keyof typeof avatarSignatures];

  if (!validator || file.size > 2 * 1024 * 1024) {
    return false;
  }

  const bytes = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return validator(bytes);
}

export async function updateMemberProfile(formData: FormData) {
  if (!isSupabaseConfigured()) {
    redirect('/members?error=configuration');
  }

  const fullName = String(formData.get('full_name') ?? '').trim();
  const phoneNumber = normalizeInternationalPhoneNumber(formData.get('phone_number'));
  const avatar = formData.get('avatar');

  if (!fullName || fullName.length > 120) {
    redirect('/members?error=profile');
  }

  if (phoneNumber && !isValidInternationalPhoneNumber(phoneNumber)) {
    redirect('/members?error=phone');
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    redirect('/members?error=authentication');
  }

  const profileUpdate: {
    avatar_url?: string;
    full_name: string;
    phone_number: string | null;
    sms_marketing_opt_in?: boolean;
  } = {
    full_name: fullName,
    phone_number: phoneNumber || null,
  };

  if (!phoneNumber) {
    profileUpdate.sms_marketing_opt_in = false;
  }

  if (avatar instanceof File && avatar.size > 0) {
    if (!(await isValidAvatar(avatar))) {
      redirect('/members?error=avatar');
    }

    const avatarPath = `${userId}/avatar`;
    const { error: uploadError } = await supabase.storage
      .from('member-avatars')
      .upload(avatarPath, avatar, {
        cacheControl: '300',
        contentType: avatar.type,
        upsert: true,
      });

    if (uploadError) {
      redirect('/members?error=avatar');
    }

    profileUpdate.avatar_url = avatarPath;
  }

  const { error } = await supabase
    .from('profiles')
    .update(profileUpdate)
    .eq('id', userId);

  if (error) {
    redirect('/members?error=profile');
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    await requestMailerLiteMemberSync(session.access_token);
  }

  revalidatePath('/members');
  redirect('/members?updated=profile');
}

export async function setMarketingPreference(enabled: boolean) {
  if (!isSupabaseConfigured()) {
    return { message: 'Email preferences are not available right now.', ok: false };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return { message: 'Your session has expired. Sign in again to continue.', ok: false };
  }

  const { error } = await supabase
    .from('profiles')
    .update({ marketing_opt_in: enabled })
    .eq('id', userId);

  if (error) {
    return { message: 'We could not update your email preference. Try again.', ok: false };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    await requestMailerLiteMemberSync(session.access_token);
  }

  revalidatePath('/members');
  return { message: '', ok: true };
}

export async function setSmsMarketingPreference(enabled: boolean) {
  if (!isSupabaseConfigured()) {
    return { message: 'SMS preferences are not available right now.', ok: false };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return { message: 'Your session has expired. Sign in again to continue.', ok: false };
  }

  if (enabled) {
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('phone_number')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.phone_number) {
      return { message: 'Add and save your mobile number before enabling SMS updates.', ok: false };
    }
  }

  const { error } = await supabase
    .from('profiles')
    .update({ sms_marketing_opt_in: enabled })
    .eq('id', userId);

  if (error) {
    return { message: 'We could not update your SMS preference. Try again.', ok: false };
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session?.access_token) {
    await requestMailerLiteMemberSync(session.access_token);
  }

  revalidatePath('/members');
  return { message: '', ok: true };
}

export async function signOutMember() {
  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    await supabase.auth.signOut();
  }

  revalidatePath('/', 'layout');
  redirect('/members');
}
