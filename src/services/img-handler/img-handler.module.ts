import { Global, Module } from '@nestjs/common';
import { ImgHandlerService } from './img-handler.service';
import { ImgHandlerController } from './img-handler.controller';

@Global()
@Module({
	exports: [ImgHandlerService],
	providers: [ImgHandlerService],
	controllers: [ImgHandlerController],
})
export class ImgHandlerModule {}
