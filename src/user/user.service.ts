import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // 사용자 생성
  create(createUserDto: CreateUserDto) {
    return this.userRepository.save(createUserDto);
  }

  // 전체 사용자 조회
  findAll() {
    return this.userRepository.find();
  }

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

  // 사용자 정보 수정
  async update(id: string, updateUserDto: UpdateUserDto) {
    // UUID로 string 타입 사용
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다!');
    }

    await this.userRepository.update(id, updateUserDto);

    const newUser = await this.userRepository.findOne({
      where: { id },
    });
    return newUser;
  }

  // 사용자 삭제
  async remove(id: string) {
    // 여기도 find 후 update, find 후 delete가 아닌 바로 update, delete를 하는 것을 추천드릴게
    const user = await this.userRepository.findOne({
      where: { id },
    });

    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다!');
    }

    await this.userRepository.delete(id);

    return id;
  }
}
