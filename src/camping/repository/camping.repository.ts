import { Injectable, Inject } from '@nestjs/common';
import { Camping } from '../entities/camping.entity';
import { Brackets, DataSource, Repository } from 'typeorm';
import { CampingParamDto } from '../dto/find-camping-param.dto';
import {
  mapCampingData,
  mapCampingListData,
  mapImageData,
  mapNearbycampingData,
} from 'src/common/utils/camping-data-map.util';
import {
  AppError,
  CommonError,
  CommonErrorStatusCode,
} from 'src/common/utils/app-error';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { CACHE_KEYS } from 'src/common/constants/cache-keys';

@Injectable()
export class CampingRepository {
  private readonly repository: Repository<Camping>;

  constructor(
    private readonly dataSource: DataSource,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {
    this.repository = this.dataSource.getRepository(Camping);
  }

  // 캠핑장 데이터 저장 트랜잭션
  async saveDataWithTransaction(data: Camping[]) {
    const entityManager = this.dataSource.createEntityManager();
    await entityManager.transaction(async (transactionalEntityManager) => {
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
    await this.invalidateCampingCache();
  }

  async findAllWithDetails(
    limit?: number,
    cursor?: number,
    region?: string,
    city?: string,
    category?: string,
    userId?: string,
  ) {
    const isFetchAll = !region && !city && !category && !cursor;
    const cacheKey = CACHE_KEYS.CAMPING_LIST_ALL;

    if (isFetchAll) {
      const cached = await this.cacheManager.get<string>(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    }

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
      ]);

    if (region) {
      queryBuilder.andWhere('camping.doNm ILIKE :region', {
        region: `%${region}%`,
      });
    }
    if (city) {
      queryBuilder.andWhere('camping.sigunguNm ILIKE :city', {
        city: `%${city}%`,
      });
    }
    if (category) {
      if (category === '반려동물') {
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

    queryBuilder.addOrderBy('camping.contentId', 'ASC');
    queryBuilder.limit(limit && limit > 0 ? limit : 10);

    const result = await queryBuilder.getRawMany();
    const nextCursor = result.length > 0 ? result[result.length - 1].id : null;
    const camping = mapCampingListData(result);

    if (isFetchAll) {
      await this.cacheManager.set(
        cacheKey,
        JSON.stringify({ result: camping, nextCursor }),
      );
    }

    return { result: camping, nextCursor };
  }

  async invalidateCampingCache() {
    await this.cacheManager.del(CACHE_KEYS.CAMPING_LIST_ALL);
  }

  // 캠핑장 상세 조회
  async findOne(paramDto: CampingParamDto) {
    const query = this.repository
      .createQueryBuilder('camping')
      .leftJoinAndSelect(
        'image',
        'image',
        'image.deletedAt IS NULL AND image.typeId = camping.contentId',
      )
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
      throw new AppError(CommonError.NOT_FOUND, '캠핑장 데이터가 없습니다', {
        httpStatusCode: CommonErrorStatusCode.NOT_FOUND,
      });
    }
    const campingData = mapCampingData(result);
    const images = mapImageData(result);

    return { ...campingData, images };
  }

  // 주변 캠핑장 조회
  async findNearbyCamping(
    lon: number,
    lat: number,
    userId?: string,
    radius: number = 5000,
  ) {
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
      .andWhere('camping.deletedAt IS NULL');

    if (userId) {
      query
        .leftJoinAndSelect(
          'favorite',
          'favorite',
          'camping.contentId = favorite.contentId AND favorite.user = :userId',
          { userId },
        )
        .addSelect('favorite.status', 'favorite')
        .orderBy('CASE WHEN favorite.status = true THEN 1 ELSE 2 END', 'ASC');
    }
    query.addOrderBy('distance', 'ASC');

    const result = await query.getRawMany();

    if (!result || result.length === 0) {
      throw new AppError(
        CommonError.NOT_FOUND,
        '위치에 맞는 캠핑장 데이터가 없습니다',
        {
          httpStatusCode: CommonErrorStatusCode.NOT_FOUND,
        },
      );
    }
    return mapNearbycampingData(result);
  }
}
