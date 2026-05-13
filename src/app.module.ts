import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { MembersModule } from './members/members.module';
import { CmsUsersModule } from './cms-users/cms-users.module';
import { StocksModule } from './stocks/stocks.module';
import { WalletModule } from './wallet/wallet.module';
import { OrdersModule } from './orders/orders.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AuditLogsModule } from './audit-logs/audit-logs.module';
import { PriceAlertsModule } from './price-alerts/price-alerts.module';
import { ScheduleModule } from '@nestjs/schedule';
import { SystemAlertsModule } from './system-alerts/system-alerts.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    AuthModule,
    MembersModule,
    CmsUsersModule,
    StocksModule,
    WalletModule,
    OrdersModule,
    PortfolioModule,
    NotificationsModule,
    AnalyticsModule,
    AuditLogsModule,
    PriceAlertsModule,
    ScheduleModule.forRoot(),
    SystemAlertsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
