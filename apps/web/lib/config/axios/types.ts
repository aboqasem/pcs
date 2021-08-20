/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-empty-interface */
import { BffPath } from '@/lib/constants';
import { AsData, SignInUserDto, SignUpUserDto, UserDto } from '@myplatform/shared-data-access';
import { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export interface GetPathTypes {
  [BffPath.Me]: {
    response: AsData<UserDto> | Record<string, never>;
  };
}

export interface DeletePathTypes {
  [k: string]: {
    response?: never;
  };
}

export interface PostPathTypes {
  [BffPath.SignUp]: {
    body: SignUpUserDto;
    response: AsData<UserDto>;
  };
  [BffPath.SignIn]: {
    body: SignInUserDto;
    response: AsData<UserDto>;
  };
  [BffPath.SignOut]: {
    body?: never;
    response: AsData<Record<string, never>>;
  };
}

export interface PutPathTypes {
  [k: string]: {
    body?: never;
    response?: never;
  };
}

export interface PatchPathTypes {
  [k: string]: {
    body?: never;
    response?: never;
  };
}

export interface BffAxiosInstance
  extends Omit<AxiosInstance, 'get' | 'delete' | 'post' | 'put' | 'patch'> {
  get<P extends keyof GetPathTypes>(
    url: P,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<GetPathTypes[P]['response']>>;

  delete<P extends keyof DeletePathTypes>(
    url: string,
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<DeletePathTypes[P]['response']>>;

  post<P extends keyof PostPathTypes>(
    url: P,
    body?: PostPathTypes[P]['body'],
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<PostPathTypes[P]['response']>>;

  put<P extends keyof PutPathTypes>(
    url: string,
    body?: PutPathTypes[P]['body'],
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<PutPathTypes[P]['response']>>;

  patch<P extends keyof PatchPathTypes>(
    url: string,
    body?: PatchPathTypes[P]['body'],
    config?: AxiosRequestConfig,
  ): Promise<AxiosResponse<PatchPathTypes[P]['response']>>;
}
