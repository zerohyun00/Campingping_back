import { ExecutionContext, createParamDecorator } from '@nestjs/common';

export const SocialUser = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);

export const UserId = createParamDecorator(
  (data: unknown, context: ExecutionContext) => {
    const request = context.switchToHttp().getRequest();

    return request?.user?.sub;
  },
);

export interface SocialUserAfterAuth {
  email: string;
  password: string;
  nickname: string;
}
