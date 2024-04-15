import { Global, Module } from '@nestjs/common';
import { IllustratorService } from './illustrator.service';
import { IllustratorController } from './illustrator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Illustrator } from './entities/illustrator.entity';

@Global()
@Module({
	imports: [TypeOrmModule.forFeature([Illustrator])],
	controllers: [IllustratorController],
	providers: [IllustratorService],
	exports: [IllustratorService],
})
export class IllustratorModule {}
