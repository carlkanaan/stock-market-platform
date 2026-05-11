import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Wallet, WalletDocument } from '../wallet/schemas/wallet.schema';
import {
  Portfolio,
  PortfolioDocument,
} from '../portfolio/schemas/portfolio.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,

    @InjectModel(Portfolio.name)
    private readonly portfolioModel: Model<PortfolioDocument>,
  ) {}

  async getTradingVolume() {
    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: null,
          totalTradingVolume: {
            $sum: '$totalValue',
          },
        },
      },
    ]);

    return {
      success: true,
      data: result[0] || {
        totalTradingVolume: 0,
      },
    };
  }

  async getTopTradedStocks() {
    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$stockId',
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: '$quantity' },
        },
      },
      {
        $sort: {
          totalVolume: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    return {
      success: true,
      data: result,
    };
  }

  async getMostActiveMembers() {
    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$memberId',
          totalOrders: { $sum: 1 },
          totalTradingValue: {
            $sum: '$totalValue',
          },
        },
      },
      {
        $sort: {
          totalOrders: -1,
        },
      },
      {
        $limit: 5,
      },
    ]);

    return {
      success: true,
      data: result,
    };
  }

  async getAssetsUnderManagement() {
    const wallets = await this.walletModel.aggregate([
      {
        $group: {
          _id: null,
          totalWalletBalances: {
            $sum: '$balance',
          },
        },
      },
    ]);

    const portfolios = await this.portfolioModel.aggregate([
      {
        $group: {
          _id: null,
          totalPortfolioValue: {
            $sum: {
              $multiply: ['$quantity', '$averagePurchasePrice'],
            },
          },
        },
      },
    ]);

    const totalWalletBalances = wallets[0]?.totalWalletBalances || 0;

    const totalPortfolioValue = portfolios[0]?.totalPortfolioValue || 0;

    return {
      success: true,
      data: {
        totalWalletBalances,
        totalPortfolioValue,
        totalAUM: totalWalletBalances + totalPortfolioValue,
      },
    };
  }
}
