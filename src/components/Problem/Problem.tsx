'use client';

import Image from 'next/image';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';
import { ArrowRight, BriefcaseBusiness, Compass, Home } from 'lucide-react';
import Button from '@/components/Button/Button';
import TypewriterText from '@/components/TypewriterText/TypewriterText';
import styles from './problem.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  animate: { opacity: 1, y: 0 },
};

const pressurePoints = [
  {
    icon: Compass,
    label: 'Finding your footing',
    copy: 'Local systems, housing, healthcare, paperwork, and the small rules nobody explains.',
  },
  {
    icon: BriefcaseBusiness,
    label: 'Building momentum',
    copy: 'Career moves, new networks, and opportunities can feel scattered when you are starting over.',
  },
  {
    icon: Home,
    label: 'Feeling at home',
    copy: 'It is easy to miss context, community, and people who understand the in-between parts.',
  },
];

const realityText = 'The Reality';

function Problem() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <section className={styles.problem}>
      <div className={`wrap ${styles.inner}`} ref={ref}>
        <div className={styles.copy}>
          <motion.span
            className={styles.eyebrow}
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <TypewriterText
              text={realityText}
              active={inView}
              speed={44}
              className={styles.eyebrowText}
            />
          </motion.span>

          <motion.h2
            className={styles.title}
            variants={fadeUp}
            initial="initial"
            animate={inView ? 'animate' : 'initial'}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.22, 0.61, 0.36, 1] }}
          >
            Living abroad is <span>hard.</span>
          </motion.h2>

          <motion.p
            className={styles.sub}
            variants={fadeUp}
            initial="initial"
            animate={inView ? 'animate' : 'initial'}
            transition={{ duration: 0.5, delay: 0.16, ease: [0.22, 0.61, 0.36, 1] }}
          >
            Navigating how to live, work and grow in a new country can feel overwhelming.{' '}
            <em>At DiasporaSpot, you don&apos;t have to do it alone.</em>
          </motion.p>

          <motion.div
            className={styles.actions}
            variants={fadeUp}
            initial="initial"
            animate={inView ? 'animate' : 'initial'}
            transition={{ duration: 0.5, delay: 0.24, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Button variant="inverse" href="#solution">
              Explore Resources <ArrowRight size={14} strokeWidth={2} />
            </Button>
          </motion.div>
        </div>

        <motion.div
          className={styles.panel}
          initial={{ opacity: 0, y: 34 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 34 }}
          transition={{ duration: 0.65, delay: 0.18, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className={styles.imageWrap}>
            <Image
              src="/assets/photos/diaspora-spot-photo-1.png"
              alt=""
              fill
              sizes="(max-width: 860px) 100vw, 42vw"
              className={styles.image}
            />
          </div>

          <motion.div
            className={styles.pressureList}
            initial="initial"
            animate={inView ? 'animate' : 'initial'}
            variants={{
              animate: {
                transition: {
                  delayChildren: 0.82,
                  staggerChildren: 0.22,
                },
              },
            }}
          >
            {pressurePoints.map((item) => {
              const Icon = item.icon;

              return (
                <motion.div
                  className={styles.pressureItem}
                  key={item.label}
                  variants={{
                    initial: { opacity: 0, y: 18, scale: 0.98 },
                    animate: { opacity: 1, y: 0, scale: 1 },
                  }}
                  transition={{
                    duration: 0.62,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                >
                  <span className={styles.iconWrap}>
                    <Icon size={18} strokeWidth={1.9} />
                  </span>
                  <span>
                    <strong>{item.label}</strong>
                    {item.copy}
                  </span>
                </motion.div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}

export default Problem;
