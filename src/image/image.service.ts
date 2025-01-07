import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ImageRepository } from './repository/image.repository';
import { parseStringPromise } from 'xml2js';
import { ApiKeyManager } from 'src/common/utils/api-manager';
import { XmlUtils } from 'src/common/utils/xml-util';
import { ConfigService } from '@nestjs/config';
import { S3Service } from 'src/common/s3-service';

@Injectable()
export class ImageService {
  private apiKeyManager: ApiKeyManager;

  constructor(
    private imageRepository: ImageRepository,
    private readonly s3Service: S3Service,
    private readonly configService: ConfigService,
  ) {
    // 수정 필요
    this.apiKeyManager = new ApiKeyManager([
      this.configService.get<string>('GO_CAMPING_APIKEY1'),
      this.configService.get<string>('GO_CAMPING_APIKEY2'),
      this.configService.get<string>('GO_CAMPING_APIKEY3'),
      this.configService.get<string>('GO_CAMPING_APIKEY4'),
      this.configService.get<string>('GO_CAMPING_APIKEY5'),
      this.configService.get<string>('GO_CAMPING_APIKEY6'),
    ]);
  }
 async ImageCronHandler(contentId: string) {
  const apiurl = 'https://apis.data.go.kr/B551011/GoCamping';
  const numOfRows = 50;
  let pageNo = 1;
  let batchImages = [];
  const batchSize = 20;
  let isboolean = true;
  let processedCount = 0;

  // 이전에 처리된 이미지를 추적
  const processedImages = await this.imageRepository.getProcessedImages(contentId);

  while (isboolean) {
    const apikey = this.apiKeyManager.getCurrentApiKey(); // 현재 사용 중인 API 키
    const url = `${apiurl}/imageList?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&contentId=${contentId}&_type=json`;

    try {
      const response = await axios.get(url);
      const responseBody = response.data?.response?.body;

      if (!responseBody || !responseBody.items || responseBody.items === '') {
        console.log(`처리할 데이터가 없습니다 (페이지: ${pageNo}, contentId: ${contentId})`);

        if (XmlUtils.isXmlResponse(response.data)) {
          const isXmlResponse = await XmlUtils.handleXmlError(
            response.data,
            apikey,
            this.apiKeyManager,
          );          
          if(!isXmlResponse){
            isboolean = false;
            break;
          }
        } else {
          console.error('XML이 아닌 오류 응답:', response.data);
        }
        break;
      }

      const images = responseBody.items.item ?? [];
      console.log(`컨텐츠 아이디: ${contentId}, 현재 페이지: ${pageNo}, 받은 이미지 데이터 수: ${images.length}`);

      // 이미 처리된 이미지는 건너뛰기
      const newImages = images.filter(image => !processedImages.includes(image.imageUrl));

      for (const image of newImages) {
        const existingImage = await this.imageRepository.findOne(contentId, image.imageUrl);
        if (!existingImage) {
          batchImages.push({
            typeId: contentId,
            url: image.imageUrl,
            type: 'CAMPING',
          });
          processedCount++;  // 처리된 이미지 수 증가
        }
      }

      // 배치 이미지 저장
      if (batchImages.length >= batchSize) {
        await this.imageRepository.createBatchImages(batchImages);
        console.log(`배치 이미지 저장 완료: ${batchImages.length}개`);
        batchImages = [];
      }

      // 마지막 페이지 처리 후 종료
      if (images.length < numOfRows) {
        if (batchImages.length > 0) {
          await this.imageRepository.createBatchImages(batchImages);
          console.log(`배치 이미지 저장 완료: ${batchImages.length}개`);
        }
        break; // 마지막 페이지에 도달했으므로 종료
      }

      pageNo++; // 다음 페이지로 이동
    } catch (error) {
      console.error('이미지 요청 중 오류 발생:', error);
      break;
    }

    // API 키 소진 시 종료
    if (this.apiKeyManager.isOutOfKeys()) {
      console.error('모든 API 키가 소진되었습니다. 작업을 종료합니다.');
      break;
    }
  }

  console.log(`총 ${processedCount}개의 이미지가 처리되었습니다.`);
}



  async updateUserProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const imageUrl = await this.s3Service.uploadFile(file, userId);
    await this.imageRepository.updateProfileImage(userId, imageUrl);
    return imageUrl;
  }
}
