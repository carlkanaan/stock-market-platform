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
import { Member, MemberDocument } from '../members/schemas/member.schema';
import {
  WithdrawalRequest,
  WithdrawalRequestDocument,
  WithdrawalStatus,
} from '../wallet/schemas/withdrawal-request.schema';

type WalletAumResult = {
  totalWalletBalances: number;
};

type PortfolioAumResult = {
  totalPortfolioValue: number;
};

type SectorAllocationResult = {
  _id: string;
  sectorValue: number;
};

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Order.name)
    private readonly orderModel: Model<OrderDocument>,

    @InjectModel(Wallet.name)
    private readonly walletModel: Model<WalletDocument>,

    @InjectModel(Portfolio.name)
    private readonly portfolioModel: Model<PortfolioDocument>,

    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,

    @InjectModel(WithdrawalRequest.name)
    private readonly withdrawalRequestModel: Model<WithdrawalRequestDocument>,
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
  async getTopTradedStocks(limit = 5, page = 1) {
    const skip = (page - 1) * limit;

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
          ticker: '$stock.ticker',
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
        $skip: skip,
      },
      {
        $limit: limit,
      },
    ]);

    return {
      success: true,
      page,
      limit,
      data: result,
    };
  }
  //most active members in the past 30 days
  async getMostActiveMembers(days = 30, limit = 10) {
    const startDate = new Date();

    startDate.setDate(startDate.getDate() - days);

    const result = await this.orderModel.aggregate([
      {
        $match: {
          executedAt: {
            $gte: startDate,
          },
        },
      },
      {
        $group: {
          _id: '$memberId',
          tradeCount: { $sum: 1 },
        },
      },
      {
        $lookup: {
          from: 'members',
          localField: '_id',
          foreignField: '_id',
          as: 'member',
        },
      },
      {
        $unwind: '$member',
      },
      {
        $project: {
          _id: 0,
          memberId: '$member._id',
          displayName: '$member.fullName',
          tradeCount: 1,
        },
      },
      {
        $sort: {
          tradeCount: -1,
        },
      },
      {
        $limit: limit,
      },
    ]);

    return {
      success: true,
      data: result,
    };
  }
  //under management assets
  async getAssetsUnderManagement() {
    const wallets = await this.walletModel.aggregate<WalletAumResult>([
      {
        $group: {
          _id: null,
          totalWalletBalances: {
            $sum: '$balance',
          },
        },
      },
    ]);

    const portfolios = await this.portfolioModel.aggregate<PortfolioAumResult>([
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
    const sectors = await this.portfolioModel.aggregate<SectorAllocationResult>(
      [
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
      ],
    );

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

  // Total registered members and monthly growth analytics
  async getMemberGrowthAnalytics() {
    const totalMembers = await this.memberModel.countDocuments();

    const now = new Date();

    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);

    const previousMonthStart = new Date(
      now.getFullYear(),
      now.getMonth() - 1,
      1,
    );

    const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

    const currentMonthMembers = await this.memberModel.countDocuments({
      createdAt: {
        $gte: currentMonthStart,
      },
    });

    const previousMonthMembers = await this.memberModel.countDocuments({
      createdAt: {
        $gte: previousMonthStart,
        $lte: previousMonthEnd,
      },
    });

    const growthRate =
      previousMonthMembers === 0
        ? 100
        : Number(
            (
              ((currentMonthMembers - previousMonthMembers) /
                previousMonthMembers) *
              100
            ).toFixed(2),
          );

    return {
      success: true,
      data: {
        totalMembers,
        currentMonthMembers,
        previousMonthMembers,
        growthRate,
      },
    };
  }

  // Total pending withdrawal requests
  async getPendingWithdrawalMetrics() {
    const pendingWithdrawals = await this.withdrawalRequestModel.countDocuments(
      {
        status: WithdrawalStatus.PENDING,
      },
    );

    return {
      success: true,
      data: {
        pendingWithdrawals,
      },
    };
  }
}
