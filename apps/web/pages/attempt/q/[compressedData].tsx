import { CodeEditor } from '@/components/forms/elements/CodeEditor';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import { useJudgeResultSseQuery, useJudgeSubmitMutation } from '@/lib/api/services/judge.service';
import { PagePath } from '@/lib/constants/shared.constants';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { useValidationResolver } from '@/lib/hooks/use-validation-resolver';
import { TPropsWithDehydratedState } from '@/lib/types';
import { classNames } from '@/lib/utils/style.utils';
import { JudgeSubmission, UserRole, ValidationError } from '@pcs/shared-data-access';
import LZString from 'lz-string';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useMemo } from 'react';
import { Path, useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import ReactMarkdown from 'react-markdown';
import { dehydrate } from 'react-query';

export default function AttemptQuestion() {
  const { compressedData } = useQueryParams<{ compressedData: string }>();
  const parsedData = useMemo<(JudgeSubmission & { description?: unknown }) | undefined>(() => {
    try {
      return JSON.parse(LZString.decompressFromEncodedURIComponent(compressedData ?? '') ?? '');
    } catch {
      return;
    }
  }, [compressedData]);

  const {
    control,
    handleSubmit,
    setError,
    formState: { isDirty, errors },
  } = useForm<JudgeSubmission>({
    defaultValues: parsedData,
    resolver: useValidationResolver(JudgeSubmission),
  });

  const submitMutation = useJudgeSubmitMutation({
    onError: (error) => {
      if (error instanceof ValidationError) {
        return Object.entries(error.errors).forEach(([property, error]) => {
          setError(property as Path<JudgeSubmission>, { message: error?.message });
        });
      }
      toast.error(error.message, { id: 'submitError' });
    },
  });

  const resultSseQuery = useJudgeResultSseQuery(submitMutation.data?.submissionId);

  const isDisabled = !isDirty;
  const isLoading = submitMutation.isLoading || resultSseQuery.isLoading;

  const onSubmit = useMemo(
    () =>
      handleSubmit((values: JudgeSubmission) => {
        submitMutation.mutate(values);
      }),
    [handleSubmit, submitMutation],
  );

  if (typeof window !== 'undefined' && (!parsedData || Object.keys(errors).length > 0)) {
    toast.error('Invalid data, closing window', { id: 'data' });
    setTimeout(() => window.close(), 2000);
    return null;
  }

  return (
    <>
      <Head>
        <title>Test Coding Question</title>
      </Head>

      <div className="flex h-screen">
        <div className="relative z-0 flex flex-1 overflow-hidden">
          <main className="relative z-0 flex-1 order-last overflow-y-auto focus:outline-none">
            {/* Start main area*/}
            <div className="flex pl-4 h-[40rem] sm:pl-6 py-6">
              <CodeEditor
                form="attempt-question-form"
                name="codeSnippet"
                label="Code Snippet"
                canSubmit={!isDisabled}
                control={control}
                defaultValue={parsedData?.codeSnippet ?? ''}
                language={parsedData?.runtime}
              />
            </div>
            {/* End main area */}
          </main>

          <aside className="relative flex-shrink-0 overflow-y-auto border-r border-gray-200 order-first lg:flex lg:flex-col w-[26rem]">
            {/* Start secondary column */}
            <form
              id="attempt-question-form"
              className="flex flex-col h-full bg-white divide-y divide-gray-200 shadow-xl"
              onSubmit={onSubmit}
            >
              <div className="flex-1 h-0 overflow-y-auto">
                <div className="flex flex-col justify-between flex-1">
                  <div className="px-4 divide-y divide-gray-200 sm:px-6">
                    <div className="pt-6 pb-5 space-y-6">
                      {typeof parsedData?.description === 'string' && (
                        <div>
                          <p className="block mb-2 text-sm font-medium text-gray-900">
                            Description
                          </p>
                          <article className="block px-4 py-3 text-sm prose rounded-md prose-neutral bg-gray-50">
                            <ReactMarkdown>{parsedData.description}</ReactMarkdown>
                          </article>
                        </div>
                      )}

                      <div>
                        <p className="block mb-2 text-sm font-medium text-gray-900">Runtime</p>
                        <p className="block px-4 py-3 text-sm whitespace-pre-wrap rounded-md bg-gray-50">
                          {parsedData?.runtime}
                        </p>
                      </div>

                      <hr className="my-5 -mx-2 border-t border-gray-200" aria-hidden="true" />

                      <div>
                        <p className="block text-sm font-medium text-gray-900">Test Cases</p>

                        <div className="mt-2">
                          <div className="flex flex-col space-y-2">
                            {parsedData?.testCases.map((testCase, index) => {
                              const result = resultSseQuery.latest?.[index];

                              return (
                                <div key={index} className="flex-1">
                                  <div
                                    className={classNames(
                                      'flex px-4 py-3 space-x-3 rounded-md',
                                      !result && 'bg-gray-50',
                                      result?.result && 'bg-green-100',
                                      (result?.result === false || result?.error) && 'bg-red-100',
                                    )}
                                  >
                                    <div className="grid flex-1 grid-flow-col gap-2">
                                      <div className="overflow-x-auto">
                                        <div className="text-sm font-medium leading-relaxed text-gray-900">
                                          Input
                                        </div>
                                        <div className="mt-1"></div>
                                        <p className="overflow-x-auto overflow-y-hidden font-mono text-sm leading-none whitespace-pre-wrap">
                                          {testCase.input}
                                        </p>
                                      </div>

                                      <div className="overflow-x-auto">
                                        <div className="text-sm font-medium leading-relaxed text-gray-900">
                                          Expected
                                        </div>
                                        <div className="mt-1"></div>
                                        <p className="overflow-x-auto overflow-y-hidden font-mono text-sm leading-none whitespace-pre-wrap">
                                          {testCase.output}
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
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TPropsWithDehydratedState> = async (ctx) => {
  const queryClient = new DefaultQueryClient();

  const result = await redirectIf(
    [
      { destination: PagePath.SignIn, predicate: redirectionPredicates.isNotAuthenticated },
      {
        destination: PagePath.Dashboard,
        predicate: redirectionPredicates.isNotInRoles([UserRole.Instructor]),
      },
    ],
    ctx,
    queryClient,
  );

  if (result.redirect) {
    return { redirect: result.redirect };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
