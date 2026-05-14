import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WalletTransactionDocument = HydratedDocument<WalletTransaction>;

export enum WalletTransactionType {
  DEPOSIT = 'DEPOSIT',
  WITHDRAWAL = 'WITHDRAWAL',
}

@Schema({ timestamps: true })
export class WalletTransaction {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  memberId: Types.ObjectId;

  @Prop({ type: String, enum: WalletTransactionType, required: true })
  type: WalletTransactionType;

  @Prop({ required: true, min: 1 })
  amount: number;

  @Prop({ default: 'COMPLETED' })
  status: string;

  @Prop({ default: Date.now })
  transactionDate: Date;
}

export const WalletTransactionSchema =
  SchemaFactory.createForClass(WalletTransaction);

WalletTransactionSchema.index({ memberId: 1, transactionDate: -1 });
WalletTransactionSchema.index({ type: 1 });
