import { bffAxios } from '@/lib/api/axios.config';
import { BffPath } from '@/lib/constants';
import { RetrievePasswordDto, SignInDto, UserDto } from '@pcs/shared-data-access';
import { useMutation, UseMutationOptions } from 'react-query';

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
  return useMutation(AuthService.signOut, options);
}

export function useRetrievePasswordMutation(
  options?: UseMutationOptions<TRetrievePasswordData, Error, TRetrievePasswordVariables>,
) {
  return useMutation(AuthService.retrievePassword, options);
}
