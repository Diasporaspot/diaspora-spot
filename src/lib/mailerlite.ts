type SubscribeInput = {
  email: string;
  name: string;
  groupIds?: string[];
};

type MailerLiteGroup = {
  id: string;
  name: string;
};

type MailerLiteGroupList = {
  data?: MailerLiteGroup[];
};

type MailerLiteGroupResponse = {
  data?: MailerLiteGroup;
};

type MailerLiteErrorBody = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

const MAILERLITE_SUBSCRIBERS_URL = 'https://connect.mailerlite.com/api/subscribers';
const MAILERLITE_GROUPS_URL = 'https://connect.mailerlite.com/api/groups';

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function getApiKey() {
  const apiKey = process.env.MAILERLITE_API_KEY;

  if (!apiKey) {
    throw new Error('MAILERLITE_API_KEY is not configured.');
  }

  return apiKey;
}

async function parseMailerLiteError(response: Response) {
  let body: MailerLiteErrorBody | undefined;

  try {
    body = (await response.json()) as MailerLiteErrorBody;
  } catch {
    body = undefined;
  }

  const validationMessage = body?.errors ? Object.values(body.errors).flat().join(' ') : '';
  return validationMessage || body?.message || body?.error || 'MailerLite request failed.';
}

async function mailerLiteFetch(url: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${getApiKey()}`,
      'Content-Type': 'application/json',
      ...init.headers,
    },
  });

  if (!response.ok) {
    throw new Error(await parseMailerLiteError(response));
  }

  return response;
}

export async function subscribeToMailerLite({ email, name, groupIds }: SubscribeInput) {
  const defaultGroupId = process.env.MAILERLITE_GROUP_ID;
  const groups = groupIds ?? (defaultGroupId ? [defaultGroupId] : []);

  await mailerLiteFetch(MAILERLITE_SUBSCRIBERS_URL, {
    method: 'POST',
    body: JSON.stringify({
      email,
      fields: { name },
      ...(groups.length ? { groups } : {}),
    }),
  });
}

export async function findOrCreateMailerLiteGroup(name: string) {
  const searchUrl = new URL(MAILERLITE_GROUPS_URL);
  searchUrl.searchParams.set('filter[name]', name);
  searchUrl.searchParams.set('limit', '100');

  const searchResponse = await mailerLiteFetch(searchUrl.toString(), { method: 'GET' });
  const searchBody = (await searchResponse.json()) as MailerLiteGroupList;
  const existingGroup = searchBody.data?.find((group) => group.name === name);

  if (existingGroup) {
    return existingGroup;
  }

  const createResponse = await mailerLiteFetch(MAILERLITE_GROUPS_URL, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
  const createBody = (await createResponse.json()) as MailerLiteGroupResponse;

  if (!createBody.data?.id || !createBody.data.name) {
    throw new Error('MailerLite returned an invalid group response.');
  }

  return createBody.data;
}
