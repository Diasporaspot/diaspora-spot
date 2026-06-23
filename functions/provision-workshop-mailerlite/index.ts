import {createClient} from '@sanity/client';
import {documentEventHandler} from '@sanity/functions';

type WorkshopEvent = {
  _id: string;
  _type: 'workshop';
  title: string;
  date: string;
  status: 'published';
  mailerLiteGroupId?: string;
  mailerLiteProvisioningStatus?: 'pending' | 'ready' | 'failed';
};

type MailerLiteGroup = {
  id: string;
  name: string;
};

type MailerLiteErrorBody = {
  message?: string;
  error?: string;
  errors?: Record<string, string[]>;
};

const MAILERLITE_GROUPS_URL = 'https://connect.mailerlite.com/api/groups';

function createGroupName(workshop: WorkshopEvent) {
  return `Workshop | ${workshop.title.trim()} | ${workshop.date} | ${workshop._id}`.slice(0, 255);
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

async function mailerLiteRequest(url: string, apiKey: string, init: RequestInit) {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(await parseMailerLiteError(response));
  }

  return response;
}

async function findOrCreateGroup(name: string, apiKey: string) {
  const searchUrl = new URL(MAILERLITE_GROUPS_URL);
  searchUrl.searchParams.set('filter[name]', name);
  searchUrl.searchParams.set('limit', '100');

  const searchResponse = await mailerLiteRequest(searchUrl.toString(), apiKey, {method: 'GET'});
  const searchBody = (await searchResponse.json()) as {data?: MailerLiteGroup[]};
  const existingGroup = searchBody.data?.find((group) => group.name === name);

  if (existingGroup) {
    return existingGroup;
  }

  const createResponse = await mailerLiteRequest(MAILERLITE_GROUPS_URL, apiKey, {
    method: 'POST',
    body: JSON.stringify({name}),
  });
  const createBody = (await createResponse.json()) as {data?: MailerLiteGroup};

  if (!createBody.data?.id || !createBody.data.name) {
    throw new Error('MailerLite returned an invalid group response.');
  }

  return createBody.data;
}

export const handler = documentEventHandler<WorkshopEvent>(async ({context, event}) => {
  const workshop = event.data;
  const client = createClient({
    ...context.clientOptions,
    apiVersion: '2025-06-02',
    useCdn: false,
  });

  if (workshop.mailerLiteGroupId) {
    console.log(`Workshop ${workshop._id} already has a MailerLite group.`);
    return;
  }

  try {
    await client
      .patch(workshop._id)
      .set({mailerLiteProvisioningStatus: 'pending'})
      .unset(['mailerLiteProvisioningError'])
      .commit();

    const apiKey = process.env.MAILERLITE_API_KEY;

    if (!apiKey) {
      throw new Error('MAILERLITE_API_KEY is not configured for this function.');
    }

    const group = await findOrCreateGroup(createGroupName(workshop), apiKey);

    await client
      .patch(workshop._id)
      .set({
        mailerLiteGroupId: group.id,
        mailerLiteGroupName: group.name,
        mailerLiteProvisioningStatus: 'ready',
      })
      .unset(['mailerLiteProvisioningError'])
      .commit();

    console.log(`MailerLite group ${group.id} is ready for workshop ${workshop._id}.`);
  } catch (reason) {
    const message = reason instanceof Error ? reason.message : 'Unknown provisioning error.';

    await client
      .patch(workshop._id)
      .set({
        mailerLiteProvisioningStatus: 'failed',
        mailerLiteProvisioningError: message.slice(0, 500),
      })
      .commit();

    console.error(`MailerLite provisioning failed for workshop ${workshop._id}: ${message}`);
    throw reason;
  }
});
