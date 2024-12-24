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
import { CamppingModule } from "src/campping/campping.module";
import { CamppingService } from "src/campping/campping.service";

@Module({
  imports:[
    TypeOrmModule.forFeature([Review]),
    UserModule,
    CamppingModule,
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
    CamppingService
  ],
})
export class ReviewModule {}
