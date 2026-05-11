import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { AnalyticsController } from './analytics.controller';
import { AnalyticsService } from './analytics.service';

import { Order, OrderSchema } from '../orders/schemas/order.schema';
import { Stock, StockSchema } from '../stocks/schemas/stock.schema';
import { Wallet, WalletSchema } from '../wallet/schemas/wallet.schema';
import {
  Portfolio,
  PortfolioSchema,
} from '../portfolio/schemas/portfolio.schema';
import { Member, MemberSchema } from '../members/schemas/member.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: Stock.name, schema: StockSchema },
      { name: Wallet.name, schema: WalletSchema },
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
