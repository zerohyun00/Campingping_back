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
  @Cron('0 0 0 * * *', { timeZone: 'Asia/Seoul' })
  async handleCampingCron() {
    console.log('CampingCron started');
    try {
      await this.campingService.campingCronHandler();
      console.log('CampingCron completed successfully');
    } catch (error) {
      console.error('Error in CampingCron', error.stack);
    }
  }

  @Cron('0 30 0 * * *', { timeZone: 'Asia/Seoul' })
  async handleCampingImageCron() {
    console.log('CampingImageCron started');
    try {      
      const campings = await this.campingService.findAllForCron();
      const queue = [...campings];  // 캠핑 데이터 배열을 큐로 사용
      const workers = [];
      const MAX_CONCURRENT = 10;  // 동시에 실행할 작업 수

    // 큐에서 데이터를 처리하는 작업
      for (let i = 0; i < MAX_CONCURRENT; i++) {
        workers.push(this.processQueue(queue));
      }

      // 모든 작업이 완료될 때까지 대기
      await Promise.all(workers);
      console.log('CampingImageCron completed successfully');
    } catch (error) {
      console.error('Error in CampingImageCron', error.stack);
    }
  }
  async processQueue(queue: any[]) {
    while (queue.length > 0) {
      const camp = queue.shift();  // 큐에서 첫 번째 항목을 꺼냄
      if (camp) {
        try {
          await this.imageService.ImageCronHandler(camp.contentId);
        } catch (error) {
          console.error(`Error processing camping ID ${camp.contentId}:`, error);
        }
      }
    }
  }
}
