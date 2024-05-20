import { Global, Module } from '@nestjs/common';
import { IllustratorService } from './illustrator.service';
import { IllustratorController } from './illustrator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Illustrator } from './entities/illustrator.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import { UserService } from '../user/user.service';
import { LabelService } from '../label/label.service';
import { FavoriteService } from '../favorite/favorite.service';
import { User } from '../user/entities/user.entity';
import { History } from '../history/entities/history.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { Label } from '../label/entities/label.entity';
import { CollectRecord } from '../favorite/entities/collect-record.entity';

@Global()
@Module({
	imports: [
		TypeOrmModule.forFeature([
			Illustrator,
			Illustration,
			User,
			Favorite,
			History,
			Label,
			CollectRecord,
		]),
	],
	controllers: [IllustratorController],
	providers: [IllustratorService, UserService, LabelService, FavoriteService],
	exports: [IllustratorService],
})
export class IllustratorModule {}
