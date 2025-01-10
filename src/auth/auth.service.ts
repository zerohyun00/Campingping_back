import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Role, User } from 'src/user/entities/user.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import * as nodemailer from 'nodemailer';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { SocialLoginDto } from './dto/social-login.dto';
import { IAuthService } from './interface/auth.service.interface';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AuthService implements IAuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async sendVerificationCode(email: string) {
    const user = await this.userRepository.findOne({ where: { email } });
    if (user) {
      throw new BadRequestException('이미 가입된 이메일입니다.');
    }

    const verificationCode = Math.floor(
      100000 + Math.random() * 900000,
    ).toString();
    await this.cacheManager.set(
      `VERIFICATION_CODE_${email}`,
      verificationCode,
      180,
    ); // 3분 유효

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('ENV_GMAIL_ADDRESS_KEY'),
        pass: this.configService.get<string>('ENV_GMAIL_PASSWORD_KEY'),
      },
    });

    await transporter.sendMail({
      from: this.configService.get<string>('ENV_GMAIL_ADDRESS_KEY'),
      to: email,
      subject: '이메일 인증번호',
      text: `인증번호는 ${verificationCode}입니다.`,
    });
  }

  async verifyCode(email: string, code: string) {
    const cachedCode = await this.cacheManager.get<string>(
      `VERIFICATION_CODE_${email}`,
    );

    if (!cachedCode || cachedCode !== code) {
      throw new BadRequestException('인증번호가 올바르지 않습니다.');
    }

    try {
      await this.cacheManager.set(`${email}-verified`, true, 3600);

      await this.cacheManager.del(`VERIFICATION_CODE_${email}`);

      return { message: '인증이 완료되었습니다.' };
    } catch (error) {
      await this.cacheManager.del(`${email}-verified`); // 실패시 롤백

      throw new BadRequestException('인증 처리 중 문제가 발생했습니다');
    }
  }

  async register(registerUserDto: RegisterUserDto) {
    const { email, password, nickname } = registerUserDto;

    try {
      const isVerified = await this.cacheManager.get<boolean>(
        `${email}-verified`,
      );
      if (!isVerified) {
        throw new BadRequestException('이메일 인증이 완료되지 않았습니다.');
      }

      const existingUser = await this.userRepository.findOne({
        where: { email },
      });
      if (existingUser) {
        throw new BadRequestException('이미 가입된 이메일입니다.');
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const newUser = this.userRepository.create({
        email,
        password: hashedPassword,
        nickname,
        role: Role.USER,
      });

      await this.userRepository.save(newUser);

      await this.cacheManager.del(`${email}-verified`);

      return { message: '회원가입이 완료되었습니다.', email, nickname };
    } catch (error) {
      // 캐시 삭제 중 발생한 에러는 무시하고, 나머지 에러는 그대로 던짐
      if (error instanceof BadRequestException) {
        throw error;
      }

      throw new Error('회원가입 중 문제가 발생했습니다. 다시 시도해주세요.');
    }
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.issueToken(user, false),
      this.issueToken(user, true),
    ]);

    return { accessToken, refreshToken, email: user.email };
  }

  async OAuthLogin(
    socialLoginDto: SocialLoginDto,
  ): Promise<{ accessToken: string; refreshToken: string; email: string }> {
    const { email, nickname, type } = socialLoginDto;

    let user = await this.userRepository.findOne({ where: { email } });

    if (!user) {
      user = this.userRepository.create({
        email,
        nickname,
        type, // LoginType.KAKAO
        role: Role.USER, // 기본 Role 설정
      });

      await this.userRepository.save(user);
    }

    const [accessToken, refreshToken] = await Promise.all([
      this.issueToken(user, false),
      this.issueToken(user, true),
    ]);

    return { accessToken, refreshToken, email: user.email };
  }

  async issueToken(
    user: { id: string; email: string; role: Role },
    isRefreshToken: boolean,
  ): Promise<string> {
    const secret = isRefreshToken
      ? this.configService.get<string>('JWT_REFRESH_SECRET')
      : this.configService.get<string>('JWT_ACCESS_SECRET');

    return this.jwtService.sign(
      {
        sub: user.id,
        email: user.email,
        type: isRefreshToken ? 'refresh' : 'access',
        role: user.role,
      },
      {
        secret,
        expiresIn: isRefreshToken ? '7d' : '1h',
      },
    );
  }

  async refreshAccessToken(refreshToken: string): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    let payload: any;

    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });
    } catch (err) {
      throw new UnauthorizedException('유효하지 않은 리프레시 토큰입니다.');
    }

    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
    });
    if (!user) {
      throw new UnauthorizedException('해당 사용자를 찾을 수 없습니다.');
    }

    const accessToken = await this.issueToken(user, false);
    const newRefreshToken = await this.issueToken(user, true);

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  }
}
