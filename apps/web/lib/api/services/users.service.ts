import { BffPath, PagePath } from '@/lib/constants/shared.constants';
import {
  HttpException,
  TReplace,
  UserRole,
  UsersCreateUsersBody,
  TUsersCreateUsersData,
  TUsersGetAllUsersData,
  TUsersGetProfileData,
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
  static getAllUsers = async (cookie?: string): Promise<TUsersGetAllUsersData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<TUsersGetAllUsersData>(BffPath.Users, options).then(({ data }) => data);
  };

  static getProfile = async (cookie?: string): Promise<TUsersGetProfileData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<TUsersGetProfileData>(BffPath.Profile, options).then(({ data }) => data);
  };

  static createUsers = async (body: UsersCreateUsersBody): Promise<TUsersCreateUsersData> => {
    return bffAxios.post<TUsersCreateUsersData>(BffPath.Users, body).then(({ data }) => data);
  };
}

export function useAllUsersQuery<TData = TUsersGetAllUsersData>(
  options?: UseQueryOptions<TUsersGetAllUsersData, Error, TData, TGetAllUsersQueryKey>,
) {
  return useQuery(usersQueryKeys.getAllUsers(), () => UsersService.getAllUsers(), {
    ...options,
  });
}

export function useProfileQuery<TRole extends UserRole = UserRole, TData = TUsersGetProfileData>(
  options?: UseQueryOptions<
    TUsersGetProfileData,
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

export function fetchProfile<TData = TUsersGetProfileData>(
  cookie?: string,
  queryClient?: QueryClient,
  options?: FetchQueryOptions<TUsersGetProfileData, HttpException, TData, TGetProfileQueryKey>,
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
  options?: UseMutationOptions<TUsersCreateUsersData, HttpException, UsersCreateUsersBody>,
) {
  return useMutation(UsersService.createUsers, options);
}
