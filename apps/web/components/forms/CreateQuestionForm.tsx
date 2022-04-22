import { CodeEditor } from '@/components/forms/elements/CodeEditor';
import { MarkdownEditor } from '@/components/forms/elements/MarkdownEditor';
import { SelectMenu } from '@/components/forms/elements/SelectMenu';
import { TextArea } from '@/components/forms/elements/TextArea';
import { TextField } from '@/components/forms/elements/TextField';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Overlay } from '@/components/Overlay';
import {
  coursesQueryKeys,
  useCreateMaterialQuestionMutation,
} from '@/lib/api/services/courses.service';
import { useJudgeRuntimesQuery } from '@/lib/api/services/judge.service';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { useValidationResolver } from '@/lib/hooks/use-validation-resolver';
import { noop } from '@/lib/utils/functions.utils';
import { Dialog, Transition } from '@headlessui/react';
import {
  capitalize,
  CreateCodingQuestionDto,
  CreateMultipleChoiceQuestionDto,
  CreateQuestionDto,
  CreateShortAnswerQuestionDto,
  McqType,
  QuestionType,
  supportedRuntimes,
  ValidationError,
} from '@pcs/shared-data-access';
import LZString from 'lz-string';
import { Fragment, memo, useCallback, useEffect, useMemo, useRef } from 'react';
import { Path, useFieldArray, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { GoVerified } from 'react-icons/go';
import { HiPlus, HiX } from 'react-icons/hi';
import { useQueryClient } from 'react-query';

export interface ICreateQuestionFormProps {
  type: QuestionType;
  isShown: boolean;
  close: () => void;
}

export const CreateQuestionForm = memo(function CreateQuestionsForm({
  type,
  isShown,
  close,
}: ICreateQuestionFormProps) {
  const queryClient = useQueryClient();

  const { courseId, materialId } = useQueryParams<{ courseId: string; materialId: string }>();

  const { current: defaultValues } = useRef<CreateQuestionDto>({
    description: '',
    // all will be transformed by resolver
    duration: '1' as unknown as number,
    mark: '0' as unknown as number,
    type: QuestionType.ShortAnswer,
    content: {
      answer: '',
      runtime: supportedRuntimes[0]!,
      codeSnippet: '',
      testCases: [{ input: '', output: '' }],
      type: McqType.Checkbox,
      choices: [],
      correctChoices: [],
    },
  });

  const {
    register,
    handleSubmit,
    watch,
    control,
    setError,
    reset,
    formState: { isDirty },
  } = useForm<CreateQuestionDto>({
    defaultValues,
    resolver: useValidationResolver(CreateQuestionDto),
  });

  const createQuestionMutation = useCreateMaterialQuestionMutation({
    onError: (error) => {
      if (error instanceof ValidationError) {
        return Object.entries(error.errors).forEach(([property, error]) => {
          setError(property as Path<CreateQuestionDto>, { message: error?.message });
        });
      }
      toast.error(error.message, { id: `create${type}Error` });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(
        coursesQueryKeys.getCourseMaterialQuestions(courseId, materialId),
      );
      toast.success(`${capitalize(type)} question has been added!`, { duration: 5000 });
      close();
      reset();
      createQuestionMutation.reset();
    },
  });

  const isLoading = createQuestionMutation.isLoading;
  const isSuccess = createQuestionMutation.isSuccess;
  const isDisabled = !isDirty || isLoading || isSuccess;

  useEffect(() => {
    // clear the form when type is changed, needed to set the latest type in the form
    reset({
      ...defaultValues,
      type,
    });
  }, [defaultValues, reset, type]);

  const runtimesQuery = useJudgeRuntimesQuery();

  const runtimeSelectOptions = useMemo(
    () =>
      runtimesQuery.data?.reduce((acc, runtime) => {
        acc[runtime] = runtime;
        return acc;
      }, {} as Record<string, string>),
    [runtimesQuery.data],
  );

  const { fields, append, remove } = useFieldArray({
    name: 'content.testCases',
    keyName: 'formFieldId',
    control,
  });

  const appendTestCase = useCallback(() => {
    append({ input: '', output: '', args: [] });
  }, [append]);

  const onSubmit = useMemo(
    () =>
      handleSubmit((values: CreateQuestionDto) => {
        createQuestionMutation.mutate({ courseId, materialId, body: values });
      }),
    [handleSubmit, createQuestionMutation, courseId, materialId],
  );

  const onCancel = useCallback(() => {
    close();
    reset();
  }, [close, reset]);

  const isQuestionOfType = useCallback(
    <T extends QuestionType, C extends IQuestionTypes[T] = IQuestionTypes[T]>(
      _question:
        | CreateShortAnswerQuestionDto
        | CreateMultipleChoiceQuestionDto
        | CreateCodingQuestionDto,
      t: T,
    ): _question is C => {
      return type === t;
    },
    [type],
  );

  return (
    <Transition.Root show={isShown} as={Fragment}>
      <Dialog as="div" className="fixed inset-0 z-10 overflow-y-auto" onClose={noop}>
        <div className="flex items-end justify-center min-h-screen px-4 pt-4 pb-20 text-center md:block md:p-0">
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
          <span className="hidden md:inline-block md:align-middle md:h-screen" aria-hidden="true">
            &#8203;
          </span>

          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
            enterTo="opacity-100 translate-y-0 md:scale-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100 translate-y-0 md:scale-100"
            leaveTo="opacity-0 translate-y-4 md:translate-y-0 md:scale-95"
          >
            <div className="inline-block w-full px-4 pt-5 pb-4 overflow-y-auto text-left align-bottom transition-all transform bg-white shadow-xl md:w-screen md:h-screen md:align-middle md:p-6">
              <div className="absolute top-0 right-0 hidden pt-4 pr-4 md:block">
                <button
                  type="button"
                  className="text-gray-400 bg-white rounded-md hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  onClick={close}
                >
                  <span className="sr-only">Close</span>
                  <HiX className="w-6 h-6" aria-hidden="true" />
                </button>
              </div>

              <div className="md:flex">
                <div className="flex-1 mt-3 space-y-4 text-center md:space-y-6 md:mt-0 md:mx-4 md:text-left">
                  <Dialog.Title as="h3" className="text-lg font-medium leading-6 text-gray-900">
                    {capitalize(type.replace(/_/g, ' '))} question
                  </Dialog.Title>

                  <div className="relative z-0 flex flex-col flex-1 overflow-hidden text-left md:flex-row">
                    <div className="relative flex flex-col flex-shrink-0 overflow-y-auto md:border-r md:border-gray-200 md:w-72 lg:w-80 xl:w-96">
                      <form
                        id="create-question-form"
                        className="flex flex-col h-full"
                        onSubmit={onSubmit}
                      >
                        <div className="flex-1 h-0 overflow-y-auto">
                          <div className="flex flex-col justify-between flex-1">
                            <div className="md:pr-6">
                              <div className="space-y-6">
                                <MarkdownEditor
                                  required
                                  name="description"
                                  label="Description"
                                  control={control}
                                />

                                {isQuestionOfType(defaultValues.content, QuestionType.Coding) && (
                                  <>
                                    <SelectMenu
                                      label="Runtime"
                                      name="content.runtime"
                                      options={runtimeSelectOptions}
                                      control={control}
                                      defaultValue={defaultValues.content.runtime}
                                    />

                                    <div>
                                      <div className="flex justify-between">
                                        <label
                                          htmlFor=""
                                          className="block text-sm font-medium text-gray-700"
                                        >
                                          Test cases
                                        </label>
                                      </div>

                                      <div>
                                        {fields.map((testCase, i) => (
                                          <div
                                            key={testCase.formFieldId}
                                            className="flex flex-col pt-4"
                                          >
                                            <div className="flex justify-end">
                                              {i > 0 && (
                                                <button
                                                  type="button"
                                                  className="inline-flex items-center self-end p-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-full shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                                  onClick={() => remove(i)}
                                                >
                                                  <span className="sr-only">Remove test case</span>
                                                  <HiX
                                                    className="w-5 h-5 text-gray-400"
                                                    aria-hidden="true"
                                                  />
                                                </button>
                                              )}
                                            </div>

                                            <div className="grid flex-1 grid-flow-col gap-2">
                                              <TextArea
                                                required
                                                {...register(`content.testCases.${i}.input`)}
                                                label="Input"
                                                control={control}
                                                className=""
                                                defaultValue={testCase.input}
                                                spellCheck="false"
                                                textAreaClassName="font-mono leading-none"
                                              />

                                              <TextArea
                                                required
                                                {...register(`content.testCases.${i}.output`)}
                                                label="Output"
                                                control={control}
                                                defaultValue={testCase.output}
                                                spellCheck="false"
                                                textAreaClassName="font-mono leading-none"
                                              />
                                            </div>
                                          </div>
                                        ))}

                                        <div className="flex items-center justify-center pt-4">
                                          <button
                                            type="button"
                                            className="inline-flex items-center p-2 text-white bg-blue-600 border border-transparent rounded-full shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                                            onClick={appendTestCase}
                                          >
                                            <span className="sr-only">Add test case</span>
                                            <HiPlus className="w-5 h-5" aria-hidden="true" />
                                          </button>
                                        </div>
                                      </div>
                                    </div>
                                  </>
                                )}

                                <TextField
                                  type="number"
                                  min={0}
                                  max={332767}
                                  required
                                  {...register('duration')}
                                  label="Total duration in minutes"
                                  control={control}
                                />

                                <TextField
                                  type="number"
                                  step="0.25"
                                  min={0}
                                  max={9999.99}
                                  required
                                  {...register('mark')}
                                  label="Total mark"
                                  control={control}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </form>
                    </div>

                    <div className="relative flex-1 mt-6 overflow-y-auto focus:outline-none md:mt-0">
                      <div className="flex md:pl-6">
                        {isQuestionOfType(defaultValues.content, QuestionType.Coding) && (
                          <CodeEditor
                            form="create-question-form"
                            name="content.codeSnippet"
                            label="Code snippet"
                            canSubmit={!isDisabled}
                            control={control}
                            defaultValue={defaultValues.content.codeSnippet}
                            language={watch('content.runtime')}
                            className="h-[80vh] md:max-h-[none] max-h-[400px] !w-[99.9%]" // weirdly does not get smaller when it is 100%
                          />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-5 md:mt-4 md:flex md:flex-row-reverse">
                <button
                  form="create-question-form"
                  type="submit"
                  className="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 md:ml-3 md:w-auto md:text-sm disabled:opacity-50"
                  disabled={isDisabled}
                >
                  Create
                </button>

                {isQuestionOfType(defaultValues.content, QuestionType.Coding) && (
                  <button
                    type="button"
                    className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm md:mt-0 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 md:ml-3 md:w-auto md:text-sm disabled:opacity-50"
                    onClick={handleSubmit((values) => {
                      isQuestionOfType(values.content, QuestionType.Coding) &&
                        window.open(
                          PagePath.AttemptQuestion.replace(
                            '[compressedData]',
                            LZString.compressToEncodedURIComponent(
                              JSON.stringify({
                                description: values.description,
                                ...values.content,
                              }),
                            ),
                          ),
                        );
                    })}
                    disabled={isDisabled}
                  >
                    Test attempt
                  </button>
                )}

                <button
                  type="button"
                  className="inline-flex justify-center w-full px-4 py-2 mt-3 text-base font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 md:ml-3 md:mt-0 md:w-auto md:text-sm"
                  onClick={onCancel}
                >
                  Cancel
                </button>
              </div>
            </div>
          </Transition.Child>
        </div>

        {(isLoading || isSuccess) && (
          <Overlay className="md:rounded-lg">
            {isLoading && <LoadingSpinner className="w-10 h-10" />}
            {isSuccess && <GoVerified className="w-10 h-10 text-blue-700" />}
          </Overlay>
        )}
      </Dialog>
    </Transition.Root>
  );
});

interface IQuestionTypes {
  [QuestionType.ShortAnswer]: CreateShortAnswerQuestionDto;
  [QuestionType.MultipleChoice]: CreateMultipleChoiceQuestionDto;
  [QuestionType.Coding]: CreateCodingQuestionDto;
}
