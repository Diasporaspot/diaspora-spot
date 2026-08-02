import { NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

export async function GET() {
  if (!isSupabaseConfigured()) {
    return new NextResponse(null, { status: 404 });
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (!userId) {
    return new NextResponse(null, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('avatar_url')
    .eq('id', userId)
    .single();

  if (!profile?.avatar_url) {
    return new NextResponse(null, { status: 404 });
  }

  const { data: avatar, error } = await supabase.storage
    .from('member-avatars')
    .download(profile.avatar_url);

  if (error || !avatar) {
    return new NextResponse(null, { status: 404 });
  }

  return new NextResponse(avatar, {
    headers: {
      'Cache-Control': 'private, max-age=300',
      'Content-Security-Policy': "default-src 'none'; sandbox",
      'Content-Type': avatar.type || 'application/octet-stream',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
