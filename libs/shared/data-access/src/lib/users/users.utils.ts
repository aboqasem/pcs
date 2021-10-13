import { plainToClass } from 'class-transformer';
import { User, UserDto } from './users.classes';

export const userToUserDto = ({ password, ...dto }: User): UserDto => plainToClass(UserDto, dto);
