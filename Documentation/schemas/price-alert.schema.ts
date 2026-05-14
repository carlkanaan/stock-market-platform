import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type PriceAlertDocument = HydratedDocument<PriceAlert>;

export enum AlertDirection {
  ABOVE = 'ABOVE',
  BELOW = 'BELOW',
}

@Schema({ timestamps: true })
export class PriceAlert {
  @Prop({
    type: Types.ObjectId,
    ref: 'Member',
    required: true,
  })
  memberId: Types.ObjectId;

  @Prop({
    type: Types.ObjectId,
    ref: 'Stock',
    required: true,
  })
  stockId: Types.ObjectId;

  @Prop({ required: true, min: 0 })
  targetPrice: number;

  @Prop({
    type: String,
    enum: AlertDirection,
    required: true,
  })
  direction: AlertDirection;

  @Prop({ default: false })
  isTriggered: boolean;

  @Prop()
  triggeredAt?: Date;
}

export const PriceAlertSchema = SchemaFactory.createForClass(PriceAlert);

PriceAlertSchema.index({ memberId: 1 });
PriceAlertSchema.index({ stockId: 1 });
PriceAlertSchema.index({ isTriggered: 1 });
