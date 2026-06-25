'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';

import Button from '@/components/Button/Button';
import { navLinks } from '@/data/menu';
import NavLink from './NavLink';
import styles from './styles/navigation.module.css';

function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    function handleScroll() {
      setIsScrolled(window.scrollY > 24);
    }

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navClassName = `${styles.navContainer} ${
    isScrolled ? styles.scrolled : styles.heroTone
  }`;
  const logoSrc = isScrolled
    ? '/assets/logo-primary-black.png'
    : '/assets/logo-primary-white.png';

  return (
    <AnimatePresence>
      <motion.header
        className={navClassName}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: 'easeOut' }}
      >
        <nav className={styles.navigation} aria-label="Primary navigation">
          <Link
            href="/"
            className={styles.logoLink}
            aria-label="DiasporaSpot home"
          >
            <Image
              width={526}
              height={95}
              src={logoSrc}
              alt="DiasporaSpot"
              className={styles.logo}
              preload
            />
          </Link>

          <ul className={styles.navigationList}>
            {navLinks.map((link) => (
              <NavLink key={link.label} link={link} />
            ))}
          </ul>

          <AuthButtons />
        </nav>
      </motion.header>
    </AnimatePresence>
  );
}

function AuthButtons() {
  return (
    <div className={styles.authButtons}>
      <Button href="/workshops" variant="primary" className={styles.ctaButton}>
        Join Us <ArrowRight size={14} strokeWidth={2} />
      </Button>
    </div>
  );
}

export default Navigation;
