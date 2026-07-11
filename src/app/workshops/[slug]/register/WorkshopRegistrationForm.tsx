'use client';

import { type FormEvent, useState } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import styles from '../../workshops-page.module.css';

type WorkshopRegistrationFormProps = {
  initialNotice?: 'cancelled' | 'success';
  isPaid: boolean;
  priceLabel: string;
  slug: string;
};

export default function WorkshopRegistrationForm({
  initialNotice,
  isPaid,
  priceLabel,
  slug,
}: WorkshopRegistrationFormProps) {
  const [state, setState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState(
    initialNotice === 'cancelled' ? 'Payment was cancelled. You can try again below.' : '',
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    setState('submitting');

    const form = event.currentTarget;
    const formData = new FormData(form);

    try {
      const response = await fetch(
        isPaid ? '/api/workshops/checkout' : '/api/workshops/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.get('email'),
            name: formData.get('name'),
            slug,
            website: formData.get('website'),
          }),
        },
      );
      const result = (await response.json()) as { error?: string; ok?: boolean; url?: string };

      if (!response.ok || !result.ok) {
        throw new Error(result.error || 'Registration failed.');
      }

      if (isPaid) {
        if (!result.url) {
          throw new Error('Payment could not be started. Please try again.');
        }

        window.location.href = result.url;
        return;
      }

      form.reset();
      setState('success');
    } catch (reason) {
      setError(
        reason instanceof Error ? reason.message : 'Registration failed. Please try again.',
      );
      setState('idle');
    }
  }

  if (state === 'success') {
    return (
      <div className={styles.registrationSuccess} role="status">
        <CheckCircle2 size={26} />
        <div>
          <strong>You are registered.</strong>
          <span>Check your inbox for workshop updates from the team.</span>
        </div>
      </div>
    );
  }

  if (isPaid && initialNotice === 'success') {
    return (
      <div className={styles.registrationSuccess} role="status">
        <CheckCircle2 size={26} />
        <div>
          <strong>Payment is being confirmed.</strong>
          <span>If payment succeeded, we will send workshop updates by email shortly.</span>
        </div>
      </div>
    );
  }

  return (
    <form className={styles.registrationForm} onSubmit={handleSubmit}>
      <div className={styles.registrationField}>
        <label htmlFor="registration-name">Full name</label>
        <input
          autoComplete="name"
          id="registration-name"
          maxLength={120}
          name="name"
          placeholder="Your name"
          required
          type="text"
        />
      </div>
      <div className={styles.registrationField}>
        <label htmlFor="registration-email">Email address</label>
        <input
          autoComplete="email"
          id="registration-email"
          name="email"
          placeholder="you@example.com"
          required
          type="email"
        />
      </div>
      <label className={styles.honeypot} aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>
      <p className={styles.registrationNotice}>
        {isPaid
          ? `You will be redirected to Stripe to pay ${priceLabel}. After payment, we will send confirmation, reminders, and related updates.`
          : 'By registering, you agree to receive emails about this workshop, including confirmation, reminders, and related updates.'}{' '}
        See our <a href="/privacy-policy">privacy policy</a>.
      </p>
      {error ? (
        <p className={styles.registrationError} role="alert">
          {error}
        </p>
      ) : null}
      <button
        className={styles.registrationSubmit}
        disabled={state === 'submitting'}
        type="submit"
      >
        {state === 'submitting' ? (
          <>
            <LoaderCircle className={styles.spinner} size={16} />
            {isPaid ? 'Starting payment' : 'Registering'}
          </>
        ) : isPaid ? (
          `Continue to payment - ${priceLabel}`
        ) : (
          'Confirm registration'
        )}
      </button>
    </form>
  );
}
