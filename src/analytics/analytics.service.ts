import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { Order, OrderDocument } from '../orders/schemas/order.schema';
import { Wallet, WalletDocument } from '../wallet/schemas/wallet.schema';
import {
  Portfolio,
  PortfolioDocument,
} from '../portfolio/schemas/portfolio.schema';
import { Types } from 'mongoose';

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

  async getTradingVolume(
    stockId: string,
    groupBy: 'day' | 'month',
    from: string,
    to: string,
  ) {
    const dateFormat = groupBy === 'month' ? '%Y-%m' : '%Y-%m-%d';

    const result = await this.orderModel.aggregate([
      {
        $match: {
          stockId: new Types.ObjectId(stockId),
          executedAt: {
            $gte: new Date(from),
            $lte: new Date(to),
          },
        },
      },
      {
        $group: {
          _id: {
            $dateToString: {
              format: dateFormat,
              date: '$executedAt',
            },
          },
          sharesTraded: {
            $sum: '$quantity',
          },
          totalValue: {
            $sum: '$totalValue',
          },
        },
      },
      {
        $project: {
          _id: 0,
          date: '$_id',
          sharesTraded: 1,
          totalValue: 1,
        },
      },
      {
        $sort: {
          date: 1,
        },
      },
    ]);

    return {
      success: true,
      data: result,
    };
  }
  //Top 5 Traded Stocks
  async getTopTradedStocks() {
    const result = await this.orderModel.aggregate([
      {
        $group: {
          _id: '$stockId',
          tradeCount: { $sum: 1 },
          totalVolume: { $sum: '$quantity' },
        },
      },
      {
        $lookup: {
          from: 'stocks',
          localField: '_id',
          foreignField: '_id',
          as: 'stock',
        },
      },
      {
        $unwind: '$stock',
      },
      {
        $project: {
          _id: 0,
          stockId: '$_id',
          companyName: '$stock.companyName',
          tradeCount: 1,
          totalVolume: 1,
        },
      },
      {
        $sort: {
          tradeCount: -1,
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
  //most active members in the past 30 days
  async getMostActiveMembers() {
    const thirtyDaysAgo = new Date();

    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const result = await this.orderModel.aggregate([
      {
        $match: {
          executedAt: {
            $gte: thirtyDaysAgo,
          },
        },
      },
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
        $lookup: {
          from: 'stocks',
          localField: 'stockId',
          foreignField: '_id',
          as: 'stock',
        },
      },
      {
        $unwind: '$stock',
      },
      {
        $group: {
          _id: null,
          totalPortfolioValue: {
            $sum: {
              $multiply: ['$quantity', '$stock.currentPrice'],
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

  async getSectorAllocation() {
    const sectors = await this.portfolioModel.aggregate([
      {
        $lookup: {
          from: 'stocks',
          localField: 'stockId',
          foreignField: '_id',
          as: 'stock',
        },
      },
      {
        $unwind: '$stock',
      },
      {
        $group: {
          _id: '$stock.sector',
          sectorValue: {
            $sum: {
              $multiply: ['$quantity', '$stock.currentPrice'],
            },
          },
        },
      },
    ]);

    const totalValue = sectors.reduce(
      (sum, sector) => sum + sector.sectorValue,
      0,
    );

    const allocation = sectors.map((sector) => ({
      sector: sector._id,
      value: sector.sectorValue,
      percentage:
        totalValue === 0
          ? 0
          : Number(((sector.sectorValue / totalValue) * 100).toFixed(2)),
    }));

    return {
      success: true,
      data: allocation,
    };
  }
}
