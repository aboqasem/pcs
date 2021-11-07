import { CreatedUsersDto, CreateUsersDto, UserDto } from './users.classes';

export type UsersGetAllUsersData = UserDto[];

export type UsersGetProfileData = UserDto;

export class UsersCreateUsersBody extends CreateUsersDto {}
export type UsersCreateUsersData = CreatedUsersDto;
