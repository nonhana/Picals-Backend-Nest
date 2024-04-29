import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { CollectRecord } from './entities/collect-record.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import { User } from '../user/entities/user.entity';
import { UserService } from '../user/user.service';
import { LabelService } from '../label/label.service';
import { History } from '../history/entities/history.entity';
import { Label } from '../label/entities/label.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Favorite, CollectRecord, Illustration, User, History, Label]),
	],
	controllers: [FavoriteController],
	providers: [FavoriteService, UserService, LabelService],
	exports: [FavoriteService],
})
export class FavoriteModule {}
