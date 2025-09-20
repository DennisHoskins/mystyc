import { Controller, Get, UseGuards } from '@nestjs/common';

import { PaymentHistory } from 'mystyc-common/schemas/payment-history.schema';
import { UserRole, SubscriptionLevel } from 'mystyc-common/constants/';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { PaymentHistoryService } from '@/payments/payment-history.service';
import { UserProfilesService } from '@/users/user-profiles.service';
import { AdminController } from './admin.controller';

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
  async getSubscriptionsSummary(): Promise<{totalPayments: number, totalSubscriptions: number}> {
    const [totalPayments, totalSubscriptions] = await Promise.all([
      this.service.getTotal(),
      this.usersService.getTotalBySubscriptionTier(SubscriptionLevel.PLUS)
    ]);
    return {
      totalPayments,
      totalSubscriptions
    };
  }
}