import { Module } from '@nestjs/common';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';

@Module({
  controllers: [LabelController],
  providers: [LabelService],
})
export class LabelModule {}
