import Image from 'next/image';
import { BadgeCheck, Check, LogOut, Mail, Phone, ShieldCheck, Sparkles } from 'lucide-react';
import Footer from '@/components/Footer/Footer';
import Topbar from '@/components/Topbar/Topbar';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createClient } from '@/lib/supabase/server';
import AvatarField from './AvatarField';
import MarketingPreferenceCard from './MarketingPreferenceCard';
import MemberAuthForm from './MemberAuthForm';
import ProfileSaveButton from './ProfileSaveButton';
import SmsPreferenceCard from './SmsPreferenceCard';
import { signOutMember, updateMemberProfile } from './actions';
import styles from './members.module.css';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Members | DiasporaSpot',
  description: 'Register free with DiasporaSpot and subscribe to unlock member benefits.',
};

type MembersPageProps = {
  searchParams: Promise<{ error?: string; updated?: string }>;
};

function JoinView({ configured }: { configured: boolean }) {
  return (
    <>
      <section className={styles.hero}>
        <div className={`wrap ${styles.heroGrid}`}>
          <div className={styles.heroCopy}>
            <span className={`${styles.eyebrow} ${styles.typewriter}`}>
              DiasporaSpot membership
            </span>
            <h1>More support for your life abroad.</h1>
            <p>
              Create your free member account to stay connected. A membership subscription unlocks
              workshop discounts, members-only events, and more support for life abroad.
            </p>
            <ul className={styles.perkList}>
              <li><Check size={17} /> Free DiasporaSpot member account</li>
              <li><Check size={17} /> Subscribe to unlock workshop discounts</li>
              <li><Check size={17} /> Subscriber access to members-only events</li>
            </ul>
          </div>
          <div className={styles.joinCard}>
            <span className={styles.cardEyebrow}>DiasporaSpot members</span>
            <h2>Member access</h2>
            <p className={styles.cardIntro}>Create an account or sign in with a secure email link.</p>
            {configured ? (
              <MemberAuthForm />
            ) : (
              <div className={styles.setupNotice}>
                Membership signup is being connected. Please check back shortly.
              </div>
            )}
          </div>
        </div>
      </section>
      <section className={`wrap ${styles.trustSection}`}>
        <div><ShieldCheck size={24} /><h3>Secure by design</h3><p>Passwordless email authentication through Supabase.</p></div>
        <div><Mail size={24} /><h3>You stay in control</h3><p>Optional news and offers can be changed from your member account.</p></div>
        <div><Sparkles size={24} /><h3>Upgrade when ready</h3><p>Your free account can carry a paid subscription without another registration.</p></div>
      </section>
    </>
  );
}

function formatPlanName(value: string) {
  return value
    .replaceAll(/[-_]/g, ' ')
    .replaceAll(/\b\w/g, (character) => character.toUpperCase());
}

export default async function MembersPage({ searchParams }: MembersPageProps) {
  const params = await searchParams;
  const configured = isSupabaseConfigured();
  let userId: string | undefined;
  let email = '';

  if (configured) {
    const supabase = await createClient();
    const { data } = await supabase.auth.getClaims();
    userId = data?.claims?.sub;
    email = typeof data?.claims?.email === 'string' ? data.claims.email : '';

    if (userId) {
      const [{ data: profile }, { data: membership }, { data: subscription }] = await Promise.all([
        supabase
          .from('profiles')
          .select('avatar_url,full_name,marketing_opt_in,phone_number,sms_marketing_opt_in,created_at,updated_at')
          .eq('id', userId)
          .single(),
        supabase
          .from('memberships')
          .select('status,tier,started_at')
          .eq('user_id', userId)
          .single(),
        supabase
          .from('membership_subscriptions')
          .select('plan_key,current_period_end')
          .eq('user_id', userId)
          .in('status', ['active', 'trialing'])
          .order('current_period_end', { ascending: false, nullsFirst: true })
          .limit(1)
          .maybeSingle(),
      ]);

      if (profile && membership) {
        const benefitsUnlocked = Boolean(
          subscription
          && (!subscription.current_period_end || new Date(subscription.current_period_end) > new Date()),
        );
        const planName = formatPlanName(subscription?.plan_key ?? membership.tier);
        const avatarSrc = profile.avatar_url
          ? `/members/avatar?v=${encodeURIComponent(profile.updated_at)}`
          : undefined;
        const firstName = profile.full_name?.split(' ')[0] || 'there';

        return (
          <div className={styles.page}>
            <Topbar />
            <main>
              <section className={styles.accountHero}>
                <div className="wrap">
                  <span className={styles.eyebrow}>Member account</span>
                  <h1>Welcome back, {firstName}.</h1>
                  <p>
                    Manage your profile, communication preferences, and membership from one place.
                  </p>
                </div>
              </section>
              <section className={`wrap ${styles.accountShell}`}>
                <aside className={styles.memberCard}>
                  <div className={styles.memberProfileHeader}>
                    <div className={styles.memberAvatar}>
                      <span>{firstName.charAt(0).toUpperCase()}</span>
                      {avatarSrc ? (
                        <Image
                          alt={`${profile.full_name || 'Member'} profile photo`}
                          className={styles.avatarImage}
                          fill
                          sizes="64px"
                          src={avatarSrc}
                        />
                      ) : null}
                    </div>
                    <div className={styles.memberIdentityCopy}>
                      <h2>{profile.full_name || email}</h2>
                      <span className={`${styles.memberStatus} ${membership.status === 'active' ? styles.memberStatusActive : ''}`}>
                        <BadgeCheck size={12} /> {membership.status}
                      </span>
                    </div>
                  </div>
                  <p className={styles.memberEmail} title={email}>
                    <Mail aria-hidden="true" size={14} />
                    <span>{email}</span>
                  </p>
                  <p className={styles.memberEmail} title={profile.phone_number || 'No mobile number'}>
                    <Phone aria-hidden="true" size={14} />
                    <span>{profile.phone_number || 'Add your mobile number'}</span>
                  </p>
                  <dl className={styles.memberFacts}>
                    <div><dt>Membership plan</dt><dd>{planName}</dd></div>
                    <div><dt>Member since</dt><dd>{new Intl.DateTimeFormat('en', { month: 'long', year: 'numeric' }).format(new Date(membership.started_at))}</dd></div>
                    <div><dt>Account status</dt><dd>{membership.status}</dd></div>
                  </dl>
                  <form action={signOutMember} className={styles.signOutForm}>
                    <button className={styles.signOutButton} type="submit"><LogOut size={15} /> Sign out</button>
                  </form>
                </aside>

                <div className={styles.accountContent}>
                  <section className={styles.settingsCard}>
                    <div className={styles.panelHeader}>
                      <div>
                        <span className={styles.cardEyebrow}>Profile</span>
                        <h2>Personal details</h2>
                      </div>
                      <p>Keep the information connected to your membership up to date.</p>
                    </div>
                    {params.updated === 'profile' ? <p className={styles.successMessage}>Your profile was updated.</p> : null}
                    {params.error === 'profile' ? <p className={styles.formError}>We could not save those changes.</p> : null}
                    {params.error === 'phone' ? <p className={styles.formError}>Enter a valid mobile number including the country code, or leave it blank.</p> : null}
                    {params.error === 'avatar' ? <p className={styles.formError}>That photo could not be uploaded. Use a JPG, PNG, or WebP image under 2 MB.</p> : null}
                    <form action={updateMemberProfile} className={styles.settingsForm}>
                      <AvatarField avatarSrc={avatarSrc} name={profile.full_name} />
                      <div className={styles.fieldGrid}>
                        <label>
                          <span>Full name</span>
                          <input autoComplete="name" defaultValue={profile.full_name} maxLength={120} name="full_name" required />
                        </label>
                        <label>
                          <span>Sign-in email</span>
                          <input autoComplete="email" className={styles.readOnlyInput} readOnly type="email" value={email} />
                          <small>Your secure sign-in links are sent to this address.</small>
                        </label>
                        <label className={styles.phoneField}>
                          <span>Mobile number <em>(optional)</em></span>
                          <input
                            autoComplete="tel"
                            defaultValue={profile.phone_number || ''}
                            inputMode="tel"
                            name="phone_number"
                            placeholder="+44 7911 123456"
                            type="tel"
                          />
                          <small>Include your country code. Add this to receive SMS updates, or leave it blank.</small>
                        </label>
                      </div>
                      <div className={styles.formFooter}>
                        <span>Changes are saved securely to your member profile.</span>
                        <ProfileSaveButton />
                      </div>
                    </form>
                  </section>

                  <MarketingPreferenceCard initialValue={profile.marketing_opt_in} />
                  <SmsPreferenceCard
                    hasPhoneNumber={Boolean(profile.phone_number)}
                    initialValue={profile.sms_marketing_opt_in}
                  />

                  <section className={styles.upgradeCard}>
                  <div className={styles.upgradeCopy}>
                    <span className={styles.cardEyebrow}>Membership plan</span>
                    <h2>{benefitsUnlocked ? `${planName} membership` : 'You are on the free plan'}</h2>
                    <p>
                      {benefitsUnlocked
                        ? 'Your membership benefits are active and connected to this account.'
                        : 'Upgrade when paid membership launches to unlock additional support for life abroad.'}
                    </p>
                    <ul>
                      <li><Check size={15} /> Workshop discounts</li>
                      <li><Check size={15} /> Members-only events</li>
                      <li><Check size={15} /> New member resources</li>
                    </ul>
                  </div>
                  <div className={styles.upgradeAction}>
                    <span>Current plan</span>
                    <strong>{planName}</strong>
                    <div className={styles.upgradeAvailability}>
                      <Sparkles aria-hidden="true" size={18} />
                      <div>
                        <b>{benefitsUnlocked ? 'Plan management coming soon' : 'Paid upgrades coming soon'}</b>
                        <small>Checkout and billing controls will appear here when subscriptions launch.</small>
                      </div>
                    </div>
                  </div>
                  </section>
                </div>
              </section>
            </main>
            <Footer />
          </div>
        );
      }
    }
  }

  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        {params.error === 'authentication' ? (
          <div className={styles.pageAlert}>That sign-in link was invalid or expired. Please try again.</div>
        ) : null}
        <JoinView configured={configured} />
      </main>
      <Footer />
    </div>
  );
}
