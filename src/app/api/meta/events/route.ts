import {
  getMetaRequestContext,
  hasMetaAdvertisingConsent,
  isMetaEventName,
  normalizeMetaEventId,
  sanitizeMetaEventProperties,
  sanitizeMetaEventSourceUrl,
} from '@/lib/meta-conversions-core';
import { sendMetaConversion } from '@/lib/meta-conversions';

export const runtime = 'nodejs';

type MetaEventBody = {
  eventId?: unknown;
  eventName?: unknown;
  eventSourceUrl?: unknown;
  properties?: unknown;
};

const RATE_LIMIT_WINDOW_MS = 60 * 1000;
const RATE_LIMIT_MAX_ATTEMPTS = 60;
const attempts = new Map<string, number[]>();

function isRateLimited(request: Request) {
  const key = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const now = Date.now();
  const recentAttempts = (attempts.get(key) ?? []).filter(
    (timestamp) => now - timestamp < RATE_LIMIT_WINDOW_MS,
  );

  recentAttempts.push(now);
  attempts.set(key, recentAttempts);
  return recentAttempts.length > RATE_LIMIT_MAX_ATTEMPTS;
}

export async function POST(request: Request) {
  if (!hasMetaAdvertisingConsent(request.headers.get('cookie'))) {
    return Response.json({ ok: true, skipped: 'no-advertising-consent' });
  }

  if (isRateLimited(request)) {
    return Response.json({ error: 'Too many tracking requests.' }, { status: 429 });
  }

  try {
    const body = (await request.json()) as MetaEventBody;
    const eventId = normalizeMetaEventId(body.eventId);

    if (!eventId || !isMetaEventName(body.eventName)) {
      return Response.json({ error: 'Invalid Meta event.' }, { status: 400 });
    }

    const result = await sendMetaConversion({
      eventId,
      eventName: body.eventName,
      eventSourceUrl: sanitizeMetaEventSourceUrl(body.eventSourceUrl, request.url),
      properties: sanitizeMetaEventProperties(body.properties),
      requestContext: getMetaRequestContext(request),
    });

    return Response.json({ ok: true, sent: result.sent });
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : 'Meta event delivery failed.';
    console.error(`Meta event route failed: ${message}`);
    return Response.json({ error: 'Meta event delivery failed.' }, { status: 502 });
  }
}
