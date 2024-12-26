import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Review } from "./entities/review.entity";
import { ReviewService } from "./review.service";
import { ReviewController } from "./review.controller";
import { ReviewRepository } from "./repository/review.repository";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "src/user/user.module";
import { UserService } from "src/user/user.service";
import { CampingModule } from "src/camping/camping.module";
import { CampingService } from "src/camping/camping.service";

@Module({
  imports:[
    TypeOrmModule.forFeature([Review]),
    UserModule,
    CampingModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_ACCESS_SECRET'),
      }),
    }),
  ],
  controllers: [ReviewController],
  providers: [
    ReviewService, 
    ReviewRepository, 
    UserService, 
    CampingService
  ],
})
export class ReviewModule {}
