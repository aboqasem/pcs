import { LoadingSpinner, Overlay, SelectMenu, TextField } from '@/components';
import { useCreateUsersMutation, usersQueryKeys } from '@/lib/api';
import { useValidationResolver } from '@/lib/hooks';
import { Dialog, Transition } from '@headlessui/react';
import { capitalize, CreateUsersDto, UserRole, ValidationException } from '@pcs/shared-data-access';
import { Fragment, memo, useCallback, useMemo, useRef } from 'react';
import { Path, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GoVerified } from 'react-icons/go';
import { HiPlus, HiX } from 'react-icons/hi';
import { useQueryClient } from 'react-query';

interface ICreateUsersFormProps {
  isShown: boolean;
  close: () => void;
}

export const CreateUsersForm = memo(function CreateUsersForm({
  isShown,
  close,
}: ICreateUsersFormProps) {
  const queryClient = useQueryClient();
  const emptyUser = useRef({
    email: '',
    username: '',
    fullName: '',
    role: UserRole.Instructor,
    password: '',
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { isDirty },
  } = useForm<CreateUsersDto>({
    defaultValues: { users: [emptyUser.current] },
    resolver: useValidationResolver(CreateUsersDto),
  });

  const { fields, append, remove } = useFieldArray({
    name: 'users',
    keyName: 'formFieldId',
    control,
  });

  const createUsersMutation = useCreateUsersMutation({
    onError: (error) => {
      if (error instanceof ValidationException) {
        return Object.entries(error.errors).forEach(([property, error]) => {
          setError(property as Path<CreateUsersDto>, { message: error?.message });
        });
      }
      toast.error(error.message, { id: 'createUsersError' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(usersQueryKeys.getAllUsers());
      toast.success('Users have been created and they will be informed!', { duration: 5000 });
      close();
      reset();
      createUsersMutation.reset();
    },
  });

  const isLoading = createUsersMutation.isLoading;
  const isSuccess = createUsersMutation.isSuccess;
  const isDisabled = !isDirty || isLoading || isSuccess;

  const appendEmptyUser = useCallback(() => {
    append(emptyUser.current);
  }, [append]);

  const onSubmit = useMemo(
    () =>
      handleSubmit((values: CreateUsersDto) => {
        createUsersMutation.mutate(values);
      }),
    [handleSubmit, createUsersMutation],
  );

  const onCancel = useCallback(() => {
    close();
    reset();
  }, [close, reset]);

  const roleSelectOptions = useRef(
    new Map(
      Object.values(UserRole)
        .filter((role) => role !== UserRole.Admin)
        .map((role) => [role, capitalize(role)] as const),
    ),
  );

  return (
    <Transition.Root show={isShown} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-40 overflow-hidden" onClose={close}>
        <div className="absolute inset-0 overflow-hidden">
          <Transition.Child
            as={Fragment}
            enter="ease-in-out duration-500"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in-out duration-500"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="absolute inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-y-0 right-0 flex max-w-full pl-10 sm:pl-16">
            <Transition.Child
              as={Fragment}
              enter="transform transition ease-in-out duration-500 sm:duration-700"
              enterFrom="translate-x-full"
              enterTo="translate-x-0"
              leave="transform transition ease-in-out duration-500 sm:duration-700"
              leaveFrom="translate-x-0"
              leaveTo="translate-x-full"
            >
              <div className="w-screen max-w-2xl">
                <form
                  className="relative flex flex-col h-full overflow-y-scroll bg-white shadow-xl"
                  onSubmit={onSubmit}
                >
                  <div className="flex-1">
                    {/* Header */}
                    <div className="px-4 py-6 bg-gray-50 sm:px-6">
                      <div className="flex items-start justify-between space-x-3">
                        <div className="space-y-1">
                          <Dialog.Title className="text-lg font-medium text-gray-900">
                            Create users
                          </Dialog.Title>
                        </div>
                        <div className="flex items-center h-7">
                          <button
                            type="button"
                            className="text-gray-400 hover:text-gray-500"
                            onClick={close}
                          >
                            <span className="sr-only">Close panel</span>
                            <HiX className="w-6 h-6" aria-hidden="true" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Users fields */}
                    <div className="px-4 pb-6 space-y-8 divide-y divide-gray-200 sm:px-6">
                      {fields.map((user, i) => (
                        <div key={user.formFieldId} className="flex flex-col py-6">
                          {i > 0 && (
                            <button
                              type="button"
                              className="inline-flex items-center self-end p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                              onClick={() => remove(i)}
                            >
                              <span className="sr-only">Remove user</span>
                              <HiX className="w-5 h-5 text-gray-400" aria-hidden="true" />
                            </button>
                          )}

                          <div className="space-y-6">
                            <TextField
                              required
                              {...register(`users.${i}.email`)}
                              label="Email address"
                              control={control}
                              autoFocus={i === 0}
                              defaultValue={user.email}
                            />

                            <TextField
                              required
                              {...register(`users.${i}.username`)}
                              label="Username"
                              control={control}
                              defaultValue={user.username}
                            />

                            <TextField
                              required
                              {...register(`users.${i}.fullName`)}
                              label="Full name"
                              control={control}
                              defaultValue={user.fullName}
                            />

                            <SelectMenu
                              label="Role"
                              name={`users.${i}.role`}
                              options={roleSelectOptions.current}
                              control={control}
                              defaultValue={user.role}
                            />

                            <TextField
                              {...register(`users.${i}.password`)}
                              label="Password"
                              control={control}
                              password
                              defaultValue={user.password}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-center pb-12">
                      <button
                        type="button"
                        className="inline-flex items-center p-2 text-white bg-blue-600 border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={appendEmptyUser}
                      >
                        <span className="sr-only">Add empty user</span>
                        <HiPlus className="w-5 h-5" aria-hidden="true" />
                      </button>
                    </div>
                  </div>

                  {/* Action buttons */}
                  <div className="flex-shrink-0 px-4 py-5 border-t border-gray-200 sm:px-6">
                    <div className="flex justify-end space-x-3">
                      <button
                        type="button"
                        className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                        onClick={onCancel}
                      >
                        Cancel
                      </button>

                      <button
                        type="submit"
                        disabled={isDisabled}
                        className="inline-flex justify-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                      >
                        Create
                      </button>
                    </div>
                  </div>

                  {(isLoading || isSuccess) && (
                    <Overlay className="sm:rounded-lg">
                      {isLoading && <LoadingSpinner className="w-10 h-10" />}
                      {isSuccess && <GoVerified className="w-10 h-10 text-blue-700" />}
                    </Overlay>
                  )}
                </form>
              </div>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
});
