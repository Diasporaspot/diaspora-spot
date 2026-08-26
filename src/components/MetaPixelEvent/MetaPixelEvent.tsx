'use client';

import { useEffect } from 'react';
import type {
  MetaEventName,
  MetaEventProperties,
} from '@/lib/meta-conversions-core';

type MetaPixelWindow = Window & {
  fbq?: (
    action: 'track',
    eventName: MetaEventName,
    properties?: MetaEventProperties,
    options?: { eventID: string },
  ) => void;
};

type MetaPixelEventProps = {
  dedupeKey?: string;
  eventName: MetaEventName;
  properties?: MetaEventProperties;
};

type TrackMetaPixelEventOptions = {
  eventId?: string;
  onSent?: () => void;
  serverEventAlreadySent?: boolean;
};

function hasAdvertisingConsent() {
  const consentCookie = document.cookie
    .split('; ')
    .find((item) => item.startsWith('ds_cookie_consent='))
    ?.slice('ds_cookie_consent='.length);

  if (!consentCookie) {
    return false;
  }

  try {
    return (JSON.parse(decodeURIComponent(consentCookie)) as { advertising?: unknown })
      .advertising === true;
  } catch {
    return false;
  }
}

export function hasMetaAdvertisingConsent() {
  return hasAdvertisingConsent();
}

export function createMetaEventId(eventName: MetaEventName) {
  const randomId =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2)}`;

  return `ds:${eventName}:${randomId}`;
}

async function sendMetaServerEvent(
  eventId: string,
  eventName: MetaEventName,
  properties?: MetaEventProperties,
) {
  const response = await fetch('/api/meta/events', {
    body: JSON.stringify({
      eventId,
      eventName,
      eventSourceUrl: window.location.href,
      properties,
    }),
    headers: { 'Content-Type': 'application/json' },
    keepalive: true,
    method: 'POST',
  });

  if (!response.ok) {
    throw new Error('Meta server event was not accepted.');
  }
}

export function trackMetaPixelEvent(
  eventName: MetaEventName,
  properties?: MetaEventProperties,
  options?: TrackMetaPixelEventOptions,
) {
  const startedAt = Date.now();
  const eventId = options?.eventId || createMetaEventId(eventName);
  let serverEventStarted = options?.serverEventAlreadySent === true;
  let timeoutId: number | undefined;

  function markSent() {
    options?.onSent?.();
  }

  function ensureServerEvent() {
    if (serverEventStarted || !hasAdvertisingConsent()) {
      return;
    }

    serverEventStarted = true;
    void sendMetaServerEvent(eventId, eventName, properties)
      .then(markSent)
      .catch(() => undefined);
  }

  function sendWhenReady() {
    ensureServerEvent();
    const fbq = (window as MetaPixelWindow).fbq;

    if (typeof fbq === 'function') {
      fbq('track', eventName, properties, { eventID: eventId });
      markSent();
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
