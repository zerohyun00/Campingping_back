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
            //캠핌장 이름으로 검색
            const existingData = await transactionalEntityManager.find(Campping, {
                select: ["factDivNm"],
            });
            console.log(existingData.length)
            const existingFactDivNms = new Set(existingData.map((item) => item.factDivNm));
    
            // 중복 제거 후 저장
            const newData = data.filter(item => !existingFactDivNms.has(item.factDivNm));
    
            if (newData.length > 0) {
                await transactionalEntityManager.save(Campping, newData);
            }
        });
    }
}