import { BffPath, PagePath } from '@/lib/constants/shared.constants';
import {
  AuthRetrievePasswordBody,
  AuthSignInBody,
  HttpException,
  TAuthRetrievePasswordData,
  TAuthSignInData,
  TAuthSignOutData,
} from '@pcs/shared-data-access';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import { bffAxios } from '../axios.config';
import { usersQueryKeys } from './users.service';

export class AuthService {
  static signIn = async (body: AuthSignInBody): Promise<TAuthSignInData> => {
    return bffAxios.post<TAuthSignInData>(BffPath.SignIn, body).then(({ data }) => data);
  };

  static signOut = async (): Promise<TAuthSignOutData> => {
    return bffAxios.post<TAuthSignOutData>(BffPath.SignOut).then(({ data }) => data);
  };

  static retrievePassword = async (
    body: AuthRetrievePasswordBody,
  ): Promise<TAuthRetrievePasswordData> => {
    return bffAxios
      .post<TAuthRetrievePasswordData>(BffPath.RetrievePassword, body)
      .then(({ data }) => data);
  };
}

export function useSignInMutation(
  options?: UseMutationOptions<TAuthSignInData, HttpException, AuthSignInBody>,
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

export function useSignOutMutation(options?: UseMutationOptions<TAuthSignOutData, HttpException>) {
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
  options?: UseMutationOptions<TAuthRetrievePasswordData, HttpException, AuthRetrievePasswordBody>,
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
