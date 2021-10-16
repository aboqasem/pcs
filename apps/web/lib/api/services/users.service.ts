import { bffAxios } from '@/lib/api/axios.config';
import { BffPath, PagePath } from '@/lib/constants';
import { CreatedUsersDto, CreateUsersDto, HttpException, UserDto } from '@pcs/shared-data-access';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import {
  FetchQueryOptions,
  QueryClient,
  useMutation,
  UseMutationOptions,
  useQuery,
  useQueryClient,
  UseQueryOptions,
} from 'react-query';

export const usersQueryKeys = {
  all: ['users'] as const,
  list: () => [...usersQueryKeys.all, 'list'] as const,
  profile: () => [...usersQueryKeys.all, 'profile'] as const,
};

export type TAllUsersData = UserDto[];
export type TAllUsersQueryKey = ReturnType<typeof usersQueryKeys.list>;

export type TGetProfileData = UserDto;
export type TGetProfileQueryKey = ReturnType<typeof usersQueryKeys.profile>;

export type TCreateUsersBody = CreateUsersDto;
export type TCreateUsersData = CreatedUsersDto;

export class UsersService {
  static getAll = async (cookie?: string): Promise<TAllUsersData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get(BffPath.Users, options);
  };

  static getProfile = async (cookie?: string): Promise<TGetProfileData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get(BffPath.Profile, options);
  };

  static createUsers = async (body: TCreateUsersBody): Promise<TCreateUsersData> => {
    return bffAxios.post(BffPath.Users, body);
  };
}

export function useAllUsersQuery<TData = TAllUsersData>(
  options?: UseQueryOptions<TAllUsersData, Error, TData, TAllUsersQueryKey>,
) {
  return useQuery(usersQueryKeys.list(), () => UsersService.getAll(), {
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useProfileQuery<TData = TGetProfileData>(
  options?: UseQueryOptions<TGetProfileData, HttpException, TData, TGetProfileQueryKey>,
) {
  const queryCLient = useQueryClient();
  const { push } = useRouter();

  return useQuery(usersQueryKeys.profile(), () => UsersService.getProfile(), {
    staleTime: 60 * 1000,
    onSettled: async (user, error) => {
      if (!user) {
        await push(PagePath.SignIn);
      }
      if (error) {
        if (error.status === 403) {
          queryCLient.removeQueries();
        }
        toast.error(error.message, { id: 'profileError' });
      }
    },
    ...options,
  });
}

export function fetchProfile<TData = TGetProfileData>(
  cookie?: string,
  queryClient?: QueryClient,
  options?: FetchQueryOptions<TGetProfileData, HttpException, TData, TGetProfileQueryKey>,
) {
  if (queryClient) {
    return queryClient.fetchQuery(
      usersQueryKeys.profile(),
      () => UsersService.getProfile(cookie),
      options,
    );
  }
  return UsersService.getProfile(cookie);
}

export function useCreateUsersMutation(
  options?: UseMutationOptions<TCreateUsersData, HttpException, TCreateUsersBody>,
) {
  return useMutation(UsersService.createUsers, options);
}
