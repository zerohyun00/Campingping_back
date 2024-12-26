import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CreateCommentsDto } from './dto/create-comment.dto';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin-guard';
import { UpdateCommentsDto } from './dto/update-comment.dto';
import { PagePaginationDto } from 'src/common/dto/page-pagination.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('communities/:communitiesId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  @Get()
  async getComments(
    @Param('communitiesId', ParseIntPipe) communityId: number,
    @Query() paginationDto: PagePaginationDto,
  ) {
    return this.commentService.findAllCommentsOfCommunity(
      communityId,
      paginationDto,
    );
  }

  // @Get(':commentId')
  // async getComment(
  //   @Param('communityId', ParseIntPipe) communityId: number,
  //   @Param('commentId', ParseIntPipe) commentId: number,
  // ) {
  //   return this.commentService.findOneComment(communityId, commentId);
  // }

  @Post()
  @UseGuards(JwtAuthGuard)
  async createComment(
    @Param('communitiesId', ParseIntPipe) communityId: number,
    @Body() body: CreateCommentsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const userId = req.user.sub;

    return this.commentService.createComment(body, communityId, userId);
  }

  @Patch(':commentsId')
  @UseGuards(JwtAuthGuard, IsCommentMineOrAdminGuard)
  async updateComment(
    @Param('communitiesId', ParseIntPipe) communityId: number,
    @Param('commentsId', ParseIntPipe) commentId: number,
    @Body() updateCommentDto: UpdateCommentsDto,
  ) {
    return this.commentService.updateComment(
      communityId,
      commentId,
      updateCommentDto,
    );
  }

  @Delete(':commentsId')
  @UseGuards(JwtAuthGuard, IsCommentMineOrAdminGuard)
  async deleteComment(
    @Param('communitiesId', ParseIntPipe) communityId: number,
    @Param('commentsId', ParseIntPipe) commentId: number,
  ) {
    return this.commentService.deleteComment(communityId, commentId);
  }
}
