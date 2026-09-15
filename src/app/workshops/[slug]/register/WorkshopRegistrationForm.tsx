'use client';

import { type FormEvent, useEffect, useState } from 'react';
import { CheckCircle2, LoaderCircle } from 'lucide-react';
import {
  createMetaEventId,
  hasMetaAdvertisingConsent,
  trackMetaPixelEvent,
} from '@/components/MetaPixelEvent/MetaPixelEvent';
import styles from '../../workshops-page.module.css';

type WorkshopRegistrationFormProps = {
  fromSeriesSlug?: string;
  initialMetaEventId?: string;
  initialNotice?: 'cancelled' | 'success' | 'unconfirmed';
  isPaid: boolean;
  isStaging?: boolean;
  priceLabel: string;
  productLabel?: string;
  productType?: 'series' | 'workshop';
  slug: string;
};

export default function WorkshopRegistrationForm({
  fromSeriesSlug,
  initialMetaEventId,
  initialNotice,
  isPaid,
  isStaging = false,
  priceLabel,
  productLabel = 'workshop',
  productType = 'workshop',
  slug,
}: WorkshopRegistrationFormProps) {
  const [state, setState] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [error, setError] = useState(
    initialNotice === 'cancelled' ? 'Payment was cancelled. You can try again below.' : '',
  );

  const [discountCode, setDiscountCode] = useState('');
  const [discount, setDiscount] = useState<{ code: string; label: string; saved: string; original: string; amount: number } | null>(null);
  const [checkingCode, setCheckingCode] = useState(false);
  const [discountError, setDiscountError] = useState('');
  const totalLabel = discount?.label || priceLabel;

  async function applyCode() {
    setCheckingCode(true);
    setDiscountError('');
    setDiscount(null);
    try {
      const response = await fetch('/api/workshops/discount', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, code: discountCode }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      const format = (amount: number) => new Intl.NumberFormat(undefined, { style: 'currency', currency: result.currency }).format(amount / 100);
      setDiscount({ code: result.code, label: format(result.amount), saved: format(result.discountAmount), original: format(result.originalAmount), amount: result.amount });
    } catch (error) { setDiscountError(error instanceof Error ? error.message : 'Unable to apply code.'); }
    finally { setCheckingCode(false); }
  }

  useEffect(() => {
    if (!isPaid || initialNotice !== 'success') {
      return;
    }

    const sessionId = new URLSearchParams(window.location.search).get('session_id') || slug;
    const eventId = initialMetaEventId || `ds:CompleteRegistration:stripe:${sessionId}`;
    const trackingKey = `ds_meta_complete_registration:${productType}:${slug}:${sessionId}`;

    if (window.sessionStorage.getItem(trackingKey)) {
      return;
    }

    trackMetaPixelEvent(
      'CompleteRegistration',
      {
        content_category: 'Standard Series',
        content_ids: [slug],
        content_name: productLabel,
        content_type: productType,
      },
      {
        eventId,
        onSent: () => window.sessionStorage.setItem(trackingKey, 'true'),
        serverEventAlreadySent: Boolean(initialMetaEventId),
      },
    );
  }, [initialMetaEventId, initialNotice, isPaid, productLabel, productType, slug]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError('');
    if (discountCode.trim() && !discount) { setDiscountError('Apply or remove your discount code before continuing.'); return; }
    setState('submitting');

    const form = event.currentTarget;
    const formData = new FormData(form);
    const metaEventId = hasMetaAdvertisingConsent()
      ? createMetaEventId('CompleteRegistration')
      : undefined;

    try {
      const response = await fetch(
        isPaid ? '/api/workshops/checkout' : '/api/workshops/register',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            discountCode: discount?.code,
            expectedAmount: discount?.amount,
            email: formData.get('email'),
            name: formData.get('name'),
            productType,
            slug,
            fromSeries: fromSeriesSlug,
            metaEventId,
            metaEventSourceUrl: window.location.href,
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
      trackMetaPixelEvent(
        'CompleteRegistration',
        {
          content_category: 'Standard Series',
          content_ids: [slug],
          content_name: productLabel,
          content_type: productType,
        },
        {
          eventId: metaEventId,
          serverEventAlreadySent: Boolean(metaEventId),
        },
      );
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
          <strong>You are registered for the {productLabel}.</strong>
          <span>
            {isStaging
              ? 'This was a staging test. No confirmation email was sent.'
              : 'Check your inbox for confirmation and session updates from the team.'}
          </span>
        </div>
      </div>
    );
  }

  if (isPaid && initialNotice === 'success') {
    return (
      <div className={styles.registrationSuccess} role="status">
        <CheckCircle2 size={26} />
        <div>
          <strong>Your {productLabel} registration is confirmed.</strong>
          <span>
            {isStaging
              ? 'Stripe processed this in test mode. No confirmation email was sent.'
              : 'We will send confirmation and session updates by email shortly.'}
          </span>
        </div>
      </div>
    );
  }

  if (isPaid && initialNotice === 'unconfirmed') {
    return (
      <div className={styles.registrationUnavailable} role="alert">
        <strong>We could not confirm this payment.</strong>
        <span>Please return to Stripe Checkout or try reserving your seat again.</span>
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
      {isPaid && productType === 'workshop' ? (
        <div className={styles.registrationField}>
          <label htmlFor="discount-code">Discount code (optional)</label>
          <div className={styles.discountInputRow}>
          <input id="discount-code" autoComplete="off" maxLength={64} value={discountCode}
            aria-invalid={Boolean(discountError)} aria-describedby={discountError ? "discount-error" : "discount-help"}
            onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); if (!checkingCode && state !== "submitting" && discountCode.trim()) void applyCode(); } }}
            disabled={checkingCode || state === 'submitting'}
            onChange={(event) => { setDiscountCode(event.target.value); setDiscount(null); setDiscountError(''); }} />
          <button type="button" className={styles.discountApply} disabled={checkingCode || state === 'submitting' || !discountCode.trim()} onClick={applyCode}>
            {checkingCode ? 'Checking code…' : 'Apply code'}
          </button>
          </div>
          <small id="discount-help">Enter your code to see your savings before checkout.</small>
          {discount ? (
            <div className={styles.discountSummary} role="status" aria-live="polite">
              <div className={styles.discountApplied}><strong>{discount.code} applied</strong><button type="button" disabled={state === 'submitting' || checkingCode} onClick={() => { setDiscountCode(''); setDiscount(null); setDiscountError(''); }}>Remove code</button></div>
              <dl>
                <div><dt>Original price</dt><dd>{discount.original}</dd></div>
                <div><dt>Discount</dt><dd>−{discount.saved}</dd></div>
                <div className={styles.discountTotal}><dt>Total</dt><dd>{discount.label}</dd></div>
              </dl>
              {discount.amount === 0 ? <small>No payment required. Continue to confirm your booking.</small> : null}
            </div>
          ) : null}
          {discountError ? <p id="discount-error" className={styles.registrationError} role="alert">{discountError}</p> : null}
        </div>
      ) : null}
      <label className={styles.honeypot} aria-hidden="true">
        Website
        <input autoComplete="off" name="website" tabIndex={-1} type="text" />
      </label>
      <p className={styles.registrationNotice}>
        {isStaging
          ? isPaid
            ? 'Staging uses Stripe test mode. You will not be charged, and no confirmation email will be sent.'
            : 'This is a staging registration test. No confirmation email will be sent.'
          : isPaid
            ? discount?.amount === 0
              ? 'You will be redirected to confirm your free booking. No payment details are needed.'
              : `You will be redirected to Stripe to pay ${totalLabel}. After payment, we will send confirmation, reminders, and related updates.`
            : `By registering, you agree to receive emails about this ${productLabel}, including confirmation, reminders, and related updates.`}{' '}
        See our <a href="/privacy-policy">privacy policy</a>.
      </p>
      {error ? (
        <p className={styles.registrationError} role="alert">
          {error}
        </p>
      ) : null}
      <button
        className={styles.registrationSubmit}
        disabled={state === 'submitting' || checkingCode}
        type="submit"
      >
        {state === 'submitting' ? (
          <>
            <LoaderCircle className={styles.spinner} size={16} />
            {isPaid ? 'Opening checkout' : 'Registering'}
          </>
        ) : isPaid ? (
          discount?.amount === 0 ? 'Confirm free booking' : `Continue to payment - ${totalLabel}`
        ) : (
          'Confirm registration'
        )}
      </button>
    </form>
  );
}
