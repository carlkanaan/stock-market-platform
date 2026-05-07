import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { PortfolioController } from './portfolio.controller';
import { PortfolioService } from './portfolio.service';
import { Portfolio, PortfolioSchema } from './schemas/portfolio.schema';
import { WalletModule } from '../wallet/wallet.module';
import { StocksModule } from '../stocks/stocks.module';

@Module({
  imports: [
    WalletModule,
    StocksModule,
    MongooseModule.forFeature([
      { name: Portfolio.name, schema: PortfolioSchema },
    ]),
  ],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
