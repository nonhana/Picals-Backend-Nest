import { Module, forwardRef } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { CollectRecord } from './entities/collect-record.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import { UserModule } from '../user/user.module';
import { User } from '../user/entities/user.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Favorite, CollectRecord, Illustration, User]),
		forwardRef(() => UserModule),
	],
	controllers: [FavoriteController],
	providers: [FavoriteService],
	exports: [FavoriteService],
})
export class FavoriteModule {}
