'use client';

import { motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import Button from '@/components/Button/Button';
import { perspective } from '@/data/anim';
import { navLinks } from '@/data/menu';
import MobileNavLinks from './MobileNavLinks';
import styles from './styles/mobilenavigation.module.css';

function MobileNavigation({ closeMenu }: { closeMenu: () => void }) {
  function handleCtaClick(event: React.MouseEvent<HTMLElement>) {
    event.preventDefault();
    window.location.hash = 'final';
    window.setTimeout(closeMenu, 100);
  }

  return (
    <div className={styles.nav}>
      <ul className={styles.mainNavLinks}>
        {navLinks.map((link, index) => (
          <MobileNavLinks
            data={{ nav: link, index }}
            key={link.label}
            closeMenu={closeMenu}
          />
        ))}
      </ul>
      <motion.div
        className={styles.authButtons}
        variants={perspective}
        animate="enter"
        exit="exit"
        initial="initial"
        custom={navLinks.length}
      >
        <Button
          href="#final"
          variant="primary"
          className={styles.ctaButton}
          onClick={handleCtaClick}
        >
          Join Us <ArrowRight size={14} strokeWidth={2} />
        </Button>
      </motion.div>
    </div>
  );
}

export default MobileNavigation;
