export class MemberDiscountError extends Error {
  constructor(message: string, public readonly signInRequired = false) { super(message); }
}

export function requireMemberDiscountEligibility({ user, eligible, verificationFailed, bookingEmail }: {
  user: { id: string; email?: string } | null;
  eligible: boolean;
  verificationFailed?: boolean;
  bookingEmail?: string;
}) {
  if (!user) throw new MemberDiscountError('Sign in to your member account to use this code.', true);
  if (verificationFailed) throw new MemberDiscountError('We could not verify your membership. Please try again.');
  if (!eligible) throw new MemberDiscountError('This code requires an active membership subscription.');
  if (!user.email || (bookingEmail !== undefined && bookingEmail.trim().toLowerCase() !== user.email.toLowerCase())) {
    throw new MemberDiscountError('Use your signed-in member email address for this booking.');
  }
  return user.id;
}
