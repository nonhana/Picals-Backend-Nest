import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Favorite } from '../favorite/entities/favorite.entity';
import { History } from '../history/entities/history.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Favorite, History])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
