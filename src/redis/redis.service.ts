import { Inject, Injectable } from '@nestjs/common';
import type { RedisClientType } from 'redis';

@Injectable()
export class RedisService {
  @Inject('REDIS_CLIENT')
  private readonly redisClient: RedisClientType;

  /**
   * @description 获取redis缓存
   * @param key 缓存key
   */
  async get(key: string) {
    return await this.redisClient.get(key);
  }

  /**
   * @description 设置redis缓存
   * @param key 缓存key
   * @param value 缓存值
   * @param ttl 过期时间
   */
  async set(key: string, value: string | number, ttl?: number) {
    await this.redisClient.set(key, value);
    if (ttl) {
      await this.redisClient.expire(key, ttl);
    }
  }

  /**
   * @description ；主动删除redis缓存
   * @param key 缓存key
   */
  async del(key: string) {
    await this.redisClient.del(key);
  }
}
