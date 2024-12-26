import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CampingRepository } from './repository/camping.repository';
import { Camping } from './entities/camping.entity';
import { ApiKeyManager } from 'src/common/utils/api-manager';
import { parseStringPromise } from 'xml2js';
import { CampingParamDto } from './dto/find-camping-param.dto';
import { CampingType } from './type/camping-create.type';
import { XmlUtils } from 'src/common/utils/xml-util';

@Injectable()
export class CampingService {
  private apiKeyManager: ApiKeyManager;

  constructor(private readonly campingRepository: CampingRepository) {
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

  async campingCronHandler() {
    const apiurl = 'https://apis.data.go.kr/B551011/GoCamping';
    const numOfRows = 100;
    let pageNo = 1;
  
    while (true) {
      const apikey = this.apiKeyManager.getCurrentApiKey();
      const url = `${apiurl}/basedList?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&_type=json`;
  
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
  
        const campData = responseBody.items.item ?? [];
        console.log(`현재 페이지: ${pageNo}, 받은 데이터 수: ${campData.length}`);
  
        // 데이터를 즉시 저장
        const entities = campData.map((item) => this.mapToEntity(item));
        await this.saveDataInBatches(entities, 500); // 500개 단위로 저장
        console.log(`${campData.length}개의 데이터를 저장했습니다.`);
        pageNo++;
      } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error.message);
        break;
      }
    }
  }
  async saveDataInBatches(entities: Camping[], batchSize: number): Promise<void> {
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      try {
        await this.campingRepository.saveDataWithTransaction(batch);
        console.log(`배치 저장 성공: ${batch.length}개`);
      } catch (error) {
        console.error('배치 저장 실패:', error.message, batch);
      }
    }
  }

  mapToEntity(data: CampingType): Camping {
    const camping = new Camping();
    camping.lineIntro = data.lineIntro ?? null;
    camping.intro = data.intro ?? null;
    camping.factDivNm = data.facltNm ?? null; // 'facltNm'이 API의 이름 필드라 가정
    camping.manageDivNm = data.manageDivNm ?? null;
    camping.bizrno = data.bizrno ?? null;
    camping.manageSttus = data.manageSttus ?? null;
    camping.hvofBgnde = data.hvofBgnde ?? null;
    camping.hvofEndde = data.hvofEndde ?? null;
    camping.featureNm = data.featureNm ?? null;
    camping.induty = data.induty ?? null;
    camping.lccl = data.lctCl ?? null; // 'lctCl'이 API의 환경 필드라 가정
    camping.doNm = data.doNm ?? null;
    camping.signguNm = data.signguNm ?? null;
    camping.addr1 = data.addr1 ?? null;
    camping.addr2 = data.addr2 ?? null;
    camping.setLocation(data.mapX, data.mapY);
    camping.tel = data.tel ?? null;
    camping.homepage = data.homepage ?? null;
    camping.gplnInnerFclty = data.gnrlSiteCo ?? null;
    camping.caravnInnerFclty = data.caravInnerFclty ?? null;
    camping.operPdCl = data.operPdCl ?? null;
    camping.operDeCl = data.operDeCl ?? null;
    camping.trlerAcmpnyAt = data.trlerAcmpnyAt ?? null;
    camping.caravAcmpnyAt = data.caravAcmpnyAt ?? null;
    camping.sbrsCl = data.sbrsCl ?? null;
    camping.toiletCo = data.toiletCo ?? null;
    camping.swrmCo = data.swrmCo ?? null;
    camping.posblFcltyCl = data.posblFcltyCl ?? null;
    camping.themaEnvrnCl = data.themaEnvrnCl ?? null;
    camping.eqpmnLendCl = data.eqpmnLendCl ?? null;
    camping.animalCmgCl = data.animalCmgCl ?? null;
    camping.contentId = data.contentId ?? null;

    return camping;
  }

  async findAllForCron() {
    return await this.campingRepository.findAllForCron();
  }
  async findAllWithDetails() {
    return await this.campingRepository.findAllWithDetails();
  }

  async findOne(paramDto: CampingParamDto) {
    return await this.campingRepository.findOne(paramDto);
  }
  async findNearbycamping(lon: number, lat: number) {
    return await this.campingRepository.findNearbycamping(lon, lat);
  }
}
