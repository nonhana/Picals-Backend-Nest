import { Module } from '@nestjs/common';
import { IllustratorService } from './illustrator.service';
import { IllustratorController } from './illustrator.controller';

@Module({
  controllers: [IllustratorController],
  providers: [IllustratorService],
})
export class IllustratorModule {}
