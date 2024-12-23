import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Community } from 'src/community/entities/community.entity';
import { Repository } from 'typeorm';
import { CreateCommentsDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async findAllCommentsOfCommunity(communityId: number) {
    const community = await this.communityRepository.findOne({
      where: {
        id: communityId,
      },
    });

    if (!community) {
      throw new NotFoundException('해당 커뮤니티 게시글이 없습니다.');
    }

    const comments = await this.commentRepository.find({
      where: { community: { id: communityId } },
      relations: ['user', 'community'],
    });

    return comments;
  }

  async createComment(
    dto: CreateCommentsDto,
    communityId: number,
    userId: string,
  ) {
    const community = await this.communityRepository.findOne({
      where: {
        id: communityId,
      },
    });

    if (!community) {
      throw new NotFoundException('해당 커뮤니티 게시글이 없습니다.');
    }
    return this.commentRepository.save({
      ...dto,
      community: { id: communityId },
      user: { id: userId },
    });
  }
}
