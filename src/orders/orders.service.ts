import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { Order, OrderDocument, OrderType } from './schemas/order.schema';

import {
  WalletTransaction,
  WalletTransactionDocument,
} from '../wallet/schemas/wallet-transaction.schema';

@Injectable()
export class OrdersService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(WalletTransaction.name)
    private readonly walletTransactionModel: Model<WalletTransactionDocument>,
  ) {}
  //create member order
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
  //display member order
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
  //display full transaction history with date filter and type filtering including buy, sell, withdrawal, deposit transactions
  async getFullTransactionHistory(
    memberId: string,
    type?: string,
    from?: string,
    to?: string,
  ) {
    const dateFilter: Record<string, Date> = {};

    if (from) {
      dateFilter.$gte = new Date(from);
    }

    if (to) {
      dateFilter.$lte = new Date(to);
    }

    const orderFilter: Record<string, unknown> = {
      memberId: new Types.ObjectId(memberId),
    };

    const walletFilter: Record<string, unknown> = {
      memberId: new Types.ObjectId(memberId),
    };

    if (Object.keys(dateFilter).length > 0) {
      orderFilter.executedAt = dateFilter;
      walletFilter.transactionDate = dateFilter;
    }

    if (type) {
      orderFilter.type = type;
      walletFilter.type = type;
    }

    const orders = await this.orderModel
      .find(orderFilter)
      .populate('stockId')
      .lean();

    const walletTransactions = await this.walletTransactionModel
      .find(walletFilter)
      .lean();

    const formattedOrders = orders.map((order) => ({
      transactionType: order.type,
      source: 'ORDER',
      stock: order.stockId,
      quantity: order.quantity,
      price: order.price,
      totalValue: order.totalValue,
      status: order.status,
      date: order.executedAt,
    }));

    const formattedWalletTransactions = walletTransactions.map(
      (transaction) => ({
        transactionType: transaction.type,
        source: 'WALLET',
        amount: transaction.amount,
        status: transaction.status,
        date: transaction.transactionDate,
      }),
    );

    const history = [...formattedOrders, ...formattedWalletTransactions].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    );

    return {
      success: true,
      data: history,
    };
  }
}
