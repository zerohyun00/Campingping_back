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
import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';
import { ICommentService } from './interface/comment.service.interface';
import { FindCommentDto } from './dto/find-comment.dto';

@Injectable()
export class CommentService implements ICommentService{
  constructor(
    @InjectRepository(Comment)
    private readonly commentRepository: Repository<Comment>,
    @InjectRepository(Community)
    private readonly communityRepository: Repository<Community>,
  ) {}

  async findAllCommentsOfCommunity(
    communityId: number,
    paginationDto: PagePaginationDto,
  ) {
    const { page, take } = paginationDto;
  
    const community = await this.communityRepository.findOne({
      where: { id: communityId },
    });
  
    if (!community) {
      throw new NotFoundException('해당 커뮤니티 게시글이 없습니다.');
    }
  
    const queryBuilder = this.commentRepository
    .createQueryBuilder('comment')
    .leftJoinAndSelect('comment.user', 'user')
    .leftJoinAndSelect('comment.community', 'community')
    .leftJoinAndSelect(
      'image',
      'image',
      'image.typeId = CAST(user.id AS varchar) AND image.type = :imageType', 
      { imageType: 'USER' }
    )
    .where('community.id = :communityId', { communityId })
    .andWhere('comment.deletedAt IS NULL')
    .orderBy('comment.createdAt', 'DESC')
    .skip((page - 1) * take)
    .take(take);

    const total = await queryBuilder.getCount(); // 전체 개수 조회
    const comments = await queryBuilder.getRawMany();

    return FindCommentDto.allList(comments, {
      total,
      page,
      take,
    });
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

    await this.commentRepository.save({
      ...dto,
      community: { id: communityId },
      user: { id: userId },
    });

    return {
      message: '댓글이 성공적으로 생성되었습니다.',
    };
  }

  async updateComment(
    communityId: number,
    commentId: number,
    dto: UpdateCommentsDto,
  ) {
    const updateResult = await this.commentRepository.update(
      { id: commentId, community: { id: communityId } },
      dto,
    );

    if (updateResult.affected === 0) {
      throw new BadRequestException(
        '존재하지 않거나 해당 커뮤니티에 속하지 않는 댓글입니다.',
      );
    }
    return {message: "수정이 완료되었습니다"};
  }

  async deleteComment(communityId: number, commentId: number): Promise<void> {
    const result = await this.commentRepository.softDelete({
      id: commentId,
      community: { id: communityId },
    });

    if (result.affected === 0) {
      throw new BadRequestException(
        '존재하지 않거나 해당 커뮤니티에 속하지 않는 댓글입니다.',
      );
    }
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
