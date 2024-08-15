import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { RoleService } from './role.service';
import { PermissionsGuard } from '../guard/permissions.guard';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { Resource } from '../decorators/resource.decorator';

@Controller('roles')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Resource('Role')
  createRole(@Body('name') name: string) {
    return this.roleService.createRole(name);
  }

  @Patch(':id')
  @Resource('Role')
  updateRole(@Param('id') id: number, @Body('name') name: string) {
    return this.roleService.updateRole(id, name);
  }

  @Delete(':id')
  @Resource('Role')
  deleteRole(@Param('id') id: number) {
    return this.roleService.deleteRole(id);
  }

  @Get()
  @Resource('Role')
  getAllRoles() {
    return this.roleService.getAllRoles();
  }

  @Get(':id')
  @Resource('Role')
  getRoleById(@Param('id') id: number) {
    return this.roleService.getRoleById(id);
  }

  @Post(':id/permissions/module')
  @Resource('Permission')
  assignModulePermission(
    @Param('id') roleId: number,
    @Body('moduleId') moduleId: number,
    @Body('canCreate') canCreate: boolean,
    @Body('canRead') canRead: boolean,
    @Body('canUpdate') canUpdate: boolean,
    @Body('canDelete') canDelete: boolean,
    @Body('canDownload') canDownload: boolean,
  ) {
    return this.roleService.assignModulePermission(
      roleId,
      moduleId,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
      canDownload,
    );
  }

  @Post(':id/permissions/submodule')
  @Resource('Permission')
  assignSubModulePermission(
    @Param('id') roleId: number,
    @Body('subModuleId') subModuleId: number,
    @Body('canCreate') canCreate: boolean,
    @Body('canRead') canRead: boolean,
    @Body('canUpdate') canUpdate: boolean,
    @Body('canDelete') canDelete: boolean,
    @Body('canDownload') canDownload: boolean,
  ) {
    return this.roleService.assignSubModulePermission(
      roleId,
      subModuleId,
      canCreate,
      canRead,
      canUpdate,
      canDelete,
      canDownload,
    );
  }

  @Delete('permissions/module/:roleId/:moduleId')
  @Resource('Permission')
  revokeModulePermission(
    @Param('roleId') roleId: number,
    @Param('moduleId') moduleId: number,
  ) {
    return this.roleService.revokeModulePermission(roleId, moduleId);
  }

  @Delete('permissions/submodule/:roleId/:subModuleId')
  @Resource('Permission')
  revokeSubModulePermission(
    @Param('roleId') roleId: number,
    @Param('subModuleId') subModuleId: number,
  ) {
    return this.roleService.revokeSubModulePermission(roleId, subModuleId);
  }
}
