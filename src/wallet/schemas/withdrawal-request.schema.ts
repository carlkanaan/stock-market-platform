import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WithdrawalRequestDocument = HydratedDocument<WithdrawalRequest>;

export enum WithdrawalStatus {
  PENDING = 'PENDING',
  APPROVED = 'APPROVED',
  REJECTED = 'REJECTED',
}

@Schema({ timestamps: true })
export class WithdrawalRequest {
  @Prop({
    type: Types.ObjectId,
    ref: 'Member',
    required: true,
  })
  memberId: Types.ObjectId;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({
    type: String,
    enum: WithdrawalStatus,
    default: WithdrawalStatus.PENDING,
  })
  status: WithdrawalStatus;

  @Prop()
  rejectionReason?: string;

  @Prop({ type: Types.ObjectId, ref: 'CmsUser' })
  reviewedBy?: Types.ObjectId;

  @Prop()
  reviewedAt?: Date;
}

export const WithdrawalRequestSchema =
  SchemaFactory.createForClass(WithdrawalRequest);

WithdrawalRequestSchema.index({ memberId: 1 });
WithdrawalRequestSchema.index({ status: 1 });
WithdrawalRequestSchema.index({ createdAt: -1 });
