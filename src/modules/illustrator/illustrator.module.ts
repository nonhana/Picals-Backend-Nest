import { Global, Module } from '@nestjs/common';
import { IllustratorService } from './illustrator.service';
import { IllustratorController } from './illustrator.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Illustrator } from './entities/illustrator.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import { UserModule } from '../user/user.module';

@Global()
@Module({
	imports: [TypeOrmModule.forFeature([Illustrator, Illustration]), UserModule],
	controllers: [IllustratorController],
	providers: [IllustratorService],
	exports: [IllustratorService],
})
export class IllustratorModule {}
