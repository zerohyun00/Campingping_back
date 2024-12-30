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
    const numOfRows = 10;
    let pageNo = 1;
    let batchImages = [];
    const batchSize = 10;
    while (true) {
      const apikey = this.apiKeyManager.getCurrentApiKey(); // 현재 API 키
      const url = `${apiurl}/imageList?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&contentId=${contentId}&_type=json`;

      try {
        const response = await axios.get(url);
        const responseBody = response.data?.response?.body;

        if (!responseBody || !responseBody.items || responseBody.items === '') {
          console.log(`처리할 데이터가 없습니다 (페이지: ${pageNo})`);

          if (XmlUtils.isXmlResponse(response.data)) {
            await XmlUtils.handleXmlError(
              response.data,
              apikey,
              this.apiKeyManager,
            );
          } else {
            console.error('XML이 아닌 오류 응답:', response.data);
          }
          break;
        }
        const images = responseBody.items.item ?? [];
        console.log(
          `현재 페이지: ${pageNo}, 받은 이미지 데이터 수: ${images.length}`,
        );

        // 가져온 이미지를 DB에 저장
        for (const image of images) {
          const existingImage = await this.imageRepository.findOne(
            contentId,
            image.imageUrl,
          );
          if (!existingImage) {
            batchImages.push({
              typeId: contentId,
              url: image.imageUrl,
              type: 'CAMPING',
            });
          }
        }

        if (batchImages.length >= batchSize) {
          await this.imageRepository.createBatchImages(batchImages);
          console.log(`배치 이미지 저장 완료: ${batchImages.length}개`);
          batchImages = [];
        }

        if (images.length < numOfRows) {
          if (batchImages.length > 0) {
            await this.imageRepository.createBatchImages(batchImages);
            console.log(`배치 이미지 저장 완료: ${batchImages.length}개`);
          }
          break; // 마지막 페이지에 도달했으므로 종료
        }

        pageNo++; // 다음 페이지로 이동
      } catch (error) {
        console.error('API 요청 중 오류 발생:', error);
        break;
      }
    }
  }

  async updateUserProfileImage(
    userId: string,
    file: Express.Multer.File,
  ): Promise<string> {
    const imageUrl = await this.s3Service.uploadFile(file, userId);

    await this.imageRepository.updateProfileImage(userId, imageUrl);

    return imageUrl;
  }

  async getUserProfileImages(userId: string) {
    return await this.imageRepository.findUserProfileImages(userId);
  }
}
