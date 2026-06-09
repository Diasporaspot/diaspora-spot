type SubscribeInput = {
  email: string;
  name: string;
};

type MailerLiteErrorBody = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

const MAILERLITE_SUBSCRIBERS_URL = 'https://connect.mailerlite.com/api/subscribers';

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function subscribeToMailerLite({ email, name }: SubscribeInput) {
  const apiKey = process.env.MAILERLITE_API_KEY;
  const groupId = process.env.MAILERLITE_GROUP_ID;

  if (!apiKey) {
    throw new Error('MAILERLITE_API_KEY is not configured.');
  }

  const response = await fetch(MAILERLITE_SUBSCRIBERS_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      email,
      fields: { name },
      ...(groupId ? { groups: [groupId] } : {}),
    }),
  });

  if (!response.ok) {
    let body: MailerLiteErrorBody | undefined;

    try {
      body = (await response.json()) as MailerLiteErrorBody;
    } catch {
      body = undefined;
    }

    const validationMessage = body?.errors ? Object.values(body.errors).flat().join(' ') : '';
    throw new Error(validationMessage || body?.message || body?.error || 'MailerLite subscription failed.');
  }
}
