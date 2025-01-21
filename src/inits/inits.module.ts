import { Module } from '@nestjs/common';
import { InitsService } from './inits.service';
import { InitsController } from './inits.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Illustration } from '@/apps/illustration/entities/illustration.entity';
import { Illustrator } from '@/apps/illustrator/entities/illustrator.entity';
import { User } from '@/apps/user/entities/user.entity';
import { Image } from '@/apps/illustration/entities/image.entity';
import { UserModule } from '@/apps/user/user.module';
import { LabelModule } from '@/apps/label/label.module';
import { IllustratorModule } from '@/apps/illustrator/illustrator.module';

@Module({
	imports: [
		TypeOrmModule.forFeature([Illustration, Illustrator, User, Image]),
		UserModule,
		LabelModule,
		IllustratorModule,
	],
	controllers: [InitsController],
	providers: [InitsService],
})
export class InitsModule {}
