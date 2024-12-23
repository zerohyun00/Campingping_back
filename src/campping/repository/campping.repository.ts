import { Injectable } from "@nestjs/common";
import { Campping } from "../entities/campping.entity";
import { DataSource, Repository } from "typeorm";
import { CamppingParamDto } from "../dto/find-campping-param.dto";
import { mapCamppingData, mapCamppingListData, mapImageData } from "src/common/utils/campping-data-map.util";

@Injectable()
export class CamppingRepository {
    private readonly repository: Repository<Campping>;
    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Campping);
    }
    // 캠핑장 데이터 저장 트랜잭션
 async saveDataWithTransaction(data: Campping[]) {
    const entityManager = this.dataSource.createEntityManager();

    await entityManager.transaction(async (transactionalEntityManager) => {
        // `upsert`를 사용하여 데이터를 저장하거나 업데이트
        await transactionalEntityManager
        .createQueryBuilder()
        .insert()
        .into(Campping)
        .values(data)
        .orUpdate(
            ["lineIntro", "intro", "manageDivNm", "bizrno", "manageSttus", "hvofBgnde", "hvofEndde", "featureNm", 
             "induty", "lccl", "doNm", "signguNm", "addr1", "addr2", "mapX", "mapY", "tel", "homepage", 
             "gplnInnerFclty", "caravnInnerFclty", "operPdCl", "operDeCl", "trlerAcmpnyAt", "caravAcmpnyAt", 
             "sbrsCl", "toiletCo", "swrmCo", "posblFcltyCl", "themaEnvrnCl", "eqpmnLendCl", "animalCmgCl", "contentId"],
            ["contentId"]
        )
        .execute();
    });
    }
    async findCronFindAll() {
        return await this.repository.find();
    }
    async findAll() {
        const query = `
        SELECT 
          camp."createdAt" AS "camp_createdAt", 
          camp."updatedAt" AS "camp_updatedAt", 
          camp."deletedAt" AS "camp_deletedAt", 
          camp."id" AS "camp_id", 
          camp."lineIntro" AS "camp_lineIntro", 
          camp."intro" AS "camp_intro", 
          camp."factDivNm" AS "camp_factDivNm", 
          camp."manageDivNm" AS "camp_manageDivNm", 
          camp."bizrno" AS "camp_bizrno", 
          camp."manageSttus" AS "camp_manageSttus", 
          camp."hvofBgnde" AS "camp_hvofBgnde", 
          camp."hvofEndde" AS "camp_hvofEndde", 
          camp."featureNm" AS "camp_featureNm", 
          camp."induty" AS "camp_induty", 
          camp."lccl" AS "camp_lccl", 
          camp."doNm" AS "camp_doNm", 
          camp."signguNm" AS "camp_signguNm", 
          camp."addr1" AS "camp_addr1", 
          camp."addr2" AS "camp_addr2", 
          camp."mapX" AS "camp_mapX", 
          camp."mapY" AS "camp_mapY", 
          camp."tel" AS "camp_tel", 
          camp."homepage" AS "camp_homepage", 
          camp."gplnInnerFclty" AS "camp_gplnInnerFclty", 
          camp."caravnInnerFclty" AS "camp_caravnInnerFclty", 
          camp."operPdCl" AS "camp_operPdCl", 
          camp."operDeCl" AS "camp_operDeCl", 
          camp."trlerAcmpnyAt" AS "camp_trlerAcmpnyAt", 
          camp."caravAcmpnyAt" AS "camp_caravAcmpnyAt", 
          camp."sbrsCl" AS "camp_sbrsCl", 
          camp."toiletCo" AS "camp_toiletCo", 
          camp."swrmCo" AS "camp_swrmCo", 
          camp."posblFcltyCl" AS "camp_posblFcltyCl", 
          camp."themaEnvrnCl" AS "camp_themaEnvrnCl", 
          camp."eqpmnLendCl" AS "camp_eqpmnLendCl", 
          camp."animalCmgCl" AS "camp_animalCmgCl", 
          camp."contentId" AS "camp_contentId", 
          images."id" AS "image_id", 
          images."url" AS "image_url"
        FROM "campping" "camp"
        LEFT JOIN (
          SELECT DISTINCT ON ("image"."typeId") "image"."id", "image"."url", "image"."typeId"
          FROM "image" "image"
          WHERE "image"."deletedAt" IS NULL
          ORDER BY "image"."typeId" ASC, "image"."id" ASC
        ) "images" ON images."typeId" = camp."contentId"
        WHERE camp."deletedAt" IS NULL;
      `;
      const result = await this.repository.query(query);    
    
      return mapCamppingListData(result)
    }
    async findOne(paramDto: CamppingParamDto){
        const query = this.repository
        .createQueryBuilder('campping')
        .leftJoinAndSelect('image', 'image')
        .where('campping.deletedAt IS NULL')
        .andWhere('campping.id = :id', { id: paramDto.id })
        .andWhere('image.deletedAt IS NULL')
        .andWhere('image.typeId = campping.contentId')
        .orderBy('image.typeId', 'ASC')
        .take(10)
        .select([
          'campping.id',
          'campping.createdAt',
          'campping.updatedAt',
          'campping.deletedAt',
          'campping.lineIntro',
          'campping.intro',
          'campping.factDivNm',
          'campping.manageDivNm',
          'campping.bizrno',
          'campping.manageSttus',
          'campping.hvofBgnde',
          'campping.hvofEndde',
          'campping.featureNm',
          'campping.induty',
          'campping.lccl',
          'campping.doNm',
          'campping.signguNm',
          'campping.addr1',
          'campping.addr2',
          'campping.mapX',
          'campping.mapY',
          'campping.tel',
          'campping.homepage',
          'campping.gplnInnerFclty',
          'campping.caravnInnerFclty',
          'campping.operPdCl',
          'campping.operDeCl',
          'campping.trlerAcmpnyAt',
          'campping.caravAcmpnyAt',
          'campping.sbrsCl',
          'campping.toiletCo',
          'campping.swrmCo',
          'campping.posblFcltyCl',
          'campping.themaEnvrnCl',
          'campping.eqpmnLendCl',
          'campping.animalCmgCl',
          'campping.contentId',
          'image.createdAt AS image_createdAt',
          'image.updatedAt AS image_updatedAt',
          'image.deletedAt AS image_deletedAt',
          'image.id AS image_id',
          'image.url AS image_url',
        ]);
    
      const result = await query.getRawMany();
      
      if (!result || result.length === 0) {
        return null;
      }

      const camppingData = mapCamppingData(result);
      const images = mapImageData(result);

      return { ...camppingData, images };
    }
}