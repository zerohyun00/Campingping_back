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

  @Cron('0 53 2 * * *', { timeZone: 'Asia/Seoul' })
  async handleCombinedCampingCron() {
    try {
      const contentIds = await this.campingService.campingCronHandler();
      const BATCH_SIZE = 100;
      const MAX_CONCURRENT = 10;

      for (let i = 0; i < contentIds.length; i += BATCH_SIZE) {
        const batch = contentIds.slice(i, i + BATCH_SIZE);
        const queue = [...batch];
        const workers = [];

        for (let j = 0; j < Math.min(MAX_CONCURRENT, queue.length); j++) {
          workers.push(this.processQueue(queue));
        }
        await Promise.all(workers);
      }
    } catch (error) {
      console.error('Error in CombinedCampingCron', error.stack);
    }
  }

  async processQueue(queue: string[]) {
    while (queue.length > 0) {
      const contentId = queue.shift();
      if (contentId) {
        try {
          await this.imageService.ImageCronHandler(contentId);
        } catch (error) {
          console.error(`Error processing contentId ${contentId}:`, error);
        }
      }
    }
  }
}