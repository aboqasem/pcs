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
  getAllUsers: () => [...usersQueryKeys.all, 'get', 'all'] as const,
  getProfile: () => [...usersQueryKeys.all, 'profile', 'get'] as const,
};

export type TGetAllUsersData = UserDto[];
export type TGetAllUsersQueryKey = ReturnType<typeof usersQueryKeys.getAllUsers>;

export type TGetProfileData = UserDto;
export type TGetProfileQueryKey = ReturnType<typeof usersQueryKeys.getProfile>;

export type TCreateUsersBody = CreateUsersDto;
export type TCreateUsersData = CreatedUsersDto;

export class UsersService {
  static getAllUsers = async (cookie?: string): Promise<TGetAllUsersData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<TGetAllUsersData>(BffPath.Users, options).then(({ data }) => data);
  };

  static getProfile = async (cookie?: string): Promise<TGetProfileData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<TGetProfileData>(BffPath.Profile, options).then(({ data }) => data);
  };

  static createUsers = async (body: TCreateUsersBody): Promise<TCreateUsersData> => {
    return bffAxios.post<TCreateUsersData>(BffPath.Users, body).then(({ data }) => data);
  };
}

export function useAllUsersQuery<TData = TGetAllUsersData>(
  options?: UseQueryOptions<TGetAllUsersData, Error, TData, TGetAllUsersQueryKey>,
) {
  return useQuery(usersQueryKeys.getAllUsers(), () => UsersService.getAllUsers(), {
    staleTime: 60 * 1000,
    ...options,
  });
}

export function useProfileQuery<TData = TGetProfileData>(
  options?: UseQueryOptions<TGetProfileData, HttpException, TData, TGetProfileQueryKey>,
) {
  const queryCLient = useQueryClient();
  const { push } = useRouter();

  return useQuery(usersQueryKeys.getProfile(), () => UsersService.getProfile(), {
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
      usersQueryKeys.getProfile(),
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
