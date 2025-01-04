import { Inject, Injectable } from '@nestjs/common';
import { CampingService } from './camping.service';
import { ImageService } from 'src/image/image.service';
import { Cron } from '@nestjs/schedule';
import { ICampingService } from './interface/camping.service.interface';

@Injectable()
export class CampingCronHandler {
  constructor(
    @Inject('ICampingService')
    private readonly campingService: ICampingService,
    private readonly imageService: ImageService,
  ) {}
  @Cron('0 0 22 * * *')
  async handleCampingCron() {
    await this.campingService.campingCronHandler();
  }
  @Cron('0 10 22 * * *')
  async handleCampingImageCron(){
    const campings = await this.campingService.findAllForCron();
    for (const camp of campings) {
      await this.imageService.ImageCronHandler(camp.contentId);
    }
  }
}
