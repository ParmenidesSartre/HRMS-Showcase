import {
  Injectable,
  ConflictException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHmac } from 'crypto';

@Injectable()
export class UserService {
  constructor(private prisma: PrismaService) {}

  async createUser(data: any) {
    const existingUser = await this.findByEmail(data.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create a new tenant
    const tenant = await this.prisma.tenant.create({
      data: {
        name: data.email.split('@')[0], // Use part of email as tenant name
        isActive: true,
      },
    });

    const userRole = await this.prisma.role.findUnique({
      where: { name: 'SuperAdmin' },
    });

    if (!userRole) {
      throw new NotFoundException('Default role not found');
    }

    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        tenant: {
          connect: { id: tenant.id },
        },
        role: {
          connect: { id: userRole.id },
        },
      },
      include: { role: true },
    });

    return user;
  }

  async findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });
  }

  async updateUser(userId: number, data: Prisma.UserUpdateInput) {
    return await this.prisma.user.update({
      where: { id: userId },
      data: data,
      include: { role: true },
    });
  }

  async createPasswordResetToken(email: string): Promise<string> {
    const user = await this.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const resetToken = randomBytes(20).toString('hex');
    const hash = createHmac('sha256', process.env.RESET_TOKEN_SECRET)
      .update(resetToken)
      .digest('hex');
    const expires = new Date(Date.now() + 3600000);

    await this.prisma.user.update({
      where: { email },
      data: {
        passwordResetToken: hash,
        passwordTokenExpires: expires,
      },
    });

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<any> {
    const hash = createHmac('sha256', process.env.RESET_TOKEN_SECRET)
      .update(token)
      .digest('hex');

    const user = await this.prisma.user.findFirst({
      where: {
        passwordResetToken: hash,
        passwordTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new UnauthorizedException('Token is invalid or has expired');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    return this.prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordTokenExpires: null,
      },
    });
  }

  async getUserById(userId: number) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      include: { role: true },
    });
  }
}
