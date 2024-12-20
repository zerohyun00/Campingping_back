import { Injectable } from "@nestjs/common";
import { Campping } from "../entities/campping.entity";
import { DataSource, Repository } from "typeorm";
import { Image } from "src/image/entities/image.entity";

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
      return result;
    }
    async findOne(id: number){
        return await this.repository.findOne({where: {id}})
    }
}