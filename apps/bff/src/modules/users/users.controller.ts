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

  @Get('profile')
  @UserAuth()
  profile(@Req() req: Request): UserDto {
    return req.user!;
  }

  @Post()
  @UserAuth({ roles: [UserRole.Admin] })
  async create(@Body() dto: CreateUsersDto): Promise<CreatedUsersDto> {
    try {
      return await this.usersService.createUsers(dto);
    } catch (e) {
      if (e instanceof ValidationException) {
        throw new BadPayloadException(e.errors);
      }
      throw e;
    }
  }
}
