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
    // 페이지 네이션 추가
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
    // 업데이트 시 조건과 업데이트 데이터를 설정
    const updateResult = await this.commentRepository.update(
      { id: commentId, community: { id: communityId } },
      dto,
    );

    // 영향을 받은 행 수가 0인 경우 예외 처리
    if (updateResult.affected === 0) {
      throw new BadRequestException(
        '존재하지 않거나 해당 커뮤니티에 속하지 않는 댓글입니다.',
      );
    }

    // 업데이트된 데이터를 다시 로드 (필요 시)
    const updatedComment = await this.commentRepository.findOne({
      where: { id: commentId },
      relations: ['community'],
    });

    // 로드된 데이터를 반환
    return updatedComment;
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
    // softDelete 먼저 하는 로직으로 수정
  }

  async isCommentMine(userId: string, commentId: number) {
    const exists = await this.commentRepository.exists({
      where: {
        id: commentId,
        user: { id: userId },
      },
      relations: {
        user: true,
      },
    });

    return exists;
  }
}
