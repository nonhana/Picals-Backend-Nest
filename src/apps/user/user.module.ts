import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { History } from '../history/entities/history.entity';
import { HistoryService } from '../history/history.service';
import { Label } from '../label/entities/label.entity';
import { LabelService } from '../label/label.service';
import { Illustration } from '../illustration/entities/illustration.entity';
import { FavoriteService } from '../favorite/favorite.service';
import { CollectRecord } from '../favorite/entities/collect-record.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, Favorite, History, Label, Illustration, CollectRecord]),
	],
	controllers: [UserController],
	providers: [UserService, HistoryService, LabelService, FavoriteService],
	exports: [UserService],
})
export class UserModule {}
