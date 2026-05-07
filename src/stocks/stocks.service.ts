import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { CreateStockDto } from './dto/create-stock.dto';
import { Stock, StockDocument } from './schemas/stock.schema';

@Injectable()
export class StocksService {
  constructor(
    @InjectModel(Stock.name)
    private readonly stockModel: Model<StockDocument>,
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
}
