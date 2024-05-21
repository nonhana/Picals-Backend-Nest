import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ErrorFilter } from './error/error.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './apps/user/user.module';
import { User } from './apps/user/entities/user.entity';
import { IllustratorModule } from './apps/illustrator/illustrator.module';
import { Illustrator } from './apps/illustrator/entities/illustrator.entity';
import { IllustrationModule } from './apps/illustration/illustration.module';
import { Illustration } from './apps/illustration/entities/illustration.entity';
import { LabelModule } from './apps/label/label.module';
import { Label } from './apps/label/entities/label.entity';
import { CommentModule } from './apps/comment/comment.module';
import { HistoryModule } from './apps/history/history.module';
import { FavoriteModule } from './apps/favorite/favorite.module';
import { History } from './apps/history/entities/history.entity';
import { Comment } from './apps/comment/entities/comment.entity';
import { AuthGuard } from './guards/auth.guard';
import { EmailModule } from './email/email.module';
import type { RedisClientOptions } from 'redis';
import { redisStore } from 'cache-manager-redis-yet';
import { CacheModule } from '@nestjs/cache-manager';
import { Favorite } from './apps/favorite/entities/favorite.entity';
import { WorkPushTemp } from './apps/illustration/entities/work-push-temp.entity';
import { CollectRecord } from './apps/favorite/entities/collect-record.entity';
import { InvokeRecordInterceptor } from './interceptors/invoke-record.interceptor';
import { AppController } from './app.controller';
import { CosService } from './cos/cos.service';
import { CosModule } from './cos/cos.module';
import * as path from 'node:path';

@Module({
	imports: [
		ConfigModule.forRoot({
			isGlobal: true,
			// envFilePath: path.join(__dirname, '.env'),
			envFilePath: 'src/.env',
		}),
		TypeOrmModule.forRootAsync({
			useFactory(configService: ConfigService) {
				return {
					type: 'mysql',
					host: configService.get('MYSQL_HOST'),
					port: configService.get('MYSQL_PORT'),
					username: configService.get('MYSQL_USER'),
					password: configService.get('MYSQL_PASS'),
					database: configService.get('MYSQL_DB'),
					synchronize: true,
					logging: false,
					entities: [
						User,
						Illustrator,
						Illustration,
						Label,
						Comment,
						History,
						Favorite,
						WorkPushTemp,
						CollectRecord,
					],
					poolSize: 10,
					connectorPackage: 'mysql2',
					extra: {
						authPlugin: 'sha256_password',
					},
				};
			},
			inject: [ConfigService],
		}),
		JwtModule.registerAsync({
			global: true,
			useFactory(configService: ConfigService) {
				return {
					secret: configService.get('JWT_SECRET'),
					signOptions: {
						expiresIn: configService.get('JWT_ACCESS_TOKEN_EXPIRES_TIME'),
					},
				};
			},
			inject: [ConfigService],
		}),
		CacheModule.registerAsync<RedisClientOptions>({
			isGlobal: true,
			useFactory(configService: ConfigService) {
				return {
					store: async () =>
						await redisStore({
							socket: {
								host: configService.get('REDIS_HOST'),
								port: configService.get('REDIS_PORT'),
							},
							database: configService.get('REDIS_DB'),
						}),
				};
			},
			inject: [ConfigService],
		}),
		UserModule,
		IllustratorModule,
		IllustrationModule,
		LabelModule,
		CommentModule,
		HistoryModule,
		EmailModule,
		FavoriteModule,
		CosModule,
	],
	providers: [
		// 全局错误过滤器
		{
			provide: APP_FILTER,
			useClass: ErrorFilter,
		},
		// 全局拦截器，统一返回格式
		{
			provide: APP_INTERCEPTOR,
			useClass: ResponseInterceptor,
		},
		// 全局拦截器，用于记录日志
		{
			provide: APP_INTERCEPTOR,
			useClass: InvokeRecordInterceptor,
		},
		// 全局管道，验证数据
		{
			provide: APP_PIPE,
			useClass: ValidationPipe,
		},
		// 全局守卫
		{
			provide: APP_GUARD,
			useClass: AuthGuard,
		},
		CosService,
	],
	controllers: [AppController],
})
export class AppModule {}
