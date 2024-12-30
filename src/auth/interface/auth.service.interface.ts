import { Role } from "src/user/entities/user.entity";
import { LoginUserDto } from "../dto/login-user.dto";
import { RegisterUserDto } from "../dto/register-user.dto";
import { SocialLoginDto } from "../dto/social-login.dto";

export interface IAuthService  {
    sendVerificationCode(email: string): Promise<void>;
    verifyCode(email: string, code: string): Promise<string>;
    register(registerUserDto: RegisterUserDto): Promise<string>;
    login(loginUserDto: LoginUserDto): Promise<{ accessToken: string; refreshToken: string }>;
    OAuthLogin(socialLoginDto: SocialLoginDto): Promise<{ accessToken: string; refreshToken: string }>;
    issueToken(user: { id: string; email: string; role: Role },  isRefreshToken: boolean): Promise<string>;
    refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; refreshToken: string }>;
}