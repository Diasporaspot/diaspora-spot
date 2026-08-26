import 'server-only';

import { createHash } from 'node:crypto';
import type {
  MetaEventName,
  MetaEventProperties,
  MetaEventUserData,
  MetaRequestContext,
} from '@/lib/meta-conversions-core';

type SendMetaConversionInput = {
  eventId: string;
  eventName: MetaEventName;
  eventSourceUrl?: string;
  properties?: MetaEventProperties;
  requestContext?: MetaRequestContext;
  userData?: MetaEventUserData;
};

type MetaApiResponse = {
  error?: { code?: number; message?: string; type?: string };
  events_received?: number;
  fbtrace_id?: string;
  messages?: string[];
};

function hash(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function normalizedEmail(value?: string) {
  return value?.trim().toLowerCase() || '';
}

function normalizedPhone(value?: string) {
  return value?.replace(/\D/g, '') || '';
}

function normalizedNameParts(value?: string) {
  const parts = (value || '')
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, '')
    .split(/\s+/)
    .filter(Boolean);

  return {
    firstName: parts[0] || '',
    lastName: parts.length > 1 ? parts.at(-1) || '' : '',
  };
}

function getMetaConfiguration() {
  return {
    accessToken: process.env.META_CONVERSIONS_API_TOKEN,
    graphApiVersion: process.env.META_GRAPH_API_VERSION || 'v25.0',
    pixelId: process.env.META_PIXEL_ID || process.env.NEXT_PUBLIC_META_PIXEL_ID,
    testEventCode: process.env.META_TEST_EVENT_CODE,
  };
}

export function isMetaConversionsConfigured() {
  const { accessToken, pixelId } = getMetaConfiguration();
  return Boolean(accessToken && pixelId);
}

export async function sendMetaConversion({
  eventId,
  eventName,
  eventSourceUrl,
  properties,
  requestContext = {},
  userData = {},
}: SendMetaConversionInput) {
  const { accessToken, graphApiVersion, pixelId, testEventCode } = getMetaConfiguration();

  if (!accessToken || !pixelId) {
    return { sent: false as const, skipped: 'not-configured' as const };
  }

  const email = normalizedEmail(userData.email);
  const phone = normalizedPhone(userData.phone);
  const { firstName, lastName } = normalizedNameParts(userData.name);
  const metaUserData = {
    ...(email ? { em: [hash(email)] } : {}),
    ...(phone ? { ph: [hash(phone)] } : {}),
    ...(firstName ? { fn: [hash(firstName)] } : {}),
    ...(lastName ? { ln: [hash(lastName)] } : {}),
    ...(requestContext.clientIpAddress
      ? { client_ip_address: requestContext.clientIpAddress }
      : {}),
    ...(requestContext.clientUserAgent
      ? { client_user_agent: requestContext.clientUserAgent }
      : {}),
    ...(requestContext.fbc ? { fbc: requestContext.fbc } : {}),
    ...(requestContext.fbp ? { fbp: requestContext.fbp } : {}),
  };

  const response = await fetch(
    `https://graph.facebook.com/${graphApiVersion}/${encodeURIComponent(pixelId)}/events`,
    {
      body: JSON.stringify({
        access_token: accessToken,
        data: [
          {
            action_source: 'website',
            event_id: eventId,
            event_name: eventName,
            event_source_url: eventSourceUrl,
            event_time: Math.floor(Date.now() / 1000),
            user_data: metaUserData,
            ...(properties ? { custom_data: properties } : {}),
          },
        ],
        ...(testEventCode ? { test_event_code: testEventCode } : {}),
      }),
      headers: { 'Content-Type': 'application/json' },
      method: 'POST',
      signal: AbortSignal.timeout(8000),
    },
  );
  const result = (await response.json()) as MetaApiResponse;

  if (!response.ok || result.error) {
    const error = new Error(result.error?.message || 'Meta rejected the conversion event.');
    error.name = 'MetaConversionsApiError';
    throw error;
  }

  return {
    eventsReceived: result.events_received ?? 0,
    sent: true as const,
  };
}

export async function sendMetaConversionSafely(input: SendMetaConversionInput) {
  try {
    return await sendMetaConversion(input);
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : 'Unknown Meta API error';
    console.error(`Meta conversion delivery failed: ${message}`);
    return { sent: false as const, skipped: 'delivery-failed' as const };
  }
}
