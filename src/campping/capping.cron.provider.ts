import { Injectable } from '@nestjs/common';
import { CamppingService } from './campping.service';
import { ImageService } from 'src/image/image.service';
import { Cron } from '@nestjs/schedule';

@Injectable()
export class CamppingCronHandler {
  constructor(
    private readonly camppingService: CamppingService,
    private readonly imageService: ImageService,
  ) {}
  // @Cron("30 * * * * *")
  async handleCron() {
    await this.camppingService.CamppingCronHandler();
    const camppings = await this.camppingService.findCronFindAll();
    for (const camp of camppings) {
      await this.imageService.ImageCronHandler(camp.contentId);
    }
  }
}