import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreateStockDto } from './dto/create-stock.dto';
import { Stock, StockDocument } from './schemas/stock.schema';
import { UpdateStockDto } from './dto/update-stock.dto';
import {
  PriceHistory,
  PriceHistoryDocument,
} from './schemas/price-history.schema';
import { EmailService } from '../notifications/email.service';
import {
  PriceAlert,
  PriceAlertDocument,
  AlertDirection,
} from '../price-alerts/schemas/price-alert.schema';

import { Member, MemberDocument } from '../members/schemas/member.schema';

@Injectable()
// Creates a stock listing and prevents duplicate tickers
export class StocksService {
  constructor(
    @InjectModel(Stock.name)
    private readonly stockModel: Model<StockDocument>,

    @InjectModel(PriceHistory.name)
    private readonly priceHistoryModel: Model<PriceHistoryDocument>,

    @InjectModel(PriceAlert.name)
    private readonly priceAlertModel: Model<PriceAlertDocument>,

    @InjectModel(Member.name)
    private readonly memberModel: Model<MemberDocument>,

    private readonly emailService: EmailService,
  ) {}

  async create(createStockDto: CreateStockDto) {
    const existingStock = await this.stockModel.findOne({
      ticker: createStockDto.ticker.toUpperCase(),
    });

    if (existingStock) {
      throw new ConflictException('Stock ticker already exists');
    }

    const stock = await this.stockModel.create({
      ...createStockDto,
      ticker: createStockDto.ticker.toUpperCase(),
    });

    return {
      success: true,
      message: 'Stock created successfully',
      data: stock,
    };
  }

  async findAll() {
    const stocks = await this.stockModel.find().sort({ ticker: 1 });

    return {
      success: true,
      data: stocks,
    };
  }

  async findOne(id: string) {
    const stock = await this.stockModel.findById(id);

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    return stock;
  }

  async update(id: string, updateStockDto: UpdateStockDto) {
    const stock = await this.stockModel.findById(id);

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    const priceChanged =
      updateStockDto.currentPrice !== undefined &&
      updateStockDto.currentPrice !== stock.currentPrice;

    Object.assign(stock, updateStockDto);

    await stock.save();

    if (priceChanged) {
      await this.priceHistoryModel.create({
        stockId: new Types.ObjectId(id),
        price: stock.currentPrice,
        recordedAt: new Date(),
      });
    }
    const alerts = await this.priceAlertModel.find({
      stockId: stock._id,
    });

    for (const alert of alerts) {
      const shouldTrigger =
        (alert.direction === AlertDirection.ABOVE &&
          stock.currentPrice >= alert.targetPrice) ||
        (alert.direction === AlertDirection.BELOW &&
          stock.currentPrice <= alert.targetPrice);

      if (shouldTrigger) {
        const member = await this.memberModel.findById(alert.memberId);

        if (member) {
          await this.emailService.sendPriceAlertEmail(
            member.email,
            stock.companyName,
            stock.currentPrice,
            alert.targetPrice,
          );
        }
      }
    }

    return {
      success: true,
      message: 'Stock updated successfully',
      data: stock,
    };
  }

  async delist(id: string) {
    const stock = await this.stockModel.findById(id);

    if (!stock) {
      throw new NotFoundException('Stock not found');
    }

    stock.isListed = false;
    await stock.save();

    return {
      success: true,
      message: 'Stock delisted successfully',
      data: stock,
    };
  }

  async getPriceHistory(id: string) {
    const history = await this.priceHistoryModel
      .find({ stockId: new Types.ObjectId(id) })
      .sort({ recordedAt: 1 });

    return {
      success: true,
      data: history,
    };
  }
}
