import { BffPath, PagePath } from '@/lib/constants/shared.constants';
import {
  HttpError,
  TReplace,
  TUsersCreateUsersData,
  TUsersGetProfileData,
  TUsersGetUsersData,
  UserRole,
  UsersCreateUsersBody,
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
  getUsers: () => [...usersQueryKeys.all, 'get'] as const,
  getProfile: () => [...usersQueryKeys.all, 'profile', 'get'] as const,
};

export type TGetUsersQueryKey = ReturnType<typeof usersQueryKeys.getUsers>;

export type TGetProfileQueryKey = ReturnType<typeof usersQueryKeys.getProfile>;

export class UsersService {
  static getUsers = async (cookie?: string): Promise<TUsersGetUsersData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<TUsersGetUsersData>(BffPath.Users, options).then(({ data }) => data);
  };

  static getProfile = async (cookie?: string): Promise<TUsersGetProfileData> => {
    const options = cookie ? { headers: { cookie } } : {};
    return bffAxios.get<TUsersGetProfileData>(BffPath.Profile, options).then(({ data }) => data);
  };

  static createUsers = async (body: UsersCreateUsersBody): Promise<TUsersCreateUsersData> => {
    return bffAxios.post<TUsersCreateUsersData>(BffPath.Users, body).then(({ data }) => data);
  };
}

export function useUsersQuery<TData = TUsersGetUsersData>(
  options?: UseQueryOptions<TUsersGetUsersData, Error, TData, TGetUsersQueryKey>,
) {
  return useQuery(usersQueryKeys.getUsers(), () => UsersService.getUsers(), {
    ...options,
  });
}

export function useProfileQuery<TRole extends UserRole = UserRole, TData = TUsersGetProfileData>(
  options?: UseQueryOptions<
    TUsersGetProfileData,
    HttpError,
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
  options?: FetchQueryOptions<TUsersGetProfileData, HttpError, TData, TGetProfileQueryKey>,
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
  options?: UseMutationOptions<TUsersCreateUsersData, HttpError, UsersCreateUsersBody>,
) {
  return useMutation(UsersService.createUsers, options);
}
