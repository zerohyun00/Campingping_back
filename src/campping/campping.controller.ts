import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { CamppingCronHandler } from './capping.cron.provider';
import { CamppingParamDto } from './dto/find-campping-param.dto';

@Controller('camppings')
export class CamppingController {
  constructor(private readonly camppingService: CamppingService,
    private readonly camppingCron: CamppingCronHandler
  ) {}
  @Get()
  async handler(){
    return await this.camppingCron.handleCron();
  }
  @Get('map')
  async findNearbyCampping(  
    @Query('lat') lat: number,
    @Query('lon') lon: number,){
    return await this.camppingService.findNearbyCampping(lon, lat)
  }
  @Get('list')
  async findCampping(){
    return await this.camppingService.findAll();
  }
  @Get('/list/:id')
  async findOneCampping(@Param() paramDto: CamppingParamDto){
    return await this.camppingService.findOne(paramDto);
  }
}
