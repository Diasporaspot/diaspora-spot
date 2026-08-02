'use client';

import { useFormStatus } from 'react-dom';
import styles from './members.module.css';

export default function ProfileSaveButton() {
  const { pending } = useFormStatus();

  return (
    <button className={styles.saveButton} disabled={pending} type="submit">
      {pending ? 'Saving changes…' : 'Save profile'}
    </button>
  );
}
