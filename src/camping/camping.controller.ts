import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { CampingService } from './camping.service';
import { CampingCronHandler } from './camping.cron.provider';
import { CampingParamDto } from './dto/find-camping-param.dto';

@Controller('campings')
export class CampingController {
  constructor(
    private readonly campingService: CampingService,
    private readonly campingCron: CampingCronHandler,
  ) {}
  @Get()
  async handler() {
    return await this.campingCron.handleCron();
  }
  @Get('map')
  async findNearbycamping(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
  ) {
    return await this.campingService.findNearbycamping(lon, lat);
  }
  @Get('lists')
  async findCamping(
    @Query('region') region?: string,
    @Query('category') category?: string,
  ) {
    return await this.campingService.findAllWithDetails(region, category);
  }
  @Get('/lists/:contentId')
  async findOnecamping(@Param() paramDto: CampingParamDto) {
    console.log(paramDto);
    return await this.campingService.findOne(paramDto);
  }
}
