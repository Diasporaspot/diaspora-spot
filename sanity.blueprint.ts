import {defineBlueprint, defineDocumentFunction} from '@sanity/blueprints';

export default defineBlueprint({
  resources: [
    defineDocumentFunction({
      name: 'provision-workshop-mailerlite',
      displayName: 'Provision workshop registration',
      event: {
        on: ['publish'],
        filter:
          '_type == "workshop" && status == "published" && !defined(mailerLiteGroupId)',
        projection:
          '{_id, _type, title, date, status, mailerLiteGroupId, mailerLiteProvisioningStatus}',
        resource: {
          type: 'dataset',
          id: 'beibii8a.production',
        },
      },
      memory: 1,
      timeout: 30,
    }),
    defineDocumentFunction({
      name: 'provision-series-mailerlite',
      displayName: 'Provision workshop series registration',
      event: {
        on: ['publish'],
        filter:
          '_type == "workshopSeries" && status == "published" && !defined(mailerLiteGroupId)',
        projection:
          '{_id, _type, title, status, mailerLiteGroupId, mailerLiteProvisioningStatus}',
        resource: {
          type: 'dataset',
          id: 'beibii8a.production',
        },
      },
      memory: 1,
      timeout: 30,
    }),
  ],
});
