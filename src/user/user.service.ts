import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  // 특정 사용자 조회
  async findOne(id: string) {
    // UUID로 string 타입 사용
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다!');
    }
    return user;
  }
  async getUserProfileImages(userId: string) {
    const query = await this.userRepository
    .createQueryBuilder('user')
    .where('user.id = :userId', { userId })
    .leftJoin('image', 'image', 'image.typeId = CAST(user.id AS varchar)')
    .select([
      'user.id AS userId',
      'user.email AS userEmail',
      'user.type AS userType',
      'user.nickname AS nickname',
      'image.id AS imageId',
      'image.url AS imageUrl',
    ])
    .getRawOne();
    return {
      user:{
        email: query.useremail,
        nickName: query.nickname,
        userType: query.usertype,
        image:{
          id: query.imageid,
          url: query.imageurl,
        }
      }};
  }
}
