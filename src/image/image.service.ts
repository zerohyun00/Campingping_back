import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { ImageRepository } from './repository/image.repository';
import { parseStringPromise } from 'xml2js';
import { ApiKeyManager } from 'src/common/utils/api-manager';
import { XmlUtils } from 'src/common/utils/xml-util';

@Injectable()
export class ImageService {
  private apiKeyManager: ApiKeyManager;

  constructor(private imageRepository: ImageRepository) {
    // 수정 필요
    this.apiKeyManager = new ApiKeyManager([
      'xmrpgObsiAFFR2II2Mr%2BABk2SHPyB21kt%2Ft0Y6g4mMndM3J0b3KDmM2TTsySRE6Cpuo0Q8cBNt2aQ5%2BX1woPyA%3D%3D',
      'TapmaDwOM%2FvvIzD2GYx%2F6RfNoMM1ES3NQbgRwQeVG31NEu5JDY7vWU41293qYDR51IrpaKtbgAuYzJseIBhx2A%3D%3D',
      'FZ4frpQMulmr31of%2BdrKJkS9c99ziib5T%2BMJyqhp3kFnAHkw%2FR0URVDqItzaYurITyEJ3B%2BK%2BLtnNNmeVMfYFA%3D%3D',
      'WVXbHaU1Swo%2BcYdMpg2hDAaLjs3Vehe3CBCsgOR63iQf%2FWqVv%2BeuKKq%2Bs8uOhS4%2B1bwL4VwhxS1%2F0WUOgmklag%3D%3D',
      '20ToNqK21emRg6djV5ZFRNzl%2BGVnIEHdUoewEghzPlmop90s0dTK3sSnW%2FjdHqN1fF1lFrE96WK1ypYHhLuS6Q%3D%3D',
      'fR5r78vDyLa5VlMt5YTpJRUGjXoWDMk6ZQmB2LPtYHAHw%2F7mdvoXpnkrz7OuOB2JJH%2FOtbvUbmtUS%2FiPGGwoxQ%3D%3D',
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
            await XmlUtils.handleXmlError(response.data, apikey, this.apiKeyManager);
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
          const existingImage = await this.imageRepository.findOne(contentId, image.imageUrl);
          if (!existingImage) {
            batchImages.push({ contentId, imageUrl: image.imageUrl, type: 'CAMPING' });
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
}
