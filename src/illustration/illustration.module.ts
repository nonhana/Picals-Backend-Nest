import { Module } from '@nestjs/common';
import { IllustrationService } from './illustration.service';
import { IllustrationController } from './illustration.controller';

@Module({
  controllers: [IllustrationController],
  providers: [IllustrationService],
})
export class IllustrationModule {}
