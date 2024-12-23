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
  Req,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CreateCommentsDto } from './dto/create-comment.dto';
import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin-guard';
import { UpdateCommentsDto } from './dto/update-comment.dto';

@UseInterceptors(ClassSerializerInterceptor)
@Controller('communities/:communitiesId/comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  // (1) 댓글 목록 조회
  // GET community/:communityId/comments

  @Get()
  async getComments(@Param('communitiesId', ParseIntPipe) communityId: number) {
    return this.commentService.findAllCommentsOfCommunity(communityId);
  }

  // // (2) 댓글 단건 조회
  // // GET community/:communityId/comments/:commentId

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
    console.log('>>> [Controller] user : ', req.user);
    const userId = req.user?.sub;

    return this.commentService.createComment(body, communityId, userId);
  }

  // // (4) 댓글 수정
  // // PATCH community/:communityId/comments/:commentId

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

  // // (5) 댓글 삭제
  // // DELETE community/:communityId/comments/:commentId

  @Delete(':commentsId')
  @UseGuards(JwtAuthGuard, IsCommentMineOrAdminGuard)
  async deleteComment(
    @Param('communitiesId', ParseIntPipe) communityId: number,
    @Param('commentsId', ParseIntPipe) commentId: number,
  ) {
    return this.commentService.deleteComment(communityId, commentId);
  }
}
