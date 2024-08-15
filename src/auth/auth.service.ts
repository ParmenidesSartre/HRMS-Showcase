import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    if (!user.password || !password) {
      throw new UnauthorizedException('Missing password data');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (isMatch) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user) {
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload, {
        secret: process.env.JWT_SECRET,
        expiresIn: process.env.JWT_EXPIRATION,
      }),
    };
  }

  async register(data: any) {
    return this.userService.createUser(data);
  }

  async forgotPassword(email: string) {
    const token = await this.userService.createPasswordResetToken(email);
    console.log(token);
    // Here you would typically send the token to the user's email
    // For example, using an email service like SendGrid, Mailgun, etc.
    return 'Check your email for password reset instructions';
  }

  async resetPassword(token: string, newPassword: string) {
    await this.userService.resetPassword(token, newPassword);
    return { message: 'Password reset successfully' };
  }
}
