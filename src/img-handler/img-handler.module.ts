import { Global, Module } from '@nestjs/common';
import { ImgHandlerService } from './img-handler.service';
import { R2Module } from 'src/r2/r2.module';

@Global()
@Module({
	exports: [ImgHandlerService],
	imports: [R2Module],
	providers: [ImgHandlerService],
})
export class ImgHandlerModule {}
