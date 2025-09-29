import { Module } from '@nestjs/common';

import { PaymentsModule } from '@/payments/payments.module';
import { UsersModule } from '@/users/users.module';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';

@Module({
  imports: [PaymentsModule, UsersModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
  exports: [StripeWebhookService],
})
export class StripeModule {}