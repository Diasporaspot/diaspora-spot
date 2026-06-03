import { getCliClient } from 'sanity/cli';

async function main() {
  const client = getCliClient({ apiVersion: '2025-06-02' });

  await client
    .patch('workshop-cv-review-live')
    .set({ featured: false })
    .commit({ visibility: 'sync' });

  const featuredWorkshops = await client.fetch(
    '*[_type == "workshop" && featured == true]{_id,title,featured}',
  );

  console.log(JSON.stringify(featuredWorkshops, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
