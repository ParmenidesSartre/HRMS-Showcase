import {
  Controller,
  Request,
  Post,
  UseGuards,
  Body,
  HttpCode,
  HttpStatus,
  ConflictException,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(@Request() req) {
    return this.authService.login(req.user);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async register(
    @Body('email') email: string,
    @Body('password') password: string,
  ) {
    try {
      const userData = { email, password };
      await this.authService.register(userData);
    } catch (error) {
      if (error.status === HttpStatus.CONFLICT) {
        throw new ConflictException('Email already exists');
      }
      throw error;
    }
  }

  @Post('forgot-password')
  async forgotPassword(@Body('email') email: string) {
    const message = await this.authService.forgotPassword(email);
    return { message };
  }

  @Post('reset-password')
  async resetPassword(
    @Body('token') token: string,
    @Body('password') newPassword: string,
  ) {
    const message = await this.authService.resetPassword(token, newPassword);
    return { message };
  }

  @UseGuards(JwtAuthGuard)
  @Post('profile')
  getProfile(@Request() req) {
    return req.user;
  }
}
