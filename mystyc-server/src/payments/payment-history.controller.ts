import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';

import { FirebaseUser as FirebaseUserInterface, PaymentHistory } from 'mystyc-common/schemas/';
import { UserRole } from 'mystyc-common/constants/roles.enum';
import { BaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { FirebaseAuthGuard } from '@/common/guards/auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { FirebaseUser } from '@/common/decorators/user.decorator';
import { logger } from '@/common/util/logger';
import { PaymentHistoryService } from './payment-history.service';

@Controller('payments')
export class PaymentHistoryController {
  constructor(
    private readonly paymentHistoryService: PaymentHistoryService,
  ) {}

  /**
   * Get current user's payment history
   */
  @Get('history')
  @UseGuards(FirebaseAuthGuard)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async getUserPaymentHistory(
    @FirebaseUser() firebaseUser: FirebaseUserInterface,
    @Query() query: BaseAdminQuery
  ): Promise<{ payments: PaymentHistory[]; total: number }> {
    logger.info('Fetching user payment history', {
      uid: firebaseUser.uid,
      limit: query.limit,
      offset: query.offset
    }, 'PaymentHistoryController');

    try {
      const [payments, total] = await Promise.all([
        this.paymentHistoryService.findByFirebaseUid(firebaseUser.uid, query),
        this.paymentHistoryService.getTotalByFirebaseUid(firebaseUser.uid)
      ]);

      logger.info('User payment history retrieved', {
        uid: firebaseUser.uid,
        paymentCount: payments.length,
        totalPayments: total
      }, 'PaymentHistoryController');

      return { payments, total };
    } catch (error) {
      logger.error('Failed to get user payment history', {
        uid: firebaseUser.uid,
        error
      }, 'PaymentHistoryController');
      throw error;
    }
  }

  /**
   * Get all payment history (admin only)
   */
  @Get('admin/all')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getAllPayments(
    @Query() query: BaseAdminQuery
  ): Promise<{ payments: PaymentHistory[]; total: number }> {
    logger.info('Admin fetching all payment history', {
      limit: query.limit,
      offset: query.offset,
      sortBy: query.sortBy
    }, 'PaymentHistoryController');

    try {
      const [payments, total] = await Promise.all([
        this.paymentHistoryService.findAll(query),
        this.paymentHistoryService.getTotal()
      ]);

      logger.info('All payment history retrieved', {
        paymentCount: payments.length,
        totalPayments: total
      }, 'PaymentHistoryController');

      return { payments, total };
    } catch (error) {
      logger.error('Failed to get all payment history', {
        error
      }, 'PaymentHistoryController');
      throw error;
    }
  }

  /**
   * Get payments by subscription tier (admin only)
   */
  @Get('admin/tier')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getPaymentsByTier(
    @Query('tier') tier: 'plus' | 'pro',
    @Query() query: BaseAdminQuery
  ): Promise<{ payments: PaymentHistory[] }> {
    logger.info('Admin fetching payments by tier', {
      tier,
      limit: query.limit,
      offset: query.offset
    }, 'PaymentHistoryController');

    if (!tier || !['plus', 'pro'].includes(tier)) {
      throw new Error('Invalid tier. Must be "plus" or "pro"');
    }

    try {
      const payments = await this.paymentHistoryService.findBySubscriptionTier(tier, query);

      logger.info('Payments by tier retrieved', {
        tier,
        paymentCount: payments.length
      }, 'PaymentHistoryController');

      return { payments };
    } catch (error) {
      logger.error('Failed to get payments by tier', {
        tier,
        error
      }, 'PaymentHistoryController');
      throw error;
    }
  }

  /**
   * Get payments by status (admin only)
   */
  @Get('admin/status')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 100, ttl: 60000 } })
  async getPaymentsByStatus(
    @Query('status') status: 'paid' | 'failed' | 'refunded' | 'disputed',
    @Query() query: BaseAdminQuery
  ): Promise<{ payments: PaymentHistory[] }> {
    logger.info('Admin fetching payments by status', {
      status,
      limit: query.limit,
      offset: query.offset
    }, 'PaymentHistoryController');

    if (!status || !['paid', 'failed', 'refunded', 'disputed'].includes(status)) {
      throw new Error('Invalid status. Must be "paid", "failed", "refunded", or "disputed"');
    }

    try {
      const payments = await this.paymentHistoryService.findByStatus(status, query);

      logger.info('Payments by status retrieved', {
        status,
        paymentCount: payments.length
      }, 'PaymentHistoryController');

      return { payments };
    } catch (error) {
      logger.error('Failed to get payments by status', {
        status,
        error
      }, 'PaymentHistoryController');
      throw error;
    }
  }

  /**
   * Get recent failed payments (admin monitoring)
   */
  @Get('admin/failed-recent')
  @UseGuards(FirebaseAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @Throttle({ default: { limit: 50, ttl: 60000 } })
  async getRecentFailedPayments(
    @Query('days') days?: string
  ): Promise<{ payments: PaymentHistory[] }> {
    const dayCount = days ? parseInt(days, 10) : 7;
    
    logger.info('Admin fetching recent failed payments', {
      days: dayCount
    }, 'PaymentHistoryController');

    try {
      const payments = await this.paymentHistoryService.getRecentFailedPayments(dayCount);

      logger.info('Recent failed payments retrieved', {
        days: dayCount,
        failedPaymentCount: payments.length
      }, 'PaymentHistoryController');

      return { payments };
    } catch (error) {
      logger.error('Failed to get recent failed payments', {
        days: dayCount,
        error
      }, 'PaymentHistoryController');
      throw error;
    }
  }
}