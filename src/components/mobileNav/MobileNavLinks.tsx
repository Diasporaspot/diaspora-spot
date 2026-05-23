'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';

import { perspective } from '@/data/anim';
import styles from './styles/mobilenvalinks.module.css';

type MenuLink = {
  path: string;
  label: string;
  dropdown?: { path: string; label: string }[] | null;
};

function MobileNavLinks({
  data,
  closeMenu,
}: {
  data: { nav: MenuLink; index: number };
  closeMenu: () => void;
}) {
  const { nav, index } = data;

  return (
    <motion.li
      key={nav.label}
      className={styles.link}
      variants={perspective}
      animate="enter"
      exit="exit"
      initial="initial"
      custom={index}
    >
      <Link href={nav.path} className={styles.navLink} onClick={closeMenu}>
        {nav.label}
      </Link>
    </motion.li>
  );
}

export default MobileNavLinks;
