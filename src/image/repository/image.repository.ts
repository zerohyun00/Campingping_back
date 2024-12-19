import { Injectable } from "@nestjs/common";
import { Image } from "../entities/image.entity";
import { DataSource, Repository } from "typeorm";

@Injectable()
export class ImageRepository {
    private readonly repository: Repository<Image>;
    constructor(private readonly dataSource: DataSource) {
        this.repository = this.dataSource.getRepository(Image);
    }
    async createImage(contentId: string, url: string, type: string): Promise<Image>{
        const imageData = this.repository.create({typeId: contentId, url, type})
        return await this.repository.save(imageData)
    }
    async findOne(contentId: string, imageUrl: string){
        const image = await this.repository.findOne({where: {typeId: contentId, url: imageUrl}})
        return image;
    }
}