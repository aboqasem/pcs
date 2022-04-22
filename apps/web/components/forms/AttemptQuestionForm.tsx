import { CodeEditor } from '@/components/forms/elements/CodeEditor';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useJudgeResultSseQuery, useJudgeSubmitMutation } from '@/lib/api/services/judge.service';
import { UseArrayReturn } from '@/lib/hooks/use-array';
import { useValidationResolver } from '@/lib/hooks/use-validation-resolver';
import { classNames } from '@/lib/utils/style.utils';
import { JudgeSubmissions } from '@/pages/attempt/[courseId]/[materialId]';
import {
  JudgeSubmission,
  MaterialDto,
  MaterialType,
  QuestionType,
  supportedRuntimes,
  TJudgeGetResultData,
  TMaterialQuestion,
  ValidationError,
} from '@pcs/shared-data-access';
import { memo, useEffect, useRef } from 'react';
import {
  Path,
  useForm,
  UseFormGetValues,
  UseFormReset,
  UseFormSetError,
  UseFormSetValue,
} from 'react-hook-form';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';

export interface IAttemptQuestionFormProps {
  material: MaterialDto;
  question: TMaterialQuestion;
  idx: number;
  setValue: UseFormSetValue<JudgeSubmissions>;
  reset: UseFormReset<JudgeSubmissions>;
  setError: UseFormSetError<JudgeSubmissions>;
  getValues: UseFormGetValues<JudgeSubmissions>;
  results: UseArrayReturn<{ codeSnippet?: string; result?: TJudgeGetResultData }>;
}

export const AttemptQuestionForm = memo(function AttemptQuestionsForm({
  question,
  idx,
  material,
  setValue: parentSetValue,
  reset: parentReset,
  setError: parentSetError,
  getValues: parentGetValues,
  results,
}: IAttemptQuestionFormProps) {
  const { current: defaultValues } = useRef<JudgeSubmission>({
    codeSnippet:
      results.value[idx]?.codeSnippet && results.value[idx]?.result
        ? results.value[idx]!.codeSnippet!
        : question.type === QuestionType.Coding
        ? question.codeSnippet
        : '',
    runtime: question.type === QuestionType.Coding ? question.runtime : supportedRuntimes[0]!,
    testCases:
      question.type === QuestionType.Coding ? question.testCases : [{ input: '', output: '' }],
  });

  const {
    control,
    setValue,
    setError,
    getValues,
    handleSubmit,
    resetField,
    formState: { isDirty },
  } = useForm<JudgeSubmission>({
    defaultValues,
    resolver: useValidationResolver(JudgeSubmission),
  });

  const submitMutation = useJudgeSubmitMutation();
  const resultSseQuery = useJudgeResultSseQuery(submitMutation.data?.submissionId);

  useEffect(() => {
    if (resultSseQuery.latest && resultSseQuery.isDone) {
      results.setAt(idx, {
        codeSnippet: results.value[idx]!.codeSnippet!,
        result: resultSseQuery.latest,
      });

      const currentCodeSnippet = getValues().codeSnippet;

      resetField('codeSnippet', {
        defaultValue: results.value[idx]!.codeSnippet!,
      });
      setValue('codeSnippet', currentCodeSnippet, { shouldDirty: true });

      const submissions = parentGetValues().submissions;
      submissions[idx] = {
        codeSnippet: results.value[idx]!.codeSnippet!,
        runtime: submissions[idx]!.runtime,
        testCases: submissions[idx]!.testCases,
      };
      parentReset({ submissions });
      parentSetValue(`submissions.${idx}.codeSnippet`, currentCodeSnippet, { shouldDirty: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- results.setAt won't change
  }, [resultSseQuery.latest, resultSseQuery.isDone, idx, getValues]);

  const isLoading = submitMutation.isLoading || resultSseQuery.isLoading;
  const isDisabled = !isDirty || isLoading;

  useEffect(() => {
    const parentCodeSnippet = parentGetValues().submissions[idx]?.codeSnippet;
    if (parentCodeSnippet) {
      setValue('codeSnippet', parentCodeSnippet, {
        shouldDirty: parentCodeSnippet !== defaultValues.codeSnippet,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only sync codeSnippet once
  }, []);

  return (
    <>
      {question.type === QuestionType.Coding && (
        <div className="flex h-screen">
          <div className="relative z-0 flex flex-1 overflow-hidden">
            <main className="relative z-0 flex-1 order-last overflow-y-auto focus:outline-none">
              {/* Start main area*/}
              <div className="flex pl-4 h-[40rem] sm:pl-6 py-6">
                <CodeEditor
                  form={`attempt-material-question-${idx}-form`}
                  name="codeSnippet"
                  label="Code Snippet"
                  canSubmit={!isDisabled}
                  control={control}
                  defaultValue={question.codeSnippet ?? ''}
                  language={question.runtime}
                  onChange={(value) =>
                    parentSetValue(`submissions.${idx}.codeSnippet`, value ?? '', {
                      shouldDirty: true,
                    })
                  }
                />
              </div>
              {/* End main area */}
            </main>

            <aside className="relative flex-shrink-0 overflow-y-auto border-r border-gray-200 order-first lg:flex lg:flex-col w-[26rem]">
              {/* Start secondary column */}
              <form
                id={`attempt-material-question-${idx}-form`}
                className="flex flex-col h-full bg-white divide-y divide-gray-200 shadow-xl"
                onSubmit={handleSubmit((values) => {
                  submitMutation.mutate(values, {
                    onError: (error) => {
                      if (error instanceof ValidationError) {
                        return Object.entries(error.errors).forEach(([property, error]) => {
                          setError(property as Path<JudgeSubmission>, {
                            message: error?.message,
                          });
                          parentSetError(
                            `submissions.${idx}.${property}` as Path<JudgeSubmissions>,
                            {
                              message: error?.message,
                            },
                          );
                        });
                      }

                      toast.error(error.message, {
                        id: `submit${idx}Error`,
                      });
                    },
                    onSuccess: () => {
                      const latest = getValues().codeSnippet;

                      results.setAt(idx, {
                        codeSnippet: values.codeSnippet,
                      });

                      if (latest !== values.codeSnippet) {
                        setValue('codeSnippet', latest);
                      }
                    },
                  });
                })}
              >
                <div className="flex-1 h-0 overflow-y-auto">
                  <div className="flex flex-col justify-between flex-1">
                    <div className="px-4 divide-y divide-gray-200 sm:px-6">
                      <div className="pt-6 pb-5 space-y-6">
                        <div>
                          <p className="block mb-2 text-sm font-medium text-gray-900">
                            Description
                          </p>
                          <article className="block px-4 py-3 text-sm prose rounded-md prose-neutral bg-gray-50">
                            <ReactMarkdown>{question.description}</ReactMarkdown>
                          </article>
                        </div>
                        <div>
                          <p className="block mb-2 text-sm font-medium text-gray-900">Runtime</p>
                          <p className="block px-4 py-3 text-sm whitespace-pre-wrap rounded-md bg-gray-50">
                            {question.runtime}
                          </p>
                        </div>
                        <hr className="my-5 -mx-2 border-t border-gray-200" aria-hidden="true" />
                        <div>
                          <p className="block text-sm font-medium text-gray-900">Test Cases</p>
                          <div className="mt-2">
                            <div className="flex flex-col space-y-2">
                              {question.testCases.map((testCase, index) => {
                                const result =
                                  resultSseQuery.latest?.[index] ??
                                  results.value[idx]?.result?.[index];

                                return (
                                  <div key={index} className="flex-1">
                                    <div
                                      className={classNames(
                                        'flex px-4 py-3 space-x-3 rounded-md',
                                        !result && 'bg-gray-50',
                                        (!isDirty || isLoading) && result?.result && 'bg-green-100',
                                        isDirty && !isLoading && result?.result && 'bg-orange-100',
                                        (!isDirty || isLoading) &&
                                          (result?.result === false || result?.error) &&
                                          'bg-red-100',
                                        isDirty &&
                                          !isLoading &&
                                          (result?.result === false || result?.error) &&
                                          'bg-orange-100',
                                      )}
                                    >
                                      <div className="grid flex-1 grid-flow-col gap-2">
                                        <div className="overflow-x-auto">
                                          <div className="text-sm font-medium leading-relaxed text-gray-900">
                                            Input
                                          </div>
                                          <div className="mt-1"></div>
                                          <p
                                            className={classNames(
                                              'overflow-x-auto overflow-y-hidden font-mono text-sm leading-none whitespace-pre-wrap',
                                              material.type === MaterialType.Quiz &&
                                                'blur-md select-none mt-4',
                                            )}
                                          >
                                            {material.type === MaterialType.Quiz
                                              ? 'Blurred Text'
                                              : testCase.input}
                                          </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                          <div className="text-sm font-medium leading-relaxed text-gray-900">
                                            Expected
                                          </div>
                                          <div className="mt-1"></div>
                                          <p
                                            className={classNames(
                                              'overflow-x-auto overflow-y-hidden font-mono text-sm leading-none whitespace-pre-wrap',
                                              material.type === MaterialType.Quiz &&
                                                'blur-md select-none mt-4',
                                            )}
                                          >
                                            {material.type === MaterialType.Quiz
                                              ? 'Blurred Text'
                                              : testCase.output}
                                          </p>
                                        </div>
                                        <div className="overflow-x-auto">
                                          <div className="text-sm font-medium leading-relaxed text-gray-900">
                                            Actual
                                          </div>
                                          <div className="mt-1"></div>
                                          <p className="overflow-x-auto overflow-y-hidden font-mono text-sm leading-none whitespace-pre-wrap">
                                            {result?.output ??
                                              result?.error ??
                                              (isLoading ? (
                                                <LoadingSpinner className="text-sm" />
                                              ) : (
                                                '-'
                                              ))}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between flex-shrink-0 px-4 py-4">
                  <div>
                    {resultSseQuery.error && (
                      <p className="text-sm text-red-600">{resultSseQuery.error.message}</p>
                    )}
                  </div>
                  <button
                    type="submit"
                    disabled={isDisabled}
                    className="inline-flex justify-center px-4 py-2 ml-4 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
                  >
                    Run
                  </button>
                </div>
              </form>
              {/* End secondary column */}
            </aside>
          </div>
        </div>
      )}
    </>
  );
});
