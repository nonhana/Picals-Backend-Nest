import { Module } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { IllustrationController } from './illustration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Illustration } from './entities/illustration.entity';
import { LabelService } from '../label/label.service';
import { IllustratorService } from '../illustrator/illustrator.service';
import { Label } from '../label/entities/label.entity';
import { Illustrator } from '../illustrator/entities/illustrator.entity';
import { UserService } from '../user/user.service';
import { User } from '../user/entities/user.entity';
import { History } from '../history/entities/history.entity';
import { WorkPushTemp } from './entities/work-push-temp.entity';
import { FavoriteService } from '../favorite/favorite.service';
import { Favorite } from '../favorite/entities/favorite.entity';
import { CollectRecord } from '../favorite/entities/collect-record.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([
			Illustration,
			WorkPushTemp,
			Label,
			Illustrator,
			User,
			History,
			Favorite,
			CollectRecord,
		]),
	],
	controllers: [IllustrationController],
	providers: [IllustrationService, LabelService, IllustratorService, UserService, FavoriteService],
	exports: [IllustrationService],
})
export class IllustrationModule {}
