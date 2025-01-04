import { Inject, Injectable } from '@nestjs/common';
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
  @Cron('0 0 22 * * *', { timeZone: 'Asia/Seoul' })
  async handleCampingCron() {
    console.log('CampingCron started');
    try {
      await this.campingService.campingCronHandler();
      console.log('CampingCron completed successfully');
    } catch (error) {
      console.error('Error in CampingCron', error.stack);
    }
  }
  
  @Cron('0 20 22 * * *', { timeZone: 'Asia/Seoul' })
  async handleCampingImageCron() {
    console.log('CampingImageCron started');
    try {
      const campings = await this.campingService.findAllForCron();
      for (const camp of campings) {
        await this.imageService.ImageCronHandler(camp.contentId);
      }
      console.log('CampingImageCron completed successfully');
    } catch (error) {
      console.error('Error in CampingImageCron', error.stack);
    }
  }
}
