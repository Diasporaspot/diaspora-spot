import { socialLinks } from '@/data/menu';
import styles from './socialLinks.module.css';

type SocialLinksProps = {
  tone?: 'dark' | 'light';
};

function SocialIcon({ label }: { label: string }) {
  if (label === 'Instagram') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <rect x="4" y="4" width="16" height="16" rx="4.5" />
        <circle cx="12" cy="12" r="3.4" />
        <circle cx="17" cy="7" r="1.1" fill="currentColor" stroke="none" />
      </svg>
    );
  }

  if (label === 'TikTok') {
    return (
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path
          d="M14.4 4c.4 2.8 2 4.5 4.6 4.8v3.1c-1.6.1-3.1-.4-4.5-1.3v5.5c0 3.2-2.2 5.6-5.3 5.6-2.8 0-5.1-2-5.1-4.8 0-3.2 2.7-5.3 6.1-4.7v3.2c-1.5-.5-2.9.2-2.9 1.5 0 1 .8 1.7 1.8 1.7 1.2 0 2-.8 2-2.3V4h3.3Z"
          fill="currentColor"
          stroke="none"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.8 9.4h3.1V20H6.8V9.4Zm1.6-5.1c1 0 1.7.7 1.7 1.6 0 .9-.7 1.6-1.8 1.6-1 0-1.7-.7-1.7-1.6 0-.9.7-1.6 1.8-1.6ZM12 9.4h3v1.4c.4-.7 1.5-1.6 3.1-1.6 3.3 0 3.9 2.2 3.9 5V20h-3.1v-5.2c0-1.2 0-2.8-1.7-2.8s-2 1.3-2 2.7V20H12V9.4Z"
        fill="currentColor"
        stroke="none"
      />
    </svg>
  );
}

function SocialLinks({ tone = 'dark' }: SocialLinksProps) {
  return (
    <div className={`${styles.socialLinks} ${styles[tone]}`} aria-label="DiasporaSpot social media">
      {socialLinks.map((item) => (
        <a
          key={item.label}
          href={item.href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`Follow DiasporaSpot on ${item.label}`}
          title={item.label}
        >
          <SocialIcon label={item.label} />
        </a>
      ))}
    </div>
  );
}

export default SocialLinks;
