import { AttemptQuestionForm } from '@/components/forms/AttemptQuestionForm';
import { SidebarLayout } from '@/components/layouts/SidebarLayout';
import { Link } from '@/components/Link';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { redirectIf, redirectionPredicates } from '@/lib/api/helpers/redirect-if.helper';
import { DefaultQueryClient } from '@/lib/api/query-client.config';
import {
  useCourseMaterialQuery,
  useCourseMaterialQuestionsQuery,
} from '@/lib/api/services/courses.service';
import { useProfileQuery } from '@/lib/api/services/users.service';
import { courseNavigationItems } from '@/lib/constants/courses.constants';
import { PagePath } from '@/lib/constants/shared.constants';
import { useArray } from '@/lib/hooks/use-array';
import { useQueryParams } from '@/lib/hooks/use-query-params';
import { useValidationResolver } from '@/lib/hooks/use-validation-resolver';
import { TPropsWithDehydratedState } from '@/lib/types';
import { classNames } from '@/lib/utils/style.utils';
import {
  capitalize,
  JudgeSubmission,
  QuestionType,
  TJudgeGetResultData,
  UserRole,
} from '@pcs/shared-data-access';
import { Type } from 'class-transformer';
import { IsArray, ValidateNested } from 'class-validator';
import { GetServerSideProps } from 'next';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { HiChevronLeft, HiOutlineQuestionMarkCircle, HiQuestionMarkCircle } from 'react-icons/hi';
import { dehydrate } from 'react-query';

export class JudgeSubmissions {
  @IsArray()
  @Type(() => JudgeSubmission)
  @ValidateNested({ each: true })
  submissions!: JudgeSubmission[];
}

export default function AttemptCourseMaterial() {
  const { push, replace } = useRouter();

  const { courseId, materialId, qNo } =
    useQueryParams<{ courseId: string; materialId: string; qNo?: string }>();
  const selectedQNo = +(qNo || NaN);
  const selectedQIdx = selectedQNo - 1;

  const { data: profile } = useProfileQuery<UserRole.Student>();

  const courseHref = useMemo(
    () => ({ pathname: PagePath.Course, query: { courseId } }),
    [courseId],
  );

  const materialQuery = useCourseMaterialQuery(courseId, materialId, {
    onError: () => push(courseHref),
  });
  const { data: material } = materialQuery;

  const questionsQuery = useCourseMaterialQuestionsQuery(courseId, materialId, {
    enabled: !!material,
    onSuccess: (questions) => {
      reset({
        submissions: questions.map((q) =>
          q.type === QuestionType.Coding
            ? {
                codeSnippet: q.codeSnippet,
                runtime: q.runtime,
                testCases: q.testCases,
              }
            : {},
        ),
      });

      results.set(new Array(questions.length).fill({}));
    },
  });

  const questions = useMemo(() => questionsQuery.data ?? [], [questionsQuery.data]);
  const areQuestionsLoading = questionsQuery.isIdle || questionsQuery.isLoading;

  const results = useArray<{ codeSnippet?: string; result?: TJudgeGetResultData }>();

  const currentMark = useMemo(() => {
    if (!material || !questions.length) return 0;

    return results.value.reduce((acc, curr, i) => {
      if (curr.result?.every((r) => r?.result === true)) {
        return acc + questions[i]!.mark;
      }

      return acc;
    }, 0);
  }, [material, questions, results]);

  const selectedQuestion = useMemo(() => questions[selectedQIdx], [questions, selectedQIdx]);
  const isQNotFound = !isNaN(selectedQNo) && !selectedQuestion;

  const {
    setError,
    setValue,
    getValues,
    reset,
    formState: { isDirty },
  } = useForm<JudgeSubmissions>({
    defaultValues: {
      submissions: [],
    },
    resolver: useValidationResolver(JudgeSubmissions),
  });

  const attemptMaterialHref = useMemo(
    () => ({ query: { courseId, materialId } }),
    [courseId, materialId],
  );

  const questionsHrefs = useMemo(
    () =>
      questions.map((_, idx) => ({
        query: {
          courseId,
          materialId,
          qNo: idx + 1,
        },
      })),
    [courseId, materialId, questions],
  );

  useEffect(() => {
    if (!qNo && questionsHrefs.length) {
      replace(questionsHrefs[0]!, undefined, { shallow: true });
    }
  }, [replace, qNo, questionsHrefs]);

  if (!profile) {
    return null;
  }

  return (
    <>
      <Head>
        <title>
          {material?.title ?? 'Material'}
          {selectedQuestion ? ` - Q${qNo}` : ''}
        </title>
      </Head>

      <SidebarLayout navigationItems={courseNavigationItems[profile.role]} narrow>
        <div className="relative flex h-full overflow-hidden bg-white">
          <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
            {material && questions.length ? (
              <div className="relative z-0 flex flex-1 overflow-hidden">
                {selectedQuestion || isQNotFound ? (
                  <div className="relative z-0 flex-1 overflow-y-auto focus:outline-none md:order-last">
                    {/* Breadcrumb */}
                    <nav
                      className="flex items-start px-4 py-3 space-x-4 sm:px-6 md:px-8 md:hidden"
                      aria-label="Breadcrumb"
                    >
                      <Link
                        href={courseHref}
                        shallow
                        className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                      >
                        <HiChevronLeft className="w-5 h-5 -ml-2 text-gray-400" aria-hidden="true" />
                        <span>Course</span>
                      </Link>

                      <Link
                        href={attemptMaterialHref}
                        shallow
                        className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                      >
                        <HiChevronLeft className="w-5 h-5 -ml-2 text-gray-400" aria-hidden="true" />
                        <span>Questions</span>
                      </Link>
                    </nav>

                    {selectedQuestion && selectedQuestion.type === QuestionType.Coding ? (
                      <AttemptQuestionForm
                        key={`questions.${selectedQIdx}`}
                        idx={selectedQIdx}
                        material={material}
                        question={selectedQuestion}
                        setValue={setValue}
                        reset={reset}
                        setError={setError}
                        getValues={getValues}
                        results={results}
                      />
                    ) : (
                      <div className="relative flex flex-col items-center justify-center w-full p-12">
                        <div className="text-center">
                          <HiOutlineQuestionMarkCircle
                            className="w-12 h-12 mx-auto text-gray-400"
                            aria-hidden="true"
                          />
                          <h3 className="mt-2 text-sm font-medium text-gray-900">
                            Question not found
                          </h3>
                          <p className="hidden mt-1 text-sm text-gray-500 md:block">
                            Please select a question.
                          </p>

                          <div className="mt-4 md:hidden">
                            <Link
                              href={attemptMaterialHref}
                              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                              Select Question
                            </Link>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="relative flex-col items-center justify-center hidden w-full p-12 m-10 border-2 border-gray-400 border-dashed rounded-lg md:flex">
                    <HiQuestionMarkCircle
                      className="w-12 h-12 mx-auto text-gray-400"
                      aria-hidden="true"
                    />
                    <span className="block mt-2 text-sm font-medium text-gray-900">
                      Select a question
                    </span>
                  </div>
                )}

                <aside
                  className={classNames(
                    'w-full shrink-0 border-r border-gray-200 md:order-first md:flex md:flex-col md:w-72',
                    (selectedQuestion || isQNotFound) && 'hidden',
                  )}
                >
                  <nav
                    className="flex items-start px-4 py-3 space-x-4 sm:px-6"
                    aria-label="Breadcrumb"
                  >
                    <Link
                      href={courseHref}
                      shallow
                      className="inline-flex items-center space-x-3 text-sm font-medium text-gray-900"
                    >
                      <HiChevronLeft className="w-5 h-5 -ml-2 text-gray-400" aria-hidden="true" />
                      <span>Course</span>
                    </Link>
                  </nav>

                  <div className="px-6 pt-2 pb-4">
                    <h2 className="text-lg font-medium text-gray-900">{material.title}</h2>

                    <div className="flex flex-row justify-end">
                      <div className="flex justify-end mt-6 sm:mt-1">
                        <span
                          className={classNames(
                            'inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium',
                            isDirty && '!bg-orange-100 !text-orange-800',
                            currentMark < material.totalMark / 2 && 'bg-red-100 text-red-800',
                            currentMark >= material.totalMark / 2 &&
                              currentMark < material.totalMark &&
                              'bg-blue-100 text-blue-800',
                            currentMark === material.totalMark && 'bg-green-100 text-green-800',
                          )}
                        >
                          {currentMark} / {material.totalMark}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Questions list */}
                  <nav className="flex-1 min-h-0 overflow-y-auto" aria-label="Users">
                    {!!questions.length && (
                      <div className="relative">
                        <ul role="list" className="relative z-0 divide-y divide-gray-200">
                          {questions.map((q, i) => {
                            const isCurrent = q === selectedQuestion;
                            const qNo = i + 1;

                            return (
                              <li key={q.id}>
                                <div
                                  className={classNames(
                                    'relative flex items-center px-6 py-5 space-x-3 focus-within:ring-2 focus-within:ring-inset focus-within:ring-blue-500',
                                    isCurrent ? 'bg-gray-100' : 'hover:bg-gray-50',
                                  )}
                                >
                                  <div className="flex-1 min-w-0">
                                    <Link
                                      href={questionsHrefs[i]!}
                                      shallow
                                      className="focus:outline-none"
                                    >
                                      {/* Extend touch target to entire panel */}
                                      <span className="absolute inset-0" aria-hidden="true" />
                                      <p className="text-sm font-bold text-gray-900">Q{qNo}</p>
                                      <p className="text-sm text-gray-500 truncate">
                                        {capitalize(q.type)} question
                                      </p>
                                    </Link>
                                  </div>
                                </div>
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                  </nav>
                </aside>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center flex-1 text-center">
                {areQuestionsLoading ? (
                  <LoadingSpinner className="w-16 h-16" />
                ) : (
                  <>
                    <HiQuestionMarkCircle
                      className="w-12 h-12 mx-auto text-gray-400"
                      aria-hidden="true"
                    />
                    <h3 className="mt-2 text-sm font-medium text-gray-900">No questions</h3>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </SidebarLayout>
    </>
  );
}

export const getServerSideProps: GetServerSideProps<TPropsWithDehydratedState> = async (ctx) => {
  const queryClient = new DefaultQueryClient();

  const { redirect } = await redirectIf(
    [
      { destination: PagePath.SignIn, predicate: redirectionPredicates.isNotAuthenticated },
      {
        destination: PagePath.Dashboard,
        predicate: redirectionPredicates.isNotInRoles([UserRole.Student]),
      },
    ],
    ctx,
    queryClient,
  );

  if (redirect) {
    return { redirect };
  }

  return {
    props: {
      dehydratedState: dehydrate(queryClient),
    },
  };
};
