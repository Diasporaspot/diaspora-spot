'use client';

import { Menu, X } from 'lucide-react';
import { motion } from 'framer-motion';

import styles from './styles/specialmenubutton.module.css';

function SpecialMenuButton({
  isActive,
  toggleMenu,
}: {
  isActive: boolean;
  toggleMenu: () => void;
}) {
  return (
    <button
      className={styles.button}
      onClick={toggleMenu}
      type="button"
      aria-label={isActive ? 'Close menu' : 'Open menu'}
      aria-expanded={isActive}
    >
      <motion.div
        className={styles.slider}
        animate={{ top: isActive ? '-100%' : '0%' }}
        transition={{
          duration: 0.5,
          type: 'tween',
          ease: [0.76, 0, 0.24, 1],
        }}
      >
        <ButtonFace label={<Menu size={20} strokeWidth={2} />} />
        <ButtonFace label={<X size={20} strokeWidth={2} />} />
      </motion.div>
    </button>
  );
}

function ButtonFace({ label }: { label: React.ReactNode }) {
  return (
    <div className={styles.el} aria-hidden="true">
      <PerspectiveText label={label} />
    </div>
  );
}

function PerspectiveText({ label }: { label: React.ReactNode }) {
  return (
    <div className={styles.perspectiveText}>
      <p>{label}</p>
      <p>{label}</p>
    </div>
  );
}

export default SpecialMenuButton;
