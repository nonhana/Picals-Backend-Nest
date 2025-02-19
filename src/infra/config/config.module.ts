import { Global, Module } from '@nestjs/common';
import { ConfigModule as configModule } from '@nestjs/config';

@Global()
@Module({
	imports: [configModule.forRoot({ isGlobal: true })],
})
export class ConfigModule {}
