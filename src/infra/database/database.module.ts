import { CollectRecord } from '@/modules/favorite/entities/collect-record.entity';
import { Favorite } from '@/modules/favorite/entities/favorite.entity';
import { Illustration } from '@/modules/illustration/entities/illustration.entity';
import { WorkPushTemp } from '@/modules/illustration/entities/work-push-temp.entity';
import { Illustrator } from '@/modules/illustrator/entities/illustrator.entity';
import { Label } from '@/modules/label/entities/label.entity';
import { Follow } from '@/modules/user/entities/follow.entity';
import { LikeWorks } from '@/modules/user/entities/like-works.entity';
import { User } from '@/modules/user/entities/user.entity';
import { Comment } from '@/modules/comment/entities/comment.entity';
import { History } from '@/modules/history/entities/history.entity';
import { Image } from '@/modules/illustration/entities/image.entity';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
	imports: [
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
	],
})
export class DatabaseModule {}
