import { NestFactory } from '@nestjs/core';
import { ScriptsModule } from '@/modules/scripts/scripts.module';
import { ScriptsService } from '@/modules/scripts/scripts.service';

async function bootstrap() {
	const app = await NestFactory.createApplicationContext(ScriptsModule);
	const scriptsService = app.get(ScriptsService);

	let targetDir = '';
	let email = '';

	// 从命令行参数中获取目标目录和用户邮箱
	if (process.argv.length > 2) {
		targetDir = process.argv[2];
	}
	if (process.argv.length > 3) {
		email = process.argv[3];
	}

	await scriptsService.uploadDir(targetDir, email);
	await app.close();
}

bootstrap().catch((err) => {
	console.error('Error seeding test data:', err);
	process.exit(1);
});
