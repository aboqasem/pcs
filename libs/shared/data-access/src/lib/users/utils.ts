import { User, UserDto } from './classes';

export const userToDto = ({ secret, ...dto }: User): UserDto => dto;
