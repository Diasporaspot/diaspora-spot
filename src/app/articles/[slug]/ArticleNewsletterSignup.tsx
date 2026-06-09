'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, LoaderCircle, Mail, X } from 'lucide-react';
import { FormEvent, useEffect, useState } from 'react';
import styles from './article-detail.module.css';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type SignupVariant = 'full' | 'compact';

type ArticleNewsletterSignupProps = {
  idPrefix?: string;
  variant?: SignupVariant;
};

function ArticleNewsletterSignup({
  idPrefix = 'article-newsletter',
  variant = 'full',
}: ArticleNewsletterSignupProps) {
  const [email, setEmail] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [name, setName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isHiddenByFullSignup, setIsHiddenByFullSignup] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');
  const isCompact = variant === 'compact';

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsModalOpen(false);
      }
    }

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen]);

  useEffect(() => {
    if (!isCompact) {
      return;
    }

    const fullSignup = document.querySelector('[data-article-newsletter="full"]');

    if (!fullSignup) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsHiddenByFullSignup(entry.isIntersecting);
      },
      {
        root: null,
        rootMargin: '0px 0px -18% 0px',
        threshold: 0.12,
      },
    );

    observer.observe(fullSignup);

    return () => observer.disconnect();
  }, [isCompact]);

  function openModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalEmail(email.trim());
    setSubmitState('idle');
    setMessage('');
    setIsModalOpen(true);
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
        body: JSON.stringify({ name, email: modalEmail, website }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error || 'Submission failed.');
      }

      setSubmitState('success');
      setMessage('You are on the list. We will send the next community note soon.');
      setEmail('');
    } catch (reason) {
      setSubmitState('error');
      setMessage(reason instanceof Error ? reason.message : 'Please try again.');
    }
  }

  const isSubmitting = submitState === 'submitting';
  const titleId = `${idPrefix}-title`;
  const modalTitleId = `${idPrefix}-modal-title`;

  return (
    <section
      className={`${styles.newsletter} ${isCompact ? styles.newsletterCompact : ''} ${
        isHiddenByFullSignup ? styles.newsletterCompactHidden : ''
      }`}
      aria-labelledby={titleId}
      aria-hidden={isHiddenByFullSignup ? true : undefined}
      data-article-newsletter={variant}
    >
      {!isCompact ? (
        <span className={styles.newsletterIcon}>
          <Mail size={18} strokeWidth={1.8} />
        </span>
      ) : null}
      <div className={styles.newsletterCopy}>
        <span className={styles.newsletterEyebrow}>DiasporaSpot Community</span>
        <h2 id={titleId}>
          {isCompact ? 'Get notes like this' : 'Want more practical notes like this?'}
        </h2>
        <p>
          {isCompact
            ? 'Join the mailing list for useful resources and early access.'
            : 'Join the mailing list for useful resources, new articles, and early access to what we share with the community.'}
        </p>
      </div>

      <form className={styles.newsletterForm} onSubmit={openModal}>
        <input
          type="email"
          placeholder="you@example.com"
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          required
        />
        <button type="submit">
          Get Early Access <ArrowRight size={14} strokeWidth={2} />
        </button>
      </form>

      <AnimatePresence>
        {isModalOpen ? (
          <motion.div
            className={styles.modalOverlay}
            role="presentation"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <motion.div
              className={styles.modal}
              role="dialog"
              aria-modal="true"
              aria-labelledby={modalTitleId}
              initial={{ opacity: 0, scale: 0.94, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 8 }}
              transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
            >
              <button className={styles.modalClose} type="button" onClick={() => setIsModalOpen(false)}>
                <span className={styles.srOnly}>Close early access form</span>
                <X size={18} strokeWidth={2} />
              </button>

              <span className={styles.modalEyebrow}>Early access</span>
              <h3 className={styles.modalTitle} id={modalTitleId}>
                Join the community list.
              </h3>
              <p className={styles.modalCopy}>
                Share your name so the DiasporaSpot team can send you useful community updates.
              </p>

              <form className={styles.modalForm} onSubmit={handleSubmit}>
                <label className={styles.modalField}>
                  <span>Name</span>
                  <input
                    type="text"
                    name="name"
                    autoComplete="name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Your name"
                    required
                  />
                </label>

                <label className={styles.modalField}>
                  <span>Email</span>
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    value={modalEmail}
                    onChange={(event) => setModalEmail(event.target.value)}
                    placeholder="you@example.com"
                    required
                  />
                </label>

                <label className={styles.honeypot} aria-hidden="true">
                  Website
                  <input type="text" name="website" tabIndex={-1} autoComplete="off" />
                </label>

                <button className={styles.modalSubmit} type="submit" disabled={isSubmitting} aria-busy={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      Saving <LoaderCircle size={14} strokeWidth={2} className={styles.spinner} />
                    </>
                  ) : (
                    <>
                      Join The List <ArrowRight size={14} strokeWidth={2} />
                    </>
                  )}
                </button>

                {message ? (
                  <p
                    className={`${styles.modalMessage} ${
                      submitState === 'success' ? styles.successMessage : styles.errorMessage
                    }`}
                    role={submitState === 'error' ? 'alert' : 'status'}
                  >
                    {message}
                  </p>
                ) : null}
              </form>
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </section>
  );
}

export default ArticleNewsletterSignup;
