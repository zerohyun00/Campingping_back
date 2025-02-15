import { Injectable } from '@nestjs/common';
import axios from 'axios';
import { CampingRepository } from './repository/camping.repository';
import { Camping } from './entities/camping.entity';
import { ApiKeyManager } from 'src/common/utils/api-manager';
import { CampingParamDto } from './dto/find-camping-param.dto';
import { CampingType } from './type/camping-create.type';
import { XmlUtils } from 'src/common/utils/xml-util';
import { ConfigService } from '@nestjs/config';
import { ICampingService } from './interface/camping.service.interface';

@Injectable()
export class CampingService implements ICampingService{
  private apiKeyManager: ApiKeyManager;

  constructor(
    private readonly campingRepository: CampingRepository,
    private readonly configService: ConfigService
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

  async campingCronHandler() {
    const apiurl = 'https://apis.data.go.kr/B551011/GoCamping';
    const numOfRows = 100;
    let pageNo = 1;
    let isboolean = true;
    let contentIds: string[] = [];

    while (isboolean) {
      const apikey = this.apiKeyManager.getCurrentApiKey();
      const url = `${apiurl}/basedList?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&_type=json`;
  
      try {
        const response = await axios.get(url);
        const responseBody = response.data?.response?.body;
  
        if (!responseBody || !responseBody.items || responseBody.items === '') {
          //주석
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
  
        const campData = responseBody.items.item ?? [];
  
        // 데이터를 즉시 저장
        const entities = campData.map((item) => this.mapToEntity(item));
        await this.saveDataInBatches(entities, 100);
        const ids = campData.map((item) => item.contentId);
        contentIds = [...contentIds, ...ids]; // 기존 contentIds 배열에 추가
        pageNo++;
      } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error.message);
        break;
      }
    }
    return contentIds;
  }
  async saveDataInBatches(entities: Camping[], batchSize: number): Promise<void> {
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      try {
        await this.campingRepository.saveDataWithTransaction(batch);
      } catch (error) {
        console.error('배치 저장 실패:', error.message, batch);
      }
    }
  }

  private mapToEntity(data: CampingType): Camping {
    const camping = new Camping();
    camping.lineIntro = data.lineIntro ?? null;
    camping.intro = data.intro ?? null;
    camping.facltNm = data.facltNm ?? null; // 'facltNm'이 API의 이름 필드라 가정
    camping.manageDivNm = data.manageDivNm ?? null;
    camping.bizrno = data.bizrno ?? null;
    camping.manageSttus = data.manageSttus ?? null;
    camping.hvofBgnde = data.hvofBgnde ?? null;
    camping.hvofEndde = data.hvofEndde ?? null;
    camping.featureNm = data.featureNm ?? null;
    camping.induty = data.induty ?? null;
    camping.lccl = data.lctCl ?? null; // 'lctCl'이 API의 환경 필드라 가정
    camping.doNm = data.doNm ?? null;
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
    camping.firstImageUrl = data.firstImageUrl ?? null;
    camping.contentId = data.contentId ?? null;
    camping.sigunguNm = data.sigunguNm ?? null;

    return camping;
  }
  async getAllWithDetails(limit?: number, cursor?: number, region?: string, city?: string, category?: string, userId?: string) {
    return await this.campingRepository.findAllWithDetails(limit, cursor, region, city,category, userId);
  }

  async getOne(paramDto: CampingParamDto) {
    return await this.campingRepository.findOne(paramDto);
  }
  async getNearbyCampings(lon: number, lat: number, userId?: string) {
    return await this.campingRepository.findNearbyCamping(lon, lat, userId);
  }
}
