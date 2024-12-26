import { Injectable } from '@nestjs/common';
import { Camping } from '../entities/camping.entity';
import { DataSource, Repository } from 'typeorm';
import { CampingParamDto } from '../dto/find-camping-param.dto';
import {
  mapCampingData,
  mapCampingListData,
  mapImageData,
} from 'src/common/utils/camping-data-map.util';

@Injectable()
export class CampingRepository {
  private readonly repository: Repository<Camping>;
  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Camping);
  }
  // 캠핑장 데이터 저장 트랜잭션
  async saveDataWithTransaction(data: Camping[]) {
    const entityManager = this.dataSource.createEntityManager();
    await entityManager.transaction(async (transactionalEntityManager) => {
      // `upsert`를 사용하여 데이터를 저장하거나 업데이트
      await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Camping)
        .values(data)
        .orUpdate(
          [
            'lineIntro',
            'intro',
            'manageDivNm',
            'bizrno',
            'manageSttus',
            'hvofBgnde',
            'hvofEndde',
            'featureNm',
            'induty',
            'lccl',
            'doNm',
            'signguNm',
            'addr1',
            'addr2',
            'tel',
            'homepage',
            'gplnInnerFclty',
            'caravnInnerFclty',
            'operPdCl',
            'operDeCl',
            'trlerAcmpnyAt',
            'caravAcmpnyAt',
            'sbrsCl',
            'toiletCo',
            'swrmCo',
            'posblFcltyCl',
            'themaEnvrnCl',
            'eqpmnLendCl',
            'animalCmgCl',
            'contentId',
            'location',
          ],
          ['contentId'],
        )
        .execute();
    });
  }
  async findAllForCron() {
    return await this.repository.find();
  }
  async findAllWithDetails() {
    //쿼리빌더로 변경
    const queryBuilder = this.repository
      .createQueryBuilder('camping')
      .select([
        'campinging.id AS camping_id',
        'camping.lineIntro AS camping_lineIntro',
        'camping.intro AS camping_intro',
        'camping.factDivNm AS camping_factDivNm',
        'camping.manageDivNm AS camping_manageDivNm',
        'camping.bizrno AS camping_bizrno',
        'camping.manageSttus AS camping_manageSttus',
        'camping.hvofBgnde AS camping_hvofBgnde',
        'camping.hvofEndde AS camping_hvofEndde',
        'camping.featureNm AS camping_featureNm',
        'camping.induty AS camping_induty',
        'camping.lccl AS camping_lccl',
        'camping.doNm AS camping_doNm',
        'camping.signguNm AS camping_signguNm',
        'camping.addr1 AS camping_addr1',
        'camping.addr2 AS camping_addr2',
        'camping.tel AS camping_tel',
        'camping.homepage AS camping_homepage',
        'camping.gplnInnerFclty AS camping_gplnInnerFclty',
        'camping.caravnInnerFclty AS camping_caravnInnerFclty',
        'camping.operPdCl AS camping_operPdCl',
        'camping.operDeCl AS camping_operDeCl',
        'camping.trlerAcmpnyAt AS camping_trlerAcmpnyAt',
        'camping.caravAcmpnyAt AS camping_caravAcmpnyAt',
        'camping.sbrsCl AS camping_sbrsCl',
        'camping.toiletCo AS camping_toiletCo',
        'camping.swrmCo AS camping_swrmCo',
        'camping.posblFcltyCl AS camping_posblFcltyCl',
        'camping.themaEnvrnCl AS camping_themaEnvrnCl',
        'camping.eqpmnLendCl AS camping_eqpmnLendCl',
        'camping.animalCmgCl AS camping_animalCmgCl',
        'camping.contentId AS camping_contentId',
        'ST_AsGeoJSON(camping.location) AS camping_location',
        'images.id AS image_id',
        'images.url AS image_url',
      ])
      .leftJoin(
        (subQuery) =>
          subQuery
            .select([
              'DISTINCT ON (image.typeId) image.id AS id',
              'image.url AS url',
              'image.typeId AS typeId',
            ])
            .from('image', 'image')
            .where('image.deletedAt IS NULL')
            .orderBy('image.typeId', 'ASC')
            .addOrderBy('image.id', 'ASC'),
        'images',
        'images.typeId = camping.contentId',
      )
      .where('camping.deletedAt IS NULL');

    const result = await queryBuilder.getRawMany();

    return mapCampingListData(result);
  }
  async findOne(paramDto: CampingParamDto) {
    const query = this.repository
      .createQueryBuilder('camping')
      .leftJoinAndSelect('image', 'image')
      .where('camping.deletedAt IS NULL')
      .andWhere('camping.contentId = :contentId', {
        contentId: paramDto.contentId,
      })
      .andWhere('image.deletedAt IS NULL')
      .andWhere('image.typeId = camping.contentId')
      .orderBy('image.typeId', 'ASC')
      .take(10)
      .select([
        'camping.id',
        'camping.createdAt',
        'camping.updatedAt',
        'camping.deletedAt',
        'camping.lineIntro',
        'camping.intro',
        'camping.factDivNm',
        'camping.manageDivNm',
        'camping.bizrno',
        'camping.manageSttus',
        'camping.hvofBgnde',
        'camping.hvofEndde',
        'camping.featureNm',
        'camping.induty',
        'camping.lccl',
        'camping.doNm',
        'camping.signguNm',
        'camping.addr1',
        'camping.addr2',
        'camping.tel',
        'camping.homepage',
        'camping.gplnInnerFclty',
        'camping.caravnInnerFclty',
        'camping.operPdCl',
        'camping.operDeCl',
        'camping.trlerAcmpnyAt',
        'camping.caravAcmpnyAt',
        'camping.sbrsCl',
        'camping.toiletCo',
        'camping.swrmCo',
        'camping.posblFcltyCl',
        'camping.themaEnvrnCl',
        'camping.eqpmnLendCl',
        'camping.animalCmgCl',
        'camping.contentId',
        'camping.location',
        'image.id AS image_id',
        'image.url AS image_url',
      ]);

    const result = await query.getRawMany();

    if (!result || result.length === 0) {
      return null;
    }

    const campingData = mapCampingData(result);
    const images = mapImageData(result);

    return { ...campingData, images };
  }
  async findNearbycamping(lon: number, lat: number) {
    const query = await this.repository
      .createQueryBuilder('camping')
      .select([
        'camping.id',
        'camping.factDivNm',
        'ST_AsGeoJSON(camping.location) as location',
        'ST_Distance(camping.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) as distance',
      ])
      .setParameters({ lat, lon })
      .where(
        'ST_DWithin(camping.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326), 5000)',
      )
      .orderBy('distance', 'ASC')
      .getRawMany();

    return query.map((camping) => ({
      id: camping.camping_id,
      factDivNm: camping.camping_factDivNm,
      location: JSON.parse(camping.location),
      distance: parseFloat(camping.distance),
    }));
  }
  async findCampingbyRegion() {
    
  }
}
