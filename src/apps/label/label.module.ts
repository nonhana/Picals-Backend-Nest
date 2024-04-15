import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';

@Module({
	imports: [TypeOrmModule.forFeature([Label])],
	controllers: [LabelController],
	providers: [LabelService],
	exports: [LabelService],
})
export class LabelModule {}
