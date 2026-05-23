import type { Variants } from 'framer-motion';

export const perspective: Variants = {
  initial: {
    opacity: 0,
    rotateX: 20,
    translateY: 16,
  },
  enter: (index: number) => ({
    opacity: 1,
    rotateX: 0,
    translateY: 0,
    transition: {
      duration: 0.55,
      delay: 0.45 + index * 0.08,
      ease: [0.215, 0.61, 0.355, 1],
      opacity: { duration: 0.45, ease: 'easeOut' },
    },
  }),
  exit: {
    opacity: 0,
    transition: {
      duration: 0.4,
      type: 'tween',
      ease: [0.76, 0, 0.24, 1],
    },
  },
};

export const grow: Variants = {
  initial: {
    height: 0,
    opacity: 0,
    scaleY: 0,
    originY: 0,
  },
  enter: {
    height: 'auto',
    opacity: 1,
    scaleY: 1,
    originY: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.3 },
      scaleY: { duration: 0.3, ease: 'easeOut' },
    },
  },
  exit: {
    height: 0,
    opacity: 0,
    scaleY: 0,
    originY: 0,
    transition: {
      height: { duration: 0.3 },
      opacity: { duration: 0.3 },
      scaleY: { duration: 0.3, ease: 'easeIn' },
    },
  },
};
