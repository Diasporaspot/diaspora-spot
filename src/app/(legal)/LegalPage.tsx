import Link from 'next/link';
import type { ReactNode } from 'react';
import Footer from '@/components/Footer/Footer';
import Topbar from '@/components/Topbar/Topbar';
import styles from './legal-page.module.css';

type LegalSection = {
  title: string;
  paragraphs?: ReactNode[];
  items?: string[];
};

type LegalPageProps = {
  activePath: '/privacy-policy' | '/terms-of-use';
  eyebrow: string;
  intro: string;
  sections: LegalSection[];
  title: string;
};

const legalLinks = [
  { href: '/privacy-policy', label: 'Privacy Policy' },
  { href: '/terms-of-use', label: 'Terms of Use' },
];

export default function LegalPage({ activePath, eyebrow, intro, sections, title }: LegalPageProps) {
  return (
    <div className={styles.page}>
      <Topbar />
      <main>
        <section className={styles.hero}>
          <div className="wrap">
            <div className={styles.heroInner}>
              <span className={styles.eyebrow}>{eyebrow}</span>
              <h1 className={styles.title}>{title}</h1>
              <p className={styles.intro}>{intro}</p>
            </div>
          </div>
        </section>

        <section className={`wrap ${styles.content}`} aria-label={title}>
          <article className={styles.document}>
            {sections.map((section) => (
              <section className={styles.section} key={section.title}>
                <h2>{section.title}</h2>
                {section.paragraphs?.map((paragraph, index) => <p key={index}>{paragraph}</p>)}
                {section.items ? (
                  <ul>
                    {section.items.map((item) => (
                      <li key={item}>{item}</li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}
          </article>

          <aside className={styles.aside} aria-label="Legal pages">
            <span className={styles.asideLabel}>Legal</span>
            <nav>
              {legalLinks.map((link) => (
                <Link
                  className={link.href === activePath ? styles.active : undefined}
                  href={link.href}
                  key={link.href}
                >
                  {link.label}
                </Link>
              ))}
            </nav>
            <p className={styles.contact}>
              Questions about these terms can be sent to{' '}
              <a href="mailto:contact@otoworks.co.uk">contact@otoworks.co.uk</a>.
            </p>
          </aside>
        </section>
      </main>
      <Footer />
    </div>
  );
}
