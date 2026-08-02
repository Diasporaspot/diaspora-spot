'use client';

import { Mail } from 'lucide-react';
import { useState, useTransition } from 'react';
import { setMarketingPreference } from './actions';
import styles from './members.module.css';

export default function MarketingPreferenceCard({ initialValue }: { initialValue: boolean }) {
  const [isSubscribed, setIsSubscribed] = useState(initialValue);
  const [feedback, setFeedback] = useState('');
  const [isPending, startTransition] = useTransition();

  function changePreference(nextValue: boolean) {
    const previousValue = isSubscribed;
    setIsSubscribed(nextValue);
    setFeedback('');

    startTransition(async () => {
      const result = await setMarketingPreference(nextValue);

      if (!result.ok) {
        setIsSubscribed(previousValue);
        setFeedback(result.message);
        return;
      }

      setFeedback(nextValue ? 'You are now subscribed.' : 'You have been unsubscribed.');
    });
  }

  return (
    <section className={styles.preferenceCard}>
      <div className={styles.preferenceIcon}>
        <Mail aria-hidden="true" size={22} />
      </div>
      <div className={styles.preferenceCopy}>
        <div className={styles.preferenceHeading}>
          <div>
            <span className={styles.cardEyebrow}>Communications</span>
            <h2>Member email updates</h2>
          </div>
          <span className={`${styles.preferenceStatus} ${isSubscribed ? styles.statusOn : ''}`}>
            {isPending ? 'Saving…' : isSubscribed ? 'Subscribed' : 'Not subscribed'}
          </span>
        </div>
        <p>
          Receive member news, offers, workshop announcements, and event updates. Essential account
          and security emails remain separate.
        </p>
        <div className={styles.preferenceControl}>
          <div>
            <strong>{isSubscribed ? 'Email updates are on' : 'Email updates are off'}</strong>
            <small>You can change this preference whenever you like.</small>
          </div>
          <label className={styles.switch}>
            <span className={styles.srOnly}>Subscribe to member email updates</span>
            <input
              checked={isSubscribed}
              disabled={isPending}
              onChange={(event) => changePreference(event.target.checked)}
              role="switch"
              type="checkbox"
            />
            <span aria-hidden="true" className={styles.switchTrack}>
              <span className={styles.switchThumb} />
            </span>
          </label>
        </div>
        {feedback ? <p aria-live="polite" className={styles.preferenceFeedback}>{feedback}</p> : null}
      </div>
    </section>
  );
}
