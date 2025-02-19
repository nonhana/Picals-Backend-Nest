import { Global, Module } from '@nestjs/common';
import type { RedisClientOptions } from 'redis';
import { createKeyv } from '@keyv/redis';
import { CacheModule as cacheModule } from '@nestjs/cache-manager';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
	imports: [
		cacheModule.registerAsync<RedisClientOptions>({
			isGlobal: true,
			useFactory: async (configService: ConfigService) => {
				return {
					stores: [
						createKeyv({
							socket: {
								host: configService.get('REDIS_HOST'),
								port: configService.get('REDIS_PORT'),
							},
							database: configService.get('REDIS_DB'),
						}),
					],
				};
			},
			inject: [ConfigService],
		}),
	],
})
export class CacheModule {}
