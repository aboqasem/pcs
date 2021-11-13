import { CreatedUsersDto, CreateUsersDto, UserDto } from './users.classes';

export type TUsersGetAllUsersData = UserDto[];

export type TUsersGetProfileData = UserDto;

export class UsersCreateUsersBody extends CreateUsersDto {}
export type TUsersCreateUsersData = CreatedUsersDto;
