import { bffAxios } from '@/lib/api/axios.config';
import { BffPath } from '@/lib/constants';
import { CreatedUsersDto, CreateUsersDto, HttpException, UserDto } from '@pcs/shared-data-access';
import {
  FetchQueryOptions,
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQuery,
  UseQueryOptions,
} from 'react-query';

export const usersQueryKeys = {
  all: ['users'] as const,
  profile: () => [...usersQueryKeys.all, 'profile'] as const,
};

export type TProfileData = UserDto;
export type TProfileQueryKey = ReturnType<typeof usersQueryKeys.profile>;

export type TCreateUsersVariables = CreateUsersDto;
export type TCreateUsersData = CreatedUsersDto;

export class UsersService {
  static profile = async (cookie?: string): Promise<TProfileData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get(BffPath.Profile, options);
  };

  static create = async (body: TCreateUsersVariables): Promise<TCreateUsersData> => {
    return bffAxios.post(BffPath.Users, body);
  };
}

export function useProfileQuery<TData = TProfileData>(
  options?: UseQueryOptions<TProfileData, HttpException, TData, TProfileQueryKey>,
) {
  return useQuery(usersQueryKeys.profile(), () => UsersService.profile(), {
    staleTime: 60 * 1000,
    ...options,
  });
}

export function fetchProfile<TData = TProfileData>(
  cookie?: string,
  queryClient?: QueryClient,
  options?: FetchQueryOptions<TProfileData, HttpException, TData, TProfileQueryKey>,
) {
  if (queryClient) {
    return queryClient.fetchQuery(
      usersQueryKeys.profile(),
      () => UsersService.profile(cookie),
      options,
    );
  }
  return UsersService.profile(cookie);
}

export function useCreateUsersMutation(
  options?: UseMutationOptions<TCreateUsersData, HttpException, TCreateUsersVariables>,
) {
  return useMutation(UsersService.create, options);
}
