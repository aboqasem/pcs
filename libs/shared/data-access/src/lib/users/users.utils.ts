import { plainToClass } from 'class-transformer';
import { User, UserDto } from './users.classes';

export const userToUserDto = ({ password: _, ...dto }: User): UserDto => plainToClass(UserDto, dto);
