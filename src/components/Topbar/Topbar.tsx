import Navigation from '@/components/mainNav/Navigation';
import MobileNavigationHeader from '@/components/mobileNav/MobileNavigationHeader';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';

async function Topbar() {
  let isSignedIn = false;

  if (isSupabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    isSignedIn = Boolean(data?.claims?.sub);
  }

  return (
    <>
      <Navigation isSignedIn={isSignedIn} />
      <MobileNavigationHeader isSignedIn={isSignedIn} />
    </>
  );
}

export default Topbar;
