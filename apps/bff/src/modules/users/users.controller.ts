import { Body, Controller, Get, Post, Req } from '@nestjs/common';
import {
  CreatedUsersDto,
  CreateUsersDto,
  UserDto,
  UserRole,
  ValidationException,
} from '@pcs/shared-data-access';
import { Request } from 'express';
import { BadPayloadException } from 'src/shared/exceptions/bad-payload.exception';
import { UserAuth } from '../auth/decorators/user-auth.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @UserAuth({ roles: [UserRole.Admin] })
  async getAll(): Promise<UserDto[]> {
    return this.usersService.getAllUsers();
  }

  @Get('profile')
  @UserAuth()
  getProfile(@Req() req: Request): UserDto {
    return req.user!;
  }

  @Post()
  @UserAuth({ roles: [UserRole.Admin] })
  async createUsers(@Body() dto: CreateUsersDto): Promise<CreatedUsersDto> {
    try {
      return await this.usersService.createAndInformUsers(dto);
    } catch (e) {
      if (e instanceof ValidationException) {
        throw new BadPayloadException(e.errors);
      }
      throw e;
    }
  }
}
