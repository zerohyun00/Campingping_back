import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { Role } from 'src/user/entities/user.entity';
import { CommentService } from '../comment.service';

@Injectable()
export class IsCommentMineOrAdminGuard implements CanActivate {
  constructor(private readonly commentService: CommentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest() as Request & {
      user: { sub: string; role: Role };
    };

    const { user } = req;

    if (!user) {
      throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
    }

    console.log('>>> [Guard] User:', user);

    if (user.role === Role.admin) {
      console.log('>>> [Guard] User is admin');
      return true;
    }

    const commentId = parseInt(req.params.commentsId, 10);
    if (isNaN(commentId)) {
      throw new ForbiddenException('유효하지 않은 댓글 ID입니다.');
    }

    console.log('>>> [Guard] commentId:', commentId);

    const userId = user.sub;
    console.log('>>> [Guard] Extracted userId:', userId);

    const isOk = await this.commentService.isCommentMine(userId, commentId);
    console.log('>>> [Guard] isCommentMine result:', isOk);

    if (!isOk) {
      throw new ForbiddenException('권한이 없습니다.');
    }

    return true;
  }
}
