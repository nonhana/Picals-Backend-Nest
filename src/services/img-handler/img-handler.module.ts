import { Global, Module } from '@nestjs/common';
import { ImgHandlerService } from './img-handler.service';
import { R2Module } from '@/infra/r2/r2.module';
import { ImgHandlerController } from './img-handler.controller';

@Global()
@Module({
	exports: [ImgHandlerService],
	imports: [R2Module],
	providers: [ImgHandlerService],
	controllers: [ImgHandlerController],
})
export class ImgHandlerModule {}
