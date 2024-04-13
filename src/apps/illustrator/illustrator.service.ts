import { Injectable } from '@nestjs/common';
import { CreateIllustratorDto } from './dto/create-illustrator.dto';
import { UpdateIllustratorDto } from './dto/update-illustrator.dto';

@Injectable()
export class IllustratorService {
  create(createIllustratorDto: CreateIllustratorDto) {
    return 'This action adds a new illustrator';
  }

  findAll() {
    return `This action returns all illustrator`;
  }

  findOne(id: number) {
    return `This action returns a #${id} illustrator`;
  }

  update(id: number, updateIllustratorDto: UpdateIllustratorDto) {
    return `This action updates a #${id} illustrator`;
  }

  remove(id: number) {
    return `This action removes a #${id} illustrator`;
  }
}
