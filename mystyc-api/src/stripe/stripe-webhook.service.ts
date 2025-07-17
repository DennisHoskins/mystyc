import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { SubscriptionLevel } from '@/common/enums/subscription-levels.enum';
import { UserProfilesService } from '@/users/user-profiles.service';
import { PaymentHistoryService } from '@/payments/payment-history.service';
import { logger } from '@/common/util/logger';

@Injectable()
export class StripeWebhookService {
  constructor(
    private readonly userProfilesService: UserProfilesService,
    private readonly paymentHistoryService: PaymentHistoryService,
  ) {}

  /**
   * Handle successful payment
   */
  async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Processing successful payment', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_paid,
      subscriptionId: invoice.subscription
    }, 'StripeWebhookService');

    try {
      // Get user by Stripe customer ID (we'll need to store this mapping)
      const user = await this.findUserByStripeCustomerId(invoice.customer as string);
      if (!user) {
        logger.warn('User not found for Stripe customer', {
          stripeCustomerId: invoice.customer,
          invoiceId: invoice.id
        }, 'StripeWebhookService');
        return;
      }

      // Determine subscription tier from invoice
      const subscriptionTier = await this.determineSubscriptionTier(invoice);

      // Save payment record
      await this.paymentHistoryService.createPayment({
        firebaseUid: user.firebaseUid,
        stripeCustomerId: invoice.customer as string,
        stripeChargeId: invoice.charge as string || 'unknown',
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: invoice.subscription as string,
        amount: invoice.amount_paid,
        currency: invoice.currency.toUpperCase(),
        status: 'paid',
        subscriptionTier,
        paidAt: new Date(invoice.status_transitions.paid_at! * 1000),
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000)
      });

      // Update user subscription tier
      await this.userProfilesService.updateSubscriptionTier(
        user.firebaseUid,
        subscriptionTier === 'plus' ? SubscriptionLevel.PLUS : SubscriptionLevel.PRO,
        new Date(invoice.period_start * 1000)
      );

      logger.info('Payment processed successfully', {
        firebaseUid: user.firebaseUid,
        invoiceId: invoice.id,
        subscriptionTier,
        amount: invoice.amount_paid
      }, 'StripeWebhookService');

    } catch (error) {
      logger.error('Failed to process successful payment', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        error: error.message
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Handle failed payment
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Processing failed payment', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_due,
      subscriptionId: invoice.subscription
    }, 'StripeWebhookService');

    try {
      // Get user by Stripe customer ID
      const user = await this.findUserByStripeCustomerId(invoice.customer as string);
      if (!user) {
        logger.warn('User not found for failed payment', {
          stripeCustomerId: invoice.customer,
          invoiceId: invoice.id
        }, 'StripeWebhookService');
        return;
      }

      // Determine subscription tier from invoice
      const subscriptionTier = await this.determineSubscriptionTier(invoice);

      // Save failed payment record
      await this.paymentHistoryService.createPayment({
        firebaseUid: user.firebaseUid,
        stripeCustomerId: invoice.customer as string,
        stripeChargeId: 'failed',
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: invoice.subscription as string,
        amount: invoice.amount_due,
        currency: invoice.currency.toUpperCase(),
        status: 'failed',
        subscriptionTier,
        paidAt: new Date(), // Use current time for failed payments
        periodStart: new Date(invoice.period_start * 1000),
        periodEnd: new Date(invoice.period_end * 1000)
      });

      // Downgrade user to free tier immediately
      await this.userProfilesService.updateSubscriptionTier(
        user.firebaseUid,
        SubscriptionLevel.USER, // Downgrade to free
        null // No start date for free tier
      );

      logger.info('Failed payment processed', {
        firebaseUid: user.firebaseUid,
        invoiceId: invoice.id,
        downgradedToFree: true
      }, 'StripeWebhookService');

    } catch (error) {
      logger.error('Failed to process failed payment', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        error: error.message
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Handle new subscription created
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Processing subscription created', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status
    }, 'StripeWebhookService');

    // For new subscriptions, we typically wait for the first invoice.payment_succeeded
    // This just logs the event for now
    logger.info('Subscription created - waiting for first payment', {
      subscriptionId: subscription.id,
      customerId: subscription.customer
    }, 'StripeWebhookService');
  }

  /**
   * Handle subscription updated (plan changes, etc.)
   */
  async handleSubscriptionUpdated(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Processing subscription updated', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status
    }, 'StripeWebhookService');

    try {
      // Get user by Stripe customer ID
      const user = await this.findUserByStripeCustomerId(subscription.customer as string);
      if (!user) {
        logger.warn('User not found for subscription update', {
          stripeCustomerId: subscription.customer,
          subscriptionId: subscription.id
        }, 'StripeWebhookService');
        return;
      }

      // Handle subscription status changes
      if (subscription.status === 'active') {
        // Determine new tier from subscription
        const subscriptionTier = await this.determineSubscriptionTierFromSubscription(subscription);
        
        await this.userProfilesService.updateSubscriptionTier(
          user.firebaseUid,
          subscriptionTier === 'plus' ? SubscriptionLevel.PLUS : SubscriptionLevel.PRO,
          new Date(subscription.current_period_start * 1000)
        );

        logger.info('Subscription updated - user upgraded', {
          firebaseUid: user.firebaseUid,
          subscriptionTier,
          subscriptionId: subscription.id
        }, 'StripeWebhookService');

      } else if (['canceled', 'unpaid', 'past_due'].includes(subscription.status)) {
        // Downgrade to free tier
        await this.userProfilesService.updateSubscriptionTier(
          user.firebaseUid,
          SubscriptionLevel.USER,
          null
        );

        logger.info('Subscription updated - user downgraded', {
          firebaseUid: user.firebaseUid,
          subscriptionStatus: subscription.status,
          subscriptionId: subscription.id
        }, 'StripeWebhookService');
      }

    } catch (error) {
      logger.error('Failed to process subscription update', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        error: error.message
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Handle subscription deleted (cancellation)
   */
  async handleSubscriptionDeleted(subscription: Stripe.Subscription): Promise<void> {
    logger.info('Processing subscription deleted', {
      subscriptionId: subscription.id,
      customerId: subscription.customer
    }, 'StripeWebhookService');

    try {
      // Get user by Stripe customer ID
      const user = await this.findUserByStripeCustomerId(subscription.customer as string);
      if (!user) {
        logger.warn('User not found for subscription deletion', {
          stripeCustomerId: subscription.customer,
          subscriptionId: subscription.id
        }, 'StripeWebhookService');
        return;
      }

      // Downgrade user to free tier
      await this.userProfilesService.updateSubscriptionTier(
        user.firebaseUid,
        SubscriptionLevel.USER,
        null
      );

      logger.info('Subscription deleted - user downgraded', {
        firebaseUid: user.firebaseUid,
        subscriptionId: subscription.id
      }, 'StripeWebhookService');

    } catch (error) {
      logger.error('Failed to process subscription deletion', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        error: error.message
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Find user by Stripe customer ID
   * TODO: We need to store Stripe customer IDs on user profiles
   */
  private async findUserByStripeCustomerId(stripeCustomerId: string): Promise<{ firebaseUid: string } | null> {
    // TODO: Implement this - we need to add stripeCustomerId to UserProfile
    // For now, return null which will log warnings
    logger.warn('TODO: Implement user lookup by Stripe customer ID', {
      stripeCustomerId
    }, 'StripeWebhookService');
    
    return null;
  }

  /**
   * Determine subscription tier from invoice line items
   */
  private async determineSubscriptionTier(invoice: Stripe.Invoice): Promise<'plus' | 'pro'> {
    // TODO: Match against your actual Stripe price IDs
    const priceIds = invoice.lines.data.map(line => line.price?.id).filter(Boolean);
    
    // Example logic - replace with your actual price IDs
    if (priceIds.some(id => id?.includes('plus'))) {
      return 'plus';
    } else if (priceIds.some(id => id?.includes('pro'))) {
      return 'pro';
    }
    
    // Default to plus for now
    logger.warn('Could not determine subscription tier from invoice, defaulting to plus', {
      invoiceId: invoice.id,
      priceIds
    }, 'StripeWebhookService');
    
    return 'plus';
  }

  /**
   * Determine subscription tier from subscription object
   */
  private async determineSubscriptionTierFromSubscription(subscription: Stripe.Subscription): Promise<'plus' | 'pro'> {
    // TODO: Match against your actual Stripe price IDs
    const priceIds = subscription.items.data.map(item => item.price.id);
    
    // Example logic - replace with your actual price IDs
    if (priceIds.some(id => id.includes('plus'))) {
      return 'plus';
    } else if (priceIds.some(id => id.includes('pro'))) {
      return 'pro';
    }
    
    // Default to plus for now
    logger.warn('Could not determine subscription tier from subscription, defaulting to plus', {
      subscriptionId: subscription.id,
      priceIds
    }, 'StripeWebhookService');
    
    return 'plus';
  }
}