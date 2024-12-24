import { Injectable } from '@nestjs/common';
import { CampingService } from './camping.service';
import { ImageService } from 'src/image/image.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CampingCronHandler {
  constructor(
    private readonly campingService: CampingService,
    private readonly imageService: ImageService,
  ) {}
  // @Cron('30 * * * * *')
  async handleCron() {
    await this.campingService.camppingCronHandler();
    const camppings = await this.campingService.findAllForCron();
    for (const camp of camppings) {
      await this.imageService.ImageCronHandler(camp.contentId);
    }
  }
}
