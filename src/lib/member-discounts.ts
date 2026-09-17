import 'server-only';

import { sanityClient } from '@/sanity/lib/client';
import { createClient } from '@/lib/supabase/server';
import { getSiteEnvironment, getVisibleWorkshopStatuses } from '@/lib/site-environment';
import { quoteDiscount, type DiscountCode } from '@/lib/workshop-discounts';
import type { RegistrationProduct } from '@/lib/workshop-registration';

import { MemberDiscountError, requireMemberDiscountEligibility } from './member-discount-eligibility';
export { MemberDiscountError } from './member-discount-eligibility';

type MemberDiscount = {
  _id: string;
  status?: string;
  code: string;
  type: DiscountCode['type'];
  value: number;
  currency?: string;
  scope?: 'all' | 'selected';
  workshopIds?: string[];
  startDate: string;
  noExpiry?: boolean;
  endDate?: string;
};

export async function quoteRegistrationDiscount(product: RegistrationProduct, input: unknown, bookingEmail?: string) {
  const code = typeof input === 'string' ? input.trim().toUpperCase() : '';
  if (!code) return { ...quoteDiscount(product, ''), memberId: '' };
  if (code.length > 64) throw new Error('Enter a valid discount code.');
  const token = process.env.SANITY_API_READ_TOKEN;
  const drafts = getSiteEnvironment() === 'staging' && Boolean(token);
  const matches = await sanityClient.fetch<MemberDiscount[]>(
    '*[_type == "memberDiscount" && upper(code) == $code]{_id,status,code,type,value,currency,scope,"workshopIds":workshops[]._ref,startDate,noExpiry,endDate}',
    { code },
    { cache: 'no-store', perspective: drafts ? 'drafts' : 'published', ...(drafts ? { token } : {}) },
  );
  // A reserved member code never falls back to an unrestricted event code.
  if (!matches.length) return { ...quoteDiscount(product, code), memberId: '' };
  const discount = matches[0];
  if (matches.length !== 1 || !getVisibleWorkshopStatuses().some((status) => status === discount.status)) {
    throw new Error('This member discount is currently unavailable.');
  }
  const productId = product._id.replace(/^drafts\./, '');
  if (product._type !== 'workshop' || !['all', 'selected'].includes(discount.scope || '') ||
      (discount.scope === 'selected' && !discount.workshopIds?.includes(productId)) ||
      (discount.type === 'amount' && discount.currency !== (product.currency || 'usd').toLowerCase())) {
    throw new Error('This member discount does not apply to this event.');
  }
  const supabase = await createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) throw new MemberDiscountError('Sign in to your member account to use this code.', true);
  const { data: eligible, error } = await supabase.rpc('has_active_membership_subscription');
  requireMemberDiscountEligibility({ user, eligible: eligible === true, verificationFailed: Boolean(error), bookingEmail });
  const quote = quoteDiscount({ ...product, discountCodes: [{
    code: discount.code, type: discount.type, value: discount.value, startDate: discount.startDate,
    endMode: discount.noExpiry ? 'never' : 'date', endDate: discount.endDate,
  }] }, code);
  return { ...quote, memberId: user.id };
}
