export interface SubscriptionSummaryStats {
  totalAmount: number;
  totalPayments: number;
  totalSubscriptions: number;
}

export interface SubscriptionStats {
  summary: SubscriptionSummaryStats
}