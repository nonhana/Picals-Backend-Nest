import { Global, Module } from '@nestjs/common';
import { CosService } from './cos.service';

@Global()
@Module({
	providers: [CosService],
	exports: [CosService],
})
export class CosModule {}
