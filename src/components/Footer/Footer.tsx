import Image from 'next/image';
import Link from 'next/link';
import SocialLinks from '@/components/SocialLinks/SocialLinks';
import { footerLinks } from '@/data/menu';
import styles from './footer.module.css';

function Footer() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <div className={styles.brand}>
          <Image src="/assets/logo-primary-white.png" alt="DiasporaSpot" width={142} height={26} />
          <p className={styles.brandTag}>A digital hub to help you build and grow your life abroad.</p>
          <div className={styles.socialWrap}>
            <SocialLinks />
          </div>
        </div>

        <div className={styles.cols}>
          {Object.entries(footerLinks).map(([section, items]) => (
            <div key={section}>
              <h5>{section}</h5>
              <ul>
                {items.map((item) => (
                  <li key={item.label}>
                    {item.href.startsWith('/') ? (
                      <Link href={item.href}>{item.label}</Link>
                    ) : (
                      <a href={item.href}>{item.label}</a>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className={styles.rule} />

      <div className={styles.base}>
        <span>We Thrive Anywhere.</span>
        <span>© 2026 DiasporaSpot</span>
      </div>
    </footer>
  );
}

export default Footer;
