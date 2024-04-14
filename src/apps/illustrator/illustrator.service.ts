import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Illustrator } from './entities/illustrator.entity';
import { Repository } from 'typeorm';
import type { NewIllustratorDto } from './dto/new-illustrator.dto';

@Injectable()
export class IllustratorService {
  @InjectRepository(Illustrator)
  private readonly illustratorRepository: Repository<Illustrator>;

  async findItemById(id: string) {
    return await this.illustratorRepository.findOne({ where: { id } });
  }

  async findItemByName(name: string) {
    return await this.illustratorRepository.findOne({ where: { name } });
  }

  async createItem(newIllustratorDto: NewIllustratorDto) {
    const existedIllustrator = await this.findItemByName(
      newIllustratorDto.name,
    );
    if (existedIllustrator) return existedIllustrator;
    return await this.illustratorRepository.save(newIllustratorDto);
  }
}
