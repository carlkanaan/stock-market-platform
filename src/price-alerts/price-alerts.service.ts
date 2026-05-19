import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';

import { CreatePriceAlertDto } from './dto/create-price-alert.dto';

import { PriceAlert, PriceAlertDocument } from './schemas/price-alert.schema';

@Injectable()
export class PriceAlertsService {
  constructor(
    @InjectModel(PriceAlert.name)
    private readonly priceAlertModel: Model<PriceAlertDocument>,
  ) {}
  //price alert creation
  async create(createPriceAlertDto: CreatePriceAlertDto) {
    const alert = await this.priceAlertModel.create({
      memberId: new Types.ObjectId(createPriceAlertDto.memberId),
      stockId: new Types.ObjectId(createPriceAlertDto.stockId),
      targetPrice: createPriceAlertDto.targetPrice,
      direction: createPriceAlertDto.direction,
    });

    return {
      success: true,
      message: 'Price alert created successfully',
      data: alert,
    };
  }
  //displpay member alerts
  async findMemberAlerts(memberId: string) {
    const alerts = await this.priceAlertModel
      .find({
        memberId: new Types.ObjectId(memberId),
      })
      .populate('stockId')
      .sort({ createdAt: -1 });

    return {
      success: true,
      data: alerts,
    };
  }
}
