import { Injectable } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import axios from 'axios';
import { CamppingRepository } from './repository/campping.repository';
import { Campping } from './entities/campping.entity';

@Injectable()
export class CamppingService {
  constructor(private readonly camppingRepository: CamppingRepository) {}

  @Cron('30 * * * * *')
  async CamppingCronHandler() {
    const apikey = 'xmrpgObsiAFFR2II2Mr%2BABk2SHPyB21kt%2Ft0Y6g4mMndM3J0b3KDmM2TTsySRE6Cpuo0Q8cBNt2aQ5%2BX1woPyA%3D%3D';
    const apiurl = 'https://apis.data.go.kr/B551011/GoCamping/basedList';
    const numOfRows = 100;
    let pageNo = 1;
    let allData = [];

    while (true) {
      const url = `${apiurl}?serviceKey=${apikey}&numOfRows=${numOfRows}&pageNo=${pageNo}&MobileOS=ETC&MobileApp=AppTest&_type=json`;
      try {
        const response = await axios.get(url);
        const data = response.data.response.body.items.item;

        if (!data || data.length === 0) {
          break;
        }

        allData = allData.concat(data);
        pageNo++;
      } catch (error) {
        console.error('데이터 요청 중 오류 발생:', error);
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

  private async saveDataInBatches(entities: Campping[], batchSize: number): Promise<void> {
    for (let i = 0; i < entities.length; i += batchSize) {
      const batch = entities.slice(i, i + batchSize);
      await this.camppingRepository.saveDataWithTransaction(batch);
    }
  }

  private mapToEntity(data: any): Campping {
    const campping = new Campping();
    campping.lineIntro = data.lineIntro || null;
    campping.intro = data.intro || null;
    campping.factDivNm = data.facltNm || null; // 'facltNm'이 API의 이름 필드라 가정
    campping.manageDivNm = data.manageDivNm || null;
    campping.bizrno = data.bizrno || null;
    campping.manageSttus = data.manageSttus || null;
    campping.hvofBgnde = data.hvofBgnde || null;
    campping.hvofEndde = data.hvofEndde || null;
    campping.featureNm = data.featureNm || null;
    campping.induty = data.induty || null;
    campping.lccl = data.lctCl || null; // 'lctCl'이 API의 환경 필드라 가정
    campping.doNm = data.doNm || null;
    campping.signguNm = data.signguNm || null;
    campping.addr1 = data.addr1 || null;
    campping.addr2 = data.addr2 || null;
    campping.mapX = data.mapX || null;
    campping.mapY = data.mapY || null;
    campping.tel = data.tel || null;
    campping.homepage = data.homepage || null;
    campping.gplnInnerFclty = data.gnrlSiteCo || null;
    campping.caravnInnerFclty = data.caravInnerFclty || null;
    campping.operPdCl = data.operPdCl || null;
    campping.operDeCl = data.operDeCl || null;
    campping.trlerAcmpnyAt = data.trlerAcmpnyAt || null;
    campping.caravAcmpnyAt = data.caravAcmpnyAt || null;
    campping.sbrsCl = data.sbrsCl || null;
    campping.toiletCo = data.toiletCo || null;
    campping.swrmCo = data.swrmCo || null;
    campping.posblFcltyCl = data.posblFcltyCl || null;
    campping.themaEnvrnCl = data.themaEnvrnCl || null;
    campping.eqpmnLendCl = data.eqpmnLendCl || null;
    campping.animalCmgCl = data.animalCmgCl || null;
    return campping;
  }
}