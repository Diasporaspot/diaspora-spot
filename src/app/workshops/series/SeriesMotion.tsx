'use client';

import { motion, useReducedMotion } from 'framer-motion';
import type { ReactNode } from 'react';

const revealEase = [0.16, 1, 0.3, 1] as const;

export function SeriesHeroCopy({
  children,
  className,
}: {
  children: ReactNode;
  className: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, y: 18 }}
      transition={{ duration: 0.62, ease: revealEase }}
    >
      {children}
    </motion.div>
  );
}

export function SeriesPricePanel({
  ariaLabel,
  children,
  className,
}: {
  ariaLabel: string;
  children: ReactNode;
  className: string;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.aside
      animate={{ opacity: 1, x: 0 }}
      aria-label={ariaLabel}
      className={className}
      initial={reduceMotion ? false : { opacity: 0, x: 22 }}
      transition={{ delay: 0.12, duration: 0.58, ease: revealEase }}
    >
      {children}
    </motion.aside>
  );
}

export function SeriesCurriculumHead({ children }: { children: ReactNode }) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 16 }}
      transition={{ duration: 0.52, ease: revealEase }}
      viewport={{ once: true, margin: '-70px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.div>
  );
}

export function SeriesSessionItem({
  children,
  index,
}: {
  children: ReactNode;
  index: number;
}) {
  const reduceMotion = useReducedMotion();

  return (
    <motion.li
      initial={reduceMotion ? false : { opacity: 0, y: 22 }}
      transition={{
        delay: reduceMotion ? 0 : Math.min(index * 0.07, 0.28),
        duration: 0.5,
        ease: revealEase,
      }}
      viewport={{ once: true, margin: '-50px' }}
      whileInView={{ opacity: 1, y: 0 }}
    >
      {children}
    </motion.li>
  );
}
