'use client';

import { AnimatePresence, motion, useInView } from 'framer-motion';
import { FormEvent, useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  LoaderCircle,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import styles from './community.module.css';

const communityPillars = [
  {
    icon: MessageSquareText,
    title: 'Ask practical questions',
    copy: 'Get direct answers about work, housing, visas, money, and settling in.',
  },
  {
    icon: MapPin,
    title: 'Find city context',
    copy: 'Connect around cities, routes, and local information that rarely shows up in guides.',
  },
  {
    icon: BriefcaseBusiness,
    title: 'Build career momentum',
    copy: 'Get prompts, resources, and updates for CVs, interviews, portfolios, and referrals.',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const cardReveal = {
  initial: { opacity: 0, y: 22, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
};

const eyebrowText = 'Community · Mailing List';
type SubmitState = 'idle' | 'submitting' | 'success' | 'error';

function Community() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [email, setEmail] = useState('');
  const [modalEmail, setModalEmail] = useState('');
  const [name, setName] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [submitState, setSubmitState] = useState<SubmitState>('idle');
  const [message, setMessage] = useState('');

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

  function openEarlyAccessModal(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setModalEmail(email.trim());
    setSubmitState('idle');
    setMessage('');
    setIsModalOpen(true);
  }

  async function handleEarlyAccessSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;
    const formData = new FormData(form);
    const website = String(formData.get('website') || '');

    setSubmitState('submitting');
    setMessage('');

    try {
      const response = await fetch('/api/early-access', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          email: modalEmail,
          website,
        }),
      });

      const body = (await response.json()) as { error?: string };

      if (!response.ok) {
        throw new Error(body.error || 'Submission failed.');
      }

      setSubmitState('success');
      setMessage('You are on the list. We will send the first community note soon.');
      setEmail('');
    } catch (reason) {
      setSubmitState('error');
      setMessage(reason instanceof Error ? reason.message : 'Please try again.');
    }
  }

  const isSubmitting = submitState === 'submitting';

  return (
    <section className={styles.community} id="community" ref={ref}>
      <div className={`wrap ${styles.grid}`}>
        <motion.div
          className={styles.copy}
          variants={{ animate: { transition: { staggerChildren: 0.1 } } }}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
        >
          <motion.span
            className={styles.eyebrow}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <TypewriterText
              text={eyebrowText}
              active={inView}
              speed={42}
              className={styles.eyebrowText}
            />
          </motion.span>

          <motion.h2
            className={styles.title}
            variants={fadeUp}
            transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
          >
            The journey is different when you&apos;re not alone.
          </motion.h2>

          <motion.p
            className={styles.sub}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            Join the mailing list for people building life abroad. Get practical notes, useful resources,
            and early access to what DiasporaSpot shares with the community.
          </motion.p>

          <motion.form
            className={styles.form}
            onSubmit={openEarlyAccessModal}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <input
              className={styles.input}
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
            <button className={styles.formBtn} type="submit">
              Get Early Access <ArrowRight size={14} strokeWidth={2} />
            </button>
          </motion.form>

          <motion.p
            className={styles.formMeta}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            No spam. Just useful updates, early access, and a short welcome.
          </motion.p>
        </motion.div>

        <motion.div
          className={styles.visual}
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                delayChildren: 0.18,
                staggerChildren: 0.12,
              },
            },
          }}
        >
          <motion.div
            className={styles.panel}
            variants={cardReveal}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={styles.panelTop}>
              <span className={styles.liveBadge}>
                <Sparkles size={14} strokeWidth={1.8} />
                Member notes
              </span>
              <span className={styles.statusText}>Early access</span>
            </div>

            <div className={styles.roomPreview}>
              <div className={styles.roomHeader}>
                <span className={styles.roomIcon}>
                  <Users size={22} strokeWidth={1.7} />
                </span>
                <div>
                  <h3>DiasporaSpot Community</h3>
                  <p>Resources and updates sent to the list first.</p>
                </div>
              </div>

              <div className={styles.channelList}>
                <span># city-guides</span>
                <span># career-room</span>
                <span># housing-help</span>
                <span># money-moves</span>
              </div>
            </div>

            <div className={styles.panelFoot}>
              <span>
                <ShieldCheck size={16} strokeWidth={1.7} />
                Moderated entry
              </span>
              <span>Built for practical support</span>
            </div>
          </motion.div>

          <div className={styles.pillarGrid}>
            {communityPillars.map((pillar) => (
              <motion.article
                key={pillar.title}
                className={styles.pillar}
                variants={cardReveal}
                transition={{ duration: 0.58, ease: [0.16, 1, 0.3, 1] }}
              >
                <span className={styles.pillarIcon}>
                  <pillar.icon size={19} strokeWidth={1.7} />
                </span>
                <div>
                  <h3>{pillar.title}</h3>
                  <p>{pillar.copy}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </motion.div>
      </div>

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
            aria-labelledby="early-access-title"
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
            <h3 className={styles.modalTitle} id="early-access-title">
              Save your spot.
            </h3>
            <p className={styles.modalCopy}>
              Share your name so the DiasporaSpot team can add you to the community mailing list.
            </p>

            <form className={styles.modalForm} onSubmit={handleEarlyAccessSubmit}>
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

export default Community;
