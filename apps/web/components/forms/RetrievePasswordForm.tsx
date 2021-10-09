import { Link, LoadingSpinner, Overlay, TextField } from '@/components';
import { useRetrievePasswordMutation } from '@/lib/api';
import { PagePath } from '@/lib/constants';
import { useValidationResolver } from '@/lib/hooks';
import { RetrievePasswordDto, ValidationException } from '@pcs/shared-data-access';
import { useRouter } from 'next/router';
import React, { memo, useCallback, useRef } from 'react';
import { Path, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GoVerified } from 'react-icons/go';

export const RetrievePasswordForm = memo(function RetrievePasswordForm() {
  const router = useRouter();
  const resolver = useValidationResolver(RetrievePasswordDto);
  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { isDirty },
  } = useForm<RetrievePasswordDto>({
    defaultValues: {
      email: '',
    },
    resolver,
  });

  const retrievePassword = useRetrievePasswordMutation({
    onSuccess: () => {
      toast.success('An email containing your credentials has been sent to you!', {
        duration: 5000,
      });
      router.push(PagePath.SignIn, { query: router.query });
    },
    onError: (error) => {
      if (error instanceof ValidationException) {
        return Object.entries(error.errors).forEach(([property, error]) => {
          setError(property as Path<RetrievePasswordDto>, { message: error?.message });
        });
      }
      toast.error(error.message, { id: 'retrievePasswordError' });
    },
  });

  const isLoading = retrievePassword.isLoading;
  const isDisabled = !isDirty || isLoading || retrievePassword.isSuccess;

  const onSubmit = useCallback(
    (values: RetrievePasswordDto) => {
      retrievePassword.mutate(values);
    },
    [retrievePassword],
  );

  const signInHref = useRef({
    pathname: PagePath.SignIn,
    query: router.query,
  });

  return (
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
          Retrieve your password
        </h2>
      </div>
      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="relative px-4 py-8 bg-white shadow sm:rounded-lg sm:px-10">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <TextField
              {...register('email')}
              label="Email address"
              autoComplete="email"
              autoFocus
              control={control}
            />

            <div className="flex items-center justify-end">
              <Link
                href={signInHref.current}
                className="text-sm font-medium text-blue-600 hover:text-blue-500"
              >
                Remembered your password?
              </Link>
            </div>

            <div>
              <button
                type="submit"
                disabled={isDisabled}
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm disabled:opacity-50 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Retrieve password
              </button>
            </div>
          </form>

          {(isLoading || retrievePassword.isSuccess) && (
            <Overlay className="sm:rounded-lg">
              {isLoading && <LoadingSpinner className="w-10 h-10" />}
              {retrievePassword.isSuccess && <GoVerified className="w-10 h-10 text-blue-700" />}
            </Overlay>
          )}
        </div>
      </div>
    </div>
  );
});
