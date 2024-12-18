import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { CreateCamppingDto } from './dto/create-campping.dto';
import { UpdateCamppingDto } from './dto/update-campping.dto';

@Controller('campping')
export class CamppingController {
  constructor(private readonly camppingService: CamppingService) {}

  @Post()
  create(@Body() createCamppingDto: CreateCamppingDto) {
    return this.camppingService.create(createCamppingDto);
  }

  @Get()
  findAll() {
    return this.camppingService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.camppingService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCamppingDto: UpdateCamppingDto) {
    return this.camppingService.update(+id, updateCamppingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.camppingService.remove(+id);
  }
}
