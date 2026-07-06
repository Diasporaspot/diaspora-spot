'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LoaderCircle, MailPlus, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import styles from './homeAccessPrompt.module.css';

const SIGNUP_COOKIE_NAME = 'ds_early_access_signup';
const SIGNUP_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;
const REVEAL_DELAY = 6500;

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function hasSignupCookie() {
  return document.cookie
    .split('; ')
    .some((item) => item.startsWith(`${SIGNUP_COOKIE_NAME}=`));
}

function storeSignupCookie() {
  const secure = window.location.protocol === 'https:' ? '; Secure' : '';

  document.cookie = `${SIGNUP_COOKIE_NAME}=true; Max-Age=${SIGNUP_COOKIE_MAX_AGE}; Path=/; SameSite=Lax${secure}`;
}

export default function HomeAccessPrompt() {
  const [isVisible, setIsVisible] = useState(false);
  const [isCommunityVisible, setIsCommunityVisible] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    if (hasSignupCookie()) {
      return;
    }

    const timer = window.setTimeout(() => {
      setIsVisible(true);
    }, REVEAL_DELAY);

    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    const communitySection = document.getElementById('community');

    if (!communitySection) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsCommunityVisible(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px 0px -24% 0px',
        threshold: 0.1,
      },
    );

    observer.observe(communitySection);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        dismissPrompt();
      }
    }

    window.addEventListener('keydown', handleKeyDown);

    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isVisible]);

  function dismissPrompt() {
    setIsVisible(false);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const website = String(formData.get('website') || '');

    setSubmitState('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email,
          website,
        }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error || 'Submission failed.');
      }

      storeSignupCookie();
      setSubmitState('success');
      setMessage('You are on the list. We will send the first note soon.');
      setName('');
      setEmail('');
    } catch (reason) {
      setSubmitState('error');
      setMessage(reason instanceof Error ? reason.message : 'Please try again.');
    }
  }

  const isSubmitting = submitState === 'submitting';
  const shouldRender = isVisible && !isCommunityVisible;

  return (
    <AnimatePresence>
      {shouldRender ? (
        <motion.aside
          aria-labelledby="home-access-prompt-title"
          className={styles.prompt}
          initial={{ opacity: 0, y: 18, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 14, scale: 0.98 }}
          transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <button
            aria-label="Dismiss early access prompt"
            className={styles.close}
            onClick={dismissPrompt}
            type="button"
          >
            <X size={16} strokeWidth={2} />
          </button>

          <div className={styles.topline}>
            <span className={styles.icon}>
              <MailPlus size={17} strokeWidth={1.8} />
            </span>
            <span>Early access</span>
          </div>

          <h2 className={styles.title} id="home-access-prompt-title">
            Join the DiasporaSpot community list.
          </h2>
          <p className={styles.copy}>
            Get useful resources, community updates, and first access as we open the platform.
          </p>

          <form className={styles.form} onSubmit={handleSubmit}>
            <label className={styles.field}>
              <span>Name</span>
              <input
                autoComplete="name"
                name="name"
                onChange={(event) => setName(event.target.value)}
                placeholder="Your name"
                required
                type="text"
                value={name}
              />
            </label>

            <label className={styles.field}>
              <span>Email</span>
              <input
                autoComplete="email"
                name="email"
                onChange={(event) => setEmail(event.target.value)}
                placeholder="you@example.com"
                required
                type="email"
                value={email}
              />
            </label>

            <label className={styles.honeypot} aria-hidden="true">
              Website
              <input autoComplete="off" name="website" tabIndex={-1} type="text" />
            </label>

            <button
              aria-busy={isSubmitting}
              className={styles.submit}
              disabled={isSubmitting || submitState === 'success'}
              type="submit"
            >
              {isSubmitting ? (
                <>
                  Saving <LoaderCircle className={styles.spinner} size={14} strokeWidth={2} />
                </>
              ) : (
                <>
                  Join The List <ArrowRight size={14} strokeWidth={2} />
                </>
              )}
            </button>
          </form>

          {message ? (
            <p
              className={`${styles.message} ${
                submitState === 'success' ? styles.success : styles.error
              }`}
              role={submitState === 'error' ? 'alert' : 'status'}
            >
              {message}
            </p>
          ) : (
            <p className={styles.meta}>No spam. Close this and keep browsing anytime.</p>
          )}
        </motion.aside>
      ) : null}
    </AnimatePresence>
  );
}
