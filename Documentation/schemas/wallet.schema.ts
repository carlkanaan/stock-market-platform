import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type WalletDocument = HydratedDocument<Wallet>;

@Schema({ timestamps: true })
export class Wallet {
  @Prop({
    type: Types.ObjectId,
    ref: 'Member',
    required: true,
    unique: true,
  })
  memberId: Types.ObjectId;

  @Prop({ default: 0, min: 0 })
  balance: number;

  @Prop()
  lastDepositAt?: Date;
}

export const WalletSchema = SchemaFactory.createForClass(Wallet);

WalletSchema.index({ memberId: 1 }, { unique: true });
