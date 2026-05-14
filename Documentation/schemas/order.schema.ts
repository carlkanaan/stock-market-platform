import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument, Types } from 'mongoose';

export type OrderDocument = HydratedDocument<Order>;

export enum OrderType {
  BUY = 'BUY',
  SELL = 'SELL',
}

@Schema({ timestamps: true })
export class Order {
  @Prop({ type: Types.ObjectId, ref: 'Member', required: true })
  memberId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Stock', required: true })
  stockId: Types.ObjectId;

  @Prop({ type: String, enum: OrderType, required: true })
  type: OrderType;

  @Prop({ required: true, min: 1 })
  quantity: number;

  @Prop({ required: true, min: 0 })
  price: number;

  @Prop({ required: true, min: 0 })
  totalValue: number;

  @Prop({ default: 'EXECUTED' })
  status: string;

  @Prop({ default: Date.now })
  executedAt: Date;
}

export const OrderSchema = SchemaFactory.createForClass(Order);

OrderSchema.index({ memberId: 1, executedAt: -1 });
OrderSchema.index({ stockId: 1, executedAt: -1 });
OrderSchema.index({ type: 1 });
