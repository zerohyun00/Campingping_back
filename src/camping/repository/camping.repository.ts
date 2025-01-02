import { Injectable } from '@nestjs/common';
import { Camping } from '../entities/camping.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CampingParamDto } from '../dto/find-camping-param.dto';
import {
  mapCampingData,
  mapCampingListData,
  mapImageData,
  mapNearbycampingData,
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
            'sigunguNm',
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
            'firstImageUrl',
          ],
          ['contentId'],
        )
        .execute();
    });
  }
  async findAllForCron() {
    return await this.repository.find();
  }
  async findAllWithDetails(limit: number, cursor?: number, region?: string, category?: string, userId?: string) {
    const queryBuilder = this.repository
      .createQueryBuilder('camping')
      .select([
        'camping.id AS id',
        'camping.contentId AS contentId',
        'camping.firstImageUrl AS firstImageUrl',
        'camping.facltNm AS facltNm',
        'camping.addr1 AS addr1',
        'camping.addr2 AS addr2',
        'camping.doNm AS doNm',
        'camping.lineIntro AS lineIntro',
        'camping.intro AS intro',
        'camping.sigunguNm AS sigunguNm',
        'ST_AsGeoJSON(camping.location) AS location',
      ])
    if (region) {
      queryBuilder.andWhere('camping.doNm ILIKE :region', {
        region: `%${region}%`,
      });
    }
    if (category) {
      if (category === '펫') {
        queryBuilder.andWhere('camping.animalCmgCl ILIKE :possible', {
          possible: '가능%',
        });
      } else {
        queryBuilder.andWhere(
          new Brackets((qb) => {
            qb.where('camping.lccl ILIKE :category', {
              category: `%${category}%`,
            }).orWhere('camping.induty ILIKE :category', {
              category: `%${category}%`,
            });
          }),
        );
      }
    }
    if (cursor) {
      queryBuilder.andWhere('camping.id > :cursor', { cursor });
    }
    if(userId) {
      queryBuilder
      .leftJoinAndSelect(
        'favorite',
        'favorite',
        'camping.contentId = favorite.contentId AND favorite.user = :userId',
        { userId }
      )
      .addSelect('favorite.status', 'favorite')
      .orderBy('CASE WHEN favorite.status = true THEN 1 ELSE 2 END', 'ASC')
    }
    queryBuilder.addOrderBy('camping.contentId', 'ASC')
    queryBuilder.limit(limit && limit > 0 ? limit : 10);
    const result = await queryBuilder.getRawMany();

    const nextCursor =
      result.length > 0 ? result[result.length - 1].id : null;
    const camping = mapCampingListData(result);
    return {
      result: camping,
      nextCursor,
    };
  }
  async findOne(paramDto: CampingParamDto) {
    const query = this.repository
    .createQueryBuilder('camping')
    .leftJoinAndSelect('image', 'image', 'image.deletedAt IS NULL AND image.typeId = camping.contentId')
    .where('camping.deletedAt IS NULL')
    .andWhere('camping.contentId = :contentId', {
      contentId: paramDto.contentId,
    })
    .orderBy('image.typeId', 'ASC')
    .take(10)
    .select([
      'camping.id',
      'camping.createdAt',
      'camping.updatedAt',
      'camping.deletedAt',
      'camping.lineIntro',
      'camping.intro',
      'camping.facltNm',
      'camping.manageDivNm',
      'camping.bizrno',
      'camping.manageSttus',
      'camping.hvofBgnde',
      'camping.hvofEndde',
      'camping.featureNm',
      'camping.induty',
      'camping.lccl',
      'camping.doNm',
      'camping.sigunguNm',
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
      'camping.firstImageUrl',
      'ST_AsGeoJSON(camping.location) as location',
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
  async findNearbyCamping(lon: number, lat: number,  userId?: string, radius: number = 5000) {
    const query = this.repository
    .createQueryBuilder('camping')
    .select([
      'camping.id AS id',
      'camping.contentId AS contentId',
      'camping.firstImageUrl AS firstImageUrl',
      'camping.facltNm AS facltNm',
      'camping.addr1 AS addr1',
      'camping.addr2 AS addr2',
      'camping.lineIntro AS lineIntro',
      'ST_AsGeoJSON(camping.location) AS location',
      '(ST_Distance(camping.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) * 111000) as distance',
    ])
    .setParameters({ lat, lon, radius })
    .where(
      '(ST_Distance(camping.location, ST_SetSRID(ST_MakePoint(:lon, :lat), 4326)) * 111000) <= :radius',
    )
    .andWhere('camping.deletedAt IS NULL')
    if(userId) {
      query
      .leftJoinAndSelect(
        'favorite',
        'favorite',
        'camping.contentId = favorite.contentId AND favorite.user = :userId',
        { userId }
      )
      .addSelect('favorite.status', 'favorite')
      .orderBy('CASE WHEN favorite.status = true THEN 1 ELSE 2 END', 'ASC')
    }
    query.addOrderBy('distance', 'ASC')

    const result = await query.getRawMany();

    return mapNearbycampingData(result);
  }
}
