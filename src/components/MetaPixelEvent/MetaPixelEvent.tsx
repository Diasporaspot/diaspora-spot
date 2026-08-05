'use client';

import { useEffect } from 'react';

type MetaPixelEventName = 'CompleteRegistration' | 'ViewContent';

type MetaPixelEventProperties = {
  content_category?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  currency?: string;
  value?: number;
};

type MetaPixelWindow = Window & {
  fbq?: (
    action: 'track',
    eventName: MetaPixelEventName,
    properties?: MetaPixelEventProperties,
  ) => void;
};

type MetaPixelEventProps = {
  dedupeKey?: string;
  eventName: MetaPixelEventName;
  properties?: MetaPixelEventProperties;
};

export function trackMetaPixelEvent(
  eventName: MetaPixelEventName,
  properties?: MetaPixelEventProperties,
  options?: { onSent?: () => void },
) {
  const startedAt = Date.now();
  let timeoutId: number | undefined;

  function sendWhenReady() {
    const fbq = (window as MetaPixelWindow).fbq;

    if (typeof fbq === 'function') {
      fbq('track', eventName, properties);
      options?.onSent?.();
      return;
    }

    if (Date.now() - startedAt < 30000) {
      timeoutId = window.setTimeout(sendWhenReady, 250);
    }
  }

  sendWhenReady();

  return () => {
    if (timeoutId) {
      window.clearTimeout(timeoutId);
    }
  };
}

export default function MetaPixelEvent({
  dedupeKey,
  eventName,
  properties,
}: MetaPixelEventProps) {
  useEffect(() => {
    if (dedupeKey) {
      const trackingKey = `ds_meta_event:${eventName}:${dedupeKey}`;

      if (window.sessionStorage.getItem(trackingKey)) {
        return;
      }

      return trackMetaPixelEvent(eventName, properties, {
        onSent: () => window.sessionStorage.setItem(trackingKey, 'true'),
      });
    }

    return trackMetaPixelEvent(eventName, properties);
  }, [dedupeKey, eventName, properties]);

  return null;
}
