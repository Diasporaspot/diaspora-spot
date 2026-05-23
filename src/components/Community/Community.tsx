'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  MessageSquareText,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
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
    copy: 'Join focused rooms for CV reviews, interview prep, portfolios, and referrals.',
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

const eyebrowText = 'Community · Coming Soon';

function Community() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });
  const [typedEyebrow, setTypedEyebrow] = useState('');

  useEffect(() => {
    if (!inView) return;

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedEyebrow(eyebrowText.slice(0, index));

      if (index === eyebrowText.length) {
        window.clearInterval(intervalId);
      }
    }, 42);

    return () => window.clearInterval(intervalId);
  }, [inView]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
  }

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
            <span className={styles.eyebrowText}>
              {typedEyebrow}
              <span className={styles.typeCursor} aria-hidden="true" />
            </span>
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
            Join a focused space for people building life abroad. Ask better questions, find local context,
            and move with people on the same path.
          </motion.p>

          <motion.form
            className={styles.form}
            onSubmit={handleSubmit}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <input className={styles.input} type="email" placeholder="you@example.com" required />
            <button className={styles.formBtn} type="submit">
              Get Early Access <ArrowRight size={14} strokeWidth={2} />
            </button>
          </motion.form>

          <motion.p
            className={styles.formMeta}
            variants={fadeUp}
            transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
          >
            No spam. Just launch access, useful updates, and a short welcome.
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
                Private beta
              </span>
              <span className={styles.launchDate}>Launching soon</span>
            </div>

            <div className={styles.roomPreview}>
              <div className={styles.roomHeader}>
                <span className={styles.roomIcon}>
                  <Users size={22} strokeWidth={1.7} />
                </span>
                <div>
                  <h3>DiasporaSpot Community</h3>
                  <p>Rooms opening for members first.</p>
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
    </section>
  );
}

export default Community;
