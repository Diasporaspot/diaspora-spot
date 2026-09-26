import { useCallback, useEffect, useState } from 'react';
import { Badge, Button, Card, Flex, Grid, Stack, Text } from '@sanity/ui';
import { useClient, useFormValue } from 'sanity';

type Overview = {
  environment: string;
  capacity: number | null;
  remaining: number | null;
  confirmed: number;
  held: number;
  waitingCount: number;
  emailUpdateIssues: number;
  full: boolean;
  closed: boolean;
  group: { group_id: string; group_name: string } | null;
  updatedAt: string;
};

function Metric({ label, value }: { label: string; value: number | string }) {
  return <Card border padding={3} radius={2}><Stack space={2}>
    <Text muted size={1}>{label}</Text>
    <Text size={3} weight="bold">{value}</Text>
  </Stack></Card>;
}

export function EventOverview() {
  const client = useClient({ apiVersion: '2025-06-02' });
  const documentId = String(useFormValue(['_id']) || '').replace(/^drafts\./, '');
  const type = useFormValue(['_type']) === 'workshopSeries' ? 'series' : 'workshop';
  const status = useFormValue(['status']);
  const [environment, setEnvironment] = useState(status === 'published' ? 'production' : 'staging');
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const embeddedOrigin = typeof window !== 'undefined' && window.location.pathname.startsWith('/studio')
    ? window.location.origin : undefined;
  const base = environment === 'staging'
    ? embeddedOrigin || process.env.SANITY_STUDIO_STAGING_URL || 'https://diasporaspotstaging.vercel.app'
    : process.env.SANITY_STUDIO_PRODUCTION_URL || 'https://diasporaspot.com';

  const load = useCallback(async (action?: Record<string, string>) => {
    const token = client.config().token;
    if (!token) { setError('Please sign out and sign in again to view registration details.'); return; }
    try {
      const response = await fetch(`${base}/api/workshops/admin?id=${encodeURIComponent(documentId)}&productType=${type}`, {
        method: action ? 'POST' : 'GET',
        headers: { Authorization: `Bearer ${token}`, ...(action ? { 'Content-Type': 'application/json' } : {}) },
        ...(action ? { body: JSON.stringify(action) } : {}),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error);
      setData(result); setError('');
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Registration details could not be loaded.');
    }
  }, [base, client, documentId, type]);

  useEffect(() => {
    setData(null); void load();
    const timer = setInterval(() => void load(), 15_000);
    return () => clearInterval(timer);
  }, [load]);

  async function act(action: Record<string, string>) {
    setBusy(true); try { await load(action); } finally { setBusy(false); }
  }

  return <Card border padding={4} radius={2}><Stack space={5}>
    <Stack space={3}>
      <Text size={2} weight="bold">Registration overview</Text>
      <Flex gap={2} wrap="wrap">
        <Button mode={environment === 'staging' ? 'default' : 'ghost'} onClick={() => setEnvironment('staging')}
          text="Test data" tone={environment === 'staging' ? 'primary' : 'default'} />
        <Button mode={environment === 'production' ? 'default' : 'ghost'} onClick={() => setEnvironment('production')}
          text="Live website data" tone={environment === 'production' ? 'primary' : 'default'} />
      </Flex>
      <Text muted size={1}>{environment === 'staging'
        ? 'You are viewing test registrations. Test payments do not charge a card.'
        : 'You are viewing registrations from the live website.'}</Text>
    </Stack>

    {error ? <Card padding={3} radius={2} tone="caution"><Text size={1}>{error}</Text></Card> : null}

    {data ? <>
      <Flex align="center" gap={3} wrap="wrap">
        <Badge tone={data.closed ? 'critical' : data.full ? 'caution' : 'positive'}>
          {data.closed ? 'Registration closed' : data.full ? 'Waiting list active' : 'Booking open'}
        </Badge>
        <Text muted size={1}>Updated {new Date(data.updatedAt).toLocaleTimeString()}</Text>
      </Flex>

      <Grid columns={[2, 2, 4]} gap={3}>
        <Metric label="Capacity" value={data.capacity ?? 'Unlimited'} />
        <Metric label="Confirmed" value={data.confirmed} />
        <Metric label="In checkout" value={data.held} />
        <Metric label="Places available" value={data.remaining ?? 'Unlimited'} />
      </Grid>

      <Card padding={3} radius={2} tone={data.waitingCount ? 'caution' : 'transparent'}>
        <Flex align="center" gap={3} justify="space-between" wrap="wrap">
          <Stack space={2}>
            <Text size={1} weight="semibold">{data.waitingCount === 1
              ? '1 person is waiting for a place' : `${data.waitingCount} people are waiting for a place`}</Text>
            <Text muted size={1}>{data.group
              ? 'The waiting list is connected to MailerLite.'
              : 'Connect MailerLite before collecting waiting-list sign-ups.'}</Text>
          </Stack>
          {data.group ? <Button as="a"
            href={`https://dashboard.mailerlite.com/subscribers?group=${encodeURIComponent(data.group.group_id)}`}
            target="_blank" text="Manage waitlist emails" tone="primary" />
            : <Button disabled={busy} onClick={() => void act({ action: 'create-group' })}
              text="Connect waitlist to MailerLite" tone="primary" />}
        </Flex>
      </Card>

      {data.emailUpdateIssues > 0 ? <Card padding={3} radius={2} tone="critical"><Flex align="center" gap={3}
        justify="space-between" wrap="wrap"><Stack space={2}>
          <Text size={1} weight="semibold">Some email updates need attention</Text>
          <Text size={1}>{data.emailUpdateIssues === 1 ? '1 update did not reach MailerLite.'
            : `${data.emailUpdateIssues} updates did not reach MailerLite.`}</Text>
        </Stack><Button disabled={busy} onClick={() => void act({ action: 'retry-email-updates' })}
          text="Try again" /></Flex></Card> : null}

      <Text muted size={1}>
        Individual contacts are managed in MailerLite. This overview stays compact even when hundreds of people register.
      </Text>
    </> : !error ? <Text muted size={1}>Loading registration details…</Text> : null}
  </Stack></Card>;
}
