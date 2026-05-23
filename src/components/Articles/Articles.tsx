'use client';

import { motion, useInView } from 'framer-motion';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight } from 'lucide-react';
import Button from '@/components/Button/Button';
import styles from './articles.module.css';

const cards = [
  {
    id: 'a',
    mediaClass: styles.mediaA,
    cat: 'Career',
    title: 'Writing a CV that crosses borders',
    meta: '6 min read · Coming soon',
  },
  {
    id: 'b',
    mediaClass: styles.mediaB,
    cat: 'Money',
    title: 'Sending money home, the smart way',
    meta: '8 min read · Coming soon',
  },
  {
    id: 'c',
    mediaClass: styles.mediaC,
    cat: 'Housing',
    title: 'Renting a flat without getting scammed',
    meta: '7 min read · Coming soon',
  },
  {
    id: 'd',
    mediaClass: styles.mediaD,
    cat: 'Visas',
    title: 'The skilled worker visa, in plain English',
    meta: '11 min read · Coming soon',
  },
];

const fadeUp = {
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
};

const eyebrowText = 'Featured Content';

function ArticleCard({
  card,
}: {
  card: (typeof cards)[0];
}) {
  return (
    <motion.article
      className={styles.card}
      variants={{
        initial: { opacity: 0, y: 28, scale: 0.985 },
        animate: { opacity: 1, y: 0, scale: 1 },
      }}
      transition={{ duration: 0.62, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className={`${styles.media} ${card.mediaClass}`}>
        <span className={styles.cat}>{card.cat}</span>
      </div>
      <div className={styles.body}>
        <h3 className={styles.cardTitle}>{card.title}</h3>
        <span className={styles.meta}>{card.meta}</span>
      </div>
    </motion.article>
  );
}

function Articles() {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
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
    }, 38);

    return () => window.clearInterval(intervalId);
  }, [inView]);

  return (
    <section className={styles.articles} id="articles" ref={ref}>
      <div className="wrap">
        <motion.header
          className={styles.head}
          variants={fadeUp}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          transition={{ duration: 0.5, ease: [0.22, 0.61, 0.36, 1] }}
        >
          <div>
            <span className={styles.eyebrow}>
              <span className={styles.eyebrowText}>
                {typedEyebrow}
                <span className={styles.typeCursor} aria-hidden="true" />
              </span>
            </span>
            <h2 className={styles.title}>The Diaspora Article Hub.</h2>
            <p className={styles.sub}>
              All the resources you need to build a successful life abroad.
            </p>
          </div>
        </motion.header>

        <motion.div
          className={styles.grid}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          variants={{
            animate: {
              transition: {
                delayChildren: 0.62,
                staggerChildren: 0.14,
              },
            },
          }}
        >
          {cards.map((card) => (
            <ArticleCard key={card.id} card={card} />
          ))}
        </motion.div>

        <motion.div
          className={styles.cta}
          variants={fadeUp}
          initial="initial"
          animate={inView ? 'animate' : 'initial'}
          transition={{
            duration: 0.5,
            delay: 0.4,
            ease: [0.22, 0.61, 0.36, 1],
          }}
        >
          <Button variant="primary" href="#">
            Read Articles <ArrowRight size={14} strokeWidth={2} />
          </Button>
        </motion.div>
      </div>
    </section>
  );
}

export default Articles;
