import { usersQueryKeys } from '@/lib/api';
import { bffAxios } from '@/lib/api/axios.config';
import { BffPath, PagePath } from '@/lib/constants';
import { HttpException, RetrievePasswordDto, SignInDto, UserDto } from '@pcs/shared-data-access';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';

export type TSignInBody = SignInDto;
export type TSignInData = UserDto;

export type TSignOutData = true;

export type TRetrievePasswordBody = RetrievePasswordDto;
export type TRetrievePasswordData = true;

export class AuthService {
  static signIn = async (body: TSignInBody): Promise<TSignInData> => {
    return bffAxios.post<TSignInData>(BffPath.SignIn, body).then(({ data }) => data);
  };

  static signOut = async (): Promise<TSignOutData> => {
    return bffAxios.post<TSignOutData>(BffPath.SignOut).then(({ data }) => data);
  };

  static retrievePassword = async (body: TRetrievePasswordBody): Promise<TRetrievePasswordData> => {
    return bffAxios
      .post<TRetrievePasswordData>(BffPath.RetrievePassword, body)
      .then(({ data }) => data);
  };
}

export function useSignInMutation(
  options?: UseMutationOptions<TSignInData, HttpException, TSignInBody>,
) {
  const queryCLient = useQueryClient();

  return useMutation(AuthService.signIn, {
    onSettled: (user) => {
      if (user) {
        queryCLient.setQueryData(usersQueryKeys.getProfile(), user);
      }
    },
    onError: (error) => {
      toast.error(error.message, { id: 'signInError' });
    },
    ...options,
  });
}

export function useSignOutMutation(options?: UseMutationOptions<TSignOutData, HttpException>) {
  const queryClient = useQueryClient();
  const { push } = useRouter();

  return useMutation(AuthService.signOut, {
    onSettled: async () => {
      await push(PagePath.SignIn);
      queryClient.removeQueries();
    },
    ...options,
  });
}

export function useRetrievePasswordMutation(
  options?: UseMutationOptions<TRetrievePasswordData, HttpException, TRetrievePasswordBody>,
) {
  const { push, query } = useRouter();

  return useMutation(AuthService.retrievePassword, {
    onSuccess: () => {
      toast.success('An email containing your credentials has been sent to you!', {
        duration: 5000,
      });
      push(PagePath.SignIn, { query });
    },
    ...options,
  });
}
