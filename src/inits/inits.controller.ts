import { Controller, Inject, Post } from '@nestjs/common';
import { InitsService } from './inits.service';

@Controller('inits')
export class InitsController {
	@Inject(InitsService)
	private readonly initsService: InitsService;

	@Post('database')
	async initDatabase() {
		await this.initsService.mock();
	}
}
