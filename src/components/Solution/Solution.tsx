'use client';

import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { BookOpen, Users, ArrowRight } from 'lucide-react';
import Button from '@/components/Button/Button';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import styles from './solution.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const transition = (delay = 0) => ({
  duration: 0.55,
  delay,
  ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
});

const eyebrowText = "What's inside";

function Solution() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.solution} id="solution" ref={ref}>
      <div className="wrap">
        <motion.div
          className={styles.head}
          variants={fadeUp}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          transition={transition(0)}
        >
          <span className={styles.eyebrow}>
            <TypewriterText
              text={eyebrowText}
              active={inView}
              speed={42}
              className={styles.eyebrowText}
            />
          </span>
          <h2 className={styles.title}>
            Career Articles and Workshops.
            <span className={styles.subline}>All in one spot.</span>
          </h2>
        </motion.div>

        <motion.div
          className={styles.grid}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          variants={{
            animate: {
              transition: {
                delayChildren: 0.7,
                staggerChildren: 0.24,
              },
            },
          }}
        >
          <motion.article
            className={styles.card}
            variants={{
              initial: { opacity: 0, y: 28, scale: 0.985 },
              animate: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`${styles.iconWrap} ${styles.iconSand}`}>
              <BookOpen size={28} strokeWidth={1.6} />
            </div>
            <span className={styles.label}>01 · Learn</span>
            <h3 className={styles.cardTitle}>Learn at your own pace.</h3>
            <p className={styles.cardBody}>
              Read practical articles for life abroad — from finding work and housing, to building your career wherever you are.
            </p>
            <div className={styles.cardCta}>
              <Button variant="ghost" href="/articles">
                Read Articles <ArrowRight size={14} strokeWidth={2} />
              </Button>
            </div>
          </motion.article>

          <motion.article
            className={styles.card}
            variants={{
              initial: { opacity: 0, y: 28, scale: 0.985 },
              animate: { opacity: 1, y: 0, scale: 1 },
            }}
            transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className={`${styles.iconWrap} ${styles.iconMustard}`}>
              <Users size={28} strokeWidth={1.6} />
            </div>
            <span className={styles.label}>02 · Connect &amp; Grow</span>
            <h3 className={styles.cardTitle}>Find your people, grow your skills.</h3>
            <p className={styles.cardBody}>
              Join workshops designed to sharpen your skills and connect you with people on the same path.
            </p>
            <div className={styles.cardCta}>
              <Button variant="primary" href="/workshops">
                Save My Spot <ArrowRight size={14} strokeWidth={2} />
              </Button>
            </div>
          </motion.article>
        </motion.div>
      </div>
    </section>
  );
}

export default Solution;
