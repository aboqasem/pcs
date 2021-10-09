import { UserDto, UserType } from './users.classes';

export const userToDto = ({ password, ...dto }: UserType): UserDto => dto;
