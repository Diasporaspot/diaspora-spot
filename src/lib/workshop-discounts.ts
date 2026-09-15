import { getStripeUnitAmount } from './workshop-registration-core';

export type DiscountCode = {
  code: string;
  type: 'percentage' | 'amount';
  value: number;
  startDate: string;
  endMode: 'date' | 'event';
  endDate?: string;
};

type DiscountProduct = {
  price?: number;
  currency?: string;
  date?: string;
  timezone?: string;
  discountCodes?: DiscountCode[];
};

export function quoteDiscount(product: DiscountProduct, input: unknown, now = new Date()) {
  const originalAmount = getStripeUnitAmount(product);
  const code = typeof input === 'string' ? input.trim().toUpperCase() : '';
  if (!code) return { originalAmount, amount: originalAmount, discountAmount: 0, code: '' };
  const discount = product.discountCodes?.find((item) => item.code?.trim().toUpperCase() === code);
  if (!discount || code.length > 64) throw new Error('This discount code is not valid for this event.');
  const aliases: Record<string, string> = { WAT: 'Africa/Lagos', GMT: 'Etc/GMT', UTC: 'UTC', EST: 'Etc/GMT+5', EDT: 'Etc/GMT+4', BST: 'Europe/London' };
  const timezone = product.timezone?.trim() || 'WAT';
  const zone = aliases[timezone.toUpperCase()] || timezone;
  const offset = /^(?:GMT|UTC)([+-])(\d{1,2})(?::([0-5]\d))?$/i.exec(timezone);
  let today: string;
  try {
    let date = now;
    let dateZone = zone;
    if (offset) {
      const hours = Number(offset[2]);
      if (hours > 14 || (hours === 14 && Number(offset[3] || 0) !== 0)) throw new Error('Invalid offset');
      const minutes = (hours * 60 + Number(offset[3] || 0)) * (offset[1] === '+' ? 1 : -1);
      date = new Date(now.getTime() + minutes * 60_000);
      dateZone = 'UTC';
    }
    const parts = new Intl.DateTimeFormat('en-US', { timeZone: dateZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
    const part = (type: string) => parts.find((item) => item.type === type)?.value;
    today = `${part('year')}-${part('month')}-${part('day')}`;
  } catch { throw new Error('The event timezone needs to be configured before this code can be used.'); }
  const end = discount.endMode === 'event' ? product.date : discount.endDate;
  const validDate = (value: string | undefined) => Boolean(value && /^\d{4}-\d{2}-\d{2}$/.test(value) && Number.isFinite(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value);
  if (!validDate(discount.startDate) || !validDate(end) || !end || end < discount.startDate || !['date', 'event'].includes(discount.endMode)) throw new Error('This discount code is not configured correctly.');
  if (today < discount.startDate) throw new Error('This discount code is not active yet.');
  if (today > end) throw new Error('This discount code has expired.');
  if (!Number.isFinite(discount.value) || discount.value <= 0 || !['percentage', 'amount'].includes(discount.type) || (discount.type === 'percentage' && discount.value > 100)) throw new Error('This discount code is not configured correctly.');
  const discountAmount = Math.min(originalAmount, discount.type === 'percentage' ? Math.round(originalAmount * discount.value / 100) : getStripeUnitAmount({ price: discount.value, currency: product.currency }));
  return { code, originalAmount, discountAmount, amount: originalAmount - discountAmount };
}
