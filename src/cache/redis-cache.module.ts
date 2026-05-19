import { CacheModule } from '@nestjs/cache-manager';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

import { RedisCacheService } from './redis-cache.service';

// Global cache module with configurable TTL support for usage at app-wide level
@Global()
@Module({
  imports: [
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        ttl: (configService.get<number>('CACHE_TTL_SECONDS') ?? 60) * 1000, //1 min
      }),
      isGlobal: true,
    }),
  ],
  providers: [RedisCacheService],
  exports: [RedisCacheService],
})
export class RedisCacheModule {}
