import { notFound } from 'next/navigation';
import { getSiteEnvironment } from '@/lib/site-environment';
import StagingStudio from '../Studio';
export { metadata, viewport } from 'next-sanity/studio';
export const dynamic = 'force-dynamic';
export default function Page() {
  if (getSiteEnvironment() !== 'staging') notFound();
  return <StagingStudio />;
}
