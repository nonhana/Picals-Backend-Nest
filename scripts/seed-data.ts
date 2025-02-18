import { NestFactory } from '@nestjs/core';
import { InitsModule } from '@/modules/inits/inits.module';
import { InitsService } from '@/modules/inits/inits.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(InitsModule);
	const initService = app.get(InitsService);

	await initService.mock();
	await app.close();
}

bootstrap().catch((err) => {
	console.error('Error seeding test data:', err);
	process.exit(1);
});
