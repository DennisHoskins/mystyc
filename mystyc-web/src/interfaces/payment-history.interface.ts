export interface PaymentHistory {
  _id?: string;
  firebaseUid: string;
  stripeCustomerId: string;
  stripeChargeId: string;
  stripeInvoiceId: string;
  stripeSubscriptionId: string;
  amount: number; // Amount in cents
  currency: string; // USD, EUR, etc.
  status: 'paid' | 'failed' | 'refunded' | 'disputed';
  subscriptionTier: 'plus' | 'pro';
  paidAt: Date;
  periodStart: Date;
  periodEnd: Date;
  createdAt?: Date;
  updatedAt?: Date;
}