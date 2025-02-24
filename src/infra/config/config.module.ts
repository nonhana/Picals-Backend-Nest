import { Module } from '@nestjs/common';
import { ConfigModule as configModule } from '@nestjs/config';

@Module({
	imports: [configModule.forRoot({ isGlobal: true })],
})
export class ConfigModule {}
