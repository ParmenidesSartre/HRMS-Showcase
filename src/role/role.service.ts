import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  Role,
  RoleModulePermission,
  RoleSubModulePermission,
  Module,
  SubModule,
} from '@prisma/client';

@Injectable()
export class RoleService {
  constructor(private prisma: PrismaService) {}

  // Create a new role
  async createRole(name: string): Promise<Role> {
    return this.prisma.role.create({
      data: { name },
    });
  }

  // Update an existing role
  async updateRole(id: number, name: string): Promise<Role> {
    return this.prisma.role.update({
      where: { id },
      data: { name },
    });
  }

  // Delete a role
  async deleteRole(id: number): Promise<Role> {
    return this.prisma.role.delete({
      where: { id },
    });
  }

  // Get all roles
  async getAllRoles(): Promise<Role[]> {
    return this.prisma.role.findMany();
  }

  // Get a role by ID with associated permissions
  async getRoleById(id: number): Promise<Role | null> {
    return this.prisma.role.findUnique({
      where: { id },
      include: {
        permissions: true, // Include module permissions
        RoleSubModulePermission: true, // Include submodule permissions
      },
    });
  }

  // Assign permissions to a module for a role
  async assignModulePermission(
    roleId: number,
    moduleId: number,
    canCreate: boolean,
    canRead: boolean,
    canUpdate: boolean,
    canDelete: boolean,
    canDownload: boolean,
  ): Promise<RoleModulePermission> {
    return this.prisma.roleModulePermission.create({
      data: {
        roleId,
        moduleId,
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        canDownload,
      },
    });
  }

  // Assign permissions to a submodule for a role
  async assignSubModulePermission(
    roleId: number,
    subModuleId: number,
    canCreate: boolean,
    canRead: boolean,
    canUpdate: boolean,
    canDelete: boolean,
    canDownload: boolean,
  ): Promise<RoleSubModulePermission> {
    return this.prisma.roleSubModulePermission.create({
      data: {
        roleId,
        subModuleId,
        canCreate,
        canRead,
        canUpdate,
        canDelete,
        canDownload,
      },
    });
  }

  // Revoke a module permission
  async revokeModulePermission(
    roleId: number,
    moduleId: number,
  ): Promise<RoleModulePermission> {
    return this.prisma.roleModulePermission.delete({
      where: {
        roleId_moduleId: { roleId, moduleId },
      },
    });
  }

  // Revoke a submodule permission
  async revokeSubModulePermission(
    roleId: number,
    subModuleId: number,
  ): Promise<RoleSubModulePermission> {
    return this.prisma.roleSubModulePermission.delete({
      where: {
        roleId_subModuleId: { roleId, subModuleId },
      },
    });
  }

  // Get all modules
  async getAllModules(): Promise<Module[]> {
    return this.prisma.module.findMany();
  }

  // Get all submodules for a specific module
  async getSubModulesByModuleId(moduleId: number): Promise<SubModule[]> {
    return this.prisma.subModule.findMany({
      where: { moduleId },
    });
  }
}
