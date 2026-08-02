'use client';

import { MessageSquareText } from 'lucide-react';
import { useState, useTransition } from 'react';
import { setSmsMarketingPreference } from './actions';
import styles from './members.module.css';

export default function SmsPreferenceCard({
  hasPhoneNumber,
  initialValue,
}: {
  hasPhoneNumber: boolean;
  initialValue: boolean;
}) {
  const [isSubscribed, setIsSubscribed] = useState(initialValue);
  const [feedback, setFeedback] = useState('');
  const [isPending, startTransition] = useTransition();

  function changePreference(nextValue: boolean) {
    const previousValue = isSubscribed;
    setIsSubscribed(nextValue);
    setFeedback('');

    startTransition(async () => {
      const result = await setSmsMarketingPreference(nextValue);

      if (!result.ok) {
        setIsSubscribed(previousValue);
        setFeedback(result.message);
        return;
      }

      setFeedback(nextValue ? 'SMS updates are now on.' : 'You have opted out of SMS updates.');
    });
  }

  return (
    <section className={styles.preferenceCard}>
      <div className={styles.preferenceIcon}>
        <MessageSquareText aria-hidden="true" size={22} />
      </div>
      <div className={styles.preferenceCopy}>
        <div className={styles.preferenceHeading}>
          <div>
            <span className={styles.cardEyebrow}>Communications</span>
            <h2>Member SMS updates</h2>
          </div>
          <span className={`${styles.preferenceStatus} ${isSubscribed ? styles.statusOn : ''}`}>
            {isPending ? 'Saving…' : isSubscribed ? 'Subscribed' : 'Not subscribed'}
          </span>
        </div>
        <p>
          Receive occasional member news, offers, workshop announcements, and event updates by SMS.
          Message frequency varies and carrier charges may apply.
        </p>
        <div className={styles.preferenceControl}>
          <div>
            <strong>{isSubscribed ? 'SMS updates are on' : 'SMS updates are off'}</strong>
            <small>
              {hasPhoneNumber
                ? 'You can change this preference whenever you like.'
                : 'Add and save your mobile number above to turn this on.'}
            </small>
          </div>
          <label className={styles.switch}>
            <span className={styles.srOnly}>Subscribe to member SMS updates</span>
            <input
              checked={isSubscribed}
              disabled={isPending || (!hasPhoneNumber && !isSubscribed)}
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
