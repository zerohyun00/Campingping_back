import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { AuthenticatedRequest, JwtAuthGuard } from 'src/auth/guard/jwt.guard';
import { CreateCommentsDto } from './dto/create-comment.dto';
import { Users } from 'src/auth/decorator/user.decorator';
import { User } from 'src/user/entities/user.entity';
// import { IsCommentMineOrAdminGuard } from './guard/is-comment-mine-or-admin-guard';
// import { UpdateCommentsDto } from './dto/update-comment.dto';

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
    // 여기서 user가 잘 넘어오는지 로그 출력
    console.log('>>> [Controller] user : ', req.user);
    const userId = req.user?.sub;

    return this.commentService.createComment(body, communityId, userId);
  }

  // // (4) 댓글 수정
  // // PATCH community/:communityId/comments/:commentId

  // @Patch(':commentId')
  // @UseGuards(JwtAuthGuard, IsCommentMineOrAdminGuard)
  // async updateComment(
  //   @Param('communityId', ParseIntPipe) communityId: number,
  //   @Param('commentId', ParseIntPipe) commentId: number,
  //   @Body() updateCommentDto: UpdateCommentsDto,
  // ) {
  //   return this.commentService.updateComment(
  //     communityId,
  //     commentId,
  //     updateCommentDto,
  //   );
  // }
  // // (5) 댓글 삭제
  // // DELETE community/:communityId/comments/:commentId

  // @Delete(':commentId')
  // @UseGuards(JwtAuthGuard, IsCommentMineOrAdminGuard)
  // async deleteComment(
  //   @Param('communityId', ParseIntPipe) communityId: number,
  //   @Param('commentId', ParseIntPipe) commentId: number,
  // ) {
  //   return this.commentService.deleteComment(communityId, commentId);
  // }
}
