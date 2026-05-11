import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument, OrderType } from './schemas/order.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,
  ) {}

  async createOrder(data: {
    memberId: string;
    stockId: string;
    type: OrderType;
    quantity: number;
    price: number;
  }) {
    const totalValue = data.quantity * data.price;

    return this.orderModel.create({
      memberId: new Types.ObjectId(data.memberId),
      stockId: new Types.ObjectId(data.stockId),
      type: data.type,
      quantity: data.quantity,
      price: data.price,
      totalValue,
      status: 'EXECUTED',
      executedAt: new Date(),
    });
  }

  async getMemberOrders(memberId: string) {
    const orders = await this.orderModel
      .find({ memberId: new Types.ObjectId(memberId) })
      .populate('stockId')
      .sort({ executedAt: -1 });

    return {
      success: true,
      data: orders,
    };
  }
}
