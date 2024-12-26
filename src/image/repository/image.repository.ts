import { Injectable } from "@nestjs/common";
import { Image } from "../entities/image.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class ImageRepository {
    private readonly repository: Repository<Image>;
    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Image);
    }
    async createBatchImages(images: { contentId: string, imageUrl: string, type: string }[]) {
        const queryRunner = this.dataSource.createQueryRunner();
        await queryRunner.startTransaction();
      
        try {
          // 여러 이미지를 한 번에 삽입하는 방법
          await queryRunner.manager.insert('Image', images); // 여러 이미지 삽입
          await queryRunner.commitTransaction();
        } catch (error) {
          await queryRunner.rollbackTransaction();
          console.error('배치 저장 중 오류 발생:', error);
        } finally {
          await queryRunner.release();
        }
    }

    async findOne(contentId: string, imageUrl: string){
        const image = await this.repository.findOne({where: {typeId: contentId, url: imageUrl}})
        return image;
    }
}