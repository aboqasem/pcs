import { BffPath, PagePath } from '@/lib/constants';
import {
  AuthRetrievePasswordBody,
  AuthRetrievePasswordData,
  AuthSignInBody,
  AuthSignInData,
  AuthSignOutData,
  HttpException,
} from '@pcs/shared-data-access';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';
import { bffAxios } from '../axios.config';
import { usersQueryKeys } from './users.service';

export class AuthService {
  static signIn = async (body: AuthSignInBody): Promise<AuthSignInData> => {
    return bffAxios.post<AuthSignInData>(BffPath.SignIn, body).then(({ data }) => data);
  };

  static signOut = async (): Promise<AuthSignOutData> => {
    return bffAxios.post<AuthSignOutData>(BffPath.SignOut).then(({ data }) => data);
  };

  static retrievePassword = async (
    body: AuthRetrievePasswordBody,
  ): Promise<AuthRetrievePasswordData> => {
    return bffAxios
      .post<AuthRetrievePasswordData>(BffPath.RetrievePassword, body)
      .then(({ data }) => data);
  };
}

export function useSignInMutation(
  options?: UseMutationOptions<AuthSignInData, HttpException, AuthSignInBody>,
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

export function useSignOutMutation(options?: UseMutationOptions<AuthSignOutData, HttpException>) {
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
  options?: UseMutationOptions<AuthRetrievePasswordData, HttpException, AuthRetrievePasswordBody>,
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
