import { Injectable } from '@nestjs/common';
import { CreateCamppingDto } from './dto/create-campping.dto';
import { UpdateCamppingDto } from './dto/update-campping.dto';

@Injectable()
export class CamppingService {
  create(createCamppingDto: CreateCamppingDto) {
    return 'This action adds a new campping';
  }

  findAll() {
    return `This action returns all campping`;
  }

  findOne(id: number) {
    return `This action returns a #${id} campping`;
  }

  update(id: number, updateCamppingDto: UpdateCamppingDto) {
    return `This action updates a #${id} campping`;
  }

  remove(id: number) {
    return `This action removes a #${id} campping`;
  }
}
