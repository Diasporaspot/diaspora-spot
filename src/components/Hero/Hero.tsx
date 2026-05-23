'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, ArrowDown } from 'lucide-react';
import Button from '@/components/Button/Button';
import styles from './hero.module.css';

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const avatars = [
  { id: 'p1', bg: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&q=80&auto=format&fit=crop' },
  { id: 'p2', bg: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80&auto=format&fit=crop' },
  { id: 'p3', bg: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80&auto=format&fit=crop' },
];

const heroSlides = [
  '/images/diaspora-spot-image-1.png',
  '/images/diaspora-spot-image-2.png',
  '/images/diaspora-spot-image-3.png',
  '/images/diaspora-spot-image-4.png',
];

const eyebrowText = 'We Thrive Anywhere - Est. 2026';

function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [headlineRevealed, setHeadlineRevealed] = useState(false);
  const [typedEyebrow, setTypedEyebrow] = useState('');

  useEffect(() => {
    const intervalId = window.setInterval(() => {
      setCurrentSlide((slide) =>
        slide === heroSlides.length - 1 ? 0 : slide + 1
      );
    }, 4500);

    return () => window.clearInterval(intervalId);
  }, []);

  useEffect(() => {
    if (!headlineRevealed) return;

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedEyebrow(eyebrowText.slice(0, index));

      if (index === eyebrowText.length) {
        window.clearInterval(intervalId);
      }
    }, 36);

    return () => window.clearInterval(intervalId);
  }, [headlineRevealed]);

  return (
    <section className={styles.hero}>
      <div className={styles.backgroundSlider} aria-hidden="true">
        <AnimatePresence mode="wait">
          <motion.div
            key={heroSlides[currentSlide]}
            className={styles.slide}
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            transition={{ duration: 1.1, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <Image
              src={heroSlides[currentSlide]}
              alt=""
              fill
              sizes="100vw"
              className={styles.slideImage}
              preload={currentSlide === 0}
            />
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.scrim} aria-hidden="true" />
      <div className={styles.gridLines} aria-hidden="true" />

      <div className={`wrap ${styles.grid}`}>
        <motion.div
          className={styles.content}
          initial="initial"
          animate="animate"
        >
          <motion.span
            className={styles.eyebrow}
            initial={{ opacity: 0 }}
            animate={{ opacity: headlineRevealed ? 1 : 0 }}
            transition={{ duration: 0.2, ease: [0.22, 0.61, 0.36, 1] }}
          >
            <span className={styles.eyebrowText}>
              {typedEyebrow}
              <span className={styles.typeCursor} aria-hidden="true" />
            </span>
          </motion.span>

          <div className={styles.displayMask}>
            <motion.h1
              className={styles.display}
              initial={{ y: '115%' }}
              animate={{ y: 0 }}
              transition={{ duration: 0.85, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              onAnimationComplete={() => setHeadlineRevealed(true)}
            >
              Build your<br />life abroad.
            </motion.h1>
          </div>

          <motion.p className={styles.sub} variants={fadeUp} transition={{ duration: 0.5, delay: 0.85, ease: [0.22, 0.61, 0.36, 1] }}>
            DiasporaSpot is a digital hub created to help you build and grow your life abroad — with career resources, guides, and events.
          </motion.p>

          <motion.div className={styles.ctaRow} variants={fadeUp} transition={{ duration: 0.5, delay: 1, ease: [0.22, 0.61, 0.36, 1] }}>
            <Button variant="primary" href="#final">
              Join Us <ArrowRight size={14} strokeWidth={2} />
            </Button>
            <a className={styles.arrowLink} href="#solution">
              See what&apos;s inside <ArrowDown size={14} />
            </a>
          </motion.div>
        </motion.div>

        <motion.div
          className={styles.proof}
          variants={fadeUp}
          initial="initial"
          animate="animate"
          transition={{ duration: 0.5, delay: 0.45, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div className={styles.avaStack}>
            {avatars.map((a) => (
              <span
                key={a.id}
                className={styles.ava}
                style={{ backgroundImage: `url('${a.bg}')` }}
              />
            ))}
            <span className={`${styles.ava} ${styles.avaMustard}`}>+12</span>
          </div>
          <span className={styles.proofMeta}>
            <strong>2,800+ members</strong> across 31 countries, and growing.
          </span>
        </motion.div>

        <div className={styles.slideMeta} aria-hidden="true">
          {heroSlides.map((slide, index) => (
            <span
              key={slide}
              className={`${styles.dot} ${index === currentSlide ? styles.dotActive : ''}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Hero;
