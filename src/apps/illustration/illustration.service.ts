import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Illustration } from './entities/illustration.entity';
import { Repository } from 'typeorm';
import { IllustratorService } from '../illustrator/illustrator.service';
import { LabelService } from '../label/label.service';
import { UserService } from '../user/user.service';
import type { UploadIllustrationDto } from './dto/upload-illustration.dto';

@Injectable()
export class IllustrationService {
	@InjectRepository(Illustration)
	private readonly illustrationRepository: Repository<Illustration>;

	@Inject(IllustratorService)
	private readonly illustratorService: IllustratorService;

	@Inject(LabelService)
	private readonly labelService: LabelService;

	@Inject(UserService)
	private readonly userService: UserService;

	async createItem(id: string, uploadIllustrationDto: UploadIllustrationDto) {
		const { labels, illustratorInfo, ...basicInfo } = uploadIllustrationDto;

		const userEntity = await this.userService.getInfo(id);
		const labelsEntity = await this.labelService.createItems(labels);
		const illustratorEntity = await this.illustratorService.createItem(illustratorInfo);

		const illustration = this.illustrationRepository.create({
			...basicInfo,
			user: userEntity,
			labels: labelsEntity,
			illustrator: illustratorEntity,
		});

		return await this.illustrationRepository.save(illustration);
	}
}
