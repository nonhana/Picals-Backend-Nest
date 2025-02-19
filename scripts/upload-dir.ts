import { NestFactory } from '@nestjs/core';
import { ScriptsModule } from '@/services/scripts/scripts.module';
import { ScriptsService } from '@/services/scripts/scripts.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(ScriptsModule);
	const scriptsService = app.get(ScriptsService);

	const [uploadPath, email] = process.argv.slice(2);

	await scriptsService.uploadDir(uploadPath, email);
	await app.close();
}

bootstrap().catch((err) => {
	console.error('Error seeding test data:', err);
	process.exit(1);
});
