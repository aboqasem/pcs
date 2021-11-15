import { TextField } from '@/components/forms/elements/TextField';
import { Link } from '@/components/Link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Overlay } from '@/components/Overlay';
import { useRetrievePasswordMutation } from '@/lib/api/services/auth.service';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { useValidationResolver } from '@/lib/hooks/use-validation-resolver';
import { AuthRetrievePasswordBody, ValidationError } from '@pcs/shared-data-access';
import { memo, useMemo, useRef } from 'react';
import { Path, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GoVerified } from 'react-icons/go';

export const RetrievePasswordForm = memo(function RetrievePasswordForm() {
  const query = useQueryParams();

  const {
    register,
    handleSubmit,
    control,
    setError,
    formState: { isDirty },
  } = useForm<AuthRetrievePasswordBody>({
    defaultValues: {
      email: '',
    },
    resolver: useValidationResolver(AuthRetrievePasswordBody),
  });

  const retrievePasswordMutation = useRetrievePasswordMutation({
    onError: (error) => {
      if (error instanceof ValidationError) {
        return Object.entries(error.errors).forEach(([property, error]) => {
          setError(property as Path<AuthRetrievePasswordBody>, { message: error?.message });
        });
      }
      toast.error(error.message, { id: 'retrievePasswordError' });
    },
  });

  const isLoading = retrievePasswordMutation.isLoading;
  const isSuccess = retrievePasswordMutation.isSuccess;
  const isDisabled = !isDirty || isLoading || isSuccess;

  const onSubmit = useMemo(
    () =>
      handleSubmit((values: AuthRetrievePasswordBody) => {
        retrievePasswordMutation.mutate(values);
      }),
    [handleSubmit, retrievePasswordMutation],
  );

  const signInHref = useRef({ pathname: PagePath.SignIn, query });

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
          <form className="space-y-6" onSubmit={onSubmit}>
            <TextField
              required
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

          {(isLoading || isSuccess) && (
            <Overlay className="sm:rounded-lg">
              {isLoading && <LoadingSpinner className="w-10 h-10" />}
              {isSuccess && <GoVerified className="w-10 h-10 text-blue-700" />}
            </Overlay>
          )}
        </div>
      </div>
    </div>
  );
});
