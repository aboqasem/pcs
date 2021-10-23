import { transformToOtherSync } from '../shared/transformation.utils';
import { User, UserDto } from './users.classes';

export const userToUserDto = (user: User): UserDto => {
  return transformToOtherSync(UserDto, user);
};
