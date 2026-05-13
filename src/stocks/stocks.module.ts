import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StocksService } from './stocks.service';
import { StocksController } from './stocks.controller';
import { Stock, StockSchema } from './schemas/stock.schema';
import { JwtConfigModule } from '../common/jwt/jwt-config.module';
import {
  PriceHistory,
  PriceHistorySchema,
} from './schemas/price-history.schema';

@Module({
  imports: [
    JwtConfigModule,
    MongooseModule.forFeature([
      { name: Stock.name, schema: StockSchema },
      { name: PriceHistory.name, schema: PriceHistorySchema },
    ]),
  ],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
