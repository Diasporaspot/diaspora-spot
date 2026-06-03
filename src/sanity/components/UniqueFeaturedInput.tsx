'use client';

import { useCallback, useState } from 'react';
import {
  PatchEvent,
  useClient,
  useFormValue,
  type BooleanInputProps,
  type FormPatch,
} from 'sanity';

type FeaturedDocument = {
  _id: string;
};

function getDocumentIds(documentId: string) {
  const publishedId = documentId.replace(/^drafts\./, '');

  return {
    publishedId,
    draftId: `drafts.${publishedId}`,
  };
}

function patchSetsFeaturedTrue(patch: FormPatch | FormPatch[] | PatchEvent) {
  return PatchEvent.from(patch).patches.some(
    (item) => item.type === 'set' && item.value === true,
  );
}

export function UniqueFeaturedInput(props: BooleanInputProps) {
  const client = useClient({ apiVersion: '2025-06-02' });
  const documentId = useFormValue(['_id']);
  const documentType = useFormValue(['_type']);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleChange = useCallback(
    async (patch: FormPatch | FormPatch[] | PatchEvent) => {
      const shouldUnsetOtherFeaturedDocs =
        patchSetsFeaturedTrue(patch) &&
        typeof documentId === 'string' &&
        typeof documentType === 'string';

      props.onChange(patch);

      if (shouldUnsetOtherFeaturedDocs) {
        const { draftId, publishedId } = getDocumentIds(documentId);

        setIsUpdating(true);

        try {
          const featuredDocuments = await client.fetch<FeaturedDocument[]>(
            '*[_type == $documentType && featured == true && _id != $draftId && _id != $publishedId]{_id}',
            {
              documentType,
              draftId,
              publishedId,
            },
          );

          if (featuredDocuments.length > 0) {
            let transaction = client.transaction();

            for (const featuredDocument of featuredDocuments) {
              transaction = transaction.patch(featuredDocument._id, (documentPatch) =>
                documentPatch.set({ featured: false }),
              );
            }

            await transaction.commit({ visibility: 'sync' });
          }
        } finally {
          setIsUpdating(false);
        }
      }
    },
    [client, documentId, documentType, props],
  );

  return props.renderDefault({
    ...props,
    onChange: handleChange,
    readOnly: props.readOnly || isUpdating,
  });
}
