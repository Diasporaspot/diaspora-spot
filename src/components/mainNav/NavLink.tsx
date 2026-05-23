'use client';

import Link from 'next/link';

import styles from './styles/navlink.module.css';

type MenuLink = {
  path: string;
  label: string;
  dropdown?: { path: string; label: string }[] | null;
};

function NavLink({ link }: { link: MenuLink }) {
  return (
    <li className={styles.navItem}>
      <Link href={link.path} className={styles.navLink}>
        {link.label}
      </Link>
    </li>
  );
}

export default NavLink;
