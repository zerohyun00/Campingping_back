import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Community } from "./entities/community.entity";

@Module({
  imports:[
    TypeOrmModule.forFeature([Community]),
  ],
  controllers: [],
  providers: [],
})
export class CommunityModule {}
