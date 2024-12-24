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

@Controller('camppings')
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
  async findNearbyCampping(
    @Query('lat') lat: number,
    @Query('lon') lon: number,
  ) {
    return await this.campingService.findNearbyCampping(lon, lat);
  }
  @Get('lists')
  async findCampping() {
    return await this.campingService.findAllWithDetails();
  }
  @Get('/lists/:contentId')
  async findOneCampping(@Param() paramDto: CampingParamDto) {
    console.log(paramDto);
    return await this.campingService.findOne(paramDto);
  }
}
