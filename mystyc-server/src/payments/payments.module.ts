import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { FirebaseModule } from '@/auth/firebase.module';
import { UsersModule } from '@/users/users.module';
import { PaymentHistoryController } from './payment-history.controller';
import { PaymentHistoryService } from './payment-history.service';
import { PaymentHistory, PaymentHistorySchema } from './schemas/payment-history.schema';

@Module({
  imports: [
    FirebaseModule,
    MongooseModule.forFeature([
      { name: PaymentHistory.name, schema: PaymentHistorySchema }
    ]),
    UsersModule // For UserProfilesService
  ],
  controllers: [PaymentHistoryController],
  providers: [PaymentHistoryService],
  exports: [PaymentHistoryService],
})
export class PaymentsModule {}