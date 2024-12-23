// import {
//   CanActivate,
//   ExecutionContext,
//   ForbiddenException,
//   Injectable,
//   UnauthorizedException,
// } from '@nestjs/common';
// import { Request } from 'express';
// import { Role } from 'src/user/entities/user.entity';
// import { User } from 'src/user/entities/user.entity';
// import { CommentService } from '../comment.service';

// @Injectable()
// export class IsCommentMineOrAdminGuard implements CanActivate {
//   constructor(private readonly commentService: CommentService) {}

//   async canActivate(context: ExecutionContext): Promise<boolean> {
//     const req = context.switchToHttp().getRequest() as Request & {
//       user: User;
//     };

//     // request 객체에서 user 정보를 가져옴
//     const { user } = req;

//     // 1) user 정보(로그인 여부) 확인
//     if (!user) {
//       throw new UnauthorizedException('사용자 정보를 가져올 수 없습니다.');
//     }

//     // 2) 관리자(Admin)인지 확인
//     if (user.role === Role.admin) {
//       // 관리자라면 무조건 true로 통과
//       return true;
//     }

//     // 3) 관리자도 아니면, 본인이 작성한 댓글인지 확인
//     const commentId = req.params.commentId;
//     const isOk = await this.commentService.isCommentMine(
//       user.id,
//       parseInt(commentId),
//     );

//     // 4) 작성자가 아니라면 예외 발생
//     if (!isOk) {
//       throw new ForbiddenException('권한이 없습니다.');
//     }

//     // 여기까지 통과했다면 권한 있음
//     return true;
//   }
// }
