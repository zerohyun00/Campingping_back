import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Image } from "./entities/image.entity";
import { ImageService } from "./image.service";
import { ImageRepository } from "./repository/image.repository";


@Module({
  imports:[
    TypeOrmModule.forFeature([Image])
  ],
  controllers:[],
  providers: [ImageService, ImageRepository],
  exports: [ImageService]
})
export class ImageModule {}
