import { BffPath, PagePath } from '@/lib/constants';
import {
  HttpException,
  TReplace,
  UserRole,
  UsersCreateUsersBody,
  UsersCreateUsersData,
  UsersGetAllUsersData,
  UsersGetProfileData,
} from '@pcs/shared-data-access';
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
import { bffAxios } from '../axios.config';

export const usersQueryKeys = {
  all: ['users'] as const,
  getAllUsers: () => [...usersQueryKeys.all, 'get', 'all'] as const,
  getProfile: () => [...usersQueryKeys.all, 'profile', 'get'] as const,
};

export type TGetAllUsersQueryKey = ReturnType<typeof usersQueryKeys.getAllUsers>;

export type TGetProfileQueryKey = ReturnType<typeof usersQueryKeys.getProfile>;

export class UsersService {
  static getAllUsers = async (cookie?: string): Promise<UsersGetAllUsersData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<UsersGetAllUsersData>(BffPath.Users, options).then(({ data }) => data);
  };

  static getProfile = async (cookie?: string): Promise<UsersGetProfileData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<UsersGetProfileData>(BffPath.Profile, options).then(({ data }) => data);
  };

  static createUsers = async (body: UsersCreateUsersBody): Promise<UsersCreateUsersData> => {
    return bffAxios.post<UsersCreateUsersData>(BffPath.Users, body).then(({ data }) => data);
  };
}

export function useAllUsersQuery<TData = UsersGetAllUsersData>(
  options?: UseQueryOptions<UsersGetAllUsersData, Error, TData, TGetAllUsersQueryKey>,
) {
  return useQuery(usersQueryKeys.getAllUsers(), () => UsersService.getAllUsers(), {
    ...options,
  });
}

export function useProfileQuery<TRole extends UserRole = UserRole, TData = UsersGetProfileData>(
  options?: UseQueryOptions<
    UsersGetProfileData,
    HttpException,
    TReplace<TData, { role: TRole }>,
    TGetProfileQueryKey
  >,
) {
  const queryCLient = useQueryClient();
  const { push } = useRouter();

  return useQuery(usersQueryKeys.getProfile(), () => UsersService.getProfile(), {
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

export function fetchProfile<TData = UsersGetProfileData>(
  cookie?: string,
  queryClient?: QueryClient,
  options?: FetchQueryOptions<UsersGetProfileData, HttpException, TData, TGetProfileQueryKey>,
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
  options?: UseMutationOptions<UsersCreateUsersData, HttpException, UsersCreateUsersBody>,
) {
  return useMutation(UsersService.createUsers, options);
}
