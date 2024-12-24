import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CamppingRepository } from './repository/campping.repository';
import { Camping } from './entities/camping.entity';
import { ApiKeyManager } from 'src/common/utils/api-manager';
import { parseStringPromise } from 'xml2js';
import { CamppingParamDto } from './dto/find-campping-param.dto';
import { CampingType } from './type/campping-create.type';

@Injectable()
export class CamppingService {
  private apiKeyManager: ApiKeyManager;

  constructor(private readonly camppingRepository: CamppingRepository) {
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

  async camppingCronHandler() {
    const apiurl = 'https://apis.data.go.kr/B551011/GoCamping';
    const numOfRows = 100;
    let pageNo = 1;
    let allData = [];

    while (true) {
      const apikey = this.apiKeyManager.getCurrentApiKey();
      const url = `${apiurl}/basedList?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&_type=json`;

      try {
        const response = await axios.get(url);
        const responseBody = response.data?.response?.body;

        if (!responseBody || !responseBody.items || responseBody.items === '') {
          console.log(`처리할 데이터가 없습니다 (페이지: ${pageNo})`);
          console.log('응답 데이터:', response.data); // 응답 전체 데이터를 로깅하여 확인

          // 응답이 XML인지 확인
          if (
            response.data &&
            typeof response.data === 'string' &&
            response.data.trim().startsWith('<')
          ) {
            // XML 형식인 경우
            const errorXml = response.data;
            console.log(errorXml, '에러 발생 시');

            try {
              const parsedError = await parseStringPromise(errorXml, {
                explicitArray: false,
              });
              const returnReasonCode =
                parsedError?.OpenAPI_ServiceResponse?.cmmMsgHeader
                  ?.returnReasonCode;

              // 22번 코드 (API 키 초과) 처리
              if (returnReasonCode === '22') {
                console.warn(
                  `API 키 사용 초과: ${apikey}, 이유: ${parsedError?.OpenAPI_ServiceResponse?.cmmMsgHeader?.returnAuthMsg}`,
                );

                // API 키 변경 및 재시도
                if (!this.apiKeyManager.switchToNextApiKey()) {
                  console.error('모든 API 키 사용 초과');
                  break;
                }
                console.log(
                  `새로운 API 키로 전환: ${this.apiKeyManager.getCurrentApiKey()}`,
                );
                continue;
              }
            } catch (parseError) {
              console.error('XML 파싱 오류:', parseError);
            }
          } else {
            // JSON 형식이거나 다른 응답
            console.error('응답 데이터가 예상한 XML 형식이 아닙니다.');
          }
          break;
        }

        const campData = responseBody.items.item ?? [];
        console.log(
          `현재 페이지: ${pageNo}, 받은 데이터 수: ${campData.length}`,
        );
        allData = allData.concat(campData);
        pageNo++;
      } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error.message);
        break;
      }
    }

    try {
      const entities = allData.map((item) => this.mapToEntity(item));
      const batchSize = 500; // 한 번에 저장할 데이터 수
      await this.saveDataInBatches(entities, batchSize);
      console.log(`${entities.length}개의 데이터를 성공적으로 저장했습니다.`);
    } catch (error) {
      console.error('데이터 저장 중 오류 발생:', error);
    }
  }

  async saveDataInBatches(
    entities: Camping[],
    batchSize: number,
  ): Promise<void> {
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      await this.camppingRepository.saveDataWithTransaction(batch);
    }
  }

  mapToEntity(data: CampingType): Camping {
    const campping = new Camping();
    campping.lineIntro = data.lineIntro ?? null;
    campping.intro = data.intro ?? null;
    campping.factDivNm = data.facltNm ?? null; // 'facltNm'이 API의 이름 필드라 가정
    campping.manageDivNm = data.manageDivNm ?? null;
    campping.bizrno = data.bizrno ?? null;
    campping.manageSttus = data.manageSttus ?? null;
    campping.hvofBgnde = data.hvofBgnde ?? null;
    campping.hvofEndde = data.hvofEndde ?? null;
    campping.featureNm = data.featureNm ?? null;
    campping.induty = data.induty ?? null;
    campping.lccl = data.lctCl ?? null; // 'lctCl'이 API의 환경 필드라 가정
    campping.doNm = data.doNm ?? null;
    campping.signguNm = data.signguNm ?? null;
    campping.addr1 = data.addr1 ?? null;
    campping.addr2 = data.addr2 ?? null;
    campping.setLocation(data.mapX, data.mapY);
    campping.tel = data.tel ?? null;
    campping.homepage = data.homepage ?? null;
    campping.gplnInnerFclty = data.gnrlSiteCo ?? null;
    campping.caravnInnerFclty = data.caravInnerFclty ?? null;
    campping.operPdCl = data.operPdCl ?? null;
    campping.operDeCl = data.operDeCl ?? null;
    campping.trlerAcmpnyAt = data.trlerAcmpnyAt ?? null;
    campping.caravAcmpnyAt = data.caravAcmpnyAt ?? null;
    campping.sbrsCl = data.sbrsCl ?? null;
    campping.toiletCo = data.toiletCo ?? null;
    campping.swrmCo = data.swrmCo ?? null;
    campping.posblFcltyCl = data.posblFcltyCl ?? null;
    campping.themaEnvrnCl = data.themaEnvrnCl ?? null;
    campping.eqpmnLendCl = data.eqpmnLendCl ?? null;
    campping.animalCmgCl = data.animalCmgCl ?? null;
    campping.contentId = data.contentId ?? null;

    return campping;
  }

  async findAllForCron() {
    return await this.camppingRepository.findAllForCron();
  }
  async findAllWithDetails() {
    return await this.camppingRepository.findAllWithDetails();
  }

  async findOne(paramDto: CamppingParamDto) {
    return await this.camppingRepository.findOne(paramDto);
  }
  async findNearbyCampping(lon: number, lat: number) {
    return await this.camppingRepository.findNearbyCampping(lon, lat);
  }
}
