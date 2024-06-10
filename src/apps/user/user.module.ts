import { Module, forwardRef } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { History } from '../history/entities/history.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import { EmailModule } from 'src/email/email.module';
import { LabelModule } from '../label/label.module';
import { FavoriteModule } from '../favorite/favorite.module';
import { WorkPushTemp } from '../illustration/entities/work-push-temp.entity';

@Module({
	imports: [
		TypeOrmModule.forFeature([User, History, Illustration, Favorite, WorkPushTemp]),
		EmailModule,
		forwardRef(() => LabelModule),
		forwardRef(() => FavoriteModule),
	],
	controllers: [UserController],
	providers: [UserService],
	exports: [UserService],
})
export class UserModule {}
