'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, CalendarDays, CheckCircle2, Globe2, MessageSquareText } from 'lucide-react';
import Button from '@/components/Button/Button';
import styles from './finalCta.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const signals = [
  {
    icon: Globe2,
    label: '31 countries',
  },
  {
    icon: MessageSquareText,
    label: 'Guides, workshops, community',
  },
  {
    icon: CalendarDays,
    label: 'Opening access in 2026',
  },
];

function FinalCta() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.final} id="final" ref={ref}>
      <div className={`wrap ${styles.shell}`}>
        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 32, scale: 0.985 }}
          animate={inView ? { opacity: 1, y: 0, scale: 1 } : { opacity: 0, y: 32, scale: 0.985 }}
          transition={{ duration: 0.72, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className={styles.panelTop}>
            <span className={styles.eyebrow}>Your Spot · 2026</span>
            <span className={styles.status}>
              <CheckCircle2 size={15} strokeWidth={1.8} />
              Early access
            </span>
          </div>

          <div className={styles.contentGrid}>
            <motion.div
              className={styles.copy}
              variants={{ animate: { transition: { delayChildren: 0.18, staggerChildren: 0.12 } } }}
              initial="initial"
              animate={inView ? 'animate' : 'initial'}
            >
              <motion.h2
                className={styles.title}
                variants={fadeUp}
                transition={{ duration: 0.65, ease: [0.22, 0.61, 0.36, 1] }}
              >
                We are here so <em>you</em> can thrive anywhere.
              </motion.h2>

              <motion.p
                className={styles.body}
                variants={fadeUp}
                transition={{ duration: 0.55, ease: [0.22, 0.61, 0.36, 1] }}
              >
                Get the guides, live sessions, and community support built for the in-between parts
                of moving, settling, and growing abroad.
              </motion.p>

              <motion.div
                className={styles.actions}
                variants={fadeUp}
                transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
              >
                <Button variant="mustard" href="#" className={styles.btnWrap}>
                  Join Us Now <ArrowRight size={14} strokeWidth={2} />
                </Button>
                <Button variant="inverse" href="#solution" className={styles.secondaryBtn}>
                  See What&apos;s Inside
                </Button>
              </motion.div>
            </motion.div>

            <motion.div
              className={styles.signalCard}
              variants={fadeUp}
              initial="initial"
              animate={inView ? 'animate' : 'initial'}
              transition={{ duration: 0.62, delay: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
            >
              <span className={styles.signalKicker}>Before you go</span>
              <p className={styles.signalText}>Save your spot and we&apos;ll send the first access note.</p>
              <div className={styles.signalList}>
                {signals.map((signal) => (
                  <span key={signal.label}>
                    <signal.icon size={16} strokeWidth={1.7} />
                    {signal.label}
                  </span>
                ))}
              </div>
            </motion.div>
          </div>

          <motion.p
            className={styles.tagline}
            variants={fadeUp}
            initial="initial"
            animate={inView ? 'animate' : 'initial'}
            transition={{ duration: 0.5, delay: 0.34, ease: [0.22, 0.61, 0.36, 1] }}
          >
            We thrive anywhere.
          </motion.p>
        </motion.div>
      </div>
    </section>
  );
}

export default FinalCta;
