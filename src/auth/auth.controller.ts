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
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiTags, ApiOperation, ApiResponse, ApiBody, ApiQuery } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { Response as ExpressResponse } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { KakaoAuthGuard } from './guard/auth.guard';
import { SocialUser } from './decorator/user.decorator';
import { SocialLoginDto } from './dto/social-login.dto';


@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('send-verification')
  @ApiOperation({ summary: '인증번호 발송', description: '사용자의 이메일로 인증번호를 발송합니다.' })
  @ApiResponse({ status: 201, description: '인증번호가 발송되었습니다.' })
  @ApiBody({ schema: { example: { email: 'example@example.com' } } })
  async sendVerificationCode(@Body('email') email: string) {
    await this.authService.sendVerificationCode(email);
    return { message: '인증번호가 발송되었습니다.' };
  }

  @Post('verify-code')
  @ApiOperation({ summary: '인증번호 검증', description: '발송된 인증번호를 검증합니다.' })
  @ApiResponse({ status: 200, description: '이메일 인증이 완료되었습니다.' })
  @ApiBody({ schema: { example: { email: 'example@example.com', code: '123456' } } })
  async verifyCode(@Body() { email, code }: { email: string; code: string }) {
    await this.authService.verifyCode(email, code);
    return { message: '이메일 인증이 완료되었습니다.' };
  }

  @Post('register')
  @ApiOperation({ summary: '회원가입', description: '새로운 사용자를 등록합니다.' })
  @ApiResponse({ status: 201, description: '회원가입 성공.' })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Post('logout')
  @ApiOperation({ summary: '로그아웃', description: '사용자를 로그아웃시킵니다.' })
  @ApiResponse({ status: 200, description: '로그아웃 성공.' })
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
  @ApiOperation({ summary: '로그인', description: '사용자를 로그인시킵니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공.' })
  @ApiBody({ type: LoginUserDto })
  async login(@Body() loginUserDto: LoginUserDto, @Res({ passthrough: true }) res: ExpressResponse) {
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

    return {message: "로그인 성공"};
  }

  @Get('kakao-login')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 계정을 이용한 소셜 로그인을 수행합니다.',
  })
  @ApiResponse({ status: 302, description: '로그인 성공 후 리다이렉션.' })
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
}
