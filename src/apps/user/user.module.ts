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

@Module({
	imports: [TypeOrmModule.forFeature([User, Favorite, History, Label])],
	controllers: [UserController],
	providers: [UserService, HistoryService, LabelService],
	exports: [UserService],
})
export class UserModule {}
