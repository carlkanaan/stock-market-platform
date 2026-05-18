import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from 'cache-manager';

@Injectable()
// centralized Redis cache helper service'
export class RedisCacheService {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async get<T>(key: string): Promise<T | null> {
    return (await this.cacheManager.get<T>(key)) ?? null;
  }

  async set(key: string, value: unknown, ttl?: number) {
    await this.cacheManager.set(key, value, ttl);
  }

  async del(key: string) {
    await this.cacheManager.del(key);
  }
}
