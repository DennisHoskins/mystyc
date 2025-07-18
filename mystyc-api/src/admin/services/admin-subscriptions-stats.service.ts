import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { PaymentHistoryService } from '@/payments/payment-history.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { PaymentHistoryDocument } from '@/payments/schemas/payment-history.schema';
import { UserProfileDocument } from '@/users/schemas/user-profile.schema';
import { 
  SubscriptionSummaryStats,
} from '@/common/interfaces/admin/stats/admin-subscription-stats.interface';
import { AdminStatsQueryDto } from '@/admin/dto/admin-stats-query.dto';
import { RegisterStatsModule } from '@/admin/stats/stats-registry';
import { logger } from '@/common/util/logger';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';

@RegisterStatsModule({
  serviceName: 'Subscriptions',
  service: AdminSubscriptionsStatsService,
  stats: [
    { key: 'summary', method: 'getSummaryStats' },
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

  async getSummaryStats(query?: AdminStatsQueryDto): Promise<SubscriptionSummaryStats> {
    logger.info('Generating subscription summary stats', { query }, 'AdminSubscriptionStatsService');
    
    try {
      const totalAmount = await this.paymentsService.getTotalAmount();
      const totalPayments = await this.paymentsService.getTotal();
      const totalSubscriptions = await this.usersService.getTotalBySubscriptionTier(SubscriptionLevel.PLUS);

      return {
        totalAmount,
        totalPayments,
        totalSubscriptions
      };

    } catch (error) {
      logger.error('Failed to generate subscription delivery stats', {
        error: error.message,
        query
      }, 'SubscriptionsStatsService');
      throw error;
    }
  }
}