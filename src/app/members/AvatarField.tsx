'use client';

import Image from 'next/image';
import { Camera, CircleUserRound } from 'lucide-react';
import { useEffect, useId, useState } from 'react';
import styles from './members.module.css';

type AvatarFieldProps = {
  avatarSrc?: string;
  name: string;
};

export default function AvatarField({ avatarSrc, name }: AvatarFieldProps) {
  const inputId = useId();
  const [previewSrc, setPreviewSrc] = useState(avatarSrc);
  const [fileName, setFileName] = useState('');

  useEffect(() => {
    return () => {
      if (previewSrc?.startsWith('blob:')) {
        URL.revokeObjectURL(previewSrc);
      }
    };
  }, [previewSrc]);

  function previewAvatar(file?: File) {
    if (!file) {
      return;
    }

    setPreviewSrc((current) => {
      if (current?.startsWith('blob:')) {
        URL.revokeObjectURL(current);
      }

      return URL.createObjectURL(file);
    });
    setFileName(file.name);
  }

  return (
    <div className={styles.avatarEditor}>
      <div className={styles.avatarPreview}>
        <CircleUserRound aria-hidden="true" size={42} strokeWidth={1.65} />
        {previewSrc ? (
          <Image
            alt={`${name || 'Member'} profile photo`}
            className={styles.avatarImage}
            fill
            sizes="96px"
            src={previewSrc}
            unoptimized={previewSrc.startsWith('blob:')}
          />
        ) : null}
      </div>
      <div className={styles.avatarActions}>
        <strong>Profile photo</strong>
        <p>Upload a JPG, PNG, or WebP image up to 2 MB.</p>
        <label className={styles.avatarButton} htmlFor={inputId}>
          <Camera aria-hidden="true" size={15} />
          {previewSrc ? 'Change photo' : 'Upload photo'}
        </label>
        <input
          accept="image/jpeg,image/png,image/webp"
          className={styles.fileInput}
          id={inputId}
          name="avatar"
          onChange={(event) => previewAvatar(event.target.files?.[0])}
          type="file"
        />
        {fileName ? <small className={styles.selectedFile}>{fileName} selected</small> : null}
      </div>
    </div>
  );
}
