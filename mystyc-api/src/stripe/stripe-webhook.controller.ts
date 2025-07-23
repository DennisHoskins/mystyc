import { Controller, Post, Body, Headers, RawBodyRequest, Req } from '@nestjs/common';
import { Request } from 'express';
import Stripe from 'stripe';

import { Public } from '@/common/decorators/public.decorator';
import { logger } from '@/common/util/logger';

import { StripeWebhookService } from './stripe-webhook.service';

@Controller('stripe')
export class StripeWebhookController {
  private stripe: Stripe;

  constructor(
    private readonly stripeWebhookService: StripeWebhookService,
  ) {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {});
  }

  /**
   * Handle Stripe webhook events
   * Public endpoint with signature verification for security
   */
  @Post('webhook')
  @Public()
  async handleWebhook(
    @Req() request: RawBodyRequest<Request>,
    @Headers('stripe-signature') signature: string
  ): Promise<{ received: boolean }> {
    logger.info('Stripe webhook received', {
      signature: signature ? 'present' : 'missing',
      contentLength: request.body?.length || 0
    }, 'StripeWebhookController');

    // Verify webhook signature for security
    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(
        request.body!,
        signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
      
      logger.info('Stripe webhook signature verified', {
        eventType: event.type,
        eventId: event.id
      }, 'StripeWebhookController');
    } catch (error) {
      logger.error('Stripe webhook signature verification failed', {
        error,
        signature: signature ? 'present' : 'missing'
      }, 'StripeWebhookController');
      
      // Return 400 for invalid signatures
      throw new Error('Invalid webhook signature');
    }

    // Handle the webhook event
    try {
      await this.processWebhookEvent(event);
      
      logger.info('Stripe webhook processed successfully', {
        eventType: event.type,
        eventId: event.id
      }, 'StripeWebhookController');
      
      return { received: true };
    } catch (error) {
      logger.error('Stripe webhook processing failed', {
        eventType: event.type,
        eventId: event.id,
        error
      }, 'StripeWebhookController');
      
      // Still return 200 to Stripe to avoid retries for unrecoverable errors
      // Log the error for manual investigation
      return { received: true };
    }
  }

  /**
   * Process different types of webhook events
   */
  private async processWebhookEvent(event: Stripe.Event): Promise<void> {
    logger.debug('Processing webhook event', {
      eventType: event.type,
      eventId: event.id
    }, 'StripeWebhookController');

    switch (event.type) {
      case 'invoice.payment_succeeded':
        await this.stripeWebhookService.handlePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;

      case 'invoice.payment_failed':
        await this.stripeWebhookService.handlePaymentFailed(event.data.object as Stripe.Invoice);
        break;

      case 'customer.subscription.created':
        await this.stripeWebhookService.handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.updated':
        await this.stripeWebhookService.handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;

      case 'customer.subscription.deleted':
        await this.stripeWebhookService.handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;

      default:
        logger.info('Unhandled webhook event type', {
          eventType: event.type,
          eventId: event.id
        }, 'StripeWebhookController');
        // Don't throw error for unhandled events
        break;
    }
  }
}