import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Community } from 'src/community/entities/community.entity';
import { Repository } from 'typeorm';
import { CreateCommentsDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';
import { UpdateCommentsDto } from './dto/update-comment.dto';

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

  async updateComment(
    communityId: number,
    commentId: number,
    dto: UpdateCommentsDto,
  ) {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['community'],
    });

    if (!comment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    if (comment.community.id !== communityId) {
      throw new BadRequestException(
        '이 댓글은 해당 커뮤니티에 속해 있지 않습니다.',
      );
    }

    const prevComment = await this.commentRepository.preload({
      id: commentId,
      ...dto,
    });

    if (!prevComment) {
      throw new BadRequestException('존재하지 않는 댓글입니다.');
    }

    const newComment = await this.commentRepository.save(prevComment);

    return newComment;
  }

  async deleteComment(communityId: number, commentId: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['community'],
    });

    if (!comment) {
      throw new NotFoundException('존재하지 않는 댓글입니다.');
    }

    if (comment.community.id !== communityId) {
      throw new BadRequestException(
        '이 댓글은 해당 커뮤니티에 속해 있지 않습니다.',
      );
    }

    await this.commentRepository.softDelete(commentId);
    console.log(`>>> [Service] Deleted comment with ID: ${commentId}`);
  }

  async isCommentMine(userId: string, commentId: number) {
    console.log('>>> [Service] Checking ownership:', { userId, commentId });

    const exists = await this.commentRepository.exists({
      where: {
        id: commentId,
        user: { id: userId },
      },
      relations: {
        user: true,
      },
    });

    console.log('>>> [Service] isCommentMine exists:', exists);
    return exists;
  }
}
