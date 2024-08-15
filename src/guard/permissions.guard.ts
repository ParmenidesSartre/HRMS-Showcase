import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PrismaService } from '../prisma/prisma.service';
import { Request } from 'express';
import { MethodToPermissionMap } from '../auth/constants/permissions-map';
import { User } from '@prisma/client';

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector, private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: Request = context.switchToHttp().getRequest();
    const user = request.user as User;

    if (!user) {
      throw new ForbiddenException('User not authenticated');
    }

    // Determine the required permission based on the HTTP method
    const method = request.method;
    const permission = MethodToPermissionMap[method];
    const resource = this.reflector.get<string>(
      'resource',
      context.getHandler(),
    );

    console.log(resource, permission);

    if (!permission || !resource) {
      return true; // If no mapping or resource is found, allow access by default
    }

    // Get the user's role with permissions
    const role = await this.prisma.role.findUnique({
      where: { id: user.roleId },
      include: {
        permissions: {
          include: {
            Module: true, // Correctly include the related Module
          },
        },
        RoleSubModulePermission: {
          include: {
            subModule: true, // Correctly include the related SubModule
          },
        },
      },
    });

    if (!role) {
      throw new ForbiddenException('Role not found');
    }

    // Check if the user has the required permission for the resource
    const hasPermission =
      role.permissions.some(
        (perm) => perm.Module?.name === resource && perm[permission],
      ) ||
      role.RoleSubModulePermission.some(
        (perm) => perm.subModule?.name === resource && perm[permission],
      );

    if (!hasPermission) {
      throw new ForbiddenException('Access denied');
    }

    return true;
  }
}
