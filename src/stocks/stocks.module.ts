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
import { NotificationsModule } from '../notifications/notifications.module';
import { Member, MemberSchema } from '../members/schemas/member.schema';
import {
  PriceAlert,
  PriceAlertSchema,
} from '../price-alerts/schemas/price-alert.schema';

import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    JwtConfigModule,
    NotificationsModule,
    EventsModule,
    MongooseModule.forFeature([
      { name: Stock.name, schema: StockSchema },
      { name: PriceHistory.name, schema: PriceHistorySchema },
      { name: PriceAlert.name, schema: PriceAlertSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  controllers: [StocksController],
  providers: [StocksService],
  exports: [StocksService],
})
export class StocksModule {}
