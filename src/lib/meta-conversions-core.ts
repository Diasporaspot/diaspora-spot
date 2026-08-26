export const META_EVENT_NAMES = [
  'CompleteRegistration',
  'PageView',
  'ViewContent',
] as const;

export type MetaEventName = (typeof META_EVENT_NAMES)[number];

export type MetaEventProperties = {
  content_category?: string;
  content_ids?: string[];
  content_name?: string;
  content_type?: string;
  currency?: string;
  value?: number;
};

export type MetaEventUserData = {
  email?: string;
  name?: string;
  phone?: string;
};

export type MetaRequestContext = {
  clientIpAddress?: string;
  clientUserAgent?: string;
  fbc?: string;
  fbp?: string;
};

const MAX_EVENT_ID_LENGTH = 100;
const EVENT_ID_PATTERN = /^[A-Za-z0-9._:-]+$/;

function parseCookies(cookieHeader: string | null) {
  return new Map(
    (cookieHeader || '')
      .split(';')
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        const separatorIndex = part.indexOf('=');
        return separatorIndex === -1
          ? [part, '']
          : [part.slice(0, separatorIndex), part.slice(separatorIndex + 1)];
      }),
  );
}

export function hasMetaAdvertisingConsent(cookieHeader: string | null) {
  const consentCookie = parseCookies(cookieHeader).get('ds_cookie_consent');

  if (!consentCookie) {
    return false;
  }

  try {
    const consent = JSON.parse(decodeURIComponent(consentCookie)) as { advertising?: unknown };
    return consent.advertising === true;
  } catch {
    return false;
  }
}

export function getMetaRequestContext(request: Request): MetaRequestContext {
  const cookies = parseCookies(request.headers.get('cookie'));
  const forwardedFor = request.headers.get('x-forwarded-for');

  return {
    clientIpAddress: forwardedFor?.split(',')[0]?.trim() || undefined,
    clientUserAgent: request.headers.get('user-agent') || undefined,
    fbc: cookies.get('_fbc') || undefined,
    fbp: cookies.get('_fbp') || undefined,
  };
}

export function normalizeMetaEventId(value: unknown) {
  if (typeof value !== 'string') {
    return '';
  }

  const eventId = value.trim();
  return eventId.length > 0 &&
    eventId.length <= MAX_EVENT_ID_LENGTH &&
    EVENT_ID_PATTERN.test(eventId)
    ? eventId
    : '';
}

export function isMetaEventName(value: unknown): value is MetaEventName {
  return typeof value === 'string' && META_EVENT_NAMES.includes(value as MetaEventName);
}

export function sanitizeMetaEventSourceUrl(value: unknown, requestUrl?: string) {
  if (typeof value !== 'string' || !value.trim()) {
    return requestUrl ? new URL(requestUrl).origin : undefined;
  }

  try {
    const eventUrl = new URL(value);
    if (eventUrl.protocol !== 'https:' && eventUrl.protocol !== 'http:') {
      return requestUrl ? new URL(requestUrl).origin : undefined;
    }

    if (requestUrl) {
      const requestHost = new URL(requestUrl).hostname;
      const isLocalRequest = requestHost === 'localhost' || requestHost === '127.0.0.1';
      if (!isLocalRequest && eventUrl.hostname !== requestHost) {
        return new URL(requestUrl).origin;
      }
    }

    eventUrl.hash = '';
    return eventUrl.toString();
  } catch {
    return requestUrl ? new URL(requestUrl).origin : undefined;
  }
}

export function sanitizeMetaEventProperties(value: unknown): MetaEventProperties | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined;
  }

  const input = value as Record<string, unknown>;
  const properties: MetaEventProperties = {};

  for (const key of ['content_category', 'content_name', 'content_type', 'currency'] as const) {
    const property = input[key];
    if (typeof property === 'string' && property.trim()) {
      properties[key] = property.trim().slice(0, 200);
    }
  }

  if (Array.isArray(input.content_ids)) {
    properties.content_ids = input.content_ids
      .filter((item): item is string => typeof item === 'string' && Boolean(item.trim()))
      .slice(0, 20)
      .map((item) => item.trim().slice(0, 200));
  }

  if (typeof input.value === 'number' && Number.isFinite(input.value) && input.value >= 0) {
    properties.value = input.value;
  }

  return Object.keys(properties).length ? properties : undefined;
}
