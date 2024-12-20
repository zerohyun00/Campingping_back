import { Injectable } from "@nestjs/common";
import { Campping } from "../entities/campping.entity";
import { DataSource, Repository } from "typeorm";
import { Image } from "src/image/entities/image.entity";
import { CamppingParamDto } from "../dto/find-campping-param.dto";

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
     
    const camppingData = result.map(camp => ({
        id: camp.camp_id,
        createdAt: camp.camp_createdAt,
        updatedAt: camp.camp_updatedAt,
        deletedAt: camp.camp_deletedAt,
        lineIntro: camp.camp_lineIntro,
        intro: camp.camp_intro,
        factDivNm: camp.camp_factDivNm,
        manageDivNm: camp.camp_manageDivNm,
        bizrno: camp.camp_bizrno,
        manageSttus: camp.camp_manageSttus,
        hvofBgnde: camp.camp_hvofBgnde,
        hvofEndde: camp.camp_hvofEndde,
        featureNm: camp.camp_featureNm,
        induty: camp.camp_induty,
        lccl: camp.camp_lccl,
        doNm: camp.camp_doNm,
        signguNm: camp.camp_signguNm,
        addr1: camp.camp_addr1,
        addr2: camp.camp_addr2,
        mapX: camp.camp_mapX,
        mapY: camp.camp_mapY,
        tel: camp.camp_tel,
        homepage: camp.camp_homepage,
        gplnInnerFclty: camp.camp_gplnInnerFclty,
        caravnInnerFclty: camp.camp_caravnInnerFclty,
        operPdCl: camp.camp_operPdCl,
        operDeCl: camp.camp_operDeCl,
        trlerAcmpnyAt: camp.camp_trlerAcmpnyAt,
        caravAcmpnyAt: camp.camp_caravAcmpnyAt,
        sbrsCl: camp.camp_sbrsCl,
        toiletCo: camp.camp_toiletCo,
        swrmCo: camp.camp_swrmCo,
        posblFcltyCl: camp.camp_posblFcltyCl,
        themaEnvrnCl: camp.camp_themaEnvrnCl,
        eqpmnLendCl: camp.camp_eqpmnLendCl,
        animalCmgCl: camp.camp_animalCmgCl,
        contentId: camp.camp_contentId,
    
        images: { id: camp.image_id, url: camp.image_url},
        }));

        return camppingData
    }
    async findOne(paramDto: CamppingParamDto){
        const query = this.repository
        .createQueryBuilder('campping')
        .leftJoinAndSelect('image', 'image') // campping과 image를 join
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
          'image.type AS image_type',
        ]);
    
      const result = await query.getRawMany();
    
      if (!result || result.length === 0) {
        return null;
      }
    
      const camppingData = result[0]; 
    
      // 이미지를 객체로 변환
      const images = result.map((row) => ({
        image_id: row.image_id,
        image_url: row.image_url,
        type: row.image_type,
      }));
    
      return {
        id: camppingData.campping_id,
        createdAt: camppingData.campping_createdAt,
        updatedAt: camppingData.campping_updatedAt,
        deletedAt: camppingData.campping_deletedAt,
        lineIntro: camppingData.campping_lineIntro,
        intro: camppingData.campping_intro,
        factDivNm: camppingData.campping_factDivNm,
        manageDivNm: camppingData.campping_manageDivNm,
        bizrno: camppingData.campping_bizrno,
        manageSttus: camppingData.campping_manageSttus,
        hvofBgnde: camppingData.campping_hvofBgnde,
        hvofEndde: camppingData.campping_hvofEndde,
        featureNm: camppingData.campping_featureNm,
        induty: camppingData.campping_induty,
        lccl: camppingData.campping_lccl,
        doNm: camppingData.campping_doNm,
        signguNm: camppingData.campping_signguNm,
        addr1: camppingData.campping_addr1,
        addr2: camppingData.campping_addr2,
        mapX: camppingData.campping_mapX,
        mapY: camppingData.campping_mapY,
        tel: camppingData.campping_tel,
        homepage: camppingData.campping_homepage,
        gplnInnerFclty: camppingData.campping_gplnInnerFclty,
        caravnInnerFclty: camppingData.campping_caravnInnerFclty,
        operPdCl: camppingData.campping_operPdCl,
        operDeCl: camppingData.campping_operDeCl,
        trlerAcmpnyAt: camppingData.campping_trlerAcmpnyAt,
        caravAcmpnyAt: camppingData.campping_caravAcmpnyAt,
        sbrsCl: camppingData.campping_sbrsCl,
        toiletCo: camppingData.campping_toiletCo,
        swrmCo: camppingData.campping_swrmCo,
        posblFcltyCl: camppingData.campping_posblFcltyCl,
        themaEnvrnCl: camppingData.campping_themaEnvrnCl,
        eqpmnLendCl: camppingData.campping_eqpmnLendCl,
        animalCmgCl: camppingData.campping_animalCmgCl,
        contentId: camppingData.campping_contentId,
        images, 
      };
    }
}