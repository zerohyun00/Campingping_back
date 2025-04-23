import {
  Body,
  ClassSerializerInterceptor,
  Controller,
  Delete,
  Get,
  Inject,
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
import { ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from '@nestjs/swagger';
import { ICommentService } from './interface/comment.service.interface';

@UseInterceptors(ClassSerializerInterceptor)
@ApiTags('Comment')
@Controller('communities/:communitiesId/comments')
export class CommentController {
  constructor(
    @Inject('ICommentService')
    private readonly commentService: ICommentService
  ) {}

  @Get()
  @ApiOperation({ summary: '특정 커뮤니티의 모든 댓글을 조회합니다.' })
  @ApiParam({
    name: 'communitiesId',
    description: '댓글을 조회할 커뮤니티의 ID',
    example: '1',
    type: Number,
  })
  @ApiResponse({ status: 200, description: '댓글 목록이 성공적으로 조회되었습니다.' })
  async getComments(
    @Param('communitiesId', ParseIntPipe) communityId: number,
    @Query() paginationDto: PagePaginationDto,
  ) {
    return this.commentService.findAllCommentsOfCommunity(
      communityId,
      paginationDto,
    );
  }
  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiOperation({ 
    summary: '커뮤니티에 새로운 댓글을 작성합니다.',
    description: '로그인한 사용자의 새 댓글 작성',
  })
  @ApiParam({
    name: 'communitiesId',
    description: '댓글을 작성할 커뮤니티의 ID',
    example: '1',
    type: Number,
  })
  @ApiBody({ type: CreateCommentsDto })
  @ApiResponse({ status: 201, description: '댓글이 성공적으로 생성되었습니다.' })
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
  @ApiOperation({ 
    summary: '특정 커뮤니티의 댓글을 수정합니다.',
    description: '로그인한 사용자의 댓글 수정',
  })
  @ApiParam({
    name: 'communitiesId',
    description: '댓글이 속한 커뮤니티의 ID',
    example: '1',
    type: Number,
  })
  @ApiParam({
    name: 'commentsId',
    description: '수정할 댓글의 ID',
    example: '1',
    type: Number,
  })
  @ApiBody({ type: UpdateCommentsDto })
  @ApiResponse({ status: 200, description: '댓글이 성공적으로 수정되었습니다.' })
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
  @ApiOperation({ 
    summary: '특정 커뮤니티의 댓글을 삭제합니다.',
    description: '로그인한 사용자의 댓글 삭제',
  })
  @ApiParam({
    name: 'communitiesId',
    description: '댓글이 속한 커뮤니티의 ID',
    example: '1',
    type: Number,
  })
  @ApiParam({
    name: 'commentsId',
    description: '삭제할 댓글의 ID',
    example: '1',
    type: Number,
  })
  @ApiResponse({ status: 200, description: '댓글이 성공적으로 삭제되었습니다.' })
  async deleteComment(
    @Param('communitiesId', ParseIntPipe) communityId: number,
    @Param('commentsId', ParseIntPipe) commentId: number,
  ) {
    return this.commentService.deleteComment(communityId, commentId);
  }
}
