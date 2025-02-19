import { NestFactory } from '@nestjs/core';
import { ScriptsModule } from '@/modules/scripts/scripts.module';
import { ScriptsService } from '@/modules/scripts/scripts.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(ScriptsModule);
	const ScriptService = app.get(ScriptsService);

	await ScriptService.mock();
	await app.close();
}

bootstrap().catch((err) => {
	console.error('Error seeding test data:', err);
	process.exit(1);
});
