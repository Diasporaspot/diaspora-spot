'use client';

import { useState, type FormEvent } from 'react';
import { ArrowRight, Check, Mail } from 'lucide-react';
import Link from 'next/link';
import {
  isValidInternationalPhoneNumber,
  normalizeInternationalPhoneNumber,
} from '@/lib/phone';
import { createClient } from '@/lib/supabase/client';
import styles from './members.module.css';

function getAuthRedirect(marketingOptIn: boolean, smsMarketingOptIn: boolean) {
  const url = new URL('/auth/confirm', window.location.origin);
  url.searchParams.set('next', '/members');
  url.searchParams.set('marketing', marketingOptIn ? '1' : '0');
  url.searchParams.set('sms_marketing', smsMarketingOptIn ? '1' : '0');
  return url.toString();
}

export default function MemberAuthForm() {
  const [mode, setMode] = useState<'join' | 'sign-in'>('join');
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [marketingOptIn, setMarketingOptIn] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [smsMarketingOptIn, setSmsMarketingOptIn] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function continueWithEmail(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setEmailSent(false);

    const normalizedName = fullName.trim();
    const normalizedEmail = email.trim().toLowerCase();
    const normalizedPhone = normalizeInternationalPhoneNumber(phoneNumber);
    const isJoining = mode === 'join';

    if (isJoining && !normalizedName) {
      setError('Enter your full name.');
      return;
    }

    if (!normalizedEmail) {
      setError('Enter your email address.');
      return;
    }

    if (isJoining && normalizedPhone && !isValidInternationalPhoneNumber(normalizedPhone)) {
      setError('Enter a valid mobile number including the country code.');
      return;
    }

    if (isJoining && smsMarketingOptIn && !normalizedPhone) {
      setError('Add your mobile number to receive SMS updates.');
      return;
    }

    setPending(true);

    try {
      const supabase = createClient();
      const { error: authError } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          ...(isJoining
            ? {
                data: {
                  full_name: normalizedName,
                  marketing_opt_in: marketingOptIn,
                  phone_number: normalizedPhone || null,
                  sms_marketing_opt_in: smsMarketingOptIn,
                },
              }
            : {}),
          emailRedirectTo: getAuthRedirect(
            isJoining && marketingOptIn,
            isJoining && smsMarketingOptIn,
          ),
          shouldCreateUser: isJoining,
        },
      });

      if (authError) {
        throw authError;
      }

      setEmailSent(true);
    } catch {
      setError('We could not send your secure sign-in link. Please try again.');
    } finally {
      setPending(false);
    }
  }

  if (emailSent) {
    return (
      <div className={styles.sentState} role="status">
        <span className={styles.sentIcon}>
          <Check size={22} strokeWidth={2} />
        </span>
        <div>
          <h2>Check your inbox</h2>
          <p>
            We sent a secure DiasporaSpot {mode === 'join' ? 'account confirmation' : 'sign-in'} link
            to {email.trim().toLowerCase()}.
          </p>
        </div>
        <button className={styles.textButton} onClick={() => setEmailSent(false)} type="button">
          Use another email
        </button>
      </div>
    );
  }

  return (
    <div className={styles.authPanel}>
      <div
        className={`${styles.authMode} ${mode === 'sign-in' ? styles.authModeSignIn : ''}`}
        role="tablist"
        aria-label="Member access options"
      >
        <button
          aria-selected={mode === 'join'}
          className={mode === 'join' ? styles.authModeActive : ''}
          onClick={() => {
            setMode('join');
            setError('');
          }}
          role="tab"
          type="button"
        >
          Create account
        </button>
        <button
          aria-selected={mode === 'sign-in'}
          className={mode === 'sign-in' ? styles.authModeActive : ''}
          onClick={() => {
            setMode('sign-in');
            setError('');
          }}
          role="tab"
          type="button"
        >
          Sign in
        </button>
      </div>
      <form className={styles.authForm} onSubmit={continueWithEmail}>
        {mode === 'join' ? (
          <label>
            <span>Full name</span>
            <input
              autoComplete="name"
              maxLength={120}
              onChange={(event) => setFullName(event.target.value)}
              placeholder="Your full name"
              required
              value={fullName}
            />
          </label>
        ) : null}
        <label>
          <span>Email address</span>
          <input
            autoComplete="email"
            inputMode="email"
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            required
            type="email"
            value={email}
          />
        </label>
        {mode === 'join' ? (
          <>
            <label>
              <span>Mobile number <em>(optional)</em></span>
              <input
                autoComplete="tel"
                inputMode="tel"
                onChange={(event) => {
                  setPhoneNumber(event.target.value);
                  if (!event.target.value.trim()) {
                    setSmsMarketingOptIn(false);
                  }
                }}
                placeholder="+44 7911 123456"
                type="tel"
                value={phoneNumber}
              />
              <small>Include your country code. You can also add this later from your profile.</small>
            </label>

            <label className={styles.consentRow}>
              <input
                checked={marketingOptIn}
                onChange={(event) => setMarketingOptIn(event.target.checked)}
                type="checkbox"
              />
              <span>
                Send me member news, offers, and event updates. I can unsubscribe at any time.
              </span>
            </label>

            <label className={`${styles.consentRow} ${!phoneNumber.trim() ? styles.consentDisabled : ''}`}>
              <input
                checked={smsMarketingOptIn}
                disabled={!phoneNumber.trim()}
                onChange={(event) => setSmsMarketingOptIn(event.target.checked)}
                type="checkbox"
              />
              <span>
                Send me member news and offers by SMS. Message and data rates may apply. I can opt
                out at any time.
              </span>
            </label>
          </>
        ) : (
          <p className={styles.signInHint}>
            Already a member? Enter the email connected to your account.
          </p>
        )}

        {error ? <p className={styles.formError} role="alert">{error}</p> : null}

        <button className={styles.emailButton} disabled={pending} type="submit">
          <Mail size={17} strokeWidth={2} />
          {pending ? 'Sending…' : mode === 'join' ? 'Create my account' : 'Send sign-in link'}
          <ArrowRight size={16} strokeWidth={2} />
        </button>
      </form>

      <p className={styles.authNote}>
        {mode === 'join'
          ? <>
              By continuing, you agree to the DiasporaSpot{' '}
              <Link href="/terms-of-use">Terms of Use</Link> and acknowledge the{' '}
              <Link href="/privacy-policy">Privacy Policy</Link>. Essential membership messages
              are separate from optional email and SMS marketing.
            </>
          : 'We use your email only to verify your identity and provide access to your member account.'}
      </p>
    </div>
  );
}
