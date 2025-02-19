import { Module } from '@nestjs/common';
import { ScriptsService } from './scripts.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '@/modules/user/entities/user.entity';
import { Illustrator } from '@/modules/illustrator/entities/illustrator.entity';
import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import { Label } from '@/modules/label/entities/label.entity';
import { History } from '@/modules/history/entities/history.entity';
import { Comment } from '@/modules/comment/entities/comment.entity';
import { Favorite } from '@/modules/favorite/entities/favorite.entity';
import { WorkPushTemp } from '@/modules/illustration/entities/work-push-temp.entity';
import { CollectRecord } from '@/modules/favorite/entities/collect-record.entity';
import { LikeWorks } from '@/modules/user/entities/like-works.entity';
import { Follow } from '@/modules/user/entities/follow.entity';
import { Image } from '@/modules/illustration/entities/image.entity';
import { UserModule } from '@/modules/user/user.module';
import { LabelModule } from '@/modules/label/label.module';
import { IllustratorModule } from '@/modules/illustrator/illustrator.module';
import { IllustrationModule } from '@/modules/illustration/illustration.module';
import { R2Module } from '@/infra/r2/r2.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { CacheModule } from '@nestjs/cache-manager';
import { createKeyv, type RedisClientOptions } from '@keyv/redis';
import { JwtModule } from '@nestjs/jwt';

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
		TypeOrmModule.forFeature([Illustration, Illustrator, User, Image]),
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
		UserModule,
		LabelModule,
		IllustratorModule,
		IllustrationModule,
		R2Module,
	],
	providers: [ScriptsService],
})
export class ScriptsModule {}
