'use client';

import { useEffect, useRef } from 'react';

export function useOutsideClick<T extends HTMLElement>(
  handler: () => void,
  listenCapturing = true
) {
  const ref = useRef<T | null>(null);

  useEffect(() => {
    function handleClick(event: MouseEvent) {
      const target = event.target as Node | null;

      if (ref.current && target && !ref.current.contains(target)) {
        handler();
      }
    }

    document.addEventListener('click', handleClick, listenCapturing);

    return () => {
      document.removeEventListener('click', handleClick, listenCapturing);
    };
  }, [handler, listenCapturing]);

  return ref;
}
