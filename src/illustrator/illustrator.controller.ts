import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { IllustratorService } from './illustrator.service';
import { CreateIllustratorDto } from './dto/create-illustrator.dto';
import { UpdateIllustratorDto } from './dto/update-illustrator.dto';

@Controller('illustrator')
export class IllustratorController {
  constructor(private readonly illustratorService: IllustratorService) {}

  @Post()
  create(@Body() createIllustratorDto: CreateIllustratorDto) {
    return this.illustratorService.create(createIllustratorDto);
  }

  @Get()
  findAll() {
    return this.illustratorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.illustratorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateIllustratorDto: UpdateIllustratorDto) {
    return this.illustratorService.update(+id, updateIllustratorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.illustratorService.remove(+id);
  }
}
