import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { CamppingCronHandler } from './capping.cron.provider';

@Controller('campping')
export class CamppingController {
  constructor(private readonly camppingService: CamppingService,
    private readonly camppingCron: CamppingCronHandler
  ) {}
  @Get()
  async handler(){
    return this.camppingCron.handleCron();
  }
}
