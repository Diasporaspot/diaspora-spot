import 'server-only';

import { subscribeToMailerLite } from '@/lib/mailerlite';
import { sanityClient } from '@/sanity/lib/client';
import { hasSeriesPricingConflict } from '@/lib/workshop-registration-core';
import type {
  RegistrationProductType,
  WorkshopPaymentType,
} from '@/lib/workshop-registration-core';

export {
  getProductCurrency,
  getProductCurrency as getWorkshopCurrency,
  getStripeUnitAmount,
  hasSeriesPricingConflict,
  isPaidProduct,
  isPaidProduct as isPaidWorkshop,
  normalizeRegistrationInput,
  validateRegistrationInput,
} from '@/lib/workshop-registration-core';
export type {
  RegistrationInput,
  RegistrationProductType,
  WorkshopPaymentType,
} from '@/lib/workshop-registration-core';

export type RegistrationWorkshop = {
  _id: string;
  _type?: 'workshop';
  bookingStatus?: string;
  currency?: string;
  mailerLiteGroupId?: string;
  mailerLiteProvisioningStatus?: string;
  paymentType?: WorkshopPaymentType;
  price?: number;
  slug?: string;
  status?: string;
  title?: string;
};

export type RegistrationProduct = Omit<RegistrationWorkshop, '_type'> & {
  _type: 'workshop' | 'workshopSeries';
  allowWaitlistedWorkshops?: boolean;
  salesStatus?: string;
  workshops: RegistrationWorkshop[];
};

const registrationProductFields = `
  _id,
  _type,
  status,
  title,
  "slug": slug.current,
  bookingStatus,
  salesStatus,
  allowWaitlistedWorkshops,
  currency,
  mailerLiteGroupId,
  mailerLiteProvisioningStatus,
  paymentType,
  price
`;

export function getProductGroupIds(product: RegistrationProduct) {
  return Array.from(
    new Set(
      [product.mailerLiteGroupId, ...product.workshops.map((workshop) => workshop.mailerLiteGroupId)]
        .filter((groupId): groupId is string => Boolean(groupId)),
    ),
  );
}

export async function getRegistrationProduct(productType: RegistrationProductType, slug: string) {
  if (productType === 'series') {
    return sanityClient.fetch<RegistrationProduct | null>(
      `*[_type == "workshopSeries" && status == "published" && slug.current == $slug][0]{
        ${registrationProductFields},
        "workshops": workshops[]->{${registrationProductFields}}
      }`,
      { slug },
      { cache: 'no-store' },
    );
  }

  return sanityClient.fetch<RegistrationProduct | null>(
    `*[_type == "workshop" && status == "published" && slug.current == $slug][0]{
      ${registrationProductFields},
      "workshops": []
    }`,
    { slug },
    { cache: 'no-store' },
  );
}

export async function getRegistrationProductById(productType: RegistrationProductType, id: string) {
  const sanityType = productType === 'series' ? 'workshopSeries' : 'workshop';
  const workshopsProjection =
    productType === 'series'
      ? `"workshops": workshops[]->{${registrationProductFields}}`
      : '"workshops": []';

  return sanityClient.fetch<RegistrationProduct | null>(
    `*[_type == $sanityType && _id == $id][0]{
      ${registrationProductFields},
      ${workshopsProjection}
    }`,
    { id, sanityType },
    { cache: 'no-store' },
  );
}

export function getProductRegistrationError(product: RegistrationProduct | null) {
  if (!product) {
    return { message: 'This workshop or series could not be found.', status: 404 };
  }

  if (product.salesStatus === 'closed') {
    return { message: 'Registration for this series is closed.', status: 409 };
  }

  if (product._type === 'workshopSeries' && product.salesStatus === 'waitlist') {
    return { message: 'This series is currently on a waitlist.', status: 409 };
  }

  if (product._type === 'workshopSeries' && hasSeriesPricingConflict(product)) {
    return {
      message: 'This series includes a paid workshop and needs a paid series price before registration can open.',
      status: 409,
    };
  }

  if (!product.mailerLiteGroupId || product.mailerLiteProvisioningStatus !== 'ready') {
    return {
      message: 'Registration is not available for this workshop or series yet.',
      status: 409,
    };
  }

  if (product._type === 'workshopSeries') {
    if (!product.workshops.length) {
      return { message: 'This series does not contain any workshops yet.', status: 409 };
    }

    const unavailableWorkshop = product.workshops.find(
      (workshop) =>
        workshop.status !== 'published' ||
        (workshop.bookingStatus === 'waitlist' && !product.allowWaitlistedWorkshops) ||
        !workshop.mailerLiteGroupId ||
        workshop.mailerLiteProvisioningStatus !== 'ready',
    );

    if (unavailableWorkshop) {
      return {
        message: `${unavailableWorkshop.title || 'A workshop in this series'} is not ready for registration yet.`,
        status: 409,
      };
    }
  }

  return null;
}

async function registerAttendeeWithGroups({
  email,
  groupIds,
  name,
  phone,
  smsConsentAt,
  smsConsentSource,
  smsMarketingConsent,
}: {
  email: string;
  groupIds: string[];
  name: string;
  phone: string;
  smsConsentAt?: string;
  smsConsentSource: string;
  smsMarketingConsent: boolean;
}) {
  if (!groupIds.length) {
    throw new Error('Registration groups are missing.');
  }

  const smsMarketingGroupId = process.env.MAILERLITE_SMS_MARKETING_GROUP_ID;

  if (smsMarketingConsent && !smsMarketingGroupId) {
    throw new Error('MAILERLITE_SMS_MARKETING_GROUP_ID is not configured.');
  }

  const subscriberGroupIds = Array.from(
    new Set([
      ...groupIds,
      ...(smsMarketingConsent && smsMarketingGroupId ? [smsMarketingGroupId] : []),
    ]),
  );

  await subscribeToMailerLite({
    email,
    name,
    phone,
    groupIds: subscriberGroupIds,
    ...(smsMarketingConsent
      ? {
          fields: {
            sms_marketing_consent: 'yes',
            sms_consent_at: smsConsentAt || new Date().toISOString(),
            sms_consent_source: smsConsentSource,
          },
        }
      : {}),
  });
}

export async function registerProductAttendee({
  email,
  name,
  phone,
  product,
  smsConsentAt,
  smsMarketingConsent,
}: {
  email: string;
  name: string;
  phone: string;
  product: RegistrationProduct;
  smsConsentAt?: string;
  smsMarketingConsent: boolean;
}) {
  await registerAttendeeWithGroups({
    email,
    name,
    phone,
    groupIds: getProductGroupIds(product),
    smsConsentAt,
    smsConsentSource:
      product._type === 'workshopSeries' ? 'series_registration' : 'workshop_registration',
    smsMarketingConsent,
  });
}
