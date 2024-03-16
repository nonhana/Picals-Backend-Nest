import { Injectable } from '@nestjs/common';
import { CreateIllustrationDto } from './dto/create-illustration.dto';
import { UpdateIllustrationDto } from './dto/update-illustration.dto';

@Injectable()
export class IllustrationService {
  create(createIllustrationDto: CreateIllustrationDto) {
    return 'This action adds a new illustration';
  }

  findAll() {
    return `This action returns all illustration`;
  }

  findOne(id: number) {
    return `This action returns a #${id} illustration`;
  }

  update(id: number, updateIllustrationDto: UpdateIllustrationDto) {
    return `This action updates a #${id} illustration`;
  }

  remove(id: number) {
    return `This action removes a #${id} illustration`;
  }
}
