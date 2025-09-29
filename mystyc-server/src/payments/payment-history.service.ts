import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { PaymentHistory as PaymentHistoryInterface, validatePaymentHistoryInputSafe } from 'mystyc-common/schemas/payment-history.schema';
import { BaseAdminQuery, validateBaseAdminQuery } from 'mystyc-common/admin/schemas/admin-queries.schema';

import { logger } from '@/common/util/logger';
import { PaymentHistory, PaymentHistoryDocument } from './schemas/payment-history.schema';

@Injectable()
export class PaymentHistoryService {
  constructor(
    @InjectModel(PaymentHistory.name) private paymentModel: Model<PaymentHistoryDocument>,
  ) {}

  /**
   * Create a new payment record (called from webhooks)
   */
  async createPayment(paymentData: Partial<PaymentHistoryInterface>): Promise<PaymentHistoryInterface> {
    logger.info('Creating payment record', {
      firebaseUid: paymentData.firebaseUid,
      stripeInvoiceId: paymentData.stripeInvoiceId,
      amount: paymentData.amount,
      status: paymentData.status
    }, 'PaymentHistoryService');

    const validation = validatePaymentHistoryInputSafe(paymentData);
    if (!validation.success) {
      logger.error('Payment history validation failed', {
        firebaseUid: paymentData.firebaseUid,
        stripeInvoiceId: paymentData.stripeInvoiceId,
        errors: validation.error.errors
      }, 'PaymentHistoryService');
      throw new Error(validation.error.errors.toString());
    }

    try {
      const payment = new this.paymentModel(paymentData);
      const savedPayment = await payment.save();

      logger.info('Payment record created successfully', {
        paymentId: savedPayment._id.toString(),
        firebaseUid: paymentData.firebaseUid,
        stripeInvoiceId: paymentData.stripeInvoiceId
      }, 'PaymentHistoryService');

      return this.transformToPaymentHistory(savedPayment);
    } catch (error) {
      logger.error('Failed to create payment record', {
        firebaseUid: paymentData.firebaseUid,
        stripeInvoiceId: paymentData.stripeInvoiceId,
        error
      }, 'PaymentHistoryService');
      throw error;
    }
  }

  /**
   * Find payment by IDs (for webhook processing)
   */
  async findById(id?: string): Promise<PaymentHistoryInterface | null> {
    logger.debug('Finding payment by ID', {
      id,
    }, 'PaymentHistoryService');

    const query: any = {};
    if (id) query._id = id;

    const payment = await this.paymentModel.findOne(query).exec();

    if (!payment) {
      logger.debug('Payment not found by Stripe IDs', {
        id,
      }, 'PaymentHistoryService');
      return null;
    }

    return this.transformToPaymentHistory(payment);
  }

  /**
   * Find payment by Stripe IDs (for webhook processing)
   */
  async findByStripeIds(stripeInvoiceId?: string, stripeChargeId?: string): Promise<PaymentHistoryInterface | null> {
    logger.debug('Finding payment by Stripe IDs', {
      stripeInvoiceId,
      stripeChargeId
    }, 'PaymentHistoryService');

    const query: any = {};
    if (stripeInvoiceId) query.stripeInvoiceId = stripeInvoiceId;
    if (stripeChargeId) query.stripeChargeId = stripeChargeId;

    const payment = await this.paymentModel.findOne(query).exec();

    if (!payment) {
      logger.debug('Payment not found by Stripe IDs', {
        stripeInvoiceId,
        stripeChargeId
      }, 'PaymentHistoryService');
      return null;
    }

    return this.transformToPaymentHistory(payment);
  }

  /**
   * Find user's payment history with pagination
   */
  async findByFirebaseUid(firebaseUid: string, queryRaw: BaseAdminQuery): Promise<PaymentHistoryInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding payment history for user', {
      firebaseUid,
      limit,
      offset,
      sortBy,
      sortOrder
    }, 'PaymentHistoryService');

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const payments = await this.paymentModel
      .find({ firebaseUid })
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    logger.debug('User payment history found', {
      firebaseUid,
      count: payments.length,
      limit,
      offset
    }, 'PaymentHistoryService');

    return payments.map(payment => this.transformToPaymentHistory(payment));
  }

  /**
   * Get total payment count for user
   */
  async getTotalByFirebaseUid(firebaseUid: string): Promise<number> {
    return await this.paymentModel.countDocuments({ firebaseUid });
  }

  /**
   * Update payment status (for failed payments, refunds, etc.)
   */
  async updatePaymentStatus(
    stripeInvoiceId: string, 
    status: 'paid' | 'failed' | 'refunded' | 'disputed'
  ): Promise<PaymentHistoryInterface | null> {
    logger.info('Updating payment status', {
      stripeInvoiceId,
      status
    }, 'PaymentHistoryService');

    const updatedPayment = await this.paymentModel.findOneAndUpdate(
      { stripeInvoiceId },
      { status, updatedAt: new Date() },
      { new: true }
    ).exec();

    if (!updatedPayment) {
      logger.warn('Payment not found for status update', {
        stripeInvoiceId,
        status
      }, 'PaymentHistoryService');
      return null;
    }

    logger.info('Payment status updated successfully', {
      paymentId: updatedPayment._id.toString(),
      stripeInvoiceId,
      newStatus: status
    }, 'PaymentHistoryService');

    return this.transformToPaymentHistory(updatedPayment);
  }

  // Admin methods for pagination/stats
  async getTotalAmount(): Promise<number> {
    const result = await this.paymentModel.aggregate([
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' }
        }
      }
    ]);
    
    return result[0]?.totalAmount || 0;
  }

  async getTotal(): Promise<number> {
    return await this.paymentModel.countDocuments();
  }

  async findAll(queryRaw: BaseAdminQuery): Promise<PaymentHistoryInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    logger.debug('Finding all payments with pagination', {
      limit,
      offset,
      sortBy,
      sortOrder
    }, 'PaymentHistoryService');

    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const payments = await this.paymentModel
      .find()
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    logger.debug('All payments found', {
      count: payments.length,
      limit,
      offset
    }, 'PaymentHistoryService');

    return payments.map(payment => this.transformToPaymentHistory(payment));
  }
  

  /**
   * Get payments by subscription tier (admin analytics)
   */
  async findBySubscriptionTier(tier: 'plus' | 'pro', queryRaw: BaseAdminQuery): Promise<PaymentHistoryInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const payments = await this.paymentModel
      .find({ subscriptionTier: tier })
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return payments.map(payment => this.transformToPaymentHistory(payment));
  }

  /**
   * Get payments by status (admin analytics)
   */
  async findByStatus(status: 'paid' | 'failed' | 'refunded' | 'disputed', queryRaw: BaseAdminQuery): Promise<PaymentHistoryInterface[]> {

    const query = validateBaseAdminQuery(queryRaw);
    const { limit, offset, sortBy, sortOrder } = query as Required<BaseAdminQuery>;
    
    const sortObj: any = {};
    sortObj[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const payments = await this.paymentModel
      .find({ status })
      .sort(sortObj)
      .skip(offset)
      .limit(limit)
      .exec();

    return payments.map(payment => this.transformToPaymentHistory(payment));
  }

  /**
   * Get recent failed payments (for admin monitoring)
   */
  async getRecentFailedPayments(days: number = 7): Promise<PaymentHistoryInterface[]> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const payments = await this.paymentModel
      .find({
        status: 'failed',
        paidAt: { $gte: cutoffDate }
      })
      .sort({ paidAt: -1 })
      .limit(100)
      .exec();

    return payments.map(payment => this.transformToPaymentHistory(payment));
  }

  /**
   * Transform document to interface
   */
  private transformToPaymentHistory(doc: PaymentHistoryDocument): PaymentHistoryInterface {
    return {
      _id: doc._id.toString(),
      firebaseUid: doc.firebaseUid,
      stripeCustomerId: doc.stripeCustomerId,
      stripeChargeId: doc.stripeChargeId,
      stripeInvoiceId: doc.stripeInvoiceId,
      stripeSubscriptionId: doc.stripeSubscriptionId,
      amount: doc.amount,
      currency: doc.currency,
      status: doc.status as 'paid' | 'failed' | 'refunded' | 'disputed',
      subscriptionTier: doc.subscriptionTier as 'plus' | 'pro',
      paidAt: doc.paidAt,
      periodStart: doc.periodStart,
      periodEnd: doc.periodEnd,
      createdAt: doc.createdAt,
      updatedAt: doc.updatedAt,
    };
  }
}