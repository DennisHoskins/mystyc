import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { IsOptional } from 'class-validator';
import { Document } from 'mongoose';

export type PaymentHistoryDocument = PaymentHistory & Document;

@Schema({ timestamps: true, collection: 'paymentHistory' })
export class PaymentHistory {
  @Prop({ required: true, index: true })
  firebaseUid!: string;

  @Prop({ required: true, index: true })
  stripeCustomerId!: string;

  @Prop({ required: true, index: true })
  stripeChargeId!: string;

  @Prop({ required: true, index: true })
  stripeInvoiceId!: string;

  @IsOptional()
  @Prop({ index: true })
  stripeSubscriptionId!: string;

  @Prop({ required: true })
  amount!: number; // Amount in cents

  @Prop({ required: true, default: 'USD' })
  currency!: string;

  @Prop({ 
    required: true, 
    enum: ['paid', 'failed', 'refunded', 'disputed'],
    index: true 
  })
  status!: string;

  @Prop({ 
    required: true, 
    enum: ['plus', 'pro'],
    index: true 
  })
  subscriptionTier!: string;

  @Prop({ required: true, index: true })
  paidAt!: Date;

  @Prop({ required: true })
  periodStart!: Date;

  @Prop({ required: true })
  periodEnd!: Date;

  createdAt!: Date;
  updatedAt!: Date;
}

export const PaymentHistorySchema = SchemaFactory.createForClass(PaymentHistory);

// Additional indexes for efficient queries
PaymentHistorySchema.index({ firebaseUid: 1, paidAt: -1 }); // User payment history
PaymentHistorySchema.index({ status: 1, paidAt: -1 }); // Failed payments by date
PaymentHistorySchema.index({ subscriptionTier: 1, paidAt: -1 }); // Tier analytics
PaymentHistorySchema.index({ stripeCustomerId: 1, paidAt: -1 }); // Customer lookup
PaymentHistorySchema.index({ paidAt: -1 }); // Recent payments