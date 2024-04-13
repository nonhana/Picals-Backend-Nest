import { Global, Module } from '@nestjs/common';
import { RedisService } from './redis.service';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    RedisService,
    {
      provide: 'REDIS_CLIENT',
      async useFactory(consfigService: ConfigService) {
        const client = createClient({
          socket: {
            host: consfigService.get('REDIS_SERVER_HOST'),
            port: consfigService.get('REDIS_SERVER_PORT'),
          },
          database: consfigService.get('REDIS_DB'),
        });
        await client.connect();
        return client;
      },
      inject: [ConfigService],
    },
  ],
  exports: [RedisService],
})
export class RedisModule {}
