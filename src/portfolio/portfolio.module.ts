import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { Portfolio, PortfolioSchema } from './schemas/portfolio.schema';

import { WalletModule } from '../wallet/wallet.module';
import { StocksModule } from '../stocks/stocks.module';
import { OrdersModule } from '../orders/orders.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { Member, MemberSchema } from '../members/schemas/member.schema';
import { EventsModule } from '../events/events.module';

@Module({
  imports: [
    WalletModule,
    StocksModule,
    OrdersModule,
    NotificationsModule,
    EventsModule,
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
      { name: Member.name, schema: MemberSchema },
    ]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
