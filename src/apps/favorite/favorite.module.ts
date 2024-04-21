import { Module } from '@nestjs/common';
import { FavoriteService } from './favorite.service';
import { FavoriteController } from './favorite.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Favorite } from './entities/favorite.entity';
import { CollectRecord } from './entities/collect-record.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Favorite, CollectRecord])],
	controllers: [FavoriteController],
	providers: [FavoriteService],
	exports: [FavoriteService],
})
export class FavoriteModule {}
