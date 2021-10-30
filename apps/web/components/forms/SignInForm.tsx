import { Checkbox, Link, LoadingSpinner, Overlay, TextField } from '@/components';
import { useSignInMutation } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { useQueryParams, useValidationResolver } from '@/lib/hooks';
import { SignInDto, UserDto } from '@pcs/shared-data-access';
import { memo, useMemo, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { GoVerified } from 'react-icons/go';
import { HiXCircle } from 'react-icons/hi';

export interface ISignInFormProps {
  onSuccess: (data: UserDto, variables: SignInDto, context: unknown) => void | Promise<unknown>;
  error?: string;
}

export const SignInForm = memo(function SignInForm({ onSuccess, error }: ISignInFormProps) {
  const query = useQueryParams();

  const {
    register,
    handleSubmit,
    control,
    formState: { isDirty },
  } = useForm<SignInDto>({
    defaultValues: {
      username: '',
      password: '',
      rememberMe: false,
    },
    resolver: useValidationResolver(SignInDto),
  });

  const signInMutation = useSignInMutation({ onSuccess });

  const isLoading = signInMutation.isLoading;
  const isSuccess = signInMutation.isSuccess;
  const isDisabled = !isDirty || isLoading || isSuccess;

  const onSubmit = useMemo(
    () =>
      handleSubmit((values: SignInDto) => {
        signInMutation.mutate(values);
      }),
    [handleSubmit, signInMutation],
  );

  const forgotPasswordHref = useRef({ pathname: PagePath.RetrievePassword, query });

  return (
    <>
      <div className="flex flex-col justify-center min-h-screen py-12 bg-gray-50 sm:px-6 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <Link href={PagePath.Landing}>
            <img
              className="w-auto h-12 mx-auto"
              src="https://tailwindui.com/img/logos/workflow-mark-blue-600.svg"
              alt="PCS's Logo"
            />
          </Link>
          <h2 className="mt-6 text-3xl font-extrabold text-center text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="relative px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
            <form onSubmit={onSubmit} className="space-y-6">
              <TextField
                required
                {...register('username')}
                label="Username or email address"
                autoComplete="email"
                control={control}
                autoFocus
              />

              <TextField
                required
                {...register('password')}
                password
                label="Password"
                autoComplete="new-password"
                control={control}
              />

              <div className="flex items-center justify-between">
                <Checkbox label="Remember me" {...register('rememberMe')} control={control} />
                <div className="text-sm">
                  <Link
                    href={forgotPasswordHref.current}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Forgot your password?
                  </Link>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isDisabled}
                  className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm disabled:opacity-50 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Sign in
                </button>
              </div>
            </form>

            {(isLoading || isSuccess) && (
              <Overlay className="sm:rounded-lg">
                {isLoading && <LoadingSpinner className="w-10 h-10" />}
                {isSuccess &&
                  (error ? (
                    <div className="flex flex-col items-center justify-center p-4 mx-8 sm:rounded-md bg-red-50">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <HiXCircle className="w-5 h-5 text-red-400" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-sm font-medium text-red-800">{error}</h3>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <GoVerified className="w-10 h-10 text-blue-700" />
                  ))}
              </Overlay>
            )}
          </div>
        </div>
      </div>
    </>
  );
});
