import { Module, forwardRef } from '@nestjs/common';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Label } from './entities/label.entity';
import { Illustration } from '../illustration/entities/illustration.entity';
import { UserModule } from '../user/user.module';

@Module({
	imports: [TypeOrmModule.forFeature([Label, Illustration]), forwardRef(() => UserModule)],
	controllers: [LabelController],
	providers: [LabelService],
	exports: [LabelService],
})
export class LabelModule {}
