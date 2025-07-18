import { Controller, Get, UseGuards } from '@nestjs/common';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { UserRole } from '@/common/enums/roles.enum';

import { PaymentHistoryService } from '@/payments/payment-history.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { PaymentHistory } from '@/common/interfaces/payment-history.interface';
import { AdminController } from './admin.controller';
import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';

@Controller('admin/payments')
export class AdminPaymentsController extends AdminController<PaymentHistory> {
  protected serviceName = 'Payments';
  
  constructor(
    protected service: PaymentHistoryService,
    private usersService: UserProfilesService
  ) {
    super();
  }

  /**
   * Returns totals of content types
   * @returns Promise<SubscriptionSummary> - subscriptions totals
   */
  @Get('summary')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  async getSubscriptionsSummary() {
    const [totalPayments, totalSubscribers] = await Promise.all([
      this.service.getTotal(),
      this.usersService.getTotalBySubscriptionTier(SubscriptionLevel.PLUS)
    ]);

    return {
      totalPayments,
      totalSubscribers
    };
  }
}