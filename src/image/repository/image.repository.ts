import { Injectable } from '@nestjs/common';
import { Image } from '../entities/image.entity';
import { DataSource, Repository } from 'typeorm';
import { ImageType } from 'src/common/type/image.type';

@Injectable()
export class ImageRepository {
  private readonly repository: Repository<Image>;
  constructor(private readonly dataSource: DataSource) {
    this.repository = this.dataSource.getRepository(Image);
  }
  async createBatchImages(
    images: { typeId: string; url: string; type: string }[],
  ) {
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

  async findOne(contentId: string, imageUrl: string) {
    const image = await this.repository.findOne({
      where: { typeId: contentId, url: imageUrl },
    });
    return image;
  }

  async updateProfileImage(typeId: string, imageUrl: string): Promise<void> {
    const existingImage = await this.repository.findOne({
      where: { typeId, type: ImageType.USER },
    });

    if (existingImage) {
      existingImage.url = imageUrl;
      await this.repository.save(existingImage);
    } else {
      const newImage = this.repository.create({
        typeId,
        url: imageUrl,
        type: ImageType.USER,
      });
      await this.repository.save(newImage);
    }
  }
}
