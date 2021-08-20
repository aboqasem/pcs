import { CreatedUserDto, SignUpUserDto } from '@myplatform/shared-data-access';
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/app/resources/users/users.service';

@Injectable()
export class AuthService {
  constructor(private readonly usersService: UsersService) {}

  signUp(dto: SignUpUserDto): Promise<CreatedUserDto> {
    return this.usersService.createUser(dto);
  }
}
