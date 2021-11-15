import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  TUsersCreateUsersData,
  TUsersGetProfileData,
  TUsersGetUsersData,
  UserRole,
  UsersCreateUsersBody,
} from '@pcs/shared-data-access';
import { Request } from 'express';
import { UserAuth } from '../auth/decorators/user-auth.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UserAuth({ roles: [UserRole.Admin] })
  async getUsers(): Promise<TUsersGetUsersData> {
    return this.usersService.getUsers();
  }

  @Get('profile')
  @UserAuth()
  getProfile(@Req() req: Request): TUsersGetProfileData {
    return req.user!;
  }

  @Post()
  @UserAuth({ roles: [UserRole.Admin] })
  createUsers(@Body() dto: UsersCreateUsersBody): Promise<TUsersCreateUsersData> {
    return this.usersService.createAndInformUsers(dto);
  }
}
