import { Module } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { IllustrationController } from './illustration.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Illustration } from './entities/illustration.entity';
import { Illustrator } from '../illustrator/entities/illustrator.entity';
import { User } from '../user/entities/user.entity';
import { WorkPushTemp } from './entities/work-push-temp.entity';
import { Image } from './entities/image.entity';
import { UserModule } from '../user/user.module';
import { LabelModule } from '../label/label.module';
import { IllustratorModule } from '../illustrator/illustrator.module';
import { Favorite } from '../favorite/entities/favorite.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([Illustration, WorkPushTemp, Illustrator, User, Favorite, Image]),
		UserModule,
		LabelModule,
		IllustratorModule,
	],
	controllers: [IllustrationController],
	providers: [IllustrationService],
	exports: [IllustrationService],
})
export class IllustrationModule {}
