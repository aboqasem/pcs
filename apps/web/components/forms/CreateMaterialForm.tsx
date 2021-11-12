import { TextArea } from '@/components/forms/elements/TextArea';
import { TextField } from '@/components/forms/elements/TextField';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Overlay } from '@/components/Overlay';
import {
  coursesQueryKeys,
  useCreateOwnCourseMaterialMutation,
} from '@/lib/api/services/courses.service';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { useValidationResolver } from '@/lib/hooks/use-validation-resolver';
import { Dialog, Transition } from '@headlessui/react';
import {
  capitalize,
  MaterialsCreateOwnMaterialBody,
  MaterialType,
  ValidationException,
} from '@pcs/shared-data-access';
import { Fragment, memo, Ref, useCallback, useEffect, useMemo, useRef } from 'react';
import { Path, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GoVerified } from 'react-icons/go';
import { HiX } from 'react-icons/hi';
import { useQueryClient } from 'react-query';

export interface ICreateMaterialFormProps {
  type: MaterialType;
  isShown: boolean;
  close: () => void;
}

export const CreateMaterialForm = memo(function CreateMaterialsForm({
  type,
  isShown,
  close,
}: ICreateMaterialFormProps) {
  const queryClient = useQueryClient();
  const { courseId } = useQueryParams<{ courseId: string }>();

  const { current: defaultValues } = useRef<MaterialsCreateOwnMaterialBody>({
    title: '',
    description: '',
    // all will be transformed by resolver
    beginsAt: '' as unknown as Date,
    endsAt: '' as unknown as Date,
    totalDuration: '' as unknown as number,
    totalMark: '' as unknown as number,
    type,
  });

  const {
    register,
    handleSubmit,
    control,
    setError,
    reset,
    formState: { isDirty },
  } = useForm<MaterialsCreateOwnMaterialBody>({
    defaultValues,
    resolver: useValidationResolver(MaterialsCreateOwnMaterialBody),
  });

  const titleInputRef = useRef<HTMLInputElement | null>(null);
  const { ref: titleInputRefCallback, ...titleInputRegistration } = register('title');

  const createOwnMaterialMutation = useCreateOwnCourseMaterialMutation({
    onError: (error) => {
      if (error instanceof ValidationException) {
        return Object.entries(error.errors).forEach(([property, error]) => {
          setError(property as Path<MaterialsCreateOwnMaterialBody>, { message: error?.message });
        });
      }
      toast.error(error.message, { id: `create${type}Error` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(coursesQueryKeys.getOwnCourseMaterials(courseId));
      toast.success(`${capitalize(type)} has been created!`, { duration: 5000 });
      close();
      reset();
      createOwnMaterialMutation.reset();
    },
  });

  const isLoading = createOwnMaterialMutation.isLoading;
  const isSuccess = createOwnMaterialMutation.isSuccess;
  const isDisabled = !isDirty || isLoading || isSuccess;

  useEffect(() => {
    // clear the form when type is changed, needed to set the latest type in the form
    reset({
      ...defaultValues,
      type,
    });
  }, [defaultValues, reset, type]);

  const newInputRefCallback: Ref<HTMLInputElement> = useCallback(
    (el) => {
      titleInputRefCallback(el);
      titleInputRef.current = el;
    },
    [titleInputRefCallback],
  );

  const onSubmit = useMemo(
    () =>
      handleSubmit((values: MaterialsCreateOwnMaterialBody) => {
        createOwnMaterialMutation.mutate({ courseId, body: values });
      }),
    [handleSubmit, createOwnMaterialMutation, courseId],
  );

  const onCancel = useCallback(() => {
    close();
    reset();
  }, [close, reset]);

  return (
    <Transition.Root show={isShown} as={Fragment}>
      <Dialog
        as="div"
        className="fixed inset-0 z-10 overflow-y-auto"
        onClose={close}
        initialFocus={titleInputRef}
      >
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Overlay className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" />
          </Transition.Child>

          {/* This element is to trick the browser into centering the modal contents. */}
          <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
          >
            <div className="inline-block w-full px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-white rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:p-6">
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 sm:block">
                <button
                  type="button"
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={close}
                >
                  <span className="sr-only">Close</span>
                  <HiX className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="sm:flex">
                <div className="flex-1 mt-3 space-y-4 text-center sm:space-y-6 sm:mt-0 sm:mx-4 sm:text-left">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    Create {type}
                  </Dialog.Title>

                  <form id="create-material-form" className="space-y-4" onSubmit={onSubmit}>
                    <TextField
                      ref={newInputRefCallback}
                      required
                      {...titleInputRegistration}
                      autoFocus
                      label="Title"
                      control={control}
                    />

                    <TextArea {...register('description')} label="Description" control={control} />

                    <TextField
                      type="datetime-local"
                      required
                      {...register('beginsAt')}
                      label="Begins at"
                      control={control}
                    />

                    {[MaterialType.Tutorial, MaterialType.Assignment].includes(type) && (
                      <TextField
                        type="datetime-local"
                        required
                        {...register('endsAt')}
                        label="Ends at"
                        control={control}
                      />
                    )}

                    {[MaterialType.Tutorial, MaterialType.Quiz].includes(type) && (
                      <TextField
                        type="number"
                        min={0}
                        max={332767}
                        required
                        {...register('totalDuration')}
                        label="Total duration in minutes"
                        control={control}
                      />
                    )}

                    <TextField
                      type="number"
                      step="0.01"
                      min={0}
                      max={9999.99}
                      required
                      {...register('totalMark')}
                      label="Total mark"
                      control={control}
                    />
                  </form>
                </div>
              </div>

              <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                <button
                  form="create-material-form"
                  type="submit"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm disabled:opacity-50"
                  disabled={isDisabled}
                >
                  Create
                </button>

                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:w-auto sm:text-sm"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>

        {(isLoading || isSuccess) && (
          <Overlay className="sm:rounded-lg">
            {isLoading && <LoadingSpinner className="w-10 h-10" />}
            {isSuccess && <GoVerified className="w-10 h-10 text-blue-700" />}
          </Overlay>
        )}
      </Dialog>
    </Transition.Root>
  );
});
