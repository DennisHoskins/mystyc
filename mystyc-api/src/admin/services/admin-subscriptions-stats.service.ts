import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { SubscriptionLevel } from 'mystyc-common/constants/subscription-levels.enum';
import { 
  SubscriptionSummaryStats,
  SubscriptionRevenueStats,
  SubscriptionLifecycleStats,
  SubscriptionPaymentHealthStats
} from 'mystyc-common/admin/interfaces/stats/admin-subscription-stats.interface';
import { AdminStatsQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PaymentHistoryService } from '@/payments/payment-history.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { PaymentHistoryDocument } from '@/payments/schemas/payment-history.schema';
import { UserProfileDocument } from '@/users/schemas/user-profile.schema';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';

@RegisterStatsModule({
  serviceName: 'Subscriptions',
  service: AdminSubscriptionsStatsService,
  stats: [
    { key: 'summary', method: 'getSummaryStats' },
    { key: 'revenue', method: 'getRevenueStats' },
    { key: 'lifecycle', method: 'getLifecycleStats' },
    { key: 'paymentHealth', method: 'getPaymentHealthStats' }
  ]
})
@Injectable()
export class AdminSubscriptionsStatsService {
  constructor(
    @InjectModel('PaymentHistory') private paymentHistoryModel: Model<PaymentHistoryDocument>,
    @InjectModel('UserProfile') private userProfileModel: Model<UserProfileDocument>,
    private readonly paymentsService: PaymentHistoryService,
    private readonly usersService: UserProfilesService,
  ) {}

  async getSummaryStats(query?: AdminStatsQuery): Promise<SubscriptionSummaryStats> {
    logger.info('Generating subscription summary stats', { query }, 'AdminSubscriptionsStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      const currentMonth = new Date().toISOString().slice(0, 7); // "2025-01"
      const lastMonth = new Date();
      lastMonth.setMonth(lastMonth.getMonth() - 1);
      const lastMonthStr = lastMonth.toISOString().slice(0, 7);

      // Get basic totals
      const [totalAmount, totalPayments, currentMonthRevenue, lastMonthRevenue] = await Promise.all([
        this.paymentsService.getTotalAmount(),
        this.paymentsService.getTotal(),
        this.getMonthlyRevenue(currentMonth),
        this.getMonthlyRevenue(lastMonthStr)
      ]);

      // Get active subscription counts
      const activeSubscriptions = await this.getActiveSubscriptionCounts();
      
      // Calculate MRR (assume monthly recurring from current month)
      const currentMRR = currentMonthRevenue / 100; // Convert from cents to dollars

      // Calculate ARPU
      const averageRevenuePerUser = activeSubscriptions.total > 0 
        ? Math.round((currentMRR / activeSubscriptions.total) * 100) / 100 
        : 0;

      // Calculate growth rate
      const growthRate = lastMonthRevenue > 0 
        ? Math.round(((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100)
        : 0;

      const result: SubscriptionSummaryStats = {
        totalAmount: Math.round(totalAmount / 100), // Convert to dollars
        totalPayments,
        totalSubscriptions: activeSubscriptions.total,
        currentMRR: Math.round(currentMRR * 100) / 100,
        averageRevenuePerUser,
        activeSubscriptions,
        subscriptionGrowth: {
          thisMonth: Math.round(currentMonthRevenue / 100),
          lastMonth: Math.round(lastMonthRevenue / 100),
          growthRate
        }
      };

      logger.info('Subscription summary stats generated', {
        totalSubscriptions: result.totalSubscriptions,
        currentMRR: result.currentMRR,
        growthRate: result.subscriptionGrowth.growthRate
      }, 'AdminSubscriptionsStatsService');

      return result;
    } catch (error) {
      logger.error('Failed to generate subscription summary stats', {
        error,
        query
      }, 'AdminSubscriptionsStatsService');
      throw error;
    }
  }

  async getRevenueStats(query?: AdminStatsQuery): Promise<SubscriptionRevenueStats> {
    logger.info('Generating subscription revenue stats', { query }, 'AdminSubscriptionsStatsService');
    
    try {
      const { limit = 12 } = query || {}; // Default to last 12 months
      
      // Get monthly revenue breakdown
      const monthlyRevenuePipeline: any[] = [
        {
          $match: {
            status: 'paid',
            paidAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - limit)) }
          }
        },
        {
          $group: {
            _id: {
              month: { $dateToString: { format: "%Y-%m", date: "$paidAt" } },
              tier: "$subscriptionTier"
            },
            revenue: { $sum: "$amount" },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.month",
            totalRevenue: { $sum: "$revenue" },
            totalCount: { $sum: "$count" },
            tierBreakdown: {
              $push: {
                tier: "$_id.tier",
                revenue: "$revenue",
                count: "$count"
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ];

      const monthlyResults = await this.paymentHistoryModel.aggregate(monthlyRevenuePipeline);

      // Format monthly revenue data
      const monthlyRevenue = monthlyResults.map(month => {
        const plusData = month.tierBreakdown.find((t: { tier: string; revenue: number; count: number }) => t.tier === 'plus') || { revenue: 0, count: 0 };
        const proData  = month.tierBreakdown.find((t: { tier: string; revenue: number; count: number }) => t.tier === 'pro')  || { revenue: 0, count: 0 };        
        
        return {
          month: month._id,
          revenue: Math.round(month.totalRevenue / 100), // Convert to dollars
          plusRevenue: Math.round(plusData.revenue / 100),
          proRevenue: Math.round(proData.revenue / 100),
          subscriptionCount: month.totalCount,
          averageRevenuePerUser: month.totalCount > 0 
            ? Math.round((month.totalRevenue / month.totalCount / 100) * 100) / 100 
            : 0
        };
      });

      // Get overall revenue by tier
      const tierRevenuePipeline: any[] = [
        {
          $match: {
            status: 'paid'
          }
        },
        {
          $group: {
            _id: "$subscriptionTier",
            totalRevenue: { $sum: "$amount" },
            subscriptionCount: { $sum: 1 }
          }
        }
      ];

      const tierResults = await this.paymentHistoryModel.aggregate(tierRevenuePipeline);
      const totalRevenue = tierResults.reduce((sum, tier) => sum + tier.totalRevenue, 0);

      const revenueByTier = tierResults.map(tier => ({
        tier: tier._id as 'plus' | 'pro',
        totalRevenue: Math.round(tier.totalRevenue / 100),
        subscriptionCount: tier.subscriptionCount,
        percentage: Math.round((tier.totalRevenue / totalRevenue) * 100),
        averageMonthlyRevenue: Math.round((tier.totalRevenue / tier.subscriptionCount / 100) * 100) / 100
      }));

      const result: SubscriptionRevenueStats = {
        monthlyRevenue,
        revenueByTier
      };

      logger.info('Subscription revenue stats generated', {
        monthsAnalyzed: monthlyRevenue.length,
        totalTiers: revenueByTier.length
      }, 'AdminSubscriptionsStatsService');

      return result;
    } catch (error) {
      logger.error('Failed to generate subscription revenue stats', {
        error,
        query
      }, 'AdminSubscriptionsStatsService');
      throw error;
    }
  }

  async getLifecycleStats(query?: AdminStatsQuery): Promise<SubscriptionLifecycleStats> {
    logger.info('Generating subscription lifecycle stats', { query }, 'AdminSubscriptionsStatsService');
    
    try {
      const { limit = 30 } = query || {}; // Default to last 30 days
      
      // Get user conversion data
      const totalUsers = await this.userProfileModel.countDocuments();
      const plusUsers = await this.userProfileModel.countDocuments({ 'subscription.level': SubscriptionLevel.PLUS });
      const proUsers = await this.userProfileModel.countDocuments({ 'subscription.level': SubscriptionLevel.PRO });
      
      // Calculate conversion rates
      const conversionRates = {
        userToPlus: totalUsers > 0 ? Math.round((plusUsers / totalUsers) * 100 * 100) / 100 : 0,
        userToPro: totalUsers > 0 ? Math.round((proUsers / totalUsers) * 100 * 100) / 100 : 0,
        plusToPro: plusUsers > 0 ? Math.round((proUsers / plusUsers) * 100 * 100) / 100 : 0,
        totalConversionRate: totalUsers > 0 ? Math.round(((plusUsers + proUsers) / totalUsers) * 100 * 100) / 100 : 0
      };

      // Get churn analysis (simplified - users who downgraded or cancelled)
      // Note: This would require tracking subscription changes over time
      const churnAnalysis = {
        totalCancellations: 0, // Would need subscription change tracking
        churnRate: 0,
        averageDaysToChurn: 0,
        churnByTier: [
          { tier: 'plus' as const, cancellations: 0, churnRate: 0 },
          { tier: 'pro' as const, cancellations: 0, churnRate: 0 }
        ]
      };

      // Get new subscriptions over time
      const newSubscriptionsPipeline: any[] = [
        {
          $match: {
            'subscription.startDate': { 
              $gte: new Date(new Date().setDate(new Date().getDate() - limit)),
              $ne: null
            }
          }
        },
        {
          $group: {
            _id: {
              date: { $dateToString: { format: "%Y-%m-%d", date: "$subscription.startDate" } },
              tier: "$subscription.level"
            },
            count: { $sum: 1 }
          }
        },
        {
          $group: {
            _id: "$_id.date",
            tierCounts: {
              $push: {
                tier: "$_id.tier",
                count: "$count"
              }
            }
          }
        },
        { $sort: { _id: 1 } }
      ];

      const subscriptionResults = await this.userProfileModel.aggregate(newSubscriptionsPipeline);
      
      const newSubscriptions = subscriptionResults.map(day => {
        const plusCount = day.tierCounts.find((t: { tier: SubscriptionLevel; count: number }) => t.tier === SubscriptionLevel.PLUS)?.count || 0;
        const proCount = day.tierCounts.find((t: { tier: SubscriptionLevel; count: number }) => t.tier === SubscriptionLevel.PRO)?.count || 0;
        
        return {
          date: day._id,
          plus: plusCount,
          pro: proCount,
          total: plusCount + proCount
        };
      });

      const result: SubscriptionLifecycleStats = {
        conversionRates,
        churnAnalysis,
        newSubscriptions
      };

      logger.info('Subscription lifecycle stats generated', {
        totalConversionRate: conversionRates.totalConversionRate,
        newSubscriptionsCount: newSubscriptions.length
      }, 'AdminSubscriptionsStatsService');

      return result;
    } catch (error) {
      logger.error('Failed to generate subscription lifecycle stats', {
        error,
        query
      }, 'AdminSubscriptionsStatsService');
      throw error;
    }
  }

  async getPaymentHealthStats(query?: AdminStatsQuery): Promise<SubscriptionPaymentHealthStats> {
    logger.info('Generating subscription payment health stats', { query }, 'AdminSubscriptionsStatsService');
    
    try {
      const dateFilter = this.buildDateFilter(query);
      
      // Get payment metrics
      const paymentMetricsPipeline: any[] = [
        ...(dateFilter ? [{ $match: { paidAt: dateFilter } }] : []),
        {
          $group: {
            _id: null,
            totalPayments: { $sum: 1 },
            successfulPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
            },
            failedPayments: {
              $sum: { $cond: [{ $eq: ['$status', 'failed'] }, 1, 0] }
            }
          }
        }
      ];

      const [paymentMetricsResult] = await this.paymentHistoryModel.aggregate(paymentMetricsPipeline);
      
      const paymentMetrics = paymentMetricsResult ? {
        totalPayments: paymentMetricsResult.totalPayments,
        successfulPayments: paymentMetricsResult.successfulPayments,
        failedPayments: paymentMetricsResult.failedPayments,
        successRate: paymentMetricsResult.totalPayments > 0 
          ? Math.round((paymentMetricsResult.successfulPayments / paymentMetricsResult.totalPayments) * 100)
          : 0
      } : { totalPayments: 0, successfulPayments: 0, failedPayments: 0, successRate: 0 };

      // Get payments by status
      const statusPipeline: any[] = [
        ...(dateFilter ? [{ $match: { paidAt: dateFilter } }] : []),
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 },
            totalAmount: { $sum: '$amount' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$count' },
            statuses: {
              $push: {
                status: '$_id',
                count: '$count',
                totalAmount: '$totalAmount'
              }
            }
          }
        }
      ];

      const [statusResult] = await this.paymentHistoryModel.aggregate(statusPipeline);
      
      const paymentsByStatus = statusResult ? statusResult.statuses.map((status: { status: string; count: number; total: number; totalAmount: number }) => ({
        status: status.status as 'paid' | 'failed' | 'refunded' | 'disputed',
        count: status.count,
        percentage: Math.round((status.count / statusResult.total) * 100),
        totalAmount: Math.round(status.totalAmount / 100) // Convert to dollars
      })) : [];

      // Get recent payment failures (last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      const recentFailuresPipeline: any[] = [
        {
          $match: {
            status: 'failed',
            paidAt: { $gte: sevenDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$paidAt" } },
            count: { $sum: 1 },
            amount: { $sum: "$amount" }
          }
        },
        { $sort: { _id: 1 } }
      ];

      const recentFailuresResults = await this.paymentHistoryModel.aggregate(recentFailuresPipeline);
      
      const recentFailures = recentFailuresResults.map(failure => ({
        date: failure._id,
        count: failure.count,
        amount: Math.round(failure.amount / 100) // Convert to dollars
      }));

      // Get refund metrics
      const refundsPipeline: any[] = [
        {
          $match: {
            status: 'refunded'
          }
        },
        {
          $group: {
            _id: null,
            totalRefunds: { $sum: 1 },
            totalRefundAmount: { $sum: '$amount' }
          }
        }
      ];

      const [refundsResult] = await this.paymentHistoryModel.aggregate(refundsPipeline);
      
      const refundMetrics = refundsResult ? {
        totalRefunds: refundsResult.totalRefunds,
        refundRate: paymentMetrics.totalPayments > 0 
          ? Math.round((refundsResult.totalRefunds / paymentMetrics.totalPayments) * 100 * 100) / 100
          : 0,
        totalRefundAmount: Math.round(refundsResult.totalRefundAmount / 100)
      } : { totalRefunds: 0, refundRate: 0, totalRefundAmount: 0 };

      const result: SubscriptionPaymentHealthStats = {
        paymentMetrics,
        paymentsByStatus,
        recentFailures,
        refundMetrics
      };

      logger.info('Subscription payment health stats generated', {
        successRate: paymentMetrics.successRate,
        totalPayments: paymentMetrics.totalPayments,
        refundRate: refundMetrics.refundRate
      }, 'AdminSubscriptionsStatsService');

      return result;
    } catch (error) {
      logger.error('Failed to generate subscription payment health stats', {
        error,
        query
      }, 'AdminSubscriptionsStatsService');
      throw error;
    }
  }

  // Helper methods

  private async getMonthlyRevenue(month: string): Promise<number> {
    const startOfMonth = new Date(`${month}-01`);
    const endOfMonth = new Date(startOfMonth);
    endOfMonth.setMonth(endOfMonth.getMonth() + 1);

    const result = await this.paymentHistoryModel.aggregate([
      {
        $match: {
          status: 'paid',
          paidAt: {
            $gte: startOfMonth,
            $lt: endOfMonth
          }
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$amount' }
        }
      }
    ]);

    return result[0]?.totalRevenue || 0;
  }

  private async getActiveSubscriptionCounts(): Promise<{
    plus: number;
    pro: number;
    total: number;
  }> {
    const [plus, pro] = await Promise.all([
      this.userProfileModel.countDocuments({ 'subscription.level': SubscriptionLevel.PLUS }),
      this.userProfileModel.countDocuments({ 'subscription.level': SubscriptionLevel.PRO })
    ]);

    return {
      plus,
      pro,
      total: plus + pro
    };
  }

  private buildDateFilter(query?: AdminStatsQuery): any {
    if (!query?.startDate && !query?.endDate) return null;
    
    const filter: any = {};
    if (query.startDate) {
      filter.$gte = new Date(query.startDate);
    }
    if (query.endDate) {
      const endDate = new Date(query.endDate);
      endDate.setHours(23, 59, 59, 999);
      filter.$lte = endDate;
    }
    
    return Object.keys(filter).length > 0 ? filter : null;
  }
}