import { Inject, Injectable } from '@nestjs/common';
import { ImageService } from 'src/image/image.service';
import { Cron } from '@nestjs/schedule';
import { ICampingService } from './interface/camping.service.interface';
import { Logger } from '@nestjs/common';

@Injectable()
export class CampingCronHandler {
  constructor(
    @Inject('ICampingService')
    private readonly campingService: ICampingService,
    private readonly imageService: ImageService,
    private readonly logger = new Logger(CampingCronHandler.name),
  ) {}
  @Cron('0 0 22 * * *', { timeZone: 'Asia/Seoul' })
  async handleCampingCron() {
    this.logger.log('CampingCron started');
    try {
      await this.campingService.campingCronHandler();
      this.logger.log('CampingCron completed successfully');
    } catch (error) {
      this.logger.error('Error in CampingCron', error.stack);
    }
  }
  
  @Cron('0 10 22 * * *', { timeZone: 'Asia/Seoul' })
  async handleCampingImageCron() {
    this.logger.log('CampingImageCron started');
    try {
      const campings = await this.campingService.findAllForCron();
      await Promise.all(
        campings.map((camp) => this.imageService.ImageCronHandler(camp.contentId)),
      );
      this.logger.log('CampingImageCron completed successfully');
    } catch (error) {
      this.logger.error('Error in CampingImageCron', error.stack);
    }
  }
}
