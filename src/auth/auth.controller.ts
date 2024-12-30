import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
  UseInterceptors,
  HttpCode,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginUserDto } from './dto/login-user.dto';
import { Response as ExpressResponse, Request } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { KakaoAuthGuard } from './guard/auth.guard';
import { SocialUser } from './decorator/user.decorator';
import { SocialLoginDto } from './dto/social-login.dto';
import { TransformInterceptor } from 'src/common/interceptor/transformation.intersepter';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('send-verification')
  async sendVerificationCode(@Body('email') email: string) {
    await this.authService.sendVerificationCode(email);
    return { message: '인증번호가 발송되었습니다.' };
  }

  @Post('verify-code')
  async verifyCode(@Body() { email, code }: { email: string; code: string }) {
    await this.authService.verifyCode(email, code);
    return { message: '이메일 인증이 완료되었습니다.' };
  }

  @Post('register')
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Post('logout')
  logout(@Res() res: ExpressResponse): void {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false, // HTTPS에서만 전송
      sameSite: 'strict',
    });
    res.status(200).send({ message: '로그아웃 성공' });
  }
  @Post('login')
  @HttpCode(200)
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, refreshToken } =
      await this.authService.login(loginUserDto);

    const isProduction = this.configService.get<string>('ENV') === 'prod';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 3600000,
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 3600000,
    });

    return { message: '로그인 성공' };
  }

  @Get('kakao-login')
  @UseGuards(KakaoAuthGuard)
  async kakaoLogin(
    @SocialUser() socialUser: SocialLoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ): Promise<void> {
    const { accessToken, refreshToken } =
      await this.authService.OAuthLogin(socialUser);

    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.cookie('accessToken', accessToken, { httpOnly: true });

    res.redirect('/');
  }

  @Post('refresh')
  @HttpCode(200)
  async refreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('리프레쉬 토큰이 쿠키에 없습니다.');
    }

    const { accessToken, refreshToken: newRefreshToken } =
      await this.authService.refreshAccessToken(refreshToken);

    const isProduction = this.configService.get<string>('ENV') === 'prod';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000, // 1시간
    });
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 60 * 60 * 1000 * 24 * 7, // 7일
    });

    return {
      message: '엑세스 토큰 재발급 완료',
    };
  }
}
