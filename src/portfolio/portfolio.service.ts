import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { StocksService } from '../stocks/stocks.service';
import { WalletService } from '../wallet/wallet.service';

import { BuyStockDto } from './dto/buy-stock.dto';
import { SellStockDto } from './dto/sell-stock.dto';

import { Portfolio, PortfolioDocument } from './schemas/portfolio.schema';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectModel(Portfolio.name)
    private readonly portfolioModel: Model<PortfolioDocument>,

    private readonly walletService: WalletService,
    private readonly stocksService: StocksService,
  ) {}

  async buyStock(buyStockDto: BuyStockDto) {
    const stock = await this.stocksService.findOne(buyStockDto.stockId);

    const totalCost = stock.currentPrice * buyStockDto.quantity;

    const walletResponse = await this.walletService.getWallet(
      buyStockDto.memberId,
    );

    const wallet = walletResponse.data;

    if (wallet.balance < totalCost) {
      throw new BadRequestException('Insufficient wallet balance');
    }

    wallet.balance -= totalCost;
    await wallet.save();

    let portfolioPosition = await this.portfolioModel.findOne({
      memberId: new Types.ObjectId(buyStockDto.memberId),
      stockId: new Types.ObjectId(buyStockDto.stockId),
    });

    if (!portfolioPosition) {
      portfolioPosition = await this.portfolioModel.create({
        memberId: new Types.ObjectId(buyStockDto.memberId),
        stockId: new Types.ObjectId(buyStockDto.stockId),
        quantity: buyStockDto.quantity,
        averagePurchasePrice: stock.currentPrice,
      });
    } else {
      const newQuantity = portfolioPosition.quantity + buyStockDto.quantity;

      const newAveragePrice =
        (portfolioPosition.quantity * portfolioPosition.averagePurchasePrice +
          buyStockDto.quantity * stock.currentPrice) /
        newQuantity;

      portfolioPosition.quantity = newQuantity;

      portfolioPosition.averagePurchasePrice = newAveragePrice;

      await portfolioPosition.save();
    }

    return {
      success: true,
      message: 'Stock purchased successfully',
      data: portfolioPosition,
    };
  }

  async sellStock(sellStockDto: SellStockDto) {
    const stock = await this.stocksService.findOne(sellStockDto.stockId);

    const portfolioPosition = await this.portfolioModel.findOne({
      memberId: new Types.ObjectId(sellStockDto.memberId),
      stockId: new Types.ObjectId(sellStockDto.stockId),
    });

    if (!portfolioPosition) {
      throw new NotFoundException('Portfolio position not found');
    }

    if (portfolioPosition.quantity < sellStockDto.quantity) {
      throw new BadRequestException('Insufficient shares to sell');
    }

    const totalSaleValue = stock.currentPrice * sellStockDto.quantity;

    const profitOrLoss =
      (stock.currentPrice - portfolioPosition.averagePurchasePrice) *
      sellStockDto.quantity;

    const walletResponse = await this.walletService.getWallet(
      sellStockDto.memberId,
    );

    const wallet = walletResponse.data;

    wallet.balance += totalSaleValue;
    await wallet.save();

    portfolioPosition.quantity -= sellStockDto.quantity;

    if (portfolioPosition.quantity === 0) {
      await portfolioPosition.deleteOne();
    } else {
      await portfolioPosition.save();
    }

    return {
      success: true,
      message: 'Stock sold successfully',
      data: {
        soldQuantity: sellStockDto.quantity,
        totalSaleValue,
        profitOrLoss,
      },
    };
  }

  async getPortfolio(memberId: string) {
    const portfolio = await this.portfolioModel
      .find({
        memberId: new Types.ObjectId(memberId),
      })
      .populate('stockId');

    return {
      success: true,
      data: portfolio,
    };
  }
}
