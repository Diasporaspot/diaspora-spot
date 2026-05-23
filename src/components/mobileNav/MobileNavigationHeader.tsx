'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useState } from 'react';

import { useOutsideClick } from '@/hooks/useOutsideClick';
import MobileNavigation from './MobileNavigation';
import SpecialMenuButton from './SpecialMenuButton';
import styles from './styles/navigationheader.module.css';

function MobileNavigationHeader() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const closeMenu = () => setIsMenuOpen(false);
  const ref = useOutsideClick<HTMLDivElement>(closeMenu);

  const menu = {
    open: {
      width: 'min(480px, calc(100vw - 50px))',
      height: 'min(530px, calc(100vh - 50px))',
      top: '-25px',
      right: '-25px',
      transition: {
        duration: 0.75,
        type: 'tween' as const,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
    closed: {
      width: '100px',
      height: '40px',
      top: '0px',
      right: '0px',
      transition: {
        duration: 0.75,
        delay: 0.35,
        type: 'tween' as const,
        ease: [0.76, 0, 0.24, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <div className={styles.header} ref={ref}>
      <motion.div
        className={styles.menu}
        variants={menu}
        animate={isMenuOpen ? 'open' : 'closed'}
        initial="closed"
      >
        <AnimatePresence>
          {isMenuOpen && <MobileNavigation closeMenu={closeMenu} />}
        </AnimatePresence>
      </motion.div>
      <SpecialMenuButton
        isActive={isMenuOpen}
        toggleMenu={() => setIsMenuOpen((open) => !open)}
      />
    </div>
  );
}

export default MobileNavigationHeader;
