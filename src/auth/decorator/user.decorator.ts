import {
  ExecutionContext,
  InternalServerErrorException,
  createParamDecorator,
} from '@nestjs/common';
import { User } from 'src/user/entities/user.entity';

export interface SocialUserAfterAuth extends Request {
  user: { email: string; nickname: string };
}

export const SocialUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest<SocialUserAfterAuth>();
    return request.user;
  },
);
