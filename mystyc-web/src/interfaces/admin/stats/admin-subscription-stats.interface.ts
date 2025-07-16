export interface SubscriptionMonthTotal {
  totalSubscribers: number;
  totalAmount: number;
}

export interface SubscriptionStats {
  currentMonthlyTotal: SubscriptionMonthTotal,
}