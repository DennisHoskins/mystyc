export interface NotificationDeliveryStats {
  totalNotifications: number;
  deliveryMetrics: {
    sent: number;
    failed: number;
    pending: number;
    successRate: number;
  };
  averageDeliveryTime: number;
}

export interface NotificationTypeStats {
  totalNotifications: number;
  typeBreakdown: Array<{
    type: 'test' | 'admin' | 'broadcast';
    count: number;
    percentage: number;
    successRate: number;
  }>;
}

export interface NotificationEngagementStats {
  totalNotifications: number;
  deliveryByPlatform: Array<{
    platform: string;
    sent: number;
    failed: number;
    successRate: number;
  }>;
  optInRate: number;
}

export interface NotificationPatternsStats {
  totalNotifications: number;
  peakHours: Array<{
    hour: number;
    count: number;
    percentage: number;
  }>;
  volumeTrends: Array<{
    date: string;
    count: number;
  }>;
}

export interface NotificationStats {
  delivery: NotificationDeliveryStats,
  type: NotificationTypeStats,
  engagement: NotificationEngagementStats,
  pattern: NotificationPatternsStats
}