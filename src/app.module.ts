import { Module, ValidationPipe } from '@nestjs/common';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { ErrorFilter } from './error/error.filter';
import { ResponseInterceptor } from './interceptors/response.interceptor';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './modules/user/user.module';
import { User } from './modules/user/entities/user.entity';
import { IllustratorModule } from './modules/illustrator/illustrator.module';
import { Illustrator } from './modules/illustrator/entities/illustrator.entity';
import { IllustrationModule } from './modules/illustration/illustration.module';
import { Illustration } from './modules/illustration/entities/illustration.entity';
import { LabelModule } from './modules/label/label.module';
import { Label } from './modules/label/entities/label.entity';
import { CommentModule } from './modules/comment/comment.module';
import { HistoryModule } from './modules/history/history.module';
import { FavoriteModule } from './modules/favorite/favorite.module';
import { History } from './modules/history/entities/history.entity';
import { Comment } from './modules/comment/entities/comment.entity';
import { AuthGuard } from './guards/auth.guard';
import { EmailModule } from './email/email.module';
import type { RedisClientOptions } from 'redis';
import { createKeyv } from '@keyv/redis';
import { CacheModule } from '@nestjs/cache-manager';
import { Favorite } from './modules/favorite/entities/favorite.entity';
import { WorkPushTemp } from './modules/illustration/entities/work-push-temp.entity';
import { CollectRecord } from './modules/favorite/entities/collect-record.entity';
import { InvokeRecordInterceptor } from './interceptors/invoke-record.interceptor';
import { AppController } from './app.controller';
import { R2Service } from './r2/r2.service';
import { R2Module } from './r2/r2.module';
import { ImgHandlerModule } from './img-handler/img-handler.module';
import { LikeWorks } from './modules/user/entities/like-works.entity';
import { Follow } from './modules/user/entities/follow.entity';
import { Image } from './modules/illustration/entities/image.entity';

@Module({
	imports: [
		ConfigModule.forRoot({ isGlobal: true }),
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
						LikeWorks,
						Follow,
						Image,
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
		UserModule,
		IllustratorModule,
		IllustrationModule,
		LabelModule,
		CommentModule,
		HistoryModule,
		EmailModule,
		FavoriteModule,
		R2Module,
		ImgHandlerModule,
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
		R2Service,
	],
	controllers: [AppController],
})
export class AppModule {}
