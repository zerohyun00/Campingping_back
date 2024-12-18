import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CamppingService } from './campping.service';

@Controller('campping')
export class CamppingController {
  constructor(private readonly camppingService: CamppingService) {}
  @Get()
  async handler(){
    return this.camppingService.CamppingCronHandler();
  }
}
