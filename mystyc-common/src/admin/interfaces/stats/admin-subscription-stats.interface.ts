export interface SubscriptionSummaryStats {
  totalAmount: number;
  totalPayments: number;
  totalSubscriptions: number;
  currentMRR: number;
  averageRevenuePerUser: number;
  activeSubscriptions: {
    plus: number;
    pro: number;
    total: number;
  };
  subscriptionGrowth: {
    thisMonth: number;
    lastMonth: number;
    growthRate: number;
  };
}

export interface SubscriptionRevenueStats {
  monthlyRevenue: Array<{
    month: string; // "2025-01"
    revenue: number;
    plusRevenue: number;
    proRevenue: number;
    subscriptionCount: number;
    averageRevenuePerUser: number;
  }>;
  revenueByTier: Array<{
    tier: 'plus' | 'pro';
    totalRevenue: number;
    subscriptionCount: number;
    percentage: number;
    averageMonthlyRevenue: number;
  }>;
}

export interface SubscriptionLifecycleStats {
  conversionRates: {
    userToPlus: number;
    userToPro: number;
    plusToPro: number;
    totalConversionRate: number;
  };
  churnAnalysis: {
    totalCancellations: number;
    churnRate: number;
    averageDaysToChurn: number;
    churnByTier: Array<{
      tier: 'plus' | 'pro';
      cancellations: number;
      churnRate: number;
    }>;
  };
  newSubscriptions: Array<{
    date: string;
    plus: number;
    pro: number;
    total: number;
  }>;
}

export interface SubscriptionPaymentHealthStats {
  paymentMetrics: {
    totalPayments: number;
    successfulPayments: number;
    failedPayments: number;
    successRate: number;
  };
  paymentsByStatus: Array<{
    status: 'paid' | 'failed' | 'refunded' | 'disputed';
    count: number;
    percentage: number;
    totalAmount: number;
  }>;
  recentFailures: Array<{
    date: string;
    count: number;
    amount: number;
  }>;
  refundMetrics: {
    totalRefunds: number;
    refundRate: number;
    totalRefundAmount: number;
  };
}

export interface SubscriptionStats {
  summary: SubscriptionSummaryStats;
  revenue: SubscriptionRevenueStats;
  lifecycle: SubscriptionLifecycleStats;
  paymentHealth: SubscriptionPaymentHealthStats;
}