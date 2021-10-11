import { bffAxios } from '@/lib/api/axios.config';
import { BffPath, PagePath } from '@/lib/constants';
import { RetrievePasswordDto, SignInDto, UserDto } from '@pcs/shared-data-access';
import { useRouter } from 'next/router';
import toast from 'react-hot-toast';
import { useMutation, UseMutationOptions, useQueryClient } from 'react-query';

export type TSignInVariables = SignInDto;
export type TSignInData = UserDto;

export type TSignOutData = true;

export type TRetrievePasswordVariables = RetrievePasswordDto;
export type TRetrievePasswordData = true;

export class AuthService {
  static signIn = async (body: TSignInVariables): Promise<TSignInData> => {
    return bffAxios.post(BffPath.SignIn, body);
  };

  static signOut = async (): Promise<TSignOutData> => {
    return bffAxios.post(BffPath.SignOut);
  };

  static retrievePassword = async (
    body: TRetrievePasswordVariables,
  ): Promise<TRetrievePasswordData> => {
    return bffAxios.post(BffPath.RetrievePassword, body);
  };
}

export function useSignInMutation(
  options?: UseMutationOptions<TSignInData, Error, TSignInVariables>,
) {
  return useMutation(AuthService.signIn, options);
}

export function useSignOutMutation(options?: UseMutationOptions<TSignOutData, Error>) {
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
  options?: UseMutationOptions<TRetrievePasswordData, Error, TRetrievePasswordVariables>,
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
