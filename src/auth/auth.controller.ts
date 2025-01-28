import {
  Controller,
  Post,
  Body,
  Res,
  Req,
  Get,
  UseGuards,
  HttpCode,
  UnauthorizedException,
  Inject,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { LoginUserDto } from './dto/login-user.dto';
import { Response as ExpressResponse, Request } from 'express';
import { RegisterUserDto } from './dto/register-user.dto';
import { ConfigService } from '@nestjs/config';
import { KakaoAuthGuard } from './guard/auth.guard';
import { SocialUser } from './decorator/user.decorator';
import { SocialLoginDto } from './dto/social-login.dto';
import { IAuthService } from './interface/auth.service.interface';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import { AuthenticatedRequest, JwtAuthGuard } from './guard/jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    @Inject('IAuthService')
    private readonly authService: IAuthService,
    private readonly configService: ConfigService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  @Post('send-verification')
  @ApiOperation({
    summary: '인증번호 발송',
    description: '사용자의 이메일로 인증번호를 발송합니다.',
  })
  @ApiResponse({ status: 201, description: '인증번호가 발송되었습니다.' })
  @ApiBody({ schema: { example: { email: 'example@example.com' } } })
  async sendVerificationCode(@Body('email') email: string) {
    await this.authService.sendVerificationCode(email);
    return { message: '인증번호가 발송되었습니다.' };
  }

  @Post('verify-code')
  @ApiOperation({
    summary: '인증번호 검증',
    description: '발송된 인증번호를 검증합니다.',
  })
  @ApiResponse({ status: 200, description: '이메일 인증이 완료되었습니다.' })
  @ApiBody({
    schema: { example: { email: 'example@example.com', code: '123456' } },
  })
  async verifyCode(@Body() { email, code }: { email: string; code: string }) {
    await this.authService.verifyCode(email, code);
    return { message: '이메일 인증이 완료되었습니다.' };
  }

  @Post('register')
  @ApiOperation({
    summary: '회원가입',
    description: '새로운 사용자를 등록합니다.',
  })
  @ApiResponse({ status: 201, description: '회원가입 성공.' })
  @ApiBody({ type: RegisterUserDto })
  async register(@Body() registerUserDto: RegisterUserDto) {
    return await this.authService.register(registerUserDto);
  }

  @Post('logout')
  @ApiOperation({
    summary: '로그아웃',
    description: '사용자를 로그아웃시킵니다.',
  })
  @ApiResponse({ status: 200, description: '로그아웃 성공.' })
  logout(@Res() res: ExpressResponse): void {
    res.clearCookie('accessToken', {
      httpOnly: true,
      secure: false, // HTTPS에서만 전송
      sameSite: 'strict',
    });
    res.status(200).send({ message: '로그아웃 성공' });
  }
  @Get('kakao-logout')
  @UseGuards(JwtAuthGuard)
  @ApiOperation({
    summary: '카카오 로그아웃',
    description: '카카오 사용자를 로그아웃시킵니다.',
  })
  @ApiResponse({ status: 200, description: '로그아웃 성공.' })
  async kakaoLogout(@Req() req: AuthenticatedRequest, @Res() res: ExpressResponse) {
    try {
      // 레디스에서 accessToken 가져오기
      const token = req.cookies['accessToken'];  // 쿠키에서 이메일을 가져온다고 가정
      if (!token) {
        throw new UnauthorizedException('쿠키가 존재하지않음');
      }
      const user = req.user;  // 인증된 사용자 정보 가져오기

      // 레디스에서 해당 사용자 이메일로 토큰을 가져옴
      const userKey = `user:${user.email}`;
      const userValue = await this.cacheManager.get<string>(userKey);
      if (!userValue) {
        throw new UnauthorizedException('사용자 정보가 레디스에 존재하지 않습니다.');
      }
      
      const { kakaoAccessToken } = JSON.parse(userValue);
      
      if (!kakaoAccessToken) {
        throw new UnauthorizedException('카카오 토큰이 존재하지 않습니다.');
      }
  
      // 카카오 로그아웃 호출
      await this.authService.logoutFromKakao(kakaoAccessToken);
  
      // 쿠키 삭제
      res.clearCookie('accessToken');
      return res.status(HttpStatus.OK).send({ message: '로그아웃 성공' });
    } catch (error) {
      console.error('Logout Error:', error);
      throw new HttpException(error.message, HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '로그인', description: '사용자를 로그인시킵니다.' })
  @ApiResponse({ status: 200, description: '로그인 성공.' })
  @ApiBody({ type: LoginUserDto })
  async login(
    @Body() loginUserDto: LoginUserDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, refreshToken, email } =
      await this.authService.login(loginUserDto);

    const isProduction = this.configService.get<string>('ENV') === 'prod';

    res.cookie('accessToken', accessToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 3600000, // 1시간
    });

    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: 'strict',
      maxAge: 3600000, // 1시간
    });

    return { message: '로그인 성공', email };
  }

  @Get('kakao-login')
  @UseGuards(KakaoAuthGuard)
  @ApiOperation({
    summary: '카카오 로그인',
    description: '카카오 계정을 이용한 소셜 로그인을 수행합니다.',
  })
  @ApiResponse({ status: 200, description: '카카오 로그인 성공' })
  async kakaoLogin(
    @SocialUser() socialUser: SocialLoginDto,
    @Res({ passthrough: true }) res: ExpressResponse,
  ) {
    const { accessToken, refreshToken, email } =
      await this.authService.OAuthLogin(socialUser);

    res.cookie('refreshToken', refreshToken, { httpOnly: true });
    res.cookie('accessToken', accessToken, { httpOnly: true });
    res.redirect(`http://localhost:3000/sign-in?fromKaKao=true&email=${email}`);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({
    summary: '엑세스 토큰 재발급',
    description:
      '리프레쉬 토큰을 이용하여 새로운 엑세스 토큰과 리프레쉬 토큰을 발급합니다.',
  })
  @ApiResponse({
    status: 200,
    description: '엑세스 토큰이 재발급되었습니다.',
    schema: {
      example: { message: '엑세스 토큰 재발급 완료' },
    },
  })
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
