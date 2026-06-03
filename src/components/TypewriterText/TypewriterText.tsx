'use client';

import { useEffect, useState } from 'react';

type TypewriterTextProps = {
  text: string;
  active?: boolean;
  speed?: number;
  className?: string;
  as?: 'span';
};

function TypewriterText({
  text,
  active = true,
  speed = 42,
  className,
}: TypewriterTextProps) {
  const [typedText, setTypedText] = useState('');

  useEffect(() => {
    if (!active) {
      return;
    }

    let index = 0;
    const intervalId = window.setInterval(() => {
      index += 1;
      setTypedText(text.slice(0, index));

      if (index >= text.length) {
        window.clearInterval(intervalId);
      }
    }, speed);

    return () => window.clearInterval(intervalId);
  }, [active, speed, text]);

  const visibleText = active ? typedText : text;

  return (
    <span className={className} aria-label={text}>
      <span aria-hidden="true">{visibleText}</span>
    </span>
  );
}

export default TypewriterText;
