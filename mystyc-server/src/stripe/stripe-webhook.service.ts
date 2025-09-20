import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

import { SubscriptionLevel } from 'mystyc-common/constants/subscription-levels.enum';

import { logger } from '@/common/util/logger';
import { UserProfilesService } from '@/users/user-profiles.service';
import { PaymentHistoryService } from '@/payments/payment-history.service';

@Injectable()
export class StripeWebhookService {
  private stripe: Stripe;

  constructor(
    private readonly userProfilesService: UserProfilesService,
    private readonly paymentHistoryService: PaymentHistoryService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
  }

  /**
   * Handle successful payment - ONLY creates payment record
   */
  async handlePaymentSucceeded(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Processing successful payment', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_paid,
      billingReason: invoice.billing_reason
    }, 'StripeWebhookService');
    
    try {
      // Get user by Stripe customer ID
      const user = await this.findUserByStripeCustomerId(invoice.customer as string);
      if (!user) {
        logger.error('SECURITY ALERT: Refunding unauthorized payment', {
          stripeCustomerId: invoice.customer,
          invoiceId: invoice.id
        });
        
        // Cancel unauthorized subscription if it exists
        const lineItem = invoice.lines?.data?.[0];
        const subscriptionId = lineItem?.parent?.subscription_item_details?.subscription;
        if (subscriptionId) {
          await this.stripe.subscriptions.cancel(subscriptionId as string, {
            prorate: false,
          });
          logger.info('Unauthorized subscription canceled', {
            subscriptionId,
            invoiceId: invoice.id
          });
        }
        return;
      }

      // Only process subscription invoices
      if (invoice.billing_reason !== 'subscription_cycle' && invoice.billing_reason !== 'subscription_create') {
        logger.info('Skipping non-subscription invoice', {
          invoiceId: invoice.id,
          billingReason: invoice.billing_reason
        }, 'StripeWebhookService');
        return;
      }

      // Get period data from line items (this gives us the proper billing periods)
      const lineItem = invoice.lines?.data?.[0];
      const periodStart = lineItem?.period?.start ? new Date(lineItem.period.start * 1000) : new Date(invoice.period_start * 1000);
      const periodEnd = lineItem?.period?.end ? new Date(lineItem.period.end * 1000) : new Date(invoice.period_end * 1000);

      // Create payment record with correct billing periods from line items
      await this.paymentHistoryService.createPayment({
        firebaseUid: user.firebaseUid,
        stripeCustomerId: invoice.customer as string,
        stripeChargeId: invoice.id, // Use invoice ID since charge might not be available
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: null, // Will be updated by subscription events
        amount: invoice.amount_paid || 0,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'paid',
        subscriptionTier: 'plus', // All subscriptions are plus for now
        paidAt: new Date((invoice.status_transitions?.paid_at || Date.now() / 1000) * 1000),
        periodStart,
        periodEnd
      });

      logger.info('Payment record created successfully', {
        firebaseUid: user.firebaseUid,
        invoiceId: invoice.id,
        amount: invoice.amount_paid,
        billingPeriod: `${periodStart.toISOString()} - ${periodEnd.toISOString()}`
      }, 'StripeWebhookService');

    } catch (error) {
      logger.error('Failed to process successful payment', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        error
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Handle failed payment - ONLY creates failed payment record
   */
  async handlePaymentFailed(invoice: Stripe.Invoice): Promise<void> {
    logger.info('Processing failed payment', {
      invoiceId: invoice.id,
      customerId: invoice.customer,
      amount: invoice.amount_due,
      billingReason: invoice.billing_reason
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

      // Only process subscription invoices
      if (invoice.billing_reason !== 'subscription_cycle' && invoice.billing_reason !== 'subscription_create') {
        logger.info('Skipping non-subscription invoice failure', {
          invoiceId: invoice.id,
          billingReason: invoice.billing_reason
        }, 'StripeWebhookService');
        return;
      }

      // Get period data from line items
      const lineItem = invoice.lines?.data?.[0];
      const periodStart = lineItem?.period?.start ? new Date(lineItem.period.start * 1000) : new Date(invoice.period_start * 1000);
      const periodEnd = lineItem?.period?.end ? new Date(lineItem.period.end * 1000) : new Date(invoice.period_end * 1000);

      // Create failed payment record with correct billing periods from line items
      await this.paymentHistoryService.createPayment({
        firebaseUid: user.firebaseUid,
        stripeCustomerId: invoice.customer as string,
        stripeChargeId: 'failed',
        stripeInvoiceId: invoice.id,
        stripeSubscriptionId: null, // Will be updated by subscription events
        amount: invoice.amount_due || 0,
        currency: invoice.currency?.toUpperCase() || 'USD',
        status: 'failed',
        subscriptionTier: 'plus', // All subscriptions are plus for now
        paidAt: new Date(), // Use current time for failed payments
        periodStart,
        periodEnd
      });

      logger.info('Failed payment record created', {
        firebaseUid: user.firebaseUid,
        invoiceId: invoice.id,
        amount: invoice.amount_due,
        billingPeriod: `${periodStart.toISOString()} - ${periodEnd.toISOString()}`
      }, 'StripeWebhookService');

    } catch (error) {
      logger.error('Failed to process failed payment', {
        invoiceId: invoice.id,
        customerId: invoice.customer,
        error
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Handle new subscription created - Updates user tier to PLUS
   */
  async handleSubscriptionCreated(subscription: Stripe.Subscription): Promise<void> {
    // Get period data from subscription items
    const subscriptionItem = subscription.items?.data?.[0];
    const periodStart = subscriptionItem?.current_period_start;
    const periodEnd = subscriptionItem?.current_period_end;

    logger.info('Processing subscription created', {
      subscriptionId: subscription.id,
      customerId: subscription.customer,
      status: subscription.status,
      currentPeriodStart: periodStart ? new Date(periodStart * 1000).toISOString() : null,
      currentPeriodEnd: periodEnd ? new Date(periodEnd * 1000).toISOString() : null
    }, 'StripeWebhookService');

    try {
      // Get user by Stripe customer ID
      const user = await this.findUserByStripeCustomerId(subscription.customer as string);
      if (!user) {
        logger.error('User not found for subscription creation', {
          stripeCustomerId: subscription.customer,
          subscriptionId: subscription.id
        }, 'StripeWebhookService');
        return;
      }

      // Update user to PLUS tier with subscription start date
      if (periodStart) {
        await this.userProfilesService.updateSubscriptionTier(
          user.firebaseUid,
          SubscriptionLevel.PLUS,
          new Date(periodStart * 1000)
        );
      }

      // Link payment record to subscription if latest_invoice exists
      if (subscription.latest_invoice) {
        try {
          // Note: You'll need to implement this method in PaymentHistoryService
          // await this.paymentHistoryService.updateSubscriptionId(
          //   subscription.latest_invoice as string,
          //   subscription.id
          // );
          logger.info('Payment record linked to subscription', {
            subscriptionId: subscription.id,
            invoiceId: subscription.latest_invoice
          }, 'StripeWebhookService');
        } catch (error) {
          logger.warn('Failed to link payment record to subscription', {
            subscriptionId: subscription.id,
            invoiceId: subscription.latest_invoice,
            error
          }, 'StripeWebhookService');
        }
      }

      logger.info('User upgraded to PLUS on subscription creation', {
        firebaseUid: user.firebaseUid,
        subscriptionId: subscription.id,
        subscriptionStartDate: periodStart ? new Date(periodStart * 1000).toISOString() : null,
        billingPeriod: periodStart && periodEnd ? 
          `${new Date(periodStart * 1000).toISOString()} - ${new Date(periodEnd * 1000).toISOString()}` : 
          'No billing period found',
        latestInvoice: subscription.latest_invoice
      }, 'StripeWebhookService');

    } catch (error) {
      logger.error('Failed to process subscription creation', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        error
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Handle subscription updated (status changes, etc.)
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

      // Get period data from subscription items
      const subscriptionItem = subscription.items?.data?.[0];
      const periodStart = subscriptionItem?.current_period_start;

      // Handle subscription status changes
      if (subscription.status === 'active') {
        // Upgrade/maintain user as PLUS
        if (periodStart) {
          await this.userProfilesService.updateSubscriptionTier(
            user.firebaseUid,
            SubscriptionLevel.PLUS,
            new Date(periodStart * 1000)
          );
        }

        logger.info('Subscription updated - user maintained as PLUS', {
          firebaseUid: user.firebaseUid,
          subscriptionId: subscription.id,
          status: subscription.status
        }, 'StripeWebhookService');

      } else if (['canceled', 'unpaid', 'past_due', 'incomplete_expired'].includes(subscription.status)) {
        // Downgrade to free tier
        await this.userProfilesService.updateSubscriptionTier(
          user.firebaseUid,
          SubscriptionLevel.USER,
          null
        );

        logger.info('Subscription updated - user downgraded to free', {
          firebaseUid: user.firebaseUid,
          subscriptionStatus: subscription.status,
          subscriptionId: subscription.id
        }, 'StripeWebhookService');
      }

    } catch (error) {
      logger.error('Failed to process subscription update', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        error
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

      logger.info('Subscription deleted - user downgraded to free', {
        firebaseUid: user.firebaseUid,
        subscriptionId: subscription.id
      }, 'StripeWebhookService');

    } catch (error) {
      logger.error('Failed to process subscription deletion', {
        subscriptionId: subscription.id,
        customerId: subscription.customer,
        error
      }, 'StripeWebhookService');
      throw error;
    }
  }

  /**
   * Find user by Stripe customer ID
   */
  private async findUserByStripeCustomerId(stripeCustomerId: string): Promise<{ firebaseUid: string } | null> {
    const user = await this.userProfilesService.findByStripeCustomerId(stripeCustomerId);
    return user ? { firebaseUid: user.firebaseUid } : null;
  }
}