import { Global, Module } from '@nestjs/common';
import { R2Service } from './r2.service';
import { R2Controller } from './r2.controller';

@Global()
@Module({
	providers: [R2Service],
	exports: [R2Service],
	controllers: [R2Controller],
})
export class R2Module {}
