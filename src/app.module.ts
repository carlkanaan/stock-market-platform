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
import * as Joi from 'joi'; //implemented Joi to validate configuration values and request schemas.
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler'; //throttlerguward implemented for rate limiting
import { RedisCacheModule } from './cache/redis-cache.module'; //redis caching

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: Joi.object({
        PORT: Joi.number().default(3000),
        MONGO_URI: Joi.string().required(),
        JWT_SECRET: Joi.string().required(),
        JWT_EXPIRES_IN: Joi.string().default('1d'),
        OTP_TTL_MINUTES: Joi.number().default(10),
        THROTTLE_TTL_SECONDS: Joi.number().default(60),
        THROTTLE_LIMIT: Joi.number().default(10),
      }),
    }),

    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
    }),

    ThrottlerModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        throttlers: [
          {
            ttl: configService.get<number>('THROTTLE_TTL_SECONDS') ?? 60,
            limit: configService.get<number>('THROTTLE_LIMIT') ?? 10,
          },
        ],
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
    RedisCacheModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
