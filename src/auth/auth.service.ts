import {
  Injectable,
  BadRequestException,
  UnauthorizedException,
  Inject,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { LoginType, Role, User } from 'src/user/entities/user.entity';
import { Cache, CACHE_MANAGER } from '@nestjs/cache-manager';
import * as nodemailer from 'nodemailer';
import { LoginUserDto } from './dto/login-user.dto';
import { RegisterUserDto } from './dto/register-user.dto';
import { SocialLoginDto } from './dto/social-login.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  async sendVerificationCode(email: string): Promise<void> {
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
    console.log('인증번호: ', verificationCode);

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
    console.log(`Redis에서 가져온 인증번호: ${cachedCode}`);
    if (!cachedCode || cachedCode !== code) {
      throw new BadRequestException('인증번호가 올바르지 않습니다.');
    }

    await this.cacheManager.set(`${email}-verified`, true, 3600);

    await this.cacheManager.del(`VERIFICATION_CODE_${email}`);

    return { message: '인증이 완료되었습니다.' };
  }

  async register(registerUserDto: RegisterUserDto) {
    const { email, password, nickname } = registerUserDto;

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
      role: Role.user,
    });

    await this.userRepository.save(newUser);

    await this.cacheManager.del(`${email}-verified`);

    return { message: '회원가입이 완료되었습니다.', email, nickname };
  }

  async login(
    loginUserDto: LoginUserDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const { email, password } = loginUserDto;

    const user = await this.userRepository.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('이메일 또는 비밀번호가 잘못되었습니다.');
    }

    const accessToken = await this.issueToken(user, false);
    const refreshToken = await this.issueToken(user, true);

    return { accessToken, refreshToken };
  }

  async OAuthLogin(
    socialLoginDto: SocialLoginDto,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    console.log('OAuthLogin 실행, socialLoginDto:', socialLoginDto);
    const { email, nickname, type } = socialLoginDto;

    let user = await this.userRepository.findOne({ where: { email } });
    console.log('DB에서 찾은 유저:', user);

    if (!user) {
      user = this.userRepository.create({
        email,
        nickname,
        type, // LoginType.KAKAO
        role: Role.user, // 기본 Role 설정
      });

      console.log('새로운 유저 생성:', user);
      await this.userRepository.save(user);
    }

    const accessToken = await this.issueToken(user, false);
    const refreshToken = await this.issueToken(user, true);

    console.log('AccessToken : ', accessToken);
    console.log('RefreshToken : ', refreshToken);

    return { accessToken, refreshToken };
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
}
