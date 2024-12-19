import { Injectable } from "@nestjs/common";
import { Campping } from "../entities/campping.entity";
import { DataSource, Repository } from "typeorm";

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
    async findAll() {
        return await this.repository.find();
    }
    async findOne(id: number){
        return await this.repository.findOne({where: {id}})
    }
}