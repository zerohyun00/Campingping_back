import {
  Injectable,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Community } from './entities/community.entity';
import { CreateCommunityDto } from './dto/create-community.dto';
import { UpdateCommunityDto } from './dto/update-community.dto';
import { User } from 'src/user/entities/user.entity';

@Injectable()
export class CommunityService {
  constructor(
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async createPost(createCommunityDto: CreateCommunityDto, userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('유저를 찾을 수 없습니다.');
    }

    const post = this.communityRepository.create({
      ...createCommunityDto,
      user,
    });

    return this.communityRepository.save(post);
  }

  findAll() {
    return this.communityRepository.find({
      relations: ['user'],
    });
  }

  findOne(id: number) {
    return this.communityRepository.findOne({
      where: { id },
      relations: ['user'],
    });
  }

  async updatePost(
    id: number,
    updateCommunityDto: UpdateCommunityDto,
    userId: string,
  ) {
    const post = await this.communityRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.user.id !== userId) {
      throw new UnauthorizedException(
        '본인이 작성한 게시글만 수정할 수 있습니다.',
      );
    }

    Object.assign(post, updateCommunityDto);
    return this.communityRepository.save(post);
  }

  async deletePost(id: number, userId: string) {
    const post = await this.communityRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }

    if (post.user.id !== userId) {
      throw new UnauthorizedException(
        '본인이 작성한 게시글만 삭제할 수 있습니다.',
      );
    }

    return this.communityRepository.delete(post);
  }
}
