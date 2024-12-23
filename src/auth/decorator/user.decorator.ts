import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

export const SocialUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const Users = createParamDecorator(
  (data: keyof User | undefined, context: ExecutionContext) => {
    const req = context.switchToHttp().getRequest();
    const user = req.user as User;

    if (!user) {
      throw new InternalServerErrorException(
        'Request에 user 프로퍼티가 존재하지 않습니다!',
      );
    }

    if (data) {
      return user[data];
    }
    return user;
  },
);

export interface SocialUserAfterAuth {
  email: string;
  password: string;
  nickname: string;
}
