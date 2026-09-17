import { getRegistrationProduct, getProductRegistrationError, getProductCurrency, isPaidProduct } from '@/lib/workshop-registration';
import { quoteRegistrationDiscount, MemberDiscountError } from '@/lib/member-discounts';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (typeof body.slug !== 'string' || typeof body.code !== 'string' || !body.code.trim() || body.code.length > 64) {
      return Response.json({ error: 'Enter a discount code.' }, { status: 400 });
    }
    const product = await getRegistrationProduct('workshop', body.slug);
    const error = getProductRegistrationError(product);
    if (!product || error || !isPaidProduct(product)) return Response.json({ error: error?.message || 'Discounts are unavailable for this event.' }, { status: 400 });
    try {
      const { memberId, ...quote } = await quoteRegistrationDiscount(product, body.code);
      return Response.json({ ...quote, memberDiscount: Boolean(memberId), currency: getProductCurrency(product) });
    } catch (error) { return Response.json({ error: (error as Error).message, signInRequired: error instanceof MemberDiscountError && error.signInRequired }, { status: 400 }); }
  } catch {
    return Response.json({ error: 'Unable to check this code. Please try again.' }, { status: 500 });
  }
}
