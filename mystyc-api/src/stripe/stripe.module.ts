import { Module } from '@nestjs/common';
import { StripeWebhookController } from './stripe-webhook.controller';
import { StripeWebhookService } from './stripe-webhook.service';
import { PaymentsModule } from '@/payments/payments.module';
import { UsersModule } from '@/users/users.module';

@Module({
  imports: [PaymentsModule, UsersModule],
  controllers: [StripeWebhookController],
  providers: [StripeWebhookService],
  exports: [StripeWebhookService],
})
export class StripeModule {}